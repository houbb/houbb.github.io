---
layout: post
title:  Distributed ID-04-SnowFlake
date:  2018-09-05 08:53:10 +0800
categories: [Distributed]
tags: [id, distributed, sh]
published: true
---

# 概述

分布式系统中，有一些需要使用全局唯一ID的场景，这种时候为了防止ID冲突可以使用36位的UUID，但是UUID有一些缺点，首先他相对比较长，另外UUID一般是无序的。

有些时候我们希望能使用一种简单一些的ID，并且希望ID能够按照时间有序生成。

而twitter的snowflake解决了这种需求，最初Twitter把存储系统从MySQL迁移到Cassandra，因为Cassandra没有顺序ID生成机制，所以开发了这样一套全局唯一ID生成服务。

# 结构

snowflake的结构如下(每部分用-分开):

```
0 - 0000000000 0000000000 0000000000 0000000000 0 - 00000 - 00000 - 000000000000
```

![snowflake-struct](https://segmentfault.com/img/bVVulC?w=1021&h=346)

1位，不用。二进制中最高位为1的都是负数，但是我们生成的id一般都使用整数，所以这个最高位固定是0

41位，用来记录时间戳（毫秒）。

41位可以表示$2^{41}-1$个数字，

如果只用来表示正整数（计算机中正数包含0），可以表示的数值范围是：0 至 $2^{41}-1$，减1是因为可表示的数值范围是从0开始算的，而不是1。
也就是说41位可以表示$2^{41}-1$个毫秒的值，转化成单位年则是$(2^{41}-1) / (1000 * 60 * 60 * 24 * 365) = 69$年

10位，用来记录工作机器id。

可以部署在$2^{10} = 1024$个节点，包括5位datacenterId和5位workerId5位（bit）可以表示的最大正整数是$2^{5}-1 = 31$，

即可以用0、1、2、3、....31这32个数字，来表示不同的datecenterId或workerId

12位，序列号，用来记录同毫秒内产生的不同id。

12位（bit）可以表示的最大正整数是$2^{12}-1 = 4095$，即可以用0、1、2、3、....4094这4095个数字，来表示同一机器同一时间截（毫秒)内产生的4095个ID序号
由于在Java中64bit的整数是long类型，所以在Java中SnowFlake算法生成的id就是long来存储的。

## 特性

SnowFlake可以保证：

- 所有生成的id按时间趋势递增

- 整个分布式系统内不会产生重复id（因为有datacenterId和workerId来做区分）

# java 源码

