---
layout: post
title:  SpringCloud微服务实战（完）-10如何高效读取计费规则等热数据——分布式缓存
date:   2015-01-01 23:20:27 +0800
categories: [SpringCloud微服务实战（完）]
tags: [SpringCloud微服务实战（完）, other]
published: true
---



10 如何高效读取计费规则等热数据——分布式缓存
前几章节主要聚集于会员与积分模块的业务功能，引领大家尝试了服务维护、配置中心、断路器、服务调用等常见的功能点，本章节开始进入核心业务模块——停车计费，有两块数据曝光率特别高：进场前的可用车位数和计费规则，几乎每辆车都进出场都用到，这部分俗称为热数据：经常会用到。读关系库很明显不是最优解，引入缓存才是王道。

### 分布式缓存

这里仅讨论软件服务端的缓存，不涉及硬件部分。缓存作为互联网分布式开发两大杀器之一（另一个是消息队列），应用场景相当广泛，遇到高并发、高性能的案例，几乎都能看到缓存的身影。

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/SpringCloud%e5%be%ae%e6%9c%8d%e5%8a%a1%e5%ae%9e%e6%88%98%ef%bc%88%e5%ae%8c%ef%bc%89/assets/2020-05-05-021601.jpg)

从应用与缓存的结合角度来区分可以分为本地缓存和分布式缓存。

我们经常用 Tomcat 作为应用服务，用户的 session 会话存储，其实就是缓存，只不过是本地缓存，如果需要实现跨 Tomcat 的会话应用，还需要其它组件的配合。Java 中我们应经用到的 HashMap 或者 ConcurrentHashMap 两个对象存储，也是本地缓存的一种形式。Ehcache 和 Google Guava Cache 这两个组件也都能实现本地缓存。单体应用中应用的比较多，优势很明显，访问速度极快；劣势也很明显，不能跨实例，容量有限制。

分布式场景下，本地缓存的劣势表现的更为突出，与之对应的分布式缓存则更能胜任这个角色。软件应用与缓存分离，多个应用间可以共享缓存，容量扩充相对简便。有两个开源分布式缓存产品：memcached 和 Redis。简单介绍下这两个产品。

memcached 出现比较早的缓存产品，只支持基础的 key-value 键值存储，数据结构类型比较单一，不提供持久化功能，发生故障重启后无法恢复，它本身没有成功的分布式解决方案，需要借助于其它组件来完成。Redis 的出现，直接碾压 memcached ，市场占有率节节攀升。

Redis 在高效提供缓存的同时，也支持持久化，在故障恢复时数据得已保留恢复。支持的数据类型更为丰富，如 string , list , set , sorted set , hash 等，Redis 自身提供集群方案，也可以通过第三方组件实现，比如 Twemproxy 或者 Codis 等等，在实际的产品应用中占有很大的比重。另外 Redis 的客户端资源相当丰富，支持近 50 种开发语言。

本案例中的热数据采用 Redis 来进行存储，在更复杂的业务功能时，可以采用本地缓存与分布式缓存进行混合使用。

### Redis 应用

### Redis 安装配置

官网地址：[https://redis.io/](https://redis.io/)，当前最新版已到 5.0.7，Redis 提供了丰富了数据类型、功能特性，基本能够覆盖日常开发运维使用，简单的命令行使学习曲线极低，可以快速上手实践。提供了丰富语言客户端，供使用者快速的集成到项目中。

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/SpringCloud%e5%be%ae%e6%9c%8d%e5%8a%a1%e5%ae%9e%e6%88%98%ef%bc%88%e5%ae%8c%ef%bc%89/assets/2020-05-05-021602.jpg)

