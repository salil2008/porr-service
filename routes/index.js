var express = require('express');
var controller = require('../controller');
var AuthMiddlewares = require('../middlewares/auth');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/api/process', AuthMiddlewares.isValid, function(req, res, next) {
  controller.processLoc(req, res, next);
});

router.get('/api/fetch', AuthMiddlewares.isValid, function(req, res, next) {
  controller.fetchLoc(req, res, next);
});

module.exports = router;
