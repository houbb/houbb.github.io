---
layout: post
title:  SpringCloud微服务实战（完）-20优惠券如何避免超兑——引入分布式锁
date:   2015-01-01 23:20:27 +0800
categories: [SpringCloud微服务实战（完）]
tags: [SpringCloud微服务实战（完）, other]
published: true
---



20 优惠券如何避免超兑——引入分布式锁
会员办理月卡或签到累积的积分，可以在指定时间段内兑换商场优惠券，由于数量有限，时间有限，兑换操作相当集中，如果按正常流程处理的话，肯定会出现超兑的情况。比如只有 5000 张券，结果兑换出 8000 张，这对商场来说是一笔经济损失。

为防止超兑，自然做法是按总量一个接一个兑换，至到兑换完，但多并发的情况下如何保证还一个一个兑换呢？自然而然就会想到锁上面来。提及锁，你脑海是不是出现了一堆关于锁的场景：死锁、互斥锁、乐观锁、悲观锁等等，本节介绍分布式锁，它主要应用于分布式系统下面，单体应用基本不会涉及。

### 两种实现机制介绍

常见的实现方法分布式锁可以基于数据库、Redis、Zookeeper 等第三方工具来实现，各种不同实现方式需要引入第三方，截止目前 MySQL 及 Redis 已经引入到实战中，为降低系统复杂度，我们想办法基于这两个机制进行分布式锁实现。

* 采用数据库实现分布式锁，还记得前面《分布式定时任务》章节吗？里面就用到分布式锁。为保证指定时刻下多实例定时任务的执行，优先通过 ShedLock 的方式获取锁，锁产生在公共存储库中，生成一条新记录来告诉其它集群中其它实例，我正在执行，其它实例获取到这个状态后，自动跳过不再执行，来保证同一时刻只有一个任务在执行。
* 采用 Redis 实现分布式锁。Redis 提供了 setnx 指令，保证同一时刻内只有一个请求针对同一 key 进行 setnx 操作，鉴于 Redis 是单线程模式，依旧是先到先得，晚到不得，通过这个操作可以实现排它性的操作。

但此做法存在漏洞，操作 key 后，指令发起方挂掉的话，这个 key 就永远不能被操作了。稍做改进，给 key 设置失效时间，这样就可以到期自动释放，供其它操作。但依旧有漏洞，在 setnx 后，发起 expire 前服务挂了，这种方式依旧与第一处方式类似。

细查 Redis 官方指令后，发现 set 指令后还跟有

[EX seconds|PX milliseconds] [NX|XX] [KEEPTTL]
等选项，可以针对第二种方式用此方式进一步改进。在单实例 Redis 的情况下，在实例可用的情况下，取锁、释放锁操作已经基本可用。

