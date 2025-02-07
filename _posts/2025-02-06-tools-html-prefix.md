---
layout: post
title: 在线免费 HTML 预览工具
date: 2025-2-5 20:56:35 +0800
categories: [Business]
tags: [biz, sh]
published: true
---

# 在线体验

作用：可以直接预览 html 的页面效果。

> [https://houbb.github.io/tools/html-preview.html](https://houbb.github.io/tools/html-preview.html)

# 创作背景

有时候用手机查阅资料时，获取到一段 html 代码，但是无法查看对应的实际效果。

特别是苹果系统，没啥简单的方法，于是就想着自己实现一个，直接预览页面的效果。

## 核心代码

```js
<textarea id="html-input" placeholder="请输入HTML代码..."></textarea>

<button onclick="updatePreview()">预览</button>

<div class="preview-pane">
    <iframe id="preview-frame"></iframe>
</div>

function updatePreview() {
    const input = document.getElementById('html-input').value;
    const iframe = document.getElementById('preview-frame');
    iframe.srcdoc = input;
}
```

# 参考资料

https://arxiv.org/abs/2501.12948

https://aipapersacademy.com/deepseek-r1/

* any list
{:toc}