exports.routes = function(app) {

	app.get('/', exports.index);
	app.get('/mixes', exports.mixes);
};

exports.index = function(req, res) {

	res.render('index', { title: 'Grimelist' });

};

exports.mixes = function(req, res) {

	res.render('mixes', { title: 'Grimelist' });

};



