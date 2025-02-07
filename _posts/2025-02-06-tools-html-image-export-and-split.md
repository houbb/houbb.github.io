---
layout: post
title: 在线免费 HTML 预览到处为图片，并且支持水平切割
date: 2025-2-5 20:56:35 +0800
categories: [Business]
tags: [biz, sh]
published: true
---


# 在线体验

作用：可以直接预览 html 的页面效果，导出为图片，支持指定切割的数量，等高水平切割。

> [https://houbb.github.io/tools/html-prefix.html](https://houbb.github.io/tools/html-prefix.html)

# 创作背景

有时候希望给一段 html 导出为长度，或者水平切分，感觉人工比较麻烦，就想着实现一个。

## 核心代码

导出的核心代码

```js
async function exportAsImage() {
  const sliceCount = Math.min(9, Math.max(1, parseInt(document.getElementById('sliceCount').value) || 1));
  
  const iframe = document.getElementById('preview-frame');
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  
  const totalHeight = doc.documentElement.scrollHeight;
  const sliceHeight = Math.ceil(totalHeight / sliceCount);

  for(let i=0; i<sliceCount; i++) {
    await html2canvas(doc.documentElement, {
      useCORS: true,
      scrollY: i * sliceHeight,
      windowHeight: sliceHeight,
      height: sliceHeight,
      y: i * sliceHeight
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = `slice_${i+1}.png`;
      link.href = canvas.toDataURL();
      link.click();
    });
  }
}
```



## 参考资料

https://arxiv.org/abs/2501.12948

https://aipapersacademy.com/deepseek-r1/

* any list
{:toc}