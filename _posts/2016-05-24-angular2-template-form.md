---
title: 'Angular2 Form之模板驱动'
date: 2016-05-24 21:23:45
tag: ['angular2']
keywords: Angular 2, TypeScript, Form, template-driven, model, 模板, 模型, 表单
excerpt: Web前端开发中，form表单的设计永远是重头戏，Angular 2提供了两种构建form表达的方式：模板驱动和模型驱动。其相应的处理方式以及API方面都有很大不同，本文先介绍我们最熟悉的模板驱动的form表单设计方式，包括`ngForm`、`ngModel`、`ngModelGroup`、`ngSubmit`等Angular 2在模板驱动中必不可少的directives。
---

[angular2-ngModel]: {% post_url 2016-04-02-angular2-ngModel-in-ngForm %}

Web前端开发中，form表单的设计永远是重头戏，Angular 2提供了两种构建form表达的方式：模板驱动和模型驱动。其相应的处理方式以及API方面都有很大不同，本文先介绍我们最熟悉的模板驱动的form表单设计方式，包括`ngForm`、`ngModel`、`ngModelGroup`、`ngSubmit`等Angular 2在模板驱动中必不可少的directives。

 > **模板驱动**，或者称其为Template-Driven，首先利用HTML标签构建页面，然后利用Angular的directives接管form表单元素的控制权，最常见的如利用ngModel双向绑定的能力读写输入表单元素，利用required、maxlength等控制表单元素。通过Angular的directives与数据模型交互，可以完成诸如跟踪表单状态并对表单进行正确性校验，错误提示等功能，从而引导用户顺利提交表单。

下面我们根据上面对**模板驱动**的介绍来一步步通过**模板驱动**的方式实现form表单的设计：

## 利用HTML标签构建页面

这一步和我们不利用任何框架构建页面没有任何区别，这里我们只是实现了很简单的登录form表单：

```html
<!-- login.html -->
<form novalidate>
  <label for='username'>用户名：</label>
  <input name='username' type='text'>

  <label for='password'>密  码：</label>
  <input name='password' type='password'>

  <button type='submit'>登录</button>
</form>
```

好，现在我们已经有了骨架了，因为我们未加任何CSS，可能会显得比较丑，不过先不要在意这些细节，继续我们的征程。写代码和台球、象棋很像，完成第一步之前就需要对第二步、第三步等后续步骤做到心中有数，看得越远离成功就越近。我们剩下的工作包括：

 - 利用ngModel、ngForm等将用户输入的用户名和密码和我们的数据模型绑定起来
 - 验证用户输入并给出相应错误提示
 - 禁用登录按钮，直到表单正确为止
 - 提交表单

## 准备工作

不过先别急，我们先将准备工作处理一下，首先因为我们要使用**模板驱动**的方式构建form表单，我们首先需要在`@NgModule`中引入`FormsModule`：

~~~ javascript
// app.module.ts
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [
    //...
  ],
  imports: [
    //...
    FormsModule
  ],
  bootstrap: [...]
})
export class AppModule {

}
~~~

然后我们需要定义用户输入的用户、密码的接口：

~~~ javascript
// user.interface.ts
export interface User {
  username: string;
  password: string;
}
~~~

Buddy, move on...

### 模型类的基础实现

一般来说，我们不必过早实现模型类，除非我们需要和模板交互，比如设置上次登录成功的用户名到模板上、获取用户输入、提交表单等工作。这里我们先实现一个基础的模型类：

~~~ javascript
// login.ts
import { Component } from '@angular/core';
import { User } from '../user.interface';

@Component({
  selector: 'login',
  templateUrl: 'login.html'
})
export class LoginComponent {
  // 用于连接模板的模型
  user: User = {
    username: '',
    password: ''
  }
  constructor() {

  }
}
~~~

我们定义了`user`作为连接模板的模型数据，以便我们能够获取到用户输入，不过这需要使用**模板驱动**的重点：`ngForm`、`ngModel`等Angular directives的绑定。

## 绑定ngForm和ngModel

好，我们成功回到了主线任务，现在开始利用`ngForm`和`ngModel`将模型与模板连接起来：

~~~ html
<!-- login.html -->
<form novalidate #form="ngForm">
  <label for='username'>用户名：</label>
  <input name='username' type='text' ngModel>

  <label for='password'>密  码：</label>
  <input name='password' type='password' ngModel>

  <button type='submit'>登录</button>
</form>
~~~

下面我们分别来看：

### ngForm

`ngForm`指令的作用是接管对form表单的控制，其中包括各form表单元素的值、错误状态信息等各种“实时”信息，而`#form="ngForm"`的作用是将这些信息赋予变量`form`。啊哈，典型的Angular 2引用形式。

我们可以使用下面的方式查看form表单的值以及其状态：

~~~ html
<!-- login.html -->
<form ...>
...
</form>
{% raw %}{{ form.value | json }}{% endraw %}
{% raw %}{{ form.status }}{% endraw %}
~~~

 > 这里“实时”的意思是指用户输入或者通过代码而导致的form表单的变化，都能反映到`ngForm`中。

### ngModel

关于ngModel的解释和其使用方式，请参见我[上一篇文章][angular2-ngModel]，在此就不再赘述。

## 表单验证

我们已经完成了大部分功能，但是却缺少了很重要的一个环节：表单的验证。我们不能完全依赖后台进行表单验证，一方面用户体验不好，另一方面也增加了后台的压力（除非你想和后台哥们阳台单挑）。下面就来验证表单：

