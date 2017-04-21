module.exports = function(controller) {
    //=========================================================
    // API.ai Setup
    //=========================================================
    var nlp = require('botkit-middleware-apiai')({
        token: process.env.api_ai_access_token,
        skip_bot: false
    });

    controller.middleware.receive.use(nlp.receive);

    return nlp;
}
