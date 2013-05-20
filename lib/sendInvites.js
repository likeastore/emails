var db = require('./../source/db/dbConnector').db;
var subscribers = require('./../source/db/subscribers');
var logger = require('./../source/utils/logger');
var async = require('async');
var util = require('util');
var notification = require('./../source/utils/notification');

subscribers.findAll(function (err, all) {
	logger.info('currently we have ' + all.length + ' subscribers. Invite them all...');

	var sendTasks = all.map(function (subscriber) {
		return function (callback) {
			var activationLink = util.format('http://likeastore.com/welcome?user=%s&invite=%s', subscriber.email, subscriber.inviteId);
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