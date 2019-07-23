var express = require('express');
var router = express.Router();

var utils = require('../utils');
var APIResult = utils.APIResult;

var Enum = require('../enum');
var ResponseType = Enum.ResponseType;

var Config = require('../conf');

router.get('/configuration', (req, res, next) => {
  return Promise.resolve().then(() => {
    return res.send(new APIResult(ResponseType.SUCCESS, Config.CONF));
  }).catch(next);
});

module.exports = router;