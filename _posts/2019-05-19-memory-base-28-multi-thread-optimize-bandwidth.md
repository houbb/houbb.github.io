---
layout: post
title: Memory 内存知识-28-多线程优化之带宽
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# Bandwidth Considerations

When many threads are used, and they do not cause cache contention by using the same cache lines on different cores, there still are potential（潜在的） problems. 

Each processor has a maximum bandwidth to the memory which is shared by all cores and hyper-threads on that processor.

Depending on the machine architecture (e.g., the one in Figure 2.1), multiple processors might share the same bus to memory or the Northbridge.

## 处理器的运行

The processor cores themselves run at frequencies where, at full speed, even in perfect conditions, the connection to the memory cannot fulfill all load and store requests without waiting. 

Now, further divide the available bandwidth by the number of cores, hyper-threads, and processors sharing a connection to the Northbridge and suddenly parallelism becomes a big problem. 

Efficient programs may be limited in their performance by the available memory bandwidth.

# FSB 性能对于处理器的影响

Figure 3.32 shows that increasing the FSB speed of a processor can help a lot. 

This is why, with growing numbers of cores on a processor, we will also see an increase in the FSB speed. 

Still, this will never be enough if the program uses large working sets and it is sufficiently optimized.

Programmers have to be prepared to recognize problems due to limited bandwidth.

## 性能测量计算

The performance measurement counters of modern processors allow the observation（意见） of FSB contention. 

On Core 2 processors the NUS_BNR_DRV event counts the number of cycles a core has to wait because the bus is not ready. 

This indicates（指示） that the bus is highly used and loads from or stores to main memory take even longer than usual. 

The Core 2 processors support more events which can count specific bus actions like RFOs or the general FSB utilization. 

The latter might come in handy when investigating the possibility of scalability of an application during development. 

If the bus utilization（采用） rate is already close to 1.0 then the scalability opportunities are minimal.

这表明（指示）总线使用率很高，从主存储器加载或存储到主存储器的时间比平时要长。

Core 2处理器支持更多事件，可以计算RFO或一般FSB利用率等特定总线操作。

在研究开发期间应用程序的可伸缩性的可能性时，后者可能会派上用场。

如果总线利用率（采用率）已接近1.0，则可扩展性机会最小。

# 带宽问题的考虑

If a bandwidth problem is recognized（承认）, there are several things which can be done. 

They are sometimes contradictory so some experimentation might be necessary.

它们有时是矛盾的，因此可能需要进行一些实验。

## 购买更好的硬件资源

One solution is to buy faster computers, if there are some available. 

Getting more FSB speed, faster RAM modules, and possibly memory local to the processor, can and probably will–help. 

It can cost a lot, though. 

If the program in question is only needed on one (or a few machines) the one-time expense for the hardware might cost less than reworking the program. 

In general, though, it is better to work on the program.

## 带宽利用率

After optimizing the program code itself to avoid cache misses, the only option left to achieve better bandwidth utilization is to place the threads better on the available cores. 

在优化程序代码本身以避免缓存未命中之后，实现更好带宽利用率的唯一选择是将线程更好地放在可用内核上。

By default, the scheduler in the kernel will assign a thread to a processor according to its own policy. 

Moving a thread from one core to another is avoided when possible. 

The scheduler does not really know anything about the workload, though. 

It can gather information from cache misses etc but this is not much help in many situations.

一般内核都是通过自己的策略进行分配。

调度器无法获知这些信息，即使通过 cache miss 来处理，并不能满足多个场景。

# 低效的任务调度

One situation which can cause big memory bus usage is when two threads are scheduled on different processors (or cores in different cache domains) and they use the same data set. 

Figure 6.13 shows such a situation. 

Core 1 and 3 access the same data (indicated by the same color for the access indicator and the memory area). 

Similarly core 2 and 4 access the same data. 

But the threads are scheduled on different processors. 

This means each data set has to be read twice from memory. 

This situation can be handled better.

