---
layout: post
title:  web 实战-15-js 和 java 前端后端如何实现 md5 加密
date:  2020-08-28 10:37:20 +0800
categories: [web]
tags: [web, http, sf]
published: true
---

# 背景

希望前端的密码，通过 md5 之后传递到后端。

避免消息被截取等。

# 后端 java

```java
// 生成一个MD5加密计算摘要
MessageDigest md = MessageDigest.getInstance("MD5");
// 计算md5函数
md.update("admin".getBytes());
// digest()最后确定返回md5 hash值，返回值为8位字符串。因为md5 hash值是16位的hex值，实际上就是8位的字符
// BigInteger函数则将8位的字符串转换成16位hex值，用字符串来表示；得到字符串形式的hash值
//一个byte是八位二进制，也就是2位十六进制字符（2的8次方等于16的2次方）
String result = new BigInteger(1, md.digest()).toString(16);
System.out.println(result);
```

# 前端 js

```js
<script src="https://cdn.bootcss.com/blueimp-md5/2.10.0/js/md5.js"></script>

md5('字符串');
```

* any list
{:toc}