var EventEmmiter = require('events').EventEmmiter;
var events = new EventEmmiter();

var messenger = {
	subscribe: function (ev, handler) {
		events.on(ev, handler);
	},

	publish: function (ev, data) {
		events.emit(ev, data);
	}
};

module.exports = messenger;