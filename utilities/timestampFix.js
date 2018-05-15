var config = require('../config');
var mongoose = require('mongoose');
var async = require('async');
var url = require('url');
var _ = require('underscore');
var when = require('when');
var Geolocation = require('../models/model').geolocation;

async.series([
    function(callback) {
        mongoose.connect(config.MONGOLAB_URI, function(err){
		    if(err) {
		        console.log(err);
		        console.log('Unable to connect to mongo database at:'+process.env.MONGOLAB_URI);
		    } else {
		        console.log('MongoDB connection successful');
		        callback(null, 'complete');
		    }
		})
    },
    function(callback) {
        Geolocation.aggregate([
		    {"$group" : {_id:"$time", count:{$sum:1},dataSet:{$push:{_id: "$_id", time: "$time"}}}}
		]).exec(function(err, data) {
			if(err) {
				console.log(err)
			} else {
				//console.log(data)
				_.each(data, function(row) {
					let seconds = 0
					console.log(row.count)
					if(parseInt(row.count) < 60) {
						seconds = Math.floor(60/parseInt(row.count))
					} else if(parseInt(row.count) == 60) {
						seconds = 1
					} else {
						seconds = 1
					}
					
					let counter = seconds
					_.each(row.dataSet,function(set){
						set.time = set.time + ':' + counter
						console.log(set.time)
						//Update entry
						Geolocation.update({ _id: set._id }, { $set : { time: set.time }}, function(err, result){
							if(err) {
								console.log(err)
							} else {
								console.log("added")
							}
						});
						if(counter == 60) {
							counter = seconds
						} else {
							counter = counter + seconds
						}
					})

				})
				callback(null, 'complete')
			}
		})
    }
],
function(err, results) {
    console.log("Complete")
});