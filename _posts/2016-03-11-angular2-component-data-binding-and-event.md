---
title: 'Angular 2 父子组件数据通信'
date: 2016-03-11 21:23:45
tag: ionic2
thumbnail: 'angular_logo.png'
keywords: Event, EventEmitter, @Output, Component, ngModel, @Input, 双向数据绑定, 单向数据绑定, Angular 2, class, 类， construcotr, 构造函数, ngOnInit, 父子组件, 组件间数据传递
excerpt: 如今的前端开发，都朝组件式开发模式靠拢，如果使用目前最流行的前端框架Angular和React开发应用，不可避免地需要开发组件，也就意味着我们需要考虑组件间的数据传递等问题。而Angular 2中通过事件机制为我们提供了很好的解决方案。
---
[angular-input-doc]: https://angular.io/docs/ts/latest/api/core/index/Input-interface.html
[angular-output-doc]: https://angular.io/docs/ts/latest/api/core/index/Output-interface.html
[angular-EventEmitter-doc]: https://angular.io/docs/ts/latest/api/core/index/EventEmitter-class.html
[angular-component-communication]: https://angular.io/docs/ts/latest/cookbook/component-communication.html
[ionic2-class-decorator]: {% post_url 2016-02-26-ionic2-class-decorator %}

如今的前端开发，都朝组件式开发模式靠拢，如果使用目前最流行的前端框架Angular和React开发应用，不可避免地需要开发组件，也就意味着我们需要考虑组件间的数据传递等问题，不过Angular 2已经为我们提供了很好的解决方案。

## 父组件和子组件

接触过面向对象编程的开发者肯定不会对父子关系陌生，在Angular 2中子组件存在于父组件“体内”，并且父子组件可以通过一些渠道进行通讯。

## 父组件向子组件传入数据 -- @Input

当我们着手开始开发一个组件时，第一件想到的应该就是为其传入数据，毕竟我们期望组件为我们处理某些工作通常就需要给其提供“养料”，毕竟不能又让马儿跑，又不给马儿吃草。Angular 2中子组件使用装饰器`@Input`接收父组件传入的数据：

~~~ javascript
// child-component.ts
import { OnInit, Component, Input } from '@angular/core';

@Component({
    selector: 'child-component',
    ...
})
export class ChildComponent implements OnInit {
    @Input
    count: number = 0;

    ngOnInit() {
        console.log(this.count);    // 父组件内传入的值或者我们自己设置的初始值0
    }

    increaseNumber() {
        this.count ++;
    }

    descreaseNumber() {
        this.count --;
    }
}
~~~

可以看到，我们使用装饰器`@Input`修饰了count属性，这就意味着`child-component`被使用时期望收到一个名为count的属性，当然不属于自己掌控的范围内要小心行事，别人使用我们的组件时什么情况都可能出现，所以我们为count设置了一个初始值，当父组件没有给我们的count属性传值时，我们就取此初始值。

~~~ javascript
// father-component.ts
import { Component } from '@angular/core';
import { ChildComponent } from '../child-component/child-component';

@Component({
    template: `
        <child-component [count]='initialCount'></child-component>
    `,
    ...
})
export class FatherComponent {
    initialCount: number = 5;
}
~~~

父组件使用`child-component`时，为count属性赋予初始值`initialCount`，即5，也就是说此时`ChildComponent`的`ngOnInit`方法中会打印出5。注意`[count]`语法标识了数据流向：父组件流入子组件，即**单向数据绑定**。**此时如果传入的数据是基本数据类型，子组件中对数组做任何操作都不会影响到父组件，但如果传入的不是基本数据类型，而是引用数据类型，则要格外注意子组件中对数据的操作可能会对父组件产生影响**。

## 子组件通知父组件数据已处理完成 -- @Output、EventEmitter

父组件传入数据给子组件之后并不是万事大吉了，就像父母养育孩子，供其读书，但孩子需要把学习进度、考试成绩等呈现给父母看（不管是否自愿...），父组件也需要子组件在合适的时机通知自己数据已经处理好，可以检阅了。而此时就需要使用**@Output**和**EventEmitter**了。

~~~ javascript
// father-component.ts
import { Component } from '@angular/core';
import { ChildComponent } from '../child-component/child-component';

@Component({
    template: `
        <child-component [count]='initialCount' (change)="countChange($event)"></child-component>
    `,
    ...
})
export class FatherComponent {
    initialCount: number = 5;

    countChange($event) {

    }
}
~~~

看看我们在父组件中加入了什么东东：

1.`(change)`，看到这样的语法第一时间就知道这是事件绑定，也就是说我们在父组件中监听子组件的某些变化，并能够在其变化时作出相关操作；

2.增加了`countChange`方法作为`change`事件的处理函数。

但是稍等，当我们为input标签指定type、placeholder等属性时，我们知道它们都已经被“实现了”，所谓“实现”，即这些属性在input标签上是有意义的。但是目前这里我们为`child-component`指定了名为`change`的事件是没意义的，因为其并未“实现”`change`事件，于是下一步我们就需要使用**@Output**和**EventEmitter**将其变得有意义：

~~~ javascript
// child-component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'child-component',
    ...
})
export class ChildComponent {
    @Input
    count: number = 0;

    @Output
    change = new EventEmitter();

    increaseNumber() {
        this.count ++;
        this.change.emit(this.count);
    }

    descreaseNumber() {
        this.count --;
        this.change.emit(this.count);
    }
}
~~~

让我们再来看看在子组件中增加了什么东东：

1.使用装饰器**@Output**修饰了`change`属性，并为其赋了初值为**EventEmitter**的实例；

2.在`increaseNumber`和`descreaseNumber`方法修改了`count`属性后，调用了`change`属性的`emit`方法通知父组件。

此时，我们在`ChildComponent`中实现了`change`，于是父组件中为`child-component`绑定`change`事件也就有意义了：当子组件通知父组件时，父组件可以获取到通知中携带的数据并进行下一步操作：

~~~ javascript
// father-component.ts
...
countChange($event) {
    this.initialCount = $event;
}
...
~~~

## 总结

不知道你有没有发现，其实上面我们模拟了“双向数据绑定”：父组件将数据传入子组件，子组件改变数据时通知父组件进行“同步更新”。但是要注意其实数据流向是单向的，即数据是父组件单向流入子组件，父组件数据的更新是通过子组件的事件通知以后才被更新。也就是说其实在Angular 2中：**双向数据绑定 = 单向数据绑定 + 事件**，以我们最熟悉的`ngModel`为例：

~~~ html
<input type='text' name='userName' [(ngModel)]="userName">
~~~

和下面的写法是等价的：

~~~ html
<input type='text' name='userName' [ngModel]="userName" (ngModelChange)="userName=$event">
~~~

同样的，如果将我们的`child-component`组件写作双向数据绑定的形式即为：

~~~ html
<child-component [(count)]='initialCount'></child-component>
~~~

## 参考文档

> [理解Ionic 2之class及其修饰器@App、@Pipe][ionic2-class-decorator]
> [@Input官方文档][angular-input-doc]<br>
> [@Output官方文档][angular-output-doc]<br>
> [EventEmitter官方文档][angular-EventEmitter-doc]<br>
> [组件间通信][angular-component-communication]