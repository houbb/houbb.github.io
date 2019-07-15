---
layout: post
title: Redis Learn-11-02-ServerCron
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, sh]
published: true
---

# serverCron 简介

在 Redis 中， 常规操作由 redis.c/serverCron 实现， 它主要执行以下操作

serverCron函数每100毫秒执行一次，负责管理服务器资源，并保持服务器自身的良好运转。

```c
/* This is our timer interrupt, called server.hz times per second.
 * Here is where we do a number of things that need to be done asynchronously.
 * For instance:
 *
 * - Active expired keys collection (it is also performed in a lazy way on
 *   lookup).
 * - Software watchdog.
 * - Update some statistic.
 * - Incremental rehashing of the DBs hash tables.
 * - Triggering BGSAVE / AOF rewrite, and handling of terminated children.
 * - Clients timeout of different kinds.
 * - Replication reconnection.
 * - Many more...
 *
 * Everything directly called here will be called server.hz times per second,
 * so in order to throttle execution of things we want to do less frequently
 * a macro is used: run_with_period(milliseconds) { .... }
 */  
```

## 执行操作

- 更新服务器的各类统计信息，比如时间、内存占用、数据库占用情况等

- 清理数据库中的过期键值对

- 对不合理的数据库进行大小调整

- 关闭和清理连接失效的客户端

- 尝试进行 AOF 或 RDB 持久化操作

- 如果服务器是主节点的话，对附属节点进行定期同步

- 如果处于集群模式的话，对集群进行定期同步和连接测试

Redis 将 serverCron 作为时间事件来运行， 从而确保它每隔一段时间就会自动运行一次， 又因为  serverCron 需要在 Redis 服务器运行期间一直定期运行， 所以它是一个循环时间事件：  serverCron 会一直定期执行，直到服务器关闭为止。

## 运行周期

在 Redis 2.6 版本中， 程序规定 serverCron 每秒运行  10 次， 平均每  100 毫秒运行一次。 

从 Redis 2.8 开始， 用户可以通过修改  hz 选项来调整  serverCron的每秒执行次数， 具体信息请参考  redis.conf 文件中关于  hz 选项的说明，也叫定时删除，这里的“定期”指的是Redis定期触发的清理策略，由位于src/redis.c的 `activeExpireCycle(void)` 函数来完成。

serverCron是由redis的事件框架驱动的定位任务，这个定时任务中会调用activeExpireCycle函数，针对每个db在限制的时间REDIS_EXPIRELOOKUPS_TIME_LIMIT内迟可能多的删除过期key，之所以要限制时间是为了防止过长时间的阻塞影响redis的正常运行。

这种主动删除策略弥补了被动删除策略在内存上的不友好。

## 主动删除执行步骤

因此，Redis会周期性的随机测试一批设置了过期时间的key并进行处理。

测试到的已过期的key将被删除。典型的方式为,Redis每秒做10次如下的步骤：

1. 随机测试100个设置了过期时间的key

2. 删除所有发现的已过期的key

3. 若删除的key超过25个则重复步骤1

这是一个基于概率的简单算法，基本的假设是抽出的样本能够代表整个key空间，redis持续清理过期的数据直至将要过期的key的百分比降到了25%以下。

这也意味着在任何给定的时刻已经过期但仍占据着内存空间的key的量最多为每秒的写操作量除以4.

Redis-3.0.0中的默认值是10，代表每秒钟调用10次后台任务。

## 淘汰任务的最大时长

除了主动淘汰的频率外，Redis对每次淘汰任务执行的最大时长也有一个限定，这样保证了每次主动淘汰不会过多阻塞应用请求，以下是这个限定计算公式：

```c
#define ACTIVE_EXPIRE_CYCLE_SLOW_TIME_PERC 25 /* CPU max % for keys collection */
//...
timelimit = 1000000*ACTIVE_EXPIRE_CYCLE_SLOW_TIME_PERC/server.hz/100;
```

hz调大将会提高Redis主动淘汰的频率，如果你的Redis存储中包含很多冷数据占用内存过大的话，可以考虑将这个值调大，但Redis作者建议这个值不要超过100。

我们实际线上将这个值调大到100，观察到CPU会增加2%左右，但对冷数据的内存释放速度确实有明显的提高（通过观察keyspace个数和used_memory大小）。

