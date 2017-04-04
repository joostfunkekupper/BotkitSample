import Botkit from 'Botkit';
import config from 'config';
import diet from './modules/diet';

//=========================================================
// Bot Setup
//=========================================================
var controller = Botkit.facebookbot({
    debug: true,
    log: true,
    access_token: process.env.page_token || config.get('FACEBOOK_PAGE_ACCESS_TOKEN'),
    verify_token: process.env.verify_token || config.get('FACEBOOK_VERIFY_TOKEN'),
    app_secret: process.env.app_secret || config.get('FACEBOOK_APP_SECRET'),
    validate_requests: true, // Refuse any requests that don't come from FB on your receive webhook, must provide FB_APP_SECRET in environment variables
});

var bot = controller.spawn({
});

controller.setupWebserver(process.env.port || 3000, function(err, webserver) {
    controller.createWebhookEndpoints(webserver, bot, function() {
        console.log('info: ** Your bot is online!');
    });
});

//=========================================================
// API.ai Setup
//=========================================================
var apiai = require('botkit-middleware-apiai')({
    token: process.env.api_ai_access_token || config.get('API_AI_ACCESS_TOKEN'),
    skip_bot: false
});

controller.middleware.receive.use(apiai.receive);

//=========================================================
// Facebook specific options
//=========================================================
controller.api.messenger_profile.greeting('Hello! I\'m a Botkit bot!');
controller.api.messenger_profile.get_started('sample_get_started_payload');
controller.api.messenger_profile.menu([{
    "locale":"default",
    "composer_input_disabled":true,
    "call_to_actions":[
        {
            "type":"web_url",
            "title":"Botkit Docs",
            "url":"https://github.com/howdyai/botkit/blob/master/readme-facebook.md",
            "webview_height_ratio":"full"
        }
    ]}
]);

//=========================================================
// Diet module
//=========================================================
var dietInstance = new diet(controller, apiai);
dietInstance.mealSave;

//=========================================================
// Profile module
//=========================================================
controller.hears(['user.name.save'], 'message_received', apiai.hears, function(bot, message) {
  controller.storage.users.get(message.user, function(err, user) {
      if (!user) {
          user = {
              id: message.user,
          };
      }
      user.name = message.entities['given-name'];
      controller.storage.users.save(user, function(err, id) {
          bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
      });
  });
});

controller.hears(['name.user.get'], 'message_received', apiai.hears, function(bot, message) {
    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Your name is ' + user.name);
        } else {
            bot.startConversation(message, function(err, convo) {
                if (!err) {
                    convo.say('I do not know your name yet!');
                    convo.ask('What should I call you?', function(response, convo) {
                        convo.ask({
                          text: 'You want me to call you `' + response.text + '`?',
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
                            pattern: 'yes',
                            callback: function(response, convo) {
                              // since no further messages are queued after this,
                              // the conversation will end naturally with status == 'completed'
                              convo.next();
                            }
                          },
                          {
                            pattern: 'no',
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
                        ]);

                        convo.next();

                    }, {'key': 'nickname'}); // store the results in a field called nickname

                    convo.on('end', function(convo) {
                        if (convo.status == 'completed') {
                            bot.reply(message, 'OK! I will update my dossier...');

                            controller.storage.users.get(message.user, function(err, user) {
                                if (!user) {
                                    user = {
                                        id: message.user,
                                    };
                                }
                                user.name = convo.extractResponse('nickname');
                                controller.storage.users.save(user, function(err, id) {
                                    bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
                                });
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

//=========================================================
// Handle smalltalk by API.ai
//=========================================================
controller.hears([
  'smalltalk.agent',
  'smalltalk.appraisal',
  'smalltalk.dialog',
  'smalltalk.greetings',
  'smalltalk.user',
  'smalltalk.topics'], 'message_received', apiai.action, function(bot, message) {
    // Use the response from API.ai as the return message for any small talk
    bot.reply(message, { text: message.fulfillment.speech });
});

// Default message if others haven't heard a command
controller.on('message_received', function(bot, message) {
    bot.reply(message, 'Sorry, I`m still learning. Maybe try that next time :)');
    return false;
});
