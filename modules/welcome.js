import * as weight from './weight';

export default function(controller, nlp) {
    controller.hears(['smalltalk.greetings'], 'message_received', nlp.action, function(bot, message) {
      controller.storage.users.get(message.user, function(err, user) {
          if (user && user.name) {
              bot.reply(message, 'Hi ' + user.name + '! How can I help you?');
          } else {
              bot.startConversation(message, function(err, convo) {
                convo.addQuestion({
                  text: 'You want me to call you `{{vars.name}}`?',
                  quick_replies: [{
                    context_type: 'text',
                    title: 'Yes',
                    payload: 'yes',
                  },
                  {
                    context_type: 'text',
                    title: 'No',
                    payload: 'no',
                  }]
                },
                [{
                    pattern: bot.utterances.yes,
                    callback: function(response, convo) {
                      // since no further messages are queued after this,
                      // the conversation will end naturally with status == 'completed'
                      convo.sayFirst('Nice to meet you {{vars.name}}');
                      convo.next();
                    }
                  },
                  {
                    pattern: bot.utterances.no,
                    callback: function(response, convo) {
                      // stop the conversation. this will cause it to end with status == 'stopped'
                      convo.stop();
                    }
                  },
                  {
                    default: true,
                    callback: function(response, convo) {
                      convo.repeat();
                      convo.next();
                    }
                  }
                ], {}, 'confirm_name');


                if (!err) {
                  convo.say('Hello, and welcome to your personal heart health assistant!');
                  convo.say("Together we'll get you on track to a healtier you.");
                  convo.ask({
                    text: 'But enough about me, what do I call you?',
                  }, function(response, convo) {
                    convo.setVar('name', response.text);
                    convo.gotoThread('confirm_name');
                    convo.next();
                  }, {'key': 'nickname'}); // store the results in a field called nickname

                  convo.on('end', function(convo) {
                      if (convo.status == 'completed') {
                          controller.storage.users.get(message.user, function(err, user) {
                              if (!user) {
                                  user = {
                                      id: message.user,
                                  };
                              }
                              user.name = convo.extractResponse('nickname');
                              controller.storage.users.save(user, function(err, id) {});

                              if (!user.weight) {
                                weight.askWeight(bot, message, 'To help you stay on track we need to know your height and weight.');
                              }
                          });
                      } else {
                          // this happens if the conversation ended prematurely for some reason
                          bot.reply(message, 'OK, nevermind!');
                      }
                  });
                }
              });
          }
      });
  });
}
