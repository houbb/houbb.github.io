---
layout: post
title: docsify-07-Markdown 配置
date: 2021-10-12 21:01:55 +0800
categories: [Doc]
tags: [doc, tool, front-end, sh]
published: true
---

# Markdown 配置

内置的 Markdown 解析器是 [marked](https://github.com/markedjs/marked)，可以修改它的配置。

同时可以直接配置 renderer。

```js
window.$docsify = {
  markdown: {
    smartypants: true,
    renderer: {
      link: function() {
        // ...
      }
    }
  }
}
```

当然也可以完全定制 Markdown 解析规则。

```js
window.$docsify = {
  markdown: function(marked, renderer) {
    // ...

    return marked
  }
}
```

# 支持 mermaid

```js
// Import mermaid
//  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.css">
//  <script src="//cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>

var num = 0;
mermaid.initialize({ startOnLoad: false });

window.$docsify = {
  markdown: {
    renderer: {
      code: function(code, lang) {
        if (lang === "mermaid") {
          return (
            '<div class="mermaid">' + mermaid.render('mermaid-svg-' + num++, code) + "</div>"
          );
        }
        return this.origin.code.apply(this, arguments);
      }
    }
  }
}
```


# 参考资料

https://docsify.js.org/#/zh-cn/markdown

* any list
{:toc}