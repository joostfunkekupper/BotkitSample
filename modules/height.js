export default function(controller, nlp) {
  controller.hears(['user.height.save'], 'message_received', nlp.hears, function(bot, message) {
    controller.storage.users.get(message.user, function(err, user) {
      if (!user) {
        user = {
          id: message.user,
        };
      }
      user.height = {};
      user.height.amount = message.entities['unit-height'];
      user.height.unit = message.entities['unit-height-name'];
      controller.storage.users.save(user, function(err, id) {
        bot.reply(message, {
          text: "Thank you, I've updated your profile",
          quick_replies: [{
            content_type: 'text',
            title: 'What is my BMI?',
            payload: 'what is my bmi',
          },
          {
            content_type: 'text',
            title: 'How do you calculate my BMI?',
            payload: 'how do you calculate my bmi',
          }]
        });
      });
    });
  });
}
