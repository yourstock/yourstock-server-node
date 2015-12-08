// push.js

module.exports = {
  pushtoall: pushtoall,
}

function pushtoall() {
  var gcm = require('node-gcm');
  mongodb.findall('push_info', function(infos) {
    var message = new gcm.Message({
      collapseKey: 'yourstock',
      delayWhileIdle: true,
      timeToLive: 60,
      data: {
        key1: "test message!",
      },
      notification: {
        title: "Hello, World",
        icon: "ic_launcher",
        body: "This is a notification that will be displayed ASAP."
      },
    });
  });
  var sender = new gcm.Sender('api key');
  var tokens = [];
  for (i in infos) {
    tokens.push(infos[i].reg_id);
  }
  sender.sendNoRetry(message, {registrationTokens: tokens}, function (err, response) {
    if (err) {
      console.error(err);
    } else {
      console.log(response);
    }
  });
}
