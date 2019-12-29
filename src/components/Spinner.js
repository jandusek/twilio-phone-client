import React from 'react';
import styled, { keyframes } from 'styled-components';

function Spinner(props) {
  return <SpinnerContainer>
    <SpinnerIcon />
    <SpinnerLabel>{props.text}</SpinnerLabel>
  </SpinnerContainer>
}

const SpinnerContainer = styled.div`
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 100%;
  color: #94979B;
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const SpinnerIcon = styled.div`
  width: 50px;
  height: 50px;
  animation: ${spin} 2s linear infinite;
  background: url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+Cjxzdmcgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDMwIDMwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zOnNlcmlmPSJodHRwOi8vd3d3LnNlcmlmLmNvbS8iIHN0eWxlPSJmaWxsLXJ1bGU6ZXZlbm9kZDtjbGlwLXJ1bGU6ZXZlbm9kZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6MjsiPgogICAgPHBhdGggZD0iTTE1LDBDNi43LDAgMCw2LjcgMCwxNUMwLDIzLjMgNi43LDMwIDE1LDMwQzIzLjMsMzAgMzAsMjMuMyAzMCwxNUMzMCw2LjcgMjMuMywwIDE1LDBaTTE1LDI2QzguOSwyNiA0LDIxLjEgNCwxNUM0LDguOSA4LjksNCAxNSw0QzIxLjEsNCAyNiw4LjkgMjYsMTVDMjYsMjEuMSAyMS4xLDI2IDE1LDI2Wk0yMS44LDExLjNDMjEuOCwxMyAyMC40LDE0LjQgMTguNywxNC40QzE3LDE0LjQgMTUuNiwxMyAxNS42LDExLjNDMTUuNiw5LjYgMTcsOC4yIDE4LjcsOC4yQzIwLjQsOC4yIDIxLjgsOS42IDIxLjgsMTEuM1pNMjEuOCwxOC43QzIxLjgsMjAuNCAyMC40LDIxLjggMTguNywyMS44QzE3LDIxLjggMTUuNiwyMC40IDE1LjYsMTguN0MxNS42LDE3IDE3LDE1LjYgMTguNywxNS42QzIwLjQsMTUuNiAyMS44LDE3IDIxLjgsMTguN1pNMTQuNCwxOC43QzE0LjQsMjAuNCAxMywyMS44IDExLjMsMjEuOEM5LjYsMjEuOCA4LjIsMjAuNCA4LjIsMTguN0M4LjIsMTcgOS42LDE1LjYgMTEuMywxNS42QzEzLDE1LjYgMTQuNCwxNyAxNC40LDE4LjdaTTE0LjQsMTEuM0MxNC40LDEzIDEzLDE0LjQgMTEuMywxNC40QzkuNiwxNC40IDguMiwxMyA4LjIsMTEuM0M4LjIsOS42IDkuNiw4LjIgMTEuMyw4LjJDMTMsOC4yIDE0LjQsOS42IDE0LjQsMTEuM1oiIHN0eWxlPSJmaWxsOnJnYigxNDgsMTUxLDE1NSk7ZmlsbC1ydWxlOm5vbnplcm87Ii8+Cjwvc3ZnPgo=");
`;

const SpinnerLabel = styled.div`
  margin: 8px 0 0 5px;
`;

export default Spinner;