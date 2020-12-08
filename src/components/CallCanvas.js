import React, { Component } from 'react';
import update from 'immutability-helper';
import styled from 'styled-components';
import {
  BtnDialRed,
  BtnDialGreen,
  DialRed,
  DialGreen
} from './CallDialpadComponents';
import { ModalMessage } from './CommonComponents';

import { AsYouType } from 'libphonenumber-js';

import CallDialpad from './CallDialpad';

export default class CanvasMsg extends Component {
  constructor(props) {
    super(props);
    this.asYouType = new AsYouType('US');
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
      elapsedTime: null,
      dialActive,
      isMuted: false,
      incomingRing: false,
      incomingConnection: null
    };

    this.numberInputRef = React.createRef();
    this.disconnectHandler = (connection) => {
      console.log('CC: DISCONNECT event fired');
      this.wrapupCall();
    };
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

  /**
   * Outbound call
   */
  connectCall = () => {
    if (this.props.client.status() !== 'ready') {
      console.error('Client is not ready (' + this.props.client.status() + ')');
      return;
    }
    console.log('Dialing', this.props.callDisplay);
    this.props.setCallConnection(
      this.props.client.connect({
        number: this.props.callDisplay
      })
    );
    console.log('connected');
    this.props.getCallConnection().on('mute', (isMuted) => {
      this.setState({ isMuted });
    });
    this.props.setCallTypingPN(false);
    this.props.setCallNextKeyReset(true);
    this.props.setCallStartTime(new Date());
    this.timer = setTimeout(this.tick, 1000);
  };

  tick = () => {
    const now = new Date();
    this.setState({ elapsedTime: now - this.props.getCallStartTime() });
    this.timer = setTimeout(this.tick, 1000 - (now % 1000));
  };

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

  hangupCall = () => {
    this.props.client.disconnectAll();
  };

  /**
   * Cleanup after a call has ended
   */
  wrapupCall = () => {
    clearTimeout(this.timer);
    this.setState({ elapsedTime: null, isMuted: false });
    // Destroy any pending connection listeners
    if (this.props.getCallConnection()) {
      this.props.getCallConnection().removeAllListeners('mute');
    }
  };

  toggleMute = () => {
    this.props
      .getCallConnection()
      .mute(!this.props.getCallConnection().isMuted());
  };

  dialPressed = (dial) => {
    let _display = this.props.callDisplay;
    // reset display (e.g. after call is placed)
    if (this.props.getCallNextKeyReset() && dial.match(/^[0-9+#*]$/)) {
      this.props.setCallDisplay('');
      _display = '';
      this.props.setCallNextKeyReset(false);
    }
    if (dial.match(/^[0-9#*]$/)) {
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
  };

  dialFakeReset = (dial) => {
    if (this.state.dialActive[dial] !== undefined) {
      this.setState({
        dialActive: update(this.state.dialActive, { [dial]: { $set: false } })
      });
    }
  };

  dialFakePressed = (dial) => {
    if (this.state.dialActive[dial] !== undefined) {
      this.setState({
        dialActive: update(this.state.dialActive, { [dial]: { $set: true } })
      });
    }
    this.runPressEvents(dial);
    // sometimes if multiple keys are pressed simultaneously, keyUp event doesn't fire so clean by timeout
    setTimeout(this.dialFakeReset.bind(null, dial), 300);
  };

  handleKeyUp = (e) => {
    this.dialFakeReset(e.key);
  };

  handleKeyDown = (e) => {
    // handle edge-case when backspace is pressed right after ')' (which would delete that char, but not the digit before it)
    if (
      e.key === 'Backspace' &&
      e.target.value.charAt(e.target.selectionStart - 1) === ')'
    ) {
      let _display = this.props.callDisplay;
      _display = _display.substr(0, _display.length - 1);
      this.props.setCallDisplay(_display);
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
      if (this.props.getCallNextKeyReset()) {
        this.props.setCallDisplay('');
        this.props.setCallNextKeyReset(false);
      }
      // simulate events as if a real dial was pressed
      this.dialFakePressed(e.key);
    }
  };

  handleChange = (e) => {
    this.updateDisplay(e.target.value);
  };

  moveCaretToEnd(e) {
    e.target.selectionStart = e.target.value.length;
    e.target.selectionEnd = e.target.value.length;
  }

  formatNumber = (number) => {
    this.asYouType.reset();
    const result = this.asYouType.input(number);
    return result === '' ? number : result;
  };

  updateDisplay = (newValue) => {
    if (this.props.getCallTypingPN() === true) {
      this.asYouType.reset();
      const result = this.asYouType.input(newValue);
      if (result !== '') {
        this.props.setCallDisplay(result);
      } else {
        this.props.setCallDisplay(newValue);
      }
    } else {
      this.props.setCallDisplay(newValue);
    }
  };

  focusDisplay = () => {
    if (this.numberInputRef.current) {
      this.numberInputRef.current.focus();
    }
  };

  componentWillUnmount() {
    //this.props.client.removeAllListeners('incoming');
    //this.props.client.removeAllListeners('connect');
    //this.props.client.removeAllListeners('ready');
    this.props.client.removeListener('disconnect', this.disconnectHandler);
    if (this.props.getCallConnection()) {
      this.props.getCallConnection().removeAllListeners('mute');
    }
    clearTimeout(this.timer);
  }

  bindListeners = () => {
    if (this.props.client && !this.handlersSet) {
      /*this.props.client.on('connect', (conn) => {
        console.log('CC: CONNECT event fired');
      });*/

      this.props.client.on('disconnect', this.disconnectHandler);

      // if there's an active connection already in place
      // (i.e. switching from SMS canvas after placing a call)
      if (
        this.props.getCallConnection() &&
        this.props.getCallConnection().status() !== 'closed'
      ) {
        // re-set mute event listener
        this.props.getCallConnection().on('mute', (isMuted) => {
          this.setState({ isMuted });
        });
        // and update mute button's state
        this.setState({ isMuted: this.props.getCallConnection().isMuted() });

        // re-set elapsed time timer
        this.timer = setTimeout(this.tick, 1000);
        // and update current elapsed time
        const now = new Date();
        this.setState({ elapsedTime: now - this.props.getCallStartTime() });
      }
      this.handlersSet = true;
    }
  };

  componentDidMount() {
    this.bindListeners();
  }

  componentDidUpdate(prevProps, prevState) {
    this.bindListeners();
    /*if (
      this.props.client &&
      this.props.client.status() !== prevState.clientStatus
    ) {
      this.setState({ clientStatus: this.props.client.status() });
    }*/
    this.focusDisplay();
  }

  acceptIncomingCall = (conn) => {
    if (conn) {
      conn.accept();
      this.updateDisplay(conn.parameters.From);
      this.props.setCallTypingPN(false);
      this.props.setCallNextKeyReset(true);
      this.props.setCallStartTime(new Date());
      this.timer = setTimeout(this.tick, 1000);
    } else {
      console.error('No incoming connection found');
    }
  };

  rejectIncomingCall = (conn) => {
    if (conn) {
      conn.reject();
    } else {
      console.error('No incoming connection found');
    }
  };

  render() {
    if (!this.props.client || this.props.client.status() === 'offline') {
      return (
        <Canvas>
          <ModalMessage
            msg="Voice client is offline"
            img="offline"
          ></ModalMessage>
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
            value={this.props.callDisplay}
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
            muted={this.state.isMuted}
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
