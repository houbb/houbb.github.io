---
layout: post
title:  Cache Travel-09-从零手写 redis（零）为什么手写 redis
date:  2018-09-01 12:24:42 +0800
categories: [Cache]
tags: [cache, sh]
published: true
---

# redis 的重要性

做 java 的，天天喊着高性能，高并发，高可用。

高性能之中，基本上都离不开 redis。

特别是在当今对于性能要求越来越高的时代，mysql 等传统数据库越来越需要与 redis 结合，这样才能更好的适应我们的业务。

以前手写过一次 hades，觉得不满意，就废弃了。

本次重新再写一次。

开源地址：

> [https://github.com/houbb/cache](https://github.com/houbb/cache)

# 目录

![image](https://upload-images.jianshu.io/upload_images/5874675-c8c9e3a106d9d880?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

[​java从零手写实现redis（一）如何实现固定大小的缓存？](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484380&idx=1&sn=be0f6c3df5cf186e43012ba2a322bced&scene=21#wechat_redirect)

[java从零手写实现redis（二）redis expire 过期原理](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484388&idx=1&sn=941a70323a03ecc836b3d8b58b312c2d&scene=21#wechat_redirect)

[java从零手写实现redis（三）内存数据如何重启不丢失？](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484394&idx=1&sn=b28bab43fbcbb716b1962a91eafaaddb&scene=21#wechat_redirect)

[java从零手写实现redis（四）添加监听器](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484401&idx=1&sn=6df09b2e7519b2e2c3119ef993249e4e&scene=21#wechat_redirect)

[java从零手写实现redis（五）过期策略的另一种实现思路](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484408&idx=1&sn=c6a5af5727f36aeb9a469b048a04607f&scene=21#wechat_redirect)

[java从零手写实现redis（六）AOF 持久化原理详解及实现](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484415&idx=1&sn=3fb59bc10039f7f419a96d282ede3d7d&scene=21#wechat_redirect)

[java从零开始手写redis（七）LRU 缓存淘汰策略详解](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484421&idx=1&sn=d98eac57115eeaf02cbbf68047403da3&scene=21#wechat_redirect)

[java从零开始手写redis（八）朴素 LRU 淘汰算法性能优化](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484433&idx=1&sn=f65dbaa07abfec1fe8a39a85a0ab3fbe&scene=21#wechat_redirect)

[java 从零开始手写 redis（九）LRU 缓存淘汰算法如何避免缓存污染](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484435&idx=1&sn=7c80a9f958601db1b5c6ae2079b8b81c&scene=21#wechat_redirect)

[java 从零开始手写 redis（十）缓存淘汰算法 LFU 最少使用频次](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484461&idx=4&sn=99d6324a148e13576c6875f1de8e3ad9&scene=21#wechat_redirect)

[java 从零开始手写 redis（11）clock时钟淘汰算法详解及实](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484461&idx=3&sn=75bd11ca2e6821ad9a431cd2b1a7694a&scene=21#wechat_redirect)

[java 从零开始手写 redis（12）redis expire 过期如何实现随机获取keys？](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484461&idx=2&sn=7ce06fc226901d96ad66b1f5733cb2b9&scene=21#wechat_redirect)

# chat

## 淘汰算法

淘汰算法，除了 FIFO/LRU/LFU/tinyLFU 还有其他算法吗？

当然，除了常见的FIFO（先进先出）、LRU（最近最少使用）、LFU（最少使用）、TinyLFU外，还有其他一些淘汰算法和策略。以下是一些其他常用的淘汰算法：

1. **MRU（最近最多使用）**：与LRU相反，MRU算法会选择最近使用的项目进行淘汰。

2. **Random（随机）**：这种算法随机选择一个缓存条目进行淘汰，不考虑该条目的访问频率或时间。

3. **Clock（时钟）**：这是一种改进的FIFO算法，使用一个“时钟”指针来维护项目的访问状态。当需要淘汰项目时，它会检查指针指向的项目，如果该项目的访问位是0，则选择淘汰它；如果访问位是1，则将其重置为0并继续检查下一个项目，直到找到一个可淘汰的项目。

4. **2Q（双队列）**：这种算法使用两个队列来维护缓存，一个是LFU队列，另一个是LRU队列。新访问的项目首先进入LRU队列，然后根据其访问频率从LRU队列移动到LFU队列。这种方法结合了LFU和LRU的优点。

5. **ARC（自适应替换缓存）**：ARC算法结合了LRU和LFU的特性，通过动态调整LRU和LFU的大小，以适应访问模式的变化。

6. **LIRS（最低最近使用）**：LIRS算法是LIRS缓存算法的扩展，它尝试维护两种LRU链表，一种是最近最少使用的（LIR），另一种是最长非最近使用的（HIR）。这种方法试图减少LRU算法的缺点。

这些算法各有优点和缺点，适合不同的应用和工作负载。选择哪种算法取决于具体的应用需求和性能目标。

## 优缺点

当然，以下是常见淘汰算法的优缺点及适合的场景：

### 1. FIFO（先进先出）

**优点**：
- 实现简单，容易理解和实现。

**缺点**：
- 不考虑项目的访问频率或重要性。
- 不适合缓存中存在频繁访问和非常重要的数据。

**适合场景**：
- 对数据访问没有特定要求或对数据访问模式了解不足的场合。

### 2. LRU（最近最少使用）

**优点**：
- 考虑了最近的访问模式，通常能够有效地缓存常用的数据。

**缺点**：
- 在某些工作负载下，如周期性访问模式，可能无法有效地缓存数据。
- 对于长时间不被访问但频繁访问的数据，LRU效果可能不佳。

**适合场景**：
- 数据访问模式有较强的局部性。
- 缓存中存在热点数据的场合。

### 3. LFU（最少使用）

**优点**：
- 能够有效地缓存经常访问的数据，即使是非常小的数据也能被有效地缓存。

**缺点**：
- 可能会忽略一些长时间未被访问但重要的数据。
- 可能对突发性或周期性访问模式的数据不敏感。

**适合场景**：
- 需要缓存小而频繁访问的数据的场合。
- 数据访问模式更为稳定的场合。

### 4. Random（随机）

**优点**：
- 简单，没有额外的计算开销。

**缺点**：
- 不能根据访问模式适应性地缓存数据。
- 效果可能不稳定，随机性可能导致缓存命中率波动。

**适合场景**：
- 对数据访问没有特定要求的场合。
- 用于与其他策略结合，如随机替换的一部分。

### 5. ARC（自适应替换缓存）

**优点**：
- 结合了LRU和LFU的优点，能够适应不同的访问模式。
- 具有自适应性，能够动态调整LRU和LFU的大小。

**缺点**：
- 实现较复杂，可能需要更多的计算资源。

**适合场景**：
- 数据访问模式变化较大的场合。
- 需要结合LRU和LFU的优点以提高缓存命中率的场合。

### 6. LIRS（最低最近使用）

**优点**：
- 尝试减少LRU算法的缺点，提高对长时间未被访问但重要的数据的缓存效果。

**缺点**：
- 实现复杂性较高，可能需要更多的计算资源。

**适合场景**：
- 数据访问模式有较强的局部性，但也有长时间不被访问但重要的数据的场合。

选择合适的淘汰算法需要根据具体的应用需求、数据访问模式和性能目标来决定。

不同的场景可能需要不同的算法来达到最佳的性能。


## caffine 缓存设计，是如何保证并发安全的？

Caffeine 是一个 Java 高性能缓存库，它采用了多种技术来确保并发安全。以下是 Caffeine 缓存设计中用于确保并发安全的一些关键策略：

### 1. **线程安全的数据结构**

Caffeine 使用线程安全的数据结构来管理缓存条目，例如使用 `ConcurrentHashMap` 或其他线程安全的映射实现来存储缓存键值对。

### 2. **CAS (Compare-And-Swap) 操作**

在更新缓存条目时，Caffeine 使用 CAS 操作来确保只有一个线程能够成功更新缓存，这有助于避免并发更新导致的数据不一致问题。

### 3. **分段锁**

Caffeine 采用了分段锁（Segment Locking）策略，将缓存分为多个段（segments）。每个段有自己的锁，这样在更新缓存时只需锁定需要更新的那个段，而不是整个缓存。这提高了并发性能，因为多个线程可以同时访问不同的段。

### 4. **高效的并发控制**

Caffeine 使用高效的并发控制技术，如读写锁、乐观锁等，以实现高并发访问。这些机制允许多个读取操作同时进行，但会限制写入操作，确保数据的完整性和一致性。

### 5. **内存回收策略**

Caffeine 通过垃圾回收和其他内存管理技术来管理内存使用，防止缓存过度消耗系统资源。它还提供了灵活的配置选项，允许开发者根据应用需求调整缓存的大小和回收策略。

### 6. **高效的数据结构**

Caffeine 使用高效的数据结构来存储和管理缓存条目，如堆内存和堆外内存的高效管理，以及对各种访问模式的优化，以提供高性能的缓存访问。

总体来说，Caffeine 通过结合多种高效的并发控制策略和数据结构设计，提供了一个既高性能又并发安全的缓存解决方案。这使得它成为 Java 应用程序中广泛使用的缓存库之一。

## 是不是底层就是用的 ConcurrentHashMap?

是的，Caffeine 的底层确实使用了 `ConcurrentHashMap` 作为其主要的数据结构来存储缓存条目。`ConcurrentHashMap` 是 Java 标准库中提供的一个线程安全的哈希表实现，它提供了高并发性能和良好的可扩展性。

Caffeine 在 `ConcurrentHashMap` 的基础上添加了额外的优化和功能，以满足缓存的特定需求，例如：

- **缓存策略**：Caffeine 提供了多种缓存策略，如 `LRU`、`LFU` 和 `tinyLFU`，这些策略在 `ConcurrentHashMap` 的基础上进行了适配和优化。
  
- **内存管理**：Caffeine 通过自定义的内存回收策略，如 `W-TinyLFU`，进一步优化了内存使用效率。

- **并发控制**：除了 `ConcurrentHashMap` 提供的基本并发控制机制外，Caffeine 还引入了分段锁（Segment Locking）等高级并发控制策略，以提高并发性能。

因此，尽管 `ConcurrentHashMap` 是 Caffeine 的核心组件之一，但 Caffeine 通过添加额外的优化和功能，使其成为一个高性能、灵活和可配置的缓存解决方案。

## ARC（自适应替换缓存）这种有具体的实现吗？哪些开源的缓存实现了

ARC（Adaptive Replacement Cache）是一种自适应替换策略，它结合了最近最少使用（LRU）和最近最少替换（LFU）两种策略，以动态地适应工作负载的变化。

它旨在克服单一替换策略在不同工作负载下可能遇到的局限性。

许多开源缓存实现中都提供了 ARC 策略或其变体。

以下是一些实现了 ARC 或类似策略的知名开源缓存项目：

1. **Caffeine**：Caffeine 是一个高性能的 Java 缓存库，它支持多种替换策略，其中就包括了 ARC。

2. **LIRS (Low Inter-reference Recency Set) Cache**：LIRS 是另一种高效的缓存替换策略，它也结合了 LRU 和 LFU 的特点。虽然 LIRS 不完全等同于 ARC，但它们都试图通过结合不同的策略来提高缓存的性能。

3. **Memcached**：虽然 Memcached 主要采用了 LRU 策略，但社区中有人提出了使用 ARC 或其变体作为替代策略的扩展。

4. **Redis**：Redis 是一个流行的内存数据库，它支持多种数据结构和缓存策略。虽然 ARC 不是 Redis 的默认替换策略，但社区中有一些第三方模块提供了实现 ARC 或其变体的选项。

5. **Tinycache**：这是一个轻量级的 Python 缓存库，支持多种替换策略，包括 ARC。

请注意，尽管 ARC 是一个有效的替换策略，但它可能不适合所有应用场景。选择最佳的缓存策略通常需要考虑特定应用的需求和工作负载特性。

## ARC 是目前淘汰性能最好的算法吗？

ARC（Adaptive Replacement Cache）确实是一种非常高效和智能的缓存替换策略，它结合了最近最少使用（LRU）和最近最少替换（LFU）两种策略的优点。

这种策略允许 ARC 在不同的工作负载下动态调整自己的行为，从而更好地适应实际的访问模式。

然而，"最好"的替换策略并不是绝对的，它很大程度上取决于特定应用的需求、工作负载的特性以及硬件环境。

在某些场景下，LRU、LFU 或其他替换策略可能会表现得与或甚至超过 ARC。

例如：

- **LRU（最近最少使用）**：在大多数情况下，LRU 提供了很好的性能，特别是当访问模式有明显的局部性时。
  
- **LFU（最近最少替换）**：在高度重复的访问模式下，LFU 可能会优于其他策略。

- **TinyLFU**：对于大多数实际工作负载，TinyLFU 通常表现得与 ARC 相当。

因此，是否选择 ARC，或者选择其他缓存替换策略，取决于你的具体需求和应用的特性。

在选择缓存策略时，通常需要进行实验和基准测试，以确定哪种策略最适合你的应用场景。

* any list
{:toc}