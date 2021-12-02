---
title: lerna / Yarn Workspaces 中使用 Jest 可能存在的路径问题
date: 2021-11-30 08:23:12
tag: ["Tools"]
excerpt: 最近在 Yarn Workspaces 中使用 Jest 发现可能会找不到本地的依赖，经过定位后发现解决方案也很简单。
---

[Jest moduleNameMapper API]: https://jestjs.io/docs/configuration#modulenamemapper-objectstring-string--arraystring
[MDN String Replace With Regexp]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_string_as_a_parameter

最近在 Yarn2+ Workspaces 中使用 Jest 发现可能会找不到本地的依赖，结构如下：

```bash
# product 依赖于 utils
├── package.json
├── node_modules
│   ├── lwz-utils -> ../packages/lwz-utils/
│   ├── lwz-product -> ../packages/lwz-product/
│   ├── jest
├── packages
│   ├── lwz-utils
│   ├── lwz-product
├── README.md
└── yarn.lock
```

*lwz-product* 依赖于 *lwz-utils*，而它们通过软链的方式被提升到顶层的 *node_modules*，且 Jest 也被安装/提升在了顶层，此时如果在 *lwz-product* 执行 `jest` 进行测试，Jest 会抛出找不到 *lwz-utils* 依赖的错误：

```bash
yarn workspace lwz-product test

FAIL  src/__tests__/index.test.ts
  ● Test suite failed to run
Cannot find module 'lwz-utils' from 'src/index.ts'
# 其他错误
at Resolver.resolveModule (../../node_modules/jest-resolve/build/resolver.js:327:11) at Object.<anonymous> (src/index.ts:1:1)
```

可以猜测出，这是 Jest 在查找依赖的时候因为路径的原因导致查找不到 *lwz-utils* 依赖。

## 解决方案

此时可以在 Jest 的配置中使用 `moduleNameMapper` 主动配置类似依赖的查找路径，像上面的问题，就可以像下面这样进行配置：

```javascript
// lwz-product/jest.config.js

const path = require('path')

module.exports = {
  testEnvironment: 'node',
  // 其他配置
  moduleNameMapper: {
    '^lwz-utils$': path.resolve(__dirname, '../../node_modules/lwz-product/lib/index.js'),
  }
}
```

要注意的是，`moduleNameMapper` 配置中的 key 值是作为正则处理的，可以像书写正则字符串一样书写，而且在 key 值中用到的捕获组，在 value 部分可以使用 *$1*、*$2* 等语法进行引用，这里就不再赘述了，具体可查看 [官方文档][Jest moduleNameMapper API]，里面也有一些例子。

## 参考

- [moduleNameMapper API文档][Jest moduleNameMapper API]
- [MDN 字符串替换中捕获组的引用][MDN String Replace With Regexp]
