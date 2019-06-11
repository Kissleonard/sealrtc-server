/* 
此文件实现融云注册统计功能, 开发者可忽略
 */
const https = require('https'),
  qs = require('querystring');

const DEMO_TYPE = 2; // SealRTC

const ADMIN_REPORT_URL = 'admin.rongcloud.net',
  ADMIN_REPORT_PATH = '/demoApi/sendData';

const request = (options) => {
  return new Promise((resolve, reject) => {
    let content = options.content;

    let req = https.request(options, function (res) {
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

const reportRegister = (phone, region) => {
  let content = `mobile=${phone}&demo_type=${DEMO_TYPE}&region=${region}`;
  let options = {
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