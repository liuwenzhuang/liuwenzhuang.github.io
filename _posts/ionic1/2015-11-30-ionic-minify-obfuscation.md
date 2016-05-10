---
title: 'ionic代码压缩与代码混淆'
date: 2015-11-30 17:06:03
tag: ionic1
---
[original-doc]: https://www.airpair.com/ionic-framework/posts/production-ready-apps-with-ionic-framework
[010_jshint]: https://gist.github.com/agustinhaller/5e489e5419e43b11d7b7
[after-prepare-files]: https://gist.github.com/agustinhaller/426351993c70a0329ad0
[ng-strict-di-doc]: https://github.com/olov/ng-annotate#highly-recommended-enable-ng-strict-di-in-your-minified-builds

本文为译文，并加入个人理解部分，如有理解错误指出，请大家指出，大家也可移步[原文][original-doc]。

本文解释了ionic工程发布之前的最后一步，即代码压缩（获取更好的性能）以及代码混淆（以免源码被有心者轻易获取）。包括以下步骤：
 

 - （cordova hook）`检查javascript`：这一步需要在代码压缩和代码混淆之前进行以保证javascript代码无错误
 - （gulp task）`将html页面代码转换为angular的JS代码`：这一步起到了混淆html页面代码的作用
 - （gulp task）`启用angular严格依赖注入`：这一步需要在代码混淆之前进行以保证angular的依赖注入没有问题
 - （gulp task）`组合js代码以及组合css代码`：这一步起到了混淆js代码以及css代码的作用
 - （cordova hook）`代码丑化、压缩、混淆`：最后一步 - 
 
为完成上述任务，我们需要同时使用*gulp tasks*以及*cordova hooks*。当执行`ionic serve`时，*gulp tasks*会被执行。当执行`ionic build android/ios`或`ionic run android/ios`时，*cordova hooks*会被执行。


----------

首先注意，本文说明的工程目录结构如下，读者需要根据不同的工程进行路径修改：

~~~ javascript
$PROJECT_DIR/
    hooks/
    www/
        js/
            xxx.js
            ...
        templates/
            login/
                xxx.html
                ...
            register/
                xxx.html
                ...
            .../
                ...
                ...
        index.html
~~~

##一.检查javascript

###1.这一步需要用到jshint以及async，可以使用npm安装：

~~~ bash
$ npm install jshint --save-dev
$ npm install async --save-dev
~~~

###2.复制cordova hooks文件：

将[此文件][010_jshint]下载，并复制到*$PROJECT_DIR/hooks/before_prepare*文件夹里。特别注意需要给予此文件“可执行”的权限，即

~~~ bash
$ chmod +x file_name
~~~

