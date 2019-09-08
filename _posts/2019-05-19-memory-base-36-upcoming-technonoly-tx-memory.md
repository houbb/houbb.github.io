---
layout: post
title: Memory 内存知识-36-新技术之事务内存
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, tx, sh]
published: true
---

# Transactional Memory

In their groundbreaking（开创性） 1993 paper Herlihy and Moss propose to implement transactions for memory operations in hardware since software alone cannot deal with the problem efficiently. 

Digital Equipment Corporation, at that time, was already battling with scalability problems on their high-end hardware, which featured a few dozen processors. 

The principle is the same as for database transactions: the result of a transaction becomes visible all at once or the transaction is aborted and all the values remain unchanged.

原理与数据库事务的原理相同：事务的结果一次全部可见，或者事务中止，所有值保持不变。

## tx memory 意味着什么

This is where memory comes into play and why the previous section bothered to develop algorithms which use atomic operations. 

Transactional memory is meant as a replacement for–and extension of–atomic operations in many situations, especially for lock-free data structures.

Integrating a transaction system into the processor sounds like a terribly complicated thing to do but, in fact, most processors, to some extent, already have something similar.


## LL/SC

The LL/SC operations implemented by some processors form a transaction. 

The SC instruction aborts or commits the transaction based on whether the memory location was touched or not. 

Transactional memory is an extension of this concept. 

Now, instead of a simple pair of instructions, multiple instructions take part in the transaction.

To understand how this can work, it is worthwhile to first see how LL/SC instructions can be implemented.


# Load Lock/Store Conditional Implementation

If the LL instruction is issued, the value of the memory location is loaded into a register. 

As part of that operation, the value is loaded into L1d. 

The SC instruction later can only succeed if this value has not been tampered with（篡改）. 

## 如何检测是否篡改？

How can the processor detect（检测） this? 

Looking back at the description of the MESI protocol in Figure 3.18 should make the answer obvious. 

If another processor changes the value of the memory location, the copy of the value in L1d of the first processor must be revoked（撤销，废弃）.

When the SC instruction is executed on the first processor, it will find it has to load the value again into L1d.

This is something the processor must already detect.

## 更多细节

There are a few more details to iron out with respect to context switches (possible modification on the same processor) and accidental（偶然） reloading of the cache line after a write on another processor. 

This is nothing that policies (cache flush on context switch) and extra flags, or separate cache lines for LL/SC instructions, cannot fix.

In general, the LL/SC implementation comes almost for free with the implementation of a cache coherence protocol like MESI.

关于上下文切换（在同一处理器上可能进行修改）以及在另一个处理器上写入之后意外重新加载高速缓存行，还有一些细节可以解决。

这不是策略（在上下文切换时缓存刷新）和额外标志，或LL / SC指令的单独缓存行无法修复。

通常，LL / SC实现几乎是免费的，实现了像MESI这样的缓存一致性协议。


# Transactional Memory Operations

For transactional memory to be generally useful, a transaction must not be finished with the first store instruction.

Instead, an implementation should allow a certain number of load and store operations; this means we need separate commit and abort instructions. 

类似于数据库事务中，区分开 commit 和 abort。

In a bit we will see that we need one more instruction which allows checking on the current state of the transaction and whether it
is already aborted or not.

## 不同的实现方式

There are three different memory operations to implement:

- Read memory

- Read memory which is written to later

- Write memory

When looking at the MESI protocol it should be clear how this special second type of read operation can be useful. 

The normal read can be satisfied by a cache line in the ‘E’ and ‘S’ state. 

The second type of read operation needs a cache line in state ‘E’. 

Exactly why the second type of memory read is necessary can be glimpsed from the following discussion, but, for a more complete description, the interested reader is referred to literature about transactional memory, starting with.

确切地说，为什么第二种类型的存储器读取是必要的，可以从下面的讨论中看到，但是，为了更完整的描述，感兴趣的读者可以参考关于事务存储器的文献，从开始。

## 额外说明一点

