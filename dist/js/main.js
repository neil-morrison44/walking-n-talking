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
/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/sole/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/sole/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */

// Date.now shim for (ahem) Internet Explo(d|r)er
if ( Date.now === undefined ) {

	Date.now = function () {

		return new Date().valueOf();

	};

}

var TWEEN = TWEEN || ( function () {

	var _tweens = [];

	return {

		REVISION: '14',

		getAll: function () {

			return _tweens;

		},

		removeAll: function () {

			_tweens = [];

		},

		add: function ( tween ) {

			_tweens.push( tween );

		},

		remove: function ( tween ) {

			var i = _tweens.indexOf( tween );

			if ( i !== -1 ) {

				_tweens.splice( i, 1 );

			}

		},

		update: function ( time ) {

			if ( _tweens.length === 0 ) return false;

			var i = 0;

			time = time !== undefined ? time : ( typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now() );

			while ( i < _tweens.length ) {

				if ( _tweens[ i ].update( time ) ) {

					i++;

				} else {

					_tweens.splice( i, 1 );

				}

			}

			return true;

		}
	};

} )();

TWEEN.Tween = function ( object ) {

	var _object = object;
	var _valuesStart = {};
	var _valuesEnd = {};
	var _valuesStartRepeat = {};
	var _duration = 1000;
	var _repeat = 0;
	var _yoyo = false;
	var _isPlaying = false;
	var _reversed = false;
	var _delayTime = 0;
	var _startTime = null;
	var _easingFunction = TWEEN.Easing.Linear.None;
	var _interpolationFunction = TWEEN.Interpolation.Linear;
	var _chainedTweens = [];
	var _onStartCallback = null;
	var _onStartCallbackFired = false;
	var _onUpdateCallback = null;
	var _onCompleteCallback = null;
	var _onStopCallback = null;

	// Set all starting values present on the target object
	for ( var field in object ) {

		_valuesStart[ field ] = parseFloat(object[field], 10);

	}

	this.to = function ( properties, duration ) {

		if ( duration !== undefined ) {

			_duration = duration;

		}

		_valuesEnd = properties;

		return this;

	};

	this.start = function ( time ) {

		TWEEN.add( this );

		_isPlaying = true;

		_onStartCallbackFired = false;

		_startTime = time !== undefined ? time : ( typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now() );
		_startTime += _delayTime;

		for ( var property in _valuesEnd ) {

			// check if an Array was provided as property value
			if ( _valuesEnd[ property ] instanceof Array ) {

				if ( _valuesEnd[ property ].length === 0 ) {

					continue;

				}

				// create a local copy of the Array with the start value at the front
				_valuesEnd[ property ] = [ _object[ property ] ].concat( _valuesEnd[ property ] );

			}

			_valuesStart[ property ] = _object[ property ];

			if( ( _valuesStart[ property ] instanceof Array ) === false ) {
				_valuesStart[ property ] *= 1.0; // Ensures we're using numbers, not strings
			}

			_valuesStartRepeat[ property ] = _valuesStart[ property ] || 0;

		}

		return this;

	};

	this.stop = function () {

		if ( !_isPlaying ) {
			return this;
		}

		TWEEN.remove( this );
		_isPlaying = false;

		if ( _onStopCallback !== null ) {

			_onStopCallback.call( _object );

		}

		this.stopChainedTweens();
		return this;

	};

	this.stopChainedTweens = function () {

		for ( var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++ ) {

			_chainedTweens[ i ].stop();

		}

	};

	this.delay = function ( amount ) {

		_delayTime = amount;
		return this;

	};

	this.repeat = function ( times ) {

		_repeat = times;
		return this;

	};

	this.yoyo = function( yoyo ) {

		_yoyo = yoyo;
		return this;

	};


	this.easing = function ( easing ) {

		_easingFunction = easing;
		return this;

	};

	this.interpolation = function ( interpolation ) {

		_interpolationFunction = interpolation;
		return this;

	};

	this.chain = function () {

		_chainedTweens = arguments;
		return this;

	};

	this.onStart = function ( callback ) {

		_onStartCallback = callback;
		return this;

	};

	this.onUpdate = function ( callback ) {

		_onUpdateCallback = callback;
		return this;

	};

	this.onComplete = function ( callback ) {

		_onCompleteCallback = callback;
		return this;

	};

	this.onStop = function ( callback ) {

		_onStopCallback = callback;
		return this;

	};

	this.update = function ( time ) {

		var property;

		if ( time < _startTime ) {

			return true;

		}

		if ( _onStartCallbackFired === false ) {

			if ( _onStartCallback !== null ) {

				_onStartCallback.call( _object );

			}

			_onStartCallbackFired = true;

		}

		var elapsed = ( time - _startTime ) / _duration;
		elapsed = elapsed > 1 ? 1 : elapsed;

		var value = _easingFunction( elapsed );

		for ( property in _valuesEnd ) {

			var start = _valuesStart[ property ] || 0;
			var end = _valuesEnd[ property ];

			if ( end instanceof Array ) {

				_object[ property ] = _interpolationFunction( end, value );

			} else {

				// Parses relative end values with start as base (e.g.: +10, -3)
				if ( typeof(end) === "string" ) {
					end = start + parseFloat(end, 10);
				}

				// protect against non numeric properties.
				if ( typeof(end) === "number" ) {
					_object[ property ] = start + ( end - start ) * value;
				}

			}

		}

		if ( _onUpdateCallback !== null ) {

			_onUpdateCallback.call( _object, value );

		}

		if ( elapsed == 1 ) {

			if ( _repeat > 0 ) {

				if( isFinite( _repeat ) ) {
					_repeat--;
				}

				// reassign starting values, restart by making startTime = now
				for( property in _valuesStartRepeat ) {

					if ( typeof( _valuesEnd[ property ] ) === "string" ) {
						_valuesStartRepeat[ property ] = _valuesStartRepeat[ property ] + parseFloat(_valuesEnd[ property ], 10);
					}

					if (_yoyo) {
						var tmp = _valuesStartRepeat[ property ];
						_valuesStartRepeat[ property ] = _valuesEnd[ property ];
						_valuesEnd[ property ] = tmp;
					}

					_valuesStart[ property ] = _valuesStartRepeat[ property ];

				}

				if (_yoyo) {
					_reversed = !_reversed;
				}

				_startTime = time + _delayTime;

				return true;

			} else {

				if ( _onCompleteCallback !== null ) {

					_onCompleteCallback.call( _object );

				}

				for ( var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++ ) {

					_chainedTweens[ i ].start( time );

				}

				return false;

			}

		}

		return true;

	};

};


