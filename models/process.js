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
	return (divident/divisor).toFixed(4);
}

function calculateSeverity(object) {
	let severity = 0
	let gforce = parseFloat(object.gforce)

	if(gforce > 0.9 && gforce < 1.2) {
		//Pass
	} else if(gforce > 1.2 && gforce < 1.3 || gforce > 0.7 && gforce < 0.9) {
		severity = 1
	} else if(gforce > 1.3 && gforce < 1.39 || gforce > 0.5 && gforce < 0.7) {
		severity = 2
	} else if(gforce > 1.39 || gforce < 0.5) {
		severity = 3
	}
	return severity;
}

var self = module.exports = {
	processMethod : function(input_array, callback) {
		async.waterfall([
		    function(callback) {
		    	console.log("First")
		    	let proccessed_array = []
		    	_.each(input_array,function(object) {
		    		object.gforce = calculateGforce(object)
		    		object.severity = calculateSeverity(object)
		    		proccessed_array.push(object)
		    	})
		        callback(null, proccessed_array);
		    },
		    function(fdata, callback) {
		        //Save the filter results to mongodb
		        console.log("Second")
				Geolocation.insertMany(fdata)
				.then(function(result){
				    callback(null, result)
				}).catch(function(err){
					console.log(err)
				    callback(err,null)
				})
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
		    	let fdata = {}
		    	let query = Geolocation.where('severity')
		    	let count_query = Geolocation.where('severity')

		    	if(options.severity) {
		    		let number_array = (options.severity.split(',')).map(Number);
		    		query.in(number_array)
		    		count_query.in(number_array)
		    	}

		    	if(options.page && options.perPage) {
		    		if(options.type) {
			    		query.select('coordinates')
			    	}
		    		query.skip(parseInt((options.perPage * options.page) - options.perPage)).limit(parseInt(options.perPage))
		    	}

		    	if(options.type) {
		    		query.select('coordinates')
		    	}

		    	query.exec(function(err, items) {
		    		if(err) {
		    			console.log(err)
		    			callback(err, null)
		    		} else {
		    			count_query.count().exec()
			    		.then(function(result){
			    			fdata.data = items
			    			fdata.total_data = result
				            callback(null, fdata)
				        }).catch(function(err){
				            callback(err,null)
				        })
		    		}
		    		
		    	})
		    	
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
	},

	calcSeverityMethod : function(callback) {
		async.waterfall([
		    function(callback) {
		    	//Fetch results
		    	let query = Geolocation.find()
		    	query.exec(function(err, items) {
		    		if(err) {
		    			console.log(err)
		    			callback(err, null)
		    		} else {
		    			callback(null, items)
		    		}
		    		
		    	})
		    },

		    function(fdata, callback) {
		    	//Process and update
		    	let counter = 0
		    	let bulkOp = Geolocation.collection.initializeOrderedBulkOp();

		    	_.each(fdata, function(item) {
		    		bulkOp.find({ '_id': item._id }).updateOne({
				        '$set': { 'severity': calculateSeverity(item) }
				    });
				    counter++;
				    if(counter % 500 === 0) {
				        // Execute per 500 operations and re-init
				        bulkOp.execute();
				        console.log("ADDED : " + counter)
				        bulkOp = Geolocation.collection.initializeOrderedBulkOp();
				    }
		    	})

		    	// Clean up queues
				if(counter > 0) {
				    bulkOp.execute();
				}

				callback(null, "Done")
		    	
		    }
		], function(err, results) {
		    if(err) {
		    	callback(err, null);
		    } else {
		    	callback(null, results);
		    }
		});
	}
}
