---
title: 重置 wsl2 中的 Linux 子系统的账户密码
date: 2021-10-20 08:23:12
tag: ["Tools"]
excerpt: 最近公司不让使用 Docker Desktop 软件了，只能在 wsl2 中的 Linux 子系统里安装使用 Docker，但是却发现自己忘记了账户的密码了。
---

重置密码的操作也很简单，经过查询资料，可将步骤大致分为 3 步：

1. 将 Linux 子系统的默认账户改为 root
2. 利用 root 账户重置 Linux 子系统账户的密码
3. 将 Linux 子系统的默认账户修改回之前的账户

很简单吧，大部分的博文都是这样搞的，但是在我这却第一步都没走通，遇到的问题和解决方法在后面会提及。

## 默认账户改为 root

首先查看自己当前安装了哪些 Linux 子系统，找到忘记了密码的子系统，使用管理员身份打开 cmd 执行（下同）：

```bash
> wsl -l
适用于 Linux 的 Windows 子系统分发版:
Debian (默认)
Ubuntu
```

下面就以 Debian 为例说明如何将默认账户修改为 root：

```bash
> debian config --default-user root
```

这一步我就出现了问题：

> *The system cannot find the file C:\Users\[USERNAME]\AppData\Local\Microsoft\WindowsApps\debian.exe.*

但是我执行 `where debian` 得到的结果确是是上面那个路径，我又用 unbuntu 试了一下也是不行，让我很是不能理解，于是我打进敌人内部，到达那个路径下，发现 *debian.exe* 文件和 *ubuntu.exe* 文件确实都是存在的，但它们的文件大小都是 0：

![wsl-linux-subsystem-exe-not-work.png](/img/posts/tools/wsl-linux-subsystem-exe-not-work.png)

但是我的 wsl2 中的 Linux 子系统确实也没问题，于是想到它不是我的菜，于是我使用 Everything 搜索了一下 “debian.exe”，发现了另一个结果，路径类似于：

> C:\Program Files\WindowsApps\TheDebianProject.DebianGNULinux_1.11.1.0_x64__[HASH]\debian.exe

所以它才是执行命令的主体，于是我在 cmd 中定位到此路径下，再次执行上面的命令后结果正常：

```bash
> cd C:\Program Files\WindowsApps\TheDebianProject.DebianGNULinux_1.11.1.0_x64__[HASH]
> debian config --default-user root
```

此时打开 Debian 子系统，可以发现账户变成了 root。

## 变更普通账户密码

这一步是 Linux 中基础的密码重置操作，注意需要在 Debian 子系统中操作，除此之外没什么幺蛾子：

![wsl-linux-subsystem-reset-passwd.png](/img/posts/tools/wsl-linux-subsystem-reset-passwd.png)

## 将默认账户从 root 修改为普通账户

最后一步也很简单，相当于重复第一步，也是在 cmd 中执行，只不过将账户名改一下即可：

```bash
# 还是在切换到之前那个文件夹
> cd C:\Program Files\WindowsApps\TheDebianProject.DebianGNULinux_1.11.1.0_x64__[HASH]
# 将 lwz 换成自己的账户名
> debian config --default-user lwz
```

到此就大功告成了。

## 其他注意事项

除了第一步可能出现的问题之外，可能还会遇到多个版本的问题，如多个 Ubuntu 版本，如 18.04、20.04版本等，在 cmd 中切换默认账户时，不能使用 *ubuntu.exe* 命令，而是要使用 *ubuntu1804.exe* 和 *ubuntu2004.exe* 等：

```bash
> ubuntu1804 config –default-user root
> ubuntu2004 config –default-user root
```

## 参考

- https://itsfoss.com/reset-linux-password-wsl/

