---
layout: post
title: Redis Learn-20-lazy free 优雅删除
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, lua, sh]
published: true
---

# Redis 单线程的利弊

## 问题困境

众所周知，redis对外提供的服务是由单线程支撑，通过事件(event)驱动各种内部逻辑，比如网络IO、命令处理、过期key处理、超时等逻辑。

在执行耗时命令(如范围扫描类的keys, 超大hash下的hgetall等)、瞬时大量key过期/驱逐等情况下，会造成redis的QPS下降，阻塞其他请求。

近期就遇到过大容量并且大量key的场景，由于各种原因引发的redis内存耗尽，导致有6位数的key几乎同时被驱逐，短期内redis hang住的情况
耗时命令是客户端行为，服务端不可控，优化余地有限。

## 新特性

作者antirez在4.0这个大版本中增加了针对大量key过期/驱逐的lazy free功能，服务端的事情还是可控的，甚至提供了异步删除的命令unlink。

## 注意事项

lazy free的功能在使用中有几个注意事项（以下为个人观点，有误的地方请评论区交流）：

lazy free不是在遇到快OOM的时候直接执行命令，放后台释放内存，而是也需要block一段时间去获得足够的内存来执行命令

lazy free不适合kv的平均大小太小或太大的场景，大小均衡的场景下性价比比较高（当然，可以根据业务场景调整源码里的宏，重新编译一个版本）

redis 短期内其实是可以略微超出一点内存上限的，因为前一条命令没检测到内存超标（其实快超了）的情况下，是可以写入一个很大的kv的，当后续命令进来之后会发现内存不够了，交给后续命令执行释放内存操作

如果业务能预估到可能会有集中的大量key过期，那么最好ttl上加个随机数，匀开来，避免集中expire造成的blocking，这点不管开不开lazy free都一样

具体分析请见下文

# 参数

redis 4.0新加了4个参数，用来控制这种lazy free的行为

lazyfree-lazy-eviction：是否异步驱逐key，当内存达到上限，分配失败后

lazyfree-lazy-expire：是否异步进行key过期事件的处理

lazyfree-lazy-server-del：del命令是否异步执行删除操作，类似unlink

replica-lazy-flush：replica client做全同步的时候，是否异步flush本地db

以上参数默认都是no，按需开启，下面以lazyfree-lazy-eviction为例，看看redis怎么处理lazy free逻辑，其他参数的逻辑类似

# 源码分析

## 命令处理逻辑

`int processCommand(client *c)` 是redis处理命令的主方法，在真正执行命令前，会有各种检查，包括对OOM情况下的处理

```c
int processCommand(client *c) {
    // ...

    if (server.maxmemory && !server.lua_timedout) {
        // 设置了maxmemory时，如果有必要，尝试释放内存(evict)
        int out_of_memory = freeMemoryIfNeededAndSafe() == C_ERR;

        // ...

        // 如果释放内存失败，并且当前将要执行的命令不允许OOM（一般是写入类命令）
        if (out_of_memory &&
            (c->cmd->flags & CMD_DENYOOM ||
             (c->flags & CLIENT_MULTI && c->cmd->proc != execCommand))) {
            flagTransaction(c);
            // 向客户端返回OOM
            addReply(c, shared.oomerr);
            return C_OK;
        }
    }

    // ...

    /* Exec the command */
    if (c->flags & CLIENT_MULTI &&
        c->cmd->proc != execCommand && c->cmd->proc != discardCommand &&
        c->cmd->proc != multiCommand && c->cmd->proc != watchCommand)
    {
        queueMultiCommand(c);
        addReply(c,shared.queued);
    } else {
        call(c,CMD_CALL_FULL);
        c->woff = server.master_repl_offset;
        if (listLength(server.ready_keys))
            handleClientsBlockedOnKeys();
    }
    return C_OK;
```

## 内存释放(淘汰)逻辑

内存的释放主要在freeMemoryIfNeededAndSafe()内进行，如果释放不成功，会返回C_ERR。

freeMemoryIfNeededAndSafe()包装了底下的实现函数freeMemoryIfNeeded()

