import React from 'react';
import styled from 'styled-components';

function MsgContactAdd(props) {
  return <ContactAdd onClick={props.selectContact.bind(null, "new")}>
    {IcoAdd}<span style={{ padding: "5px" }}>New message</span>
  </ContactAdd>;
}

const ContactAdd = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  //justify-content: center;
  height: 1.8em;
  margin-left:12px;
  margin-right:12px;
  text-decoration: none !important;
  font-size: 14px;
  padding: 0.4rem 0.5rem 0.4rem 0.5rem;
  color: rgb(34, 34, 34);
  background: #FFFFFF;
  cursor: pointer;
  border-width: 0px 0px 1px;
  border-top-style: solid;
  border-right-style: solid;
  border-bottom-style: solid;
  border-left-style: solid;
  border-color: rgb(198, 202, 215);
  &:hover {
    background: #E8E8E8;
  }
`;

const IcoAdd = <svg
  xmlns="http://www.w3.org/2000/svg"
  fillRule="evenodd"
  strokeLinejoin="round"
  strokeMiterlimit="2"
  clipRule="evenodd"
  viewBox="0 0 20 20"
  height="14px" width="14px"
>
  <path
    fill="#222222"
    stroke="#222222"
    strokeWidth="1"
    d="M10 .5A9.473 9.473 0 00.5 10c0 5.268 4.232 9.5 9.5 9.5s9.5-4.232 9.5-9.5S15.268.5 10 .5zm0 .864c4.75 0 8.636 3.886 8.636 8.636 0 4.75-3.886 8.636-8.636 8.636-4.75 0-8.636-3.886-8.636-8.636 0-4.75 3.886-8.636 8.636-8.636zm.432 3.886v4.318h4.318v.864h-4.318v4.318h-.864v-4.318H5.25v-.864h4.318V5.25h.864z"
  ></path>
</svg>;

export default MsgContactAdd;