---
layout: post
title:  Neo4j-04-图数据库 neo4j java 整合
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j]
published: true
---


# 默认密码


登录：http://localhost:7474/browser/

修改密码，可以设置为 neo4j/neo4j

![在这里插入图片描述](https://img-blog.csdnimg.cn/4caa54cdff8e4fe4bcd7143e83a4bcef.png#pic_center)


## 新建一个数据库

默认的好像不行。

可以直接重新创建一个 DBMS 库，然后指定对应的密码为 12345678。

# 初始化密码

## 查看

通过 neo4j browser

```
$   SHOW USERS

╒═══════╤═══════════════════╤══════════════════════╤═════════╤════╕
│user   │roles              │passwordChangeRequired│suspended│home│
╞═══════╪═══════════════════╪══════════════════════╪═════════╪════╡
│"neo4j"│["admin", "PUBLIC"]│false                 │false    │null│
└───────┴───────────────────┴──────────────────────┴─────────┴────┘
```


## 初始化测试数据

插入一个 Person 类别的节点，且这个节点有一个属性 name，属性值为 `Node A`。另一个节点 Node B。

```
CREATE (a:Person { name : 'Node A'});
CREATE (b:Person { name : 'Node B'});
```


执行查询

```
$   MATCH (n) return n;
```

结果：

```
╒══════════════════════════╕
│n                         │
╞══════════════════════════╡
│(:Person {name: "Node A"})│
├──────────────────────────┤
│(:Person {name: "Node B"})│
└──────────────────────────┘
```

# Java Integration

## maven 引入

```xml
<dependency>
    <groupId>org.neo4j.driver</groupId>
    <artifactId>neo4j-java-driver</artifactId>
    <version>4.0.0</version> <!-- 替换为最新版本号 -->
</dependency>
```

## 测试代码

```java
package org.example;

import org.neo4j.driver.*;

public class Main {

    public static void main(String[] args) {
        String uri = "bolt://localhost:7687"; // Neo4j数据库的URI
        String username = "neo4j";
        String password = "12345678";

        try (Driver driver = GraphDatabase.driver(uri, AuthTokens.basic(username, password));
             Session session = driver.session()) {

            // 执行Cypher查询
            String cypherQuery = "MATCH (n) RETURN n LIMIT 10";
            Result result = session.run(cypherQuery);

            // 处理查询结果
            while (result.hasNext()) {
                Record record = result.next();
                // 处理每个记录...
                System.out.println(record);
            }
        } catch (Exception e) {
            // 处理异常...
            e.printStackTrace();
        }
    }
    
}
```

## 日志

```
十月 21, 2023 3:28:28 下午 org.neo4j.driver.internal.logging.JULogger info
信息: Direct driver instance 167185492 created for server address localhost:7687
Record<{n: node<0>}>
Record<{n: node<1>}>
十月 21, 2023 3:28:29 下午 org.neo4j.driver.internal.logging.JULogger info
信息: Closing driver instance 167185492
十月 21, 2023 3:28:29 下午 org.neo4j.driver.internal.logging.JULogger info
信息: Closing connection pool towards localhost:7687
```

Record 两行已经输出。

# 小结

这只是一个简单的 java 直连代码，相信 spring 整合等常见的整合一定可以。后续有时间继续整理。

# 参考资料

https://www.cnblogs.com/liaozk/p/17138133.html

[Java 与 Neo4j 不得不说的故事](https://neo4j.com/developer/java/)

https://blog.csdn.net/weixin_44673217/article/details/125149017

https://blog.51cto.com/u_16213367/7336746

[w3c](https://www.w3cschool.cn/neo4j/neo4j_native_java_api_example.html)

[【neo4j忘记密码】neo4j忘记密码的处理方法](https://blog.csdn.net/buyanfy/article/details/127525341)

* any list
{:toc}

