### SealRTC-Server

#### 配置安装

> 1、安装 [Node.js10+](http://nodejs.cn/download/) 环境

> 2、全装 Node.js 依赖性包, 项目根目录执行 `npm install`

> 3、按需修改 src/conf.js 

> 4、启动服务 `npm run serve`

#### 部署

建议使用 `pm2` 部署

**安装:**

```js
npm install pm2 -g
```

**运行:**

```js
pm2 start src/index.js --name sealrtc-server
```

**查看:**

```js
pm2 list
```