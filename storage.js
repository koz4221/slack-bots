
var BotStorage = function(bot) {
  var botstorage = {
    users:[],
    channels:[],
    insults: [
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
      'you have the IQ of a baked potato',
      'you look like someone who eats food off the floor.'
    ],
    compliments: [
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
      'I think you could be president some day.',
      'you smell wonderful'
    ]
  };
  function storeUsers (){
    bot.api.users.list({},function(err,json){
      if (err) { console.log(err); }
      botstorage.users = json.members;
    });
  }

  function storeChannels() {
    bot.api.channels.list({},function(err,json){
      if (err) { console.log(err); }
      botstorage.channels = json.channels;
    });
  }

  botstorage.update = function() {
    storeUsers();
    storeChannels();
  };
  
  botstorage.getChannel = function(chan, cb) {
    for(var i = 0; i < botstorage.channels.length; i++) {
      if (botstorage.channels[i].name == chan) {
        cb(botstorage.channels[i].id);
      }
    }
  }

  // init storage
  storeUsers();
  storeChannels();

  return botstorage;
};

module.exports = BotStorage;