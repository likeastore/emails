var async = require('async');
var util = require('util');
var db = require('./../db/dbConnector').db;
var subscribers = require('./../db/subscribers');
var logger = require('./../utils/logger');
var notification = require('./../utils/notification');
var config = require('likeastore-config');

function sendPublicBeta(callback) {
	logger.info('send pubilc beta invites for ' + process.env.NODE_ENV);

	subscribers.findAll(function (err, all) {
		if (err) {
			return logger.error(err);
		}

		logger.info('currently we have ' + all.length + ' subscribers. Invite them all...');

		var sendTasks = all.map(function (subscriber) {
			return function (callback) {
				notification.sendTemplate(subscriber.email, 'public-beta-invite', [], function (err) {
					if (err) {
						return callback('failed send email to: ' + subscriber.email + ' error: ' + JSON.stringify(err));
					}

					logger.success('sent email to: ' + subscriber.email + ' successfully' );
					subscribers.update(subscriber, {invitedTo: 'private-beta', emailSent: new Date()}, callback);
				});
			};
		});

		async.parallel(sendTasks, function (err) {
			if (err) {
				logger.error(err);
			}

			callback(null);
		});
	});
}

module.exports = sendPublicBeta;