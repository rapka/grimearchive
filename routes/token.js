exports.routes = function(app) {

	app.get('/', exports.index);
};

exports.index = function(req, res) {

	res.render('index', { title: 'Grimelist' });

};




