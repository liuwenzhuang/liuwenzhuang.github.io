---
layout: post
title:  "Ionic单元测试"
date:   2016-04-07 12:11:21
comments: true
categories: jekyll update
---
[karma-docs]: https://karma-runner.github.io
[Jasmine-docs]: http://jasmine.github.io/
[Angular1-style]: https://github.com/johnpapa/angular-styleguide/tree/master/a1/README.md
[source-code]: https://github.com/liuwenzhuang/IonicTestProjectTPL
[angular-mock]: https://docs.angularjs.org/guide/unit-testing#angular-mocks
代码测试的必要性，对任何编程语言都毋需赘述，JavaScript和HTML自然不例外。本文描述如何对Ionic进行单元测试（Unit Tests）。

对于测试环境而言，目前框架很多，本文使用的是[Karma][karma-docs]，尤其是其本身就为Angular而生，故能够与Angular完美集成。
对于测试用例而言，框架也有很多，本文使用的是[Jasmine][Jasmine-docs]。

本文工程基于ionic#1.2.4的tabs工程模板进行测试(angular#1.4.3)，但是为了更加符合[Angular 1编码规范][Angular1-style]，对工程的目录结构及代码的风格结构做了相应变化，大家可先熟悉[源码][source-code]后，再参照下文观看。

单元测试（Unit Tests）
================
单元测试，即Unit Tests，顾名思义，旨在测试代码中的某段独立功能。

安装测试环境
----------------
我们需要使用[Karma][karma-docs]、[Jasmine][Jasmine-docs]以及[angular-mocks][angular-mock]:

~~~ bash
$ npm install karma --save-dev
$ npm install karma-jasmine --save-dev
~~~
**注意：angular-mocks的版本必须与ionic使用的angular版本相同**，否则可能会出现如下错误：

> Failed to instantiate module ngMock... Unknown provider: $$rAFProvider

本文使用的是ionic#1.2.4，其angular版本为1.4.3，故需安装`angular-mocks#1.4.3`:

~~~bash
$ bower install angular-mocks#1.4.3 --save-dev
~~~

为了方便地在终端中使用karma进行测试，需要安装Karma CLI:

~~~ bash
$ npm install -g karma-cli
~~~

**注意：**类Unix系统可能需要使用`suodo`：

~~~ bash
$ sudo npm install -g karma-cli
~~~

