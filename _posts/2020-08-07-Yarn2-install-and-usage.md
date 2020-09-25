---
title: Yarn 2的安装与使用
date: 2020-08-07 10:23:12
tag: ["tools"]
excerpt: Yarn 2在尽可能保留1.x的使用方式和功能的同时，还提出和实现/重构了很多新的功能。目前很多主流的工具也在进行兼容性地工作，全面进入Yarn 2的时代已经不远了。
---

Yarn 在前端开发者中必然不陌生，目前来说大部分使用的都是 Yarn 1.x 的版本，其实 Yarn 1.x 很多时候定位有些尴尬，在设计上还是从 npm 上借鉴了很多，甚至在大多开发者眼中只是将`package-lock.json`换成了`yarn.lock`而已（`yarn workspaces`是较大的不同），虽然号称在速度上有优势，但 npm 所具有的缺点 Yarn 1.x 还是不可避免地会存在。

所以促使了 Yarn 2 地出现，在尽可能保留 1.x 的使用方式和功能的同时，还提出和实现/重构了很多新的功能，目前 1.x 已经不再进行版本更新了，并且 1.x 的文档也已经转移到https://classic.yarnpkg.com/。本文不会详细介绍Yarn 2 引入了哪些新的功能，仅从安装、使用以及现在的开发模式的角度了解 Yarn 2，具体新功能可以到[Changelog](https://github.com/yarnpkg/berry/blob/master/CHANGELOG.md)或[Features](https://yarnpkg.com/features/pnp/)中查看。

## 安装 Yarn 2

