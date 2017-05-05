var express = require('express');
var router = express.Router();

var auth = require('../controllers/auth');

/* GET users listing. */
router.get('/', auth.loginRequired, function(req, res, next) {
  res.send('users page');
});

module.exports = router;
