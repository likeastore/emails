var util = require('util');
var async = require('async');
var util = require('util');
var db = require('./../db/dbConnector').db;
var logger = require('./../utils/logger');
var notification = require('./../utils/notification');
var config = require('../../config');
var mandrill = require('node-mandrill');

function sendPublicBeta(callback) {
	if (!config.mandrill.token) {
		return callback('no mandrill token. ok for development mode, fail for production mode');
	}

	var emails = {};
	var mandrillApi = mandrill(config.mandrill.token);

	return readAllSubscribersEmails();

	function readAllSubscribersEmails() {
		logger.info('reading subscribers emails...');

		db.subscribers.find({unsubscribed: {$exists: false}}).forEach(function (err, user) {
			if (err) {
				return callback(err);
			}

			if (!user) {
				return readAllUsersEmails(null);
			}

			emails[user.email] = user._id;
		});
	}

	function readAllUsersEmails() {
		logger.info('reading users emails...');

		db.users.find({unsubscribed: {$exists: false}}).forEach(function (err, user) {
			if (err) {
				return callback(err);
			}

			if (!user) {
				return sendNofications(null);
			}

			emails[user.email] = user._id.toString();
		});
	}

	function sendNofications() {
		var allEmails = Object.keys(emails);

		logger.info('prepared ' + allEmails.length + ' to send...');

		var sendTasks = splitToChunks(allEmails).map(function (chunk) {
			var to = chunk.map(function (email) {
				return { email: email };
			});

			var merge = chunk.map(function (email) {
				return {rcpt: email, vars: [{name: 'userid', content: emails[email]}]};
			});

			logger.info('created chunk size: ' + to.length + ' to send');

			return function(callback) {
				logger.info('sending notification...');

				console.log(util.inspect(merge, {depth: 6}));

				mandrillApi('/messages/send-template', {
					template_name: 'likeastore-announce-v3-0',
					template_content: [],

					message: {
						auto_html: null,
						to: to,
						preserve_recipients: false,
						merge_vars: merge
					},
				}, callback);
			};
		});

		async.series(sendTasks, function (err) {
			if (err) {
				logger.error(err);
			}

			callback (err);
		});
	}

	function splitToChunks(emails) {
		var chunks = [], size = 300;

		while (emails.length > 0) {
			chunks.push(emails.splice(0, size));
		}

		return chunks;
	}
}

module.exports = sendPublicBeta;