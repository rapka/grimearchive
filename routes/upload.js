var mongoose = require('mongoose');
var Mix = mongoose.model('Mix');

exports.routes = function(app) {
	app.get('/upload', exports.index);
	app.post('/upload', exports.add);
	app.get('/upload/:url', exports.checkFfmpeg)
};

exports.index = function(req, res) {
	res.render('upload', {
		title: 'Grimelist'
	});
};

exports.checkFfmpeg = function(req, res) {
	var mix = Mix.findOne({url: req.params.url}).exec(function (err, mix){
		//if (mix.bitrate && mix.length) {
			res.send(mix.bitrate.toString());
		//}
		//res.send("false");
	});
};

exports.add = function(req, res) {
	console.log("ADDDD");
	if (typeof req.files.file !== 'undefined') { 
		console.log(req.files.file.name);
		var url = req.files.file.name.split('.')[0];
		res.send('/mix/' + url);

	}
	else {
		console.log("no file");
		res.redirect('/upload');
	}
};

