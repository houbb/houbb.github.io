---
layout: post
title:  web 实战-10-HTTP post 请求中文乱码
date:  2020-08-28 10:37:20 +0800
categories: [web]
tags: [web, http, sf]
published: true
---

# 场景

页面 form 表单，post 提交。

然后 jsp 去接受，结果发现中文乱码。

# 解决方案

## 尝试1

设置 request 接受编码

```java
request.setCharacterEncoding("utf-8");
```

发现没有效果

## 尝试2

去乱码的部分尝试解码：

```java
value = java.net.URLDecoder.decode(value,"UTF-8");
```

发现依然无效。

## 尝试3

直接从 ISO-8859-1 转为 utf-8，测试有效

```java
value = new String(value.getBytes("ISO-8859-1"),"UTF-8");
```


# 中文乱码问题

## http 响应乱码

```java
BufferedReader reader = new BufferedReader(new InputStreamReader(
                    conn.getInputStream(), "UTF-8"));
```

这样指定之后，获取可以保证接受的中文不再乱码。


## 页面提交，后端接受乱码

mvc 项目接受其他的信息不乱码，猜测还是请求的参数有问题导致的。

尝试下对中文进行编码。

输入流调整：

```java
 //输入流
 //OutputStream os = conn.getOutputStream();
 OutputStreamWriter os = new OutputStreamWriter(conn.getOutputStream(), "UTF-8");
```

我是尝试了一下获取字节流的时候指定编码：

```java
// 普通字段
if (textMap != null) {
    StringBuilder strBuf = new StringBuilder();
    for(Map.Entry<String,String> entry : textMap.entrySet()) {
        String inputName = entry.getKey();
        String inputValue = entry.getValue();
        if (inputValue == null) {
            continue;
        }
        strBuf.append("\r\n")
                .append("--")
                .append(BOUNDARY)
                .append("\r\n");
        strBuf.append("Content-Disposition: form-data; name=\"").append(inputName).append("\"\r\n\r\n").append(inputValue);
    }
    // 指定编码
    out.write(strBuf.toString().getBytes("UTF-8"));
}
```

发现依然没有效果。

### 传参前进行转码

最后，在网上看到一篇文章后，看了一种建议方式，并且是可行的，就是使用URLEncode，将中文参数在传参前进行encode。

这里以UTF-8编码是为了在服务器端接收参数后无需再转码了，如下：

```java
URLEncoder.encode(name, "GBK")
```

# 通用解决方案

### 通用

1.通用的方法:

new String(参数.getBytes("iso-8859-1"),"utf-8");

### POST

2.针对于post请求来说:只需要将请求流的编码设置成utf-8即可

```java
request.setCharacterEncoding("utf-8");
```

# 个人尝试

个人的场景比较麻烦。

post 参数有中文，而且还有文件信息。文件的编码还是 GBK 格式。

本来想使用 `OutputStreamWriter os = new OutputStreamWriter(conn.getOutputStream(), "UTF-8");`，发现会导致文件编码错乱。


于是决定前后端配合。

## 小测试

```java
String text = "中文乱码";
String encode = URLEncoder.encode(text, "UTF-8");
System.out.println(encode);
String decode = URLDecoder.decode(encode, "UTF-8");
System.out.println(decode);
```

日志如下：

```
%E4%B8%AD%E6%96%87%E4%B9%B1%E7%A0%81
中文乱码
```

## 解决思路

前端编码

后端解码

### 前端编码

```java
// 文件名中文乱码问题（解析之后，页面正常）ios=>utf8
value = new String(value.getBytes("ISO-8859-1"),"UTF-8");

// 编码，防止传输问题
value = URLEncoder.encode(value, "UTF-8");
```

### 后端代码

```java
private void decodeFileName(Req req) {
	try {
		String oldFileName = req.getFileName();
		if(StringUtils.isEmpty(oldFileName)) {
			return;
		}
		// 解码为 UTF-8
		String fileName = URLDecoder.decode(oldFileName, "UTF-8");
		log.info("解码后的文件名：{}", fileName);
		req.setFileName(fileName);
	} catch (UnsupportedEncodingException e) {
		log.error("文件名称解码失败：{}" + req, e);
	}
}
```

测试成功。

总结：方法总比困难多，奈何困难特别多。

# 后续-文件编码错误

后来发现只是文件名称对了，但是内容不对。

本质上还是说本来是 utf8 的字节流，被强制转换成了 iso 编码。

## 源码分析

默认 springboot 的文件上传使用的是 CommonsFileUploadSupport 类。

这里有一段关于编码的内容：

```java
protected String getDefaultEncoding() {
	String encoding = getFileUpload().getHeaderEncoding();
	if (encoding == null) {
		encoding = WebUtils.DEFAULT_CHARACTER_ENCODING;     //ISO-8859-1
	}
	return encoding;
}
```

所以我们需要修改默认的编码形式。

## 配置

我们自定义自己的实现类，而不是完全使用 sprign 默认的。

```java
@Bean
public CommonsMultipartResolver commonsMultipartResolver() {
    CommonsMultipartResolver resolver = new CommonsMultipartResolver();
    resolver.setDefaultEncoding(Constants.UTF_8);
    resolver.setMaxUploadSize(500 * 1024 * 1024);
    resolver.setMaxUploadSizePerFile(100 * 1024* 1024);
    return resolver;
}
```

当然，这个最好和 commons-upload 结合使用。

```xml
<dependency>
    <groupId>commons-fileupload</groupId>
    <artifactId>commons-fileupload</artifactId>
    <version>1.4</version>
</dependency>
<dependency>
    <groupId>commons-io</groupId>
    <artifactId>commons-io</artifactId>
    <version>2.2</version>
</dependency>
```


# 参考资料

[JSP页面表单提交时出现中文乱码的解决方法](https://blog.csdn.net/shenlan18446744/article/details/25529679)

[html中form表单向Jsp提交中文乱码问题基本解决办法](https://blog.csdn.net/u012292938/article/details/49101081)

[Java | POST请求，响应中文乱码处理](https://blog.csdn.net/u012294515/article/details/84617140)

## 中文乱码

[关于http请求返回数据中文乱码解决方法](https://blog.csdn.net/qq_29332467/article/details/75006884)

[关于java发送http请求时中文乱码的一种解决办法](https://blog.csdn.net/qq_27361945/article/details/79099293)

[get和post请求参数乱码的解决方式](https://blog.csdn.net/mChenys/article/details/80908525)

[httpclient post请求中文乱码解决](https://cloud.tencent.com/developer/article/1453188)

[Java HttpURLConnection模拟请求Rest接口解决中文乱码问题](https://www.cnblogs.com/antis/p/7155810.html)

* any list
{:toc}