const isEnabled = true; // master switch for programmatic enabling/disabling of the client

exports.handler = function (context, event, callback) {
  const AccessToken = Twilio.jwt.AccessToken;
  const ChatGrant = AccessToken.ChatGrant;
  const VoiceGrant = AccessToken.VoiceGrant;
  let response = new Twilio.Response();

  // if running locally (i.e. testing), enable any originator for CORS
  if (context.path === undefined)
    response.setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
    });

  // check master switch
  if (!isEnabled) {
    response.setStatusCode(404);
    response.setBody('This client is currently disabled');
    return callback(null, response);
  }

  // check secret
  if (context.SECRET && event.secret !== context.SECRET) {
    response.setStatusCode(401);
    response.setBody('Invalid secret');
    return callback(null, response);
  }

  const token = new AccessToken(
    context.ACCOUNT_SID,
    context.API_KEY,
    context.API_SECRET,
    { ttl: 3600 } // tokenAboutToExpire event is triggered 3 minutes before expiration to this gives each token ~57m of effective lifetime
  );
  const chatGrant = new ChatGrant({
    serviceSid: context.CHAT_SERVICE_SID
  });
  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: process.env.TWIML_APP_SID,
    incomingAllow: true
  });
  token.addGrant(chatGrant);
  token.addGrant(voiceGrant);
  token.identity = 'client' + context.TWILIO_NUMBER;
  response.setBody(token.toJwt());
  return callback(null, response);
};
