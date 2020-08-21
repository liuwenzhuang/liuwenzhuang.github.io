---
title: '使用git bisect确定引入问题的提交'
date: 2016-08-03 09:23:45
tag: ['git']
keywords: Git调试, 'git bisect', 'git debug', 'git确定问题'
excerpt: git bisect是一个git命令，和git pull、git push等常用的命令一样。它的用途是利用二分查找算法快速确定引起问题的提交，在项目维护中有极大用处。
---

git bisect只是一个git命令，和git pull、git push等常用的命令一样。它的用途是利用二分查找算法快速确定引起问题的提交。下面以确定哪次提交引起编译错误为例介绍git bisect的基本使用方法：

## 场景

当前最新提交下出现了编译错误（如执行npm run build出现错误），但是由于多人协作开发，不知道哪次提交引入了问题。此时需要确定引入问题的提交，从而缩小代码检查范围。

## 过程

1.首先尽可能确定最近一次不会出现编译错误的提交，这里我们以当前分支倒数第100次提交为例（实际开发过程中可能不需要估计这么多，但是git bisect由于使用了二分查找可以急速缩小范围，所以估计大些也没关系），此时我们可以使用`HEAD~99`表示这次提交

2.定位到当前git工程的根目录下，执行下面的命令进入搜索流程：

```bash
$ git bisect start HEAD HEAD~99
```

上面的命令是说HEAD提交会出现编译错误，而`HEAD~99`提交没有出现编译错误。

3.此时搜索流程启动，工程会变成HEAD和`HEAD~99`的中间那次提交的状态，此时我们需要确定此次提交是好是坏，执行npm run build查看是否会出现错误：

```bash
$ npm run build
如果出现错误，执行：
$ git bisect bad
否则，执行：
$ git bisect good
```

执行git bisect bad或git bisect good的目的是告知git下次查找的方向，如果当前提交是“好”的，则向靠近最新提交的一半发起再次搜索（说明问题是它后面的提交引起的）；而如果当前提交是“坏”的，则向远离最新提交的一半发起再次搜索（说明问题可能是它之前的提交引起的，当然也能它就是引起问题的源头）。

4.重复第3步，直到git告知我们找到了引入了问题的提交：

git告知引入了问题的提交

```bash
b79b6433683b098fe641dd030cba8da4759af196 is the first bad commit
commit b79b6433683b098fe641dd030cba8da4759af196
Author: 提交者
Date:   Fri Apr 26 14:09:37 2019 +0800

    提交信息
```

5.得知引入了问题的提交后，我们就能够针对那次提交的某些相关文件进行分析处理了。

6.执行git bisect reset退出流程：

```bash
$ git bisect reset
```

## git bisect run [script] 使用脚本自动执行上述过程

可以看到上面的过程是比较繁琐的，每次都需要手动执行`npm run build`（确定当前提交是否有问题)和`git bisect good/bad`（标志当前提交是否有问题），当然如果我们测试的提交区间不大的情况下还是比较快的，但是如果我们无法缩小区间，这时可以使用脚本自动执行上面的过程，`git bisect run`命令可以接收脚本文件作为参数，在我们开始测试后自动执行指定的脚本，脚本返回0表示当前提交是没问题的（即`git bisect good`的作用），返回1~127之间表示当前提交是有问题的（即`git bisect bad`的作用）

下面我们利用这个特性自动化上面的过程：

```bash
首先还是需要启动bisect流程
$ git bisect start HEAD HEAD~99

$ git bisect run ./bisect.sh
自动执行1。。。
自动执行2。。。
。。。
自动执行结束，找到引入问题的第一个提交。。。

退出bisect流程
$ git bisect reset
```

`bisect.sh`是我们需要提供的确定当前提交是否有问题的脚本文件，例如下面的内容可以确定`npm run build`是否有问题：

```sh
#!/bin/bash
npm run build            # 必要时可以在首行定位到package.json所在文件夹
if [ $? -eq 0 ]
then
  echo "Success"
  exit 0
else
  echo "Failed!!!" >&2
  exit 1
fi
```

## 说明

1.`HEAD~n`表示当前分支最新提交之前的的第n个版本，但是不包括合并进来的提交，所以上面对HEAD和`HEAD~99`进行处理很可能多于100个提交，所以也可以使用具体的Commit Id或者tag替代上面的`HEAD~99`。

2.git bisect需要在git工程根目录下执行，但我们确定提交是“好”是“坏”的操作（如上文中的npm run build）可能不在根目录下，当二者目录不一致时，需要注意切换路径。

3.查看当前工程git根目录可以使用：

```bash
$ git rev-parse --show-toplevel
```
