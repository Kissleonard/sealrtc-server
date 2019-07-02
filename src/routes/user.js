var express = require('express');
var router = express.Router();

var utils = require('../utils');
var APIResult = utils.APIResult;
var Cache = utils.Cache;

var Enum = require('../enum');
var ResponseType = Enum.ResponseType;
var ErrorMessage = Enum.ErrorMessage;

var SMS = require('../sms');
var sendCode = SMS.sendCode;

var utils = require('../utils');
var _ = require('underscore');
var moment = require('moment');
var Config = require('../conf');

const adminReport = require('../admin-report'),
  reportRegister = adminReport.reportRegister;


var RongSDK = require('rongcloud-sdk')({
  appkey: Config.RONGCLOUD_APPKEY,
  secret: Config.RONGCLOUD_SECRET,
  api: Config.RONGCLOUD_SERVER_API || 'http://api.cn.ronghub.com'
});
var User = RongSDK.User;
var cache = Cache();

var getNormalToken = function (user) {
  return User.register(user);
};

var getTimeUId = (region, phone) => {
  return `time_${region}_${phone}`;
};
var getCodeUId = (region, phone) => {
  return `code_${region}_${phone}`;
};
var setCode = (region, phone, code) => {
  var codeUId = getCodeUId(region, phone);
  return cache.set(codeUId, code);
};
var getCode = (region, phone) => {
  var codeUId = getCodeUId(region, phone);
  return cache.get(codeUId) + '';
};
var setUpdateTime = (region, phone) => {
  var timeUId = getTimeUId(region, phone);
  return cache.set(timeUId, Date.now());
};
var getUpdateTime = (region, phone) => {
  var timeUId = getTimeUId(region, phone);
  return cache.get(timeUId) || '';
};
var clear = (region, phone) => {
  [getTimeUId(region, phone), getCodeUId(region, phone)].forEach((key) => {
    cache.remove(key);
  });
};

router.post('/send_code', (req, res, next) => {
  var body = req.body;
  var region = body.region;
  var phone = body.phone;

  if (_.isEmpty(String(region)) || _.isEmpty(String(phone))) {
    return res.send(new APIResult(ResponseType.PARAMS_ILLEGAL, null, ErrorMessage.PARAMS_ILLEGAL));
  }
  region = utils.formatRegion(region);

  if (Config.DEBUG) {
    return Promise.resolve().then(function () {
      return res.send(new APIResult(200));
    })["catch"](next);
  }
  var updateTime = getUpdateTime(region, phone);
  if (!_.isEmpty(String(updateTime))) {
    var momentNow = moment();
    var subtraction = momentNow.subtract(1, 'm');
    if (subtraction.isBefore(updateTime)) {
      return res.send(new APIResult(ResponseType.EXCEEDED, null, ErrorMessage.EXCEEDED));
    }
  }
  return sendCode(region, phone).then((result) => {
    var sessionId = result.sessionId;
    setCode(region, phone, sessionId);
    setUpdateTime(region, phone);
    return res.send(new APIResult(ResponseType.SUCCESS));
  }, error => {
    return res.send(new APIResult(ResponseType.CODE_SEND_FAILED, null, error));
  }).catch(next);
});

router.post('/verify_code', (req, res, next) => {
  var body = req.body;
  var region = body.region;
  var phone = body.phone;
  var code = body.code;
  var id = body.key;
  if (_.isEmpty(String(region)) || _.isEmpty(String(phone)) || _.isEmpty(String(id)) || _.isEmpty(String(code))) {
    return res.send(new APIResult(ResponseType.PARAMS_ILLEGAL, null, ErrorMessage.PARAMS_ILLEGAL));
  }
  region = utils.formatRegion(region);

  var name = 'tester', portrait = 'tester';
  var user = {
    id: id,
    name: name,
    portrait: portrait
  };
  if (Config.DEBUG) {
    return getNormalToken(user).then(function (result) {
      clear(region, phone);
      var token = result.token;
      reportRegister(phone, region); //开发环境不记录
      return res.send(new APIResult(ResponseType.SUCCESS, { token: token }));
    }, (error) => {
      return res.send(new APIResult(ResponseType.GET_IM_TOKEN_FAILED, null, error));
    })["catch"](next);
  }
  var updateTime = getUpdateTime(region, phone);
  if (_.isEmpty(String(updateTime))) {
    return res.send(new APIResult(ResponseType.UNKOWN_PHONE, null, ErrorMessage.UNKOWN_PHONE));
  }
  if (moment().subtract(2, 'm').isAfter(updateTime)) {
    res.send(new APIResult(ResponseType.CODE_EXPIRED, null, ErrorMessage.CODE_EXPIRED));
  }

  return Promise.resolve().then(() => {
    var sessionId = getCode(region, phone);
    if (_.isEqual(sessionId, code)) {
      clear(region, phone);
      return getNormalToken(user).then(function (result) {
        reportRegister(phone, region);
        var token = result.token;
        return res.send(new APIResult(200, { token: token }));
      }, (error) => {
        return res.send(new APIResult(ResponseType.GET_IM_TOKEN_FAILED, null, error));
      });
    } else {
      return res.send(new APIResult(ResponseType.CODE_INVALID, null, ErrorMessage.CODE_INVALID));
    }
  }).catch(next);
});

router.get('/configuration', (req, res, next) => {
  return Promise.resolve().then(function () {
    return res.send(new APIResult(ResponseType.SUCCESS, {
      mediaservers: Config.MEDIASERVERS
    }));
  }).catch(next);;
});

module.exports = router;