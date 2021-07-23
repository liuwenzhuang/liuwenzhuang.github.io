---
title: 为什么Proxy是ES6的瑰宝？
date: 2020-09-07 10:23:12
tag: ["JavaScript"]
translate: https://medium.com/javascript-in-plain-english/why-proxies-in-javascript-are-fantastic-db100ddc10a0
excerpt: Proxy是什么？它是做什么的？
---

[原文链接]: https://medium.com/javascript-in-plain-english/why-proxies-in-javascript-are-fantastic-db100ddc10a0

> 本文是译文，[原文链接][原文链接]

Proxy 是什么？它是做什么的？在回答这些问题之前，我们先来看一个真实的例子。

我们每个人在日常生活中都有很多事情要去做，比如阅读邮件、收快递等。但是有些情况比较烦人：我们的邮箱中可能有收到一些垃圾邮件，需要我们花费时间识别出来。这就是为什么你可能想要一个忠实管家的原因了。管家可以在你读取邮件之前帮你检查邮箱，剔除那些烦人的垃圾邮件。

在上面的例子中，管家就是我们的 Proxy：当我们想要做一件事情时，Proxy 为我们额外做了一些工作。

现在我们回到 JavaScript 中来。JavaScript 是一门面向对象的程序设计语言，离开了对象我们甚至都写不了代码。但是 JavaScript 中的对象是“裸奔”的，可以对其任意施为，这会使代码变得不安全。

所以 ES6 中引入了 Proxy。通过 Proxy，我们其实是为对象找对了一个忠实的管家，还能够帮助我们增强对象的能力。

使用 Proxy 最基础的方式类似于：

```javascript
// 普通的对象
let obj = { a: 1, b: 2 };
// 使用Proxy为对象obj配置一个管家
let objProxy = new Proxy(obj, handler);
```

上面的代码仅作说明使用，因为我们还没有定义 handler，所以上面的代码还不能运行。

对于我们来说，我们可能的操作包括阅读邮件、收取快递等，我们的管家可以在其中为我们做些辅助工作。对于对象来说，可能的操作包括读取属性、设置属性等，这些操作也能够通过 Proxy 进行增强。

在 handler 中，我们可以列出想要代理的操作。例如，如果我们想要在读取对象属性时打印一句话，可以这样做：

```javascript
let obj = { a: 1, b: 2 };

let objProxy = new Proxy(obj, {
  get: function (item, property, itemProxy) {
    console.log(`You are getting the value of '${property}' property`);
    return item[property];
  },
});
```

在上例中，handler 就是：

```javascript
{
  get: function(item, property, itemProxy) {
    console.log(`You are getting the value of '${property}' property`)
    return item[property]
  }
}
```

get 函数会在我们读取**新对象 objProxy**的属性时被调用：

![proxy get](/img/posts/proxy/proxy-get.png)

`get`函数有 3 个参数：

- `item`：对象本身，即 item === obj
- `property`：读取的属性名
- `itemProxy`：创建的管家对象，即 itemProxy === objProxy

> 这里我针对函数参数的命名可能和其他教程中的命名方式不一样，我这样做只是为了贴合我上一个例子，希望对你有用。

`get`函数的返回是原对象对应属性的值。因为我们目前还不打算改变什么，我们只是返回原对象的属性值。

当然，在有需要的情况下，我们完全可以改变返回结果，例如：

```javascript
let obj = { a: 1, b: 2 };
let objProxy = new Proxy(obj, {
  get: function (item, property, itemProxy) {
    console.log(`You are getting the value of '${property}' property`);
    return item[property] * 2;
  },
});
```

下图是读取属性的结果：

![proxy get changed](/img/posts/proxy/proxy-get-changed.png)

接下来，我们将通过实际示例来说明这一技巧的实际应用。

除了拦截属性的读取，我们也能对属性设置进行拦截，例如：

```javascript
let obj = { a: 1, b: 2 };
let objProxy = new Proxy(obj, {
  set: function (item, property, value, itemProxy) {
    console.log(`You are setting '${value}' to '${property}' property`);
    item[property] = value;
  },
});
```

set 函数会在设置**新对象 objProxy**的属性时被调用：

![proxy set](/img/posts/proxy/proxy-set.png)

可以`set`函数比`get`多一个参数，那是因为我们需要一个额外的设置参数。

除了能够拦截属性的读写操作，Proxy 能够拦截针对对象的 13 种操作：

