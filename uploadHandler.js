const crypto = require('crypto');
const mongoose = require('mongoose');

exports.onParseEnd = (req, next) => {
  console.log('File parsing complete.');

  let mix;

  // Server side check for no file selected
  if (typeof req.files.file === 'undefined' && !req.body.edit) {
    console.log('error: no file selected');
    return;
  } else if (!req.body.edit) { // Add new mix
  	console.log('adding new mix', req.files);
    mix = new Mix({
      _id: mongoose.Types.ObjectId(req.body._id),
      title: req.body.title,
      dj: req.body.dj,
      file: req.files.file.name,
      station: req.body.station,
    });

    if (req.body.username) {
      mix.uploader = req.body.username;
    }
    if (req.body.tripcode) {
      // const crypted = crypt(req.body.tripcode, crypt.createSalt('md5'));
      const crypted = crypto.createHash('sha256').update(req.body.tripcode).digest('hex').substring(0, 8);
      mix.tripcode = crypted;
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

    console.log('beginning tag update');
    mix.updateTags(req.body.preserve, req.body.albumtitle);

    // File written successfully, save the entry in mongo.
    mix.save((err) => {
      if (err) {
        console.log('500: Could not save file entry to database.', err);
      }
    });
  } else { // Edit mix
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

    Mix.updateOne({ url: req.body.edit }, mix, (err) => {
      if (err) {
        console.log(err);
        console.error('Error updating mix.');
      }
    });

    Mix.findOne({ url: req.body.edit }).exec((err, foundMix) => {
      if (err) {
        console.log(err);
        console.error('Error updating mix.');
        return;
      }

      foundMix.updateTags(true, req.body.albumtitle);
    });
  }

  // call the next middleware
  next();
};
