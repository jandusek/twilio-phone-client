const isEnabled = true;

exports.handler = function (context, event, callback) {
  const AccessToken = Twilio.jwt.AccessToken;
  const ChatGrant = AccessToken.ChatGrant;
  const VoiceGrant = AccessToken.VoiceGrant;
  let response = new Twilio.Response();

  // if running locally (i.e. testing), enable any originator for CORS
  if (context.path === undefined)
    response.setHeaders({
      'Access-Control-Allow-Origin': '*'
    });

  if (!isEnabled) {
    response.setStatusCode(404);
    return callback(null, response);
  } else {
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
  }
};
