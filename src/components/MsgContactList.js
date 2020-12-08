import React from 'react';
import styled from 'styled-components';
import { printTimestamp, formatBodyPreviewText } from '../helpers.js';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { BadgeAfter } from './CommonComponents';
const accent = process.env.REACT_APP_ACCENT_COLOR;

function MsgContactList(props) {
  const trashClick = (phoneNumber, e) => {
    e.stopPropagation();
    if (
      window.confirm(
        `Are you sure you want to delete all messages to '${phoneNumber}' ?`
      )
    )
      props.deleteThread(phoneNumber);
  };

  return (
    <div>
      {Object.keys(props.channelList)
        .sort((a, b) => {
          if (
            props.channelList[a].lastMessage &&
            props.channelList[b].lastMessage
          ) {
            return props.channelList[a].lastMessage.timestamp >
              props.channelList[b].lastMessage.timestamp
              ? -1
              : 1;
          } else {
            return 0;
          }
        })
        .map((phoneNumber) => {
          const phoneNumberParsed = parsePhoneNumberFromString(phoneNumber)
            ? parsePhoneNumberFromString(phoneNumber).formatInternational()
            : phoneNumber;
          return (
            <Contact
              key={phoneNumber}
              onClick={props.selectContact.bind(null, phoneNumber)}
            >
              <Header>
                <Author>{phoneNumberParsed}</Author>
                <BadgeContainer>
                  {props.msgUnreadsCache[phoneNumber] > 0 && (
                    <BadgeAfter>
                      {props.msgUnreadsCache[phoneNumber]}
                    </BadgeAfter>
                  )}
                </BadgeContainer>
                <TimeStamp>
                  {props.channelList[phoneNumber].lastMessage
                    ? printTimestamp(
                        props.channelList[phoneNumber].lastMessage.timestamp
                      )
                    : ''}
                </TimeStamp>
                <Arrow>{SvgFwdArrow}</Arrow>
              </Header>
              <Body>
                <BodyPreview>
                  {props.msgCache[phoneNumber] &&
                  props.msgCache[phoneNumber][
                    props.msgCache[phoneNumber].length - 1
                  ]
                    ? formatBodyPreviewText(
                        props.msgCache[phoneNumber][
                          props.msgCache[phoneNumber].length - 1
                        ].body
                      )
                    : '...'}
                </BodyPreview>
                <Trash onClick={trashClick.bind(null, phoneNumber)} />
              </Body>
            </Contact>
          );
        })}
    </div>
  );
}

const Header = styled.div`
  -webkit-box-pack: justify;
  justify-content: space-between;
  display: flex;
  flex-wrap: nowrap;
  -webkit-box-flex: 1;
  flex-grow: 1;
  flex-shrink: 1;
  flex-direction: row;
  align-items: center;
  vertical-align: middle;
`;

const Body = styled.div`
  -webkit-box-pack: justify;
  justify-content: space-between;
  display: flex;
  flex-wrap: nowrap;
  -webkit-box-flex: 1;
  flex-grow: 1;
  flex-shrink: 1;
  flex-direction: row;
  align-items: center;
  vertical-align: middle;
`;

const BodyPreview = styled.div`
  font-size: 14px;
  margin: 4px 0 3px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2em;
  max-height: 1.2em;
  flex: 1 1 auto;
`;

const Author = styled.div`
  font-size: 14px;
  margin-top: 0px;
  margin-bottom: 0px;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 8px;
  font-weight: bold;
  overflow: hidden;
  flex: 0 1 auto;
`;

const BadgeContainer = styled.div`
  flex: 1 1 auto;
`;

const TimeStamp = styled.div`
  font-size: 12px;
  margin-top: 0px;
  margin-bottom: 0px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  flex: 0 0 auto;
`;

const Arrow = styled.div`
  margin-top: 0px;
  margin-bottom: 0px;
  flex: 0 0 auto;
  margin-left: 4px;
  white-space: nowrap;
  overflow: hidden;
  vertical-align: middle;
`;

