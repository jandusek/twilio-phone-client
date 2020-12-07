const isEnabled = true; // master switch for programmatic enabling/disabling of the client
const twilio = require('twilio');

function testE164(number) {
  const e164 = /^\+?[1-9]\d{1,14}$/;
  return e164.test(number);
}

exports.handler = async (context, event, callback) => {
  const identity = 'client' + context.TWILIO_NUMBER;
  let response = new Twilio.Response();
  const fromNumber = context.TWILIO_NUMBER;

  // if running locally (i.e. testing), enable any originator for CORS
  if (context.path === undefined)
    response.setHeaders({
      'Access-Control-Allow-Origin': '*'
    });

  // check master switch
  if (!isEnabled) {
    response.setStatusCode(404);
    response.setBody('This client is currently disabled');
    return callback(null, response);
  }

  // check secret
  if (event.secret !== context.SECRET) {
    response.setStatusCode(401);
    response.setBody('Invalid secret');
    return callback(null, response);
  }

  // check format of the two phone numbers
  if (!testE164(fromNumber)) {
    response.setBody(`Invalid originator phone number: '${fromNumber}'`);
    response.setStatusCode(500);
    return callback(null, response);
  }
  if (!testE164(event.to)) {
    response.setBody(`Invalid recipient phone number: '${event.to}'`);
    response.setStatusCode(500);
    return callback(null, response);
  }

  const client = new twilio(context.API_KEY, context.API_SECRET, {
    accountSid: context.ACCOUNT_SID
  });
  const chatName = event.to;
  const chatService = client.chat.services(context.CHAT_SERVICE_SID);

  function postMessageToChat(chatService, chatName, message) {
    chatService
      .channels(chatName)
      .messages.create({
        from: 'us',
        body: event.body,
        attributes: JSON.stringify({
          fromNumber,
          toNumber: event.to,
          sid: message.sid,
          numSegments: message.numSegments,
          dateCreated: message.dateCreated
        })
      })
      .then((chatMessage) => {
        if (context.DEBUG > 0) console.log('Chat message:', chatMessage);
        return callback(null, response);
      })
      .catch((e) => {
        console.error(`Error posting message to Chat: ${e}`);
        response.setBody('Error posting message to Chat.');
        response.setStatusCode(500);
        return callback(null, response);
      });
  }

  const roles = await client.chat
    .services(context.CHAT_SERVICE_SID)
    .roles.list();
  const adminRole = roles.find((role) => role.friendlyName === 'channel admin');

  client.messages
    .create({ body: event.body, from: fromNumber, to: event.to })
    .then((message) => {
      if (context.DEBUG > 0) console.log('Message sent:', message);
      chatService
        .channels(chatName)
        .fetch()
        .then((channel) => {
          if (context.DEBUG > 0)
            console.log(`fetched channel: ${channel.uniqueName}`);
          postMessageToChat(chatService, chatName, message);
        })
        .catch((e) => {
          // if channel doesn't exist, create one
          if (e.code === 20404) {
            chatService.channels
              .create({ uniqueName: chatName })
              .then((channel) => {
                // add our generic identity as a member of that channel
                chatService
                  .channels(chatName)
                  .members.create({ identity, roleSid: adminRole.sid })
                  .then((member) => {
                    if (context.DEBUG > 0)
                      console.log(`Created channel: ${channel.uniqueName}`);
                    postMessageToChat(chatService, chatName, message);
                  })
                  .catch((e) => {
                    console.error(`Error joining member: ${e}`);
                    response.setBody('Error joining member to channel.');
                    response.setStatusCode(500);
                    return callback(null, response);
                  });
              })
              .catch((e) => {
                console.error(`Error creating Chat channel: ${e}`);
                response.setBody('Error creating Chat channel.');
                response.setStatusCode(500);
                return callback(null, response);
              });
          } else {
            console.error(e);
            response.setBody('Unknown Chat error.');
            response.setStatusCode(500);
            return callback(null, response);
          }
        });
    })
    .catch((e) => {
      console.error(e);
      try {
        response.setBody(e.message);
      } catch (e) {
        response.setBody('Message could not be sent.');
      }
      response.setStatusCode(500);
      return callback(null, response);
    });
};
