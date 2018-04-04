var config = require('../config');
var mongoose = require('mongoose');
var async = require('async');
var _ = require('underscore');
var Geolocation = require('./model').geolocation;

function calculateGforce(input_object) {
	//Calculate gforce
	divisor = 9.81;
	divident_value = Math.pow(parseFloat(input_object.accelerometer.x), 2) + Math.pow(parseFloat(input_object.accelerometer.y), 2) + Math.pow(parseFloat(input_object.accelerometer.z), 2);
	divident = Math.sqrt(divident_value);
	return divident/divisor;
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
						callback('error', null);
					} else {
						console.log(result)
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

	fetchMethod : function(callback) {
		async.series({
		    fetch: function(callback) {
		    	//Fetch data from mongo
		    	Geolocation.where('gforce').gt("0.7").exec(function(err, result) {
		    		if(err) {
				    	callback(err, null);
				    } else {
				    	callback(null, result);
				    }
		    	});
		    }
		}, function(err, results) {
		    if(err) {
		    	callback(err, null);
		    } else {
		    	callback(null, results.fetch);
		    }
		});
	}
}
