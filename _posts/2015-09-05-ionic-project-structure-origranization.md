---
title: 'ionic工程文件组织结构'
date: 2015-09-05 20:30:03
tag: ionic1
thumbnail: 'project_structure.jpg'
thumbnail_alt: 'ionic工程文件组织结构'
keywords: Ionic Project, Project Structures, Ionic 1工程文件结构, 工程组织形式, 混合开发移动应用
excerpt: Ionic 1默认的工程文件组织形式不敢恭维，默认状态下按照文件的类型来组织工程文件，即html文件放在一个文件夹内，js文件放在另一个文件夹内，图片文件再找个文件夹放置，这样的工程文件的组织形式仅适用于小工程。当工程较大时，这种按照类型组织文件的形式已经不适用了，既不利于维护，也不利于测试。本文就介绍一种按照“特性”组织文件的形式，即将不同类型的文件按照其功能放置在不同的文件夹内，使得寻找相关文件尤其便捷。
---
[john-papa]: http://www.johnpapa.net/
[angular1-style-guide]: https://github.com/johnpapa/angular-styleguide/tree/master/a1/README.md
[folders-by-feature]: https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#folders-by-feature-structure
我想熟悉编程的人或熟悉各种IDE工具的人对于工程文件的组织方式一定不陌生，今天介绍一下ionic工程组织文件的方式。如果你对AngularJS不熟悉，没有接触过AngularJS编程，那么刚开始使用ionic工程时可能不知道如何更好的组织文件。

## 类型组织

当然，组织文件的形式多种多样，最常见的是下面这种：

~~~ javascript
app/
    controllers/
        detail.js
        overview.js
        settings.js
    services/
        service1.js
        service2.js
    views/
        detail.html
        overview.html
        settings.html
~~~

上述组织形式成为“类型组织”，即将相同类型的文件放到同一目录下，这也是ionic工程默认的组织方式，不过这种组织形式并不容易使用，例如你正在编写界面，即在views/\*.html里面工作，而此时可能需要绑定数据到view上，那你就需要切换到controllers/\*.js里面工作了。

## 特性组织

刚开始学习AngularJS时，曾经试图寻求一种更加有效的工程文件组织形式，很幸运我找到了[John Papa][john-papa]的[Angular 1 Style Guide][angular1-style-guide]，随后我就将这种形式应用到ionic工程中了。

[Angular 1 Style Guide][angular1-style-guide]使用了一种更好的方法组织文件：[特性组织/Folders-By-Feature][folders-by-feature]，就像下面一样：

~~~ javascript
app/
    detail/
        detail.controller.js
        detail.html
    overview/
        overview.controller.js
        overview.html
    services/
        service1.js
        service2.js
    settings/
        settings.controller.js
        settings.html
~~~

这当然是一个很简单的工程示例，可能看起来上述两种方式没有太大区别，但是想像一下，当你的工程至少有10个“特性”，每个特性最少包含2个文件，使用“特性组织”的方式会使工程构建十分容易，我们不必深入多级文件夹查找我们需要的文件，因为他就在我们身边。

当然，本文只是简单介绍了“特性组织”，大家感兴趣可以查看[Angular 1 Style Guide][angular1-style-guide]，里面包含并解释了大量有用的规则，完全可以作为AngularJS开发的指导书。