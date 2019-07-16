---
layout: post
title: Redis Learn-15-04-java 代码
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, sh]
published: true
---

# MyListener

要使用Jedis的Publish/Subscribe功能，必须编写对JedisPubSub的自己的实现。

```java
package redis.subpub;

import redis.clients.jedis.JedisPubSub;

public class MyListener extends JedisPubSub {

	// 取得订阅的消息后的处理  
	@Override
	public void onMessage(String channel, String message) {
		// TODO Auto-generated method stub
		System.out.println(channel + "=" + message);
	}

	// 取得按表达式的方式订阅的消息后的处理  
	@Override
	public void onPMessage(String pattern, String channel, String message) {
		// TODO Auto-generated method stub
		System.out.println(pattern + ":" + channel + "=" + message);
	}
	
	// 初始化订阅时候的处理  
	@Override
	public void onSubscribe(String channel, int subscribedChannels) {
		// TODO Auto-generated method stub
		System.out.println("初始化 【频道订阅】 时候的处理  ");
	}
	// 取消订阅时候的处理  
	@Override
	public void onUnsubscribe(String channel, int subscribedChannels) {
		// TODO Auto-generated method stub
		System.out.println("// 取消 【频道订阅】 时候的处理  ");
	}

	
	// 初始化按表达式的方式订阅时候的处理  
	@Override
	public void onPSubscribe(String pattern, int subscribedChannels) {
		// TODO Auto-generated method stub
		System.out.println("初始化 【模式订阅】 时候的处理  ");
	}
	// 取消按表达式的方式订阅时候的处理  
	@Override
	public void onPUnsubscribe(String pattern, int subscribedChannels) {
		// TODO Auto-generated method stub
		System.out.println("取消 【模式订阅】 时候的处理  ");
	}
}
```

# Sub

```java
public class Sub {
	public static void main(String[] args) {
		try {
			Jedis jedis = getJedis();
			MyListener ml = new MyListener();
			
			//可以订阅多个频道 
			//jedis.subscribe(ml, "liuxiao","hello","hello_liuxiao","hello_redis");
			//jedis.subscribe(ml, new String[]{"hello_foo","hello_test"});  
			//这里启动了订阅监听，线程将在这里被阻塞  
			//订阅得到信息在lister的onPMessage(...)方法中进行处理  
			
			
			//使用模式匹配的方式设置频道  
			jedis.psubscribe(ml, new String[]{"hello_*"});
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
```

> 调用 subscribe() 或 psubscribe() 时，当前线程都会阻塞。

# Pub

```java
public class Pub {
	public static void main(String[] args) {
		try {
			Jedis jedis = getJedis();
			jedis.publish("hello_redis","hello_redis");
			
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
```

## 官方

[Redis 订阅与发布](https://lanjingling.github.io/2015/11/20/redis-pub-sub/)

* any list
{:toc}