var config = require('../config');
var mongoose = require('mongoose');
var async = require('async');
var url = require('url');
var processLogic = require('../models/process');

var self = module.exports = {
	processLoc : function(req, res, next) {
		let input = JSON.parse(req.body.data)
		if(input && input.length > 0) {
			console.log(input.length)
			processLogic.processMethod(input, function(err, result) {
				if(err) {
					res.json({
						"code" : 500,
						"message" : "Error occured. Could not add.",
						"data" : err
					})
				} else {
					res.json({
						"code" : 200,
						"message" : "Successfully added."
					})
				}
			});
		} else {
			res.json({
				"code" : 500,
				"message" : "Request empty. Please check your request."
			})
		}
		
	},

	fetchLoc : function(req, res, next) {
		var query_data = url.parse(req.url, true).query
		console.log(query_data)
		processLogic.fetchMethod(query_data, function(err, result) {
			if(err) {
				res.json({
					"code" : 500,
					"message" : "Error occured. Could not fetch.",
					"data" : err
				})
			} else {
				res.json({
					"code" : 200,
					"message" : "Successfully fetched.",
					"total_data" : result.total_data,
					"data" : result.processed_data
				})
			}
		});
	},

	flushDb : function(req, res, next) {
		processLogic.flushDbMethod(function(err, result) {
			if(err) {
				res.json({
					"code" : 500,
					"message" : "Error occured. Could not delete.",
					"data" : err
				})
			} else {
				res.json({
					"code" : 200,
					"message" : "Successfully flushed database.",
					"data" : result
				})
			}
		});
	}
}
