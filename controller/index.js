var config = require('../config');
var mongoose = require('mongoose');
var async = require('async');
var processLogic = require('../models/process');

var self = module.exports = {
	processLoc : function(req, res, next) {
		if(req.body.input && req.body.input.length > 0) {
			processLogic.processMethod(req.body.input, function(err, result) {
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
					"message" : "Successfully added.",
					"data" : result
				})
			}
		});
	}
}
