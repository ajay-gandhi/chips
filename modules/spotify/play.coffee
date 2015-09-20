
control = require('./control');
rp = require 'request-promise'

module.exports = (title) ->
  console.log title, 'http://ws.spotify.com/search/1/track.json?q=' + (encodeURIComponent title)
  rp('http://ws.spotify.com/search/1/track.json?q=' + (encodeURIComponent title))
    .then (data) ->
      console.log 'data'
      JSON.parse(data).tracks[0]
    .then (track) ->
      if track is undefined
        return {
          status : 404
        }
      else
        control('playinalbum', track.href + ' ' + track.album.href)
        return {
          status : 200
          track : track
        }
  
