---
layout: post
title: docsify-08-代码高亮
date: 2021-10-12 21:01:55 +0800
categories: [Doc]
tags: [doc, tool, front-end, sh]
published: true
---

# 代码高亮

docsify内置的代码高亮工具是 [Prism](https://github.com/PrismJS/prism)。

Prism 默认支持的语言如下：

- Markup - markup, html, xml, svg, mathml, ssml, atom, rss

- CSS - css

- C-like - clike

- JavaScript - javascript, js

添加[额外的语法支持](https://prismjs.com/#supported-languages) 需要通过CDN添加相应的 [语法文件](https://cdn.jsdelivr.net/npm/prismjs@1/components/) :

```html
<script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-bash.min.js"></script>
<script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-php.min.js"></script>
```

要使用语法高亮，需要在代码块第一行添加对应的语言声明，示例如下:

  ```html
  <p>This is a paragraph</p>
  <a href="//docsify.js.org/">Docsify</a>
  ```

  ```bash
  echo "hello"
  ```

  ```php
  function getAdder(int $x): int 
  {
      return 123;
  }
  ```


# 参考资料

https://docsify.js.org/#/zh-cn/markdown

* any list
{:toc}