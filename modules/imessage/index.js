require('coffee-script/register');
var imessage = require('./imessage.coffee'),
    Promise  = require('es6-promise').Promise;

module.exports = {
  act : function (actn, opts) {
    return Promise.resolve(null).then(function () {
      switch (actn) {
        case 'text':
          if (!opts.text) return new Error('NO_MESSAGE');
          if (!opts.name) return new Error('NO_RECIPIENT');
          return imessage
            .send_message(opts.name, opts.text)
          break;
      }
    });
  }
}