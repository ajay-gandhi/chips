imessage = (require './imessage.coffee')
Promise  = (require 'es6-promise').Promise

start = -> Promise.resolve null

module.exports = 

  init: -> Promise.resolve(@)

  get_commands: ->
    'imessage :name *text': "SEND_MESSAGE"

  act: (actn, opts) ->
    start()

    .then ->
      throw new Error 'NO_MESSAGE'   if !opts[0]
      throw new Error 'NO_RECIPIENT' if !opts[1]
    
    .then ->
      switch actn
        when 'SEND_MESSAGE'
          imessage.send_message(opts[0], opts[1])
    
    .then (res) ->
      status : 200
      title  : 'Sent'
      body   : 'Messaged ' + res.name + ' saying "' + res.message + '"'
    
    .catch (err) ->
      status : 404
      title  : 'Error'
      body   : err.message

