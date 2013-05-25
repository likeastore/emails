var config = require('likeastore-config');
var mandrill = require('node-mandrill')(config.mandrill.token);

function forwarder (messenger) {
	console.log(config.mandrill.token);

	messenger.subscribe('emails:recieved', emailsRecieved);

	var developers = [
		{email: 'alexander.beletsky@gmail.com'}
	];

	function emailsRecieved (emails) {
		emails.forEach(function (email) {
			send(email);
		});

		function send (email) {
			return mandrill('/messages/send', {
				message: {
					text: email.msg.text,
					html: email.msg.html,
					from_email: email.msg.from_email || '',
					from_name: email.msg.from_name || '',
					subject: email.msg.subject,
					to: developers
				}
			}, function (err, resp) {
				// do nothing
				if (err) {
					return console.log(err);
				}

				console.log(resp);
			});
		}
	}
}

module.exports = forwarder;