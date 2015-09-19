
var Plant   = require('plant.js'),
    Promise = require('es6-promise').Promise,
    qs      = require('querystring');

module.exports = (function () {

  function FacebookMessenger() {
    this.browser = new Plant();
    this.email;
    this.home = 'https://m.facebook.com';
  }

  FacebookMessenger.prototype.init = function (conf) {
    var self = this;

    var creds = {
      email: conf.get('username'),
      pass:  conf.get('password')
    }

    var options = {
      url:    self.home + '/login.php',
      body:   qs.stringify(creds),
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
            reject();
          }
        })
        .then(function ($) {
          // Confirm login
          if ($('title').text() === 'Facebook') {
            self.email = email;
            resolve();
          } else {
            reject();
          }
        })
        .catch(function (e) {
          console.error(e);
          reject(e);
        });
    });
  }

  FacebookMessenger.prototype.act = function (action, opts) {
    var self = this;

    return new Promise(function (resolve, reject) {
      self.browser
        .visit(self.home + '/search/?query=' + encodeURIComponent(opts.name))
          .then(function ($) {

            // Visit first profile
            var message_link = $.link('Message', 'div#root td:nth-child(2)');
            return self.browser.visit(self.home + message_link.attr('href'));
          })
          .then(function ($) {

            // Fill message content
            $.by_name('body', 'form#composer_form').val(opts.text);
            var prev_action = $('form#composer_form').attr('action');
            $('form#composer_form').attr('action', self.home + prev_action);
            return self.browser.submit($('form#composer_form'));
          })
          .then(function () {
            resolve();
          })
          .catch(function (e) {
            console.error(e);
            reject();
          });
    });
  }

  return new FacebookMessenger();

})();
