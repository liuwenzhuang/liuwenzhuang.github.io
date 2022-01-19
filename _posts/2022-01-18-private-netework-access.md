---
title: Private Network Access
date: 2022-01-11 20:23:12
tag: ["Tools"]
excerpt: Private Network Access 是 Blink 内核中新引入的安全性限制，放在 CORS 大类下，我在日常开发时遇到了些相关的问题。
---

[Private Network Access][pna] 是 Blink 内核中新引入的安全性限制，放在 CORS 大类下，对于 Chrome 浏览器来说，是在 94 版本后引入的。最近在处理微前端的接入时，遇到了此限制，访问页面时的报错大致如下：

```
XX has been blocked by CORS policy: The request client is not a secure context and the resource is in more-private address space private.
```

大致的意思是说，请求的某资源因为 CORS 策略被浏览器拦截了。当前请求方不是安全的环境，且请求的资源处于更私有的空间内。具体到我报错的场景是：微前端的主应用域名为 *http://main.scope.com*，请求子应用的主页为 *http://172.11.12.13:8081*。

两者对照来看，请求方是主应用的域名，是 http 协议的（非安全的环境），请求的资源为子应用的主页，是 ip:port 的方式（更私有的资源）。关于某资源是否是更私有的，Chrome 关于此特性的 flag(chrome://flags/#block-insecure-private-network-requests) 中如下解释：

```
Prevents non-secure contexts from making sub-resource requests to more-private IP addresses. An IP address IP1 is more private than IP2 if 1) IP1 is localhost and IP2 is not, or 2) IP1 is private and IP2 is public. This is a first step towards full enforcement of CORS-RFC1918: https://wicg.github.io/cors-rfc1918
```

可以看到其判断两个 IP 地址的私有程度遵循下面两个条件：

1. 如果 IP1 是 localhost 地址，而 IP2 不是，则 IP1 比 IP2 更私有
2. 如果 IP1 是私有的地址，而 IP2 是公网地址，则 IP1 比 IP2 更私有

对于我遇到的场景，是符合了第 2 个条件（IP1 是 172.11.12.13，IP2 是 main.scope.com 对应的 IP）。此 flag 是默认开启的，我在接入阶段时，手动将其禁用了，但不能要求用户作此处理。还可以看到目前只是完全实现 [CORS-RFC1918][cors-rfc1918] 的第一阶段，后续仍会有一些相关的更新。

对于引入这个特性后可能会产生的问题，Chrome 在其[文档][pna-chrome-blog]中也给出了几种方法进行适配，但适配难度不小，本文会先给出自己的解决方案，再解释文档中的适配方法。

## 我的方案 - 为子应用申请域名

由于业务针对的是私有云服务，强制用户使用 https 是不现实的，但上文说道如果 IP1 比 IP2 更私有，从 IP2 请求 IP1 时就会出现此问题，故两者地位对等应该就不会存在此问题。为子产品申请域名后，此问题就不存在了。在用户的环境下可能是都是 ip:port 的方式，也不会存在此问题。

## Chrome 方案 1 - 双方都使用 https 服务

此方案不必赘述，优点很明显，安全性很强。缺点也很明显，成本比较高。

## Chrome 方案 2 - WebTransport 服务

此方案要求被请求者方的服务器上运行 [WebTransport 服务][webtransport]（基于 http3 稍加改动）。此方案不需要 https 中的证书成本，目标设备上有自签名的证书即可建立到其的安全链接。WebTransport 链接允许双向数据传输。此方案暂时没理解，这里暂不班门弄斧了。

## Chrome 方案 3 - 反向嵌入

该方案不需要对网络有较强的理解和改动，而且可以在目标服务器无法运行 https 时使用。大致的做法如下：

请求者网站拆分为二，其本身的资源通过 CDN 等公网手段请求，其骨架放在和被请求者的私有服务器上，这样在请求私有服务器时，因为是同域，不会存在 Private Network Access 问题。使用此方案甚至可以请求其他私有服务（私有请求私有也不会有问题）。

## 总结

可以看出，Private Network Access 确实能够增强安全性，但目前仍处于初级阶段，后续仍会更新和改动，业务方接入也会存在不同的难度和方案。目前也会遇到比较多的问题，如果各位也遇到了类似的问题，可首先查看相关的 [chromium issue][pna-chromium-issue] 及 [GitHub issue][pna-github-issue]。

[cors-rfc1918]: https://wicg.github.io/cors-rfc1918
[pna]: https://wicg.github.io/private-network-access/
[pna-chromium-issue]: https://bugs.chromium.org/p/chromium/issues/list?q=component%3ABlink%3ESecurityFeature%3ECORS%3EPrivateNetworkAccess&can=2
[pna-github-issue]: https://github.com/WICG/private-network-access/issues
[pna-chrome-flag]: chrome://flags/#block-insecure-private-network-requests
[pna-chrome-blog]: https://developer.chrome.com/blog/private-network-access-update
[webtransport]: https://w3c.github.io/webtransport/
