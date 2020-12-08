const twilio = require('twilio');

exports.handler = async (context, event, callback) => {
  const identity = 'client' + context.TWILIO_NUMBER;
  let response = new Twilio.Response();
  const client = new twilio(context.API_KEY, context.API_SECRET, {
    accountSid: context.ACCOUNT_SID
  });
  const chatName = event.From;

  function postMessage(chatService) {
    chatService
      .channels(chatName)
      .messages.create({
        from: 'them',
        body: event.Body,
        attributes: JSON.stringify({
          fromNumber: event.From,
          toNumber: event.To,
          sid: event.MessageSid
        })
        // ToDo: Add media handling for MMS
      })
      .then((message) => {
        console.log(message);
        response.setStatusCode(204);
        callback(null, response);
      })
      .catch((e) => console.error('error posting message:', e));
  }

  const roles = await client.chat
    .services(context.CHAT_SERVICE_SID)
    .roles.list();
  const adminRole = roles.find((role) => role.friendlyName === 'channel admin');

  const chatService = client.chat.services(context.CHAT_SERVICE_SID);
  console.log(`channel: ${chatName}`);
  chatService
    .channels(chatName)
    .fetch()
    .then((channel) => {
      console.log(`fetched channel: ${channel.uniqueName}`);
      postMessage(chatService);
    })
    .catch((e) => {
      // if channel doesn't exist, create one
      if (e.code === 20404) {
        chatService.channels
          .create({
            uniqueName: chatName
          })
          .then((channel) => {
            // add our generic identity as a member of that channel
            chatService
              .channels(chatName)
              .members.create({
                identity,
                roleSid: adminRole.sid
              })
              .then((member) => {
                console.log(`created channel: ${channel.uniqueName}`);
                postMessage(chatService);
              })
              .catch((e) => {
                console.error(`error joining member: ${e}`);
                response.setBody(`error joining member: ${e}`);
                response.setStatusCode(500);
                callback(null, response);
              });
          })
          .catch((e) => {
            console.error(`error creating channel: ${e}`);
            response.setBody(`error creating channel: ${e}`);
            response.setStatusCode(500);
            callback(null, response);
          });
      } else {
        console.error(`unknown error: ${e}`);
        response.setBody(`unknown error: ${e}`);
        response.setStatusCode(500);
        callback(null, response);
      }
    });
};
