var mongoose = require('mongoose');
var Mix = mongoose.model('Mix');
var ObjectId = require('mongoose').Types.ObjectId;
var admins = require('../admins');
var crypto = require('crypto');

exports.routes = function(app) {
	app.get('/admin', exports.loginForm);
	app.post('/admin/login', exports.login);
	app.get('/admin/:message', exports.loginForm);
	app.get('/edit/:url', exports.edit);
};

exports.loginForm = function(req, res) {
	console.log(req.session);
	console.log(req.session.name);
	if (req.session.name) {
		res.render('login', { message: 'loggedIn'});
	}
	else {
		res.render('login', { message: req.params.message});
	}
	
};

// Attemps a user login.
// Success: redirects to /users/dashboard
// Failure: redirects to /users/login
exports.login = function(req, res) {
	console.log(req.body.password);
	var hashed = crypto.createHash('sha256').update(req.body.password).digest('hex');
	console.log(hashed);
	console.log("???");
	console.log(admins);
	for (user in admins){
		if (req.body.user == user && hashed == admins[user]) {
			console.log(user);
			req.session.name = user;
			console.log('1');
			console.log(req.session);
			console.log(req.session.name);
			res.redirect("/admin/loggedIn");
			return;
		}
		
	}
	res.redirect("/admin/invalid");
};

exports.edit = function(req, res) {
	if (!req.session.name) {
    	res.status(401).send("401: You don't have access to this page.");
    	return;
 	}

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
		res.render('edit', {
			title: title,
			mix: mix
		});
	});
};