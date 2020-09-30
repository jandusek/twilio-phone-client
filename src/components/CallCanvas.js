import React, { Component } from 'react';
import update from 'immutability-helper';
import styled from 'styled-components';
import {
  BtnDialRed,
  BtnDialGreen,
  DialRed,
  DialGreen
} from './CallDialpadComponents';

import { AsYouType } from 'libphonenumber-js';

import CallDialpad from './CallDialpad';

export default class CanvasMsg extends Component {
  constructor(props) {
    super(props);
    this.asYouType = new AsYouType('US');

    this.nextKeyReset = false;
    this.startTime = null;
    this.connection = null;
    this.timer = null;

    let dialActive = {};
    [
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '*',
      '#',
      'Backspace',
      'Enter'
    ].forEach((key) => {
      dialActive[key] = false;
    });

    this.state = {
      display: '', // phone number after formatting
      elapsedTime: null,
      dialActive,
      clientStatus: 'offline',
      incomingRing: false,
      incomingConnection: null
    };
    this.dialPressed = this.dialPressed.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.updateDisplay = this.updateDisplay.bind(this);
    this.formatNumber = this.formatNumber.bind(this);
    this.focusDisplay = this.focusDisplay.bind(this);
    this.dialFakeReset = this.dialFakeReset.bind(this);
    this.dialFakePressed = this.dialFakePressed.bind(this);
    this.connectCall = this.connectCall.bind(this);
    this.hangupCall = this.hangupCall.bind(this);
    this.wrapupCall = this.wrapupCall.bind(this);
    this.tick = this.tick.bind(this);
    this.bindListeners = this.bindListeners.bind(this);
    this.acceptIncomingCall = this.acceptIncomingCall.bind(this);
    this.rejectIncomingCall = this.rejectIncomingCall.bind(this);

    this.numberInputRef = React.createRef();

    this.handlersSet = false;

    this.theme = {
      color: '#222222',
      colorToggled: '#FFFFFF',
      dial: '#E8E8E8',
      dialActive: '#94979B',
      dialToggled: '#6f7174',
      dialGreen: '#36D576',
      dialGreenActive: '#289f58',
      dialRed: '#F22F46',
      dialRedActive: '#B52334'
    };
  }

  runPressEvents(digit) {
    if (digit === 'Enter') {
      this.connectCall();
    } else if (digit === 'Backspace') {
      return;
    } else if (digit === 'Hangup') {
      this.hangupCall();
    } else if (digit === 'ToggleMute') {
      this.toggleMute();
    } else {
      // send DTMF
      if (
        this.props.client.activeConnection() &&
        '0123456789#*'.includes(digit)
      ) {
        this.props.client.activeConnection().sendDigits(digit);
      }
    }
  }

  connectCall() {
    if (this.props.client.status() !== 'ready') {
      console.error('Client is not ready (' + this.props.client.status() + ')');
      return;
    }
    console.log('Dialing', this.state.display);
    this.connection = this.props.client.connect({ number: this.state.display });
    this.nextKeyReset = true;
    /*this.connection.on('volume', (inputVolume, outputVolume) => {
      console.log('Vol:', inputVolume, outputVolume);
    });*/
    this.connection.on('disconnect', this.wrapupCall); // ToDo: try to remove this and only work with Device events?
    this.startTime = new Date();
    this.timer = setTimeout(this.tick, 1000);
  }

  tick() {
    const now = new Date();
    this.setState({ elapsedTime: now - this.startTime });
    this.timer = setTimeout(this.tick, 1000 - (now % 1000));
  }

  showTime(milis) {
    const date = new Date(null);
    date.setMilliseconds(milis);
    if (milis) {
      return (
        (date.getUTCHours() > 0 ? date.getUTCHours() + ':' : '') +
        date.toISOString().substr(14, 5)
      );
    } else {
      return '';
    }
  }

  hangupCall() {
    this.props.client.disconnectAll();
  }

