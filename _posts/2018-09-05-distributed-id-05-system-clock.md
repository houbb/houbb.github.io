---
layout: post
title:  分布式标识 Distributed ID-05-系统时钟，高并发下的时间优化
date:  2018-09-05 08:53:10 +0800
categories: [Distributed]
tags: [id, distributed, sh]
published: true
---

# 高并发下的时间戳优化

```java
/**
 * <p>
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * <p>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
import java.sql.Timestamp;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

/**
 * <p>
 * 高并发场景下System.currentTimeMillis()的性能问题的优化
 * </p>
 * <p>
 * System.currentTimeMillis()的调用比new一个普通对象要耗时的多（具体耗时高出多少我还没测试过，有人说是100倍左右）<br>
 * System.currentTimeMillis()之所以慢是因为去跟系统打了一次交道<br>
 * 后台定时更新时钟，JVM退出时，线程自动回收<br>
 * 10亿：43410,206,210.72815533980582%<br>
 * 1亿：4699,29,162.0344827586207%<br>
 * 1000万：480,12,40.0%<br>
 * 100万：50,10,5.0%<br>
 * </p>
 *
 * @author lry
 */
public class SystemClock {

    private final long period;
    private final AtomicLong now;

    private SystemClock(long period) {
        this.period = period;
        this.now = new AtomicLong(System.currentTimeMillis());
        scheduleClockUpdating();
    }

    private static SystemClock instance() {
        return InstanceHolder.INSTANCE;
    }

    public static long now() {
        return instance().currentTimeMillis();
    }

    public static String nowDate() {
        return new Timestamp(instance().currentTimeMillis()).toString();
    }

    private void scheduleClockUpdating() {
        ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor(new ThreadFactory() {

            @Override
            public Thread newThread(Runnable runnable) {
                Thread thread = new Thread(runnable, "System Clock");
                thread.setDaemon(true);
                return thread;
            }
        });
        scheduler.scheduleAtFixedRate(new Runnable() {

            @Override
            public void run() {
                now.set(System.currentTimeMillis());
            }
        }, period, period, TimeUnit.MILLISECONDS);
    }

    private long currentTimeMillis() {
        return now.get();
    }

    private static class InstanceHolder {
        public static final SystemClock INSTANCE = new SystemClock(1);
    }

}
```


# id 生成的新思路

## 时间戳

如果是只考虑 1970 至今的时间：

```
1589557133876
```

长度为 13 位，阅读性一般。

- 时间戳

```
200514234210111
```

这个为 15 位，阅读性较好

## 实际可配置的属性

syscode 三位系统编码，唯一标识一个系统

机器标识（IP/MAC） 或者根据配置，越短越好。建议 2 位。

一般一个系统，99台机器是足够的。

一个公司的服务可以有很多的子系统构成。

## 随机的部分

3 位，000-999 这种左补零，保证位数统一性。

可以区分为是否严格递增。

一次顺序读 1000 个数据放在队列中。非严格递增，直接获取即可，如果没了，直接重新构建。

如果空了，则直接等待 1ms，然后重新填充队列。

## 长度共计：

000-00-yyyyMMddHHhhssSSS-000

23 位，单台机器 TPS: 100W+

如果再高，可以将最后的调整为四位。

当然，可以考虑参考无锁队列的设计。

# 参考资料

## 相关博客

[Snowflake id生成器](https://blog.csdn.net/paincupid/article/details/79640441)

* any list
{:toc}