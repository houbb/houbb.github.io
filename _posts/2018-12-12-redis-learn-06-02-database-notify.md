---
layout: post
title: Redis Learn-06-02-Keyspace Notifications 过期提醒
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, sh]
published: true
---

# Keyspace Notifications

redis自2.8.0之后版本提供Keyspace Notifications功能，允许客户订阅Pub / Sub频道，以便以某种方式接收影响Redis数据集的事件。

可能收到的事件的例子如下： 
所有影响给定键的命令。 
所有接收LPUSH操作的密钥。 
所有密钥在数据库中过期0。

因为 Redis 目前的订阅与发布功能采取的是发送即忘（fire and forget）策略， 所以如果你的程序需要可靠事件通知（reliable notification of events）， 那么目前的键空间通知可能并不适合你：当订阅事件的客户端断线时， 它会丢失所有在断线期间分发给它的事件。

并不能确保消息送达。

未来有计划允许更可靠的事件传递，但可能这将在更一般的层面上解决，或者为Pub / Sub本身带来可靠性，或者允许Lua脚本拦截Pub / Sub消息来执行诸如推送将事件列入清单。

# 事件类型

对于每个修改数据库的操作，键空间通知都会发送两种不同类型的事件消息：keyspace 和 keyevent。

以 keyspace 为前缀的频道被称为键空间通知（key-space notification），而以 keyevent 为前缀的频道则被称为键事件通知（key-event notification）。

事件是用  `__keyspace@DB__:KeyPattern` 或者  `__keyevent@DB__:OpsType` 的格式来发布消息的。

DB表示在第几个库；KeyPattern则是表示需要监控的键模式（可以用通配符，如：`__key*__:*`）；OpsType则表示操作类型。

因此，如果想要订阅特殊的Key上的事件，应该是订阅 keyspace。

比如说，对 0 号数据库的键 mykey 执行 DEL 命令时， 系统将分发两条消息， 相当于执行以下两个 PUBLISH 命令：

```
PUBLISH __keyspace@0__:sampleKey del
PUBLISH __keyevent@0__:del sampleKey
```

订阅第一个频道 `__keyspace@0__:mykey` 可以接收 0 号数据库中所有修改键 mykey 的事件， 
而订阅第二个频道 `__keyevent@0__:del` 则可以接收 0 号数据库中所有执行 del 命令的键。

# 开启配置

键空间通知通常是不启用的，因为这个过程会产生额外消耗。

所以在使用该特性之前，请确认一定是要用这个特性的，然后修改配置文件，或使用config配置。

相关配置项如下：

| 字符	| 发送通知 | 
|:---|:---|
| K	    | 键空间通知，所有通知以 keyspace@ 为前缀，针对Key |
| E	    | 键事件通知，所有通知以 keyevent@ 为前缀，针对event |
| g	    | DEL 、 EXPIRE 、 RENAME 等类型无关的通用命令的通知 |
| $	    | 字符串命令的通知 |
| l	    | 列表命令的通知 |
| s	    | 集合命令的通知 |
| h	    | 哈希命令的通知 |
| z	    | 有序集合命令的通知 |
| x	    | 过期事件：每当有过期键被删除时发送 |
| e	    | 驱逐(evict)事件：每当有键因为 maxmemory 政策而被删除时发送 |
| A	    | 参数 g$lshzxe 的别名，相当于是All |

输入的参数中至少要有一个 K 或者 E ， 否则的话， 不管其余的参数是什么， 都不会有任何通知被分发。

上表中斜体的部分为通用的操作或者事件，而黑体则表示特定数据类型的操作。

配置文件中修改 notify-keyspace-events “Kx”，注意：这个双引号是一定要的，否则配置不成功，启动也不报错。例如，“Kx”表示想监控某个Key的失效事件。

也可以通过config配置：CONFIG set notify-keyspace-events Ex （但非持久化）

Redis 使用以下两种方式删除过期的键：

1.当一个键被访问时，程序会对这个键进行检查，如果键已经过期，那么该键将被删除。

2.底层系统会在后台查找并删除那些过期的键，从而处理那些已经过期、但是不会被访问到的键。

当过期键被以上两个程序的任意一个发现、 并且将键从数据库中删除时， Redis 会产生一个 expired 通知。

