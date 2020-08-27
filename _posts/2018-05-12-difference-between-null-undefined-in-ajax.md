---
title: null、undefined在ajax请求时的区别
date: 2018-05-12 11:23:45
tag: ["JavaScript"]
excerpt: 本文介绍 null 和 undefined 两者在 ajax 请求中有什么区别，以及在接口交互时遇到可选参数时应该如何选择。
---

目前的前后端的数据交互大多都使用 ajax 利用 JSON 进行数据交换，在前端调用接口时遇到某些参数不需要传的情况时（接口将这些参数设置为可选的）我们应该将其设置为`undefined`还是`null`呢？它们两者在 ajax 请求中有什么区别呢？

一般我们的 HTTP 请求是按请求方法来区分的，如`POST`、`GET`、`PUT`等，完整的请求方法列表可[查看 MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)。按照是否能够携带请求体对其进一步区分，我们先了解一下它们之间的不同：

## 具有请求体的请求

所谓具有请求体的请求，是指诸如`POST`、`PUT`、`PATCH`等能够在请求体中包含数据的请求：

```javascript
// xhr例
const xhr = new XMLHttpRequest();
xhr.open("POST", "/server", false);
// 其他设置
const data = JSON.stringify({ a: 1 });
xhr.send(data); // A

// axios例
const data = { a: 1 };
axios.post("/server", { data: data }); // B
```

上面的行`A`和行`B`就是发送携带有请求体的请求。

> 虽然`DELETE`方法也可以携带请求体，但是一般来说不推荐这么做，没什么意义而且还可能会出现某些实现直接拒绝请求的情况，本文将其归于`无请求体的请求`的类别中。

## 无请求体的请求

无请求体的请求，也就是除去上文提到的那几种之外的请求，如`GET`、`HEAD`、`OPTIONS`等请求：

```javascript
// xhr例
const xhr = new XMLHttpRequest();
xhr.open("GET", "/server", false);
// 其他设置
xhr.send(); // A

// axios例
axios.get("/server"); // B
```

可以看到此处 A、B 两行和上面的`POST`请求有明显区别：发送请求时没有携带请求体，此时如果需要向服务端传递数据，一般来说是将数据置于 url 的查询字符串部分，如`/server?key=value`。

## 为什么要使用 JSON.stringify 处理请求体数据

可能很多人会有疑惑：为什么向服务端发送请求体时需要进行`JSON.stringify`的操作？（使用`axios`不需要的原因是其内部为我们进行了[这步操作](https://github.com/axios/axios/blob/master/lib/defaults.js)。）

对于前后端之间的 HTTP 请求来说，请求体和响应体其实是以字符串的形式在进行数据交换，因为这样能保证双方都能够识别，否则 Java 可识别不了你的 Javascript 对象。但是这个字符串也需要满足一定的规范，即必须能够处理成 JSON：前端发送请求时使用`JSON.stringify`将 Javascript 对象处理成字符串，接收到响应时使用`JSON.parse`做反向操作。

## null vs undefined

说了半天终于到了主题，其实在前端的开发中它们也是容易被混淆的，一般来说遵循下面这个规则使用：

- undefined 表示(暂时)还不存在值，一般可以用作普通数据类型的占位
- null 表示目前它就是`null`值，一般可以用作引用类型的占位

在 ajax 请求中，它们的区别就在于`null`在 JSON 中是合法的，而`undefined`是不存在于 JSON 中，在请求体中地处理中就会得到不同的结果：

```javascript
JSON.stringify({ key: null }); // '{"key": null}'
JSON.stringify({ key: undefined }); // '{}'
```

如果在 Chrome Devtools 中查看请求体时，前者能够看到`{key: null}`，而后者将是`{}`。对于服务端实现来说，兼容这两种情形一般都非常容易，所以区别不大。

> 对于交互双方来说能够相互理解是必要的，双方遵循统一的 JSON 规范就是为了达到这个目的。

但是对于无请求体的请求来说，情况稍有些不同，以`GET`请求为例，当我们将想要给服务端传递数据时一般会将其放置在 url 的查询字符串中，此时由于不会进行`JSON.stringify`的操作，故得到的结果可能不是想要的：

```javascript
const key = null;
axios.get(`/server?key=${key}`); // '/server?key=null'

const key = undefined;
axios.get(`/server?key=${key}`); // '/server?key=undefined'
```

此时它们会成为字符串 url 的一部分，对于服务端来说接收的*key*值也是以字符串进行处理的，所以可能会得到意向不到的结果，而且两者之间的差别很大，所以在处理时需特别注意。

## 总结

在有请求体的请求中，当不需要设置某些属性时，将其置为`null`或`undefined`均可，个人推荐使用`undefined`，毕竟看着干净些；但对于无请求体的请求中，如果需要在 url 中嵌入变量，一定要注意此变量是否可能为`null`或`undefined`，以防错误请求。
