import React, { Component } from 'react';
import update from 'immutability-helper';
import styled from 'styled-components';

import MsgContactList from './MsgContactList';
import MsgContactAdd from './MsgContactAdd';
import MsgList from './MsgList';
import MsgComposer from './MsgComposer';
import Spinner from './Spinner';
import MsgContactHeader from './MsgContactHeader';

const msgsPerPage = 30;

export default class CanvasMsg extends Component {
  constructor(props) {
    super(props);
    this.msgAddedHandlerTracker = {};
    this.fetchTracker = {};
    this.state = {
      selectedContact: null,
      pgtrCache: {},
      msgCache: {},
      newPhoneNumber: ''
    };
    this.selectContact = this.selectContact.bind(this);
    this.fetchMsgsForContact = this.fetchMsgsForContact.bind(this);
    this.fetchAnotherPage = this.fetchAnotherPage.bind(this);
    this.updateNewPhoneNumber = this.updateNewPhoneNumber.bind(this);
  }

  selectContact(selectedContact) {
    this.setState({ selectedContact });
    if (selectedContact !== null) {
      this.fetchMsgsForContact(selectedContact); // async fetch data for selected contact
    }
  }

  fetchAnotherPage() {
    return new Promise((resolve, reject) => {
      const contact = this.state.selectedContact;
      if (contact === 'new') {
        return;
      }
      const paginator = this.state.pgtrCache[contact];
      if (!paginator.hasPrevPage) {
        reject('No more messages.');
      } else {
        paginator.prevPage().then((paginator) => {
          let messages = [];
          paginator.items.forEach((msg) => {
            messages.push(msg);
          });
          this.setState({
            msgCache: update(this.state.msgCache, {
              [contact]: { $unshift: messages }
            }),
            pgtrCache: update(this.state.pgtrCache, {
              [contact]: { $set: paginator }
            })
          });
          resolve();
        });
      }
    });
  }

  componentDidMount() {
    if (this.props.channelList) {
      Object.keys(this.props.channelList).forEach((contact) => {
        this.fetchMsgsForContact(contact);
      });
    }
  }

  componentDidUpdate() {
    if (this.props.channelList) {
      Object.keys(this.props.channelList).forEach((contact) => {
        this.fetchMsgsForContact(contact);
      });
    }
  }

  componentWillUnmount() {
    // remove all 'messageAdded' event listeners
    Object.keys(this.msgAddedHandlerTracker).forEach((contact) => {
      this.props.client.getChannelByUniqueName(contact).then((channel) => {
        channel.removeAllListeners('messageAdded');
      });
    });
  }

  msgAddedHandler = (contact, msg) => {
    console.log(contact, msg, this.state.msgCache);
    if (this.state.msgCache[contact] === undefined) {
      this.setState({
        msgCache: update(this.state.msgCache, { $add: [contact, []] })
      });
    }
    this.setState({
      msgCache: update(this.state.msgCache, { [contact]: { $push: [msg] } })
    });
    console.log(contact, msg, this.state.msgCache);
  };

  fetchMsgsForContact(contact) {
    if (contact === 'new') {
      return;
    }
    if (
      this.state.msgCache[contact] === undefined &&
      !this.fetchTracker[contact]
    ) {
      this.fetchTracker[contact] = true; // prevent double-fetching
      this.props.client.getChannelByUniqueName(contact).then((channel) => {
        // first fetch existing messages
        channel.getMessages(msgsPerPage).then((paginator) => {
          let messages = [];
          paginator.items.forEach((msg) => {
            messages.push(msg);
          });
          this.setState({
            msgCache: update(this.state.msgCache, {
              [contact]: { $set: messages }
            }),
            pgtrCache: update(this.state.pgtrCache, {
              [contact]: { $set: paginator }
            })
          });
        });
        // then subscribe for receiving new messages
        if (!this.msgAddedHandlerTracker[contact]) {
          this.msgAddedHandlerTracker[contact] = true;
          channel.on('messageAdded', this.msgAddedHandler.bind(null, contact));
        }
      });
      /*      return null;
          } else {
            return this.state.msgCache[contact];*/
    }
  }

  updateNewPhoneNumber(e) {
    if (e && e.target) {
      this.setState({ newPhoneNumber: e.target.value });
    } else if (e === '') {
      // for resets after sending message in MsgComposer
      this.setState({ newPhoneNumber: '' });
    }
  }

  render() {
    if (this.state.selectedContact) {
      return (
        <Canvas>
          <MsgContactHeader
            key="msgContactHeader"
            back={this.selectContact.bind(null, null)}
            selectedContact={this.state.selectedContact}
            newPhoneNumber={this.state.newPhoneNumber}
            updateNewPhoneNumber={this.updateNewPhoneNumber}
          />
          <MsgList
            key="msgList"
            messages={this.state.msgCache[this.state.selectedContact]}
            fetchAnotherPage={this.fetchAnotherPage}
            selectedContact={this.state.selectedContact}
          />
          <MsgComposer
            key="msgComposer"
            secret={this.props.secret}
            selectedContact={this.state.selectedContact}
            selectContact={this.selectContact}
            newPhoneNumber={this.state.newPhoneNumber}
            updateNewPhoneNumber={this.updateNewPhoneNumber}
          />
        </Canvas>
      );
    } else {
      if (this.props.channelList === null) {
        return (
          <Canvas>
            <Spinner text="Loading contacts..." />
          </Canvas>
        );
      } else {
        return (
          <Canvas>
            <MsgContactAdd
              key="msgContactAdd"
              selectContact={this.selectContact}
            />
            <MsgContactList
              key="msgContactList"
              client={this.props.client}
              channelList={this.props.channelList}
              selectContact={this.selectContact}
              msgCache={this.state.msgCache}
            />
          </Canvas>
        );
      }
    }
  }
}

const Canvas = styled.div`
  flex-grow: 1;

  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  height: 100vh;
  max-width: 440px;
  position: relative;
  overflow-x: hidden;
`;