In addition, we need transaction handling which mainly consists of the commit and abort operation we are already familiar with from database transaction handling.

There is one more operation, though, which is optional in theory but required for writing robust programs using transactional memory. 

This instruction lets a thread test whether the transaction is still on track and can (perhaps) be committed later, or whether the transaction already failed and will in any case be aborted.

但是还有一个操作，它在理论上是可选的，但是需要使用事务存储器编写健壮的程序。

该指令允许线程测试事务是否仍在进行中并且可以（可能）稍后提交，或者事务是否已经失败并且在任何情况下都将被中止。

We will discuss how these operations actually interact with the CPU cache and how they match to bus operation.

But before we do that we take a look at some actual code which uses transactional memory. 

This will hopefully make the remainder of this section easier to understand.


# Example Code Using Transactional Memory

For the example we revisit our running example and provide a LIFO implementation which uses the transactional memory primitives.

## 示例 code

This code looks quite similar to the not-thread-safe code, which is an additional bonus as it makes writing code using transactional memory easier. 

The new parts of the code are the LTX, ST, COMMIT, and VALIDATE operations.

These four operations are the way to request accesses to transactional memory. 

There is actually one more operation, LT, which is not used here. 

LT requests non-exclusive read access, LTX requests exclusive read access, and ST is a store into transactional memory. 

The VALIDATE operation checks whether the transaction is still on track to be committed. 

It returns true if this transaction is still OK. 

If the transaction is already marked as aborting, it will be actually aborted and a value indicating this is returned. 

The next transactional memory instruction will start a new transaction. 

For this reason, the code uses a new if block in case the transaction is still going 

- Figure 8.4: LIFO Using Transactional Memory

```c
struct elem {
  data_t d;
  struct elem *c;
};

struct elem *top;

void push(struct elem *n) {
  while (1) {
    n->c = LTX(top);
    ST(&top, n);
    if (COMMIT())
      return;
    ... delay ...
  }
}

struct elem *pop(void) {
  while (1) {
    struct elem *res = LTX(top);
    if (VALIDATE()) {
      if (res != NULL)
        ST(&top, res->c);
      if (COMMIT())
        return res;
      }
    ... delay ...
  }
}
```

## COMMIT 指令

The COMMIT operation finishes the transaction; if it is finished successfully the operation returns true. 

This means that this part of the program is done and the thread can move on. 

If the operation returns a false value, this usually means the whole code sequence must be repeated.

This is what the outer while loop is doing here. 

This is not absolutely necessary, though, in some cases giving up on the work is the right thing to do.

## LT LTX ST

The interesting point about the LT, LTX, and ST operations is that they can fail without signaling this failure in any direct way. 

有趣的是，这几个指令可以直接失败。

The way the program can request this information is through the VALIDATE or COMMIT operation. 

For the load operation, this can mean that the value actually loaded into the register might be bogus（虚假）;

that is why it is necessary in the example above to use VALIDATE before dereferencing the pointer. 

In the next section, we will see why this is a wise choice for an implementation.

It might be that, once transactional memory is actually widely available, the processors will implement something different. 

The results from suggest what we describe here, though.

这就是为什么在上面的例子中有必要在解除引用指针之前使用VALIDATE。

在下一节中，我们将了解为什么这是实现的明智选择。

可能的是，一旦事务存储器实际上广泛可用，处理器将实现不同的东西。

结果来自于我们在此描述的内容。

## push 函数

The push function can be summarized as this: 

the transaction is started by reading the pointer to the head of the list. 

The read requests exclusive ownership since, later in the function, this variable is written to. 

If another thread has already started a transaction, the load will fail and mark the still-born transaction as aborted; 

in this case, the value actually loaded might be garbage. 

This valu is, regardless of its status, stored in the *next* field of the new list member. 

This is fine since this member is not yet in use, and it is accessed by exactly one thread. 

The pointer to the head of the list is then assigned the pointer to the new element. 

If the transaction is still OK, this write can succeed. 

