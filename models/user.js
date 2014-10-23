var mongoose = require('mongoose')
   , Schema = mongoose.Schema
   , ObjectId = Schema.ObjectId
   , crypto = require('crypto')
   , config = require('../config.js');
 
// Define the model.
var userSchema = new Schema({
    name: String,
    password: String,
    email: String,
    lastLogin: { type: Date, default: Date.now },
    approved: Boolean,
    permissions: [],
    snippet: { type: String, default: "" }
});

// Define model methods.
userSchema.statics.encryptPassword = function(plaintext, username) {
  var hashedPassword = crypto.createHash('sha256').update(plaintext).digest('hex');
  var salty = hashedPassword + username;
  var hashed = crypto.createHash('sha256').update(salty).digest('hex');
  return hashed;
}

userSchema.methods.authenticate = function(plaintext) {
  var hashedPassword = crypto.createHash('sha256').update(plaintext).digest('hex');
  var salty = hashedPassword + this.name;
  var hashed = crypto.createHash('sha256').update(salty).digest('hex');
  return hashed == this.password;
}

userSchema.methods.authenticateFromHashed = function(hashedPassword) {
  var salty = hashedPassword + this.name;
  var hashed = crypto.createHash('sha256').update(salty).digest('hex');
  return hashed == this.password;
}

userSchema.methods.hasPermission = function(permission) {
  return ~this.permissions.indexOf(permission);
}

userSchema.methods.isAdmin = function() {
  return this.name == config.get('admin') || this.hasPermission("admin");
}

// Export model.
module.exports = mongoose.model('User', userSchema);

// Begin validation.

// Validate username.
module.exports.schema.path('name').validate(function(value, callback) {

  // First, ensure the username is valid.
  if (!/^[a-z0-9]+$/i.test(value)) {
    callback(false);
  }

  // Next, ensure the username is unique.
  module.exports.count({name: value}, function(err, count) {
    if (err) throw err;
    callback(count == 0);
  });

}, 'username');


// Validate email.
module.exports.schema.path('email').validate(function(value, callback) {

  // Credit: http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
  var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  // First, ensure the email is valid.
  if (!emailRegex.test(value)) {
    callback(false);
  }

  // Next, ensure the email is unique.
  module.exports.count({email: value}, function(err, count) {
    if (err) throw err;
    callback(count == 0);
  });

}, 'email');
