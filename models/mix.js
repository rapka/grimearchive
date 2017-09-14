const id3Reader = require('id3_reader');
const fs = require('fs');
const mm = require('musicmetadata');
const config = require('../config');
const AWS = require('aws-sdk');

AWS.config.loadFromPath(__dirname + '/../aws.json');

var s3 = new AWS.S3();

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define the model.
var mixSchema = new Schema({
	url: String,
	title: String,
	uploader: {type: 'String', default: 'Anonymous'},
	tripcode: String,
	date: {type: Date, default: Date.now},
	length: Number,
	dj: String,
	crews: [],
	mcs: [],
	station: String,
	day: Number,
	month: Number,
	year: Number,
	duration: Number,
	downloads: {type: Number, default: 0},
	bitrate: Number,
	file: String,
	hidden: {type: Boolean, default: false},
	description: String

});

mixSchema.methods.updateTags = function(preserve, albumtitle) {
	if (this.file) {
		this.url = this.file.split('.')[0];
	} else {
		return;
	}

	var titleString = 'Unknown';

	var filename = this.file;

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
	if (this.mcs.length == 1) {
		titleString += ' feat. ' + this.mcs[0];
	} else if (this.mcs.length >= 1) {
		titleString += ' feat. ';
		for (var i = 0; i < this.mcs.length; i++) {
			if (i === 0) {
				titleString += this.mcs[i];
			} else if (i == (this.mcs.length - 1)) {
				titleString += ' & ' + this.mcs[i];
			} else {
				titleString += ', ' + this.mcs[i];
			}
		}
	} else if (this.crews.length == 1) { // Append crews if no mcs
		titleString += ' feat. ' + this.crews[0];
	} else if (this.crews.length >= 1) {
		titleString += ' feat. ';
		for (var k = 0; k < this.crews.length; k++) {
			if (k === 0) {
				titleString += this.crews[k];
			} else if (k == (this.crews.length - 1)) {
				titleString += ' & ' + this.crews[k];
			} else {
				titleString += ', ' + this.crews[k];
			}
		}
	}

	// Update mp3 artist title
	var artistString = '';

	var filePath = config.uploadDirectory + this.file;

	if (this.dj) {
		artistString = this.dj;
	} else {
		artistString = 'Unknown DJ';
	}

	// Create id3 tags
	var tags = {

		TIT2: titleString,
		TPE1: artistString,
		TALB: 'The Grime Archive',
		TCON: 'Grime',
		TPE2: 'The Grime Archive'
	};

	if (albumtitle && this.title) {
		tags['TALB'] = this.title;
	} else if (albumtitle) {
		tags['TALB'] = titleString;
	} else {
		tags['TALB'] = 'The Grime Archive';
	}

	if (this.year) {
		tags['TYER'] = this.year.toString();
	}

	var s3key = this.file;

	fs.access(filePath, fs.F_OK, function(err) {
		if (!err) {
			// Do something
			console.log('NOT DOWNLOADING');
			if (!preserve) {
				var albumArtPath = __dirname + '/../public/img/albumart.png';
				var albumArt = fs.readFileSync(albumArtPath);
				tags['APICPNG'] = albumArt;
				id3Reader.write(filePath, tags, function(success, msg) {
					if (!success) {
						console.log(msg);
						return;
					}
					uploadToS3(filePath, filename);
				});
			} else {
				mm(fs.createReadStream(filePath), function(err, metadata) {
					if (err) {
						console.log(err);
					}

					if (metadata.picture && metadata.picture[0].format == 'jpg') {
						tags['APICJPEG'] = metadata.picture[0].data;
					} else if (metadata.picture && metadata.picture[0].format == 'png') {
						tags['APICPNG'] = metadata.picture[0].data;
					}

					id3Reader.write(filePath, tags, function(success, msg) {
						if (!success) {
							console.log(msg);
							return;
						}
						uploadToS3(filePath, filename);
					});
				});
			}
		} else {
			// It isn't accessible
			var params = {
				Bucket: 'grimearchive',
				Key: s3key
			};

			s3.getObject(params, function(err, data) {
				if (err) {
					console.log(err);
				}

				fs.writeFileSync(filePath, data.Body);

				console.log('file saved at', filePath);
				if (!preserve) {
					var albumArtPath = __dirname + '/../public/img/albumart.png';
					var albumArt = fs.readFileSync(albumArtPath);
					tags['APICPNG'] = albumArt;
					id3Reader.write(filePath, tags, function(success, msg) {
						if (!success) {
							console.log(msg);
							return;
						}
						uploadToS3(filePath, filename);
					});
				} else {
					mm(fs.createReadStream(filePath), function(err, metadata) {
						if (err) {
							console.log(err);
						}

						if (metadata.picture && metadata.picture[0].format == 'jpg') {
							tags['APICJPEG'] = metadata.picture[0].data;
						} else if (metadata.picture && metadata.picture[0].format == 'png') {
							tags['APICPNG'] = metadata.picture[0].data;
						}

						id3Reader.write(filePath, tags, function(success, msg) {
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

const uploadToS3 = (filePath, filename) => {
	const stream = fs.readFileSync(filePath);
	console.log('uploading', filename);

	const s3params = {
		Bucket: 'grimearchive',
		Key: filename,
		Body: stream
	};

	s3.upload(s3params, (err) => {
		if (err) {
			console.log('file upload error', err);
		}
		console.log('file uploaded');
		fs.unlinkSync(filePath);
	});
};

// Export model.
module.exports = mongoose.model('Mix', mixSchema);