This is the normal case, it can only fail if a thread uses some code other than the provided push and pop functions to access this pointer. 

If the transaction is already aborted at the time the ST is executed, nothing at all is done. 

Finally, the thread tries to commit the transaction. 

If this succeeds the work is done; other threads can now start their transactions. 

If the transaction fails, it must be repeated from the beginning. 

Before doing that, however, it is best to insert an delay. 

If this is not done the thread might run in a busy loop (wasting energy, overheating the CPU).

这很好，因为该成员尚未使用，并且只有一个线程可以访问它。

然后，指向列表头部的指针被指定给新元素的指针。

如果事务仍然正常，则此写入可以成功。

这是正常情况，只有当线程使用除提供的push和pop函数之外的某些代码来访问此指针时，它才会失败。

如果在ST执行时事务已经中止，则什么都不做。

最后，线程尝试提交事务。

如果成功，工作就完成了; 其他线程现在可以开始他们的交易。

如果交易失败，则必须从头开始重复。

但是，在此之前，最好插入一个延迟。

如果没有这样做，线程可能会在繁忙的循环中运行（浪费能量，使CPU过热）。


## pop 函数

The pop function is slightly more complex. 

It also starts with reading the variable containing the head of the list, requesting exclusive ownership. 

The code then immediately checks whether the LTX operation succeeded or not.

If not, nothing else is done in this round except delaying the next round. 

If the top pointer was read successfully, this means its state is good; we can now dereference the pointer. 

Remember, this was exactly the problem with the code using atomic operations; with transactional memory this case can be handled without any problem.

The following ST operation is only performed when the LIFO is not empty, just as in the original, thread-unsafe code. 

Finally the transaction is committed. 

If this succeeds the function returns the old pointer to the head; otherwise we delay and retry. 

The one tricky part of this code is to remember that the VALIDATE operation aborts the transaction if it has already failed. 

The next transactional memory operation would start a new transaction and, therefore, we must skip over the rest of the code in the function.

它还从读取包含列表头部的变量开始，请求独占所有权。

然后代码立即检查LTX操作是否成功。

如果没有，除了推迟下一轮之外，在这一轮中没有别的办法。

如果顶部指针被成功读取，这意味着它的状态良好;我们现在可以取消引用指针。

请记住，这正是使用原子操作的代码的问题;使用事务性内存这种情况可以毫无问题地处理。

仅当LIFO不为空时才执行以下ST操作，就像在原始的线程不安全的代码中一样。

最后，交易已提交。

如果成功，该函数返回指向头部的旧指针;否则我们会延迟并重试。

这段代码的一个棘手部分是要记住，如果事务已经失败，VALIDATE操作将中止事务。

下一个事务内存操作将启动一个新事务，因此，我们必须跳过函数中的其余代码。

How the delay code works will be something to see when implementations of transactional memory are available in hardware. 

If this is done badly system performance might suffer significantly.


# Bus Protocol for Transactional Memory

Now that we have seen the basic principles behind transactional memory, we can dive into the details of the implementation.

Note that this is not based on actual hardware. 

It is based on the original design of transactional memory and knowledge about the cache coherency protocol.

Some details are omitted, but it still should be possible to get insight into the performance characteristics.

它基于事务存储器的原始设计和关于高速缓存一致性协议的知识。

省略了一些细节，但仍然应该可以深入了解性能特征。

## 一级缓存的实现

Despite the name, transactional memory is not actually implemented as separate memory; 

that would not make any sense given that transactions on any location in a thread’s address space are wanted. 

Instead, it is implemented as part of the first level cache handling. 

尽管名称，事务内存实际上并不是作为单独的内存实现的;

考虑到线程地址空间中任何位置的事务都是需要的，这没有任何意义。

相反，它是作为第一级缓存处理的一部分实现的。

The implementation could, in theory, happen in the normal L1d but, as [13] points out, this is not a good idea. 

We will more likely see the transaction cache implemented in parallel to L1d. 

