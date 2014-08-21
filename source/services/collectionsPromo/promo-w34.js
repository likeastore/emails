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

var subject = 'Likeastore Weekly: AngularJS, Education, NoSQL, Pets collections';
var utm = '?utm_source=coll-weekly&utm_medium=email&utm_campaign=coll-promo-w34';

var collections = [
	{
		"color" : "#56c7aa",
		"description" : "AngularJS MVC framework",
		"public" : true,
		"title" : "AngularJS",
		"user" : "b11291fc@opayq.com",
		"name" : "valery.sntx",
		"username" : "valery.sntx",
		"url": "https://app.likeastore.com/u/valery.sntx/53ee08d50b0e941400000003",
		"authorUrl": "https://app.likeastore.com/u/valery.sntx"
	},
	{
		"color" : "#f39c12",
		"description" : "Resources for lifelong learning",
		"public" : true,
		"thumbnail" : "https://i1.ytimg.com/vi/MgIdi9T3kTU/hqdefault.jpg",
		"title" : "Education",
		"user" : "jonesitis7@gmail.com",
		"name" : "summa1910",
		"url": "https://app.likeastore.com/u/summa1910/53552540edce3c0c00000002",
		"authorUrl": "https://app.likeastore.com/u/summa1910"
	},
	{
		"color" : "#f39c12",
		"description" : "Anything related to gadgets, apps or seems geeky.",
		"public" : true,
		"thumbnail" : "http://i.kinja-img.com/gawker-media/image/upload/s--8mqEEvIQ--/gyutj96iscys4h3useq8.jpg",
		"title" : "Tech",
		"user" : "yl.ksaa@gmail.com",
		"displayName" : "Wael Hazzazi",
		"name" : "yl_ksa",
		"url": "https://app.likeastore.com/u/yl_ksa/531f870049e12d0d0000000f",
		"authorUrl": "https://app.likeastore.com/u/yl_ksa"
	},
	{
		"color" : "#3498db",
		"description" : "Contents for and from the nosql world",
		"public" : true,
		"title" : "NoSql",
		"user" : "manuel.martone@gmail.com",
		"name" : "codebrainr",
		"url": "https://app.likeastore.com/u/codebrainr/539819f5e45b300f00000026",
		"authorUrl": "https://app.likeastore.com/u/codebrainr"
	},
	{
		"color" : "#feee43",
		"description" : "Pet Rescues, Breeders and Advocacy",
		"public" : true,
		"title" : "Pet Lovers",
		"user" : "cmechic@gmail.com",
		"email" : "cmechic@gmail.com",
		"location" : "Columbus, Ohio",
		"name" : "cmechic",
		"username" : "ecigchic",
		"url": "https://app.likeastore.com/u/cmechic/53f1416c0b0e941400000012",
		"authorUrl": "https://app.likeastore.com/u/cmechic"
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