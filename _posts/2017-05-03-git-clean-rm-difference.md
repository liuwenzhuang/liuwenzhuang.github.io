---
title: git clean 和 git rm 的区别和使用场景
date: 2017-05-03 09:23:45
tag: ['git']
excerpt: git操作中clean和rm是比较容易混淆的两个操作，本文介绍它们之间的区别及使用场景。
---

git操作中`clean`和`rm`是比较容易混淆的两个操作，本文介绍它们之间的区别及使用场景。

## git clean

`git clean`操作针对的是当前仓库中未被跟踪的文件，即未通过`git add`操作过的文件。

### 常用操作方式

当我们需要剔除仓库中误添加的文件、中间过程生成的文件时，可以这样做：

```bash
# 1. git clean -n 看一下将要删除的文件是哪些
$ git clean -n ./

# 2. git clean -f 如果确定执行删除动作
$ git clean -f ./

# 2. 或使用 git clean -i 自己决定要删除的文件
$ git clean -i ./
```

上面的命令后面都跟上`./`，其实这就是当前路径的意思，但`git clean`默认情况下的查找就是从当前路径往下“递归”进行的，那为什么我们还在这里画蛇添足地带上`./`呢？实际上，这里说的“递归”是不完整的，因为它不会对未跟踪的文件夹进行处理，看下例：

```bash
.
├── tracked_file_1
├── tracked_file_2
├── untracked_file_1
├── untracked_dir_1
├── tracked_dir_1
│   ├── tracked_dir_10
│   ├── tracked_dir_11
│   ├── untracked_dir_10
│   │   ├── untracked_file_100
```

如果在当前顶层目录直接使用`git clean -n`查看将要被删除的文件，会有如下结果：

```bash
Would remove untracked_file_1
```

然后如果直接使用`git clean -f`对于*untracked_dir_1*、*untracked_dir_10*、*untracked_file_100*也是无动于衷的，这时就可以像上面那样在后面跟上路径，下面是使用`git clean -n ./`查看将要被删除的文件的结果：

```bash
Would remove untracked_file_1
Would remove untracked_dir_1/
Would remove tracked_dir_1/untracked_dir_10/
```

确认后使用`git clean -f ./`就能够将这些文件/文件夹都删除了。

> 实际上，使用`git clean -dn`和`git clean -df`也能达到一样的效果，两种方式可根据喜好选择其一。

## git rm

`git rm`针对的一定是被跟踪的文件，它对未被跟踪的文件束手无策，这是与`git clean`的本质区别。使用`git rm`可以将文件从暂存区及版本库中删除。

### 常用场景

1.如果误将未被跟踪的文件添加到暂存区，想要撤销此动作：

```bash
# 如果想要保留文件，仅是从暂存区删除
$ git rm --cached mistake_tracked_file

# 如果想要从暂存区删除，同时删除文件
$ git rm -f mistake_tracked_file
```

***

2.如果想要删除已存在版本库的文件：

```bash
$ git rm -f useless_file
```

这种情况下是能够直接进行`git commit`操作的，其实相当于使用了`rm`命令删除文件后，再执行了一次`git add`操作。

## 总结

可以看到`git clean`操作其实更像纯粹的`rm`命令，但能够方便地删除**未跟踪文件**。而`git rm`操作更像是`rm + git add`的合集，但其操作的对象是**已跟踪文件**。
