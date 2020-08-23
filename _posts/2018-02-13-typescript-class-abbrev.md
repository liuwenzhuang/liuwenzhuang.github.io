---
title: TypeScript使用Class的简写形式
date: 2018-02-13 10:23:45
tag: ['TypeScript']
excerpt: TypeScript定义类时可以和Java有所不同，可以使用更简便的简写形式。
---

一般定义Class的代码：

```typescript
class Person {
    name: string;    // A1
    email: string;   // A2

    constructor(name: string, email: string) {
        this.name = name;
        this.email = email;
    }
}
```

首先我们在A1、A2两行中定义当前类的成员对象，然后为了正常生成实例，我们还需要在`constructor`中接收参数，并对成员对象赋值。虽然我们在Java中已经习惯了这种形式，但是在`TypeScript`中可以使用简写的形式：

```typescript
class Person {
    constructor(public name: string, public email: string) {
        this.name = name;
        this.email = email;
    }
}
```

我们需要做的很简单，删掉A1、A2行，在`constructor`的参数列表中，在参数前使用`public`、`protected`、`private`即可。

> 仅使用`readonly`修饰参数，其可见性是默认的`public`，如想改变可将`protected`、`private`搭配`readonly`使用，如`private readonly`
