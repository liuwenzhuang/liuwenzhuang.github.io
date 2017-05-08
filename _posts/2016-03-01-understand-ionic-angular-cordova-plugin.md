---
title: '理解Ionic、Angular、Cordova及插件之间的关系'
date: 2016-02-26 21:23:45
tag: ionic2
keywords: Cordova, Ionic CLI, Angular 2, class, Ionic 2基础, Ionic 2 basement, ES6, TypeScript, 插件, Plugin
excerpt: 使用Ionic开发时，不可避免地会遇到Angular、Cordova以及Cordova插件，经常有人搞不清楚它们之间的关系，甚至将它们都归为Ionic之中，本文就试图梳理Ionic、Angular、Cordova及Cordova插件之间的关系。
---
 > 本文提及概念不区分Ionic 1/Angular 1和Ionic 2/Angular 2。

首先我们需要明确以下几个概念：

1.即使我们将移动端web页面做得和原生应用及其相似，在我们的页面中也无法像原生应用那样调用原生的能力，当然通过输入框触发键盘、图库、拍照等操作不在这里“调用原生能力”的范畴。

2.单纯的web页面不能提交到应用商店被用户使用。

然后，我们分别就它们之间的关系做出解释：

## Ionic和Angular

首先要明确的是Ionic是Angular的衍生品，Angular是单独的JS库，和jQuery一样能够独立用于开发应用，而Ionic只是对Angular进行了扩展，利用Angular实现了很多符合移动端应用的组件，并搭建了很完善的样式库，是对Angular最成功的应用样例。即使不使用Ionic，Angular也可与任意样式库，如Bootstrap、Foundation等搭配使用，得到想要的页面效果。

## Ionic/Angular和Cordova

可能会有人被问道：“Cordova比Ionic/Angular好吗？”，这就很尴尬了，根本是毫无意义的问题。它们在混合开发中扮演的是不同的角色--Ionic/Angular负责页面的实现，而Cordova负责将实现的页面包装成原生应用（Android:apk；iOS:ipa）。就像花生，最内层的花生仁是Angular，花生仁的表皮是Ionic，而最外层的花生壳则是Cordova。包装完成之后我们的页面才有可能调用设备的原生能力，最后才能上传到应用商店被用户使用。

## Ionic/Angular和Cordova插件

关于Cordova插件要明确以下几点：

 - Cordova插件的作用是提供一个桥梁供页面和原生通信，首先我们的页面不能直接调用设备能力，所以需要与能够调用设备能力的原生代码（Android:Java；iOS:OC）通信，此时就需要Cordova插件了。

 - Cordova插件能够再任何Cordova工程中使用，和使用什么前端框架（如Ionic）无关。

 - Ionic 2中封装了Ionic Native，方便了Cordova插件的使用，但在Ionic 2中仍然可以像Ionic 1中一样使用Cordova插件，Ionic Native不是必须的。

 - 即使在Ionic 2中使用了Ionic Native，也首先需要手动添加插件，如：cordova plugin add cordova-plugin-pluginName。