我们依然希望可以并行访问 L1d.

All accesses will use the higher level cache in the same way they use L1d. 

The transaction cache is likely much smaller than L1d. 

If it is fully associative its size is determined by the number of operations a transaction can comprise. 

Implementations will likely have limits for the architecture and/or specific processor version.

One could easily imagine a transaction cache with 16 elements or even less. 

In the above example we only needed one single memory location; algorithms with a larger transaction working sets get very complicated. 

It is possible that we will see processors which support more than one active transaction at any one time. 

The number of elements in the cache then multiplies, but it is still small enough to be fully associative.

所有访问都将使用更高级别的缓存，就像使用L1d一样。

事务高速缓存可能比L1d小得多。

如果它是完全关联的，则其大小由事务可包括的操作数确定。

实现可能对架构和/或特定处理器版本有限制。

可以很容易地想象一个具有16个元素甚至更少元素的事务缓存。

在上面的例子中，我们只需要一个单独的内存位置; 具有较大事务工作集的算法变得非常复杂。

我们可能会在任何时候看到支持多个活动事务的处理器。

然后缓存中的元素数量相乘，但它仍然足够小，可以完全关联。

## 缓存的排他性

The transaction cache and L1d are exclusive. 

That means a cache line is in, at most, one of the caches but never in both. 

Each slot in the transaction cache is in, at any one time, one of the four MESI protocol states. 

In addition to this, a slot has an transaction state. 

## 状态

The states are as follows (names according to [13]):

### EMPTY 

the cache slot contains no data. The MESI state is always ‘I’.

### NORMAL 

the cache slot contains committed data. 

The data could as well exist in L1d. The MESI state can be ‘M’, ‘E’, and ‘S’. 

The fact that the ‘M’ state is allowed means that transaction commits do not force the data to be written into the main memory
(unless the memory region is declared as uncached or write-through). 

This can significantly help to increase performance.

### XABORT 

the cache slot contains data which is to be discarded on abort. 

This is obviously the opposite of XCOMMIT. 

All the data created during a transaction is kept in the transaction cache, nothing is written to main memory before a commit. 

This limits the maximum transaction size but it means that, beside the transaction cache, no other memory
has to be aware of the XCOMMIT/XABORT duality for a single memory location. 

The possible MESI states are ‘M’, ‘E’, and ‘S’.

### XCOMMIT 

the cache slot contains data which is discarded on commit. 

This is a possible optimization processors could implement. 

If a memory location is changed using a transaction operation, the old content cannot be just dropped: 

if the transaction fails the old content needs to be restored. 

The MESI states are the same as for XABORT. 

One difference with regard to XABORT is that, if the transaction cache is full, any XCOMMIT entries in the ‘M’ state could be written back to memory and then, for all states, discarded.

## 状态流转

When an LT operation is started, the processor allocates two slots in the cache. 

Victims（受害者） are chosen by first looking for NORMAL slots for the address of the operation, i.e., a cache hit. 

If such an entry is found, a second slot is located, the value copied, one entry is marked XABORT, and the other one is marked XCOMMIT.

### 如果地址已经缓存

If the address is not already cached, EMPTY cache slots are located. 

If none can be found, NORMAL slots are looked for. 

The old content must then be flushed to memory if the MESI state is ‘M’. 

If no NORMAL slot is available either, it is possible to victimize XCOMMIT entries. 

This is likely going to be an implementation detail, though. 

The maximum size of a transaction is determined by the size of the transaction cache, and, since the number of slots which are needed for each operation in the transaction is fixed, the number of transactions can be capped before having to evict XCOMMIT entries.

事务的最大大小由事务高速缓存的大小决定，并且由于事务中每个操作所需的时隙数是固定的，因此在必须驱逐XCOMMIT条目之前可以限制事务的数量。

### 地址没有被缓存

If the address is not found in the transactional cache, a T READ request is issued on the bus. 

This is just like the normal READ bus request, but it indicates that this is for the transactional cache. 