TWEEN.Easing = {

	Linear: {

		None: function ( k ) {

			return k;

		}

	},

	Quadratic: {

		In: function ( k ) {

			return k * k;

		},

		Out: function ( k ) {

			return k * ( 2 - k );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
			return - 0.5 * ( --k * ( k - 2 ) - 1 );

		}

	},

	Cubic: {

		In: function ( k ) {

			return k * k * k;

		},

		Out: function ( k ) {

			return --k * k * k + 1;

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
			return 0.5 * ( ( k -= 2 ) * k * k + 2 );

		}

	},

	Quartic: {

		In: function ( k ) {

			return k * k * k * k;

		},

		Out: function ( k ) {

			return 1 - ( --k * k * k * k );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1) return 0.5 * k * k * k * k;
			return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );

		}

	},

	Quintic: {

		In: function ( k ) {

			return k * k * k * k * k;

		},

		Out: function ( k ) {

			return --k * k * k * k * k + 1;

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k * k * k;
			return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );

		}

	},

	Sinusoidal: {

		In: function ( k ) {

			return 1 - Math.cos( k * Math.PI / 2 );

		},

		Out: function ( k ) {

			return Math.sin( k * Math.PI / 2 );

		},

		InOut: function ( k ) {

			return 0.5 * ( 1 - Math.cos( Math.PI * k ) );

		}

	},

	Exponential: {

		In: function ( k ) {

			return k === 0 ? 0 : Math.pow( 1024, k - 1 );

		},

		Out: function ( k ) {

			return k === 1 ? 1 : 1 - Math.pow( 2, - 10 * k );

		},

		InOut: function ( k ) {

			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( ( k *= 2 ) < 1 ) return 0.5 * Math.pow( 1024, k - 1 );
			return 0.5 * ( - Math.pow( 2, - 10 * ( k - 1 ) ) + 2 );

		}

	},

	Circular: {

		In: function ( k ) {

			return 1 - Math.sqrt( 1 - k * k );

		},

		Out: function ( k ) {

			return Math.sqrt( 1 - ( --k * k ) );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
			return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);

		}

	},

	Elastic: {

		In: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );

		},

		Out: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );

		},

		InOut: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
			return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;

		}

	},

	Back: {

		In: function ( k ) {

			var s = 1.70158;
			return k * k * ( ( s + 1 ) * k - s );

		},

		Out: function ( k ) {

			var s = 1.70158;
			return --k * k * ( ( s + 1 ) * k + s ) + 1;

		},

		InOut: function ( k ) {

			var s = 1.70158 * 1.525;
			if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
			return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );

		}

	},

	Bounce: {

		In: function ( k ) {

			return 1 - TWEEN.Easing.Bounce.Out( 1 - k );

		},

		Out: function ( k ) {

			if ( k < ( 1 / 2.75 ) ) {

				return 7.5625 * k * k;

			} else if ( k < ( 2 / 2.75 ) ) {

				return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;

			} else if ( k < ( 2.5 / 2.75 ) ) {

				return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;

			} else {

				return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;

			}

		},

		InOut: function ( k ) {

			if ( k < 0.5 ) return TWEEN.Easing.Bounce.In( k * 2 ) * 0.5;
			return TWEEN.Easing.Bounce.Out( k * 2 - 1 ) * 0.5 + 0.5;

		}

	}

};

