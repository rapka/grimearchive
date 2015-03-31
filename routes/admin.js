var mongoose = require('mongoose');
var Mix = mongoose.model('Mix');
var ObjectId = require('mongoose').Types.ObjectId;

exports.routes = function(app) {
	app.get('/admin', exports.login);
	app.get('/admin/:id', exports.edit);
};

exports.login = function(req, res) {

				if (req.session.validated) {
					res.render('login', { form: false});
				}
				else {
					res.render('login', { form: true});
				}


	
};

exports.about = function(req, res) {
	res.render('about', { title: 'Grimelist' });
};

