import React from 'react';
import styled from 'styled-components';
const iconColor = '#94979B';

function ModalMessage(props) {
  return (
    <FullScreen>
      <div
        style={{
          width: '50vw',
          maxWidth: '100px'
        }}
      >
        {props.img === 'auth_fail' && <SvgAuthFail />}
        {props.img === 'offline' && <SvgOffline />}
        {props.img === 'alert' && <SvgAlert />}
      </div>
      <span style={{ color: '#94979B', padding: '2vh' }}>{props.msg}</span>
    </FullScreen>
  );
}

const FullScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-align: center;
`;

const SvgOffline = (props) => (
  <svg
    viewBox="0 0 200 147"
    fillRule="evenodd"
    clipRule="evenodd"
    strokeLinejoin="round"
    margin="20px"
    strokeMiterlimit={2}
    color={iconColor}
    {...props}
  >
    <path
      d="M200 106.833c0 22.087-17.92 40-40 40H46.667C20.94 146.833 0 125.893 0 100.167 0 81.52 11.04 65.373 26.873 57.98c-.106-1.46-.206-3.02-.206-4.48C26.667 24.02 50.52.167 80 .167c22.293 0 41.353 13.646 49.373 33.126 4.587-4.06 10.627-6.46 17.294-6.46 14.686 0 26.666 11.98 26.666 26.667 0 5.313-1.56 10.207-4.273 14.373 17.707 4.167 30.94 20 30.94 38.96z"
      fill="currentColor"
    />
    <path
      d="M140.788 113.306a6.97 6.97 0 01-2.022 4.902l-9.807 9.807a6.999 6.999 0 01-4.902 2.021c-1.8 0-3.604-.719-4.901-2.021l-21.202-21.202-21.203 21.202a6.996 6.996 0 01-4.901 2.021c-1.8 0-3.605-.719-4.902-2.021l-9.807-9.807a7 7 0 01-2.022-4.902c0-1.8.72-3.604 2.022-4.901l21.202-21.203L57.141 66a7 7 0 01-2.022-4.902c0-1.799.72-3.604 2.022-4.901l9.807-9.807a7 7 0 014.902-2.022c1.8 0 3.604.72 4.901 2.022l21.203 21.202 21.202-21.202a6.997 6.997 0 014.901-2.022c1.8 0 3.605.72 4.902 2.022l9.807 9.807a7 7 0 012.022 4.901c0 1.8-.72 3.605-2.022 4.902l-21.202 21.202 21.202 21.203a6.997 6.997 0 012.022 4.901z"
      fill="currentColor"
    />
    <path
      d="M140.788 113.306a6.97 6.97 0 01-2.022 4.902l-9.807 9.807a6.999 6.999 0 01-4.902 2.021c-1.8 0-3.604-.719-4.901-2.021l-21.202-21.202-21.203 21.202a6.996 6.996 0 01-4.901 2.021c-1.8 0-3.605-.719-4.902-2.021l-9.807-9.807a7 7 0 01-2.022-4.902c0-1.8.72-3.604 2.022-4.901l21.202-21.203L57.141 66a7 7 0 01-2.022-4.902c0-1.799.72-3.604 2.022-4.901l9.807-9.807a7 7 0 014.902-2.022c1.8 0 3.604.72 4.901 2.022l21.203 21.202 21.202-21.202a6.997 6.997 0 014.901-2.022c1.8 0 3.605.72 4.902 2.022l9.807 9.807a7 7 0 012.022 4.901c0 1.8-.72 3.605-2.022 4.902l-21.202 21.202 21.202 21.203a6.997 6.997 0 012.022 4.901z"
      fill="#fff"
    />
  </svg>
);

const SvgAuthFail = (props) => (
  <svg
    viewBox="0 0 200 200"
    fillRule="evenodd"
    clipRule="evenodd"
    strokeLinejoin="round"
    strokeMiterlimit={2}
    color={iconColor}
    {...props}
  >
    <path
      d="M63.636 90.909h72.728V63.636c0-20.027-16.337-36.363-36.364-36.363-20.027 0-36.364 16.336-36.364 36.363v27.273zm118.182 13.636v81.819c0 7.527-6.109 13.636-13.636 13.636H31.818c-7.527 0-13.636-6.109-13.636-13.636v-81.819c0-7.527 6.109-13.636 13.636-13.636h4.546V63.636C36.364 28.691 65.055 0 100 0c34.945 0 63.636 28.691 63.636 63.636v27.273h4.546c7.527 0 13.636 6.109 13.636 13.636z"
      fill="currentColor"
      fillRule="nonzero"
    />
    <path
      d="M142.834 173.306c0 1.805-.72 3.605-2.021 4.902l-9.808 9.807a6.996 6.996 0 01-4.901 2.021c-1.8 0-3.605-.719-4.902-2.021L100 166.813l-21.202 21.202a6.999 6.999 0 01-4.902 2.021c-1.8 0-3.604-.719-4.901-2.021l-9.808-9.807a6.999 6.999 0 01-2.021-4.902c0-1.8.72-3.604 2.021-4.901l21.203-21.203L59.187 126a6.999 6.999 0 01-2.021-4.902c0-1.799.72-3.604 2.021-4.901l9.808-9.807a6.997 6.997 0 014.901-2.022c1.8 0 3.605.72 4.902 2.022L100 127.592l21.202-21.202a7 7 0 014.902-2.022c1.8 0 3.604.72 4.901 2.022l9.808 9.807a6.998 6.998 0 012.021 4.901c0 1.8-.72 3.605-2.021 4.902l-21.203 21.202 21.203 21.203a6.996 6.996 0 012.021 4.901z"
      fill="#fff"
    />
  </svg>
);

const SvgAlert = (props) => (
  <svg
    viewBox="0 0 200 190"
    fillRule="evenodd"
    clipRule="evenodd"
    strokeLinejoin="round"
    strokeMiterlimit={2}
    color={iconColor}
    {...props}
  >
    <path
      d="M114.288 157.74v-21.21c0-2.007-1.564-3.686-3.571-3.686H89.286c-2.007 0-3.572 1.672-3.572 3.686v21.21c0 2.007 1.565 3.686 3.572 3.686h21.431c2.007 0 3.571-1.672 3.571-3.686zm-.221-41.74l2.007-51.234c0-.671-.335-1.564-1.114-2.122-.672-.557-1.672-1.228-2.679-1.228H87.729c-1.008 0-2.008.671-2.679 1.228-.779.558-1.115 1.672-1.115 2.344L85.836 116c0 1.45 1.671 2.564 3.793 2.564h20.652c2.007 0 3.686-1.114 3.793-2.564h-.007zm-1.564-104.254l85.722 157.159c2.458 4.35 2.343 9.708-.221 14.066a14.28 14.28 0 01-12.28 7.029H14.278c-5.021 0-9.708-2.679-12.279-7.029-2.572-4.351-2.679-9.708-.222-14.066L87.5 11.746a14.203 14.203 0 0112.501-7.479c5.244 0 10.044 2.9 12.502 7.479z"
      fill="currentColor"
      fillRule="nonzero"
    />
  </svg>
);

const BadgeTemplate = styled.div`
  border-radius: 2em;
  color: white;
  min-width: 1.5em;
  font-weight: bold;
  line-height: 0.75em;
`;

const Badge = styled(BadgeTemplate)`
  position: absolute;
  right: -30%;
  top: 10%;
  font-size: 100%;
  padding: 0.4em;
  background: ${process.env.REACT_APP_ACCENT_COLOR};
  text-align: center;
  min-width: 1.5em;
  font-weight: bold;
`;

const BadgeAfter = styled(BadgeTemplate)`
  position: relative;
  font-size: 75%;
  width: 10px;
  padding: 0.4em 0.3em;
  border-radius: 2em;
  background: ${process.env.REACT_APP_ACCENT_COLOR};
  text-align: center;
`;

export { ModalMessage, FullScreen, Badge, BadgeAfter };
