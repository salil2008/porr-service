var config = require('../config');
var mongoose = require('mongoose');
var async = require('async');
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
		processLogic.fetchMethod(function(err, result) {
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
					"data" : result
				})
			}
		});
	}
}
