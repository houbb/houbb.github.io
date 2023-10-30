---
layout: post
title:  Neo4j-04-图数据库 neo4j java 整合 增删改查入门例子
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


# CRUD

## 说明

上面只是一个启动的例子，我们还是给出一个完整的 CRUD 的入门例子

## 实体

我们创建一个实体。

```java
public class PersonBean {

    private String id;
    private String name;

    // get&set

}
```

针对 id 添加唯一索引

```sql
CREATE CONSTRAINT ON (p:Person) ASSERT p.id IS UNIQUE;
```

## insert

```java
package com.github.houbb.neo4j.learn;

import com.github.houbb.neo4j.learn.model.PersonBean;
import org.neo4j.driver.*;

public class InsertDemo {

    public static void main(String[] args) {
        // Neo4j数据库连接信息
        String uri = "bolt://localhost:7687"; // Neo4j数据库地址
        String user = "neo4j"; // 数据库用户名
        String password = "12345678"; // 数据库密码

        // 创建驱动程序
        Driver driver = GraphDatabase.driver(uri, AuthTokens.basic(user, password));

        // 创建一个Person对象
        PersonBean person = new PersonBean();
        person.setName("John Doe");
        person.setId("1");

        // 执行插入操作
        try (Session session = driver.session()) {
            session.writeTransaction(transaction -> {
                transaction.run("CREATE (p:Person {id: $id, name: $name})",
                        Values.parameters("id", person.getId(), "name", person.getName()));
                return null;
            });
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            // 关闭驱动程序
            driver.close();
        }
    }
    
}
```

我们可以通过上面的方式插入。

但是插入 2 次会有报错：

```
org.neo4j.driver.exceptions.ClientException: Node(15) already exists with label `Person` and property `id` = '1'
	at org.neo4j.driver.internal.util.Futures.blockingGet(Futures.java:143)
	at org.neo4j.driver.internal.InternalTransaction.commit(InternalTransaction.java:39)
	at org.neo4j.driver.internal.InternalSession.lambda$transaction$4(InternalSession.java:154)
	at org.neo4j.driver.internal.retry.ExponentialBackoffRetryLogic.retry(ExponentialBackoffRetryLogic.java:101)
	at org.neo4j.driver.internal.InternalSession.transaction(InternalSession.java:146)
	at org.neo4j.driver.internal.InternalSession.writeTransaction(InternalSession.java:124)
	at org.neo4j.driver.internal.InternalSession.writeTransaction(InternalSession.java:118)
	at com.github.houbb.neo4j.learn.InsertDemo.main(InsertDemo.java:24)
	Suppressed: org.neo4j.driver.exceptions.ClientException: Transaction can't be committed. It has been rolled back either because of an error or explicit termination
		at org.neo4j.driver.internal.async.UnmanagedTransaction.doCommitAsync(UnmanagedTransaction.java:195)
```

## merge 

有没有什么方法可以让不存在时插入，存在时更新呢？

```java
package com.github.houbb.neo4j.learn;

import com.github.houbb.neo4j.learn.model.PersonBean;
import org.neo4j.driver.*;

public class MergeDemo {

    public static void main(String[] args) {
        // Neo4j数据库连接信息
        String uri = "bolt://localhost:7687"; // Neo4j数据库地址
        String user = "neo4j"; // 数据库用户名
        String password = "12345678"; // 数据库密码

        // 执行插入操作
        try (Driver driver = GraphDatabase.driver(uri, AuthTokens.basic(user, password));
             Session session = driver.session()) {
            String cypherQuery = "MERGE (p:Person {id: $id}) SET p.name = $name";
            session.run(cypherQuery, Values.parameters("id", "2", "name", "John Doe New"));
        } catch (Exception e) {
            e.printStackTrace();
        }
        // 关闭驱动程序
    }
    
}
```

## update

```java
package com.github.houbb.neo4j.learn;

import org.neo4j.driver.*;

public class UpdateDemo {

    public static void main(String[] args) {
        // Neo4j数据库连接信息
        String uri = "bolt://localhost:7687"; // Neo4j数据库地址
        String user = "neo4j"; // 数据库用户名
        String password = "12345678"; // 数据库密码

        try (Driver driver = GraphDatabase.driver(uri, AuthTokens.basic(user, password));
             Session session = driver.session()) {
            String cypherQuery = "MATCH (p:Person {id: $id}) SET p.name = $newName";
            session.run(cypherQuery, Values.parameters("id", "1", "newName", "Updated Name"));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
}
```

把 id=1 的名称改掉。

## query

根据 id 查询对应的 neo4j 信息。

```java
package com.github.houbb.neo4j.learn;

import org.neo4j.driver.*;
import org.neo4j.driver.types.Node;

public class QueryDemo {

    public static void main(String[] args) {
        // Neo4j数据库连接信息
        String uri = "bolt://localhost:7687"; // Neo4j数据库地址
        String user = "neo4j"; // 数据库用户名
        String password = "12345678"; // 数据库密码

        try (Driver driver = GraphDatabase.driver(uri, AuthTokens.basic(user, password));
             Session session = driver.session()) {
            // 执行Cypher查询
            String cypherQuery = "MATCH (p:Person) RETURN p LIMIT 10";
            Result result = session.run(cypherQuery);

            while (result.hasNext()) {
                // 首先获取节点
                Record record = result.next();
                Node personNode = record.get("p").asNode();

                // 从节点中获取属性
                String name = personNode.get("name").asString();
                String id = personNode.get("id").asString();
                System.out.println(id + "=" + name);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        // 关闭驱动程序
    }

}
```

## remove

```java
package com.github.houbb.neo4j.learn;

import org.neo4j.driver.*;

public class RemoveDemo {

    public static void main(String[] args) {
        // Neo4j数据库连接信息
        String uri = "bolt://localhost:7687"; // Neo4j数据库地址
        String user = "neo4j"; // 数据库用户名
        String password = "12345678"; // 数据库密码

        // 执行插入操作
        try (Driver driver = GraphDatabase.driver(uri, AuthTokens.basic(user, password));
             Session session = driver.session()) {
            String cypherQuery = "MATCH (p:Person {id: $id}) DELETE p";
            session.run(cypherQuery, Values.parameters("id", "1"));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
}
```

# 小结

这只是一个简单的 java 直连代码，相信 spring 整合等常见的整合一定可以。

后续有时间继续整理。

下一节我们先来看一下以 ORM 思想的操作。

# 参考资料

https://www.cnblogs.com/liaozk/p/17138133.html

[Java 与 Neo4j 不得不说的故事](https://neo4j.com/developer/java/)

https://blog.csdn.net/weixin_44673217/article/details/125149017

https://blog.51cto.com/u_16213367/7336746

[w3c](https://www.w3cschool.cn/neo4j/neo4j_native_java_api_example.html)

[【neo4j忘记密码】neo4j忘记密码的处理方法](https://blog.csdn.net/buyanfy/article/details/127525341)

* any list
{:toc}

