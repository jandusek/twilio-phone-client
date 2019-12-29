import React, { Component } from 'react';
import styled from 'styled-components';
import update from 'immutability-helper';

import ChannelSwitcher from './ChannelSwitcher';
import ChannelContent from './ChannelContent';

import axios from 'axios';
const Chat = require('twilio-chat');
const Voice = require('twilio-client').Device;

const accessTokenGenerator = '/getAccessToken';
const capTokenGenerator = '/getCapToken';

export default class Canvas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedChannel: "sms",
      clientNumber: "+15185351029",
      chatClient: null,
      chatChannelList: null,
      voiceClient: null
    }
    this.setChannel = this.setChannel.bind(this);
    this.fetchChat = this.fetchChat.bind(this);
    this.fetchVoice = this.fetchVoice.bind(this);
    this.fetchClients = this.fetchClients.bind(this);
  }

  fetchVoice() {
    axios.get(capTokenGenerator, {
    }).then(result => {
      if (result.status === 200) {
        let capability = result.data.toString();
        let voiceClient = Voice.setup(capability, {
          // Set Opus as our preferred codec. Opus generally performs better, requiring less bandwidth and
          // providing better audio quality in restrained network conditions. Opus will be default in 2.0.
          codecPreferences: ['opus', 'pcmu'],
          // Use fake DTMF tones client-side. Real tones are still sent to the other end of the call,
          // but the client-side DTMF tones are fake. This prevents the local mic capturing the DTMF tone
          // a second time and sending the tone twice. This will be default in 2.0.
          fakeLocalDTMF: true,
          // Use `enableRingingState` to enable the device to emit the `ringing`
          // state. The TwiML backend also needs to have the attribute
          // `answerOnBridge` also set to true in the `Dial` verb. This option
          // changes the behavior of the SDK to consider a call `ringing` starting
          // from the connection to the TwiML backend to when the recipient of
          // the `Dial` verb answers.
          enableRingingState: true,
        });
        voiceClient.on('ready', (device) => {
        });
        voiceClient.on('error', (error) => {
          console.log('Twilio.Device Error: ' + error.message);
        });
        this.setState({ voiceClient });
      }
    }).catch(e => {
      console.error(e);
    });
  }

  fetchChat() {
    axios.get(accessTokenGenerator, {
    }).then(result => {
      if (result.status === 200) {
        let token = result.data.toString();
        Chat.Client.create(token).then(chatClient => {
          this.setState({ chatClient });
          chatClient.getSubscribedChannels().then((paginator) => {
            let chatChannelList = {};
            for (let i = 0; i < paginator.items.length; i++) {
              const channel = paginator.items[i];
              chatChannelList[channel.uniqueName] = channel;
            }
            this.setState({ chatChannelList });
          });
          chatClient.on('channelAdded', channel => {
            if (this.state.chatChannelList !== null) {
              this.setState({
                chatChannelList: update(this.state.chatChannelList, { $merge: { [channel.uniqueName]: channel } })
              });
            }
          });
          chatClient.on('channelUpdated', ({ channel, updateReasons }) => {
            if (this.state.chatChannelList !== null && updateReasons.includes('lastMessage')) {
              this.setState({
                chatChannelList: update(this.state.chatChannelList, { [channel.uniqueName]: { $set: channel } })
              });
            }
          });
        });
      }
    }).catch(e => {
      console.error(e);
    });
  }

  setChannel(selectedChannel) {
    this.setState({ selectedChannel });
  }

  fetchClients() {
    if (this.state.selectedChannel === "sms" && this.state.chatClient === null) this.fetchChat();
    else if (this.state.selectedChannel === "call" && this.state.voiceClient === null) this.fetchVoice();
  }

  componentDidMount() {
    this.fetchClients();
  }

  componentDidUpdate() {
    this.fetchClients();
  }

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
    return <ViewPort>
      <ChannelSwitcher setChannel={this.setChannel} selectedChannel={this.state.selectedChannel} />
      <ChannelContent
        selectedChannel={this.state.selectedChannel}
        client={this.state.selectedChannel === "sms" ? this.state.chatClient : this.state.voiceClient}
        clientNumber={this.state.clientNumber}
        channelList={this.state.selectedChannel === "sms" ? this.state.chatChannelList : null}
      />
    </ViewPort>;
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