Just like for the normal READ request, the caches in all other processors first get the chance to respond. 

If none does the value is read from the main memory. 

The MESI protocol determines whether the state of the new cache line is ‘E’ or ‘S’. 

- T READ 与 READ 之间的区别

The difference between T READ and READ comes into play when the cache line is currently in use by an active transaction on another processor or core. 

In this case the T - READ operation plainly fails, no data is transmitted. 

The transaction which generated the T READ bus request is marked as failed and the value used in the operation (usually a simple register load) is undefined. 

Looking back to the example, we can see that this behavior does not cause problems if the transactional memory operations are used correctly. 

Before a value loaded in a transaction is used, it must be verified with VALIDATE. 

This is, in almost no cases, an extra burden. 

As we have seen in the attempts to create a FIFO implementation using atomic operations, the check which we added is the one missing
feature which would make the lock-free code work.

## LTX 与 LT

The LTX operation is almost identical to LT. 

The one difference is that the bus operation is T RFO instead of T - READ. 

T RFO, like the normal RFO bus message, requests exclusive ownership of the cache line. 

The state of the resulting cache line is ‘E’. 

Like the T READ bus request, T RFO can fail, in which case the used value is undefined, too. 

If the cache line is already in the local transaction cache with ‘M’ or ‘E’ state, nothing has to be done. 

If the state in the local transaction cache is ‘S’ the bus request has to go out to invalidate all other copies.

一个区别是总线操作是T RFO而不是T-READ。

与正常的RFO总线消息一样，T RFO请求对高速缓存线的独占所有权。

生成的高速缓存行的状态为“E”。

与T READ总线请求一样，T RFO可能会失败，在这种情况下，使用的值也是未定义的。

如果高速缓存行已经在具有“M”或“E”状态的本地事务高速缓存中，则不需要执行任何操作。

如果本地事务高速缓存中的状态为“S”，则总线请求必须用于使所有其他副本无效。

## ST 与 LTX

The ST operation is similar to LTX. 

The value is first made available exclusively in the local transaction cache.

Then the ST operation makes a copy of the value into a second slot in the cache and marks the entry as XCOMMIT.

Lastly, the other slot is marked as XABORT and the new value is written into it. 

If the transaction is already aborted, or is newly aborted because the implicit LTX fails, nothing is written.

## VALIDATE & COMMIT 不进行总线操作

Neither the VALIDATE nor COMMIT operations automatically and implicitly create bus operations. 

This is the huge advantage transactional memory has over atomic operations. 

With atomic operations, concurrency is made possible by writing changed values back into main memory.

这是事务性内存优于原子操作的巨大优势。

通过原子操作，可以通过将更改的值写回主存储器来实现并发。

If you have read this document thus far, you should know how expensive this is. 

With transactional memory, no accesses to the main memory are forced. 

If the cache has no EMPTY slots, current content must be evicted, and for slots in the ‘M’ state, the content must be written to main memory. 

This is not different from regular caches, and the write-back can be performed without special atomicity guarantees. 

If the cache size is sufficient, the content can survive for a long time. 

If transactions are performed on the same memory location over and over again, the speed improvements can be astronomical since, in the one case, we have one or two main memory accesses in each round while, for transactional memory, all accesses hit the transactional cache which is as fast as L1d.

如果一遍又一遍地在同一个内存位置上执行事务，速度的改进可能是天文数字，因为在一种情况下，我们在每一轮中都有一个或两个主内存访问，而对于事务内存，所有访问都会触及事务缓存 这和L1d一样快。

All the VALIDATE and COMMIT operations do at the time of an abort of a transaction is to mark the cache slots marked XABORT as empty and mark the XCOMMIT slots as NORMAL. 

Similarly, when COMMIT successfully finishes a transaction, the XCOMMIT slots are marked empty and the XABORT slots are marked NORMAL.

These are very fast operations on the transaction cache. 

No explicit notification to other processors which want to perform transactions happens; those processors just have to keep trying. 

Doing this efficiently is another matter. 

