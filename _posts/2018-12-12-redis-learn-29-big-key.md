---
layout: post
title: Redis Learn-35-3天时间，我是如何解决 redis bigkey 删除问题的？
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, sh]
published: true
---

![image](https://upload-images.jianshu.io/upload_images/5874675-23c282d73c22a934?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 问题的出现

一个平坦无奇的工作日，领导到我工位和我说，“有一个 redis 慢操作，你这几天有时间帮忙解决一下。”

“好的。”，管他什么问题，既然让我做，我自然觉得自己能搞定。

然后我收到一封 redis 慢操作的 excel 文件，这个还挺好，每个操作的耗时都给出来了，看了下我们系统有几个操作耗时几秒钟。

好家伙，对于单线程的 redis 来说，一个操作几秒钟确实是挺致命的，不过都是在凌晨左右，还好。

![image](https://upload-images.jianshu.io/upload_images/5874675-faa25de3f9bdb444?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 慢操作分析

redis 的慢操作已经有了，如果没有，我们可以自己去 redis 服务器查看历史的慢日志操作，或者有对应的慢操作监控系统也可以发现问题，这里不做展开。

接下来我们就要看一看为什么这么慢。

看了下项目中的实现代码，结合日志一分析，发现是一个 redis bigkey。

一个 redis key，对应的是一个 map, 里面防了几十万的 key/value。删除的时候一把直接删除，自然是慢的。

本文带大家一起分析下 redis bigkey 删除的解决方案，希望你工作中遇到类似问题提供一个解决思路。

# 处理 bigkey

bigkey是指key对应的value所占的内存空间比较大。

例如一个字符串类 型的value可以最大存到512MB，一个列表类型的value最多可以存储2^32-1个元素。

如果按照数据结构来细分的话，一般分为字符串类型bigkey和非字符串类型bigkey。

## 危害

bigkey的危害体现在三个方面：

## 内存空间不均匀（平衡）：

例如在Redis Cluster中，bigkey会造成节点的内存空间使用不均匀。

## 超时阻塞：

由于Redis单线程的特性，操作bigkey比较耗时，也就意味着阻塞Redis可能性增大。

## 网络拥塞：

每次获取bigkey产生的网络流量较大，假设一个bigkey为1MB，每秒访问量为1000，那么每秒产生1000MB的流量，对于普通的千兆网卡（按照字节算是128MB/s）的服务器来说简直是灭顶之灾，而且一般服务器会采用单机多实例的方式来部署，也就是说一个bigkey可能会对其他实例造成影响，其后果不堪设想。图12-3演示了网络带宽bigkey占用的瞬间。

## 如何发现

`redis-cli --bigkeys` 可以命令统计bigkey的分布。

但是在生产环境中，开发和运维人员更希望自己可以定义bigkey的大小，而且更希望找到真正的bigkey都有哪些，这样才可以去定位、解决、优化问题。

判断一个key是否为bigkey，只需要执行 `debug object key` 查看serializedlength属性即可，它表示key对应的value序列化之后的字节数，

例如我们执行如下操作：

```
127.0.0.1:6379> debug object key
Value at:0x7fc06c1b1430 refcount:1 encoding:raw serializedlength:1256350 lru:11686193
lru_seconds_idle:20
```

可以发现serializedlength=11686193字节，约为1M，同时可以看到encoding是raw，也就是字符串类型。

那么可以通过strlen来看一下字符串的字节数为2247394字节，约为2MB：

```
127.0.0.1:6379> strlen key
(integer) 2247394
```

serializedlength不代表真实的字节大小，它返回对象使用RDB编码序列化后的长度，值会偏小，但是对于排查bigkey有一定辅助作用，因为不是每种数据结构都有类似strlen这样的方法。

## 实际生产的操作方式

在实际生产环境中发现bigkey的两种方式如下：

### 被动收集：

许多开发人员确实可能对bigkey不了解或重视程度不够，但是这种bigkey一旦大量访问，很可能就会带来命令慢查询和网卡跑满问题，开发人员通过对异常的分析通常能找到异常原因可能是bigkey，这种方式虽然不是被笔者推荐的，但是在实际生产环境中却大量存在，建议修改Redis客户端，当抛出异常时打印出所操作的key，方便排bigkey问题。

### 主动检测：

scan+debug object：如果怀疑存在bigkey，可以使用scan命令渐进的扫描出所有的key，分别计算每个key的serializedlength，找到对应bigkey进行相应的处理和报警，这种方式是比较推荐的方式。

# 如何删除

因为 redis 是单线程的，删除比较大的 keys 就会阻塞其他的请求。

当发现Redis中有bigkey并且确认要删除时，如何优雅地删除bigkey？

无论是什么数据结构，del命令都将其删除。

但是相信通过上面的分析后你一定不会这么做，因为删除bigkey通常来说会阻塞Redis服务。

下面给出一组测试数据分别对string、hash、list、set、sorted set五种数据结构的bigkey进行删除，bigkey的元素个数和每个元素的大小不尽相同。

## 删除时间测试

下面测试和服务器硬件、Redis版本比较相关，可能在不同的服务器上执行速度不太相同，但是能提供一定的参考价值

表12-3展示了删除512KB~10MB的字符串类型数据所花费的时间，总体来说由于字符串类型结构相对简单，删除速度比较快，但是随着value值的不断增大，删除速度也逐渐变慢。

![删除时间测试](https://images.gitee.com/uploads/images/2020/1017/123218_dea5e153_508704.png)

## 非字符串类删除测试

表12-4展示了非字符串类型的数据结构在不同数量级、不同元素大小下对bigkey执行del命令的时间，总体上看元素个数越多、元素越大，删除时间越长，相对于字符串类型，这种删除速度已经足够可以阻塞Redis。

- 表12-4　

删除hash、list、set、sorted set四种数据结构不同数量不同元素大小的耗时

![不同元素大小的耗时](https://images.gitee.com/uploads/images/2020/1017/123245_669ee7b3_508704.png)

从上分析可见，除了string类型，其他四种数据结构删除的速度有可能很慢，这样增大了阻塞Redis的可能性。

## 如何提升删除的效率

既然不能用del命令，那有没有比较优雅的方式进行删除呢，这时候就需要将第2章介绍的scan命令的若干类似命令拿出来：sscan、hscan、zscan。

### string

字符串删除一般不会造成阻塞

```
del bigkey
```

### hash、list、set、sorted set

下面以hash为例子，使用hscan命令，每次获取部分（例如100个）fieldvalue，再利用hdel删除每个field（为了快速可以使用Pipeline）：

```java
public void delBigHash(String bigKey) {
    Jedis jedis = new Jedis(“127.0.0.1”, 6379);
    // 游标
    String cursor = “0”;
    while (true) {
        ScanResult<Map.Entry<String, String>> scanResult = jedis.hscan(bigKey, cursor, new ScanParams().count(100));
        // 每次扫描后获取新的游标
        cursor = scanResult.getStringCursor();
        // 获取扫描结果
        List<Entry<String, String>> list = scanResult.getResult();
        if (list == null || list.size() == 0) {
            continue;
        }
        String[] fields = getFieldsFrom(list);
        // 删除多个field
        jedis.hdel(bigKey, fields);
        // 游标为0时停止
        if (cursor.equals(“0”)) {
            break;
        }
    }
    // 最终删除key
    jedis.del(bigKey);
}

/**
* 获取field数组
* @param list
* @return
*/
private String[] getFieldsFrom(List<Entry<String, String>> list) {
    List<String> fields = new ArrayList<String>();
    for(Entry<String, String> entry : list) {
        fields.add(entry.getKey());
    }
    return fields.toArray(new String[fields.size()]);
}
```

请勿忘记每次执行到最后执行del key操作。

## 最佳实践思路

由于开发人员对Redis的理解程度不同，在实际开发中出现bigkey在所难免，重要的是，能通过合理的检测机制及时找到它们，进行处理。

作为开发人员在业务开发时应注意不能将Redis简单暴力的使用，应该在数据结构的选择和设计上更加合理，例如出现了bigkey，

（1）要思考一下可不可以做一些优化（例如拆分数据结构）尽量让这些bigkey消失在业务中，

（2）如果bigkey不可避免，也要思考一下要不要每次把所有元素都取出来（例如有时候仅仅需要hmget，而不是hgetall）。

（3）最后，可喜的是，Redis将在4.0版本支持lazy delete free的模式，那时删除bigkey不会阻塞Redis。

# 如何优雅的删除

## 重构

重新构建自己的业务 key。

让 key/value 更加小，使用纯字符串。

- 缺点

有时候难以对旧的代码进行兼容，调整难度较大。

## 使用 lazy free

这个是 redis 4.0 以后的特性。

可能会受限于版本，导致无法使用。

- 查看版本

redis 压缩包有文件 `cat 00-RELEASENOTES` 可以查看对应的版本信息。

```
Redis 2.8 release notes
=======================

** IMPORTANT ** Check the 'Migrating from 2.6 to 2.8' section at the end of
                this file for information about what changed between 2.6 and
                2.8 and how this may affect your application.

--------------------------------------------------------------------------------
Upgrade urgency levels:

LOW:      No need to upgrade unless there are new features you want to use.
MODERATE: Program an upgrade of the server, but it's not urgent.
HIGH:     There is a critical bug that may affect a subset of users. Upgrade!
CRITICAL: There is a critical bug affecting MOST USERS. Upgrade ASAP.
--------------------------------------------------------------------------------

--[ Redis 2.8.6 ] Release date: 13 Feb 2014
```

可知当前版本为：2.8.6

## 使用 expire 设置过期

需要熟知 redis 的淘汰策略。

（1）惰性淘汰

（2）定时删除

（3）定期删除

其中定期删除，是一个异步的进程去处理的，不会阻塞主进程。

其中设置超时时间，是为了限制每一次的操作时间，从而更好的清空数据，释放内存。

- 缺点

需要知道具体的淘汰策略

对内存是不够友好的

可能要根据业务进行调整，比如本来显式删除，可以放在凌晨。

如果使用定期删除，被淘汰的时间就变得不固定了。


# 实战代码

## 示例

```java
/**
 * 刪除 BIG key
 * 应用场景：对于 big key，可以使用 hscan 首先分批次删除，最后统一删除
 * （1）比直接删除的耗时变长，但是不会产生慢操作。
 * （2）新业务实现尽可能拆开，不要依赖此方法。
 * @param key key
 * @param scanCount 单次扫描总数（建议值：100）
 * @param intervalMills 分批次的等待时间（建议值：5）
 */
void removeBigKey(final String key, final int scanCount, final long intervalMills)
```

实现

```java
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
```

- 构建的 key

```java
/**
 * 获取对应的 keys 信息
 * @param list 列表
 * @return 结果
 */
private String[] getFieldsKeyArray(List<Map.Entry<String, String>> list) {
	String[] strings = new String[list.size()];
	for(int i = 0; i < list.size(); i++) {
		strings[i] = list.get(i).getKey();
	}
	return strings;
}
```

# 针对 redisTemplate 的写法

## 语法

估计是 redis 进行了一次封装，发现还是存在很多坑。

语法如下：

```java
/**
 * 获取集合的游标。通过游标可以遍历整个集合。
 * ScanOptions 这个类中使用了构造者 工厂方法 单例。 通过它可以配置返回的元素
 * 个数 count  与正则匹配元素 match. 不过count设置后不代表一定返回的就是count个。这个只是参考
 * 意义
 *
 * @param key
 * @param options 
 * @return
 * @since 1.4
 */
Cursor<V> scan(K key, ScanOptions options);
```

## 注意的坑

实际上这个方法存在很多需要注意的坑：

（1）cursor 要关闭，否则会内存泄漏

（2）cursor 不要重复关闭，或者会报错

（3）cursor 经测试，直接指定的 count 设置后，返回的结果其实是全部，所以需要自己额外处理

## 参考代码如下：

- 声明

```java
@Autowired
private StringRedisTemplate template;
```

- 核心代码

```java
public void removeBigKey(String key, int scanCount, long intervalMills) throws CacheException {
    final ScanOptions scanOptions = ScanOptions.scanOptions().count(scanCount).build();
    //TRW 避免内存泄漏
	try(Cursor<Map.Entry<Object,Object>> cursor =
                template.opsForHash().scan(key, scanOptions)) {
	    if(ObjectUtil.isNotNull(cursor)) {
            // 执行循环删除
            List<String> fieldKeyList = new ArrayList<>();
            while (cursor.hasNext()) {
                String fieldKey = String.valueOf(cursor.next().getKey());
                fieldKeyList.add(fieldKey);
                if(fieldKeyList.size() >= scanCount) {
                    // 批量删除
                    Object[] fields = fieldKeyList.toArray();
                    template.opsForHash().delete(key, fields);
                    logger.info("[Big key] remove key: {}, fields size: {}",
                            key, fields.length);
                    // 清空列表，重置操作
                    fieldKeyList.clear();
                    // 沉睡等待，避免对 redis 压力太大
                    DateUtil.sleepInterval(intervalMills, TimeUnit.MILLISECONDS);
                }
            }
        }
        // 最后 fieldKeyList 中可能还有剩余，不过一般数量不大，直接删除速度不会很慢
		// 执行 key 本身的删除
		this.opsForValueDelete(key);
	} catch (Exception e) {
		// log.error();
	}
}
```

这里我们使用 TRW 保证 cursor 被关闭，自己实现 scanCount 一次进行删除，避免 1 个 1 个删除网络交互较多。

使用睡眠保证对 Redis 压力不要过大。

# 测试验证

当然上线之前需要测试充分的验证，这里我是自己做了自测，然后让测试帮我做了回归。

确认不影响功能，删除性能等方面都没有问题之后，才进行了上线发布。

上线之后做了连续3天的观察，一切稳定，这个问题也算是告一段落。

# 小结

redis 作为一个高性能的缓存服务，使用的时候确实会存在各种各样的问题。

有时候使我们自己使用不留意，有时候是前人埋下的坑。（比如我这个）

遇到这种问题，找到原因，并且找到合适的解决方案，才是最重要的。

这个 redis bigkey 我前后分析+编码+自测+上线，差不多共计 3 天左右，还算顺利。其中两天是分析原因+讨论解决方案，编码测试反倒比较简单。

希望对你有帮助。

感兴趣的可以关注一下，便于实时接收最新内容。

觉得本文对你有帮助的话，欢迎点赞评论收藏转发一波。你的鼓励，是我最大的动力~

不知道你有哪些收获呢？或者有其他更多的想法，欢迎留言区和我一起讨论，期待与你的思考相遇。

文中如果链接失效，可以点击 {阅读原文}。

# 拓展阅读

## 淘汰

[redis lazy free](https://houbb.github.io/2018/12/12/redis-learn-20-lazy-free)

[redis 淘汰策略](https://houbb.github.io/2018/12/12/redis-learn-20-memory-expire)

[redis 设置键的过期时间](https://houbb.github.io/2018/12/12/redis-learn-06-03-set-time-expire)

[redis 过期提醒](https://houbb.github.io/2018/12/12/redis-learn-06-02-database-notify)

## 持久化

[RDB 持久化模式](https://houbb.github.io/2018/12/12/redis-learn-07-rdb-persist)

[AOF 持久化模式](https://houbb.github.io/2018/12/12/redis-learn-08-aof-persist)

[Mixed 混合模式](https://houbb.github.io/2018/12/12/redis-learn-08-mix-persist)

## 是否慢

[slowlog](https://houbb.github.io/2018/12/12/redis-learn-12-slow-log)

[latency](https://houbb.github.io/2018/12/12/redis-learn-12-latency)

[是否慢场景的排查](https://houbb.github.io/2018/12/12/redis-learn-32-slow-condition)

# 参考资料

[从实现角度看redis lazy free的使用和注意事项](https://www.jianshu.com/p/47243770be53)

[spring-data-redis SetOperations](https://blog.csdn.net/pengdandezhi/article/details/78909041)

* any list
{:toc}