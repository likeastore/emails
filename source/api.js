var sendCollectionPromo = require('./services/collectionsPromo/promo-w34');
var sendAnnouce = require('./services/sendAugustAnnounce');

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