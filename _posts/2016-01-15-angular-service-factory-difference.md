---
title: 'Angular Service和Fatory的差异'
date: 2016-01-15 22:30
tag: ionic1
keywords: AngularJS, Service, Factory, AngularJS中Service和Factory的异同点, 混合移动App开发框架, 前端开发, 使用Ionic和Angular等前端技术开发手机App, Android开发, iOS开发, 微信开发
---

学习AngularJS的过程中，必不可少地需要使用**Service**或**Factory**进行辅助开发，他们是Angular DI系统（Dependency Injection）中的重要成员，而他们有什么区别呢？我想大多数人都被告知他们差不多，相同的功能使用**Service**或**Factory**都可以实现，但事实并非如此。通过他们实现某些特定的功能相信对于开发人员并不困难，但了解他们之间具体的差异就需要费一些功夫了。

# Service

先看下Service的特点，Angular通过`.service()`方法声明一个**Service**，如：

~~~ javascript
var app = angular.module('app');
app.service('BalaService', BalaService);
function BalaService($log) {
    this.sayBala = function(msg) {
        $log.info(msg || 'bala');
    }
}
~~~

然后我们就可以在需要使用此Service的地方（通常在Controller中）将其作为依赖注入，如：

~~~ javascript
angular.module('app')
    .controller('BalaCtrl', ['BalaService', function(BalaService) {
        BalaService.sayBala('This is BalaCtrl called BalaService...');
    }]);
~~~

## 什么是Service

上面对于Service的使用方式相信大家都非常熟悉，那么什么是Service？Service只是一个function，在应用中充当了业务层的角色，注意他仅仅是一个function，和其他JS中的function无任何区别，唯一需要注意的一点是Service的单例性。

## 何时使用Service

当你想将封装的功能暴露给其他模块使用时，就可以使用Service暴露方法作为公共API使用，就像上面的例子中那样，使用Service很简单明了。

# Factory

再来看下Factory，首先声明方式肯定不同于Service，Angular使用`.factory()`方法声明一个Factory，前文也说到通常情况下Service和Factory都能完成某项特定的需求，如很容易使用Factory来改写上文的`BalaService`：

~~~ javascript
var app = angular.module('app');
app.factory('BalaService', BalaService);
function BalaService($log) {
    return {
        sayBala: sayBala
    };
    sayBala: function(msg) {
        $log.info(msg || 'bala');
    }
}
~~~

但是Factory并不只是Service的另一种实现方式而已，实际上Factory的功能包含了Service的功能，即Factory要更加灵活和强大。看起来使用Factory也仅仅只是返回了一个Object字面量而已，而且实现起来比Service更加繁琐，但其实Factory可以返回任何东西，返回Object字面量只是最通常的情形，对特定需求来说，开发者可以返回函数、函数闭包，甚至只返回字符串这种简单数据类型的数据，具体如何操作，要根据需求而定。

上面展示了在Factory中返回Object字面量的例子，下面我们通过Factory返回闭包：

~~~ javascript
var app = angular.module('app');
app.factory('BalaService', BalaService);
function BalaService($log) {
    return function(msg) {
        $log.info(msg || 'bala');
    };
}
~~~

这样，我们就可以在需要使用此Factory的地方（通常是在Controller中）以类似于下面的方式进行使用了：

~~~ javascript
app.controller('BalaCtrl', ['BalaService', function(BalaService) {
    BalaService('This is BalaCtrl called BalaService...');
}]);
~~~

想必大家对于创建自定义对象的方式并不陌生，结合使用构造函数和原型创建自定义对象是最常用的方式：通过构造函数定义实例属性以避免不同对象实例操作对属性可能产生的影响，通过原型的方式定义方法和共享的属性，以达到方法共享的目的。这些操作也可以放在Factory进行：

~~~ javascript
var app = angular.module('app');
app.factory('PersonService', PersonService);
function PersonService($log) {
    function Person(name, age) {
        this.name = name;
        this.age = age;
    }
    Person.prototype.sayPerson = function() {
        $log.info(this.name + ":" + this.age + " years old.");
    };

    return Person;
}
~~~

这样，我们就可以在需要使用此Factory的地方（通常是在Controller中）以类似于下面的方式进行使用：

~~~ javascript
app.controller('PersonCtrl', ['PersonService', function(PersonService) {
    var michale = new PersonService('michale', 18);
    michale.sayPerson();
}]);
~~~

# 总结

可以看到，Factory的功能非常强大，其“返回一切”的特性给开发带来了无穷多的可能性，而Service只是其中一小部分功能而已。但是需要注意的是不管Factory还是Service都是单例的。