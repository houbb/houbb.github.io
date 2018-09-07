---
layout: post
title:  Jedis
date:  2018-09-07 07:44:19 +0800
categories: [Cache]
tags: [cache, redis, sh]
published: true
excerpt: Jedis 入门教程
---

# Jedis

[Jedis](https://github.com/xetorthio/jedis) is a blazingly small and sane redis java client.

## 功能

- Sorting

- Connection handling

- Commands operating on any kind of values

- Commands operating on string values

- Commands operating on hashes

- Commands operating on lists

- Commands operating on sets

- Commands operating on sorted sets

- Transactions

- Pipelining

- Publish/Subscribe

- Persistence control commands

- Remote server control commands

- Connection pooling

- Sharding (MD5, MurmurHash)

- Key-tags for sharding

- Sharding with pipelining

- Scripting with pipelining

- Redis Cluster


# Docker 安装 Redis

## 基础知识

[docker 入门](https://houbb.github.io/2018/09/05/container-docker-hello)

[redis](https://houbb.github.io/2016/10/23/redis)

[docker redis](https://houbb.github.io/2018/05/06/docker-redis)

## 删除原始的

一条命令实现停用并删除容器：

ps: 危险操作，切勿模仿。

```sh
docker stop $(docker ps -a -q) & docker rm $(docker ps -a -q)
```

## 实际安装

- 验证是否存在

```
$ docker images | grep redis
```

发现没有了，也许是刚更新了 Docker 的原因。

- 下载

```
$ docker pull redis
```

- 再次查看

```
$ docker images | grep redis
redis                            latest              e1a73233e3be        40 hours ago        83.4MB
```

- 启动

```
docker run -p 6379:6379 --name out-redis -d redis
```

- 状态查看

```
$ docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                    NAMES
b8dfa9422adb        redis               "docker-entrypoint.s…"   14 seconds ago      Up 13 seconds       0.0.0.0:6379->6379/tcp   out-redis
```

# Jedis

使用 java 语言测试，结合 maven 进行 jar 管理。

jdk8 + junit4

## jar 引入

```xml
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>2.8.1</version>
</dependency>
```

## 测试代码

```java
public class RedisTest {

    private Jedis jedis;

    @BeforeEach
    public void setUp() {
        jedis = new Jedis("127.0.0.1", 6379);
//        jedis.auth("123456");
    }

    /**
     * 初始化测试
     */
    @Test
    public void initTest() {
        jedis.set("key", "test");
        System.out.println(jedis.get("key"));
    }
}
```

- 输出日志

```
test
```

## 常见例子

为了测试的自动化，使用断言。

- crud

```java
@Test
public void testCrudString() {
    jedis.set("name", "ryo");
    assertEquals("ryo", jedis.get("name"));

    jedis.append("name", " is whose name?");
    assertEquals("ryo is whose name?", jedis.get("name"));

    jedis.del("name");
    assertNull(jedis.get("name"));

    jedis.mset("name", "ryo", "age", "22");
    assertEquals("ryo", jedis.get("name"));

    jedis.incr("age");
    assertEquals("23", jedis.get("age"));
}
```

- map

```java
@Test
public void testMap() {
    Map<String, String> map = new HashMap<>();
    map.put("name", "ryo");
    map.put("age", "22");
    jedis.hmset("map", map);

    assertEquals("[ryo, 22]", jedis.hmget("map", "name", "age").toString());
    assertEquals("2", jedis.hlen("map").toString());
    assertEquals("true", jedis.exists("map").toString());
    assertEquals("[name, age]", jedis.hkeys("map").toString());

    jedis.hdel("map", "name");
    assertEquals("1", jedis.hlen("map").toString());
}
```

- list

```java
@Test
public void testList() {
    jedis.del("list");
    jedis.lpush("list", "apple");
    jedis.lpush("list", "eat");
    jedis.lpush("list", "ryo");
    assertEquals("apple", jedis.lindex("list", 2));

    jedis.lset("list", 2, "orange");
    assertEquals("[ryo, eat, orange]", jedis.lrange("list", 0, -1).toString());
}
```

- set

```java
@Test
public void testSet() {
    jedis.del("name");
    jedis.sadd("name", "ryo");
    jedis.sadd("name", "apple");
    jedis.sadd("name", "orange");
    assertEquals("[orange, apple, ryo]", jedis.smembers("name").toString());    //show all members.
    assertEquals("3", jedis.scard("name").toString()); //get number

    jedis.srem("name", "orange");   //remove
    assertEquals("[apple, ryo]", jedis.smembers("name").toString());
    assertEquals("false", jedis.sismember("name", "banana").toString());
    assertEquals("[ryo, apple]", jedis.srandmember("name", 2).toString());
}
```

- sort

```java
@Test
public void testSort() {
    jedis.del("sort");
    jedis.lpush("sort", "3");
    jedis.lpush("sort", "5");
    jedis.lpush("sort", "2");
    jedis.lpush("sort", "7");

    assertEquals("[7, 2, 5, 3]", jedis.lrange("sort", 0, -1).toString());
    assertEquals("[2, 3, 5, 7]", jedis.sort("sort").toString());
    assertEquals("[7, 2, 5, 3]", jedis.lrange("sort", 0, -1).toString());
}
```

# 参考资料

https://github.com/xetorthio/jedis

* any list
{:toc}