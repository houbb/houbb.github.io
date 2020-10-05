---
layout: post
title: Redis-03-redis 整合 spring 常见写法 jedispool 实现方式
date:  2018-12-12 10:11:55 +0800
categories: [Cache]
tags: [redis, cache, nosql]
published: true
---

# 背景

有时候我们需要使用 spring 整合 redis。

那应该怎么实现呢？

# 最简单的 jedis

## maven

```xml
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>3.2.0</version>
</dependency>
```

## 连接单点

以  aliyun redis 为例子。

```java
Jedis jedis = new Jedis("ALIYUNADDRESS.aliyuncs.com", 6379);
jedis.auth("PASSWORD");
```

## 连接集群

```java
// 指定配置信息
JedisPoolConfig config = new JedisPoolConfig();
config.setMaxTotal(60000);//设置最大连接数
config.setMaxIdle(1000); //设置最大空闲数
config.setMaxWaitMillis(3000);//设置超时时间
config.setTestOnBorrow(true);

//创建一个 JedisCluster 对象
Set<HostAndPort> nodes = new HashSet<>();
nodes.add(new HostAndPort("xxx.xxx.xxx.1", 6379));
nodes.add(new HostAndPort("xxx.xxx.xxx.2", 6379));
nodes.add(new HostAndPort("xxx.xxx.xxx.3", 6379));

//jedisCluster在系统中是单例的。
final String password = "PASSWORD";
JedisCluster jedisCluster = new JedisCluster(nodes, 3000, 3000, 10, password, config);
```

当然这里你可以采用 spring 的写法

# spring-data-redis 的写法

## maven 引入

```xml
<dependency>
    <groupId>org.springframework.data</groupId>
    <artifactId>spring-data-redis</artifactId>
    <version>2.2.6.RELEASE</version>
</dependency>
```

## 代码编写

```java
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisClusterConfiguration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisNode;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import redis.clients.jedis.JedisPoolConfig;

import java.net.UnknownHostException;
import java.util.HashSet;
import java.util.Set;

@Configuration
public class RedisConfig {

    @Value("${redis.address}")
    private String redisAddress;

    @Value("${redis.password}")
    private String password;

    @Value("${redis.timeout:5000}")
    private int timeout;

    @Value("${redis.maxRedirects:5}")
    private int maxRedirects;

    @Value("${redis.minIdle:20}")
    private int minIdle;

    @Value("${redis.maxIdle:100}")
    private int maxIdle;

    @Value("${redis.maxTotal:200}")
    private int maxTotal;

    @Value("${redis.maxWaitMillis:100000}")
    private int maxWaitMillis;

    @Value("${redis.ssl:false}")
    private boolean ssl;

    @Bean(value = "redisTemplate")
    public RedisTemplate<Object, Object> redisTemplate(@Qualifier("jedisConnectionFactory") RedisConnectionFactory redisConnectionFactory) {
        RedisTemplate<Object, Object> redisTemplate = new RedisTemplate<Object, Object>();
        redisTemplate.setConnectionFactory(redisConnectionFactory);
        return redisTemplate;
    }

    @Bean(value = "stringRedisTemplate")
    public StringRedisTemplate stringRedisTemplate(@Qualifier("jedisConnectionFactory")
            RedisConnectionFactory redisConnectionFactory)
            throws UnknownHostException {
        StringRedisTemplate template = new StringRedisTemplate();
        template.setConnectionFactory(redisConnectionFactory);
        return template;
    }

    @Bean(value = "jedisConnectionFactory")
    public JedisConnectionFactory jedisConnectionFactory() {
        JedisConnectionFactory jedisConnectionFactory;
        if (redisAddress.contains("redis.rds.aliyuncs.com")) {
            int index = redisAddress.lastIndexOf(':');
            String redisAddressNew = redisAddress.substring(0, index);
            int port = Integer.parseInt(redisAddress.substring(index + 1));

            jedisConnectionFactory = new JedisConnectionFactory();
            jedisConnectionFactory.setHostName(redisAddressNew);
            jedisConnectionFactory.setPort(port);
            jedisConnectionFactory.setPoolConfig(jedisPoolConfig());
        }else{
            RedisClusterConfiguration redisClusterConfiguration = new RedisClusterConfiguration();
            redisClusterConfiguration.setClusterNodes(getRedisTemplateAddress(redisAddress));
            redisClusterConfiguration.setMaxRedirects(maxRedirects);
            jedisConnectionFactory = new JedisConnectionFactory(redisClusterConfiguration, jedisPoolConfig());
        }
        jedisConnectionFactory.setTimeout(timeout);
        //设置密码
        jedisConnectionFactory.setPassword(password);
        if(ssl) {
            jedisConnectionFactory.setUseSsl(ssl);
        }
        return jedisConnectionFactory;
    }

    private JedisPoolConfig jedisPoolConfig() {
        JedisPoolConfig jedisPoolConfig = new JedisPoolConfig();
        jedisPoolConfig.setMaxTotal(maxTotal);
        jedisPoolConfig.setMinIdle(minIdle);
        jedisPoolConfig.setMaxIdle(maxIdle);
        jedisPoolConfig.setMaxWaitMillis(maxWaitMillis);
        return jedisPoolConfig;
    }

    private Set<RedisNode> getRedisTemplateAddress(String s) {
        Set<RedisNode> nodes = new HashSet<>();
        for (String hoststuff : s.split("(?:\\s|,)+")) {
            if ("".equals(hoststuff)) {
                continue;
            }

            int finalColon = hoststuff.lastIndexOf(':');
            if (finalColon < 1) {
                throw new IllegalArgumentException("Invalid server ``" + hoststuff
                        + "'' in list:  " + s);
            }
            String hostPart = hoststuff.substring(0, finalColon);
            String portNum = hoststuff.substring(finalColon + 1);
            nodes.add(new RedisNode(hostPart, Integer.parseInt(portNum)));
        }
        return nodes;
    }
}
```

