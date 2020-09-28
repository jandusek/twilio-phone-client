import React, { Component } from 'react';
import styled from 'styled-components';
import update from 'immutability-helper';
import jwt_decode from 'jwt-decode';

import ChannelSwitcher from './ChannelSwitcher';
import ChannelContent from './ChannelContent';

import axios from 'axios';
const TwilioChat = require('twilio-chat');
const TwilioVoice = require('twilio-client');

export default class Canvas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedChannel: 'sms',
      chatClient: null,
      chatChannelList: null,
      voiceClient: null,
      token: null
    };
    this.setChannel = this.setChannel.bind(this);
    this.initClients = this.initClients.bind(this);
    this.getToken = this.getToken.bind(this);
  }

  /**
   * Fetch token from the <tt>getAccessToken</tt> function.
   * @returns {string}
   */
  _fetchToken() {
    return new Promise((resolve, reject) => {
      const accessTokenGenerator =
        (process.env.REACT_APP_RUNTIME_DOMAIN
          ? process.env.REACT_APP_RUNTIME_DOMAIN
          : '') + '/getAccessToken';
      axios
        .get(accessTokenGenerator, {})
        .then((result) => {
          if (result.status === 200) {
            const token = result.data.toString();
            resolve(token);
          }
        })
        .catch((err) => {
          console.error('Error fetching Access Token:', err);
          reject(err);
        });
    });
  }

  /**
   * Wrapper around _fetchToken that stores the token in component's state
   * @returns {string}
   */
  getToken() {
    return new Promise((resolve, reject) => {
      if (this.state.token) {
        const decoded_token = jwt_decode(this.state.token);
        const s_now = Math.floor(Date.now() / 1000);
        const s_expire = decoded_token.exp;
        console.log(`Token is expiring in ${s_expire - s_now}s`);
        // ToDo: check if token is expired
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
  }

  /**
   * Initialize the Voice and Chat clients
   * @returns {string}
   */
  initClients() {
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
        voiceClient.on('ready', (device) => {});
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

        console.log('Voice init done');
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
            console.log('Chat init done');

            this.setState({ chatChannelList });
          });
          chatClient.on('channelAdded', (channel) => {
            if (this.state.chatChannelList !== null) {
              this.setState({
                chatChannelList: update(this.state.chatChannelList, {
                  $merge: { [channel.uniqueName]: channel }
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
  }

  setChannel(selectedChannel) {
    this.setState({ selectedChannel });
  }

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
    return (
      <ViewPort>
        <ChannelSwitcher
          setChannel={this.setChannel}
          selectedChannel={this.state.selectedChannel}
        />
        <ChannelContent
          selectedChannel={this.state.selectedChannel}
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
        />
      </ViewPort>
    );
  }
}

const ViewPort = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  max-width: 440px;
`;
