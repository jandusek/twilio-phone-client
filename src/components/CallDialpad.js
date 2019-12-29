import React, { Component } from 'react';
import styled from 'styled-components';

class Dial extends Component {
  constructor(props) {
    super(props);
    this.tid = 0;
    this.suppressClick = false;
    this.toggleOn = this.toggleOn.bind(this);
    this.toggleOff = this.toggleOff.bind(this);
    this.pressAndHold = this.pressAndHold.bind(this);
    this.dialPress = this.dialPress.bind(this);
  }

  toggleOn() {
    if (this.props.digit === "0" && this.tid === 0) {
      this.tid = setInterval(this.pressAndHold, 600);
    }
  }

  toggleOff() {
    if (this.tid !== 0) {
      clearInterval(this.tid);
      this.tid = 0;
    }
  }

  pressAndHold() {
    this.suppressClick = true;
    clearInterval(this.tid);
    this.tid = 0;
    if (this.props.digit === "0") {
      this.props.dialPressed(this.props.sub);
    }
  }

  dialPress() {
    if (!this.suppressClick) {
      this.props.dialPressed(this.props.digit);
    }
    this.suppressClick = false;
  }

  render() {
    return <BtnDial
      onClick={this.dialPress}
      onMouseDown={this.toggleOn}
      onMouseUp={this.toggleOff}
      theme={this.props.theme}
      {...this.props}
    >
      <Digit>{this.props.digit}</Digit><br /><Sub>{this.props.sub}</Sub>
    </BtnDial>;
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

  return <Dialpad>
    {dials.map((dial) => {
      return <Dial key={dial[0]} digit={dial[0]} sub={dial[1]} {...props} dialActive={props.dialActive[dial[0]]} />
    })}
    {props.callActive ?
      [
        <Spacer key="Lspacer" />,
        <BtnDialRed {...props} key="RedDial"
          onClick={props.dialPressed.bind(null, "Hangup")}
        >
          <DialRed></DialRed>
        </BtnDialRed>,
        <BtnDial key="MuteDial"
          toggled={props.muted}
          theme={props.theme}
          onClick={props.dialPressed.bind(null, "ToggleMute")}
        >
          {props.muted ? <Unmute /> : <Mute />}
        </BtnDial>
      ] : [
        <Spacer key="Lspacer" />,
        <BtnDialGreen key="GreenDIal" {...props}
          onClick={props.dialPressed.bind(null, "Enter")}
          dialActive={props.dialActive['Enter']}
        >
          <DialGreen></DialGreen>
        </BtnDialGreen>,
        <Spacer {...props} key="Rspacer"
          onClick={props.dialPressed.bind(null, "Backspace")}
          dialActive={props.dialActive['Backspace']}>
          <SvgBackspace style={{ cursor: "pointer" }} />
        </Spacer>
      ]
    }
  </Dialpad>;
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
  padding-top:5.5vmin;
  @media (min-width: 400px) {
    width: 320px;
    padding-top:22px;
  }
`;

const BtnDial = styled.button`
  width: 20vmin;
  height: 20vmin;
  margin: 2vmin 3vmin 2vmin 3vmin;
  @media (min-width: 400px) {
    width: 80px;
    height: 80px;
    margin: 8px 12px 8px 12px;
  }
  border: none;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  border-radius: 50%;
  outline: none;
  cursor: pointer;
  text-align: center;
  color: ${props => props.toggled ? props.theme.colorToggled : props.theme.color};
  background-color: ${props => props.toggled ? props.theme.dialToggled : (props.dialActive ? props.theme.dialActive : props.theme.dial)};
  &:hover {
    background-color: ${props => props.theme.dialActive};
  }
`;

const BtnDialGreen = styled(BtnDial)`
  background-color: ${props => props.dialActive ? props.theme.dialGreenActive : props.theme.dialGreen};
  &:hover {
    background-color: ${props => props.theme.dialGreenActive};
  }
`;

const BtnDialRed = styled(BtnDial)`
  background-color: ${props => props.theme.dialRed};
  &:hover {
    background-color: ${props => props.theme.dialRedActive};
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
  color: ${props => (props.dialActive ? props.theme.dialActive : props.theme.dial)};
  &:hover {
    color: ${props => props.theme.dialActive};
  }
`;

const SvgPhone = props => (
  <svg
    viewBox="0 0 50 50"
    fillRule="evenodd"
    clipRule="evenodd"
    strokeLinejoin="round"
    strokeMiterlimit={1.414}
    {...props}
  >
    <path
      d="M46.996 39.736c0 1.15-.511 3.387-.99 4.443-.671 1.566-2.461 2.589-3.899 3.387-1.885 1.022-3.802 1.63-5.943 1.63-2.972 0-5.658-1.215-8.374-2.205-1.949-.704-3.835-1.567-5.592-2.653-5.433-3.356-11.984-9.908-15.34-15.34-1.086-1.757-1.949-3.643-2.653-5.592C3.215 20.69 2 18.004 2 15.032c0-2.141.607-4.058 1.63-5.944.8-1.437 1.823-3.227 3.387-3.898 1.056-.479 3.291-.99 4.443-.99.223 0 .448 0 .671.096.671.223 1.374 1.79 1.693 2.43 1.023 1.822 2.013 3.676 3.068 5.465.512.831 1.471 1.853 1.471 2.845 0 1.95-5.784 4.795-5.784 6.519 0 .863.799 1.982 1.245 2.749 3.228 5.817 7.255 9.844 13.072 13.072.767.448 1.886 1.245 2.749 1.245 1.726 0 4.569-5.784 6.519-5.784.99 0 2.012.959 2.845 1.471 1.789 1.055 3.643 2.045 5.465 3.068.64.319 2.205 1.022 2.43 1.693.096.223.096.448.096.671l-.004-.004z"
      fill="#fff"
      fillRule="nonzero"
      stroke="#fff"
      strokeWidth={1.5}
    />
  </svg>
);

const DialGreen = styled(SvgPhone)`
  height: 9vmin;
  width: 9vmin;
  @media (min-width: 400px) {
    width: 36px;
    height: 36px;
  }
`;

const SvgHangup = props => (
  <svg
    viewBox="0 0 50 50"
    fillRule="evenodd"
    clipRule="evenodd"
    strokeLinejoin="round"
    strokeMiterlimit={1.414}
    {...props}
  >
    <path
      d="M5.455 33.309c-.632-.633-1.581-2.145-1.898-2.989-.492-1.23-.069-2.777.283-4.007.475-1.598 1.196-2.987 2.374-4.164 1.635-1.634 3.781-2.442 5.819-3.39 1.46-.685 2.972-1.247 4.535-1.615 4.835-1.14 12.041-1.137 16.874.006 1.563.37 3.075.933 4.533 1.619 2.038.95 4.183 1.759 5.817 3.395 1.177 1.178 1.897 2.566 2.371 4.166.35 1.23.771 2.778.28 4.007-.318.844-1.267 2.354-1.901 2.987-.122.123-.246.246-.421.316-.492.246-1.74-.229-2.268-.406-1.564-.44-3.128-.916-4.692-1.32-.739-.176-1.828-.211-2.374-.757-1.072-1.073.547-5.818-.401-6.766-.475-.475-1.529-.652-2.196-.828-4.974-1.426-9.404-1.428-14.379-.006-.668.175-1.722.352-2.197.826-.949.949.666 5.695-.407 6.767-.544.544-1.634.578-2.374.754-1.564.403-3.128.878-4.693 1.317-.528.176-1.775.65-2.268.404-.175-.07-.299-.193-.422-.316h.005z"
      fill="#fff"
      fillRule="nonzero"
      stroke="#fff"
      strokeWidth={1.17}
    />
  </svg>
);

const DialRed = styled(SvgHangup)`
  height: 10vmin;
  width: 10vmin;
  @media (min-width: 400px) {
    width: 40px;
    height: 40px;
  }
`;

const SvgBackspace = props => (
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

const SvgMute = props => (
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
  background-color: ${props => props.theme.dialRedActive};
  &:hover {
    background-color: ${props => props.theme.dial};
  }
`;

export default CallDialpad;