
var ipc = require('ipc');

var send_dummy = function (n, s) {
  send_message(n, 'chavez', 'hello wordl', s);
}

var send_message = function (name, last, message, service) {
  var full_name = name + ' ' + last;
  service = service.toLowerCase();

  if (service === 'facebook' || service === 'face book') {
    ipc.send('send-message', 'facebook', full_name, message);

  } else if (service === 'imessage') {
    ipc.send('send-message', 'imessage', full_name, message);
  }
}

if (annyang) {
  var commands = {
    'message :name :last saying :message through :service': send_dummy,
    'message :name through :service': send_dummy,
    'testing': function () { console.log('it works') }
  }

  // Add our commands to annyang
  annyang.addCommands(commands);

  // Start listening.
  annyang.start();
} else {
  console.log('Annyang is not included.');
}
