module.exports = function(controller) {
    controller.api.thread_settings.greeting('Hello! I\'m a Botkit bot!');
    controller.api.thread_settings.get_started('sample_get_started_payload');
    controller.api.thread_settings.menu([{
        "locale":"default",
        "composer_input_disabled":false,
        "call_to_actions":[
            {
                "type":"postback",
                "title":"How am I going?",
                "payload":"HOW_AM_I_GOING"
            },
            {
                "type":"postback",
                "title":"I'm hungry",
                "payload":"HUNGRY"
            },
            {
                "type":"postback",
                "title":"Help!",
                "payload":"HELP"
            },
        ]}
    ]);
}
