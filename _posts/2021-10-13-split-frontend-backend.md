---
title: 工程前后端分离实践
date: 2021-10-13 12:23:12
tag: ["Tools"]
excerpt: 最近针对维护的老项目进行了前后端分离的操作，这里了记录一下大体上的流程。
---

[git filter-repo]: https://github.com/newren/git-filter-repo/
[install-guide]: https://github.com/newren/git-filter-repo/blob/main/INSTALL.md
[gitlab-babel-plguin]: https://gist.github.com/liuwenzhuang/730b495aa1e4f9c4e3a122240e4a1e6c

## 现状

1. 代码处于同一个仓库，前后端版本、分支等由后端确定。
2. 前后端代码是独立存放的，前端代码存放于其中一个子目录。
```bash
bdms
  ├── bdms-webserver/src/main/webapp - 需要分离的前端子目录
  ├── ...
```
3. 用户访问页面过程：

![目前前后端交互流程.png](/img/posts/tools/目前前后端交互流程.png)


## 目标

1. 前端代码拆分为独立的代码仓库，版本由前端控制
2. 前端应用独立部署，使用 Node.js 启动单独的服务
3. 前端代码调整，支持用户信息通过接口（校验登录）获取
4. Nginx 配置，API 接口映射到后端服务，其他映射到前端 Node.js 服务

![前后端分离交互流程.png](/img/posts/tools/前后端分离交互流程.png)

---

## 将前端子目录拆分

git 本身是存在 filter-branch 命令来做这个工作的，但由于性能等原因，已经不推荐使用了。目前推荐使用 [git filter-repo][git filter-repo] 工具做这个操作。不过这个工具需要独立安装一下。

所需依赖：

- git >= 2.24.0
- python3 >= 3.5

python3 的安装和配置这里不再赘述，对于 `git filter-repo` 来说有[很多种安装方式][install-guide]，但使用 pip3 安装最方便：

```bash
pip3 install git-filter-repo
```

下面的命令从当前 *bdms* 这个 git 仓库中分离出其中的 *bdms-webserver/src/main/webapp* 目录，将其放置到 *bdms-frontend* 工程中，*bdms-frontend* 是个空的 git 仓库。

```bash
git filter-repo --source bdms --target bdms-frontend --subdirectory-filter bdms-webserver/src/main/webapp
```

- `--source` 指定要操作的 git 仓库目录，这里是指当前路径下的 *bdms* 目录
- `--target` 指定要分离出去文件的 git 仓库目录，这里是指当前路径下的 *bdms-frontend* 目录
- `--subdirectory-filter` 指定要分离出的子目录

如果不指定`--source`和`--target`，也可以在要操作的 git 仓库目录下直接操作，但这是一个原地替换的操作。

拆分后 *bdms-frontend* 仓库内的 git 提交历史仅仅保留了 *bdms-webserver/src/main/webapp* 目录相关的提交。

> 拆分后，能保留 tag 信息，但不能保留分支信息，所以在进行操作前可以把需要的分支先切出来。

## 前端代码调整

之前的方案，后端随着 Serve index.html 进行 Cookie 的设置，前端的入口 js 中肯定能从 Cookie 中拿到用户的信息，相当于是同步的操作。分离之后，需要前端发起**获取用户信息**的操作（后端会进行登录的验证），需要将路由渲染的主体逻辑放于获取用户信息的操作返回之后，并进行代码的调整：

![前后端分离代码调整方案-异步请求-代码转换.png](/img/posts/tools/前后端分离代码调整方案-异步请求-代码转换.png)

需要进行代码转换的原因在于，之前的代码中，*userToken* 是从 COOKIE 中同步解析而来，所以能够直接 export，但通过接口获取用户信息后，不能对 export 的 *userToken* 设置值，但可以对一个 object 设置属性。

转换前的全局常量文件及用法：

```ts
// 原来的 constant.ts
export const userToken = parseCookie(document.cookie)

// 使用者：comp.ts
import { userToken } from 'constant.ts'
console.log(userToken.email) // 'lwz@abc.com'
```

转换后：

```ts
// constant.ts
export default {
  userToken: {} // 会在 用户信息接口返回后被设置
}

// 使用者：comp.ts
import constant from 'constant.ts'
console.log(constant.userToken.email) // 'lwz@abc.com'
```

关于转换使用到的 babel 插件，可查看 [gitlab][gitlab-babel-plguin]。

## 前端独立的服务

每个团队都有自己的部署方案，如果有运维能力，推荐使用 Node.js 服务。可考虑成熟的框架（如 Egg.js）或者自己通过 Koa 启动服务。优点是可以方便的集成配套的生态，如配置 SSR，服务报警等。这部分就不再赘述了。

## Nginx 配置

Nginx 转发规则和其他前后端分离的应用大致相同，除了 API 的 url 转发到后端，其他的都应该转发到独立的前端服务：

```nginx
server {
  location / {
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-From-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_pass http://server-frontend; # 前端服务的 upstream
  }

  location ~ ^/(v1|v2|v3|v4) {
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-From-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://server-backend; # 后端服务的 upstream
  }
}
```
