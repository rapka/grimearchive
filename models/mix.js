const id3Reader = require('id3_reader');
const fs = require('fs');
const path = require('path');
const mm = require('musicmetadata');
const mongoose = require('mongoose');
const config = require('../config');
const AWS = require('aws-sdk');

const UPLOAD_DIRECTORY = process.env.UPLOAD_DIRECTORY || config.uploadDirectory;

if (fs.existsSync(path.join(__dirname, '/../aws.json'))) {
  AWS.config.loadFromPath(path.join(__dirname, '/../aws.json'));
}

const s3 = new AWS.S3();
const Schema = mongoose.Schema;

// Define the model.
const mixSchema = new Schema({
  url: String,
  title: String,
  uploader: { type: 'String', default: 'Anonymous' },
  tripcode: String,
  date: { type: Date, default: Date.now },
  length: Number,
  dj: String,
  crews: [],
  mcs: [],
  station: String,
  day: Number,
  month: Number,
  year: Number,
  duration: Number,
  downloads: { type: Number, default: 0 },
  bitrate: Number,
  file: String,
  hidden: { type: Boolean, default: false },
  description: String,
  youtube: String,
});

const uploadToS3 = (filePath, filename) => {
  const stream = fs.readFileSync(filePath);
  console.log('uploading', filename);

  const s3params = {
    Bucket: 'grimearchive',
    Key: filename,
    Body: stream,
  };

  s3.upload(s3params, (err) => {
    if (err) {
      console.log('file upload error', err);
    }

    console.log('file uploaded');
    fs.unlinkSync(filePath);
  });
};

mixSchema.methods.updateTags = (preserve, albumtitle) => {
  if (this.file) {
    this.url = this.file.split('.')[0];
  } else {
    return;
  }

  let titleString = 'Unknown';

  const filename = this.file;

  // Either use user supplied title or radio station
  if (this.title) {
    titleString = this.title;
  } else if (this.station) {
    titleString = this.station;
  }

  // Append date
  if (this.day && this.month && this.year && !this.title) {
    titleString += ', ' + this.year.toString() + '-' + this.month.toString() + '-' + this.day.toString();
  } else if (this.year && !this.title) {
    titleString += ', ' + this.year.toString();
  }

  // Append mcs
  if (this.mcs.length === 1) {
    titleString += ' feat. ' + this.mcs[0];
  } else if (this.mcs.length >= 1) {
    titleString += ' feat. ';
    for (let i = 0; i < this.mcs.length; i++) {
      if (i === 0) {
        titleString += this.mcs[i];
      } else if (i === (this.mcs.length - 1)) {
        titleString += ' & ' + this.mcs[i];
      } else {
        titleString += ', ' + this.mcs[i];
      }
    }
  } else if (this.crews.length === 1) { // Append crews if no mcs
    titleString += ' feat. ' + this.crews[0];
  } else if (this.crews.length >= 1) {
    titleString += ' feat. ';
    for (let k = 0; k < this.crews.length; k++) {
      if (k === 0) {
        titleString += this.crews[k];
      } else if (k === (this.crews.length - 1)) {
        titleString += ' & ' + this.crews[k];
      } else {
        titleString += ', ' + this.crews[k];
      }
    }
  }

  // Update mp3 artist title
  let artistString = '';

  const filePath = UPLOAD_DIRECTORY + this.file;

  if (this.dj) {
    artistString = this.dj;
  } else {
    artistString = 'Unknown DJ';
  }

  // Create id3 tags
  const tags = {
    TIT2: titleString,
    TPE1: artistString,
    TALB: 'The Grime Archive',
    TCON: 'Grime',
    TPE2: 'The Grime Archive',
  };

  if (albumtitle && this.title) {
    tags.TALB = this.title;
  } else if (albumtitle) {
    tags.TALB = titleString;
  } else {
    tags.TALB = 'The Grime Archive';
  }

  if (this.year) {
    tags.TYER = this.year.toString();
  }

  const s3key = this.file;

  fs.access(filePath, fs.F_OK, (err) => {
    if (!err) {
      // Do something
      if (!preserve) {
        const albumArtPath = path.join(__dirname, '/../public/img/albumart.png');
        const albumArt = fs.readFileSync(albumArtPath);
        tags.APICPNG = albumArt;
        id3Reader.write(filePath, tags, (success, msg) => {
          if (!success) {
            console.log(msg);
            return;
          }
          uploadToS3(filePath, filename);
        });
      } else {
        mm(fs.createReadStream(filePath), (err2, metadata) => {
          if (err2) {
            console.log(err2);
          }

          if (metadata.picture && metadata.picture[0].format === 'jpg') {
            tags.APICJPEG = metadata.picture[0].data;
          } else if (metadata.picture && metadata.picture[0].format === 'png') {
            tags.APICPNG = metadata.picture[0].data;
          }

          id3Reader.write(filePath, tags, (success, msg) => {
            if (!success) {
              console.log(msg);
              return;
            }
            uploadToS3(filePath, filename);
          });
        });
      }
    } else {
      console.log('NOT DOWNLOADING');
      // It isn't accessible
      const params = {
        Bucket: 'grimearchive',
        Key: s3key,
      };

      s3.getObject(params, (err, data) => {
        if (err) {
          console.log(err);
        }

        fs.writeFileSync(filePath, data.Body);

        console.log('file saved at', filePath);
        if (!preserve) {
          const albumArtPath = path.join(__dirname, '/../public/img/albumart.png');
          const albumArt = fs.readFileSync(albumArtPath);
          tags.APICPNG = albumArt;
          id3Reader.write(filePath, tags, (success, msg) => {
            if (!success) {
              console.log(msg);
              return;
            }
            uploadToS3(filePath, filename);
          });
        } else {
          mm(fs.createReadStream(filePath), (err, metadata) => {
            if (err) {
              console.log(err);
            }

            if (metadata.picture && metadata.picture[0].format === 'jpg') {
              tags.APICJPEG = metadata.picture[0].data;
            } else if (metadata.picture && metadata.picture[0].format === 'png') {
              tags.APICPNG = metadata.picture[0].data;
            }

            id3Reader.write(filePath, tags, (success, msg) => {
              if (!success) {
                console.log(msg);
                return;
              }
              uploadToS3(filePath, filename);
            });
          });
        }
      });
    }
  });
};

// Export model.
module.exports = mongoose.model('Mix', mixSchema);
