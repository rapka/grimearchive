var fs = require('fs');

exports.routes = function(app) {
	app.get('/quote', exports.index);
};

exports.index = function(req, res) {
	console.log("dir", __dirname);
	var quotes = fs.readFileSync(__dirname + '/../quotes.txt', {encoding: 'utf8'}).split('\n');
	var rng = Math.floor(Math.random() * quotes.length); 
	var quote = quotes[rng];
	console.log("length:", rng);
	console.log("quote:", quote);
	res.end(quote);
};
