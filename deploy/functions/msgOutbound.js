const identity = 'build-client';

function testE164(number) {
  const e164 = /^\+?[1-9]\d{1,14}$/;
  return e164.test(number);
}

exports.handler = (context, event, callback) => {
  let response = new Twilio.Response();
  const From_number = context.TWILIO_NUMBER;

  response.setHeaders({
    "Access-Control-Allow-Origin": "*"
  });

  if (!testE164(From_number) || !testE164(event.To)) {
    response.setBody("Invalid phone number.");
    response.setStatusCode(500);
    callback(null, response);
  }

  client = context.getTwilioClient();
  const chatName = event.To;
  console.log(chatName);

  const chatService = client.chat.services(context.CHAT_SERVICE_SID);

  function postMessageToChat(chatService, chatName, message) {
    chatService.channels(chatName)
      .messages
      .create({
        from: "us",
        body: event.Body,
        attributes: JSON.stringify({
          fromNumber: From_number,
          toNumber: event.To,
          sid: message.sid,
          numSegments: message.numSegments,
          dateCreated: message.dateCreated
        })
      }).then(chatMessage => {
        console.log(chatMessage);
        callback(null, response);
      }).catch(e => {
        console.error(`Error posting message to Chat: ${e}`)
        response.setBody("Error posting message to Chat.");
        response.setStatusCode(500);
        callback(null, response);
      });
  }

  client.messages
    .create({ body: event.Body, from: From_number, to: event.To })
    .then(message => {
      console.log("Message sent:", message)
      chatService.channels(chatName)
        .fetch()
        .then(channel => {
          console.log(`fetched channel: ${channel.uniqueName}`);
          postMessageToChat(chatService, chatName, message);
        })
        .catch(e => {
          // if channel doesn't exist, create one
          if (e.code === 20404) {
            chatService.channels
              .create({ uniqueName: chatName })
              .then(channel => {
                // add our generic identity as a member of that channel
                chatService.channels(chatName).members.create({ identity })
                  .then(member => {
                    console.log(`Created channel: ${channel.uniqueName}`);
                    postMessageToChat(chatService, chatName, message);
                  })
                  .catch(e => {
                    console.error(`Error joining member: ${e}`)
                    response.setBody("Error joining member to channel.");
                    response.setStatusCode(500);
                    callback(null, response);
                  });
              })
              .catch(e => {
                console.error(`Error creating Chat channel: ${e}`)
                response.setBody("Error creating Chat channel.");
                response.setStatusCode(500);
                callback(null, response);
              });
          } else {
            console.error(e);
            response.setBody("Unknown Chat error.");
            response.setStatusCode(500);
            callback(null, response);
          }
        });

    })
    .catch(e => {
      console.error(e);
      try {
        response.setBody(e.message);

      } catch (e) {
        response.setBody("Message could not be sent.");
      }
      response.setStatusCode(500);
      callback(null, response);
    });

}