import React, { Component } from 'react';
import styled from 'styled-components';
import update from 'immutability-helper';
import jwt_decode from 'jwt-decode';
import { formParams, stringify } from '../lib/common';

import ChannelSwitcher from './ChannelSwitcher';
import ChannelContent from './ChannelContent';
import AuthForm from './AuthForm';
import { ModalMessage } from './CommonComponents';

const TwilioChat = require('twilio-chat');
const TwilioVoice = require('twilio-client');

const maxAuthAttempts = 3;

export default class Canvas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedChannel: 'sms',
      chatClient: null,
      chatChannelList: null,
      voiceClient: null,
      incomingCall: null,
      token: null,
      authorized: false,
      authCounter: 0,
      authError: '',
      secret: localStorage.getItem('secret'),
      displayError: null,
      msgUnreadsCache: {},
      msgCache: {},
      msgPgtrCache: {},
      callDisplay: '' // phone number after formatting
    };

    this.callConnection = null;
    this.callStartTime = null;
    this.callNextKeyReset = false;
    // is user typing a phone number (i.e. no call in progress) or
    // are they using DTMF during a call?
    this.callTypingPN = true;
  }

  /**
   * Fetch token from the <tt>getAccessToken</tt> function.
   * @returns {string}
   */
  _fetchToken = () => {
    return new Promise((resolve, reject) => {
      const accessTokenGenerator =
        (process.env.REACT_APP_RUNTIME_DOMAIN
          ? process.env.REACT_APP_RUNTIME_DOMAIN
          : '') + '/getAccessToken';

      const body = formParams({
        secret: this.state.secret // handle escaping
      });
      fetch(accessTokenGenerator, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body
      })
        .then(async (response) => {
          if (response.status === 200) {
            return response.text();
          } else if (response.status === 401) {
            const errText = await response.text();
            this.setState({
              authorized: false,
              authError: this.state.authCounter === 0 ? '' : errText,
              authCounter: this.state.authCounter + 1
            });
            console.error(
              'Authorization failed - check if SECRET env variable is set correctly:',
              errText
            );
            reject(errText);
          }
        })
        .then((token) => {
          if (token !== undefined) {
            this.setState({
              authorized: true,
              authError: '',
              authCounter: 0
            });
            resolve(token);
          }
        })
        .catch((err) => {
          console.error('Error fetching Access Token:', err);
          this.setState({
            displayError: `Error fetching Access Token (${stringify(err)})`
          });
          reject(err);
        });
    });
  };

  /**
   * Setters & getters for properties that don't have to be part of the state,
   * but need to be accessed by child components and need their values to
   * survive unmounting of the consuming component
   */

  setSecret = (secret) => {
    this.setState({ secret }, () => this.initClients());
  };
  setCallDisplay = (callDisplay) => {
    this.setState({ callDisplay });
  };
  setCallConnection = (callConnection) => {
    this.callConnection = callConnection;
  };
  getCallConnection = () => {
    return this.callConnection;
  };
  setCallStartTime = (callStartTime) => {
    this.callStartTime = callStartTime;
  };
  getCallStartTime = () => {
    return this.callStartTime;
  };
  setCallNextKeyReset = (callNextKeyReset) => {
    this.callNextKeyReset = callNextKeyReset;
  };
  getCallNextKeyReset = () => {
    return this.callNextKeyReset;
  };
  setCallTypingPN = (callTypingPN) => {
    this.callTypingPN = callTypingPN;
  };
  getCallTypingPN = () => {
    return this.callTypingPN;
  };

  /**
   * msgUnreadsCache setter
   * @param {*} contact - the contact for which the cache should be updated
   * @param {*} unread - new value
   */
  setUnreadsCache = (contact, unread) => {
    this.setState({
      msgUnreadsCache: update(this.state.msgUnreadsCache, {
        [contact]: { $set: unread }
      })
    });
  };

  setUnreadMsgs = (channel, contact) => {
    // if there's no consumed messages, all messages are unread
    // (getUnconsumedMessagesCount doesn't really work in this case
    // so we need to handle this edge case manually)
    if (channel.lastConsumedMessageIndex === null) {
      channel.getMessagesCount().then((cnt) => {
        this.setState({
          msgUnreadsCache: update(this.state.msgUnreadsCache, {
            [contact]: { $set: cnt }
          })
        });
      });
    } else {
      channel.getUnconsumedMessagesCount().then((cnt) => {
        this.setState({
          msgUnreadsCache: update(this.state.msgUnreadsCache, {
            [contact]: { $set: cnt }
          })
        });
      });
    }
  };

  /**
   * Initialize message cache for given contact
   * @param {*} contact
   * @param {*} messages
   * @param {*} paginator
   */
  setMsgCachePage = (contact, messages, paginator) => {
    this.setState({
      msgCache: update(this.state.msgCache, {
        [contact]: { $set: messages }
      }),
      pgtrCache: update(this.state.msgPgtrCache, {
        [contact]: { $set: paginator }
      })
    });
  };

  /**
   * Add new page worth of messages using paginator
   * @param {*} contact
   * @param {*} messages
   * @param {*} paginator
   */
  addMsgCachePage = (contact, messages, paginator) => {
    this.setState({
      msgCache: update(this.state.msgCache, {
        [contact]: { $unshift: messages }
      }),
      pgtrCache: update(this.state.msgPgtrCache, {
        [contact]: { $set: paginator }
      })
    });
  };

  /**
   * Add one new message to the cache
   * @param {*} contact
   * @param {*} msg
   */
  addMsgCacheMsg = (contact, msg) => {
    if (this.state.msgCache[contact] === undefined) {
      this.setState({
        msgCache: update(this.state.msgCache, {
          $merge: { [contact]: [] }
        })
      });
    }
    this.setState({
      msgCache: update(this.state.msgCache, { [contact]: { $push: [msg] } })
    });
  };

  /**
   * Wrapper around _fetchToken that stores the token in component's state
   * @returns {string}
   */
  getToken = () => {
    return new Promise((resolve, reject) => {
      if (this.state.token) {
        const decoded_token = jwt_decode(this.state.token);
        const s_now = Math.floor(Date.now() / 1000);
        const s_expire = decoded_token.exp;
        console.log(`Token is expiring in ${s_expire - s_now}s`);
        if (s_expire - s_now < 300) {
          // token is about to expire, let's renew it
          this._fetchToken().then((token) => {
            this.setState({ token });
            this.getTokenActive = false;
            resolve(token);
          });
        } else {
          this.getTokenActive = false;
          resolve(this.state.token);
        }
      } else {
        this._fetchToken().then((token) => {
          this.setState({ token });
          this.getTokenActive = false;
          resolve(token);
        });
      }
    });
  };

  /**
   * Initialize the Voice and Chat clients
   * @returns {string}
   */
  initClients = () => {
    if (this.state.chatClient === null && this.state.voiceClient === null) {
      this.getToken().then((token) => {
        // initialize Voice client
        const voiceClient = new TwilioVoice.Device();
        voiceClient.setup(token, {
          // Set Opus as our preferred codec. Opus generally performs better,
          // requiring less bandwidth and providing better audio quality in
          // restrained network conditions. Opus will be default in 2.0.
          codecPreferences: ['opus', 'pcmu'],
          // Use fake DTMF tones client-side. Real tones are still sent to the
          // other end of the call, but the client-side DTMF tones are fake.
          // This prevents the local mic capturing the DTMF tone a second time
          // and sending the tone twice. This will be default in 2.0.
          fakeLocalDTMF: true,
          // Use `enableRingingState` to enable the device to emit the `ringing`
          // state. The TwiML backend also needs to have the attribute
          // `answerOnBridge` also set to true in the `Dial` verb. This option
          // changes the behavior of the SDK to consider a call `ringing`
          // starting from the connection to the TwiML backend to when the
          // recipient of the `Dial` verb answers.
          enableRingingState: true
        });
        voiceClient.on('ready', (device) => {
          console.log('voiceClient is ready');
        });
        voiceClient.on('error', (error) => {
          console.log('Twilio.Device Error: ', error);
          // JWT Token Expired
          if (error.code === 31205) {
            this.getToken().then(() => {
              this.state.chatClient.updateToken(this.state.token);
              this.state.voiceClient.updateToken(this.state.token);
              console.log('Token updated after expiration (from voiceClient)');
            });
          }
        });
        voiceClient.on('incoming', (connection) => {
          console.log(
            'PC: INCOMING event fired from ' + connection.parameters.From
          );
          this.setState({ incomingCall: connection });
          connection.on('reject', (connection) => {
            // when incoming call gets rejected from CallCanvas, update state
            this.setState({
              incomingCall: null
            });
          });
        });
        voiceClient.on('cancel', (connection) => {
          console.log('PC: CANCEL event fired');
          this.setState({
            incomingCall: null
          });
        });

        voiceClient.on('connect', (connection) => {
          console.log('PC: CONNECT event fired');
          this.setState({ incomingCall: null }); // cleanup the incoming call state and let the component handle this natively
        });

        voiceClient.on('disconnect', (connection) => {
          console.log('PC: DISCONNECT event fired');
          this.setCallDisplay('');
          this.setCallStartTime(null);
          this.setCallTypingPN(true);
          this.setCallNextKeyReset(false);
        });

        console.log('voiceClient is initialized');
        this.setState({ voiceClient });

        // initialize Chat client
        TwilioChat.Client.create(token).then((chatClient) => {
          this.setState({ chatClient });
          chatClient.getSubscribedChannels().then((paginator) => {
            let chatChannelList = {};
            for (let i = 0; i < paginator.items.length; i++) {
              const channel = paginator.items[i];
              chatChannelList[channel.uniqueName] = channel;
            }
            console.log('chatClient is initialized');

            this.setState({ chatChannelList });
          });
          chatClient.on('channelRemoved', (channel) => {
            if (this.state.chatChannelList !== null) {
              this.setState({
                chatChannelList: update(this.state.chatChannelList, {
                  $unset: [channel.uniqueName]
                }),
                msgUnreadsCache: update(this.state.msgUnreadsCache, {
                  $unset: [channel.uniqueName]
                }),
                msgCache: update(this.state.msgCache, {
                  $unset: [channel.uniqueName]
                }),
                msgPgtrCache: update(this.state.msgPgtrCache, {
                  $unset: [channel.uniqueName]
                })
              });
            }
          });
          chatClient.on('channelAdded', (channel) => {
            if (this.state.chatChannelList !== null) {
              this.setState({
                chatChannelList: update(this.state.chatChannelList, {
                  $merge: { [channel.uniqueName]: channel }
                }),
                msgCache: update(this.state.msgCache, {
                  [channel.uniqueName]: { $set: undefined }
                })
              });
            }
          });
          chatClient.on('channelUpdated', ({ channel, updateReasons }) => {
            if (
              this.state.chatChannelList !== null &&
              updateReasons.includes('lastMessage')
            ) {
              this.setState({
                chatChannelList: update(this.state.chatChannelList, {
                  [channel.uniqueName]: { $set: channel }
                })
              });
            }
          });
          chatClient.on('tokenAboutToExpire', () => {
            this.getToken().then(() => {
              this.state.chatClient.updateToken(this.state.token);
              this.state.voiceClient.updateToken(this.state.token);
              console.log('Token updated before expiration');
            });
          });
          chatClient.on('tokenExpired', () => {
            this.getToken().then(() => {
              this.state.chatClient.updateToken(this.state.token);
              this.state.voiceClient.updateToken(this.state.token);
              console.log('Token updated after expiration (from chatClient)');
            });
          });
        });
      });
    }
  };

  setChannel = (selectedChannel) => {
    this.setState({ selectedChannel });
  };

  componentDidMount() {
    this.initClients();
  }

  componentDidUpdate() {}

  componentWillUnmount() {
    if (this.state.chatClient) {
      this.state.chatClient.removeAllListeners('channelAdded');
      this.state.chatClient.removeAllListeners('channelUpdated');
    }
    if (this.state.voiceClient) {
      this.state.voiceClient.removeAllListeners('ready');
      this.state.voiceClient.removeAllListeners('error');
    }
  }

  render() {
    if (this.state.displayError) {
      return (
        <ViewPort>
          <ModalMessage
            msg={'Error occurred: ' + this.state.displayError}
            img="alert"
          />
        </ViewPort>
      );
    } else if (
      // if the initial login attempt hasn't bee made yet, don't show anything
      // (to avoid UI redraws with login form flashing brieafly before client load)
      this.state.authorized === false &&
      this.state.authCounter === 0
    ) {
      return <ViewPort></ViewPort>;
    } else if (
      // if the initial login attempt failed, show a login form
      this.state.authorized === false &&
      this.state.authCounter <= maxAuthAttempts
    ) {
      return (
        <ViewPort>
          <AuthForm setSecret={this.setSecret} errMsg={this.state.authError} />
        </ViewPort>
      );
    } else if (
      // if the max number of attempts was exceeded, show error to discourage
      // repeated logins
      this.state.authorized === false &&
      this.state.authCounter > maxAuthAttempts
    ) {
      return (
        <ViewPort>
          <ModalMessage msg="Authorization failed" img="auth_fail" />
        </ViewPort>
      );
    } else {
      return (
        <React.StrictMode>
          <ViewPort>
            <ChannelSwitcher
              setChannel={this.setChannel}
              selectedChannel={this.state.selectedChannel}
              incomingCall={this.state.incomingCall}
              msgUnreadsCache={this.state.msgUnreadsCache}
            />
            <ChannelContent
              msgUnreadsCache={this.state.msgUnreadsCache}
              setUnreadsCache={this.setUnreadsCache}
              setUnreadMsgs={this.setUnreadMsgs}
              msgCache={this.state.msgCache}
              msgPgtrCache={this.state.msgPgtrCache}
              addMsgCachePage={this.addMsgCachePage}
              setMsgCachePage={this.setMsgCachePage}
              addMsgCacheMsg={this.addMsgCacheMsg}
              setCallDisplay={this.setCallDisplay}
              callDisplay={this.state.callDisplay}
              setCallConnection={this.setCallConnection}
              getCallConnection={this.getCallConnection}
              setCallStartTime={this.setCallStartTime}
              getCallStartTime={this.getCallStartTime}
              setCallNextKeyReset={this.setCallNextKeyReset}
              getCallNextKeyReset={this.getCallNextKeyReset}
              setCallTypingPN={this.setCallTypingPN}
              getCallTypingPN={this.getCallTypingPN}
              selectedChannel={this.state.selectedChannel}
              secret={this.state.secret}
              client={
                this.state.selectedChannel === 'sms'
                  ? this.state.chatClient
                  : this.state.voiceClient
              }
              channelList={
                this.state.selectedChannel === 'sms'
                  ? this.state.chatChannelList
                  : null
              }
              incomingCall={this.state.incomingCall}
            />
          </ViewPort>
        </React.StrictMode>
      );
    }
  }
}

const ViewPort = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  max-width: 400px;
`;
