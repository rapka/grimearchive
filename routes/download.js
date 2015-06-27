var mongoose = require('mongoose');
var Mix = mongoose.model('Mix');
var ObjectId = require('mongoose').Types.ObjectId;
var config = require('../config');


exports.routes = function(app) {
	app.get('/download/:url', exports.download);
};

exports.download = function(req, res) {
	Mix.findOne({url: req.params.url}).exec(function(err, mix) {
			if (err){
				console.error("find error");
				throw err;
			}
			
			var options = {
				root:config.uploadDirectory
			};

			
			var path = config.uploadDirectory + req.params.url + '.mp3';
			res.download(path, generateFilename(mix) + '.mp3', function (err) {
				if (err) {
					console.error(err);
				}
				else {
					mix.downloads++;
					mix.save();
				}
			});
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
			if (i == 0) {
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

}
