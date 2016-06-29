---
title: 'Angular $http拦截器介绍与使用'
date: 2016-01-10 22:30
tag: ionic1
thumbnail: 'angular_interceptors.jpg'
thumbnail_alt: 'Angular $httpProvider.interceptors的介绍与使用'
keywords: AngularJS, $httpProvider, interceptors, http拦截器, 混合移动App开发框架, 前端开发, 使用Ionic和Angular等前端技术开发手机App, Android开发, iOS开发, 微信开发
---
[XMLHttpRequest_url]: https://developer.mozilla.org/en/xmlhttprequest
[JSONP_url]: http://en.wikipedia.org/wiki/JSONP
[http_config_url]: https://docs.angularjs.org/api/ng/service/$http#usage
`$http service`在Angular中用于简化与后台的交互过程，其本质上使用[XMLHttpRequest][XMLHttpRequest_url]或[JSONP][JSONP_url]进行与后台的数据交互。在与后台的交互过程中，可能会对每条请求发送到Server之前进行预处理（如加入token），或者是在Server返回数据到达客户端还未被处理之前进行预处理（如将非JSON格式数据进行转换）；当然还有可能对在请求和响应过程过发生的问题进行捕获处理。所有这些需求在开发中都非常常见，所以Angular为我们提供了$http拦截器，用来实现上述需求。

## 什么是拦截器

顾名思义，拦截器就是在目标达到目的地之前对其进行处理以便处理结果更加符合我们的预期。Angular的$http拦截器是通过`$httpProvider.interceptors`数组定义的一组拦截器，每个拦截器都是实现了某些特定方法的Factory:
![http拦截器](/assets/images/angular_http_interceptors.png)

## 实现拦截器

**http拦截器**一般通过定义factory的方式实现：

~~~ javascript
myApp.factory('MyInterceptor', function($q) {
  return {
    // 可选，拦截成功的请求
    request: function(config) {
      // 进行预处理
      // ...
      return config || $q.when(config);
    },

    // 可选，拦截失败的请求
   requestError: function(rejection) {
      // 对失败的请求进行处理
      // ...
      if (canRecover(rejection)) {
        return responseOrNewPromise
      }
      return $q.reject(rejection);
    },



    // 可选，拦截成功的响应
    response: function(response) {
      // 进行预处理
      // ....
      return response || $q.when(reponse);
    },

    // 可选，拦截失败的响应
   responseError: function(rejection) {
      // 对失败的响应进行处理
      // ...
      if (canRecover(rejection)) {
        return responseOrNewPromise
      }
      return $q.reject(rejection);
    }
  };
});
~~~

随后，我们需要将实现的拦截器加入到`$httpProvider.interceptors`数组中，此操作一般在config方法中进行：

~~~ javascript
myApp.config(function($httpProvider) {
    $httpProvider.interceptors.push(MyInterceptor);
});
~~~

当然，我们也可以通过匿名factroy的方式实现：

~~~ javascript
$httpProvider.interceptors.push(function($q) {
  return {
   request: function(config) {
       // bala
    },

    response: function(response) {
       // bala
    },

    // bala
  };
});
~~~

可以看到，每个拦截器都可以实现4个可选的处理函数，分别对应请求（成功/失败）和响应（成功/失败）的拦截:

 - `request`:此函数在$http向Server发送请求之前被调用，在此函数中可以对成功的http请求进行处理，其包含一个http [config][http_config_url]对象作为参数，这里对[config][http_config_url]对象具有完全的处理权限，甚至可以重新构造，然后直接返回此对象或返回包含此对象的promise即可。**如果返回有误，会造成$http请求失败**。如开发中经常需要在请求头中加入token以便验证身份，我们可以作如下处理：

~~~ javascript
request: function(config) {
    config.headers = config.headers || {};
    if ($window.sessionStorage.token) {
        config.headers['X-Access-Token'] = $window.sessionStorage.token;
    }
    return config || $q.when(config);
}
~~~

