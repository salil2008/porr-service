var express = require('express');
var controller = require('../controller');
var AuthMiddlewares = require('../middlewares/auth');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express'});
});

router.get('/ping', function(req, res, next)	{
	res.json({active:true, environment : process.env.NODE_ENV})
});

router.post('/api/process', AuthMiddlewares.isValid, function(req, res, next) {
  controller.processLoc(req, res, next);
});

router.get('/api/fetch', AuthMiddlewares.isValid, function(req, res, next) {
  controller.fetchLoc(req, res, next);
});

router.delete('/api/flush', AuthMiddlewares.isValid, function(req, res, next) {
  controller.flushDb(req, res, next);
});

module.exports = router;
