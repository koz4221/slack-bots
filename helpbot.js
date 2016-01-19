if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('../lib/Botkit.js');
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

var helpOptions = [
  {
    keys:['get started', 'getstarted', 'onboard'],
    response: function(user){
      return user.profile.first_name + ' I\'m here to help! I... don\'t actually do anything yet though.';
    }
  }
];

function isHelpOption(str){
  return helpOptions.filter(function(option,i){
    return option.keys.indexOf(str) > -1;
  });
}

function getResponse(str){
  var option = isHelpOption(str);

  return option.length ? option[0].response : false;

}



controller.hears(['help'],'direct_message,direct_mention,mention',function(bot,message) {

  var recipient;
  // figure out who to direct help to.
  var response;

  var nextCommand = message.text.getNextWord('help');

  if ( nextCommand == 'me') {

    recipient = getUserById(message.user);

  } else if ( isUser( parseName( nextCommand ) ) ) {
    recipient = getUserById( parseName( nextCommand ) );
  } else if ( isHelpOption(nextCommand) ) {
    response = getResponse(nextCommand);
  } else {
    // invalid command
    return false;
  }

  // if we have a user but no response, attempt to interpret remainder of string as requested response
  response = response || getResponse( message.text.split('help ' + nextCommand + ' ')[1] );
  
  if (!response) {
    // Invalid command if we still don't have a response
    bot.reply( message, 'You did not specify a response -- list available responses' );
    return;
  }

  bot.reply( message, response(recipient) );
});

controller.hears(['insult'],'direct_message,direct_mention,mention',function(bot,message) {

  var recipient = parseName( message.text.getNextWord('insult') );
  console.log(recipient);
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

