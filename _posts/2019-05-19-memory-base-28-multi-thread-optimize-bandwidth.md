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

## 如何动态配置 cpu 大小

To be able to allocate dynamically sized CPU sets three macros are provided:

```c
#define _GNU_SOURCE
#include <sched.h>
#define CPU_ALLOC_SIZE(count)
#define CPU_ALLOC(count)
#define CPU_FREE(cpuset)
```

The return value of the CPU_ALLOC_SIZE macro is the number of bytes which have to be allocated for a cpu_set_t structure which can handle count CPUs. 

To allocate such a block the CPU_ALLOC macro can be used.

The memory allocated this way must be freed with a call to CPU_FREE. 

These macros will likely use malloc and free behind the scenes but this does not necessarily have to remain this way.

## 一些 cpu 的相关操作

Finally, a number of operations on CPU set objects are defined:

```c
#define _GNU_SOURCE
#include <sched.h>
#define CPU_EQUAL(cpuset1, cpuset2)
#define CPU_AND(destset, cpuset1, cpuset2)
#define CPU_OR(destset, cpuset1, cpuset2)
#define CPU_XOR(destset, cpuset1, cpuset2)
#define CPU_EQUAL_S(setsize, cpuset1, cpuset2)
#define CPU_AND_S(setsize, destset, cpuset1,cpuset2)
#define CPU_OR_S(setsize, destset, cpuset1,cpuset2)
#define CPU_XOR_S(setsize, destset, cpuset1,cpuset2)
```

These two sets of four macros can check two sets for equality and perform logical AND, OR, and XOR operations on sets. 

These operations come in handy when using some of the libNUMA functions (see Appendix D).

## sched_getcpu

A process can determine on which processor it is currently running using the sched_getcpu interface:

```c
#define _GNU_SOURCE
#include <sched.h>
int sched_getcpu(void);
```

The result is the index of the CPU in the CPU set. 

Due to the nature of scheduling this number cannot always be 100% correct. 

The thread might have been moved to a different CPU between the time the result was returned and when the thread returns to userlevel. 

Programs always have to take this possibility of inaccuracy into account.

More important is, in any case, the set of CPUs the thread is allowed to run on. 

This set can be retrieved using sched_getaffinity. 

The set is inherited by child threads and processes. 

Threads cannot rely on the set to be stable over the lifetime. 

The affinity mask can be set from the outside (see the pid parameter in the prototypes above); 

Linux also supports CPU hot-plugging which means CPUs can vanish from the system–and, therefore, also from the affinity（亲和力） CPU set.


# 多线程程序

In multi-threaded programs, the individual threads officially have no process ID as defined by POSIX and, therefore, the two functions above cannot be used. 

Instead `<pthread.h>` declares four different interfaces:

```c
#define _GNU_SOURCE
#include <pthread.h>
int pthread_setaffinity_np(pthread_t th, size_t size, const cpu_set_t *cpuset);
int pthread_getaffinity_np(pthread_t th, size_t size, cpu_set_t *cpuset);
int pthread_attr_setaffinity_np(pthread_attr_t *at, size_t size, const cpu_set_t *cpuset);
int pthread_attr_getaffinity_np(pthread_attr_t *at, size_t size, cpu_set_t *cpuset);
```

## 处理进程中的各个线程

The first two interfaces are basically equivalent to the two we have already seen, except that they take a thread handle in the first parameter instead of a process ID. 

前两个接口基本上等同于我们已经看到的两个接口，除了它们在第一个参数而不是进程ID中使用线程句柄。

This allows addressing individual threads in a process. 

It also means that these interfaces cannot be used from another process, they are strictly for intra-process use. 

这些意味着这些接口不能被其他进程使用，被严格地限制在当前进程内使用。

## 显示指定目标处理器

The third and fourth interfaces use a thread attribute. 

These attributes are used when creating a new thread. 

By setting the attribute, a thread can be scheduled from the start on a specific set of CPUs. 

Selecting the target processors this early–instead of after the thread already started–can be of advantage on many different levels, including (and especially) memory allocation (see NUMA in section 6.5).

尽早选择目标处理器 - 而不是在线程已经启动之后 - 在许多不同的级别上都是有利的，包括（尤其是）内存分配（参见6.5节中的NUMA）。


# NUMA 编程中的作用

Speaking of NUMA, the affinity interfaces play a big role in NUMA programming, too. 

We will come back to that case shortly.

So far, we have talked about the case where the working set of two threads overlaps（重叠） such that having both threads on the same core makes sense. 

The opposite can be true, too. 

If two threads work on separate data sets, having them scheduled on the same core can be a problem. 

Both threads fight for the same cache, thereby reducing each others effective use of the cache. 

Second, both data sets have to be loaded into the same cache; 

in effect this increases the amount of data that has to be loaded and, therefore, the available bandwidth is cut in half.

如果两个线程在不同的数据集上工作，那么将它们安排在同一个核心上可能会有问题。

两个线程争用相同的缓存，从而减少彼此对缓存的有效使用。

其次，两个数据集都必须加载到同一个缓存中;

实际上，这增加了必须加载的数据量，因此可用带宽减少了一半。

## 解决方案

The solution in this case is to set the affinity of the threads so that they cannot be scheduled on the same core. 

This is the opposite from the previous situation, so it is important to understand the situation one tries to optimize before making any changes.

Optimizing for cache sharing to optimize bandwidth is in reality an aspect of NUMA programming which is covered in the next section. 

One only has to extend the notion of “memory” to the caches. 

This will become ever more important once the number of levels of cache increases.

For this reason, a solution to multi-core scheduling is available in the NUMA support library. 

See the code samples in Appendix D for ways to determine the affinity masks without hardcoding system details or diving into the depth of the /sys filesystem.

在这种情况下，解决方案是设置线程的亲和性，以便它们不能在同一核心上进行调度。

这与之前的情况相反，因此了解在进行任何更改之前尝试优化的情况非常重要。

优化高速缓存共享以优化带宽实际上是NUMA编程的一个方面，将在下一节中介绍。

人们只需要将“Memory”的概念扩展到缓存。

一旦缓存级别增加，这将变得越来越重要。

因此，NUMA支持库中提供了多核调度解决方案。

有关确定关联掩码的方法，请参阅附录D中的代码示例，无需硬编码系统详细信息或深入了解/ sys文件系统。

# 参考资料

P72

* any list
{:toc}