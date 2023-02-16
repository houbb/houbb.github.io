---
layout: post
title: 使用 JVisualVM 分析 dump 文件定位 OOM 实战笔记
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


# Eclipse Memory Analyzer(MAT)

Eclipse Memory Analyzer(MAT)是Eclipse提供的一款用于Heap Dump文件的工具，操作简单明了，下面将详细进行介绍。

## 下载

[https://www.eclipse.org/mat/previousReleases.php](https://www.eclipse.org/mat/previousReleases.php) 下载地址。

## 使用

启动之后打开 File - Open Heap Dump… 菜单，然后选择生成的Heap DUmp文件，选择 “Leak Suspects Report”，然后点击 “Finish” 按钮。


# jvisualvm jvm

后来发现，jhat 执行的特别慢。

MAT 又是各种限制和问题。

发现 jvm 自带的 jvisualvm 还是挺好用的。

## dump 处理时内存

分析dump文件比较大的时候,超过了软件设置的默认的内存大小会报错。

### 解决办法

1.应用程序–本地选择VisualVM–概述–JVM参数。

修改配置文件：`C:\Program Files\Java\jdk1.8.0_192\lib\visualvm\etc\visiaulvm.conf`

修改 jvm 启动的最大参数，重启服务。

## 分析

【文件】-【装入】，选择过滤的文件类型。

找到 dump 文件所在的位置。

加载文件，选择对应的过滤类型。`xxx.hprof`

然后等待加载处理。

## 概要：


PS: 检索不方便，可以全选把内容放在外边。


![异常概要](https://img-blog.csdnimg.cn/81ebfb93c6e947b28ce6de0f131b8007.png)


```
基本信息:
    生成的日期: Tue Feb 14 22:05:09 CST 2023
    文件: D:\data\star-wxpa-web-heapdump.hprof\star-wxpa-web-heapdump.hprof
    文件大小: 3,892.7 MB

    字节总数: 4,237,102,262
    类总数: 27,486
    实例总数: 102,977,924
    类加载器: 639
    垃圾回收根节点: 7,553
    等待结束的暂挂对象数: 32

    在出现 OutOfMemoryError 异常错误时进行了堆转储
    导致 OutOfMemoryError 异常错误的线程: ConsumeMessageThread_Q_STARWXPA_HOLIDAY_WX_10
```

找到这个 oom 的线程，我们点击进入。

内容比较多，那么是哪一个对象占用内存比较大呢？

## 那个对象占用内存大？

个人理解，可以先从【类】这里开始看。

![类的数据量](https://img-blog.csdnimg.cn/c2a118537c7f4ce3a8d78f7bb7bcc9d6.png)

可以发现 byte[] 和 mysql 相关查询的比较大。

## 选择具体的对象分析

根据类中的占用大小，从下面的 `Local Variable` 选择对比即可。

一般是一些 list/array 导致的对象。

日志比较多：

```
"ConsumeMessageThread_Q_STARWXPA_HOLIDAY_WX_10" prio=5 tid=529 RUNNABLE
    at java.lang.OutOfMemoryError.<init>(OutOfMemoryError.java:48)
    at com.mysql.cj.protocol.a.NativePacketPayload.readBytes(NativePacketPayload.java:558)
    at com.mysql.cj.protocol.a.NativePacketPayload.readBytes(NativePacketPayload.java:508)
    at com.mysql.cj.protocol.a.TextRowFactory.createFromMessage(TextRowFactory.java:66)
       Local Variable: com.mysql.cj.protocol.a.NativePacketPayload#5
       Local Variable: byte[][]#1570652
    at com.mysql.cj.protocol.a.TextRowFactory.createFromMessage(TextRowFactory.java:42)
    at com.mysql.cj.protocol.a.ResultsetRowReader.read(ResultsetRowReader.java:87)
    at com.mysql.cj.protocol.a.ResultsetRowReader.read(ResultsetRowReader.java:42)
    at com.mysql.cj.protocol.a.NativeProtocol.read(NativeProtocol.java:1576)
    at com.mysql.cj.protocol.a.TextResultsetReader.read(TextResultsetReader.java:87)
       Local Variable: com.mysql.cj.protocol.a.TextResultsetReader#11
       Local Variable: com.mysql.cj.protocol.a.TextRowFactory#2
       Local Variable: com.mysql.cj.result.DefaultColumnDefinition#57
       Local Variable: java.util.ArrayList#96135
    at com.mysql.cj.protocol.a.TextResultsetReader.read(TextResultsetReader.java:48)
    at com.mysql.cj.protocol.a.NativeProtocol.read(NativeProtocol.java:1589)
    at com.mysql.cj.protocol.a.NativeProtocol.readAllResults(NativeProtocol.java:1643)
       Local Variable: com.mysql.cj.jdbc.result.ResultSetFactory#152
    at com.mysql.cj.protocol.a.NativeProtocol.sendQueryPacket(NativeProtocol.java:951)
       Local Variable: byte[]#38169401
       Local Variable: com.mysql.cj.protocol.a.NativeProtocol#11
       Local Variable: com.mysql.cj.util.LazyString#39
    at com.mysql.cj.NativeSession.execSQL(NativeSession.java:1075)
       Local Variable: com.mysql.cj.protocol.a.NativePacketPayload#34
       Local Variable: com.mysql.cj.NativeSession#11
    at com.mysql.cj.jdbc.ClientPreparedStatement.executeInternal(ClientPreparedStatement.java:930)
    at com.mysql.cj.jdbc.ClientPreparedStatement.execute(ClientPreparedStatement.java:370)
       Local Variable: com.mysql.cj.jdbc.ClientPreparedStatement#141
       Local Variable: com.mysql.cj.jdbc.ConnectionImpl#11
    at com.alibaba.druid.pool.DruidPooledPreparedStatement.execute(DruidPooledPreparedStatement.java:498)
       Local Variable: com.alibaba.druid.pool.DruidPooledPreparedStatement#7
    at sun.reflect.GeneratedMethodAccessor233.invoke(<unknown string>)
    at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
    at java.lang.reflect.Method.invoke(Method.java:498)
    at org.apache.ibatis.logging.jdbc.PreparedStatementLogger.invoke(PreparedStatementLogger.java:59)
    at com.sun.proxy.$Proxy209.execute(<unknown string>)
    at org.apache.ibatis.executor.statement.PreparedStatementHandler.query(PreparedStatementHandler.java:63)
       Local Variable: org.apache.ibatis.executor.statement.PreparedStatementHandler#7
    at org.apache.ibatis.executor.statement.RoutingStatementHandler.query(RoutingStatementHandler.java:79)
    at org.apache.ibatis.executor.SimpleExecutor.doQuery(SimpleExecutor.java:63)
       Local Variable: com.sun.proxy.$Proxy209#7
    at org.apache.ibatis.executor.BaseExecutor.queryFromDatabase(BaseExecutor.java:324)
       Local Variable: org.apache.ibatis.cache.CacheKey#6
    at org.apache.ibatis.executor.BaseExecutor.query(BaseExecutor.java:156)
       Local Variable: org.apache.ibatis.executor.SimpleExecutor#6
    at org.apache.ibatis.executor.CachingExecutor.query(CachingExecutor.java:109)
    at com.github.pagehelper.PageInterceptor.intercept(PageInterceptor.java:143)
       Local Variable: org.apache.ibatis.binding.MapperMethod$ParamMap#5
    at org.apache.ibatis.plugin.Plugin.invoke(Plugin.java:61)
    at com.sun.proxy.$Proxy207.query(<unknown string>)
    at org.apache.ibatis.session.defaults.DefaultSqlSession.selectList(DefaultSqlSession.java:148)
    at org.apache.ibatis.session.defaults.DefaultSqlSession.selectList(DefaultSqlSession.java:141)
    at sun.reflect.GeneratedMethodAccessor202.invoke(<unknown string>)
    at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
    at java.lang.reflect.Method.invoke(Method.java:498)
    at org.mybatis.spring.SqlSessionTemplate$SqlSessionInterceptor.invoke(SqlSessionTemplate.java:433)
       Local Variable: org.apache.ibatis.session.defaults.DefaultSqlSession#6
    at com.sun.proxy.$Proxy97.selectList(<unknown string>)
    at org.mybatis.spring.SqlSessionTemplate.selectList(SqlSessionTemplate.java:230)
    at org.apache.ibatis.binding.MapperMethod.executeForMany(MapperMethod.java:137)
    at org.apache.ibatis.binding.MapperMethod.execute(MapperMethod.java:75)
    at org.apache.ibatis.binding.MapperProxy.invoke(MapperProxy.java:59)
    at com.sun.proxy.$Proxy131.selectList(<unknown string>)
    at com.baomidou.mybatisplus.service.impl.ServiceImpl.selectList(ServiceImpl.java:414)
    at XXXXXXXXX.star.wxpa.web.service.service.impl.WxMerTagInfoServiceImpl.queryTagList(WxMerTagInfoServiceImpl.java:68)
       Local Variable: java.util.ArrayList#96139
       Local Variable: com.baomidou.mybatisplus.mapper.EntityWrapper#6
       Local Variable: java.util.ArrayList#96140
    at sun.reflect.GeneratedMethodAccessor421.invoke(<unknown string>)
       Local Variable: java.lang.Object[]#114312
    at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
    at java.lang.reflect.Method.invoke(Method.java:498)
    at org.springframework.aop.support.AopUtils.invokeJoinpointUsingReflection(AopUtils.java:333)
    at org.springframework.aop.framework.JdkDynamicAopProxy.invoke(JdkDynamicAopProxy.java:207)
    at com.sun.proxy.$Proxy132.queryTagList(<unknown string>)
       Local Variable: java.util.ArrayList#96137
       Local Variable: java.util.ArrayList#96136
       Local Variable: java.util.ArrayList#96138
    at XXXXXXXXX.star.wxpa.web.service.biz.task.WxMerHolidayPushTaskBiz.handlePushTransReport(WxMerHolidayPushTaskBiz.java:151)
       Local Variable: java.lang.String#436709
       Local Variable: XXXXXXXXX.star.wxpa.web.service.bo.wxpa.WxpaHolidayPushMqBo#9
       Local Variable: java.lang.String#436710
       Local Variable: XXXXXXXXX.star.wxpa.web.dal.entity.WxMerPushConfig#9
       Local Variable: java.lang.String#436711
       Local Variable: java.util.ArrayList#96141
    at XXXXXXXXX.star.wxpa.web.service.biz.task.WxMerHolidayPushTaskBiz.consumerMq(WxMerHolidayPushTaskBiz.java:73)
    at XXXXXXXXX.star.wxpa.web.service.mq.archer.ArcherWxHolidayPushCallback.doConsumeMessage(ArcherWxHolidayPushCallback.java:26)
    at XXXXXXXXX.star.wxpa.web.service.mq.archer.ArcherBaseCallback.consumeMessage(ArcherBaseCallback.java:35)
       Local Variable: java.lang.String#436676
    at XXXXXXXXX.archer.consumer.RocketMQArcherConsumer.consumeMessage(RocketMQArcherConsumer.java:312)
       Local Variable: XXXXXXXXX.archer.report.MessageConsumeInfo#29
       Local Variable: XXXXXXXXX.archer.hooks.ConsumeMessageContext#20
       Local Variable: XXXXXXXXX.archer.consumer.MessageEventArgs#20
    at XXXXXXXXX.archer.rocketmq.client.impl.consumer.ConsumeMessageConcurrentlyService$ConsumeRequest.run(ConsumeMessageConcurrentlyService.java:423)
       Local Variable: XXXXXXXXX.archer.rocketmq.client.consumer.listener.ConsumeConcurrentlyContext#20
       Local Variable: XXXXXXXXX.archer.rocketmq.client.impl.consumer.ConsumeMessageConcurrentlyService$ConsumeRequest#3575
    at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:511)
       Local Variable: java.util.concurrent.Executors$RunnableAdapter#3948
    at java.util.concurrent.FutureTask.run(FutureTask.java:266)
    at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
       Local Variable: java.util.concurrent.FutureTask#3582
    at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
       Local Variable: java.util.concurrent.ThreadPoolExecutor$Worker#253
    at java.lang.Thread.run(Thread.java:748)
```


可以点进去具体看对应的引用。

其实这里是因为 mysql 查询的时候全表扫，导致加载的内存特别大。

都是 byte[] 网络传入，转换为 row list。都是特别大的对象。

导致不断晋升，FULL GC。

然后 GC 又释放不掉，直接导致内存 OOM，应用挂掉。

> jvm 对象晋升的方式：存活的周期比较长，超过一定次数，会晋升；或者对象太大，超过了 young 区，则直接进入了老年代。

> GC 的时候，就算是 full-GC，也只是从根节点开始遍历引用。这个大对象太大，还没处理完。导致无法是双方

## 代码原因分析

对于 queryTagList 的入参

使用的是 mybatis-plus。

```sql
wrapper.in("mer_id", merIdList)
```

如果 merIdList 对应的信息为空，会导致 mybatis-plus 把这个条件过滤掉。

从而全表扫，但是对应的表信息又特别大，几千万的数据量全部查出来，直接把内存打爆了。

## 解决方式

（1）查询标签信息的时候，不要返回列表，通过 count 总数替代。

（2）查询的时候一定判空。

如果 merIdList 为空，则直接返回 count = 0;

（3）一些建议

有些同事建议不要使用动态拼接，但是这个属于代码风格。

其实主要是对用法的理解问题。

# 小结

mq 的方式虽然很好，但是会导致服务全部挂掉，也比较危险。

写代码一定要注意，避免全表扫的情况。

# 参考资料

[通过jvisualvm分析内存泄漏](https://blog.csdn.net/dataiyangu/article/details/103833451)

[使用JVisualVM分析dump文件定位OOM](https://blog.csdn.net/xiaowanzi_zj/article/details/122592982)

https://www.jianshu.com/p/94d03049b41e

[下载liunx服务器上的文件到Windows本地、或者上传到服务器的方法](https://blog.csdn.net/unit2006/article/details/125012531)

[免费的 XShell 替代品，我推荐这5款软件，一个比一个香！](https://blog.csdn.net/weixin_44421461/article/details/128432841)

https://www.jb51.net/article/201435.htm

[JVM性能调优监控工具jps、jstack、jmap、jhat、jstat等使用详解](https://www.bbsmax.com/A/QV5ZR8x65y/)

[MAT(Memory Analyzer Tool)工具入门介绍](https://blog.csdn.net/fenglibing/article/details/6298326)

[jhat分析dump文件，报错“java.lang.OutOfMemoryError”问题的解决](https://www.cnblogs.com/chuanzhang053/p/16363311.html)

[jhat dump分析技巧](https://jingyan.baidu.com/article/6766299701051e14d51b84cd.html)

[java内存分析工具 jmap，jhat及dump分析](https://www.jianshu.com/p/1b1c998c4448?utm_campaign=maleskine&utm_content=note&utm_medium=reader_share&utm_source=weixin)

[JVM 故障分析](https://blog.csdn.net/a704397849/article/details/101354226?spm=1001.2101.3001.6650.7&utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EOPENSEARCH%7ERate-7-101354226-blog-108877628.pc_relevant_default&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EOPENSEARCH%7ERate-7-101354226-blog-108877628.pc_relevant_default&utm_relevant_index=14)

* any list
{:toc}