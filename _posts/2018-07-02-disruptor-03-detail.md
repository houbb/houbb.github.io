---
layout: post
title:  Disruptor-03-技术实现细节
date:  2018-07-02 14:30:21 +0800
categories: [Concurrent]
tags: [concurrent]
published: true
---

# # JMM

[JMM 系列](https://houbb.github.io/2018/07/26/jmm-01-intro)

# Disruptor

Disruptor 是 LMAX一种新型零售金融交易平台， 后台架构的核心组件之一，能够在无锁的情况下实现网络的Queue并发操作， 官方描述： 一个线程里每秒处理6百万订单。

在设计Disruptor时要避免写竞争，让数据更久的留在cache里， 避免JMV 过度GC。

Disruptor的核心是一个circular array，有个cursor，里面有sequence number，数据类型是long。如果不考虑consumer，只有一个producer在写，就是不停的往entry里写东西，然后增加cursor上的sequence number。为了避免cursor里的sequence number和其他variable造作false sharing，disruptor定义了7个long型，并没有给它们赋值，然后再定义cursor。

这样cursor就不会和其他variable同时出现在一个cache line里，**内存填充技术**。

这个Ring buffer 是循环使用，如果producer在写的过程中，超出了原来的长度，就不停地覆盖原来的数据，增加cursor里的sequence number。bucket里的entry都是pre-allocated，避免每次都new一个object。因为disruptor是用java写的，这样可以避免garbage collection。producer写的过程是two phase commit。

Consumer每次在访问时需要先检查sequence number是否available，如果不available，会有多种策略。latency最高的一种是盲等。producer在写的时候，需要检查最低的sequence number在哪儿。这里不需要lock的原因是sequence number是递增的。producer不需要赶在最低sequence number前面，因而没有write contention。此外，disruptor使用memory barrier通知数据的更新。

Disruptor 使用：

- 内存填充放在伪共享

- 预分配内存减少GC

- CAS

- 内存屏障，无锁保证数据可见性

Disruptor 也在我们使用的框架， Axonframework 和我们熟悉的 log4j2 中大量使用， 后面在具体的业务中再细看。

# Martin fowler

在软件架构界 Martin fowler 是个比较有名的角，他的这篇文章 [The LMAX Architecture](https://martinfowler.com/articles/lmax.html) 对于Disrutpor CQRS, Event source 有很多的解读， 我们设计的交易系统架构也部分参考了此理论， 这篇文章Martin fowler 根据LMAX 中对disruptor 的使用， 以及衍生到我们普遍的架构上面的问题进行了叙述， 这里仅做摘要， 具体细节大家翻阅原文。

LMAX 是一个新零售金融公司（估计针对散户），这样在峰值交易量会比较大， LMAX母公司是 betfair 也就是个赌-球的公司，赌-球在有大事件的时候同样交易量非常大， 那么在传统的解决方案， 很多事围绕一个强劲的DB来做， 维持高并发下的事务。 

于是促成了 LMAX 尝试 actor model 以及他类似的SEDA, 我们比较熟悉的 AKKA 的 actor model 就是一个常见的应用。 

Actor模型=数据+行为+消息。

Actor模型内部的状态由自己的行为维护，外部线程不能直接调用对象的行为，必须通过消息才能激发行为，这样就保证Actor内部数据只有被自己修改,很多人喜欢使用这样的模型，这样避免在同步原语上的纠结。

同样LMAX团队也试图使用此模型， 但是他们发现了主要的瓶颈发生在消息通道，也就是队列Queue上面, 对性能追求极致的时候， 参考Martin Thompson 提出的 "mechanical sympathy"：如赛车手一样能个和自己赛车融为一体，感知机械细微之处，LAMX主要针对这个方向进行重现设计和架构。

由于如上文CPU 和内存之间的工作模式， 导致缓存、主存中间的竞争， Actor model 天然集成数据的操作， 可以很好解决缓存问题， 但是一个Acotor 还是需要和其他Actor 交流，也就Queue. 有Queue,就有写入和读出操作，就有对队列的资源竞争， 最简单的解决方案就是加个锁， 这将导致更多上下文的切换，LMAX 团队创建了新数据结构 Disruptor: 单核写入，多个读，以实现无锁化操作，单线程写入瓶颈就在于：单线程的性能在当今的架构下能达到多大？ 

于是 Disruptor 做了大量的测试： “The 6 million（600万） TPS benchmark was measured on a 3Ghz dual-socket quad-core Nehalem based Dell server with 32GB RAM.”

## LMAX 最基本的架构

![LMAX](https://upload-images.jianshu.io/upload_images/2842122-9070d3d5d656a4ec.png?imageMogr2/auto-orient/strip|imageView2/2/w/654/format/webp)

- 业务处理逻辑（核心业务）

- 输入disruptor

- 输出disruptor

业务处理逻辑，为单线程不需要依赖任何框架，核心可以在任何 JVM 上面运行。

真正的业务处理逻辑，可能么有那么简单， 需要从网络上收到消息，然后反序列化，冗余备份等等操作， 输出消息同样序列化传播出去， 这些任务都由输入、输出disruptor来处理。由于他们涉及到大部分是独立的IO 操作， 所以可以多线程并行处理，这个架构虽然为LMAX定制， 但是可以为其他架构借鉴。

## 业务处理逻辑

业务处理逻辑单线程的接收消息（输入），处理业务逻辑，然后把处理结果以 Event 方式发送给输出Disruptor, 所有的这些过程都是在内存中处理， 没有落地处理， 这里有几个好处， 首先都在内存会非常快， 其二由于是单线程序列化顺序（sequentially）处理，不需要事务管理。这使整个架构非常简单明了， 减低了编程的难度，也就减少了潜在的错误概率。

如果崩溃了如何处理？ 即使系统再健壮，也避免不了比如停电等等不可控制因素，采用了Event Source(参考前几篇) 方式， 当前业务驱动都是由输入Event 触发， 然后生成输出Event, 只要输入Event 已经落地， 就没有这个问题了， 你都可以replay事件流恢复到当前状态（这里需要保持幂等操作！）。

在具体Event Source 的操作上面，有很多的方案，基本的逻辑也都比较直观易懂（我们采用Axon框架）， 为了加快状态的恢复， 可以定期的做Snapshot， 这样恢复就非常迅速不需要从第一个事件开始， LAMX 每天晚上做一个Snapshot, 这样重启服务，加载Snapshot, 重发后续事件都能很快完成。

Snapshot 还不足够维持7X24，特别在比如你半夜东西坏掉， LMAX采用两个业务模块并行处理， 每个事件都由会两个业务模块处理，一个业务模块的处理结果会被抛弃， 如果一个废掉，另外一个直接切换过去， 据说可以做到毫秒级别,目前我们的做法是减少Snapshot 周期， 比如1024个版本一个，集群做parittion,坏掉在另外一台机上恢复。

Eventsource, 好处不仅记录所有的状态转变（Event），同时多个下游可以针对不同的业务场景消费这些Event， 比如监控、分析、聚合、风控等等， 互不干扰。

## 性能优化

如上面描述， 这里的核心点是， 业务逻辑在内存中， 单线程，序列化处理， 可以很容易让程序突破10K TPS限制， 如果刻意优化想可以达到100K, 只要你的代码够精简, 更和合理的内存分配和CPU使用策略。

LMAX 对数据结构的使用进行了优化，这样对内存和 GC 更友好，比如用原生的long 值作为hashmap 的key， LongToObjectHashMap(fastutils 有更多)， 一个好的数据格式，对性能优化至关重要， 但是很多程序员都使用更方便的数据结构， 信手拈来什么方便用上面， 最好掂量平衡下,小优化可能带来大性能提升。

## 编程模型

基于上面我们所说的处理方式， 将对你的业务逻辑层带来不少限制， 你需要剔除对远程服务的调用， 一个远程服务的调用，将拉慢你的处理效率， 单线程处理业务逻辑可能会被挂起，这样整个处理的速度会降下来，所以你不能在业务逻辑层调用其他服务，取而代之，你发送事件到output event， 等待一个回调的input event。

打个简单的例子， 比如你用信用卡买罐豆子，一般的流程是，零售系统会检查的订单信息， 然后给信用卡检查服务发送请求，检查你的信用卡号，然后再确认你的订单，所有的一步完成，如果远程反馈缓慢你的订单的线程将被阻塞住，所以你启动多个线程来满足更多用户的请求。

但是在LMAX 的架构中，你需要将这个操作分层两组，第一个来获取用户的订单信息， 完成后，发送一个事件出来（信用卡检查请求），发送给信用卡公司。而业务逻辑层不会阻塞，继续处理其他用户的请求， 直到收到一个信用卡验证完的事件回到input 事件流中，然后继续下面的确认事宜。

以事件驱动模型，异步处理方式，是挺普遍的一种方式来增加吞吐量，同时让你的业务逻辑层， 更有弹性扩展性，只需要处理自己部分东西， 不需要关注外围的系统。

当然这种方式要有很好的应错能力， 不能做到强事务，需要比如事务补偿机制， 达到最终一致性（笔者加的）， LMAX 在事件输入输出端都用了Disruptor， 所以一旦错误发生，在内存中保持状态一致性很重要，但是这里没有一个自动回滚措施， 所以 LMAX 团队十分注意输入事件的验证措施， 来保证任何对内存数据状态的更新保证一致性，同时在上线前做大量的测试， 在我们系统，更多的解决方案是做transaction 补偿措施。

## 输入输出Disruptor

业务逻辑层是单线程， 但是在数据进入业务逻辑层前需要做很多工作， 比如消息反序列化， Eventsource将消息落地， 最终需要一个集群化的业务逻辑层来支撑这个架构，这样我们可以集群中replicate 这些输入消息， 同样对输出端也是。

![输入Disruptor 需要做的事情](https://upload-images.jianshu.io/upload_images/2842122-64b817dc20f8f3a6.png?imageMogr2/auto-orient/strip|imageView2/2/w/547/format/webp)

这里的journal, replicate,unmarshall， 都涉及到IO 操作，都比较耗时，他们不像业务逻辑层， 需要严格单线程处理：比如交易系统，每个单子先来后到都影响后续成交的价格等。 

这些操作可以并行， 于是用到了 Disruptor, 也就是下图：

![Ringbuffer](https://upload-images.jianshu.io/upload_images/2842122-26b20c3594551713.png?imageMogr2/auto-orient/strip|imageView2/2/w/688/format/webp)

Disruptor 是一个生产者们用来放置对象以供多个消费者并行消费的queue,如果你仔细看的话他就是一个 Ring Buffer（环状缓冲）， 每个生产者和消费者都有一个序列号， 表示他们当前正在处理的槽，每个人只能修改自己的序列号， 但是可以读所有其它人的序列号， 这样的生产者可以查看消费者的计数来保证，他要写入的槽没有被人占用。同样一个消费者也可以监控其它消费者的计数， 来处理只有经过其它人处理过的槽。

输出端的 disruptors 也非常类似，他们用来处理序列化，和向网络上发送的任务。外输的消息可以分不同的topic, 每个topic 用一个disruptor 来分开发送，增加并发量。

Disruptor 可以支持一个生产者和多个消费者，也支持多个生产者多个消费者模式。

Disruptor 有个好处是如果消费者跟不上速度，比如一个反序列化比较慢，可以批量的处理数据。 比如现在反序列化到15槽， 处理完已经到31槽来， 他可以批量的读取16～30数据，这样处理方式可以让比较慢的消费者可以跟上来，以减少延迟。

增加更多的消费者， 也可以增加并发量， 比如落地消费者比较慢， 可以增加两个， 一个专门消费下标是偶数的槽， 另外一个处理下标是奇数的槽，这样就可以大大增加并发量。 这个也是Axon里面使用到的一个方法，多消费者分不同segement， 根据aggregate identifier 的hash值取模，消费者来处理，这样既保证来每个aggregate处理在同一个线程， 也增加来并发量， 这也是为什么disruptor可以带来4倍的性能提升。

Ringbuffer 的大小需要是2的次方， 这样好处可以快速的取模， 在LMAX和其它的系统一样Disruptor也要被每晚重启， 重启的主要目的是清理内存，这样大大减少在交易时间由于gc导致昂贵的垃圾回收开销－－定时重启是个很好的方法， 不仅仅是这里避免垃圾回收，其实也是对你系统的一个锻炼，应急反应。

Journaler 的工作主要是把所有的事情落地化， 在出错的时候可以replay恢复状态，LMAX没有用数据库落地， 而是简简单单的文件系统，在大家看来这个可能不可思议， 但是顺序写入文件系统的性能可能不逊于内存， 这点可以参考kafka的解读。

先前我们讨论来LMAX，用多台机器集群以更快的进行failover, replicator 的用途就是保证这些机器之间的同步， 所有LMAX集群交流使用来IP广播，这样每个客户端不需要知道那个节点是master, 这个由master几点自己控制选择监听，然后在replicator, replicator把收到的事件广播给其它的slave节点， 如果master节点死掉来，比如没有来心跳， 另外一个节点将编程master节点， 开始消费输入事件， 启动他自己的replicator, 每个节点都由这里全套的组件，序列化，落地，反序列化。（这里如何选择master, 脑裂如何解决？ ）

反序列化把网络收到的数据，转化成java 对象，一共业务逻辑层使用，这个消费者和其它消费者不一样， 他需要修改ring buffer 里的东西， 这里需要遵循的规则是，消费者可以往ring buffer 中写东西， 同时只能由一个消费者写入，

![完整架构](https://upload-images.jianshu.io/upload_images/2842122-9c4e7e963ceb2759.png?imageMogr2/auto-orient/strip|imageView2/2/w/608/format/webp)

## 其它

- 并行和并发

并行并发是两种不同概念， 这里 [Concurrency vs Parallelism - What is the difference?](https://stackoverflow.com/questions/1050222/what-is-the-difference-between-concurrency-and-parallelism)

有讨论，不再细述，里面 go 小人画不错，解释也比较形象到位。

- 线程和其他

quasar 如何和 golang 比较， Quasar 在一些框架中已经使用， 比如 corda。

这片文章比较长，下篇将具体讲解 Axon中的一些细节和坑。

ps: Disruptor 是非常不过的技术框架，应该从这一节中独立出来。

# 参考资料

[JMM & Disruptor](https://www.jianshu.com/p/e4c788fb8d2a)

* any list
{:toc}