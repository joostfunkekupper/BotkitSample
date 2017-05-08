import * as weight from './weight';

export default function(controller, nlp) {
  controller.hears(['smalltalk.greetings'], 'message_received', nlp.action, function(bot, message) {
    controller.storage.users.get(message.user, function(err, user) {
      bot.startConversation(message, function(err, convo) {
        convo.say("Hi there, I'm your assistant here to help you improve your heart health");
        convo.say("Together we'll keep track of your diet, health and well being");
        convo.ask("But enough about me, what do I call you?", function(response, convo) {
            convo.next();
        }, {'key': 'name'});

        convo.on('end', function(convo) {
            bot.reply(message, "Nice to meet you " + convo.extractResponse('name'));

            setTimeout(function() { askHealthy(bot, message) }, 1000);
        });
      });
    });
  });

  function askHealthy(bot, message) {
    bot.startConversation(message, function(err, convo) {
      convo.ask("I have a task for you, can you send me a photo of a healthy food for me?", function(response, convo) {
        convo.ask({
          text: 'That looks like a banana to me, is that correct?',
          quick_replies: [{
            content_type: 'text',
            title: 'Yes',
            payload: 'yes',
          },
          {
            content_type: 'text',
            title: 'No',
            payload: 'no',
          }]
        },
        [{
            pattern: bot.utterances.yes,
            callback: function(response, convo) {
              // since no further messages are queued after this,
              // the conversation will end naturally with status == 'completed'
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
        ]);

        convo.next();
      });

      convo.on('end', function(convo) {
          bot.reply(message, "Well done, that is pretty healthy");

          setTimeout(function() { askUnhealthy(bot, message) }, 1000);
      });
    });
  }

  function askUnhealthy(bot, message) {
    bot.startConversation(message, function(err, convo) {
      convo.ask("How about something unhealthy?", function(response, convo) {
        convo.ask({
          text: 'That looks like a chocolate bar to me, is that correct?',
          quick_replies: [{
            content_type: 'text',
            title: 'Yes',
            payload: 'yes',
          },
          {
            content_type: 'text',
            title: 'No',
            payload: 'no',
          }]
        },
        [{
            pattern: bot.utterances.yes,
            callback: function(response, convo) {
              // since no further messages are queued after this,
              // the conversation will end naturally with status == 'completed'
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
        ]);

        convo.next();
      });

      convo.on('end', function(convo) {
          bot.reply(message, "I love chocolate, but it is pretty unhealthy..");

          setTimeout(function() { askCalories(bot, message) }, 1000);
      });
    });
  }

  function askCalories(bot, message) {
    bot.startConversation(message, function(err, convo) {
      convo.ask({
        text: "And how long do you think you'd need to walk to work off those calories?",
        quick_replies: [{
          content_type: 'text',
          title: '10 min',
          payload: '10 min',
        },
        {
          content_type: 'text',
          title: '30 min',
          payload: '30 min',
        },
        {
          content_type: 'text',
          title: '1 hour',
          payload: '1 hour',
        },
        {
          content_type: 'text',
          title: '2 hours',
          payload: '2 hours',
        },]
      }, function(response, convo) {
        convo.next();
      });

      convo.on('end', function(convo) {
          bot.reply(message, "Sorry, it's a bit more than that. It's around 2 hours to walk that off. But that's ok, we're here to help you");

          setTimeout(function() { askDinner(bot, message) }, 1000);
      });
    });
  }

  function askDinner(bot, message) {
    bot.startConversation(message, function(err, convo) {
      convo.ask({
          text: "What kind of food do you usually have for dinner?",
          quick_replies: [{
            content_type: 'text',
            title: 'Japanese',
            payload: 'Japanese',
          },
          {
            content_type: 'text',
            title: 'Indian',
            payload: 'Indian',
          },
          {
            content_type: 'text',
            title: 'Vegetarian',
            payload: 'vegetarian',
          },
          {
            content_type: 'text',
            title: 'Meat and veg',
            payload: 'meat and veg',
          },
        ]}, function(response, convo) {
          convo.next();
      });

      convo.on('end', function(convo) {
          bot.reply(message, "Great!");

          setTimeout(function() { askMealPlan(bot, message) }, 1000);
      });
    });
  }

  function askMealPlan(bot, message) {
    bot.startConversation(message, function(err, convo) {
      convo.ask({
          text: "If you'd like some recipes or meal plan, just ask",
          quick_replies: [{
            content_type: 'text',
            title: 'Recipes',
            payload: 'recipes',
          },
          {
            content_type: 'text',
            title: 'Meal plan',
            payload: 'meal plan',
          },
        ]},
        [{
            pattern: 'recipes',
            callback: function(response, convo) {
                convo.say({
                  attachment: {
                      'type':'template',
                      'payload':{
                           'template_type':'generic',
                           'elements':[
                             {
                               'title':'Brocolli and sweet potato couscous',
                               'image_url':'http://www.sanitarium.com.au/getmedia/3239f1b7-570e-4deb-9bfb-c4359cb43aed/broccoli_kumara_couscous.jpg',
                               'subtitle':'A great tasting meal that’s easy to prepare and good for you! Served as a side dish or light, fresh flavoured meal, it’s high in protein and fibre.',
                               'buttons':[
                                 {
                                   'type':'web_url',
                                   'url':'http://www.sanitarium.com.au/recipes/a-z/broccoli-and-sweet-potato-couscous',
                                   'title':'View recipe'
                                 },
                               ]
                             },
                             {
                               'title':'Vegetable stir-fry',
                               'image_url':'http://www.sanitarium.com.au/getmedia/7d7cb638-3b68-4cf3-b136-d9167741d20a/CashewVegetavleStirfry300dpi.jpg',
                               'subtitle':'A simple, tasty stir-fry that’s high in protein and fibre, ideal for a quick, healthy weeknight meal.',
                               'buttons':[
                                 {
                                   'type':'web_url',
                                   'url':'http://www.sanitarium.com.au/recipes/a-z/vegetable-stir-fry',
                                   'title':'View recipe'
                                 },
                               ]
                             },
                             {
                               'title':'Laksa',
                               'image_url':'http://www.sanitarium.com.au/getmedia/561bc6e5-e1c7-4b98-8bd9-ee475d04ce2c/LaksaL.jpg',
                               'subtitle':'Quick and simple to prepare, this recipe makes creating a delicious mid-week meal easy. High in fibre, iron and calcium, it’s a healthy and satisfying meal the family can enjoy.',
                               'buttons':[
                                 {
                                   'type':'web_url',
                                   'url':'http://www.sanitarium.com.au/recipes/a-z/laksa',
                                   'title':'View recipe'
                                 },
                               ]
                             }
                           ]
                         }
                    }
                });
                convo.next();
            }
        },
        {
            pattern: 'meal plan',
            callback: function(response, convo) {
                convo.say({
                  attachment: {
                      'type':'template',
                      'payload':{
                           'template_type':'list',
                           'elements':[
                             {
                               'title':'Today',
                               'image_url':'http://www.sanitarium.com.au/getmedia/3239f1b7-570e-4deb-9bfb-c4359cb43aed/broccoli_kumara_couscous.jpg',
                               'subtitle':'Brocolli and sweet potato couscous',
                               'buttons':[
                                 {
                                   'type':'web_url',
                                   'url':'http://www.sanitarium.com.au/recipes/a-z/broccoli-and-sweet-potato-couscous',
                                   'title':'Get recipe'
                                 },
                               ]
                             },
                             {
                               'title':'Tomorrow',
                               'image_url':'http://www.sanitarium.com.au/getmedia/7d7cb638-3b68-4cf3-b136-d9167741d20a/CashewVegetavleStirfry300dpi.jpg',
                               'subtitle':'Vegetable stir-fry',
                               'buttons':[
                                 {
                                   'type':'web_url',
                                   'url':'http://www.sanitarium.com.au/recipes/a-z/vegetable-stir-fry',
                                   'title':'Get recipe'
                                 },
                               ]
                             },
                             {
                               'title':'The day after',
                               'image_url':'http://www.sanitarium.com.au/getmedia/561bc6e5-e1c7-4b98-8bd9-ee475d04ce2c/LaksaL.jpg',
                               'subtitle':'Laksa',
                               'buttons':[
                                 {
                                   'type':'web_url',
                                   'url':'http://www.sanitarium.com.au/recipes/a-z/laksa',
                                   'title':'Get recipe'
                                 },
                               ]
                             },
                             {
                               'title':'And after that',
                               'image_url':'http://www.sanitarium.com.au/getmedia/1f47c4b2-35a5-4019-85aa-37b634cc3d8c/pasaueggredcapandcur.jpg',
                               'subtitle':'Eggplant, currant and cumin pasta sauce',
                               'buttons':[
                                 {
                                   'type':'web_url',
                                   'url':'http://www.sanitarium.com.au/recipes/a-z/eggplant-currant-cumin-pasta-sauce',
                                   'title':'Get recipe'
                                 },
                               ]
                             },
                           ],
                           "buttons": [
                                {
                                    "title": "View shopping list",
                                    "type": "postback",
                                    "payload": "payload"
                                }
                            ]
                       }
                    }
                });
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
  }

  function askReceiptScanning(bot, message) {
    bot.startConversation(message, function(err, convo) {
      convo.ask("And lastly, could you take a photo of your last grocery receipt?", function(response, convo) {
        convo.say("Thank you! That looks like a good mix of vegetables, grains and meats");

        convo.next();
      });

      convo.on('end', function(convo) {
          setTimeout(function() { promptCapabilities(bot, message) }, 1000);
      });
    });
  }

  function promptCapabilities(bot, message) {
    bot.startConversation(message, function(err, convo) {
      convo.say("Great! So now you know what I can do");
      convo.say("Over the next week I'll be learning your regular meals, and to do that I need you to take photos of each meal");
      convo.say("And together we'll work to help you get a healthier heart");

      convo.next();

      convo.on('end', function(convo) {
        setTimeout(function() { weight.askWeight(bot, message, 'To help you stay on track we need ask you a couple personal questions') }, 1000);
      });
    });
  }
}
