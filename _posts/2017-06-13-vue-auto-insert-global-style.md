---
title: Vue2工程为组件自动注入全局样式文件
date: 2017-06-13 19:23:45
tag: ['Vue2']
excerpt: 开发过程中，随着工程变大，不免要提取出一些公共的样式，如variables、mixins、functions等几乎在所有业务组件中都会用到的样式，本文介绍Vue2中怎样向组件中自动注入全局样式文件。
---

[style-resources-loader]: https://github.com/yenshih/style-resources-loader
[vue-cli-plugin-style-resources-loader]: https://www.npmjs.com/package/vue-cli-plugin-style-resources-loader

## 背景

开发过程中，随着工程变大，不免要提取出一些公共的样式，如`variables`、`mixins`、`functions`等几乎在所有业务组件中都会用到的样式：

```bash
-- src
---- styles
-------- variables.less
-------- mixins.less
-------- functions.less
```

如果每个需要的组件都要手动导入一次，就太繁琐了：

```vue
<script lang="less">
@import "../styles/variables";
@import "../styles/mixins";
@import "../styles/functions";

// 其他样式
</script>
```

当然最直接的改进方案是创建一个包含上面引入的入口样式文件`entry.less`，然后在各组件中导入即可：

```less
// entry.less

@import './variables';
@import './mixins';
@import './functions';
```

```vue
<script lang="less">
@import "../styles/entry";

// 其他样式
</script>
```

但是手动导入毕竟繁琐，若能够自动导入就大善了，所幸配置自动导入也不繁琐，下面以常用的`Less`、`Stylus`、`Sass/Scss`等预处理器为例说明如何在vue工程中配置自动导入：

## Less和Stylus

配置Less和Stylus自动导入有两种方案：

- 使用[style-resources-loader][style-resources-loader]
- 使用[vue-cli-plugin-style-resources-loader][vue-cli-plugin-style-resources-loader]

这里我们推荐使用第一种，因为第二种方案只是对第一种方案的包装，且暂不支持热更新。

### 安装style-resources-loader

```bash
$ npm i -D style-resources-loader
```

### 配置vue.config.js

如果工程根目录下没有`vue.config.js`文件，手动创建一下即可，然后插入以下代码：

```javascript
// vue.config.js
const path = require('path')

module.exports = {
  chainWebpack: config => {
    const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
    types.forEach(type => addStyleResource(config.module.rule('less').oneOf(type)))  // A
  },
}

function addStyleResource (rule) {
  rule.use('style-resource')
    .loader('style-resources-loader')
    .options({
      patterns: [
        path.resolve(__dirname, './src/styles/entry.less'),  // B
      ],
    })
}
```

如果想要配置多个导入，只需在B行后继续添加即可：

```javascript
patterns: [
  path.resolve(__dirname, './src/styles/entry1.less'),
  path.resolve(__dirname, './src/styles/entry2.less'),
],
```

> 如果工程使用的是`Stylus`，则将A行替换为*types.forEach(type => addStyleResource(config.module.rule('stylus').oneOf(type)))*，将B行替换为*path.resolve(__dirname, './src/styles/entry.styl')*即可。


## Sass/Scss

其实Sass/Scss配置自动导入也可以使用上面的方案，但是使用其原生的方案更加便捷，只需在`vue.config.js`中配置即可：

```javascript
// vue.config.js
module.exports = {
  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "@/styles/entry.scss";`  // A
      }
    }
  }
}
```

如果想要配置多个导入，只需在A行继续添加即可：

```javascript
// vue.config.js
module.exports = {
  css: {
    loaderOptions: {
      sass: {
        prependData: `
            @import "@/styles/entry1.scss";
            @import "@/styles/entry2.scss";
        `
      }
    }
  }
}
```

> 注意：sass-loader@8.0.0之前，要将上面的`prependData`替换为`data`。

## 扩展

如果在使用`vue create`创建工程时，没有选择`Manually select features`，或者没有选择`CSS Pre-processors`，则工程内默认使用的是原生CSS，但是vue的默认Webpack配置中已经内置了对`CSS Pre-processors`的支持，所以只需要安装响应依赖，然后再工程文件中使用对应语法书写样式即可：

```bash
// Less
$ npm i -D less less-loader

// Sass/Scss
$ npm i -D node-sass sass-loader

// Stylus
$ npm i -D stylus stylus-loader
```
