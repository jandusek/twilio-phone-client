import React from 'react';
import styled from 'styled-components';

const SvgPhone = (props) => (
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

const SvgHangup = (props) => (
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
  text-decoration: none;
  display: inline-block;
  border-radius: 50%;
  outline: none;
  cursor: pointer;
  text-align: center;
  color: ${(props) =>
    props.toggled ? props.theme.colorToggled : props.theme.color};
  background-color: ${(props) =>
    props.toggled
      ? props.theme.dialToggled
      : props.dialActive
      ? props.theme.dialActive
      : props.theme.dial};
  &:hover {
    background-color: ${(props) => props.theme.dialActive};
  }
`;

const DialRed = styled(SvgHangup)`
  height: 10vmin;
  width: 10vmin;
  @media (min-width: 400px) {
    width: 40px;
    height: 40px;
  }
`;

const DialGreen = styled(SvgPhone)`
  height: 9vmin;
  width: 9vmin;
  @media (min-width: 400px) {
    width: 36px;
    height: 36px;
  }
`;

const BtnDialGreen = styled(BtnDial)`
  background-color: ${(props) =>
    props.dialActive ? props.theme.dialGreenActive : props.theme.dialGreen};
  &:hover {
    background-color: ${(props) => props.theme.dialGreenActive};
  }
`;

const BtnDialRed = styled(BtnDial)`
  background-color: ${(props) => props.theme.dialRed};
  &:hover {
    background-color: ${(props) => props.theme.dialRedActive};
  }
`;

export {
  BtnDial,
  BtnDialRed,
  BtnDialGreen,
  DialRed,
  DialGreen,
  SvgPhone,
  SvgHangup
};
