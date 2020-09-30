const twilio = require('twilio');

function testE164(number) {
  const e164 = /^\+?[1-9]\d{1,14}$/;
  return e164.test(number);
}

exports.handler = (context, event, callback) => {
  const identity = 'client' + context.TWILIO_NUMBER;
  let response = new Twilio.Response();
  const fromNumber = context.TWILIO_NUMBER;

  // if running locally (i.e. testing), enable any originator for CORS
  if (context.path === undefined)
    response.setHeaders({
      'Access-Control-Allow-Origin': '*'
    });

  if (!testE164(fromNumber)) {
    response.setBody(`Invalid originator phone number: '${fromNumber}'`);
    response.setStatusCode(500);
    return callback(null, response);
  }
  if (!testE164(event.To)) {
    response.setBody(`Invalid recipient phone number: '${event.To}'`);
    response.setStatusCode(500);
    return callback(null, response);
  }

  const client = new twilio(context.API_KEY, context.API_SECRET, {
    accountSid: context.ACCOUNT_SID
  });
  const chatName = event.To;
  const chatService = client.chat.services(context.CHAT_SERVICE_SID);

  function postMessageToChat(chatService, chatName, message) {
    chatService
      .channels(chatName)
      .messages.create({
        from: 'us',
        body: event.Body,
        attributes: JSON.stringify({
          fromNumber,
          toNumber: event.To,
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

  client.messages
    .create({ body: event.Body, from: fromNumber, to: event.To })
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
                  .members.create({ identity })
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
