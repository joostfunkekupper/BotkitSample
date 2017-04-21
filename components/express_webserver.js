var express = require('express');

module.exports = function(controller, bot) {

  controller.setupWebserver(process.env.port || 3000, function(err, webserver) {
      var bot = controller.spawn({}) || bot;

      controller.createWebhookEndpoints(webserver, bot, function() {
          console.log('info: ** Your bot is online!');

          webserver.use(express.static('public'));
      });
  });
}
