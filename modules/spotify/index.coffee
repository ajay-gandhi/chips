Promise  = (require 'es6-promise').Promise
play = require './play'
control = require './control'

start = -> Promise.resolve null

Array::random = ->
  @[Math.floor(Math.random() * @length)]

module.exports = 

  init: -> Promise.resolve(@)

  get_commands: ->
    'play *song'  : "PLAY"
    'play'        : "PLAY/PAUSE"
    'pause'       : "PLAY/PAUSE"
    'skip'        : "NEXT"
    'next'        : "NEXT"
    'go back'     : "PREV"
    'previous'    : "PREV"
    'what is playing' : "INFO"
    "what's playing"  : "INFO"



  act: (actn, opts) ->
    start()
    .then ->
      switch actn
        when 'PLAY'
          (play opts[0]).then (res) ->
            if res.status is 200
              return {
                status: 200
                title: 'Playing'
                body: [
                  "#{res.track.artists[0].name} - #{res.track.name}"
                ].random()
              }
            else
              return {
                status: 404
                title: 'Track not found'
                body: [
                  "No track for #{opts[0]}"
                ].random()
              }
        when 'PLAY/PAUSE'
          (control 'play/pause')
          return {
            status : 200
          }
        
        when 'NEXT'
          (control 'next')
          return {
            status : 200
          }
        when 'PREV'
          (control 'prev')
          return {
            status : 200
          }
        when 'INFO'
          new Promise (res, rej) ->
            control 'info', null, (err, stdout, stderr) ->
              info = stdout.split('\n').reduce (acc, x) ->
                x = x.split(':').map (s) -> s.trim()
                acc[x[0]] = x[1]
                acc
              , {}

              res {
                status : 200
                title : 'Now Playing'
                body : "#{info.Artist} - #{info.Track}"

              }

