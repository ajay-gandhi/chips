
// Node modules
var Configstore = require('configstore'),
    fs          = require('fs');

// Electron modules
var app           = require('app'),
    BrowserWindow = require('browser-window'),
    ipc           = require('ipc'),
    Tray          = require('tray'),
    Menu          = require('menu');

var conf = new Configstore(require('./package.json').name);

////////////////////////////////// App Window //////////////////////////////////

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var main_window  = null,
    menubar      = null,
    fb_login_win = null;

var menubar_template;

// Quit when all windows are closed.
// app.on('window-all-closed', function() {
//   app.quit();
// });

// Hide dock icon
// app.dock.hide();

app.on('ready', function() {
  // Create the browser window.
  main_window = new BrowserWindow({ width: 800, height: 600 });
  main_window.openDevTools();
  main_window.loadUrl('file://' + __dirname + '/html/index.html');

  main_window.webContents.on('did-finish-load', function () {
    if (conf.get('fb-username')) {
      main_window.webContents.send('hide-facebook');
    }
  });

  // Create menubar
  menubar = new Tray(__dirname + '/icon_small.png');

  menubar_template = [
    {
      label:   'Listening!',
      enabled: false
    },
    {
      id:    'fb-login',
      label: 'Login to Facebook',
      click: fb_login
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      accelerator: 'Command+Q',
      click: function() { app.quit(); }
    },
  ];

  // Remove facebook login option (already logged in)
  if (conf.get('fb-username')) {
    menubar_template = menubar_template.filter(function (menu_item) {
      return (menu_item.id !== 'fb-login');
    });
  }

  var menubar_menu = Menu.buildFromTemplate(menubar_template);
  menubar.setContextMenu(menubar_menu);
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

/////////////////////////////// Other Functions ////////////////////////////////

/**
 * Opens a window to login to Facebook
 */
var fb_login = function () {
  if (!fb_login_win) {
    fb_login_win = new BrowserWindow({ width: 400, height: 400 });
  }

  fb_login_win.openDevTools();
  fb_login_win.loadUrl('file://' + __dirname + '/html/facebook.html');
}

// Attempts to re-require and initialize a module
ipc.on('fb-login', function(event, user, pass) {
  conf.set('fb-username', user);
  conf.set('fb-password', pass);

  var module = require('./modules/facebook/index');
  module
    .init(conf)
    .then(function (initialized) {
      ready_services['facebook'] = initialized;
      fb_login_win.close();

      // Remove facebook login option from menu bar
      var menu_items = menubar_template.filter(function (menu_item) {
        return (menu_item.id !== 'fb-login');
      });

      var menubar_menu = Menu.buildFromTemplate(menu_items);
      menubar.setContextMenu(menubar_menu);
    })
    .catch(function () {
      // Unset in config
      conf.set('fb-username', false);
      conf.set('fb-password', false);

      ready_services['facebook'] = false;
      event.sender.send('fb-login-success', false);
    });
});