```java
/**
 * Twitter_Snowflake<br>
 * SnowFlake的结构如下(每部分用-分开):<br>
 * 0 - 0000000000 0000000000 0000000000 0000000000 0 - 00000 - 00000 - 000000000000 <br>
 * 1位标识，由于long基本类型在Java中是带符号的，最高位是符号位，正数是0，负数是1，所以id一般是正数，最高位是0<br>
 * 41位时间截(毫秒级)，注意，41位时间截不是存储当前时间的时间截，而是存储时间截的差值（当前时间截 - 开始时间截)
 * 得到的值），这里的的开始时间截，一般是我们的id生成器开始使用的时间，由我们程序来指定的（如下下面程序IdWorker类的startTime属性）。41位的时间截，可以使用69年，年T = (1L << 41) / (1000L * 60 * 60 * 24 * 365) = 69<br>
 * 10位的数据机器位，可以部署在1024个节点，包括5位datacenterId和5位workerId<br>
 * 12位序列，毫秒内的计数，12位的计数顺序号支持每个节点每毫秒(同一机器，同一时间截)产生4096个ID序号<br>
 * 加起来刚好64位，为一个Long型。<br>
 * SnowFlake的优点是，整体上按照时间自增排序，并且整个分布式系统内不会产生ID碰撞(由数据中心ID和机器ID作区分)，并且效率较高，经测试，SnowFlake每秒能够产生26万ID左右。
 */
public class SnowflakeIdWorker {

    // ==============================Fields===========================================
    /** 开始时间截 (2015-01-01) */
    private final long twepoch = 1420041600000L;

    /** 机器id所占的位数 */
    private final long workerIdBits = 5L;

    /** 数据标识id所占的位数 */
    private final long datacenterIdBits = 5L;

    /** 支持的最大机器id，结果是31 (这个移位算法可以很快的计算出几位二进制数所能表示的最大十进制数) */
    private final long maxWorkerId = -1L ^ (-1L << workerIdBits);

    /** 支持的最大数据标识id，结果是31 */
    private final long maxDatacenterId = -1L ^ (-1L << datacenterIdBits);

    /** 序列在id中占的位数 */
    private final long sequenceBits = 12L;

    /** 机器ID向左移12位 */
    private final long workerIdShift = sequenceBits;

    /** 数据标识id向左移17位(12+5) */
    private final long datacenterIdShift = sequenceBits + workerIdBits;

    /** 时间截向左移22位(5+5+12) */
    private final long timestampLeftShift = sequenceBits + workerIdBits + datacenterIdBits;

    /** 生成序列的掩码，这里为4095 (0b111111111111=0xfff=4095) */
    private final long sequenceMask = -1L ^ (-1L << sequenceBits);

    /** 工作机器ID(0~31) */
    private long workerId;

    /** 数据中心ID(0~31) */
    private long datacenterId;

    /** 毫秒内序列(0~4095) */
    private long sequence = 0L;

    /** 上次生成ID的时间截 */
    private long lastTimestamp = -1L;

    //==============================Constructors=====================================
    /**
     * 构造函数
     * @param workerId 工作ID (0~31)
     * @param datacenterId 数据中心ID (0~31)
     */
    public SnowflakeIdWorker(long workerId, long datacenterId) {
        if (workerId > maxWorkerId || workerId < 0) {
            throw new IllegalArgumentException(String.format("worker Id can't be greater than %d or less than 0", maxWorkerId));
        }
        if (datacenterId > maxDatacenterId || datacenterId < 0) {
            throw new IllegalArgumentException(String.format("datacenter Id can't be greater than %d or less than 0", maxDatacenterId));
        }
        this.workerId = workerId;
        this.datacenterId = datacenterId;
    }

    // ==============================Methods==========================================
    /**
     * 获得下一个ID (该方法是线程安全的)
     * @return SnowflakeId
     */
    public synchronized long nextId() {
        long timestamp = timeGen();

        //如果当前时间小于上一次ID生成的时间戳，说明系统时钟回退过这个时候应当抛出异常
        if (timestamp < lastTimestamp) {
            throw new RuntimeException(
                    String.format("Clock moved backwards.  Refusing to generate id for %d milliseconds", lastTimestamp - timestamp));
        }

        //如果是同一时间生成的，则进行毫秒内序列
        if (lastTimestamp == timestamp) {
            sequence = (sequence + 1) & sequenceMask;
            //毫秒内序列溢出
            if (sequence == 0) {
                //阻塞到下一个毫秒,获得新的时间戳
                timestamp = tilNextMillis(lastTimestamp);
            }
        }
        //时间戳改变，毫秒内序列重置
        else {
            sequence = 0L;
        }

        //上次生成ID的时间截
        lastTimestamp = timestamp;

        //移位并通过或运算拼到一起组成64位的ID
        return ((timestamp - twepoch) << timestampLeftShift) //
                | (datacenterId << datacenterIdShift) //
                | (workerId << workerIdShift) //
                | sequence;
    }

    /**
     * 阻塞到下一个毫秒，直到获得新的时间戳
     * @param lastTimestamp 上次生成ID的时间截
     * @return 当前时间戳
     */
    protected long tilNextMillis(long lastTimestamp) {
        long timestamp = timeGen();
        while (timestamp <= lastTimestamp) {
            timestamp = timeGen();
        }
        return timestamp;
    }

    /**
     * 返回以毫秒为单位的当前时间
     * @return 当前时间(毫秒)
     */
    protected long timeGen() {
        return System.currentTimeMillis();
    }

}
```

## 测试

```java
//==============================Test=============================================
/** 测试 */
public static void main(String[] args) {
    SnowflakeIdWorker idWorker = new SnowflakeIdWorker(0, 0);
    for (int i = 0; i < 1000; i++) {
        long id = idWorker.nextId();
        System.out.println(Long.toBinaryString(id));
        System.out.println(id);
    }
}
```