(图片来源于 redis 官网，[https://redis.io/clients](https://redis.io/clients))

下面来介绍如何安装 redis：

* 下载编译过的二进制安装包，本案例中使用的版本是 4.0.11。
$ wget http://download.redis.io/releases/redis-4.0.11.tar.gz $ tar xzf redis-4.0.11.tar.gz $ cd redis-4.0.11 $ make

* 配置，默认情况下 redis 的的配置安全性较弱，无密码配置的，端口易扫描。若要修改默认配置，可修改 redis.conf 文件。
# 可以修改默认端口 6379

port 16479

# redis 默认情况下不是以后台程序的形式运行，需要将开关打开

daemonize yes

# 打开需要密码开发，设置密码

requirepass zxcvbnm,./

* 启动 redis
# 启动时，加载配置文件

appledeMacBook-Air:redis-4.0.11 apple$ src/redis-server redis.conf 59464:C 07 Mar 10:38:15.284 /# oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo 59464:C 07 Mar 10:38:15.285 /# Redis version=4.0.11, bits=64, commit=00000000, modified=0, pid=59464, just started 59464:C 07 Mar 10:38:15.285 /# Configuration loaded

# 命令行测试

appledeMacBook-Air:redis-4.0.11 apple$ src/redis-cli -p 16479

# 必须执行 auth 命令，输入密码，否则无法正常使用命令

127.0.0.1:16479> auth zxcvbnm,./ OK 127.0.0.1:16479> dbsize (integer) 51 127.0.0.1:16479>

至此，redis 服务安装完成，下面就可以将缓存功能集成到项目中去。有小伙伴可能会说通过命令方式操作 redis 远不如图形化管理界面直观，活跃的同学们早已提供对应的工具供大家使用，比如 Redis Manager 等。

### 集成 Spring Data Redis

此次实践采用 Spring Data 项目家族中的 Spring Data Redis 组件与 Redis Server 进行交互通信，与 Spring Boot 项目集成时，采用 starter 的方式进行。

Spring Boot Data Redis 依赖于 Jedis 或 lettuce 客户端，基于 Spring Boot 提供一套与客户端无关的 API ，可以轻松将一个 redis 切换到另一个客户端，而不需要修改业务代码。

计费业务对应的项目模块是 parking-charging，在 pom.xml 文件中引入对应的 jar，这里为什么没有 version 呢，其实已经在 spring-boot-dependencies 配置中约定，此处无须再特殊配置。
<!-- 鼠标放置上面有弹出信息提示：The managed version is 2.1.11.RELEASE The artifact is managed in org.springframework.boot:spring-boot-dependencies:2.1.11.RELEASE --> <dependency> <groupId>org.springframework.boot</groupId> <artifactId>spring-boot-starter-data-redis</artifactId> </dependency>

可以通过编写 Java 代码，进行 [@Configuration] 注解配置，也可以使用配置文件进行。这里使用配置文件的方式。在 application.properties 中配置 redis 连接，这里特殊指定了 database ，Redis 默认有 16 个数据库，从 0 到 15 ，可以提供有效的数据隔离，防止相互污染。

/#redis config spring.redis.database=1 spring.redis.host=localhost spring.redis.port=16479 /#default redis password is empty spring.redis.password=zxcvbnm,./ spring.redis.timeout=60000 spring.redis.pool.max-active=1000 spring.redis.pool.max-wait=-1 spring.redis.pool.max-idle=10 spring.redis.pool.min-idle=5

基于 Spring Boot 的约定优于配置的原则，按如下方式配置后，redis 已经可以正常的集成在项目中。

编写服务类 RedisServiceImpl.java ，基于 Spring Boot Data Redis 项目中封装的 RedisTemplate 就可以与 redis 进行通信交互，本示例仅以简单的基于 string 数据格式的 key-value 方式进行。
@Slf4j @Service public class RedisServiceImpl implements RedisService { @Autowired RedisTemplate<Object, Object> redisTemplate; @Override public boolean exist(String chargingrule) { ValueOperations<Object, Object> valueOperations = redisTemplate.opsForValue(); return valueOperations.get(chargingrule) != null ? true : false; } @Override public void cacheObject(String chargingrule, String jsonString) { redisTemplate.opsForValue().set(chargingrule, jsonString); log.info("chargingRule cached!"); } }

redis 对比 memcached 支持的数据类型更为丰富，RedisTemplate 的 API 中同样提供了对应的操作方法，如下：

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/SpringCloud%e5%be%ae%e6%9c%8d%e5%8a%a1%e5%ae%9e%e6%88%98%ef%bc%88%e5%ae%8c%ef%bc%89/assets/7a44c830-9292-11ea-9b04-0da7e61a36ad)

### 加载数据至缓存中

项目第一次启动，如何将数据库写入 cache 中去的呢？建议在项目启动时就加载缓存，待数据变更后再回刷缓存。项目启动后就加载，Spring Boot 提供了两种方式在项目启动时就加载的方式供大家使用：ApplicationRunner 与 CommandLineRunner，都是在 Spring 容器初始化完毕之后执行起 run 方法，两者最明显的区别就是入参不同。

本例子中采用 ApplicationRunner 方式

初始化计费规则 cache ：
@Component @Order(value = 1)//order 是加载顺序，越小加载越早，若有依赖关于，建议按顺序排列即可 public class StartUpApplicationRunner implements ApplicationRunner { @Autowired RedisService redisService; @Autowired ChargingRuleService ruleService; @Override public void run(ApplicationArguments args) throws Exception { List<ChargingRule> rules = ruleService.list(); //ParkingConstant 为项目中常量类 if (!redisService.exist(ParkingConstant.cache.chargingRule)) { redisService.cacheObject(ParkingConstant.cache.chargingRule, JSONObject.toJSONString(rules)); } } }

项目启动后，用 redis 客户端查看缓存中是否有数据。

appledeMacBook-Air:redis-4.0.11 apple$ src/redis-cli -p 16479 127.0.0.1:16479> auth zxcvbnm,./ OK 127.0.0.1:16479> select 1 OK 127.0.0.1:16479[1]> keys /* 1) "\xac\xed\x00\x05t\x00\aruleKey"

发现 Key 值前面有一堆类似乱码的东西 /*\xac\xed\x00\x05t\x00\a/*，这是 unicode 编码， 由于 redisTemplate 默认的序列化方式为 jdkSerializeable，存储时存储二进制字节码，但不影响数据。此处需要进行重新更改序列化方式，以便按正常方式读取。

@Component public class RedisConfig { @Bean public RedisTemplate<Object, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) { RedisTemplate<Object, Object> redisTemplate = new RedisTemplate<>(); redisTemplate.setConnectionFactory(redisConnectionFactory); Jackson2JsonRedisSerializer<Object> jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer<Object>(Object.class); ObjectMapper objectMapper = new ObjectMapper(); objectMapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY); objectMapper.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL); jackson2JsonRedisSerializer.setObjectMapper(objectMapper); //重新设置值序列化方式 redisTemplate.setValueSerializer(jackson2JsonRedisSerializer); //重新设置 key 序列化方式，StringRedisTemplate 的默认序列化方式就是 StringRedisSerializer redisTemplate.setKeySerializer(new StringRedisSerializer()); redisTemplate.afterPropertiesSet(); return redisTemplate; } }

将计费规则清除，采用 flushdb（慎用，会清楚当前 db 下的所有数据，另一个 flush 命令会将所有库清空，更要慎用）重新启动项目，再次加载计费规则。

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/SpringCloud%e5%be%ae%e6%9c%8d%e5%8a%a1%e5%ae%9e%e6%88%98%ef%bc%88%e5%ae%8c%ef%bc%89/assets/2020-05-05-021605.jpg)
appledeMacBook-Air:redis-4.0.11 apple$ src/redis-cli -p 16479 127.0.0.1:16479> auth zxcvbnm,./ OK 127.0.0.1:16479> select 1 OK 127.0.0.1:16479[1]> keys /* 1) "ruleKey" 127.0.0.1:16479[1]> get ruleKey "\"[{\\\"createBy\\\":\\\"admin\\\",\\\"createDate\\\":1577467568000,\\\"end\\\":30,\\\"fee\\\":0.0,\\\"id\\\":\\\"41ed927623cf4a0bb5354b10100da992\\\",\\\"remark\\\":\\\"30\xe5\x88\x86\xe9\x92\x9f\xe5\x86\x85\xe5\x85\x8d\xe8\xb4\xb9\\\",\\\"start\\\":0,\\\"state\\\":1,\\\"updateDate\\\":1577467568000,\\\"version\\\":0},{\\\"createBy\\\":\\\"admin\\\",\\\"createDate\\\":1577467572000,\\\"end\\\":120,\\\"fee\\\":5.0,\\\"id\\\":\\\"41ed927623cf4a0bb5354b10100da993\\\",\\\"remark\\\":\\\"2\xe5\xb0\x8f\xe6\x97\xb6\xe5\x86\x85\xef\xbc\x8c5\xe5\x85\x83\\\",\\\"start\\\":31,\\\"state\\\":1,\\\"updateDate\\\":1577467572000,\\\"version\\\":0},{\\\"createBy\\\":\\\"admin\\\",\\\"createDate\\\":1577468046000,\\\"end\\\":720,\\\"fee\\\":10.0,\\\"id\\\":\\\"4edb0820241041e5a0f08d01992de4c0\\\",\\\"remark\\\":\\\"2\xe5\xb0\x8f\xe6\x97\xb6\xe4\xbb\xa5\xe4\xb8\x8a12\xe5\xb0\x8f\xe6\x97\xb6\xe4\xbb\xa5\xe5\x86\x85\xef\xbc\x8c10\xe5\x85\x83\\\",\\\"start\\\":121,\\\"state\\\":1,\\\"updateDate\\\":1577468046000,\\\"version\\\":0},{\\\"createBy\\\":\\\"admin\\\",\\\"createDate\\\":1577475337000,\\\"end\\\":1440,\\\"fee\\\":20.0,\\\"id\\\":\\\"7616fb412e824dcda41ed9367feadfda\\\",\\\"remark\\\":\\\"12\xe6\x97\xb6\xe8\x87\xb324\xe6\x97\xb6\xef\xbc\x8c20\xe5\x85\x83\\\",\\\"start\\\":721,\\\"state\\\":1,\\\"updateDate\\\":1577475337000,\\\"version\\\":0}]\""

此时 key 已正常显示，但 key 对应的 value 中显示依然有 unicode 编码，可在命令行中 增加 *—raw* 参数来查看中文。完全命令行：/*src/redis-cli -p 16479 —raw/*，中文就可以正常显示在客户端中。

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/SpringCloud%e5%be%ae%e6%9c%8d%e5%8a%a1%e5%ae%9e%e6%88%98%ef%bc%88%e5%ae%8c%ef%bc%89/assets/2020-05-05-021606.jpg)

### 使用缓存计费规则计算费用

在车辆出场时，要计算停靠时间，根据停车时间长久匹配具体的计费规则计算费用，然后写支付记录。
//*/* /* @param stayMintues /* @return /*/ private float caluateFee(long stayMintues) { String ruleStr = (String) redisService.getkey(ParkingConstant.cache.chargingRule); JSONArray array = JSONObject.parseArray(ruleStr); List<ChargingRule> rules = JSONObject.parseArray(array.toJSONString(), ChargingRule.class); float fee = 0; for (ChargingRule chargingRule : rules) { if (chargingRule.getStart() <= stayMintues && chargingRule.getEnd() > stayMintues) { fee = chargingRule.getFee(); break; } } return fee; }

由于停车收费的交易压力并非很大，此处也仅作为案例应用，读库与读缓存的差距并不大。想象一下手机扣费的场景，如果还是读取关系库里的数据，再去计费，这个差距就有天壤之别了。

由于是分布式缓存，缓存已经与应用分离，任何一个项目，只有与 redis 取得合法连接，都可以任意取用缓存中的数据，当然 Redis 作为缓存是一个基本功能，其它也提供了很多操作，如数据分片、分布式锁、事务、内存优化、消息订阅/发布等，来应对不同业务场景下的需要。

### 留一个思考题

如何结合 Redis 来设计电商网站中常见的商品销榜单，如日热销榜，周热销榜，月热销榜，年热销榜等。




# 参考资料

https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/SpringCloud%e5%be%ae%e6%9c%8d%e5%8a%a1%e5%ae%9e%e6%88%98%ef%bc%88%e5%ae%8c%ef%bc%89/10%20%e5%a6%82%e4%bd%95%e9%ab%98%e6%95%88%e8%af%bb%e5%8f%96%e8%ae%a1%e8%b4%b9%e8%a7%84%e5%88%99%e7%ad%89%e7%83%ad%e6%95%b0%e6%8d%ae%e2%80%94%e2%80%94%e5%88%86%e5%b8%83%e5%bc%8f%e7%bc%93%e5%ad%98.md

* any list
{:toc}
