var mandrill = require('node-mandrill');
var config = require('./../../config')();

function sendTemplate(email, activationLink, callback) {
	if (!config.mandrill.token) {
		return callback('no mandrill token. ok for development mode, fail for production mode');
	}

	var api = mandrill(config.mandrill.token);

	return api('/messages/send-template', {
		template_name: 'private-beta-invite',
		template_content: [],
		message: {
			auto_html: false,
			to: [
				{ email: email }
			],
			merge_vars: [{
				rcpt: email,
				vars: [{
					name: 'activationLink',
					content: activationLink
				}]
			}]
		}
	}, callback);
}

module.exports = {
	send: sendTemplate
};