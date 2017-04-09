---
title: 'Angular 2 利用Router事件和Title实现动态页面标题'
date: 2016-03-23 21:23:45
tag: ionic2
thumbnail: 'angular_logo.png'
keywords: Event, Routes, Title, Component, 动态页面标题， Angular2 设置页面标题， ngOnInit
excerpt: Angular2 为我们提供了名为Title的Service用于修改和获取页面标题，但是如果只是能够在每个页面的ngOnInit方法中为每个页面设置标题岂不是太low了，不符合Angular2高(zhuang)大(bi)的身影。我们想要的结果是在页面改变时能够动态地改变页面标题，如此最好的解决方案就是组合使用Router事件和Title Service。
---
[original-post]: https://toddmotto.com/dynamic-page-titles-angular-2-router-events
[RxJS-filter-doc]: http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-filter
[RxJS-map-doc]: http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-map
[GitHub-Repository]: https://github.com/liuwenzhuang/angular2-dynamic-page-titles
[angular-ActivatedRoute-doc]: https://angular.io/docs/ts/latest/api/router/index/ActivatedRoute-interface.html
[angular-Routing-tourial]: https://angular.io/docs/ts/latest/tutorial/toh-pt5.html
[angular2-constructor-ngOnInit]: {% post_url 2016-03-04-angular2-constructor-versus-ngOnInit %}

 > 本篇为译文，[点击这里][original-post]前往原文。

Angular2 为我们提供了名为Title的Service用于修改和获取页面标题，但是如果只是能够在每个页面的ngOnInit方法中为每个页面设置标题岂不是太low了，不符合Angular2高(zhuang)大(bi)的身影。我们想要的结果是在页面改变时能够动态地改变页面标题，如此最好的解决方案就是组合使用Router事件和Title Service。

## Title Service

使用Service自然首先要将其引入，不过要注意Title Service并不在`@angular/core`中，而是在`@angular/platform-browser`中：

~~~ javascript
import { Title } from '@angular/platform-browser';
~~~

引入之后，自然要将其注入到当前组件中，而这通常利用`constructor`完成：

~~~ javascript
import { Title } from '@angular/platform-browser';
import {Component} from '@angular/core';
@Component({})
export class AppComponent {
    constructor(private titleService: Title) {
        // 使用this.title到处浪
    }
}
~~~

很显然，Title Service应该有某些操作页面标题的方法，不管通过查找文档还是查找源码我们都能很容易知道其只有两个方法：

 - getTitle() 用于获取当前当前页面的标题
 - setTitle(newTitle: String) 用于设置当前页面的标题

如果只是简单地静态地设置页面标题，则可以在`ngOnInit`方法中直接使用`setTitle`方法：

~~~ javascript
// import bala...
@Component({})
export class AppComponent implements OnInit {
    constructor(private titleService: Title) {
        // 使用this.title到处浪
    }

    ngOnInit() {
        this.titleService.setTitle('New Title Here');
    }
}
~~~

 > 在ngOnInit中使用`setTitle`方法设置文档标题是较好的时机，当然也可以根据自己的需求在任意地方使用`setTitle`方法。

## Router和Router事件

使用Router和使用Title Service流程基本一致，先引入后注入，不过要注意Router和Title Service类似并不位于`@angular/core`中，而是位于`@angular/router`中：

~~~ javascript
import { Title } from '@angular/platform-browser';
import {Component} from '@angular/core';
import {Router} from '@angular/router';
@Component({})
export class AppComponent {
    constructor(private titleService: Title, private router: Router) {
        // 使用this.title和this.router到处浪
    }
}
~~~

### Router配置

Angular2中通过URL、Router和Component之间的对应关系进行页面之间的跳转，Router把浏览器中的URL看做一个操作指南，据此可导航到一个由客户端生成的视图，并可以把参数传给支撑视图的相应组件。所以我们需要定义路由表：

~~~ javascript
// import bala...
export const rootRouterConfig: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: 'home', component: HomeComponent, data: {title: 'Home-Liu'} },
  { path: 'about', component: AboutComponent, data: {title: 'About-Liu'} },
  { path: 'github', component: RepoBrowserComponent,
    children: [
      { path: '', component: RepoListComponent, data: {title: 'GitHub List'} },
      { path: ':org', component: RepoListComponent,
        children: [
          { path: '', component: RepoDetailComponent, data: {title: 'Repo'} },
          { path: ':repo', component: RepoDetailComponent, data: {title: 'RepoDetail'} }
        ]
      }]
  },
  { path: 'contact', component: ContactComponent, data: {title: 'Contact-Liu'} }
];
~~~

