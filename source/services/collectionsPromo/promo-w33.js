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

var subject = 'Best collections of Pictures, Medical Geekness, Web Development and Sports!';
var utm = '?utm_source=coll-weekly&utm_medium=email&utm_campaign=coll-promo-w33';

var collections = [
	{
		"color" : "#56c7aa",
		"description" : "Pictures, architecture, objects, everything with wood!",
		"public" : true,
		"thumbnail" : "http://38.media.tumblr.com/22c6496a4810b79e17585ad974e87dfe/tumblr_na50u61cmO1qcetpuo1_1280.jpg",
		"title" : "Wood",
		"user" : "timtimp@bluewin.ch",
		"email" : "timtimp@bluewin.ch",
		"name" : "time.peron",
		"username" : "time.peron",
		"authorUrl": "https://app.likeastore.com/u/time.peron",
		"url": "https://app.likeastore.com/u/time.peron/53e92b90b00d0a0f00000013"
	},
	{
		"color" : "#e74c3c",
		"description" : "Interesting and new things in the medical field.",
		"public" : true,
		"thumbnail" : "http://cdn3.kevinmd.com/blog/wp-content/uploads/shutterstock_114588181.jpg",
		"title" : "Medical Geek",
		"user" : "wock@rocketmail.com",
		"name" : "Volodymyr.Khylchuk",
		"username" : "Volodymyr.Khylchuk",
		"authorUrl": "https://app.likeastore.com/u/Volodymyr.Khylchuk",
		"url": "https://app.likeastore.com/u/Volodymyr.Khylchuk/53e5ee9cb00d0a0f00000011"
	},
	{
		"color" : "#e74c3c",
		"description" : "Welcome Node's elder brother - asynchronous I/O for Lua.",
		"public" : true,
		"title" : "Luvit.io <3",
		"user" : "dmitri.voronianski@gmail.com",
		"name" : "voronianski",
		"username" : "voronianski",
		"website" : "http://pixelhunter.me",
		"authorUrl": "https://app.likeastore.com/u/voronianski",
		"url": "https://app.likeastore.com/u/voronianski/53e1353728a92e0f00000003"
	},
	{
		"color" : "#e74c3c",
		"public" : true,
		"thumbnail" : "http://addyosmani.com/resources/essentialjsdesignpatterns/cover/cover.jpg",
		"title" : "WebDev articles",
		"description": "Great collection of web development articles.",
		"user" : "i@tjrus.com",
		"displayName" : "Vasiliy Zubach",
		"name" : "TjRus",
		"authorUrl": "https://app.likeastore.com/u/TjRus",
		"url": "https://app.likeastore.com/u/TjRus/535a31e7813b3a0f00000004"
	},
	{
		"color" : "#f39c12",
		"public" : true,
		"thumbnail" : "http://img.youtube.com/vi/BAhWXL_tfBE/0.jpg",
		"title" : "Sport",
		"description": "Get your inspiration here.",
		"user" : "hss@live.ru",
		"email" : "hss@live.ru",
		"name" : "sergey.homyuk",
		"username" : "sergey.homyuk"
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