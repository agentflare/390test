var sampleArray =
[
  '../CuratedSamples/kick-vinyl01.wav',
  '../CuratedSamples/openhat-808.wav',
  '../CuratedSamples/FatboyTight-c3.wav',
  '../CuratedSamples/FatboyTight-cs3.wav',
  '../CuratedSamples/FatboyTight-d3.wav',
  '../CuratedSamples/FatboyTight-ds3.wav',
  '../CuratedSamples/FatboyTight-e3.wav',
  '../CuratedSamples/FatboyTight-f3.wav',
  '../CuratedSamples/FatboyTight-fs3.wav',
  '../CuratedSamples/FatboyTight-g3.wav',
  '../CuratedSamples/FatboyTight-gs3.wav',
  '../CuratedSamples/FatboyTight-a4.wav',
  '../CuratedSamples/FatboyTight-as4.wav',
  '../CuratedSamples/FatboyTight-b4.wav'
];

function Song(instruments, bars, startTime, eighthNoteTime) {
  this.instruments = instruments;
  this.bars = bars;
  this.startTime = startTime;
  this.eighthNoteTime = eighthNoteTime;
}
//
Song.prototype.play = function () {
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

// window.onload = init;

document.getElementById("click").onclick = init;

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

var automata = automata;

function init() {
  // Fix up prefixing
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();

  bufferLoader = new BufferLoader(
    context,
    sampleArray,
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
  var sources = [];
  var instruments = [];

  for( var i = 0; i < sampleArray.length; i++) {
    sources.push(context.createBufferSource());
    sources[i] = bufferList[i];
    instruments.push(sources[i]);
  }
  sources[0].buffer = bufferList[0];
  sources[1].buffer = bufferList[1];
  kick = sources[0].buffer;
  hihat = sources[1].buffer;

  var startTime = 0;
  var eighthNoteTime = 0.5;
  var bars =  [
                [], // kick
                [], // open hat
                [], // bass C
                [], // bass C#
                [], // bass D
                [], // bass D#
                [], // bass E
                [], // bass F
                [], // bass F#
                [], // bass G
                [], // bass G#
                [], // bass A
                [], // bass A#
                [], // bass B
              ];

  // for(var i = 0; i < 16; i++) {
  //   bars[0][i] = 1;
  // }
  // for(var i = 1; i < 2; i++) {
  //   // process bars in 4:4 time, repeat drum patterns in sets of 4 going ABAC
  //   var A = [];
  //   var B = [];
  //   var C = [];
  //
  //   // Generate an A
  //   for(var j = 0; j < 4; j++ ) {
  //     A[j] = 1;
  //   }
  //   // Generate B
  //   for(var j = 0; j < 4; j++) {
  //     B[j] = Math.floor(Math.random()*2);
  //   }
  //   // Generate C
  //   for(var j = 0; j < 4; j++) {
  //     C[j] = Math.floor(Math.random()*2);
  //   }
  //
  //   bars[i] = bars[i].concat(A);
  //   bars[i] = bars[i].concat(B);
  //   bars[i] = bars[i].concat(A);
  //   bars[i] = bars[i].concat(C);
  // }
  // console.log(bars);

  // some cellular automata stuff since ML is hard
  // for (var i = 0; i < 10; i ++) {
  //
  // }

  var radix = 2;
  var rule = 73;
  var optString = automata.stringify(rule, radix);

  var initialConditions = function() { return Math.floor(Math.random() * radix); };
  var lifeFunction = automata.generate(optString, radix);
  var row = automata.initialRow(bars.length, initialConditions);
  var wrap = function() { return 0; }

  var nextRow = row;

  for (var n = 0; n < 20; n++) {
    nextRow = automata.cellularlyAutomate(nextRow, wrap, lifeFunction);
    bars[n] = nextRow;
  }
  console.log(bars);

  var song = new Song(instruments, bars, startTime, eighthNoteTime);

  song.play();
}
