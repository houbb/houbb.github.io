---
layout: post
title:  微信公众号项目开发实战-09-微信公众号链接中文被转义
date:  2022-07-08 09:22:02 +0800
categories: [Wechat]
tags: [wechat, sh]
published: true
---

# 问题描述

通过对中文部分进行转码，然后用户端解码方式。

# 解决方案

## java 服务端

java的转码和解码方式：

转码：

```java
URLEncoder.encode('text','UTF-8');
```

解码：

```java
URLDecoder.decode('text','UTF-8');
```

## 前端

js 转码和解码方式：

解码：

```js
decodeURIComponent(text);
```

转码：

```js
encodeURIComponent(text);
```

# 链接方式

还有一个方法就是像html一样弄个a标签，微信可以识别a标签的。

如：

```
<a href=“url”>点击即可进入跳转的文字</a>
```

# 参考资料

[公众号发给用户的链接有中文的问题解决](https://www.jianshu.com/p/9c5adfff7a33)

* any list
{:toc}