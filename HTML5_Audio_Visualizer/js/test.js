function Song(instruments, bars, startTime, eighthNoteTime) {
  this.instruments = instruments;
  this.bars = bars;
  this.startTime = startTime;
  this.eighthNoteTime = eighthNoteTime;
}
//
Song.prototype.play = function () {
  // TODO get rid of
  // these hardcoded things

  var kick = this.instruments[0];
  var hihat = this.instruments[1];

  var startTime = 0;
  for(var instrument = 0; instrument < this.instruments.length; instrument++) {
    for (var bar = 0; bar < this.bars[instrument].length; bar++) {
      if(this.bars[instrument][bar] == 1) {
        var time = startTime + bar * this.eighthNoteTime;
        playSound(this.instruments[instrument], time);
      }
    }
  }
}

window.onload = init;
var context;
var bufferLoader;

function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
  }

  request.onerror = function() {
    alert('BufferLoader: XHR error');
  }

  request.send();
}

BufferLoader.prototype.load = function() {
  for (var i = 0; i < this.urlList.length; ++i)
  this.loadBuffer(this.urlList[i], i);
}


function init() {
  // Fix up prefixing
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();

  bufferLoader = new BufferLoader(
    context,
    [
      '../CuratedSamples/kick-vinyl01.wav',
      '../CuratedSamples/openhat-808.wav',
    ],
    finishedLoading
    );

  bufferLoader.load();
}

function playSound(buffer, time) {
  var source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(time);
}

function finishedLoading(bufferList) {
  // Create two sources and play them both together.
  var source1 = context.createBufferSource();
  var source2 = context.createBufferSource();
  // source1.buffer = bufferList[0];
  // source2.buffer = bufferList[1];
  source1.buffer = bufferList[0];
  source2.buffer = bufferList[1];
  kick = source1.buffer;
  hihat = source2.buffer;

  var instruments = [ kick, hihat ];
  var startTime = 0;
  var eighthNoteTime = 1;
  var bars =  [
                [1, 0, 1, 0],
                [0, 1, 0, 1]
              ]
  var song = new Song(instruments, bars, startTime, eighthNoteTime);

  song.play();
}
