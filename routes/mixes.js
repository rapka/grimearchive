var mongoose = require('mongoose');
var Mix = mongoose.model('Mix');
var ObjectId = require('mongoose').Types.ObjectId;
//, fs = require('fs')
//, path = require('path'); 

exports.routes = function(app) {

	app.get('/mixes', exports.index);
	app.get('/mixes/add/:id', exports.add);
	app.get('/mixes/:id', exports.view);


};

exports.index = function(req, res) {

	res.render('mixes', {
		title: 'Grimelist',
		mixes:  mixes
	});
};


exports.mixes = function(req, res) {
	
	res.render('mixes', {
		title: 'Grimelist',
		mixes:  mixes
	});

};

exports.add = function(req, res) {
	var mix = new Mix({
		title: req.params.id
	});

	console.log("poop");

	mix.save(function(err){
		if (err){
			throw err;
			res.end("error");
		}
		else {
			res.end("DONE!");
		}
	});
	
};

exports.view = function(req, res) {
	
	var mix = Mix.findOne({}).exec(function (err, mix){
		res.render('mixes', {
			title: 'Grimelist',
			mix: mix
		});
	});



};
