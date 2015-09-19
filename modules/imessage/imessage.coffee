is_phone = require 'is-phone'
control  = require './control'

class iMessage
  constructor: (env) ->

  get_phone: (name) -> new Promise (res, rej) ->
    control 'contacts', ['phone', "'#{name}'"], (err, stdout, stderr) ->
      rej err if err
      res stdout.replace(/\s/g, '')

  send_message: (name, message) ->
    Promise.resolve(null).then =>
      if is_phone name then name else @get_phone name
    .then (phone) =>
      control('imessage', ['send', phone, "'#{message}'"], 'log')
    .catch (err) ->
      console.error err

im = new iMessage()

# im.get_phone('Ajay Gandhi')
im.send_message('Ajay Gandhi', 'I love you')

# module.exports =
#   act: (action, opts) -> switch action
#     when 'message'
        
    



