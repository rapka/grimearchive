var mongoose = require('mongoose');
var Mix = mongoose.model('Mix');
var ObjectId = require('mongoose').Types.ObjectId;

exports.routes = function(app) {
	app.get('/download/:url', exports.download);
};

exports.download = function(req, res) {
	Mix.findOne({url: req.params.url}).exec(function(err, mix) {
			if (err){
				console.log("find error");
				throw err;
			}
			mix.downloads++;
			var options = {
				root: __dirname + '/../upload'
			};

			mix.save();
			res.sendFile(req.params.url + '.mp3', options);
	});
};

