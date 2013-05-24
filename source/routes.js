function routes(app) {
	app.get('/', master);

	function master (req, res) {
		res.render('master', {title: 'Likeastore. | Emails'});
	}
}

module.exports = routes;