'use strict';

require('dotenv').config();

import Botkit from 'Botkit';
import botkitStoragePostgres from 'botkit-storage-postgres';
import diet from './modules/diet';
import profile from './modules/profile';
import weight from './modules/weight';
import welcome from './modules/welcome';
import height from './modules/height';
import system from './modules/system';

//=========================================================
// Bot Setup
//=========================================================
var controller = Botkit.facebookbot({
    debug: true,
    log: true,
    access_token: process.env.page_token,
    verify_token: process.env.verify_token,
    app_secret: process.env.app_secret,
    validate_requests: false, // Refuse any requests that don't come from FB on your receive webhook, must provide FB_APP_SECRET in environment variables
    storage: botkitStoragePostgres({
      host: 'localhost',
      database: 'botkitsample',
      user: process.env.db_user,
      password: process.env.db_password,
    })
});

// Set up an Express-powered webserver to expose oauth and webhook endpoints
require(__dirname + '/components/express_webserver.js')(controller);

// Set up API.ai middleware to listen to incoming messages
var nlp = require(__dirname + '/components/apiai_middleware.js')(controller);

// Set up Facebook "thread settings" such as get started button, persistent menu
require(__dirname + '/components/thread_settings.js')(controller);

//=========================================================
// Load modules
//=========================================================
welcome(controller, nlp);
diet(controller, nlp);
profile(controller, nlp);
weight(controller, nlp);
height(controller, nlp);
system(controller);

//=========================================================
// Handle smalltalk by API.ai
//=========================================================
controller.hears([
  'smalltalk.agent',
  'smalltalk.appraisal',
  'smalltalk.dialog',
  'smalltalk.greetings',
  'smalltalk.person',
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
