
var ipc = require('ipc');

////////////////////////////////// Messaging ///////////////////////////////////

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
    'testing': function () { console.log('it works'); }
  }

  // Add our commands to annyang
  annyang.addCommands(commands);

  // Start listening.
  annyang.start();
} else {
  console.log('Annyang is not included.');
}

ipc.on('message-sent', function (success) {
  console.log('Message sent success:', success);
});

/////////////////////////////////// Settings ///////////////////////////////////

$(document).ready(function () {
  $('button#fb-submit').click(function (e) {
    e.preventDefault();
    ipc.send('new-setting', 'fb-username', $('input#fb-username').val());
    ipc.send('new-setting', 'fb-password', $('input#fb-password').val());
    ipc.send('open-module', 'facebook');
  });
});
