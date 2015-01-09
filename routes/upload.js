var mongoose = require('mongoose');
var Mix = mongoose.model('Mix');

exports.routes = function(app) {
	app.get('/upload', exports.index);
	app.post('/upload', exports.add);
};

exports.index = function(req, res) {
	res.render('upload', {
		title: 'Grimelist',
	});
};

exports.add = function(req, res) {
	if (typeof req.files.file !== 'undefined') { 
		console.log(req.files.file.name);
		var url = req.files.file.name.split('.')[0];
		res.redirect('/mix/' + url);
	}
	else {
		console.log("no file");
		res.redirect('/upload');
	}
};

exports.view = function(req, res) {
	var mix = Mix.findOne({}).exec(function (err, mix){
		res.render('mixes', {
			title: 'Grimelist',
			mix: mix
		});
	});
};
