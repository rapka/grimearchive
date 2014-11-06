var mongoose = require('mongoose');
var Mix = mongoose.model('Mix');
var ObjectId = require('mongoose').Types.ObjectId;
//, fs = require('fs')
//, path = require('path'); 

exports.routes = function(app) {

	app.get('/mixes', exports.index);
	app.get('/mixes/:id', exports.view);


};

exports.index = function(req, res) {

	Mix.find().sort({date: -1}).limit(40)
		.exec(function(err, mixes) {
			if (err){
				throw err;
			} 
			
			res.render('mixes', {title: 'Grimelist', mixes: mixes});
	});
};


exports.mixes = function(req, res) {
	
	res.render('mixes', {
		title: 'Grimelist',
		mixes:  mixes
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
