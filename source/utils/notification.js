var mandrill = require('node-mandrill');
var config = require('./../../config')();

function sendTemplate(email, template, merge, callback) {
	if (!config.mandrill.token) {
		return callback('no mandrill token. ok for development mode, fail for production mode');
	}

	var api = mandrill(config.mandrill.token);

	return api('/messages/send-template', {
		template_name: template,
		template_content: [],
		message: {
			auto_html: false,
			to: [
				{ email: email }
			],
			merge_vars: [{
				rcpt: email,
				vars: merge
			}]
		}
	}, callback);
}

module.exports = {
	sendTemplate: sendTemplate
};