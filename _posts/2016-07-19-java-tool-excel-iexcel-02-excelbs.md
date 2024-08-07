---
layout: post
title: iexcel-excel 大文件读取和写入-02-ExcelBs 简介
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

# ExcelBs 简介

相比较于 static 方法，fluent 的对象工具更便于后期拓展。

为了用户方便使用，提供了常见的默认属性，以及灵活的 api 接口。

## 使用简介

```java
ExcelBs.newInstance("excel文件路径")
```

使用上述方式即可创建。会根据文件后缀，自动选取 03 excel 或者 07 excel 进行读写。

# 属性配置

## 属性说明

| 属性值 | 类型 | 默认值 | 说明 |
|:---|:--|:---|:--|
| path | 字符串 | NA | 默认创建 ExcelBs 时要指定，可以通过 path() 方法再次指定。 |
| bigExcelMode | 布尔 | false | 是否是大 Excel 模式，如果写入/读取的内容较大，建议设置为 true |

## 设置

Fluent 模式设置

- 设置举例

```java
ExcelBs.newInstance("excel文件路径").bigExcelMode(true)
```

# 方法说明

## 方法概览

| 方法 | 参数 | 返回值 | 说明 |
|:---|:---|:---|:---|
| append(Collection<?>) | 对象列表 | ExcelBs | 将列表写入到缓冲区，但是不写入文件 |
| write() | 无 | void | 将缓冲区中对象写入到文件 |
| write(Collection<?>) | 无 | void |将缓冲区中对象写入到文件，并将列表中写入到文件 |
| read(Class<T>) | 读取对象的类型 | 对象列表 | |
| read(Class<T>, startIndex, endIndex) | 对象类型,开始下标，结束下标 | 对象列表 | |

## 写入

### 一次性写入

最常用的方式，直接写入。

```java
ExcelBs.newInstance("excel文件路径").write(Collection<?>)
```

### 多次写入

有时候我们要多次构建对象列表，比如从数据库中分页读取。

则可以使用如下的方式：

```java
ExcelBs.newInstance("excel文件路径").append(Collection<?>)
    .append(Collection<?>).write()
```

## 读取文件

### 读取所有

```java
ExcelBs.newInstance("excel文件路径").read(Class<T>);
```

### 读取指定下标

这里的下标从0开始，代表第一行数据，不包含头信息行。

```java
ExcelBs.newInstance("excel文件路径").read(Class<T>, 1, 1);
```

* any list
{:toc}