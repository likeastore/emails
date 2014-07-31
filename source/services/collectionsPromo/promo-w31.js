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

var subject = 'Best collections of JavaScript, Python, Beautiful UI and Cats!';
var utm = '?utm_source=coll-weekly&utm_medium=email&utm_campaign=coll-promo-w31';

var collections = [
	{
		"_id" : "53cfc734378cd61000000001",
		"color" : "#3498db",
		"public" : true,
		"title" : "JavaScript",
		"description": "Great to re-use JavaScript libraries",
		"user" : "kristijan.novakovic@outlook.com",
		"avatar" : "https://graph.facebook.com/518774583/picture",
		"url": "https://app.likeastore.com/u/eldair/53cfc734378cd61000000001",
		"displayName" : "Kristijan Novaković",
		"email" : "kristijan.novakovic@outlook.com",
		"name" : "eldair",
		"username" : "kristijan.n",
		"authorUrl": "https://app.likeastore.com/u/eldair"
	},
	{
		"id" : "53ccc26bcf3c83120000000f",
		"color" : "#56c7aa",
		"description" : "Do you love cats, this collection right for you",
		"public" : true,
		"thumbnail" : "http://scontent-b.cdninstagram.com/hphotos-xaf1/t51.2885-15/10549740_501181250028232_1889070440_n.jpg",
		"title" : "Cats",
		"url": "https://app.likeastore.com/u/xvadim09/53ccc26bcf3c83120000000f",
		"user" : "xvadima@ukr.net",
		"avatar" : "https://pbs.twimg.com/profile_images/2184706682/xba_normal.jpeg",
		"displayName" : "Vadim Khohlov",
		"email" : "xvadima@ukr.net",
		"name" : "xvadim09",
		"username" : "xvadim09",
		"authorUrl": "https://app.likeastore.com/u/xvadim09"
	},
	{
		"id" : "53b837bac1d2e81000000016",
		"color" : "#3498db",
		"public" : true,
		"thumbnail" : "https://raw.github.com/jaredks/rumps/master/examples/rumps_example.png",
		"title" : "Python",
		"description": "Hand picked resources for pythonistas",
		"url": "https://app.likeastore.com/u/akhmetoff/53b837bac1d2e81000000016",
		"user" : "akhmetoff@gmail.com",
		"avatar" : "https://gravatar.com/avatar/fe319eefcad1edc6cf828c4866db97b1?d=mm",
		"email" : "akhmetoff@gmail.com",
		"name" : "akhmetoff",
		"authorUrl": "https://app.likeastore.com/u/akhmetoff"
	},
	{
		"id" : "533902f1d195760e0000001e",
		"color" : "#c8c8c8",
		"public" : true,
		"title" : "JS Frameworks",
		"description": "Get yourself ready for full stack development",
		"url": "https://app.likeastore.com/u/Teremok/533902f1d195760e0000001e",
		"user" : "dishell@gmail.com",
		"email" : "dishell@gmail.com",
		"avatar" : "https://gravatar.com/avatar/31e84d094737e1f0dcd03bcfb480641f?d=https%3A%2F%2Fidenticons.github.com%2F0a4d809e42c0b8c11e21ccbeb589193c.png&r=x",
		"displayName" : "Maksim",
		"name" : "Teremok",
		"authorUrl": "https://app.likeastore.com/u/Teremok"
	},
	{
		"id" : "5357bc507e21761000000002",
		"color" : "#56c7aa",
		"public" : true,
		"thumbnail" : "https://m1.behance.net/rendition/projects/15920995/404/0b0f9fc0692ee1a080dd0cd74d963658.png",
		"title" : "UI KITS",
		"description": "A lot of inspiration from great looking UI",
		"url": "https://app.likeastore.com/u/ironman/5357bc507e21761000000002",
		"user" : "ironman@artlogo.ro",
		"email" : "ironman@artlogo.ro",
		"avatar" : "https://si0.twimg.com/profile_images/1623492889/image_normal.jpg",
		"displayName" : "Aurel L.",
		"name" : "ironman",
		"authorUrl": "https://app.likeastore.com/u/ironman"
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