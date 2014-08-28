var _ = require('underscore');
var swig = require('swig');
var util = require('util');
var async = require('async');
var util = require('util');
var db = require('./../../db/dbConnector').db;
var logger = require('./../../utils/logger');
var notification = require('./../../utils/notification');
var config = require('../../../config');
var mandrill = require('node-mandrill');

var subject = 'Likeastore Weekly: Data Science, Front-end, UI Intefaces, Analytics collections';
var utm = '?utm_source=coll-weekly&utm_medium=email&utm_campaign=coll-promo-w35';

var collections = [
	{
		"color" : "#56c7aa",
		"public" : true,
		"title" : "Data Science",
		"description": "Data science, mostly with Python.",
		"user" : "debie.daan@gmail.com",
		"name" : "DandyDev",
		"url": "https://app.likeastore.com/u/DandyDev/53a93bebaa267c0d00000001",
		"authorUrl": "https://app.likeastore.com/u/DandyDev"
	},
	{
		"color" : "#56c7aa",
		"public" : true,
		"thumbnail" : "https://d13yacurqjgara.cloudfront.net/users/413617/screenshots/1582971/long_dark_1x.png",
		"title" : "UI - interface",
		"description": "Great collection of interfaces.",
		"user" : "i@tjrus.com",
		"name" : "TjRus",
		"url": "https://app.likeastore.com/u/TjRus/531e32859a9b500c00000078",
		"authorUrl": "https://app.likeastore.com/u/TjRus"
	},
	{
		"color" : "#56c7aa",
		"public" : true,
		"title" : "Front-end tools",
		"description": "You daily tools in Front-End development.",
		"user" : "contact@onaliugo.fr",
		"email" : "contact@onaliugo.fr",
		"name" : "onaliugo",
		"url": "https://app.likeastore.com/u/onaliugo/539ea335e45b300f00000039",
		"authorUrl": "https://app.likeastore.com/u/onaliugo"
	},
	{
		"color" : "#e74c3c",
		"public" : true,
		"thumbnail" : "http://distilleryimage2.s3.amazonaws.com/7965fa34c15a11e382a80002c9d942ea_8.jpg",
		"title" : "Sports",
		"description" : "Amazing sports shots.",
		"user" : "timtimp@bluewin.ch",
		"name" : "time.peron",
		"url": "https://app.likeastore.com/u/time.peron/534399aa19979c0b00000026",
		"authorUrl": "https://app.likeastore.com/u/time.peron"
	},
	{
		"color" : "#eab6fd",
		"description" : "Web, mobile analytics related articles",
		"public" : true,
		"title" : "Analytics",
		"user" : "alexander.beletsky@gmail.com",
		"name" : "alexanderbeletsky",
		"url": "https://app.likeastore.com/u/alexanderbeletsky/531ae71679fd7b0d0000002c",
		"authorUrl": "https://app.likeastore.com/u/alexanderbeletsky"
	}
];

var template = swig.compileFile(__dirname + '../../../../templates/swig/input/collections-promo/index.html');

function sendCollectionPromo(callback) {
	if (!config.mandrill.token) {
		return callback('no mandrill token. ok for development mode, fail for production mode');
	}

	var emails = {};
	var mandrillApi = mandrill(config.mandrill.token);

	return readAllUsersEmails();

	function readAllUsersEmails() {
		logger.info('reading users emails...');

		db.users.find({unsubscribed: {$exists: false}, firstTimeUser: {$exists: false}}).forEach(function (err, user) {
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

		var collectionsWithUtm = collections.map(function (collection) {
			var clone = _.clone(collection);
			clone.url += utm;
			clone.authorUrl += utm;

			return clone;
		});

		logger.info('prepared ' + allEmails.length + ' to send...');

		var sendTasks = allEmails.map(function (email) {
			return function(callback) {
				logger.info('sending notification to ' + email);

				var data = _.extend({userId: emails[email]}, {collections: collectionsWithUtm});
				var html = template(data);

				mandrillApi('/messages/send', {
					message: {
						html: html,
						subject: subject,
						from_email: 'no-reply@likeastore.com',
						from_name: 'Likeastore Team',
						track_clicks: false,
						to: [{email: email}],
						preserve_recipients: false,
					},
				}, callback);
			};
		});

		async.parallelLimit(sendTasks, 512, function (err) {
			if (err) {
				logger.error(err);
			}

			logger.success('all notification successfully sent');

			callback (err);
		});
	}
}

module.exports = sendCollectionPromo;