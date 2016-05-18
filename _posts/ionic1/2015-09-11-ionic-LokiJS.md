---
title: 'ionic App使用LokiJS作为本地存储'
date: 2015-09-11 17:45:03
tag: ionic1
---
[original-doc]: http://gonehybrid.com/how-to-use-lokijs-for-local-storage-in-your-ionic-app/
[source-code]: https://github.com/ashteya/ionic-tutorial-lokijs
[changes-api]: https://github.com/techfort/LokiJS/wiki/Changes-API
[loki-cordova-adapter]: https://github.com/cosmith/loki-cordova-fs-adapter
[Corentin-Smith]: http://csmith.fr/
[loki-cordova-adapter-es5]: https://github.com/cosmith/loki-cordova-fs-adapter/blob/master/bin/loki-cordova-fs-adapter.js
[Cordova-File-Plugin]: https://github.com/apache/cordova-plugin-file
[create-adapter]: http://lokijs.org/#/docs#adapters
本文是翻译而来，留存以后观看，难免有错误之处，大家也可查看[原文][original-doc]。
源码可以在[Github][source-code]上找到。

LokiJS是JS库，并使用内存数据库，所以拥有更快的性能，更加适合于hybrid app。其API和MongoDB很是相似。并且可以通过IndexedDB存储数据库，也可以通过使用JSON文件作为存储，甚至可以自己定义存储模式。

LokiJS被创造出来的原因之一是为了提供一个可以替代SQLite在cordova app中的作用。

LokiJS的缺点很明显，它不具有很强大的数据同步能力，但是其[Changes API][changes-api]能够记录对本地数据库的所有更改，可以使用[Changes API][Changes API][changes-api]同步数据库。所以如果我们的app只需要在本地存储数据，使用LokiJS是再合适不过了，因为其对数据库的所有操作都在内存中完成，所以速度更快。

## 安装

在我们的ionic工程中，我们可以使用bower安装LokiJS：

~~~ bash
$ bower install lokijs --save
~~~

安装完成后，下一步当然是在我们的index.html中引入LokiJS，因为LokiJS也支持angular，所以我们也将其对应于angular的JS文件引入：

~~~ javascript
<script src="lib/lokijs/src/lokijs.js"></script>
<script src="lib/lokijs/src/loki-angular.js"></script>
~~~

LokiJS默认存储数据到localStorage，但是localStorage并不可靠，因为[当手机内存不足时，localStorage可能会被清除]({% post_url 2015-08-30-localstorage-is-not-reliable-in-hybrid-apps %})。

所以我们需要寻找其他解决途径，另一个选择是使用IndexedDB，但不幸的是IOS并不支持，那是因为Cordova使用的UIWebView不支持IndexedDB。

所以我们想到可以使用JSON文件作为存储，但眼下LokiJS在Cordova apps中没有保存文件的adapter，不过我们可以使用非官方的adapter：[loki-cordova-fs-adapter][loki-cordova-adapter]达到我们的目的。[loki-cordova-fs-adapter][loki-cordova-adapter]是[Corentin Smith][Corentin-Smith]在ES6的基础上完成的，但是也可以下载[向下兼容的版本][loki-cordova-adapter-es5]。下载完成后，当然还是需要在index.html中引入：

~~~ javascript
<script src="js/loki-cordova-fs-adapter.js"></script>
~~~

这个adapter依赖于[Cordova File Plugin][Cordova-File-Plugin]，所以我们还需要安装此插件：

~~~ bash
$ cordova plugin add cordova-plugin-file
~~~

注：也可以按照自己的想法[创建adapter][create-adapter]存储数据。

现在我们已经安装完成必须的库，下一步是将lokijs模块添加到我们app模块的依赖列表中：

~~~ javascript
angular.module('starter', ['ionic', 'lokijs'])
~~~

## 我们要创建的app

