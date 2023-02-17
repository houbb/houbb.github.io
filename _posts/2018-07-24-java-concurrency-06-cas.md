---
layout: post
title:  Java Concurrency-06-深入浅出 CAS 算法
date:  2018-07-24 16:11:28 +0800
categories: [Java]
tags: [thread, concurrency, lock-free, thread]
published: true
---


![CAS+算法](https://images.gitee.com/uploads/images/2020/1020/231842_2f89126e_508704.png)

# 为什么学习 CAS？

java 5 中最好的增加之一是在类中支持的原子操作，比如 AtomicInteger、AtomicLong 等等，这些类内部依赖于一个名为CAS的算法(比较和交换)。

CAS 与 java 关键字 [volatile](https://www.toutiao.com/item/6885685189117706756/) 结合，是实现乐观锁的常见方式。

在本文中，我们将一起深入浅出地学习 CAS 算法。

## CAS 思想

CAS的思想很简单：三个参数，一个当前内存值V、旧的预期值A、即将更新的值B，当且仅当预期值A和内存值V相同时，将内存值修改为B并返回true，否则什么都不做，并返回false。

> 一件事情的原理越简单，其背后的思想就越深邃。——刘-魔术师-谦

# 处理器层的实现

现在几乎所有的CPU指令都支持CAS的原子操作，X86下对应的是 CMPXCHG 汇编指令。

有了这个原子操作，我们就可以用其来实现各种无锁（lock free）的数据结构。

这个操作用C语言来描述就是下面这个样子：（代码来自Wikipedia的Compare And Swap词条）意思就是说，看一看内存*reg里的值是不是oldval，如果是的话，则对其赋值newval。

```c
int compare_and_swap (int* reg, int oldval, int newval)
{
  int old_reg_val = *reg;
  if (old_reg_val == oldval)
     *reg = newval;
  return old_reg_val;
}
```

这个操作可以变种为返回bool值的形式（返回 bool值的好处在于，可以调用者知道有没有更新成功）：

```c
bool compare_and_swap (int *accum, int *dest, int newval)
{
  if ( *accum == *dest ) {
      *dest = newval;
      return true;
  }
  return false;
}
```

与CAS相似的还有下面的原子操作：（这些东西大家自己看Wikipedia吧）

[Fetch And Add](http://en.wikipedia.org/wiki/Fetch-and-add)，一般用来对变量做 +1 的原子操作

[Test-and-set](http://en.wikipedia.org/wiki/Test-and-set)，写值到某个内存位置并传回其旧值。汇编指令BST

[Test and Test-and-set](http://en.wikipedia.org/wiki/Test_and_Test-and-set)，用来低低Test-and-Set的资源争夺情况

# 实际的 CAS 各种变种

## 1）GCC的CAS

GCC4.1+版本中支持CAS的原子操作（完整的原子操作可参看 [GCC Atomic Builtins](http://gcc.gnu.org/onlinedocs/gcc-4.1.1/gcc/Atomic-Builtins.html)）

```C
bool __sync_bool_compare_and_swap (type *ptr, type oldval type newval, ...)
type __sync_val_compare_and_swap (type *ptr, type oldval type newval, ...)
```

## Windows的CAS

在Windows下，你可以使用下面的Windows API来完成CAS：（完整的Windows原子操作可参看MSDN的 [InterLocked Functions](http://msdn.microsoft.com/en-us/library/windows/desktop/ms686360(v=vs.85).aspx#interlocked_functions)）

```c
InterlockedCompareExchange ( __inout LONG volatile *Target,
                                __in LONG Exchange,
                                __in LONG Comperand);
```

## 3) C++11中的CAS

C++11中的STL中的atomic类的函数可以让你跨平台。

（完整的C++11的原子操作可参看 [Atomic Operation Library](http://en.cppreference.com/w/cpp/atomic)）

```c
template< class T >
bool atomic_compare_exchange_weak( std::atomic* obj,
                                   T* expected, T desired );
template< class T >
bool atomic_compare_exchange_weak( volatile std::atomic* obj,
                                   T* expected, T desired );
```

# 例子说明

一个 `n++` 的问题。

- Case.java

```java
public class Case {

    public volatile int n;

    public void add() {
        n++;
    }

}
```

## 字节码

通过 `javap -verbose Case` 看看add方法的字节码指令

```java
public void add();
    descriptor: ()V
    flags: ACC_PUBLIC
    Code:
      stack=3, locals=1, args_size=1
         0: aload_0
         1: dup
         2: getfield      #2                  // Field n:I
         5: iconst_1
         6: iadd
         7: putfield      #2                  // Field n:I
        10: return
      LineNumberTable:
        line 23: 0
        line 24: 10
```

## 具体指令

n++ 被拆分成了几个指令：

- 执行 getfield 拿到原始n；

- 执行 iadd 进行加1操作；

- 执行putfield写把累加后的值写回n；

## 讨论

- 问题

通过 volatile 修饰的变量可以保证线程之间的可见性，但并**不能保证这3个指令的原子执行**，在多线程并发执行下，无法做到线程安全，得到正确的结果，那么应该如何解决呢？

- 解决方式

- `synchronized` 方式

或者其他悲观锁机制。性能较差。

```java
public synchronized void add() {
    n++;
}
```

# CAS

除了低性能的加锁方案，我们还可以使用 CAS 方案，在CAS中，比较和替换是一组原子操作，不会被外部打断，且在性能上更占有优势。

## AtomicInteger

- AtomicInteger

```java
public class AtomicInteger extends Number implements java.io.Serializable {
    // setup to use Unsafe.compareAndSwapInt for updates
    private static final Unsafe unsafe = Unsafe.getUnsafe();
    private static final long valueOffset;

    static {
        try {
            valueOffset = unsafe.objectFieldOffset
                (AtomicInteger.class.getDeclaredField("value"));
        } catch (Exception ex) { throw new Error(ex); }
    }

    private volatile int value;
    public final int get() {return value;}
}
```

- Unsafe，是CAS的核心类，由于Java方法无法直接访问底层系统，需要通过本地（native）方法来访问，Unsafe相当于一个后门，基于该类可以直接操作特定内存的数据。

- 变量valueOffset，表示该变量值在内存中的偏移地址，因为Unsafe就是根据内存偏移地址获取数据的。

- 变量 value 用 `volatile` 修饰，保证了多线程之间的内存可见性。

## 累加操作

看看 AtomicInteger 如何实现并发下的累加操作：

```java
public final int getAndAdd(int delta) {    
    return unsafe.getAndAddInt(this, valueOffset, delta);
}

//unsafe.getAndAddInt
public final int getAndAddInt(Object var1, long var2, int var4) {
    int var5;
    do {
        var5 = this.getIntVolatile(var1, var2);
    } while(!this.compareAndSwapInt(var1, var2, var5, var5 + var4));
    return var5;
}
```

假设线程A和线程B同时执行getAndAdd操作（分别跑在不同CPU上）：

- AtomicInteger里面的value原始值为3，即主内存中AtomicInteger的value为3，根据Java内存模型，线程A和线程B各自持有一份value的副本，值为3。

- 线程A通过getIntVolatile(var1, var2)拿到value值3，这时线程A被挂起。

- 线程B也通过getIntVolatile(var1, var2)方法获取到value值3，运气好，线程B没有被挂起，并执行compareAndSwapInt方法比较内存值也为3，成功修改内存值为2。

- 这时线程A恢复，执行compareAndSwapInt方法比较，发现自己手里的值(3)和内存的值(2)不一致，说明该值已经被其它线程提前修改过了，那只能重新来一遍了。

- 重新获取value值，因为变量value被volatile修饰，所以其它线程对它的修改，线程A总是能够看到，线程A继续执行compareAndSwapInt进行比较替换，直到成功。

## Unsafe

整个过程中，利用CAS保证了对于value的修改的并发安全，继续深入看看Unsafe类中的compareAndSwapInt方法实现。

```java
public final native boolean compareAndSwapInt(Object paramObject, long paramLong, int paramInt1, int paramInt2);
```

## unsafe.cpp

Unsafe类中的compareAndSwapInt，是一个本地方法，该方法的实现位于unsafe.cpp中

- unsafe.cpp 

```cpp
UNSAFE_ENTRY(jboolean, Unsafe_CompareAndSwapInt(JNIEnv *env, jobject unsafe, jobject obj, jlong offset, jint e, jint x))
  UnsafeWrapper("Unsafe_CompareAndSwapInt");
  oop p = JNIHandles::resolve(obj);
  jint* addr = (jint *) index_oop_from_field_offset_long(p, offset);
  return (jint)(Atomic::cmpxchg(x, addr, e)) == e;
UNSAFE_END
```

先想办法拿到变量 value 在内存中的地址。

通过 Atomic::cmpxchg 实现比较替换，其中参数x是即将更新的值，参数e是原内存的值。

- linux

如果是Linux的x86，`Atomic::cmpxchg` 方法的实现如下：

```cpp
inline jint Atomic::cmpxchg (jint exchange_value, volatile jint* dest, jint compare_value) {
  int mp = os::is_MP();
  __asm__ volatile (LOCK_IF_MP(%4) "cmpxchgl %1,(%3)"
                    : "=a" (exchange_value)
                    : "r" (exchange_value), "a" (compare_value), "r" (dest), "r" (mp)
                    : "cc", "memory");
  return exchange_value;
}
```

`__asm__` 表示汇编的开始

`volatile` 表示禁止编译器优化

- Window

Window 的 x86 实现如下：

```cpp
inline jint Atomic::cmpxchg (jint exchange_value, volatile jint* dest, jint compare_value) {
    int mp = os::isMP(); //判断是否是多处理器
    _asm {
        mov edx, dest
        mov ecx, exchange_value
        mov eax, compare_value
        LOCK_IF_MP(mp)
        cmpxchg dword ptr [edx], ecx
    }
}

// Adding a lock prefix to an instruction on MP machine
// VC++ doesn't like the lock prefix to be on a single line
// so we can't insert a label after the lock prefix.
// By emitting a lock prefix, we can define a label after it.
#define LOCK_IF_MP(mp) __asm cmp mp, 0  \
                       __asm je L0      \
                       __asm _emit 0xF0 \
                       __asm L0:
```


### LOCK_IF_MP

`LOCK_IF_MP` 是个内联函数

```cpp
#define LOCK_IF_MP(mp) "cmp $0, " #mp "; je 1f; lock; 1: "
```

`LOCK_IF_MP` 根据当前系统是否为多核处理器决定是否为cmpxchg指令添加lock前缀。

如果是多处理器，为cmpxchg指令添加lock前缀。
反之，就省略lock前缀。（单处理器会不需要lock前缀提供的内存屏障效果）

> intel手册对 lock 前缀的说明如下

1. 确保后续指令执行的原子性。

在Pentium及之前的处理器中，带有lock前缀的指令在执行期间会锁住总线，使得其它处理器暂时无法通过总线访问内存，很显然，这个开销很大。在新的处理器中，Intel使用缓存锁定来保证指令执行的原子性，缓存锁定将大大降低lock前缀指令的执行开销。

2. 禁止该指令与前面和后面的读写指令重排序。

3. 把写缓冲区的所有数据刷新到内存中。


上面的第2点和第3点所具有的内存屏障效果，保证了CAS同时具有volatile读和volatile写的内存语义。

# CAS缺点

CAS虽然很高效的解决原子操作，但是 CAS 仍然存在三大问题。

## ABA 问题

因为CAS需要在操作值的时候检查下值有没有发生变化，如果没有发生变化则更新，但是如果一个值原来是A，变成了B，又变成了A，
那么使用CAS进行检查时会发现它的值没有发生变化，但是实际上却变化了。
ABA问题的解决思路就是使用版本号。

在变量前面**追加上版本号**，每次变量更新的时候把版本号加一，那么A－B－A 就会变成1A-2B－3A。

从Java1.5开始JDK的atomic包里提供了一个类 `AtomicStampedReference` 来解决ABA问题。
这个类的 compareAndSet 方法作用是首先检查当前引用是否等于预期引用，并且当前标志是否等于预期标志，如果全部相等，则以原子方式将该引用和该标志的值设置为给定的更新值。

关于ABA问题参考文档: http://blog.hesey.net/2011/09/resolve-aba-by-atomicstampedreference.html

## 循环时间长开销大。

自旋CAS如果长时间不成功，会给CPU带来非常大的执行开销。

如果JVM能支持处理器提供的pause指令那么效率会有一定的提升，
pause指令有两个作用，第一它可以延迟流水线执行指令（de-pipeline）,使CPU不会消耗过多的执行资源，延迟的时间取决于具体实现的版本，在一些处理器上延迟时间是零。
第二它可以避免在退出循环的时候因内存顺序冲突（memory order violation）而引起CPU流水线被清空（CPU pipeline flush），从而提高CPU的执行效率。

 
## 只能保证一个共享变量的原子操作。

当对一个共享变量执行操作时，我们可以使用循环CAS的方式来保证原子操作，但是对多个共享变量操作时，循环CAS就无法保证操作的原子性，这个时候就可以用锁，
或者有一个取巧的办法，就是把多个共享变量合并成一个共享变量来操作。

比如有两个共享变量i＝2,j=a，合并一下ij=2a，然后用CAS来操作ij。

从Java1.5开始JDK提供了 `AtomicReference` 类来保证引用对象之间的原子性，你可以把多个变量放在一个对象里来进行CAS操作。

# CAS与对象创建

另外，CAS还有一个应用，那就是在 JVM 创建对象的过程中。对象创建在虚拟机中是非常频繁的。

即使是仅仅修改一个指针所指向的位置，在并发情况下也不是线程安全的，可能正在给对象A分配内存空间，指针还没来得及修改，
对象B又同时使用了原来的指针来分配内存的情况。

解决这个问题的方案有两种，其中一种就是采用CAS配上失败重试的方式保证更新操作的原子性。

# 总结

Java中的线程安全问题至关重要，要想保证线程安全，就需要锁机制。

锁机制包含两种：乐观锁与悲观锁。

**悲观锁是独占锁，阻塞锁。乐观锁是非独占锁，非阻塞锁。**

一般而言，乐观锁的性能是优于悲观锁的，但是值得注意的是这种算法会存在ABA问题。

这个告诉我们，**做人要乐观，这会让你的人生变得轻快，但不能过于乐观**。

有一种乐观锁的实现方式就是CAS，这种算法在 JDK 1.5 中引入的 `java.util.concurrent` 中有广泛应用，后续将会精选一些 jdk 源码进行讲解。

希望本文对你的有所帮助，如果你有更多的想法，欢迎评论区和大家分享讨论。

各位**极客**的点赞收藏转发，是老马写作的最大动力！

# 参考文档

http://zl198751.iteye.com/blog/1848575

https://www.jianshu.com/p/fb6e91b013cc

http://ifeve.com/compare-and-swap/

http://www.importnew.com/20472.html

https://howtodoinjava.com/core-java/multi-threading/compare-and-swap-cas-algorithm/

* any list
{:toc}