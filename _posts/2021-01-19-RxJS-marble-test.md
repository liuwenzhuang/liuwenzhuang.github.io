---
title: 通过 Marble Test 理解 RxJS
date: 2021-01-19 12:23:12
tag: ["RxJS"]
excerpt: Marble Diagram 是理解 RxJS 的重要辅助工具，在 RxJS 的文档中有很多以时间为轴的图，那就是 Marble Diagram。而 Marble Test 就是测试某个 Observable 是否满足某个 Marble Diagram 的方法。
---

[previous-post]: {% post_url 2020-11-19-RxJS-misconceptions %}
[reactive-program-newbie]: https://gist.github.com/staltz/868e7e9bc2a7b8c1f754
[rxjsv6]: https://github.com/ReactiveX/rxjs/tree/6.x
[marbletest]: https://rxjs-dev.firebaseapp.com/guide/testing/marble-testing
[lwz-marble-test]: https://github.com/liuwenzhuang/learn-rxjs-by-test/blob/master/test/marble-test.spec.ts
[never]: https://rxjs-dev.firebaseapp.com/api/index/const/NEVER
[testscheduler-v5]: https://rxjs-dev.firebaseapp.com/guide/testing/marble-testing#behavior-is-different-outside-of-testscheduler-run-callback-
[cold-vs-hot]: https://github.com/Reactive-Extensions/RxJS/blob/master/doc/gettingstarted/creating.md#cold-vs-hot-observables
[lwz-marble-test]: https://github.com/liuwenzhuang/learn-rxjs-by-test/blob/master/test/marble-test.spec.ts
[flatten-stragey]: https://medium.com/@shairez/a-super-ninja-trick-to-learn-rxjss-switchmap-mergemap-concatmap-and-exhaustmap-forever-88e178a75f1b

[上篇文章][previous-post]介绍了一些 RxJS 的相关概念，本文通过学习 `Marble Test` 进一步的理解 RxJS。

Marble Diagram 是理解 RxJS 的重要辅助工具，在 RxJS 的文档中有很多以时间为轴的图，那就是 Marble Diagram。而 Marble Test 就是测试某个 Observable 是否满足某个 Marble Diagram 的方法，能帮助我们更好地理解“时间”在 RxJS 中到底是起到了什么作用，也能够让我们更好地理解 Observable 的转换（如通过各种 operators）到底发生了什么。

> 本文涉及的代码均在 [RxJS v6][rxjsv6] 版本，此版本官方提供了`rxjs/testing`，在此版本之前可能需要外部的测试库辅助，但基本概念是类似的。

## Marble Diagram

`Marble Diagram` 是描述 Observable 状态重要的可视化工具，它提供了一种模式用来描述我们的 Observable 发生了什么：

- 处理中：准备数据的阶段，这些时刻不会和 Observer 有交流
- 发出数据：通知 Observer 的 next
- 完成：通知 Observer 的 complete
- 出错：通知 Observer 的 error

![rxjs-marble-diagram.png](/img/posts/rxjs/rxjs-marble-diagram.png)
_Marble Diagram_

上图中可以看到，横轴是时间，且流向是从左到右。圆形表示发出的数据，也就是 marble，所以才叫做 `Marble Diagram`。可以很容易地想象 Observable 产生 marble 在时间轴上的分布应该是有规律可循的，比如：

![timer.png](/img/posts/rxjs/timer.png)
_timer(3000, 1000)的 Marble Diagram_

`timer(3000, 1000)` 的含义是指 3s 后开始发出第一个数据，然后每隔 1s 发出下一个数据，所以 0 之前的时间长度应该是任意两个数据之间时间长度的 3 倍。

那我们如何在测试中提现这种类似的时间关系呢？我们可以通过一种特定的语法来表示 `Marble Diagram` 中状态，这就是 `Marble Test` 的核心。

## Marble Test 语法

