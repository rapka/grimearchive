var mongoose = require('mongoose');
var Mix = mongoose.model('Mix');

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
	var mix = Mix.findOne({url: req.params.url}).exec(function (err, mix){
			res.send(mix.bitrate.toString());
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

