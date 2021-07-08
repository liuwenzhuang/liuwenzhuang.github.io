---
title: webpack-dev-server 配置 websocket proxy
date: 2021-05-31 08:23:12
tag: ["Tools"]
excerpt: 最近在本地调试时，发现针对 websocket 的 proxy 不生效了，原因是后端开启了登录验证（Cookie 验证），而通过配置 onProxyReq 竟然不能生效，通过调试发现解决方案。
---

[nodejs-debug]: {% post_url 2018-03-24-nodejs-debug %}
[webpack4-proxy]: https://v4.webpack.js.org/configuration/dev-server/#devserverproxy

最近在本地调试时，发现针对 websocket 的 proxy 不生效了，原因是后端开启了登录验证（Cookie 验证），而通过配置 `onProxyReq` 竟然不能生效，通过调试发现可以设置 `headers` 重写 `Cookie` 头部，避免被后端登录校验拦截。

## 环境信息

本文在 webpack@4 和 webpack-dev-server@3 下测试。

## 具体配置

```js
// webpack.config.js

module.exports = {
  mode: "development",
  // 其他配置...
  devServer: {
    hot: true,
    proxy: [
      {
        context: "/websocket", // 换成自己的 websocket 路径 path
        target: BACKEND_API,
        ws: true,
        changeOrigin: true,
        headers: {
          cookie: "COOKIE_AUTH_KEY=COOKIE_AUTH_VALUE;",
        },
      },
    ],
  },
};
```

> 将上面的 context、target 以及 headers.cookie 中的值设置为自己环境的相应配置即可。

## 原理

`http-proxy` 中在转发请求之前会进行配置的合并工作：

![http-proxy-ws-headers.png](/img/posts/tools/http-proxy-ws-headers.png)
_http-proxy 配置合并_

> 这里是 `http-proxy@1.18.1` 的代码截图，其他版本可能略有差异。

## 服务重启造成的 read ECONNRESET 异常

在开发过程中，由于后端服务会经常重新部署重启，发现会出现 `Error: read ECONNRESET` 异常：

```bash
at TCP.onStreamRead (internal/stream_base_commons.js:183:27) {
  errno: 'ECONNRESET',
  code: 'ECONNRESET',
  syscall: 'read'
}
```

我的本地开发环境信息：

```json
"webpack": "^4.44.1",
"webpack-dev-server": "^3.11.0"

node v12.6.0
npm 6.9.0
```

此异常会造成 `webpack-dev-server` 启动的服务挂掉，暂时还没时间查找具体的原因，但因为是未捕获的异常造成的，我们可以在全局处理一下 `uncaughtException` 事件：

```js
// webpack.config.js

const process = require('process');

process.on('uncaughtException', function (err) {
    // 开发时，websocket proxy 会因服务重新部署而报错中断本地 server，这里拦截一下
    console.log('拦截未处理异常:', err);
});
```

## 更多

- [Node.js 调试][nodejs-debug]{:target="\_blank"}
- [webpack@4 proxy][webpack4-proxy]{:target="\_blank"}
