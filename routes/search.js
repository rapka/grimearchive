var mongoose = require('mongoose');
var Mix = mongoose.model('Mix');
var ObjectId = require('mongoose').Types.ObjectId;

exports.routes = function(app) {
	app.get('/dj/:url', exports.dj);
	app.get('/mc/:url', exports.mc);
	app.get('/crew/:url', exports.crew);
	app.get('/search/:term', exports.search);

};

exports.dj = function(req, res) {
	Mix.find({dj: req.params.url}).sort({date: -1}).limit(40)
		.exec(function(err, mixes) {
			if (err){
				console.log("find error");
				throw err;
			}

			res.render('mixes', {title: 'Grimelist', mixes: mixes});
	});
};

exports.mc = function(req, res) {
	Mix.find({mcs: req.params.url}).sort({date: -1}).limit(40)
		.exec(function(err, mixes) {
			if (err){
				console.log("find error");
				throw err;
			}

			res.render('mixes', {title: 'Grimelist', mixes: mixes});
	});
};

exports.crew = function(req, res) {
	Mix.find({crews: req.params.url}).sort({date: -1}).limit(40)
		.exec(function(err, mixes) {
			if (err){
				console.log("find error");
				throw err;
			}

			res.render('mixes', {title: 'Grimelist', mixes: mixes});
	});
};

exports.search = function(req, res) {
	
};
