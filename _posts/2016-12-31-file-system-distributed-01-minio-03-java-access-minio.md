---
layout: post
title: 分布式存储系统-03-java 访问 minio 实战笔记
date:  2016-12-31 10:48:42 +0800
categories: [File]
tags: [distributed, file]
published: true
---

# maven 引入

## maven 

```xml
<dependency>
    <groupId>io.minio</groupId>
    <artifactId>minio</artifactId>
    <version>8.5.10</version>
</dependency>
```

## 测试类

```java
package org.example;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;

import java.io.FileInputStream;

public class Main {

    public static void main(String[] args) {

        final String fileP = "D:\\github\\minio-java-demo\\src\\main\\resources\\1.html";
        try (FileInputStream fileInputStream =  new FileInputStream(fileP)){
            //1.创建minio链接客户端
            MinioClient minioClient = MinioClient.builder().credentials("minioadmin", "minioadmin")
                    .endpoint("http://localhost:9000")
                    .build();

            //2.上传
            PutObjectArgs putObjectArgs = PutObjectArgs.builder()
                    .object("1.html")//文件名
                    .contentType("text/html")//文件类型
                    .bucket("test")//桶名词  与minio创建的名词一致
                    .stream(fileInputStream, fileInputStream.available(), -1) //文件流
                    .build();
            minioClient.putObject(putObjectArgs);

            System.out.println("http://localhost:9000/test/1.html");

        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

}
```

# 访问

## 直接访问

我们直接访问上述地址：

报错如下：

```xml
<Error>
<Code>AccessDenied</Code>
<Message>Access Denied.</Message>
<Key>1.html</Key>
<BucketName>test</BucketName>
<Resource>/1.html</Resource>
<RequestId>181196CAD15274C8</RequestId>
<HostId>dd9025bab4ad464b049177c95eb6ebf374d3b3fd1af9251148b658df7ac2e3e8</HostId>
</Error>
```

## 设置权限

需要设置 bucket 对应的访问权限

![image](https://i-blog.csdnimg.cn/blog_migrate/7b7c2dbe943b4bd705b948892e73b894.png)

假如说你通过访问 `localhost:9000/test/image/aaa.jpg`, 报错，那么把image文件夹设置prefix,Access是设置只读，只写，和读写，一般设置只读

我这里因为是 `http://localhost:9000/test/1.html`，直接设置前缀为 `/`，对应的权限为读写。

然后就可以直接正常访问了。

# 参考资料

https://blog.csdn.net/qq_72114625/article/details/139333049

* any list
{:toc}