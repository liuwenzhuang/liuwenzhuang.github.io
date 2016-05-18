---
title: 'Ionic 2神器之VirtualScroll'
date: 2016-05-17 17:32:00
tag: ionic2
---
[virtual-scoll]: http://ionicframework.com/docs/v2/api/components/virtual-scroll/VirtualScroll/
手机应用中，List控件必不可少，而对于List控件，最重要的是其滑动的效果如何。尤其是对于混合开发来说，本来性能就不如原生应用，对List的优化尤显重要。使用过Ionic 1的开发者应该都有如下体会：当`<ion-list></ion-list>`中包含了大量的`<ion-item></ion-item>`时，滚动的卡顿效果尤其明显。

Ionic 2提供了[VirtualScroll][virtual-scoll]来改善大量数据List的响应问题。`Virtual Scroll`在HTML5混合应用开发中是一个重要的概念，其基本思路是“所见即所建”，即根据界面的需要对资源进行创建、回收、缓存等操作，活跃页面对应活跃资源。下面通过例子说明Ionic 2的[VirtualScroll][virtual-scoll]的使用方式及注意事项：

# 创建Ionic 2应用

首先我们创建一个新的Ionic 2应用，Ionic 2创建工程的方式和Ionic 1很相似：

~~~ bash
$ ionic start virtual-scroll tabs --v2 --ts
~~~

这里我们使用了Ionic 2提供的tabs模板工程创建我们的工程，我们在一个tab页面中使用`Virtual Scroll`，另一个tab页面中使用普通的方式创建列表，以方便进行对比。

# 创建provider提供数据

为演示出使用`Virtual Scroll`的效果，我们刻意将数据量放大，比如3000条数据，这样我们创建一个provider提供数据，以便在两个tab页面中都能够使用：

~~~ bash
$ ionic g provider items-provider
~~~

执行完成后，Ionic CLI会帮我们创建`app/providers/items-provider.ts`，里面的默认内容我们此处用不到，可以删去，下面是完成后的内容：

~~~ javascript
import {Injectable} from 'angular2/core';
import 'rxjs/add/operator/map';

@Injectable()
export class ItemsProvider {
    data: Array<any> = [];

    constructor() { }

    loadItems() {
        for(let i=0; i<3000; i++) {
            this.data.push({
                title: `Item${i}`,
                content: `Item${i} content`,
                avatar: 'https://avatars.io/facebook/random'+i
            });
        }

        return Promise.resolve(this.data);
    }
}
~~~

`loadItems`方法是提供数据的主体。

# 在tab页面中获取数据

上面提到，我们需要使用两个tab页面进行对比，其中一个使用普通的列表，另一个使用`Virtual Scroll`创建列表。这里我们选择tab1（不使用`Virtual Scroll`）和tab2（使用`Virtual Scroll`）进行对比。 首先我们为他们提供数据：

## 引入provider：

分别在`app/pages/page1/page1.ts`和`app/pages/page2/page2.ts`头部引入上一步创建的`ItemsProvider`：

~~~ javascript
import {ItemsProvider} from '../../providers/items-provider/items-provider';
~~~

做完这一步还不够，我们还需要将`ItemsProvider`作为依赖注入，但在**进行依赖注入时要注意保证provider的单例性**，即如果我们在所有用到`ItemsProvider`的组件中都将其注入一次，那就会得到`ItemsProvider`的多个实例，破换了其单例性。我们需要在这些组件的父组件中注入provider，对于tab页面来说，其父组件为`app/pages/tabs/tabs.ts`，我们可以在其`@Page`修饰器中注入`ItemsProvider`依赖，不过不要忘记引入：

~~~ javascript
import {ItemsProvider} from '../../providers/items-provider/items-provider';

//inject provider once in parent component
@Page({
    providers: [ItemsProvider]
})
~~~

## 获取数据

分别在`app/pages/page1/page1.ts`和`app/pages/page2/page2.ts`的`ngOnInit()`函数中获取数据：

