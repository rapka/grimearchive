const fs = require('fs');

exports.routes = (app) => {
	app.get('/quote', exports.index);
};

exports.index = (req, res) => {
	const quotes = fs.readFileSync(__dirname + '/../quotes.txt', {encoding: 'utf8'}).split('\n');
	const rng = Math.floor(Math.random() * quotes.length);
	const quote = quotes[rng];
	res.end(quote);
};