- **get(item, propKey, itemProxy)：** 拦截对象属性的读取操作，如`obj.a`、`obj['b']`等
- **set(item, propKey, value, itemProxy)：** 拦截对象属性的设置操作，如`obj.a = 1`
- **has(item, propKey)：** 拦截`propKey in objProxy`操作，返回 boolean 值
- **ownKeys(item)：** 拦截`Object.getOwnPropertyNames(proxy)`、`Object.getOwnPropertySymbols(proxy)`、`Object.keys(proxy)`、`for...in`操作，返回一个数组。这个方法返回目标对象自身的所有属性名（包括 String 类型和 Symbol 类型的属性名），而`Object.keys()`仅返回目标对象自身所有可枚举的属性名（仅包括 String 类型的属性名）
- **getOwnPropertyDescriptor(item, propKey)：** 拦截`Object.getOwnPropertyDescriptor(proxy, propKey)`操作，返回属性的描述符
- **defineProperty(item, propKey, propDesc)：** 拦截`Object.defineProperty(proxy, propKey, propDesc)`和`Object.defineProperties(proxy, propDescs)`，返回 boolean 值
- **preventExtensions(item)：** 拦截`Object.preventExtensions(proxy)`，返回 boolean 值
- **getPrototypeOf(item)：** 拦截`Object.getPrototypeOf(proxy)`，返回一个对象
- **isExtensible(item)：** 拦截`Object.isExtensible(proxy)`，返回 boolean 值
- **setPrototypeOf(item, proto)：** 拦截`Object.setPrototypeOf(proxy, proto)`，返回 boolean 值

如果目标对象是一个函数时，还有另外两种操作可以被拦截：

- **apply(item, object, args)：** 拦截函数的调用，如`proxy(...args)`、`proxy.call(object, ...args)`、`proxy.apply(object, args)`等操作
- **construct(item, args)：** 当返回的 Proxy 函数执行`new`操作时被拦截，如`new proxy(...args)`

上面的有些拦截操作不太常用，我这里就不会对其深入了。现在让我们通过现实世界的例子来看下`Proxy`到底能为我们做些什么。

## 实现数组的负值索引

一些编程语言，如 Python，支持数组的负值索引。

负值索引即数组从最后一个值开始往前定位并返回对应位置的值。例如：

- arr[-1] 是数组最后一个元素
- arr[-3] 是数组倒数第三个元素

很多开发者认为这是一个很有用的特性，但是 JavaScript 目前却不支持。

![array negative index unsupported in javascript](/img/posts/proxy/array-negative-index-unsupported.png)

但是强大的 Proxy 为我们提供了**元编程**的能力。

我们可以使用 Proxy 处理数组，返回一个代理对象。当使用者对其进行负值索引时，我们可以通过`get`方法拦截这个操作。负值索引根据上面定义的规则被转换为对应的正值索引（包括 0），然后对原数组进行取值即可得到结果。

让我们通过一个基础操作开始：拦截数组的读取操作：

```javascript
function negativeArray(array) {
  return new Proxy(array, {
    get: function (item, propKey) {
      console.log(propKey);
      return item[propKey];
    },
  });
}
```

上面的函数可以包装一个数组，现在让我们看下如何使用：

![proxy array basic read operation](/img/posts/proxy/proxy-array-basic-read.png)

如你所见，对数组的读取操作确实被拦截了。

> JavaScript 中对象的 key 值只能是 String 或 Symbol 类型的。当我们使用`arr[1]`时，实际上`arr['1']`。key 值是 String 类型的`'1'`，而不是 Number 类型的`1`。

现在我们需要的是：当用户通过数组进行负值索引取值时，我们对其进行拦截并返回相应位置的值；如果不是索引取值或者索引值为正值（包括 0）时我们什么也不需要做。

综上所述，我们可以写出如下示例代码：

```javascript
function negativeArray(array) {
  return new Proxy(array, {
    get: function(target, propKey){
      if(/** 当propKey是负值索引 */){
        // 将负值按规则转换成正值
      }
      return target[propKey]
  })
}
```

那我们如何识别出负值索引呢？这里比较容易犯错，所以我深入说明一下。

首先，Proxy 的`get`拦截函数会拦截对数组所有的取值操作，包括索引取值，也包括获取数组的其他属性。数组的索引取值操作仅当属性名能够转换为整形时才能进行。我们的目的只是拦截数组的索引取值操作。

所以我们可以通过检查属性名是否能够转换为整形数据来决定此属性是一个数组索引。

```javascript
Number(propKey) != NaN && Number.isInteger(Number(propKey));
```

补全的代码如下：

```javascript
function negativeArray(array) {
  return new Proxy(array, {
    get: function (target, propKey) {
      if (
        Number(propKey) != NaN &&
        Number.isInteger(Number(propKey)) &&
        Number(propKey) < 0
      ) {
        propKey = String(target.length + Number(propKey));
      }
      return target[propKey];
    },
  });
}
```

