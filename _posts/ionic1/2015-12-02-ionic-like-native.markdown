---
title:  "使ionic应用效果更加贴近原生"
date:   2015-12-02 12:11:21
tag: ionic1
---
[original-doc]: http://scottbolinger.com/4-ways-to-make-your-ionic-app-feel-native/
[native-transitions-plugin]: http://plugins.telerik.com/cordova/plugin/native-page-transitions
[Julien Renaux]: https://www.npmjs.com/package/ionic-native-transitions
[angular-cache-doc]: https://github.com/jmdobry/angular-cache
本文乃翻译而来，并加入个人理解，如有理解错误指出，请大家指出，大家也可移步[原文][original-doc]。

近来，由于设备性能的提高以及混合开发技术的优化，原生开发和混合开发之间的界限越来越不明显了。

一些混合开发技术中甚至可以使用“原生切换动画”、“原生滚动”等效果，如ionic。很多情况下，已经分不清原生app和混合app的区别了，特别是很多原生app使用WebViews。

混合开发技术仍在飞速的发展中，现在是加入其中的极好时机。本文将讲述4中方法提升ionic应用的性能，使其更加贴近原生。

##1.原生切换动画

感谢[Native Page Transitions Cordova插件][native-transitions-plugin]，让我们能够在混合应用使用原生的切换动画。

当然，ionic内置的切换动画已经很优秀了，但是却不太稳定。而原生的切换动画在任何时刻都表现地相当不错，纵享丝滑。

为了在ionic应用中使用，可以使用[Julien Renaux的功能库][Julien Renaux]。可以根据其说明文档使用，这里提供基本使用方法：

~~~ bash
$ npm install ionic-native-transitions --save
$ cordova plugin add https://github.com/Telerik-Verified-Plugins/NativePageTransitions#0.5.4
~~~

下一步，添加`ionic-native-transitions`作为依赖模块：

~~~ javascript
angular.module('yourApp', ['ionic','ionic-native-transitions'])
~~~

然后，在触发切换的控件上添加directive：`native-transitions`，如：

~~~ html
<a class="button" native-transitions ui-sref="facts">Next</a>
~~~

可以使用`native-transitions-options`为动画设置属性，如需要点击返回按钮时添加向右的切换动画，则可以使用如下方式：

~~~ html
<ion-nav-back-button native-transitions native-transitions-options="{type: 'slide', direction:'right'}" class="button-icon">
  <i class="icon ion-arrow-left-c"></i>
</ion-nav-back-button>
~~~

可以用下面的方法为动画设置默认的属性，下面的参数值是我实验后认为对于ionic应用比较适合的设定：

~~~ javascript
.config(function($ionicNativeTransitionsProvider){
  $ionicNativeTransitionsProvider.setOptions({
    "duration"          : 300,
    "androiddelay"      : 100, // Longer delay better for older androids
    // "fixedPixelsTop"    : 64, // looks OK on iOS
  });
})
~~~

默认的`duration`为400，稍慢，这里我改为300以适应ionic内置动画。低版本android动画效果不是很理想，所以应该为其添加延时，所以我将`androiddelay`设置为100，大家可以自行测试，因为我手头只有有限的android设备，测试样本较小。如果不想让工具栏随着页面切换，可以使用`fixedPixelsTop`属性，我一般使用其默认值0。

除了上面的滑动效果，还包括很多其他动画效果，如“抽屉效果”、“翻转效果”等切换动画效果，具体可参照[插件文档](http://plugins.telerik.com/cordova/plugin/native-page-transitions)。我想随着不断地优化，ionic内置的动画都可以使用原生动画替代。

------------------------------------

##2.原生滚动

###ionic1.2之前版本：

默认使用javascript的滚动效果，不是很理想，特别是对于android设备来说，如果还存在大量图片，情况将更加糟糕。

为了解决此问题，可以使用原生滚动，可以用下面的方式在全局启用原生滚动：

~~~ javascript
.config(function($ionicConfigProvider) {
  $ionicConfigProvider.scrolling.jsScrolling(false);
 
  // Or for only a single platform, use
  // if( ionic.Platform.isAndroid() ) {
    // $ionicConfigProvider.scrolling.jsScrolling(false);
  // }
}
~~~

如果仅是想在个别页面使用原生滚动，可以在页面的`ion-content`标签中添加`overflow-scroll='true'`。

###ionic1.2及以后版本：

默认采用原生滚动，即不用像之前版本那样进行配置，如果想要使用javascript滚动，可以使用下面的方式在全局启用javascript滚动：

~~~ javascript
.config(function($ionicConfigProvider) {
  $ionicConfigProvider.scrolling.jsScrolling(true);
 
  // Or for only a single platform, use
  // if( ionic.Platform.isIOS() ) {
    // $ionicConfigProvider.scrolling.jsScrolling(true);
  // }
}
~~~

如果仅是想在个别页面使用javascript滚动，可以在页面的`ion-content`标签中添加`overflow-scroll='false'`。

------------------------------------

##3.缓存

ionic提供了默认的缓存机制，不过可能并不能满足需要。

考虑以下场景：用户使用app阅读一篇文章（文章内容通过网络请求而来），然会退出了此app，稍后可能想要再次阅读同一篇文章，这时没有理由再次进行HTTP请求获取文章内容（如果文章内容没有变化的话）。因此，我们可以将文章内容存储在本地，当用户再次观看时，文章就可以极快的呈现出来了。

可能大家第一想法是使用localStorage存储，但是localStorage不能处理大量的数据，因为其容量很有限。关于localStorage可以查看我另一篇[译文](http://blog.csdn.net/u010730126/article/details/49539449)。此时[angular-cache][angular-cache-doc]便出场了,`angular-cache`使得存取大量数据变得很容易。

我们可以使用bower或者npm安装`Angular-cache`：

~~~ bash
$ bower install --save angular-cache
~~~

或

~~~ bash
$ npm install --save angular-cache
~~~

然后，添加`angular-cache`作为依赖模块：

~~~ javascript
angular.module('myApp', ['angular-cache'])
~~~

然后就可以使用如下的方式使用了：

~~~ javascript
.controller('Posts', function (CacheFactory) {
 
if (!CacheFactory.get('postCache')) {
  CacheFactory.createCache('postCache');
}
var postCache = CacheFactory.get('postCache');
 
// Cache a post
postCache.put(id, data);
 
// Delete from cache
postCache.remove(id);
 
// Get a post
$scope.post = postCache.get(id);
 
})
~~~

这里我们仅仅是当用户加载时检测本地是否已经缓存了post，如果是则不必进行额外的HTTP请求。

当然，我们可以通过类似“下拉刷新”的方法进行HTTP请求从而跳过缓存或者更新缓存。

更过可参照[angular-cache文档](https://github.com/jmdobry/angular-cache)。

--------------------------------------------

##4.Crosswalk WebView

`Crosswalk WebView`大家都很熟悉了，特别是在低版本android中，`Crosswalk WebView`提供了比原生WebView更好的性能。

而`Crosswalk WebView`目前来看唯一的缺点就是增大了app的体积（差不多20M），如果不用考虑app体积问题，则值得一用。

安装：

~~~ bash
$ cordova plugin add cordova-plugin-crosswalk-webview
~~~

我在使用Crosswalk 1.3.1时还需要在config.xml中做如下设置：

~~~ xml
<preference name="CrosswalkAnimatable" value="true" />
~~~

Phonegap中也可使用`Crosswalk WebView`，在config.xml中如下设置：

~~~ xml
<gap:plugin name="org.crosswalk.engine" version="1.3.0" />
~~~