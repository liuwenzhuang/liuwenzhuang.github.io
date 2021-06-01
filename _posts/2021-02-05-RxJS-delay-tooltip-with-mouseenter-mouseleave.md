---
title: 使用 RxJS 实现 tooltip 的延迟显示
date: 2021-02-05 21:23:12
tag: ["RxJS"]
excerpt: 最近在实现一个树形组件时，发现了之前实现的 tooltip 功能有些性能问题，原因在组件中滚动或滑动鼠标时，会频繁触发 tooltip 的显示与隐藏。
---

[iif-doc]: https://rxjs-dev.firebaseapp.com/api/index/function/iif

最近在实现一个树形组件时，发现了之前实现的 tooltip 功能有些性能问题，原因在组件中滚动或滑动鼠标时，会频繁触发 tooltip 的显示与隐藏，故决定利用 RxJS 替换原有的原生方案。

## 原有方案

原有方案是直接添加 `mouseenter` 和 `mouseleave` 事件实现：

```ts
function setTooltip(elem) {
  function onMouseEnter(event) {
    // 显示 tooltip
  }

  function onMouseLeave(event) {
    // 隐藏 tooltip
  }

  elem.addEventListener("mouseenter", onMouseEnter);
  elem.addEventListener("mouseleave", onMouseEnter);
}
```

## 现有方案

为避免不必要的 tooltip 显示逻辑，可以采用延迟触发 _onMouseEnter_ 的方法：当用户在时间阈值内就离开了元素（即 mouseleave 触发）即表示用户并不关心这个 tooltip。第一感觉是可以利用 `switchMap` 和 `delay` 来做到：

```ts
import { fromEvent, merge, iif, of } from "rxjs";
import { map, switchMap, delay } from "rxjs/operators";

function setTooltip(elem, delayDuration = 100) {
  function onMouseEnter(event) {
    // 显示 tooltip
  }

  function onMouseLeave(event) {
    // 隐藏 tooltip
  }

  const showStream$ = fromEvent(elem, "mouseenter").pipe(
    map((event) => ({
      event,
      show: true,
    }))
  );
  const hideStream$ = fromEvent(elem, "mouseleave").pipe(
    map((event) => ({
      event,
      show: false,
    }))
  );
  merge(showStream$, hideStream$)
    .pipe(
      // prettier-ignore
      switchMap(data =>
          iif(
              () => data.show,
              of(data).pipe(delay(delayDuration)), // 延迟触发显示
              of(data) // A
          )
      )
    )
    .subscribe(({ show, event }) => {
      if (show) {
        onMouseEnter(event);
      } else {
        onMouseLeave(event);
      }
    });
}
```

当然此种方式，可能需要在 _onMouseLeave_ 中判断下是否已经显示了 tooltip，再将其移除/隐藏。当然也可以在上面的 A 行处增加 `filter`，更加符合 RxJS 的 style：

```ts
// checkHasTooltip: () => boolean

iif(
  () => data.show,
  of(data).pipe(delay(delayDuration)),
  of(data).pipe(filter(() => checkHasTooltip()))
)
```

> [iif][iif-doc] 操作符和三目操作符比较像，第一个参数是一个 `() => boolean` 类型的函数，如果为真返回第二个参数的 Observable，否则返回第三个参数的 Observable。

## 总结

虽然看起来代码变得很繁琐，而且利用原生的方案通过 `setTimeout` 等手段也能实现类似的功能，但在理解的基础上使用 RxJS 会使逻辑上更加顺畅。
