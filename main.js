'use strict';
/* global require, console, __dirname */
require('coffee-script/register');

// Node modules
var Configstore = require('configstore'),
    fs          = require('fs'),
    say         = require('say');

// Electron modules
var app            = require('app'),
    BrowserWindow  = require('browser-window'),
    ipc            = require('ipc'),
    Tray           = require('tray'),
    Menu           = require('menu'),
    globalShortcut = require('global-shortcut');

var conf = new Configstore(require('./package.json').name);

////////////////////////////////// App Window //////////////////////////////////

// Keep a global reference of the objects that are created later
// If you don't, they will be closed automatically bc garbage collection
var main_window  = null,
    menubar      = null,
    fb_login_win = null;

var menubar_template;

// Hide dock icon
app.dock.hide();

app.on('ready', function() {
  // Create the main window.
  main_window = new BrowserWindow({
    width:  250,
    height: 300,
    'title-bar-style': 'hidden'
  });
  main_window.loadUrl('file://' + __dirname + '/html/index.html');

  // Hide Facebook login if already logged in
  main_window.webContents.on('did-finish-load', function () {
    if (conf.get('fb-username')) {
      main_window.webContents.send('hide-facebook');
    }
  });

  // Just hide window, never close it
  main_window.on('close', function (e) {
    main_window.hide();
    e.preventDefault();
  });

  // Register a 'ctrl+`' shortcut listener.
  var ret = globalShortcut.register('ctrl+`', toggle_window);

  // Create menubar
  menubar = new Tray(__dirname + '/images/icon_smallTemplate.png');
  menubar.setPressedImage(__dirname + '/images/icon_small_white.png');

  menubar_template = [
    {
      label   : 'Listening!',
      enabled : false
    },
    { id      : 'show-window',
      label   : 'Show window...',
      click   : toggle_window
    },
    { type    : 'separator' },
    

    { id:    'fb-login',
      label: 'Login to Facebook',
      click: fb_login
    },
    { type: 'separator'},


    { label: 'Quit',
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

var ready_services = {},
    module_dirs     = fs.readdirSync(__dirname + '/modules');

// Ignore dotfiles
module_dirs = module_dirs.filter(function (path) {
  return (path.charAt(0) !== '.');
});


Promise

  // Initialize all modules
  .all(module_dirs.map(function (path) {
    var module = require('./modules/' + path + '/index');
    return module.init(conf);
  }))

  // Make sure they all initialized well
  .then(function (all_initialized) {
    all_initialized.forEach(function (initialized, i) {
      if (initialized) {
        ready_services[module_dirs[i]] = initialized;
      } else {
        ready_services[module_dirs[i]] = false;
      }
    });

    // Send ready services to renderer
    var module_commands = {};
    Object.keys(ready_services).forEach(function (service) {
      if (ready_services[service] && ready_services[service].get_commands) {
        module_commands[service] = ready_services[service].get_commands();
      }
    });
    main_window.webContents.send('commands', module_commands);
  });


////////////////////////////////// IPC Evensts //////////////////////////////////

// Updates persistent config
// ipc.on('new-setting', function(event, key, value) {
//   conf.set(key, value);
// });

// Receives a request to send a message, params are self-explanatory
ipc.on('action', function (event, args) {

  console.log('Service:',  args['module'],
              '\nAction:', args['action'],
              '\nArgs:',   args['args'],
              '\n');

  var service = ready_services[args['module']];

  // Only continue if requested service is ready
  if (service) {
    service
      .act(args['action'], args['args'])
      .then(function (res) {
        if (res.status === 404) {
          console.error(res);
        } else {
          if (res.body) say.speak('Daniel', res.body);
        }

        // Send the result, whatever it is
        event.sender.send('response', res);
      });
  }
});

/////////////////////////////// Other Functions ////////////////////////////////

var toggle_window = function () {
  if (main_window.isVisible()) { main_window.hide(); }
  else { main_window.show(); }
};

/**
 * Opens a window to login to Facebook
 */
var fb_login = function () {
  if (!fb_login_win) {
    fb_login_win = new BrowserWindow({ width: 400, height: 400 });
  }
  fb_login_win.loadUrl('file://' + __dirname + '/html/facebook.html');
};

// Attempts to re init FB module
ipc.on('fb-login', function(event, user, pass) {
  conf.set('fb-username', user);
  conf.set('fb-password', pass);

  var module = require('./modules/facebook/index');
  module
    .init(conf)
    .then(function (initialized) {
      // Success!
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
      // Failure
      // Unset in config
      conf.set('fb-username', false);
      conf.set('fb-password', false);

      ready_services['facebook'] = false;
      event.sender.send('fb-login-success', false);
    });
});
