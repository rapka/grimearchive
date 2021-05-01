const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
const ffprobe = require('node-ffprobe');
const multer = require('multer');
require('../models/mix');
const mongoose = require('mongoose');

ffprobe.FFPROBE_PATH = ffprobeInstaller.path;
const UPLOAD_DIRECTORY = process.env.UPLOAD_DIRECTORY || config.uploadDirectory;

const ALLOWED_TYPES = [
  'audio/mpeg3',
  'audio/mpeg',
  'audio/mp3',
];

if (fs.existsSync(path.join(__dirname, '/../aws.json'))) {
  AWS.config.loadFromPath(path.join(__dirname, '/../aws.json'));
}

const Mix = mongoose.model('Mix');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/uploads')
  },
  filename: function (req, file, cb) {
    const ts = String(new Date().getTime());
    let num = ts.substr(ts.length - 7);
    let currentPath = UPLOAD_DIRECTORY + num + '.mp3';

    // Check for duplicates
    while (fs.existsSync(currentPath)) {
      String(new Date().getTime());
      num = ts.substr(ts.length - 7);
      currentPath = UPLOAD_DIRECTORY + num + '.mp3';
    }

    cb(null, num);
  }
});

var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Only allow files with a type in the allowedTypes array.
    if (ALLOWED_TYPES.indexOf(file.mimetype) === -1) {
      console.log('415: Disallowed file type: ' + file.mimetype);
      cb(null, false);
    }
    console.log(`file uploading: ${file}`);

    cb(null, true);
  }
});

// app.use(multer({
//   dest: './upload/',
//   rename: uploadHandler.rename,
//   fileFilter: uploadHandler.fileFilter,
//   onFileUploadComplete: uploadHandler.onFileUploadComplete,
//   onParseEnd: uploadHandler.onParseEnd,
//   onFileUploadData: uploadHandler.onFileUploadData,
// }));

const s3 = new AWS.S3();

exports.routes = (app) => {
  app.get('/upload', exports.index);
  app.post('/upload', upload.single('mixUpload'), exports.add);
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
  const file = req.file;
  console.log('inn post endpoint', file);

  try {
    const probeData = await ffprobe(file.path);
    console.log('Got probe data', probeData.streams[0].duration);
    // await Mix.updateOne({ file: file.name }, {
    //   bitrate: probeData.streams[0].bit_rate / 1000,
    //   duration: probeData.streams[0].duration,
    // });

  } catch (err) {
    console.error('Upload processing error:', err);
  }

  if (typeof req.files.file !== 'undefined') {
    res.send('/mix/' + req.files.file.name.split('.')[0]);
  } else {
    console.log('no file selected');
    res.redirect('/upload');
  }
};