## 优缺点

这种代码的写法是可以兼容多种连接方式。

缺点就在于 spring-data-redis 对 spring 和 jedis 的版本有一定的要求。

对于历史包袱比较重的写法，有时候我们想引入这个整个调试的过程将会异常痛苦。

所以可以根据实际情况选择较为简单的写法。

# 直接整合 jedisPool 的写法

## maven 

```xml
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>3.2.0</version>
</dependency>
```

## 普通 java 实现

合理的JedisPool资源池参数设置能够有效地提升Redis性能。

### 参数配置

Jedis使用Apache Commons-pool2对资源池进行管理，在定义JedisPool时需注意其关键参数GenericObjectPoolConfig（资源池）。

该参数的使用示例如下，其中的参数的说明请参见下文。

```java
GenericObjectPoolConfig jedisPoolConfig = new GenericObjectPoolConfig();
jedisPoolConfig.setMaxTotal(...);
jedisPoolConfig.setMaxIdle(...);
jedisPoolConfig.setMinIdle(...);
jedisPoolConfig.setMaxWaitMillis(...);
```

JedisPool的初始化方法如下：

```java
// redisHost为实例的IP， redisPort 为实例端口，redisPassword 为实例的密码，timeout 既是连接超时又是读写超时
JedisPool jedisPool = new JedisPool(jedisPoolConfig, redisHost, redisPort, timeout, redisPasswor//d);
//执命令如下
Jedis jedis = null;
try {
    jedis = jedisPool.getResource();
    //具体的命令
    jedis.executeCommand()
} catch (Exception e) {
    logger.error(e.getMessage(), e);
} finally {
    //在 JedisPool 模式下，Jedis 会被归还给资源池
    if (jedis != null) 
        jedis.close();
}
```

### 参数说明

Jedis连接就是连接池中JedisPool管理的资源，JedisPool保证资源在一个可控范围内，并且保障线程安全。

使用合理的GenericObjectPoolConfig配置能够提升Redis的服务性能，降低资源开销。

下列两表将对一些重要参数进行说明，并提供设置建议。

- 表 1. 资源设置与使用相关参数

