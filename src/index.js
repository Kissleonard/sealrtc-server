var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var contentTypeOverride = require('express-content-type-override');
var userRouter = require('./routes/user');
var miscRouter = require('./routes/misc');
var Config = require('./conf');

var app = express();

var options = {
  contentType: 'application/json',
  charset: 'utf-8'
};
app.use('/user', contentTypeOverride(options));
app.use(cors());
app.use(bodyParser.json());
app.use('/user', userRouter);
app.use('/misc', miscRouter);

var server = app.listen(Config.SERVER_PORT, function () {
  return console.log('SealRTC Server listening at http://%s:%s in %s mode.', server.address().address, server.address().port, app.get('env'));
});
module.exports = app;