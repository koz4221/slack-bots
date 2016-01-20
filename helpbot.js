if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('./lib/Botkit.js');
var BotStorage = require('./storage.js');

var os = require('os');

var controller = Botkit.slackbot({
    //debug: true,
});

var helpbot = controller.spawn({
    token: process.env.token
}).startRTM();

var BotFunctions = require('./functions.js');


helpbot.storage = BotStorage(helpbot);
helpbot.options = [
  ["get started"]
];

// add helper functions to global scope
require('./functions.js')(helpbot);

controller.hears(['update storage'],'direct_message',function(bot,message) {
  helpbot.storage.update();
});
var glossary = [
  '*/away:* Toggle your "away" status.',
  '*/dnd [time]:* Enable "do not disturb" mode for a specified time.',
  '*/invite @user [channel]:* Invite another member to a channel.',
  '*/keys:* Open the keyboard shortcuts dialog.',
  '*/msg or /dm:*  Send a private message to another user.',
  '*/mute:* Mute a channel or unmute a channel that is muted.',
  '*/remind me in [time] to [message]:* Set a slackbot reminder that will send youa  direct message at the time you specify. Date should be formatted MM/DD/YYYY.',
  '*/who:* List users in the current channel.',
  '',
  'See even more options here: https://get.slack.help/hc/en-us/articles/201259356-Using-slash-commands'
];

var helpOptions = [
  {
    keys:['get started', 'getstarted', 'onboard'],
    description: 'Get help configuring Slack for an optimal experience.',
    response: function(user){
      // events:
      // Download the app
      // Join a channel
      // 
      return user.profile.first_name + ' I\'m here to help! I... don\'t actually do anything yet though.';
    }
  },
  {
    keys:['glossary', 'command glossary'],
    description: 'Display a list of some of Slack\'s helpful commands.',
    response: function(user){
      return user.profile.first_name + ' here are some helpful slack commands:\n\n' + glossary.join('\n') ;
    }
  },
  {
    keys:['how to', 'how to use slack'],
    description: 'Help bot will tell you how we use Slack here at Certify!',
    response: function(user){
      return user.profile.first_name + ' I\'m here to help! I... don\'t actually do anything yet though.';
    }
  }
];

var optionsList = (function(){
  var x = helpOptions.map( function(option,i) {
    return '"*' + option.keys[0] + '*:" ' + option.description;
  });

  return x.join('\n');
})();

function getHelpOption(str){
  return helpOptions.filter(function(option,i){
    return option.keys.indexOf(str) > -1;
  })[0];
}

function getResponse(str){
  var option = getHelpOption(str);

  return option ? option.response : false;

}
controller.hears(['help'],'direct_message,direct_mention,mention',function(bot,message) {

  var recipient;
  // figure out who to direct help to.
  var response;

  var nextCommand = message.text.getNextWord('help');

  // handle first word after 'help' command.
  if ( nextCommand == 'me') {
    recipient = getUserById(message.user);
  }

  else if ( isUser( parseName( nextCommand ) ) ) {
    recipient = getUserById( parseName( nextCommand ) );
    response = getResponse( message.text.split('help ' + nextCommand + ' ')[1] );
  }

  else if ( getHelpOption(message.text.split('help ')[1]) ) {
    response = getResponse(message.text.split('help ')[1]);
  }

  // check for valid response. If we don't have one yet, attempt to parse
  // remainder of string as response.
  response = response || getHelpOption(message.text.split('help ')[1]);
  recipient = recipient || getUserById(message.user);

  if (!response) {
    // Invalid command if we still don't have a response
    bot.reply(message,'You did not specify a valid action. Choose from one of the following options by typing @helpbot help [action]... \n\n' + optionsList );
    return;
  }

  console.log('final response is');
  console.log(response);

  bot.reply( message, response(recipient) );
});

controller.hears(['insult'],'direct_message,direct_mention,mention',function(bot,message) {

  var recipient = parseName( message.text.getNextWord('insult') );
  if (recipient == 'me') {
    recipient = getUserById(message.user).profile.first_name;
  } else if ( getUserById(recipient) ) {
    // to do: fix this to correct direct typed @usernames
    recipient = getUserById(recipient).profile.first_name;
  } else if (recipient){
    recipient = message.text.split('insult ')[1];
  } else {
    // must specify recipient
    return;
  }

  bot.reply(message, recipient + ' ' + getRandomArrayValue(helpbot.storage.insults));
});


controller.hears(['compliment'],'direct_message,direct_mention,mention',function(bot,message) {
  
  var recipient = parseName( message.text.getNextWord('compliment') );

  if (recipient == 'me') {
    recipient = getUserById(message.user).profile.first_name;
  } else if ( getUserById(recipient) ) {
    // to do: fix this to correct direct typed @usernames
    recipient = getUserById(recipient).profile.first_name;
  } else if (recipient){
    recipient = message.text.split('compliment ')[1];
  } else {
    // must specify recipient
    return;
  }

  bot.reply(message, recipient + ' ' + getRandomArrayValue(helpbot.storage.compliments));
});

controller.hears(['hello','hi'],'direct_message,direct_mention,mention',function(bot, message) {
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    },function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(',err);
        }
    });

    var recipient = getUserById(message.user).profile.first_name;
    
    bot.reply(message,'Hello ' + recipient + '!!');

});


controller.hears(['shutdown'],'direct_message,direct_mention,mention',function(bot, message) {

    bot.startConversation(message,function(err, convo) {
        convo.ask('Are you sure you want me to shutdown?',[
            {
                pattern: bot.utterances.yes,
                callback: function(response, convo) {
                    convo.say('Bye!');
                    convo.next();
                    setTimeout(function() {
                        process.exit();
                    },3000);
                }
            },
        {
            pattern: bot.utterances.no,
            default: true,
            callback: function(response, convo) {
                convo.say('*Phew!*');
                convo.next();
            }
        }
        ]);
    });
});

