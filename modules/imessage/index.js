require('coffee-script/register');
var imessage = require('./imessage.coffee');

module.exports = {
  act : function (actn, opts) {
    return Promise.resolve(null).then(function () {
      switch (actn) {
        case 'SEND':
          if (!opts.message)   return new Error('NO_MESSAGE');
          if (!opts.recipient) return new Error('NO_RECIPIENT');
          return imessage
            .send_message(opts.message, opts.recipient)
          break;
      }
    });
  }
}