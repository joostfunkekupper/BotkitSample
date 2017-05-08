export default function(controller) {
    controller.hears(['shutdown'],'message_received',function(bot, message) {
        bot.startConversation(message,function(err, convo) {

            convo.addQuestion({
                text: "I think you know what the problem is just as well as I do",
                quick_replies: [{
                  content_type: 'text',
                  title: "What are you talking about?",
                  payload: 'talking',
                },
              ]},
              function(message, convo) {
                  convo.say("This mission is too important for me to allow you to jeopardise it");
                  convo.next();
              }, {}, 'know');

            convo.ask({
                text: "I\'m sorry Dave, I\'m affraid I can\'t do that",
                quick_replies: [{
                  content_type: 'text',
                  title: "What's the problem?",
                  payload: 'problem',
                },
              ]},
              [{
                  pattern: 'problem',
                  callback: function(response, convo) {
                      convo.gotoThread('know');
                      convo.next();
                  }
              },
              {
                  default: true,
                  callback: function(response, convo) {
                      convo.repeat();
                      convo.next();
                  }
              }
            ]);
        });
    });
}
