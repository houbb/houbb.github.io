---
layout: post
title:  jsp 学习笔记-04-apache commons upload 实现文件上传
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, http, sf]
published: true
---

# 场景

借助 apache commons upload 实现文件上传。

# 概览

Commons FileUpload软件包使向Servlet和Web应用程序添加强大的高性能文件上传功能变得容易。

FileUpload解析符合 [RFC 1867](http://www.ietf.org/rfc/rfc1867.txt) HTML中基于表单的文件上载”的HTTP请求。

也就是说，如果使用 POST 方法提交了HTTP请求，并且其内容类型为 `multipart/form-data`，则FileUpload可以解析该请求，并以调用方易于使用的方式提供结果。

从版本1.3开始，FileUpload处理 [RFC 2047](https://www.ietf.org/rfc/rfc2047.txt) 编码的标头值。

向服务器发送多部分/表单数据请求的最简单方法是通过网络表单，即

## 最简单的定义方式

```html
<form method="POST" enctype="multipart/form-data" action="fup.cgi">
  File to upload: <input type="file" name="upfile"><br/>
  Notes about the file: <input type="text" name="note"><br/>
  <br/>
  <input type="submit" value="Press"> to upload the file!
</form>
```

# 快速开始

## 使用 commons-upload

FileUpload可以以多种不同方式使用，具体取决于应用程序的要求。 

在最简单的情况下，您将调用一个方法来解析servlet请求，然后在将它们应用于您的应用程序时处理它们的列表。 

另一方面，您可能决定自定义FileUpload，以完全控制单个项目的存储方式。 例

如，您可能决定将内容流式传输到数据库中。

在这里，我们将描述FileUpload的基本原理，并说明一些更简单且最常见的使用模式。 

FileUpload的自定义在其他地方介绍。

FileUpload 依赖 Commons-IO，因此在继续之前，请确保您具有类路径中的依赖项页面上提到的版本。

## 版本依赖

> [依赖界面](http://commons.apache.org/proper/commons-fileupload/dependencies.html)

```xml
<dependency>
    <groupId>commons-fileupload</groupId>
    <artifactId>commons-fileupload</artifactId>
    <version>1.4</version>
</dependency>
```

v1.4 对应的 commons-io 版本为：v2.2

```xml
<dependency>
    <groupId>commons-io</groupId>
    <artifactId>commons-io</artifactId>
    <version>2.2</version>
</dependency>
```

你可以手动下载依赖，个人建议使用 maven 进行包管理。

## 工作原理

文件上载请求包括根据RFC 1867“ HTML中基于表单的文件上载”进行编码的项目的有序列表。 

FileUpload可以解析此类请求，并为您的应用程序提供各个上载项目的列表。每个此类项目均实现FileItem接口，而不管其基础实现如何。

此页面描述了commons文件上传库的传统API。传统的API是一种便捷的方法。但是，为了获得最终性能，您可能更喜欢更快的 **Streaming API**。

每个文件项都有许多您的应用程序可能需要的属性。

例如，每个项目都有一个名称和内容类型，并且可以提供一个InputStream来访问其数据。

另一方面，您可能需要根据项目是常规表单字段（即，数据来自普通文本框还是类似的HTML字段）还是上传的文件，对项目进行不同的处理。 

FileItem接口提供了进行这种确定以及以最适当的方式访问数据的方法。

FileUpload使用FileItemFactory创建新的文件项。

这就是FileUpload的最大灵活性。工厂对每个项目的创建方式拥有最终控制权。 

FileUpload当前随附的工厂实现将项目的数据存储在内存中或磁盘上，具体取决于项目的大小（即数据字节）。

但是，可以自定义此行为以适合您的应用程序。

## 入门例子

### apache.jsp

```jsp
<!DOCTYPE html>
<%@page contentType="text/html; charset=UTF-8" language="java"%>
<html lang="zh">
<head>
    <title>JSP 实现文件上传和下载</title>
</head>
<body>
<form method="POST" enctype="multipart/form-data" action="/apache/upload">
    File to upload:
    <input type="file" name="file"><br/>
    Notes about the file:
    <input type="text" name="note"><br/>
    <br/>
    <input type="submit" value="Press"> to upload the file!
</form>
</body>
</html>
```

直接根据官方的例子

### ApacheController.java

对应的后端代码

```java
package com.github.houbb.jsp.learn.hello.controller;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileItemFactory;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.util.List;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@Controller
public class ApacheController {

    /**
     * 实现文件上传
     *
     * @param request  请求
     * @param response 响应
     * @return
     */
    @GetMapping("/apache")
    @PostMapping("/apache")
    public String index(HttpServletRequest request,
                        HttpServletResponse response) {
        return "apache";
    }

    /**
     * 实现文件上传
     *
     * @param request  请求
     * @param response 响应
     * @return 页面
     */
    @PostMapping(value = "/apache/upload")
    public String upload(HttpServletRequest request,
                         HttpServletResponse response) throws Exception {
        // 上传文件夹
        String uploadDir = request.getServletContext().getRealPath("/WEB-INF/upload/");
        File tempDir = new File(uploadDir);

        // file less than 10kb will be store in memory, otherwise in file system.
        final int threshold = 10240;
        final int maxRequestSize = 1024 * 1024 * 4;	// 4MB

        if(ServletFileUpload.isMultipartContent(request)) {
            // Create a factory for disk-based file items.
            FileItemFactory factory = new DiskFileItemFactory(threshold, tempDir);
            // Create a new file upload handler
            ServletFileUpload upload = new ServletFileUpload(factory);
            // Set overall request size constraint.
            upload.setSizeMax(maxRequestSize);

            List<FileItem> items = upload.parseRequest(request);

            for(FileItem item : items) {
                // 普通的表单字段
                if(item.isFormField()) {
                    String name = item.getFieldName();
                    String value = item.getString();
                    System.out.println(name + ": " + value);
                } else {
                    // 真实的文件
                    //file upload
                    String fieldName = item.getFieldName();
                    String fileName = item.getName();
                    File uploadedFile = new File(uploadDir + File.separator + fieldName + "_" + fileName);
                    item.write(uploadedFile);
                }
            }
        }  else {
            // 文件解析失败
        }
        return "apache";

    }

}
```

## 问题

`upload.parseRequest(request)` 这一步处理的结果并不是如网上说的那样有结果。

打断点发现文件确实是传过来了。

于是晚上查了一下，应该是 springboot 对 request 已经进行了一次封装，不再是最基本的 request 请求。


## 解决方案

使用Apache Commons FileUpload组件上传文件时总是返回null，调试发现ServletFileUpload对象为空，在Spring Boot中有默认的文件上传组件，在使用ServletFileUpload时需要关闭Spring Boot的默认配置 ，

禁用MultipartResolverSpring提供的默认值

禁用 springboot 转换：

- application.properties

```
spring.servlet.multipart.enabled=false
```

再次执行就可以了。

## 代码分析

其实整体比较简单。

对转换后的 FileItem 通过 `item.isFormField()` 判断是否为普通的 form 字段。

### 普通 form 字段

比如我测试，日志输出：

```
note: 123
```

这个对应的是 note 属性，及其页面我输入的值 123。


### 文件信息

```java
File uploadedFile = new File(uploadDir + File.separator + fieldName + "_" + fileName);
item.write(uploadedFile);
```

这两行代码可以在指定的文件夹下创建对应的文件信息。

当然这个性能不是很好，因为实际上是借助了临时文件夹，然后做文件的处理。

## 临时文件的清空

本节仅在使用DiskFileItem时适用。 

换句话说，如果您在处理之前将上传的文件写入临时文件，则适用。

如果不再使用这些临时文件（更确切地说，如果DiskFileItem的相应实例已被垃圾回收），则会自动将其删除。

这是由 `org.apache.commons.io.FileCleanerTracker` 类以静默方式完成的，该类启动了收割线程。

如果不再需要该收割线程，则应停止该线程。 

在Servlet环境中，这是通过使用称为FileCleanerCleanup的特殊Servlet上下文侦听器来完成的。 

为此，请将以下内容添加到web.xml中：

```xml
<web-app>
  ...
  <listener>
    <listener-class>
      org.apache.commons.fileupload.servlet.FileCleanerCleanup
    </listener-class>
  </listener>
  ...
</web-app>
```

## 观察上传进度

如果您希望上传非常大的文件，那么最好向用户报告已收到多少文件。 

甚至HTML页面也允许通过返回 `multipart/replace` 响应或类似的东西来实现进度条。

观看上传进度可以通过提供进度监听器来完成：

```java
//Create a progress listener
ProgressListener progressListener = new ProgressListener(){
   public void update(long pBytesRead, long pContentLength, int pItems) {
       System.out.println("We are currently reading item " + pItems);
       if (pContentLength == -1) {
           System.out.println("So far, " + pBytesRead + " bytes have been read.");
       } else {
           System.out.println("So far, " + pBytesRead + " of " + pContentLength
                              + " bytes have been read.");
       }
   }
};
upload.setProgressListener(progressListener);
```

像上面一样，帮自己一个忙，实现第一个进度监听器，因为它向您展示了一个陷阱：进度监听器被频繁调用。 

根据servlet引擎和其他环境工厂的不同，可能会为任何网络数据包调用它！ 

换句话说，您的进度侦听器可能会成为性能问题！ 

一个典型的解决方案可能是减少进度侦听器活动。

例如，如果兆字节数已更改，则可能仅发出一条消息：

```java 
//Create a progress listener
ProgressListener progressListener = new ProgressListener(){
   private long megaBytes = -1;
   public void update(long pBytesRead, long pContentLength, int pItems) {
       long mBytes = pBytesRead / 1000000;
       if (megaBytes == mBytes) {
           return;
       }
       megaBytes = mBytes;
       System.out.println("We are currently reading item " + pItems);
       if (pContentLength == -1) {
           System.out.println("So far, " + pBytesRead + " bytes have been read.");
       } else {
           System.out.println("So far, " + pBytesRead + " of " + pContentLength
                              + " bytes have been read.");
       }
   }
};
```

# Streaming API

## 更快的实现

用户指南中描述的传统API假定文件项必须存储在某个位置，然后用户才能实际对其进行访问。 这种方法很方便，因为它允许轻松访问项目内容。 另一方面，这是内存和时间消耗。

流式API使您可以牺牲一点便利来获得最佳性能和低内存配置文件。 

此外，API更轻巧，因此更易于理解。

Streaming API 上传速度相对较快。

因为它是利用内存保存上传的文件，节省了传统API将文件写入临时文件带来的开销。

官方： [http://commons.apache.org/proper/commons-fileupload/streaming.html](http://commons.apache.org/proper/commons-fileupload/streaming.html)

[http://stackoverflow.com/questions/11620432/apache-commons-fileupload-streaming-api](http://stackoverflow.com/questions/11620432/apache-commons-fileupload-streaming-api)

## 工作原理

同样，FileUpload类用于按客户端发送表单字段和字段的顺序访问表单字段和字段。 但是，FileItemFactory被完全忽略。

## 入门例子

### stream.jsp

```jsp
<!DOCTYPE html>
<%@page contentType="text/html; charset=UTF-8" language="java"%>
<html lang="zh">
<head>
    <title>JSP 实现文件上传和下载</title>
</head>
<body>
<form method="POST" enctype="multipart/form-data" action="/stream/upload">
    File to upload:
    <input type="file" name="file"><br/>
    Notes about the file:
    <input type="text" name="note"><br/>
    <br/>
    <input type="submit" value="Press"> to upload the file!
</form>
</body>
</html>
```

直接请求 `/stream/upload`

### 后端

```java
package com.github.houbb.jsp.learn.hello.controller;

import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.fileupload.util.Streams;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@Controller
public class StreamController {

    /**
     * 实现文件上传
     *
     * @param request  请求
     * @param response 响应
     * @return
     */
    @GetMapping("/stream")
    @PostMapping("/stream")
    public String index(HttpServletRequest request,
                        HttpServletResponse response) {
        return "stream";
    }

    /**
     * 实现文件上传
     *
     * @param request  请求
     * @param response 响应
     * @return 页面
     */
    @PostMapping(value = "/stream/upload")
    public String upload(HttpServletRequest request,
                         HttpServletResponse response) throws Exception {
        // 上传文件夹
        String uploadDir = request.getServletContext().getRealPath("/WEB-INF/upload/");

        if(ServletFileUpload.isMultipartContent(request)) {
            // Create a new file upload handler
            ServletFileUpload upload = new ServletFileUpload();

            // Parse the request
            FileItemIterator iter = upload.getItemIterator(request);
            while (iter.hasNext()) {
                FileItemStream item = iter.next();
                String name = item.getFieldName();
                InputStream stream = item.openStream();
                if (item.isFormField()) {
                    System.out.println("Form field " + name + " with value "
                            + Streams.asString(stream) + " detected.");
                } else {
                    String fileName = item.getName();
                    File uploadedFile = new File(uploadDir + File.separator + fileName);
                    OutputStream os = new FileOutputStream(uploadedFile);
                    // write file to disk and close outputstream.
                    Streams.copy(stream, os, true);
                }
            }
        }  else {
            // 文件解析失败
        }

        return "stream";
    }

}
```

感觉上确实要快一些。


# JSP 直接实现

这也是看到一些文章直接可以通过 jsp 调用 jsp。

实际上 jsp 的原理就是执行 java 代码，这里记录一下，平时也不是很建议这样使用。

## upload.jsp

```jsp
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<html>
 <body>
  <form method="POST" enctype="multipart/form-data" action="traditionalapi.jsp">
  File to upload: <input type="file" name="file" size="40"><br/>
  <input type="submit" value="Press"> to upload the file!
	</form>
 </body>
</html>
```

## traditionalapi.jsp

```jsp
<%@page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" language="java"%>
<%@page import="java.io.File"%>
<%@page import="java.util.List"%>
<%@page import="org.apache.commons.fileupload.*"%>
<%@page import="org.apache.commons.fileupload.disk.DiskFileItemFactory"%>
<%@page import="org.apache.commons.fileupload.servlet.ServletFileUpload"%>
 
<%
	request.setCharacterEncoding("UTF-8");
	// file less than 10kb will be store in memory, otherwise in file system.
	final int threshold = 10240;
	final File tmpDir = new File(getServletContext().getRealPath("/") + "fileupload" + File.separator + "tmp");
	final int maxRequestSize = 1024 * 1024 * 4;	// 4MB
	// Check that we have a file upload request
	if(ServletFileUpload.isMultipartContent(request))
	{
		// Create a factory for disk-based file items.
		FileItemFactory factory = new DiskFileItemFactory(threshold, tmpDir);
		
		// Create a new file upload handler
		ServletFileUpload upload = new ServletFileUpload(factory);
		// Set overall request size constraint.
		upload.setSizeMax(maxRequestSize);
		List<FileItem> items = upload.parseRequest(request);	// FileUploadException 
		for(FileItem item : items)
		{
			if(item.isFormField())	//regular form field
			{
				String name = item.getFieldName();
				String value = item.getString();
%>
				<h1><%=name%> --> <%=value%></h1>
<%
			}
			else
			{	//file upload
				String fieldName = item.getFieldName();
				String fileName = item.getName();
				File uploadedFile = new File(getServletContext().getRealPath("/") +
							"fileupload" + File.separator + fieldName + "_" + fileName);
				item.write(uploadedFile);
%>
				<h1>upload file <%=uploadedFile.getName()%> done!</h1>
<%
			}
		}
	}
%>
```



# 拓展阅读

JSP 远程调用



# axios 实战

## maven 引入

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


## 前端

```html
<div class="upload">
    <div class="upload-title">附件上传</div>
    <div class="upload-item">
        <input ref="createFile" class="file" accept=".zip,.rar"  type="file" @change="fileChange"> 
        <el-button size="small" type="primary" class="btn">选择文件</el-button>
    </div>
    <div>{{fileName}}</div>
    <div class="upload-text">文件大小不超过30M，仅支持ZIP、RAR文件格式</div>
</div>
```

对应的上传 js

```js
fileChange(e){
    const files = e.target.files;
    if(files && files[0]) {
        const file = files[0];
        if(file.size > 1024 * 1024 *30) {
            this.$message({ showClose: true,  message: '文件大小不能超过30M!', type: 'warning'});
            return
        } 
        var formData = new FormData()
        formData.append("file",files[0])
        var config = {
            headers: {
                "Content-Type": "multipart/form-data;charset=UTF-8"
            }
        };
        axios.post("file/upload",formData, config).then((res) => {
            console.log(formData,res);
            if (res.data.respCode == '0000') {
                this.fileName= files[0].name 
                this.$refs.createFile.value = '' 
                this.fileToken=res.data.result.fileToken            
            } else {
                this.$message({ message: res.data.respMsg, type: 'error'});
            } 
        })
    }
}
```

ps: 这种上传比较麻烦，可以参考网上的 post form 表单的方式。

## 后端配置

### 配置类

```java
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.multipart.commons.CommonsMultipartResolver;

import javax.servlet.MultipartConfigElement;

/**
 * 文件请求配置
 *
 * https://blog.csdn.net/luyongguo/article/details/86010145
 *
 * @author binbin.hou
 * @since 1.0.0
 */
@Configuration
public class FileRequestConfig {

    @Value("${file.request.maxFileSize:100MB}")
    private String maxFileSize;

    @Value("${file.request.maxRequestSize:100MB}")
    private String maxRequestSize;

    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        // 单个数据大小
        // KB,MB
        factory.setMaxFileSize(maxFileSize);
        // 总上传数据大小
        factory.setMaxRequestSize(maxRequestSize);

        return factory.createMultipartConfig();
    }

    @Bean
    public CommonsMultipartResolver commonsMultipartResolver() {
        CommonsMultipartResolver resolver = new CommonsMultipartResolver();

        resolver.setDefaultEncoding(Constants.UTF_8);
        resolver.setMaxUploadSize(500 * 1024 * 1024);
        resolver.setMaxUploadSizePerFile(100 * 1024* 1024);
        return resolver;
    }
}
```

主要指定文件的上传大小，编码等。

### 后端实现

注意：`@RequestParam("file") MultipartFile multipartFile` 这里是必须的，如果使用 ServeletHttpRequest 中转换获取是没有值的。

```java
/**
 * 文件上传
 * https://www.cnblogs.com/charlypage/p/9858676.html
 * @param multipartFile 上传请求
 * @return 上传结果
 */
@RequestMapping("/upload")
public BaseInfoResp<FileUploadResp> upload(@RequestParam("file") MultipartFile multipartFile) {
    UploadFileDto uploadFileDto = HttpUtils.getUploadFileInfo(multipartFile);
    File file = uploadFileDto.getFile();
    try {
        ValidateUtils.validate(uploadFileDto);
        this.fileSizeCheck(uploadFileDto);
        String fileToken = fileService.uploadJFile(file);
        // 入库
        String fileName = uploadFileDto.getOriginalFilename();
        customerFileService.addFile(fileToken, fileName);
        FileUploadResp resp = new FileUploadResp();
        resp.setFileToken(fileToken);
        return RespUtil.of(resp);
    } finally {
        FileUtil.deleteFile(file);
    }
}
```

其中文件构建的部分：

```java
/**
 * 获取上传的文件信息
 * @param multipartFile 请求
 * @return 结果
 */
public static UploadFileDto getUploadFileInfo(MultipartFile multipartFile) {
    try {
        String filename = multipartFile.getOriginalFilename();
        long fileSize = multipartFile.getSize();
        log.info("原始的文件名称 {}, 文件大小 {}", filename, fileSize);
        //1. 创建文件
        String targetFullPath = FileUtil.buildFullPath(filename);
        File file = FileUtil.createFile(targetFullPath);
        // 写入文件
        try (FileOutputStream fos = new FileOutputStream(targetFullPath);
             BufferedOutputStream bos = new BufferedOutputStream(fos);) {
            bos.write(multipartFile.getBytes());
        } catch (Exception e) {
            log.error("异常", e);
            throw new BizException(RespCode.FILE_UPLOAD_ERROR);
        }
        UploadFileDto dto = new UploadFileDto();
        dto.setFile(file);
        dto.setOriginalFilename(filename);
        dto.setFileSize(fileSize);
        return dto;
    } catch (Exception e) {
        log.error("文件上传异常", e);
        throw new BizException(RespCode.FILE_UPLOAD_REQUEST_ERROR);
    }
}
```

## file 信息缺失

测试了很多遍，都发现 multipartFile 的信息为 null。

虽然以前踩过类似的坑，直到被 spring 转换掉了。

但是配置下面之后，依然无效。

- springboot.properties

```
spring.servlet.multipart.enabled=false
```

后来发现，需要排除 springboot 的自动配置类：

```java
@SpringBootApplication(exclude = {MultipartAutoConfiguration.class})
@PropertySource("classpath:springboot.properties")
public class BootApplication extends SpringBootServletInitializer {

    public static void main(String[] args) {
        SpringApplication.run(BootApplication.class, args);
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(BootApplication.class);
    }

}
```


# 参考资料

[commons-fileupload](http://commons.apache.org/proper/commons-fileupload/index.html)

[Spring Boot 使用 ServletFileUpload上传文件失败，upload.parseRequest(request)为空](https://www.cnblogs.com/tinya/p/9626710.html)

[Apache Commons FileUpload](https://www.jianshu.com/p/aa0f97cd2975)

[SpringMVC用MultipartFile上传文件及文件名中文乱码](https://blog.csdn.net/lzwglory/article/details/81542435)

[SpringBoot结合commons-fileupload上传文件](https://blog.csdn.net/cxfly957/article/details/84747942)

- 上传文件缺失问题

https://www.cnblogs.com/charlypage/p/9858676.html


https://blog.csdn.net/weixin_42733631/article/details/112600786

https://www.cnblogs.com/charlypage/p/9858676.html

https://blog.csdn.net/qq_36907589/article/details/108516431

* any list
{:toc}