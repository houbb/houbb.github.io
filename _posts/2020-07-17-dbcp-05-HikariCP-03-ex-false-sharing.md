---
layout: post
title: HikariCP 拓展阅读之伪共享 (False sharing)
date:  2020-7-17 16:52:15 +0800
categories: [Database]
tags: [database, sql, dbcp, sh]
published: true
---

# 拓展阅读

[从零开始手写 mybatis （三）jdbc pool 如何从零手写实现数据库连接池 dbcp？](https://houbb.github.io/2020/06/21/hand-write-mybatis-03-jdbc-pool)

[万字长文深入浅出数据库连接池 HikariCP/Commons DBCP/Tomcat/c3p0/druid 对比](https://houbb.github.io/2020/07/17/dbcp-00-all-in-one)

[Database Connection Pool 数据库连接池概览](https://houbb.github.io/2020/07/17/dbcp-01-overview)

[c3p0 数据池入门使用教程](https://houbb.github.io/2020/07/17/dbcp-03-c3p0-00-hello-world)

[alibaba druid 入门介绍](https://houbb.github.io/2020/07/17/dbcp-04-druid-01-intro)

[数据库连接池 HikariCP 性能为什么这么快？](https://houbb.github.io/2020/07/17/dbcp-05-HikariCP-02-why-so-fast)

[Apache Tomcat DBCP（Database Connection Pool） 数据库连接池-01-入门介绍](https://houbb.github.io/2020/07/17/dbcp-06-tomcat-pool-01-intro)

[vibur-dbcp 并发、快速且功能完备的 JDBC 连接池，提供先进的性能监控功能-01-入门介绍](https://houbb.github.io/2020/07/17/dbcp-07-vibur-pool-01-intro)

# 拓展阅读

[锁专题（13）使用 @sun.misc.Contended 避免伪共享](https://houbb.github.io/2020/10/17/lock-13-hack-share)

# 伪共享 (False sharing)

在计算机科学中，伪共享是一种性能下降的使用模式，它可能出现在具有分布式一致性缓存的系统中，而这些缓存的大小是由缓存机制管理的最小资源块的大小。当系统参与者尝试周期性地访问由另一方不修改的数据，但这些数据与正在被修改的数据共享一个缓存块时，缓存协议可能会强制第一个参与者重新加载整个缓存块，尽管没有逻辑上的必要性。这个缓存系统不知道该块内的活动，并迫使第一个参与者承担由资源的真实共享访问所需的缓存系统开销。

# 多处理器 CPU 缓存

迄今为止，这个术语最常见的用法是在现代多处理器 CPU 缓存中，其中内存以某个小于 2 的幂次的字大小的行进行缓存（例如，对齐的 64 个连续字节）。如果两个处理器在相同的内存地址区域上操作独立的数据，并且这些数据可以存储在单个行中，那么系统中的缓存一致性机制可能会在每次数据写入时通过总线或互连强制整个行，从而导致内存停顿，除了浪费系统带宽。在某些情况下，消除伪共享可能会带来数量级的性能改进。伪共享是自动同步的缓存协议的固有产物，并且也可能存在于分布式文件系统或数据库等环境中，但目前它主要存在于 RAM 缓存中。

# 例子

```c
#include <iostream>
#include <thread>
#include <new>
#include <atomic>
#include <chrono>
#include <latch>
#include <vector>

using namespace std;
using namespace chrono;

#if defined(__cpp_lib_hardware_interference_size)
// default cacheline size from runtime
constexpr size_t CL_SIZE = hardware_constructive_interference_size;
#else
// most common cacheline size otherwise
constexpr size_t CL_SIZE = 64;
#endif

int main()
{
    vector<jthread> threads;
    int hc = jthread::hardware_concurrency();
    hc = hc <= CL_SIZE ? hc : CL_SIZE;
    for( int nThreads = 1; nThreads <= hc; ++nThreads )
    {
        // synchronize beginning of threads coarse on kernel level
        latch coarseSync( nThreads );
        // fine synch via atomic in userspace
        atomic_uint fineSync( nThreads );
        // as much chars as would fit into a cacheline
        struct alignas(CL_SIZE) { char shareds[CL_SIZE]; } cacheLine;
        // sum of all threads execution times
        atomic_int64_t nsSum( 0 );
        for( int t = 0; t != nThreads; ++t )
            threads.emplace_back(
                [&]( char volatile &c )
                {
                    coarseSync.arrive_and_wait(); // synch beginning of thread execution on kernel-level
                    if( fineSync.fetch_sub( 1, memory_order::relaxed ) != 1 ) // fine-synch on user-level
                        while( fineSync.load( memory_order::relaxed ) );
                    auto start = high_resolution_clock::now();
                    for( size_t r = 10'000'000; r--; )
                        c = c + 1;
                    nsSum += duration_cast<nanoseconds>( high_resolution_clock::now() - start ).count();
                }, ref( cacheLine.shareds[t] ) );
        threads.resize( 0 ); // join all threads
        cout << nThreads << ": " << (int)(nsSum / (1.0e7 * nThreads) + 0.5) << endl;
    }
}
```

这段代码展示了伪共享的效果。它从一个线程创建逐渐增加到系统中物理线程的数量。

每个线程依次递增一个缓存行的一个字节，这个缓存行作为一个整体被所有线程共享。线程之间的争用程度越高，每个递增操作所需的时间就越长。

以下是在一个拥有 16 个核心和 32 个线程的 Zen4 系统上的结果：

```
1: 1
2: 4
3: 6
4: 9
5: 11
6: 13
7: 15
8: 17
9: 16
10: 18
11: 21
12: 25
13: 29
14: 35
15: 39
16: 41
17: 43
18: 44
19: 48
20: 49
21: 51
22: 53
23: 58
24: 61
25: 68
26: 75
27: 79
28: 82
29: 85
30: 88
31: 91
32: 94
```

如您所见，在该系统上，完成对共享缓存行的递增操作可能需要多达 100 纳秒，相当于该 CPU 上大约 420 个时钟周期。

# 缓解方法

有一些方法可以缓解伪共享的影响。

例如，可以通过重新排列变量或在变量之间添加填充（未使用的字节）来防止 CPU 缓存中的伪共享。然而，这些程序更改中的一些可能会增加对象的大小，导致内存使用率增加。编译时数据转换也可以减轻伪共享。然而，其中一些转换可能并不总是被允许的。

例如，C++23 的 C++ 编程语言标准草案规定，数据成员必须按照后面的成员具有更高地址的方式布局。

有一些工具可以检测伪共享。还有一些系统可以同时检测和修复执行程序中的伪共享。然而，这些系统会带来一些执行开销。


# 参考资料

https://en.wikipedia.org/wiki/False_sharing

* any list
{:toc}