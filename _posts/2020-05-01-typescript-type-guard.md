---
title: TypeScript中类型守卫Type Guard的介绍和使用
date: 2020-05-01 10:23:12
tag: ["typescript"]
excerpt: TypeScript赋予我们对数据进行类型定义的能力，union类型在开发中更是常见，本文介绍能够确认具体类型的机制 -- Type Guard。
---

## 概念

`Type Guard`不是一种类型，而是一种能够确认具体类型的一种机制，如针对 union 类型经常设置一个`type`字段来作为当前类型的唯一标识，从而在使用时能够正确识别：

```ts
type Contact =
  | { type: "email"; email: string }
  | { type: "phone"; phone: string };

function saveContact(contact: Contact) {
  if (contact.type === "email") {
    // 这里能够确定类型是 { type: 'email'; email: string; }，能够访问contact.email
  } else {
    // 这里能够确定类型是 { type: 'phone'; phone: string; }，能够访问contact.phone
  }
}
```

在开发过程中，我们可能都不自觉地使用了下面的一些方式来确定当前访问数据的类型，其实它们也是`Type Guard`：

### 空值校验

```ts
function hello(name?: string) {
  if (name) {
    // 这里能确定name是string类型
    console.log(`Hello, ${name.toUpperCase()}`);
  } else {
    console.log("Hello");
  }
}
```

### typeof

使用`typeof`也能确定类型，不过只能用于 js 的基本数据类型（null 除外），而不能用于`interface`和`type`定义的类型，因为在运行时这些类型就不在了：

```ts
function setValue(value: number | string) {
  if (typeof value === "number") {
    return value.toFixed(2);
  } else {
    return parseInt(value).toFixed(2);
  }
}
```

### instanceof

用于校验类，和`interface`和`type`不同的是，类的类型信息会在运行时保留，所以可以用`instanceof`作校验：

```ts
class Person {
  constructor(public name: string, public age: string) {}
}

function logPerson(obj: any) {
  if (obj instanceof Person) {
    console.log(`${obj.name} is ${obj.age} years old`);
  }
}
```

## 自定义 Type Guard

TypeScript 中也可以自定义 Type Guard，所谓自定义 Type Guard 就是一个返回 boolean 值的函数，此函数可以对函数的参数进行断言校验：

```ts
import axios, { AxiosResponse } from "axios";

interface Person {
  name: string;
  age: number;
}

function isPerson(obj: any): obj is Person {
  return "name" in obj && "age" in obj;
}

axios
  .get("/v1/api/test")
  .then((res: AxiosResponse) => res.data)
  .then((data: unknown) => {
    if (isPerson(data)) {
      // 通过自定义Type Guard，可以断定此处data是Person类型
      console.log(`${data.name.toUpperCase()} is ${data.age} years old`);
    }
  });
```

自定义 Type Guard 常用于未知的外部的数据类型校验，如从后端返回的数据，因为 TypeScript 不会侵入运行时环境，所以 TypeScript 在这种外部数据的情况下是无法做到类型约束的，所以 TypeScript 不得不信任我们提供的类型，而我们就可以利用自定义 Type Guard 提供一个类型断言，当数据满足我们提供的校验函数时，就可以数据作为我们提供的类型进行处理了，而且这个校验函数能够在运行时工作。**但是要注意此时就需要我们保证校验函数的严谨性及具体的数据的正确性了**，比如上面我们断定了 data 是 Person 类型，所以我们当 data.name 是 string 类型，所以能够调用 toUpperCase 方法，但是如果后端返回的值是`{ name: 12, age: 22 }`，也能通过`isPerson`的校验，但是调用 toUpperCase 就会报错。此时我们可以再细化一下`isPerson`的实现：

```ts
function isPerson(obj: any): obj is Person {
  return (
    "name" in obj &&
    typeof obj.name === "string" &&
    "age" in obj &&
    typeof obj.age === "number"
  );
}
```

TypeScript 提供了 Type Guard 能够对外部数据做类型断言的能力，但需要自己实现其中的校验逻辑，所以要考虑校验函数的有效性、严谨性及效率。

## 实用场景

考虑如下代码：

```ts
type Person = {
  name: string;
  age?: number;
};

// 获得所有age属性
function getPersonAges(persons: Person[]): number[] {
  return persons
    .filter((person) => person.age !== undefined)
    .map((person) => person.age);
}
```

但是上面的代码却会报错：

```bash
Type '(number | undefined)[]' is not assignable to type 'number[]'.
  Type 'number | undefined' is not assignable to type 'number'.
    Type 'undefined' is not assignable to type 'number'.
```

虽然我们在逻辑上的处理上是没错的，但是 TypeScript 的角度上来说报错也是理所当然的：

使用`filter`处理得到的结果类型仍然是`Person[]`，到达`map`对`Person`类型的数据取值`age`自然会得到`number | undefined`类型，因为默认情况下我们使用的`Array.filter`的函数签名是这样的：

```ts
// lib.es5.d.ts
filter(callbackfn: (value: T, index: number, array: T[]) => unknown, thisArg?: any): T[]
```

很显然，此时我们的数组为`T[]`类型，得到的结果也肯定是`T[]`类型的。

那有什么方法能够解决上面的错误呢？实际上`Array.filter`还有另一种利用了 Type Guard 的函数签名：

```ts
// lib.es5.d.ts
filter<S extends T>(callbackfn: (value: T, index: number, array: T[]) => value is S, thisArg?: any): S[]
```

在此种情况下，我们首先需要提供一个类型`T`的子类型`S`，然后回调函数需要提供一个 Type Guard 的断言函数，用于校验当前处理的值是否为`S`类型，抛弃掉不满足`S`类型的值，从而使得返回值的类型为`S[]`。使用此方式重写上面的例子：

```ts
type Person = {
  name: string;
  age?: number;
};

type FullPerson = Required<Person>;

function getPersonAges(persons: Person[]): number[] {
  return persons
    .filter<FullPerson>(
      (person): person is FullPerson => person.age !== undefined
    )
    .map((person) => person.age);
}
```

这样经过`filter`处理后得到的结果类型为`FullPerson[]`，到达`map`对`FullPerson`类型的数据取值`age`就能得到我们想要的`number`类型数据了。

## 总结

自定义 Type Guard 需要开发者提供断言函数，提供符合某类型的校验实现。断言函数和普通的函数定义类似，只是在函数返回值的签名处有所差异：**普通函数返回值的签名是一个具体的类型，而断言函数返回值的签名需要是一个断言**：

```ts
// 普通函数
function isPerson(obj: any): boolean {
  // 具体实现，需要返回一个boolean值
}

// Type Guard断言函数
function isPerson(obj: any): obj is Person {
  // 具体实现，返回true表示obj经过我们验证是Person类型，返回false表示obj经过我们验证不是Person类型
}
```
