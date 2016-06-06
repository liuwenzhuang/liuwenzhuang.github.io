---
title: 'ionic环境搭建, ionic、cordova和Ionic CLI的基本使用方法'
date: 2014-11-06 22:30
tag: ionic1
keywords: Cordova, Ionic CLI, Ionic环境搭建, Ionic 1创建工程, 混合移动App开发框架, 前端开发, AngularJS, 使用Ionic和Angular等前端技术开发手机App, Android开发, iOS开发, 微信开发
excerpt: 环境搭建是开发的第一步，像Hello World之于C语言，环境搭建完成后总是要实验一下环境是否工作正常。本文讲述使用Ionic 1开发的第一步，即配置开发环境和测试开发环境，包括cordova、ionic的安装，安装过程中可能出现的问题。还简单介绍了一下Ionic CLI的使用方法和使用过程。
---
本文讲述使用ionic开发应用的第一步：安装与创建工程，ionic提供了非常强大的CLI命令帮助我们更快更好地创建工程、修改工程、测试工程。

## 一.安装Ionic CLI和cordova

安装CLI最简单的方法是通过npm安装（别问我npm怎么安装）：

~~~ bash
$ npm install -g cordova ionic
~~~

注意：-g参数表示全局安装，为保证不会出错，Windows用户使用管理员权限打开命令提示符；*unix在命令前加上sudo，下同，不同版本Linux终端获取管理员权限可能不同，请自行查阅。

### 1.测试安装是否成功

~~~ bash
$ ionic -v
~~~

~~~ bash
cordova -v
~~~

如果安装成功，上述命令均会出现对应的版本号。

### 2.可能出现的问题

国内由于墙的原因，通过npm安装不成功很正常，请自备梯子，或按下面的方式使用淘宝镜像（cnpm）：

安装淘宝npm镜像：

~~~ bash
 npm install -g cnpm --registry=https://registry.npm.taobao.org
~~~

使用npm安装的JS库或是其他文件都可以使用cnpm代替了，如安装ionic和cordova：

~~~ bash
$ cnpm install -g cordova ionic
~~~

## 二.使用Ionic CLI创建工程

ionic拥有十分强大的命令行接口，最简单的创建工程的方式：

~~~ bash
$ ionic start myapp [template]
~~~

[template]表示初始模板，初始模板可以从ionic预定义的模板中来，也可以通过Github仓库、Codepen、甚至本地目录中来。初始模板会变成cordova工程目录下的www文件夹（ionic封装了cordova的一些操作，创建工程的操作其实是通过cordova完成的）:

### 1.ionic预定义模板

 - tabs
 - sidemenu
 - blank

### 2.Github仓库

 - 任何Github仓库的地址，如：https://github.com/driftyco/ionic-starter-tabs
 - ionic预定义模板只是其对应Github仓库地址的别名

### 3.Codepen地址

 - 任何Codepen地址，如http://codepen.io/ionic/pen/odqCz

### 4.本地文件夹

 - 本地文件夹的相对路径或绝对路径

### 5.创建工程命令行参数

~~~ bash
--appname, -a  .......  app名称（使用引号包围）
--id, -i  ............  包名，如com.mycompany.myapp
--no-cordova, -w  ....  不要以cordova的方式创建工程
~~~

> 参考文档：<br>
> [Ionic 2环境搭建]({% post_url 2016-02-14-ionic2-installation %})<br>
> [Ionic官方文档之CLI][ionic-cli-doc]<br>

[ionic-cli-doc]: http://ionicframework.com/docs/cli/