---
layout: post
title:  QS-序列化JS库入门使用
date:  2018-04-04 15:52:00 +0800
categories: [JS]
tags: [js, ajax]
published: true
---

# QS

最近使用 axios 做 post 请求时，需要借助  qs 做一下序列化。

看了网上很多文章，都是错的。

因为想使用的是最基本的 js 引入方式，import 没有，require 也不支持。

# 解决方案

```html
<script src="https://cdn.bootcss.com/qs/6.7.0/qs.min.js"></script>
<script src="https://cdn.bootcss.com/axios/0.18.0/axios.min.js"></script>

<html>
    <body>
        <script>
            // 一般引入qs库都赋值为qs，不过浏览器全局引入的是 window.Qs对象，
            // 所以直接用 qs.stringify() 会报 qs undefined
            var qs = Qs 
            // 配置post的请求头
            axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
            // qs.stringify() 这里可以做一下封装
            axios.post('url', qs.stringify({
                id: 1,
                name: 'zhangsan'
            })).then(function(res) {
                // 返回 Promise对象数据
            })
        </script>
    </body>
</html>
```

## 参考资料

[Browser(浏览器） cdn方式引入qs库的使用方法](https://blog.csdn.net/example440982/article/details/89927349)

* any list
{:toc}