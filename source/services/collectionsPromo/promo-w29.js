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

var subject = 'Best collections of Startups, Design, JavaScript and more';
var utm = '?utm_source=coll-weekly&utm_medium=email&utm_campaign=coll-promo-w29';

var collections = [
	{
		"id" : "539e0ac5e45b300f00000037",
		"color" : "#f39c12",
		"thumbnail" : "http://scontent-a.cdninstagram.com/hphotos-xap1/t51.2885-15/10454181_1461036024135454_956186108_n.jpg",
		"title" : "Tech, Startups, Social",
		"description" : "Technology, startup, and social networking related items.",
		"url": "https://app.likeastore.com/u/dain/539e0ac5e45b300f00000037",
		"user" : "dbin78@gmail.com",
		"name": "dain",
		"authorUrl": "https://app.likeastore.com/u/dain"
	},
	{
		"id" : "53ab2bba43fa2f1200000001",
		"color" : "#3498db",
		"public" : true,
		"thumbnail" : "https://m1.behance.net/rendition/projects/17318269/404/663f6eee3977744acf362bfb863e99b4.jpeg",
		"title" : "Design",
		"description": "Fan of industrial design, check this out.",
		"user" : "timtimp@bluewin.ch",
		"displayName" : "Tim Perone",
		"email" : "timtimp@bluewin.ch",
		"name" : "time.peron",
		"username" : "time.peron",
		"authorUrl": "https://app.likeastore.com/u/time.peron"
	},
	{
		"id" : "53369916d195760e00000015",
		"color" : "#3498db",
		"public" : true,
		"thumbnail" : "http://i.vimeocdn.com/video/474459568_640.jpg",
		"title" : "Video Tutorials",
		"description": "Great tutorials for motion designers.",
		"user" : "Willi_84@inbox.ru",
		"email" : "Willi_84@inbox.ru",
		"avatar" : "https://gravatar.com/avatar/d4a6ef9d343afa574c7b1994e366bd01?d=mm",
		"name" : "Williod",
		"url": "https://app.likeastore.com/u/Williod/53369916d195760e00000015",
		"authorUrl": "https://app.likeastore.com/u/Williod"
	},
	{
		"id" : "533e78ce84bb1c0c0000000a",
		"color" : "#56c7aa",
		"public" : true,
		"thumbnail" : "http://i.vimeocdn.com/video/473226319_640.jpg",
		"title" : "Surf",
		"description": "Breathtaking videos and photos of surf sport.",
		"user" : "thomas.gaudex@gmail.com",
		"email" : "thomas.gaudex@gmail.com",
		"avatar" : "https://pbs.twimg.com/profile_images/378800000502452245/40fd24e479f2e09e7349cd8a24519e0e_normal.png",
		"displayName" : "Tom",
		"name" : "Thomaass",
		"url": "https://app.likeastore.com/u/Thomaass/533e78ce84bb1c0c0000000a",
		"authorUrl": "https://app.likeastore.com/u/Thomaass"
	},
	{
		"id" : "534faf1b83902b140000000c",
		"color" : "#56c7aa",
		"public" : true,
		"thumbnail" : "http://tedpatrick.files.wordpress.com/2013/06/build.png",
		"title" : "JavaScript",
		"description" : "Amazing collection of JavaScript related articles.",
		"user" : "hss@live.ru",
		"email" : "hss@live.ru",
		"avatar" : "https://graph.facebook.com/1571840893/picture",
		"displayName" : "Sergey Homyuk",
		"name" : "sergey.homyuk",
		"url": "https://app.likeastore.com/u/sergey.homyuk/534faf1b83902b140000000c",
		"authorUrl": "https://app.likeastore.com/u/sergey.homyuk"
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

			var data = _.extend({userId: emails[email]}, {collections: collectionsWithUtm});
			var html = template(data);

			return function(callback) {
				logger.info('sending notification to ' + email);

				mandrillApi('/messages/send', {
					message: {
						html: html,
						subject: subject,
						from_email: 'no-reply@likeastore.com',
						from_name: 'Likeastore Team',
						to: [{email: email}],
						preserve_recipients: false,
					},
				}, callback);
			};
		});

		async.parallelLimit(sendTasks, 128, function (err) {
			if (err) {
				logger.error(err);
			}

			callback (err);
		});
	}
}

module.exports = sendCollectionPromo;