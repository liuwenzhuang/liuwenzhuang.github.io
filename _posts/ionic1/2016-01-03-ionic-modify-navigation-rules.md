---
title: 'Ionic App修改特定页面路由规则'
date: 2016-01-13 17:45:03
tag: ionic1
keywords: Ionic修改路由规则, Ionic修改返回键事件, Ionic应用生命周期, 应用历史堆栈, AngularUI Router
excerpt: Ionic 1应用使用AngularUI Router管理应用内的页面跳转关系，其默认的跳转的规则能够满足我们大部分的需求，但用户的需求总是各式各样的，需要开发者有能力随机应变，本文介绍了Ionic修改默认的页面跳转规则，分为对硬件返回键的处理以及对页面返回按钮的处理，使得页面跳转能够按照我们的特殊需求进行。
---
[angular-ui-router]: https://github.com/angular-ui/ui-router/wiki
Ionic使用[AngularUI Router][angular-ui-router]管理应用内页面的跳转关系，将每个页面定义为一个
“state”，比起使用url管理页面更加灵活强大。当用户在App内进行页面跳转时，Ionic会通过类似栈的形式
将页面历史保存起来，当用户点击**返回键**（指硬件设备上的返回按键）或**页面返回按钮**时，当前页面即栈顶页面被弹出，其父页面成为可见页面：

![页面历史栈](/assets/images/navigation_stack.png)

最近项目中遇到一个需求：父页面为列表，通过父页面可以进入到各个子页面，并且各个子页面之间能够相互跳转，但是当用户
在任意子页面中点击**返回键**或**页面返回按钮**时需要直接进入父页面，而不是逐页面返回。类似下图所示：

![修改历史栈](/assets/images/navigation_custom.png)

注意其中的红色箭头表示非常规的页面跳转，通常情况下页面返回分为两种情况，一种通过**返回键**，另一种通过**页面返回按钮**，
我们需要对两种情况做出相应处理：

# 处理**返回键**

> 对于IOS设备来说不存在**返回键**的概念，故如果是开发IOS应用，可以跳过本节。

Ionic为我们提供了监听**返回键**的方法：

~~~ javascript
registerBackButtonAction(callback, priority, [actionId])
~~~

我们可以在其中的回调中实现我们需要的功能----直接返回父列表：

我们可以在子页面的controller或`app.js`的`run`方法中监控当前页面是否为子页面，如果是子页面就直接跳转到父列表页面：

~~~ javascript
//do not forget add $ionicPlatform, $state, $ionicHistory as dependency
var deregister;
$ionicPlatform.ready(function () {
    deregister = $ionicPlatform.registerBackButtonAction(function (e) {
        if ($state.includes('CHILD_STATE')) {
            $state.go('PARENT_STATE');
        } else {
            $ionicHistory.goBack();
        }
        e.preventDefault();
        return false;
    }, 101);
});
~~~

> 1. `registerBackButtonAction`的第二个参数表示事件优先级，这里使用101表示只重写*页面返回*的事件（优先级为100），其他
诸如关闭popover、actionsheet的操作不受影响，因为它们的优先级更高；<br>
> 2. `CHILD_STATE`表示子页面的state，`PARENT_STATE`表示父列表页面的state，根据实际情况修改；<br>
> 3. `registerBackButtonAction`返回一个用于解除监控**返回键**的函数。

如果在子页面的controller中监控**返回键**，要注意监控和解除监控的时机，比如我们希望在进入子页面时进行监控，离开子页面时就将监控解除，
可以利用Ionic的声明周期机制：

~~~ javascript
// do not forget add $scope, $ionicPlatform as dependency
var deregister;
$scope.$on('$ionicView.beforeEnter', function () {
    deregister = $ionicPlatform.registerBackButtonAction(function (e) {
        //suit yourself
    });
});

$scope.$on('$ionicView.beforeLeave', function () {
    deregister(); //remove listener
});
~~~

# 处理**页面返回按钮**

App都有**页面返回按钮**用于页面返回，Ionic中**页面返回按钮**的默认点击事件为:

~~~ javascript
$rootScope.$ionicGoBack = function(backCount) {
    $ionicHistory.goBack(backCount);
};
~~~

而在JavaScript中，函数名只是函数指针，可以根据需要做出调整，也就是说我们可以通过
改写`$rootScope.$ionicGoBack`的实现来修改**页面返回按钮**的点击事件。由于只是希望修改子页面中
**页面返回按钮**的点击事件，故注意做好保存与恢复的工作：

~~~ javascript
// do not forget add $scope, $rootScope, $state as dependency
var oldSoftBackHandler;
$scope.$on('$ionicView.enter', function () {
    oldSoftBackHandler = $rootScope.$ionicGoBack; // store original implementation
    $rootScope.$ionicGoBack = function () { // modify ion-nav-back-button's click event
        $state.go('PARENT_STATE');
    };
});

$scope.$on('$ionicView.beforeLeave', function () {
    $rootScope.$ionicGoBack = oldSoftBackHandler;// restore ion-nav-back-button's default click event
});
~~~

# 总结

当修改默认实现时，要注意做好保存和恢复的工作，以防止其他默认状态下功能不正常，而且要注意页面的声明周期，在适当的时间遇到合适的
人做合适的事是我的愿望。