注意：此文件负责检测*$PROJECT_DIR/www/js/*目录下的js文件是否有误，请根据自己工程的实际情况对此文件进行修改:

如我的工程中有2个存放js文件的路径：*\$PROJECT_DIR/www/js*目录和*$PROJECT_DIR/www/patchjs*目录，则我需要对上述文件进行如下修改：

~~~ javascript
var foldersToProcess = [
    'js'
];
~~~

替换为：

~~~ javascript
var foldersToProcess = [
    'js', 'patchjs'
];
~~~

###3.测试：

终端执行：

~~~ bash
$ ionic build android/ios
~~~

若成功，则可在终端输出中看到工程中js文件是否有错误，并指出错误/警告的行、列数以及错误/警告的原因:

**检查无误：**
![检查无误](http://img.blog.csdn.net/20151130170209721)

**检查有误：**
![检查有误](http://img.blog.csdn.net/20151130170246379)

根据输出提示信息可知*www/patchjs/e2e-tests.conf.js*文件的第15行的第二列缺失了一个分号。

注意：js代码中使用`eval`函数也会导致此项检测报错，建议使用其他方法代替`eval`函数，如必须使用，可以使用`/*jslint evil: true */`标注：

~~~ javascript
/*jslint evil: true */
var temp = eval('(' + JSON.stringify(response) + ')');
~~~

----------------------------------

##二.将html页面代码转换为angular的JS代码

这一步对html页面代码的混淆是将html页面代码处理成angular的js代码（保存到一个js文件中）。

###1.这一步需要用到*gulp-angular-templatecache*。可以使用npm安装：

~~~ bash
npm install gulp-angular-templatecache --save-dev
~~~

###2.修改*gulpfile.js*文件：

~~~ javascript
var templateCache = require('gulp-angular-templatecache');
~~~

~~~ javascript
var paths = {
    sass: ['./scss/**/*.scss'],
    templatecache: ['./www/templates/**/*.html']
};
~~~

~~~ javascript
gulp.task('templatecache', function (done) {
    gulp.src('./www/templates/**/*.html')
      .pipe(templateCache({standalone:true}))
      .pipe(gulp.dest('./www/js'))
      .on('end', done);
});
~~~

~~~ javascript
gulp.task('default', ['sass', 'templatecache']);
~~~

~~~ javascript
gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.templatecache, ['templatecache']);
});
~~~

###3.修改*ionic.project*文件：

~~~ bash
"gulpStartupTasks": [
    "sass",
    "templatecache",
    "watch"
]
~~~

###4.在*app.js*中增加`templates`模块依赖：

~~~ javascript
 angular.module('starter', ['ionic', 'starter.controllers', 'templates'])
~~~

###5.在*index.html*中引入*templates.js*文件：

~~~ html
<script src="js/templates.js"></script>
~~~
注意：这里的*templates.js*文件是下一步生成的。

###6.测试：

~~~ bash
$ ionic serve
~~~

或者

~~~ bash
$ gulp templatecache
~~~

执行完毕，在*$PROJECT_DIR/www/js*目录下将生成*templates.js*文件，此文件中将包含对html页面代码的转换结果。

###7.改变templateUrl路径：

打开*$PROJECT_DIR/www/js/templates.js*文件，我们可以看到类似于下面的代码：

~~~ html
$templateCache.put("login.html", ...
~~~

大家可以看到，此时的`login.html`前面没有`templates`路径前缀，其他的html文件也是类似的，所以我们之前在js中使用`templateUrl`指定的html文件路径便需要作出相应变化----去除`templates`路径前缀:

首先，我们要知道哪里会使用到`templateUrl`属性，可能有如下几种情况：

 - app.js中使用`$stateProvider.state()`定义路由时;
 - 类似于`$ionicPopover`的控件或自定义的directives中到;

我们以情况1为例说明修改的过程：

app.js之前可能的情况：

~~~ javascript
.state('login', {
    url: "/",
    templateUrl: "templates/login.html",
    controller: 'LoginCtrl'
  });
~~~

修改之后则为：

~~~ javascript
.state('login', {
    url: "/",
    templateUrl: "login.html",
    controller: 'LoginCtrl'
  });
~~~

其他的也类似地进行修改。


----------

##三.启用angular ng-strict-di

在我们进行代码压缩之前，我们需要启用angular的ng-strict-di，即严格依赖注入，使用ng-strict-di使得工程中依赖注入不会有问题，更多关于ng-strict-di可以看[这里][ng-strict-di-doc]。

###1.首先通过npm安装*gulp-ng-annotate*：

~~~ bash
$ npm install gulp-ng-annotate --save-dev
~~~

###2.其次，修改*gulpfile.js*文件：

~~~ javascript
var ngAnnotate = require('gulp-ng-annotate');
~~~

~~~ javascript
var paths = {
    sass: ['./scss/**/*.scss'],  
    templatecache: ['./www/templates/**/*.html'],  
    ng_annotate: ['./www/js/*.js']
};
~~~

~~~ javascript
gulp.task('ng_annotate', function (done) {
    gulp.src('./www/js/*.js')
      .pipe(ngAnnotate({single_quotes: true}))
      .pipe(gulp.dest('./www/dist/dist_js/app'))
      .on('end', done);
});
~~~

~~~ javascript
gulp.task('default', ['sass', 'templatecache', 'ng_annotate']);
~~~

~~~ javascript
gulp.task('watch', function() {
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.templatecache, ['templatecache']);
    gulp.watch(paths.ng_annotate, ['ng_annotate']);
});
~~~

###3.修改*ionic.project*文件：

~~~ bash
"gulpStartupTasks": [
    "sass",
    "templatecache",
    "ng_annotate",
    "watch"
]
~~~

###4.重新定位index.html里js的文件：

~~~ html
<script src="dist/dist_js/app/app.js"></script>  
<script src="dist/dist_js/app/controllers.js"></script>  
<script src="dist/dist_js/app/services.js"></script>  
<script src="dist/dist_js/app/templates.js"></script>
~~~

###5.在`ng-app`标签下加入directive:`ng-strict-di`：

~~~ html
<body ng-app="your-app" ng-strict-di>
~~~

###6.测试

~~~ bash
$ ionic serve
~~~

或

~~~ bash
$ gulp ng_annotate
~~~

上面的执行过程将会生成*$PROJECT_DIR/www/dist/dist_js/app*文件夹，并且其中包含了严格符合注入标准的工程js文件。


----------

##四.合并js文件以及css文件

###1.通过npm安装*gulp-useref*：

~~~ bash
$ npm install gulp-useref --save-dev
~~~

###2.其次，修改*gulpfile.js*文件：

~~~ javascript
var useref = require('gulp-useref');
~~~

~~~ javascript
var paths = {
    sass: ['./scss/**/*.scss'],  
	templatecache: ['./www/templates/**/*.html'],  
    ng_annotate: ['./www/js/*.js'],  
    useref: ['./www/*.html']
};
~~~

~~~ javascript
gulp.task('useref', function (done) {
    var assets = useref.assets();
    gulp.src('./www/*.html')
      .pipe(assets)
      .pipe(assets.restore())
      .pipe(useref())
      .pipe(gulp.dest('./www/dist'))
      .on('end', done);
  });
~~~

~~~ javascript
gulp.task('default', ['sass', 'templatecache', 'ng_annotate', 'useref']);
~~~

~~~ javascript
gulp.task('watch', function() {
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.templatecache, ['templatecache']);
    gulp.watch(paths.ng_annotate, ['ng_annotate']);
    gulp.watch(paths.useref, ['useref']);
  });
~~~

###3.修改*ionic.project*文件：

~~~ bash
"gulpStartupTasks": [
    "sass",
    "templatecache",
    "ng_annotate",
    "useref",
    "watch"
]
~~~

###4.修改*index.html*文件，对需要合并的js文件和css文件进行处理：

~~~ html
<!-- build:css dist_css/styles.css -->
  <link href="css/ionic.app.css" rel="stylesheet">
<!-- endbuild -->
~~~

~~~ html
<!-- build:js dist_js/app.js -->  
<script src="dist/dist_js/app/app.js"></script>  
<script src="dist/dist_js/app/controllers.js"></script>  
<script src="dist/dist_js/app/services.js"></script>  
<script src="dist/dist_js/app/templates.js"></script>  
<!-- endbuild --> 
~~~

注意：其中使用成对注释符包裹的部分会被进行合并处理，可能有些外部的css文件或js文件不想被处理，那么就保持原状即可（不使用此种方式包裹）。

###5.测试

~~~ bash
$ ionic serve
~~~

或

~~~ bash
$ gulp useref
~~~

上面的执行过程会生成以下文件：

 - \$PROJECT_DIR/www/dist/index.html
 - \$PROJECT_DIR/www/dist/dist_css/styles.css
 - \$PROJECT_DIR/www/dist/dist_js/app.js

其中后面2个文件，即是被合并过后的文件。

注意：新版本的gulp-useref没有assets()方法，所以可能会出现错误，大家可以用gulp-useref的2.1.0版本，即第一步安装时使用：

~~~ bash
$ npm install gulp-useref@2.1.0 --save-dev
~~~


----------

##五.最后一步

###1.使用npm安装`cordova-uglify`以及`mv`：

~~~ bash
$ npm install cordova-uglify --save-dev
$ npm instal mv --save-dev
~~~

###2.复制cordova hooks文件：

将[这些文件][after-prepare-files]添加至$PROJECT_DIR/hooks/after_prepare文件夹中。并且要注意这些文件中的有关路径的操作，是对应于前几步中的路径的，如果工程结构不一样，请自行调整这些文件中有关路径的部分。特别注意需要给予此文件“可执行”的权限，即

~~~ bash
$ chmod +x file_name
~~~

现在，我们就可以生成处理完成的文件了：

~~~ bash
$ ionic build android/ios
~~~