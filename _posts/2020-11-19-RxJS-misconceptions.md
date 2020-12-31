---
title: RxJS 中一些容易忽略的概念
date: 2020-11-19 20:23:12
tag: ["RxJS"]
excerpt: 本文收集了一些在学习 RxJS 过程中发现的容易忽略或比较容易弄错的概念，并尝试对其进行解释。
---

[rxjsv6]: https://github.com/ReactiveX/rxjs/tree/6.x
[marbletest]: https://rxjs-dev.firebaseapp.com/guide/testing/marble-testing
[lwz-marble-test]: https://github.com/liuwenzhuang/learn-rxjs-by-test/blob/master/test/marble-test.spec.ts
[reactive-program-newbie]: https://gist.github.com/staltz/868e7e9bc2a7b8c1f754

本文收集了一些在学习 RxJS 过程中发现的容易忽略或比较容易弄错的概念，并尝试对其进行解释。

> 本文涉及的代码均在 [RxJS v6][rxjsv6] 版本，其他版本区别不大，基本概念是相同的。

## EMPTY 不是空转

`EMPTY` 是一个内置的 Observable，很多人看到其名字认为它什么也不做，但对于 Observable 来说一定是处在下面“状态”之一的：

- 正常推送数据
- 出现错误
- 完成

而 **`EMPTY` 就是直接到达完成状态的 Observable**：

```ts
import { EMPTY } from "rxjs";

EMPTY.subscribe({
  next() {
    console.log("no data will arrived");
  },
  complete() {
    console.log("complete");
  },
});
// OUTPUT: complete
```

> `empty()` 和 `EMPTY` 功能一样，但 `empty()` 已经被弃用了。

## throwError()

`throwError()` 和 `EMPTY` 很类似，都没有推送数据的状态，区别只在于 **`throwError()` 生成的 Observable 会直接到达错误状态**。

## catchError() 中忽略错误不能使源 Observable 继续

RxJS 和 Ramda 从某些方面看相似度要高于 Lodash，最重要的特点就是操作都不会改变源数据，返回的都是新的一份数据，也就是 **Immutable**。所以下面的代码不会如愿输出 A 和 B：

```ts
import { EMPTY, from } from "rxjs";
import { catchError, map } from "rxjs/operators";

from(["a", null, "b"])
  .pipe(
    map((value) => value.toUpperCase()),
    catchError((err) => EMPTY)
  )
  .subscribe({
    next: console.log,
    complete: () => console.log("complete"),
  });
// OUTPUT: A
// OUTPUT: complete
```

让我们看一下整体的流程：

1. `from()` 操作生成了一个 Observable，这里将其命名为 Stream1
2. 对 Stream1 进行 `map()` 操作，**新生成了一个 Observable**，将其命名为 Stream2，可以说 Stream2 和 Stream1 是没任何关系的
3. 和前一步类似，对 Stream2 进行 `catchError()` 操作，又新生成了一个 Observable，将其命名为 Stream3
4. 此时有 Observer 进行了 subscribe 操作，注意此时这个 Observer 关注的是 Stream3，Stream1 和 Stream2 只是个过渡，而在 `map()` 对 _null_ 进行 _toUpperCase()_ 操作时会出现异常
5. 此时`catchError()`发挥了作用，返回了 `EMPTY`，**并同时结束了 Stream3**，上文说到 `EMPTY` 也是一个 Observable，只不过它会直接到达完成状态，我们将其命名为 Stream4

所以最终的输出为 _A_ 和 _complete_，但是它们的来源不同： _A_ 来自于 Stream3，_complete_ 来自于 Stream4 。

> Observable 的转换过程就像是不同的水管连接在一起，每一次水流通过一个水管总会有些变化。

## 如何理解时间

关于 Observable 有个很好的类比：**Observable 像是具有时间特性的数组**。那如何理解这里的“时间”，又怎样量化地表示时间呢？

在查看文档时，经常会遇到类似下面这样的图：

![timer](/img/posts/rxjs/timer.png)

下面的带箭头的直线就是时间轴，对于 `timer(3000, 1000)` 来说，从起点到第一个数字的时间长度应该是任意两个数字之间商检长度的 3 倍（3000 / 1000）。

而对于时间不敏感的操作，比如类似 `from([1, 2, 3])` 的操作来说，时间看似是没什么作用的，但是也是有时间概念的：_1_ _2_ _3_ 和 _结束_ 都在一个时间片段中发出，但对于 Observer 来说仍然是按顺序一个个到达的。

RxJS 为我们提供了量化时间的方法： [Marble Test][marbletest]{:target="_blank"}，关于这个主题后面会新开一文详细地解释，本文暂不赘述，我写了[一些 Marble Test 用例][lwz-marble-test]{:target="_blank"}，有兴趣地可以先看下。

## 如何理解高阶 Observable

高阶 Observable，也就是 发出 Observable 的 Observable，如下面的例子：

```ts
import { from, of } from "rxjs";
import { map } from "rxjs/operators";

from([1, 2, 3]).pipe(
  map(value => of(value))
).subscribe(value$ => { // Observer 1 得到 Observable 1
  value$.subscribe(console.log) // Observer 2 得到 Observab 1 推送的值
})
// OUTPUT: 1
// OUTPUT: 2
// OUTPUT: 3
```

上面的例子只是个解释，实际开发中没人会这样处理，这里这是为了说明 Observable 可以推送任意的数据，甚至是其他的 Observable。就像我们熟悉的高阶函数一样，返回的是函数，也需要我们再次调用这个函数才能得到最终的结果。从这个角度来看，**Function 和 Observable 一样都具有 lazy 的特性**。

## 资料

- [Reactive Program 入门必读][reactive-program-newbie]
- [Marble Test][marbletest]
