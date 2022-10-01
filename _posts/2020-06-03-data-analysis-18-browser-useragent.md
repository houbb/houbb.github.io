---
layout: post
title: 数据分析-18-浏览器请求头 useragent 信息解析
date:  2020-6-3 13:34:28 +0800
categories: [Data]
tags: [data, data-analysis, monitor, apm, sh]
published: true
---


# userAgent 

一个浏览器的请求头信息如下：

```
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36
```

这个请求头中包含哪些信息呢？

# Http Header 之 User-Agent

User Agent中文名为用户代理，是Http协议中的一部分，属于头域的组成部分，User Agent也简称UA。

它是一个特殊字符串头，是一种向访问网站提供你所使用的浏览器类型及版本、操作系统及版本、浏览器内核、等信息的标识。

通过这个标识，用户所访问的网站可以显示不同的排版从而为用户提供更好的体验或者进行信息统计；例如用手机访问谷歌和电脑访问是不一样的，这些是谷歌根据访问者的UA来判断的。UA可以进行伪装。

浏览器的UA字串的标准格式：浏览器标识 (操作系统标识; 加密等级标识; 浏览器语言) 渲染引擎标识版本信息。但各个浏览器有所不同。

# 字串说明：

## 1、浏览器标识

出于兼容及推广等目的，很多浏览器的标识相同，因此浏览器标识并不能说明浏览器的真实版本，真实版本信息在 UA 字串尾部可以找到。


## 2、操作系统标识

![操作系统标识](https://img-blog.csdn.net/20171224214554551?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMjE5NTIxNA==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

## 3、加密等级标识

```
N: 表示无安全加密
I: 表示弱安全加密
U: 表示强安全加密
```

## 4、浏览器语言

在首选项 > 常规 > 语言中指定的语言

## 5、渲染引擎

显示浏览器使用的主流渲染引擎有：Gecko、WebKit、KHTML、Presto、Trident、Tasman等，格式为：渲染引擎/版本信息

## 6、版本信息

显示浏览器的真实版本信息，格式为：浏览器/版本信息

注：

1、在广告定向设定中，浏览器定向和操作系统定向均是针对User-Agent中的信息进行定向。

2、欲了解更多的User-Agent信息，请参考User-agent 字串史

# java 解析

## yauaa 开源库

这是一个 java 库，它尝试解析和分析 useragent 字符串（以及可用的 User-Agent 客户端提示）并提取尽可能多的相关属性。

与 Java、Scala、Kotlin 一起工作，并为多个处理系统提供现成的 UDF。

完整的文档可以在这里找到 https://yauaa.basjes.nl


## maven 引入

```xml
<dependency>
    <groupId>nl.basjes.parse.useragent</groupId>
    <artifactId>yauaa</artifactId>
    <version>7.6.0</version>
</dependency>
```

## 使用

```java
public static void main(String[] args) {
        String info = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36";

        UserAgentAnalyzer uaa = UserAgentAnalyzer
                .newBuilder()
                .hideMatcherLoadStats()
                .withCache(10000)
                .build();

        UserAgent agent = uaa.parse("Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11");

        for (String fieldName: agent.getAvailableFieldNamesSorted()) {
            System.out.println(fieldName + " = " + agent.getValue(fieldName));
        }
    }
```

ps: 发现这个工具包太重了。



# 参考资料

[【总结】浏览器 User-Agent 大全](https://blog.csdn.net/u012195214/article/details/78889602)

http://www.qb5200.com/article/299608.html

https://wenku.baidu.com/view/fe305bfdd25abe23482fb4daa58da0116c171f84.html

https://www.xp.cn/b.php/112596.html

https://baijiahao.baidu.com/s?id=1695943965001485777&wfr=spider&for=pc

https://www.gxlcms.com/JavaScript-241420.html

https://www.cnblogs.com/fanqshun/p/15963453.html

https://www.99xq.cn/open-source/153.html

https://www.cnblogs.com/lovebing/p/10942796.html

https://max.book118.com/html/2021/0701/8017061074003115.shtm

https://blog.51cto.com/rongfengliang/3119110

[java解析userAgent中的所有信息](http://www.nz998.com/java/103059.html)

[java解析useragent](https://blog.csdn.net/qq_29329981/article/details/89669565)

* any list
{:toc}