- `requestError`:此方法会在前一个拦截器抛出异常或进行了reject操作时被调用，在这里可以进行恢复请求的操作，或者进行一些对于请求时发起动作的处理（如取消loading等）；
- `response`:此函数在$http从Server接收到响应时被调用，在此函数中可以对成功的http响应进行处理，这里具有对响应的完全处理权限，甚至可以重新构造，然后直接返回响应或返回包含响应的promise即可。**如果返回有误，会造成$http接收响应失败**；
- `responseError`:此方法会在前一个拦截器抛出异常或进行了reject操作时被调用，在这里可以进行恢复响应的操作，进行一些针对错误的处理。

## 使用用例

为演示Angular **$http拦截器**的使用方法，下面通过几个常用的用例来说明：

### 利用**request拦截器**模拟实现Angular的XSRF(即CSRF)防御

CSRF，即“跨站请求伪造”，不过不知道为什么Angular将其称为XSRF。当处理与后台交互时，Angular的$http会尝试从客户端cookie中读取一个token，其默认的key为`XSRF-TOKEN`，并构造一个名为`X-XSRF-TOKEN`的http头部，与http请求一起发送到后台。Server端就可以根据此token识别出请求来源于同域，当然跨域的请求$http不会加入`X-XSRF-TOKEN`头部。那我们可以利用**request拦截器**通过如下方式在同域请求头部中加入此头部以达到模拟Angular的XSRF(即CSRF)防御机制的实现效果：

~~~ javascript
/**
* 正式开发中Angular会主动进行XSRF防御（只要cookie中存在key为`XSRF-TOKEN`的token），
* 一般不需要手动进行，除非cookie中不存在key为`XSRF-TOKEN`的token，这里只是模拟实现
*/
request: function(config) {
  if(config.url.indexOf('SAME_DOMAIN_API_URL') > -1 && $cookies.get('XSRF-TOKEN')) {
    config.headers['X-XSRF-TOKEN'] = $cookies.get('XSRF-TOKEN');
  }
  return config;
}
~~~

如果初始http请求头部类似于：

~~~ html
"headers": {
    "Accept": "application/json, text/plain, */*"
}
~~~

那么经过上述的**拦截器**后，其http请求头部就变成了：

~~~ html
"headers": {
    "Accept": "application/json, text/plain, */*",
    "X-XSRF-TOKEN": X-XSRF-TOKEN-VALUE
}
~~~

### 利用**response拦截器**实现响应数据序列化

开发中，我们期望后台返回规范的JSON数据格式，但是因为各种原因可能服务器不能符合我们的期望，返回的数据格式可能是字符串或是其他形式，这样就不利于我们在前台展示，此时我们就可以通过**response拦截器**将响应数据格式化成JSON格式：

~~~ javascript
response: function(response) {
    if(response.headers()['content-type'] === "application/json; charset=utf-8"){
        var data = examineJSONResponse(response); // 假设存在这样一个方法
        if(!data) {
            response = validateJSONResponse(response); // 假设存在这样一个方法
        }
    }
    return response || $q.when(reponse);
}
~~~

### 利用**request拦截器**和**response拦截器**计算http请求耗时

这个需求可能在开发中并不常用，这里只是作为同时使用**request拦截器**和**response拦截器**的例子，我们可以在**request拦截器**和**response拦截器**中分别计时，然后求得其差值即可：

~~~ javascript
myApp.factory('timestampMarker', [function() {
    return {
        request: function(config) {
            config.requestTimestamp = new Date().getTime();
            return config;
        },
        response: function(response) {
            response.config.responseTimestamp = new Date().getTime();
            return response;
        }
    };
}]);
myApp.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('timestampMarker');
}]);
~~~

这样我们在每次请求后台时，就能够计算出相应请求的耗时了，如：

~~~ javascript
$http.get('https://api.github.com/users/liuwenzhuang/repos').then(function(response) {
    var time = response.config.responseTimestamp - response.config.requestTimestamp;
    console.log('The request took ' + (time / 1000) + ' seconds.');
});
~~~

## 总结

$http作为Angular中的核心service，其功能非常强大便捷，今天描述了其子功能**http拦截器**的概念和描述方式，有理解不正确的地方，请大家留言告知。