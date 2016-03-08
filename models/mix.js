var id3_reader = require('id3_reader');
var fs = require('fs');
var Buffer = require('buffer').Buffer;
var mm = require('musicmetadata');
var config = require('../config');
var AWS = require('aws-sdk');

AWS.config.loadFromPath(__dirname + '/../aws.json');

var s3 = new AWS.S3();

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// Define the model.
var mixSchema = new Schema({
	url: String,
	title: String,
	uploader: { type: "String", default: "Anonymous"},
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
	downloads: {type: Number, default: 0},
	bitrate: Number,
	file: String,
	hidden: { type: Boolean, default: false},
	description: String
	 
});

mixSchema.methods.updateTags = function(preserve, albumtitle) {

	if (this.file) {
		this.url = this.file.split('.')[0];
	}
	else {
		console.log("NO FILE FOUND");
		return;
	}

	var titleString = "Unknown";

	var filename = this.file;

	//either use user supplied title or radio station
	if (this.title) {
		titleString = this.title;
	}
	else if (this.station) {
		titleString = this.station;
	}

	//append date
	if (this.day && this.month && this.year && !this.title){
		titleString += ", " + this.year.toString() + "-" + this.month.toString() + "-" + this.day.toString();
	}
	else if (this.year && !this.title) {
		titleString += ", " + this.year.toString();
	}

	//append mcs
	if (this.mcs.length == 1){
		titleString += " feat. " + this.mcs[0];
	}
	else if (this.mcs.length >= 1){
		titleString += " feat. ";
		for (var i = 0; i < this.mcs.length; i++){
			if (i === 0) {
				titleString += this.mcs[i];
			}
			else if (i == (this.mcs.length - 1)) {
				titleString += " & " + this.mcs[i];
			}
			else {
				titleString += ", " + this.mcs[i];
			}
		}
	}
	//append crews if no mcs
	else if (this.crews.length == 1){
		titleString += " feat. " + this.crews[0];
	}
	else if (this.crews.length >= 1){
		titleString += " feat. ";
		for (var i = 0; i < this.crews.length; i++){
			if (i === 0) {
				titleString += this.crews[i];
			}
			else if (i == (this.crews.length - 1)) {
				titleString += " & " + this.crews[i];
			}
			else {
				titleString += ", " + this.crews[i];
			}
		}
	}

	//update mp3 artist tiltle
	var artistString = "";

	var filePath = config.uploadDirectory + this.file;

	if (this.dj) {
		artistString = this.dj;
	}
	else {
		artistString = "Unknown DJ";
	}

	//create id3 tags
	var tags = {

		TIT2: titleString,
		TPE1: artistString,
		TALB: 'The Grime Archive',
		TCON: 'Grime',
		TPE2: 'The Grime Archive'
	};

	if (albumtitle && this.title) {
		tags['TALB'] = this.title;
	}
	else if (albumtitle) {
		tags['TALB'] = titleString;
	}
	else {
		tags['TALB'] = 'The Grime Archive';
	}
	if (this.year) {
		tags['TYER'] = this.year.toString();
	}


	// Pull file from s3 if it doesn't exist
	if (!fs.lstatSync(filePath).isFile()) {
		var params = {
			Bucket: "grimearchive",
			Key: this.file
		};

		s3.getObject(params, function(err, data) {
			console.log("DOWNLOADING");
			if (err) {
				console.log(err);
			}

			fs.writeFileSync(filePath, data);

			if (!preserve) {
				var albumArtPath = __dirname + "/../public/img/albumart.png";
				var albumArt = fs.readFileSync(albumArtPath);
				tags['APICPNG'] = albumArt;
				id3_reader.write(filePath, tags, function(success, msg) {
					if (!success) {
						console.log(msg);
						return;
					}
					uploadToS3(filePath, filename);
				});
			}
			else {
				var parser = mm(fs.createReadStream(filePath), function (err, metadata) {
					if (err) {
						console.log(err);
					}
					
					if (metadata.picture[0].format == 'jpg') {
						tags['APICJPEG'] = metadata.picture[0].data;
					}
					else if (metadata.picture[0].format == 'png') {
						tags['APICPNG'] = metadata.picture[0].data;
					}
					id3_reader.write(filePath, tags, function(success, msg) {
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

	//File already exists
	else {
		console.log("NOT DOWNLOADING");
		if (!preserve) {
			var albumArtPath = __dirname + "/../public/img/albumart.png";
			var albumArt = fs.readFileSync(albumArtPath);
			tags['APICPNG'] = albumArt;
			id3_reader.write(filePath, tags, function(success, msg) {
				if (!success) {
					console.log(msg);
					return;
				}
				uploadToS3(filePath, filename);
			});
		}
		else {
			var parser = mm(fs.createReadStream(filePath), function (err, metadata) {
				if (err) {
					console.log(err);
				}
				
				if (metadata.picture[0].format == 'jpg') {
					tags['APICJPEG'] = metadata.picture[0].data;
				}
				else if (metadata.picture[0].format == 'png') {
					tags['APICPNG'] = metadata.picture[0].data;
				}
				id3_reader.write(filePath, tags, function(success, msg) {
					if (!success) {
						console.log(msg);
						return;
					}
					uploadToS3(filePath, filename);
				});
			});
		}
	}
};

var uploadToS3 = function (filePath, filename) {
	var stream = fs.readFileSync(filePath);
	console.log('uploading', filename);

	var s3params = {
		Bucket: "grimearchive",
		Key: filename,
		Body: stream
	};

	s3.upload(s3params, function(err, data) {
		console.log("upload complete");
		fs.unlinkSync(filePath);
	});
};

// Export model.
module.exports = mongoose.model('Mix', mixSchema);