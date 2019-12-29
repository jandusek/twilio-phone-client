import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';
import styled from 'styled-components';
import { printTimestamp, formatBodyText, prettyDate } from '../helpers';
import Spinner from './Spinner';

export default class MsgList extends Component {
  constructor(props) {
    super(props);
    this.canScroll = true;
    this.state = {
      scrollListenerAttached: false
    }
    this.messagesEndRef = React.createRef();
    this.scrollAreaRef = React.createRef();

    this.onScroll = this.onScroll.bind(this);
    this.attachScrollListener = this.attachScrollListener.bind(this);
  }

  componentWillUnmount() {
    if (this.scrollAreaRef.current && this.attachScrollListener) {
      this.scrollAreaRef.current.removeEventListener('scroll', this.onScroll);
      this.setState({ scrollListenerAttached: false });
    }
  }

  // since newest messages are at the bottom, scroll there by default
  scrollToBottom() {
    if (this.messagesEndRef.current) {
      this.messagesEndRef.current.scrollIntoView();
    }
  }

  attachScrollListener() {
    if (this.scrollAreaRef.current && !this.state.scrollListenerAttached) {
      this.scrollAreaRef.current.addEventListener('scroll', this.onScroll);
      this.setState({ scrollListenerAttached: true });
    }
  }

  onScroll() {
    /*
     * this.scrollAreaRef.current.scrollTop - current position
     * this.scrollAreaRef.current.scrollHeight - height of element's content (including overflows)
     * this.scrollAreaRef.current.offsetHeight - height of element's viewport
     */
    if (this.scrollAreaRef.current.scrollTop < 250 && this.canScroll) {
      this.canScroll = false;
      this.props.fetchAnotherPage()
        .then(() => {
          this.canScroll = true;
        })
        .catch(() => { });
    }
  }

  componentDidMount() {
    this.attachScrollListener();
    this.scrollToBottom();
  }

  componentDidUpdate(prevProps) {
    this.attachScrollListener();
    // scroll to the bottom on:
    if (
      // the 1st load
      (prevProps.messages === undefined && this.props.messages !== undefined) ||
      // or when new message was added (last messages are not the same)
      (prevProps.messages && this.props.messages && prevProps.messages[prevProps.messages.length - 1] !== this.props.messages[this.props.messages.length - 1])
    ) {
      this.scrollToBottom();
    }
  }

  render() {
    let lastDate = null;
    if (this.props.selectedContact === "new") {
      return <Container>
      </Container>;
    } else if (this.props.messages === undefined) {
      return <Container>
        <Spinner text="Loading messages..." />
      </Container>;
    } else {
      return (
        <Container key="msgListCont" ref={this.scrollAreaRef}>
          <StyledReactTooltip key="tooltip" effect="solid" multiline={true} delayHide={500} delayShow={500} clickable={true} />
          <MsgCanvas key="msgCanvas">
            {
              this.props.messages.map(msg => {
                return [(lastDate === prettyDate(msg.timestamp) ? null : <Date key={msg.timestamp}>{lastDate = prettyDate(msg.timestamp)}</Date>),
                <MsgListItem key={msg.sid} author={msg.author}>
                  <Bubble author={msg.author}>
                    <Header key="header">
                      <Author key="author">{msg.attributes.fromNumber}</Author>
                      <TimeStamp key="timestamp"
                        data-tip={
                          (msg.attributes.sid ? msg.attributes.sid + "<br />" : "") +
                          (msg.attributes.fromNumber ? "From: " + msg.attributes.fromNumber + "<br />" : "") +
                          (msg.attributes.toNumber ? "To: " + msg.attributes.toNumber + "<br />" : "") +
                          (msg.attributes.dateCreated ? "Date created: " + msg.attributes.dateCreated + "<br />" : "") +
                          (msg.attributes.numSegments ? "Sent as " + msg.attributes.numSegments + " segment" + (msg.attributes.numSegments > 1 ? "s" : "") : "")
                        }
                      >
                        {printTimestamp(msg.timestamp)}
                      </TimeStamp>
                    </Header>
                    <Body key="body">{formatBodyText(msg.body)}</Body>
                  </Bubble>
                </MsgListItem>];
              })
            }
            <div ref={this.messagesEndRef} />
          </MsgCanvas>
        </Container >
      );
    }
  }
}

const StyledReactTooltip = styled(ReactTooltip)`
  &.type-dark {
    font-size: 12px;
    padding: 0.5rem 0.75rem;
    background-color: #565B73;
    color: #FFFFFF;
    > * {
      text-align: left;      
    }
  }
  &.__react_component_tooltip.place-left::after {
    border-left: 6px solid #565B73 !important;
  }
  &.__react_component_tooltip.place-right::after {
    border-right: 6px solid #565B73 !important;
  }
  &.__react_component_tooltip.place-top::after {
    border-top: 6px solid #565B73 !important;
  }
  &.__react_component_tooltip.place-bottom::after {
    border-bottom: 6px solid #565B73 !important;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: auto;
  flex-shrink: 1;
  -webkit-box-flex: 1;
  flex-grow: 1;
  overflow-y: auto;
  padding-left: 12px;
  padding-right: 12px;
  position: relative;
  overflow-x: hidden;
  flex-flow: row wrap;
  align-items: stretch;
  height: 100vh;
`;

const MsgCanvas = styled.div`
  width: 100vw;
`;

const MsgListItem = styled.div`
  flex-direction: column;
  margin-bottom: 8px;
  margin-top: 8px;
  display: flex;
  position: relative;
  flex: 1 1 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-width: 440px;
  min-width: 100px;
  overflow-x: hidden;
  ${(props) => props.author === "them" ?
    // them - grey
    `
    align-self: left;
    margin-left: 0px;
    margin-right: 44px;
    `
    :
    // us - accent color
    `
    align-self: right;
    margin-left: 44px;
    margin-right: 0px;
    `
  }
`;

const Bubble = styled.div`
  padding: 5px 12px 8px 12px;
  margin-left: 0px;
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-wrap: nowrap;
  -webkit-box-flex: 1;
  flex-grow: 1;
  flex-shrink: 1;
  flex-direction: column;
  ${(props) => props.author === "them" ?
    // them - grey
    `
    background: #ECEDF1;
    color: rgb(34, 34, 34);
    margin-right: auto;
    `
    :
    // us - blue
    `
    background: ${process.env.REACT_APP_ACCENT_COLOR};
    color: #FFFFFF;
    margin-left: auto;
    `
  }
  border-radius: 4px;
`;

const Header = styled.div`
  -webkit-box-pack: justify;
  justify-content: space-between;
  display: flex;
  flex-wrap: nowrap;
  -webkit-box-flex: 1;
  flex-grow: 1;
  flex-shrink: 1;
  flex-direction: row;
`;

const Author = styled.div`
  font-size: 10px;
  margin-top: 0px;
  margin-bottom: 0px;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 8px;
  font-weight: bold;
  overflow: hidden;
  flex: 0 1 auto;
`;

const TimeStamp = styled.div`
  font-size: 10px;
  margin-top: 0px;
  margin-bottom: 0px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  flex: 0 0 auto;
`;

const Body = styled.div`
  margin-top: 3px;
  margin-bottom: 0px;
  font-size: 12px;
  line-height: 1.54;
  overflow-wrap: break-word;
`;

const Date = styled.div`
  text-align: center;
  font-size: 12px;
  color: #565B73;
  padding-top: 8px;
`;
