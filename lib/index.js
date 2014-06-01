// Load modules

var Events = require('events');
var Hoek = require('hoek');


// Declare internals

var internals = {};


exports = module.exports = internals.Divider = function () {

    this._sources = [];
    this._handlers = {};

    Events.EventEmitter.call(this);
};

Hoek.inherits(internals.Divider, Events.EventEmitter);


internals.Divider.prototype.addEmitter = function (emitter) {

    var self = this;

    this._sources.push(emitter);
    var types = Object.keys(this._events);
    for (var i = 0, il = types.length; i < il; ++i) {
        var type = types[i];
        emitter.on(type, this._handler(type));
    }
};


internals.Divider.prototype._handler = function (type) {

    var self = this;

    if (this._handlers[type]) {
        return this._handlers[type];
    }

    var handler = function () {

        var args = Array.prototype.slice.call(arguments);
        args.unshift(type);
        Events.EventEmitter.prototype.emit.apply(self, args);
        self._unsubscribe(type);
    };

    this._handlers[type] = handler;
    return handler;
};


internals.Divider.prototype.on = internals.Divider.prototype.addListener = function (type, listener) {

    this._subscribe(type);
    return Events.EventEmitter.prototype.on.call(this, type, listener);
};


internals.Divider.prototype._subscribe = function (type) {

    if (!this._events[type]) {
        for (var i = 0, il = this._sources.length; i < il; ++i) {
            this._sources[i].on(type, this._handler(type));
        }
    }
};


internals.Divider.prototype.removeListener = function (type, listener) {

    Events.EventEmitter.prototype.removeListener.call(this, type, listener);
    this._unsubscribe(type);
    return this;
};


internals.Divider.prototype.removeAllListeners = function (type) {

    Events.EventEmitter.prototype.removeAllListeners.apply(this, arguments);
    this._unsubscribe(type);
    return this;
};


internals.Divider.prototype._unsubscribe = function (type) {

    if (type === undefined) {
        for (var i = 0, il = this._sources.length; i < il; ++i) {
            this._sources[i].removeAllListeners();
        }
    }
    else if (!this._events[type]) {
        for (var i = 0, il = this._sources.length; i < il; ++i) {
            this._sources[i].removeListener(type, this._handler(type));
        }
    }
};