### 禁用提交按钮

理论上来说，我们并不能限制用户的行为，也就是说用户想要点多少次提交按钮都是合理的，但是我们可以通过合理的界面提示以及良好的交互引导用户的行为。在表单尚未合理时，我们希望禁用提交按钮，以防止代码浪费（前端和后端）：

~~~ html
<!-- login.html -->
<form novalidate #form='ngForm'>
  ...
  <button type='submit' [disabled]='!form.valid'>登录</button>
</form>
~~~

这里我们使用了`[disabled]`动态属性，来动态地调节登录按钮的状态，当登录表单不合理时就禁用登录按钮，而当表单合理时，就启用登录按钮。

### 控制输入框细节

直到这里一切都尽在掌握，不过我们还需要对输入框进行更细致的控制，如控制其必须输入、控制器最小/最大长度等等，并在用户输入不合理给出相应提示：

~~~ html
<!-- login.html -->
<form novalidate #form='ngForm'>
  <label for='username'>用户名：</label>
  <input name='username'
         type='text'
         required
         maxlength='20'
         minlength='3'
         ngModel>

  <label for='password'>密  码：</label>
  <input name='password'
         type='password'
         required
         maxlength='20'
         minlength='6'
         ngModel>

  <button type='submit' [disabled]='!form.valid'>登录</button>
</form>
~~~

非常简单，我们对两个输入框进行了更多的限制，不过这也意味着要进行更多的校验和提示工作，好在Angular 2已经帮我们想到了，我们可以使用下面的方式看到表单元素不合理的地方：

~~~ html
<!-- login.html -->
<form #form='ngForm' ...>
  ...
</form>
<div class='error-info'>
  {% raw %}{{ form.controls.username?.errors | json }}{% endraw %}
  {% raw %}{{ form.controls.password?.errors | json }}{% endraw %}
</div>
~~~

 > ?. 称为安全引用，可以防止产生异常，从而避免“死亡白屏”的产生。

我们这里使用的`form.controls.name`的形式可以获取到相应表单元素的详细信息，如错误信息、限制条件（required, minlength等）等。

### 用户输入不合理时给出提示

上面的错误提示只能是开发人员才能看得懂，对用户来说期望得到是更加清晰明确的错误提示，我们可以为每个需要限制的输入框针对不同的错误情况为用户提示不同的信息：

~~~ html
<!-- login.html -->
<form novalidate #form='ngForm'>
  <label for='username'>用户名：</label>
  <input name='username'
         type='text'
         required
         maxlength='20'
         minlength='3'
         ngModel>
  <div class='error' *ngIf='form.controls.username?.errors?.required'>用户名是必填项</div>
  <div class='error' *ngIf='form.controls.username?.errors?.minlength'>用户名长度不能少于3位</div>
  <div class='error' *ngIf='form.controls.username?.errors?.maxlength'>用户名长度不能多于20位</div>

  <label for='password'>密  码：</label>
  <input name='password'
         type='password'
         required
         maxlength='20'
         minlength='6'
         ngModel>
  <!-- 和用户名的错误提示类似 -->

  <button type='submit' [disabled]='!form.valid'>登录</button>
</form>
~~~

看起来不错，不过用户第一次看到此页面时就会看到报错信息，这就有点尴尬了。我们可以利用下面的方式处理此问题：

~~~ html
<div class='error' *ngIf='form.controls.username?.errors?.required && form.controls.username?.touched'>用户名是必填项</div>
~~~

 > 只有用户在此输入框上出发了blur事件，form.controls.name.touched才为true。

接近完美，不过这么长的引用也是醉了，我们可以像`#form='ngForm'`一样，通过Angular 2的引用机制获得输入框的引用：

~~~ html
<!-- login.html -->
<form novalidate #form='ngForm'>
  <label for='username'>用户名：</label>
  <input name='username'
         ...
         #username='ngModel'>
  <div class='error' *ngIf='username.errors?.required && username.touched'>用户名是必填项</div>
  <div class='error' *ngIf='username.errors?.minlength && username.touched'>用户名长度不能少于3位</div>
  <div class='error' *ngIf='username.errors?.maxlength && username.touched'>用户名长度不能多于20位</div>
  ...
</form>
~~~

简单即是美。

## 提交表单

Angular 2中表单提交只需要使用`(ngSubmit)`指定表单提交函数即可，而为了在代码中能够处理form表单，多数情况下我们还需要传入`ngForm`的引用：

~~~ html
<!-- login.html -->
<form novalidate #form='ngForm' (ngSubmit)='submitForm($event, form)'>
...
</form>
~~~

~~~ javascript
// login.ts
import ...;

@Component({})
export class LoginComponent {
  // 用于连接模板的模型
  user: User = {
    username: '',
    password: ''
  }
  constructor() {}

  submitForm($event, form) {
    console.log(form.value, form.valid);
  }
}
~~~

通过将`ngForm`的引用传给处理函数，我们就可以为所欲为了，如对其进行某些特殊校验或者更常见地用其与后台交互。

## 总结

Angular 2中为我们提供的**模板驱动**的表单设计方法，易于理解和掌握。而本文只是描述了最基础的使用方式，其他诸如自定义校验指令等方面并没有涉及，更多更强大的功能因为篇幅原因留待以后再叙。