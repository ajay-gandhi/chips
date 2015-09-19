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
      throw new Error 'NO_MESSAGE'   if !opts.text
      throw new Error 'NO_RECIPIENT' if !opts.name
    
    .then ->
      switch 'SEND_MESSAGE'
        when 'text'
          imessage.send_message(opts.name, opts.text)
    
    .then (res) ->
      status : 200
      title  : 'Sent'
      body   : 'Messaged ' + res.name + ' saying "' + res.message + '"'
    
    .catch (err) ->
      status : 404
      title  : 'Error'
      body   : err.message

