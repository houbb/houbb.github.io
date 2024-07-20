---
layout: post
title: Hutool http 请求入门例子
date:  2016-7-18 12:26:11 +0800
categories: [Java]
tags: [java, tool, sf]
published: true
---


# 概述

HttpUtil是应对简单场景下Http请求的工具类封装，此工具封装了HttpRequest对象常用操作，可以保证在一个方法之内完成Http请求。

此模块基于JDK的HttpUrlConnection封装完成，完整支持https、代理和文件上传。

# 使用

## 请求普通页面

针对最为常用的GET和POST请求，HttpUtil封装了两个方法，

```java
HttpUtil.get
HttpUtil.post
```

这两个方法用于请求普通页面，然后返回页面内容的字符串，同时提供一些重载方法用于指定请求参数（指定参数支持File对象，可实现文件上传，当然仅仅针对POST请求）。

GET请求栗子：

```java
// 最简单的HTTP请求，可以自动通过header等信息判断编码，不区分HTTP和HTTPS
String result1= HttpUtil.get("https://www.baidu.com");

// 当无法识别页面编码的时候，可以自定义请求页面的编码
String result2= HttpUtil.get("https://www.baidu.com", CharsetUtil.CHARSET_UTF_8);

//可以单独传入http参数，这样参数会自动做URL编码，拼接在URL中
HashMap<String, Object> paramMap = new HashMap<>();
paramMap.put("city", "北京");

String result3= HttpUtil.get("https://www.baidu.com", paramMap);
```

POST请求例子：

```java
HashMap<String, Object> paramMap = new HashMap<>();
paramMap.put("city", "北京");

String result= HttpUtil.post("https://www.baidu.com", paramMap);
```

## 文件上传

```java
HashMap<String, Object> paramMap = new HashMap<>();
//文件上传只需将参数中的键指定（默认file），值设为文件对象即可，对于使用者来说，文件上传与普通表单提交并无区别
paramMap.put("file", FileUtil.file("D:\\face.jpg"));

String result= HttpUtil.post("https://www.baidu.com", paramMap);
```

## 下载文件

因为Hutool-http机制问题，请求页面返回结果是一次性解析为byte[]的，如果请求URL返回结果太大（比如文件下载），那内存会爆掉，因此针对文件下载HttpUtil单独做了封装。

文件下载在面对大文件时采用流的方式读写，内存中只是保留一定量的缓存，然后分块写入硬盘，因此大文件情况下不会对内存有压力。

```java
String fileUrl = "http://mirrors.sohu.com/centos/8.4.2105/isos/x86_64/CentOS-8.4.2105-x86_64-dvd1.iso";

//将文件下载后保存在E盘，返回结果为下载文件大小
long size = HttpUtil.downloadFile(fileUrl, FileUtil.file("e:/"));
System.out.println("Download size: " + size);
```

当然，如果我们想感知下载进度，还可以使用另一个重载方法回调感知下载进度：

```java
//带进度显示的文件下载
HttpUtil.downloadFile(fileUrl, FileUtil.file("e:/"), new StreamProgress(){
	
	@Override
	public void start() {
		Console.log("开始下载。。。。");
	}
	
	@Override
	public void progress(long progressSize) {
		Console.log("已下载：{}", FileUtil.readableFileSize(progressSize));
	}
	
	@Override
	public void finish() {
		Console.log("下载完成！");
	}
});
```

StreamProgress接口实现后可以感知下载过程中的各个阶段。

当然，工具类提供了一个更加抽象的方法：HttpUtil.download，此方法会请求URL，将返回内容写入到指定的OutputStream中。使用这个方法，可以更加灵活的将HTTP内容转换写出，以适应更多场景。

## 更多有用的工具方法

HttpUtil.encodeParams 对URL参数做编码，只编码键和值，提供的值可以是url附带参数，但是不能只是url

HttpUtil.toParams和HttpUtil.decodeParams 两个方法是将Map参数转为URL参数字符串和将URL参数字符串转为Map对象

HttpUtil.urlWithForm是将URL字符串和Map参数拼接为GET请求所用的完整字符串使用

HttpUtil.getMimeType 根据文件扩展名快速获取其MimeType（参数也可以是完整文件路径）

# 参考资料

https://doc.hutool.cn/pages/HttpUtil/


* any list
{:toc}
