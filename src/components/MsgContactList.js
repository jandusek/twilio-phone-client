import React, { Component } from 'react';
import styled from 'styled-components';
import { printTimestamp, formatBodyPreviewText } from '../helpers.js';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { BadgeAfter } from './CommonComponents';

export default class MsgContactList extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  /*  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
    }
  }*/

  render() {
    console.log(this.props.msgUnreadsCache);
    return (
      <div>
        {Object.keys(this.props.channelList)
          .sort((a, b) => {
            if (
              this.props.channelList[a].lastMessage &&
              this.props.channelList[b].lastMessage
            ) {
              return this.props.channelList[a].lastMessage.timestamp >
                this.props.channelList[b].lastMessage.timestamp
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
                onClick={this.props.selectContact.bind(null, phoneNumber)}
              >
                <Header>
                  <Author>{phoneNumberParsed}</Author>
                  <BadgeContainer>
                    {this.props.msgUnreadsCache[phoneNumber] > 0 && (
                      <BadgeAfter>
                        {this.props.msgUnreadsCache[phoneNumber]}
                      </BadgeAfter>
                    )}
                  </BadgeContainer>
                  <TimeStamp>
                    {this.props.channelList[phoneNumber].lastMessage
                      ? printTimestamp(
                          this.props.channelList[phoneNumber].lastMessage
                            .timestamp
                        )
                      : ''}
                  </TimeStamp>
                  <Arrow>{IcoFwdArrow}</Arrow>
                </Header>
                <BodyPreview>
                  {this.props.msgCache[phoneNumber] &&
                  this.props.msgCache[phoneNumber][
                    this.props.msgCache[phoneNumber].length - 1
                  ]
                    ? formatBodyPreviewText(
                        this.props.msgCache[phoneNumber][
                          this.props.msgCache[phoneNumber].length - 1
                        ].body
                      )
                    : '...'}
                </BodyPreview>
              </Contact>
            );
          })}
      </div>
    );
  }
}

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
  align-items: center;
  vertical-align: middle;
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

const BodyPreview = styled.div`
  font-size: 14px;
  margin: 4px 0 3px 0;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  line-height: 1.2em;
  max-height: 1.2em;
`;

const IcoFwdArrow = (
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
