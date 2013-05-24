function api(app) {

	api.get('/api/inbox/:mailbox', getAllEmails);
	api.get('/api/inbox/:mailbox/:id', getEmailById);
	api.post('/api/inbox/:mailbox', postNewEmail);

	function getAllEmails (req, res) {
		res.send(200);
	}

	function getEmailById(req, res) {
		res.send(200);
	}

	function postNewEmail (req, res) {
		res.send(201);
	}

}

module.exports = api;