| 参数  | 说明	 | 默认值	|  建议 |
|:---|:---|:---|:---|
| maxTotal	         | 资源池中的最大连接数	| 8	 | 参见关键参数设置建议。 |
| maxIdle	             | 资源池允许的最大空闲连接数	| 8| 	参见关键参数设置建议。 |
| minIdle	             | 资源池确保的最少空闲连接数	| 0	| 参见关键参数设置建议。 |
| blockWhenExhausted	 | 当资源池用尽后，调用者是否要等待。只有当值为true时，下面的maxWaitMillis才会生效。| 	true	| 建议使用默认值。 |
| maxWaitMillis	     | 当资源池连接用尽后，调用者的最大等待时间（单位为毫秒）。	| -1（表示永不超时）| 	不建议使用默认值。 |
| testOnBorrow	     | 向资源池借用连接时是否做连接有效性检测（ping）。检测到的无效连接将会被移除。| 	false	| 业务量很大时候建议设置为false，减 一次ping的开销。 |
| testOnReturn	     | 向资源池归还连接时是否做连接有效性检测（ping）。检测到无效连接将会被移除。|	false	| 业务量很大时候建议设置为false，减少一次 ping的开销。 | 
| jmxEnabled | 是否开启JMX监控	| true	| 建议开启，请注意应用本身也需要开启。 |

空闲Jedis对象检测由下列四个参数组合完成，testWhileIdle是该功能的开关。

- 表2. 空闲资源检测相关参数

| 名称 |  说明	| 默认值	| 建议 |
|:---|:---|:---|:---|
| testWhileIdle	              |  是否开启空闲资源检测。| 	false| 	true |
| timeBetweenEvictionRunsMillis| 空闲资源的检测周期（单位为毫秒）| 	-1（不检测）	| 建议设置，周期自行选择，也可以默认也可以使用下方JedisPoolConfig 中的配置。  |
| minEvictableIdleTimeMillis	  |  资源池中资源的最小空闲时间（单位为毫秒），达到此值后空闲资源将被移除。 |	180000（即30分钟） |	可根据自身业务 决定，一般默认值即可，也可以考虑使用下方JeidsPoolConfig中的配置。 |
| numTestsPerEvictionRun	 |        做空闲资源检测时，每次检测资源的个数。| 	3	| 可根据自身应用连接数进行微调，如果设置为 -1，就是对所有连接做空闲监测。| 


为了方便使用，Jedis提供了JedisPoolConfig，它继承了GenericObjectPoolConfig在空闲检测上的一些设置。

```java
public class JedisPoolConfig extends GenericObjectPoolConfig {
  public JedisPoolConfig() {
    // defaults to make your life with connection pool easier :)
    setTestWhileIdle(true);
    //
    setMinEvictableIdleTimeMillis(60000);
    //
    setTimeBetweenEvictionRunsMillis(30000);
    setNumTestsPerEvictionRun(-1);
    }
}
```

## 关键参数设置建议

### maxTotal（最大连接数）

想合理设置maxTotal（最大连接数）需要考虑的因素较多，如：

- 业务希望的Redis并发量；

- 客户端执行命令时间；

- Redis资源，例如nodes （如应用ECS个数等） * maxTotal不能超过Redis的最大连接数（可在实例详情页面查看）；

- 资源开销，例如虽然希望控制空闲连接，但又不希望因为连接池中频繁地释放和创建连接造成不必要的开销。

假设一次命令时间，即borrow|return resource加上Jedis执行命令 （ 含网络耗时）的平均耗时约为1ms，一个连接的QPS大约是1s/1ms = 1000，而业务期望的单个Redis的qps是50000（业务总的qps/Redis分片个数），那么理论上需要的资源池大小（即MaxTotal）是50000 / 1000 = 50。

但事实上这只是个理论值，除此之外还要预留一些资源，所以maxTotal可以比理论值大一些。这个值不是越大越好，一方面连接太多会占用客户端和服务端资源，另一方面对于Redis这种高QPS的服务器，如果出现大命令的阻塞，即使设置再大的资源池也无济于事。

### maxIdle与minIdle

