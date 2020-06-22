---
layout: post
title: 高可用之限流-06-slide window 滑动窗口 sentinel 源码
date: 2018-12-23 13:55:13 +0800
categories: [Distributed]
tags: [distributed, ha, limit, sh]
published: true
---


## sentinel 构建滑动时间窗口

上文介绍过通过调用LeadArray的currentWindow方法返回时间窗口，下面来仔细分析。

```java
public WindowWrap<T> currentWindow() {
    //参数是当前时间
    return currentWindow(TimeUtil.currentTimeMillis());
}

public WindowWrap<T> currentWindow(long time) {
    // 1、根据当前时间，算出该时间的timeId，timeId就是在整个时间轴的位置
    long timeId = time / windowLengthInMs;
    // 2、据timeId算出当前时间窗口在采样窗口区间中的索引idx
    int idx = (int)(timeId % array.length());
    // 3、根据当前时间算出当前窗口应该对应的窗口开始时间time，以毫秒为单位
    time = time - time % windowLengthInMs;
    //4、循环判断直到获取到一个当前时间窗口
    while (true) {
        //5、根据索引idx，在采样窗口数组中取得一个时间窗口old
        WindowWrap<T> old = array.get(idx);
        //6、如果old为空，说明该时间窗口还没有创建、则创建一个时间窗口，并将它插入到array的第idx个位置
        if (old == null) {
            //创建时间窗口，参数：窗口大小，开始时间，桶（保存统计值）
            WindowWrap<T> window = new WindowWrap<T>(windowLengthInMs, time, newEmptyBucket());
             // 通过CAS将新窗口设置到数组中去
            if (array.compareAndSet(idx, null, window)) {
                return window;
            } else {
                Thread.yield();
            }
          //7、如果当前窗口的开始时间time与old的开始时间相等，那么说明old就是当前时间窗口，直接返回old
        } else if (time == old.windowStart()) { 
            return old;
        } 
          //8、如果当前窗口的开始时间time大于old的开始时间，则说明old窗口已经过时了，将old的开始时间更新为最新值:time，下一个循环中在第7步返回
        else if (time > old.windowStart()) {
            if (updateLock.tryLock()) {
                try {
                    // if (old is deprecated) then [LOCK] resetTo currentTime.
                    // 重置窗口，重新设置窗口的开始时间，以及把统计值重置
                    return resetWindowTo(old, time);
                } finally {
                    updateLock.unlock();
                }
            } else {
                Thread.yield();
            }
        //这个条件不可能存在,time是当前的时间
        } else if (time < old.windowStart()) {
            // Cannot go through here.
            return new WindowWrap<T>(windowLengthInMs, time, newEmptyBucket());
        }
    }
}
```

以上就是创建时间窗口的核心的代码了，解释都在代码上面。

分析后可以发现：获取时间窗口原理就是找到当前时间所在的窗口，若窗口不存在则创建，若窗口过时了则重置。

## 窗口分析

通过分析 rollingCounterInSecond 的监控指标来分析时间窗口，

```java
private transient volatile Metric rollingCounterInSecond = new ArrayMetric(1000 / SampleCountProperty.SAMPLE_COUNT,
        IntervalProperty.INTERVAL);
```

在StatisticNode类中，rollingCounterInSecond创建可以发现windowLengthInMs：时间窗口是500ms，

intervalInSec：时间区间是1s。所以在时间区间是1s内最多只有两个时间窗口，每个窗口长度是500ms；

时间窗口的创建过程如图：

![image](https://user-images.githubusercontent.com/18375710/85254688-70918a80-b493-11ea-8d1f-451a2331d65e.png)

1、现在假设当前时间是2018-12-15 14:30:00，对应毫秒是：1544855400000ms，所以timeId = 1544855400000 / 500为：3089710800，对应的idx为0，窗口开始时间time为 time - time % windowLengthInMs还是1544855400000；

2、初始化的时候old为空，所以创建了一个window；

3、倘若过了300ms后，time为1544855400700，这个时候old就是先前窗口了，就会直接返回old窗口：currentWindow；

4、时间继续往前走，又过了400ms后，如图：

![image](https://user-images.githubusercontent.com/18375710/85255008-fca3b200-b493-11ea-91c7-9b9e9ece85a9.png)

5、这个时候获取到的timeId为3089710801，对应的idx=为3089710801%2为1，窗口开始时间time为 1544855400500；

6、由于是新的时间窗口，old为空，则重新创建。

7、倘若过了400ms，time为1544855401100：现在得到idx时0，这个时候old是有值的，但是old的windowStart小于time的StartTime，所以需要重置idx0窗口。

8、以此类推：随着时间的流逝，时间窗口也在变化，但是窗口只会在初始化的过程中创建两次，后面若窗口过期了则是重置。

## 核心流程

1、根据当前时间，算出该时间的timeId，timeId就是在整个时间轴的位置

2、据timeId算出当前时间窗口在采样窗口区间中的索引idx

3、根据当前时间算出当前窗口应该对应的窗口开始时间time，以毫秒为单位

4、循环判断直到获取到一个当前时间窗口

5、根据索引idx，在采样窗口数组中取得一个时间窗口old

如果old为空，说明该时间窗口还没有创建、则创建一个时间窗口，并将它插入到array的第idx个位置

如果当前窗口的开始时间time与old的开始时间相等，那么说明old就是当前时间窗口，直接返回old

如果当前窗口的开始时间time大于old的开始时间，则说明old窗口已经过时了，将old的开始时间更新为最新值:time；
。
## 参考资料

[限流技术总结](https://blog.wangqi.love/articles/Java/%E9%99%90%E6%B5%81%E6%8A%80%E6%9C%AF%E6%80%BB%E7%BB%93.html)

[固定窗口和滑动窗口算法了解一下](https://cloud.tencent.com/developer/article/1359889)

[Sentinel之滑动时间窗口设计（二）](https://www.jianshu.com/p/05677381e155)

[限流滑动窗口](https://zhuanlan.zhihu.com/p/95794476)

[限流算法之固定窗口与滑动窗口](https://blog.csdn.net/weixin_41247920/article/details/100144184)

[限流--基于某个滑动时间窗口限流](https://blog.csdn.net/asdcls/article/details/96344783)

[【限流算法】java实现滑动时间窗口算法](https://blog.csdn.net/king0406/article/details/103129786)

[谈谈高并发系统的限流](https://www.cnblogs.com/haoxinyue/p/6792309.html)

### 漏铜令牌桶 

[漏桶算法&令牌桶算法理解及常用的算法](https://www.jianshu.com/p/c02899c30bbd)

[流量控制算法——漏桶算法和令牌桶算法](https://www.jianshu.com/p/36bca4ed6d17)

[Token Bucket 令牌桶算法](https://blog.csdn.net/wudaoshihun/article/details/83097341)

[华为-令牌桶算法](https://support.huawei.com/enterprise/zh/doc/EDOC1100055553/33f24bb0)

[简单分析Guava中RateLimiter中的令牌桶算法的实现](https://my.oschina.net/guanhe/blog/1921116)

* any list
{:toc}