var sendCollectionPromoW29 = require('./services/collectionsPromo/promo-w29');

function api(app, messenger) {

	app.post('/api/send/collPromoW29', function (req, res) {
		sendCollectionPromoW29(function (err) {
			if (err) {
				return res.send(500);
			}

			res.send(201);
		});
	});
}

module.exports = api;