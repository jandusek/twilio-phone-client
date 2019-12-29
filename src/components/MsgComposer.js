import React, { Component } from 'react';
import styled, { keyframes, css } from 'styled-components';
import chroma from "chroma-js";

const textAreaMaxHeight = 82; // px
//const msgOutboundUrl = 'https://build-client-backend-5498-dev.twil.io/msgOutbound';
const msgOutboundUrl = '/msgOutbound';

const hover_accent = chroma(process.env.REACT_APP_ACCENT_COLOR).darken().hex();

export default class MsgComposer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      msgText: "",
      sending: false,
      error: null
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleSend = this.handleSend.bind(this);

    this.msgTextRef = React.createRef();
  }

  resizeTextArea(textArea) {
    textArea.style.height = 'inherit';
    textArea.style.height = `${Math.min(textArea.scrollHeight, textAreaMaxHeight)}px`;
  }

  handleChange(e) {
    this.setState({ msgText: e.target.value });
    this.resizeTextArea(e.target);
  }

  handleKeyDown(e) {
    if (e.keyCode === 13) {  // Enter
      if (e.shiftKey) {
        this.resizeTextArea(e.target);
      } else {
        e.preventDefault();
        e.stopPropagation();
        this.handleSend();
      }
    }
  }

  normalizePhoneNumber(phoneNumber) {
    return phoneNumber.replace(/[()\- ]/g, '');
  }

  handleSend() {
    this.setState({ sending: true });
    function formParams(params) {
      return Object.keys(params).map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
      }).join('&');
    }

    const contact = this.props.selectedContact;
    let toNumber = contact;
    if (contact === "new") {
      toNumber = this.normalizePhoneNumber(this.props.newPhoneNumber);
    }
    const body = formParams({
      To: toNumber,
      From: this.props.clientNumber,
      Body: this.state.msgText
    });

    fetch(msgOutboundUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body
    })
      .then(async response => {
        if (response.status === 200) {
          this.setState({ msgText: '', sending: false, error: null });
          if (contact === "new") {
            this.props.updateNewPhoneNumber("");
            this.props.selectContact(toNumber);
          }
          this.resizeTextArea(this.msgTextRef.current);
        } else {
          const errText = await response.text();
          console.error(response.status, errText);
          this.setState({ sending: false, error: errText });
        }
      }).catch(err => {
        this.setState({ sending: false, error: ("Backend err:" + err) });
        console.error("Error while sending message:", err)
      });
  }

  render() {
    return [
      (this.state.error ? <Error key="error"><ErrorText>{this.state.error}</ErrorText></Error> : null),
      <Container key="msgComposer">
        <TextAreaContainer key="txtAreaContainer">
          <TextArea
            rows="1"
            placeholder="Type message"
            ref={this.msgTextRef}
            value={this.state.msgText}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
            disabled={this.state.sending}
          />
        </TextAreaContainer>
        <BtnSend key="btnSend"
          disabled={this.state.msgText === "" || this.state.sending}
          sending={this.state.sending}
          onClick={this.handleSend}
        >
          {IcoSend}
        </BtnSend>
      </Container>
    ];
  }
}

const Container = styled.div`
  flex-grow: 1;
  flex-shrink: 0;

  min-height: 2.5em;
  max-height: 85px;
  color: rgb(34, 34, 34);
  position: relative;
  overflow-x: hidden;
  
  display: flex;
  flex-wrap: nowrap;
  -webkit-box-flex: 0;
  flex-direction: row;
  background: #ffffff;
  padding-top: 8px;
  padding-bottom: 12px;
  margin-left: 12px;
  margin-right: 12px;
`;

const TextAreaContainer = styled.div`
  display: flex;
  align-self: flex-end;
  padding-top: 5px;
  padding-bottom: 5px;
  flex-grow: 1;
  flex-shrink: 1;
  width: 100vw;
  box-sizing: border-box;
  color: rgb(34, 34, 34);
  overflow: hidden;
  background: rgb(236, 237, 241);
  border-radius: 18px;
`;

const TextArea = styled.textarea`
  font-size: 12px;
  display: block;
  width: 100vw;
  resize: none;
  box-sizing: border-box;
  padding-left: 12px;
  padding-right: 12px;
  padding-top: 6px;
  padding-bottom: 6px;
  overflow-x: hidden;
  overflow-y: auto;
  color: ${props => (props.disabled ? "#94979B" : "rgb(34, 34, 34)")};
  border-width: 0px;
  border-style: initial;
  border-color: initial;
  border-image: initial;
  outline: none;
  background: rgb(236, 237, 241);
`;

const flash = keyframes`
    0% { opacity: 0.25; }
   50% { opacity: 0.50; }
  100% { opacity: 0.25; }
`;

const BtnSend = styled.button`
  flex-grow: 0;
  flex-shrink: 0;
  align-self: flex-end;
  width: 36px;
  height: 36px;
  color: rgb(255, 255, 255);
  padding: 0px;
  border-width: initial;
  border-style: none;
  border-color: initial;
  border-image: initial;
  outline: none;
  border-radius: 100px;
  background: ${process.env.REACT_APP_ACCENT_COLOR};
  margin-left: 8px;
  ${(props) => props.disabled ?
    `
    opacity: 0.5;
    cursor: default;
    ` : `
    opacity: 1;
    cursor: pointer;
    &:hover { background: ${hover_accent}; }
    `
  }
  animation: ${props => (props.sending ? css`${flash} 1s ease-in-out infinite` : '')};
`;

const Error = styled.div`
  text-align: center;
  padding:2px;
  margin:0;
`;

const ErrorText = styled.div`
  padding: 3px 20px 3px 20px;
  margin:0;
  display: inline-block
  background: #fbcbd0;
  color: #F22F46;
  border-radius: 9px;
  font-weight: 400;
`;

const IcoSend = <svg
  width="24px"
  height="24px"
  className="Twilio-Icon-Content"
  viewBox="0 0 24 24"
>
  <path
    fill="currentColor"
    fillRule="evenodd"
    d="M19.641 4c.164 0 .27.064.317.193.047.13.023.305-.07.528l-7.19 16.77a.761.761 0 01-.237.36.501.501 0 01-.308.114.494.494 0 01-.281-.097.989.989 0 01-.264-.29L8.76 16.92a4.609 4.609 0 00-.73-.905 5.269 5.269 0 00-.904-.747L2.38 12.314c-.27-.175-.396-.372-.378-.588.017-.217.172-.39.465-.519l16.788-7.12c.07-.023.137-.043.202-.06A.701.701 0 0119.64 4zM7.723 14.266c.117.07.238.155.36.255.124.1.25.208.379.325l8.314-8.455-12.902 5.484 3.85 2.39zm4.342 5.818l5.52-12.92-8.332 8.473c.105.117.202.234.29.351.088.117.16.235.22.352l2.302 3.744z"
  ></path>
</svg>;