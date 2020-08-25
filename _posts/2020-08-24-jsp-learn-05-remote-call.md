---
layout: post
title:  jsp 学习笔记-05-JSP 远程调用请求
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, http, sf]
published: true
---

# 说明

写代码时，前后端分离。

前端代码各种原因，导致不太好直接部署。

所以想着能不能自己简单模拟一下前端，然后实现文件上传操作，验证后端代码。

于是本地就验证了一下。

# 服务器

## 8080-模拟后端

springboot 启动在 8080 端口。

提供后端解析服务。

### 后端代码

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

## 8081-模拟前端

同样是 springboot 项目，主要模拟前端服务，启动在 8081 端口。

### 前端代码

```jsp
<!DOCTYPE html>
<%@page contentType="text/html; charset=UTF-8" language="java"%>
<html lang="zh">
<head>
    <title>JSP 实现文件上传和下载</title>
</head>
<body>
<form method="POST" enctype="multipart/form-data" action="http://localhost:8080/apache/upload">
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

此处的 `action=http://localhost:8080/apache/upload` 指向的是服务A。

经过测试，是可以直接上传成功的。


* any list
{:toc}