下面是使用示例：

![proxy array negative index](/img/posts/proxy/proxy-array-negative-index.png)

## 数据校验

众所周知，JavaScript 是一门弱类型语言，正常情况下，当一个对象被创建后，它几乎是“裸奔”的。可以对其随意更改。

但是大多数情况下，我们都需要限定对象的值是特定的类型。例如，用户信息的对象中年龄属性值一般需要限制在[0, 150]之间。

```javascript
let person1 = {
  name: "Jon",
  age: 23,
};
```

但是默认情况下 JavaScript 没有提供安全机制，对于对象的值可以随意修改：

```javascript
person1.age = 9999;
person1.age = "hello world";
```

此时我们可以使用 Proxy 保护我们的代码：拦截对属性的赋值操作，确认设置的值满足我们需要的规则：

```javascript
let ageValidate = {
  set(item, property, value) {
    if (property === "age") {
      if (!Number.isInteger(value) || value < 0 || value > 150) {
        throw new TypeError("age should be an integer between 0 and 150");
      }
    }
    item[property] = value;
  },
};
```

现在我们可以尝试对*age*属性进行赋值，此时能够看到我们的拦截校验机制是生效的：

![prox object validation](/img/posts/proxy/prox-object-validation.png)

## 关联属性

很多情况下，对象的属性是相互关联的。例如，对于一个存储用户信息的对象来说，其邮编号码属性和其地区属性是两个高度相关的属性。当用户的邮编确定了，其所在的地区也就确定了。

为了能够方便各个国家的读者的理解，这里我使用一个虚拟的例子。建设用户所在地区和邮编具有以下关系：

```javascript
JavaScript Street  --  232200
Python Street -- 234422
Golang Street -- 231142
```

使用代码描述如下：

```javascript
const location2postcode = {
  "JavaScript Street": 232200,
  "Python Street": 234422,
  "Golang Street": 231142,
};
const postcode2location = {
  232200: "JavaScript Street",
  234422: "Python Street",
  231142: "Golang Street",
};
```

然后看下面这个例子：

```javascript
let person = {
  name: "Jon",
};
person.postcode = 232200;
```

我们想要的效果是当我们执行`person.postcode = 232200`时能够自动触发`person.location='JavaScript Street'`操作。

下面是解决方案：

```javascript
let postcodeValidate = {
  set(item, property, value) {
    if ((property = "location")) {
      item.postcode = location2postcode[value];
    }
    if ((property = "postcode")) {
      item.location = postcode2location[value];
    }
  },
};
```

![proxy relate properties](/img/posts/proxy/proxy-relate-properties.png)

这样我们就将`postcode`和`location`两个属性绑定到一起了。

## 私有属性

JavaScript 中一直没有实现私有属性，这意味着我们不可能对属性进行合理的访问权限控制。

为了解决这个问题，社区中流行使用以`_`开头的属性作为私有属性。

```javascript
var obj = {
  a: 1,
  _value: 22,
};
```

`_value`属性被任务时私有属性，但要注意的是它并不真的是私有属性，只是作为一种约定俗成。在语言设计层面就压根没实现私有属性。

现在我们有了 Proxy，我们就可以模拟出私有属性了。

和普通的属性相比，私有属性具有下面的特性：

- 属性值不能读取
- 当用户试图获取对象的 key 值时，此属性不可见

通过检查上述 13 种 Proxy 的拦截操作，可以发现我们需要处理其中 3 种：

```javascript
function setPrivateField(obj, prefix = "_"){
  return new Proxy(obj, {
    // Intercept the operation of `propKey in objProxy`
    has: (obj, prop) => {},
    // Intercept the operations such as `Object.keys(proxy)`
    ownKeys: obj => {},
    //Intercepts the reading operation of object properties
    get: (obj, prop, rec) => {})
    });
}
```

然后我们向其中添加一些合适的判断处理：拒绝用户访问以`_`开头的属性：

```javascript
function setPrivateField(obj, prefix = "_") {
  return new Proxy(obj, {
    has: (obj, prop) => {
      if (typeof prop === "string" && prop.startsWith(prefix)) {
        return false;
      }
      return prop in obj;
    },
    ownKeys: (obj) => {
      return Reflect.ownKeys(obj).filter(
        (prop) => typeof prop !== "string" || !prop.startsWith(prefix)
      );
    },
    get: (obj, prop) => {
      if (typeof prop === "string" && prop.startsWith(prefix)) {
        return undefined;
      }
      return obj[prop];
    },
  });
}
```

下面是其使用示例：

![proxy private property](/img/posts/proxy/proxy-private-property.png)
