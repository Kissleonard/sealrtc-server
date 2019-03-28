const ResponseType = {
  SUCCESS: 200,
  ERROR: 400
};
const ErrorType = {
  PARAMS_ILLEGAL: '参数非法',
  EXCEEDED: '调用频率过快',
  UNKOWN_PHONE: '未知手机号',
  CODE_EXPIRED: '验证码失效',
  CODE_INVALID: '无效的验证码',
};
module.exports = {
  ErrorType,
  ResponseType
};