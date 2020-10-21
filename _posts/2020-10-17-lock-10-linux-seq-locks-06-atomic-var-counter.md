---
layout: post
title:  锁专题（10）Linux SeqLocks 原子变量和使用计数器
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, sf]
published: true
---

# 原子变量和使用计数器

Linux提供了一个定义atomic_t类型变量的工具。 

该类型的变量无法使用常规C运算符进行处理，而是需要使用访问器进行操作。

想法是这些变量可以在多处理环境中安全地进行操作而无需保护自旋锁。

以下是最常用的宏列表维护原子变量。

```c
atomic_t x;

ATOMIC_INIT(x);

y = atomic_read(x);

atomic_set(x, 789);

atomic_add(35, x);

if (atomic_dec_and_test(x)) { ... }
```


atomic_t的工作方式与常规整数一样，但是在多处理环境中，保证了这些操作是原子性的。 

在Itanium上进行操作的成本各不相同。

原子变量的初始化，读取和存储与常规变量具有相同的成本，因为它们使用了负载和存储的原子性。 

但是，添加和递增解剖变量使用的fetchadd指令比前面讨论的常规递增慢得多，对于 `atomic_dec_and_test` 同样有效。 

原子操作可能需要内存屏障，才能说服编译器将变量写入内存或重新获取它们，并确保其他处理器在检查原子变量时看到正确的值。 

这些问题使原子变量的处理比自旋锁复杂得多。



还可以对任意变量执行其他原子操作。 

这些是原子位操作set_bit，clear_bit，change_bit，test_and_set_bit，test_and_clear_bit，test_and_change_bit。 

所有这些都在同一缓存行上围绕负载和acmpxchg进行循环。 

可以首先以共享模式获取缓存行，然后将其转换为互斥。 

常规 `cmpxchg` 会更高效，因为仅将高速缓存行作为专用高速缓存行获取一次。





Linux内核中用来找出何时释放对象的一种常用技术是在对象中保留一个使用计数器。

在结构中定义一个原子值并将其初始化为1。

当将附加指针设置为对象时，将使用atomic_inc递增计数器。


- 图8示例atomic_dec_and_test从代码中释放结构以删除对内存描述符的引用。


```c
/** Decrement the use count and release all resources for an mm.*/

void mmput(struct mm_struct *mm)
{
    if (atomic_dec_and_test(&mm->mm_users)) 
    {
        exit_aio(mm);
        exit_mmap(mm);
        if (!list_empty(&mm->mmlist)) 
        {
            spin_lock(&mmlist_lock);
            list_del(&mm->mmlist);
            spin_unlock(&mmlist_lock);
        }
        put_swap_token(mm);
        mmdrop(mm);
}}
EXPORT_SYMBOL_GPL(mmput);
```

当引用被删除时，引用计数器递减，同时通过atomic_dec_and_test指令检查引用计数器是否达到零。

使用Itanium上的fetchaddsemaphore操作执行Dec和test，以确保只有一个处理器可以看到referencecounter变为零。

然后，该处理器知道它是唯一仍然保留对该结构的引用并可以安全地释放它的人。

图8中的示例显示了使用atomic_dec_and_test释放进程的内存描述符的方法。

为了从列表中安全释放此元素，可能有必要在删除过程中获取另一个自旋锁。

使用fetchadd进行递增和递减是一项昂贵的操作，因为fetchadd需要排他的缓存行并导致流水线停顿。

如果经常建立对对象的引用，然后再次将其删除，则这些高速缓存行可能会开始反弹，并将成为性能瓶颈。

例如，如果同时有64个以上的处理器分配内存，则会在Linux IP堆栈的路由信息​​和页面错误处理程序中发生这种情况。





# 禁用中断，抢占和拆分计数器

如果使用的变量只能从单个处理器访问，则可以通过禁用中断或抢占来保证操作的“原子性”。

每个处理器都有一个特殊的变量部分，这些部分保留给自己使用，专门称为 `per cpu` 变量。每个cpu定义的变量都放在该区域中。

每个cpu定义的变量都放在该区域中。

可以肯定地认为没有其他处理器可以访问这些处理器。

避免使用信号量指令递增和递减计数器的开销的一种方法是将计数器拆分为每个cpu变量。然后可以使用常规加载来增加各个计数器的值，并存储指令以缓存未在处理器之间共享的行。

但是，为了获得全局计数，然后需要遍历所有每个cpu区域并加总所有处理器特定的计数器。

在某些情况下，也可以使用此方法来避免高速缓存行在使用计数器上跳动。 

One遇到零引用检查的原子性问题。

由于没有锁定功能，因此也就没有防止种族的保护措施。将所有计数器相加的结果可能只是近似的。






# 参考资料

[linux 锁实现](http://www.lameter.com/gelato2005.pdf)

* any list
{:toc}