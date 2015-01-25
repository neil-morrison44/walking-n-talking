(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Emitter, cmitter = 'emitter'

try {
    Emitter = require(cmitter)
} catch (e) {
    Emitter = require('component-emitter')
}

function Speech (options) {

    // default options
    this.options = {
        debugging: false,
        continuous: false,
        interimResults: false,
        autoRestart: false
    }

    // merge user options
    if (Object.prototype.toString.call(options) === '[object Object]') {
        for (var op in options) {
            this.options[op] = options[op]
        }
    }

    this.active         = false
    this.manualStopped  = false
    this.history        = []
    this.lastIndex      = -1
    this.lastResult     = ''
    this.recognition    = new webkitSpeechRecognition()

    var rec = this.recognition,
        self = this

    rec.continuous = self.options.continuous
    rec.interimResults = self.options.interimResults
    if (options.lang) rec.lang = options.lang

    rec.onstart = function () {
        self.active = true
        this.manualStopped = false
        self.emit('start')
    }

    rec.onresult = function (e) {
        if (!e.results || !e.results.length) return

        var updatedResult = e.results[e.resultIndex],
            transcript = updatedResult[0].transcript.replace(/^\s*/, '')

        // new sentence?
        if (e.resultIndex !== self.lastIndex) {
            self.lastIndex = e.resultIndex
            self.lastResult = ''
        }

        // avoid some redundancy
        if (transcript === self.lastResult && !updatedResult.isFinal) return
        if (transcript.length < self.lastResult.length) return

        self.lastResult = transcript

        if (updatedResult.isFinal) {
            // final sentence! we can do work!
            self.history.push(transcript)
            self.emit('finalResult', transcript)
        } else {
            // interim, let's update stuff on screen
            self.emit('interimResult', transcript)
        }
        
        if (self.options.debugging) {
            console.log(transcript + (updatedResult.isFinal ? ' (final)' : ''))
        }
    }

    rec.onerror = function (e) {
        self.emit('error', e)
    }

    rec.onend = function () {
        self.active = false
        self.history    = []
        self.lastIndex  = -1
        self.lastResult = ''
        self.emit('end')
        if (self.options.autoRestart && !self.manualStopped) {
            self.start()
        }
    }

    Emitter(this)

}

Speech.prototype.start = function () {
    if (this.active) return
    this.recognition.start()
}

Speech.prototype.stop = function () {
    if (!this.active) return
    this.manualStopped = true
    this.recognition.stop()
}

module.exports = Speech
},{"component-emitter":2}],2:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],3:[function(require,module,exports){
var newline = /\n/
var newlineChar = '\n'
var whitespace = /\s/

module.exports = function(text, opt) {
    var lines = module.exports.lines(text, opt)
    return lines.map(function(line) {
        return text.substring(line.start, line.end)
    }).join('\n')
}

module.exports.lines = function wordwrap(text, opt) {
    opt = opt||{}

    //zero width results in nothing visible
    if (opt.width === 0 && opt.mode !== 'nowrap') 
        return []

    text = text||''
    var width = typeof opt.width === 'number' ? opt.width : Number.MAX_VALUE
    var start = Math.max(0, opt.start||0)
    var end = typeof opt.end === 'number' ? opt.end : text.length
    var mode = opt.mode

    var measure = opt.measure || monospace
    if (mode === 'pre')
        return pre(measure, text, start, end, width)
    else
        return greedy(measure, text, start, end, width, mode)
}

function idxOf(text, chr, start, end) {
    var idx = text.indexOf(chr, start)
    if (idx === -1 || idx > end)
        return end
    return idx
}

function isWhitespace(chr) {
    return whitespace.test(chr)
}

function pre(measure, text, start, end, width) {
    var lines = []
    var lineStart = start
    for (var i=start; i<end && i<text.length; i++) {
        var chr = text.charAt(i)
        var isNewline = newline.test(chr)

        //If we've reached a newline, then step down a line
        //Or if we've reached the EOF
        if (isNewline || i===end-1) {
            var lineEnd = isNewline ? i : i+1
            var measured = measure(text, lineStart, lineEnd, width)
            lines.push(measured)
            
            lineStart = i+1
        }
    }
    return lines
}

function greedy(measure, text, start, end, width, mode) {
    //A greedy word wrapper based on LibGDX algorithm
    //https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/BitmapFontCache.java
    var lines = []

    var testWidth = width
    //if 'nowrap' is specified, we only wrap on newline chars
    if (mode === 'nowrap')
        testWidth = Number.MAX_VALUE

    while (start < end && start < text.length) {
        //get next newline position
        var newLine = idxOf(text, newlineChar, start, end)

        //eat whitespace at start of line
        while (start < newLine) {
            if (!isWhitespace( text.charAt(start) ))
                break
            start++
        }

        //determine visible # of glyphs for the available width
        var measured = measure(text, start, newLine, testWidth)

        var lineEnd = start + (measured.end-measured.start)
        var nextStart = lineEnd + newlineChar.length

        //if we had to cut the line before the next newline...
        if (lineEnd < newLine) {
            //find char to break on
            while (lineEnd > start) {
                if (isWhitespace(text.charAt(lineEnd)))
                    break
                lineEnd--
            }
            if (lineEnd === start) {
                if (nextStart > start + newlineChar.length) nextStart--
                lineEnd = nextStart // If no characters to break, show all.
            } else {
                nextStart = lineEnd
                //eat whitespace at end of line
                while (lineEnd > start) {
                    if (!isWhitespace(text.charAt(lineEnd - newlineChar.length)))
                        break
                    lineEnd--
                }
            }
        }
        if (lineEnd >= start) {
            var result = measure(text, start, lineEnd, testWidth)
            lines.push(result)
        }
        start = nextStart
    }
    return lines
}

//determines the visible number of glyphs within a given width
function monospace(text, start, end, width) {
    var glyphs = Math.min(width, end-start)
    return {
        start: start,
        end: start+glyphs
    }
}
},{}],4:[function(require,module,exports){
var Speech, SpeechBubbler, bubble, image, recognizer;

SpeechBubbler = require("./ui/speech_bubbler");

bubble = new SpeechBubbler();

bubble.render("Test message here and here in a new line? How come this is a thing how much text can this thing handle, can it handle a lot of text?");

console.log(bubble.toDataURL());

image = new Image();

image.src = bubble.toDataURL();

document.body.appendChild(image);

Speech = require("speechjs");

recognizer = new Speech({
  debugging: true,
  continuous: true,
  interimResults: true,
  autoRestart: true
});

recognizer.on("finalResult", function(message) {
  bubble.render(message);
  image = new Image();
  image.src = bubble.toDataURL();
  return document.body.appendChild(image);
});

recognizer.start();


},{"./ui/speech_bubbler":5,"speechjs":1}],5:[function(require,module,exports){
var CANVAS_HEIGHT, CANVAS_WIDTH, LINE_HEIGHT, SpeechBubbler, wordWrapper;

CANVAS_WIDTH = 300;

CANVAS_HEIGHT = 500;

LINE_HEIGHT = 25;

wordWrapper = require("word-wrapper");

SpeechBubbler = (function() {
  SpeechBubbler.prototype.canvas = null;

  SpeechBubbler.prototype.context = null;

  SpeechBubbler.prototype.text = null;

  SpeechBubbler.prototype.oneLiner = true;

  SpeechBubbler.prototype.width = null;

  SpeechBubbler.prototype.height = null;

  function SpeechBubbler() {
    this.generateCanvas();
    this.setCanvasStyle();
  }

  SpeechBubbler.prototype.render = function(text) {
    this.text = text;
    this.clear();
    this.measureText();
    this.renderSpeechBubble();
    return this.renderText();
  };

  SpeechBubbler.prototype.clear = function() {
    return this.context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  };

  SpeechBubbler.prototype.getLines = function() {
    return wordWrapper.lines(this.text, {
      width: 17
    });
  };

  SpeechBubbler.prototype.renderText = function() {
    var line, lines, offsetY, text, top, _i, _len, _results;
    this.context.fillStyle = "black";
    lines = this.getLines();
    top = (CANVAS_HEIGHT - 22) - this.height;
    offsetY = 0;
    _results = [];
    for (_i = 0, _len = lines.length; _i < _len; _i++) {
      line = lines[_i];
      text = this.text.substring(line.start, line.end);
      this.context.fillText(text, 22, top + 25 + offsetY);
      _results.push(offsetY += LINE_HEIGHT);
    }
    return _results;
  };

  SpeechBubbler.prototype.measureText = function() {
    var textMeasure;
    textMeasure = this.context.measureText(this.text);
    if (textMeasure.width < (CANVAS_WIDTH - 60)) {
      this.oneLiner = true;
      this.width = textMeasure.width + 60;
      return this.height = LINE_HEIGHT + 8;
    } else {
      this.oneLiner = false;
      this.width = CANVAS_WIDTH;
      return this.height = (this.getLines().length * LINE_HEIGHT) + 8;
    }
  };

  SpeechBubbler.prototype.renderSpeechBubble = function() {
    var top;
    top = (CANVAS_HEIGHT - 22) - this.height;
    this.context.beginPath();
    this.context.moveTo(2, CANVAS_HEIGHT - 2);
    this.context.lineTo(18, CANVAS_HEIGHT - 22);
    this.context.lineTo(8, CANVAS_HEIGHT - 22);
    this.context.lineTo(8, top);
    this.context.lineTo(this.width - 22, top);
    this.context.lineTo(this.width - 22, CANVAS_HEIGHT - 22);
    this.context.lineTo(38, CANVAS_HEIGHT - 22);
    this.context.closePath();
    this.context.fillStyle = "white";
    this.context.fill();
    return this.context.stroke();
  };

  SpeechBubbler.prototype.setCanvasStyle = function() {
    this.context.lineWidth = 2;
    this.context.styleStyle = "black";
    return this.context.font = "18pt monospace";
  };

  SpeechBubbler.prototype.generateCanvas = function() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    return this.context = this.canvas.getContext("2d");
  };

  SpeechBubbler.prototype.toDataURL = function() {
    return this.canvas.toDataURL();
  };

  return SpeechBubbler;

})();

module.exports = SpeechBubbler;


},{"word-wrapper":3}]},{},[4])