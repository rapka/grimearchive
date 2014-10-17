var mongoose = require('mongoose')
   , Schema = mongoose.Schema
   , ObjectId = Schema.ObjectId;

// Define the model.
var articleSchema = new Schema({
    title: String,
    author: { type: ObjectId, ref: 'User' },
    body: String,
    snippet: String,
    url: String,
    date: { type: Date, default: Date.now },
    tags: [],
    image: String,
    draft: {type: Boolean, default: true},
    approved: {type: Boolean, default: false},
    hits: {type: Number, default: 0},
    popularity: {type: Number, default: 0}
});

articleSchema.statics.generateUrl = function(title) {
  var ts = String(new Date().getTime());
  ts = ts.substr(ts.length - 4);
  return ts + "-" + title.toLowerCase().replace(/ +/g,'_').replace(/[^a-z0-9-_]/g,'').trim();
}

articleSchema.methods.hit = function() {
  this.hits++;
  this.popularity++;
  this.save();
}

// Export model.
module.exports = mongoose.model('Article', articleSchema);