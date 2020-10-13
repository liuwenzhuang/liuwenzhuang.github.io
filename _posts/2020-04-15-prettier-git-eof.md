---
title: Windows下前端开发使用prettier保证以LF结尾
date: 2020-04-15 10:23:12
tag: ["tools"]
excerpt: 协作开发时，Windows用户要特别注意文件行尾格式的问题，本文介绍如何通过prettier保证以LF结尾。。
---

[lint-staged]: https://github.com/okonet/lint-staged

在Windows下开发时有点比较烦：文件行尾默认是以CRLF格式，也就是回车换行，区别于macOS和Linux常用的LF格式，所以在和使用其他系统的开发人员协作开发时就需要特别注意，所以一般我们需要对Git进行配置：

```bash
git config --global core.autocrlf true
```

上面是从全局告知Git，如果我们工作区的文件是CRLF格式的，在推送到远程时会进行一次转换将其变为LF格式；当我们拉取远程文件时，会再将LF格式的文件转换为CRLF格式的。这样做既能保证其他系统的协作人员的文件格式是正确的，又可以保证Windows下以CRLF格式显示文件。

看起来是很完美地解决方案，但已经2020年了，所有的现代编辑器都能处理LF或CRLF的文件了，这样做还有必要吗？在前端开发中`prettier`可谓是一个必不可少的工具，其统一化的代码格式化能力使得团队在代码格式上更加统一化，在其v2.0.0中其文件行尾的默认合法值设为了`lf`。

也就是说如果你的工程中使用了`prettier@^2.0.0`，如果仍按照之前Git的配置方式进行开发，`prettier`会提示有问题的。当前很多人查到了解决方案：在配置文件中修改配置：

```rc
// .prettierrc
{
  "endOfLine": "auto"
}
```

这也是prettier在v2.0.0之前的默认配置，完全忽略了prettier的用意：**开发中文本行尾不同的历史该被抛弃了**。

## 使用prettier保证Windows下文件的LF格式

使用`prettier`保证文件以LF格式的方式也很简单：

1. 在配置中将`endOfLine`设置为`lf`，v2.0.0之后不用特意设置

2. 使用`npx prettier --check .`检查当前有哪些文件不符合规范，并修复

3. 在工程根目录下增加`.gitattributes`文件，在其中增加`* text=auto eol=lf`一行，这能保证Windows协作者在拉取时文件不会被转成CRLF格式，但需要Windows协作者重新clone一下工程，因为他当前工作区是被经过CRLF转换过的文件。

> 如果本身是在Windows下操作，添加完`.gitattributes`推送到远程后，可以在新文件夹内重新clone一下工程。并设置编辑器新建文件的默认行尾为`\n`或`LF`，不同编辑器可能叫法不同，但两者含义相同，这样能保证新建文件不会引入CRLF

> prettier原文针对endOfLine配置的说明可查看[官方文档](https://prettier.io/docs/en/options.html#end-of-line)

## 使用lint-staged保证提交经过prettier处理

上面的步骤能够尽量保证不会出现CRLF文件，但不能保证不会出现，此时可以使用[lint-staged][lint-staged]在提交前避免这个问题：

```bash
npx mrm lint-staged
```

上面的命令会安装[husky](https://github.com/typicode/husky)和[lint-staged][lint-staged]，并在`package.json`中添加如下配置：

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,css,md}": "prettier --write"
  }
}
```

默认配置只针对`js`、`css`和`md`格式的文件，如果想要增加其他类型的文件，往后面加就好。这样在提交前会对暂存区的文件进行`prettier`处理。

> 还有其他pre-commit的手段，可以查看[prettier文档](https://prettier.io/docs/en/precommit.html)

## CI/CD配置

如果是类似GitLab的环境下，还可以通过配置流水线(pipeline)或作业(job)在每次提交时进行prettier校验。

以GitLab为例，在工程根目录下增加`.gitlab-ci.yml`文件，写入以下内容：

```yaml
image: node:14.7.0-alpine3.12

check:
  script: npx prettier --check . --config ./.prettierrc
```

将这个文件添加并推送到GitLab，本次和以后的每次推送都能在`CI/CD`里面看到相应的job或pipeline的执行情况。