Redis 另外提供了一种 Redlock 算法来实现分面式锁，有兴趣的朋友可看[原文](https://redis.io/topics/distlock)（[中文版本](http://www.redis.cn/topics/distlock.html)），在单实例无法保证可用的情况下，通过集群中多实例来有效防止单点故障导致锁不可用。大致意思是同某一时刻，向所有实例发起加锁请求，如果获取到 N/2+1 个锁表示成功，否则失败并自动解锁所有实例，到达锁失效期后同样去解锁所有实例。

如果是自己去实现这一套算法的话，想必还是比较复杂的，庆幸的是有非常好的成品，已经帮我们完成了。这就是本篇要提到的 Redission 客户端，里面有 Redlock 分布式锁的完整实现。

### 什么是 Redisson

Redis 的三大 Java 客户端之一，其它两个是：Jedis 和 Lettuce（SpringBoot 2.x 之后就将默认集成的 Jedis 客户端替换成 Lettuce）。不仅提供了一系列的分布式的 Java 常用对象，还提供了许多分布式服务。Redisson 的宗旨是促进使用者对 Redis 的关注分离（Separation of Concern），从而让使用者能够将精力更集中地放在处理业务逻辑上。

更多介绍参见官网：[redisson](https://github.com/redisson/redisson)。

### 引入 Redisson

由于我们使用的框架是 Spring Boot 搭建的，这里同样采用 starter 的方式引入（不再需要 spring-data-redis 模块）：
<dependency> <groupId>org.redisson</groupId> <artifactId>redisson-spring-boot-starter</artifactId> <version>3.11.6</version> </dependency>

配置文件采用 redis 的默认配置方式，可以兼容：

/#redis config spring.redis.database=2 spring.redis.host=localhost spring.redis.port=16479 /#default redis password is empty spring.redis.password=zxcvbnm,./ spring.redis.timeout=60000 spring.redis.pool.max-active=1000 spring.redis.pool.max-wait=-1 spring.redis.pool.max-idle=10 spring.redis.pool.min-idle=5

### 代码编写、测试

这里编写了一个启动类，将本次兑换优惠券总可兑换数量写入缓存，每次采用原子操作进行减少。
@Component @Order(0) public class StartupApplicatonRunner implements ApplicationRunner { @Autowired Redisson redisson; @Override public void run(ApplicationArguments args) throws Exception { RAtomicLong atomicLong = redisson.getAtomicLong(ParkingConstant.cache.grouponCodeAmtKey); atomicLong.set(ParkingConstant.cache.grouponCodeAmt); } }

在兑换逻辑中，判断优惠券可用数量，兑换结束后数量减 1：

@Autowired Redisson redisson; @Override public int createExchange(String json) throws BusinessException { Exchange exchange = JSONObject.parseObject(json, Exchange.class); int rtn = 0; // 兑换类型有两部分，0 是商场优惠券，1 是洗车券，这是作了简单区分 if (exchange.getCtype() == 0) { RAtomicLong atomicLong = redisson.getAtomicLong(ParkingConstant.cache.grouponCodeAmtKey); // 获取锁 RLock rLock = redisson.getLock(ParkingConstant.lock.exchangeCouponLock); // 锁定，默认 10s 不主动解锁的话，自动解锁，防止出现死锁的情况。正常情况下可基于 redisson 获取 redLock 处理，更加安全，本测试基于单机 redis 测试。 rLock.lock(1000, TimeUnit.SECONDS); log.info("lock it when release ..."); // 判定可兑换数量，如果有就兑换，兑换结束数量减一 if (atomicLong.get() > 0) { rtn = exchangeMapper.insertSelective(exchange); atomicLong.decrementAndGet(); } // 释放锁 rLock.unlock(); log.info("exchage coupon ended ..."); } else { rtn = exchangeMapper.insertSelective(exchange); } log.debug("create exchage ok = " + exchange.getId()); return rtn; }

简单测试，将 lock 时间设置个较长时间，利用断点来测试（也可以采用前面介绍到的 Postman 的方式进行并发测试）。

* 准备两个实例，一个实例构建成 jar 运行，一个实例在 IDE 中运行。
* 在 if 判定处打断点，在 IDE 中启动第一个实例，请求 lock 后，不向下运行。
* 启动 jar 实例，发起第二个请求，可以看到日志并未输出

_lock it when release …_
，而是一直在等待。
* 将 IDE 中的断点跳过，执行结束，自动释放锁。回头看 jar 实例的日志输出，可以看到两个日志正常输出。

这样就达到分布锁的目标，实际应用中锁定时间肯定比较短，否则服务会被拖垮，很类似秒杀的场景，但杀场景更复杂，还需要其它辅助手段，不能如此简单处理。文中只提到 Redission 的这一种锁的用法，文后留个小作业吧，你再研究下 Redission 还有没有其它场景下的用法。




# 参考资料

https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/SpringCloud%e5%be%ae%e6%9c%8d%e5%8a%a1%e5%ae%9e%e6%88%98%ef%bc%88%e5%ae%8c%ef%bc%89/20%20%e4%bc%98%e6%83%a0%e5%88%b8%e5%a6%82%e4%bd%95%e9%81%bf%e5%85%8d%e8%b6%85%e5%85%91%e2%80%94%e2%80%94%e5%bc%95%e5%85%a5%e5%88%86%e5%b8%83%e5%bc%8f%e9%94%81.md

* any list
{:toc}
