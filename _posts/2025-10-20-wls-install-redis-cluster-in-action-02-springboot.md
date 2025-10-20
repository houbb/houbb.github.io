---
layout: post
title: redis cluster 集群 springboot 访问入门例子
date: 2025-10-20 20:40:12 +0800
categories: [Redis]
tags: [redis, in-action, sh, spring]
published: true
---


# 背景

记录一下 springboot 访问 redis 集群的例子

# 代码

## 架构

```
│  .gitignore
│  pom.xml
└─src
    └─main
        ├─java
        │  └─com
        │      └─example
        │          └─redisclusterdemo
        │              └─config
        │                      RedisClusterDemoApplication.java
        │                      RedisConfig.java
        │                      RedisController.java
        │
        └─resources
                application.properties
```

## pom.xml

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>com.example</groupId>
  <artifactId>springboot-redis-cluster-demo</artifactId>
  <version>1.0.0</version>

  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.7.15</version>
  </parent>

  <dependencies>
    <!-- Spring Boot Web -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- Spring Data Redis -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>

    <!-- Jedis 客户端（支持 Redis Cluster） -->
<!--    https://github.com/spring-projects/spring-data-redis/issues/2864-->
    <dependency>
      <groupId>redis.clients</groupId>
      <artifactId>jedis</artifactId>
      <version>3.8.0</version>
    </dependency>

    <!-- 可选：Lombok 简化代码 -->
    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <optional>true</optional>
    </dependency>

  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>
```


## application.properties

配置上一节我们的集群信息。

```
spring.redis.cluster.nodes=127.0.0.1:7000,127.0.0.1:7001,127.0.0.1:7002
spring.redis.password=
spring.redis.timeout=2000
```

## 代码

### RedisConfig

```java
package com.example.redisclusterdemo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisPassword;
import org.springframework.data.redis.connection.RedisClusterConfiguration;
import org.springframework.data.redis.connection.jedis.JedisClientConfiguration;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;

import java.time.Duration;
import java.util.Arrays;

@Configuration
public class RedisConfig {

    @Bean
    public JedisConnectionFactory jedisConnectionFactory() {
        // 集群节点
        RedisClusterConfiguration clusterConfig = new RedisClusterConfiguration(
                Arrays.asList("127.0.0.1:7000",
                        "127.0.0.1:7001",
                        "127.0.0.1:7002")
        );
//        clusterConfig.setPassword(RedisPassword.of("123456"));

        // Jedis 客户端配置
        JedisClientConfiguration clientConfig = JedisClientConfiguration.builder()
                .connectTimeout(Duration.ofSeconds(10))
                .readTimeout(Duration.ofSeconds(10))
                .build();

        return new JedisConnectionFactory(clusterConfig, clientConfig);
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate() {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(jedisConnectionFactory());
        return template;
    }
}
```

### RedisController

```java
package com.example.redisclusterdemo.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/redis")
public class RedisController {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @RequestMapping("/set")
    public String set(@RequestParam String key, @RequestParam String value) {
        redisTemplate.opsForValue().set(key, value);
        return "OK";
    }

    @RequestMapping("/get")
    public Object get(@RequestParam String key) {
        return redisTemplate.opsForValue().get(key);
    }

}
```

### 启动类

```java
package com.example.redisclusterdemo.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class RedisClusterDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(RedisClusterDemoApplication.class, args);
    }

}
```

## 测试验证

页面访问 http://localhost:8080/redis/set?key=name&value=lmxxf 设置值

页面访问 http://localhost:8080/redis/get?key=name 设置值，返回 `lmxxf` 符合预期。



# 性能测试

## 背景

如果我们经常设置查询 2 个 key，如果有 500 次查询。

有两种方案：

1）使用 redis 直接 get，共计 和 redis 交互 1000 次

2）使用 redis 直接 multiGet，2个合并在一起请求一次

## 代码

简化如下：

```java
package com.example.redisclusterdemo.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/perf")
public class RedisPerformController {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @RequestMapping("/get")
    public String get() {
        long start = System.currentTimeMillis();
        for(int i = 0; i < 1000; i++) {
            String key = UUID.randomUUID().toString();
            redisTemplate.opsForValue().get(key);
        }
        long cost = System.currentTimeMillis() - start;
        System.out.println("get cost=" + cost);
        return cost+"";
    }

    @RequestMapping("/multi")
    public Object multi() {
        long start = System.currentTimeMillis();

        for(int i = 0; i < 500; i++) {
            String key = UUID.randomUUID().toString();
            String key2 = UUID.randomUUID().toString();
            redisTemplate.opsForValue().multiGet(Arrays.asList(key, key2));
        }

        long cost = System.currentTimeMillis() - start;
        System.out.println("multi cost=" + cost);
        return cost+"";
    }

}
```

## 思考

大家觉得是 get 快？还是 multi 快？

## 实践

在有这个疑问之前，老马是理所当然的认为是 multi 更快。

然而实际测试效果如下：

```
get cost=728
multi cost=15655
```

## 反思

虽说是本地 redis，但是这个网络耗时也不是可以忽略的。

可见还是 multiGet 太慢了。

# 源码

multiGet 是一次合并发送了两个 key 请求吗？

## DefaultValueOperations

org.springframework.data.redis.core.DefaultValueOperations

```java
@Override
	public List<V> multiGet(Collection<K> keys) {

		if (keys.isEmpty()) {
			return Collections.emptyList();
		}

		byte[][] rawKeys = new byte[keys.size()][];

		int counter = 0;
		for (K hashKey : keys) {
			rawKeys[counter++] = rawKey(hashKey);
		}

		List<byte[]> rawValues = execute(connection -> connection.mGet(rawKeys));

		return deserializeValues(rawValues);
	}