![image](https://user-images.githubusercontent.com/18375710/63674711-b355e800-c819-11e9-8a0f-308cae9e35b9.png)

# 高效的任务调度

In Figure 6.14 we see how it should ideally（理想的） look like. 

Now the total cache size in use is reduced since now core 1 and 2 and core 3 and 4 work on the same data.

The data sets have to be read from memory only once.

![image](https://user-images.githubusercontent.com/18375710/63674857-0e87da80-c81a-11e9-85f9-7d98f87f6bb9.png)

## 其他场景的推广

This is a simple example but, by extension, it applies to many situations. 

As mentioned before, the scheduler in the kernel has no insight into the use of data, so the programmer has to ensure that scheduling is done efficiently.

There are not many kernel interfaces available to communicate this requirement. 

In fact, there is only one: defining thread affinity（亲和力）.

## 线程亲和性

Thread affinity means assigning a thread to one or more cores. 

The scheduler will then choose among those cores (only) when deciding where to run the thread. 

Even if other cores are idle they will not be considered. 

然后，调度程序将在决定运行线程的位置时（仅）在这些核心中进行选择。

即使其他核心闲置，也不会考虑它们。

This might sound like a disadvantage, but it is the price one has to pay. 

If too many threads exclusively run on a set of cores the remaining cores might mostly be idle and there is nothing one can do except change the affinity.

By default threads can run on any core.



如果太多线程专门在一组核心上运行，那么剩余的核心可能大部分都处于空闲状态，除了更改关联性之外，没有什么可以做的。

默认情况下，线程可以在任何核心上运行

# 查询和更改

There are a number of interfaces to query and change the affinity of a thread:

有许多接口可以查询和更改线程的亲和性：

```c
#define _GNU_SOURCE
#include <sched.h>
int sched_setaffinity(pid_t pid, size_t size,
const cpu_set_t *cpuset);
int sched_getaffinity(pid_t pid, size_t size,
cpu_set_t *cpuset);
```

## 接口解释

These two interfaces are meant to be used for singlethreaded code. 

The pid argument specifies which process’s affinity should be changed or determined. 

The caller obviously needs appropriate privileges to do this.

The second and third parameter specify the bitmask for the cores. 

The first function requires the bitmask to be filled in so that it can set the affinity. 

The second fills in the bitmask with the scheduling information of the selected thread. 

The interfaces are declared in `<sched.h>`.

## cpu_set_t 类型

The `cpu_set_t` type is also defined in that header, along with a number of macros to manipulate（操纵） and use objects of this type.

```c
#define _GNU_SOURCE
#include <sched.h>
#define CPU_SETSIZE
#define CPU_SET(cpu, cpusetp)
#define CPU_CLR(cpu, cpusetp)
#define CPU_ZERO(cpusetp)
#define CPU_ISSET(cpu, cpusetp)
#define CPU_COUNT(cpusetp)
```

## 属性说明

CPU_SETSIZE specifies how many CPUs can be represented in the data structure. 

The other three macros manipulate cpu_set_t objects. 

To initialize an object CPU_ZERO should be used; 

the other two macros should be used to select or deselect individual cores. 

CPU_ISSET tests whether a specific processor is part of the set. 

CPU_COUNT returns the number of cores selected in the set. 

The cpu_set_t type provide a reasonable default value for the upper limit on the number of CPUs.

Over time it certainly will prove too small; at that point the type will be adjusted. 

This means programs always have to keep the size in mind. 

The above convenience macros implicitly handle the size according to the definition of cpu_set_t. 

# 扩展宏

If more dynamic size handling is needed an extended set of macros should be used:

如果需要更多动态大小处理，则应使用一组扩展宏：

```c
#define _GNU_SOURCE
#include <sched.h>
#define CPU_SET_S(cpu, setsize, cpusetp)
#define CPU_CLR_S(cpu, setsize, cpusetp)
#define CPU_ZERO_S(setsize, cpusetp)
#define CPU_ISSET_S(cpu, setsize, cpusetp)
#define CPU_COUNT_S(setsize, cpusetp)
```

These interfaces take an additional parameter with the size. 

To be able to allocate dynamically sized CPU sets three macros are provided:

TODO::..




# 参考资料

P68

* any list
{:toc}