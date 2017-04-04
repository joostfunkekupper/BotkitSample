function diet(controller, apiai = {}) {
  this.saveMeal = controller.hears(['meal.save'], 'message_received', apiai.hears, function(bot, message) {
      console.log(message.entities);
      bot.replyWithTyping(message, { text: message.fulfillment.speech });
  });
}

module.exports = diet;