  wrapupCall() {
    clearTimeout(this.timer);
    this.setState({ elapsedTime: null, display: '' });
    this.startTime = null;
  }

  toggleMute() {
    this.connection.mute(!this.connection.isMuted());
  }

  dialPressed(dial) {
    let _display = this.state.display;
    // reset display (e.g. after call is placed)
    if (this.nextKeyReset) {
      this.setState({ display: '' });
      _display = '';
      this.nextKeyReset = false;
    }
    if (dial.match(/^[0-9]$/)) {
      this.updateDisplay(_display + dial);
    } else if (dial === 'Backspace') {
      if (_display.charAt(_display.length - 1) === ')') {
        this.updateDisplay(_display.substr(0, _display.length - 2));
      } else {
        this.updateDisplay(_display.substr(0, _display.length - 1));
      }
    } else if (dial === '+') {
      if (_display === '') {
        this.updateDisplay('+');
      }
    }
    this.numberInputRef.current.focus();
    this.runPressEvents(dial);
  }

  handleKeyUp(e) {
    this.dialFakeReset(e.key);
  }

  dialFakeReset(dial) {
    if (this.state.dialActive[dial] !== undefined) {
      this.setState({
        dialActive: update(this.state.dialActive, { [dial]: { $set: false } })
      });
    }
  }

  dialFakePressed(dial) {
    if (this.state.dialActive[dial] !== undefined) {
      this.setState({
        dialActive: update(this.state.dialActive, { [dial]: { $set: true } })
      });
    }
    this.runPressEvents(dial);
    // sometimes if multiple keys are pressed simultaneously, keyUp event doesn't fire so clean by timeout
    setTimeout(this.dialFakeReset.bind(null, dial), 300);
  }

