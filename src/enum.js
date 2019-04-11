var ResponseType = {
  SUCCESS: 200,
  ERROR: 400,
  PARAMS_ILLEGAL: 4000,
  EXCEEDED: 4001,
  UNKOWN_PHONE: 4002,
  CODE_EXPIRED: 4003,
  CODE_INVALID: 4004,
  CODE_SEND_FAILED: 4005,
  GET_IM_TOKEN_FAILED: 4006
};
var ErrorMessage = {
  PARAMS_ILLEGAL: '参数非法',
  EXCEEDED: '调用频率过快',
  UNKOWN_PHONE: '未知手机号',
  CODE_EXPIRED: '验证码失效',
  CODE_INVALID: '无效的验证码'
};

module.exports = {
  ErrorMessage,
  ResponseType
};