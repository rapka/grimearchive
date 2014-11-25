var mongoose = require('mongoose');
var Mix = mongoose.model('Mix');
var ObjectId = require('mongoose').Types.ObjectId;

exports.routes = function(app) {
	app.get('/mixes', exports.index);
	app.get('/mix/:url', exports.view);


};

exports.index = function(req, res) {
	Mix.find().sort({date: -1}).limit(40)
		.exec(function(err, mixes) {
			if (err){
				console.log("find error");
				throw err;
			}

			res.render('mixes', {title: 'Grimelist', mixes: mixes});
	});
};

exports.mixes = function(req, res) {
	res.render('mixes', {
		title: 'Grimelist',
		mixes:  mixes
	});
};

exports.view = function(req, res) {
	var mix = Mix.findOne({url: req.params.url}).exec(function (err, mix){
		console.log("mmiiixx");
		console.log(req.params.url);
		res.render('mix', {
			title: 'Grimelist',
			mix: mix
		});
	});
};
