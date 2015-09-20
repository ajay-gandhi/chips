
var Plant   = require('plant.js'),
    Promise = require('es6-promise').Promise,
    qs      = require('querystring');

module.exports = (function () {

  function FacebookMessenger() {
    this.browser = new Plant();
    this.home = 'https://m.facebook.com';
  }

  /**
   * Initializes the Facebook object by logging into Facebook headlessly
   *
   * @param [Object] conf - An object that supports setting and getting configs
   *
   * @returns Promise - Resolves to the initialized object (self) or rejects
   */
  FacebookMessenger.prototype.init = function (creds) {
    var self = this;

    if (!creds) return new Promise(function (r) { r(false); });

    var proper_props = {
      email: creds.username,
      pass:  creds.password
    }

    var options = {
      url:    self.home + '/login.php',
      body:   qs.stringify(proper_props),
      method: 'POST'
    }

    return new Promise(function (resolve, reject) {
      self.browser
        .visit(options)
        .then(function () {
          return self.browser.visit(self.home);
        }, function (e) {
          if (e.statusCode == 302) {
            return self.browser.visit(self.home);
          } else {
            resolve(false);
          }
        })
        .then(function ($) {
          // Login successful
          if ($('title').text() === 'Facebook') {
            resolve(self);

          // Failed
          } else {
            resolve(false);
          }
        })
        .catch(function (e) {
          resolve(false);
        });
    });
  }

  /**
   * Returns a mapping from commands to their actions. See Annyang docs for more
   * info on commands
   *
   * @returns Object
   */
  FacebookMessenger.prototype.get_commands = function () {
    return {
      'facebook :name *message': 'SEND_MESSAGE',
    }
  }

  /**
   * Conducts the specified action
   */
  FacebookMessenger.prototype.act = function (action, args) {
    var self = this;

    var name = args[0],
        text = args[1];

    return new Promise(function (resolve, reject) {
      self.browser
        .visit(self.home + '/search/?query=' + encodeURIComponent(name))
          .then(function ($) {

            // Visit first profile
            var message_link = $.link('Message', 'div#root td:nth-child(2)');
            return self.browser.visit(self.home + message_link.attr('href'));
          })
          .then(function ($) {

            // Fill message content
            $.by_name('body', 'form#composer_form').val(text);
            var prev_action = $('form#composer_form').attr('action');
            $('form#composer_form').attr('action', self.home + prev_action);
            return self.browser.submit($('form#composer_form'));
          })
          .then(function () {
            resolve({
              status: 200,
              title:  'Sent',
              body:   'Messaged ' + name + ' saying "' + text + '"'
            });
          })
          .catch(function () {
            resolve({
              status: 404,
              title:  'Failed',
              body:   'Message to ' + name + ' failed to send'
            });
          });
    });
  }

  /**
   * Returns a string for identifying this service during login
   */
  FacebookMessenger.prototype.menu_login = function () {
    return 'Facebook';
  }

  return new FacebookMessenger();

})();
