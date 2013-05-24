module.exports = function (app, messenger) {
	var actions = {
		'forwarder': require('./forwarder')(messenger)
	};

	return actions;
};