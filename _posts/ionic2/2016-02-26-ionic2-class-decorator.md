---
title: '理解Ionic 2之class及其修饰器@App、@Pipe'
date: 2016-02-26 21:23:45
tag: ionic2
keywords: Cordova, Ionic CLI, Angular 2, class, Ionic 2基础, Ionic 2 basement, ES6, TypeScript, 修饰器, App, Pipe, 管道
excerpt: ES6及TypeScript的出现使得灵活的JavaScript语言增添了一丝严谨，从最基本的声明变量的方式到复杂的对象抽象都有极大的影响。而class的出现可谓是千呼万唤始出来，而在Ionic 2及Angular 2中又对class做出了怎样的诠释呢？
---
[ionic2-config-docs]: http://ionicframework.com/docs/v2/api/config/Config/
[DecimalPipe-docs]: https://angular.io/docs/ts/latest/api/common/index/DecimalPipe-pipe.html
[angular2-pipe-docs]: https://angular.io/docs/ts/latest/guide/pipes.html

# 理解class

只要接触过一门面向对象语言，如Java、C#等，就不会对class感到陌生，其有个响亮的名号：类。它是编程的宠儿，聚万千宠爱于一身，于是其能够开枝散叶，结婚生子，即为继承。但是对于JavaScript开发者来说，class还只是刚刚被实现的东东，当年为了构建一个形似class的东东需要这样做：

~~~ javascript
function Animal (power, speed) {
    this.power = power;
    this.speed = speed;
}

Animal.prototype.run = function() {
    // 具体实现
}

var tiger = new Animal(2000, 1000);
tiger.run();
~~~

而如今有了更骚气的走位：

~~~ javascript
// ES6语法
class Animal {
    constructor(power, speed) {
        this.power = power;
        this.speed = speed;
    }
    
    run() {
        // 具体实现
    }
}

let tiger = new Animal(2000, 1000); // ES6中使用var声明变量已经成为过去式
tiger.run();
~~~

~~~ javascript
// TypeScript
class Animal {
    // ES6中不能如此定义变量
    power = 0;
    speed = 0;
    
    constructor(power, speed) {
        this.power = power;
        this.speed = speed;
    }

    run() {
        // 具体实现
    }
}

let tiger = new Animal(2000, 1000); // TypeScript中使用var声明变量已经成为过去式
tiger.run();
~~~

对类熟悉的人自然不会对名为**构造函数**的方法陌生，也就是上面的constructor，constructor会在类被实例化之后立即被调用，是处理一些初始化操作的绝好地点。而类的方法、属性等想必大家都能轻易理解，只是要注意开发过程过TypeScript和ES6的差异。

# Angular 2及Ionic 2中的class

接触过Angular 2或Ionic 2开发的人想必遇到的第一个陌生人就是`@App`吧，随后可能还会遇到`@Page`、`@Pipe`等被称作为**装饰器**的东东，那这个**装饰器**又是什么作用呢。**装饰器**顾名思义，那只是class们感觉自己的样子都一样太没个性，于是就想出办法打扮一下自己，也就是给自己戴上了帽子。当然，为了突出自己的特点，帽子的颜色和式样自然也就不同。本文我们首先理解一下`@App`和`@Pipe`，其他的“帽子”有些复杂，另外再作叙述。

## @App

可还记得Ionic 1中的`ng-app`？那是标志领地的旗帜，通常我们将其加在`body`标签上，作为其属性，并且给其赋值为一个定义好的module，然后就宣示着`body`标签的内容就属于我Ionic 1或Angular 1的领地了：

~~~ javascript
// html
<body ng-app="app">

// js
angular.module('app', ['ionic']);
~~~

因为Ionic 1变成了Ionic 2，`ng-app`于是也改头换面成为了`@App`了，当然其使用方式也发生了一点变化：

首先我们需要在html中加入`<ion-app></ion-app>`标签，然后我们在js文件中新建一个类，并且给它戴上名为`@App`的帽子：

~~~ javascript
// html
<ion-app></ion-app>

// js
import {App, IonicApp, Config, Platform} from 'ionic/ionic';

@App({
    templateUrl: 'app/app.html'
})
Class MyApp {

}}
~~~

