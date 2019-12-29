import React from 'react';

function printTimestamp(date) {
  return (date.getHours() < 10 ? "0" : "") + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
};

function formatBodyText(txt) {
  return txt.split('\n').map(function (item, key) {
    return (
      <span key={key}>
        {item}
        <br />
      </span>
    )
  });
};

function formatBodyPreviewText(txt) {
  return txt.replace(/\n[\s\S]*/, "...");
  // because pattern /.*/ is not applied over multiple lines and we want to remove all subsequent lines
};

function pad2(digit) {
  return (digit < 10 ? `0${digit}` : `${digit}`);
}

function getDate(date) {
  return date.getFullYear() + pad2(date.getMonth() + 1) + pad2(date.getDate());
}

const isToday = (someDate) => {
  const today = new Date()
  return getDate(someDate) === getDate(today);
}

const isYday = (someDate) => {
  let yday = new Date();
  yday.setDate(yday.getDate() - 1);
  return getDate(someDate) === getDate(yday);
}

const dateOptions = { day: 'numeric', month: 'short' };
function prettyDate(someDate) {
  if (isToday(someDate)) {
    return "Today";
  } else if (isYday(someDate)) {
    return "Yesterday";
  } else {
    return someDate.toLocaleString('en-US', dateOptions)
  }
}

export { printTimestamp, formatBodyText, formatBodyPreviewText, prettyDate }