- `-` 连接符，表示时间片，在测试用例中可以将 1 个时间片等同为 1ms，所以 `----` 时间长度为 4ms（如果出现的只有连接符，如 `-` 或 `----` 则表示一个不会发出任何值，也不会结束的 Observable，和 [NEVER][never] 一样）
- `[a-z0-9]` 小写英文字母或数字，表示发出数据，但并不表示发出数据的值一定是他们本身，`Marble Test` 支持提供额外的数据映射，**而它们也会占用一个时间片**，所以在没有提供额外的数据映射时 `--a-0-b-` 表示 3ms 时发出 'a'，5ms 时发出 '0'（默认是字符串类型）
- `[0-9]+[ms|s|m]` 即数字加上时间单位，比如 9m 表示 9 分钟，等同于 9\*60s，因为单位时间为 1ms，如果只使用上面连接符的方式在表示一些时间比较长的 Observable 比较繁琐。`3ms a 1ms` 和 `---a-` 是等价的
- `' '` 空白字符，上面的例子中出现了空格，它是不占用时间片的，可以用于类似上面这种必须分隔开的场景（`3msa1ms` 的含义完全不同），也可以用于代码的可读性
- `|` 表示图中的 complete，即告知 Observer 的 complete 方法，`-a--|` 表示 2ms 时发出 'a'，5ms 时结束
- `#` 表示图中的 error，即告知 Observer 的 error 方法，`-a-#` 表示 2ms 时发出 'a'，4ms 时出现错误
- `()` 上面的图中，每个数据的发出、结束、出错看起来都是有时间间隔的，但现实肯定不总是这样，可能在同一个时间片中有多个数据的发出，但是不能写成类似 `-ab-` 的形式，因为 'a' 和 'b' 占用了不同的时间片，想要表示在同一个时间片时就需要使用括号了，所以 `-(ab)-` 表示 2ms 时同时发出了 'a' 和 'b'
- `^` 表示 Observer 订阅的时刻，只对 `hot Observable` 生效
- `!` 表示 Observer 退订的时刻，注意和 `|` 的区别，前者是 Observer 不再对数据感兴趣了，后者是 Observable 已经发出了所有了数据

> 由上面的语法组成的字符串，比如 `-(ab)-` 叫做 `Marble 字符串`，可以看到利用这个字符串可以模拟出时间的流逝、数据的发出、完成、错误、订阅开始、订阅结束的这些状态。

### 关于 cold 和 hot

cold Observable 和 hot Observable 的差异性是学习 RxJS 绕不开的概念，而且经常和 Observable 的 lazy 特性搞混。无论是 cold 还是 hot，都具有 lazy 的特性，即都是在 Observer 进行了 subscribe 操作时才对 Observer 推送数据。

某种意义上来说它们区别在于数据的来源，一般来说 cold Observable 自己维护着数据，无论何时一个 Observer 的订阅的到来，都**从头**将数据推送到 Observer；而 hot Observable 的数据来源于外部，比如最经常用到的 `fromEvent` 将事件流转换为 Observable，即使没有 Observer 进行订阅，事件是时刻在发生着的，当 Observer 订阅时只能收到下一次的事件，且对多个 Observer 数据是共享的。

> 由于超出本文的范围，本文不会对 cold 和 hot 的概念做深入的解释，感兴趣的大家可以先看下[官方解释][cold-vs-hot]。

## 如何使用 Marble 字符串

上面提到了 Marble 字符串的语法，那如何使用它们创建出对应的 Observable 呢？在使用 `Marble Test` 时，首先需要引入 `rxjs/testing` 的 `TestScheduler` 类，然后生成一个 `TestScheduler` 类实例 testScheduler，所有的操作都在实例的 _run_ 方法中完成：

```ts
import { expect } from "chai";
import { TestScheduler } from "rxjs/testing";

describe("test hot observables", () => {
  let testScheduler: TestScheduler;
  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).deep.equal(expected);
    });
  });
  it("observers receive different values at different subscription time", () => {
    testScheduler.run(({ hot, expectObservable }) => {
      const hotObservable = hot("-a-b-c-d-e-f-g-h-i-");
      // 使用无意义的空格，可以起到很好的视觉对齐效果
      const observer1 = "        --^-----------!";
      const observer2 = "        ------^-----!";
      expectObservable(hotObservable, observer1).toBe("---b-c-d-e-f-g-");
      expectObservable(hotObservable, observer2).toBe("-------d-e-f-");
    });
  });
});
```

> 在 RxJS v5 时，`TestScheduler` 是 RxJS 维护者用于测试内部代码用的，使用方式、api、关于时间片的时长定义也和本文提到的方式有所不同，有兴趣的可参考[官方解释][testscheduler-v5]。若没有特殊说明，本文提到的测试用例均按上文的方式。

_run_ 函数的签名如下：

```ts
interface RunHelpers {
    cold: typeof TestScheduler.prototype.createColdObservable;
    hot: typeof TestScheduler.prototype.createHotObservable;
    flush: typeof TestScheduler.prototype.flush;
    expectObservable: typeof TestScheduler.prototype.expectObservable;
    expectSubscriptions: typeof TestScheduler.prototype.expectSubscriptions;
}

run<T>(callback: (helpers: RunHelpers) => T): T;
```

上面的例子中，我们在 _callback_ 内部使用了 hot、expectObservable 方法，通过签名可以看到我们还能够使用其他 3 个方法来构建我们的测试用例。

### expectObservable

用于校验某个 Observable 是否满足提供的 Marble 字符串：