In the example code above we simply have `...delay...` in the appropriate place. 

We might see actual processor support for delaying in a useful way.

在事务中止时执行的所有VALIDATE和COMMIT操作都是将标记为XABORT的缓存槽标记为空，并将XCOMMIT槽标记为NORMAL。

类似地，当COMMIT成功完成事务时，XCOMMIT插槽标记为空，XABORT插槽标记为NORMAL。

这些是对事务高速缓存的非常快速的操作。

没有明确通知其他想要执行交易的处理器; 那些处理器只需要继续努力。

有效地做到这一点是另一回事。

在上面的示例代码中，我们只需要在适当的位置使用`... delay ...`。

我们可能会看到实际的处理器支持以有用的方式延迟。

To summarize, transactional memory operations cause bus operation only when a new transaction is started and when a new cache line, which is not already in the transaction cache, is added to a still-successful transaction.

Operations in aborted transactions do not cause bus operations. 

There will be no cache line ping-pong due to multiple threads trying to use the same memory.

# Other Considerations

In section 6.4.2, we already discussed how the lock prefix, available on x86 and x86-64, can be used to avoid the coding of atomic operations in some situations. 

The proposed tricks falls short, though, when there are multiple threads in use which do not contend for the same memory.

In this case, the atomic operations are used unnecessarily. 

With transactional memory this problem goes away. 

但是，当有多个线程在使用中并不争用相同的内存时，提议的技巧不足。

在这种情况下，不必要地使用原子操作。

对于事务性内存，这个问题就消失了。

The expensive RFO bus message are issued only if memory is used on different CPUs concurrently or in succession; 

this is only the case when they are needed. 

It is almost impossible to do any better. 

The attentive reader might have wondered about delays. 

## 什么是预期的最坏情况？

What is the expected worst case scenario? 

What if the thread with the active transaction is descheduled, or if it receives a signal and is possibly terminated, or decides to
use *siglongjmp* to jump to an outer scope? 

如果具有活动事务的线程被取消调度，或者如果它接收到信号并且可能被终止或决定，则该怎么办？

The answer to this is: the transaction will be aborted. 

It is possible to abort a transaction whenever a thread makes a system call or receives a signal (i.e., a ring level change occurs). 

It might also be that aborting the transaction is part of the OS’s duties when performing system calls or handling signals. 

We will have to wait until implementations become available to see what is actually done.

每当线程进行系统调用或接收信号时（即，发生环级别改变），就可以中止事务。

也许在执行系统调用或处理信号时，中止事务是操作系统职责的一部分。

我们将不得不等到实现可用才能看到实际完成的内容。

## 最后一个讨论的点

The final aspect of transactional memory which should be discussed here is something which people might want to think about even today. 

The transaction cache, like other caches, operates on cache lines. 

Since the transaction cache is an exclusive cache, using the same cache line for transactions and non-transaction operation will be a problem. 

It is therefore important to

（1）move non-transactional data off of the cache line

（2）have separate cache lines for data used in separate transactions


The first point is not new, the same effort will pay off for atomic operations today. 

The second is more problematic since today objects are hardly ever aligned to cache lines due to the associated high cost.

If the data used, along with the words modified using atomic operations, is on the same cache line, one less cache line is needed.

This does not apply to mutual exclusion (where the mutex object should always have its own cache line), but one can certainly make cases where atomic operations go together with other data. 

With transactional memory, using the cache line for two purposes will most likely be fatal.

Every normal access to datawould remove the cache line from the transactional cache, aborting the transaction in the process. 

Cache alignment of data objects will be in future not only a matter of performance but also of correctness.

未来数据对象的高速缓存对齐不仅是性能问题，还是正确性问题。

It is possible that transactional memory implementations will use more precise accounting and will, as a result, not suffer from normal accesses to data on cache lines which are part of a transaction. 

This requires a lot more effort, though, since then the MESI protocol information is not sufficient anymore.

# 参考资料

P91

* any list
{:toc}