
Promise  = (require 'es6-promise').Promise
applescript = require('applescript')
open = require 'open'

Array::random = ->
  @[Math.floor(Math.random() * @length)]


# // Very basic AppleScript command. Returns the song name of each
# // currently selected track in iTunes as an 'Array' of 'String's.
script = 'tell application "iTunes" to get name of selection';


start = -> Promise.resolve null



Array::random = ->
  @[Math.random() * (@length - 1)]

module.exports = 

  init: -> Promise.resolve(@)

  get_commands: ->
    'google *query' : 'OPEN_APP'

  act: (actn, opts) -> new Promise (res, rej) ->
    switch actn
      when 'OPEN_APP'

        query = encodeURIComponent(opts[0])
        open("http://www.google.com/?q=#{query}")

        res {
          status: 200
        }



        # console.log 'asydfoasd'
        # child_process.spawn 
        # exec "open -a Spotify"

        # applescript.execString "osascript -e \"tell application \\\"Safari\\\" to activate\"", (err, res) ->

        # # console.log "osascript -e 'tell application \"#{opts[0]}\" to activate'"
        # # exec "osascript -e \"tell application \\\"#{opts[0]}\\\" to activate\"", (err, stdout, stderr) ->
        # #   console.log err, stdout, stderr
        # #   rej err if err
        # #   res {
        # #     status: 200
        # #     title: 'Open.'
        # #     body: "Opening #{opts[0]}"
        # #   }
