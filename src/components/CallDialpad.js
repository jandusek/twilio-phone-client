import React, { Component } from 'react';
import styled from 'styled-components';
import {
  BtnDial,
  BtnDialRed,
  BtnDialGreen,
  DialRed,
  DialGreen
} from './CallDialpadComponents';

class Dial extends Component {
  constructor(props) {
    super(props);
    this.tid = 0;
    this.suppressClick = false;
  }

  toggleOn = () => {
    if (this.props.digit === '0' && this.tid === 0) {
      this.tid = setInterval(this.pressAndHold, 600);
    }
  };

  toggleOff = () => {
    if (this.tid !== 0) {
      clearInterval(this.tid);
      this.tid = 0;
    }
  };

  pressAndHold = () => {
    this.suppressClick = true;
    clearInterval(this.tid);
    this.tid = 0;
    if (this.props.digit === '0') {
      this.props.dialPressed(this.props.sub);
    }
  };

  dialPress = () => {
    if (!this.suppressClick) {
      this.props.dialPressed(this.props.digit);
    }
    this.suppressClick = false;
  };

  componentWillUnmount() {
    clearInterval(this.tid);
  }

  render() {
    return (
      <BtnDial
        onClick={this.dialPress}
        onMouseDown={this.toggleOn}
        onMouseUp={this.toggleOff}
        theme={this.props.theme}
        {...this.props}
      >
        <Digit>{this.props.digit}</Digit>
        <br />
        <Sub>{this.props.sub}</Sub>
      </BtnDial>
    );
  }
}

function CallDialpad(props) {
  const dials = [
    ['1', '\u00A0'],
    ['2', 'ABC'],
    ['3', 'DEF'],
    ['4', 'GHI'],
    ['5', 'JKL'],
    ['6', 'MNO'],
    ['7', 'PQRS'],
    ['8', 'TUV'],
    ['9', 'WXYZ'],
    ['*', ''],
    ['0', '+'],
    ['#', '']
  ];

  return (
    <Dialpad>
      {dials.map((dial) => {
        return (
          <Dial
            key={dial[0]}
            digit={dial[0]}
            sub={dial[1]}
            {...props}
            dialActive={props.dialActive[dial[0]]}
          />
        );
      })}
      {props.callActive
        ? [
            <Spacer key="Lspacer" />,
            <BtnDialRed
              {...props}
              key="RedDial"
              onClick={props.dialPressed.bind(null, 'Hangup')}
            >
              <DialRed></DialRed>
            </BtnDialRed>,
            <BtnDial
              key="MuteDial"
              toggled={props.muted}
              theme={props.theme}
              onClick={props.dialPressed.bind(null, 'ToggleMute')}
            >
              {props.muted ? <Unmute /> : <Mute />}
            </BtnDial>
          ]
        : [
            <Spacer key="Lspacer" />,
            <BtnDialGreen
              key="GreenDIal"
              {...props}
              onClick={props.dialPressed.bind(null, 'Enter')}
              dialActive={props.dialActive['Enter']}
            >
              <DialGreen></DialGreen>
            </BtnDialGreen>,
            <Spacer
              {...props}
              key="Rspacer"
              onClick={props.dialPressed.bind(null, 'Backspace')}
              dialActive={props.dialActive['Backspace']}
            >
              <SvgBackspace style={{ cursor: 'pointer' }} />
            </Spacer>
          ]}
    </Dialpad>
  );
}

const Digit = styled.span`
  font-size: 8vmin;
  @media (min-width: 400px) {
    font-size: 32px;
  }
  font-weight: 600;
`;

const Sub = styled.span`
  font-size: 3vmin;
  letter-spacing: 0.5vmin;
  @media (min-width: 400px) {
    font-size: 12px;
    letter-spacing: 2px;
  }
  font-weight: 500;
`;

const Dialpad = styled.div`
  display: grid;
  grid-template-columns: auto auto auto;
  position: relative;
  width: 80vmin;
  padding-top: 5.5vmin;
  @media (min-width: 400px) {
    width: 320px;
    padding-top: 22px;
  }
`;

