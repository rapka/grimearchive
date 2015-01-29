var fs = require('fs');

exports.routes = function(app) {
	app.get('/emoji/:emoji', exports.index);
};

exports.index = function(req, res) {
	var emoji1 = parseInt(req.params.emoji.substring(0, 2), 16);
	var emoji2 = parseInt(req.params.emoji.substring(2, 4), 16);
	var emoji3 = parseInt(req.params.emoji.substring(4, 6), 16); 
	var emoji4 = parseInt(req.params.emoji.substring(6, 8), 16);
	console.log("index1");
	console.log(emoji1);
	console.log(req.params.emoji.substring(0, 2));
	var emojis = fs.readFileSync(__dirname + '/../emoji.txt', {encoding: 'utf8'}).split('\n');
	var index = parseInt(req.params.emoji, 16);
	var encoded = emojis[emoji1] + emojis[emoji2] + emojis[emoji3] + emojis[emoji4];
	res.end(encoded);
};
