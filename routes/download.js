const mongoose = require('mongoose');
const config = require('../config');
const AWS = require('aws-sdk');
const path = require('path');

const Mix = mongoose.model('Mix');

if (fs.existsSync(path.join(__dirname, '/../aws.json'))) {
  AWS.config.loadFromPath(path.join(__dirname, '/../aws.json'));
}

const s3 = new AWS.S3();

const generateFilename = (mix = {}) => {
  let titleString = '';
  // Append date
  if (mix.day && mix.month && mix.year) {
    titleString = mix.year.toString() + '-' + mix.month.toString() + '-' + mix.day.toString();
  } else if (mix.year) {
    titleString = mix.year.toString();
  } else {
    titleString = 'Unknown Date';
  }

  if (mix.dj) {
    titleString += ', ' + mix.dj;
  } else {
    titleString += ', Unknown DJ';
  }

  // Either use user supplied title or radio station
  if (mix.title) {
    titleString += ' - ' + mix.title;
  } else if (mix.station) {
    titleString += ', ' + mix.station;
  } else if (mix.crews.length === 1) { // Append crews if no mcs
    titleString += ' feat ' + mix.crews[0];
  } else if (mix.crews.length >= 1) {
    titleString += ' feat ';
    for (let i = 0; i < mix.crews.length; i++) {
      if (i === 0) {
        titleString += mix.crews[i];
      } else if (i === (mix.crews.length - 1)) {
        titleString += ' & ' + mix.crews[i];
      } else {
        titleString += ', ' + mix.crews[i];
      }
    }
  }

  return titleString.replace(/[\.\/\\$%\^\*;:{}=`~]/g, '_');
};

exports.routes = (app) => {
  app.get('/download/:url', exports.download);
};

exports.download = (req, res) => {
  Mix.findOne({ url: req.params.url }).exec((err, mix) => {
    if (err || !mix) {
      console.error('find error');
      return res.status(404).render('404.jade', { title: 'Not Found' });
    }

    const attachment = 'attachment; filename="' + generateFilename(mix) + '.mp3"';
    const params = {
      Bucket: process.env.AWS_S3_BUCKET || config.bucket,
      Key: req.params.url + '.mp3',
      ResponseContentDisposition: attachment,
  	};

    s3.getSignedUrl('getObject', params, (err, url) => {

      mix.downloads++;
      mix.save();

      res.redirect(url);
    });
  });
};
