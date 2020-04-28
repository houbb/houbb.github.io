---
layout: post
title: Redis-01-入门使用简介
date:  2016-10-23 09:35:04 +0800
categories: [SQL]
tags: [redis, cache, nosql]
published: true
---

* any list
{:toc}


# Redis

[Redis](http://redis.io/) is an open source (BSD licensed), in-memory data structure store, used as database, cache and message broker.
It supports data structures such as strings, hashes, lists, sets, sorted sets with range queries, bitmaps, hyperloglogs 
and geospatial indexes with radius queries. 

> [zh_CN](http://www.redis.cn/)


# Install in Mac

1、Download and Install

```
$ wget http://download.redis.io/releases/redis-3.0.6.tar.gz
$ tar xzf redis-3.0.6.tar.gz
$ mv redis-3.0.6 redis
$ cd redis
$ make
$ make test
$ make install
```

2、Edit ```redis.conf```

Open the ```redis.conf``` file, and find this line ```dir ./```, set it the path you want redis to save data. Here is my

```
dir /Users/houbinbin/redis/redis_data

bind 127.0.0.1      //本地访问
requirepass 123456  //访问密码
```

3、 Start redis-server

```
$   src/redis-server redis.conf

$   src/redis-server redis.conf &   //后台-配置文件运行
```

after start you can see

```
houbinbindeMacBook-Pro:redis-3.2.3 houbinbin$ 17137:M 23 Oct 09:46:21.924 * Increased maximum number of open files to 10032 (it was originally set to 256).
                _._
           _.-``__ ''-._
      _.-``    `.  `_.  ''-._           Redis 3.2.3 (00000000/0) 64 bit
  .-`` .-```.  ```\/    _.,_ ''-._
 (    '      ,       .-`  | `,    )     Running in standalone mode
 |`-._`-...-` __...-.``-._|'` _.-'|     Port: 6379
 |    `-._   `._    /     _.-'    |     PID: 17137
  `-._    `-._  `-./  _.-'    _.-'
 |`-._`-._    `-.__.-'    _.-'_.-'|
 |    `-._`-._        _.-'_.-'    |           http://redis.io
  `-._    `-._`-.__.-'_.-'    _.-'
 |`-._`-._    `-.__.-'    _.-'_.-'|
 |    `-._`-._        _.-'_.-'    |
  `-._    `-._`-.__.-'_.-'    _.-'
      `-._    `-.__.-'    _.-'
          `-._        _.-'
              `-.__.-'

17137:M 23 Oct 09:46:21.929 # Server started, Redis version 3.2.3
17137:M 23 Oct 09:46:21.930 * The server is now ready to accept connections on port 6379
```

test is connect success

```
$   redis-cli -a 123456 ping

PONG
```

<label class="label label-danger">Error</label>

**redis-cli** Could not connect to Redis at 127.0.0.1:6379: Connection refused

```
$   redis-server /Users/houbinbin/redis/redis-3.2.3/redis.conf
$   redis-cli
```



4、 Test connection

Use redis-client to connect to redis-server.

```
$   cd /Users/houbinbin/redis/redis-3.0.6
$   src/redis-cli -a 123456
```

```
127.0.0.1:6379> set houbinbin hi
OK
127.0.0.1:6379> get houbinbin
"hi"
```

5、 Shutdown redis-server

> [(error) NOAUTH Authentication required.](http://www.mamicode.com/info-detail-1610601.html)

无奈之下,杀进程。

```

```

常规关闭方式:


```
$   127.0.0.1:6379> shutdown
not connected>


$   redis-cli -a 123456 shutdown    //关闭后台
```

6、 Set password

> [set](http://blog.csdn.net/zyz511919766/article/details/42268219)

find ```#requirepass foobared``` in file ```redis.conf```, change like this

```
requirepass redis
```

7、 Uninstall redis

- remove redis-* package under ```/usr/local/bin```

```
$   sudo rm -rf redis-*
```


# Install in windows

## 下载

直接 [github](https://github.com/MicrosoftArchive/redis/releases) 下载合适的版本。

比如 `Redis-x64-3.2.100.msi` 

## 安装

双击安装，比较简单。

可以选择将 add path 那个勾选上。

## 状态查询

```
C:\Users\Administrator>redis-cli -v
redis-cli 3.2.100
```

或者命令行输入

```
services.msc
```

查看 **Redis** 服务的状态，状态为**已启动**则说明正常。


## windows 可视化界面

[https://redisdesktop.com/](https://redisdesktop.com/) 直接下载安装即可。

# Jedis

- pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.ryo</groupId>
    <artifactId>redis</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <plugin.tomcat.version>2.2</plugin.tomcat.version>
        <maven-surefire-plugin.version>2.18.1</maven-surefire-plugin.version>
        <maven-compiler-plugin.version>3.3</maven-compiler-plugin.version>
        <maven-compiler-plugin.jdk.version>1.8</maven-compiler-plugin.jdk.version>

        <log4j.version>2.6</log4j.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.9</version>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>redis.clients</groupId>
            <artifactId>jedis</artifactId>
            <version>2.8.1</version>
        </dependency>

        <dependency>
            <groupId>commons-pool</groupId>
            <artifactId>commons-pool</artifactId>
            <version>1.6</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.tomcat.maven</groupId>
                <artifactId>tomcat7-maven-plugin</artifactId>
                <version>${plugin.tomcat.version}</version>
                <configuration>
                    <port>8080</port>
                    <path>/</path>
                    <uriEncoding>${project.build.sourceEncoding}</uriEncoding>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>${maven-surefire-plugin.version}</version>
                <configuration>
                    <skipTests>true</skipTests>
                    <testFailureIgnore>true</testFailureIgnore>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>${maven-compiler-plugin.version}</version>
                <configuration>
                    <source>${maven-compiler-plugin.jdk.version}</source>
                    <target>${maven-compiler-plugin.jdk.version}</target>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

- RedisTest.java

```java
package com.ryo.redis;

import junit.framework.TestCase;
import org.junit.Before;
import org.junit.Test;
import redis.clients.jedis.Jedis;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by houbinbin on 16/7/3.
 */
public class RedisTest extends TestCase {
    private Jedis jedis;

    @Before
    public void setUp() {
        jedis = new Jedis("127.0.0.1", 6379);
        jedis.auth("redis");
    }

    /**
     * save String
     */
    @Test
    public void testSaveString() {
        jedis.set("name", "ryo");
        assertEquals("ryo", jedis.get("name"));

        jedis.append("name", " is whose name?");
        assertEquals("ryo is whose name?", jedis.get("name"));

        jedis.del("name");
        assertEquals(null, jedis.get("name"));

        jedis.mset("name", "ryo", "age", "22");
        assertEquals("ryo", jedis.get("name"));

        jedis.incr("age");
        assertEquals("23", jedis.get("age"));
    }

    /**
     * Map
     */
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
        assertEquals("[ryo, 22]", jedis.hvals("map").toString());

        jedis.hdel("map", "name");
        assertEquals("1", jedis.hlen("map").toString());
    }

    /**
     * List
     */
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

    /**
     * Set
     */
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

        //get the random result, so assert may be false.
        assertEquals("apple", jedis.srandmember("name"));
        assertEquals("[ryo, apple]", jedis.srandmember("name", 2).toString());
    }

    /**
     * sort
     */
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
}
```

## Jedis pool

I try times, but always get an error.

```java
package com.ryo.util;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;

/**
 * Created by houbinbin on 16/7/3.
 */
public class RedisUtil {
    private RedisUtil() {
    }

    private static final String ADDRESS = "127.0.0.1";
    private static final int PORT = 6397;
    private static final String PASSWORD = "redis";


    //可用连接实例的最大数目，默认值为8；
    //如果赋值为-1，则表示不限制；如果pool已经分配了maxActive个jedis实例，则此时pool的状态为exhausted(耗尽)。
    private static final int MAX_TOTAL = 512;

    //控制一个pool最多有多少个状态为idle(空闲的)的jedis实例，默认值也是8。
    private static final int MAX_IDLE = 100;

    //等待可用连接的最大时间，单位毫秒，默认值为-1，表示永不超时。如果超过等待时间，则直接抛出JedisConnectionException；
    private static final int TIMEOUT = 10000;

    //在borrow一个jedis实例时，是否提前进行validate操作；如果为true，则得到的jedis实例均是可用的；
    private static final boolean TEST_ON_BORROW = true;

    private static JedisPool jedisPool = null;

    /**
     * 初始化Redis连接池
     */
    static {
        try {
            if (jedisPool == null) {
                JedisPoolConfig config = new JedisPoolConfig();
                config.setMaxTotal(MAX_TOTAL);
                config.setMaxWaitMillis(TIMEOUT);
                config.setMaxIdle(MAX_IDLE);
                config.setTestOnBorrow(TEST_ON_BORROW);
                jedisPool = new JedisPool(config, ADDRESS, PORT, TIMEOUT, PASSWORD);
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("init redis pool failed!");
        }
    }

    /**
     * 获取Jedis实例
     *
     * @return
     */
    public synchronized static Jedis getJedis() {
        try {
            if (jedisPool != null) {
                Jedis resource = jedisPool.getResource();
                return resource;
            } else {
                return null;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        } finally {

        }
    }

    /**
     * 释放jedis资源
     *
     * @param jedis
     */
    public static void returnResource(final Jedis jedis) {
        if (jedis != null) {
            jedisPool.returnResource(jedis);
        }
    }
}
```

# Spring-Redis

> [基础知识](http://www.jianshu.com/p/f01ac0873c23)

No invasive spring and redis integration.

```@Cacheable``` triggers cache population

```@CacheEvict``` triggers cache eviction

```@CachePut``` updates the cache without interfering with the method execution

```@Caching``` regroups multiple cache operations to be applied on a method

```@CacheConfig``` shares some common cache-related settings at class-level

> [spring cache](http://docs.spring.io/spring/docs/current/spring-framework-reference/htmlsingle/#cache-introduction)


简单说下```@Cacheable```和```@CachePut```区别:

(1) ```@Cacheable``` 如果缓存中有,直接去缓存,不执行方法。否则执行方法,并将结果放在缓存中。适用于如查询的情况。
(2) ```@CachePut``` 无论缓存有没有,方法会正常执行。并将返回的结果放在缓存之中。适用于更新情况,并将更新后的对象放在缓存中。

- File struct

You can get the project demo from [here](https://github.com/houbb/spring-redis) or ```git clone https://github.com/houbb/spring-redis```


```
.
|____main
| |____java
| | |____com
| | | |____ryo
| | | | |____cache
| | | | | |____RedisCacheConfig.java
| | | | |____domain
| | | | | |____User.java
| | | | |____service
| | | | | |____impl
| | | | | | |____UserServiceImpl.java
| | | | | |____UserService.java
| |____resources
| | |____app.xml
| | |____applicationContext.xml
| | |____spring-redis.xml
|____test
| |____java
| | |____com
| | | |____ryo
| | | | |____service
| | | | | |____BaseTest.java
| | | | | |____UserServiceTest.java
|____pom.xml
```

- ```pom.xml```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.ryo</groupId>
    <artifactId>spring-redis</artifactId>
    <version>1.0-SNAPSHOT</version>

    <description>spring integrate redis</description>


    <properties>
        <junit.version>4.9</junit.version>
        <spring.version>4.2.6.RELEASE</spring.version>
        <spring-data-redis.version>1.3.2.RELEASE</spring-data-redis.version>
        <jedis.version>2.4.2</jedis.version>
        <lombok.version>1.16.8</lombok.version>
        <maven-surefire-plugin.version>2.18.1</maven-surefire-plugin.version>
    </properties>

    <dependencies>
        <!--junit-->
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>${junit.version}</version>
        </dependency>

        <!-- Spring -->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-core</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-beans</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context-support</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-aop</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-test</artifactId>
            <version>${spring.version}</version>
        </dependency>

        <!-- redis -->
        <dependency>
            <groupId>org.springframework.data</groupId>
            <artifactId>spring-data-redis</artifactId>
            <version>${spring-data-redis.version}</version>
        </dependency>
        <dependency>
            <groupId>redis.clients</groupId>
            <artifactId>jedis</artifactId>
            <version>${jedis.version}</version>
        </dependency>

        <!--lombok-->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>${lombok.version}</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>${maven-surefire-plugin.version}</version>
                <configuration>
                    <skipTests>true</skipTests>
                    <testFailureIgnore>true</testFailureIgnore>
                </configuration>
            </plugin>
        </plugins>
    </build>

</project>
```

- ```User.java```

```java
@Data
public class User implements Serializable {
  private Long id;
  private String name;
}
```

- ```UserServiceImpl.java```

```java
@Service("userService")
public class UserServiceImpl implements UserService {

  /**
   * @Cacheable triggers cache population
   */
  @Cacheable(value = "user", key = "'user_id_' + #id")
  public User getUser(Long id) {
    System.out.println("get user"+id);

    User user = new User();
    user.setId(id);
    return user;
  }

  @CacheEvict(value = "user", key = "'user_id_'+#id")
  public void deleteUser(Long id) {
    System.out.println("delete user"+id);
  }

  /**
   * updated without interfering with the method execution
   * - 将返回的结果,放入缓存
   */
  @CachePut(value = "user", key = "'user_id_'+#user.getId()")
  public User updateUser(User user) {
    System.out.println("update user"+user);
    user.setName("cachePut update");
    return user;
  }

  @CacheEvict(value = "user", allEntries = true)
  public void clearCache() {
    System.out.println("clear all user cache");
  }

}
```

- ```RedisCacheConfig.java```

```java
@Configuration
@EnableCaching
public class RedisCacheConfig {

  private JedisConnectionFactory jedisConnectionFactory;

  private RedisTemplate redisTemplate;

  private RedisCacheManager redisCacheManager;

  public RedisCacheConfig(JedisConnectionFactory jedisConnectionFactory, RedisTemplate redisTemplate, RedisCacheManager redisCacheManager) {
    this.jedisConnectionFactory = jedisConnectionFactory;
    this.redisTemplate = redisTemplate;
    this.redisCacheManager = redisCacheManager;
  }
}
```

- ```app.xml```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
		http://www.springframework.org/schema/beans/spring-beans-4.0.xsd">

    <!--spring公共配置-->
    <import resource="applicationContext.xml"/>
    <!--redis缓存配置-->
    <import resource="spring-redis.xml"/>

</beans>
```

- ```applicationContext.xml```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
		http://www.springframework.org/schema/beans/spring-beans-4.0.xsd
		http://www.springframework.org/schema/context
		http://www.springframework.org/schema/context/spring-context-4.0.xsd">

    <!-- Activates annotation-based bean configuration -->
    <context:annotation-config/>

    <!-- Scans for application @Components to deploy -->
    <context:component-scan base-package="com.ryo"/>

</beans>
```

- ```spring-redis.xml```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:p="http://www.springframework.org/schema/p"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
		http://www.springframework.org/schema/beans/spring-beans-4.0.xsd">

    <bean id="poolConfig" class="redis.clients.jedis.JedisPoolConfig">
        <property name="maxTotal" value="1000"/>
        <property name="minIdle" value="50"/>
        <property name="maxIdle" value="100"/>
        <property name="testOnBorrow" value="true"/>
    </bean>

    <bean id="jedisConnectionFactory" class="org.springframework.data.redis.connection.jedis.JedisConnectionFactory"
          p:hostName="127.0.0.1" p:port="6379" p:password="123456" p:poolConfig-ref="poolConfig"/>

    <bean id="redisTemplate" class="org.springframework.data.redis.core.RedisTemplate">
        <property name="connectionFactory" ref="jedisConnectionFactory"/>
        <!-- 如果不配置Serializer，那么存储的时候智能使用String，如果用User类型存储，那么会提示错误User can't cast to String！！！ -->
        <property name="keySerializer">
            <bean class="org.springframework.data.redis.serializer.StringRedisSerializer" />
        </property>
        <property name="valueSerializer">
            <bean class="org.springframework.data.redis.serializer.JdkSerializationRedisSerializer"/>
        </property>
    </bean>

    <bean id="redisCacheManager" class="org.springframework.data.redis.cache.RedisCacheManager">
        <constructor-arg ref="redisTemplate" />
    </bean>

    <!--自定义缓存配置-->
    <bean id="redisCacheConfig" class="com.ryo.cache.RedisCacheConfig">
        <constructor-arg ref="jedisConnectionFactory" />
        <constructor-arg ref="redisTemplate" />
        <constructor-arg ref="redisCacheManager" />
    </bean>
</beans>
```

# 分布式

> [blog](blog.csdn.net/a67474506/article/details/51418728)
