---
title: 'Ionic 2环境搭建'
date: 2016-02-14 19:23:45
tag: ionic2
---
[NodeJS]: https://nodejs.org/en/
[tabs-template]: https://github.com/driftyco/ionic2-starter-tabs
Ionic伴随着Angular的脚步，一直在成长，随着Angular 2的出现，Ionic 2亦随之而来，虽然现在还处于测试期，但用不了多久稳定版就将到来。当然Ionic 1和Angular 1并没有被放弃，现在及以后依然会被维护和更新（只要用户数量可观），当然我想他们被取代只是时间问题。Ionic 2和Angular 2作出了极大的突破与改变，更加适用于手机开发，更加与时俱进。本文介绍Ionic 2环境搭建。

# 一.安装Ionic CLI和cordova
使用过Ionic 1的开发者应该都对Ionic CLI印象深刻，其强大快捷，节省了开发者的时间与精力，而随着Ionic 2的出现，Ionic CLI变得更加方便。安装过程和Ionic 1相差无几：

~~~ bash
$ npm install -g ionic@beta
~~~

当然，需要首先安装了[NodeJS][NodeJS]，至于安装过程不在此赘述。

> **说明:**<br>
> 1.不需要担心安装过后Ionic 1的工程不能使用Ionic CLI，此版完全兼容Ionic 1和Ionic 2。<br>
> 2.-g参数表示全局安装，为保证不会出错，Windows用户使用管理员权限打开命令提示符；*unix在命令前加上sudo，下同，不同版本Linux终端获取管理员权限可能不同，请自行查阅。

当然，如果进行手机App开发，自然还需要安装Cordova：

~~~ bash
$ npm install -g cordova
~~~

## 测试安装是否成功

~~~ bash
$ ionic -v
~~~

~~~ bash
$ cordova -v
~~~

如果安装成功，上述命令均会出现对应的版本号。

## 可能出现的问题

### 路径问题

如果出现`npm`、`ionic`或`cordova`命令不识别的情况，请首先检查它们各自的安装路径是否已经被添加到环境变量里面，至于如何添加环境变量，不在此赘述。

### 网络问题

国内由于墙的原因，通过npm安装不成功很正常，请自备梯子，或按下面的方式使用淘宝镜像（cnpm）：

安装淘宝npm镜像：

~~~ bash
 npm install -g cnpm --registry=https://registry.npm.taobao.org
~~~

使用npm安装的JS库或是其他文件都可以使用cnpm代替了，如安装ionic和cordova：

~~~ bash
$ cnpm install -g cordova ionic@beta
~~~

# 二.创建工程
Ionic 2创建工程与Ionic 1极其相似：

~~~ bash
$ ionic start myapp [template] --v2
~~~

可以看到，唯一的区别在于`--v2`参数上，其代表使用Ionic 2创建工程。

因为ES6的模块化的特性，使用`TypeScript`编程更加适合开发，各种编辑器对其支持也更好，所以推荐使用`TypeScript`：

~~~ bash
$ ionic start myapp [template] --v2 --ts
~~~

注意`--ts`参数，其表示使用`TypeScript`模板工程,如果使用`TypeScript`进行开发Ionic 2应用，则使用其他Ionic 2提供的命令时，也需要加入此参数，如创建页面的命令：

~~~ bash
$ ionic g page home --ts
~~~

`[template]`表示从什么模板创建工程，可以使用如下命令查看支持的模板：

~~~
$ ionic start --list
~~~

若`[template]`为空，则默认使用[tabs模板工程][tabs-template]。

> 参考文档：<br>
> [Ionic 1环境搭建]({% post_url 2014-11-06-ionic-installation %})<br>
> [Ionic 2官方文档之CLI][ionic2-cli-doc]<br>

[ionic2-cli-doc]: http://ionicframework.com/docs/v2/cli/