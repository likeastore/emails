var express = require('express');
var http = require('http');
var path = require('path');
var engine = require('ejs-locals');

var app = express();

app.configure(function(){
	app.set('port', process.env.VCAP_APP_PORT || 3003);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

require('./source/routes')(app);
require('./source/api')(app);

http.createServer(app).listen(app.get('port'), function() {
	var env = process.env.NODE_ENV || 'development';
	console.log("likeastore-emails listening on port " + app.get('port') + ' ' + env);
});