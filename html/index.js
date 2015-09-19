
var ipc = require('ipc');

////////////////////////////////// Messaging ///////////////////////////////////

if (annyang) {
  var commands = {
    'facebook :name *message': function (n, m) {
      ipc.send('send-message', 'facebook', n, m);
    },
    'imessage :name *message': function (n, m){
      ipc.send('send-message', 'imessage', n, m);
    },
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
