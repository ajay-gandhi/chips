
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

  mainWindow.webContents.on('did-finish-load', function () {
    if (conf.get('fb-username')) {
      mainWindow.webContents.send('hide-facebook');
    }
  });
});

////////////////////////////// Messaging Modules ///////////////////////////////

var ready_services = {};

var module_dirs = fs.readdirSync(__dirname + '/modules');

// Attempt to include messaging modules
module_dirs.forEach(function (path) {
  try {
    var module = require('./modules/' + path + '/index');
    if (module.init) {
      module
        .init(conf)
        .then(function (initialized) {
          ready_services[path] = initialized;
        })
        .catch(function (e) {
          console.error('Error including "' + path + '":', e);
          ready_services[path] = false;
        });
    } else {
      ready_services[path] = module;
    }
  } catch (e) {
    console.error('Error including "' + path + '":', e);
    ready_services[path] = false;
  }
});

////////////////////////////////// IPC Evensts //////////////////////////////////

ipc.on('new-setting', function(event, key, value) {
  conf.set(key, value);
});

ipc.on('send-message', function(event, service, name, message) {
  console.log('Message', name, 'through', service, 'saying', message);

  if (ready_services[service]) {
    ready_services[service]
      .act('text', {
        name: name,
        text: message
      })
      .then(function () {
        event.sender.send('message-sent', true);
      })
      .catch(console.error);
  }
});

// Attempts to re-require and initialize a module
ipc.on('open-module', function(event, service) {
  var module = require('./modules/' + service + '/index');
  if (module.init) {
    module
      .init(conf)
      .then(function () {
        ready_services[service] = module;
      })
      .catch(function () {
        ready_services[service] = false;
      });
  } else {
    ready_services[service] = module;
  }
});
