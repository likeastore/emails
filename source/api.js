var sendCollectionPromo = require('./services/collectionsPromo/promo-w35');
var sendAnnouce = require('./services/sendSeptemberAnnounce');

function api(app) {

	app.post('/api/send/collPromo', function (req, res) {
		sendCollectionPromo(function () {});
		res.send(201);
	});

	app.post('/api/send/announce', function (req, res) {
		sendAnnouce(function () {});
		res.send(201);
	});
}

module.exports = api;