可以看出timelimit和server.hz是一个倒数的关系，也就是说hz配置越大，timelimit就越小。换句话说是每秒钟期望的主动淘汰频率越高，则每次淘汰最长占用时间就越短。这里每秒钟的最长淘汰占用时间是固定的250ms（1000000*ACTIVE_EXPIRE_CYCLE_SLOW_TIME_PERC/100），而淘汰频率和每次淘汰的最长时间是通过hz参数控制的。

从以上的分析看，当redis中的过期key比率没有超过25%之前，提高hz可以明显提高扫描key的最小个数。

假设hz为10，则一秒内最少扫描200个key（一秒调用10次*每次最少随机取出20个key），如果hz改为100，则一秒内最少扫描2000个key；另一方面，如果过期key比率超过25%，则扫描key的个数无上限，但是cpu时间每秒钟最多占用250ms。

当REDIS运行在主从模式时，只有主结点才会执行上述这两种过期删除策略，然后把删除操作”del key”同步到从结点。（AOF 同步的感觉）



# serverCron函数

serverCron 函数的三个参数，在函数内部都没有被使用，会有警告出来，所以使用REDIS_NOTUSED去除，不使用，为什么还传递这三个参数呢？

## 一个特殊的宏

```c
#define run_with_period(_ms_) if ((_ms_ <= 1000/server.hz) || !(server.cronloops%((_ms_)/(1000/server.hz))))
```

这个宏类似于条件判断，每ms时间执行一次后续的操作。如:

```c
run_with_period(100) trackOperationsPerSecond();
```

每百微秒，执行一次跟踪操作函数，记录这段时间的命令执行情况

1、如果设置了watchdog_period，那么每过watchdog_period，都会发送sigalrm信号，该信号又会得到处理，来记录此时执行的命令。这个过程主要是为了了解一些过长命令的执行影响服务器的整体运行，是一个debug过程

```c
/* Software watchdog: deliver the SIGALRM that will reach the signal
* handler if we don't return here fast enough. */
if (server.watchdog_period) watchdogScheduleSignal(server.watchdog_period);
```

2、每百微秒记录过去每秒的命令执行情况

```c
/* Update the time cache. */
updateCachedTime();
 
run_with_period(100) {
trackInstantaneousMetric(REDIS_METRIC_COMMAND,server.stat_numcommands);
trackInstantaneousMetric(REDIS_METRIC_NET_INPUT,
        server.stat_net_input_bytes);
trackInstantaneousMetric(REDIS_METRIC_NET_OUTPUT,
        server.stat_net_output_bytes);
}
```

3、更新统计变量，如内存使用总数，更新server.lruclock，getLRUClock()函数如下

```c
return (mstime()/REDIS_LRU_CLOCK_RESOLUTION) & REDIS_LRU_CLOCK_MAX;
```

大概是380天的样子，lruclock每380天一个轮回

4、是否得到关闭程序的信号，如果是，就进入关闭程序的节奏，如aof，rdb文件的处理，文件描述符的关闭等；如果之前收到了 SIGTERM 信号，并不会立即做什么事情，只是将server.shutdown_asap 置位，这里判断shutdown_asap , 调用prepareForShutdown ,关闭服务器，退出执行。但是如果没有退出成功，就不退出了，打印Log，然后移除标志位。

5、每5秒输出一次redis数据库的使用情况，连接数，总键值数

6、每次都尝试resize每个db，resize是让每个db的dict结构进入rehash状态，rehash是为了扩容dict或者缩小dict。然后每次都尝试执行每个db的rehash过程一微秒

7、每次调用clientCron，这是一个对server.clients列表进行处理的过程。在每次执行clientCron时，会对server.clients进行迭代，并且保证 1/(REDIS_HZ*10) 的客户端每次调用。也就是每次执行clientCron，如果clients过多，clientCron不会遍历所有clients，而是遍历一部分clients，但是保证每个clients都会在一定时间内得到处理。处理过程主要是检测client连接是否idle超时，或者block超时，然后会调整每个client的缓冲区大小

8、对aof，rdb等过程进行开启或终结

9、如果是master节点的话，就开始对过期的键值进行处理，与处理clients类似，不是所有有时间限制的键值进行迭代，而是在一个限定的数量内迭代一部分，保证一定时间内能检测所有键值