  handleKeyDown(e) {
    // handle edge-case when backspace is pressed right after ')' (which would delete that char, but not the digit before it)
    if (
      e.key === 'Backspace' &&
      e.target.value.charAt(e.target.selectionStart - 1) === ')'
    ) {
      let display = this.state.display;
      display = display.substr(0, display.length - 1);
      this.setState({ display });
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const allowedKeys = [
      '+',
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '*',
      '#',
      'Backspace',
      'Enter'
    ];
    if (!allowedKeys.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
    } else {
      // reset display (e.g. after call is placed)
      if (this.nextKeyReset) {
        this.setState({ display: '' });
        this.nextKeyReset = false;
      }
      // simulate events as if a real dial was pressed
      this.dialFakePressed(e.key);
    }
  }

  moveCaretToEnd(e) {
    e.target.selectionStart = e.target.value.length;
    e.target.selectionEnd = e.target.value.length;
  }

  handleChange(e) {
    this.updateDisplay(e.target.value);
  }

  formatNumber(number) {
    this.asYouType.reset();
    const result = this.asYouType.input(number);
    return result === '' ? number : result;
  }

  updateDisplay(newValue) {
    this.asYouType.reset();
    const result = this.asYouType.input(newValue);
    if (result !== '') {
      this.setState({ display: result });
    } else {
      this.setState({ display: newValue });
    }
  }

  focusDisplay() {
    if (this.numberInputRef.current) {
      this.numberInputRef.current.focus();
    }
  }

  componentWillUnmount() {
    this.props.client.removeAllListeners('incoming');
    this.props.client.removeAllListeners('connect');
    this.props.client.removeAllListeners('ready');
    this.props.client.removeAllListeners('disconnect');
  }

  bindListeners() {
    if (this.props.client && !this.handlersSet) {
      this.props.client.on('connect', (conn) => {
        console.log('CC: CONNECT event fired');
      });

      this.props.client.on('disconnect', (conn) => {
        console.log('CC: DISCONNECT event fired');
        this.wrapupCall();
      });

      this.handlersSet = true;
    }
  }

  componentDidMount() {
    this.bindListeners();
  }

  componentDidUpdate(prevProps, prevState) {
    this.bindListeners();
    if (
      this.props.client &&
      this.props.client.status() !== prevState.clientStatus
    ) {
      this.setState({ clientStatus: this.props.client.status() });
    }
    this.focusDisplay();
  }

  acceptIncomingCall(conn) {
    if (conn) {
      conn.accept();
      this.updateDisplay(conn.parameters.From);
      this.nextKeyReset = true;
      this.startTime = new Date();
      this.timer = setTimeout(this.tick, 1000);
    } else {
      console.error('No incoming connection found');
    }
  }

  rejectIncomingCall(conn) {
    if (conn) {
      conn.reject();
    } else {
      console.error('No incoming connection found');
    }
  }

  render() {
    if (!this.props.client || this.props.client.status() === 'offline') {
      return (
        <Canvas>
          <Centerer>
            <div
              style={{
                width: '50vw',
                maxWidth: '100px'
              }}
            >
              <SvgOffline />
            </div>
            <span style={{ color: '#565B73', padding: '2vh' }}>
              Voice client is offline
            </span>
          </Centerer>
        </Canvas>
      );
    } else if (this.props.incomingCall !== null) {
      console.log('connection:', this.props.incomingCall);
      console.log('status:', this.props.incomingCall.status());
      return (
        <Canvas>
          <Label1>Incoming call from</Label1>
          <Label2>
            {this.formatNumber(this.props.incomingCall.parameters.From)}
          </Label2>
          <IncomingDials>
            <BtnDialRed
              theme={this.theme}
              key="RedDial"
              onClick={this.rejectIncomingCall.bind(
                null,
                this.props.incomingCall
              )}
            >
              <DialRed></DialRed>
            </BtnDialRed>
            <BtnDialGreen
              theme={this.theme}
              key="GreenDial"
              onClick={this.acceptIncomingCall.bind(
                null,
                this.props.incomingCall
              )}
            >
              <DialGreen></DialGreen>
            </BtnDialGreen>
          </IncomingDials>
        </Canvas>
      );
    } else {
      return (
        <Canvas>
          <Display
            value={this.state.display}
            onKeyDown={this.handleKeyDown}
            onKeyUp={this.handleKeyUp}
            onChange={this.handleChange}
            onFocus={this.moveCaretToEnd}
            onClick={this.moveCaretToEnd}
            onBlur={this.focusDisplay}
            ref={this.numberInputRef}
          />
          <Timer time={this.showTime(this.state.elapsedTime)} />
          <CallDialpad
            dialPressed={this.dialPressed}
            dialActive={this.state.dialActive}
            theme={this.theme}
            callActive={this.props.client.activeConnection() !== undefined}
            muted={this.connection ? this.connection.isMuted() : false}
          />
        </Canvas>
      );
    }
  }
}

const TimerDisplay = styled.div`
  font-size: 4vmin;
  height: 4vmin;
  padding: 2vmin;
  @media (min-width: 400px) {
    font-size: 16px;
    height: 16px;
    padding: 8px;
  }
`;

function Timer(props) {
  return <TimerDisplay>{props.time}</TimerDisplay>;
}

const Canvas = styled.div`
  flex-grow: 1;

  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
  height: 100vh;
  max-width: 440px;
  position: relative;
  overflow-x: hidden;

  padding-left: 12px;
  padding-right: 12px;
`;

const Display = styled.input`
  outline: none;
  margin-top: 10vmin;
  border-radius: 10px;
  height: 10vmin;
  width: 66vmin;
  font-size: 8vmin;
  text-align: center;
  padding: 0.5vmin 3vmin 0.5vmin 3vmin;
  @media (min-width: 400px) {
    margin-top: 40px;
    height: 40px;
    width: 264px;
    font-size: 32px;
    padding: 2px 12px 2px 12px;
  }
  border: 0;
  background: #e8e8e8;
  color: transparent;
  text-shadow: 0 0 0 #222222;
  &:focus {
    outline: none;
  }
`;

const Label1 = styled.div`
  outline: none;
  margin-top: 10vmin;
  border-radius: 10px;
  height: 6vmin;
  width: 66vmin;
  font-size: 4vmin;
  text-align: center;
  padding: 20vmin 3vmin 0.5vmin 3vmin;
  @media (min-width: 400px) {
    margin-top: 40px;
    height: 24px;
    width: 264px;
    font-size: 16px;
    padding: 80px 12px 2px 12px;
  }
  border: 0;
  &:focus {
    outline: none;
  }
`;

const Label2 = styled.div`
  outline: none;
  height: 10vmin;
  width: 66vmin;
  font-size: 8vmin;
  text-align: center;
  padding: 1vmin 3vmin 0.5vmin 3vmin;
  @media (min-width: 400px) {
    height: 40px;
    width: 264px;
    font-size: 32px;
    padding: 4px 12px 2px 12px;
  }
  border: 0;
  &:focus {
    outline: none;
  }
`;

const IncomingDials = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  position: relative;
  width: 80vmin;
  margin-top: 83vmin;
  justify-items: center;
  @media (min-width: 400px) {
    width: 320px;
    margin-top: 332px;
  }
`;

const Centerer = styled.div`
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
    {...props}
  >
    <path
      d="M200 106.833c0 22.087-17.92 40-40 40H46.667C20.94 146.833 0 125.893 0 100.167 0 81.52 11.04 65.373 26.873 57.98c-.106-1.46-.206-3.02-.206-4.48C26.667 24.02 50.52.167 80 .167c22.293 0 41.353 13.646 49.373 33.126 4.587-4.06 10.627-6.46 17.294-6.46 14.686 0 26.666 11.98 26.666 26.667 0 5.313-1.56 10.207-4.273 14.373 17.707 4.167 30.94 20 30.94 38.96z"
      fill="#bebebe"
    />
    <path
      d="M140.788 113.306a6.97 6.97 0 01-2.022 4.902l-9.807 9.807a6.999 6.999 0 01-4.902 2.021c-1.8 0-3.604-.719-4.901-2.021l-21.202-21.202-21.203 21.202a6.996 6.996 0 01-4.901 2.021c-1.8 0-3.605-.719-4.902-2.021l-9.807-9.807a7 7 0 01-2.022-4.902c0-1.8.72-3.604 2.022-4.901l21.202-21.203L57.141 66a7 7 0 01-2.022-4.902c0-1.799.72-3.604 2.022-4.901l9.807-9.807a7 7 0 014.902-2.022c1.8 0 3.604.72 4.901 2.022l21.203 21.202 21.202-21.202a6.997 6.997 0 014.901-2.022c1.8 0 3.605.72 4.902 2.022l9.807 9.807a7 7 0 012.022 4.901c0 1.8-.72 3.605-2.022 4.902l-21.202 21.202 21.202 21.203a6.997 6.997 0 012.022 4.901z"
      fill="#bebebe"
    />
    <path
      d="M140.788 113.306a6.97 6.97 0 01-2.022 4.902l-9.807 9.807a6.999 6.999 0 01-4.902 2.021c-1.8 0-3.604-.719-4.901-2.021l-21.202-21.202-21.203 21.202a6.996 6.996 0 01-4.901 2.021c-1.8 0-3.605-.719-4.902-2.021l-9.807-9.807a7 7 0 01-2.022-4.902c0-1.8.72-3.604 2.022-4.901l21.202-21.203L57.141 66a7 7 0 01-2.022-4.902c0-1.799.72-3.604 2.022-4.901l9.807-9.807a7 7 0 014.902-2.022c1.8 0 3.604.72 4.901 2.022l21.203 21.202 21.202-21.202a6.997 6.997 0 014.901-2.022c1.8 0 3.605.72 4.902 2.022l9.807 9.807a7 7 0 012.022 4.901c0 1.8-.72 3.605-2.022 4.902l-21.202 21.202 21.202 21.203a6.997 6.997 0 012.022 4.901z"
      fill="#fff"
    />
  </svg>
);
