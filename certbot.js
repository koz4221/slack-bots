/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
          \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
           \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

# RUN THE BOT:

  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Run your bot from the command line:

    token=<MY TOKEN> node bot.js


~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


var Botkit = require('./lib/Botkit.js');
var os = require('os');

var controller = Botkit.slackbot({
  debug: false,
});

var bot = controller.spawn(
  {
    token:process.env.token
  }
).startRTM();


controller.hears(['hello','hi'],'direct_message,direct_mention,mention',function(bot,message) {
  bot.reply(message,"Hello!");
});

controller.hears(['i love you'],'direct_message,direct_mention,mention',function(bot, message) {
    bot.reply(message,"Aw, I love you too! :heart:")
});

controller.hears('poll','direct_message,direct_mention',function(bot, message) {
  bot.startConversation(message, function(err, convo) {
    if (err) { console.log(err); }
    convo.ask("Poll time! What do you want to poll?", [
      {
        pattern: 'quit',
        callback: function(response,convo) {
          convo.say("OK, no more poll.");
          convo.next();
        }
      },
      {
        default: true,
        callback: function(response,convo) {
          convo.say("got here");
          convo.stop();
        }
      }
    ]);
  });
});

controller.hears('debug','direct_message',function(bot, message) {
  //console.log(message.user);
  bot.api.channels.info({ channel:'C0H8K3WES' },function(err,response) {
    if (err) { console.log(err); }
    console.log(response);
  });
});