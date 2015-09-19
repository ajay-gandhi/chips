
// Node modules
var Configstore = require('configstore');

// Electron modules
var app           = require('app'),
    BrowserWindow = require('browser-window'),
    ipc           = require('ipc');

var conf = new Configstore(require('./package.json').name);

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

////////////////////////////// Messaging Modules ///////////////////////////////

var fb = require('./modules/facebook/facebook');

var ready_services = {
  'facebook': false,
  'imessage': false
};

fb
  .init(conf.get('fb_username'), conf.get('fb_password'))
  .then(function () {
    ready_services['facebook'] = true;
  })
  .catch(function () {
    ready_services['facebook'] = false;
  });

////////////////////////////////// IPC Events //////////////////////////////////

ipc.on('new-setting', function(event, key, value) {
  conf.set(key, value);
});

ipc.on('send-message', function(event, service, name, message) {

  if (service === 'facebook' && ready_services['facebook']) {
    fb
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
