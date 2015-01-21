exports.routes = function(app) {
	app.get('/', exports.index);
	app.get('/about', exports.about);
};

exports.index = function(req, res) {
	res.render('index', { title: 'Grimelist' });
};

exports.about = function(req, res) {
	res.render('about', { title: 'Grimelist' });
};

