function routes(app) {
	app.get('/', master);

	function master (req, res) {
		res.render('master', {title: 'Likeastore. | Emails', env: process.env.NODE_ENV || 'development'});
	}
}

module.exports = routes;