const isEnabled = true;

exports.handler = function (context, event, callback) {
  const ClientCapability = Twilio.jwt.ClientCapability;
  let response = new Twilio.Response();
  response.setHeaders({
    "Access-Control-Allow-Origin": "*"
  })
  if (!isEnabled) {
    response.setStatusCode(404);
    callback(null, response);
  } else {
    const capability = new ClientCapability({
      accountSid: process.env.ACCOUNT_SID,
      authToken: process.env.AUTH_TOKEN,
    });

    capability.addScope(
      new ClientCapability.OutgoingClientScope({
        applicationSid: process.env.TWIML_APP_SID
      })
    );

    const token = capability.toJwt();

    response.setBody(capability.toJwt());
    callback(null, response);
  }

};