TWEEN.Interpolation = {

	Linear: function ( v, k ) {

		var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = TWEEN.Interpolation.Utils.Linear;

		if ( k < 0 ) return fn( v[ 0 ], v[ 1 ], f );
		if ( k > 1 ) return fn( v[ m ], v[ m - 1 ], m - f );

		return fn( v[ i ], v[ i + 1 > m ? m : i + 1 ], f - i );

	},

	Bezier: function ( v, k ) {

		var b = 0, n = v.length - 1, pw = Math.pow, bn = TWEEN.Interpolation.Utils.Bernstein, i;

		for ( i = 0; i <= n; i++ ) {
			b += pw( 1 - k, n - i ) * pw( k, i ) * v[ i ] * bn( n, i );
		}

		return b;

	},

	CatmullRom: function ( v, k ) {

		var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = TWEEN.Interpolation.Utils.CatmullRom;

		if ( v[ 0 ] === v[ m ] ) {

			if ( k < 0 ) i = Math.floor( f = m * ( 1 + k ) );

			return fn( v[ ( i - 1 + m ) % m ], v[ i ], v[ ( i + 1 ) % m ], v[ ( i + 2 ) % m ], f - i );

		} else {

			if ( k < 0 ) return v[ 0 ] - ( fn( v[ 0 ], v[ 0 ], v[ 1 ], v[ 1 ], -f ) - v[ 0 ] );
			if ( k > 1 ) return v[ m ] - ( fn( v[ m ], v[ m ], v[ m - 1 ], v[ m - 1 ], f - m ) - v[ m ] );

			return fn( v[ i ? i - 1 : 0 ], v[ i ], v[ m < i + 1 ? m : i + 1 ], v[ m < i + 2 ? m : i + 2 ], f - i );

		}

	},

	Utils: {

		Linear: function ( p0, p1, t ) {

			return ( p1 - p0 ) * t + p0;

		},

		Bernstein: function ( n , i ) {

			var fc = TWEEN.Interpolation.Utils.Factorial;
			return fc( n ) / fc( i ) / fc( n - i );

		},

		Factorial: ( function () {

			var a = [ 1 ];

			return function ( n ) {

				var s = 1, i;
				if ( a[ n ] ) return a[ n ];
				for ( i = n; i > 1; i-- ) s *= i;
				return a[ n ] = s;

			};

		} )(),

		CatmullRom: function ( p0, p1, p2, p3, t ) {

			var v0 = ( p2 - p0 ) * 0.5, v1 = ( p3 - p1 ) * 0.5, t2 = t * t, t3 = t * t2;
			return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + v0 * t + p1;

		}

	}

};

