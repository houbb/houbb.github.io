---
layout: post
title: ETL-33-apache SeaTunnel 实战 12 自定义 transform 转换插件
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 模块整体目录

seatunnel-transforms-v2 转换模块整体目录如下：

```
├─src
│  ├─main
│  │  └─java
│  │      └─org
│  │          └─apache
│  │              └─seatunnel
│  │                  └─transform
│  │                      ├─common
│  │                      ├─contains
│  │                      ├─copy
│  │                      ├─exception
│  │                      ├─fieldmapper
│  │                      ├─filter
│  │                      ├─filterrowkind
│  │                      ├─replace
│  │                      ├─split
│  │                      └─sql
│  │                          └─zeta
│  │                              └─functions
│  │                                  └─udf
```


# 自定义插件 Contains

## 介绍

插件说明：可以指定一个字段，比如包含指定的字符串，才会到 sink。

应用场景：比如我们有时候监听 Kafka，只关心包含 Exception 的字段进行处理。

## 实现类

整体如下：

```
Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----                                                                                         
-a----         2024/1/31     10:16           3815 ContainsTransform.java
-a----         2024/1/31      9:47           1606 ContainsTransformConfig.java
-a----         2024/1/31      9:52           1976 ContainsTransformFactory.java
```

直接模仿 FilterRowKindTransform 编写。

## 源码

### ContainsTransform

```java
package org.apache.seatunnel.transform.contains;

import com.google.auto.service.AutoService;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.api.configuration.ReadonlyConfig;
import org.apache.seatunnel.api.configuration.util.ConfigValidator;
import org.apache.seatunnel.api.table.catalog.CatalogTable;
import org.apache.seatunnel.api.table.type.SeaTunnelRow;
import org.apache.seatunnel.api.transform.SeaTunnelTransform;
import org.apache.seatunnel.common.exception.CommonErrorCode;
import org.apache.seatunnel.common.exception.SeaTunnelRuntimeException;
import org.apache.seatunnel.shade.com.typesafe.config.Config;
import org.apache.seatunnel.transform.common.FilterRowTransform;

@Slf4j
@AutoService(SeaTunnelTransform.class)
@NoArgsConstructor
public class ContainsTransform extends FilterRowTransform {
    public static String PLUGIN_NAME = "Contains";

    private Integer fieldPos = null;
    private String containsValue = null;

    public ContainsTransform(
            @NonNull ReadonlyConfig config, @NonNull CatalogTable inputCatalogTable) {
        super(inputCatalogTable);
        initConfig(config);
    }

    @Override
    public String getPluginName() {
        return PLUGIN_NAME;
    }

    private void initConfig(ReadonlyConfig config) {
        this.fieldPos = config.get(ContainsTransformConfig.KEY_FIELD_POS);
        this.containsValue = config.get(ContainsTransformConfig.KEY_CONTAINS_VALUE);

        if (fieldPos== null
                || StringUtils.isEmpty(containsValue)) {
            throw new SeaTunnelRuntimeException(
                    CommonErrorCode.ILLEGAL_ARGUMENT,
                    String.format(
                            "These options(%s,%s) must be config.",
                            ContainsTransformConfig.KEY_FIELD_POS.key(),
                            ContainsTransformConfig.KEY_CONTAINS_VALUE.key()));
        }
    }

    @Override
    protected void setConfig(Config pluginConfig) {
        ConfigValidator.of(ReadonlyConfig.fromConfig(pluginConfig))
                .validate(new ContainsTransformFactory().optionRule());
        initConfig(ReadonlyConfig.fromConfig(pluginConfig));
    }

    @Override
    protected SeaTunnelRow transformRow(SeaTunnelRow inputRow) {
        if(inputRow == null) {
            return null;
        }

        // 不满足，直接返回 null
        Object value = inputRow.getField(fieldPos);
        log.info("[ContainsTransfer] value of fieldPos={} is {}, return", fieldPos, value);

        if(value == null) {
            return null;
        }

        String fieldValueString = value.toString();
        if(fieldValueString.contains(containsValue)) {
            return inputRow;
        } else {
            log.info("[ContainsTransfer] value of fieldPos={} is {}, not match contains={}, ignore", fieldPos, fieldValueString, containsValue);
            return null;
        }
    }
}
```

其他的部分，只是针对 fieldPos 和 containsValue 的配置获取处理。

# 测试

## 数据库准备

```sql
mysql> select * from user_info;
+----+----------+---------------------+---------------------+
| id | username | create_time         | update_time         |
+----+----------+---------------------+---------------------+
|  1 | u1       | 2024-01-29 15:31:03 | 2024-01-29 15:31:03 |
|  2 | u2       | 2024-01-29 15:31:03 | 2024-01-29 15:31:03 |
|  3 | u3       | 2024-01-29 15:31:03 | 2024-01-29 15:31:03 |
|  4 | u4       | 2024-01-29 15:31:03 | 2024-01-29 15:31:03 |
+----+----------+---------------------+---------------------+
```

user_info 表中存在的数据，只是为了测试。

fieldPos = 1，对应的字段实际就是 username。

containsValue = "u3"，则只处理 username.contains("u3") 的数据到 sink

## 配置文件

```
# Defining the runtime environment
env {
  # You can set flink configuration here
  parallelism = 1
  job.mode = "STREAMING"
  checkpoint.interval = 10000
}
source{
    MySQL-CDC {
        base-url = "jdbc:mysql://localhost:3306/migrate_source?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.cj.jdbc.Driver"
        username = "admin"
        password = "123456"
        table-names = ["migrate_source.user_info"]

        startup.mode = "initial"
    }
}

transform {
    Contains {
        fieldPos = 1
        containsValue = "u3"
    }
}

sink {
    ConsoleBinlog {
    }

}
```

## 测试效果

最后的 console 只有 1 条记录：

```
2024-01-31 10:14:04.122 ~~~~~~~~~~~~ SeaTunnelRow{tableId=migrate_source.user_info, kind=+I, fields=[3, u3, 2024-01-29T15:31:03, 2024-01-29T15:31:03]}
```

# 参考资料

https://github.com/apache/seatunnel/issues/5555

[[Bug] [Zeta Engine] the checkpoint lock cause checkpoint-flow blocking with long time](https://github.com/apache/seatunnel/issues/5694)

* any list
{:toc}