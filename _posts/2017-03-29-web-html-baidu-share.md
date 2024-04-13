---
layout: post
title: Baidu Share
date:  2017-03-27 20:45:58 +0800
categories: [Tool]
tags: [baidu, share]
header-img: "static/app/res/img/python-bg.jpg"
published: true
---

# Baidu Share


百度分享不支持 HTTPS，会报错如下：

```
Mixed Content: The page at 'https://houbb.github.io/' was loaded over HTTPS, but requested an insecure script 'http://bdimg.share.baidu.com/static/api/js/share.js?v=89860593.js?cdnversion=414108'. This request has been blocked; the content must be served over HTTPS.
```

> [solve method](https://github.com/hrwhisper/baiduShare)

> [blog](https://www.hrwhisper.me/baidu-share-not-support-https-solution/)


# 个人步骤

- Download

[下载](https://github.com/hrwhisper/baiduShare) 文件并放在项目 根目录下。

- Edit

修改 baidushare 文件：

```js
<script>window._bd_share_config={"common":{"bdSnsKey":{},"bdText":"","bdMini":"2","bdMiniList":false,"bdPic":"","bdStyle":"0","bdSize":"16"},"slide":{"type":"slide","bdImg":"2","bdPos":"right","bdTop":"460.5"}};with(document)0[(getElementsByTagName('head')[0]||body).appendChild(createElement('script')).src='http://bdimg.share.baidu.com/static/api/js/share.js?v=89860593.js?cdnversion='+~(-new Date()/36e5)];</script>
```

为

```js
<script>window._bd_share_config={"common":{"bdSnsKey":{},"bdText":"","bdMini":"2","bdMiniList":false,"bdPic":"","bdStyle":"0","bdSize":"16"},"slide":{"type":"slide","bdImg":"2","bdPos":"right","bdTop":"460.5"}};with(document)0[(getElementsByTagName('head')[0]||body).appendChild(createElement('script')).src='/static/api/js/share.js?v=89860593.js?cdnversion='+~(-new Date()/36e5)];</script>
```


简而言之，就是将`http://bdimg.share.baidu.com/`改为 `/`。本地化。


- 想法

其实原理也不难。就是将去服务器索要的资源直接放在本地。




* any list
{:toc}



