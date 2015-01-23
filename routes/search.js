var mongoose = require('mongoose');
var Mix = mongoose.model('Mix');
var ObjectId = require('mongoose').Types.ObjectId;

exports.routes = function(app) {
	app.get('/dj/:url/page/:page', exports.dj);
	app.get('/mc/:url/page/:page', exports.mc);
	app.get('/crew/:url/page/:page', exports.crew);
	app.get('/search/:term', exports.search);

};

exports.dj = function(req, res) {
	var page = req.params.page;

	if (page < 1) {
		page = 1;
	}

	var skip = (page - 1) * 20;
	Mix.find({dj: req.params.url, hidden: false}).skip(skip).sort({date: -1}).limit(20)
		.exec(function(err, mixes) {
			if (err){
				console.log("find error");
				throw err;
			}
			var currentUrl = '/dj/' + req.params.url + '/page/';
			res.render('mixes', {url: currentUrl, mixes: mixes, page: page});
	});
};

exports.mc = function(req, res) {
		var page = req.params.page;

	if (page < 1) {
		page = 1;
	}

	var skip = (page - 1) * 20;
	Mix.find({mcs: req.params.url, hidden: false}).skip(skip).sort({date: -1}).limit(20)
		.exec(function(err, mixes) {
			if (err){
				console.log("find error");
				throw err;
			}

			var currentUrl = '/mc/' + req.params.url + '/page/';
			res.render('mixes', {url: currentUrl, mixes: mixes, page: page});
	});
};

exports.crew = function(req, res) {
	var page = req.params.page;

	if (page < 1) {
		page = 1;
	}

	var skip = (page - 1) * 20;
	Mix.find({crews: req.params.url, hidden: false}).skip(skip).sort({date: -1}).limit(20)
		.exec(function(err, mixes) {
			if (err){
				console.log("find error");
				throw err;
			}

			var currentUrl = '/crew/' + req.params.url + '/page/';
			res.render('mixes', {url: currentUrl, mixes: mixes, page: page});
	});
};

exports.search = function(req, res) {
	
};
