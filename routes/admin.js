const mongoose = require('mongoose');
const crypto = require('crypto');
const fs = require('fs');
const config = require('../config');
const { createPagination } = require('./search');

const pageCount = 20;
const Mix = mongoose.model('Mix');

exports.routes = (app) => {
  app.get('/admin', exports.loginForm);
  app.post('/admin/login', exports.login);
  app.get('/admin/:message', exports.loginForm);
  app.get('/edit/:url', exports.edit);
  app.get('/hidden', exports.hidden);
  app.get('/delete/:url', exports.remove);
};

exports.loginForm = (req, res) => {
  if (req.session.username && req.params.message === 'loggedIn') {
    res.render('login', { message: req.params.message });
  } else if (req.params.message === 'loggedIn') {
    res.render('login');
  } else {
    res.render('login', { message: req.params.message });
  }
};

// Attemps a user login.
exports.login = (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.body.password).digest('hex');
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminPassword === hashed) {
    req.session.username = req.body.user;

    req.session.save(() => {
      res.redirect('/admin/loggedIn');
    });
  } else {
    res.redirect('/admin/invalid');
  }
};

exports.edit = (req, res) => {
  if (!req.session.username) {
    res.status(401).render('404.jade', { title: 'Not Found' });
    return;
  }

  Mix.findOne({ url: req.params.url }).exec((err, mix) => {
    let title;
    if (mix.dj) {
      title = mix.dj + ' - ';
    } else {
      title = 'Unknown DJ - ';
    }

    if (mix.title) {
      title += mix.title;
    } else {
      title += 'Untitled';
    }

    res.render('edit', {
      title,
      mix,
    });
  });
};

exports.remove = (req, res) => {
  if (!req.session.username) {
    res.status(401).render('404.jade', { title: 'Not Found' });
    return;
  }

  const mix = Mix.findOne({ url: req.params.url, hidden: true }).exec((err) => {
    if (err) {
      console.error(err);
    } else {
      const filePath = path.join(__dirname, '/..', 'upload', mix.file);
      fs.unlinkSync(filePath);
      mix.remove();
    }
    res.render('upload');
  });
};

exports.hidden = async (req, res) => {
  if (!req.session.username) {
    res.status(401).render('404.jade', { title: 'Not Found' });
    return;
  }

  const count = await Mix.countDocuments({ hidden: true });
  const { page, skip, hasNext } = createPagination(req.params.page, count);
  const mixes = await Mix.find({ hidden: true }).skip(skip).sort({ date: -1 }).limit(pageCount);
  const url = '/mixes/page/';

  res.render('mixes', { title: 'Hidden Mixes', mixes, url, page, hasNext });
};

