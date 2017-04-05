function weight(controller, apiai = {}) {
  this.saveWeight = controller.hears(['user.weight.save'], 'message_received', apiai.hears, function(bot, message) {
      console.log(message.entities);
      controller.storage.users.get(message.user, function(err, user) {
          if (!user) {
              user = {
                  id: message.user,
              };
          }
          user.weight = {};
          user.weight.amount = message.entities['unit-weight'];
          user.weight.unit = message.entities['unit-weight-name'];
          controller.storage.users.save(user, function(err, id) {
              bot.reply(message, 'Ok, I`ve updated your weight');
              bot.replyWithTyping(message, 'Keeping track of your weight will help you stay on track');
          });
      });
  });
}

module.exports = weight;
