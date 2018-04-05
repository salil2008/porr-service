var config = require('../config');
var mongoose = require('mongoose');
var async = require('async');
var processLogic = require('../models/process');

var self = module.exports = {
	processLoc : function(req, res, next) {
		console.log(req.body)
		if(req.body && req.body.length > 0) {
			console.log(req.body.length)
			processLogic.processMethod(req.body, function(err, result) {
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
