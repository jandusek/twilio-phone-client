exports.handler = (context, event, callback) => {
  let response = new Twilio.twiml.VoiceResponse();
  const dial = response.dial();
  dial.client('client' + context.TWILIO_NUMBER);
  callback(null, response);
};
