---
layout: post
title: Redis Learn-09-02-时间事件
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, sh]
published: true
---


# 分类

时间事件分为两类：

定时事件

周期事件

一个时间事件包括三要素：id,when,timeproc（时间事件处理器）

时间事件处理器实现：

服务器将所有的时间事件放在一个无序链表中，运行时，遍历整个链表，调用到时间的事件对应的处理器。

正常情况下，服务器只有serverCron一个时间事件，所以采用无序链表不会影响性能。

## serverCron 函数

工作主要包括：

1. 更新服务器的统计信息：时间，内存，数据库占用情况

2. 清理过期键值对

3. 关闭失效的连接

4. 尝试进行aof\rdb持久化操作

5. 对从服务器进行定期同步

6. 集群模式下的定期同步，连接测试

# 时间事件

## 数据结构

文件：ae.h

时间事件的三个属性：

when：以毫秒格式的 UNIX 时间戳为单位，记录了应该在什么时间点执行事件处理函数。

timeProc：事件处理函数。

next 指向下一个时间事件，形成链表。

```c
/* Time event structure */
typedef struct aeTimeEvent {
    long long id; /* time event identifier. */
    long when_sec; /* seconds */
    long when_ms; /* milliseconds */
    aeTimeProc *timeProc;
    aeEventFinalizerProc *finalizerProc;
    void *clientData;
    struct aeTimeEvent *next;
} aeTimeEvent;
```

## API

文件：ae.c(v3.0.1 L 203) 

函数 aeCreateTimeEvent

```c
long long aeCreateTimeEvent(aeEventLoop *eventLoop, long long milliseconds,
        aeTimeProc *proc, void *clientData,
        aeEventFinalizerProc *finalizerProc)
{
    long long id = eventLoop->timeEventNextId++;
    aeTimeEvent *te;

    te = zmalloc(sizeof(*te));
    if (te == NULL) return AE_ERR;
    te->id = id;
    aeAddMillisecondsToNow(milliseconds,&te->when_sec,&te->when_ms);
    te->timeProc = proc;
    te->finalizerProc = finalizerProc;
    te->clientData = clientData;
    te->next = eventLoop->timeEventHead;
    eventLoop->timeEventHead = te;
    return id;
}
```

# 示例 serverCron 使用

redis-server 启动时，Redis 做了很多初始化的工作，这些工作大多是在initServer()这个函数中执行的，初始化一些相关的list,dict等；调用了aeCreateTimeEvent()函数来初始化一下定时器，定期地执行serverCron()这个函数。

文件redis.c(v3.0.1 L1837)

```c
/* Create the serverCron() time event, that's our main way to process
 * background operations. */
if(aeCreateTimeEvent(server.el, 1, serverCron, NULL, NULL) == AE_ERR) {
    redisPanic("Can't create the serverCron time event.");
    exit(1);
}
```

## 触发定时任务执行

整个执行流程： 

```
main->aeMain->aeProcessEvents->processTimeEvents->serverCron
```

文件: ae.c

```c
/* Process time events */
static int processTimeEvents(aeEventLoop *eventLoop) {
    int processed = 0;
    aeTimeEvent *te;
    long long maxId;
    time_t now = time(NULL);

    /* If the system clock is moved to the future, and then set back to the
     * right value, time events may be delayed in a random way. Often this
     * means that scheduled operations will not be performed soon enough.
     *
     * Here we try to detect system clock skews, and force all the time
     * events to be processed ASAP when this happens: the idea is that
     * processing events earlier is less dangerous than delaying them
     * indefinitely, and practice suggests it is. */
    if (now < eventLoop->lastTime) {
        te = eventLoop->timeEventHead;
        while(te) {
            te->when_sec = 0;
            te = te->next;
        }
    }
    eventLoop->lastTime = now;

    te = eventLoop->timeEventHead;
    maxId = eventLoop->timeEventNextId-1;
    while(te) {
        long now_sec, now_ms;
        long long id;

        if (te->id > maxId) {
            te = te->next;
            continue;
        }
        aeGetTime(&now_sec, &now_ms);
        if (now_sec > te->when_sec ||
            (now_sec == te->when_sec && now_ms >= te->when_ms))
        {
            int retval;

            id = te->id;
            retval = te->timeProc(eventLoop, id, te->clientData);
            processed++;
            /* After an event is processed our time event list may
             * no longer be the same, so we restart from head.
             * Still we make sure to don't process events registered
             * by event handlers itself in order to don't loop forever.
             * To do so we saved the max ID we want to handle.
             *
             * FUTURE OPTIMIZATIONS:
             * Note that this is NOT great algorithmically. Redis uses
             * a single time event so it's not a problem but the right
             * way to do this is to add the new elements on head, and
             * to flag deleted elements in a special way for later
             * deletion (putting references to the nodes to delete into
             * another linked list). */
            if (retval != AE_NOMORE) {
                aeAddMillisecondsToNow(retval,&te->when_sec,&te->when_ms);
            } else {
                aeDeleteTimeEvent(eventLoop, id);
            }
            te = eventLoop->timeEventHead;
        } else {
            te = te->next;
        }
    }
    return processed;
}
```

根据 timeProc 函数的返回值，可以将时间事件划分为两类：

如果事件处理函数返回 ae.h/AE_NOMORE，那么这个事件为单次执行事件：该事件会在指定的时间被处理一次，之后该事件就会被删除，不再执行。

如果事件处理函数返回一个非 AE_NOMORE 的整数值，那么这个事件为循环执行事件：该事件会在指定的时间被处理，之后它会按照事件处理函数的返回值，更新事件的 when 属性，让这个事件在之后的某个时间点再次运行，并以这种方式一直更新并运行下去。

# 个人收获

## 原理

原理非常重要。

一切都是基于多路复用+事件驱动的。


# 参考资料

[redis 时间事件](https://blog.csdn.net/huyangyamin/article/details/46895453)

[redis笔记：文件事件与时间事件](https://www.imooc.com/article/264934)

* any list
{:toc}