module.exports=TWEEN;
},{}],4:[function(require,module,exports){
var ua = typeof window !== 'undefined' ? window.navigator.userAgent : ''
  , isOSX = /OS X/.test(ua)
  , isOpera = /Opera/.test(ua)
  , maybeFirefox = !/like Gecko/.test(ua) && !isOpera

var i, output = module.exports = {
  0:  isOSX ? '<menu>' : '<UNK>'
, 1:  '<mouse 1>'
, 2:  '<mouse 2>'
, 3:  '<break>'
, 4:  '<mouse 3>'
, 5:  '<mouse 4>'
, 6:  '<mouse 5>'
, 8:  '<backspace>'
, 9:  '<tab>'
, 12: '<clear>'
, 13: '<enter>'
, 16: '<shift>'
, 17: '<control>'
, 18: '<alt>'
, 19: '<pause>'
, 20: '<caps-lock>'
, 21: '<ime-hangul>'
, 23: '<ime-junja>'
, 24: '<ime-final>'
, 25: '<ime-kanji>'
, 27: '<escape>'
, 28: '<ime-convert>'
, 29: '<ime-nonconvert>'
, 30: '<ime-accept>'
, 31: '<ime-mode-change>'
, 27: '<escape>'
, 32: '<space>'
, 33: '<page-up>'
, 34: '<page-down>'
, 35: '<end>'
, 36: '<home>'
, 37: '<left>'
, 38: '<up>'
, 39: '<right>'
, 40: '<down>'
, 41: '<select>'
, 42: '<print>'
, 43: '<execute>'
, 44: '<snapshot>'
, 45: '<insert>'
, 46: '<delete>'
, 47: '<help>'
, 91: '<meta>'  // meta-left -- no one handles left and right properly, so we coerce into one.
, 92: '<meta>'  // meta-right
, 93: isOSX ? '<meta>' : '<menu>'      // chrome,opera,safari all report this for meta-right (osx mbp).
, 95: '<sleep>'
, 106: '<num-*>'
, 107: '<num-+>'
, 108: '<num-enter>'
, 109: '<num-->'
, 110: '<num-.>'
, 111: '<num-/>'
, 144: '<num-lock>'
, 145: '<scroll-lock>'
, 160: '<shift-left>'
, 161: '<shift-right>'
, 162: '<control-left>'
, 163: '<control-right>'
, 164: '<alt-left>'
, 165: '<alt-right>'
, 166: '<browser-back>'
, 167: '<browser-forward>'
, 168: '<browser-refresh>'
, 169: '<browser-stop>'
, 170: '<browser-search>'
, 171: '<browser-favorites>'
, 172: '<browser-home>'

  // ff/osx reports '<volume-mute>' for '-'
, 173: isOSX && maybeFirefox ? '-' : '<volume-mute>'
, 174: '<volume-down>'
, 175: '<volume-up>'
, 176: '<next-track>'
, 177: '<prev-track>'
, 178: '<stop>'
, 179: '<play-pause>'
, 180: '<launch-mail>'
, 181: '<launch-media-select>'
, 182: '<launch-app 1>'
, 183: '<launch-app 2>'
, 186: ';'
, 187: '='
, 188: ','
, 189: '-'
, 190: '.'
, 191: '/'
, 192: '`'
, 219: '['
, 220: '\\'
, 221: ']'
, 222: "'"
, 223: '<meta>'
, 224: '<meta>'       // firefox reports meta here.
, 226: '<alt-gr>'
, 229: '<ime-process>'
, 231: isOpera ? '`' : '<unicode>'
, 246: '<attention>'
, 247: '<crsel>'
, 248: '<exsel>'
, 249: '<erase-eof>'
, 250: '<play>'
, 251: '<zoom>'
, 252: '<no-name>'
, 253: '<pa-1>'
, 254: '<clear>'
}

for(i = 58; i < 65; ++i) {
  output[i] = String.fromCharCode(i)
}

// 0-9
for(i = 48; i < 58; ++i) {
  output[i] = (i - 48)+''
}

// A-Z
for(i = 65; i < 91; ++i) {
  output[i] = String.fromCharCode(i)
}

// num0-9
for(i = 96; i < 106; ++i) {
  output[i] = '<num-'+(i - 96)+'>'
}

// F1-F24
for(i = 112; i < 136; ++i) {
  output[i] = 'F'+(i-111)
}

},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
var Character, SpeechBubbler, TWEEN,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

SpeechBubbler = require("../ui/speech_bubbler");

TWEEN = require("tween.js");

Character = (function() {
  Character.prototype.id = null;

  Character.prototype.bubbler = null;

  Character.prototype.messageTimeout = null;

  Character.prototype.characterMesh = null;

  Character.prototype.speechBubbleMesh = null;

  Character.prototype.characterMaterial = null;

  Character.prototype.characterSpeechGroup = null;

  function Character(scene) {
    this.clearMessage = __bind(this.clearMessage, this);
    var characterGeometry, characterTexture, speechGeometry;
    this.bubbler = new SpeechBubbler();
    this.speechTexture = new THREE.Texture(this.bubbler.canvas);
    this.speechTexture.needsUpdate = true;
    characterTexture = new THREE.ImageUtils.loadTexture('images/character-forward.png');
    characterTexture.minFilter = characterTexture.magFilter = THREE.NearestFilter;
    this.characterMaterial = new THREE.MeshBasicMaterial({
      map: characterTexture,
      side: THREE.DoubleSide
    });
    this.characterMaterial.transparent = true;
    characterGeometry = new THREE.PlaneGeometry(25, 35, 1, 1);
    this.characterMesh = new THREE.Mesh(characterGeometry, this.characterMaterial);
    this.characterMesh.position.set(-100, 17, 0);
    this.speechMaterial = new THREE.MeshBasicMaterial({
      map: this.speechTexture,
      side: THREE.DoubleSide
    });
    this.speechMaterial.transparent = true;
    speechGeometry = new THREE.PlaneGeometry(50, 80, 1, 1);
    this.speechMesh = new THREE.Mesh(speechGeometry, this.speechMaterial);
    this.speechMesh.position.set(-70, 17 + 35 + 15, 1);
    this.characterSpeechGroup = new THREE.Object3D();
    this.characterSpeechGroup.add(this.characterMesh);
    this.characterSpeechGroup.add(this.speechMesh);
    scene.add(this.characterSpeechGroup);
    window.CSG = this.characterSpeechGroup;
  }

  Character.prototype.randomisePosition = function() {
    this.characterSpeechGroup.position.x = (Math.random() * 100) - 50;
    return this.characterSpeechGroup.position.z = (Math.random() * 100) - 50;
  };

  Character.prototype.getPosition = function() {
    return {
      x: this.characterSpeechGroup.position.x,
      z: this.characterSpeechGroup.position.z
    };
  };

  Character.prototype.setPosition = function(data) {
    this.characterSpeechGroup.position.x = data.x;
    return this.characterSpeechGroup.position.z = data.z;
  };

  Character.prototype.moveToPosition = function(position) {
    this.characterSpeechGroup.position.x = position.x;
    return this.characterSpeechGroup.position.z = position.z;
  };

  Character.prototype.moveDelta = function(x, z) {
    this.characterSpeechGroup.position.x += x;
    return this.characterSpeechGroup.position.z += z;
  };

  Character.prototype.sayMessage = function(text) {
    this.bubbler.render(text);
    return this.speechTexture.needsUpdate = true;
  };

  Character.prototype.clearMessage = function() {
    this.bubbler.clear();
    return this.speechTexture.needsUpdate = true;
  };

  return Character;

})();

module.exports = Character;


},{"../ui/speech_bubbler":12,"tween.js":3}],7:[function(require,module,exports){
var Character, CharacterPool;

Character = require("./character");

CharacterPool = (function() {
  CharacterPool.prototype.currentCharacters = [];

  CharacterPool.prototype.scene = null;

  function CharacterPool(scene) {
    this.scene = scene;
  }

  CharacterPool.prototype.byId = function(id) {
    var character, _ref;
    return (_ref = (function() {
      var _i, _len, _ref1, _results;
      _ref1 = this.currentCharacters;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        character = _ref1[_i];
        if (character.id === id) {
          _results.push(character);
        }
      }
      return _results;
    }).call(this)) != null ? _ref[0] : void 0;
  };

  CharacterPool.prototype.createCharacter = function(data) {
    var newCharacter;
    newCharacter = new Character(this.scene);
    this.currentCharacters.push(newCharacter);
    newCharacter.id = data.char_id;
    newCharacter.setPosition(data.position);
    console.log("character created");
    return newCharacter;
  };

  return CharacterPool;

})();

module.exports = CharacterPool;


},{"./character":6}],8:[function(require,module,exports){
var PubNubManager,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

PubNubManager = (function() {
  function PubNubManager() {
    this.sendOnConnect = __bind(this.sendOnConnect, this);
    this.onConnectSend = __bind(this.onConnectSend, this);
    this.publish = __bind(this.publish, this);
    this.handleMessage = __bind(this.handleMessage, this);
    this.pubnub = PUBNUB.init({
      publish_key: 'pub-c-825171df-922e-4a9c-811c-eb24de90556c',
      subscribe_key: 'sub-c-9d224ea2-a591-11e4-8f9e-0619f8945a4f',
      ssl: true
    });
    this.pubnub.subscribe({
      channel: "walking-n-talking",
      message: this.handleMessage,
      connect: this.sendOnConnect,
      presence: console.log
    });
    this.publishDebounced = _.debounce(this.publish, 50);
  }

  PubNubManager.pubnub = null;

  PubNubManager.connectData = null;

  PubNubManager.handler = null;

  PubNubManager.prototype.handleMessage = function(message, env, channel) {
    return typeof this.handler === "function" ? this.handler(message) : void 0;
  };

  PubNubManager.prototype.publish = function(data) {
    return this.pubnub.publish({
      channel: "walking-n-talking",
      message: data
    });
  };

  PubNubManager.prototype.uuid = function() {
    return this._uuid || (this._uuid = this.pubnub.uuid());
  };

  PubNubManager.prototype.onConnectSend = function(data) {
    return this.connectData = data;
  };

  PubNubManager.prototype.sendOnConnect = function() {
    if (this.connectData) {
      return this.publish(this.connectData);
    }
  };

  return PubNubManager;

})();

module.exports = PubNubManager;


},{}],9:[function(require,module,exports){
var Character, CharacterPool, DataSync, SceneManager, Speech, SpeechBubbler, char1, characterPool, currentImage, dataSync, initCanvas, pressedKeys, recognizer, sceneManager, startingPosition, vkey;

SpeechBubbler = require("./ui/speech_bubbler");

initCanvas = require("./ui/init_canvas");

vkey = require("vkey");

CharacterPool = require("./characters/pool");

SceneManager = require("./scene_manager");

Character = require("./characters/character");

initCanvas();

sceneManager = new SceneManager();

window.requestAnimationFrame(sceneManager.render);

char1 = new Character(sceneManager.scene);

window.char1 = char1;

char1.randomisePosition();

startingPosition = char1.getPosition();

sceneManager.focusCameraOn(startingPosition.x, startingPosition.z);

if (window.webkitSpeechRecognition) {
  Speech = require("speechjs");
  recognizer = new Speech({
    debugging: true,
    continuous: true,
    interimResults: true,
    autoRestart: true,
    pfilter: false
  });
  currentImage = null;
  recognizer.on("interimResult", function() {});
  recognizer.on("finalResult", function(message) {
    char1.sayMessage(message);
    return dataSync.publish({
      char_id: dataSync.uuid(),
      action: "talk",
      text: message
    });
  });
  recognizer.start();
}

pressedKeys = {};

document.body.addEventListener('keydown', function(ev) {
  return pressedKeys[vkey[ev.keyCode]] = true;
});

document.body.addEventListener('keyup', function(ev) {
  return delete pressedKeys[vkey[ev.keyCode]];
});

window.setInterval(function() {
  var charPos, x, z;
  if (pressedKeys['W']) {
    z = -1;
  } else if (pressedKeys['S']) {
    z = 1;
  } else {
    z = 0;
  }
  if (pressedKeys['A']) {
    x = -1;
  } else if (pressedKeys['D']) {
    x = 1;
  } else {
    x = 0;
  }
  if (!(x === 0 && z === 0)) {
    char1.moveDelta(x, z);
    charPos = char1.getPosition();
    sceneManager.focusCameraOn(charPos.x, charPos.z);
    return dataSync.publishDebounced({
      char_id: dataSync.uuid(),
      action: "walk",
      position: charPos
    });
  }
}, 16);

DataSync = require("./data_sync");

window.dataSync = dataSync = new DataSync();

characterPool = new CharacterPool(sceneManager.scene);

dataSync.handler = function(message) {
  var character;
  if (message.char_id === dataSync.uuid()) {
    return;
  }
  character = characterPool.byId(message.char_id);
  character || (character = characterPool.createCharacter(message));
  if (message.action === "create") {
    characterPool.createCharacter(message);
  }
  if (message.action === "walk") {
    character.moveToPosition(message.position);
  }
  if (message.action === "talk") {
    return character.sayMessage(message.text);
  }
};

dataSync.onConnectSend({
  char_id: dataSync.uuid(),
  action: "create",
  position: char1.getPosition()
});


},{"./characters/character":6,"./characters/pool":7,"./data_sync":8,"./scene_manager":10,"./ui/init_canvas":11,"./ui/speech_bubbler":12,"speechjs":1,"vkey":4}],10:[function(require,module,exports){
var SceneManager, TWEEN,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

TWEEN = require("tween.js");

SceneManager = (function() {
  SceneManager.prototype.canvas = null;

  SceneManager.prototype.scene = null;

  SceneManager.prototype.renderer = null;

  SceneManager.prototype.camera = null;

  SceneManager.prototype.stopped = false;

  function SceneManager() {
    this.render = __bind(this.render, this);
    this.captureCanvas();
    this.createScene();
    this.createRenderer();
    this.createGroundAndSky();
  }

  SceneManager.prototype.captureCanvas = function() {
    return this.canvas = document.getElementById("worldCanvas");
  };

  SceneManager.prototype.render = function(time) {
    if (!this.stopped) {
      window.requestAnimationFrame(this.render);
    }
    TWEEN.update(time);
    return this.renderer.render(this.scene, this.camera);
  };

  SceneManager.prototype.createScene = function() {
    var ASPECT, FAR, NEAR, SCREEN_HEIGHT, SCREEN_WIDTH, VIEW_ANGLE;
    this.scene = new THREE.Scene();
    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;
    VIEW_ANGLE = 30;
    ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
    NEAR = 0.1;
    FAR = 20000;
    this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    this.scene.add(this.camera);
    this.camera.position.set(0, 75, 400);
    return this.camera.lookAt(this.scene.position);
  };

  SceneManager.prototype.createGroundAndSky = function() {
    var floor, floorGeometry, floorMaterial, skyBox, skyBoxGeometry, skyBoxMaterial;
    floorMaterial = new THREE.MeshBasicMaterial({
      color: "green",
      side: THREE.DoubleSide
    });
    floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.5;
    floor.rotation.x = Math.PI / 2;
    this.scene.add(floor);
    skyBoxGeometry = new THREE.BoxGeometry(10000, 10000, 10000);
    skyBoxMaterial = new THREE.MeshBasicMaterial({
      color: 0x9999ff,
      side: THREE.BackSide
    });
    skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
    this.scene.add(skyBox);
    return this.scene.fog = new THREE.FogExp2(0x9999ff, 0.0015);
  };

  SceneManager.prototype.focusCameraOn = function(x, z) {
    return this.camera.position.set(x - 100, 75, 250 + z);
  };

  SceneManager.prototype.createRenderer = function() {
    return this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.canvas
    });
  };

  return SceneManager;

})();

module.exports = SceneManager;


},{"tween.js":3}],11:[function(require,module,exports){
module.exports = function() {
  var worldCanvas;
  worldCanvas = document.getElementById("worldCanvas");
  worldCanvas.setAttribute("width", window.innerWidth);
  return worldCanvas.setAttribute("height", window.innerHeight);
};


},{}],12:[function(require,module,exports){
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


},{"word-wrapper":5}]},{},[9])