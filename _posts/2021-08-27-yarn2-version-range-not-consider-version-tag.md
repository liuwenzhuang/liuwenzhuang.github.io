---
title: Yarn2+ 在确定版本范围时不会参考版本上的标签
date: 2021-08-27 07:23:12
tag: ["Tools"]
excerpt: 最近使用 Yarn2+，配合 workspacs 的功能，体验非常好，但发现了 Yarn2+ 在安装依赖时进行版本确定时的逻辑和 npm 不一样。
---

## 问题描述

事情的起因是我在安装 `antlr4-c3@^1.1.16`（依赖 `antlr4ts@^0.5.0-alpha.3`） 时得到的 antlr4ts 的版本为：

```bash
antlr4ts@0.5.0-dev
```

在 npm 上可以看到 antlr4ts 的版本分布：

![antlr4ts-versions-with-tag.png](/img/posts/tools/antlr4ts-versions-with-tag.png)

当使用 npm 安装 `antlr4-c3@1.1.16` 包时，下载它的依赖 antlr4ts 的结果是 `antlr4ts@0.5.0-alpha.4` 版本，因为 npm 在进行版本范围确定时会参考版本上的 **latest** 标签（上图中红圈），具体可查看此 [npm feedback](https://github.com/npm/feedback/discussions/109)。

但是当使用 yarn 2+ 时，得到的结果会是 `antlr4ts@0.5.0-dev` 版本，因为按照 `semver` 的规范，此版本确实符合版本范围的：

![antlr4ts-semver-satisfied.png](/img/posts/tools/antlr4ts-semver-satisfied.png)

而使用 [npm 版本计算工具](https://semver.npmjs.com/)进行版本确定工具得到的结论会不同：

![antlr4ts-version-semver-of-npm.png](/img/posts/tools/antlr4ts-version-semver-of-npm.png)

**原因是 yarn 2+ 不会像 npm 一样参考版本上的标签进行范围版本确定**。具体可参照我提的 issue 中 yarn 2+ [维护者 arcanis 的回复](https://github.com/yarnpkg/berry/issues/3345#issuecomment-906310176)。

## 方案

一般情况下，此类情况不会有什么问题，但对于 `antlr4ts` 包来说，`antlr4ts@0.5.0-dev` 版本和 `antlr4-c3` 依赖的 `antlr4ts@0.5.0-alpha.4` 版本文件结构上有差异，导致不能正常使用。

虽然在安装依赖时使用 `-E` 或 `--exact` 标志能够锁定依赖的具体版本，但不能锁定其内层依赖的版本。好在 Yarn（包括 Yarn 1.x） 也考虑到了此种情况，提供了 `resolutions` 的能力帮助我们确定具体的版本，我们需要在工程根目录下的 package.json 中增加如下配置来进行版本的确定：

```json
"resolutions": {
  "antlr4ts": "0.5.0-alpha.4"
}
```

这样我们再安装 antlr4-c3 依赖后得到的结果将是：

```bash
antlr4-c3@1.1.16
antlr4ts@0.5.0-alpha.4
```

> 关于 Yarn2+ 的更多配置，可直接到[官网](https://yarnpkg.com/configuration/manifest)查询。

## 总结

原则总有例外，但作为开发者来说例外条件其实越少越好，一些隐藏的操作经常令人措手不及，对于版本范围的确定上只使用版本号是完全足够的。
