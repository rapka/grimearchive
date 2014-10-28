var mongoose = require('mongoose')
   , Schema = mongoose.Schema
   , ObjectId = Schema.ObjectId;

// Define the model.
var mixSchema = new Schema({
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
  length: Number,
  downloads: Number,
  bitrate: Number,
  md5: String
   
});

mixSchema.statics.generateUrl = function(title) {
  var ts = String(new Date().getTime());
  ts = ts.substr(ts.length - 4);
  return ts + "-" + title.toLowerCase().replace(/ +/g,'_').replace(/[^a-z0-9-_]/g,'').trim();
}

// Export model.
module.exports = mongoose.model('Mix', mixSchema);