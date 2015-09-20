require('coffee-script/register');

// Node modules
var Configstore = require('configstore'),
    fs          = require('fs');

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
    login_window = null;

var menubar_template,
    current_menu_items;

var ready_services = {};

// Hide dock icon
// app.dock.hide();

app.on('ready', function() {
  // Create the main window
  main_window = new BrowserWindow({
    width:  250,
    height: 300,
    // resizable: false,
    fullscreen: false,
    'title-bar-style': 'hidden'
  });
  main_window.loadUrl('file://' + __dirname + '/html/index.html');

  // Create login window
  login_window = new BrowserWindow({
    width:  250,
    height: 300,
    resizable: false,
    fullscreen: false,
    'title-bar-style': 'hidden'
  });
  login_window.loadUrl('file://' + __dirname + '/html/login.html');
  login_window.hide();

  // Just hide window, never close it
  main_window.on('close', function (e) {
    main_window.hide();
    e.preventDefault();
  });

  // Register a 'ctrl+`' shortcut listener.
  var ret = globalShortcut.register('ctrl+`', function() {
    main_window.show();
  });

  // Create menubar
  menubar = new Tray(__dirname + '/images/icon_smallTemplate.png');
  menubar.setPressedImage(__dirname + '/images/icon_small_white.png');

  menubar_template = [
    {
      label:   'Listening!',
      enabled: false
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

  current_menu_items = menubar_template;

  var menubar_menu = Menu.buildFromTemplate(menubar_template);
  menubar.setContextMenu(menubar_menu);

////////////////////////////// Messaging Modules ///////////////////////////////

  /**
   * Returns a function that displays the login window for this service
   */
  var create_login_requester = function (name) {
    return function () {
      login_window.show();
      login_window.webContents.send('service-name', name);
    }
  }

  var module_dirs = fs.readdirSync(__dirname + '/modules');

  // Ignore dotfiles
  module_dirs = module_dirs.filter(function (path) {
    return (path.charAt(0) !== '.');
  });

  Promise
    .all(module_dirs.map(function (path) {
      var module = require('./modules/' + path + '/index');
      return module.init(conf.get(path));
    }))
    .then(function (all_initialized) {
      all_initialized.forEach(function (initialized, i) {
        ready_services[module_dirs[i]] = initialized;
      });

      // Send ready services to renderer
      var module_commands = {};
      Object.keys(ready_services).forEach(function (service) {
        if (ready_services[service] && ready_services[service].get_commands) {
          module_commands[service] = ready_services[service].get_commands();
        }
      });

      main_window.webContents.send('commands', module_commands);

      // Add menu bar items
      var addl_menu_items = module_dirs.reduce(function (acc, path) {
        var module = require('./modules/' + path + '/index');
        if (module.menu_login && !ready_services[path]) {
          var module_name = module.menu_login();
          return acc.concat({
            id:    module_name,
            label: 'Login to ' + module_name,
            click: create_login_requester(module_name.toLowerCase())
          });
        } else {
          return acc;
        }
      }, []);

      if (addl_menu_items.length) {
        var new_menu_set = menubar_template
          .slice(0, 1)
          .concat({ type: 'separator' })
          .concat(addl_menu_items)
          .concat(menubar_template.slice(1));

        current_menu_items = new_menu_set;
        var new_menu = Menu.buildFromTemplate(new_menu_set);
        menubar.setContextMenu(new_menu);
      }
    });
});


////////////////////////////////// IPC Evensts //////////////////////////////////

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
        } 
        // Send the result, whatever it is
        event.sender.send('response', res);
      });
  }
});

ipc.on('try-login', function (event, service, user, pass) {
  var module = require('./modules/' + service + '/index');

  var creds = {
    username: user,
    password: pass
  }

  module
    .init(creds)
    .then(function (initialized) {
      ready_services[service] = initialized;

      // Save if successful
      if (initialized) {
        conf.set(service, creds);
        login_window.hide();

        // Remove menu bar
        current_menu_items = current_menu_items.filter(function (item) {
          return (item.id !== service);
        });
        var new_menu = Menu.buildFromTemplate(current_menu_items);
        menubar.setContextMenu(new_menu);

        // Send new possible commands
        var new_commands = {};
            new_commands[service] = ready_services[service].get_commands();

        main_window.webContents.send('commands', new_commands);

      } else {
        event.sender.send('login-success', false);
      }
    });
});
