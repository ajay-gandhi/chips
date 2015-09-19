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
<<<<<<< HEAD
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

// Notify user!
// Third argument is either the error (if failed) or the message (if successful)
ipc.on('message-sent', function (success, name, third) {
  ui.wave = 'paused';
  console.log('Message sent success:', success);

  if (success) {
    var notif = {
      title: 'Sent',
      body:  'Messaged ' + name + ' saying "' + third + '"'
    }

  } else {
    var notif = {
      title: 'Sent',
      body:  'Message to ' + name + ' failed to send'
    }
  }

  new Notification(notif.title, notif);

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

// Facebook config exists, hide login
ipc.on('hide-facebook', function () {
  $('div#fb-login-form').hide();
});
