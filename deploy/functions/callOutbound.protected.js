exports.handler = function (context, event, callback) {
  let voiceResponse = new Twilio.twiml.VoiceResponse();
  voiceResponse.dial({
    callerId: context.TWILIO_NUMBER,
  }, event.number);

  callback(null, voiceResponse);
};