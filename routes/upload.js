var mongoose = require('mongoose');
var Mix = mongoose.model('Mix');
var AWS = require('aws-sdk');

AWS.config.loadFromPath(__dirname + '/../aws.json');

var s3 = new AWS.S3();

exports.routes = function(app) {
	app.get('/upload', exports.index);
	app.post('/upload', exports.add);
	app.get('/upload/:url', exports.checkFfmpeg)
};

exports.index = function(req, res) {
	res.render('upload', {
		title: 'Upload to Grime Archive'
	});
};

exports.checkFfmpeg = function(req, res) {
	var params = {
		Bucket: "grimearchive",
		Key: req.params.url + '.mp3'
	};
	console.log("checking");
	console.log(params);
	s3.headObject(params, function (err, head) {
		if (err) {
			console.log(err);
			res.send("-1");
		}
		else {
			console.log("REDIRECT TIME");
			console.log(req.params.url);
			res.send(req.params.url);		
		}
	});
};

exports.add = function(req, res) {
	if (typeof req.files.file !== 'undefined') {
		var url = req.files.file.name.split('.')[0];
		res.send('/mix/' + url);

	}
	else {
		console.log("no file");
		res.redirect('/upload');
	}
};

