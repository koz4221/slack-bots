/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
          \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
           \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

This bot demonstrates many of the core features of Botkit:

* Connect to Slack using the real time API
* Receive messages based on "spoken" patterns
* Reply to messages
* Use the conversation system to ask questions
* Use the built in storage system to store and retrieve information
  for a user.

# RUN THE BOT:

  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Run your bot from the command line:

    token=<MY TOKEN> node bot.js

# USE THE BOT:

  Find your bot inside Slack to send it a direct message.

  Say: "Hello"

  The bot will reply "Hello!"

  Say: "who are you?"

  The bot will tell you its name, where it running, and for how long.

  Say: "Call me <nickname>"

  Tell the bot your nickname. Now you are friends.

  Say: "who am I?"

  The bot will tell you your nickname, if it knows one for you.

  Say: "shutdown"

  The bot will ask if you are sure, and then shut itself down.

  Make sure to invite your bot into other channels using /invite @<my bot>!

# EXTEND THE BOT:

  Botkit is has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('./lib/Botkit.js');
var os = require('os');

var controller = Botkit.slackbot({
    //debug: true,
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

var Storage = {
  users: {}
};

// look into:::
// botkit.memory_store
var x;
bot.api.channels.info({id: 'C0H8QK0SV'},function(a,json){
  console.log(json);
});
bot.api.users.list({},function(a,json){

  json.members.forEach(function(user,i) {
    if (!user.is_bot) {
      Storage.users[user.id] = {
        name:user.name,
        first_name: user.profile.first_name,
        last_name: user.profile.last_name,
        real_name: user.profile.real_name,
        real_name_normalized: user.profile.real_name_normalized,
        email:user.profile.email
      };
    }
  });
  Storage.users.raw = json.members;

});

controller.hears(['update storage'],'direct_message',function(bot,message) {
  bot.api.users.list({},function(a,json){
      json.members.forEach(function(user,i) {
        if (!user.is_bot) {
          Storage.users[user.id] = {
            name:user.name,
            first_name: user.profile.first_name,
            last_name: user.profile.last_name,
            real_name: user.profile.real_name,
            real_name_normalized: user.profile.real_name_normalized,
            email:user.profile.email
          };
        }
      });
    });
});
var insults = [
  'you are a loser.',
  'you\'re tacky and I hate you.',
  'you have a very punchable face.',
  'your presence offends me.'
];
var compliments = [
  'you have great hair.',
  'you\'re beautiful. Never change.',
  'you have impeccable manners',
  'on a scale of 1 to 10, you are an 11'
];

function getRandomArrayValue(arr) {
  var index = Math.floor( Math.random() * (arr.length) );
  console.log(index);
  return arr[index];
}

var parseName = function(fullmsg) {
  // strip command
  fullmsg.toString();
  var msg = '';
  msg = fullmsg.substr(fullmsg.indexOf(' ') + 1);
  msg = msg.indexOf(' ') > -1 ? msg.substr(0, ' ') : msg;
  if (msg == 'me') {
    return msg;
  } else {
    msg = msg.substr(2);
    msg = msg.substr(0, msg.length -1);

    return msg;
  }

};
var getUserByName = function(name){
  var currentUser = {};
  // strip @ from name
  name = name.indexOf('@') > -1 ? name.substr(1) : name;

  Storage.users.raw.forEach(function(user,i){
    //console.log(user.name);
    if (user.name == name){
      currentUser = user;
      return;
    }
  });

  return currentUser;
};

controller.hears(['insult'],'direct_message,direct_mention,mention',function(bot,message) {
  //var person = Storage.users[message.user];

  var recipient;
  var person;
  if (parseName(message.text) == 'me') {
    recipient = Storage.users[message.user].first_name;
  } else if ( parseName(message.text) ) {
    console.log(parseName(message.text));
    person = Storage.users[parseName(message.text)];
    console.log(person);
    recipient = person.first_name;
  } else {
    // fail if no recipient
    return;
  }

  bot.reply(message, recipient + ' ' + getRandomArrayValue(insults));
});
controller.hears(['compliment'],'direct_message,direct_mention,mention',function(bot,message) {
  var recipient;
  var person;
  if (parseName(message.text) == 'me') {
    recipient = Storage.users[message.user].first_name;
  } else if ( parseName(message.text) ) {
    console.log(parseName(message.text));
    person = Storage.users[parseName(message.text)];
    console.log(person);
    recipient = person.first_name;
  } else {
    // fail if no recipient
    return;
  }

  bot.reply(message, recipient + ' ' + getRandomArrayValue(compliments));
});
controller.hears(['my info'],'direct_message,direct_mention,mention',function(bot,message) {
  var person = Storage.users[message.user];
  bot.reply(message, 'Your name is ' + person.first_name + ' ' + person.last_name + ', your slack username is ' + person.name + ' and your account email is ' + person.email );
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

console.log(message);
    controller.storage.users.get(message.user,function(err, user) {
        if (user && user.name) {
            bot.reply(message,'Hello ' + user.name + '!!');
        } else {
            bot.reply(message,message);
        }
    });
});

controller.hears(['call me (.*)'],'direct_message,direct_mention,mention',function(bot, message) {
    var matches = message.text.match(/call me (.*)/i);
    var name = matches[1];
    controller.storage.users.get(message.user,function(err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user,function(err, id) {
            bot.reply(message,'Got it. I will call you ' + user.name + ' from now on.');
        });
    });
});

controller.hears(['what is my name','who am i'],'direct_message,direct_mention,mention',function(bot, message) {

    controller.storage.users.get(message.user,function(err, user) {
        if (user && user.name) {
            bot.reply(message,'Your name is ' + user.name);
        } else {
            bot.reply(message,'I don\'t know yet!');
        }
    });
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


controller.hears(['uptime','identify yourself','who are you','what is your name'],'direct_message,direct_mention,mention',function(bot, message) {

    var hostname = os.hostname();
    var uptime = formatUptime(process.uptime());

    bot.reply(message,':robot_face: I am a bot named <@' + bot.identity.name + '>. I have been running for ' + uptime + ' on ' + hostname + '.');

});

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}
