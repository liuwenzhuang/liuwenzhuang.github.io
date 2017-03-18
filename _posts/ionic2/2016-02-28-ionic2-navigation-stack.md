---
title: 'Ionic 2之页面堆栈'
date: 2016-02-26 21:23:45
tag: ionic2
keywords: Cordova, 页面堆栈, 页面路由, Angular 2, @Page, Ionic 2基础, Ionic 2 basement, 堆栈, TypeScript, NavController, Navigation Stack
excerpt: 还记得Ionic 1中的state和router吗？他们两兄弟配合起来完成页面导航的功能，虽然它们使用起来并不算复杂，概念也很清晰，不过当页面增多、state嵌套等问题出现后复杂度也会增加，当复杂程度到达一定程度时工程必然难以维护和理解。而Ionic 2效仿原生页面堆栈的概念解决了上述问题。
---
[ionic2-class-decorator]: {% post_url 2016-02-26-ionic2-class-decorator %}
[NavController-docs]: https://ionicframework.com/docs/v2/api/navigation/NavController/
[Component-docs]: https://ionicframework.com/docs/v2/components/

还记得Ionic 1中的state和router吗？他们两兄弟配合起来完成页面导航的功能，虽然它们使用起来并不算复杂，概念也很清晰，不过当页面增多、state嵌套等问题出现后复杂度也会增加，当复杂程度到达一定程度时工程必然难以维护和理解。而Ionic 2效仿原生**页面堆栈**的概念解决了上述问题。

## 页面与组件

页面是应用的基石，是交互的基本单位，Ionic 2中页面是通过**组件**构成的，Ionic 2中实现了很多常用**组件**用于更快地构建应用，如Modal、Popup等。在[理解Ionic 2之class及其修饰器@App、@Pipe][ionic2-class-decorator]中我们接触到了**修饰器**的概念，并且简单介绍了`@App`和`@Pipe`的相关使用方式，使用**组件**也需要先使用**修饰器@Component**定义，下面是其基本使用方式：

~~~ javascript
import {Component} from '@angular/core';

@Component({
	templateUrl: "template.html"
})
export class PageName(){
	constructor(){

	}
}
~~~

使用**@Component**首先需要使用`import`导入，并使用`templateUrl`或`template`指定其页面构成。

## 页面堆栈

堆栈的概念大家都很熟悉，其基本原则是：**先入后出**。页面堆栈也不例外，可以将页面堆栈视为书箱，具体的页面视为不同的待放入书箱的书籍，每一次水平放入一本书，先放的书必然被后来的书“挡住”从而看不到了，想要重新看到就需要先将上面的书拿开。

 > 其实Ionic 2中与其说是页面堆栈，不如说是组件堆栈，组件包括但不限于页面，而类似于Modal、Popup、Alert等相关的组件也是由堆栈维护的，下面提及的页面其实是组件的意思。

Ionic 2中使用**NavController**操作**页面堆栈**。

~~~ javascript
// my-page.ts
import {Component} from '@angular/core';

@Component({
    templateUrl: "my-page.html"
})
export class MyPage(){
    constructor(public navCtrl: NavController) {
        // 使用this.navCtrl操作页面堆栈
    }
}
~~~

这里创造**NavController**的实例是为了在类中任意地方都能够使用。

**NavController**最基本的就是“放书”的`push`操作和“拿书”的`pop`操作，其具体操作类似于Array：

![NavController push操作](/assets/images/pages_push.png)

![NavController pop操作](/assets/images/pages_pop.png)

## push操作

`push`操作将一个页面放到**页面堆栈**的最顶层，使其对用户可见：

~~~ javascript
this.navCtrl.push(OtherPage);
~~~

使用`push`操作页面，只需要提供其页面组件的引用即可，当然首先要使用`import`将其导入：

~~~ javascript
import {OtherPage} from '../other-page/other-page';
~~~

### 页面间传值

大多情况下，页面之间需要通信，即页面之间需要进行数据传递，可以为`push`操作指定第二个参数作为页面间传递的参数：

~~~ javascript
// my-page.ts
this.navCtrl.push(OtherPage, {
    key1: value1,
    key2: value2
});
~~~

在OtherPage中可以使用`NavParams`获取到其他页面传至本页面的值：

~~~ javascript
// other-page.ts
import {Component} from '@angular/core';

@Component({
    templateUrl: "other-page.html"
})
export class OtherPage(){
    constructor(public navCtrl: NavController, public navParams: NavParams) {
        const data = this.navParams.data;
        const value1 = this.navParams.get('key1');
        const value2 = this.navParams.get('key2');
    }
}
~~~

## pop操作

和`push`对应的是`pop`操作，其实很多时候并不需要手动执行`pop`操作，Ionic 2中使用`push`操作时，导航栏上会加上返回按钮用于回到上一页面，也就是说`pop`操作会被自动执行。当然手动`pop`操作也是必要的，如用户注销需要跳转至登录页面等场景均需要手动调用`pop`操作：

~~~ javascript
this.navCtrl.pop();
~~~

## 总结

**NavController**的功能很多很强大，这里只介绍了其最基本的功能，请大家移步[官方文档][NavController-docs]。

> 参考文档：<br>
> [理解Ionic 2之class及其修饰器@App、@Pipe][ionic2-class-decorator]<br>
> [Ionic 2 NavController官方文档][NavController-docs]<br>
> [Ionic 2 Component官方文档][Component-docs]