在维护多个项目时经常遇到 npm 版本不统一的情况，所以我们经常需要在同一台机器上安装多个`Node.js`，所以[nvm](https://github.com/nvm-sh/nvm)和[nvm-windows](https://github.com/coreybutler/nvm-windows)出现了，但作为开发者仍要记得在不同项目间切换版本。而**Yarn 2 认为自己本身就应该是项目的依赖**，甚至版本也应该被锁定（当然可以升级），所以 Yarn 2 会将自己维护到项目中，目前仍需要借助`yarn 1`完成安装：

```bash
npm install -g yarn # 全局安装yarn 1
yarn --version # A
```

虽然看起来有些怪异，但也能理解，毕竟一个如此普及的工具不可能不考虑兼容性和迁移难度就进行完全的覆盖，Yarn 2 的出现也要保证原有 Yarn 1 的正常使用。

### 工程中升级为 Yarn 2

前面说到 Yarn 2 是把自己作为项目的一个普通依赖看待的，所以升级 Yarn 2 也是针对项目而言的：

```bash
cd /path/to/project
# 上面A行得到的版本如果是1.22+
yarn set version berry # B1

# 上面A行得到的版本如果低于1.22
yarn policies set-version berry # B2
```

执行完 B1 或 B2 行之后，工程根目录下会新增一个`.yarn`目录及一个`.yarnrc.yml`的配置文件：

- `.yarn`目录：存放 Yarn 2 的具体执行文件、由 Yarn 2 安装的依赖等
- `.yarnrc.yml`配置文件：此工程针对 Yarn 2 的具体配置文件，和`.npmrc`、`.yarnrc`功能类似，这里要注意**Yarn 2 不会再读取`.npmrc`、`.yarnrc`中的配置，同时文件扩展也必须是 yml，`.yarnrc`不能生效**

```bash
# .yarn目录初始结构
.yarn
├── releases
│   └── yarn-berry.js
```

```yml
# .yarnrc.yml初始结构
yarnPath: ".yarn/releases/yarn-berry.js"
```

> `.yarn`和`.yarnrc.yml`都应该提交到仓库。

### 升级 Yarn 2 版本

由于 Yarn 2 目前仍在快速迭代中，为了修复问题或者想要体验新功能时，升级 Yarn 2 的版本也是个常规操作，所幸升级 Yarn 2 版本也很容易，而且提供了多种方式：

```bash
# 升级至最新的发布版本 - 大众
yarn set version latest

# 从master分支升级版本 - 尝鲜
yarn set version from sources

# 从其他分支升级版本 - 需要解决特定需求
yarn set version from sources --branch 1211
```

上面是从[Yarn 2 仓库](https://github.com/yarnpkg/berry)中直接更新到你的工程中，升级完成后一般需要通过`yarn`或`yarn install`更新依赖。

按照上面的步骤安装/更新 Yarn 2 后，在当前工程下应该就能够正常运行 Yarn 2 了，可以通过`yarn --version`来确认当前是否是 2.x 版本。

## 使用 Yarn 2 管理依赖

Yarn 2 一些常见的使用方式和 Yarn 1 没什么区别，比如：

```bash
# 安装依赖
yarn
yarn install

# 添加依赖
yarn add [package] [--dev|--peer]

# 删除依赖
yarn remove [package]
```

当然也有新增/替换的一些命令：如`yarn up`用于更新依赖（Yarn 1.x 中的`yarn upgrade`）、`yarn dlx`用于临时执行依赖（和`npx`类似），具体可查看[CLI 文档](https://yarnpkg.com/cli/)。

这里我们重点关注一下依赖的安装，如果我们现在在工程中进行依赖安装可能会傻眼：

- 多了个`.pnp.js`的文件
- `.yarn`目录下多了很多文件
- `node_modules`目录被清空了
- 工程可能也跑不起来了

### `.pnp.js`和`.yarn`目录新增文件意义

这就不得不提到 Yarn 2 的默认使用的是`pnp`的方式安装依赖，和传统的`node_modules`方式管理依赖相比最重要的不同是所有依赖是以 zip 包的方式存在，默认存放在`.yarn/cache`目录下。而以 zip 包的方式管理依赖就会有个致命的问题：我们的代码识别不了，更别提找到对应的依赖文件了，所以 Yarn 2 为我们生成了`.pnp.js`文件解决这个问题。至于采用这种方式的优点这里简单列举一下，有兴趣的可以看下[官方解释](https://yarnpkg.com/features/pnp)，

Yarn 2 认为工程依赖的锁定不仅仅只依靠`yarn.lock`达到，而应该将依赖也提交到仓库，所以`.yarn`目录都应该被提交到仓库。而这在传统的`node_modules`方式下是不可行的，不仅是因为更新后产生的变更数量，更因为一个稍微大些的工程`node_moduels`的文件数量和体积都很容易达到 Git 无法处理的地步。而因为 Yarn 2 使用 zip 包的方式管理依赖，大大减少了文件数量和文件体积，故而使得工程的依赖能够进行版本管理，进而能够完美地实现**依赖锁定**。

在目前的工程协作开发中，协作者拉取代码后，第一步就要进行依赖的安装工作，但 Yarn 2 改变了这个境况，既然工程依赖都被提交到仓库中了，协作者拉取代码后甚至都不再需要执行依赖安装的步骤，因为依赖已经在那里了，这就是 Yarn 2 提出的[**零安装 zero-install**](https://yarnpkg.com/features/zero-installs)。这也顺带解决了诸如*服务器网络限制不能下载依赖*、*新分支升级依赖老分支不能正常运行*等问题。

### 工程跑不起来的解决方案

那是不是有了`.pnp.js`我们的工程就能完全正常了呢？很遗憾也没这么简单：目前很多工具还没有实现`Plug'n'Play`规范，所以目前很可能你的工程目前仍然跑不起来，那是不是就意味着我们不能用 Yarn 2 了呢？当然不是，Yarn 2 提供了两种安装依赖的方式：`pnp`（默认）和`node-modules`（没有写错，**不是 node_modules**），配置方式：

```yml
# .yarnrc.yml
yarnPath: ".yarn/releases/yarn-berry.js"

# 如果工程跑不起来可以先尝试增加下面的配置：
nodeLinker: "pnp"
pnpMode: "loose"

# 如果仍然跑不起来，可以用下面的配置完全按照以前的依赖按照方式
nodeLinker: "node-modules"
```

> `nodeLinker`如果是"pnp"的话（默认情况），`pnpMode`默认为"strict"，这种情况下所有用到的依赖都必须显式地声明在`package.json`中，也就是说如果你的模块声明了 webpack 作为依赖，webpack 中声明了 acorn 作为依赖，在"strict"模式下你的模块不能直接引入 acron，否则会报错。而"loose"模式下是允许的，但却不是推荐用法。

> `nodeLinker`设置为"node-modules"就和 Yarn 1 和 npm 的方式安装依赖没什么区别了，所有依赖仍然存在于`node_moduels`目录下，这些情况下也不会生成`.pnp.js`文件，因为不需要从 zip 包中解析依赖了。

> 有部分有名的前端工具支持了，具体可查看[支持列表](https://yarnpkg.com/features/pnp#native-support)，随着时间推移相信会有越来越多地支持。

## Yarn 2 配置

Yarn 2 配置可以通过`yarn config` CLI 完成，也可以通过直接编辑`.yarnrc.yml`文件完成，有些配置和 Yarn 1.x 的配置差异挺大，全部的配置可查阅[官方配置文档](https://yarnpkg.com/configuration/yarnrc)，这里以私有域的配置做一下示例：

```bash
# 使用yarn config
yarn config set --json npmScopes '{"lwz": {"npmRegistryServer": "http://npm.lwz.com"}}'
yarn config set --json unsafeHttpWhitelist '["*.lwz.com", "lwz.com"]'
```

> 使用`--json`允许复杂的配置，否则只能配置 string、number 和 boolean 类型的配置项

> 当私有域名不是 https 时，需要增加`unsafeHttpWhitelist`配置添加私有域名，可以使用通配符

对应在`.yarnrc.yml`中：

```bash
# .yarnrc.yml
npmScopes:
  lwz:
    npmRegistryServer: "http://npm.lwz.com"

unsafeHttpWhitelist:
  - "*.lwz.com"
  - "lwz.com"
```

> 复杂的配置推荐在`.yarnrc.yml`中直接编辑，使用`yarn config set`设置已存在的配置是一个覆盖的过程，所以如果想要保留之前的配置，还需要在配置时将之前的配置带上。

## 总结

本文仅站在使用者的角度说明如何使用 Yarn 2，对其新特性、优势等方面并未深入讲解，这些方面留待日后讲解，如果想要深入了解可到[官方文档](https://yarnpkg.com/)查阅。

- [CHANGELOG](https://github.com/yarnpkg/berry/blob/master/CHANGELOG.md)
- [Features](https://yarnpkg.com/features)
- [配置](https://yarnpkg.com/configuration/yarnrc)
