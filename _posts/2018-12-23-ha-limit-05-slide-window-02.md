---
layout: post
title: 高可用之限流-05-slide window 滑动窗口
date: 2018-12-23 13:55:13 +0800
categories: [Distributed]
tags: [distributed, ha, limit, sh]
published: true
---


## 滑动日志-Sliding Log

滑动日志算法，利用记录下来的用户的请求时间，请求数，当该用户的一个新的请求进来时，比较这个用户在这个窗口内的请求数是否超过了限定值，超过的话就拒绝这个请求。

### 优点：

1. 避免了固定窗口算法在窗口边界可能出现的两倍流量问题

2. 由于是针对每个用户进行统计的，不会引发惊群效应

### 缺点：

1. 需要保存大量的请求日志

2. 每个请求都需要考虑该用户之前的请求情况，在分布式系统中尤其难做到

## Sliding Window

滑动窗口算法，结合了固定窗口算法的低开销和滑动日志算法能够解决的边界情况。

1. 为每个窗口进行请求量的计数

2. 结合上一个窗口的请求量和这一个窗口已经经过的时间来计算出上限，以此平滑请求尖锋

举例来说，限流的上限是每分钟 10 个请求，窗口大小为 1 分钟，上一个窗口中总共处理了 6 个请求。

在假设这个新的窗口已经经过了 20 秒，那么 到目前为止允许的请求上限就是 10 - 6 * (1 - 20 / 60) = 8。

滑动窗口算法是这些算法中最实用的算法：

1. 有很好的性能

2. 避免了漏桶算法带来的饥饿问题

3. 避免了固定窗口算法的请求量突增的问题





## 滑动窗口

滑动窗口将固定窗口再等分为多个小的窗口。

![image](https://user-images.githubusercontent.com/18375710/85253949-c6fdc980-b491-11ea-803d-0dd8bf918fb1.png)

滑动窗口可以通过更细粒度对数据进行统计。

在限流算法里：假设我们将1s划分为4个窗口，则每个窗口对应250ms。

假设恶意用户还是在上一秒的最后一刻和下一秒的第一刻冲击服务，按照滑动窗口的原理，此时统计上一秒的最后750毫秒和下一秒的前250毫秒，这种方式能够判断出用户的访问依旧超过了1s的访问数量，因此依然会阻拦用户的访问。

### 特点

滑动窗口具有以下特点：

1、每个小窗口的大小可以均等，dubbo的默认负载均衡算法random就是通过滑动窗口设计的，可以调整每个每个窗口的大小，进行负载。

2、滑动窗口的个数及大小可以根据实际应用进行控制

### 滑动时间窗口

滑动时间窗口就是把一段时间片分为多个窗口，然后计算对应的时间落在那个窗口上，来对数据统计；

如上图其实就是即时的滑动时间窗口，随着时间流失，最开始的窗口将会失效，但是也会生成新的窗口；sentinel的就是通过这个原理来实时的限流数据统计。

关于滑动窗口，这里介绍还是比较简单，主要是大致的介绍滑动的原理以及时间窗口的设计；其实关于滑动窗口在我们学习的计算机网络中也涉及到。

## java 实现

### 伪代码

```java
全局数组 链表[]  counterList = new 链表[切分的滑动窗口数量];
//有一个定时器，在每一次统计时间段起点需要变化的时候就将索引0位置的元素移除，并在末端追加一个新元素。
int sum = counterList.Sum();
if(sum > 限流阈值) {
    return; //不继续处理请求。
}

int 当前索引 = 当前时间的秒数 % 切分的滑动窗口数量;
counterList[当前索引]++;
// do something...
```

### java 核心实现

```java

```



## sentinel构建滑动时间窗口

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