Redis 并不保证生存时间（TTL）变为 0 的键会立即被删除： 如果程序没有访问这个过期键， 或者带有生存时间的键非常多的话， 那么在键的生存时间变为 0 ， 直到键真正被删除这中间， 可能会有一段比较显著的时间间隔。

因此， Redis 产生 expired 通知的时间为过期键被删除的时候， 而不是键的生存时间变为 0 的时候。

由于通知收到的是redis key，value已经过期，无法收到，所以需要在key上标记业务数据。

# 实现步骤

## 核心步骤

1. 修改配置：键空间通知功能耗费CPU，默认关闭，需要修改配置文件redis.conf或 操作CONFIG SET命令，设置notify-keyspace-events选项，来启用或关闭该功能。

2. 对Redis实例进行发布订阅，指定监听类和监听事件类型

3. 监听类继承JedisPubSub，实现相应操作；
 
4. 客户端进行操作，以触发订阅事件发生。

## 代码实战

### maven 引入

```xml
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>2.6.2</version>
</dependency>
```

### 验证代码

```java
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;
import redis.clients.jedis.JedisPubSub;

import java.util.List;

public class notifyTest {

    public static void main(String[] args) {
        JedisPool pool = new JedisPool(new JedisPoolConfig(), "127.0.0.1");

        Jedis jedis = pool.getResource();
        config(jedis);//建议在redis配置文件中设置

        jedis.psubscribe(new KeyExpiredListener(), "__keyevent@0__:expired");//过期队列
    }

    private static void config(Jedis jedis){
        String parameter = "notify-keyspace-events";
        List<String> notify = jedis.configGet(parameter);
        if(notify.get(1).equals("")){
            jedis.configSet(parameter, "Ex"); //过期事件
        }
    }
}

class KeyExpiredListener extends JedisPubSub {
    @Override
    public void onPSubscribe(String pattern, int subscribedChannels) {
        System.out.println("onPSubscribe " + pattern + " " + subscribedChannels);
    }

    @Override
    public void onPMessage(String pattern, String channel, String message) {
    System.out.println(
        "pattern = [" + pattern + "], channel = [" + channel + "], message = [" + message + "]");
    //收到消息 key的键值，处理过期提醒
    }
}
```

# SpringBott 整合

## 概览

当然这种可以和 spring 进行整合。

## Redis的配置

1. 修改conf文件

2. notify-keyspace-events "Ex"

3. 该配置表示监听key的过期事件，默认未开启

4. 该配置的其他信息（可以监听N多事件），可以参阅配置文件的注释，非常详细

## 自定义监听器

该监听器会在 key 过期时候触发

```java
import java.nio.charset.StandardCharsets;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.listener.KeyExpirationEventMessageListener;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

public class KeyExpiredListener extends KeyExpirationEventMessageListener {

	private static final Logger LOGGER = LoggerFactory.getLogger(KeyExpiredListener.class);

	public KeyExpiredListener(RedisMessageListenerContainer listenerContainer) {
		super(listenerContainer);
	}

	@Override
	public void onMessage(Message message, byte[] pattern) {
		String channel = new String(message.getChannel(),StandardCharsets.UTF_8);
		//过期的key
		String key = new String(message.getBody(),StandardCharsets.UTF_8);
		LOGGER.info("redis key 过期：pattern={},channel={},key={}",new String(pattern),channel,key);
	}
}
```

## @Configuration 配置

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

import io.javaweb.redis.listener.KeyExpiredListener;

@Configuration
public class RedisConfiguration {
 
	@Autowired 
	private RedisConnectionFactory redisConnectionFactory;
	
	@Bean
	public RedisMessageListenerContainer redisMessageListenerContainer() {
		RedisMessageListenerContainer redisMessageListenerContainer = new RedisMessageListenerContainer();
		redisMessageListenerContainer.setConnectionFactory(redisConnectionFactory);
		return redisMessageListenerContainer;
	}
	
	@Bean
	public KeyExpiredListener keyExpiredListener() {
		return new KeyExpiredListener(this.redisMessageListenerContainer());
	}
}
```

# 参考资料

[如何利用 redis key 过期事件实现过期提醒](https://blog.csdn.net/zhu_tianwei/article/details/80169900)

[SpringBoot监听Redis的Key过期事件](https://springboot.io/t/topic/24)

* any list
{:toc}