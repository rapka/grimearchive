var fs = require('fs');
var probe = require('node-ffprobe');

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
	"audio/mp3",
	"image/jpeg",
	"image/gif",
	"image/tiff"
];

exports.onFileUploadStart = function (file) {
	//Only allow files with a type in the allowedTypes array.
	if (allowedTypes.indexOf(file.mimetype) == -1) {
		res.status(415).send("415: Disallowed file type: " + file.mimetype);
		return false;
	}
}

exports.onFileUploadComplete = function (file) {
	//tbd: some mp3 operations may have to be done here
	//console.log(file.fieldname + ' uploaded to  ' + file.path)

}

exports.onFileUploadData = function (file, data) {
	//tbd: will be used for progress bar
	//console.log(data.length + ' of ' + file.fieldname + ' arrived');
}

exports.onParseEnd = function (req, next) {
	var mix = new Mix({
		_id: mongoose.Types.ObjectId(req.body._id),
		title: req.body.title,
		dj: req.body.dj,
		file: req.files.file.name,
		station: req.body.station
	});

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
	mix.updateTags();
	var filePath = __dirname + '/../upload/' + req.files.file.name;
	probe(filePath, function(err, probeData) {
		console.log("probing");
		if (err) {
			//res.status(500).send("500: Probe Error.");
			return;
		}
		mix.bitrate = probeData['streams'][0]['bit_rate'];
		mix.duration = probeData['streams'][0]['duration'];
	});

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
