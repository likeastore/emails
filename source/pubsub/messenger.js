var EventEmitter = require('events').EventEmitter;
var events = new EventEmitter();

var messenger = {
	subscribe: function (ev, handler) {
		events.on(ev, handler);
	},

	publish: function (ev, data) {
		events.emit(ev, data);
	}
};

module.exports = messenger;