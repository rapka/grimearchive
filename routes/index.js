const mongoose = require('mongoose');

const Mix = mongoose.model('Mix');

mongoose.Promise = global.Promise;

exports.routes = (app) => {
  app.get('/', exports.index);
  app.get('/about', exports.about);
};

exports.index = async (req, res) => {
  const instrumentals = await Mix.find({ hidden: false, mcs: [], crews: [] }).sort({ date: -1 }).limit(5).exec();
  const recent = await Mix.find({ hidden: false }).sort({ date: -1 }).limit(5);
  const popular = await Mix.find({ hidden: false }).sort({ downloads: -1 }).limit(5);
  const count = await Mix.countDocuments({ hidden: false });

  const result = await Mix.aggregate([{
    $group: {
      _id: null,
      total: {
        $sum: '$duration',
      },
      downloads: {
        $sum: '$downloads',
      },
    },
  }, {
    $project: {
      _id: 0,
      total: 1,
      downloads: 2,
    },
  }]);

  let sum = 0;
  let downloads = 0;

  if (result.length > 0) {
    sum = Math.floor(result[0].total / 60);
    { downloads } = result[0];
  }

  res.render('index', { sum, downloads, popular, recent, count, instrumentals });
};

exports.about = (req, res) => {
  res.render('about', { title: 'About' });
};

