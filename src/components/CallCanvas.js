import React, { Component } from 'react';
import update from 'immutability-helper';
import styled from 'styled-components';

import { AsYouType } from 'libphonenumber-js'

import CallDialpad from './CallDialpad';

export default class CanvasMsg extends Component {
  constructor(props) {
    super(props);
    this.asYouType = new AsYouType('US')

    this.nextKeyReset = false;
    this.startTime = null;
    this.connection = null;
    this.timer = null;

    let dialActive = {};
    ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '#', 'Backspace', 'Enter'].forEach(
      key => {
        dialActive[key] = false;
      }
    );

    this.state = {
      display: "",  // phone number after formatting
      callActive: false,
      muted: false,
      elapsedTime: null,
      dialActive
    }
    this.dialPressed = this.dialPressed.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.updateDisplay = this.updateDisplay.bind(this);
    this.focusDisplay = this.focusDisplay.bind(this);
    this.dialFakeReset = this.dialFakeReset.bind(this);
    this.dialFakePressed = this.dialFakePressed.bind(this);
    this.connectCall = this.connectCall.bind(this);
    this.hangupCall = this.hangupCall.bind(this);
    this.wrapupCall = this.wrapupCall.bind(this);
    this.tick = this.tick.bind(this);

    this.numberInputRef = React.createRef();

    this.handlersSet = false;

    this.theme = {
      color: "#222222",
      colorToggled: "#FFFFFF",
      dial: "#E8E8E8",
      dialActive: "#94979B",
      dialToggled: "#6f7174",
      dialGreen: "#36D576",
      dialGreenActive: "#289f58",
      dialRed: "#F22F46",
      dialRedActive: "#B52334"
    };
  }

  runPressEvents(digit) {
    if (digit === "Enter") {
      this.connectCall();
    } else if (digit === "Backspace") {
      return;
    } else if (digit === "Hangup") {
      this.hangupCall();
    } else if (digit === "ToggleMute") {
      this.toggleMute();
    } else { // send DTMF
      if (this.state.callActive && this.connection && "0123456789#*".includes(digit)) {
        this.connection.sendDigits(digit);
      }
    }
  }

  connectCall() {
    if (this.props.client.status() !== "ready") {
      console.error("Client is not ready (" + this.props.client.status() + ")");
      return;
    }
    console.log("Dialing", this.state.display);
    this.connection = this.props.client.connect({ number: this.state.display });
    this.setState({ callActive: true, muted: false });
    this.nextKeyReset = true;
    /*this.connection.on('volume', (inputVolume, outputVolume) => {
      console.log(inputVolume, outputVolume);
    })*/
    this.connection.on('disconnect', this.wrapupCall);
    this.startTime = new Date();
    this.timer = setTimeout(this.tick, 1000);
  }

  tick() {
    const now = new Date();
    this.setState({ elapsedTime: now - this.startTime });
    this.timer = setTimeout(this.tick, 1000 - now % 1000);
  }

  showTime(milis) {
    const date = new Date(null);
    date.setMilliseconds(milis);
    if (milis) {
      return (date.getUTCHours() > 0 ? date.getUTCHours() + ":" : "") + date.toISOString().substr(14, 5);
    } else {
      return "";
    }
  }

  hangupCall() {
    this.props.client.disconnectAll();
  }

  wrapupCall() {
    clearTimeout(this.timer);
    this.setState({ elapsedTime: null, display: "" });
    this.startTime = null;
  }

  toggleMute() {
    const newMuted = !this.state.muted;
    this.setState({ muted: newMuted })
    console.log("Mute:", newMuted);
    this.connection.mute(newMuted);
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
    } else if (dial === "Backspace") {
      if (_display.charAt(_display.length - 1) === ")") {
        this.updateDisplay(_display.substr(0, _display.length - 2));
      } else {
        this.updateDisplay(_display.substr(0, _display.length - 1));
      }
    } else if (dial === "+") {
      if (_display === "") {
        this.updateDisplay("+");
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
    if (e.key === "Backspace" && (
      e.target.value.charAt(e.target.selectionStart - 1) === ")"
    )) {
      let display = this.state.display;
      display = display.substr(0, display.length - 1);
      this.setState({ display });
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const allowedKeys = [
      '+', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '#', 'Backspace', 'Enter'
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

  updateDisplay(newValue) {
    this.asYouType.reset();
    const result = this.asYouType.input(newValue);
    if (result !== "") {
      this.setState({ display: result });
    } else {
      this.setState({ display: newValue });
    }
  }

  focusDisplay() {
    this.numberInputRef.current.focus();
  }

  componentWillUnmount() {
    this.props.client.removeAllListeners('connect');
    this.props.client.removeAllListeners('disconnect');
  }

  componentDidUpdate() {
    if (this.props.client && !this.handlersSet) {
      this.props.client.on('connect', (conn) => {
        console.log("CONNECT event fired");
      });

      this.props.client.on('disconnect', (conn) => {
        console.log("DISCONNECT event fired");
        this.setState({ callActive: false });
      });
      this.handlersSet = true;
    }
    this.focusDisplay();
  }

  render() {
    return <Canvas>
      <Display
        value={this.state.display}
        onKeyDown={this.handleKeyDown}
        onKeyUp={this.handleKeyUp}
        onChange={this.handleChange}
        onFocus={this.moveCaretToEnd}
        onClick={this.moveCaretToEnd}
        onBlur={this.focusDisplay}
        ref={this.numberInputRef} />
      <Timer time={this.showTime(this.state.elapsedTime)} />
      <CallDialpad
        dialPressed={this.dialPressed}
        dialActive={this.state.dialActive}
        theme={this.theme}
        callActive={this.state.callActive}
        muted={this.state.muted}
      />
    </Canvas>;
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
  background: #E8E8E8;
  color: transparent;
  text-shadow: 0 0 0 #222222;
  &:focus {
      outline: none;
  }
`;
