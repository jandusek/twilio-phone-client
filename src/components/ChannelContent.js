import React from 'react';
import styled from 'styled-components';

import MsgCanvas from './MsgCanvas';
import CallCanvas from './CallCanvas';

function ChannelContent(props) {
  if (props.selectedChannel === 'sms') {
    return (
      <MsgCanvas
        client={props.client}
        channelList={props.channelList}
        secret={props.secret}
        msgUnreadsCache={props.msgUnreadsCache}
        setUnreadMsgs={props.setUnreadMsgs}
        setUnreadsCache={props.setUnreadsCache}
        msgCache={props.msgCache}
        msgPgtrCache={props.msgPgtrCache}
        addMsgCachePage={props.addMsgCachePage}
        setMsgCachePage={props.setMsgCachePage}
        addMsgCacheMsg={props.addMsgCacheMsg}
      />
    );
  } else if (props.selectedChannel === 'call') {
    return (
      <CallCanvas
        client={props.client}
        incomingCall={props.incomingCall}
        setCallDisplay={props.setCallDisplay}
        callDisplay={props.callDisplay}
        setCallConnection={props.setCallConnection}
        getCallConnection={props.getCallConnection}
        setCallStartTime={props.setCallStartTime}
        getCallStartTime={props.getCallStartTime}
        setCallNextKeyReset={props.setCallNextKeyReset}
        getCallNextKeyReset={props.getCallNextKeyReset}
        setCallTypingPN={props.setCallTypingPN}
        getCallTypingPN={props.getCallTypingPN}
      />
    );
  } else {
    return <AltCanvas>Channel not supported</AltCanvas>;
  }
}

const AltCanvas = styled.div`
  flex-grow: 1;
  height: 100vh;
`;

export default ChannelContent;