注意路径和组件之间的对应关系，并且为了能够在Router事件中获取到页面标题，我们在路由表中，为一些页面提供了数据`data`，并在`data`中设置了表示页面标题的`title`属性。

### Router事件

利用Router事件我们就可以实现动态改变页面标题的目的，不过放置的位置很重要，我们这里选择在`AppComponent`的`ngOnInit`方法中利用`subscribe`订阅Router事件，因为`AppComponent`是根组件，所以能够订阅所有Router事件：

~~~ javascript
ngOnInit() {
  this.router.events
    .subscribe((event) => {
      console.log(event);   // 包括NavigationStart, RoutesRecognized, NavigationEnd
    });
}
~~~

当然我们这里这对`NavigationEnd`事件感兴趣：

~~~ javascript
import {ActivatedRoute} from '@angular/router';
// import bala...

// other codes

ngOnInit() {
  this.router.events
    .subscribe((event) => {
      if (event instanceof NavigationEnd) {
        console.log('NavigationEnd:', event);
      }
    });
}
~~~

当然使用这种判断筛选的方式并没有错，但是在现在的前端世界里显得不够优雅，我们应该使用RxJS中的[filter][RxJS-filter-doc]达到我们的目的：

~~~ javascript
import 'rxjs/add/operator/filter';
// import bala...

// other codes

ngOnInit() {
  this.router.events
  .filter(event => event instanceof NavigationEnd)  // 筛选原始的Observable：this.router.events
  .subscribe((event) => {
    console.log('NavigationEnd:', event);
  });
}
~~~

当然，我们如果想要动态改变某个页面的标题，就需要获取到当前被展示的页面对应的路由信息，而这可以通过`ActivatedRoute`得到，其使用方式和Title Service及Router类似，不再赘述：

~~~ javascript
import { Title } from '@angular/platform-browser';
import {Component, OnInit} from '@angular/core';
import {Router, NavigationEnd, ActivatedRoute} from '@angular/router';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
@Component({})
export class AppComponent implements OnInit {
  constructor(private titleService: Title, private router: Router, private activatedRoute: ActivatedRoute) {
    // 使用this.title和this.router和this.activatedRoute到处浪
  }

  ngOnInit() {
    this.router.events
    .filter(event => event instanceof NavigationEnd)
    .map(() => this.activatedRoute) // 将filter处理后的Observable再次处理
    .subscribe((event) => {
      console.log('NavigationEnd:', event);
    });
  }
}
~~~

注意这里我们又使用了RxJS中的[map][RxJS-map-doc]来更优雅地达成我们目的。

看起来我们已经完(luo)成(suo)很多事情了，但是还不够，我们目前还没有处理子路由，即我们上文路由配置中的`children`属性，所以我们还需要遍历路由表以便获取到每一个页面对应的路由信息：

~~~ javascript
ngOnInit() {
  this.router.events
  .filter(event => event instanceof NavigationEnd)
  .map(() => this.activatedRoute)
  .map((route) => {
    while(route.firstChild) {
      route = router.firstChild;
    }
    return route;
  })
  .subscribe((event) => {
    console.log('NavigationEnd:', event);
  });
}
~~~

最后，我们还需要获取到我们在路由表中为每个路由传入的`data`信息，然后再利用Title Service设置页面标题：

~~~ javascript
ngOnInit() {
  this.router.events
    .filter(event => event instanceof NavigationEnd)
    .map(() => this.activatedRoute)
    .map(route => {
      while (route.firstChild) route = route.firstChild;
      return route;
    })
    .mergeMap(route => route.data)
    .subscribe((event) => this.titleService.setTitle(event['title']));
}
~~~

下面是完成的最终代码，或者也可以到GitHub上查看[完整代码][GitHub-Repository]：

~~~ javascript
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

@Component({...})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title
  ) {}
  ngOnInit() {
    this.router.events
      .filter(event => event instanceof NavigationEnd)
      .map(() => this.activatedRoute)
      .map(route => {
        while (route.firstChild) route = route.firstChild;
        return route;
      })
      .filter(route => route.outlet === 'primary')
      .mergeMap(route => route.data)
      .subscribe((event) => this.titleService.setTitle(event['title']));
  }
}
~~~

## 参考文档

 > [Angular2 路由指导][angular-Routing-tourial]<br>
 > [Angualr2 ActivatedRoute文档][angular-ActivatedRoute-doc]<br>
 > [Angular之constructor和ngOnInit差异及适用场景][angular2-constructor-ngOnInit]