```

## RedisStringCommands

```java
@Override
public List<byte[]> mGet(byte[]... keys) {
	Assert.notNull(keys, "Keys must not be null!");
	Assert.noNullElements(keys, "Keys must not contain null elements!");

	if (ClusterSlotHashUtil.isSameSlotForAllKeys(keys)) {
		return connection.getCluster().mget(keys);
	}

	return connection.getClusterCommandExecutor()
			.executeMultiKeyCommand((JedisMultiKeyClusterCommandCallback<byte[]>) BinaryJedis::get, Arrays.asList(keys))
			.resultsAsListSortBy(keys);
}
```

可见，还是区分了是否所有的 key 在一个 slot，不然还是会拆分。

## 执行线程池

```java
	/**
	 * Run {@link MultiKeyClusterCommandCallback} with on a curated set of nodes serving one or more keys.
	 *
	 * @param cmd must not be {@literal null}.
	 * @return never {@literal null}.
	 * @throws ClusterCommandExecutionFailureException
	 */
	public <S, T> MultiNodeResult<T> executeMultiKeyCommand(MultiKeyClusterCommandCallback<S, T> cmd,
			Iterable<byte[]> keys) {

		Map<RedisClusterNode, PositionalKeys> nodeKeyMap = new HashMap<>();

		int index = 0;
		for (byte[] key : keys) {
			for (RedisClusterNode node : getClusterTopology().getKeyServingNodes(key)) {
				nodeKeyMap.computeIfAbsent(node, val -> PositionalKeys.empty()).append(PositionalKey.of(key, index++));
			}
		}

		Map<NodeExecution, Future<NodeResult<T>>> futures = new LinkedHashMap<>();
		for (Entry<RedisClusterNode, PositionalKeys> entry : nodeKeyMap.entrySet()) {

			if (entry.getKey().isMaster()) {
				for (PositionalKey key : entry.getValue()) {
					futures.put(new NodeExecution(entry.getKey(), key),
							executor.submit(() -> executeMultiKeyCommandOnSingleNode(cmd, entry.getKey(), key.getBytes())));
				}
			}
		}

		return collectResults(futures);
	}
```

## 获取

```java
   private <T> MultiNodeResult<T> collectResults(Map<NodeExecution, Future<NodeResult<T>>> futures) {

		boolean done = false;

		MultiNodeResult<T> result = new MultiNodeResult<>();
		Map<RedisClusterNode, Throwable> exceptions = new HashMap<>();

		Set<String> saveGuard = new HashSet<>();
		while (!done) {

			done = true;
			for (Map.Entry<NodeExecution, Future<NodeResult<T>>> entry : futures.entrySet()) {

				if (!entry.getValue().isDone() && !entry.getValue().isCancelled()) {
					done = false;
				} else {

					NodeExecution execution = entry.getKey();
					try {

						String futureId = ObjectUtils.getIdentityHexString(entry.getValue());
						if (!saveGuard.contains(futureId)) {

							if (execution.isPositional()) {
								result.add(execution.getPositionalKey(), entry.getValue().get());
							} else {
								result.add(entry.getValue().get());
							}
							saveGuard.add(futureId);
						}
					} catch (ExecutionException e) {

						RuntimeException ex = convertToDataAccessException((Exception) e.getCause());
						exceptions.put(execution.getNode(), ex != null ? ex : e.getCause());
					} catch (InterruptedException e) {

						Thread.currentThread().interrupt();

						RuntimeException ex = convertToDataAccessException((Exception) e.getCause());
						exceptions.put(execution.getNode(), ex != null ? ex : e.getCause());
						break;
					}
				}
			}
			try {
				Thread.sleep(10);
			} catch (InterruptedException e) {

				done = true;
				Thread.currentThread().interrupt();
			}
		}
```

future.get() 本来就是最慢的来决定，总体还好说。

看到没，这里竟然沉睡了 10ms，为什么？！

## 避免忙等

sleep 10ms 的作用

Thread.sleep(10) 会让当前线程 暂停 10 毫秒

在这 10ms 内，CPU 可以去执行别的线程，不会一直空转

减少 CPU 占用，同时轮询间隔非常短（10ms），对性能影响几乎可忽略

保证轮询逻辑不会错过已完成的 Future


## 建议

| 场景                   | 推荐做法                                                      |
| -------------------- | --------------------------------------------------------- |
| 单节点 / keys 很少（1~3 个） | 直接 `get` 多次，或者 multiGet 都行，差别不大                           |
| 多节点集群 / keys 跨节点     | multiGet 会拆成多请求，建议批量 key > 5~10 时才用 multiGet，否则单个 get 更直接 |
| 高性能需求                | 尽量异步/管道 pipeline 请求，避免轮询 + sleep 的延迟                      |

## 小结

所以还是不能想当然。要知其然，知其所以然。

* any list
{:toc}