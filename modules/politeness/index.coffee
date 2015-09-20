Promise  = (require 'es6-promise').Promise

start = -> Promise.resolve null

Array::random = ->
  @[Math.floor(Math.random() * @length)]

module.exports = 

  init: -> Promise.resolve(@)

  get_commands: ->
    'thank you'   : "NO_PROBLEM"
    'how are you' : "IM_GOOD"
    'hello'       : "GREET"
    'hi'          : "GREET"
    'yo'          : "GREET_COOL"


  act: (actn, opts) ->
    start().then ->
      switch actn
        when 'IM_GOOD'
          return {
            status: 200
            title: 'Good'
            body: [
              "I\'m good, thank you for asking."
              "Pretty good. Thanks."
              "Good."
            ].random()
          }
        when 'NO_PROBLEM'
          return {
            status: 200
            title: 'No problem'
            body: [
              'It is my pleasure.'
              'The pleasure is mine.'
              'No problem.'
            ].random()
          }
        when 'GREET'
          return {
            status: 200
            title: 'Hello'
            body: [
              'Hello.'
              'Hi.'
              'Hey.'
            ].random()
          }
        when 'GREET_COOL'
          return {
            status: 200
            title: 'Hello'
            body: [
              'Sup homie.'
              "What's poppin'."
              'Bro.'
            ].random()
          }


