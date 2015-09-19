'use strict';
/* global require, console, annyang, window, $ */

var ipc = require('ipc');
var ui = {
  wave : 'listening'
}

////////////////////////////////// Messaging ///////////////////////////////////

var message_service = function (service) {
  return function (n, m) {
    console.log(service, n, m);
    ipc.send('send-message', service, n, m);
  };
};

if (annyang) {
  var commands = {
    'facebook :name *message': message_service('facebook'),
    'imessage :name *message': message_service('imessage'),
    'testing': function () { console.log('it works'); }
  };

  // Add commands and start annyang
  annyang.addCommands(commands);
  annyang.start();

} else {
  console.log('Annyang is not included.');
}

ipc.on('message-sent', function (success) {
  ui.wave = 'paused';
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
