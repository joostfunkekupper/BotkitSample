export default function(controller, apiai = {}) {
  controller.hears(['meal.save'], 'message_received', apiai.hears, function(bot, message) {
      console.log(message.entities);
      bot.replyWithTyping(message, { text: message.fulfillment.speech });
  });
}
