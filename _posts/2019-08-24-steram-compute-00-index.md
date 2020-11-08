---
layout: post
title: 流式计算-overview-00
date:  2019-5-10 11:08:59 +0800
categories: [Stream]
tags: [stream, overview, sh]
published: true
---

# NoSQL 与 流式计算

虽然业务量的增加，转筒的 ALTP 主键无法支撑这么大的业务量与实时性。

# NoSQL

Redis

Mongo

[InfluxData-分布式时序数据库](https://houbb.github.io/2019/04/01/database-influxdb)

[Opentsdb-分布式时序数据库](https://houbb.github.io/2019/04/01/database-opentsdb)

[图数据库-Neo4j](https://houbb.github.io/2018/01/08/neo4j)

感觉这些 DBA 更加擅长，我更加关心背后的思想和对于业务的帮助。

# 相关框架 

## MQ

[Apache Kafka](https://houbb.github.io/2017/08/09/apacke-kafka-01-overview-01) 

[apache-pulsar](https://houbb.github.io/2018/11/12/apache-pulsar) 

## 流式计算

[Apache Spark](https://houbb.github.io/2017/08/09/apacke-spark)

- 新生代

[Storm](https://houbb.github.io/2019/05/10/steram-compute-01-strom) 

[Jstrom](https://houbb.github.io/2019/05/10/steram-compute-02-jstrom)   

[Trident-strom 基础之上开发](https://houbb.github.io/2019/05/10/steram-compute-06-storm-trident)

[Twitter Heron-第二代流式计算](https://houbb.github.io/2019/05/10/steram-compute-03-heron)  

[Apache Flink](https://houbb.github.io/2018/11/28/apache-flink) 

[Ali Blink-Flink 的改造](https://houbb.github.io/2019/05/10/steram-compute-05-blink) 

# 其他框架

1. S4 Distributed Stream Computing Platform.?http://incubator.apache.org/s4/

2. Spark Streaming. https://spark.apache.org/streaming/?

3. Apache Samza. http://samza.incubator.apache.org

4. Tyler Akidau, Alex Balikov, Kaya Bekiroglu, Slava Chernyak, Josh?Haberman, Reuven Lax, Sam McVeety, Daniel Mills, Paul?Nordstrom, Sam Whittle: MillWheel: Fault-Tolerant Stream?Processing at Internet Scale.?PVLDB 6(11): 1033-1044 (2013)
5.?Mohamed H. Ali, Badrish Chandramouli, Jonathan Goldstein,Roman Schindlauer: The Extensibility Framework in Microsoft?StreamInsight.?ICDE?2011: 1242-1253

6. Rajagopal Ananthanarayanan, Venkatesh Basker, Sumit Das, Ashish?Gupta, Haifeng Jiang, Tianhao Qiu, Alexey Reznichenko, Deomid?Ryabkov, Manpreet Singh, Shivakumar Venkataraman: Photon:?Fault-tolerant and Scalable Joining of Continuous Data Streams.?SIGMOD?2013: 577-588

7. DataTorrent.?https://www.datatorrent.com

8. Simon Loesing, Martin Hentschel, Tim Kraska, Donald Kossmann:?Stormy: An Elastic and Highly Available Streaming Service in the?Cloud. EDBT/ICDT Workshops 2012: 55-60

# 参考资料

[深度解析 Twitter Heron 大数据实时分析系统](https://blog.csdn.net/ldds_520/article/details/51891377)

* any list
{:toc}