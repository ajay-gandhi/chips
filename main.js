
var app           = require('app'),
    BrowserWindow = require('browser-window'),
    ipc           = require('ipc');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  app.quit();
});

app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 800, height: 600 });
  mainWindow.openDevTools();
  mainWindow.loadUrl('file://' + __dirname + '/html/index.html');
});

// Initialize Facebook messager
var fb_config = require('./test.json'),
    fb_msg    = require('./facebook');

fb_msg.init(fb_config.username, fb_config.password);

ipc.on('send-message', function(event, service, name, message) {

  if (service === 'facebook') {
    fb_msg
      .act('message', {
        name: name,
        text: message
      })
      .then(function () {
        event.sender.send('message-sent', true);
      })
      .catch(console.error);
  }

});
