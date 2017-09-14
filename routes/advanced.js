const mongoose = require('mongoose');

const Mix = mongoose.model('Mix');
const pageCount = 20;

exports.routes = function(app) {
	app.get('/advanced', exports.advanced);
	app.get('/advancedsearch', exports.advancedSearch);

};

exports.advanced = function(req, res) {
	res.render('advanced', {title: 'Advanced Search'});
};

// Route for initial search. Search form comes as a query
exports.advancedSearch = function(req, res) {
	const searchTerm = req.query['title'];
	const sortBy = req.query['sortby'];
	const page = parseInt(req.query['page']);

	if (page < 1 || !page) {
		page = 1;
	}

	const skip = (page - 1) * pageCount;
	const minBitrate = req.query['bitrate'] ? req.query['bitrate'] : 0;
	const direction = parseInt(req.query['ascending']);
	let sortQuery;

	if (sortBy === 'uploaddate') {
		sortQuery = {date: direction};
	} else if (sortBy === 'airdate') {
		sortQuery = {year: direction, month: direction, day: direction};
	} else if (sortBy === 'downloads') {
		sortQuery = {downloads: direction};
	} else if (sortBy === 'title') {
		sortQuery = {title: direction};
	} else if (sortBy === 'dj') {
		sortQuery = {dj: direction};
	} else if (sortBy === 'station') {
		sortQuery = {station: direction};
	} else if (sortBy === 'duration') {
		sortQuery = {duration: direction};
	}

	const query = {};
	if (req.query['mcs']) {
		query.mcs = req.query['mcs'].split(',');
	}

	if (req.query['crews']) {
		query.crews = req.query['crews'].split(',');
	}

	if (req.query['startyear'] && req.query['endyear']) {
		query.year = {$gte: req.query['startyear'], $lte: req.query['endyear']};
	} else if (req.query['startyear']) {
		query.year = {$gte: req.query['startyear']};
	} else if (req.query['endyear']) {
		query.year = {$lte: req.query['endyear']};
	}

	query.bitrate = {$gte: minBitrate};

	if (req.query.title) {
		query.title = req.query.title;
	}

	if (req.query.dj) {
		query.dj = req.query.dj;
	}

	Mix.count(query).exec(function(err, count) {
		if (err) {
			console.error('find error');
			throw err;
		}

		Mix.find(query).skip(skip).sort(sortQuery).limit(pageCount).exec(function(err, mixes) {
			if (err) {
				console.error('find error');
				throw err;
			}
			var currentUrl = '/search/' + searchTerm + '/page/';

			var hasNext = false;
			if (count > (skip + pageCount)) {
				hasNext = true;
			}

			res.render('mixes', {title: 'Advanced search results', query: req.query, mixes: mixes, url: currentUrl, page: page, hasNext: hasNext, advanced: true});
		});
	});
};
