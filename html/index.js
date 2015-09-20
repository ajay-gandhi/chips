'use strict';
/* global require, console, annyang, window, $ */

var ipc = require('ipc');
var ui = {
  wave : 'listening'
}

////////////////////////////////// Messaging ///////////////////////////////////

if (annyang) {

  // Receive the modules' commands
  ipc.on('commands', function (modules) {

    var commands = {};
    Object.keys(modules).forEach(function (mkey) {
      Object.keys(modules[mkey]).forEach(function (c) {
        commands[c] = function () {
          var args = Array.prototype.slice.call(arguments);

          $('div#status').prepend("<p>" + c.split(' ')[0] + ' ' + args.join(' ') + "</p>" );

          ipc.send('action', {
            'module': mkey,
            'action': modules[mkey][c],
            'args'  : args
          });
        }
      });
    });

    // Add our commands to annyang
    annyang.addCommands(commands);

  });

  // Start listening.
  annyang.start();

} else {
  console.log('Annyang is not included.');
}

// Notify user!
ipc.on('response', function (res) {
  new Notification(res.title, res);
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
