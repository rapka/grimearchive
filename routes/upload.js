var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var Mix = mongoose.model('Mix');



var ObjectId = require('mongoose').Types.ObjectId;
//, fs = require('fs')
//, path = require('path'); 

// create application/json parser
var jsonParser = bodyParser.json();


// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })


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
	app.post('/upload', jsonParser, exports.add);


};

exports.index = function(req, res) {
	res.render('upload', {
		title: 'Grimelist',
	});
};

exports.add = function(req, res) {
	 // Create and save.
	var fstream;
	//console.log("mcs:", req);
	console.log("mcs:", req.headers);
	console.log("mcs:", req.body);
    req.pipe(req.busboy);

	req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {

		console.log("type: ", mimetype);
		//Only allow files with a type in the allowedTypes array.
		if (allowedTypes.indexOf(mimetype) == -1) {
			res.status(415).send("415: Disallowed file type: " + mimetype);
			return;
		}
		
		console.log("mcs:", req.body.dj);
		console.log("mcs:", req.body.title);
		console.log("mcs:", req.body.crews);

		var mix = new Mix({
			_id: mongoose.Types.ObjectId(req.body._id),
			title: req.body.title,
			dj: req.body.dj,
			file: filename,
			mcs: req.body.mcs.split(","),
			crews: req.body.crews.split(","),
			station: req.body.station,
			day: parseInt(req.body.day),
			month: parseInt(req.body.month),
			year: parseInt(req.body.year),
			md5: md5(file)


		});


		var filePath = __dirname + '/../upload/' + filename

    	console.log("Uploading: " + filePath); 
    	fstream = fs.createWriteStream(filePath);
    	file.pipe(fstream);
    	fstream.on('close', function () {
    		console.log("updating tags");
			mix.updateTags();

			probe(filePath, function(err, probeData) {
				console.log("probing");
				if (err) {
	 				res.status(500).send("500: Probe Error.");
	 				return;
	 			}
	
    			mix.bitrate = probeData['streams'][0]['bit_rate'];
    			mix.duration = probeData['streams'][0]['duration'];
    			//console.log(probeData.streams.bit_rate);
	
			});

			//File written successfully, save the entry in mongo.
			mix.save(function(err) {
			   	if (err) {
					res.status(500).send("500: Could not save file entry to database.");
			    	return;
			   	}
				res.redirect('/mixes/');
			  });


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
