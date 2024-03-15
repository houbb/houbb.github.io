---
layout: post
title: 时序数据库-08-vm VictoriaMetrics java 整合
date:  2019-4-1 19:24:57 +0800
categories: [Database]
tags: [database, dis-database, distributed, time-series, monitor, docker, sf]
published: true
---


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