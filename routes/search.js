const mongoose = require('mongoose');

const Mix = mongoose.model('Mix');
const PAGE_COUNT = 20;

exports.routes = (app) => {
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

const createPagination = (basePage, count) => {
  let page;

  if (typeof basePage !== 'undefined') {
    page = basePage;

    if (page < 1) {
      page = 1;
    }
  } else {
    page = 1;
  }

  const skip = (page - 1) * PAGE_COUNT;

  let hasNext = false;
  if (count > (skip + PAGE_COUNT)) {
    hasNext = true;
  }

  return { page, skip, hasNext };
};

exports.createPagination = createPagination;

exports.mixes = async (req, res) => {
  const count = await Mix.countDocuments({ hidden: false });
  const { page, skip, hasNext } = createPagination(req.params.page, count);
  const url = '/mixes/page/';
  const mixes = await Mix.find({ hidden: false }).skip(skip).sort({ date: -1 }).limit(PAGE_COUNT);

  res.render('mixes', { title: 'All Mixes', mixes, url, page, hasNext });
};

exports.instrumentals = async (req, res) => {
  const count = await Mix.countDocuments({ hidden: false, mcs: [], crews: [] });
  const { page, skip, hasNext } = createPagination(req.params.page, count);
  const mixes = await Mix.find({ hidden: false, mcs: [], crews: [] }).skip(skip).sort({ date: -1 }).limit(PAGE_COUNT);
  const url = '/instrumentals/page/';

  res.render('mixes', { title: 'Instrumental Only Mixes', mixes, url, page, hasNext });
};

exports.dj = async (req, res) => {
  const count = await Mix.countDocuments({ dj: req.params.url, hidden: false });
  const { page, skip, hasNext } = createPagination(req.params.page, count);
  const mixes = await Mix.find({ dj: req.params.url, hidden: false }).skip(skip).sort({ date: -1 }).limit(PAGE_COUNT);
  const url = '/dj/' + req.params.url + '/page/';

  res.render('mixes', { title: 'Mixes by ' + req.params.url, mixes, url, page, hasNext });
};

exports.mc = async (req, res) => {
  const count = await Mix.countDocuments({ mcs: req.params.url, hidden: false });
  const { page, skip, hasNext } = createPagination(req.params.page, count);
  const mixes = await Mix.find({ mcs: req.params.url, hidden: false }).skip(skip).sort({ date: -1 }).limit(PAGE_COUNT);
  const url = '/mc/' + req.params.url + '/page/';

  res.render('mixes', { title: 'Mixes featuring ' + req.params.url, mixes, url, page, hasNext });
};

exports.crew = async (req, res) => {
  const count = await Mix.countDocuments({ crews: req.params.url, hidden: false });
  const { page, skip, hasNext } = createPagination(req.params.page, count);
  const mixes = await Mix.find({ crews: req.params.url, hidden: false })
    .skip(skip).sort({ date: -1 }).limit(PAGE_COUNT);
  const url = '/crew/' + req.params.url + '/page/';

  res.render('mixes', { title: 'Mixes featuring ' + req.params.url, mixes, url, page, hasNext });
};

exports.uploader = async (req, res) => {
  const user = req.params.url.split('-')[0];
  const trip = req.params.url.split('-')[1];
  const query = { uploader: user, hidden: false };

  if (trip) {
    query.tripcode = trip;
  }

  const count = await Mix.countDocuments();
  const { page, skip, hasNext } = createPagination(req.params.page, count);
  const mixes = await Mix.find(query)
    .skip(skip).sort({ date: -1 }).limit(PAGE_COUNT);
  const url = '/uploader/' + req.params.url + '/page/';

  res.render('mixes', { title: 'Mixes uploaded by ' + user, mixes, url, page, hasNext });
};

exports.station = async (req, res) => {
  const count = await Mix.countDocuments({ station: req.params.url, hidden: false });
  const { page, skip, hasNext } = createPagination(req.params.page, count);
  const mixes	= await Mix.find({ station: req.params.url, hidden: false }).skip(skip).sort({ date: -1 }).limit(PAGE_COUNT);
  const url = '/station/' + req.params.url + '/page/';

  res.render('mixes', { title: 'Mixes from ' + req.params.url, mixes, url, page, hasNext });
};

// Route for initial search. Search form comes as a query
exports.searchForm = async (req, res) => {
  const searchTerm = req.query.title;
  const regexQuery = { $regex: new RegExp(searchTerm, 'i') };
  const query = { $or: [
    { dj: regexQuery, hidden: false },
    { title: regexQuery, hidden: false },
    { title: regexQuery, hidden: false },
    { mcs: regexQuery, hidden: false },
    { crews: regexQuery, hidden: false },
    { station: regexQuery, hidden: false },
    { uploader: regexQuery, hidden: false },
  ] };
  const count = await Mix.countDocuments(query);
  const { page, skip, hasNext } = createPagination(req.params.page, count);
  const mixes = await Mix.find(query).skip(skip).sort({ date: -1 }).limit(PAGE_COUNT);
  const url = '/search/' + searchTerm + '/page/';

  res.render('mixes', { title: 'Search results for "' + searchTerm + '"', mixes, url, page, hasNext });
};

// Route for search pages > 1. Search term comes through url
exports.search = async (req, res) => {
  const searchTerm = req.params.url;
  const regexQuery = { $regex: new RegExp(searchTerm, 'i') };
  const query = { $or: [
    { dj: regexQuery, hidden: false },
    { title: regexQuery, hidden: false },
    { title: regexQuery, hidden: false },
    { mcs: regexQuery, hidden: false },
    { crews: regexQuery, hidden: false },
    { station: regexQuery, hidden: false },
    { uploader: regexQuery, hidden: false },
  ] };
  const count = await Mix.countDocuments(query);
  const { page, skip, hasNext } = createPagination(req.params.page, count);
  const mixes = await Mix.find(query).skip(skip).sort({ date: -1 }).limit(PAGE_COUNT);
  const url = '/search/' + searchTerm + '/page/';

  res.render('mixes', { title: 'Search results for "' + searchTerm + '"', mixes, url, page, hasNext });
};
