---
layout: post
title: Redis Learn-40-Invalidated object not currently part of this pool & spring redisTemplate
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, exception, sh]
published: true
---

# 背景

以前针对 redis 中的大 Map，采用了 scan+delete，最后删除的方式。

避免单个操作时间太长造成阻塞。

后来 redis 采用 redisTemplate 来操作，发现会报如下错误：

> [redis 中大 key 的删除策略](https://houbb.github.io/2018/12/12/redis-learn-29-big-key-hset)

## 异常信息

```
Caused by: redis.clients.jedis.exceptions.JedisException: Could not return the resource to the pool
        at redis.clients.util.Pool.returnBrokenResourceObject(Pool.java:103) ~[jedis-2.9.0.jar:na]
        at redis.clients.jedis.JedisPool.returnBrokenResource(JedisPool.java:239) ~[jedis-2.9.0.jar:na]
        at redis.clients.jedis.JedisPool.returnResource(JedisPool.java:255) ~[jedis-2.9.0.jar:na]
        at redis.clients.jedis.JedisPool.returnResource(JedisPool.java:16) ~[jedis-2.9.0.jar:na]
        at org.springframework.data.redis.connection.jedis.JedisConnection.close(JedisConnection.java:303) ~[spring-data-redis-1.8.0.RELEASE.jar:na]
        at org.springframework.data.redis.connection.jedis.JedisConnection$5.doClose(JedisConnection.java:3935) ~[spring-data-redis-1.8.0.RELEASE.jar:na]
        at org.springframework.data.redis.core.ScanCursor.close(ScanCursor.java:236) ~[spring-data-redis-1.8.0.RELEASE.jar:na]
        at org.springframework.data.redis.core.ConvertingCursor.close(ConvertingCursor.java:83) ~[spring-data-redis-1.8.0.RELEASE.jar:na]
        at com.huifu.scp.commons.redis.rds.RetryRedisTemplete.removeBigKey(RetryRedisTemplete.java:331) ~[scp-commons-b-1.0.84.20.jar:na]
        ... 90 common frames omitted
Caused by: java.lang.IllegalStateException: Invalidated object not currently part of this pool
        at org.apache.commons.pool2.impl.GenericObjectPool.invalidateObject(GenericObjectPool.java:640) ~[commons-pool2-2.4.2.jar:2.4.2]
        at redis.clients.util.Pool.returnBrokenResourceObject(Pool.java:101) ~[jedis-2.9.0.jar:na]
        ... 98 common frames omitted
```

## 错误的场景

scan 100，然后删除，最后清空。

如果数量少于 100，实际上是可以正常删除的，多于 100 时才会报上面的错误。

本次排查花费了较多时间，记录一下，便于以后自己和他人查阅。

## 代码样例

```java
@Autowired
private StringRedisTemplate template;

public void removeBigKey(String key, int scanCount, long intervalMills) throws CacheException {
	try {
		while (true) {
            Cursor<Map.Entry<Object,Object>> cursor = template.opsForHash().scan(key,ScanOptions.scanOptions().count(scanCount).build());
            // 获取扫描结果为空
            if (CollectionUtils.sizeIsEmpty(cursor)) {
                break;
            }
            // 游标为0时停止
            if (cursor.getCursorId()==0L) {
                break;
            }
            // 构建多个删除的 key
            Object[]  fields = getFieldsKeyArray(cursor);
            template.opsForHash().delete(key, fields);
            
            try {
                cursor.close();
            } catch (IOException e) {
                logger.warn("close redis cursor fail",e);
                //log
            }finally {
                if(cursor!=null) {
                    cursor.close();
                }
            }
            // 沉睡等待，避免对 redis 压力太大
            DateUtil.sleepInterval(intervalMills, TimeUnit.MILLISECONDS);
        }

        // 执行 key 本身的删除
        template.delete(key);
} catch (Exception e) {
	//log
}
```

### 以前的实现

仔细对比发现差异还是很大的，至少以前不需要关心关闭 cursor。

```java
@Override
public void removeBigKey(String key, int scanCount, long intervalMills) throws CacheException {
	try {
		JedisCluster jedisCluster = redisClusterTemplate.getJedisClusterInstance();
		// 游标初始值为0
		String cursor = ScanParams.SCAN_POINTER_START;
		ScanParams scanParams = new ScanParams();
		scanParams.count(scanCount);
		while (true) {
			// 每次扫描后获取新的游标
			ScanResult<Map.Entry<String, String>> scanResult = jedisCluster.hscan(key, cursor, scanParams);
			cursor = scanResult.getStringCursor();
			// 获取扫描结果为空
			List<Map.Entry<String, String>> list = scanResult.getResult();
			if (CollectionUtils.isEmpty(list)) {
				break;
			}
			// 构建多个删除的 key
			String[] fields = getFieldsKeyArray(list);
			jedisCluster.hdel(key, fields);
			// 游标为0时停止
			if (ScanParams.SCAN_POINTER_START.equals(cursor)) {
				break;
			}
			// 沉睡等待，避免对 redis 压力太大
			DateUtil.sleepInterval(intervalMills, TimeUnit.MILLISECONDS);
		}
		// 执行 key 本身的删除
		jedisCluster.del(key);
		redisClusterState.restoreErrorTimes();
	} catch (Exception e) {
		redisClusterState.incrementErrorTimes();
		//log
	}
}
```


## 异常信息

比较核心的是这一句：

```
Caused by: java.lang.IllegalStateException: Invalidated object not currently part of this pool
        at org.apache.commons.pool2.impl.GenericObjectPool.invalidateObject(GenericObjectPool.java:640) ~[commons-pool2-2.4.2.jar:2.4.2]
        at redis.clients.util.Pool.returnBrokenResourceObject(Pool.java:101) ~[jedis-2.9.0.jar:na]
```

# 原因分析

## 猜测原因

- 并发问题

参见 [Invalidated object not currently part of this pool/Could not return the resource to the pool](https://blog.csdn.net/zhangxiaoyang0/article/details/65633064)，这里提到了一种可能是并发问题。

对于个人是不适用的，因为代码全部是 spring 管理的，而且没有 static 处理。

而且在单机，没有并发的情况也出现了这个问题。

- 异常大概的原因

不能将redis连接放回池内，放回连接池的对象是无效的对象。

在网上查了很多同类错误，都说是进行了两次returnResource释放连接资源造成的，因为第一次return成功以后，第二次return就会报上面这个错误。

但是显然，我翻遍了代码并没有两次调用returnResource。

- 对象变化

在看 ["Returned object not currently part of this pool" when using mutable objects](https://issues.apache.org/jira/browse/POOL-284)
时，感觉比较符合个人的情况。

因为对象 scan 删除之后变化了，所以在释放的时候判断时出现问题。

## 源码阅读

直接根据报错信息

```
org.apache.commons.pool2.impl.GenericObjectPool.invalidateObject(GenericObjectPool.java:640)
```

找到这一行源码，如下：

```java
/*
 * All of the objects currently associated with this pool in any state. It
 * excludes objects that have been destroyed. The size of
 * {@link #allObjects} will always be less than or equal to {@link
 * #_maxActive}. Map keys are pooled objects, values are the PooledObject
 * wrappers used internally by the pool.
 */
private final Map<IdentityWrapper<T>, PooledObject<T>> allObjects = new ConcurrentHashMap<IdentityWrapper<T>, PooledObject<T>>();

public void returnObject(T obj) {
    PooledObject<T> p = allObjects.get(new IdentityWrapper<T>(obj));
    
    if (p == null) {
        if (!isAbandonedConfig()) {
            throw new IllegalStateException(
                    "Returned object not currently part of this pool");
        } else {
            return; // Object was abandoned and removed
        }
    }
    // 省略
}    


public boolean isAbandonedConfig() {
    return abandonedConfig != null;
}
```

看到这里其实可以发现，如果 isAbandonedConfig() 为真也可以跳过这个检测，但是感觉比较危险。

还有一种策略就是研究一下 `new IdentityWrapper<T>(obj)` 作为 key 的时候，如何保证内部删除后，作为 key 依然不变。

### 方面被调用的时机

核心应该还是 Jedis 关闭的时候：

```java
@Override
public void close() {
  if (dataSource != null) {
    if (client.isBroken()) {
      this.dataSource.returnBrokenResource(this);
    } else {
      this.dataSource.returnResource(this);
    }
  } else {
    client.close();
  }
}
```

## RedisTemplate 的封装

- RedisTemplate#delete 为例

```java
public Long delete(K key, Object... hashKeys) {
    final byte[] rawKey = this.rawKey(key);
    final byte[][] rawHashKeys = this.rawHashKeys(hashKeys);
    return (Long)this.execute(new RedisCallback<Long>() {
        public Long doInRedis(RedisConnection connection) {
            return connection.hDel(rawKey, rawHashKeys);
        }
    }, true);
}
```

实际调用的是 execute 方法：

```java
public <T> T execute(RedisCallback<T> action, boolean exposeConnection, boolean pipeline) {
    Assert.isTrue(this.initialized, "template not initialized; call afterPropertiesSet() before using it");
    Assert.notNull(action, "Callback object must not be null");
    RedisConnectionFactory factory = this.getConnectionFactory();
    RedisConnection conn = null;
    Object var11;
    try {
        if (this.enableTransactionSupport) {
            conn = RedisConnectionUtils.bindConnection(factory, this.enableTransactionSupport);
        } else {
            conn = RedisConnectionUtils.getConnection(factory);
        }
        boolean existingConnection = TransactionSynchronizationManager.hasResource(factory);
        RedisConnection connToUse = this.preProcessConnection(conn, existingConnection);
        boolean pipelineStatus = connToUse.isPipelined();
        if (pipeline && !pipelineStatus) {
            connToUse.openPipeline();
        }
        RedisConnection connToExpose = exposeConnection ? connToUse : this.createRedisConnectionProxy(connToUse);
        T result = action.doInRedis(connToExpose);
        if (pipeline && !pipelineStatus) {
            connToUse.closePipeline();
        }
        var11 = this.postProcessResult(result, connToUse, existingConnection);
    } finally {
        RedisConnectionUtils.releaseConnection(conn, factory);
    }
    return var11;
}
```


# 验证自己的想法

## 初始化

准备测试数据

```java
Jedis jedis = new Jedis("IP", 6379,5000);
jedis.auth("PWD");

final String key = "20200520_KEY";

for(int i = 0; i < 999; i++) {
	jedis.hset(key, "key-"+i, "val-"+i);
}
```

## 本地 DEBUG

发现第一次释放 cursor 就已经报错了，这个比较令我感到意外。


# 解决方案


# 拓展阅读

[Redis 分布式锁](https://houbb.github.io/2019/01/07/redis-lock)

# 参考资料

[github-Fix Pool (and JedisSentinelPool) 's race condition ](https://github.com/xetorthio/jedis/pull/517#discussion_r9344952)

[github-Multi-threaded env - Invalidated object not currently part of this pool](https://github.com/xetorthio/jedis/issues/921)

["Returned object not currently part of this pool" when using mutable objects](https://issues.apache.org/jira/browse/POOL-284)

[Invalidated object not currently part of this pool/Could not return the resource to the pool](https://blog.csdn.net/zhangxiaoyang0/article/details/65633064)

[使用Jedis操作Redis数据库时Could not return the resource to the pool](https://www.jianshu.com/p/713bbc90f166)

[jedis--Could not return the resource to the pool解决之路](https://blog.csdn.net/u010820431/article/details/81478967)

[记一次jedis并发使用问题JedisException: Could not return the resource to the pool](https://blog.csdn.net/zengfanwei1990/article/details/80885988)

[spring整合redis使用RedisTemplate的坑Could not get a resource from the pool](https://www.cnblogs.com/DDgougou/p/10268206.html)

* any list
{:toc}