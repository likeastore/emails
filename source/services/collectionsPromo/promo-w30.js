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

var subject = 'Best collections of Motion Design, Music, Movies and more';
var utm = '?utm_source=coll-weekly&utm_medium=email&utm_campaign=coll-promo-w30';

var collections = [
	{
		"id" : "53a03c550648690f00000001",
		"color" : "#56c7aa",
		"public" : true,
		"thumbnail" : "http://i.vimeocdn.com/video/473268404_640.jpg",
		"title" : "motion insprtn",
		"description": "Nice looking motion designs",
		"url": "https://app.likeastore.com/u/Nikitaita/53a03c550648690f00000001",
		"user" : "nikitoss@gmail.com",
		"name" : "Nikitaita",
		"authorUrl": "https://app.likeastore.com/u/Nikitaita"
	},
	{
		"id" : "535123356c39511000000001",
		"color" : "#56c7aa",
		"public" : true,
		"title" : "Think Javascript",
		"description": "The greatest collection for Javascript developers",
		"url": "https://app.likeastore.com/u/voronianski/535123356c39511000000001",
		"user" : "dmitri.voronianski@gmail.com",
		"name" : "voronianski",
		"authorUrl": "https://app.likeastore.com/u/voronianski"
	},
	{
		"id" : "5355252fedce3c0c00000001",
		"color" : "#56c7aa",
		"public" : true,
		"thumbnail" : "https://i1.ytimg.com/vi/gQ0IlRvT_Mo/hqdefault.jpg",
		"title" : "Music",
		"description" : "We gonna rock you",
		"url": "https://app.likeastore.com/u/summa1910/5355252fedce3c0c00000001",
		"user" : "jonesitis7@gmail.com",
		"name" : "summa1910",
		"authorUrl": "https://app.likeastore.com/u/summa1910"
	},
	{
		"id" : "531f863949e12d0d0000000b",
		"color" : "#e74c3c",
		"public" : true,
		"thumbnail" : "https://i1.ytimg.com/vi/NPISkbzY-bk/hqdefault.jpg",
		"title" : "Movies & TV Shows",
		"description": "If you are boared, check this collection",
		"url": "https://app.likeastore.com/u/yl_ksa/531f863949e12d0d0000000b",
		"user" : "yl.ksaa@gmail.com",
		"name" : "yl_ksa",
		"authorUrl": "https://app.likeastore.com/u/yl_ksa"
	},
	{
		"id" : "535e0b4ebc7cb00e0000000d",
		"color" : "#c8c8c8",
		"public" : true,
		"title" : "Great Open Source",
		"description": "Best picks from OS world",
		"url": "https://app.likeastore.com/u/TjRus/535e0b4ebc7cb00e0000000d",
		"user" : "i@tjrus.com",
		"name" : "TjRus",
		"authorUrl": "https://app.likeastore.com/u/TjRus"
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

		async.parallelLimit(sendTasks, 256, function (err) {
			if (err) {
				logger.error(err);
			}

			callback (err);
		});
	}
}

module.exports = sendCollectionPromo;