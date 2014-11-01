var mongoose = require('mongoose');
var Mix = mongoose.model('Mix');
var fs = require('fs');
var path = require('path');
var busboy = require('connect-busboy');

var ObjectId = require('mongoose').Types.ObjectId;
//, fs = require('fs')
//, path = require('path'); 

var allowedTypes = [
"audio/mpeg3",
"audio/mpeg",
"audio/mp3",
"image/jpeg",
"image/gif",
"image/tiff"
];

exports.routes = function(app) {

	app.get('/upload', exports.index);
	app.post('/upload', exports.add);


};

exports.index = function(req, res) {
	res.render('upload', {
		title: 'Grimelist',
	});
};

exports.add = function(req, res) {
	 // Create and save.
	var fstream;
    req.pipe(req.busboy);

	req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {

		console.log("type: ", mimetype);
		//Only allow files with a type in the allowedTypes array.
		if (allowedTypes.indexOf(mimetype) == -1) {
			res.status(415).send("415: Disallowed file type: " + mimetype);
			return;
		}

		var mix = new Mix({
			_id: mongoose.Types.ObjectId(req.body._id),
			title: req.body.title,
			dj: req.body.dj,
			file: filename
		});



    	console.log("Uploading: " + filename); 
    	fstream = fs.createWriteStream(__dirname + '/../upload/' + filename);
    	file.pipe(fstream);
    	fstream.on('close', function () {
    		    	console.log("updating tags");
		mix.updateTags();
    		res.redirect('/mixes/');
    	});


    });

	  // Read the uploaded file.
	// fs.readFile(req.files.source.path, function (err, data) {

	// 	if (err) {
	// 		res.status(500).send("500: Could not read file to write.");
	// 		return;
	// 	}

	// 	var imageName = req.files.source.name;

	// 	/// If there's an error
	// 	if(!imageName){
	// 		res.status(500).send("500: Could not determine filename.");
	// 		return;
	// 	} else {

	// 		var newPath = path.resolve(__dirname, '../upload/', imageName);
			  

	
	// 		fs.writeFile(newPath, data, function (err) {
	// 			if (err) {
	// 			  	res.status(500).send("500: Could not write wile to directory.");
	// 			  	return;
				  
	// 				// File written successfully, save the entry in mongo.
	// 				mix.save(function(err) {
	// 			    	if (err) {
	// 			    		res.status(500).send("500: Could not save file entry to database.");
	// 			    		return;
	// 			    	}

	// 			  		res.redirect('/mixes/' + mix._id);
	// 			  	});
					
	// 			}
	// 		});
	// 	}
	// });

};

exports.view = function(req, res) {
	
	var mix = Mix.findOne({}).exec(function (err, mix){
		res.render('mixes', {
			title: 'Grimelist',
			mix: mix
		});
	});



};