const Spacer = styled.div`
  width: 20vmin;
  height: 20vmin;
  margin: 2vmin 3vmin 2vmin 3vmin;
  @media (min-width: 400px) {
    width: 80px;
    height: 80px;
    margin: 8px 12px 8px 12px;
  }
  color: ${(props) =>
    props.dialActive ? props.theme.dialActive : props.theme.dial};
  &:hover {
    color: ${(props) => props.theme.dialActive};
  }
`;

const SvgBackspace = (props) => (
  <svg
    viewBox="0 0 50 50"
    fillRule="evenodd"
    clipRule="evenodd"
    strokeLinecap="round"
    strokeMiterlimit={5}
    {...props}
  >
    <path
      d="M35.714 15.429c1.1 0 1.991.891 1.991 1.99v15.172c0 .525-.209 1.029-.581 1.4-.371.372-.875.58-1.4.58H18.77a2.032 2.032 0 01-1.602-.781l-6.639-8.491a.486.486 0 010-.598l6.658-8.516a1.97 1.97 0 011.552-.756h16.975z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={1.5}
    />
    <path
      d="M21.318 29.918a.6.6 0 010-.848l3.646-3.646a.601.601 0 000-.848l-3.646-3.646a.6.6 0 010-.848l.275-.275a.6.6 0 01.849 0l3.645 3.645a.6.6 0 00.849 0l3.665-3.664a.57.57 0 01.81 0l.295.295a.598.598 0 010 .846l-3.647 3.647a.6.6 0 000 .848l3.646 3.646a.6.6 0 010 .848l-.275.275a.6.6 0 01-.849 0l-3.645-3.645a.599.599 0 00-.849 0l-3.645 3.645a.6.6 0 01-.849 0l-.275-.275z"
      fill="#222"
    />
  </svg>
);

const SvgMute = (props) => (
  <svg
    viewBox="0 0 50 50"
    fillRule="evenodd"
    clipRule="evenodd"
    strokeLinejoin="round"
    strokeMiterlimit={2}
    {...props}
  >
    <path
      d="M13.29 28.057l-2.731 2.731A15.23 15.23 0 019.424 25v-3.462c0-.946.784-1.73 1.731-1.73.946 0 1.73.784 1.73 1.73V25c0 1.054.163 2.082.405 3.057zm30.128-16.282l-9.763 9.763V25c0 4.76-3.895 8.654-8.654 8.654a8.87 8.87 0 01-2.948-.514l-2.596 2.596a11.942 11.942 0 005.544 1.379c6.679 0 12.115-5.436 12.115-12.115v-3.462c0-.946.784-1.73 1.731-1.73.947 0 1.731.784 1.731 1.73V25c0 8.005-6.058 14.603-13.846 15.468v3.57h6.923c.946 0 1.73.785 1.73 1.731 0 .947-.784 1.731-1.73 1.731H16.347a1.743 1.743 0 01-1.731-1.731c0-.947.784-1.731 1.731-1.731h6.923v-3.57a15.236 15.236 0 01-6.355-2.191l-6.87 6.869a.865.865 0 01-1.244 0l-2.217-2.217a.865.865 0 010-1.244L39.955 8.314a.865.865 0 011.244 0l2.217 2.217a.865.865 0 010 1.244h.002zM33.141 8.206L16.347 25V11.154c0-4.76 3.894-8.654 8.654-8.654 3.731 0 6.923 2.408 8.14 5.706z"
      fill="currentColor"
      fillRule="nonzero"
    />
  </svg>
);

const Mute = styled(SvgMute)`
  height: 10vmin;
  width: 10vmin;
  @media (min-width: 400px) {
    width: 40px;
    height: 40px;
  }
`;

const Unmute = styled(SvgMute)`
  height: 10vmin;
  width: 10vmin;
  @media (min-width: 400px) {
    width: 40px;
    height: 40px;
  }
  background-color: ${(props) => props.theme.dialRedActive};
  &:hover {
    background-color: ${(props) => props.theme.dial};
  }
`;

export default CallDialpad;
