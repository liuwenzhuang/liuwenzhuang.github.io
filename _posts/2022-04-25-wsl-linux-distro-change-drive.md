---
title: 改变 wsl2 下的 Linux 子系统安装位置
date: 2022-04-25 20:23:12
tag: ["Tools"]
excerpt: wsl 的 Linux 子系统使得在 Windows 下的开发体验得到了极大的优化，但重度使用对 C 盘空间是个不小的挑战，所以当 C 盘空间不足的开发者来说最好将其虚拟磁盘(VHD)转移到非系统盘上。
---

wsl 的 Linux 子系统使得在 Windows 下的开发体验得到了极大的优化，但重度使用对 C 盘空间是个不小的挑战，所以当 C 盘空间不足的开发者来说最好将其虚拟磁盘(VHD)转移到非系统盘上。本文涉及到的操作步骤均在 PowerShell 或 CMD 中执行，且所有的路径均可根据自己的需要修改。

1. 关闭 wsl 服务，能够避免一些资源占用的问题：

   ```bash
   > wsl --shutdown
   ```

2. 找到要转移子系统的名称，即输出的 NAME 列：

   ```bash
   > wsl -l -v

     NAME      STATE           VERSION
   * Ubuntu    Running         2
   ```

   下面所有命令中的 Ubuntu 即此处 NAME 列指示的名字。

3. 将子系统导出为 tar 包

   ```bash
   # 下面命令中的 Ubuntu 要换成上一步中的 NAME 列，下同
   > wsl --export Ubuntu D:\Temp\Ubuntu.tar
   ```

   此命令会在 D:\Temp 目录下生成 Ubuntu.tar 文件，感兴趣的可以使用 7-zip 或其他解压工具/命令打开看一下，里面是一个标准的 Linux 文件系统。

4. 注销当前子系统并删除跟文件系统

   ```bash
   > wsl --unregister Ubuntu
   ```

5. 从 Ubuntu.tar 中导出文件系统到非系统盘

   ```bash
   > wsl --import Ubuntu D:\Program\wsl\Ubuntu D:\Temp\Ubuntu.tar --version 2
   ```

   此操作执行时间会稍微有些长，需耐心等待。结束后会在 D:\Program\wsl\Ubuntu 目录下生成 ext4.vhdx 文件，此时可将 D:\Temp\Ubuntu.tar 文件删除。

6. 切换默认账号（不一定需要）

   ```bash
   > ubuntu.exe config --default-user [USER_NAME]
   ```

   我在转移之后，打开 Ubuntu 子系统发现默认账户变成了 root，不是我之前的账号了，故需要使用此命令重新设置一下，如果没有这种情形，可不必执行此操作。
