---
layout: post
title:  JCIP-13-无锁队列
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, lock, data-struct, sh]
published: true
excerpt: JCIP-13-无锁队列
---

# 无锁队列能实现吗？

上面说的加锁的环形队列，可以保证线程安全。

但是加锁能不能去掉呢？

答案是肯定的，请看下面的娓娓道来。

## i++ 是原子操作吗？

i++和++i是原子操作吗？

有一个很多人也许都不是很清楚的问题：i++或++i是一个原子操作吗？在上一节，其实已经提到了，在SMP（对称多处理器）上，即使是单条递减汇编指令，其原子性也是不能保证的。那么在单处理机系统中呢？

在编译器对C/C++源代码进行编译时，往往会进行一些代码优化。例如，对i++这条指令，实际上编译器编译出的汇编代码是类似下面的汇编语句：

```
1.mov eax,[i]

2.add eax,1

3.mov [i],eax
```

语句1是将i所在的内存读取到寄存器中，而语句2是将寄存器的值加1，语句3是将寄存器值写回到内存中。之所以进行这样的操作，是为了CPU访问数据效率的高效。可以看出，i++是由一条语句被编译成了3条指令，因此，即使在单处理机系统上，i++这种操作也不是原子的。这是由于指令之间的乱序执行而造成的，注意和上节中，指令流水线之间的数据竞跑造成的数据不一致的区别。

## CAS 乐观锁

