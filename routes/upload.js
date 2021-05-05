const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
const ffprobe = require('node-ffprobe');
const multer = require('multer');
const mongoose = require('mongoose');
const crypto = require('crypto');

require('../models/mix');

const Mix = mongoose.model('Mix');

ffprobe.FFPROBE_PATH = ffprobeInstaller.path;

const ALLOWED_TYPES = [
  'audio/mpeg3',
  'audio/mpeg',
  'audio/mp3',
];

if (fs.existsSync(path.join(__dirname, '/../aws.json'))) {
  AWS.config.loadFromPath(path.join(__dirname, '/../aws.json'));
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, '/../upload'));
  },
  filename(req, file, cb) {
    const ts = String(new Date().getTime());
    let num = ts.substr(ts.length - 7);
    let currentPath = path.join(__dirname, `/../upload/${num}.mp3`);

    // Check for duplicates
    while (fs.existsSync(currentPath)) {
      String(new Date().getTime());
      num = ts.substr(ts.length - 7);
      currentPath = path.join(__dirname, `/../upload/${num}.mp3`);
    }

    cb(null, `${num}.mp3`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Only allow files with a type in the allowedTypes array.
    if (ALLOWED_TYPES.indexOf(file.mimetype) === -1) {
      console.error('415: Disallowed file type: ' + file.mimetype);
      cb(null, false);
    }

    cb(null, true);
  },
});

const s3 = new AWS.S3();

exports.routes = (app) => {
  app.get('/upload', exports.index);
  app.post('/upload', upload.single('mixUpload'), exports.add);
  app.post('/edit', exports.edit);
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

exports.add = async (req, res) => {
  const { file } = req;
  let mix;

  try {
    const probeData = await ffprobe(file.path);

    // Server side check for no file selected
    if (typeof file === 'undefined') {
      console.log('error: no file selected');
      return;
    }

    mix = new Mix({
      _id: mongoose.Types.ObjectId(req.body._id),
      title: req.body.title,
      dj: req.body.dj,
      file: file.filename,
      url: file.filename.split('.')[0],
      station: req.body.station,
      bitrate: probeData.streams[0].bit_rate / 1000,
      duration: probeData.streams[0].duration,
    });

    if (req.body.username) {
      mix.uploader = req.body.username;
    }
    if (req.body.tripcode) {
      mix.tripcode = crypto.createHash('sha256').update(req.body.tripcode).digest('hex').substring(0, 8);
    }

    if (req.body.hidden) {
      mix.hidden = req.body.hidden;
    }
    if (req.body.mcs) {
      mix.mcs = req.body.mcs.split(',');
    }
    if (req.body.day) {
      mix.day = parseInt(req.body.day);
    }
    if (req.body.month) {
      mix.month = parseInt(req.body.month);
    }
    if (req.body.year) {
      mix.year = parseInt(req.body.year);
    }
    if (req.body.crews) {
      mix.crews = req.body.crews.split(',');
    }
    if (req.body.description) {
      mix.description = req.body.description;
    }
    if (req.body.youtube) {
      mix.youtube = req.body.youtube;
    }

    // File written successfully, save the entry in mongo.
    await mix.save();
    console.log('savved mixx', mix);
    mix.updateTags(req.body.preserve, req.body.albumtitle);
  } catch (err) {
    console.error('Upload processing error:', err);
  }

  if (typeof file !== 'undefined') {
    res.send('/mix/' + file.filename.split('.')[0]);
  } else {
    console.log('no file selected');
    res.redirect('/upload');
  }
};

exports.edit = async (req, res) => {
  const { file } = req;
  console.log('inn post EDIT endpoint', file);
  let mix;

  try {
    // Server side check for no file selected
    if (!req.body.editUrl) {
      console.log('error: no file selected');
      return;
    } { // Edit mix
      mix = {
        hidden: !!req.body.hidden,
      };

      if (req.body.title) {
        // Hack to clear file names
        if (req.body.title === '0xDEADBEEF') {
          mix.title = '';
        } else {
          mix.title = req.body.title;
        }
      }

      if (req.body.dj) {
        mix.dj = req.body.dj;
      }
      if (req.body.station) {
        mix.station = req.body.station;
      }

      if (req.body.mcs) {
        mix.mcs = req.body.mcs.split(',');
      }
      if (req.body.day) {
        mix.day = parseInt(req.body.day);
      }
      if (req.body.month) {
        mix.month = parseInt(req.body.month);
      }
      if (req.body.year) {
        mix.year = parseInt(req.body.year);
      }
      if (req.body.crews) {
        mix.crews = req.body.crews.split(',');
      }
      if (req.body.description) {
        mix.description = req.body.description;
      }
      if (req.body.youtube) {
        mix.youtube = req.body.youtube;
      }

      await Mix.updateOne({ url: req.body.editUrl }, mix).exec();

      const foundMix = await Mix.findOne({ url: req.body.editUrl }).exec();

      foundMix.updateTags(true, req.body.albumtitle);
    }
  } catch (err) {
    console.error('Upload editing error:', err);
  }

  res.send('/mix/' + mix.file.split('.')[0]);
};
