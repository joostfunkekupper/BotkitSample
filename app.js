import Botkit from 'Botkit';
import config from 'config';
import diet from './modules/diet';
import profile from './modules/profile';
import weight from './modules/weight';

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
var nlp = require('botkit-middleware-apiai')({
    token: process.env.api_ai_access_token || config.get('API_AI_ACCESS_TOKEN'),
    skip_bot: false
});

//=========================================================
// Wit.ai Setup
//=========================================================
var nlp = require('botkit-witai')({
    accessToken: process.env.wit_ai_access_token || config.get('WIT_AI_ACCESS_TOKEN'),
    minConfidence: 0.6,
    logLevel: 'debug'
});

controller.middleware.receive.use(nlp.receive);

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
// Load modules
//=========================================================
var dietInstance = new diet(controller, nlp);
var profileInstance = new profile(controller, nlp);
var weightInstance = new weight(controller, nlp);

//=========================================================
// Handle smalltalk by API.ai
//=========================================================
controller.hears([
  'smalltalk.agent',
  'smalltalk.appraisal',
  'smalltalk.dialog',
  'smalltalk.greetings',
  'smalltalk.user',
  'smalltalk.topics'], 'message_received', nlp.action, function(bot, message) {
    // Use the response from API.ai as the return message for any small talk
    bot.reply(message, { text: message.fulfillment.speech });
});

// Default message if others haven't heard a command
controller.on('message_received', function(bot, message) {
    bot.reply(message, 'Sorry, I`m still learning. Maybe try that next time :)');
    return false;
});
