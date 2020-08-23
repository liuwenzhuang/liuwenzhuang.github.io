---
title: inline svg 的使用
date: 2017-03-13 15:43:00
tag: ["svg"]
excerpt: inline svg是目前前端图标解决方案的最优解（当然不仅限于图标），而且使用方式也及其简单，只要将svg图标代码当成普通的html元素来使用即可。
---

[svgo]: https://github.com/svg/svgo
[svg部分动画]: https://codesandbox.io/s/svg-animations-28qcs
[github octicons 迁移至 svg]: https://github.blog/2016-02-22-delivering-octicons-with-svg/
[inline svg vs icon font]: https://css-tricks.com/icon-fonts-vs-svg/
[ant design icons]: https://github.com/ant-design/ant-design-icons

[字体图标的使用与设计]: {% post_url 2016-10-20-iconfont-design-usage %}

`inline svg`是目前前端图标解决方案的最优解（当然不仅限于图标），而且使用方式也及其简单，只要将 svg 图标代码当成普通的 html 元素来使用即可，如：

```html
<!-- 绘制右箭头 -->
<svg viewBox="0 0 1024 1024" height="1em" width="1em" fill="currentColor">
  <path
    d="M665.6 512L419.84 768l-61.44-64 184.32-192L358.4 320l61.44-64 184.32 192 61.44 64z"
  />
</svg>

<!-- 绘制边框 -->
<svg viewBox="0 0 20 2" preserveAspectRatio="none" width="100%" height="2px">
  <path d="M0 1L20 1" stroke="rgba(0, 0, 0, .5)" stoke-width="2px"></path>
</svg>
```

将上面的代码插入 html 文档即可以很简单地绘制出一些图标。

> 一般来说，使用`inline svg`作为图标使用时，想要保留 svg 的纵横比，可以只指定`width`属性，但是一般为了清晰都同时指定`height`属性。但如果是像上面*绘制边框*这种不需要保留纵横比的情形，可将`preserveAspectRatio`设置为*none*。

## 优势与使用方式

从上面的例子可以看到，将 svg 直接作为普通 html 元素插入文档中，其本质和渲染出一个 div、span 等元素无异，**天生具有渲染快、不会造成额外的 http 请求等优势**，除此之外还有以下优势之处：

### 样式控制更加方便

一般来说，我们为`inline svg`顶层的`<svg>`元素会设置以下几个属性：

- height="1em" width="1em" 可以方便地通过设置父元素的*font-size*属性控制尺寸
- fill="currentColor" 可以方便地根据父元素或自身的*color*属性控制颜色

但是我们也可以为其内部的子元素单独设置样式，如：

```css
svg path {
  fill: rgb(0, 153, 255);
}
```

在`inline svg`中仅有一个`<path>`元素时，上面的特性可能用处不大，但是如果某些 svg 是由多个元素构成时，可以将样式分别应用的特性就尤为宝贵了，很容易地就可以解决在字体图标中不可有多色图标的问题：

```html
<style>
  svg path {
    fill: rgb(0, 153, 255);
  }
  svg path.right {
    fill: rgb(30, 185, 133);
  }
</style>

<svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
  <path
    d="M256 51.2v256H153.6V512h51.2v51.2h-51.2v307.2H512v51.2H102.4V307.2H0v-256z"
  ></path>
  <path d="M256 512h51.2v51.2H256zM358.4 512h51.2v51.2h-51.2z"></path>
  <path
    class="right"
    d="M460.8 102.4H1024V256H460.8zM460.8 460.8H1024v153.6H460.8V460.8zM460.8 819.2H1024v153.6H460.8V819.2z"
  ></path>
</svg>
```

### 动画控制细化

既然能够样式控制能够细化，那动画设置自然也能够具体到各元素，所以这一项严格意义上和上一项是一样的，但是动画算是样式中比较独立的一部分，所以此处单独拎出来阐述。

这里要说明一下，使用字体图标是可以应用动画的，不过那个动画是整体动画：

```html
<!-- 字体图标整体动画 -->
<style>
  /* 定义icon font */
  .icon {
    font-family: "iconfont" !important;
    /* ... */
  }
  .icon-smile:before {
    content: "\e938";
  }

  /* 定义动画 */
  @keyframes loadingIcon {
    from {
      transform: rotate(0);
    }

    to {
      transform: rotate(360deg);
    }
  }
  .icon {
    animation: loadingIcon 2s infinite;
  }
</style>
<i class="icon icon-smile"></i>
```

上面的动画会将*icon-smile*图标整体做旋转，如果我们只是想对其中的部分应用动画就不行了。