maxIdle实际上才是业务需要的最大连接数，maxTotal 是为了给出余量，所以 maxIdle 不要设置得过小，否则会有new Jedis（新连接）开销，而minIdle是为了控制空闲资源检测。

连接池的最佳性能是maxTotal=maxIdle，这样就避免了连接池伸缩带来的性能干扰。如果您的业务存在突峰访问，建议设置这两个参数的值相等；如果并发量不大或者maxIdle设置过高，则会导致不必要的连接资源浪费。

您可以根据实际总QPS和调用Redis的客户端规模整体评估每个节点所使用的连接池大小。

### 使用监控获取合理值

在实际环境中，比较可靠的方法是通过监控来尝试获取参数的最佳值。可以考虑通过JMX等方式实现监控，从而找到合理值。

## spring 配置

spring 的依赖一般，根据项目已有的引入即可。

```xml
<bean id="jedisPoolConfig" class="redis.clients.jedis.JedisPoolConfig">
    <property name="maxTotal" value="${redis.maxTotal:200}"/>
    <property name="minIdle" value="${redis_minIdle:20}"/>
    <property name="maxIdle" value="${redis_maxIdle:40}"/>
    <property name="maxWaitMillis" value="${redis_maxWaitMillis}"/>
</bean>
<bean id="jedisPool" class="redis.clients.jedis.JedisPool">
    <!--(final GenericObjectPoolConfig poolConfig, final String host, int port, int timeout, final String password)-->
    <constructor-arg index="0" ref="jedisPoolConfig"/>
    <constructor-arg index="1" value="${redis_host}"/>
    <constructor-arg index="2" value="${redis_port:6379}"/>
    <constructor-arg index="3" value="${redis_timeout:5000}"/>
    <constructor-arg index="4" value="${redis_password}"/>
</bean>
```


这里的初始化也可以替换为基于 name 的等都可以。

根据自己的实际需求选择即可。

# 使用注意

## 错误的使用方式

```java
try {
    return jedisPool.getResource.get(key);
} catch(Exception ex) {
    // 输出异常
}
```

这个会导致有时候异常资源无法回收，如果次数多了会有如下的异常：

```
NoSuchElementException: Timeout waiting for idle object
```

## 改进后的写法

对于资源的关闭应该放在 finally 中，当然 JDK7+ 直接使用 TWR 即可。

```java
try(Jedis jedis = jedisPool.getResource()) {
    return jedis.get(key);
} catch (Exception e) {
	// 异常信息
}
```

# 预热JedisPool

由于一些原因（如超时时间设置较小等），项目在启动成功后可能会出现超时。

JedisPool定义最大资源数、最小空闲资源数时，不会在连接池中创建Jedis连接。

初次使用时，池中没有资源使用则会先new Jedis，使用后再放入资源池，该过程会有一定的时间开销，所以建议在定义JedisPool后，以最小空闲数量为基准对JedisPool进行预热，示例如下：

```java
List<Jedis> minIdleJedisList = new ArrayList<Jedis>(jedisPoolConfig.getMinIdle());

for (int i = 0; i < jedisPoolConfig.getMinIdle(); i++) {
    Jedis jedis = null;
    try {
        jedis = pool.getResource();
        minIdleJedisList.add(jedis);
        jedis.ping();
    } catch (Exception e) {
        logger.error(e.getMessage(), e);
    } finally {
    }
}

for (int i = 0; i < jedisPoolConfig.getMinIdle(); i++) {
    Jedis jedis = null;
    try {
        jedis = minIdleJedisList.get(i);
        jedis.close();
    } catch (Exception e) {
        logger.error(e.getMessage(), e);
    } finally {
    
    }
}
```

# 拓展阅读

redispool 实现原理

# 参考资料

[jedis异常：NoSuchElementException: Timeout waiting for idle object](https://www.liangzl.com/get-article-detail-8157.html)

[JedisPool资源池优化](https://help.aliyun.com/document_detail/98726.html)

[jedisPool的使用](https://blog.csdn.net/dreamzuora/article/details/84942009)

[JedisPool的实现](https://zhuanlan.zhihu.com/p/37590195)

* any list
{:toc}