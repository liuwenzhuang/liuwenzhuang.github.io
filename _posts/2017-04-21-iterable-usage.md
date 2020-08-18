---
title: 理解并利用Iterable协议
date: 2017-04-21 15:43:00
tag: ["ES6", "Iterable"]
excerpt: ES6 中引入了for...of、[...arr]展开语法等很方便易用的功能，本文介绍它们内部的实现逻辑：Iterable。
---

[objectentries]: https://exploringjs.com/es6/ch_iteration.html#objectEntries
[iteration_protocols mdn]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
[iteration exploringjs]: https://exploringjs.com/es6/ch_iteration.html

ES6 中引入了`for...of`、`[...arr]`展开语法等很方便易用的功能，而且它们不仅仅只能用于 Array，还适用于：

- Set、Map
- String
- NodeList、HTMLCollection

我们称这些数据结构是可迭代的，那这些数据结构之间肯定存在某种共同点，即它们的原型链上都存在这一个名为`Symbol.iterator`的函数：

```javascript
const arr = [1, 2, 3];
console.assert(
  typeof arr[Symbol.iterator] === "function",
  "Array has Symbol.iterator"
);

const str = "something";
console.assert(
  typeof str[Symbol.iterator] === "function",
  "String also has Symbol.iterator"
);

const allButton = document.querySelectorAll("button");
console.assert(
  typeof allButton[Symbol.iterator] === "function",
  "NodeList has Symbol.iterator too"
);
```

它们都实现了`Iterable`接口/协议：

```javascript
interface Iterable {
  [Symbol.iterator]() : Iterator;
}
interface Iterator {
  next() : IteratorResult;
}
interface IteratorResult {
  value: any;
  done: boolean;
}
```

文字描述一下：“Symbol.iterator 函数需要返回一个对象，其中含有 next 函数，且这个 next 函数需要返回一个`{ value: any, done: boolean }`的结构”，这里返回的对象就像是一条生产线，不过这生产线比较懒，需要一次次地问它要：“哎，给我个数据”，要的方式就是调用它提供的`next()`函数，它给我们返回一个`{ value: any, done: boolean }`的结构，我们从中拿到我们想要的 value 值。像上面提到的`for...of`、`[...arr]`展开语法也是需要这样做的，下面我们来模拟一下：

```javascript
const arr = [1, 2, 3];
const iterator = arr[Symbol.iterator](); // 得到生产线
console.log(iterator.next()); // { value: 1, done: false }  第1次问生产线要数据，done为false表示我在给你生产数据
console.log(iterator.next()); // { value: 2, done: false }  第2次问生产线要数据
console.log(iterator.next()); // { value: 3, done: false }  第3次问生产线要数据
console.log(iterator.next()); // { value: undefined, done: true} done为true表示已经榨干了
console.log(iterator.next()); // { value: undefined, done: true} 榨干后再要也不给
```

实际上，使用`for...of`、`[...arr]`展开语法等操作的就是上文中提到的生产线，我们也可以直接操作它：

```javascript
const arr = [1, 2, 3];
const iterator = arr[Symbol.iterator]();
for (item of iterator) {
  console.log(item);
}
// 输出：
// 1
// 2
// 3
```

但是上面也提到了，当一条生产线被榨干之后，再要人家就不给了：

```javascript
const arr = [1, 2, 3];
const iterator = arr[Symbol.iterator]();
const arrCopy = [...iterator]; // A 榨干了生产线
for (item of iterator) {
  console.log(item); // B 不会被执行
}
console.log(arrCopy);
// 输出：
// [1, 2, 3]
```

在 A 行使用展开操作符将生产线*iterator*榨干了，下面再使用`for...of`问人家要就肯定没有了，但是如果我们按照上面的步骤直接操作数组*arr*的话就能得到我们预期的结果，这是因为每次操作时都会有新的生产线出现，我们可以按照下面的步骤模拟：

