const express = require('express');
const router = express.Router();
const { APIResult, Cache } = require('../utils');
const { ResponseType, ErrorType } = require('../enum');
const { sendCode } = require('../sms');
const utils = require('../utils');
const _ = require('underscore');
const moment = require('moment');
const Config = require('../conf');

const RongSDK = require('rongcloud-sdk')({
  appkey: Config.RONGCLOUD_APPKEY,
  secret: Config.RONGCLOUD_SECRET
});
const { User } = RongSDK;
const cache = Cache();

let getNormalToken = function (user) {
  return User.register(user);
};

let getTimeUId = (region, phone) => {
  return `time_${region}_${phone}`;
};
let getCodeUId = (region, phone) => {
  return `code_${region}_${phone}`;
};
let setCode = (region, phone, code) => {
  let codeUId = getCodeUId(region, phone);
  return cache.set(codeUId, code);
};
let getCode = (region, phone) => {
  let codeUId = getCodeUId(region, phone);
  return cache.get(codeUId) + '';
};
let setUpdateTime = (region, phone) => {
  let timeUId = getTimeUId(region, phone);
  return cache.set(timeUId, Date.now());
};
let getUpdateTime = (region, phone) => {
  let timeUId = getTimeUId(region, phone);
  return cache.get(timeUId) || '';
};
let clear = (region, phone) => {
  [getTimeUId(region, phone), getCodeUId(region, phone)].forEach((key) => {
    cache.remove(key);
  });
};

router.post('/send_code', (req, res, next) => {
  let { body: { region, phone } } = req;
  if (_.isEmpty(String(region)) || _.isEmpty(String(phone))) {
    return res.send(new APIResult(ResponseType.ERROR, null, ErrorType.PARAMS_ILLEGAL));
  }
  region = utils.formatRegion(region);

  if (Config.DEBUG) {
    return Promise.resolve().then(function () {
      return res.send(new APIResult(200));
    })["catch"](next);
  }
  let updateTime = getUpdateTime(region, phone);
  if (!_.isEmpty(String(updateTime))) {
    var momentNow = moment();
    var subtraction = momentNow.subtract(1, 'm');
    if (subtraction.isBefore(updateTime)) {
      return res.send(new APIResult(ResponseType.ERROR, null, ErrorType.EXCEEDED));
    }
  }
  return sendCode(region, phone).then(({ sessionId }) => {
    setCode(region, phone, sessionId);
    setUpdateTime(region, phone);
    return res.send(new APIResult(ResponseType.SUCCESS));
  }, error => {
    return res.send(new APIResult(ResponseType.ERROR, null, error));
  }).catch(next);
});

router.post('/verify_code', (req, res, next) => {
  let { body: { code, phone, region, key: id } } = req;
  if (_.isEmpty(String(region)) || _.isEmpty(String(phone)) || _.isEmpty(String(id)) || _.isEmpty(String(code))) {
    return res.send(new APIResult(ResponseType.ERROR, null, ErrorType.PARAMS_ILLEGAL));
  }
  region = utils.formatRegion(region);

  let name = 'tester', portrait = 'tester';
  let user = {
    id,
    name,
    portrait
  };
  if (Config.DEBUG) {
    return getNormalToken(user).then(function ({ token }) {
      clear(region, phone);
      return res.send(new APIResult(200, { token }));
    }, (error) => {
      return res.send(new APIResult(ResponseType.ERROR, null, error));
    })["catch"](next);
  }
  let updateTime = getUpdateTime(region, phone);
  if (_.isEmpty(String(updateTime))) {
    return res.send(new APIResult(ResponseType.ERROR, null, ErrorType.UNKOWN_PHONE));
  }
  if (moment().subtract(2, 'm').isAfter(updateTime)) {
    res.send(new APIResult(ResponseType.ERROR, null, ErrorType.CODE_EXPIRED));
  }

  return Promise.resolve().then(() => {
    let sessionId = getCode(region, phone);
    if (_.isEqual(sessionId, code)) {
      clear(region, phone);
      return getNormalToken(user).then(function (result) {
        let { token } = result;
        return res.send(new APIResult(200, { token }));
      }, (error) => {
        return res.send(new APIResult(ResponseType.ERROR, null, error));
      });
    } else {
      return res.send(new APIResult(ResponseType.ERROR, null, ErrorType.CODE_INVALID));
    }
  }).catch(next);
});
module.exports = router;