最后，我们需要使用一种浏览器作为我们单元测试的载体，Karma支持[大多数主流浏览器](http://karma-runner.github.io/0.13/config/browsers.html)。这里我们使用最流行的[PhantomJS](http://phantomjs.org/)：

~~~ bash
$ npm install karma-phantomjs-launcher --save-dev
~~~

当然，可以使用别的浏览器，只需安装`karma-*-launcher`即可，如：

~~~ bash
$ npm install karma-chrome-launcher --save-dev
$ npm install karma-firefox-launcher --save-dev
...
~~~

## 配置测试环境

进行编写测试用例之前，首先需要进行测试环境的配置：

~~~ bash
$ karma init karma.conf.js
~~~

执行这条语句后，终端中会依次询问各项的配置信息，可以全部回车使用其默认值，待`karma.conf.js`生成后，再进行手动修改：
打开`karma.conf.js`，找到`browsers`选项，将其值修改为`PhantomJS`：

~~~ javascript
browsers: ['PhantomJS']
~~~

找到`files`选项，根据自己的工程文件结构做出相应修改，如根据我的目录结构，其值应该类似于：

~~~ javascript
files: [
      'www/lib/ionic/js/ionic.bundle.js',
      'www/lib/angular-mocks/angular-mocks.js',
      'www/js/*.js',
      'www/views/**/*.js'
    ]
~~~

> **注意：**要注意js的加载顺序，`ionic.bundle.js`集成了ionic和angular的相关文件，需要加载于普通工程js文件之前；同理，`angular-mocks.js`是测试用例的先决条件，故需要加载于测试用例js文件之前。读者需要根据自身工程结构进行相应修改，如本文工程将单元测试用例js文件置于普通工程js文件一起，故使用`www/views/**/*.js`即可代表他们。

##编写测试用例

### 测试Controller

我们以`Chats`页面的controller为例，编写测试用例，命名为`tab-chats.controller.spec.js`

~~~ javascript
(function () {
    'use strict';
    describe('ChatsCtrl', function () {
        var scopeMock,
            ChatsServiceMock,
            controller;
            
        beforeEach(module('starter'));
        beforeEach(inject(function ($rootScope, $controller, _ChatsService_) {
            scopeMock = $rootScope.$new();
            ChatsServiceMock = _ChatsService_;
            controller = $controller('ChatsCtrl', {'$scope': scopeMock, 'ChatsService': ChatsServiceMock});
        }));

        it('should have scopeMock defined', function () {
            expect(scopeMock).toBeDefined();
        });

        it('should get an instance of ChatsService', function () {
            expect(ChatsServiceMock).toBeDefined();
        });

        it('should delete a person in chats', function () {
            var chat = {
                id: 0,
                name: 'Ben Sparrow',
                lastText: 'You on your way?',
                face: 'img/ben.png'
            };
            scopeMock.remove(chat);
            expect(ChatsServiceMock.all().length).toBe(4);
            expect(scopeMock.chats.length).toBe(4);
        });
    });
})();
~~~

说明：

> 1.首先使用`module`方法（angular-mocks.js提供）加载工程module，而且将其置于`beforeEach`方法（jasmine提供）中，能够保证其能够在测试用例执行之前被首先执行。<br>
> 2.然后我们使用`inject`方法插入了一些必要模块：  \$rootScope用来实例化scope对象；  $controller用来实例化controller。<br>
> 3.`$controller`方法接收两个参数，第一个参数为要实例化的controller的名称，第二个参数为此controller的依赖列表。<br>
> 4.测试用例也是编程，若对其语法不了解，首先需要熟悉[Jasmine][Jasmine-docs]。<br>

执行测试：

~~~ bash
$ karma start karma.conf.js
~~~

`describe`方法使得我们可以组合多个测试，`it`方法定义了实际的测试用例，注意他们的第一个参数都是说明性文字，即自述性，这样就为测试的调试提供了极大的便利，`expect`方法处于`it`方法之间，用于测试各功能点是否按照我们的预期那样执行。每个`it`方法中可使用任意多个`expect`方法，不过要酌情处理，否则不易于排错。

### 测试Service

我们以`Chats`页面的service为例，编写测试用例，命名为`tab-chats.service.spec.js`：

~~~ javascript
(function () {
    'use strict';
    describe('ChatsService', function () {
        var ChatsService;
        beforeEach(module('starter'));

        beforeEach(inject(function (_ChatsService_) {
            ChatsService = _ChatsService_;
        }));

        it('can get an instance of ChatsService', function () {
            expect(ChatsService).toBeDefined();
        });

        it('should has 5 chats', function () {
            expect(ChatsService.all().length).toBe(5);
        });

        it('should has Max as friend with id 1', function () {
            var friend = {
                id: 1,
                name: 'Max Lynx',
                lastText: 'Hey, it\'s me',
                face: 'img/max.png'
            };

            expect(ChatsService.get(1)).toEqual(friend);
        });
    });
})();
~~~
执行测试：

~~~ bash
$ karma start karma.conf.js
~~~


----------
[源码][source-code]可在Github上找到。

> 参考文档:<br>
> [ionic工程组织文件][ionic-project-structure]<br>
> [Angular Unit Tests][angular-unit-tests]<br>
> [unit-testing-ionic-app][ionic-unit-tests]<br>
> [write-automated-unit-tests][automated-unit-tests]<br>

[ionic-project-structure]: http://blog.csdn.net/u010730126/article/details/49669765
[angular-unit-tests]: https://docs.angularjs.org/guide/unit-testing#angular-mocks
[ionic-unit-tests]: http://mcgivery.com/unit-testing-ionic-app/
[automated-unit-tests]: http://gonehybrid.com/how-to-write-automated-tests-for-your-ionic-app-part-2/