而在`inline svg`中，只需为想要设置动画的部分元素设置`class`，然后在 CSS 中定义动画即可，如要查看针对 svg 某些部分应用动画，可查看[此例][svg部分动画]。

> 如需对 svg 中各部分分别应用样式，则在设计 svg 时最好不要将各部分都编于一组，可以将应用相同样式的部分进行分别编组，其他不需要设置样式的部分编为一组，这样我们在应用样式时，只需为对应的`<g>`标签设置`class`属性即可。

> 一般在拿到 svg 文件后，推荐使用[svgo][svgo]优化 svg 代码，节省体积，但是如果我们需要针对性设置样式时则需要谨慎使用，因为优化代码会进行路径合并等操作，可能我们想要设置的子元素已经不是独立的了。

### 不必加载非必要资源

对于字体图标来说，首页就需要加载全部的字体文件；对于 svg sprites 来说，一般需要往`<body>`首位插入隐藏的一堆`symbol`或`defs`代码合集（可通过对`index.html`预插入或者通过 js 代码插入）。上述两种方式都相当于全量加载，对于用户来说可能根本“看不全”这些图标或代码。而通过`inline svg`的方式则不会，因为它是直接渲染在页面上，不涉及资源加载操作，不会造成浪费。

对单页面应用来说，配合如`webpack`的`splitChunks`配置可缩短首屏加载时间；对多页面应用来说优势更加明显，不必为每个页面都处理 svg 相关资源的引入。

## inline svg 的复用及组件化

上面提到`inline svg`的优势，但是也很容易看出其劣势：复杂，一个`<p>`可以很明显地表示一段文字，但是一个`<svg>`想要描述出一个图标就有些复杂了，想要表达内容愈丰富，插入文档中的代码段就愈复杂，虽然 svg 本身改动的频率不高，如有改动也是整体替换，但是它破坏了整个文件的可维护性。而且还存在多处引用同一个`inline svg`片段的情况，因为它基本上是由一些无规律的指令和数组组成的，故针对其进行全局搜索都不现实。所以同一个`inline svg`必须能够进行复用，而组件就是为了解决复用而生的，而且将`inline svg`封装成组件也相当简单，下面以 Vue 和 React 为例展示一下`inline svg`的组件实现：

### React 实现

```ts
// any-inline-svg-component.tsx
import React from "react";

interface SVGIconProps {
  width?: string;
  height?: string;
  fill?: string;
  style?: React.CSSProperties;
  className?: string;
  onClick?: (event: React.MouseEvent<SVGSVGElement>) => any;
}

export default (props: SVGIconProps) => {
  return (
    <svg viewBox="0 0 1024 1024" {...props}>
      {/* 内部实现 */}
    </svg>
  );
};

// 使用inline svg组件
import AnySvgIcon from "./any-inline-svg-component";
<AnySvgIcon width="16px" height="16px" />;
```

### Vue 实现

```ts
// any-inline-svg-component.vue
<template>
  <svg viewBox="0 0 1024 1024" :width="width" :height="height" :fill="fill">
    <!-- 内部实现 -->
  </svg>
</template>
<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator'

@Component
export default class AnySvgIcon extends Vue {
  @Prop({ default: '1em' }) public width!: string
  @Prop({ default: '1em' }) public height!: string
  @Prop({ default: 'currentColor' }) public fill!: string
  // 其他属性
}
</script>

// 使用inline svg组件
<template>
  <AnySvgIcon />
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import AnySvgIcon from './any-inline-svg-component.vue'

@Component({
  components: {
    AnySvgIcon,
  },
})
class App extends Vue {
  // bala...
}
</script>
```

> 请注意安装`typescript`和`vue-property-decorator`等依赖。

> 如果工程内使用 svg 较少，可手动将这些 svg 文件内容处理成相应的组件。但当工程内使用 svg 很多的话，可参考[ant design icons][ant design icons]的处理方式，将 svg 文件批量处理成相应的组件。

## 更多

上面的例子中，我们都写死了`viewBox`为*0 0 1024 1024*，这个属性是可以改变的，它只是定义了一个坐标系统，不代表占据页面的空间大小（由 width、height 指定），而且和设计 svg 文件时使用的画布大小有关，大家只要坚持一种设计风格即可，有关 svg 的设计，可参考[字体图标的使用与设计][字体图标的使用与设计]。

`inline svg`是一个很强大的工具，不仅仅能用作图标，搭配上 CSS 和其特有的属性可以很简单地实现很多效果，大家多多探索。

## 参考

- [GitHub octicons 迁移至 SVG][github octicons迁移至svg]
- [inline svg 和字体图标的对比][inline svg vs icon font]
- [字体图标的使用与设计][字体图标的使用与设计]
