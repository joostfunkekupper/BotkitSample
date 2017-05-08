export default function(controller, nlp) {
    controller.hears(['user.weight.save'], 'message_received', nlp.hears, function(bot, message) {
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
                bot.reply(message, {
                  text: "Thank you. Knowing your own weight will help you reach your goals",
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

export function askWeight(bot, message, say = '', cb) {
    bot.startConversation(message, function(err, convo) {
      if (say)
        convo.say(say);

      convo.ask({
        text: 'What is your current weight in kilograms?',
        quick_replies: [{
          content_type: 'text',
          title: '70kg',
          payload: '70kg',
        },
        {
          content_type: 'text',
          title: '80kg',
          payload: '80kg',
        },
        {
          content_type: 'text',
          title: '90kg',
          payload: '90kg',
        }]
      });
    });
}
