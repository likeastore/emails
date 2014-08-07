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

var subject = 'Best collections of Ionic, Music, Videos and Android!';
var utm = '?utm_source=coll-weekly&utm_medium=email&utm_campaign=coll-promo-w32';

var collections = [
	{
		"id" : "53cddd71cf3c831200000012",
		"color" : "#eab6fd",
		"public" : true,
		"thumbnail" : "http://ccoenraets.github.io/ionic-tutorial/images/ionic-logo.png",
		"title" : "IonicFramework",
		"description": "The best collection for Ionic developers",
		"url": "https://app.likeastore.com/u/horacio/53cddd71cf3c831200000012",
		"user" : "hherrerag@me.com",
		"email" : "hherrerag@me.com",
		"location" : "Barcelona",
		"name" : "horacio",
		"username" : "hhg2288",
		"website" : "http://hherrerag.com",
		"authorUrl": "https://app.likeastore.com/u/horacio"
	},
	{
		"id" : "53db70d791f4860c00000002",
		"color" : "#56c7aa",
		"public" : true,
		"thumbnail" : "https://i.ytimg.com/vi/S3fTw_D3l10/hqdefault.jpg",
		"title" : "Music",
		"description": "So slow, so beautiful music",
		"user" : "obiletska@mail.intropro.com",
		"email" : "obiletska@mail.intropro.com",
		"name" : "sasha.homenko.31",
		"username" : "sasha.homenko.31",
		"authorUrl": "https://app.likeastore.com/u/sasha.homenko.31",
		"url": "https://app.likeastore.com/u/sasha.homenko.31/53db70d791f4860c00000002"
	},
	{
		"id" : "531ae57979fd7b0d0000002b",
		"color" : "#3498db",
		"description" : "All about TDD and best practices",
		"public" : true,
		"thumbnail" : "https://heartofaleader.files.wordpress.com/2012/05/promise_day_02.png",
		"title" : "TDD / Engineering",
		"user" : "alexander.beletsky@gmail.com",
		"displayName" : "Alexander Beletsky",
		"name" : "alexanderbeletsky",
		"authorUrl": "https://app.likeastore.com/u/alexanderbeletsky",
		"url": "https://app.likeastore.com/u/alexanderbeletsky/531ae57979fd7b0d0000002b"
	},
	{
		"id" : "5336995fd195760e00000017",
		"color" : "#56c7aa",
		"public" : true,
		"thumbnail" : "https://i1.ytimg.com/vi/HB3xM93rXbY/hqdefault.jpg",
		"title" : "Interesting",
		"description": "The coolest art from Vimeo, Behance and Dribble",
		"user" : "Willi_84@inbox.ru",
		"email" : "Willi_84@inbox.ru",
		"avatar" : "https://gravatar.com/avatar/d4a6ef9d343afa574c7b1994e366bd01?d=mm",
		"name" : "Williod",
		"authorUrl": "https://app.likeastore.com/u/Williod",
		"url": "https://app.likeastore.com/u/Williod/5336995fd195760e00000017"
	},
	{
		"id" : "53a93c10aa267c0d00000003",
		"color" : "#3498db",
		"description" : "Android tools, libraries, apps and recipes",
		"public" : true,
		"title" : "Android",
		"user" : "sunng@about.me",
		"email" : "sunng@about.me",
		"location" : "Beijing, China",
		"name" : "sunng",
		"website" : "http://sunng.info",
		"authorUrl": "https://app.likeastore.com/u/sunng",
		"url": "https://app.likeastore.com/u/sunng/53a93c10aa267c0d00000003"
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