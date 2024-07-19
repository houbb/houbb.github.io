---
layout: post
title: 时序数据库-06-03-vm VictoriaMetrics java 整合
date:  2019-4-1 19:24:57 +0800
categories: [Database]
tags: [database, dis-database, distributed, time-series, monitor, docker, sf]
published: true
---

# 时序数据库系列

[时序数据库-01-时序数据库有哪些？为什么要使用](https://houbb.github.io/2019/04/01/database-time-seriers-01-overview)

[时序数据库-02-聊一聊时序数据库](https://houbb.github.io/2019/04/01/database-time-seriers-02-chat)

[时序数据库-03-opentsdb-分布式时序数据库](https://houbb.github.io/2019/04/01/database-time-seriers-03-opentsdb)

[时序数据库-04-InfluxData-分布式时序数据库](https://houbb.github.io/2019/04/01/database-time-seriers-04-influxdb)

[时序数据库-05-TDengine 是一款开源、高性能、云原生的时序数据库 (Time-Series Database, TSDB)](https://houbb.github.io/2019/04/01/database-time-seriers-05-00-tdengine-overview)

[时序数据库-05-TDengine Time-Series Database, TSDB](https://houbb.github.io/2019/04/01/database-time-seriers-05-01-tdengine-chat)

[时序数据库-05-TDengine windows11 WSL 安装实战笔记 docker](https://houbb.github.io/2019/04/01/database-time-seriers-05-02-windows-wls-install)

[时序数据库-06-01-vm VictoriaMetrics 快速、经济高效的监控解决方案和时间序列数据库](https://houbb.github.io/2019/04/01/database-time-seriers-06-01-vm-intro)

[时序数据库-06-02-vm VictoriaMetrics install on docker 安装 vm](https://houbb.github.io/2019/04/01/database-time-seriers-06-02-vm-install-docker)

[时序数据库-06-03-vm VictoriaMetrics java 整合](https://houbb.github.io/2019/04/01/database-time-seriers-06-03-vm-java-integration)

[时序数据库-06-04-vm VictoriaMetrics storage 存储原理简介](https://houbb.github.io/2019/04/01/database-time-seriers-06-04-vm-storage)

[时序数据库-06-05-vm VictoriaMetrics cluster 集群原理](https://houbb.github.io/2019/04/01/database-time-seriers-06-05-vm-cluster)

[时序数据库-06-06-vm VictoriaMetrics cluster 集群访问方式](https://houbb.github.io/2019/04/01/database-time-seriers-06-06-vm-cluster-access)


# http 方式

这种方式比较轻量，直接基于 http 的访问协议进行处理。

# client 包

## maven 

```xml
<dependency>
    <groupId>com.influxdb</groupId>
    <artifactId>influxdb-client-java</artifactId>
    <version>2.0.0</version>
</dependency>
```

为什么是 influxdb？二者什么关系?

## java 例子

```java
import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.InfluxDBClientFactory;
import com.influxdb.client.WriteApi;
import com.influxdb.client.domain.WritePrecision;
import com.influxdb.client.write.Point;
import java.time.Instant;

public class Write2VM {

    public static void main(String[] args) {
        String bucket = "flink";
        String org = "galaxy";
        InfluxDBClient client = InfluxDBClientFactory.create("http://localhost:8428");
        Point point = Point
                .measurement("mem")
                .addTag("vm", "pointWay")
                .addField("used_percent", 66)
                .time(Instant.now(), WritePrecision.NS);
        try (WriteApi writeApi = client.getWriteApi()) {
            writeApi.writePoint(bucket, org, point);
        }
    }
    
}
```

## 查询

在grafana中查看数据点

命令行查询

```sh
curl -G 'http://localhost:8428/api/v1/export' -d 'match={__name__=~"mem_used_percent.*"}'
```

结果：

```json
{"metric":{"__name__":"mem_used_percent","vm":"pointWay"},"values":[66,88],"timestamps":[1634307675617,1634308728583]}
```

命令行curl写入数据到vm

# 参考资料

https://blog.csdn.net/ggaofengg/article/details/129344212

* any list
{:toc}