我们现在创建的app是一个生日保存app，可以添加、删除、更新、读取存储的生日信息：
![这里写图片描述](http://img.blog.csdn.net/20151031182225501)

### 构造Service

我们现在要构造一个service封装我们的LokiJS调用。

~~~ javascript
angular.module('starter').factory('BirthdayService', ['$q', 'Loki', BirthdayService]);

function BirthdayService($q, Loki) {
    var _db;
    var _birthdays;

    function initDB() {
        var adapter = new LokiCordovaFSAdapter({"prefix": "loki"});
        _db = new Loki('birthdaysDB',
                {
                    autosave: true,
                    autosaveInterval: 1000, // 1 second
                    adapter: adapter
                });
    };

    return {
        initDB: initDB,
        getAllBirthdays: getAllBirthdays,
        addBirthday: addBirthday,
        updateBirthday: updateBirthday,
        deleteBirthday: deleteBirthday
    };
}
~~~

初始化LokiJS数据库有多种方法，本例中我们配置LokiJS数据库每秒自动保存数据到JSON文件中（autosave:true）。当然自动保存的功能足够智能，它知道仅仅当内存数据库改变时存储数据。

### 获取所有生日信息

很显然，上面定义了5个函数，我们只实现了一个，现在我们完成**getAllBirthdays**函数：

~~~ javascript
function getAllBirthdays() {

    return $q(function (resolve, reject) {
        var options = {};

        _db.loadDatabase(options, function () {
            _birthdays = _db.getCollection('birthdays');

            if (!_birthdays) {
                _birthdays = _db.addCollection('birthdays');
            }

            resolve(_birthdays.data);
        });
    });
};
~~~

在**getAllBirthdays**函数中，我们必须首先使用**loadDatabase**函数加载数据库。当加载完成后，我们可以在**loadDatabase**函数的回调函数中获得数据集。

如上所示，**options**对象是**loadDatabase**函数的第一个参数，如果你不想对从JSON文件中获取的数据做任何处理的话，你可以将其置空。然而，由于我们需要保存的生日信息不能被转自动换为Date对象，所以我们需要自定义**infalte**函数进行处理：

~~~ javascript
var options = {
    birthdays: {
        proto: Object,
        inflate: function (src, dst) {
            var prop;
            for (prop in src) {
                if (prop === 'Date') {
                    dst.Date = new Date(src.Date);
                } else {
                    dst[prop] = src[prop];
                }
            }
        }
    }
};
~~~

我们只是将source对象的所有内容拷贝到destination对象，除了对Date属性作出处理，将其变更为Date对象。

### 增加、更新、删除生日信息

现在我们还需要完成“增加”、“更新”、“删除”生日信息的功能：

~~~ javascript
function addBirthday(birthday) {
    _birthdays.insert(birthday);
};

function updateBirthday(birthday) {
    _birthdays.update(birthday);
};

function deleteBirthday(birthday) {
    _birthdays.remove(birthday);
};
~~~

### 创建UI

我们前面已经有了service给我们处理大部分工作，现在我们来创建UI。
首先我们先创建一个controller：OverviewController， 在OverviewController中调用**birthdayService.initDB**函数初始化数据库，为保证初始化顺利进行，我们需要等待**$ionicPlatform.ready**事件：

~~~ javascript
angular.module('starter').controller('OverviewController', ['$scope', '$ionicModal', '$ionicPlatform', 'BirthdayService', OverviewController]);

function OverviewController($scope, $ionicModal, $ionicPlatform, birthdayService) {
    var vm = this;

    $ionicPlatform.ready(function() {

        // Initialize the database.
        birthdayService.initDB();

        // Get all birthday records from the database.
        birthdayService.getAllBirthdays()
                        .then(function (birthdays) {
                            vm.birthdays = birthdays;
                        });
    });

    // Initialize the modal view.
    $ionicModal.fromTemplateUrl('add-or-edit-birthday.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });

    vm.showAddBirthdayModal = function() {
        $scope.birthday = {};
        $scope.action = 'Add';
        $scope.isAdd = true;
        $scope.modal.show();
    };

    vm.showEditBirthdayModal = function(birthday) {
        $scope.birthday = birthday;
        $scope.action = 'Edit';
        $scope.isAdd = false;
        $scope.modal.show();
    };

    $scope.saveBirthday = function() {
        if ($scope.isAdd) {
            birthdayService.addBirthday($scope.birthday);
        } else {
            birthdayService.updateBirthday($scope.birthday);
        }
        $scope.modal.hide();
    };

    $scope.deleteBirthday = function() {
        birthdayService.deleteBirthday($scope.birthday);
        $scope.modal.hide();
    };

    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

    return vm;
}
~~~

最后，我们处理index.html，进行界面设计，这里我们使用$ionicModal来展示“增加生日”和“编辑生日”的界面：

~~~ html
<body ng-app="starter">
  <ion-pane ng-controller="OverviewController as vm">
    <ion-header-bar class="bar-stable">
      <h1 class="title">Birthdays</h1>
      <div class="buttons">
        <button ng-click="vm.showAddBirthdayModal()" class="button button-icon icon ion-plus"></button>
      </div>
    </ion-header-bar>
    <ion-content>
      <ion-list>
        <ion-item ng-repeat="b in vm.birthdays" ng-click="vm.showEditBirthdayModal(b)">
          <div style="float: left">{% raw %}{{ b.Name }}{% endraw %}</div>
          <div style="float: right">{% raw %}{{ b.Date | date:"dd MMMM yyyy" }}{% endraw %}</div>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-pane>

  <script id="add-or-edit-birthday.html" type="text/ng-template">
    <ion-modal-view>
      <ion-header-bar>
        <h1 class="title">{% raw %}{{ action }}{% endraw %} Birthday</h1>
        <div class="buttons">
        <button ng-hide="isAdd" ng-click="deleteBirthday()" class="button button-icon icon ion-trash-a"></button>
        </div>
      </ion-header-bar>
      <ion-content>
        <div class="list list-inset">
          <label class="item item-input">
          <input type="text" placeholder="Name" ng-model="birthday.Name">
          </label>
          <label class="item item-input">
          <input type="date" placeholder="Birthday" ng-model="birthday.Date">
          </label>
        </div>
        <div class="padding">
          <button ng-click="saveBirthday()" class="button button-block button-positive activated">Save</button>
        </div>
      </ion-content>
    </ion-modal-view>
  </script>
</body>
~~~

### 结语
可以看出，使用LokiJS作为本地存储简单易用，唯一麻烦的地方是为ionic app选择合适的adapter。使用JSON文件的方式存储效果还是不错的，我已经在Android和IOS测试完成。