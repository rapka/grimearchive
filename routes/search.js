var mongoose = require('mongoose');
var Mix = mongoose.model('Mix');
var ObjectId = require('mongoose').Types.ObjectId;
var pageCount = 20;

exports.routes = function(app) {
	app.get('/mixes', exports.mixes);
	app.get('/mixes/page/:page', exports.mixes);
	app.get('/dj/:url/page/:page', exports.dj);
	app.get('/dj/:url', exports.dj);
	app.get('/mc/:url/page/:page', exports.mc);
	app.get('/mc/:url', exports.mc);
	app.get('/crew/:url/page/:page', exports.crew);
	app.get('/crew/:url', exports.crew);
	app.get('/search', exports.searchForm);
	app.get('/search/:url/page/:page', exports.search);
	app.get('/uploader/:url/page/:page', exports.uploader);
	app.get('/uploader/:url', exports.uploader);
	app.get('/station/:url', exports.station);
	app.get('/station/:url/page/:page', exports.station);
	app.get('/instrumentals', exports.instrumentals);
	app.get('/instrumentals/page/:page', exports.instrumentals);
};

exports.mixes = function(req, res) {
	var page;

	if (typeof req.params.page !== 'undefined') {

		page = req.params.page;

		if (page < 1) {
			page = 1;
		}
	} else {
		page = 1;
	}

	var skip = (page - 1) * pageCount;

	Mix.count({hidden: false}).exec(function(err, count) {
			if (err){
				console.log("find error");
				throw err;
			}

		Mix.find({hidden: false}).skip(skip).sort({date: -1}).limit(pageCount)
			.exec(function(err, mixes) {
				if (err){
					console.log("find error");
					throw err;
				}
				var currentUrl = '/mixes/page/';
				
				var hasNext = false;
				if (count > (skip + pageCount)) {
					hasNext = true;
				}

				res.render('mixes', {title: 'All Mixes', mixes: mixes, url: currentUrl, page: page, hasNext: hasNext});
		});
	});
};

exports.instrumentals = function(req, res) {
	var page;

	if (typeof req.params.page !== 'undefined') {

		page = req.params.page;

		if (page < 1) {
			page = 1;
		}
	} else {
		page = 1;
	}

	var skip = (page - 1) * pageCount;

	Mix.count({hidden: false, mcs: [], crews: []}).exec(function(err, count) {
			if (err){
				console.log("find error");
				throw err;
			}

		Mix.find({hidden: false, mcs: [], crews: []}).skip(skip).sort({date: -1}).limit(pageCount)
			.exec(function(err, mixes) {
				if (err){
					console.log("find error");
					throw err;
				}
				var currentUrl = '/instrumentals/page/';
				
				var hasNext = false;
				if (count > (skip + pageCount)) {
					hasNext = true;
				}

				res.render('mixes', {title: 'Instrumental Only Mixes', mixes: mixes, url: currentUrl, page: page, hasNext: hasNext});
		});
	});
};

exports.dj = function(req, res) {
	var page;

	if (typeof req.params.page !== 'undefined') {

		page = req.params.page;
		
		if (page < 1) {
			page = 1;
		}
	} else {
		page = 1;
	}

	var skip = (page - 1) * pageCount;

	Mix.count({dj: req.params.url, hidden: false}).exec(function(err, count) {
			if (err){
				console.log("find error");
				throw err;
			}

		Mix.find({dj: req.params.url, hidden: false}).skip(skip).sort({date: -1}).limit(pageCount)
			.exec(function(err, mixes) {
				if (err){
					console.log("find error");
					throw err;
				}
				var currentUrl = '/dj/' + req.params.url + '/page/';
				
				var hasNext = false;
				if (count > (skip + pageCount)) {
					hasNext = true;
				}

				res.render('mixes', {title: 'Mixes by ' + req.params.url, mixes: mixes, url: currentUrl, page: page, hasNext: hasNext});
		});
	});
};

exports.mc = function(req, res) {
	var page;

	if (typeof req.params.page !== 'undefined') {

		page = req.params.page;
		
		if (page < 1) {
			page = 1;
		}
	} else {
		page = 1;
	}

	var skip = (page - 1) * pageCount;

	Mix.count({mcs: req.params.url, hidden: false}).exec(function(err, count) {
			if (err){
				console.log("find error");
				throw err;
			}

		Mix.find({mcs: req.params.url, hidden: false}).skip(skip).sort({date: -1}).limit(pageCount)
			.exec(function(err, mixes) {
				if (err){
					console.log("find error");
					throw err;
				}
				var currentUrl = '/mc/' + req.params.url + '/page/';
				
				var hasNext = false;
				if (count > (skip + pageCount)) {
					hasNext = true;
				}

				res.render('mixes', {title: 'Mixes featuring ' + req.params.url, mixes: mixes, url: currentUrl, page: page, hasNext: hasNext});
		});
	});
};

exports.crew = function(req, res) {
	var page;

	if (typeof req.params.page !== 'undefined') {

		page = req.params.page;
		
		if (page < 1) {
			page = 1;
		}
	} else {
		page = 1;
	}

	var skip = (page - 1) * pageCount;

	Mix.count({crews: req.params.url, hidden: false}).exec(function(err, count) {
			if (err){
				console.log("find error");
				throw err;
			}

		Mix.find({crews: req.params.url, hidden: false}).skip(skip).sort({date: -1}).limit(pageCount)
			.exec(function(err, mixes) {
				if (err){
					console.log("find error");
					throw err;
				}
				var currentUrl = '/crew/' + req.params.url + '/page/';
				
				var hasNext = false;
				if (count > (skip + pageCount)) {
					hasNext = true;
				}

				res.render('mixes', {title: 'Mixes featuring ' + req.params.url, mixes: mixes, url: currentUrl, page: page, hasNext: hasNext});
		});
	});
};

