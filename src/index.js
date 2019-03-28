let express = require('express');
let cors = require('cors');
let bodyParser = require('body-parser');
let userRouter = require('./routes/user');
let Config = require('./conf');
let app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/user', userRouter);

let server = app.listen(Config.SERVER_PORT, function () {
  return console.log('SealRTC Server listening at http://%s:%s in %s mode.', server.address().address, server.address().port, app.get('env'));
});
module.exports = app;