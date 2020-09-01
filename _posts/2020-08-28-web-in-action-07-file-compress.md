---
layout: post
title:  web 实战-07-File Compress 文件压缩 java 实现
date:  2020-08-28 10:37:20 +0800
categories: [web]
tags: [web, http, sf]
published: true
---

# 背景

有时候网络传输中，我们首先需要对文件进行压缩。

压缩算法也是多种多样，此处演示最常用的 zip 压缩方式。

# java 实现

## maven 依赖

```xml
<dependency>
	<groupId>org.apache.ant</groupId>
	<artifactId>ant</artifactId>
	<version>1.10.1</version>
</dependency>
```

## 压缩工具类

- ZipUtils.java

```java
import lombok.extern.slf4j.Slf4j;
import org.apache.tools.zip.ZipEntry;
import org.apache.tools.zip.ZipOutputStream;

import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;

/**
 * 解压缩工具类
 *
 * @author binbin.hou
 */
@Slf4j
public final class ZipUtils {

    private ZipUtils() {
    }

    /**
     * 生成 zip 文件
     *
     * 将 file 输出到 os 压缩文件流中
     * @param os    输出流
     * @param commonFile 文件路径
     */
    public static void generateZipFile(OutputStream os, String commonFile) {
        File targetFile = new File(commonFile);
        generateZipFile(os, targetFile);
    }

    /**
     * 生成 zip 文件
     *
     * 将 file 输出到 os 压缩文件流中
     * @param os    输出流
     * @param targetFile 文件路径
     */
    public static void generateZipFile(OutputStream os, File targetFile) {
        try (ZipOutputStream out = new ZipOutputStream(os);
             FileInputStream fis = new FileInputStream(targetFile)) {
            byte[] buffer = new byte[1024];

            //设置编码格式
            out.setEncoding("GBK");
            out.putNextEntry(new ZipEntry(targetFile.getName()));
            int len;

            //读入需要下载的文件的内容，打包到zip文件
            while ((len = fis.read(buffer)) != -1) {
                out.write(buffer, 0, len);
            }

            out.flush();
            out.closeEntry();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
```

## 使用方式

```java
File csvFile = new File("1.csv");
File zipFile = new File("1.zip");

// 压缩文件
try(FileOutputStream fos = new FileOutputStream(zipFile)) {
    ZipUtils.generateZipFile(fos, csvFile);
}
```

# 拓展阅读

[compress](http://github.com/houbb/compress)

* any list
{:toc}