const mongoose = require('mongoose');
const {createPagination} = require('./search');

const Mix = mongoose.model('Mix');
const pageCount = 20;

exports.routes = (app) => {
	app.get('/advanced', exports.advanced);
	app.get('/advancedsearch', exports.advancedSearch);

};

exports.advanced = (req, res) => {
	res.render('advanced', {title: 'Advanced Search'});
};

// Route for initial search. Search form comes as a query
exports.advancedSearch = async (req, res) => {
	const searchTerm = req.query.title;
	const sortBy = req.query.sortby;
	const minBitrate = req.query.bitrate ? req.query.bitrate : 0;
	const direction = parseInt(req.query.ascending);
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
	if (req.query.mcs) {
		query.mcs = req.query.mcs.split(',');
	}

	if (req.query.crews) {
		query.crews = req.query.crews.split(',');
	}

	if (req.query.startyear && req.query.endyear) {
		query.year = {$gte: req.query.startyear, $lte: req.query.endyear};
	} else if (req.query.startyear) {
		query.year = {$gte: req.query.startyear};
	} else if (req.query.endyear) {
		query.year = {$lte: req.query.endyear};
	}

	query.bitrate = {$gte: minBitrate};
	query.hidden = false;

	if (req.query.title) {
		query.title = req.query.title;
	}

	if (req.query.dj) {
		query.dj = req.query.dj;
	}

	const count = await Mix.count(query);
	const {page, skip, hasNext} = createPagination(parseInt(req.query.page), count);
	const mixes = await Mix.find(query).skip(skip).sort(sortQuery).limit(pageCount);
	const url = '/search/' + searchTerm + '/page/';
	const advanced = true;

	res.render('mixes', {title: 'Advanced search results', query: req.query, mixes, url, page, hasNext, advanced});
};
