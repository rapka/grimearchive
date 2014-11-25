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
	res.redirect('/mixes/');
};

exports.view = function(req, res) {
	var mix = Mix.findOne({}).exec(function (err, mix){
		res.render('mixes', {
			title: 'Grimelist',
			mix: mix
		});
	});
};
