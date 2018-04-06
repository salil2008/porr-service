var config = require('../config');
var mongoose = require('mongoose');
var async = require('async');
var _ = require('underscore');
var when = require('when');
var Geolocation = require('./model').geolocation;

function calculateGforce(input_object) {
	//Calculate gforce
	divisor = 9.81;
	divident_value = Math.pow(parseFloat(input_object.accelerometer.x), 2) + Math.pow(parseFloat(input_object.accelerometer.y), 2) + Math.pow(parseFloat(input_object.accelerometer.z), 2);
	divident = Math.sqrt(divident_value);
	return divident/divisor;
}

function calculateSeverity(object) {
	let severity = 0
	let gforce = parseFloat(object.gforce)
	if(gforce > 1.1 && gforce < 1.2) {
		object.severity = 1
	} else if(gforce > 1.2 && gforce < 1.3) {
		object.severity = 2
	} else if(gforce > 1.3) {
		object.severity = 3
	}
	return object;
}

var self = module.exports = {
	processMethod : function(input_array, callback) {
		async.waterfall([
		    function(callback) {
		    	console.log("First")
		    	let proccessed_array = []
		    	_.each(input_array,function(object) {
		    		object.gforce = calculateGforce(object)
		    		proccessed_array.push(object)
		    	})
		        callback(null, proccessed_array);
		    },
		    function(fdata, callback) {
		        //Save the filter results to mongodb
		        console.log("Second")
				Geolocation.insertMany(fdata, function(err, result) {
					if(err) {
						console.log(err)
						callback(err, null);
					} else {
						callback(null, 'done');
					}
				});
		    }
		], function (err, result) {
		    if(err) {
		    	callback(err, null);
		    } else {
		    	callback(null, result);
		    }
		});
	},

	fetchMethod : function(options, callback) {
		async.waterfall([
		    function(callback) {
		    	//Fetch data from mongo
		    	Geolocation.where('gforce').gt("1.1").exec()
		    	.then(function(result){
		            callback(null,result)
		        }).catch(function(err){
		            callback(err,null)
		        })
		    },

		    function(fdata, callback) {
		    	var proccessed_array = []
				_.each(fdata, function(object) {
					object = object.toJSON()
					proccessed_array.push(calculateSeverity(object))
				})
				console.log("No. of processed entries are : " + proccessed_array.length)
				callback(null, proccessed_array);
		    }
		], function(err, results) {
		    if(err) {
		    	callback(err, null);
		    } else {
		    	callback(null, results);
		    }
		});
	},

	flushDbMethod : function(callback) {
		async.series({
			flush : function(callback) {
				mongoose.connection.db.dropCollection('geolocations', function(err, result) {
					if(err) {
				    	callback(err, null);
				    } else {
				    	callback(null, result);
				    }
				})
			}
		}, function(err, result) {
		    if(err) {
		    	callback(err, null);
		    } else {
		    	callback(null, result.flush);
		    }
		});
	}
}
