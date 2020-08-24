---
layout: post
title:  jsp 学习笔记-03-JSP 实现 excel 上传并且解析
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, http, sf]
published: true
---

# 场景

我们需要页面上传一个 excel 文件，并且解析入库，然后对输入值进行校验，最后将校验结果输出给用户。

这里我们暂时只演示基于文件上传的 excel 读取和写入。

# excel 读取

## maven 依赖

此处为了实现简单，而且考虑到大文件的解析，我们引入 hutool

```xml
<dependency>
    <groupId>cn.hutool</groupId>
    <artifactId>hutool-poi</artifactId>
    <version>5.4.0</version>
</dependency>
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>4.1.2</version>
</dependency>
<dependency>
    <groupId>xerces</groupId>
    <artifactId>xercesImpl</artifactId>
    <version>2.12.0</version>
</dependency>
```

## 上传 jsp

- excel.jsp

```jsp
<!DOCTYPE html>
<%@page contentType="text/html; charset=UTF-8" language="java"%>
<html lang="zh">
<head>
    <title>JSP 实现文件上传和下载</title>
</head>
<body>
<form action="excel/upload" method="post" enctype="multipart/form-data" >
    请选择 EXCEL 文件：
    <input id="file" name="file" type="file" />
    <input type="submit" value="上传"/>
    上传结果：${result}
</form>
</body>
</html>
```

## 后端代码

```java
import cn.hutool.poi.excel.ExcelReader;
import cn.hutool.poi.excel.ExcelUtil;
import cn.hutool.poi.excel.sax.handler.RowHandler;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.support.StandardMultipartHttpServletRequest;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.List;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@Controller
public class ExcelController {

    /**
     * 实现文件上传
     *
     * @param request  请求
     * @param response 响应
     * @return
     */
    @GetMapping("/excel")
    @PostMapping("/excel")
    public String index(HttpServletRequest request,
                        HttpServletResponse response) {
        return "excel";
    }

    /**
     * 实现文件上传
     *
     * @param request  请求
     * @param response 响应
     * @return 页面
     */
    @PostMapping(value = "/excel/upload")
    public String upload(HttpServletRequest request,
                         HttpServletResponse response) throws IOException, ServletException {
        if (request instanceof StandardMultipartHttpServletRequest) {
            StandardMultipartHttpServletRequest sm = (StandardMultipartHttpServletRequest) request;
            MultipartFile multipartFile = sm.getFile("file");
            String filename = multipartFile.getOriginalFilename();
            //2007
            ExcelReader excelReader;
            String uploadDir = request.getServletContext().getRealPath("/WEB-INF/upload/");
            File fileUpload = new File(uploadDir + filename);

            //1. 创建文件
            fileUpload.createNewFile();
            // 写入文件
            try (FileOutputStream fos = new FileOutputStream(fileUpload);
                 BufferedOutputStream bos = new BufferedOutputStream(fos);) {
                bos.write(multipartFile.getBytes());
            } catch (Exception e) {
                e.printStackTrace();
            }

            RowHandler rowHandler = new RowHandler() {
                @Override
                public void handle(int i, long l, List<Object> list) {
                    System.out.println(i+","+l+": " + list);
                }
            };

            if(filename.endsWith("xlsx")) {
                ExcelUtil.read07BySax(fileUpload, 0, rowHandler);
            } else if(filename.endsWith("xls")) {
                ExcelUtil.read03BySax(fileUpload, 0, rowHandler);
            }
            System.out.println("解析完成");
            // 返回结果页面
            request.setAttribute("result", "文件上传成功");

            // 最后删除临时文件
        } else {
            request.setAttribute("result", "文件上传失败");
        }

        return "forward:/file2";
    }

}
```

这里测试发现，如果直接使用 multipartFile.getInputStream() 处理，内容是空的。

所以通过这种创建临时文件，解析之后，最后删除的解决方案。

## 测试日志

```
0,0: [1, A]
0,1: [2, B]
0,2: [3, C]
```

看的出来，这里的我们可以实现的更加灵活，比如入库，加入列表等等。 

```java
RowHandler rowHandler = new RowHandler() {
    @Override
    public void handle(int i, long l, List<Object> list) {
        System.out.println(i+","+l+": " + list);
    }
};
```

i 代表 sheet 索引

l 代表行数

`List<Object>` 代表当前行的信息。

# excel 写入


## 写入

写入针对较大的数据量，依然存在可能内存溢出的风险。

对于大量数据输出，采用ExcelWriter容易引起内存溢出，因此有了 `BigExcelWriter`，使用方法与ExcelWriter完全一致。


## 实现代码

```java
List<?> row1 = CollUtil.newArrayList("aa", "bb", "cc", "dd", DateUtil.date(), 3.22676575765);
List<?> row2 = CollUtil.newArrayList("aa1", "bb1", "cc1", "dd1", DateUtil.date(), 250.7676);
List<?> row3 = CollUtil.newArrayList("aa2", "bb2", "cc2", "dd2", DateUtil.date(), 0.111);
List<?> row4 = CollUtil.newArrayList("aa3", "bb3", "cc3", "dd3", DateUtil.date(), 35);
List<?> row5 = CollUtil.newArrayList("aa4", "bb4", "cc4", "dd4", DateUtil.date(), 28.00);
List<List<?>> rows = CollUtil.newArrayList(row1, row2, row3, row4, row5);

BigExcelWriter writer = ExcelUtil.getBigWriter("D:\\_github\\jsp-learn\\src\\main\\webapp\\WEB-INF\\upload\\big.xlsx");
// 一次性写出内容，使用默认样式
writer.write(rows);
// 关闭writer，释放内存
writer.close();
```

# 参考资料

[Excel大数据生成-BigExcelWriter](https://www.hutool.cn/docs/#/poi/Excel%E5%A4%A7%E6%95%B0%E6%8D%AE%E7%94%9F%E6%88%90-BigExcelWriter)

* any list
{:toc}