---
title: RESTful API 设计指南 - 最佳实践
date: 2021-06-17 07:23:12
translate: https://medium.com/hackernoon/restful-api-designing-guidelines-the-best-practices-60e1d954e7c9
tag: ["Tools"]
excerpt: 本文是对 *Mahesh Haldar* 发布在 Medium 上 [文章](https://medium.com/hackernoon/restful-api-designing-guidelines-the-best-practices-60e1d954e7c9){:target="_blank"} 的译文。
---

可查看 Medium 上的[原文](https://medium.com/hackernoon/restful-api-designing-guidelines-the-best-practices-60e1d954e7c9){:target="_blank"}。

Facebook、谷歌、Github、Netflix 和其他几家科技巨头都提供了开发者和产品通过 API 消费他们数据的能力，这些公司成为了一个数据平台。

即使你编写 API 不是为了向其他开发者或产品提供，设计出精美的 API 对你自己的应用也大有裨益。

长期以来，互联网上都存在着关于设计 API 的最佳实践的辩论，这是最微妙的辩论之一。可能是因为在这方面没有一个官方指引吧。

API 是一个接口，开发者通过它与数据进行交互。一个设计精美的 API 总是非常容易使用的，开发者能够非常顺畅地进行开发。API 是开发者的 GUI，如果它令人困惑或者功能不足（not verbose），那么开发者就会寻找替代方案或干脆不再使用。开发者体验是衡量 API 质量最重要的指标。

> API 就像舞台上表演的艺术家，它的用户就是观众。

## 术语

下面列出的是 REST API 相关的重要术语

- Resource（资源）是客体或对非客体的一种表达，它有一些与之相关的数据，并且可以有一组方法对其进行操作。例如，动物、学校和员工是资源，_删除_、_添加_、*更新*是对这些资源执行的操作。
- Collections（集合）是 Resource（资源）的集合，例如多个公司（Companies）是公司（Company）资源的集合。
- URL（Uniform Resource Locator 统一资源定位符）是一个路径，通过它可以定位资源并可以对其执行一些操作。

## API 端点

为了更加深入的理解，这里我们编写一些 API，针对的是多个公司，多个员工的场景。

`/getAllEmployees` 是一个 API，它将返回员工列表。公司针对员工相关的 API 如下所示：

- /addNewEmployee
- /updateEmployee
- /deleteEmployee
- /deleteAllEmployees
- /promoteEmployee
- /promoteAllEmployees

并且还会有很多其他 API 端点用于不同的操作。而所有这些 API 都包含了许多冗余操作。因此，随着 API 数量增加时，维护这些 API 端点就会愈发麻烦。

**哪里出了问题呢？**

URL 应该只包含资源（名词）而不涉及动作或动词。`/addNewEmployee` 这个 API 端点同时包含了动作 `addNew` 和资源名称 `Employee`。

**那么正确的做法是什么呢？**

`/companies` 端点就是一个很好的例子，它不包含任何动作。但随之而来问题是我们要怎样告诉服务器要对 `companies` 资源执行什么操作呢？是添加、删除还是更新操作呢？

在这种场景下，不同的 HTTP 方法（GET、POST、DELETE、PUT），也称为动词，就有了用武之地。

API 端点中的资源应该总是复数，而如果我们想访问资源中的一个实例，我们可以在 URL 中设置 id。

- 方法 `GET` 路径 `/companies` 应该获取所有公司的列表
- 方法 `GET` 路径 `/companies/34` 应该获取 34 号公司的详细信息
- 方法 `DELETE` 路径 `/companies/34` 应删除 34 号公司

还有一些复合的场景，如我们需要获取某资源下的资源，例如获取某公司员工，那么一些示例的 API 端点是：

- `GET /companies/3/employees` 应该从 3 号公司获取所有员工的列表
- `GET /companies/3/employees/45` 应该获取 3 号公司 45 号员工的详细信息
- `DELETE /companies/3/employees/45` 应该删除 3 号公司的 45 号员工
- `POST /companies` 应该创建一个新公司并返回创建的新公司的详细信息

现在这些 API 不是更加精确和一致吗？

**结论：**路径应该包含复数形式的资源，HTTP 方法应该和对资源执行的操作相对应。

## HTTP 方法（动词）

HTTP 本身就定义了一些方法来表示要对资源执行的操作类型。

> 如果将 URL 看作一句话，那资源就是名词，而 HTTP 方法就是动词。

重要的 HTTP 方法如下所示：

1. `GET` 方法从资源请求数据，不应产生任何副作用。
   例： `/companies/3/employees` 返回 3 号公司所有员工的列表。
2. `POST` 方法请求服务器以在数据库中创建资源，大部分的场景是在提交 Web 表单。
   例：`POST /companies/3/employees` 创建 3 号公司的新员工。
   `POST` 方法是非幂等的，这意味着多个请求将产生不同的效果。
3. `PUT` 方法请求服务器更新资源，如果资源不存在，则创建资源。
   例：`PUT /companies/3/employees/john` 将请求服务器对 3 号公司下的 员工 _john_ 进行更新，如果 员工 _john_ 不存在则新建。
   `PUT` 方法是幂等的，这意味着多个请求将产生相同的效果。
4. `DELETE` 方法请求应该从数据库中删除资源或其实例。
   例：`DELETE /companies/3/employees/john` 会请求服务器从 3 号公司的员工集合中删除员工 _john_。

还有[一些其他的方法](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Request_methods){:target="\_blank"}，我们将在另一篇文章中讨论。

## HTTP 响应状态码

当客户端通过 API 向服务器发出请求后，客户端应该得到反馈，请求的结果是失败、通过还是请求错误。HTTP 状态码是一堆标准化的代码，在不同的场景下有不同的解释。服务器应当始终返回正确的状态码。

下面是 HTTP 响应状态码的重要分类：

### 2xx（成功类别）

此类状态码表示请求的操作已被服务器接收并成功处理。

- **200 Ok** 代表 GET、PUT 或 POST 请求 成功的标准 HTTP 响应。
- **201 Created** 每当创建新实例时都应返回此状态码。例如，在使用 POST 方法创建新实例成功时，应始终返回 201 状态码。
- **204 No Content** 表示请求处理成功，但没有返回任何内容。
  `DELETE` 请求就是一个很好的例子：API `DELETE /companies/43/employees/2` 将删除 43 号公司的 2 号员工，而我们不需要这个 API 响应正文中的任何数据，因为我们明确要求系统删除。如果有任何错误，比如如果 2 号员工在数据库中不存在，则响应码不应该是 2xx 类别的，而应该属于 4xx Client 类别。

### 3xx（重定向类别）

**304 Not Modified** 表示客户端可以从其缓存中获得响应。因此无需再次传输相同的数据。

### 4xx（客户端错误类别）

此类状态码表示客户端发出了错误的请求。

- **400 Bad Request** 表示客户端的请求未被处理，因为服务器无法理解客户端的请求。
- **401 Unauthorized** 表示不允许客户端访问资源，应使用所需的凭据重新请求。
- **403 Forbidden** 表示请求有效，客户端也通过了身份验证，但是客户端因为某些原因不能访问某些页面或资源。例如，服务器有时不允许授权的客户端访问服务器上的目录。
- **404 Not Found** 表示请求的资源现在不可用。
- **410 Gone** 表示请求的资源不可用，且是被有意移动。

### 5xx（服务器错误类别）

- **500 Internal Server Error** 表示请求有效，但服务器发生错误，此时服务器需要提供一些错误信息。
- **503 Service Unavailable** 表示服务器宕机或无法接收和处理请求。大多数情况下可能是服务器正在进行维护。

## 字段名称大小写约定

可以遵循任何大小写约定，但要确保在整个应用中保持一致的规则。如果请求体或响应类型为 [JSON](https://en.wikipedia.org/wiki/JSON)，请遵循驼峰命名法以保持一致性。

## 排序、过滤、搜索和分页

这些所有的操作都只是对一个数据集进行的简单查询。不应该有新的 API 来处理这些操作。这里我们可以使用带附加查询参数的 GET 方法 API 来处理这些操作。

让我们通过几个例子来了解如何实现这些操作。

- **排序** 如果客户端想要获得排序的公司列表，`GET /companies` 端点应该能够在查询参数中接受多个排序参数。例如，`GET /companies?sort=rank_asc` 将按升序排列公司。
- **过滤** 为了过滤数据集，我们可以通过查询参数传递各种选项。例如，`GET /companies?category=banking&location=india` 将从公司列表中过滤出印度的银行公司。
- **搜索** 在公司列表中搜索公司名称时，API 端点应为 `GET /companies?search=Digital Mckinsey`。
- **分页** 当数据集太大时，我们可以将数据集分成更小的块，这有助于提高性能并且更容易处理响应。例如，`GET /companies?page=23` 表示获取在第 23 页的公司列表。

如果在 GET 方法中添加许多查询参数导致 URL 太长，服务器可能会以 `414 URI Too long` 状态码响应，在这种情况下，也可以使用 POST 请求，将请求参数放在请求体中。

## 版本控制

当你的 API 被外界使用时，一些重大的 API 改造或升级可能会导致使用你的 API 的现有产品或服务出现问题。

API `http://api.yourservice.com/v1/companies/34/employees` 是一个很好的例子，它在路径中包含了 API 的版本号。如果有任何重大的突破性更新，我们可以将新的 API 集命名为 `v2` 或 `v1.x.x`。
