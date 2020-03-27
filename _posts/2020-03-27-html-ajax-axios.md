---
layout: post
title: Ajax 的替代方案-axios.js 
date:  2020-3-27 17:53:59 +0800
categories: [HTML]
tags: [html, js, sh]
published: true
---

# Axios

Axios 是一个基于 promise 的 HTTP 库，可以用在浏览器和 node.js 中。

## Features

- 从浏览器中创建 XMLHttpRequests

- 从 node.js 创建 http 请求

- 支持 Promise API

- 拦截请求和响应

- 转换请求数据和响应数据

- 取消请求

- 自动转换 JSON 数据

- 客户端支持防御 XSRF

## 入门例子

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>axios 实例</title>
<style type="text/css">
</style>
</head>
<body>
<script src="https://cdn.bootcss.com/axios/0.18.0/axios.min.js"></script>
<script type="text/javascript">
    //get请求第一种写法
    axios({
            method: 'get',
            url: 'https://ipinfo.io',
            params: {
              ID: 12345  //参数
            }
        })
        .then(function(response) {
            console.log(response.data);
        });

    //get请求第二种写法
    var result = axios({
            method: 'get',
            url: 'https://ipinfo.io',
            params: {
              ID: 12345
            }            
        });   
    result.then(function(response) {
        console.log(response.data);
    });

    //post请求
    axios({
            method: 'post',
            url: 'https://ipinfo.io',
            data: {
              ID: 12345  //参数
            }
        })
        .then(function(response) {
            console.log(response.data);
        });
</script>
</body>
</html>
```

# 参考资料

[axios.js 实例 -----$.ajax的替代方案](https://www.cnblogs.com/xutongbao/p/9924828.html)

* any list
{:toc}