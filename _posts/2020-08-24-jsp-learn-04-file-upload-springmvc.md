---
layout: post
title:  jsp 学习笔记-04-springmvc 文件上传 解决 CORS 跨域问题
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, http, sf]
published: true
---

# 整合 spring mvc

## 前端

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Title</title>
</head>
<body>
    <form action="/fileUpload" method="post" enctype="multipart/form-data">
        用户名：<input type="text" name="username"> <br>
        文件： <input type="file" name="imgFile"> <br>
        <input type="submit" value="上传">
    </form>
</body>
</html>
```

## 后端

```java
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;

/**
 * 2. SpringMVC提供的文件上传
 */
@Controller
public class UploadController {

    /**
     * SpringMVC文件上传
     * 1. 控制器方法通过MultipartFile获取整个上传的文件。
     * 2. 参数名称upload(MultipartFile imgFile..) 中的imgFile一定要与页面的文件域的表单元素名称一致.
     *    <input type="file" name="imgFile">
     */
    @RequestMapping("/fileUpload")
    public String upload(MultipartFile imgFile,String username,HttpServletRequest request) throws Exception {
        //1. 获取上传的目录路径
        // D:/classes/IdeaProjects2019/springmvc02/target/springmvc02-1.0-SNAPSHOT/upload
        String path = request.getSession().getServletContext().getRealPath("/upload");

        //2. 以天为单位，一天创建一个文件夹，保存当天上传的文件
        String date = new SimpleDateFormat("yyyy-MM-dd").format(new Date());

        //3. 创建目录
        File file = new File(path,date);
        if (!file.exists()){
            // 创建目录或子目录
            file.mkdirs();
        }

        //4. 文件上传
        //4.1 获取原始文件名
        String fileName = imgFile.getOriginalFilename();
        fileName = UUID.randomUUID().toString() + fileName.substring(fileName.lastIndexOf("."));
        //4.2 文件上传 【关键代码】
        imgFile.transferTo(new File(file,fileName));
        return "success";
    }
}
```

String username 这种参数也可以直接传递对象。

spring mvc 会把参数帮我们封装好。

# 文件的进一步处理

根据传递的参数解析为 file。

```java
public File createFile(MultipartFile partFile) {
    String fileName = partFile.getOriginalFilename();
    // 创建历史文件
    File tempFile = FileUtils.createFile(fileName);
    try {
        // 文件大小校验
        long fileBytes = partFile.getSize();
        if(fileBytes <= 0) {
            throw new RuntimeException();
        }
        if(fileBytes > maxBytes) {
            throw new RuntimeException();
        }

        // 流写入
        try (FileOutputStream fos = new FileOutputStream(tempFile);
             BufferedOutputStream bos = new BufferedOutputStream(fos);) {
            bos.write(partFile.getBytes());
        } catch (Exception e) {
            logger.error("文件解析失败", e);
            throw new RuntimeException();
        }
        // 上传到 jfile
        return tempFile;
    } finally {
        FileUtils.deleteFile(tempFile);
    }
}
```


# jquery 如何提交 form

form 表单中有 file 信息，而且需要返回的结果

```js
$("#register-form").submit(function (event) {
    event.preventDefault();
    $.ajax({
        url:"/user/register",
        type:"POST",
        data:new FormData(this),
        contentType:false,
        processData:false,
        success:function(status){
            console.log(status);
        }
    })
});
```

FormData的数据会自动组织成 `multipart/form-data` 形式的，因此不需要JQuery进行转化了，因此 contentType,processData 为false

# CORS 问题

## 报错

```
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 全局定义

```java
package com.example.demo;
 
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
 
@Configuration
public class CorsConfig {
    private CorsConfiguration buildConfig() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.addAllowedOrigin("*");
        corsConfiguration.addAllowedHeader("*");
        corsConfiguration.addAllowedMethod("*");
        return corsConfiguration;
    }
 
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 配置所有请求
        source.registerCorsConfiguration("/**", buildConfig());
        return new CorsFilter(source);
    }
}
```

## 注解指定

第二种，在你要访问的Controller的方法上面加上注解 @CrossOrigin

```java
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;
import java.util.ArrayList;
import java.util.List;
 
@Controller
public class TestController {
 
 
    @CrossOrigin
    @RequestMapping("/user/login1")
    @ResponseBody
    public List<User> userLogin(User user) {
        System.out.println(user);
        ArrayList<User> users = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            users.add(user);
        }
        return users;
    }
}
```

# 参考资料

[前端获取map的key和value，js获取数据中的key和value](https://blog.csdn.net/qq_42795915/article/details/93717769)

[JQuery上传含有文件的表单](https://blog.csdn.net/jdbdh/article/details/89513112)

[html,图片上传预览，input file获取文件等相关操作](https://www.cnblogs.com/v-weiwang/p/4786707.html)

[SpringMVC文件上传实现步骤详解](https://blog.csdn.net/weixin_44594056/article/details/88393683)

[springboot&ajax&has been blocked by CORS policy: No 'Access-Control-Allow-Origin](https://cloud.tencent.com/developer/article/1433176)

* any list
{:toc}