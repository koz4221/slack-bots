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

var booActivePoll = false;
var options, pollChannel, pollUser;
var results, resultsUsers = [];

controller.hears(['hello','hi'],'direct_message,direct_mention,mention',function(bot,message) {
  bot.reply(message,"Hello!");
});

controller.hears(['i love you'],'direct_message,direct_mention,mention',function(bot, message) {
    bot.reply(message,"Aw, I love you too! :heart:")
});

controller.hears('poll','direct_message,direct_mention',function(bot, message) {
  if (message.text == 'poll results') {
    if (booActivePoll == true) {
      pollResults(message);
    }
    else {
      bot.reply(message,"There is no poll active.");
    }
  }
  else {
    bot.startConversation(message, function(err, convo) {
      if (err) { console.log(err); }
      convo.ask("Poll time! What do you want to poll?", [
        {
          pattern: new RegExp(/^(quit|exit)/i),
          callback: function(response,convo) {
            convo.say('OK, no more poll.');
            convo.next();
          }
        },
        {
          default: true,
          callback: function(response,convo) {
            // just repeat the question
            var question = response.text;
            convo.next();
            convo.ask('OK! Now what are the poll options? Comma-delimited list, please!', function(response,convo) {
              options = response.text.split(',');
              
              var phrase = 'Hey <!channel>, it\'s poll time! ' + question;
              for (var i = 0; i < options.length; i++) {
                phrase += '\n' + (i + 1) + '. ' + options[i];
              }
              phrase += '\n' + 'Type "vote #" to submit your choice! DM me to keep your choice private.'
              
              booActivePoll = true;
              pollChannel = message.channel;
              pollUser = message.user;
              setTimeout(function() {
                pollResults(message);
              }, 300000);
              
              convo.say(phrase);
              convo.next();
            });
          }
        }
      ]);
    });    
  }
});

controller.hears('vote','direct_message,direct_mention,mention,ambient',function(bot,message) {
  //console.log(booActivePoll);
  if (booActivePoll == true && message.text.match(/vote \d+/i) && resultsUsers.indexOf(message.user) == -1) {
    var choice = message.text.substr(5);
    
    if (results === undefined) {
      results = [];
    }
    
    if (results[choice] === undefined) {
      results[choice] = 1;
    }
    else {
      results[choice]++;
    }
    
    resultsUsers.push(message.user);
  }
});

function pollResults(message) {
  if (booActivePoll == true) {
    var phrase = 'Poll results!';
    for (var i = 0; i < options.length; i++) {
      phrase += '\n' + options[i] + ' - ' + ((results !== undefined && results[i+1] !== undefined) ? results[i+1] : 0);
    }
    
    bot.reply(message,phrase);

    options = [];
    results = [];
    resultsUsers = [];
    pollChannel, pollUser = {};
    booActivePoll = false;      
  }
}

controller.hears('debug','direct_message',function(bot, message) {
  bot.api.chat.postMessage({ channel:'C0HG8KG4D', text:'ohhh yeah'},function(err,response) {
    if (err) { console.log(err); }
  });

  bot.api.channels.info({ channel:'C0H8K3WES' },function(err,response) {
    if (err) { console.log(err); }
    //console.log(response);
  });
});