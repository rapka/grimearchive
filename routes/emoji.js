const fs = require('fs');
const path = require('path');

exports.routes = (app) => {
	app.get('/emoji/:emoji', exports.index);
};

exports.index = (req, res) => {
	const emoji1 = parseInt(req.params.emoji.substring(0, 2), 16);
	const emoji2 = parseInt(req.params.emoji.substring(2, 4), 16);
	const emoji3 = parseInt(req.params.emoji.substring(4, 6), 16);
	const emoji4 = parseInt(req.params.emoji.substring(6, 8), 16);
	const emojis = fs.readFileSync(path.join(__dirname, '/../emoji.txt'), {encoding: 'utf8'}).split('\n');
	const encoded = emojis[emoji1] + emojis[emoji2] + emojis[emoji3] + emojis[emoji4];
	res.end(encoded);
};
