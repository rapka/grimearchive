var mongoose = require('mongoose');
var Mix = mongoose.model('Mix');

exports.routes = function(app) {
	app.get('/', exports.index);
	app.get('/about', exports.about);
};

exports.index = function(req, res) {
	Mix.find({hidden: false, mcs: [], crews: []}).sort({date: -1}).limit(5).exec(function(err, instrumentals) {
		if (err) {
			throw err;
		}

		Mix.find({hidden: false}).sort({date: -1}).limit(5).exec(function(err, recent) {
			if (err) {
				throw err;
			}

			Mix.find({hidden: false}).sort({downloads: -1}).limit(5).exec(function(err, popular) {
				if (err) {
					throw err;
				}
				Mix.count({hidden: false}, function(err, count) {
					Mix.aggregate({
						$group: {
							_id: null,
							total: {
								$sum: '$duration'
							},
							downloads: {
								$sum: '$downloads'
							}
						}
					}, {
						$project: {
							_id: 0,
							total: 1,
							downloads: 2
						}
					}, function(err, result) {
						console.log(result[0].total);
						console.log(result);
						res.render('index', {title: 'The Grime Archive', sum: Math.floor(result[0].total / 60), downloads: result[0].downloads, popular: popular, recent: recent, count: count, instrumentals: instrumentals});
					});
				});
			});
		});
	});
};

exports.about = function(req, res) {
	res.render('about', {title: 'About Grime Archive'});
};

