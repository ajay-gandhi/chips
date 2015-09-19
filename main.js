
// Node modules
var Configstore = require('configstore'),
    fs          = require('fs');

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

var ready_services = {};

var module_dirs = fs.readdirSync(__dirname + '/modules');

// Attempt to include messaging modules
for (var i = 0; i < module_dirs.length; i++) {
  try {
    var module = require('./modules/' + module_dirs[i] + '/index');
    if (module.init) {
      module
        .init(conf)
        .then(function () {
          console.log('good');
          ready_services[module_dirs[i]] = module;
        })
        .catch(function () {
          ready_services[module_dirs[i]] = false;
        });
    } else {
      ready_services[module_dirs[i]] = module;
    }
  } catch (e) {
    console.error('Error including "' + module_dirs[i] + '":', e);
    ready_services[module_dirs[i]] = false;
  }
}

////////////////////////////////// IPC Evensts //////////////////////////////////

ipc.on('new-setting', function(event, key, value) {
  conf.set(key, value);
});

ipc.on('send-message', function(event, service, name, message) {

  if (ready_services[service]) {
    ready_services[service]
      .act('text', {
        name: name,
        text: message
      })
      .then(function (r) {
        event.sender.send('message-sent', true);
      })
      .catch(console.error);
  }
});
