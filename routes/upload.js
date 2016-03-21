var AWS = require('aws-sdk');

AWS.config.loadFromPath(__dirname + '/../aws.json');

var s3 = new AWS.S3();

exports.routes = function(app) {
	app.get('/upload', exports.index);
	app.post('/upload', exports.add);
	app.get('/upload/:url', exports.checkFfmpeg);
};

exports.index = function(req, res) {
	res.render('upload', {
		title: 'Upload'
	});
};

exports.checkFfmpeg = function(req, res) {
	var params = {
		Bucket: 'grimearchive',
		Key: req.params.url + '.mp3'
	};

	s3.headObject(params, function(err) {
		if (err) {
			res.send('-1');
		} else {
			res.send(req.params.url);
		}
	});
};

exports.add = function(req, res) {
	if (typeof req.files.file !== 'undefined') {
		var url = req.files.file.name.split('.')[0];
		res.send('/mix/' + url);

	} else {
		console.log('no file');
		res.redirect('/upload');
	}
};

