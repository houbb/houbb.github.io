---
layout: post
title: docsify-03-配置项
date: 2021-10-12 21:01:55 +0800
categories: [Doc]
tags: [doc, tool, front-end, sh]
published: true
---

# 配置项

你可以配置在 window.$docsify 里。

```js
<script>
  window.$docsify = {
    repo: 'docsifyjs/docsify',
    maxLevel: 3,
    coverpage: true,
  };
</script>
```

## el

类型：String
默认值：#app

docsify 初始化的挂载元素，可以是一个 CSS 选择器，默认为 #app 如果不存在就直接绑定在 body 上。

```js
window.$docsify = {
  el: '#app',
};
```

## repo

类型：String
默认值: null

配置仓库地址或者 username/repo 的字符串，会在页面右上角渲染一个 GitHub Corner 挂件。

```js
window.$docsify = {
  repo: 'docsifyjs/docsify',
  // or
  repo: 'https://github.com/docsifyjs/docsify/',
};
```





# 参考资料

https://docsify.js.org/#/zh-cn/configuration

* any list
{:toc}