## 简单解释

这段代码改写自网上的SnowFlake算法实现，有几点需要解释一下：

1. 获得单一机器的下一个序列号，使用Synchronized控制并发，而非CAS的方式，是因为CAS不适合并发量非常高的场景。

2. 如果当前毫秒在一台机器的序列号已经增长到最大值4095，则使用while循环等待直到下一毫秒。

3. 如果当前时间小于记录的上一个毫秒值，则说明这台机器的时间回拨了，抛出异常。但如果这台机器的系统时间在启动之前回拨过，那么有可能出现ID重复的危险。

# 算法优缺点

## SnowFlake 算法的优点：

1. 生成ID时不依赖于DB，完全在内存生成，高性能高可用。

2. ID呈趋势递增，后续插入索引树的时候性能较好。

## SnowFlake 算法的缺点：

依赖于系统时钟的一致性。

如果某台机器的系统时钟回拨，有可能造成ID冲突，或者ID乱序。

# 源码解析

## 位运算

如：

```java
sequence = (sequence + 1) & sequenceMask;

private long maxWorkerId = -1L ^ (-1L << workerIdBits);

return ((timestamp - twepoch) << timestampLeftShift) |
        (datacenterId << datacenterIdShift) |
        (workerId << workerIdShift) |
        sequence;
```

## 用位运算计算n个bit能表示的最大数值

```java
private long workerIdBits = 5L;
private long maxWorkerId = -1L ^ (-1L << workerIdBits);       
```

上面代码换成这样看方便一点：

```java
long maxWorkerId = -1L ^ (-1L << 5L)
```

如下图

咋一看真的看不准哪个部分先计算，于是查了一下Java运算符的优先级表:

