const mongoose = require('mongoose');
const Mix = mongoose.model('Mix');
const admins = require('../admins');
const crypto = require('crypto');
const fs = require('fs');
const config = require('../config');
const pageCount = 20;

exports.routes = function(app) {
	app.get('/admin', exports.loginForm);
	app.post('/admin/login', exports.login);
	app.get('/admin/:message', exports.loginForm);
	app.get('/edit/:url', exports.edit);
	app.get('/hidden', exports.hidden);
	app.get('/delete/:url', exports.remove);
};

exports.loginForm = function(req, res) {
	console.log(req.session);
	console.log(req.session.username);
	if (req.session.username && req.params.message == 'loggedIn') {
		res.render('login', {message: req.params.message});
	} else if (req.params.message == 'loggedIn') {
		res.render('login');
	} else {
		res.render('login', {message: req.params.message});
	}
};

// Attemps a user login.
exports.login = function(req, res) {
	var hashed = crypto.createHash('sha256').update(req.body.password).digest('hex');
	if (admins.hasOwnProperty(req.body.user) && admins[req.body.user] === hashed) {
		req.session.username = req.body.user;

		req.session.save(() => {
			res.redirect('/admin/loggedIn');
		});
	} else {
		res.redirect('/admin/invalid');
	}
};

exports.edit = function(req, res) {
	if (!req.session.username) {
		res.status(401).render('404.jade', {title: 'Not Found'});
		return;
	}

	Mix.findOne({url: req.params.url}).exec((err, mix) => {
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
		res.status(401).render('404.jade', {title: 'Not Found'});
		return;
	}

	const mix = Mix.findOne({url: req.params.url, hidden: true}).exec((err) => {
		if (err) {
			console.error(err);
		} else {
			fs.unlinkSync(config.uploadDirectory + mix.file);
			mix.remove();
		}
		res.render('upload');
	});
};

exports.hidden = (req, res) => {
	let page;

	if (!req.session.username) {
		res.status(401).render('404.jade', {title: 'Not Found'});
		return;
	}

	if (typeof req.params.page !== 'undefined') {
		page = req.params.page;

		if (page < 1) {
			page = 1;
		}
	} else {
		page = 1;
	}

	const skip = (page - 1) * pageCount;

	Mix.count({hidden: true}).exec((err, count) => {
		if (err) {
			console.error('find error');
			throw err;
		}

		Mix.find({hidden: true}).skip(skip).sort({date: -1}).limit(pageCount).exec((err, mixes) => {
			if (err) {
				console.error('find error');
				throw err;
			}
			const currentUrl = '/mixes/page/';

			let hasNext = false;
			if (count > (skip + pageCount)) {
				hasNext = true;
			}

			res.render('mixes', {title: 'Hidden Mixes', mixes: mixes, url: currentUrl, page: page, hasNext: hasNext});
		});
	});
};

