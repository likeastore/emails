process.env.NODE_ENV = process.env.NODE_ENV || 'production';

var db = require('./../source/db/dbConnector').db;
var subscribers = require('./../source/db/subscribers');
var logger = require('./../source/utils/logger');
var async = require('async');
var util = require('util');
var notification = require('./../source/utils/notification');
var config = require('likeastore-config');

logger.info('send private invites for ' + process.env.NODE_ENV);

subscribers.findAll(function (err, all) {
	if (err) {
		return logger.error(err);
	}

	logger.info('currently we have ' + all.length + ' subscribers. Invite them all...');

	var sendTasks = all.map(function (subscriber) {
		return function (callback) {
			var activationLink = util.format('%s/welcome?user=%s&invite=%s', config.siteUrl, subscriber.email, subscriber.inviteId);
			var merge = [{
				name: 'activationLink',
				content: activationLink
			}];

			notification.sendTemplate(subscriber.email, 'private-beta-invite', merge, function (err) {
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
		db.close();
	});
});