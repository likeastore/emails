var db = require('./../db/dbConnector').db;

function inbox (messenger) {
	return {
		all: function (mailbox, callback) {
			db.emails.find({mailbox: mailbox}, function (err, emails) {
				if (err) {
					return callback(err);
				}

				messenger.publish('emails:read', emails);
				callback(null, emails);
			});
		},

		post: function (mailbox, email, callback) {
			email.mailbox = mailbox;

			db.emails.insert(email, function (err, email) {
				if (err) {
					return callback(err);
				}

				messenger.publish('emails:recieved', email);
				callback(null, email);
			});
		}
	};
}

module.exports = inbox;