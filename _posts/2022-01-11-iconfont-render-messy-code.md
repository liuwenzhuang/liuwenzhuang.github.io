---
title: icon font 渲染乱码
date: 2022-01-11 20:23:12
tag: ["Tools"]
excerpt: 最近维护一老项目，在部署后发现部分字体图标渲染出现乱码，最后发现是 sass 编译 unicode 码时出现了乱码。
---

最近维护一老项目，在部署后发现部分字体图标渲染出现乱码，且不是必现，在控制台查看元素，发现伪元素的 content 属性为乱码：

![iconfont-render-messy-code.PNG](/img/posts/iconfont/iconfont-render-messy-code.PNG)

而 scss 源码为：

```scss
// icon.scss
.icon-order {
  &:before {
    content: "\e261";
  }
}
```

而经过 webpack 构建，通过 sass-loader（dart-sass 实现）、css-loader 处理后的样式为：

```css
/* icon.css */
.icon-order:before {
  content: "";
}
```

> 如果使用的是 [node-sass][node-sass]，虽然可能不会出现此问题，但其已经不再维护了，故不推荐使用。

经过查询资料，发现此问题有如下几种方案：

## 方案 1 - 使用 utf-8 编码

通过 webpack 构建后的文件默认是 utf-8 编码的，但最好在响应头部中显式地指定当前文档使用的是 utf-8 编码：

```http
# Response Header
Content-Type: text/css; charset=utf-8
```

这样即使 css 文件中显示的是乱码，浏览器也应能够正常渲染。而出现问题页面的服务器并未给 css 文件设置 `charset=utf-8` 属性，想来这也是偶现的原因。

一般在 index.html 都会有如下代码：

```html
<meta charset="utf-8" />
```

但此属性只是指示了 index.html 的编码，并不能影响其中引用资源文件的编码。关于此配置的文档可查看[MDN 文档][charset mdn]。

> 服务器配置方面，应该为 js、css 等资源文件的 Content-Type 头部中指定 utf-8 编码。**此方案能否解决此问题未经实际验证**，可配合后续的方案使用更加保险。

## 方案 2 - 在 sass-loader 配置中为 dart-sass 指定 sassOptions

使用 `outputStyle` 配置为 _expanded_ 后，上文生成的 css 代码将不会是乱码，而是正常的 _content: "\e261";_：

```js
// webpack.config.js
{
  loader: "sass-loader",
  options: {
    implementation: require("sass"),
    sassOptions: {
      // 不进行代码压缩
      outputStyle: "expanded",
    },
  },
},
```

`outputStyle` 默认配置为 _compressed_，表示尽可能地删除多余的字符，将所有样式写作一行（即会进行代码压缩），关于 outputStyle 配置的信息，可查阅[dart-sass 文档][sass-outputstyle-doc]。虽然对于 dart-sass 来说，`outputStyle` 的默认是 _expanded_，但 sass-loader 会在生产模式下将默认值改为 _compressed_。可查阅 [sass-loader 源码][sass-loader-source]。

将 `outputStyle` 配置修改后，最终生成的样式文件是未经压缩的，这会对文件体积有影响，此时可结合 [css-minimizer-webpack-plugin][css-minimizer-webpack-plugin] 使用，具体用法可查看其文档，此处不再赘述。

## 方案 3 - 定义 scss 函数，替代直接书写 unicode 字面量

此方案详情，可查看此 [stack overflow 回复][stack-overflow-question]。

[stack-overflow-question]: https://stackoverflow.com/a/30421654/4526557
[css-minimizer-webpack-plugin]: https://github.com/webpack-contrib/css-minimizer-webpack-plugin
[sass-loader-source]: https://github.com/webpack-contrib/sass-loader/blob/babe42a1144e201cb17e3b076a677b167a7c2d41/src/utils.js#L174
[charset mdn]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-charset
[sass-outputstyle-doc]: https://sass-lang.com/documentation/cli/dart-sass#style
[node-sass]: https://github.com/sass/node-sass
