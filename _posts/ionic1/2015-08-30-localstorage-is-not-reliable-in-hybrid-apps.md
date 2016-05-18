---
title: "localStorage在混合应用中是不可靠的"
date: 2015-08-30 22:30:02
tag: ionic1
---
[original-doc]: http://gonehybrid.com/dont-assume-localstorage-will-always-work-in-your-hybrid-app/
注：本文乃翻译而来，如有错误之处，请大家多多指正，大家也可挪步[原文][original-doc]。

在Cordova/PhoneGap app中有多种本地存储数据的方式，而最常用的无疑是localStorage，localStorage提供了一种存储键值对数据的方案：

~~~ javascript
// simple example
localStorage.setItem('name', 'Pinky');  
var name = localStorage.getItem('name');  
console.log(name);

// complex example
var records = [{ name: 'Pinky', age: 1 }, { name: 'Brain', age: 2 }];  
localStorage.setItem('records', JSON.stringify(records));  
var output = JSON.parse(localStorage.getItem('records'));  
console.table(output);
~~~

虽然localStorage比Cookie的存储能力要强大许多，不过在Cordova/PhoneGap app中使用localStorage时，也就最多拥有5MB的空间。

大多数情况即使你关闭了app或重启了手机，使用localStorage存储的数据能够继续存在，但是Android和IOS设备对于localStorage的处理上可能会导致问题：

## IOS

IOS 8，当系统内存不足时，localStorage可能会被清除，就像ionic论坛里[这篇帖子](http://forum.ionicframework.com/t/ios-localstorage-persistence/20004/11)说的情况。

## Android

同样是在ionic论坛中，很多用户遇到localStorage被清除的情形，就像[这篇帖子](http://forum.ionicframework.com/t/localstorage-is-it-cleared-after-app-restarts-periodically-in-ios/21819/9)。

所以，难道不能使用强大简便的localStorage了吗？
当然不能不用，但是要使用得当：应该使用localStorage存储那些不需要永久保存的数据。一个很好的使用localStorage的场景是使用localStorage存储那些从外部获得的数据，如你的服务器，即使localStorage被清除，也可以通过请求外部数据再次获得。

## 替代方案

在hybrid app中，如果需要兼顾体验感和持久化存储，那么可以使用SQLite数据库。一种方案是使用PouchDB，一个开源的JavaScript框架，PouchDB封装了WebSQL, IndexedDB和SQLite。如果想了解如何使用PouchDB，可以查看我的另一篇[译文]({% post_url 2015-11-03-ionic-PouchDB-SQLite %})。另一种解决方案是使用LokiJS，LokiJS是一个快速的内存数据库，如果想了解如何使用LokiJS，可以查看我的另一篇译文[ionic App使用LokiJS作为本地存储]({% post_url 2015-09-11-ionic-LokiJS %})。