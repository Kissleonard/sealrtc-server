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
  return cache.get(codeUId);
};
let setUpdateTime = (region, phone) => {
  let timeUId = getTimeUId(region, phone);
  return cache.set(timeUId, Date.now());
};
let getUpdateTime = (region, phone) => {
  let timeUId = getTimeUId(region, phone);
  return cache.get(timeUId);
};
let clear = (region, phone) => {
  [getTimeUId(region, phone), getCodeUId(region, phone)].forEach((key) => {
    cache.remove(key);
  });
};

router.post('/send_code', (req, res, next) => {
  let { body: { region, phone } } = req;
  if (_.isEmpty(region) || _.isEmpty(phone)) {
    return res.send(new APIResult(ResponseType.ERROR, null, ErrorType.PARAMS_ILLEGAL));
  }
  region = utils.formatRegion(region);

  let updateTime = getUpdateTime(region, phone);
  if (!_.isEmpty(updateTime)) {
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
  let { body: { code, phone, region, key } } = req;
  if (_.isEmpty(region) || _.isEmpty(phone) || _.isEmpty(key) || _.isEmpty(code)) {
    return res.send(new APIResult(ResponseType.ERROR, null, ErrorType.PARAMS_ILLEGAL));
  }
  region = formatRegion(region);
  let updateTime = getUpdateTime(region, phone);
  if(_.isEmpty(updateTime)){
    return res.send(new APIResult(ResponseType.ERROR, null, ErrorType.UNKOWN_PHONE));
  }
  if(moment().subtract(2, 'm').isAfter(updateTime)){
    res.send(new APIResult(ResponseType.ERROR, null, ErrorType.CODE_EXPIRED));
  }
  return Promise.resolve().then(() => {
    let sessionId = getCode(region, phone);
    if(_.isEqual(sessionId, code)){
      return res.send(new APIResult(ResponseType.SUCCESS));
    }else{
      return res.send(new APIResult(ResponseType.ERROR, null, ErrorType.CODE_INVALID));
    }
  }).catch(next);
});
module.exports = router;