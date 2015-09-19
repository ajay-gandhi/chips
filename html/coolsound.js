'use strict';
/* global Path, Point, Group, view, alert */

/**
 * [getEqualizerBands description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
var getEqualizerBands = function (data) {
  var bands = [];
  var amount = Math.sqrt(data.length) / 2;
  for (var i = 0; i < amount; i++) {
    var start = Math.pow(2, i) - 1;
    var end = start * 2 + 1;
    var sum = 0;
    for (var j = start; j < end; j++) {
      sum += data[j];
    }
    var avg = sum / (255 * (end - start));
    bands[i] = Math.sqrt(avg / Math.sqrt(2));
  }
  return bands;
};

/**
 * [init_the_thing description]
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
var init_the_thing = function(e) {
  var leftPath = new Path({
    strokeColor: 'red',
    opacity: 0.5
  });

  var rightPath = new Path({
   strokeColor: 'green',
   opacity: 0.5
  });

  var paths = [leftPath, rightPath];

  var amount = 8;
  var step = view.size.width / (amount + 1);
  var flip = true;

  for (var i = 0; i <= amount; i++) {
   leftPath.add(new Point(i * step, 0));
   rightPath.add(new Point(i * step, 0));
  }

  var group = new Group({
    children: [leftPath, rightPath],
    transformContent: false,
    strokeWidth: 20,
    strokeJoin: 'round',
    strokeCap: 'round',
    pivot: leftPath.position,
    position: view.center
  });

  var audio, source, analyserL, analyserR, freqByteData, audioInput;

  view.onFrame = function() {
    var step = view.size.width / (amount + 1);
    var scale = view.size.height / 1.75;
    analyserL.getByteFrequencyData(freqByteData);
    var leftBands = getEqualizerBands(freqByteData, true);
    analyserR.getByteFrequencyData(freqByteData);
    var rightBands = getEqualizerBands(freqByteData, true);
    for (var i = 1; i <= amount; i++) {
      leftPath.segments[i].point = [i * step, -leftBands[i - 1] * scale];
      rightPath.segments[i].point = [i * step, -rightBands[i - 1] * scale * (flip ? -1 : 1)];
    }
    leftPath.smooth();
    rightPath.smooth();
    group.pivot = [leftPath.position.x, 0];
    group.position = view.center;
  };

  // Pause animation until we have data
  view.pause();

  var AudioContext = window.AudioContext || window.webkitAudioContext;
  if (AudioContext) {
    audio = new AudioContext();
    audioInput = audio.createMediaStreamSource(e);
  
    // Create two separate analyzers for left and right channel.
    analyserL = audio.createAnalyser();
    analyserL.smoothingTimeConstant = 0.25;
    analyserL.fftSize = Math.pow(2, amount) * 2;
    analyserR = audio.createAnalyser();
    analyserR.smoothingTimeConstant = analyserL.smoothingTimeConstant;
    analyserR.fftSize = analyserL.fftSize;
   
    // Create the buffer to receive the analyzed data.
    freqByteData = new Uint8Array(analyserL.frequencyBinCount);
    // Create a splitter to feed them both
    var splitter = audio.createChannelSplitter();
    // Connect audio processing graph
    audioInput.connect(splitter);
    splitter.connect(analyserL, 0, 0);
    splitter.connect(analyserR, 1, 0);
    // Connect source to output also so we can hear it
    // audioInput.connect(audio.destination);
    view.play();

  } else {
   // TODO: Print error message
   alert('Audio not supported');
  }
};

// Hah, classic
if (!navigator.getUserMedia) navigator.getUserMedia = 
  navigator.getUserMedia || navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia || navigator.msGetUserMedia;

if (navigator.getUserMedia) {
  navigator.getUserMedia({ audio:true }, init_the_thing, alert);
} else {
  alert('getUserMedia not supported in this browser.');
}
