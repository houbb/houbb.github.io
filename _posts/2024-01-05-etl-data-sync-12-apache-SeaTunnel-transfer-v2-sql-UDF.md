---
layout: post
title: ETL-12-apache SeaTunnel Transform v2 SQL UDF
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# SQL UDF transform 插件

## 描述

使用 UDF SPI 来扩展 SQL transform 的函数库。

# UDF API 

```java
package org.apache.seatunnel.transform.sql.zeta;

public interface ZetaUDF {
    /**
     * Function name
     *
     * @return function name
     */
    String functionName();

    /**
     * The type of function result
     *
     * @param argsType input arguments type
     * @return result type
     */
    SeaTunnelDataType<?> resultType(List<SeaTunnelDataType<?>> argsType);

    /**
     * Evaluate
     *
     * @param args input arguments
     * @return result value
     */
    Object evaluate(List<Object> args);
}
```

# SQL UDF transform 插件

## 描述

使用 UDF SPI 扩展 SQL transform 的函数库。

## UDF 实现示例

在 Maven 项目中添加 transform-v2 依赖，并将其作为 provided 作用域:


```xml
<dependency>
    <groupId>org.apache.seatunnel</groupId>
    <artifactId>seatunnel-transforms-v2</artifactId>
    <version>2.3.x</version>
    <scope>provided</scope>
</dependency>

<dependency>
    <groupId>org.apache.seatunnel</groupId>
    <artifactId>seatunnel-api</artifactId>
    <version>2.3.x</version>
    <scope>provided</scope>
</dependency>
```

创建一个实现 ZetaUDF 接口的 Java 类，示例代码如下:


```java
import com.google.auto.service.AutoService;
import org.apache.seatunnel.api.data.SeaTunnelDataType;
import org.apache.seatunnel.api.udf.ZetaUDF;
import org.apache.seatunnel.api.udf.types.BasicType;

import java.util.List;

@AutoService(ZetaUDF.class)
public class ExampleUDF implements ZetaUDF {
    @Override
    public String functionName() {
        return "EXAMPLE";
    }

    @Override
    public SeaTunnelDataType<?> resultType(List<SeaTunnelDataType<?>> argsType) {
        return BasicType.STRING_TYPE;
    }

    @Override
    public Object evaluate(List<Object> args) {
        String arg = (String) args.get(0);
        if (arg == null) return null;
        return "UDF: " + arg;
    }
}
```

打包 UDF 项目并将 JAR 文件复制到路径：`${SEATUNNEL_HOME}/lib`

# 示例：

从源数据中读取的数据表如下：

```
id    name       age
1    Joy Ding   20
2    May Ding   21
3    Kin Dom    24
4    Joy Dom    22
```

我们使用 SQL 查询的 UDF 来转换源数据，如下所示：

```yaml
transform {
  Sql {
    source_table_name = "fake"
    result_table_name = "fake1"
    query = "select id, example(name) as name, age from fake"
  }
}
```

然后，结果表 fake1 中的数据将被更新为：


```
id    name              age
1    UDF: Joy Ding   20
2    UDF: May Ding   21
3    UDF: Kin Dom    24
4    UDF: Joy Dom    22
```



# 参考资料

https://seatunnel.apache.org/docs/2.3.3/transform-v2/sql-udf

* any list
{:toc}