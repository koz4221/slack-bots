if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('lib/Botkit.js');
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

function updateStorage() {
  bot.api.users.list({},function(err,json){
    Storage.users = json.members;
  });
}


var buildGetUser = function(prop) {
  return function(val) {
    return Storage.users.filter(function(user,i){
      if (user[prop] == val){
        console.log('found');
        console.log('user');
        return user;
      }
    })[0];
  };
};

var getUserById = buildGetUser('id');
// name here means their slack name e.g. "mike"
var getUserByName = buildGetUser('name');

var parseName = function(fullmsg) {
  // strip command
  var msg = '';
  fullmsg.toString();
  msg = fullmsg.substr(fullmsg.indexOf(' ') + 1);
  msg = msg.indexOf(' ') > -1 ? msg.substr(0, ' ') : msg;
  if (msg == 'me' || msg.indexOf('@') < 0) {
    return msg;
  } else {
    // strip angle brackets and @ from user name
    msg = msg.substr(2);
    msg = msg.substr(0, msg.length -1);

    return msg;
  }

};

function getRandomArrayValue(arr) {
  var index = Math.floor( Math.random() * (arr.length) );
  console.log(index);
  return arr[index];
}

var insults = [
  'you are a ninny.',
  'you\'re tacky and I hate you.',
  'you have a very punchable face.',
  'your presence offends me.',
  'you smell like farts.',
  'I was having a great day until I saw your face.',
  'you\'re about as sharp as a bowling ball.',
  'I bet you won most likely to drink out of the toilet in your high school class',
  'you are the worst',
  'I hear the only place you\'re ever invited is outside.',
  'you strike me as a bed wetter.',
  'you have the IQ of a baked potato'
];
var compliments = [
  'you have great hair.',
  'you\'re beautiful. Never change.',
  'you have impeccable manners',
  'on a scale of 1 to 10, you are an 11',
  'you bring out the best in other people.',
  'everything would be better if more people were like you!',
  'you\'re a candle in the darkness.',
  'you\'re more fun than bubble wrap.',
  'you\'re really something special.',
  'you have all of the qualities I am looking for in a human host.',
  'you light up any room you\re in',
  'I think you could be president some day.'
];

updateStorage();

controller.hears(['update storage'],'direct_message',function(bot,message) {
  updateStorage();
});

controller.hears(['insult'],'direct_message,direct_mention,mention',function(bot,message) {

  var recipient;
  var person = parseName(message.text);
  console.log(person);
  if (person == 'me') {
    recipient = getUserById(message.user).profile.first_name;
  } else if ( person ) {
    recipient = getUserById(person).profile.first_name;
  } else {
    recipient = person;
  }

  bot.reply(message, recipient + ' ' + getRandomArrayValue(insults));
});
controller.hears(['compliment'],'direct_message,direct_mention,mention',function(bot,message) {
  
  var recipient;
  var person = parseName(message.text);
  console.log(person);
  if (person == 'me') {
    recipient = getUserById(message.user).profile.first_name;
  } else if ( person ) {
    recipient = getUserById(person).profile.first_name;
  } else {
    recipient = person;
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

    controller.storage.users.get(message.user,function(err, user) {
        if (user && user.name) {
            bot.reply(message,'Hello ' + user.name + '!!');
        } else {
            bot.reply(message,message);
        }
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
Status API Training Shop Blog About Pricing
© 2016 GitHub, Inc. Terms Privacy Security Contact Help
