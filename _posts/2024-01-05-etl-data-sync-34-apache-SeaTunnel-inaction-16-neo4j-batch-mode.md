---
layout: post
title: ETL-34-apache SeaTunnel 实战 16-mysql 到 neo4j 实战批量模式
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 现象

希望实现 mysql 到 neo4j 的批量模式.

版本 v2.3.4

# 配置文件

```conf
env {
  execution.parallelism = 1
}

source {
  # 使用 MySQL 作为数据源
  Jdbc {
    url = "jdbc:mysql://localhost:3306/your_database"
    user = "your_username"
    password = "your_password"
    # 可以通过 query 自定义 SQL 查询语句（可选）
    query = "SELECT id, name, age FROM your_table WHERE age > 18"
    fetch_size = 500  # 每次拉取的大小
  }
}

transform {
}

sink {
  # 使用 Neo4j 作为目标数据存储
  Neo4j {
    # Neo4j Bolt URL
    uri = "bolt://localhost:7687"
    user = "neo4j"
    password = "neo4j_password"
    write_mode = "Batch"  # 指定批量模式
    max_batch_size = 100 # 批量处理大小
    # 节点定义，指定数据如何映射为图形中的节点
    query = "UNWIND $batch AS event MERGE (n:User {id: event.user_id}) SET n.name = event.username, n.age = event.user_age"
  }
}
```

注意：这里的 `$batch` 才是默认值。

# 如何过滤空置

有时候会发现 比如 event.user_id 为空，会导致 neo4j 直接匹配报错。

如何解决？

```sql
UNWIND $batch AS event with event where event.user_id IS NOT NULL MERGE (n:User {id: event.user_id}) SET n.name = event.username, n.age = event.user_age
```

# 参考资料

https://seatunnel.apache.org/docs/2.3.4/connector-v2/sink/Neo4j

* any list
{:toc}