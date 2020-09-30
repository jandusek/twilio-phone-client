import React, { Component } from 'react';
import styled from 'styled-components';
import { FullScreen } from './CommonComponents';
import chroma from 'chroma-js';
const accent = process.env.REACT_APP_ACCENT_COLOR;
const accent_light = chroma(process.env.REACT_APP_ACCENT_COLOR)
  .brighten()
  .hex();

export default class AuthForm extends Component {
  constructor(props) {
    super(props);
    this.state = { remember: false, secret: '' };
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.updateSecret = this.updateSecret.bind(this);
  }

  handleCheckboxChange(event) {
    const value = event.target.checked;
    this.setState({
      remember: value
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    const secret = this.state.secret;
    this.props.setSecret(secret);
    if (this.state.remember) {
      localStorage.setItem('secret', secret);
    }
  }

  handleKeypress(event) {}

  updateSecret(event) {
    this.setState({
      secret: event.target.value
    });
  }

  render() {
    return (
      <FullScreen>
        <form>
          <Label>
            <p>Enter your secret</p>
            <p>
              <input
                type="text"
                name="action"
                defaultValue="login"
                autoComplete="off"
                style={{ display: 'none' }}
              />
              <Password
                type="password"
                name="secret"
                autoComplete="current-password"
                value={this.state.secret}
                onChange={this.updateSecret}
              />
              {this.props.errMsg && (
                <LabelError>({this.props.errMsg})</LabelError>
              )}
            </p>
            <p>
              <BtnSubmit onClick={this.handleSubmit}>
                <Unlock />
              </BtnSubmit>
            </p>
          </Label>
          <LabelSmall>
            <Checkbox
              name="remember"
              type="checkbox"
              checked={this.state.remember}
              onChange={this.handleCheckboxChange}
            />
            Remember on this device
          </LabelSmall>
        </form>
      </FullScreen>
    );
  }
}

const SvgUnlock = (props) => (
  <svg
    viewBox="0 0 200 200"
    fillRule="evenodd"
    clipRule="evenodd"
    strokeLinejoin="round"
    strokeMiterlimit={2}
    {...props}
  >
    <path
      d="M162.5 100c6.9 0 12.5 5.6 12.5 12.5v75c0 6.9-5.6 12.5-12.5 12.5h-125c-6.9 0-12.5-5.6-12.5-12.5v-75c0-6.9 5.6-12.5 12.5-12.5h4.167V58.333C41.667 26.175 67.842 0 100 0s58.333 26.175 58.333 58.333c0 4.559-3.775 8.334-8.333 8.334h-8.333c-4.559 0-8.334-3.775-8.334-8.334C133.333 39.975 118.358 25 100 25c-18.358 0-33.333 14.975-33.333 33.333V100H162.5z"
      fill="currentColor"
      fillRule="nonzero"
    />
  </svg>
);

const Unlock = styled(SvgUnlock)`
  height: 6vmin;
  width: 6vmin;
  @media (min-width: 400px) {
    height: 24px;
    width: 24px;
  }
`;

const Password = styled.input`
  outline: none;
  height: 10vmin;
  width: 100vw;
  font-size: 5vmin;
  text-align: center;
  color: #565b73;
  padding: 0.5vmin 3vmin 0.5vmin 3vmin;
  @media (min-width: 400px) {
    height: 40px;
    width: 400px;
    font-size: 20px;
    padding: 2px 12px 2px 12px;
  }
  border: 0;
  background: rgb(236, 237, 241);
`;

const BtnSubmit = styled.button`
  height: 12vmin;
  width: 12vmin;
  color: #565b73;
  padding: 0;
  border-width: initial;
  border-style: none;
  border-color: initial;
  border-image: initial;
  outline: none;
  border-radius: 50px;
  background: rgb(236, 237, 241);
  cursor: pointer;
  @media (min-width: 400px) {
    height: 48px;
    width: 48px;
  }
  &:hover {
    background: ${accent};
    color: #ffffff;
  }
`;

const Label = styled.label`
  color: #565b73;
  font-size: 5vmin;
  @media (min-width: 400px) {
    font-size: 20px;
  }
`;

const LabelSmall = styled(Label)`
  font-size: 4vmin;
  @media (min-width: 400px) {
    font-size: 16px;
  }
`;

const LabelError = styled(LabelSmall)`
  color: ${process.env.REACT_APP_ACCENT_COLOR};
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  // Hide checkbox visually but remain accessible to screen readers.
  // Source: https://polished.js.org/docs/#hidevisually
  border: 0;
  clip: rect(0 0 0 0);
  clippath: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

const Icon = styled.svg`
  fill: none;
  stroke: white;
  stroke-width: 4px;
`;

const StyledCheckbox = styled.div`
  display: inline-block;
  width: 4vmin;
  height: 4vmin;
  margin-right: 1.5vmin;
  background: ${(props) => (props.checked ? accent : 'rgb(236, 237, 241)')};
  border-radius: 3px;
  transition: all 150ms;
  @media (min-width: 400px) {
    width: 16px;
    height: 16px;
    margin-right: 6px;
  }
  ${HiddenCheckbox}:focus + & {
    box-shadow: 0 0 0 2px ${accent_light};
  }
  ${Icon} {
    visibility: ${(props) => (props.checked ? 'visible' : 'hidden')};
  }
`;

const CheckboxContainer = styled.div`
  display: inline-block;
  vertical-align: middle;
`;

const Checkbox = ({ checked, ...props }) => (
  <CheckboxContainer>
    <HiddenCheckbox checked={checked} {...props} />
    <StyledCheckbox checked={checked}>
      <Icon viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12" />
      </Icon>
    </StyledCheckbox>
  </CheckboxContainer>
);
