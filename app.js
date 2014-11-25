var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');
var fs = require('fs');
var id3_reader = require('id3_reader');
var probe = require('node-ffprobe');
var mongoose = require('mongoose');
var md5 = require('MD5');
var multer = require('multer');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(busboy());

var uploadHandler = require('./uploadHandler.js');
app.use(multer({ dest: './upload/',
        rename: uploadHandler.rename,
		onFileUploadStart: uploadHandler.onFileUploadStart,
		onFileUploadComplete: uploadHandler.onFileUploadComplete,
		onParseEnd: uploadHandler.onParseEnd,
		onFileUploadData: uploadHandler.onFileUploadData
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Connect to mongo.
mongoose.connect('mongodb://127.0.0.1/grime');

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
var models_path = __dirname + '/models';
fs.readdirSync(models_path).forEach(function (file) {
		if (~file.indexOf('.js')) require(models_path + '/' + file)
});

// Load routes.
var routesPath = path.join(__dirname , '/routes');
fs.readdirSync(routesPath).forEach(function (file) {
		if (~file.indexOf('.js')) {
				var route = require(path.join(routesPath, file));
				route.routes(app);
		}
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
});

module.exports = app;
