---
title: 前端开发中可能会犯的错误
date: 2020-10-15 10:23:12
tag: ["JavaScript"]
excerpt: 乍看起来前端开发编码可能是最容易的，因为 JavaScript 的灵活性，使开发者觉得很容易达到自己的目标。但灵活性太高也可能造成一些问题。
---

乍看起来前端开发编码可能是最容易的，因为 JavaScript 的灵活性，使开发者觉得很容易达到自己的目标。但灵活性太高也可能造成一些问题。本文归纳一些开发者可能会出错的或者容易忽略的点。

## 痴迷于 forEach、map 等遍历方法

自从 ES5 对数组实现了 `forEach`、`map` 等遍历函数，很多开发者就将 for 循环束之高阁了，但很多时候却忽视了一点：**for 循环的速度是最快的，甚至 10 倍于 `forEach`**，在小数组上可能差异不大，但对大数组的处理上，请优先考虑一下 for 循环。

## 数组多次 splice

`Array.prototype.splice`是一个强大的功能，可以用来删除、添加元素，但是其操作是根据下标为标准的，很多开发者针对静态数组进行多次增删处理时没有注意到下标的变化：

```ts
const socials = ["wechat", "qq", "dingtalk", "wangwang"];

// 在内部环境下去掉 wechat 和 qq
socials.splice(0, 1);
socials.splice(1, 1);

console.log(socials); // ["qq", "wangwang"]
```

看起来没什么错误，但得到的结果可能确是不正确的，这是因为进行`splice`操作后没有注意到元素的下标可能发生的变化。

## 多个 Promise 嵌套

在逻辑复杂时，可能会遇到 Promise 依赖的情况，很多开发者会写出类似下面的代码：

```javascript
promise1().then((result1) => {
  promise2(result1).then((result2) => {
    // ···
  });
});
```

乍看起来没什么问题，毕竟 callback 的时代这样的代码很普遍。但是当 Promise 数量多的时候，就会陷入“死亡回调”的尴尬境地。

而 Promise 的设计本身就能避免这个问题，then 是能够链式调用的：

- 上一个 then 中的非 Promise 返回会直接作为下一个 then 的参数
- 上一个 then 中的 Promise 返回的 resolve 值会作为下一个 then 的参数：

```javascript
promise1()
  .then((result1) => {
    return promise2(result1);
  })
  .then((result2) => {
    // ···
  });
```

## 没有注意 falsy 值的范围

在使用 `if`、`||` 等语句时需要特别注意 falsy 值的范围，考虑下面的代码：

```javascript
if (userId) {
  // do something with user
}
```

但是如果 userId 为 0 的话，逻辑也不会执行，这可能不是自己想要的。这种情况下，需要了解变量的类型及可能的取值。

## 搜索时不进行 trim

前端开发中经常会遇到搜索的场景，不管是前端搜索还是后端搜索，多数的场景下都需要忽略前后的空白字符，但很多开发者直接拿到`event.target.value`进行处理，用户实际使用时可能会比较抓狂。特别是用户在页面上复制文本经常会多出一些空白字符。

## TypeScript 并不能提供运行时的保证

TypeScript 为 JavaScript 增加了静态类型定义，极大地提升了开发的体验。但很多开发者都忘记了 TypeScript 在转换为 js 文件后就消失无踪了，也就是说并不能提供运行时的保证。

举个常见的例子，定义 interface 时会在可选属性后增加 `?` 标识用来表示其不一定存在，在引用此属性时我们会比较小心的校验其存在性：

```ts
interface User {
  name: string;
  email: string;
  address?: {
    postcode: string;
    street: string;
  };
}

const user: User = xxx;
if (user.address) {
  console.log(user.address.postcode);
}

const upperName = user.name.toUpperCase(); // “安全”地调用 toUpperCase 方法
```

但是非可选属性使用时就能完全安心了吗？这里在调用 toUpperCase 方法时，TypeScript 不会有任何抱怨，因为从定义的 interface 来看 name 属性是存在的，并且是字符串类型。但是从 JavaScript 的角度看却不是这样，作为运行时环境 name 属性为 null 或 undefined 的情况是存在的，所以这样调用 toUpperCase 并不是真正安全的。

当然并不是说在 TypeScript 中要抛弃对类型定义的信任，只是作为开发者要更加小心的定义类型，并且要记住类型并不能在运行时提供任何保护。

## 使用新 API 时不注意兼容性

自从 ES6 以来，各种新的 API，新的提案发展很迅速，在看博客、源码时经常会看到一些比较新的 API，但如果要在自己的工程中使用时一定要注意兼容性，因为每个工程的配置都不尽相同，别人能用的不见得在自己的工程中合适。这里列举了一些情况：

1. `babel` 工程则要注意使用了哪些 preset 和 plugin（可能会带来新的语法和 API），还要注意 `.browserslistrc` 的配置情况（影响 polyfills 的引入）
2. `TypeScript` 工程要注意版本和 `tsconfig.json` 中的 `lib` 配置，这些可能会带来新语法和使用方式
3. 使用[caniuse](https://caniuse.com/)查询兼容性时，可以在设置中添加一下地区信息，比如你的目标客户基本都在国内，就要特别注意国内的占比信息，而非 Global 的信息，如下图可以看到`window.scrollTo`在 Global 和 China 的指标数据相差甚大：

![difference between global and china](/img/posts/javascript/difference-between-global-china.png)

## 样式上禁用，但逻辑上未处理

页面上可操作的区域是最重要的部分，如最常见按钮，在不同的逻辑控制下，按钮可能会有不同的状态：_启用_、*禁用*等状态，当然它们的样式是不同的，在实现时开发者都会根据条件增加禁用的样式，但有些开发者没有注意将按钮上绑定的事件去除，这就造成了视觉上按钮是不可点击的（可能通过颜色、光标样式等控制），但实际上按钮是可以点击的。

可能有些严谨的开发者在处理时，还设置了`pointer-events: none;`样式，乍看起来没啥问题了，因为都点不到了嘛。但样式是很容易在开发者工具里面修改的，只要将这个样式去掉之后，和上面的情况没什么两样。

所以针对这种场景，可以通过模板中根据条件绑定事件或者事件处理函数中检查条件的方式解决，当然这只是前端的处理，针对和服务端有交互的重要操作服务端肯定也是需要做一系列控制的。
