---
layout: post
title: iexcel-excel 大文件读取和写入-03-@ExcelField 注解介绍
date:  2016-7-19 12:26:11 +0800
categories: [Java]
tags: [java, tool, sf]
published: true
---

# excel 系列

[Excel Export 踩坑注意点+导出方案设计](https://houbb.github.io/2016/07/19/java-tool-excel-export-design-01-overview)

[基于 hutool 的 EXCEL 优化实现](https://houbb.github.io/2016/07/19/java-tool-excel-hutool-opt-01-intro)

[iexcel-excel 大文件读取和写入，解决 excel OOM 问题-01-入门介绍](https://houbb.github.io/2016/07/19/java-tool-excel-iexcel-01-intro)

[iexcel-excel 大文件读取和写入-02-Excel 引导类简介](https://houbb.github.io/2016/07/19/java-tool-excel-iexcel-02-excelbs)

[iexcel-excel 大文件读取和写入-03-@ExcelField 注解介绍](https://houbb.github.io/2016/07/19/java-tool-excel-iexcel-03-excelField)

[iexcel-excel 大文件读取和写入-04-order 指定列顺序](https://houbb.github.io/2016/07/19/java-tool-excel-iexcel-04-order)

[iexcel-excel 大文件读取和写入-05-file bytes 获取文件字节信息](https://houbb.github.io/2016/07/19/java-tool-excel-iexcel-05-file-bytes)

[Aapche POI java excel 操作工具包入门](https://houbb.github.io/2016/07/19/java-tool-excel-poi-01-intro)

# `@ExcelField` 简介

有时候我们需要灵活的指定字段属性，比如对应的 excel 表头字段名称。

比如是否要读写这一行内容。

`@ExcelField` 注解就是为此设计。

# 注解说明

```java
public @interface ExcelField {

    /**
     * excel 表头字段名称
     * 如果不传：默认使用当前字段名称
     * @return 字段名称
     */
    String headName() default "";

    /**
     * excel 文件是否需要写入此字段
     *
     * @return 是否需要写入此字段
     */
    boolean writeRequire() default true;

    /**
     * excel 文件是否读取此字段
     * @return 是否读取此字段
     */
    boolean readRequire() default true;

}
```

# 使用例子

```java
public class UserField {

    @ExcelField(headName = "姓名")
    private String name;

    @ExcelField(headName = "年龄")
    private int age;

}
```

这样生成的 excel 表头就是我们指定的中文。


* any list
{:toc}