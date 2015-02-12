var fs = require('fs');
var probe = require('node-ffprobe');
var jquery = require('jquery');
var crypto = require('crypto');

// Load models.
var models_path = __dirname + '/models';
fs.readdirSync(models_path).forEach(function (file) {
	if (~file.indexOf('.js')) require(models_path + '/' + file)
});

var mongoose = require('mongoose');
var Mix = mongoose.model('Mix');
var ObjectId = require('mongoose').Types.ObjectId;

var allowedTypes = [
	"audio/mpeg3",
	"audio/mpeg",
	"audio/mp3"
];

exports.rename = function (fieldname, filename) {
	
	var ts = String(new Date().getTime());
	return ts.substr(ts.length - 4);
}

exports.onFileUploadStart = function (file) {
	//Only allow files with a type in the allowedTypes array.
	if (allowedTypes.indexOf(file.mimetype) == -1) {
		console.log("415: Disallowed file type: " + file.mimetype);
		return false;
	}
}

exports.onFileUploadComplete = function (file) {
	probe(file.path, function(err, probeData) {
		if (err) {
			console.log("500: Probe Error.");
			return;
		}
		console.log(probeData['streams'][0]['duration']);
		Mix.update({file:file.name}, 
		{
			bitrate: probeData['streams'][0]['bit_rate'] / 1000,
			duration: probeData['streams'][0]['duration']
		}, function(err, count) {
			if (err) {
				console.error("Error updating mix.");
			return;
			}
		});
	});

		var url = file.name.split('.')[0];
		//res.redirect('/mix/' + url);
}

exports.onFileUploadData = function (file, data) {
	//unused for now
}

exports.onParseEnd = function (req, next) {
	if (typeof req.files.file === 'undefined') { 
		console.log("error: no file selected");
		return;
	}
	var mix = new Mix({
		_id: mongoose.Types.ObjectId(req.body._id),
		title: req.body.title,
		dj: req.body.dj,
		file: req.files.file.name,
		station: req.body.station
	});

	if (req.body.username) {
		mix.uploader = req.body.username;
	}
	if (req.body.tripcode) {
		//var crypted = crypt(req.body.tripcode, crypt.createSalt('md5'));
		var crypted = crypto.createHash('sha256').update(req.body.tripcode).digest('hex').substring(0,8);
		mix.tripcode = crypted;
	}

	 

	if (req.body.mcs) {
		mix.mcs = req.body.mcs.split(",");
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
		mix.crews = req.body.crews.split(",");
	}
	if (req.body.description) {
		mix.description = req.body.description;
	}
	mix.updateTags();

	//File written successfully, save the entry in mongo.
	mix.save(function(err) {
		if (err) {
			console.log("500: Could not save file entry to database.");
			console.log(err);
			return;
		}
	});

	// call the next middleware
	next();
}
