---
title: 你可能不了解的forEach循环
date: 2018-07-23 10:23:12
tag: ["JavaScript"]
excerpt: 循环时所有编程语言中不可或缺的部分，ES5引入的 forEach 更使得对数组的处理更加便捷，但其和普通的 for 循环还是有很大区别的。
---

在 JavaScript 或者几乎所有的编程语言中，for 循环语句都是处理循环的主要手段，其使用方式相信大家都很熟悉。在处理循环时，我们还可以使用`break`、`continue`来控制循环的结束或者跳过本次处理。但 ES5 中引入的`forEach`作为处理循环的利器能否沿袭 for 循环的特点呢？答案是否定的，`forEach`有着自己独特的特性：**break、continue 不能在 forEach 中使用**

```javascript
var arr = [1, 2, 3, 4];
arr.forEach(function (item) {
  console.log(item);
  if (item > 2) {
    break;
  }
});
```

```javascript
var arr = [1, 2, 3, 4];
arr.forEach(function (item) {
  if (item === 2) {
    continue;
  }
  console.log(item);
});
```

上面两段代码乍看起来应该像是对的，但是运行时会抛出异常。那我们该如何实现类似的功能呢？

## return 模拟 continue

这里其实有个乍看起来奇特的场景：**`return`语句不能结束`forEach`**。很奇怪吧，即使在`switch...case`中使用`return`语句也可以结束一个代码块：

```javascript
function getColor(color) {
  switch (color) {
    case "red":
      return "#ff0000";
    case "blue":
      return "#00ff00";
    default:
      return null;
  }
  console.log("不可知之地"); // A
}

console.log(getColor("red")); // #ff0000
```

`return`的作用是用来结束一个代码块的，上面的行 A 是不会被执行到的。那再来看下`return`在`forEach`中的表现：

```javascript
var arr = [1, 2, 3, 4];
arr.forEach(function (item) {
  console.log(item);
  if (item > 2) {
    return;
  }
});
```

我们的本意是只打印出 1 和 2，但是实际上结果却是将数据中所有的数据都打印出来了，这是因为我们传入`forEach`的是一个函数，每次循环都会执行此函数（传入参数不同），而函数中的`return`只会结束当前函数，所以上面的`return`没有任何意义，但是我们可以利用此特性起到`continue`语句的作用：

```javascript
var arr = [1, 2, 3, 4];
arr.forEach(function (item) {
  if (item > 2) {
    return;
  }
  console.log(item);
});

// 1 2
```

## 无法在 forEach 中模拟 break

上面的例子只是调换一下代码位置即可实现*只打印出 3 之前的数据*的功能，但是这种实现并不优雅，因为对于 2 以后的元素来说仍然还要进行非必要的函数调用（假设 arr 是有序数组），这种方案只适用于跳过特定某些数据的场景：

```javascript
var arr = [1, 2, 3, 4];
arr.forEach(function (item) {
  // 针对跳过某些数据时可以使用return模拟continue
  if (item === 2) {
    return;
  }
  console.log(item);
});

// 1 3 4
```

但是对于*只打印出 3 之前的数据*的功能来说，使用 for 循环实现无疑是最好的方案（可以搭配`break`使用）：

```javascript
var arr = [1, 2, 3, 4];
for (var i = 0, len = arr.length; i < len; i++) {
  if (arr[i] > 2) {
    break;
  }
  console.log(arr[i]);
}

// 1 2
```

> 我们是无法在`forEach`中模拟`break`的，因为术业有专攻，如果想要此功能请大胆的使用 for 循环。

## 更多

上文中提到的 for 循环既包括普通的 for 循环，其实也包括 ES6 中的`for...of`循环（`continue`、`break`能够正常使用）。ES5 和 ES6 之后好多人感觉使用普通的 for 循环逼格比较低，但是使用普通的 for 循环并无任何不妥之处，**而且对于大数据量来说普通的 for 循环性能上更具优势**。
