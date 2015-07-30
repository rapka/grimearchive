var mongoose = require('mongoose');
var Mix = mongoose.model('Mix');
var ObjectId = require('mongoose').Types.ObjectId;
var config = require('../config');
var request = require('request');
var fs = require('fs');

var AWS = require(__dirname + '/../aws.json');

exports.routes = function(app) {
	app.get('/download/:url', exports.download);
};

exports.download = function(req, res) {
	Mix.findOne({url: req.params.url}).exec(function(err, mix) {
			if (err){
				console.error("find error");
				throw err;
			}

			var attachment = 'attachment; filename="' + generateFilename(mix) + '.mp3"';

			res.setHeader("content-disposition", attachment);

			var client = require('pkgcloud').storage.createClient({
				provider: 'amazon',
				keyId: AWS.accessKeyId, // access key id
				key: AWS.secretAccessKey, // secret key
				region: AWS.region // region
			});

			mix.downloads++;
			mix.save();
			var keyName = req.params.url + '.mp3';

			return client.download({
				container: config.bucket,
				remote: keyName
			}).pipe(res);

	});
};

var generateFilename = function (mix) {

	var titleString = "";
		//append date
	if (mix.day && mix.month && mix.year){
		titleString = mix.year.toString() + "-" + mix.month.toString() + "-" + mix.day.toString();
	}
	else if (mix.year) {
		titleString = mix.year.toString();
	}
	else {
		titleString = "Unknown Date";
	}

	if (mix.dj) {
		titleString +=  ", " + mix.dj;
	}
	else {
		titleString += ", Unknown DJ";
	}

	//either use user supplied title or radio station
	if (mix.title) {
		titleString +=  " - " + mix.title;
	}
	else if (mix.station) {
		titleString += ", " + mix.station;
	}

	//append crews if no mcs
	else if (mix.crews.length == 1){
		titleString += " feat " + mix.crews[0];
	}

	else if (mix.crews.length >= 1){
		titleString += " feat ";
		for (var i = 0; i < mix.crews.length; i++){
			if (i === 0) {
				titleString += mix.crews[i];
			}
			else if (i == (mix.crews.length - 1)) {
				titleString += " & " + mix.crews[i];
			}
			else {
				titleString += ", " + mix.crews[i];
			}
		}
	}

	return titleString.replace(/[\.\/\\$%\^\*;:{}=`~]/g, "_");

};
