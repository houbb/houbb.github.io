---
layout: post
title: cat monitor 分布式监控 CAT-是什么？
date: 2023-09-19 21:01:55 +0800
categories: [Monitor]
tags: [monitor, sh]
published: true
---


# 概览

本文概要：

1、CAT监控系统是什么。

2、CAT监控系统能做什么，能监控些什么。

下面有些截图是CAT 2.0版本的，但和3.0版本没什么区别的。

# 一、 简介

![架构](https://img-blog.csdnimg.cn/20190603204241246.png)

CAT（Central Application Tracking）是美团开源的基于Java开发的实时分布式应用监控平台，提供了全面的监控服务和业务决策支持。

CAT监控系统的定位：

cat本质上一个实时监控系统，主要体现在监控报表Transaction、event、problem、heartbeat等，cat系统定制的监控模型以及定制的实时分析报表也是cat系统核心优势。

logview是cat原始的log采集方式，cat的logview使用的技术是threadlocal，将一个thread里面的打点聚合上报，有一点弱化版本的链路功能，但是cat并不是一个标准的全链路系统，全链路系统参考dapper的论文，业内比较知名的鹰眼，zipkin等，其实经常拿cat和这类系统进行比较其实是不合适的。

cat的logview在异步线程等等一些场景下，其实不合适，cat本身模型并不适合这个。在美团点评内部，有mtrace专门做全链路分析。

也就是说：CAT定义了一个基本的监控模型，可以用来实时监控，至于要监控些什么可以自己定义，比如要做分布式全链路跟踪监控，可以自己埋点获取监控信息；

怎么埋点也是有参考方案的，下篇博文将会介绍本人重新封装的客户端埋点SDK。

另外，CAT倾向于指标、链路事件监控，不太适用于大量业务日志的场景，因为无法搜索、分析，CAT只看看到最新的样本数据和出问题的数据。

大量业务日志的场景应该用ELK。

github：https://github.com/dianping/cat

官方DOME：http://unidal.org/cat/r/t?ip=All&queryname=&domain=cat

# 二、系统/应用状态监控

接入CAT客户端后，CAT客户端每分钟发送一次自身的状态信息。

状态信息包括：服务器系统信息、JVM 内存/GC信息、线程信息、CAT监控使用信息等。

详情如下图：

![详情](https://img-blog.csdnimg.cn/20190603204459753.png)

状态信息的原始数据可以查看“Transaction“中的System类型信息，如下图：

![GC](https://img-blog.csdnimg.cn/20190603204626813.png)

![异常](https://img-blog.csdnimg.cn/20190603204720731.png)

“Heartbeat”实时报表用来展示状态信息，可以看到当前项目下所有的部署机器（支付中心只有一台服务器），如下图：

![心跳](https://img-blog.csdnimg.cn/20190603204749145.png)

配置说明：这个功能无需其他配置，接入就自动上传状态监控信息。

# 三、程序代码运行情况监控

监控一段代码运行情况：运行时间统计、次数、错误次数等等。

如下图：

![程序代码运行情况监控](https://img-blog.csdnimg.cn/20190603204835595.png)

上面图一展示的是请求过程中监控的不同代码段类型的执行情况，不同类型表示范围不一样；图二展示方法类型里各方法的执行情况。

一次请求过程原始监控数据如下（注意类型和上面图一对应）：

![调用链路](https://img-blog.csdnimg.cn/20190603204928764.png)

下面对图中报表进行解释：

a）Type统计界面

![Type统计界面](https://img-blog.csdnimg.cn/20190603204959255.png)

b）Name统计界面

![Name统计界面](https://img-blog.csdnimg.cn/20190603205016456.png)

c）一个小时内详细指标统计

1. Duration Distribution表示transaction的执行时间分布，这个图可以看出，大部分shopcheckin是在16-64毫秒完成，还有很少部分在512-1024毫秒完成。

2. HitOverTime、Averager Duration Over Time,Failures Over Time 纵轴都是以5分钟为单位，HitOverTime表示5分钟内的访问次数。

3. Averager Duration Over Time表示5分钟内的平均处理时间。

4. Failures Over Time表示5分钟内的Transaction失败次数。

![一个小时内详细指标统计](https://img-blog.csdnimg.cn/20190603205041791.png)

配置说明：代码监控需要相关埋点配置，如方法监控可用包路径、或用@CatMethodMonitori注解配置，更多配置详情请参考《项目接入说明》。

# 四、全链路监控分析

上面我们也看到了一次请求过程的原始监控信息，包括URL、METHOD的耗时、参数、返回值等，如下：

![全链路监控分析](https://img-blog.csdnimg.cn/20190603205016456.png)

其中经历了一次跨服务调用service-ribbon à service-hi（注意：跨服务是图中第二个红框到第三个红框，而第一个红框到第二个红框是穿透Hystrix熔断器异步线程的），耗时图形分析如下：

![信息](https://img-blog.csdnimg.cn/20190603205142179.png)

“Cross”报表展示了跨服务调用的情况，如下图：

![跨服务](https://img-blog.csdnimg.cn/20190603205308685.png)

相关配置：默认开启，暂时支持该功能的通信组件：Spring Cloud Ribbon、Spring Cloud Feign（不兼容Sleuth）、Dubbo RPC，更多详情请参考《项目接入说明》。

# 五、异常/错误等问题监控

Problem 记录整个项目在运行过程中出现的问题，包括一些错误、访问较长的行为。

Problem的类型如下：

![类型](https://img-blog.csdnimg.cn/20190603205335190.png)

## 1、“Problem”实时报表介绍

![实时报表介绍](https://img-blog.csdnimg.cn/20190603205401693.png)

All的错误界面

![All的错误界面](https://img-blog.csdnimg.cn/20190603205421995.png)

错误一个小时内的实时趋势图

![实时趋势图](https://img-blog.csdnimg.cn/20190603205443409.png)

点击机器IP，进入某一台机器出现的具体问题，这个包括了All中出现的所有错误统计之外，还增加了以分钟和线程为单位的错误分布图，具体如下：

![分布图](https://img-blog.csdnimg.cn/20190603205522716.png)

## 2、“Problem” 历史报表介绍

1）在选择了特定的域、报表类型、时间和IP之后，点击[:: show ::] 查看某一Type下的Problem出现次数的分布图。(当前这一天、上一天、上周这一天)

![历史报表介绍](https://img-blog.csdnimg.cn/20190603205544720.png)

2）进一步，可以查看该Type下，某个Status的Problem出现次数的分布图。(当前这一天、上一天、上周这一天)

![分布图](https://img-blog.csdnimg.cn/2019060320560921.png)

相关配置：URL、方法监控会自动记录异常名称，如果需要集成日志框架（log4j、logback）打印上传错误信息，请参考《项目接入说明》。

# 六、SQL执行监控

SQL执行监控可以看到每个DAO方法执行解析的SQL语句、SQL语句执行时长、以及连接到哪个数据库（URL）执行；如果SQL执行出现异常，还会记录异常信息；另外还可以过滤出慢SQL。

SQL监控执行整体情况如下：

![SQL监控执行](https://img-blog.csdnimg.cn/2019060320583550.png)

各DAO方法监控如下：

![DAO](https://img-blog.csdnimg.cn/2019060320585295.png)

测试一个方法里执行CURD的“Log View”信息如下：

![log view](https://img-blog.csdnimg.cn/20190603205916966.png)

SQL类型（insert/select/update/delete）执行情况的统计如下：

![sql type](https://img-blog.csdnimg.cn/20190603205942233.png)

每个数据库执行情况的统计如下：

![每个数据库执行情况](https://img-blog.csdnimg.cn/20190603210000935.png)

另外，还可以在“Problem”标签页面过滤出慢SQL，如下图：

![slow sql](https://img-blog.csdnimg.cn/20190603210026730.png)

相关配置：支持Mybatis的SQL监控，需要配置Mybatis监控插件，请参考《项目接入说明》。

# 七、自定义监控/业务监控

上面介绍这些功能主要是gc-cat-client SDK中实现的，稍微配置一下就可以使用。

除此外，还有可以自定义监控以实现业务监控，CAT客户端本身提供了几种监控类型的API， CAT支持的监控消息类型包括：

1）、Transaction：适合记录跨越系统边界的程序访问行为,比如远程调用，数据库调用，也适合执行时间较长的业务逻辑监控，Transaction用来记录一段代码的执行时间和次数。
2）、Event：用来记录一件事发生的次数，比如记录系统异常，它和transaction相比缺少了时间的统计，开销比transaction要小。
3）、Heartbeat：表示程序内定期产生的统计信息, 如CPU%, MEM%, 连接池状态, 系统负载等。
4）、Metric：用于记录业务指标、指标可能包含对一个指标记录次数、记录平均值、记录总和，业务指标最低统计粒度为1分钟。

Metric一共有三个API，分别用来记录次数、平均、总和，统一粒度为一分钟：

a). logMetricForCount：用于记录一个指标值出现的次数。

b). logMetricForDuration：用于记录一个指标出现的平均值。

c). logMetricForSum：用于记录一个指标出现的总和。

看到这些类型名称，可知我们前面介绍的这些功能也是基于这几种监控消息类型的API实现的。

一份埋点的样例：

Transaction：用来记录一段程序响应时间；Even：用来记录一行code的执行次数；Metric：用来记录一个业务指标。这些指标都是独立的，可以单独使用，主要看业务场景。

下面的埋点代码里面表示需要记录一个页面的响应时间，并且记录一个代码执行次数，以及记录两个业务指标,所有用了一个Transaction，一个Event，两个Metric。

Transaction的埋点一定要complete，切记放在finally里面。

![Tx](https://img-blog.csdnimg.cn/201906032100480.png)

代码中自定义好业务指标监控后，然后运行测试上传一些监控数据，接着到“业务监控配置”页面（http://192.168.1.52:8888/cat/s/config? op=list）配置大盘显示和告警，然后就可以在“Business”而页面看到相关图表，如下：

![monitor](https://img-blog.csdnimg.cn/20190603210110835.png)

![monitor charts](https://img-blog.csdnimg.cn/20190603210747323.png)

# 八、告警设置

上面业务监控我们也说到业务指标也可以设置告警的，除此外，Transaction/Event/异常/心跳都可以设置告警，如下图所示：

![告警设置](https://img-blog.csdnimg.cn/20190603210142632.png)

URL(/hi)执行次数告警测试：

![alert](https://img-blog.csdnimg.cn/20190603210201765.png)

# 九、其他报表统计

还有一些全局的报表统计，访问地址（比较隐蔽）：http://192.168.1.52:8888/cat/r/overload

如“全局统计异常”报表，看到各个项目的异常情况：

![EX](https://img-blog.csdnimg.cn/20190603210508144.png)

“服务可用排行”报表，看到各服务可用情况：

![服务可用排行](https://img-blog.csdnimg.cn/20190603210533797.png)

“线上容量规划”报表，看到各项目一些资源使用情况：

![线上容量规划](https://img-blog.csdnimg.cn/20190603210614616.png)

# 十、总结

以上总结了本人发现的且认为比较有用的CAT监控功能，基本能满足大部分监控需求，更多功能有待大家挖掘。

另外，下篇博文将会介绍本人重新封装的CAT客户端埋点SDK，欢迎提出建议。

# 参考资料

[CAT分布式监控系统（一）：CAT功能介绍 CAT监控系统是什么、能做什么？](https://blog.csdn.net/tjiyu/article/details/90757319)

* any list
{:toc}