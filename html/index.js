
var ipc = require('ipc');

////////////////////////////////// Messaging ///////////////////////////////////

var send_message = function (service, name, message) {
  var full_name = name;
  service = service.toLowerCase();

  if (service === 'facebook' || service === 'face book') {
    ipc.send('send-message', 'facebook', full_name, message);

  } else if (service === 'imessage') {
    ipc.send('send-message', 'imessage', full_name, message);
  }
}

if (annyang) {
  var commands = {
    ':service :name *message': send_message,
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

var isReady = false,
    hideFb  = false;

$(document).ready(function () {
  $('button#fb-submit').click(function (e) {
    e.preventDefault();
    ipc.send('new-setting', 'fb-username', $('input#fb-username').val());
    ipc.send('new-setting', 'fb-password', $('input#fb-password').val());
    ipc.send('open-module', 'facebook');
  });
});

// Facebook config exists, hide login
ipc.on('hide-facebook', function () {
  $('div#fb-login-form').hide();
});
