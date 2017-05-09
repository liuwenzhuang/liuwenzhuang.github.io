---
title: 'Angular 2 ngForm中的ngModel、[ngModel]和[(ngModel)]'
date: 2016-04-02 21:23:45
tag: ionic2
thumbnail: 'angular_logo.png'
keywords: Event, EventEmitter, @Output, Component, ngModel， ngForm, @Input, 双向数据绑定, 单向数据绑定, Angular 2,
excerpt: “对呀对呀！……回字有四样写法，你知道么？”，当时鲁大大如此讽刺孔乙己，意味着老孔这个被科举制毒害的人注意此种无用之物实在可悲。但是在Angular 2的世界中，很少存在无用之物，ngModel有三种写法，你知道吗？
---
[angular-components-event]: {% post_url 2016-03-11-angular2-component-data-binding-and-event %}

“对呀对呀！……回字有四样写法，你知道么？”，当时鲁大大如此讽刺孔乙己，意味着老孔这个被科举制毒害的人注意此种无用之物实在可悲。但是在Angular 2的世界中，很少存在无用之物，ngModel有三种写法，你知道吗？

表单的设计永远都是应用的重头戏，而其中最基本的功能点即是通过一个个输入组件实现的，为此Angular 2为我们提供了锋利的武器：**ngModel**。而其不同的使用方式有着大不相同的作用：

## ngModel

如果单独使用ngModel，且没有为其赋值的话，它会在其所在的ngForm.value对象上添加一个property，此property的key值为ngModel所在组件设置的name属性的值：

~~~ html
<form novalidate #f="ngForm">
    <input type='text' name='userName' placeholder='Input your userName' ngModel>
</form>
<p>
    {% raw %}{{ f.value | json }}{% endraw %}    // { "userName": "" }
</p>
~~~

此时需要注意的是，单独使用ngModel时，**如果没有为ngModel赋值的话，则必须存在name属性**。

 > 也就是说，单独ngModel的作用是通知ngForm.value，我要向你那里加入一个property，其key值是组件的name属性值，其value为空字符串。

## [ngModel]

可是，如果想向ngForm中添加一个有默认值的property需要怎么做呢？这时就需要使用单向数据绑定的格式了，也就是[ngModel]：

~~~ html
this.model = {
    userName: 'Casear'
};

<form novalidate #f="ngForm">
    <input type='text' name='userName' placeholder='Input your userName' [ngModel]='model.userName'>
</form>
<p>
    {% raw %}{{ f.value | json }}{% endraw %}    // { "userName": "Casear" }
    {% raw %}{{ model | json }}{% endraw %}      // { "userName": "Casear" }，不会随着f.value的变化而变化
</p>
~~~

这里我们使用了单向数据绑定的特点，可以为ngForm.value添加一个带有初始值的property。

 > 注意单向数据绑定的特点，此时在表单输入框中做的任何改变都不会影响model中的数据，也就是说`this.model.userName`不会随着输入框的改变而改变。不过输入框改变会体现在`f.value`中。

## [(ngModel)]

上述的单向数据绑定在单纯地提供初始值很有用，不过总是有些场景需要将用户输入体现在我们的model上，此时就需要双向数据绑定了，也即[(ngModel)]：

~~~ html
this.model = {
    userName: 'Casear'
};

<form novalidate #f="ngForm">
    <input type='text' name='userName' placeholder='Input your userName' [(ngModel)]='model.userName'>
</form>
<p>
    {% raw %}{{ f.value | json }}{% endraw %}    // { "userName": "Casear" }
    {% raw %}{{ model | json }}{% endraw %}      // { "userName": "Casear" }，会随着f.value的变化而变化
</p>
~~~

这里我们不仅为ngForm.value添加了一个带有初始值的property，还能实现Model和View层的联动，尽管这种方式可能并不好，但是在某些情况下也不失为一种简便的方案。

 > 关于[(ngModel)]的内部逻辑可查看[Angular 2 父子组件数据通信][angular-components-event]。