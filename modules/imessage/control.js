'use strict';
/* global require, module, console, __dirname */

var exec    = require('child_process').exec;

module.exports = function (file, args, cb) {
  if (args === null || args === undefined) {
    args = []
  }

  if (cb === 'log') {
    cb = function (err, stdout, stderr) {
      console.log('stout: ' + stdout);
      console.log('stderr: ' + stderr);
    };
  }

  if (!cb) cb = function () {};

  console.log('osascript ' + 
         (__dirname + '/'+ file + '.scpt').replace(' ', '\\ ') +
         ' ' + args.join(' '));

  exec('osascript ' + 
         (__dirname + '/'+ file + '.scpt').replace(' ', '\\ ') +
         ' ' + args.join(' ').replace('\n', '')
      , cb);
};