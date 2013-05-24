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
		inbox.post(mailbox, req.body, function (err, email) {
			if (err) {
				return res.send(500, err);
			}

			res.json(201, email);
		});
	}
}

module.exports = api;