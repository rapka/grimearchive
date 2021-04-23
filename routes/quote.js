const fs = require('fs');
const path = require('path');

exports.routes = (app) => {
  app.get('/quote', exports.index);
};

exports.index = (req, res) => {
  const quotes = fs.readFileSync(path.join(__dirname, '/../quotes.txt'), {encoding: 'utf8'}).split('\n');
  const rng = Math.floor(Math.random() * quotes.length);
  const quote = quotes[rng];
  res.end(quote);
};
