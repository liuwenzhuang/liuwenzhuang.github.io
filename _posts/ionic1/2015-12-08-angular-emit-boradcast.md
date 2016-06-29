---
title: 'Angular $scope和$rootScope事件机制之$emit、$broadcast和$on'
date: 2015-12-08 22:30
tag: ionic1
thumbnail: 'angular_event.jpg'
thumbnail_alt: 'Angular $scope和$rootScope事件机制介绍与应用'
keywords: AngularJS, $scope, $rootScope, event, 事件机制, $broadcast, $emit, $on, 事件广播, 事件冒泡, 发布/订阅模式, 混合移动App开发框架, 前端开发, 使用Ionic和Angular等前端技术开发手机App, Android开发, iOS开发, 微信开发
---
Angular按照**发布/订阅模式**设计了其事件系统，使用时需要“发布”事件，并在适当的位置“订阅”或“退订”事件，就像邮箱里面大量的订阅邮件一样，当我们不需要时就可以将其退订了。具体到开发中，对应着$scope和$rootScope的`$emit`、`$broadcast`和`$on`方法。本文介绍Angular的事件机制，包括$scope和$rootScope处理事件上的异同，$broadcast、$emit和$on的使用方式及他们区别等内容。

## $scope与$scope之间的关系，$scope与$rootScope`之间的关系

要理解Angular的事件机制，首先需要了解`$scope`与`$scope`之间的关系以及`$scope`与`$rootScope`之间的关系。`$rootScope`是唯一真神，是万域起源，是所有`$scope`的最终祖先。而`$scope`与`$scope`之间可能的关系包括父子关系和兄弟关系。还记得controller之间的关系吗，Angular为每个controller分配一个独立的`$scope`，controller之间的关系也对应着`$scope`之间的关系：

~~~ javascript
<div ng-controller="ParentCtrl as parent">
    {{ parent.data }}
    <div ng-controller="SiblingOneCtrl as sib1">
        {{ sib1.data }}
    </div>
    <div ng-controller="SiblingTwoCtrl as sib2">
        {{ sib2.data }}
    </div>
</div>
~~~

## 发布、订阅、退订

`$broadcast`和`$emit`用于发布事件，他们将事件名称和事件内容发布出去，就像是高考榜单一样，事件名称相当于考生的名字，而事件内容相当于考生的成绩等信息：

~~~ javascript
$scope.$broadcast('EVENT_NAME', 'Data to send');
$scope.$emit('EVENT_NAME', 'Data to send');
~~~

`$on`用于订阅事件，事件名称是订阅的唯一标识，每个考生看榜单时都要寻找自己的名字，然后根据自己的成绩等信息决定下一步应该报考什么学校：

~~~ javascript
$scope.$on('EVENT_NAME', function(event, args) {
    // balabala
});
~~~

Angular的退订事件有些奇怪，并**没有**类似于其他语言的`$off`方法，所以不要想当然的按照如下方式进行事件的退订操作：

~~~ javascript
// 不要这样做
$scope.$off('EVENT_NAME');
~~~

事实上，Angular的事件退订方法隐藏在事件订阅里面：使用`$on`订阅事件时会返回一个函数，而此函数就是用来退订事件的方法，就像是考生看到了自己的成绩后禀告父母大人，“商量着”选取学校填报志愿，而此志愿单就是结束整个高考榜单的结束：

~~~ javascript
// 订阅事件返回用于退订事件的函数
var deregister = $scope.$on('EVENT_NAME', function(event, args) {
    // balabala
});

// 退订事件
deregister();
~~~

## **$broadcast**相当于战斗机轰炸，**$emit**相当于射箭

`$broadcast`和`$emit`都用于发布事件，但从名字就可以看出他们的不同点：`$broadcast`是自上而下的广播，所有能听到的都可以对其进行反应。而`$emit`是自下而上的射箭，只有在箭矢的轨迹上才能对其做出反应。

具体到Angular上，即从一个`$scope`上通过`$broadcast`发布的事件，他的所有后代`$scope`都可以对此事件做出响应：

~~~ javascript
// 父$scope通过$broadcast发布事件
app.controller('ParentCtrl', ['$scope', function($scope) {
    $scope.$broadcast("parent", 'Data to Send');
}])
//所有子$scope都可以通过$on订阅事件
.controller('SiblingOneCtrl', ['$scope', function($scope) {
    $scope.$on("parent", function(event, 'Data to Send') {
        // balabala
    });
}])
.controller('SiblingTwoCtrl', ['$scope', function($scope) {
    $scope.$on("parent", function(event, 'Data to Send') {
        // balabala
    });
}]);
~~~