~~~ javascript
items: Array<any> = [];
ngOnInit() {
    this.itemsProvider.loadItems().then(data => {
        this.items = data;
    });
}
~~~

注意，对于耗时操作，如网络读取等，尽量不要放在`constructor`中进行，`constructor`中应该只进行一些简单的初始化工作。下面是完整的`app/pages/page1/page1.ts`：

~~~ javascript
import {Page} from 'ionic-angular';
import {ItemsProvider} from '../../providers/items-provider/items-provider';

@Page({
    templateUrl: 'build/pages/page1/page1.html'
})
export class Page1 {
    items: Array<any> = [];
    constructor(private itemsProvider: ItemsProvider) {
    }

    ngOnInit() {
        this.itemsProvider.loadItems().then(data => {
            this.items = data;
            console.log(this.items);
        });
    }
}
~~~

`app/pages/page1/page2.ts`中的内容和`app/pages/page1/page1.ts`没有什么区别，只是`templateUrl`和类名不一致而已。

# 创建列表

## 普通列表

修改`app/pages/page1/page1.html`文件，创建列表：

~~~ html
<ion-navbar *navbar>
    <ion-title>Tab 1</ion-title>
</ion-navbar>

<ion-content padding class="page1">
    <ion-list>
        <ion-item *ngFor="#item of items">
            <ion-avatar item-left>
                <ion-img [src]="item.avatar"></ion-img>
            </ion-avatar>
            {% raw %}<h2>{{item.title}}</h2>
            <p>{{item.content}}</p>{% endraw %}
        </ion-item>
    </ion-list>
</ion-content>
~~~

这里我们只是使用了`*ngFor`遍历所有数据并创建列表。此时可以运行应用，查看普通列表的滑动效果。

## Virtual Scroll列表

修改`app/pages/page1/page2.html`文件，创建列表：

~~~ html
<ion-navbar *navbar>
    <ion-title>
        Tab 2
    </ion-title>
</ion-navbar>

<ion-content class="page2">
    <ion-list [virtualScroll]='items'>
        <ion-item *virtualItem='#item'>
            <ion-avatar item-left>
                <ion-img [src]="item.avatar"></ion-img>
            </ion-avatar>
            {% raw %}<h2>{{ item.title }}</h2>
            <p>{{ item.content }}</p>{% endraw %}
        </ion-item>
    </ion-list>
</ion-content>
~~~

这里的语法和创建普通列表稍有差别，`[virtualScroll]`是我们的数据源，数组类型，对应于`*ngFor`里面的数据源，而`*virtualItem`表示数据源中的单条数据。即使语法稍微不同，但其中概念一致，都需要遍历数据源中的数据，并创建列表。

此时运行应用，可以很直观地看到tab1和tab2中两种不同方式列表滑动效果的不同。

# Virtual Scroll使用注意事项

 - 使用`<ion-img>`标签代替`<img>`标签，`<ion-img>`标签能够阻止不必要的网络请求，提升性能，并在请求未成功前提供默认的图片，以防图片空缺；
 - 图片的尺寸不应变化；
 - 使用`approxItemWidth`和`approxItemHeight`属性能够提升`Virtual Scroll`的性能，不过它们只是近似值，仅作为计算的参考；
 - 数据源变化会造成`Virtual Scroll`的重新构造，非常耗费性能，尽量不要改变数据源；

## approxItemWidth和approxItemHeight的使用方式

`approxItemWidth`是列表项宽度的近似值，可以使用`px`或`%`作为单位，默认值是100%，字符串类型；`approxItemHeight`是列表项高度的近似值，使用`px`作为单位，默认值是40px，字符串类型。使用它们可以提升性能，下面是其使用方式：

~~~ html
<ion-list [virtualScroll]='items' [approxItemHeight]="'36px'" [approxItemWidth]="'90%'">
~~~

注意赋值时要使用`"''"`的方式，使用`""`和`''`会产生错误。