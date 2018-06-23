var express = require('express');
var controller = require('../controller');
var AuthMiddlewares = require('../middlewares/auth');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express'});
});

//Api to ping the server
router.get('/ping', function(req, res, next)	{
	res.json({active:true, environment : process.env.NODE_ENV})
});

//Api to calculate and save the data
router.post('/api/process', AuthMiddlewares.isValid, function(req, res, next) {
  controller.processLoc(req, res, next);
});

//Api to retreive data with optional filters
router.get('/api/fetch', AuthMiddlewares.isValid, function(req, res, next) {
  controller.fetchLoc(req, res, next);
});

//Api to delete collection
router.delete('/api/flush', AuthMiddlewares.isValid, function(req, res, next) {
  controller.flushDb(req, res, next);
});

//NOT USED
router.put('/api/calculate', AuthMiddlewares.isValid, function(req, res, next) {
  controller.calcSeverity(req, res, next);
});

module.exports = router;
