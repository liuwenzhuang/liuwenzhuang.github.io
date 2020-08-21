---
title: Vue2组件代码分块和懒加载
date: 2018-08-23 19:23:45
tag: ['Vue2']
excerpt: 前端开发中，随着业务和页面增加，以组件为基本单位的结构下，组件数量会增长极快，为了优化我们经常需要进行代码分块和对非必要资源文件进行懒加载。
---

前端开发中，随着业务和页面增加，以组件为基本单位的结构下，组件数量会增长极快，为了优化我们会很显然地想要进行一些工作：

- 代码分块
- 懒加载非必要资源文件

> 非必要资源，指的首次渲染出某页面所不必要的资源，如因为用户操作才出现的图片、弹窗等。

代码分块和懒加载在页面层面具有极大的优化作用，用户很可能只是浏览dashboard页面，可能根本就不会去看详情等页面，那我们就不必将详情页面的代码和dashboard页面代码混在一起，用户看某个页面时只加载那个页面对应的资源即可，可以较大地提升用户体验。本文就在Vue工程下如何在组件层面配置代码分块和懒加载进行讲解。

> 本文在@vue/cli 3以上版本。

## 懒加载组件

一般来说，Vue中使用某组件过程大致如下：

```vue
<script>
// Home.vue
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  components: {
    HelloWorld,
  },
}
</script>
```

这是我们最熟悉的方式了，我们在访问*Home.vue*时，Webpack为我们保证了*HelloWorld.vue*一定是存在的，这是由依赖关系决定的（*Home.vue*依赖于*HelloWorld.vue*）。这很正常对吧，但是如果*HelloWorld.vue*是非必要资源呢，比如需要用户点击一个按钮才会出现的弹窗或者是默认隐藏的内容，只当某些条件触发时才出现的页面区域呢？如果是上述情况，当我们访问*Home.vue*时显然没必要马上就将*HelloWorld.vue*请求过来，而且配置方法也及其简单：

```vue
<template>
  <div class="home">
    <button @click="() => showHello = true">Hello</button>
    <HelloWorld v-if="showHello" />
  </div>
</template>

<script>
// Home.vue
export default {
  components: {
    HelloWorld: () => import('@/components/HelloWorld.vue'),  // A
  },
  data() {
    return {
      showHello: false,
    }
  },
}
</script>
```

只需像A行一样简单处理一下即可一举两得：*HelloWorld.vue*会被打包成独立为单独的js文件，而且只有当我们点击按钮时，这个独立的js文件才会被请求，这样能够减小主代码块的体积。简单分析一下：`import()`会返回一个组件Promise，现在基本上所有的打包工具都理解此语法，而且还会触发Webpack的代码分块（Webpack 2之后）。

> 注意：Vue不会在意某个组件，直到它要被渲染出来。以上例来说，只有当我们触发了按钮，*HelloWorld.vue*才有了意义。

> 即使所有组件都可以配置懒加载，但是别滥用，大部分情况下只对非必要资源配置懒加载即可，像上例如果*HelloWorld.vue*是*Home.vue*中是一直存在的，那样配置懒加载可能会适得其反，加载了*Home.vue*对应的js文件后会马上请求*HelloWorld.vue*对应的js文件，如果*HelloWorld.vue*对应的js文件比较小，那得到的收益可能不足以抵消一次http请求带来的消耗。

## 问题与解决方案

组件懒加载虽然好处极多，但仍有缺陷，如上例点击按钮后需等待*HelloWorld.vue*对应的js文件被请求执行后页面才会做出相应变化，这就涉及到加载状态和错误状态的处理（虽然一般情况下不会有问题，因为都是些小文件，加载极快，但也有例外），所幸Vue也为我们考虑到了这些：

### 加载中组件

```vue
<script>
// Home.vue
import LoadingComponent from '@/components/Loading'

export default {
  components: {
    HelloWorld: () => ({
      component: import('@/components/HelloWorld.vue'),
      loading: LoadingComponent,  // 加载HelloWorld.vue对应js文件中展示
      delay: 300,                 // loading的延迟生效时间
    }),
  },
  data() {
    return {
      showHello: false,
    }
  },
}
</script>
```

从用户体验方面来说，般来说500ms内的响应时间还不至于失去用户的注意力，所以可以为loading配置一个延迟时间，默认200ms内加载完成不会出现loading，当然也可以像上面一样手动设置一下`delay`，单位ms。

### 错误处理组件

```vue
<script>
// Home.vue
import ErrorComponent from '@/components/Error'

export default {
  components: {
    HelloWorld: () => ({
      component: import('@/components/HelloWorld.vue'),
      error: ErrorComponent,  // 加载HelloWorld.vue对应js文件失败时展示，如文件不存在
      timeout: 2000,          // 文件加载的超时时间，超出时间未加载完成，会触发ErrorComponent
    }),
  },
  data() {
    return {
      showHello: false,
    }
  },
}
</script>
```

出现错误的情形主要有以下几点：

- 网络连接不通 / 服务器错误
- 文件不存在（**特别注意重新部署后之前版本的文件被删除，而用户还未刷新页面**）
- 加载超时（默认是没有超时时间的，不过可以像上面一样通过`timeout`属性配置，单位ms）

## preload 和 prefetch

Vue还为资源文件配置了预加载策略，即使用`<link rel="prefetch">`和`<link rel="preload">`策略，在build后的index.html文件中或者开发模式下浏览器的Network面板里可以具体查看。关于两者的具体用法这里就不赘述了，这里说一下两者差异之处：`preload`的优先级比`prefetch`的高，一般来说当前页面的必要资源可以使用`preload`策略，当前页面的非必要资源和其他页面的资源使用`prefetch`策略。

通过配置资源预加载，浏览器为我们预先预先加载资源，在用户用到某些资源时可以及时响应，可以在提升首次加载性能的同时为用户后续的操作提供良好的体验。

> prefetch在Safari中暂时还不支持，所以懒加载在Safari中表现地相对较差。

## 总结

Vue中使用懒加载和代码分块对产品进行优化，简单实用，但是这其中存在着权衡，如果项目较小，打包文件并不大，则可能不需要进行代码分块和懒加载，毕竟http请求也是挺贵的。当项目较大时，使用懒加载和代码分块就可以显著地提升性能，但是同样注意那需要由后来的请求弥补的，但所幸目前大部分浏览器都支持资源预加载策略，搭配使用效果更佳。

- [异步组件](https://vuejs.org/v2/guide/components-dynamic-async.html#Async-Components)
- [preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content)
- [Safari prefetch](https://caniuse.com/#search=prefetch)
- [Safari preload](https://caniuse.com/#search=preload)
