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
 
## 数据库的压力

去数据库读取的时候一定要记得分页，免得给数据库太大的压力。

一次读取太多，也会导致内存直线上升。

比如 100W 条数据，则分成 100 次去数据库读取。

## 网络传输

传统的 excel 导出，都是前端一个请求，直接 HTTP 同步返回。导出 100W 条，就在那里傻等。

这客户体验不友好，而且网络传输，系统占用多种问题。

建议使用异步处理的方式，将文件上传到文件服务器。前端直接去文件服务器读取。

## 编程的便利性

对于上面提到的工具，比如 Hutool，在表头的处理方面没法很方便的统一。

你可以自己定义类似于 easypoi/easyexcel 中的注解，自己反射解析。

然后统一处理表头即可。

# EXCEL 基础知识补充

## Excel 格式的区别

.xls 是03版Office Microsoft Office Excel 工作表的格式，用03版Office，新建Excel默认保存的Excel文件格式的后缀是.xls；

.xlsx 是07版Office Microsoft Office Excel 工作表的格式，用07版Office，新建Excel默认保存的的Excel文件格式后缀是.xlsx。

07版的Office Excel，能打开编辑07版（后缀.xlsx）的Excel文件，也能打开编辑03版（后缀.xls）的Excel文件，都不会出现乱码或者卡死的情况。

但是，03版的Office Excel，就只能打开编辑03版（后缀.xls）的Excel文件；如果打开编辑07版（后缀.xlsx）的Excel文件，则可能出现乱码或者开始能操作到最后就卡死，以后一打开就卡死。

那么07版.xlsx的Excel文件，怎么才能在03版的Office Excel中打开呢？

也简单，举个例，你家里的电脑用的07版Office Excel，你在家里做好一个Excel的文件，你默认保存的话就是.xlsx格式；如果你要拷到公司电脑上用，公司的电脑是03版Office Excel，要是你直接拷过去的话，是没法用的；你得这样，在家里做Office Excel的时候，保存的时候，点击office按钮，采用另存为“97-2003 Excel 工作簿”，这样保存的格式就是03版的.xls格式，这样就实现.xlsx文件转换成.xls。这样再把.xls格式Excel文件拷到公司的电脑上就能用了，就OK了。

如果你家里的电脑是03版Office Excel，那么默认保存（.xls）就行，不管公司的电脑是03版的还是07版的Office。

## EXCEL 的限制

EXCEL 的上限行数为 1048575。超过这个数量，EXCEL 打开会有问题。

额外表头 1048575+1 = 1048576;  `2^20`

# 常见解析方式

## poi

apache 工具