exports.uploader = function(req, res) {
	var page;

	if (typeof req.params.page !== 'undefined') {

		page = req.params.page;
		
		if (page < 1) {
			page = 1;
		}
	} else {
		page = 1;
	}

	var skip = (page - 1) * pageCount;

	var user = req.params.url.split("-")[0];
	var trip = req.params.url.split("-")[1];

	Mix.count({uploader: user, tripcode: trip, hidden: false}).exec(function(err, count) {
			if (err){
				console.log("find error");
				throw err;
			}


		Mix.find({uploader: user, tripcode: trip, hidden: false}).skip(skip).sort({date: -1}).limit(pageCount)
			.exec(function(err, mixes) {
				if (err){
					console.log("find error");
					throw err;
				}
				var currentUrl = '/uploader/' + req.params.url + '/page/';
				
				var hasNext = false;
				if (count > (skip + pageCount)) {
					hasNext = true;
				}

				res.render('mixes', {title: 'Mixes uploaded by ' + user, mixes: mixes, url: currentUrl, page: page, hasNext: hasNext});
		});
	});
};

exports.station = function(req, res) {
	var page;

	if (typeof req.params.page !== 'undefined') {

		page = req.params.page;
		
		if (page < 1) {
			page = 1;
		}
	} else {
		page = 1;
	}

	var skip = (page - 1) * pageCount;

	Mix.count({station: req.params.url, hidden: false}).exec(function(err, count) {
			if (err){
				console.log("find error");
				throw err;
			}

		Mix.find({station: req.params.url, hidden: false}).skip(skip).sort({date: -1}).limit(pageCount)
			.exec(function(err, mixes) {
				if (err){
					console.log("find error");
					throw err;
				}
				var currentUrl = '/station/' + req.params.url + '/page/';
				
				var hasNext = false;
				if (count > (skip + pageCount)) {
					hasNext = true;
				}

				res.render('mixes', {title: 'Mixes from ' + req.params.url, mixes: mixes, url: currentUrl, page: page, hasNext: hasNext});
		});
	});
};

// Route for initial search. Search form comes as a query
exports.searchForm = function(req, res) {
	var page;

	var searchTerm = req.query['title'];

	if (typeof req.params.page !== 'undefined') {

		page = req.params.page;
		
		if (page < 1) {
			page = 1;
		}
	} else {
		page = 1;
	}
	var user = searchTerm.split("-")[0];
	var trip = searchTerm.split("-")[1];

	var skip = (page - 1) * pageCount;
	var regexQuery = { $regex : new RegExp(searchTerm, "i") };
	
	var query = { $or : [
		{dj:  regexQuery, hidden: false},
		{title: regexQuery, hidden: false},
		{title: regexQuery, hidden: false},
		{mcs: regexQuery, hidden: false},
		{crews: regexQuery, hidden: false},
		{station: regexQuery, hidden: false},
		{uploader: regexQuery, hidden: false}
	]};
	Mix.count(query).exec(function(err, count) {
			if (err){
				console.log("find error");
				throw err;
			}

		Mix.find(query).skip(skip).sort({date: -1}).limit(pageCount)
			.exec(function(err, mixes) {
				if (err){
					console.log("find error");
					throw err;
				}
				var currentUrl = '/search/' + searchTerm + '/page/';
				
				var hasNext = false;
				if (count > (skip + pageCount)) {
					hasNext = true;
				}

				res.render('mixes', {title: 'Search results for "' + searchTerm + '"', mixes: mixes, url: currentUrl, page: page, hasNext: hasNext});
		});
	});
};

// Route for search pages > 1. Search term comes through url
exports.search = function(req, res) {
	var page;

	var searchTerm = req.params.url;

	if (typeof req.params.page !== 'undefined') {

		page = req.params.page;
		
		if (page < 1) {
			page = 1;
		}
	} else {
		page = 1;
	}
	var user = searchTerm.split("-")[0];
	var trip = searchTerm.split("-")[1];

	var skip = (page - 1) * pageCount;
	var regexQuery = { $regex : new RegExp(searchTerm, "i") };

	var query = { $or : [
		{dj:  regexQuery, hidden: false},
		{title: regexQuery, hidden: false},
		{title: regexQuery, hidden: false},
		{mcs: regexQuery, hidden: false},
		{crews: regexQuery, hidden: false},
		{station: regexQuery, hidden: false},
		{uploader: regexQuery, hidden: false}
	]};
	Mix.count(query).exec(function(err, count) {
			if (err){
				console.log("find error");
				throw err;
			}

		Mix.find(query).skip(skip).sort({date: -1}).limit(pageCount)
			.exec(function(err, mixes) {
				if (err){
					console.log("find error");
					throw err;
				}
				var currentUrl = '/search/' + searchTerm + '/page/';
				
				var hasNext = false;
				if (count > (skip + pageCount)) {
					hasNext = true;
				}

				res.render('mixes', {title: 'Search results for "' + searchTerm + '"', mixes: mixes, url: currentUrl, page: page, hasNext: hasNext});
		});
	});
};