```javascript
const arr = [1, 2, 3];
const iterator01 = arr[Symbol.iterator]();
const arrCopy = [...iterator01]; // A 榨干了生产线 iterator01
const iterator02 = arr[Symbol.iterator](); // 新建一条生产线 iterator02
for (item of iterator02) {
  console.log(item);
}
console.log(arrCopy);
// 输出：
// 1
// 2
// 3
// [1, 2, 3]
```

我们甚至可以分多次操作一条生产线：

```javascript
const arr = [1, 2, 3, 4];
const iterator = arr[Symbol.iterator]();
let index = 0;
for (item of iterator) {
  console.log(item);
  if (index === 1) {
    break;
  }
  index++;
}
const restArr = [...iterator];
console.log(restArr);
// 输出：
// 1
// 2
// [3, 4]
```

我们使用`for...of`问生产线要了 2 次数据，然后又用展开操作符问生产线要了剩下的数据，完全可以的。

### 利用 Iterable 协议使普通的 Object 可迭代

上面说道，一个数据结构实现`Iterable`协议了，就可以被迭代了，那我们就可以为普通的 Object 实现`Iterable`协议，使其可迭代：

```javascript
const symbolKey03 = Symbol("key03");
const iterableObj = {
  key01: "value01",
  key02: "value02",
  [symbolKey03]: "value03",
  [Symbol.iterator]() {
    // Reflect.ownKeys获取自身所有属性，包括Symbol值作为名称的属性，但要去除特殊的Symbol.iterator
    const keys = Reflect.ownKeys(this).filter((key) => key !== Symbol.iterator);
    let index = 0;
    return {
      [Symbol.iterator]() {
        return this;
      },
      next: () => {
        // A
        if (index < keys.length) {
          const key = keys[index++];
          return { value: [key, this[key]], done: false };
        } else {
          return { done: true };
        }
      },
    };
  },
};

for (let [key, value] of iterableObj) {
  console.log(`${key.toString()}: ${value}`); // B
}
// 输出：
// key01: value01
// key02: value02
// Symbol(key03): value03
```

> A 行使用箭头函数是为了继承`this`，即*iterableObj*，**虽然箭头函数不建议在 Object 方法中使用，但非常适合在 Object 方法中的闭包中使用**。

> B 行显式调用`toString()`方法是因为 Symbol 类型不支持隐式转换为 String。

上面我们利用`Iterable`协议使得*iterableObj*变成可迭代的数据，但是这样的处理很不优雅，且没有通用性，所以我们可以将上面*iterableObj*的实现提取出来，我们要的只是一个`iterable`：

```javascript
function objectEntries(obj) {
  let index = 0;

  const propKeys = Reflect.ownKeys(obj);

  return {
    [Symbol.iterator]() {
      return this;
    },
    next() {
      if (index < propKeys.length) {
        const key = propKeys[index];
        index++;
        return { value: [key, obj[key]] };
      } else {
        return { done: true };
      }
    },
  };
}

const symbolKey03 = Symbol("key03");
const obj = {
  key01: "value01",
  key02: "value02",
  [symbolKey03]: "value03",
};
for (const [key, value] of objectEntries(obj)) {
  console.log(`${key.toString()}: ${value}`);
}
// 输出：
// key01: value01
// key02: value02
// Symbol(key03): value03
```

> 上述`objectEntries`实现来自：[exploringjs][objectentries]{:target="\_blank"}

### 同时实现 Iterator 和 Iterable

大家观察一下这个结构：

```javascript
{
  next: function() {
    // 省略返回 { value: any, done: boolean }
  },
  [Symbol.iterator]() {
    return this;
  }
}
```

可以发现它既实现了`Iterator`协议（有`next`方法），又实现了`Iterable`协议（有`Symbol.iterator`方法，且返回`Iterator`）。因为`Iterable`的应用更广泛些，毕竟只有个`next`方法的`Iterator`用途不大，所以目前来看`iterator`有点依附于`iterable`的意思。

### 更多

- [Iteration_protocols MDN][iteration_protocols mdn]{:target="\_blank"}
- [iteration exploringjs][iteration exploringjs]{:target="\_blank"}
