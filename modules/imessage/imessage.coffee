is_phone = require 'is-phone'
control  = require './control'

class iMessage
  constructor: (env) ->

  get_phone: (name) -> new Promise (res, rej) ->
    control 'contacts', ['phone', "'#{name}'"], (err, stdout, stderr) ->
      rej err if err
      res stdout.replace(/\s/g, '')

  send_message: (name, message) ->
    # Make sure we have the phone number
    Promise.resolve(null).then =>
      if is_phone name then name else @get_phone name
    
    # Send the message
    .then (phone) => new Promise (res, rej) ->
      control 'imessage', ['send', phone, "'#{message}'"], ->
        res {status : 'SENT'}
    
    # Catch any errors
    .catch (err) ->
      console.error err

module.exports = new iMessage()
        
# Test
if require.main == module
  module.exports.get_phone('Ajay Gandhi')
  module.exports.send_message('Ajay Gandhi', 'I love you')



