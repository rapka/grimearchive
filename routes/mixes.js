const mongoose = require('mongoose');

const Mix = mongoose.model('Mix');

exports.routes = (app) => {
	app.get('/mix/:url', exports.view);
};

exports.view = (req, res) => {
	Mix.findOne({url: req.params.url}).exec((err, mix) => {
		if (err || !mix) {
			res.status(401).render('404.jade', {title: 'Not Found'});
		}

		if (!mix.hidden || req.session.username) {
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

			title += ' | Grime Archive';

			res.render('mix', {
				title,
				mix,
			});
		} else {
			res.status(401).render('404.jade', {title: 'Not Found'});
		}
	});
};