当然此处的无锁不是指没有保证线程安全的措施，而是指不使用常见的互斥锁，而是用 [CAS](https://houbb.github.io/2018/07/24/java-concurrency-06-cas) 这种乐观锁。

# 无锁队列的实现

下面的东西主要来自John D. Valois 1994年10月在拉斯维加斯的并行和分布系统系统国际大会上的一篇论文——[《Implementing Lock-Free Queues》](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.53.8674&rep=rep1&type=pdf)。


## 入队

```c
EnQueue(x) //进队列
{
    //准备新加入的结点数据
    q = new record();
    q->value = x;
    q->next = NULL;
 
    do {
        p = tail; //取链表尾指针的快照
    } while( CAS(p->next, NULL, q) != TRUE); //如果没有把结点链在尾指针上，再试
 
    CAS(tail, p, q); //置尾结点
}
```

我们可以看到，程序中的那个 do- while 的 Re-Try-Loop。就是说，很有可能我在准备在队列尾加入结点时，别的线程已经加成功了，于是tail指针就变了，于是我的CAS返回了false，于是程序再试，直到试成功为止。这个很像我们的抢电话热线的不停重播的情况。

你会看到，为什么我们的“置尾结点”的操作（第12行）不判断是否成功，因为：

1. 如果有一个线程T1，它的while中的CAS如果成功的话，那么其它所有的 随后线程的CAS都会失败，然后就会再循环，

2. 此时，如果T1 线程还没有更新tail指针，其它的线程继续失败，因为tail->next不是NULL了。

3. 直到T1线程更新完tail指针，于是其它的线程中的某个线程就可以得到新的tail指针，继续往下走了。

这里有一个潜在的问题——如果T1线程在用CAS更新tail指针的之前，线程停掉或是挂掉了，那么其它线程就进入死循环了。

下面是改良版的EnQueue()

```c
EnQueue(x) //进队列改良版
{
    q = new record();
    q->value = x;
    q->next = NULL;
 
    p = tail;
    oldp = p
    do {
        while (p->next != NULL)
            p = p->next;
    } while( CAS(p.next, NULL, q) != TRUE); //如果没有把结点链在尾上，再试
 
    CAS(tail, oldp, q); //置尾结点
}
```

我们让每个线程，自己fetch 指针 p 到链表尾。但是这样的fetch会很影响性能。而通实际情况看下来，99.9%的情况不会有线程停转的情况，所以，更好的做法是，你可以接合上述的这两个版本，如果retry的次数超了一个值的话（比如说3次），那么，就自己fetch指针。

好了，我们解决了EnQueue，我们再来看看DeQueue的代码：（很简单，我就不解释了）

```c
DeQueue() //出队列
{
    do{
        p = head;
        if (p->next == NULL){
            return ERR_EMPTY_QUEUE;
        }
    while( CAS(head, p, p->next) != TRUE );
    return p->next->value;
}
```

我们可以看到，DeQueue的代码操作的是 head->next，而不是head本身。

这样考虑是因为一个边界条件，我们需要一个dummy的头指针来解决链表中如果只有一个元素，head和tail都指向同一个结点的问题，这样EnQueue和DeQueue要互相排斥了。

![lock-free-link.jpg](https://coolshell.cn/wp-content/uploads/2012/09/lock-free-link.jpg)

# CAS 的 ABA 问题

所谓ABA（见维基百科的ABA词条），问题基本是这个样子：

1. 进程P1在共享变量中读到值为A

2. P1被抢占了，进程P2执行

3. P2把共享变量里的值从A改成了B，再改回到A，此时被P1抢占。

4. P1回来看到共享变量里的值没有被改变，于是继续执行。

虽然P1以为变量值没有改变，继续执行了，但是这个会引发一些潜在的问题。ABA问题最容易发生在lock free 的算法中的，CAS首当其冲，因为CAS判断的是指针的地址。如果这个地址被重用了呢，问题就很大了。（地址被重用是很经常发生的，一个内存分配后释放了，再分配，很有可能还是原来的地址）

比如上述的DeQueue()函数，因为我们要让head和tail分开，所以我们引入了一个dummy指针给head，当我们做CAS的之前，如果head的那块内存被回收并被重用了，而重用的内存又被EnQueue()进来了，这会有很大的问题。（内存管理中重用内存基本上是一种很常见的行为）

这个例子你可能没有看懂，维基百科上给了一个活生生的例子——

```
你拿着一个装满钱的手提箱在飞机场，此时过来了一个火辣性感的美女，然后她很暖昧地挑逗着你，并趁你不注意的时候，把用一个一模一样的手提箱和你那装满钱的箱子调了个包，然后就离开了，你看到你的手提箱还在那，于是就提着手提箱去赶飞机去了。
```

这就是ABA的问题。

# 解决ABA的问题

维基百科上给了一个解——使用double-CAS（双保险的CAS），例如，在32位系统上，我们要检查64位的内容

1）一次用CAS检查双倍长度的值，前半部是指针，后半部分是一个计数器。

2）只有这两个都一样，才算通过检查，要吧赋新的值。并把计数器累加1。

这样一来，ABA发生时，虽然值一样，但是计数器就不一样（但是在32位的系统上，这个计数器会溢出回来又从1开始的，这还是会有ABA的问题）

当然，我们这个队列的问题就是不想让那个内存重用，这样明确的业务问题比较好解决。

论文《Implementing Lock-Free Queues》给出一这么一个方法——使用结点内存引用计数refcnt！

```c
SafeRead(q)
{
    loop:
        p = q->next;
        if (p == NULL){
            return p;
        }
 
        Fetch&Add(p->refcnt, 1);
 
        if (p == q->next){
            return p;
        }else{
            Release(p);
        }
    goto loop;
}
```

其中的 Fetch&Add和Release分是是加引用计数和减引用计数，都是原子操作，这样就可以阻止内存被回收了。

# 用数组实现无锁队列

本实现来自论文《Implementing Lock-Free Queues》

使用数组来实现队列是很常见的方法，因为没有内存的分部和释放，一切都会变得简单，实现的思路如下：

1）数组队列应该是一个ring buffer形式的数组（环形数组）

2）数组的元素应该有三个可能的值：HEAD，TAIL，EMPTY（当然，还有实际的数据）

3）数组一开始全部初始化成EMPTY，有两个相邻的元素要初始化成HEAD和TAIL，这代表空队列。

4）EnQueue操作。假设数据x要入队列，定位TAIL的位置，使用double-CAS方法把(TAIL, EMPTY) 更新成 (x, TAIL)。需要注意，如果找不到(TAIL, EMPTY)，则说明队列满了。

5）DeQueue操作。定位HEAD的位置，把(HEAD, x)更新成(EMPTY, HEAD)，并把x返回。同样需要注意，如果x是TAIL，则说明队列为空。

## 如何定位

算法的一个关键是——如何定位HEAD或TAIL？

1）我们可以声明两个计数器，一个用来计数EnQueue的次数，一个用来计数DeQueue的次数。

2）这两个计算器使用使用Fetch&ADD来进行原子累加，在EnQueue或DeQueue完成的时候累加就好了。

3）累加后求个模什么的就可以知道TAIL和HEAD的位置了。

![lock-free-array.jpg](https://coolshell.cn/wp-content/uploads/2012/09/lock-free-array.jpg)

## 小结

以上基本上就是所有的无锁队列的技术细节，这些技术都可以用在其它的无锁数据结构上。

1）无锁队列主要是通过CAS、FAA这些原子操作，和Retry-Loop实现。

2）对于Retry-Loop，我个人感觉其实和锁什么什么两样。只是这种“锁”的粒度变小了，主要是“锁”HEAD和TAIL这两个关键资源。而不是整个数据结构。

# 无锁队列的改良版本 V1.0.0

上面的文章给出了一种链表无锁队列的实现。其中对ABA和double CAS等现象都进行了分析。

在文章的结尾，给出了一种数组无锁队列的实现，不过这个数组受限于CAS、FAA等操作对操作类型的限制，只能存储一些较小的数据类型，如32位数据等。而对于链表无锁队列，每次进行出队和入队操作都伴随着内存的分配和释放，不可避免地要影响到效率。

而使用**环形数组的队列则避免了频繁的内存操作**,从实现上来说也更加简单。

本节描述如何以环形数组为基础，实现一个无锁队列。

## 多线程之间的协调

多线程程序或者说并发程序之间协调的关键是，要考虑到多个线程同时访问某个资源的时候，保证它们访问的顺序能够准确地反映到程序执行的结果上。

## 定义数据结构

先定义一下无锁队列的基本结构:

```c
template

class LockFreeQueue {

private:

ElementT * ring_array_;

int size_;

int head_index_;

int tail_index_;

}
```

由于出队操作都是在队首进行，而入队操作则都是在队尾进行，因此，我们可以尝试用head_index_和tail_index_来实现多个线程之间的协调。

这其中会用到CAS操作：

## 入队进程：

```c
do {

  获取当前的tail_index_的值cur_tail_index；

  计算新的tail_index_的值：new_tail_index = (cur_tail_index + 1) % size;

} while(!CAS(tail_index_, cur_tail_index, new_tail_index));

插入元素到cur_tail_index;
```

其中的do-while循环实现的是一个忙式等待：线程试图获取当前的队列尾部空间的控制权；一旦获取成功，则向其中插入元素。

但是这样出队的时候就出现了问题：如何判断队首的位置里是否有相应元素呢？仅使用head_index_来判断是不行的,这只能保证出队进程不会对同一个索引位置进行出队操作，而不能保证head_index_的位置中一定有有效的元素。

因此，为了保证出队队列与入队队列之间的协调，需要在LockFreeQueue中添加一个标志数组：

```c
char * flag_array_;
```

flag_array中的元素标记ring_array_中与之对应的元素位置是否有效。flag_array_中的元素有4个取值：

0表示对应的ring_array_中的槽位为空；1表示对应槽位已被申请，正在写入；2表示对应槽位中为有效的元素，可以对其进行出对操作；3则表示正在弹出操作。

修改后的无锁队列的代码如下：

```c++
template
class LockFreeQueue {
    private:
        ElementT * ring_array_;
        char * flags_array_; // 标记位，标记某个位置的元素是否被占用
        // flags: 0：空节点；1：已被申请，正在写入
        // 2：已经写入，可以弹出;3,正在弹出操作;
        int size_;  // 环形数组的大小
        int element_num_; //队列中元素的个数
        int head_index_;
        int tail_index_;

    public:
        LockFreeQueue(int s = 0) {
            size_ = s;
            head_index_ = 0;
            tail_index_ = 0;
            element_num_ = 0;
        }
        ~LockFreeQueue() {}
    public:
        // 初始化queue。分配内存，设定size
        bool Init(void);
        const int GetSize(void) const {
            return size_;
        }

        const int GetElementNum(void) const {
            return element_num_;
        }

        // 入队函数
        bool EnQueue(const ElementT & ele);
        // 出队函数
        bool DeQueue(ElementT * ele);
};
```

## 线程不安全的实现

```c++
// This function is NOT ThreadSafe!
// 应当在单线程环境中使用该函数
// OR should be called in the constructor...
template
bool LockFreeQueue::Init(void) {
    flags_array_ = new(std::nothrow) char[size_];
    if (flags_array_ == NULL)
        return false;
    memset(flags_array_, 0, size_);
    ring_array_ = reinterpret_cast(
            new(std::nothrow) char[size_ * sizeof(ElementT)]);
    if (ring_array_ == NULL)
        return false;
    memset(ring_array_, 0, size_ * sizeof(ElementT));
    return true;
}
```

## 线程安全的实现

```c++
// ThreadSafe
// 元素入队尾部
template
bool LockFreeQueue::EnQueue(const ElementT & ele) {
    if (!(element_num_ < size_))
        return false;
    int cur_tail_index = tail_index_;
    char * cur_tail_flag_index = flags_array_ + cur_tail_index;

    // 忙式等待
    // while中的原子操作：如果当前tail的标记为“”已占用(1)“，则更新cur_tail_flag_index,
    // 继续循环；否则，将tail标记设为已经占用
    while (!__sync_bool_compare_and_swap(cur_tail_flag_index, 0, 1)) {
        cur_tail_index = tail_index_;
        cur_tail_flag_index = flags_array_ +  cur_tail_index;
    }

    // 两个入队线程之间的同步
    // 取模操作可以优化
    int update_tail_index = (cur_tail_index + 1) % size_;

    // 如果已经被其他的线程更新过，则不需要更新；
    // 否则，更新为 (cur_tail_index+1) % size_;
    __sync_bool_compare_and_swap(&tail_index_, cur_tail_index, update_tail_index);

    // 申请到可用的存储空间
    *(ring_array_ + cur_tail_index) = ele;

    // 写入完毕
    __sync_fetch_and_add(cur_tail_flag_index, 1);

    // 更新size;入队线程与出队线程之间的协作
    __sync_fetch_and_add(&element_num_, 1);
    return true;
}

// ThreadSafe
// 元素出队头部
template
bool LockFreeQueue::DeQueue(ElementT * ele) {
    if (!(element_num_ > 0))
        return false;
    int cur_head_index = head_index_;
    char * cur_head_flag_index = flags_array_ + cur_head_index;
    while (!__sync_bool_compare_and_swap(cur_head_flag_index, 2, 3)) {
        cur_head_index = head_index_;
        cur_head_flag_index = flags_array_ + cur_head_index;
    }

    // 取模操作可以优化
    int update_head_index = (cur_head_index + 1) % size_;
    __sync_bool_compare_and_swap(&head_index_, cur_head_index, update_head_index);
    *ele = *(ring_array_ + cur_head_index);

    // 弹出完毕
    __sync_fetch_and_sub(cur_head_flag_index, 3);

    // 更新size
    __sync_fetch_and_sub(&element_num_, 1);
    return true;

}
```

## 无锁队列的分析——死锁及饥饿

### 线程安全

经过上节的分析，LockFreeQueue实现了基本的多线程之间的协调，不会存在多个线程同时对同一个资源进行操作的情况，也就不会产生数据竞跑，这保证了对于这个队列而言，基本的访问操作（出队、入队）的执行都是安全的，其结果是可预期的。

### 死锁

在多线程环境下，LockFreeQueue会不会出现死锁的情况呢？

死锁有四个必要条件：

1：对资源的访问是互斥的；

2，请求和保持请求；

3，资源不可剥夺；

4，循环等待。

在LockFreeQueue中，所有的线程都是对资源进行申请后再使用，一个线程若申请到了资源（这里的资源主要指环形队列中的内存槽位），就会立即使用，并且在使用完后释放掉该资源。不存在一个线程使用A资源的同时去申请B资源的情况，因此并不会出现死锁。

### 饥饿

但LockFreeQueue可能出现饥饿状态。

例如，对两个出队线程A、B，两者都循环进行出队操作。当队列中有元素时，A总能申请到这个元素并且执行到弹出操作，而B则只能在DeQueue函数的while循环中一直循环下去。

## 一些优化

对LockFreeQueue可以进行一些优化。比如：

1，对于环形数组大小，可以设定为2的整数倍，如1024。这样取模的操作即可以简化为与size_-1的按位与操作。

2，忙式等待的时候可能会出现某个线程一直占用cpu的情况。此时可以使用sleep(0),其功能类似于java中的yield系统调用，可以让该线程让出CPU时间片，从就绪态转为挂起态。

# 他山之石

1. 不要理所当然的认为程序不会在任何一部执行的时候中断。如果中断，如何恢复？

2. 内存模型会对代码进行优化，会导致代码不按照你写的顺序执行。要注意。

# 拓展阅读

[disruptor 无锁队列](https://houbb.github.io/2018/07/02/disruptor-01-introduction)

[lock free date]()

还有一些和Lock Free的文章你可以去看看：

Code Project 上的雄文 [《Yet another implementation of a lock-free circular array queue》](http://www.codeproject.com/Articles/153898/Yet-another-implementation-of-a-lock-free-circular)

Herb Sutter的[《Writing Lock-Free Code: A Corrected Queue》– 用C++11的std::atomic模板。](http://www.drdobbs.com/parallel/writing-lock-free-code-a-corrected-queue/210604448?pgno=1)

IBM developerWorks的[《设计不使用互斥锁的并发数据结构》](http://www.ibm.com/developerworks/cn/aix/library/au-multithreaded_structures2/index.html)

# 参考资料

- 无锁队列

[无锁队列的环形数组实现](https://www.cnblogs.com/lvdongjie/p/4457392.html)

[无锁队列的实现](https://coolshell.cn/articles/8239.html)

[共享内存无锁队列的实现](https://cloud.tencent.com/developer/article/1006241)

[wiki-非阻塞算法](https://en.wikipedia.org/wiki/Non-blocking_algorithm)

* any list
{:toc}

