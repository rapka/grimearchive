var mongoose = require('mongoose');
var Mix = mongoose.model('Mix');
var ObjectId = require('mongoose').Types.ObjectId;

exports.routes = function(app) {
	app.get('/', exports.index);
	app.get('/about', exports.about);
};

exports.index = function(req, res) {
	Mix.find({hidden: false}).sort({date: -1}).limit(6).exec(function(err, recent) {
			if (err){
				console.log("find error");
				throw err;
			}

		Mix.find({hidden: false}).sort({downloads: -1}).limit(6).exec(function(err, popular) {
				if (err){
					console.log("find error");
					throw err;
				}
				
				res.render('index', { title: 'Grime Archive', popular: popular, recent: recent});
		});
	});

	
};

exports.about = function(req, res) {
	res.render('about', { title: 'About Grime Archive' });
};

