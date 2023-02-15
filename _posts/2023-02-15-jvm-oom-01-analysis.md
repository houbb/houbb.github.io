---
layout: post
title: JVM OOM 内存分析
date:  2023-02-15 +0800
categories: [java]
tags: [java, jvm, sh]
published: true
---

# 现象

生产 oom，分析如何产生的原因。

# dump 文件

## 下载工具

https://github.com/electerm/electerm

## 下载

通过 sz 命令下载。

如果没有下载，那么使用 `yum install lrzsz` 安装。

# 解析 dump 文件

分析dump文件，我们可以用jdk里面提供的jhat工具，执行

```
jhat xxx.dump
```

jhat加载解析xxx.dump文件，并开启一个简易的web服务，默认端口为7000，可以通过浏览器查看内存中的一些统计信息

一般使用方法: 浏览器打开 http:/127.0.0.1:7000

## jhat 解析

到 jdk 的 bin 目录

```
cd C:\Program Files\Java\jdk1.8.0_192\bin

$ jhat D:\data\xxx-heapdump.hprof
```

解析的文件耗时，根据 dump 文件会有差异。需要耐心等待。

### OOM

```
λ jhat -J-mx6g D:\data\star-wxpa-web-heapdump.hprof\star-wxpa-web-heapdump.hprof
Reading from D:\data\star-wxpa-web-heapdump.hprof\star-wxpa-web-heapdump.hprof...
Dump file created Tue Feb 14 22:05:09 CST 2023
Exception in thread "main" java.lang.OutOfMemoryError: Java heap space
        at java.util.Hashtable.rehash(Hashtable.java:402)
        at java.util.Hashtable.addEntry(Hashtable.java:426)
        at java.util.Hashtable.put(Hashtable.java:477)
        at com.sun.tools.hat.internal.model.Snapshot.addHeapObject(Snapshot.java:166)
        at com.sun.tools.hat.internal.parser.HprofReader.readArray(HprofReader.java:824)
        at com.sun.tools.hat.internal.parser.HprofReader.readHeapDump(HprofReader.java:501)
        at com.sun.tools.hat.internal.parser.HprofReader.read(HprofReader.java:275)
        at com.sun.tools.hat.internal.parser.Reader.readFile(Reader.java:92)
        at com.sun.tools.hat.Main.main(Main.java:159)
```

如果执行的时候，OOM。可以加入对应的内存。

可以扩大一下内存。

```
$  jhat -J-Xmx9000m D:\data\star-wxpa-web-heapdump.hprof\star-wxpa-web-heapdump.hprof
```

# 参考资料

https://www.jianshu.com/p/94d03049b41e

[下载liunx服务器上的文件到Windows本地、或者上传到服务器的方法](https://blog.csdn.net/unit2006/article/details/125012531)

[免费的 XShell 替代品，我推荐这5款软件，一个比一个香！](https://blog.csdn.net/weixin_44421461/article/details/128432841)

https://www.jb51.net/article/201435.htm

[JVM性能调优监控工具jps、jstack、jmap、jhat、jstat等使用详解](https://www.bbsmax.com/A/QV5ZR8x65y/)

[MAT(Memory Analyzer Tool)工具入门介绍](https://blog.csdn.net/fenglibing/article/details/6298326)

[jhat分析dump文件，报错“java.lang.OutOfMemoryError”问题的解决](https://www.cnblogs.com/chuanzhang053/p/16363311.html)

[jhat dump分析技巧](https://jingyan.baidu.com/article/6766299701051e14d51b84cd.html)

* any list
{:toc}