10、对异步io过程中可能需要关闭的clients进行处理

11、每秒调用复制线程和集群线程，每0.1秒调用哨兵线程

```c
aeSetBeforeSleepProc(server.el,beforeSleep);
aeMain(server.el);
aeDeleteEventLoop(server.el);
```

在每次ae循环进入阻塞时，都会先执行beforeSleep()，在该函数中，会对unblock的clients(指使用blpop等阻塞命令的clients)进行处理，并且执行fsync函数，同步内存到磁盘上


# 源码

```c
int serverCron(struct aeEventLoop *eventLoop, long long id, void *clientData) {
    int j;
    REDIS_NOTUSED(eventLoop);
    REDIS_NOTUSED(id);
    REDIS_NOTUSED(clientData);
 
    /* Software watchdog: deliver the SIGALRM that will reach the signal
     * handler if we don't return here fast enough. */
    if (server.watchdog_period) watchdogScheduleSignal(server.watchdog_period);
 
    /* Update the time cache. */
    updateCachedTime();
 
    run_with_period(100) {
        trackInstantaneousMetric(REDIS_METRIC_COMMAND,server.stat_numcommands);
        trackInstantaneousMetric(REDIS_METRIC_NET_INPUT,
                server.stat_net_input_bytes);
        trackInstantaneousMetric(REDIS_METRIC_NET_OUTPUT,
                server.stat_net_output_bytes);
    }
 
    /* We have just REDIS_LRU_BITS bits per object for LRU information.
     * So we use an (eventually wrapping) LRU clock.
     *
     * Note that even if the counter wraps it's not a big problem,
     * everything will still work but some object will appear younger
     * to Redis. However for this to happen a given object should never be
     * touched for all the time needed to the counter to wrap, which is
     * not likely.
     *
     * Note that you can change the resolution altering the
     * REDIS_LRU_CLOCK_RESOLUTION define. */
    server.lruclock = getLRUClock();
 
    /* Record the max memory used since the server was started. */
    if (zmalloc_used_memory() > server.stat_peak_memory)
        server.stat_peak_memory = zmalloc_used_memory();
 
    /* Sample the RSS here since this is a relatively slow call. */
    server.resident_set_size = zmalloc_get_rss();
 
    /* We received a SIGTERM, shutting down here in a safe way, as it is
     * not ok doing so inside the signal handler. */
    if (server.shutdown_asap) {
        if (prepareForShutdown(0) == REDIS_OK) exit(0);
        redisLog(REDIS_WARNING,"SIGTERM received but errors trying to shut down the server, check the logs for more information");
        server.shutdown_asap = 0;
    }
 
    /* Show some info about non-empty databases */
    run_with_period(5000) {
        for (j = 0; j < server.dbnum; j++) {
            long long size, used, vkeys;
 
            size = dictSlots(server.db[j].dict);
            used = dictSize(server.db[j].dict);
            vkeys = dictSize(server.db[j].expires);
            if (used || vkeys) {
                redisLog(REDIS_VERBOSE,"DB %d: %lld keys (%lld volatile) in %lld slots HT.",j,used,vkeys,size);
                /* dictPrintStats(server.dict); */
            }
        }
    }
 
    /* Show information about connected clients */
    if (!server.sentinel_mode) {
        run_with_period(5000) {
            redisLog(REDIS_VERBOSE,
                "%lu clients connected (%lu slaves), %zu bytes in use",
                listLength(server.clients)-listLength(server.slaves),
                listLength(server.slaves),
                zmalloc_used_memory());
        }
    }
 
    /* We need to do a few operations on clients asynchronously. */
    clientsCron();
 
    /* Handle background operations on Redis databases. */
    databasesCron();
 
    /* Start a scheduled AOF rewrite if this was requested by the user while
     * a BGSAVE was in progress. */
    if (server.rdb_child_pid == -1 && server.aof_child_pid == -1 &&
        server.aof_rewrite_scheduled)
    {
        rewriteAppendOnlyFileBackground();
    }
 
    /* Check if a background saving or AOF rewrite in progress terminated. */
    if (server.rdb_child_pid != -1 || server.aof_child_pid != -1) {
        int statloc;
        pid_t pid;
 
        if ((pid = wait3(&statloc,WNOHANG,NULL)) != 0) {
            int exitcode = WEXITSTATUS(statloc);
            int bysignal = 0;
 
            if (WIFSIGNALED(statloc)) bysignal = WTERMSIG(statloc);
 
            if (pid == -1) {
                redisLog(LOG_WARNING,"wait3() returned an error: %s. "
                    "rdb_child_pid = %d, aof_child_pid = %d",
                    strerror(errno),
                    (int) server.rdb_child_pid,
                    (int) server.aof_child_pid);
            } else if (pid == server.rdb_child_pid) {
                backgroundSaveDoneHandler(exitcode,bysignal);
            } else if (pid == server.aof_child_pid) {
                backgroundRewriteDoneHandler(exitcode,bysignal);
            } else {
                redisLog(REDIS_WARNING,
                    "Warning, detected child with unmatched pid: %ld",
                    (long)pid);
            }
            updateDictResizePolicy();
        }
    } else {
        /* If there is not a background saving/rewrite in progress check if
         * we have to save/rewrite now */
         for (j = 0; j < server.saveparamslen; j++) {
            struct saveparam *sp = server.saveparams+j;
 
            /* Save if we reached the given amount of changes,
             * the given amount of seconds, and if the latest bgsave was
             * successful or if, in case of an error, at least
             * REDIS_BGSAVE_RETRY_DELAY seconds already elapsed. */
            if (server.dirty >= sp->changes &&
                server.unixtime-server.lastsave > sp->seconds &&
                (server.unixtime-server.lastbgsave_try >
                 REDIS_BGSAVE_RETRY_DELAY ||
                 server.lastbgsave_status == REDIS_OK))
            {
                redisLog(REDIS_NOTICE,"%d changes in %d seconds. Saving...",
                    sp->changes, (int)sp->seconds);
                rdbSaveBackground(server.rdb_filename);
                break;
            }
         }
 
         /* Trigger an AOF rewrite if needed */
         if (server.rdb_child_pid == -1 &&
             server.aof_child_pid == -1 &&
             server.aof_rewrite_perc &&
             server.aof_current_size > server.aof_rewrite_min_size)
         {
            long long base = server.aof_rewrite_base_size ?
                            server.aof_rewrite_base_size : 1;
            long long growth = (server.aof_current_size*100/base) - 100;
            if (growth >= server.aof_rewrite_perc) {
                redisLog(REDIS_NOTICE,"Starting automatic rewriting of AOF on %lld%% growth",growth);
                rewriteAppendOnlyFileBackground();
            }
         }
    }
 
    /* AOF postponed flush: Try at every cron cycle if the slow fsync
     * completed. */
    if (server.aof_flush_postponed_start) flushAppendOnlyFile(0);
 
    /* AOF write errors: in this case we have a buffer to flush as well and
     * clear the AOF error in case of success to make the DB writable again,
     * however to try every second is enough in case of 'hz' is set to
     * an higher frequency. */
    run_with_period(1000) {
        if (server.aof_last_write_status == REDIS_ERR)
            flushAppendOnlyFile(0);
    }
 
    /* Close clients that need to be closed asynchronous */
    freeClientsInAsyncFreeQueue();
 
    /* Clear the paused clients flag if needed. */
    clientsArePaused(); /* Don't check return value, just use the side effect. */
 
    /* Replication cron function -- used to reconnect to master and
     * to detect transfer failures. */
    run_with_period(1000) replicationCron();
 
    /* Run the Redis Cluster cron. */
    run_with_period(100) {
        if (server.cluster_enabled) clusterCron();
    }
 
    /* Run the Sentinel timer if we are in sentinel mode. */
    run_with_period(100) {
        if (server.sentinel_mode) sentinelTimer();
    }
 
    /* Cleanup expired MIGRATE cached sockets. */
    run_with_period(1000) {
        migrateCloseTimedoutSockets();
    }
 
    server.cronloops++;
    return 1000/server.hz;
}
```

# 参考资料

[命令请求的执行过程](http://redisbook.com/preview/server/execute_command.html)

[serverCron 简介](https://www.bbsmax.com/A/QV5ZEQe2Jy/)

* any list
{:toc}