const SvgFwdArrow = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fillRule="evenodd"
    strokeLinejoin="round"
    strokeMiterlimit="2"
    clipRule="evenodd"
    viewBox="0 0 7 12"
    height="12px"
    width="7px"
  >
    <path
      fill="#565b73"
      d="M1.693.296l4.722 5.17a.814.814 0 010 1.068l-4.722 5.169a.683.683 0 01-1.037 0 .939.939 0 010-1.23l3.956-4.33a.219.219 0 000-.286L.656 1.527a.94.94 0 010-1.231.704.704 0 01.518-.237c.187 0 .374.079.519.237z"
    ></path>
  </svg>
);

const SvgTrash = (props) => (
  <svg
    viewBox="0 0 192 209"
    fillRule="evenodd"
    clipRule="evenodd"
    strokeLinejoin="round"
    strokeMiterlimit={2}
    height="12px"
    width="12px"
    {...props}
  >
    <path
      d="M69.792 82.474v78.125c0 2.439-1.901 4.34-4.341 4.34h-8.68c-2.439 0-4.34-1.901-4.34-4.34V82.474c0-2.439 1.901-4.34 4.34-4.34h8.68c2.44 0 4.341 1.901 4.341 4.34zm34.722 0v78.125c0 2.439-1.901 4.34-4.34 4.34h-8.681c-2.439 0-4.34-1.901-4.34-4.34V82.474c0-2.439 1.901-4.34 4.34-4.34h8.681c2.439 0 4.34 1.901 4.34 4.34zm34.722 0v78.125c0 2.439-1.901 4.34-4.34 4.34h-8.681c-2.439 0-4.34-1.901-4.34-4.34V82.474c0-2.439 1.901-4.34 4.34-4.34h8.681c2.439 0 4.34 1.901 4.34 4.34zm17.361 98.203V52.101H35.069v128.576c0 6.511 3.664 10.313 4.341 10.313h112.847c.677 0 4.34-3.802 4.34-10.313zM65.451 34.731h60.764l-6.51-15.868c-.408-.547-1.623-1.354-2.309-1.493H74.401c-.816.139-1.901.946-2.309 1.493l-6.641 15.868zm125.868 4.332v8.689c0 2.439-1.901 4.34-4.34 4.34h-13.021v128.576c0 14.922-9.765 27.665-21.701 27.665H39.41c-11.936 0-21.702-12.205-21.702-27.126V52.083H4.687c-2.439 0-4.34-1.901-4.34-4.34v-8.68c0-2.44 1.901-4.341 4.34-4.341h41.91l9.497-22.647C58.811 5.425 66.944 0 74.132 0h43.403c7.187 0 15.33 5.425 18.038 12.075l9.496 22.647h41.91c2.439 0 4.34 1.901 4.34 4.341z"
      fill="currentColor"
      fillRule="nonzero"
    />
  </svg>
);

const Trash = styled(SvgTrash)`
  margin-top: 0px;
  margin-bottom: 0px;
  flex: 0 0 auto;
  margin-left: 4px;
  white-space: nowrap;
  overflow: hidden;
  vertical-align: middle;
  display: none;

  &:hover {
    color: ${accent};
  }
`;

const Contact = styled.div`
  margin-left: 12px;
  margin-right: 12px;

  display: flex;
  flex-wrap: nowrap;
  -webkit-box-flex: 1;
  flex-grow: 1;
  flex-shrink: 1;
  flex-direction: column;
  padding: 0.4rem 0.5rem 0.4rem 0.5rem;

  border-width: 0px 0px 1px;
  border-top-style: solid;
  border-right-style: solid;
  border-bottom-style: solid;
  border-left-style: solid;
  border-color: rgb(198, 202, 215);
  color: rgb(34, 34, 34);
  background: #ffffff;
  cursor: pointer;
  &:hover {
    background: #e8e8e8;
  }
  &:hover ${Trash} {
    display: inline;
  }
`;

export default MsgContactList;
