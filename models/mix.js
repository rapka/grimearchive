var id3_reader = require('id3_reader');
var fs = require('fs');

var mongoose = require('mongoose')
   , Schema = mongoose.Schema
   , ObjectId = Schema.ObjectId;

// Define the model.
var mixSchema = new Schema({
  _id : Schema.Types.ObjectId,
  title: String,
  uploader: { type: "String", default: "Anonymous"},
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
  md5: String,
  file: String
   
});


//tbd
mixSchema.methods.updateTags = function() {

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
    titleString += ", " + this.year + "/" + this.month + "/" + this.day;
  }

  //append mcs
  if (this.mcs.length == 1){
    titleString += " feat. " + this.mcs[0];
  }
  else if (this.mcs.length >= 1){
    titleString += " feat. ";
    for (var i = 0; i < eq.body.mcs.length; i++){
      if (i == 0) {
        titleString += this.mcs[i];
      }
      if (i == (eq.body.mcs.length - 1)) {
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
    for (var i = 0; i < eq.body.crews.length; i++){
      if (i == 0) {
        titleString += this.crews[i];
      }
      if (i == (eq.body.crews.length - 1)) {
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
  console.log("old tags:");
  id3_reader.read('/Users/richard/Desktop/1-02 XMAS_EVET10 [120][thanaton3 mix].mp3', function(success, msg, data) {
    console.log(success);
    console.log(msg);
    //console.log(data);
  
  })

  var albumArtPath = __dirname + "/../public/img/albumart.png";
  var albumArt = fs.readFileSync(albumArtPath);
  //console.log("art length:", albumArt.length);


  //create id3 tags
  var tags = { 
    APIC: albumArt,
    TIT2: titleString,
    TPE1: artistString,
    TALB: 'Grimelist',
    TCON: 'Grime',
    TPE2: 'Grimelist'
   
 }

 if (this.year) {
  tags['year'] = this.year;
 }

id3_reader.write(filePath, tags, function(success, msg) {
   console.log(success);
    //console.log(msg);
    //id3_reader.read(filePath, function(success, msg, data) {
    //console.log(success);
    //console.log(msg);
    // console.log(data);
  

  
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