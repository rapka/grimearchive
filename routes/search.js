const mongoose = require('mongoose');

const Mix = mongoose.model('Mix');
const PAGE_COUNT = 20;

exports.routes = (app) => {
  app.get('/mixes', exports.mixes);
  app.get('/mixes/page/:page', exports.mixes);
  app.get('/dj/:dj/page/:page', exports.dj);
  app.get('/dj/:dj', exports.dj);
  app.get('/mc/:mc/page/:page', exports.mc);
  app.get('/mc/:mc', exports.mc);
  app.get('/crew/:crew/page/:page', exports.crew);
  app.get('/crew/:crew', exports.crew);
  app.get('/uploader/:uploader/page/:page', exports.uploader);
  app.get('/uploader/:uploader', exports.uploader);
  app.get('/station/:station', exports.station);
  app.get('/station/:station/page/:page', exports.station);
  app.get('/instrumentals', exports.instrumentals);
  app.get('/instrumentals/page/:page', exports.instrumentals);

  app.get('/search', exports.search);
  app.get('/search/:searchTerm/page/:page', exports.search);
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

const renderMixes = async (req, res, title, url, mongoQuery) => {
  const count = await Mix.countDocuments(mongoQuery);
  const { page, skip, hasNext } = createPagination(req.params.page, count);
  const mixes = await Mix.find(mongoQuery).skip(skip).sort({ date: -1 }).limit(PAGE_COUNT);

  res.render('mixes', { title, mixes, url, page, hasNext });
};

exports.createPagination = createPagination;

exports.mixes = async (req, res) => {
  const title = 'All Mixes';
  const url = '/mixes/page/';
  const query = { hidden: false };

  await renderMixes(req, res, title, url, query);
};

exports.instrumentals = async (req, res) => {
  const query = { hidden: false, mcs: [], crews: [] };
  const url = '/instrumentals/page/';
  const title = 'Instrumental Only Mixes';

  await renderMixes(req, res, title, url, query);
};

exports.dj = async (req, res) => {
  const query = { dj: req.params.dj, hidden: false };
  const url = '/dj/' + req.params.dj + '/page/';
  const title = `Mixes by ${req.params.dj}`;

  await renderMixes(req, res, title, url, query);
};

exports.mc = async (req, res) => {
  const query = { mcs: req.params.mc, hidden: false };
  const url = '/mc/' + req.params.mc + '/page/';
  const title = `Mixes featuring ${req.params.mc}`;

  await renderMixes(req, res, title, url, query);
};

exports.crew = async (req, res) => {
  const query = { crews: req.params.crew, hidden: false };
  const url = '/crew/' + req.params.crew + '/page/';
  const title = `Mixes featuring ${req.params.crew}`;

  await renderMixes(req, res, title, url, query);
};

exports.uploader = async (req, res) => {
  const user = req.params.uploader.split('-')[0];
  const trip = req.params.uploader.split('-')[1];
  const query = { uploader: user, hidden: false };

  if (trip) {
    query.tripcode = trip;
  }

  const url = '/uploader/' + req.params.uploader + '/page/';
  const title = `Mixes uploaded by ${user}`;

  await renderMixes(req, res, title, url, query);
};

exports.station = async (req, res) => {
  const query = { station: req.params.station, hidden: false };
  const url = '/station/' + req.params.station + '/page/';
  const title = `Mixes played on ${req.params.station}`;

  await renderMixes(req, res, title, url, query);
};

exports.search = async (req, res) => {
  let searchTerm;
  if (req.params.searchTerm) {
    searchTerm = req.params.searchTerm;
  } else if (req.query.title) {
    searchTerm = req.query.title;
  } else {
    res.status(500).send('No search term entered');
  }
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
  const url = `/search/${searchTerm}/page/`;
  const title = `Search results for '${searchTerm}`;

  await renderMixes(req, res, title, url, query);
};
