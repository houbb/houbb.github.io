---
layout: post
title:  低代码开源源码学习-03-index 页面加载处理
date:  2022-09-03 21:22:02 +0800
categories: [Tool]
tags: [low-code, sh]
published: true
---

# 页面的加载中

页面加载中，如果比较慢，怎么提醒用户体验比较好呢？

public/index.html

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <link rel="icon" href="<%= BASE_URL %>favicon.ico">
    <title><%= htmlWebpackPlugin.options.title %></title>
    <style>
    </style>
</head>
<body>
    <noscript>
        <strong>We're sorry but <%= htmlWebpackPlugin.options.title %> doesn't work properly without JavaScript enabled.
                Please enable it to continue.</strong>
    </noscript>
    <div id="app">
        <div class="visual-loading-container">
            <svg viewBox="0 0 50 50" class="visual-loading-svg">
                <circle cx="25" cy="25" r="20" fill="none" class="visual-circle-path"></circle>
            </svg>
            <p>正在努力加载页面，请耐心等候...</p>
        </div>
    </div>
</body>
</html>
```

## script

这里首先校验了页面的 js 是否启用，如果没有启用。则进行提示。

## 页面的加载

```html
<div id="app">
    <div class="visual-loading-container">
        <svg viewBox="0 0 50 50" class="visual-loading-svg">
            <circle cx="25" cy="25" r="20" fill="none" class="visual-circle-path"></circle>
        </svg>
        <p>正在努力加载页面，请耐心等候...</p>
    </div>
</div>
```

打包相关内容参见：

> [WebPack-01-Quick Start](https://houbb.github.io/2018/04/23/webpack-01-quick-start)

### 打包配置

webpack 的配置比较简单：

```js
const CompressionPlugin = require('compression-webpack-plugin')

const isProd = process.env.NODE_ENV === 'production'

module.exports = {
    publicPath: isProd ? '/idrag/' : './',
    configureWebpack: () => {
        if (isProd) {
            return {
                plugins: [
                    new CompressionPlugin({
                        test: /\.js$|\.html$|\.css$|\.jpg$|\.jpeg$|\.png/, // 需要压缩的文件类型
                        threshold: 10240, // 归档需要进行压缩的文件大小最小值，这个对 10K 以上的进行压缩
                        deleteOriginalAssets: false, // 是否删除原文件
                    }),
                ],
            }
        }
    },
}
```

# 参考资料

https://blog.csdn.net/m0_60559048/article/details/123359788

* any list
{:toc}
