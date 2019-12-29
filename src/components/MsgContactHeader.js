import React from 'react';
import styled from 'styled-components';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import chroma from "chroma-js";

const hover_accent = chroma(process.env.REACT_APP_ACCENT_COLOR).darken().hex();

function MsgContactHeader(props) {
  if (props.selectedContact === "new") {
    return <ContactHeader>
      <Spacer key="Lspacer">
        <BtnBack onClick={props.back}>{IcoBack}</BtnBack>
      </Spacer>
      <InputContainer key="inputContainer">
        <Input
          placeholder="Type phone number"
          onChange={props.updateNewPhoneNumber}
          value={props.newPhoneNumber}
        /*onKeyDown={}*/
        />
      </InputContainer>
      <Spacer key="Rspacer" />
    </ContactHeader>;
  } else {
    const phoneNumber = parsePhoneNumberFromString(props.selectedContact) ? parsePhoneNumberFromString(props.selectedContact).formatInternational() : props.selectedContact;
    return <ContactHeader>
      <Spacer key="Lspacer">
        <BtnBack onClick={props.back}>{IcoBack}</BtnBack>
      </Spacer>
      <ContactName key="contactName">{phoneNumber}</ContactName>
      <Spacer key="Rspacer" />
    </ContactHeader>;
  }
}

export default MsgContactHeader;

const ContactHeader = styled.div`
  flex-grow: 0;
  flex-shrink: 0;
  background: #ffffff;
  max-width: 440px;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 2.5em;
  margin-left: 12px;
  margin-right: 12px;
  border-style: solid;
  border-width: 0px 0px 1px;
  border-color: rgb(198, 202, 215);
`;

const ContactName = styled.div`
  font-weight: 600;
`;

const Spacer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const BtnBack = styled.button`
  width: 24px;
  height: 24px;
  color: #FFFFFF;
  padding: 0;
  margin: 0;
  border-width: initial;
  border-style: none;
  border-color: initial;
  border-image: initial;
  outline: none;
  border-radius: 100px;
  background: ${process.env.REACT_APP_ACCENT_COLOR};
  cursor: pointer;
  &:hover {
    background: ${hover_accent};
  }
`;

const IcoBack = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500">
  <path
    fill="#fff"
    d="M279.218 115.587l-126.897 121.83c-7.149 6.853-7.149 18.295 0 25.177l126.897 121.801c7.782 7.473 20.068 7.473 27.85 0 8.233-7.909 8.233-21.081 0-29.004L200.789 253.362a4.651 4.651 0 010-6.741l106.279-102.03c8.233-7.909 8.233-21.081 0-29.004A20.133 20.133 0 00293.15 110a20.141 20.141 0 00-13.932 5.587z"
  ></path>
</svg>;

const InputContainer = styled.div`
  width: 175px;
  box-sizing: border-box;
  color: rgb(34, 34, 34);
  overflow: hidden;
  background: rgb(236, 237, 241);
  border-radius: 10px;
`;

const Input = styled.input`
  font-weight: 600;
  font-size: 15px;
  display: block;
  width: 100vw;
  resize: none;
  box-sizing: border-box;
  padding-left: 14px;
  padding-right: 14px;
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