[sax 模式](https://poi.apache.org/components/spreadsheet/how-to.html#xssf_sax_api)

[SAX解析excel，避免oom](https://blog.csdn.net/weixin_42330218/article/details/81368034?utm_source=blogxgwz2)

[SAX解析excel与DOM解析excel占用内存对比](https://blog.csdn.net/weixin_42330218/article/details/81458443)

[秒懂POI解析excel，SAXParser解析大xlsx，XSSFReader处理包括被忽略的空单元格处理](https://blog.csdn.net/c5113620/article/details/79780500)

两种 excel 的区别

[POI-HSSF and POI-XSSF/SXSSF - Java API To Access Microsoft Excel Format Files](https://poi.apache.org/components/spreadsheet/index.html)

http://www.datypic.com/sc/ooxml/ss.html


## 解决 OOM 的方式

[使用POI进行数据导出excel时的OOM服务挂掉，cpu飙升的问题](https://blog.csdn.net/doujinlong1/article/details/80780823)

## jxl

[jxl 介绍](https://blog.csdn.net/qq_37057095/article/details/75460346)

[jxl 封装](https://github.com/huangyemin/JxlExcel)

已经停止更新。比较老的框架。

# easyexcel

[easyexcel](https://github.com/alibaba/easyexcel)

easyexcel要去解决的问题

## Excel读写时候内存溢出

虽然POI是目前使用最多的用来做excel解析的框架，但这个框架并不那么完美。大部分使用POI都是使用他的userModel模式。userModel的好处是上手容易使用简单，随便拷贝个代码跑一下，剩下就是写业务转换了，虽然转换也要写上百行代码，相对比较好理解。然而userModel模式最大的问题是在于非常大的内存消耗，一个几兆的文件解析要用掉上百兆的内存。现在很多应用采用这种模式，之所以还正常在跑一定是并发不大，并发上来后一定会OOM或者频繁的full gc。

## 其他开源框架使用复杂

对POI有过深入了解的估计才知道原来POI还有SAX模式。但SAX模式相对比较复杂，excel有03和07两种版本，两个版本数据存储方式截然不同，sax解析方式也各不一样。想要了解清楚这两种解析方式，才去写代码测试，估计两天时间是需要的。再加上即使解析完，要转换到自己业务模型还要很多繁琐的代码。总体下来感觉至少需要三天，由于代码复杂，后续维护成本巨大。

## 其他开源框架存在一些BUG修复不及时

由于我们的系统大多数都是大并发的情况下运行的，在大并发情况下，我们会发现poi存在一些bug,如果让POI团队修复估计遥遥无期了。所以我们在easyexcel对这些bug做了规避。
如下一段报错就是在大并发情况下poi抛的一个异常。

```
Caused by: java.io.IOException: Could not create temporary directory '/home/admin/dio2o/.default/temp/poifiles'
        at org.apache.poi.util.DefaultTempFileCreationStrategy.createTempDirectory(DefaultTempFileCreationStrategy.java:93) ~[poi-3.15.jar:3.15]
        at org.apache.poi.util.DefaultTempFileCreationStrategy.createPOIFilesDirectory(DefaultTempFileCreationStrategy.java:82) ~[poi-3.15.jar:3.15]
```

报错地方poi源码如下

```
    private void createTempDirectory(File directory) throws IOException {
        if (!(directory.exists() || directory.mkdirs()) || !directory.isDirectory()) {
            throw new IOException("Could not create temporary directory '" + directory + "'");
        }
    }
```
仔细看代码容易明白如果在并发情况下，如果2个线程同时判断directory.exists()都 为false,但执行directory.mkdirs()如果一些线程优先执行完，另外一个线程就会返回false。最终 throw new IOException("Could not create temporary directory '" + directory + "'")。针对这个问题easyexcel在写文件时候首先创建了该临时目录，避免poi在并发创建时候引起不该有的报错。

## Excel格式分析格式分析

- xls是Microsoft Excel2007前excel的文件存储格式，实现原理是基于微软的ole db是微软com组件的一种实现，本质上也是一个微型数据库，由于微软的东西很多不开源，另外也已经被淘汰，了解它的细节意义不大，底层的编程都是基于微软的com组件去开发的。

- xlsx是Microsoft Excel2007后excel的文件存储格式，实现是基于openXml和zip技术。这种存储简单，安全传输方便，同时处理数据也变的简单。

- csv 我们可以理解为纯文本文件，可以被excel打开。他的格式非常简单，解析起来和解析文本文件一样。

## 核心原理

写有大量数据的xlsx文件时，POI为我们提供了SXSSFWorkBook类来处理，这个类的处理机制是当内存中的数据条数达到一个极限数量的时候就flush这部分数据，再依次处理余下的数据，这个在大多数场景能够满足需求。
读有大量数据的文件时，使用WorkBook处理就不行了，因为POI对文件是先将文件中的cell读入内存，生成一个树的结构（针对Excel中的每个sheet，使用TreeMap存储sheet中的行）。如果数据量比较大，则同样会产生java.lang.OutOfMemoryError: Java heap space错误。POI官方推荐使用“XSSF and SAX（event API）”方式来解决。
分析清楚POI后要解决OOM有3个关键。

### 1、文件解压文件读取通过文件形式

![屏幕快照 2018-01-22 上午8.52.08.png](http://ata2-img.cn-hangzhou.img-pub.aliyun-inc.com/e3a3500014c95f7118d8c200a51acab4.png)

### 2、避免将全部全部数据一次加载到内存

采用sax模式一行一行解析，并将一行的解析结果以观察者的模式通知处理。
![基础模板1 (2).png](http://ata2-img.cn-hangzhou.img-pub.aliyun-inc.com/82bb195ac62532963b2364d2e4da23e5.png)

### 3、抛弃不重要的数据

Excel解析时候会包含样式，字体，宽度等数据，但这些数据是我们不关系的，如果将这部分数据抛弃可以大大降低内存使用。Excel中数据如下Style占了相当大的空间。

## easypoi

[easypoi](http://easypoi.mydoc.io/)

- 博客说明

[easyexcel解决POI解析Excel出现OOM](https://blog.csdn.net/weixin_36174683/article/details/81161712)

# 参考资料

[.xls和.xlsx的区别？.xlsx Excel文件怎么转换成.xls文件](https://blog.csdn.net/linshichen/article/details/52753990)

[两种格式的区别](https://www.excel-exercise.com/xls-xlsx-file/)

[EXCEL文件格式类型：XLS、XLSX、XLSB、XLSM、XLST](http://mtoou.info/excel-lijie/index.html)


* any list
{:toc}