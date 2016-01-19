// bot helper functions

function buildGetUser (prop, bot) {
  return function(val) {
    return bot.storage.users.filter(function(user,i){
      if (user[prop] == val){
        return user;
      }
    })[0];
  };
}

// help @name "command" ||
// help "command"

// ^ both valid
// need to get second word and test if it is a name.
// if not a name, interpret remander of string as command
// if name, go interpret remainder after second word as command.

var BotFunctions = function(bot) {

  String.prototype.getNextWord = function(prevWord){
    var w = '';

    if (this.indexOf(' ') < 0) {return null; }

    if (prevWord) {
      w = this.split(prevWord + ' ')[1];
      console.log(w);
      console.log(w.substr(0, ' '));
      return w.indexOf(' ') > -1 ? w.substr(0, w.indexOf(' ')) : w;
    } else {
      w = this.substr(this.indexOf(' ') + 1);
      console.log(w);
      return w.indexOf(' ') > -1 ? w.substr(0, w.indexOf(' ')) : w;
    }
  };
  global.getUserById = buildGetUser('id', bot);
  global.getUserByName = buildGetUser('name', bot);

  global.parseName = function(str, command) {

    if (!str) {return null;}
    var name;
    
    if (str == 'me' || str.indexOf('<') < 0) {
      return str;
    } else {
      // strip angle brackets and @ from user name
      name = str.substr(2);
      name = name.substr(0, name.length -1);
      return name;
    }
  };
  
  global.isUser = function(str, prop){
    prop = prop || 'id';

    return bot.storage.users.filter(function(user,i){
        return user[prop] == str;
    }).length;
  };

  global.getRandomArrayValue = function(arr) {
    return arr[Math.floor( Math.random() * (arr.length) )];
  };

};

module.exports = BotFunctions;