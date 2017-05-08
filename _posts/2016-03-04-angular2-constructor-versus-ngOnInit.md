---
title: 'Angular之constructor和ngOnInit差异及适用场景'
date: 2016-03-04 21:23:45
tag: ionic2
thumbnail: 'angular_logo.png'
keywords: Input, Component, Ionic CLI, Angular 2, class, 类， construcotr, 构造函数, ngOnInit, ES6, 差别异同, TypeScript, 生命周期, lifecycle hooks
excerpt: Angular中根据适用场景定义了很多生命周期函数，其本质上是事件的响应函数，其中最常用的就是ngOnInit。但在TypeScript或ES6中还存在着名为constructor的构造函数，那ngOnInit和constructor之间有什么区别呢？它们各自的适用场景又是什么呢？
---
[angular-lifecycle-hooks-doc]: https://angular.io/docs/ts/latest/guide/lifecycle-hooks.html
[class-constructor-doc]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/constructor
[component-input-doc]: https://angular.io/docs/ts/latest/guide/attribute-directives.html#!#input

Angular中根据适用场景定义了很多生命周期函数，其本质上是事件的响应函数，其中最常用的就是`ngOnInit`。但在TypeScript或ES6中还存在着名为`constructor`的构造函数，开发过程中经常会混淆二者，毕竟它们的含义有某些重复部分，那`ngOnInit`和`constructor`之间有什么区别呢？它们各自的适用场景又是什么呢？

## 区别

`constructor`是ES6引入类的概念后新出现的东东，是类的自身属性，**并不属于Angular的范畴**，所以Angular没有办法控制`constructor`。`constructor`会在类生成实例时调用：

~~~ javascript
import {Component} from '@angular/core';

@Component({
    selector: 'hello-world',
    templateUrl: 'hello-world.html'
})

class HelloWorld {
    constructor() {
        console.log('constructor被调用，但和Angular无关');
    }
}

// 生成类实例，此时会调用constructor
new HelloWorld();
~~~

既然Angular无法控制`constructor`，那么`ngOnInit`的出现就不足为奇了，毕竟枪把子得握在自己手里才安全。

`ngOnInit`的作用根据官方的说法：

 > ngOnInit用于在Angular第一次显示数据绑定和设置指令/组件的输入属性之后，初始化指令/组件。

`ngOnInit`属于Angular生命周期的一部分，其在第一轮ngOnChanges完成之后调用，并且只调用一次：

~~~ javascript
import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'hello-world',
    templateUrl: 'hello-world.html'
})

class HelloWorld implements OnInit {
    constructor() {

    }

    ngOnInit() {
        console.log('ngOnInit被Angular调用');
    }
}
~~~

## constructor适用场景

即使Angular定义了`ngOnInit`，`constructor`也有其用武之地，其主要作用是**注入依赖**，特别是在TypeScript开发Angular工程时，经常会遇到类似下面的代码：

~~~ javascript
import { Component, ElementRef } from '@angular/core';

@Component({
    selector: 'hello-world',
    templateUrl: 'hello-world.html'
})
class HelloWorld {
    constructor(private elementRef: ElementRef) {
        // 在类中就可以使用this.elementRef了
    }
}
~~~

在`constructor`中注入的依赖，就可以作为类的属性被使用了。

## ngOnInit适用场景

`ngOnInit`纯粹是通知开发者组件/指令已经被初始化完成了，此时组件/指令上的属性绑定操作以及输入操作已经完成，也就是说在`ngOnInit`函数中我们已经能够操作组件/指令中被传入的数据了：

~~~ javascript
// hello-world.ts
import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'hello-world',
    template: `<p>Hello {% raw %}{{name}}{% endraw %}!</p>`
})
class HelloWorld implements OnInit {
    @Input()
    name: string;

    constructor() {
        // constructor中还不能获取到组件/指令中被传入的数据
        console.log(this.name);     // undefined
    }

    ngOnInit() {
        // ngOnInit中已经能够获取到组件/指令中被传入的数据
        console.log(this.name);     // 传入的数据
    }
}
~~~

所以我们可以在`ngOnInit`中做一些初始化操作。

## 总结

开发中我们经常在`ngOnInit`做一些初始化的工作，而这些工作尽量要避免在`constructor`中进行，`constructor`中应该只进行**依赖注入**而不是进行真正的业务操作。

## 参考文档

 > [Angular生命周期文档][angular-lifecycle-hooks-doc]<br>
 > [constructor文档][class-constructor-doc]<br>
 > [组件传值][component-input-doc]