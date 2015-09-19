is_phone = require 'is-phone'
control  = require './control'

start = -> Promise.resolve null

class iMessage
  constructor: (env) ->

  get_imessage_address: (name) -> new Promise (res, rej) ->
    control 'contacts', ['general', "'#{name}'"], (err, stdout, stderr) ->
      rej err if err
      try
        console.error stderr if stderr
        stdout = stdout
          .split(', ')
          .filter((x) -> !!x)[0]

        rej new Error('No imid') if !stdout

        stdout = stdout
          .replace(/\s/g, '')
          .replace(/\,/g, '')
          .replace(/\)/g, '')
          .replace(/\(/g, '')
          .replace(/\+/g, '')
          .replace(/\-/g, '')

        rej new Error('No imid') if !stdout
        res stdout
      catch e
        rej e
      

  send_message: (name, message) ->
    console.log 'asdfyasdf'
    Promise.resolve(null)
    # Make sure we have the im
    .then   () => @get_imessage_address name
    

    .then (im) => new Promise (res, rej) ->
      message = message.replace("'", "\'")
      control 'imessage', ['send', im, "'#{message}'"], (err) ->
        rej err if err
        res
          status : 'SENT'
          name : name
          message : message

module.exports = new iMessage()
        
# Test
if require.main == module
  # module.exports.get_imessage_address('Bodas').then console.log
  module.exports.send_message('Bodas', '<3').then console.log



