var id3_reader = require('id3_reader');
var fs = require('fs');

var mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, ObjectId = Schema.ObjectId;

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

mixSchema.methods.updateTags = function() {

 	if (this.file) {
		this.url = this.file.split('.')[0];
 	}

	var titleString = "Invalid Title";

	//either use user supplied title or radio station
	if (this.title) {
		titleString = this.title;
	}
	else if (this.station) {
		titleString = this.station;
	}

	//append date
	if (this.day && this.month && this.year){
		titleString += ", " + this.year.toString() + "-" + this.month.toString() + "-" + this.day.toString();
	}
	else if (this.year) {
		titleString += ", " + this.year.toString();
	}

	//append mcs
	if (this.mcs.length == 1){
		titleString += " feat. " + this.mcs[0];
	}
	else if (this.mcs.length >= 1){
		titleString += " feat. ";
		for (var i = 0; i < this.mcs.length; i++){
			if (i == 0) {
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
			if (i == 0) {
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

	var filePath = __dirname + '/../upload/' + this.file;

	if (this.dj) {
		artistString = this.dj;
	}
	else {
		artistString = "Unknown DJ";
	}

	var albumArtPath = __dirname + "/../public/img/albumart.png";
	var albumArt = fs.readFileSync(albumArtPath);

	//create id3 tags
	var tags = { 
		APIC: albumArt,
		TIT2: titleString,
		TPE1: artistString,
		TALB: 'The Grime Archive',
		TCON: 'Grime',
		TPE2: 'The Grime Archive'
 }

	if (this.year) {
		tags['TYER'] = this.year.toString();
	}

	id3_reader.write(filePath, tags, function(success, msg) {
		if (!success) { 
			console.log(msg);
		}
	});
}

mixSchema.statics.generateTitle = function(req) {
	var artistString = "";

	if (this.dj) {
		artistString = this.dj;
	}
	else {
		artistString = "Unknown DJ";
	}

	return artistString;
}

// Export model.
module.exports = mongoose.model('Mix', mixSchema);