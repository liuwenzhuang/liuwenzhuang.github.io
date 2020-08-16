---
title: git同时推送至多个remotes
date: 2016-09-12 10:43:00
tag: ['git']
excerpt: 一般来说，我们的工程只关联一个远程仓库地址，如我们在公司平时的开发中，一般来说都是将代码推送到公司内部的代码仓库中（如GitLab中)。但是如果我们自己的一些工具工程，即想要提供给公司内部使用（GitLab），又想要推送到GitHub上服务大众，本文介绍如何在只用一个远程的前提下推送至多个remotes。
---

一般来说，我们的工程只关联一个远程仓库地址，如我们在公司平时的开发中，一般来说都是将代码推送到公司内部的代码仓库中（如GitLab中)。但是如果我们自己的一些工具工程，即想要提供给公司内部使用（GitLab），又想要推送到GitHub上服务大众，我们就需要同时推送至多个远程仓库了：

```bash
$ git remote set-url --add --push origin [REPOSITORY URL 01]
$ git remote set-url --add --push origin [REPOSITORY URL 02]
```

- [REPOSITORY URL 01]和[REPOSITORY URL 02] 表示不同的远程仓库地址。

这样在执行`git push`时，会向此两个remote分别推送。
