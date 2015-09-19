is_phone = require 'is-phone'
control  = require './control'

class iMessage
  constructor: (env) ->

  get_imessage_address: (name) -> new Promise (res, rej) ->
    control 'contacts', ['general', "'#{name}'"], (err, stdout, stderr) ->
      rej err if err
      console.error stderr if stderr
      stdout = stdout
        .split(', ')
        .filter((x) -> !!x)[0]
        .replace(/\s/g, '')
        .replace(/\,/g, '')
        .replace(/\)/g, '')
        .replace(/\(/g, '')
        .replace(/\+/g, '')
        .replace(/\-/g, '')
      res stdout

  send_message: (name, message) -> 
    Promise.resolve(null)
    # Make sure we have the phone number
    .then   () => (@get_imessage_address name)
    .then (im) => new Promise (res, rej) ->
      message = message.replace("'", "\'")
      control 'imessage', ['send', im, "'#{message}'"], (err) ->
        rej err if err
        res {status : 'SENT'}
    
    # Catch any errors
    .catch (err) ->
      console.error err

module.exports = new iMessage()
        
# Test
if require.main == module
  # module.exports.get_imessage_address('Bodas').then console.log
  module.exports.send_message('Bodas', '<3').then console.log



