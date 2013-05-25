var inboxService = require('./services/inbox');

function api(app, messenger) {

	var inbox = inboxService(messenger);

	app.get('/api/inbox/:mailbox', getAllEmails);
	app.get('/api/inbox/:mailbox/:id', getEmailById);
	app.post('/api/inbox/:mailbox', postNewEmail);

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
}

module.exports = api;