等等，出现的`templateUrl`是什么鬼？所谓五脏俱全可为麻雀也。`templateUrl`就是组成“麻雀”的必须物质，其指定了一个页面文件，而这个页面文件将被插入到`<ion-app></ion-app>`标签中。必需物质有了之后，麻雀还需要翅膀、羽毛等辅助才能更好的生存，于是我们就可以对其进行**加工配置(config)**：

~~~ javascript
import {App, IonicApp, Config, Platform} from 'ionic/ionic';

@App({
    templateUrl: 'app/app.html',
    config: {
        backButtonText: 'Go Back',
        modalEnter: 'modal-slide-in',
        modalLeave: 'modal-slide-out',
        pageTransition: 'ios'
    }
})
Class MyApp {

}}
~~~

对具体工程而言，可以进行的配置有很多，包括页面返回按钮处的文字、模态框弹出时和消失时的动画、页面跳转的动画等等等等，具体可参考[官方文档][ionic2-config-docs]。

 > @App是开发Ionic 2工程时首先需要掌握的，被@App装饰的类是Ionic 2应用的基础。

## @Pipe

还记得当年使用Ionic 1/Angular 1中的`filter`时的快感吗，不论是在页面中还是在js中，`filter`都曾带给我们极大的便利，短小精悍是其颁奖词。所谓优良传统需继承，Ionic 2/Angular 2中自然也不会丢弃如此强大的工具了，不过它也改头换面成为了`@Pipe`：

### @Pipe基本语法

~~~ javascript
import {Pipe} from 'angular2/core'

@Pipe({
	name: 'myPipe'  // 使用时的名称
})
export class MyPipeClass{
    /**
     * @description 具体处理方法的实现
     * @param value 待处理的数据
     * @param args 附加参数
     * @return 处理完成的数据
     */
	transform(value, args) {
		return value;
	}
}
~~~

### filter和@Pipe的对比

~~~ javascript
// Ionic 1/Angular 1中的filter
.filter('hello', function() {
    return function(value) {
        return 'Hello ' + value;
    }
});
~~~

~~~ javascript
// Ionic 2/Angular 2中的@Pipe

// pipes/Hello.ts
import {Pipe} from 'angular2/core'

@Pipe({
	name: 'hello'
})
export class Hello {
	transform(value) {
		return "Hello " + value;
	}
}
~~~

而其使用方式倒是木有什么太大变化：

~~~ html
<!-- Ionic 1/Ionic 2 -->

<!-- html -->
{% raw %}<span>{{'lwz' | hello}}<span>{% endraw %}
<!-- 输出的页面代码为 <span>hello lwz</span> -->
~~~

可以看到`@Pipe`的主要作用是对传入的数据进行处理，然后吐出来，就像奶牛，吃的是草，挤的是奶。

### 接受附加参数的@Pipe

如果你已经接触过Angular 2内置的[DecimalPipe][DecimalPipe-docs]，那么你肯定注意到了除了能给其传入待处理的数据，还能指定参数获得想要的处理结果，如：

~~~ html
{% raw %}<p>e (3.1-5): {{e | number:'3.1-5'}}</p>{% endraw %}
~~~

其中'3.1-5'表示想得到整数部分最少需要三位数，不足三位的使用0补齐，小数部分最少1位小数，最多5位小数。

强大无匹啊，那么我们如何实现接受附加参数的`@Pipe`呢，首先附加参数可以作为具体实现函数的第二个参数传入，然后我们就能够为所欲为了（淫笑脸），下面我们实现一个简单的将给定数据加倍的`@Pipe`，倍数由用户指定：

~~~ javascript
import {Pipe} from 'angular2/core'

@Pipe({
	name: 'multiple'
})
export class Multiple {
	transform(value, num) {
		return value * num;
	}
}
~~~

使用时应该类似这样：

~~~ html
{% raw %}<span>{{ e | multile:3 }}</span>{% endraw %}
<!-- 如果e是5的话，那么得到的结果将是<span>15</span> -->
~~~

 > 上面只是简答地介绍了`@Pipe`的语法及其实现方法，当然其功能强大之处全靠自己实现，此处不再赘述。

> 参考文档：<br>
> [理解Ionic 2之import]({% post_url 2016-02-21-ionic2-understand-import %})<br>
> [Ionic 2 @App config官方文档][ionic2-config-docs]<br>
> [Angualr 2 @Pipe官方文档][angular2-pipe-docs]