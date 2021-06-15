---
title: 插入DOM神器 - insertAdjacent*
date: 2017-10-03 19:23:45
tag: ['DOM']
excerpt: DOM操作中，插入元素的操作是使用较多的，一般我们都会使用appendChild来做，但是还有更方便快捷的方式。
---

DOM操作中，插入元素的操作是使用较多的，一般我们都会使用`appendChild`来做，但是使用起来很不方便，特别是涉及到表格操作：

```javascript
const emptyRow = document.querySelector('tr');

const firstCol = document.createElement('td');
firstCol.className = 'first-col';
firstCol.textContent = 'first col';
emptyRow.appendChild(firstCol);

const secondCol = document.createElement('td');
secondCol.className = 'second-col';
secondCol.textContent = 'second col';
emptyRow.appendChild(secondCol);
// ...
```

当然上面只是一个例子，以前使用jQuery也能够极大的简化上述工作，而且现在的主流框架也为我们规避了大量的DOM操作。但实际上使用原生的DOM API也能够做到：

## insertAdjacentHTML

`insertAdjacentHTML`能够解析字符串成为Element，并将其插入DOM树的特定位置（由position指定）。

我们可以使用`insertAdjacentHTML`来重写上面的例子：

```javascript
const emptyRow = document.querySelector('tr');

emptyRow.insertAdjacentHTML('beforeend', `
  <td class="first-col">first col</td>
  <td class="second-col">second col</td>
`);
```

### 语法

```javascript
element.insertAdjacentHTML(position, text);
```

### position的取值和解释

```bash
<!-- beforebegin -->
<p>
  <!-- afterbegin -->
  foo
  <!-- beforeend -->
</p>
<!-- afterend -->
```

> 更多信息查看[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML)。

可以看到，`insertAdjacentHTML`不仅能够实现插入元素的功能，还能够灵活控制相对于调用元素的插入位置。

> 不能用于动态插入 `<script>` 标签的场景，根据 [html5 规范](https://www.w3.org/TR/2008/WD-html5-20080610/dom.html#innerhtml0)，通过 `innerHTML` 的方式插入的 `<script>` 标签不会被执行。而 `insertAdjacentHTML` 和 `innerHTML` 的本质上是相同的。

## insertAdjacentElement

上文提到`insertAdjacentHTML`会先对传入的字符串进行解析转换为Element再进行插入，而其胞弟`insertAdjacentElement`相当于省略了解析转换的步骤，因为其直接操作的对象就是Element：

```javascript
targetElement.insertAdjacentElement(position, element);
```

其`postion`参数及含义和`insertAdjacentHTML`一样：

```javascript
const emptyRow = document.querySelector('tr');

const firstCol = document.createElement('td');
firstCol.className = 'first-col';
firstCol.textContent = 'first col';
emptyRow.insertAdjacentElement('beforeend', firstCol);
```

当然了，如果是像上面一样需要先创建Element再进行插入操作，比`appendChild`还不方便，只是胜在能够控制插入位置而已。但当其处理已存在的Element时有其独到之处：**处理已存在Element时，是移动的过程，并非是复制后插入的过程**：

```html
<div>
    <a id="baidu" href="https://baidu.com">百度</a>
</div>
<div>
    <a id="netease" href="https://163.com">网易</a>
</div>
```

如果我们想要将“网易”的链接**移动**到“百度”链接后面，可以这样做：

```javascript
const neteaseHref = document.getElementById('netease');
const baiduHref = document.getElementById('baidu');
baiduHref.insertAdjacentElement('afterend', neteaseHref);
```

处理完成后，DOM树将变成：

```html
<div>
    <a id="baidu" href="https://baidu.com">百度</a>
    <a id="netease" href="https://163.com">网易</a>
</div>
<div>
</div>
```

## insertAdjacentText

`insertAdjacent*`家族还有个专门用来插入文本的的成员：`insertAdjacentText`，其API和`insertAdjacentHTML`类似：

```javascript
element.insertAdjacentHTML(position, text);
```

但它不会像`insertAdjacentHTML`那样对传入的text进行解析，即使传入的是DOM标签也只会作为文本渲染：

```html
<div>
    <a id="netease" href="https://163.com">网易</a>
</div>
```

```javascript
const neteaseHref = document.getElementById('netease');
neteaseHref.insertAdjacentText('beforebegin', '<span class="highlight">163</span>');
```

处理完成后DOM树会变为：

```html
<div>
  "<span class="highlight">163</span>"
  <a id="netease" href="https://163.com">网易</a>
</div>
```

注意，渲染出来的是文本，而不是一个span元素。

## 总结

使用`insertAdjacent*`能够方便地进行插入、移动、修改textContent等DOM操作，特别是能够指定操作的相对位置能够避免大量的查找工作。

> 指定插入位置时要注意，`beforebegin`和`afterend`两个选项，只有当操作元素拥有父级元素时才能正常工作。