```ts
type observableToBeFn = (marbles: string, values?: any, errorValue?: any) => void;

expectObservable(observable: Observable<any>, subscriptionMarbles?: string): ({
  toBe: observableToBeFn;
});
```

提供第二个参数 `subscriptionMarbles` 可以控制 Observer 的订阅、退订，从而影响到结果的对比。

### expectSubscriptions

用于校验 Observable 订阅者的订阅、退订的时间：

```ts
type subscriptionLogsToBeFn = (marbles: string | string[]) => void;

expectSubscriptions(actualSubscriptionLogs: SubscriptionLog[]): ({
  toBe: subscriptionLogsToBeFn;
});
```

其参数是 Observable 的订阅者信息，可以通过 Observable 实例的 `subscriptions` 属性得到。

### cold、hot

分别用于生成 `cold Observable` 和 `hot Observable`：

```ts
cold(marbles: string, values?: object, error?: any)
hot(marbles: string, values?: object, error?: any)
```

`cold('-a--b-|')` 表示一个在 2ms 发出 'a'，5ms 发出 'b'，7ms 结束的 Observable。

如果提供了 _values_ 参数，则表示对 Marble 字符串中的值映射，如 `cold('-a--b-|', { a: 1, b: 2 })` 表示 2ms 发出 1，5ms 发出 2，7ms 结束的 Observable。

对于 `hot()` 的 marbles 参数（Marble 字符串）还存在着一个特殊的地方：可以使用 `^` 符号表示时间起点（不为 `expectObservable` 提供第二个参数时）：

```ts
expectObservable(hot("--^-a-b-|")).toBe("--a-b-|");
```

### flush

用于重置时间片，因为 _run_ 方法会自动执行这个操作，所以不太常用。

## 一些示例

下面我们可以写一些 Marble Test 来帮助我们理解一些比较难理解的操作符。用例的公共部分，如模块引入、describe 等我们在这里就省略了：

### takeUntil

```ts
it("test takeUntil", () => {
  testScheduler.run(({ cold, expectObservable }) => {
    const originObservable = cold("  -a-b-c-|");
    const notifierObservable = cold("----n-|");
    const takeUntilObservable = originObservable.pipe(
      takeUntil(notifierObservable)
    );
    expectObservable(takeUntilObservable).toBe("-a-b|");
  });
});
```

`takeUntil` 接受一个 Observable 作为通知者 notifier，当 notifier 发出数据时，会同时将源 Observable 和 notifier 都结束掉。上面的例子中 takeUntil 的 notifier 在 5ms 时产生数据，此前 originObservable 产生了 `-a-b` 就会在 5ms 时结束，即 `-a-b|`。

### take

```ts
it("test take", () => {
  testScheduler.run((helpers) => {
    const { expectObservable } = helpers;
    const values = {
      a: 0,
      b: 1,
      c: 2,
      d: 3,
    };
    expectObservable(timer(0, 2).pipe(take(4))).toBe("a-b-c-(d|)", values);
  });
});
```

`take` 的作用是监控源 Observable，当其发出指定数量的数据时停止源 Observable，`a-b-c-(d|)` 即表示在发出第 4 个数据时 Observable 结束。

### switchMap

```ts
it("test switchMap", () => {
  testScheduler.run(({ cold, expectObservable }) => {
    const outterObservable = cold("a---b-|");
    const innerObservable = cold(" --c--d-|");
    const concatObservable = outterObservable.pipe(
      switchMap(() => innerObservable)
    );
    expectObservable(concatObservable).toBe("--c---c--d-|");
  });
});
```

`switchMap` 是最常用的高阶 Observable 的 flatten 策略，其最大的特点是当收到外部 Observable 发送的值后取消对内部 Observable 的订阅。上例中 outterObservable 发出 'a' 后 innerObservable 被订阅，开始发出数据，但 5ms 时 outterObservable 又发出了 'b'，此时被 'a' 触发的 innerObservable 按正常流程还没有结束，但 `switchMap` 结束了对它的订阅，并开始订阅一个新的 innerObservable，直到结束。

> 所谓 flatten 策略，就是订阅内部的 Observable，并将其发送的值直接给到 Observer。

### 更多例子

更多的例子这里就不再赘述了，感兴趣的可以到 [我的仓库][lwz-marble-test] 里面查看一些我在学习 RxJS 过程中写的一些用例。

## 总结

可以看到，利用 `Marble Test` 可以帮助我们更好地理解 RxJS，仅需掌握非常简单的语法，就可以很方便地对 Observable 进行测试，以帮助我们理解比较难理解的操作符、概念等。

### 资料

- [Reactive Program 入门必读][reactive-program-newbie]
- [Marble Test][marbletest]
- [Cold vs Hot][cold-vs-hot]
- [flattern 策略][flatten-stragey]