![优先级表](https://segmentfault.com/img/bVVt9g?w=400&h=373)

所以上面那行代码中，运行顺序是：

1. -1 左移 5，得结果a

2. -1 异或 a

### 二进制过程

long maxWorkerId = -1L ^ (-1L << 5L)的二进制运算过程如下：

- -1 左移 5，得结果a ：

```
        11111111 11111111 11111111 11111111 //-1的二进制表示（补码）
  11111 11111111 11111111 11111111 11100000 //高位溢出的不要，低位补0
        11111111 11111111 11111111 11100000 //结果a
```

- -1 异或 a ：

```
        11111111 11111111 11111111 11111111 //-1的二进制表示（补码）
    ^   11111111 11111111 11111111 11100000 //两个操作数的位中，相同则为0，不同则为1
---------------------------------------------------------------------------
        00000000 00000000 00000000 00011111 //最终结果31
```

最终结果是31

### 实际含义

那既然现在知道算出来 long maxWorkerId = -1L ^ (-1L << 5L) 中的maxWorkerId = 31，有什么含义？

为什么要用左移5来算？

如果你看过概述部分，请找到这段内容看看：

5位（bit）可以表示的最大正整数是$2^{5}-1 = 31$，即可以用0、1、2、3、....31这32个数字。

来表示不同的datecenterId或workerId

-1L ^ (-1L << 5L)结果是31，$2^{5}-1$的结果也是31，

所以在代码中，-1L ^ (-1L << 5L)的写法是利用位运算计算出5位能表示的最大正整数是多少。

## 用mask防止溢出

有一段有趣的代码：

```java
sequence = (sequence + 1) & sequenceMask;
```

分别用不同的值测试一下，你就知道它怎么有趣了：

```
long seqMask = -1L ^ (-1L << 12L); //计算12位能耐存储的最大正整数，相当于：2^12-1 = 4095
System.out.println("seqMask: "+seqMask);
System.out.println(1L & seqMask);
System.out.println(2L & seqMask);
System.out.println(3L & seqMask);
System.out.println(4L & seqMask);
System.out.println(4095L & seqMask);
System.out.println(4096L & seqMask);
System.out.println(4097L & seqMask);
System.out.println(4098L & seqMask);

/**
seqMask: 4095
1
2
3
4
4095
0
1
2
*/
```

这段代码通过位与运算保证计算的结果范围始终是 0-4095 ！

其实简单点，直接取余也可以。不过性能可能差一点。

## 用位运算汇总结果

还有另外一段诡异的代码：

```java
return ((timestamp - twepoch) << timestampLeftShift) |
        (datacenterId << datacenterIdShift) |
        (workerId << workerIdShift) |
        sequence;
```

为了弄清楚这段代码，

首先 需要计算一下相关的值：

```java
private long twepoch = 1288834974657L; //起始时间戳，用于用当前时间戳减去这个时间戳，算出偏移量
private long workerIdBits = 5L; //workerId占用的位数：5
private long datacenterIdBits = 5L; //datacenterId占用的位数：5
private long maxWorkerId = -1L ^ (-1L << workerIdBits);  // workerId可以使用的最大数值：31
private long maxDatacenterId = -1L ^ (-1L << datacenterIdBits); // datacenterId可以使用的最大数值：31
private long sequenceBits = 12L;//序列号占用的位数：12
private long workerIdShift = sequenceBits; // 12
private long datacenterIdShift = sequenceBits + workerIdBits; // 12+5 = 17
private long timestampLeftShift = sequenceBits + workerIdBits + datacenterIdBits; // 12+5+5 = 22
private long sequenceMask = -1L ^ (-1L << sequenceBits);//4095
private long lastTimestamp = -1L;
```

其次 写个测试，把参数都写死，并运行打印信息，方便后面来核对计算结果：

```java
    //---------------测试---------------
    public static void main(String[] args) {
        long timestamp = 1505914988849L;
        long twepoch = 1288834974657L;
        long datacenterId = 17L;
        long workerId = 25L;
        long sequence = 0L;

        System.out.printf("\ntimestamp: %d \n",timestamp);
        System.out.printf("twepoch: %d \n",twepoch);
        System.out.printf("datacenterId: %d \n",datacenterId);
        System.out.printf("workerId: %d \n",workerId);
        System.out.printf("sequence: %d \n",sequence);
        System.out.println();
        System.out.printf("(timestamp - twepoch): %d \n",(timestamp - twepoch));
        System.out.printf("((timestamp - twepoch) << 22L): %d \n",((timestamp - twepoch) << 22L));
        System.out.printf("(datacenterId << 17L): %d \n" ,(datacenterId << 17L));
        System.out.printf("(workerId << 12L): %d \n",(workerId << 12L));
        System.out.printf("sequence: %d \n",sequence);

        long result = ((timestamp - twepoch) << 22L) |
                (datacenterId << 17L) |
                (workerId << 12L) |
                sequence;
        System.out.println(result);

    }

    /** 打印信息：
        timestamp: 1505914988849 
        twepoch: 1288834974657 
        datacenterId: 17 
        workerId: 25 
        sequence: 0 
        
        (timestamp - twepoch): 217080014192 
        ((timestamp - twepoch) << 22L): 910499571845562368 
        (datacenterId << 17L): 2228224 
        (workerId << 12L): 102400 
        sequence: 0 
        910499571847892992
    */
```

代入位移的值得之后，就是这样：

```java
return ((timestamp - 1288834974657) << 22) |
        (datacenterId << 17) |
        (workerId << 12) |
        sequence;
```

对于尚未知道的值，我们可以先看看概述 中对SnowFlake结构的解释，再代入在合法范围的值(windows系统可以用计算器方便计算这些值的二进制)，来了解计算的过程。

当然，由于我的测试代码已经把这些值写死了，那直接用这些值来手工验证计算结果即可：

```java
long timestamp = 1505914988849L;
long twepoch = 1288834974657L;
long datacenterId = 17L;
long workerId = 25L;
long sequence = 0L;
```

TBC...

# 个人收获

## 基础知识

基础知识非常重要，比如位运算。

# 参考资料

## 源码

[snowflake-2010](https://github.com/twitter-archive/snowflake/releases/tag/snowflake-2010)

## 相关博客

[Twitter的分布式自增ID算法snowflake (Java版)](https://www.cnblogs.com/relucent/p/4955340.html)

[理解分布式id生成算法SnowFlake](https://segmentfault.com/a/1190000011282426?utm_source=tag-newest)

* any list
{:toc}