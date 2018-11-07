---
layout: post
title: Excel Export
date:  2018-11-7 08:58:33 +0800
categories: [Java]
tags: [maven, java, tool, excel, sh]
published: true
excerpt: Excel 导出设计及其实现
---

# 产品需求

产品经理需要导出一个页面的所有的信息到 EXCEL 文件。

## 需求分析

对于 excel 导出，是一个很常见的需求。

最常见的解决方案就是使用 poi 直接同步导出一个 excel 文件。

## 客户体验 & 服务性能

- 客户体验

如果导出的文件比较大，比如几十万条数据，同步导出页面就会卡主，用户无法进行其他操作。

- 服务性能

导出的时候，任务比较耗时就会阻塞主线程。

如果导出的服务是暴露给外部（前后端分离），这种大量的数据传输十分消耗性能。

## 解决方案

使用异常处理导出请求，后台 MQ 通知自己进行处理。

MQ 消费之后，多线程处理 excel 文件导出，生成文件后上传到 FTP 等文件服务器。

前端直接查询并且展现对应的任务执行列表，去 FTP 等文件服务器下载文件即可。

# EXCEL 导出需要考虑的问题

## OOM

正常的 poi 在处理比较大的 excel 的时候，会出现内存溢出。

网上的解决方案也比较多。

比如官方的 [SXSSF (Since POI 3.8 beta3)](http://poi.apache.org/components/spreadsheet/index.html) 解决方式。

或者使用封装好的包 

1. [easypoi ExcelBatchExportServer](http://easypoi.mydoc.io/#text_202984) 

2. [hutool BigExcelWriter](http://www.hutool.cn/docs/#/poi/Excel%E5%A4%A7%E6%95%B0%E6%8D%AE%E7%94%9F%E6%88%90-BigExcelWriter)

原理都是**强制使用 xssf 版本的Excel**。

你也可以使用 [easyexcel](https://github.com/alibaba/easyexcel)，当然这个注释文档有些欠缺，而且设计的比较复杂，不是很推荐。

我这里使用的是 [hutool BigExcelWriter](http://www.hutool.cn/docs/#/poi/Excel%E5%A4%A7%E6%95%B0%E6%8D%AE%E7%94%9F%E6%88%90-BigExcelWriter)，
懒得自己再写一遍。

## FULL GC

如果一次查询 100W 条数据库，然后把这些信息全部加载到内存中，是不可取的。

建议有2个：

1. 限制每一次分页的数量。比如一次最多查询 1w 条。分成 100 次查询。(必须)

2. 限制查询得总条数。比如限制为最多 10W 条。（根据实际情况选择）

虽然使用者提出要导出类似于 3 个月的所有信息，但是数量太多，毫无意义。(提出者自己可能体会不到)

尽量避免 FULL-GC 的情况发生，因为目前的所有方式对于 excel 的输出流都会占用内存，100W 条很容易导致 FULL-GC。

## 编程的便利性

对于上面提到的工具，比如 Hutool，在表头的处理方面没法很方便的统一。

你可以自己定义类似于 easypoi/easyexcel 中的注解，自己反射解析。

然后统一处理表头即可。



* any list
{:toc}