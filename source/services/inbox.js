var db = require('./../db/dbConnector').db;
var mongo = require('./../db/dbConnector').mongo;

function inbox (messenger) {
	return {
		all: function (mailbox, callback) {
			db.emails.find({mailbox: mailbox}, function (err, emails) {
				if (err) {
					return callback(err);
				}

				messenger.publish('emails:readAll', emails);
				callback(null, emails);
			});
		},

		email: function (mailbox, id, callback) {
			db.emails.findOne({_id: new mongo.ObjectId(id)}, function (err, email) {
				if (err) {
					return callback(err);
				}

				messenger.publish('email:readOne', email);
				callback(null, email);
			});
		},

		post: function (mailbox, email, callback) {
			email.mailbox = mailbox;

			db.emails.save(email, function (err, emails) {
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