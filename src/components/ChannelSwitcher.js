import React from 'react';
import styled from 'styled-components';
import { SvgPhone } from './CallDialpadComponents';
import { Badge } from './CommonComponents';

function ChannelSwitcher(props) {
  let msgUnreadsTotal = 0;
  for (const contact in props.msgUnreadsCache) {
    msgUnreadsTotal += props.msgUnreadsCache[contact];
  }
  return (
    <TabsContainer>
      <Tabs>
        <TabHeader>
          <Tab
            selected={props.selectedChannel === 'sms' ? true : false}
            onClick={props.setChannel.bind(null, 'sms')}
          >
            {msgUnreadsTotal > 0 && <Badge>{msgUnreadsTotal}</Badge>}
            <Channel>sms</Channel>
          </Tab>
          <StateIndicator
            selected={props.selectedChannel === 'sms' ? true : false}
          />
        </TabHeader>
        <TabHeader>
          <Tab
            selected={props.selectedChannel === 'call' ? true : false}
            onClick={props.setChannel.bind(null, 'call')}
          >
            {props.incomingCall !== null && ( // ToDo: replace with proper indicator of any (not just incoming) call in progress
              <Badge>
                <SvgPhone style={{ height: '0.75em' }} />
              </Badge>
            )}
            <Channel>call</Channel>
          </Tab>
          <StateIndicator
            selected={props.selectedChannel === 'call' ? true : false}
          />
        </TabHeader>
      </Tabs>
    </TabsContainer>
  );
}

const TabsContainer = styled.div`
  flex-grow: 0;
  flex-basis: 2.3em;

  height: 2.3em;
  width: 100%;
  z-index: 9999;
  background: #ffffff;
`;

const Tabs = styled.div`
  display: flex;
  margin-left: 12px;
  margin-right: 12px;
  border-style: solid;
  border-width: 0px 0px 1px;
  border-color: rgb(198, 202, 215);
  padding: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
  -webkit-font-smoothing: antialiased;
`;

const TabHeader = styled.div`
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
  -webkit-font-smoothing: antialiased;
  display: flex;
  position: relative;
  min-width: 44px;
  margin-right: auto;
  margin-left: auto;
  flex: 0 1 auto;
`;

const Tab = styled.button`
  outline: none;
  -webkit-appearance: button;
  -webkit-writing-mode: horizontal-tb !important;
  text-rendering: auto;
  word-spacing: normal;
  text-indent: 0px;
  text-shadow: none;
  display: inline-block;
  text-align: center;
  align-items: flex-start;
  box-sizing: border-box;
  margin: 0em;
  font: 400 11px system-ui;
  -webkit-font-smoothing: antialiased;

  color: rgb(34, 34, 34);
  text-transform: uppercase;
  font-weight: ${(props) => (props.selected === true ? 'bold' : 'normal')};
  line-height: 1.1;
  letter-spacing: 2px;
  cursor: pointer;
  margin-right: auto;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: inherit;
  border-width: initial;
  border-style: none;
  border-color: initial;
  border-image: initial;
  background: none;
  transition: color 0.2s ease 0s;
  padding: 12px;
  overflow: hidden;
`;

const Channel = styled.span`
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
`;

const StateIndicator = styled.div`
  position: absolute;
  height: 4px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  top: auto;
  ${(props) =>
    props.selected === true
      ? 'background: ' + process.env.REACT_APP_ACCENT_COLOR + ';'
      : ''}
`;

export default ChannelSwitcher;
