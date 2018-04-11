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

function calculateSeverity(filter, object) {
	let severity = 0
	let gforce = parseFloat(object.gforce)

	from = filter.from ? parseFloat(filter.from) : 1.028
	one = filter.one ? parseFloat(filter.one) : 1.1
	two = filter.two ? parseFloat(filter.two) : 1.2

	if(gforce > from && gforce < one) {
		object.severity = 1
	} else if(gforce > one && gforce < two) {
		object.severity = 2
	} else if(gforce > two) {
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
				Geolocation.insertMany(fdata)
				.then(function(result){
				    callback(null, result)
				}).catch(function(err){
				    callback(err,null)
				})

				// var collection = db.collection('entries'),          
			 //        bulkUpdateOps = [];    

			 //    entries.forEach(function(doc) {
			 //        bulkUpdateOps.push({ "insertOne": { "document": doc } });

			 //        if (bulkUpdateOps.length === 1000) {
			 //            collection.bulkWrite(bulkUpdateOps).then(function(r) {
			 //                // do something with result
			 //            });
			 //            bulkUpdateOps = [];
			 //        }
			 //    })

			 //    if (bulkUpdateOps.length > 0) {
			 //        collection.bulkWrite(bulkUpdateOps).then(function(r) {
			 //            // do something with result
			 //        });
			 //    }
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
		    	let query = Geolocation.where('gforce')
		    	let count_query = Geolocation.where('gforce')

		    	if(options.from) {
		    		query.gt(options.from)
		    		count_query.gt(options.from)
		    	}

		    	if(options.to) {
		    		query.lt(options.to)
		    		count_query.lt(options.to)
		    	}

		    	if(options.page && options.perPage) {
		    		query.skip(parseInt((options.perPage * options.page) - options.perPage)).limit(parseInt(options.perPage))
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
		    	
		    },

		    function(fdata, callback) {
		    	let proccessed_array = {
		    		total_data : fdata.total_data,
		    		processed_data : []
		    	}

				_.each(fdata.data, function(object) {
					object = object.toJSON()
					proccessed_array.processed_data.push(calculateSeverity(options, object))
				})
				console.log("No. of processed entries are : " + proccessed_array.processed_data.length)
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