```c
int freeMemoryIfNeeded(void) {
    // slave不管OOM的情况
    if (server.masterhost && server.repl_slave_ignore_maxmemory) return C_OK;

    // ...

    // 获取内存用量状态，如果够用，直接返回ok
    // 如果不够用，这个方法会返回总共用了多少内存mem_reported，至少需要释放多少内存mem_tofree
    // 这个方法很有意思，暗示了其实redis是可以用超内存的。即，在当前这个方法调用后，判断内存足够，但是写入了一个很大的kv，等下一个倒霉蛋来请求的时候发现，内存不够了，这时候才会在下一次请求时触发清理逻辑
    if (getMaxmemoryState(&mem_reported,NULL,&mem_tofree,NULL) == C_OK)
        return C_OK;

    // 用来记录本次调用释放了多少内存的变量
    mem_freed = 0;

    // 不需要evict的策略下，直接跳到释放失败的逻辑
    if (server.maxmemory_policy == MAXMEMORY_NO_EVICTION)
        goto cant_free; /* We need to free memory, but policy forbids. */

    // 循环，尝试释放足够大的内存
    // 同步释放的情况下，如果要删除的对象很多，或者是很大的hash/set/zset等，需要反复循环多次
    // 所以一般在监控里看到有大量key evict的时候，会跟着看到QPS下降，RTT上升
    while (mem_freed < mem_tofree) {
        // 根据配置的maxmemory-policy，拿到一个可以释放掉的bestkey
        // 中间逻辑比较多，可以再开一篇，先略过了
        if (server.maxmemory_policy & (MAXMEMORY_FLAG_LRU|MAXMEMORY_FLAG_LFU) ||
            server.maxmemory_policy == MAXMEMORY_VOLATILE_TTL) {        // 带LRU/LFU/TTL的策略
            // ...
        }
        else if (server.maxmemory_policy == MAXMEMORY_ALLKEYS_RANDOM ||
                 server.maxmemory_policy == MAXMEMORY_VOLATILE_RANDOM) {    // 带random的策略
           // ...
        }

        // 最终选中了一个bestkey
        if (bestkey) {
            if (server.lazyfree_lazy_eviction)
                // 如果配置了lazy free，尝试异步删除（不一定异步，相见下文）
                dbAsyncDelete(db,keyobj);
            else
                dbSyncDelete(db,keyobj);

            // ...

            // 如果是异步删除，需要在循环过程中定期评估后台清理线程是否释放了足够的内存，默认每16次循环检查一次
            // 可以想到的是，如果kv都很小，那么前面的操作并不是异步，lazy free不生效。如果kv都很大，那么几乎所有kv都走异步清理，主线程接近空转，如果清理线程不够，那么还是会话相对长的时间的。所以应该是大小混合的场景比较合适lazy free，需要实验数据验证
            if (server.lazyfree_lazy_eviction && !(keys_freed % 16)) {
                if (getMaxmemoryState(NULL,NULL,NULL,NULL) == C_OK) {
                    // 如果释放了足够内存，那么可以直接跳出循环了
                    mem_freed = mem_tofree;
                }
            }
        }
    }

cant_free:
    // 无法释放内存时，做个好人，本次请求卡就卡吧，检查一下后台清理线程是否还有任务正在清理，等他清理出足够内存之后再退出
    while(bioPendingJobsOfType(BIO_LAZY_FREE)) {
        if (((mem_reported - zmalloc_used_memory()) + mem_freed) >= mem_tofree)
            // 这里有点疑问，如果已经能等到足够的内存被释放，为什么不直接返回C_OK？？？
            break;
        usleep(1000);
    }
    return C_ERR;
}
```

## 异步删除逻辑

```c
// 用来评估是否需要异步删除的阈值
#define LAZYFREE_THRESHOLD 64

int dbAsyncDelete(redisDb *db, robj *key) {
    // 先从expire字典中删了这个entry（释放expire字典的entry内存，因为后面用不到），不会释放key/value本身内存
    if (dictSize(db->expires) > 0) dictDelete(db->expires,key->ptr);

    // 从db的key space中摘掉这个entry，但是不释放entry/key/value的内存
    dictEntry *de = dictUnlink(db->dict,key->ptr);
    if (de) {
        robj *val = dictGetVal(de);

        // 评估要删除的代价
        // 默认1
        // list对象，取其长度
        // 以hash格式存储的set/hash对象，取其元素个数
        // 跳表存储的zset，取跳表长度
        size_t free_effort = lazyfreeGetFreeEffort(val);

        // 如果代价大于阈值，扔给后台线程删除
        if (free_effort > LAZYFREE_THRESHOLD && val->refcount == 1) {
            atomicIncr(lazyfree_objects,1);
            bioCreateBackgroundJob(BIO_LAZY_FREE,val,NULL,NULL);
            dictSetVal(db->dict,de,NULL);
        }

        // 释放entry内存
    }
}
```

# 总结

感觉redis可以考虑一个功能，给一个参数配置内存高水位，超过高水位之后就可以触发evict操作。

但是有个问题，可能清理速度赶不上写入速度，怎么合理平衡这两者需要仔细想一下。

## 异步与同步

同步提供的是实时性

异步提升的是性能

二者经常需要我们自己去平衡。

# 参考资料

[Lazy Redis is better Redis](http://antirez.com/news/93)

[从实现角度看redis lazy free的使用和注意事项](https://www.jianshu.com/p/47243770be53)

* any list
{:toc}