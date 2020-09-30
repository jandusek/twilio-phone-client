function formParams(params) {
  return Object.keys(params)
    .map((key) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    })
    .join('&');
}

function stringify(param) {
  let msg = '';
  // Error class instance
  if (param instanceof Error && typeof param.message !== 'undefined') {
    msg = param.message;
    // Object
  } else if (
    param &&
    typeof param === 'object' &&
    param.constructor === Object
  ) {
    msg = JSON.stringify(param);
    // String
  } else if (typeof param === 'string' || param instanceof String) {
    msg = param;
  }
  return msg;
}

export { formParams, stringify };
