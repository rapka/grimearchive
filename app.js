var pmx = require('pmx').init({
	http: true,
	errors: true,
	network: true,
	ports: true
});

var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');
var fs = require('fs');
var multer = require('multer');
var expressSession = require('express-session');
var FileStore = require('session-file-store')(expressSession);
var config = require('./config');

var app = express();

app.use(logger('dev'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(busboy());
app.use(favicon(__dirname + '/public/img/favicon.ico'));

var uploadHandler = require('./uploadHandler.js');
app.use(multer({
	dest: './upload/',
	rename: uploadHandler.rename,
	onFileUploadStart: uploadHandler.onFileUploadStart,
	onFileUploadComplete: uploadHandler.onFileUploadComplete,
	onParseEnd: uploadHandler.onParseEnd,
	onFileUploadData: uploadHandler.onFileUploadData
}));

app.use(expressSession({
	store: new FileStore({}),
	saveUninitialized: false,
	resave: true,
	secret: config.secret,
	cookie: {
		secure: false
	}
}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Connect to mongo.
mongoose.connect('mongodb://127.0.0.1/grime');

/* eslint-disable no-unused-vars */

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

// Load models.
var modelsPath = __dirname + '/models';
fs.readdirSync(modelsPath).forEach(function(file) {
	if (~file.indexOf('.js')) {
		require(modelsPath + '/' + file);
	}
});

// Load routes.
var routesPath = path.join(__dirname, '/routes');
fs.readdirSync(routesPath).forEach(function(file) {
	if (~file.indexOf('.js')) {
		var route = require(path.join(routesPath, file));
		route.routes(app);
	}
});

// Render 404 page
app.use(function(req, res, next) {
	res.status(404).render('404.jade', {title: 'Not Found'});
	next();
});

/* eslint-enable no-unused-vars */

app.use(pmx.expressErrorHandler());

module.exports = app;
