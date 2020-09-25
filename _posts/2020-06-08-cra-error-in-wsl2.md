---
title: create-react-app在WSL中执行npm start出错
date: 2020-06-08 10:23:12
tag: ["tools"]
excerpt: 本文记录下最近在 Windows10 中的 wsl2 中使用`create-react-app`创建了工程后，执行`npm start`或`yarn start`报错的问题。
---

最近在 Windows10 中的 wsl2 中使用`create-react-app`创建了工程后，发现执行`npm start`或`yarn start`时会报错：

```bash
Error: spawn cmd.exe ENOENT
```

经过调试，发现是尝试调用本地浏览器打开页面时出现了错误，具体代码在[open](https://www.npmjs.com/package/open)库中：

![cra-wsl2-yarn-start-error](/img/posts/cra/cra-wsl2-yarn-start-error.png)

可以看到尝试使用`cmd.exe`启动浏览器时出现了问题，没有找到`cmd.exe`，一般来说安装 wsl2 时，会将 windows10 的环境变量也附加到 wsl2 环境中，但是`cmd.exe`所在的`/mnt/c/System32`路径没被附加上去，此时就会出现上面的问题。

## 两种解决方案

### 更改 scripts（不自动打开浏览器）

将`package.json`中 scripts 里的 start 脚本增加`BROWSER=none`参数，即：

```json
"scripts": {
   "start": "BROWSER=none react-scripts start"
 }
```

此种方式告诉`react-scripts`不必帮我打开浏览器，随后可自己手动在浏览器中访问`http://localhost:3000`即可访问自己的应用。

### 将`cmd.exe`的路径信息附加到 wsl2 中（附加环境变量）

上面也说道原因是因为环境变量的问题，那么将`cmd.exe`的路径信息添加到 wsl2 中亦可解决问题，并能够享受到自动打开浏览器的好处：编辑`~/.bashrc`文件，在文件底部添加：

```bash
System32="/mnt/c/Windows/System32"
export PATH=$PATH:$System32
```

然后执行`source ~/.bashrc`使其生效即可。

## 参考

- https://github.com/facebook/create-react-app/issues/7251
