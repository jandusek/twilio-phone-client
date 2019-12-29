const isEnabled = true;

exports.handler = function (context, event, callback) {
  const AccessToken = Twilio.jwt.AccessToken;
  const ChatGrant = AccessToken.ChatGrant;
  let response = new Twilio.Response();
  response.setHeaders({
    "Access-Control-Allow-Origin": "*"
  });
  if (!isEnabled) {
    response.setStatusCode(404);
    callback(null, response);
  } else {
    const token = new AccessToken(
      context.ACCOUNT_SID,
      context.SYNC_API_KEY,
      context.SYNC_API_SECRET,
      { ttl: 3600 } // tokenAboutToExpire event is triggered 3 minutes before expiration to this gives each token ~30s of effective lifetime
    );
    const chatGrant = new ChatGrant({
      serviceSid: context.CHAT_SERVICE_SID,
    });
    token.addGrant(chatGrant);
    token.identity = "build-client";
    response.setBody(token.toJwt());
    callback(null, response);
  }

};