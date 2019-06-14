/* 
此文件实现融云注册统计功能, 开发者可忽略
 */
var https = require('https'),
  qs = require('querystring');

var DEMO_TYPE = 2; // SealRTC

var ADMIN_REPORT_URL = 'admin.rongcloud.cn',
  ADMIN_REPORT_PATH = '/demoApi/sendData';

var request = (options) => {
  return new Promise((resolve, reject) => {
    var content = options.content;

    var req = https.request(options, function (res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        resolve(chunk);
      });
    });
    req.on('error', function (e) {
      reject(e);
    });

    req.write(content);
    req.end();
  });
};

var reportRegister = (phone, region) => {
  var content = `mobile=${phone}&demo_type=${DEMO_TYPE}&region=${region}`;
  var options = {
    hostname: ADMIN_REPORT_URL,
    path: ADMIN_REPORT_PATH,
    method: 'POST',
    content: content,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  return request(options).then((result) => {
    console.log('result', result);
    return Promise.resolve(result);
  }, (e) => {
    console.error('error', e);
    return Promise.reject(e);
  });
};

module.exports = {
  reportRegister
};