var mongoose = require('mongoose');
var Mix = mongoose.model('Mix');
var ObjectId = require('mongoose').Types.ObjectId;

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
				root: __dirname + '/../upload'
			};

			mix.save();
			var path = __dirname + '/../upload/' + req.params.url + '.mp3';
			res.download(path, req.params.url + '.mp3', function (err) {
				if (err) {
					console.error(err);
				}
				else {
					mix.downloads++;
				}
			});
	});
};

