---
title: 通过 Trie 存储同类数据
date: 2021-05-20 12:23:12
tag: ["JavaScript"]
excerpt: 最近在重构项目中的树形组件，其中有存储已打开路径的场景，本来是使用 Set 存储的，但后来发现存储数据的相似度较高，想到可以使用 Trie 进行存储。
---

最近在重构项目中的树形组件，其中有存储已打开路径的场景，本来是使用 Set 存储的，但后来发现存储数据的相似度较高，想到可以使用 Trie 进行存储。

## Trie 是什么

`Trie` 是一种树形结构，甚至发音都和 _Tree_ 相近，也可以叫做单词查找树、前缀树。在存储关联度较高的数据时比较有用，如存储英文单词、文件路径、链接等。

![trie-save-opened-path.png](/img/posts/javascript/trie-save-opened-path.png)
_Trie_

> 这里借用 EOF(end of file) 的概念表示一条记录的的结束，也不是每个节点都会有结束，因为上图是使用树形组件中的路径存储作为例子，子路径被打开了，父路径肯定是被打开的状态。

如果使用 Set 或 Array 存储上图中表示的所有路径，则为：

```ts
[
  "/A",
  "/A/a1",
  "/A/a2",
  "/A/a2/a21",
  "/A/a2/a22",
  "/A/a3",
  "/B",
  "/B/b1",
  "/B/b2",
];
```

很明显可以看到，随着路径的加深，存储中的重复数据（重复前缀）就愈大。

### 结束标志的意义与选择

上面用 `EOF` 表示了一条记录的结束，那为什么需要结束标志呢？考虑下面这个场景：

- 先使用空的 Trie 存储 "/A/a1"
- 向其中添加 "/A"，先要判断是否已经存在

此时如果没有结束标志，则判断结果将会是已存在。

那如何选择结束标志呢？其实只需要根据业务场景选择一个不会在存储的数据中出现的数据即可，比如在存储文件路径时，就可以选择 `#` 号作为结束标志（不会出现在文件路径中）。但在存储网页的 URL 时，则不能选择 `#`，可以考虑使用 `*`。

## Trie 实现

根据 `Trie` 的特性，可以有多种实现方式，比如可以使用 Tree 的方案：Node + next 指针的方式；或者可以使用嵌套对象实现。这里我们使用嵌套对象的方式实现：

```ts
function hasOwnProperty(obj: any, name: string | Symbol) {
  return {}.hasOwnProperty.call(obj, name);
}

class Trie {
  tree = {};
  /**
   * 标识一条记录的结尾，根据自己的业务场景选择，也可以做为参数传入
   */
  private endOfWord = "#";

  /**
   * 添加，返回 false 表示已存在，返回 true 表示不存在且添加成功
   * @param word
   * @returns
   */
  addWord(word: string) {
    const len = word.length;
    let currentNode = this.tree;
    let isNewWord = false;

    for (let i = 0; i < len; i++) {
      const char = word[i];
      if (hasOwnProperty(currentNode, char) === false) {
        currentNode[char] = {};
        isNewWord = true;
      }

      currentNode = currentNode[char];
    }

    if (hasOwnProperty(currentNode, this.endOfWord) === false) {
      currentNode[this.endOfWord] = {};
      isNewWord = true;
    }

    return isNewWord;
  }
}
```

> 源文件可查看 [GitHub](https://github.com/liuwenzhuang/algorithm/blob/main/src/trie/trie.ts)

## 总结

`Trie` 是一种实现简单的数据结构，在存储 URL、文件路径 等具有相似前缀或重复数据时具有减小存储的作用。