而通过`$emit`发布的事件，只有他的祖先`$scope`可以做出响应，并且其中任一祖先都可以将此事件终结掉，不让其继续传播：

~~~ javascript
// 子$scope通过$emit发布事件
app.controller('SiblingOneCtrl', ['$scope', function($scope) {
    $scope.$emit("sib1", 'Data to Send');
}])
// 父$scope通过$on订阅事件
.controller('ParentCtrl', ['$scope', function($scope) {
    $scope.$on("sib1", function(event, 'Data to Send') {
        // balabala
    });
}])
// 其兄弟$scope对其$emit的事件一无所知，所以不能订阅其事件
.controller('SiblingTwoCtrl', ['$scope', function($scope) {
    // 不要这样做
    $scope.$on("sib1", function(event, 'Data to Send') {
        // balabala
    });
}]);
~~~

在`$emit`发布事件的响应道路上，其任一祖先如果感觉不再需要此事件了，就可以通过如下方式终结此事件：

~~~ javascript
app.controller('ParentCtrl', ['$scope', function($scope) {
    $scope.$on("sib1", function(event, 'Data to Send') {
        // balabala
        event.stopPropagation(); // 终止事件继续“冒泡”
    });
}])
~~~

## $rootScope的$broadcast和$emit

上面说过`$rootScope`是所有`$scope`的最终祖先，所以通过`$rootScope`的`$broadcast`发布的事件可以被所有`$scope`接收到，包括`$rootScope`：

~~~ javascript
app.controller('SomeCtrl', ['$rootScope', function($rootScope) {
    $rootScope.$broadcast("rootEvent", 'Data to Send');

    // $rootScope也可以通过$on订阅从$rootScope.$broadcast发布的事件
    $rootScope.$on("rootEvent", function(event, 'Data to Send') {
        // balabala
    });
}])
// 所有$scope都能够通过$on订阅从$rootScope.$broadcast发布的事件
.controller('ParentCtrl', ['$scope', function($scope) {
    $scope.$on("rootEvent", function(event, 'Data to Send') {
        // balabala
    });
}])
.controller('SiblingOneCtrl', ['$scope', function($scope) {
    $scope.$on("rootEvent", function(event, 'Data to Send') {
        // balabala
    });
}])
~~~

而`$rootScope`的`$emit`就有些怪异了，按照上面的描述，`$rootScope`是没有祖先的，所以我们可能会想到其`$emit`会没有任何作用，但**事实并不如此**：`$rootScope.$emit`发布的事件，只能通过`$rootScope.$on`订阅，而其他`$scope`对此一无所知:

~~~ javascript
app.controller('SomeCtrl', ['$rootScope', function($rootScope) {
    $rootScope.$emit("rootEvent", 'Data to Send');

    // 只有$rootScope可以通过$on订阅从$rootScope.$emit发布的事件
    $rootScope.$on("rootEvent", function(event, 'Data to Send') {
        // balabala
    });
}])
// $scope不能够通过$on订阅从$rootScope.$emit发布的事件
.controller('ParentCtrl', ['$scope', function($scope) {
    // 不要这样做
    $scope.$on("rootEvent", function(event, 'Data to Send') {
        // balabala
    });
}]);
~~~

### 退订$rootScope上的订阅事件

当使用`$rootScope.$on`订阅事件时，**需要手动退订事件**，一般在其所处`$scope`的`$destory`事件中退订：

~~~ javascript
app.controller('SomeCtrl', ['$rootScope', '$scope', function($rootScope, $scope) {
    var deregister = $rootScope.$on("rootEvent", function(event, 'Data to Send') {
        // balabala
    });

    $scope.$on('$destory', function() {
        deregister(); // 退订事件
    });
}])
~~~

那通过`$scope.$on`订阅的事件呢？一般不需要手动退订，因为Angular会帮我们退订，但是如果需要自己控制何时退订事件，也可以通过上述方式进行退订。

## 事件命名的建议

在开发中，对于变量的命名、函数的命名、文件的命名都有一定的规范，既要保证可读性，也需要保证无混淆性。在Angular的事件机制中，因为事件可能会跨函数，甚至可能跨文件，所以对于事件名一定要保证唯一性，所以建议事件名都加上特定的前缀，以便区分。如下几个例子：

~~~ javascript
$scope.$emit('trash:delete', data);
$scope.$on('trash:delete', function (event, data) {...});

$scope.$broadcast('trash:clear', data);
$scope.$on('trash:clear', function (event, data) {...});
~~~


## 结语

Angular的事件机制很智能，而且一般来说总能符合我们的预期，但是如果不能深入理解其背后的机制，可能会踏入某些深坑，本文尝试说明Angular的事件机制，如果有理解不正确的地方，请留言告知。