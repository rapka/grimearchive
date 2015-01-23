var mongoose = require('mongoose');
var Mix = mongoose.model('Mix');
var ObjectId = require('mongoose').Types.ObjectId;

exports.routes = function(app) {
	app.get('/mixes', exports.index);
	app.get('/mix/:url', exports.view);
	app.get('/mixes/page/:page', exports.page);


};

exports.index = function(req, res) {
	Mix.find().sort({date: -1}).limit(20)
		.exec(function(err, mixes) {
			if (err){
				console.log("find error");
				throw err;
			}

			res.render('mixes', {title: 'Grimelist', mixes: mixes, page: 1});
	});
};

exports.page = function(req, res) {
	var page = req.params.page;
	console.log("pagE:", page);
	if (page < 1) {
		page = 1;
	}

	var skip = (page - 1) * 20;

	Mix.find({hidden: false}).skip(skip).sort({date: -1}).limit(20)
		.exec(function(err, mixes) {
			if (err){
				console.log("find error");
				throw err;
			}
			var currentUrl = '/mixes/page/';
			res.render('mixes', {title: 'Grimelist', mixes: mixes, url: currentUrl, page: page});
	});
};


exports.view = function(req, res) {
	var mix = Mix.findOne({url: req.params.url}).exec(function (err, mix){
		var title;
		if (mix.dj) {
			title = mix.dj + " - "; 
		}
		else {
			title = "Unknown DJ - ";
		}

		if (mix.title) {
			title += mix.title;
		}
		else {
			title += "Untitled";
		}
		res.render('mix', {
			title: title,
			mix: mix
		});
	});
};
