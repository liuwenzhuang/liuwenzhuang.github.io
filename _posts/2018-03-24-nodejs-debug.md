---
title: 调试Node.js应用
date: 2018-03-24 11:23:45
tag: ["Node.js"]
excerpt: 应用开发中，功能实现是首要目的，其次是掌握调试的能力，本文会介绍如何通过Chrome DevTools和VS Code进行Node.js应用的调试。
---

应用开发中，功能实现是首要目的，其次是掌握调试的能力，本文会介绍如何通过 Chrome DevTools 和 VS Code 进行 Node.js 应用的调试。

## 前提准备

首先请确保 Node.js 版本高于 6.3.0：

```bash
# 版本需高于6.3.0
$ node -v
```

其次准备好自己的 Node.js 应用，这里我们先以一个简单的`index.js`为例：

```javascript
// index.js
function add(x, y) {
  return x + y;
}

const result = add(1, 2);
console.log("result is ", result);
```

## 使用 Chrome DevTools 调试

首先执行：

```bash
$ node --inspect --inspect-brk index.js
Debugger listening on ws://127.0.0.1:9229/736b2e2d-c175-4d08-a10e-1c0ab38542e3
For help, see: https://nodejs.org/en/docs/inspector
```

- --inspect 表示启动调试
- --inspect-brk 表示自动添加断点，在调试复杂应用或 npm 库时非常方便

然后在 Chrome 中新开标签页，输入`chrome://inspect`后回车：

![chrome inspect](/img/posts/node/chrome_devtools_debug_node.png)

此时可以点击`Open dedicated DevTools for Node`或 Target 下方的`inspect`链接打开调试窗口，此时就能够看到我们熟悉的调试页面了：

![chrome debug windows](/img/posts/node/chrome-devtools_node_debug_window.png)

由于我们指定了`--inspect-brk`，所以会自动断点处停止。在调试窗口中，就和我们平常进行 web 开发调试应用是一样的了，此处就不再赘述了。

> 使用`Open dedicated DevTools for Node`打开的调试窗口如果在调试完成后未关闭，重启 Node 的调试会自动绑定调试。

## 使用 VS Code 调试

VS Code 的强大自不必说，使用其调试 Node.js 应用也非常方便，能够在一个窗口内同时进行开发和调试工作也是其优势所在。

首先我们还是启动 node 调试：

```bash
$ node --inspect --inspect-brk index.js
Debugger listening on ws://127.0.0.1:9229/736b2e2d-c175-4d08-a10e-1c0ab38542e3
For help, see: https://nodejs.org/en/docs/inspector
```

然后我们通过 VS Code 的侧边栏，点击运行图标（或通过 Ctrl/CMD+Shift+D 快捷键打开）：

![VSCode debug](/img/posts/node/vscode_debug_node.png)

此时我们点击“创建 launch.json 文件”链接，在选择环境弹窗中选择 Node.js，此时 VS Code 会为我们创建一个`.vscode`目录，其中存在着一个名为`launch.json`的文件：

![VS Code lanunch](/img/posts/node/vscode_debug_launch_json.png)

可以看到`configurations`是一个数组，我们可以方便地添加多个配置，此处我们为演示，只会使用一个配置。使用下面的配置替换自动生成的`launch.json`文件内容：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "protocol": "inspector",
      "name": "VS Code Debug Node.js",
      "port": 9229
    }
  ]
}
```

- name 当前调试配置的名称
- port 待调试的端口，上面可以看到默认情况下启动 node 调试会占用 9229 端口

此时我们就可以通过侧边栏启动我们的调试了：

![VS Code debug configuration](/img/posts/node/vscode_debug_configurations.png)

点击执行按钮，就能够进入调试窗口了：

![VS Code debug window](/img/posts/node/vscode_node_debug_window.png)

可以看到这个调试窗口和 Chrome DevTools 的很类似，调试方法也大同小异，但要注意一些快捷键的不同。

## 调试 npm 库

上面提到怎样对自己的 Node.js 应用进行调试，下面说下如何调试 npm 库。在开发中我们经常需要引入一些辅助工具，最典型的如`webpack`、`eslint`等，如果在其执行过程中发生了和我们预期不同的结果，或者我们在利用其做一些辅助工具的开发时发生了一些错误，这时我们就可能想要对其进行调试，来查看内部的执行情况和数据情况了。这里我们调试 webpack 为例演示：

首先在 package.json 中定义一下 debug script，这样我们就不必每次都输入很长的命令了：

```json
{
  "scripts": {
    "build": "webpack",
    "build:debug": "node --inspect --inspect-brk ./node_modules/webpack/bin/webpack.js"
  }
}
```

- build:debug 调试 webpack 脚本，注意不能像 build 脚本中指定缩写了，此处需要指定要调试的具体 js 文件

此时我们只需执行：

```bash
# 启动debug
$ npm run build:debug
```

然后按照上面我们介绍的两种的方式之一，即可进行调试：

![VS Code debug webpack](/img/posts/node/vscode_debug_npm_webpack.png)
