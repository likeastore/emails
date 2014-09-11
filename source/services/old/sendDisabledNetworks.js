var async = require('async');
var util = require('util');
var db = require('./../db/dbConnector').db;
var logger = require('./../utils/logger');
var notification = require('./../utils/notification');
var config = require('../../config');
var mandrill = require('node-mandrill');

function sendPublicBeta(callback) {
	logger.info('send september invites for ' + process.env.NODE_ENV);

	if (!config.mandrill.token) {
		return callback('no mandrill token. ok for development mode, fail for production mode');
	}

	var emails = {};
	var mandrillApi = mandrill(config.mandrill.token);

	return readAllDisabledNetworks();

	function readAllDisabledNetworks() {
		logger.info('reading all user with disabled networks');

		db.networks.find({disabled: true}).forEach(function (err, network) {
			if (err) {
				return callback(err);
			}

			if (!network) {
				return sendNofications(null);
			}

			emails[network.user] = '';
		});
	}

	function sendNofications() {
		var allEmails = Object.keys(emails);

		logger.info('prepared ' + allEmails.length + ' to send...');

		var sendTasks = splitToChunks(allEmails).map(function (emails) {
			var to = emails.map(function (email) {
				return { email: email };
			});

			logger.info('created chunk size: ' + to.length + ' to send');

			return function(callback) {
				logger.info('sending notification...');

				mandrillApi('/messages/send-template', {
					template_name: 'disabled-networks',
					template_content: [],
					message: {
						auto_html: null,
						to: to,
						preserve_recipients: false
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
		var chunks = [], size = 100;

		while (emails.length > 0) {
			chunks.push(emails.splice(0, size));
		}

		return chunks;
	}
}

module.exports = sendPublicBeta;