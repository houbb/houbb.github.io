---
layout: post
title:  博客接入 Google Analytics 
date:  2022-10-04 09:22:02 +0800
categories: [SEO]
tags: [SEO, google, sh]
published: true
---

# 统计代码是什么呢？

简单来说就是一串代码，这个代码可以统计到你网站上的访客信息，包括用户量、用户地区、访问了哪些页面，从哪里来到你网站的，是通过搜索访问的，还是其他网站引荐过来的，或者直接访问的。

统计代码分析可以给网站管理员一份非常详细的网站报告，让你了解网站的基本情况，不会盲目更新网站，找不到网站的方向。

国内网站添加统计代码的话可以使用百度统计，英文外贸网站使用Google分析的统计代码。

# 接入方法

## 首页

[google 分析首页](https://analytics.google.com/analytics/web/provision/#/provision)

## 注册账户

账号名称：githubhoubb

网络媒体资源名称： 个人网站

## 设置数据流

网站：https://houbb.github.io

数据流 ID: 4118264303

衡量 ID: G-F03RP3XNVG

## 代码

```js
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-F03RP3XNVG"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-F03RP3XNVG');
</script>
```

## 设置 

把这段代码放在页面中，其他页面引入即可。

# 参考资料

https://www.huxu.org.cn/marketing/57608.html

[网站访问量统计工具,Google 统计](https://www.zhangshilong.cn/work/356304.html)

[自己建网站怎么添加 Google Analytics 统计代码查看每日流量](https://blog.naibabiji.com/tutorial/google-analytics.html)

[一文读懂独立站谷歌SEO优化流程](https://zhuanlan.zhihu.com/p/507769599)

[为网站开启Google Analytics](https://zhuanlan.zhihu.com/p/507279404)

* any list
{:toc}