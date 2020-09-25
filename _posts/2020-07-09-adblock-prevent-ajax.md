---
title: ERR_BLOCKED_BY_CLIENT - 请求被广告拦截插件拦截
date: 2020-07-09 10:23:12
tag: ["tools"]
excerpt: 现在的广告拦截插件功能强大，我们一般用来拦截页面广告等，但没想到自己的业务网站的正常请求也会中招。
---

近日同事在项目中遇到个问题：用户 A 在使用某产品前端页面时从数据库中选择某张特定的表后调用接口获取相关数据失败，而其他表都是正常的。然后他在自己和同事的电脑上按同样的步骤操作，有些同事能够复现，有些不能复现。我按照他提供的步骤尝试复现了一下，发现相关请求是被拦截了：

控制台的报错信息：

```bash
GET http://xxx?table=activity_advertisement_info net::ERR_BLOCKED_BY_CLIENT
```

Network 请求的报错信息：

![在这里插入图片描述](/img/posts/adblock/block-get-xhr.png)

## 原因定位

首先看到`ERR_BLOCKED_BY_CLIENT`应该能知道是客户端拦截了，然后看到此请求是 GET 请求，并且 url 中还包含有*advertisement*字样，能够意识到可能是广告拦截插件的原因，看了一眼`AdblockPlus`的图标果然在此页面上有拦截记录，将插件关闭后重试果然可以了。

在 Chrome Devtools 的 Adblock Plus 面板中查看，发现是触发了[EasyList China+EasyList (compliance)](https://easylist-downloads.adblockplus.org/easylistchina+easylist.txt)中的`_advertisement_$domain=~media.ccc.de`规则：

![在这里插入图片描述](/img/posts/adblock/adblock_plus_devtool.png)

> 如果在 Chrome Devtools 中没有显示 Adblock Plus 面板，可以到`Adblock Plus设置 - 高级 - 自定义`中勾选`在开发人员工具中显示“Adblock Plus”面板`

## 解决方案

- 修改请求类型，如上例修改为 POST 请求，将 table 的值放于请求体中（最方便快捷），不要在 url 中出现能够被拦截的字眼
- 告知用户添加网站白名单/关闭特定过滤列表
- 联系过滤列表作者确定规则是否有问题

> Adblock Plus 等类似插件一般不维护过滤规则，只是使用规则，所以联系插件方一般没什么作用。

## 总结

上面是以`Adblock Plus`为例进行解释请求拦截在客户端被拦截的情况，其他拦截插件应该也类似。
