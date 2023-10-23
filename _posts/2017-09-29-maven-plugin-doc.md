---
layout: post
title:  Maven Plugin doc jdk1.8 javadoc 编译报错
date:  2017-9-29 18:13:20 +0800
categories: [Maven]
tags: [maven, plugin]
published: true
---


# jdk8生成javadoc报错的解决

maven-javadoc-plugin 插件生成报 Error decoding percent encoded characters

需增加 `<additionalparam>-Xdoclint:none</additionalparam>` 配置，增加execution的，可能不起效。

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-javadoc-plugin</artifactId>
            <version>2.9.1</version>
            <configuration>
                <encoding>UTF-8</encoding>
                <aggregate>true</aggregate>
                <charset>UTF-8</charset>
                <docencoding>UTF-8</docencoding>
                <additionalparam>-Xdoclint:none</additionalparam>
            </configuration>
        </plugin>
    </plugins>
</build>
```

# 参考资料

https://www.cnblogs.com/dubingxin/p/10715110.html

* any list
{:toc}












 

