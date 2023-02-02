---
layout: post
title: java 从零实现 redis 分布式锁 
date:  2018-09-08 11:07:16 +0800
categories: [Distributed]
tags: [distributed, redis, lock, sh]
published: true
---

> 点赞再看，已成习惯。

![Redis分布式锁](https://images.gitee.com/uploads/images/2020/1017/210402_f2c09371_508704.png)

# 为什么需要分布式锁

在 jdk 中为我们提供了加锁的方式：

（1）synchronized 关键字

（2）volatile + CAS 实现的乐观锁

（3）ReadWriteLock 读写锁

（4）ReenTrantLock 可重入锁

等等，这些锁为我们变成提供极大的便利性，保证在多线程的情况下，保证线程安全。

但是在分布式系统中，上面的锁就统统没用了。

我们想要解决分布式系统中的并发问题，就需要引入分布式锁的概念。

上一节我们已经对分布式锁原理进行了详细讲解，参见：

> [redis 分布式锁原理详解](https://houbb.github.io/2019/01/07/redis-learn-41-lock)

# java 代码实现

## 创作动机

首先是对锁实现原理的一个实现，理论指导实践，实践完善理论。

晚上关于 redis 分布式锁的文章一大堆，但是也都稂莠不齐。

redis 分布式锁工具有时候中间件团队不见得会提供，提供了也不见得经常维护，不如自己实现一个，知道原理，也方便修改。


## 接口定义

为了便于和 JDK 复用，我们让接口继承自 jdk 的 `Lock` 接口。

```java
package com.github.houbb.lock.api.core;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;

/**
 * 锁定义
 * @author binbin.hou
 * @since 0.0.1
 */
public interface ILock extends Lock {

    /**
     * 尝试加锁
     * @param time 时间
     * @param unit 当为
     * @param key key
     * @return 返回
     * @throws InterruptedException 异常
     * @since 0.0.1
     */
    boolean tryLock(long time, TimeUnit unit,
                    String key) throws InterruptedException;

    /**
     * 尝试加锁
     * @param key key
     * @return 返回
     * @since 0.0.1
     */
    boolean tryLock(String key);

    /**
     * 解锁
     * @param key key
     * @since 0.0.1
     */
    void unlock(String key);

}
```


方法我们只添加了三个比较常用的核心方法，作为第一个版本，简单点。

后续陆续添加即可。

## 抽象实现

为了便于后期添加更多的所实现，这里首先实现了一个公用的抽象父类。

```java
package com.github.houbb.lock.redis.core;

import com.github.houbb.lock.api.core.ILock;
import com.github.houbb.lock.redis.constant.LockRedisConst;
import com.github.houbb.wait.api.IWait;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Condition;

/**
 * 抽象实现
 * @author binbin.hou
 * @since 0.0.1
 */
public abstract class AbstractLockRedis implements ILock {

    /**
     * 锁等待
     * @since 0.0.1
     */
    private final IWait wait;

    protected AbstractLockRedis(IWait wait) {
        this.wait = wait;
    }

    @Override
    public void lock() {
        throw new UnsupportedOperationException();
    }

    @Override
    public void lockInterruptibly() throws InterruptedException {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean tryLock() {
        return tryLock(LockRedisConst.DEFAULT_KEY);
    }

    @Override
    public void unlock() {
        unlock(LockRedisConst.DEFAULT_KEY);
    }

    @Override
    public boolean tryLock(long time, TimeUnit unit, String key) throws InterruptedException {
        long startTimeMills = System.currentTimeMillis();

        // 一次获取，直接成功
        boolean result = this.tryLock(key);
        if(result) {
            return true;
        }

        // 时间判断
        if(time <= 0) {
            return false;
        }
        long durationMills = unit.toMillis(time);
        long endMills = startTimeMills + durationMills;

        // 循环等待
        while (System.currentTimeMillis() < endMills) {
            result = tryLock(key);
            if(result) {
                return true;
            }

            // 等待 10ms
            wait.wait(TimeUnit.MILLISECONDS, 10);
        }
        return false;
    }

    @Override
    public synchronized boolean tryLock(long time, TimeUnit unit) throws InterruptedException {
        return tryLock(time, unit, LockRedisConst.DEFAULT_KEY);
    }

    @Override
    public Condition newCondition() {
        throw new UnsupportedOperationException();
    }

}
```

最核心的实际上是 `public boolean tryLock(long time, TimeUnit unit, String key) throws InterruptedException` 方法。

这个方法会调用 `this.tryLock(key)` 获取锁，如果成功，直接返回；如果不成功，则循环等待。

这里设置了超时时间，如果超时，则直接返回 true。

## redis 锁实现

我们实现的 redis 分布锁，继承自上面的抽象类。

```java
package com.github.houbb.lock.redis.core;

import com.github.houbb.heaven.util.lang.StringUtil;
import com.github.houbb.id.api.Id;
import com.github.houbb.id.core.util.IdThreadLocalHelper;
import com.github.houbb.lock.redis.constant.LockRedisConst;
import com.github.houbb.lock.redis.exception.LockRedisException;
import com.github.houbb.lock.redis.support.operator.IOperator;
import com.github.houbb.wait.api.IWait;

/**
 * 这里是基于 redis 实现
 *
 * 实际上也可以基于 zk/数据库等实现。
 *
 * @author binbin.hou
 * @since 0.0.1
 */
public class LockRedis extends AbstractLockRedis {

    /**
     * redis 操作实现
     * @since 0.0.1
     */
    private final IOperator redisOperator;

    /**
     * 主键标识
     * @since 0.0.1
     */
    private final Id id;

    public LockRedis(IWait wait, IOperator redisOperator, Id id) {
        super(wait);
        this.redisOperator = redisOperator;
        this.id = id;
    }

    @Override
    public boolean tryLock(String key) {
        final String requestId = id.id();
        IdThreadLocalHelper.put(requestId);

        return redisOperator.lock(key, requestId, LockRedisConst.DEFAULT_EXPIRE_MILLS);
    }

    @Override
    public void unlock(String key) {
        final String requestId = IdThreadLocalHelper.get();
        if(StringUtil.isEmpty(requestId)) {
            String threadName = Thread.currentThread().getName();
            throw new LockRedisException("Thread " + threadName +" not contains requestId");
        }

        boolean unlock = redisOperator.unlock(key, requestId);
        if(!unlock) {
            throw new LockRedisException("Unlock key " + key + " result is failed!");
        }
    }
}
```

这里就是 redis 锁的核心实现了，如果不太理解，建议回顾一下原理篇：

> [redis 分布式锁原理详解](https://houbb.github.io/2019/01/07/redis-learn-41-lock)

### 加锁

加锁部分，这里会生成一个 id 标识，用于区分当前操作者。

为了安全也设置了默认的超时时间。

当然这里是为了简化调用者的使用成本，开发在使用的时候只需要关心自己要加锁的 key 即可。

当然，甚至连加锁的 key 都可以进一步抽象掉，比如封装 `@DistributedLock` 放在方法上，即可实现分布式锁。这个后续有时间可以拓展，原理也不难。

### 解锁

解锁的时候，就会获取当前进程的持有标识。

凭借当前线程持有的 id 标识，去解锁。

## IOperator

我们对 redis 的操作进行了抽象，为什么抽象呢？

因为 redis 服务种类实际很多，可以是 redis 单点，集群，主从，哨兵。

连接的客户端也可以很多，jedis，spring redisTemplate, codis, redisson 等等。

这里为了后期拓展方便，就对操作进行了抽象。

### 接口

定义接口如下：

```java
package com.github.houbb.lock.redis.support.operator;

/**
 * Redis 客户端
 * @author binbin.hou
 * @since 0.0.1
 */
public interface IOperator {

    /**
     * 尝试获取分布式锁
     *
     * @param lockKey    锁
     * @param requestId  请求标识
     * @param expireTimeMills 超期时间
     * @return 是否获取成功
     * @since 0.0.1
     */
    boolean lock(String lockKey, String requestId, int expireTimeMills);

    /**
     * 解锁
     * @param lockKey 锁 key
     * @param requestId 请求标识
     * @return 结果
     * @since 0.0.1
     */
    boolean unlock(String lockKey, String requestId);

}
```

### jedis 实现

我们实现一个 jedis 单点版本的：

```java
package com.github.houbb.lock.redis.support.operator.impl;

import com.github.houbb.lock.redis.constant.LockRedisConst;
import com.github.houbb.lock.redis.support.operator.IOperator;
import redis.clients.jedis.Jedis;

import java.util.Collections;

/**
 * Redis 客户端
 * @author binbin.hou
 * @since 0.0.1
 */
public class JedisOperator implements IOperator {

    /**
     * jedis 客户端
     * @since 0.0.1
     */
    private final Jedis jedis;

    public JedisOperator(Jedis jedis) {
        this.jedis = jedis;
    }

    /**
     * 尝试获取分布式锁
     *
     * expireTimeMills 保证当前进程挂掉，也能释放锁
     *
     * requestId 保证解锁的是当前进程（锁的持有者）
     *
     * @param lockKey         锁
     * @param requestId       请求标识
     * @param expireTimeMills 超期时间
     * @return 是否获取成功
     * @since 0.0.1
     */
    @Override
    public boolean lock(String lockKey, String requestId, int expireTimeMills) {
        String result = jedis.set(lockKey, requestId, LockRedisConst.SET_IF_NOT_EXIST, LockRedisConst.SET_WITH_EXPIRE_TIME, expireTimeMills);
        return LockRedisConst.LOCK_SUCCESS.equals(result);
    }

    /**
     * 解锁
     *
     * （1）使用 requestId，保证为当前锁的持有者
     * （2）使用 lua 脚本，保证执行的原子性。
     *
     * @param lockKey   锁 key
     * @param requestId 请求标识
     * @return 结果
     * @since 0.0.1
     */
    @Override
    public boolean unlock(String lockKey, String requestId) {
        String script = "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";
        Object result = jedis.eval(script, Collections.singletonList(lockKey), Collections.singletonList(requestId));
        return LockRedisConst.RELEASE_SUCCESS.equals(result);
    }

}
```

这里时最核心的部分。

别看简单几行代码，需要注意的点还是很多的。

### 加锁

加锁时附带 requestId，用来标识自己为锁的持有者。

SETNX 当 key 不存在时才进行加锁。

设置加锁的过期时间，避免因异常等原因未释放锁，导致锁的长时间占用。

### 解锁

使用 lua 脚本，保证操作的原子性。

为了证明为锁的持有者，传入 requestId。

## 测试验证

### maven 引入

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>lock-core</artifactId>
    <version>0.0.1</version>
</dependency>
```

### 测试代码

```java
Jedis jedis = new Jedis("127.0.0.1", 6379);
IOperator operator = new JedisOperator(jedis);

// 获取锁
ILock lock = LockRedisBs.newInstance().operator(operator).lock();

try {
    boolean lockResult = lock.tryLock();
    System.out.println(lockResult);
    // 业务处理
} catch (Exception e) {
    e.printStackTrace();
} finally {
    lock.unlock();
}
```


# 其他的实现方式

## 基于函数接口的实现

优点：使用相对简单

缺点：基于回调，导致有时候使用反而变得麻烦。要求 jdk1.8+

### 源码

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.LockSupport;

@FunctionalInterface
public interface DistributedLock {

    Logger LOGGER = LoggerFactory.getLogger(DistributedLock.class);

    /**
     * 超时时间（单位毫秒）
     */
    Long TIMEOUT = 10000L;

    /**
     * 重试间隔（单位毫秒）
     */
    Long RETRY_INTERVAL = 200L;

    /**
     * 获取锁从成功的回调
     */
    void onSuccess();

    /**
     * 获取锁
     *
     * @param lockId
     */
    default void getLock(String lockId) {
        getLock(lockId, TIMEOUT);
    }

    /**
     * 获取锁
     *
     * @param lockId
     * @param timeout
     */
    default void getLock(String lockId, Long timeout) {
        BaseRedisManager redisManager = SpringContext.getBean(BaseRedisManager.class);
        boolean getLock = false;
        try {
            if (getRedisLock(redisManager, lockId, timeout)) {
                getLock = true;
                onSuccess();
                return;
            }
        } catch (RuntimeException e) {
            // 业务异常，抛出去
            throw e;
        } catch (Exception e) {
            LOGGER.error("获取分布式锁异常，key={}", lockId, e);
            Thread.currentThread().interrupt();
        } finally {
            if (getLock) {
                //PS: 这里的删除，某种角度是存在问题的。
                redisManager.delete(lockId);
            }
        }
        onTimeout(lockId);
    }

    /**
     * 超时
     *
     * @param lockId
     */
    default void onTimeout(String lockId) {
        LOGGER.warn("获取分布式锁超时, lockId={}", lockId);
        throw new BizException(ErrorCode.TIMEOUT);
    }

    /**
     * 获取redis锁
     *
     * @param redisManager
     * @param lockId
     * @param timeout
     * @return
     */
    default boolean getRedisLock(BaseRedisManager redisManager, String lockId, Long timeout) {
        long startTime = System.currentTimeMillis();
        while (!redisManager.getLock(lockId)) {
            if (System.currentTimeMillis() - startTime > timeout) {
                return false;
            }
            LockSupport.parkNanos(TimeUnit.MILLISECONDS.toNanos(RETRY_INTERVAL));
        }
        return true;
    }
}
```

### 使用

- 定义锁

```java
@FunctionalInterface
public interface CoreAccountLock extends DistributedLock {

    /**
     * 尝试获取锁
     *
     * @param userId
     */
    default CoreAccountLock lock(String userId) {
        getLock(RedisKeys.LOCK_ACCOUNT + userId);
        return this;
    }
}
```

- 使用

```java
final String userId = req.getUserId();
((CoreAccountLock) () -> {
    // 处理....

}).lock(userId);
```

ps: 这里如果需要处理的结果，就会变得不那么方便。


## 基于 springTemplate 的实现

优点：相对方便

缺点：整合 spring 

```java
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisCluster;
import redis.clients.jedis.JedisCommands;

import java.util.ArrayList;
import java.util.List;

/**
 * 分布式锁
 */
@Component
@Slf4j
public class RedisDistributedLock{
 
    @Autowired
	private StringRedisTemplate redisTemplate;
 
    public static final String UNLOCK_LUA;
 
    static {
        StringBuilder sb = new StringBuilder();
        sb.append("if redis.call(\"get\",KEYS[1]) == ARGV[1] ");
        sb.append("then ");
        sb.append("    return redis.call(\"del\",KEYS[1]) ");
        sb.append("else ");
        sb.append("    return 0 ");
        sb.append("end ");
        UNLOCK_LUA = sb.toString();
    }
 
    public boolean setLock(String key,String value, long expire) {
        try {
            RedisCallback<String> callback = new RedisCallback<String>() {
				
				@Override
				public String doInRedis(RedisConnection connection) throws DataAccessException {
					JedisCommands commands = (JedisCommands) connection.getNativeConnection();
					 return commands.set(key, value, "NX", "PX", expire);
				}
			};
            String result = redisTemplate.execute(callback);
           
            return StringUtils.isNotBlank(result);
        } catch (Exception e) {
            log.error("set redis occured an exception", e);
        }
        return false;
    }
 
    public String get(String key) {
        try {
            RedisCallback<String> callback = new RedisCallback<String>() {
				
				@Override
				public String doInRedis(RedisConnection connection) throws DataAccessException {
					JedisCommands commands = (JedisCommands) connection.getNativeConnection();
	                return commands.get(key);
				}
			};
            String result = redisTemplate.execute(callback);
            return result;
        } catch (Exception e) {
            log.error("get redis occured an exception", e);
        }
        return "";
    }
 
    public boolean releaseLock(String key,String requestId) {
        // 释放锁的时候，有可能因为持锁之后方法执行时间大于锁的有效期，此时有可能已经被另外一个线程持有锁，所以不能直接删除
        try {
            List<String> keys = new ArrayList<>();
            keys.add(key);
            List<String> args = new ArrayList<>();
            args.add(requestId);
 
            // 使用lua脚本删除redis中匹配value的key，可以避免由于方法执行时间过长而redis锁自动过期失效的时候误删其他线程的锁
            // spring自带的执行脚本方法中，集群模式直接抛出不支持执行脚本的异常，所以只能拿到原redis的connection来执行脚本
            RedisCallback<Long> callback = new RedisCallback<Long>() {
				
				@Override
				public Long doInRedis(RedisConnection connection) throws DataAccessException {
					 Object nativeConnection = connection.getNativeConnection();
	                // 集群模式和单机模式虽然执行脚本的方法一样，但是没有共同的接口，所以只能分开执行
	                // 集群模式
	                if (nativeConnection instanceof JedisCluster) {
	                    return (Long) ((JedisCluster) nativeConnection).eval(UNLOCK_LUA, keys, args);
	                }
	                // 单机模式
	                else if (nativeConnection instanceof Jedis) {
	                    return (Long) ((Jedis) nativeConnection).eval(UNLOCK_LUA, keys, args);
	                }
	                return 0L;
				}
			};
            Long result = redisTemplate.execute(callback);
            return result != null && result > 0;
        } catch (Exception e) {
            log.error("release lock occured an exception", e);
        } 
        return false;
    }
}
```

`UNLOCK_LUA` 和前面其实是一样的，支持拆分为多行，更加便于阅读。


# 直接改进的点

当然还有很多可以改进的地方：

（1）比如引入递增的 sequence，避免分布式锁中的 GC 导致的问题

（2）对于更多 redis 服务端+客户端的支持

（3）对于注解式 redis 分布式锁的支持

## 其他

锁的加锁时间应该多久？

如果太短，可能还没有执行完成，锁就被释放了。导致数据不一致！

如果太长，可能会导致释放锁失败时，导致无法释放。（此时，如果采取另外一个线程，清理。可能也会引发类似的问题）

ps: 引入看门狗的机制？

# 小结

到这里，一个简单版本的 redis 分布式锁就实现完成了。

希望对你有帮助，感兴趣的可以关注一下，便于实时接收最新内容。

觉得本文对你有帮助的话，欢迎点赞评论收藏转发一波。

各位**极客**的点赞转发收藏，是我创作的最大动力~

不知道你有哪些收获呢？或者有其他更多的想法，欢迎留言区和我一起讨论，期待与你的思考相遇。

文中如果链接失效，可以点击 {阅读原文}。

* any list
{:toc}