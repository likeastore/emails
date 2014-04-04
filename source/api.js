var inboxService = require('./services/inbox');
var invites = require('./services/sendInvites');
var publicBeta = require('./services/sendPublicBeta');
var septemberAnnounce = require('./services/sendSeptemberAnnounce');
var disabledNetworks = require('./services/sendDisabledNetworks');
var januaryAnnounce = require('./services/sendJanuaryAnnounce');
var discoveryAnnounce = require('./services/sendDiscoveryAnnounce');
var marchAnnounce = require('./services/sendMarchAnnounce');
var aprilAnnounce = require('./services/sendAprilAnnounce');

var db = require('./db/dbConnector').db;

function api(app, messenger) {

	var inbox = inboxService(messenger);

	app.get('/api/inbox/:mailbox', getAllEmails);
	app.get('/api/inbox/:mailbox/:id', getEmailById);
	app.post('/api/inbox/:mailbox', postNewEmail);

	app.post('/api/send/invites', sendInvites);
	app.post('/api/send/publicbeta', sendPublicBeta);
	app.post('/api/send/september', sendSeptemberAnnounce);
	app.post('/api/send/disabled', sendDisabledNetworks);
	app.post('/api/send/january', sendJanuaryAnnounce);
	app.post('/api/send/discovery', sendDiscoveryAnnounce);
	app.post('/api/send/march', sendMarchAnnounce);
	app.post('/api/send/april', sendAprilAnnounce);

	app.get('/api/show/index', showAllIndexes);

	function getAllEmails (req, res) {
		var mailbox = req.params.mailbox;
		inbox.all(mailbox, function (err, emails) {
			if (err) {
				return res.send(500, err);
			}

			res.json(200, emails);
		});
	}

	function getEmailById(req, res) {
		var mailbox = req.params.mailbox;
		var id = req.params.id;
		inbox.email(mailbox, id, function (err, email) {
			if (err) {
				return res.send(500, err);
			}

			if (!email) {
				return res.send(404);
			}

			res.json(200, email);
		});
	}

	function postNewEmail (req, res) {
		var mailbox = req.params.mailbox;
		var mandrillEvents = JSON.parse(req.body.mandrill_events);

		var inbound = mandrillEvents.filter(function (evt) {
			return evt.event === 'inbound';
		});

		inbox.post(mailbox, inbound, function (err, emails) {
			if (err) {
				return res.send(500, err);
			}

			res.json(201, emails);
		});
	}

	function sendInvites (req, res) {
		invites(function (err) {
			if (err) {
				return res.send(500);
			}

			res.send(201);
		});
	}

	function sendPublicBeta (req, res) {
		publicBeta(function (err) {
			if (err) {
				return res.send(500);
			}

			res.send(201);
		});
	}

	function sendSeptemberAnnounce (req, res) {
		septemberAnnounce(function (err) {
			if (err) {
				return res.send(500);
			}

			res.send(201);
		});
	}

	function sendJanuaryAnnounce(req, res) {
		januaryAnnounce(function (err) {
			if (err) {
				return res.send(500);
			}

			res.send(201);
		});
	}

	function sendDisabledNetworks (req, res) {
		disabledNetworks(function (err) {
			if (err) {
				return res.send(500);
			}

			res.send(201);
		});
	}

	function sendDiscoveryAnnounce (req, res) {
		discoveryAnnounce(function (err) {
			if (err) {
				return res.send(500);
			}

			res.send(201);
		});
	}

	function sendMarchAnnounce (req, res) {
		marchAnnounce(function (err) {
			if (err) {
				return res.send(500);
			}

			res.send(201);
		});
	}

	function sendAprilAnnounce (req, res) {
		aprilAnnounce(function (err) {
			if (err) {
				return res.send(500);
			}

			res.send(201);
		});
	}

	function showAllIndexes (req, res) {
		db.items.getIndexes(function (err, indexes) {
			res.json(indexes);
		});
	}
}

module.exports = api;