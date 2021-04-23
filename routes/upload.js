const AWS = require('aws-sdk');
const path = require('path');

AWS.config.loadFromPath(path.join(__dirname, '/../aws.json'));

const s3 = new AWS.S3();

exports.routes = (app) => {
  app.get('/upload', exports.index);
  app.post('/upload', exports.add);
  app.get('/upload/:url', exports.checkFfmpeg);
};

exports.index = (req, res) => {
  res.render('upload', {
    title: 'Upload',
  });
};

exports.checkFfmpeg = (req, res) => {
  const params = {
    Bucket: 'grimearchive',
    Key: req.params.url + '.mp3',
  };

  s3.headObject(params, (err) => {
    if (err) {
      res.send('-1');
    } else {
      res.send(req.params.url);
    }
  });
};

exports.add = (req, res) => {
  if (typeof req.files.file !== 'undefined') {
    res.send('/mix/' + req.files.file.name.split('.')[0]);
  } else {
    console.log('no file');
    res.redirect('/upload');
  }
};

