import React from 'react';
import styled from 'styled-components';

import MsgCanvas from './MsgCanvas';
import CallCanvas from './CallCanvas';

function ChannelContent(props) {
  if (props.selectedChannel === "sms") {
    return <MsgCanvas
      client={props.client}
      channelList={props.channelList}
    />
  } else if (props.selectedChannel === "call") {
    return <CallCanvas
      client={props.client}
    />;
  } else {
    return <AltCanvas>Channel not supported</AltCanvas>;
  }
}

const AltCanvas = styled.div`
  flex-grow: 1;
  height: 100vh;
`;

export default ChannelContent;