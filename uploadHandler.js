const fs = require('fs');
const path = require('path');
const probe = require('node-ffprobe');
const crypto = require('crypto');
const config = require('./config');
const mongoose = require('mongoose');

// Load models
const modelsPath = path.join(__dirname, '/models');
fs.readdirSync(modelsPath).forEach((file) => {
	if (file.indexOf('.js') >= -1) {
		require(path.join(modelsPath, '/', file));
	}
});

const Mix = mongoose.model('Mix');

const allowedTypes = [
	'audio/mpeg3',
	'audio/mpeg',
	'audio/mp3',
];

const existsSync = (filePath) => {
	try {
		fs.statSync(filePath);
	} catch (err) {
		if (err.code === 'ENOENT') {
			return false;
		}
	}
	return true;
};

exports.rename = () => {
	const ts = String(new Date().getTime());
	let num = ts.substr(ts.length - 7);
	let currentPath = config.uploadDirectory + num + '.mp3';
	// Check for duplicates
	while (existsSync(path)) {
		num = ts.substr(ts.length - 7);
		currentPath = config.uploadDirectory + num + '.mp3';
	}

	return num;
};

exports.onFileUploadStart = (file) => {
	// Only allow files with a type in the allowedTypes array.
	if (allowedTypes.indexOf(file.mimetype) === -1) {
		console.log('415: Disallowed file type: ' + file.mimetype);
		return false;
	}
	console.log('file uploading');

	return true;
};

exports.onFileUploadComplete = (file) => {
	probe(file.path, (err, probeData) => {
		if (err) {
			console.log('500: Probe Error.');
			return;
		}

		Mix.update({file: file.name}, {
			bitrate: probeData.streams[0].bit_rate / 1000,
			duration: probeData.streams[0].duration,
		}, (err) => {
			if (err) {
				console.error('Error updating mix.');
				return;
			}
		});
	});
};

// Unused for now
// exports.onFileUploadData = function (file, data) {
// };

exports.onParseEnd = function(req, next) {
	console.log('File parsing complete.');

	let mix;

	// Server side check for no file selected
	if (typeof req.files.file === 'undefined' && !req.body.edit) {
		console.log('error: no file selected');
		return;
	} else if (!req.body.edit) { // Add new mix
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
		mix.updateTags(req.body.preserve, req.body.albumtitle);

		// File written successfully, save the entry in mongo.
		mix.save((err) => {
			if (err) {
				console.log('500: Could not save file entry to database.');
				console.log(err);
				return;
			}
		});
	} else { // Edit mix
		mix = {};

		if (req.body.title) {
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

		if (req.body.hidden) {
			console.log(req.body.hidden);
			mix.hidden = true;
		} else {
			mix.hidden = false;
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

		Mix.update({url: req.body.edit}, mix, (err) => {
			if (err) {
				console.log(err);
				console.error('Error updating mix.');
				return;
			}
		});

		Mix.findOne({url: req.body.edit}).exec((err, foundMix) => {
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
