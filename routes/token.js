exports.routes = (app) => {
  app.get('/', exports.index);
};

exports.index = (req, res) => {
  res.render('index', { title: 'Grime Archive' });
};
