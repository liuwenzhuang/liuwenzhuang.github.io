---
title: 老项目使用 dayjs 替代 moment 的注意事项
date: 2021-10-20 08:23:12
tag: ["JavaScript"]
excerpt: 最近在优化项目时，发现项目中存在 dayjs 和 moment 混用的情况，决定将 moment 全面替换掉，在替换过程中发现了一些需要注意的地方。
---

[dayjs-website]: https://day.js.org/
[dayjs-mutable]: https://day.js.org/docs/en/plugin/bad-mutable
[dayjs-objectsupport-pr]: https://github.com/iamkun/dayjs/pull/1647
[moment-website]: https://momentjs.com/
[dayjs-moment-jest]: https://github.com/liuwenzhuang/algorithm/blob/main/src/sundry/moment-dayjs.test.ts

[Day.js][dayjs-website] 作为 [Moment.js][moment-website] 的极简替代品，具有体积小、API 类似 、TypeScript 支持良好等优点。最近在优化项目时，发现项目中存在 dayjs 和 moment 混用的情况，决定将 moment 全面替换掉，**但 Day.js 其并不是 Moment.js 的直接替代品**，在替换过程中发现了一些需要注意的地方。

## Day.js 的 immutable VS Moment.js 的 mutable

熟悉函数式编程或 Redux 中 Reducer 的同学，对于 immutable 和 mutable 应该有很深刻的了解，这里仅简单说下区别：

- immutable 会直接操作当前对象，造成当前对象的属性变化
- mutable 不会直接操作当前对象，而是返回处理后新的对象

下面以项目中遇到的 “根据调度周期和首次调度时间需要计算出最近 10 次的调度时间” 这个场景为例，之前使用 Moment.js 的代码（为简单起见，调度周期的单位假定为天）：

```ts
import moment from "moment";

function getNext10ScheduleTime(firstSchedule: number, period: number = 1) {
  const timeEntity = moment(firstSchedule);
  const result = [];
  for (let i = 0; i < 10; i++) {
    result.push({
      scheduleTime: timeEntity.valueOf(),
      scheduleText: timeEntity.format("YYYY-MM-DD HH:mm:ss"),
    });
    timeEntity.add(period, "d"); // A
  }
  return result;
}
```

此时便不能简单地直接将 _moment()_ 的方法调用改为 _dayjs()_，因为 A 行利用了 Moment.js 的 mutable 特性，直接对 _timeEntity_ 进行了操作，以便下次循环时取得新值。如果使用 Day.js 改写，则应为：

```ts
import dayjs from "dayjs";

function getNext10ScheduleTime(firstSchedule: number, period: number = 1) {
  let timeEntity = dayjs(firstSchedule);
  const result = [];
  for (let i = 0; i < 10; i++) {
    result.push({
      scheduleTime: timeEntity.valueOf(),
      scheduleText: timeEntity.format("YYYY-MM-DD HH:mm:ss"),
    });
    timeEntity = timeEntity.add(period, "d"); // B
  }
  return result;
}
```

Day.js 默认是 immutable 的，所以 B 行的 _add()_ 调用后 _timeEntity_ 本身没有变化，所以需要将返回值重新赋值。其实对于 Moment.js 来说，_add()_ 也会返回一个值，但这个值是对 _timeEntity_ 的直接修改后的结果。

> 所有涉及到日期对象的操作修改，如 _add()_、_subtract()_、_year()_、_set()_ 等操作，都符合上文所述，需要注意。如果你的项目中大量依赖此类逻辑的话，Day.js 通过插件提供了一种**[不推荐的方案][dayjs-mutable]**用以适配此类情况。

## Day.js 的插件系统

Day.js 默认情况下包含了常用的大部分 API，但有些不常用的功能是通过插件提供的，一个插件包含了某些功能的实现及声明文件的提供。如 _dateOfyear()_、通过提供代表日期的对象构造 dayjs 实例等，这些都需要手动引入：

```ts
// dayjs-facade.ts
import dayjs from "dayjs";
import dayOfYear from "dayjs/plugin/dayOfYear";
import objectSupport from "dayjs/plugin/objectSupport";

// configure plugin like this
dayjs.extend(dayOfYear);
dayjs.extend(objectSupport);

export default dayjs;
```

可以将插件的配置都放置于这一个文件中，使用时从此文件引入即可。

目前的最新版本（1.10.7）_objectSupport_ 插件提供的声明文件有些问题，在使用对象构造 dayjs 实例时 ts 的语法检查会提示 _没有与此调用匹配的重载_：

![dayjs-objectSupport-declaration-error.png](/img/posts/javascript/dayjs-objectSupport-declaration-error.png)

社区中已有用户提供了 [pr][dayjs-objectsupport-pr] 解决，不过目前还没合入发布版本，所以可以暂时使用 `as any` 将参数类型做一下强制类型转换，或者单独使用 _set()_ 方法进行分别设置。

## 替换过程中需要必要的测试

在替换过程中，遇到不能确定会不会引起差异的情形，最好针对自己的情形书写用例进行验证，避免可能因版本或者是某些 API 实现上存在差异的情况。可查看在替换过程中[我书写的用例][dayjs-moment-jest]以做参考。当然如果项目本身就有比较健全的单元测试，这一步也可以直接在项目中验证。
