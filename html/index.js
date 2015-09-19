
var ipc = require('ipc');

var send_message = function (name, last, message, service) {
  var full_name = name + ' ' + last;
  service = service.toLowerCase();

  if (service === 'facebook' || service === 'face book') {
    ipc.send('send-message', 'facebook', full_name, message);

  } else if (service === 'imessage') {
    ipc.send('send-message', 'imessage', full_name, message);
  }
}

setTimeout(function () {
  send_message('kevin', 'chavez', 'hello wordl', 'facebook');
}, 5000);

ipc.on('message-sent', function (success) {
  console.log('message sent:', success);
});
// if (annyang) {
//   var commands = {
//     'message :name :last saying :message through :service': send_message,
//   }

//   // Add our commands to annyang
//   annyang.addCommands(commands);

//   // Start listening.
//   annyang.start();
// }
