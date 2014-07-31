var sendCollectionPromo = require('./services/collectionsPromo/promo-w31');

function api(app) {

	app.post('/api/send/collPromo', function (req, res) {
		sendCollectionPromo(function () {});
		res.send(201);
	});
}

module.exports = api;