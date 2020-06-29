var express = require('express');
var router = express.Router();
const yaml = rootRequire('./utils/yaml');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { appName: yaml.app.name, appVersion: yaml.app.version });
});

module.exports = router;
