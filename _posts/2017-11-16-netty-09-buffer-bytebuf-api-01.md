---
layout: post
title:  Netty-09-ByteBuf API
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, io, sh]
published: true
---


# 引言

1. ByteBuf 是对 ByteBuffer 的改进。可见一个接口设计的不好，就会被别人推翻。实现不好就算了，接口一定要设计好。

# 个人理解

1. 学习的时候知道关键的概念，和固定的方法分类。

2. 理解每一种方法的使用场景，但是不需要记忆。

3. 对比学习。netty 是对 ByteBuffer 的改良。结合一起理解，会更加简单。

4. 眼高手低，自己动手写一遍。

# 为什么需要这门技术

## NIO ByteBuffer的局限性

- 1. 长度固定

ByteBuffer一旦分配完成，他的容量不能动态扩展和收缩，当需要编码的POJO对象大于ByteBuffer容量是，会发生索引越界异常。

- 2. 使用复杂

ByteBuffer只有一个标识位置的指针position，读写的时候需要手工调用flip()和rewind()等方法，使用时需要非常谨慎的使用这些api，否则很容出现错误

- 3. API功能有限

一些高级、实用的特性，ByteBuffer不支持，需要开发者自己编程实现。

为了弥补这些不足，Netty提供了自己的ByteBuf实现。

# ByteBuf 的 API

Netty 的数据处理 API 通过两个组件暴露——abstract class ByteBuf 和 interface ByteBufHolder。

## 优点

它可以被用户自定义的缓冲区类型扩展；

通过内置的复合缓冲区类型实现了透明的零拷贝；

容量可以按需增长（类似于 JDK 的 StringBuilder）；

在读和写这两种模式之间切换不需要调用 ByteBuffer 的 flip()方法；

读和写使用了不同的索引；

支持方法的链式调用；

支持引用计数；

支持池化。

其他类可用于管理 ByteBuf 实例的分配，以及执行各种针对于数据容器本身和它所持有的数据的操作。

我们将在仔细研究 ByteBuf 和 ByteBufHolder 时探讨这些特性。

# Buffer 大家族

## 数据类型概述

最高层的抽象是ByteBuf，Netty首先根据直接内存和堆内存，将Buffer按照这两个方向去扩展，之后再分别对具体的直接内存和堆内存缓冲区按照是否池化这两个方向再进行扩展。

除了这两个维度，Netty还扩展了基于Unsafe的Buffer：

- 按照底层存储空间划分

堆缓冲区：HeapBuffer

直接缓冲区：DirectBuffer

- 按照对否池化划分

池化：PooledBuffer

非池化：UnPooledBuffer

- 第三个维度

Unsafe

## 常见的实现

我们分别挑出一个比较典型的实现来进行介绍：

PooledHeapByteBuf：池化的基于堆内存的缓冲区。

PooledDirectByteBuf：池化的基于直接内存的缓冲区。

PooledUnsafeDirectByteBuf：池化的基于Unsafe和直接内存实现的缓冲区。

UnPooledHeapByteBuf：非池化的基于堆内存的缓冲区。

UnPooledDirectByteBuf：非池化的基于直接内存的缓冲区。

UnPooledUnsafeDirectByteBuf：非池化的基于Unsafe和直接内存实现的缓冲区。

## 其他

除了上面这些，另外Netty的Buffer家族还有CompositeByteBuf、ReadOnlyByteBufferBuf、ThreadLocalDirectByteBuf等等，这里还要说一下 UnsafeBuffer，当当前平台支持Unsafe的时候，我们就可以使用UnsafeBuffer，

JAVA DirectBuffer的实现也是基于unsafe来对内存进行操作的， 我们可以看到不同的地方是PooledUnsafeDirectByteBuf或UnPooledUnsafeDirectByteBuf维护着一个memoryAddress变量，这个变量代表着缓冲区的内存地址，在使用的过程中加上一个offer就可以对内存进行灵活的操作。

总的来说，Netty围绕着ByteBuf及其父接口定义的行为分别从是直接内存还是使用堆内存，是池话还是非池化，是否支持Unsafe来对ByteBuf进行不同的扩展实现。

## 个人感受

原理其实是最重要的，知道 netty 的分类思想，而不是一味的去记忆。

这么多类，记一遍也没啥意思。

# ByteBuf 类——Netty 的数据容器

因为所有的网络通信都涉及字节序列的移动，所以高效易用的数据结构明显是必不可少的。 

Netty 的 ByteBuf 实现满足并超越了这些需求。让我们首先来看看它是如何通过使用不同的索引来简化对它所包含的数据的访问的吧。

## 它是如何工作的

ByteBuf 维护了两个不同的索引：一个用于读取，一个用于写入。

当你从 ByteBuf 读取时， 它的 readerIndex 将会被递增已经被读取的字节数。

同样地，当你写入 ByteBuf 时，它的 writerIndex 也会被递增。

下图展示了一个空 ByteBuf 的布局结构和状态。

```
0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 
```

开始的时候，readIndex=writeIndex=0

## ByteBuf 实现源码

ByteBuf 是一个抽象类，内部全部是抽象的函数接口，AbstractByteBuf这个抽象类基本实现了ByteBuf，下面我们通过分析AbstractByteBuf里面的实现来分析ByteBuf的工作原理。

ByteBuf都是基于字节序列的，类似于一个字节数组。

在AbstractByteBuf里面定义了下面5个变量：

```java
int readerIndex; //读索引
int writerIndex; //写索引
private int markedReaderIndex;//标记读索引
private int markedWriterIndex;//标记写索引
private int maxCapacity;//缓冲区的最大容量
```

ByteBuf 与JDK中的 ByteBuffer 的最大区别之一就是： 

（1）netty的ByteBuf采用了读/写索引分离，一个初始化的ByteBuf的readerIndex和writerIndex都处于0位置。 

（2）当读索引和写索引处于同一位置时，如果我们继续读取，就会抛出异常IndexOutOfBoundsException。 

（3）对于ByteBuf的任何读写操作都会分别单独的维护读索引和写索引。maxCapacity最大容量默认的限制就是Integer.MAX_VALUE。

## 个人的理解

拆分成读写，固然是一种很棒的飞跃。但是对于调用者来说，实际上还是有点繁琐。

疑问拆分之后，api 直接翻倍了。

建议有两个对象，write/read

然后这个两个对象的 api 和 ByteBuffer 保持一致。


# ByteBuf 的使用模式

JDK中的Buffer的类型有heapBuffer和directBuffer两种类型，但是在netty中除了heap和direct类型外，还有composite Buffer(复合缓冲区类型)。

## Heap Buffer 堆缓冲区

这是最常用的类型，ByteBuf将数据存储在JVM的堆空间，通过将数据存储在数组中实现的。 

- 优点

由于数据存储在JVM的堆中可以快速创建和快速释放，并且提供了数组的直接快速访问的方法。

- 缺点

每次读写数据都要先将数据拷贝到直接缓冲区再进行传递。

这种模式被称为支撑数组 （backing array），它能在没有使用池化的情况下提供快速的分配和释放。

- 示例代码

这种方式，如下所示，非常适合于有遗留的数据需要处理的情况。

```java
ByteBuf heapBuf = ...;
if (heapBuf.hasArray()) {
　　byte[] array = heapBuf.array();
　　int offset = heapBuf.arrayOffset() + heapBuf.readerIndex();
　　int length = heapBuf.readableBytes();
　　handleArray(array, offset, length);
}
```

## Direct Buffer 直接缓冲区

NIO 在 JDK 1.4 中引入的 ByteBuffer 类允许 JVM 实现通过本地调用来分配内存。

这主要是为了避免在每次调用本地 I/O 操作之前（或者之后）将缓冲区的内容复制到一个中间缓冲区（或者从中间缓冲区把内容复制到缓冲区）。

Direct Buffer在堆之外直接分配内存，直接缓冲区不会占用堆的容量。

事实上，在通过套接字发送它之前，JVM将会在内部把你的缓冲区复制到一个直接缓冲区中。所以如果使用直接缓冲区可以节约一次拷贝。

- 优点

在使用Socket传递数据时性能很好，由于数据直接在内存中，不存在从JVM拷贝数据到直接缓冲区的过程，性能好。

- 缺点

相对于基于堆的缓冲区，它们的分配和释放都较为昂贵。

如果你正在处理遗留代码，你也可能会遇到另外一个缺点：因为数据不是在堆上，所以你不得不进行一次复制。

虽然netty的Direct Buffer有这个缺点，但是netty通过内存池来解决这个问题。

直接缓冲池不支持数组访问数据，但可以通过间接的方式访问数据数组：

- 示例代码

```java
ByteBuf directBuf = ...;
if (!directBuf.hasArray()) {
　　int length = directBuf.readableBytes();
　　byte[] array = new byte[length];
　　directBuf.getBytes(directBuf.readerIndex(), array);
　　handleArray(array, 0, length);
}
```

不过对于一些IO通信线程中读写缓冲时建议使用DirectByteBuffer，因为这涉及到大量的IO数据读写。

对于后端的业务消息的编解码模块使用HeapByteBuffer。

## Composite Buffer 复合缓冲区

第三种也是最后一种模式使用的是复合缓冲区，它为多个 ByteBuf 提供一个聚合视图。

在 这里你可以根据需要添加或者删除 ByteBuf 实例，这是一个 JDK 的 ByteBuffer 实现完全缺失的特性。

Netty 通过一个 ByteBuf 子类——CompositeByteBuf——实现了这个模式，它提供了一 个将多个缓冲区表示为单个合并缓冲区的虚拟表示

Netty提供了Composite ByteBuf来处理复合缓冲区。

例如：一条消息由Header和Body组成，将header和body组装成一条消息发送出去。

下图显示了Composite ByteBuf组成header和body： 

- CompositeByteBuf

```
[bytebuffer-头部] [bytebuffer-主体]
```

如果使用的是JDK的ByteBuffer就不能简单的实现，只能通过创建数组或则新的ByteBuffer，再将里面的内容复制到新的ByteBuffer中，下面给出了一个CompositeByteBuf的使用示例：

- 使用案例

```java
//组合缓冲区
CompositeByteBuf compBuf = Unpooled.compositeBuffer();   
//堆缓冲区
ByteBuf heapBuf = Unpooled.buffer(8);   
//直接缓冲区
ByteBuf directBuf = Unpooled.directBuffer(16);   
//添加ByteBuf到CompositeByteBuf   
compBuf.addComponents(heapBuf, directBuf);   
//删除第一个ByteBuf   
compBuf.removeComponent(0);   
Iterator<ByteBuf> iter = compBuf.iterator();   
while(iter.hasNext()){   
    System.out.println(iter.next().toString());   
}   

//使用数组访问数据      
if(!compBuf.hasArray()){   
    int len = compBuf.readableBytes();   
    byte[] arr = new byte[len];   
    compBuf.getBytes(0, arr);   
}
```

Netty使用了CompositeByteBuf来优化套接字的I/O操作，尽可能地消除了由JDK的缓冲区实现所导致的性能以及内存使用率的惩罚。

这尤其适用于 JDK 所使用的一种称为分散/收集 I/O（Scatter/Gather I/O）的技术，定义为“一种输入和 输出的方法，其中，单个系统调用从单个数据流写到一组缓冲区中，或者，从单个数据源读到一组缓冲 区中”。《Linux System Programming》，作者 Robert Love（O’Reilly, 2007）

这种优化发生在Netty的核心代码中， 因此不会被暴露出来，但是你应该知道它所带来的影响。


# ByteBuf 字节级操作

## 随机访问索引getByte(i)，i是随机值

ByteBuf提供读/写索引，从0开始的索引，第一个字节索引是0，最后一个字节的索引是capacity-1，

下面给出一个示例遍历ByteBuf的字节：

```java
public static void main(String[] args) {
    //创建一个16字节的buffer,这里默认是创建heap buffer
    ByteBuf buf = Unpooled.buffer(16);
    //写数据到buffer
    for(int i=0; i<16; i++){
        buf.writeByte(i+1);
    }
    //读数据
    for(int i=0; i<buf.capacity(); i++){
        System.out.print(buf.getByte(i)+", ");
    }
}
```

- output

```
1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 
```

这里有一点需要注意的是：通过那些需要一个索引值参数的方法（getByte(i)）之一索引访问byte时不会改变真实的读索引和写索引，我们可以通过ByteBuf的readerIndex()或则writerIndex()函数来分别推进读索引和写索引。

## 顺序访问索引

```java
@Override
public ByteBuf writeByte(int value) {
    ensureAccessible();//检验是否可以写入
    ensureWritable0(1);
    _setByte(writerIndex++, value);//这里写索引自增了
    return this;
}
@Override
public byte readByte() {
    checkReadableBytes0(1);
    int i = readerIndex;
    byte b = _getByte(i);
    readerIndex = i + 1;//这里读索引自增了
    return b;
}
```

虽然 ByteBuf 同时具有读索引和写索引，但是 JDK 的 ByteBuffer 却只有一个索引，这也就是为什么必须调用 flip() 方法来在读模式和写模式之间进行切换的原因。

下图展示了 ByteBuf 是如何被它的两个索引划分成 3 个区域的

```
+-------------------+--------------------+------------------+
|    可丢弃字节      | 可读字节(CONTENT)   |      可写字节    |
+-------------------+--------------------+------------------+
0 <---------- readerIndex <-------- writerIndex <------- capacity
```

- 可丢弃字节：已经被读过的字节

通过调用 discardReadBytes() 方法可以丢弃他们并回收空间

回收之后，readerIndex会变为0，回收的空间会追加到可写字节，也就是可写字节变大

频繁调用回收方法会导致内存复制，所以建议只有在真正需要的时候才这么做

- 可读字节：尚未被读过的字节

get开头的方法不会改变readerIndex

read或skip开头的方法会改变readerIndex

- 可写字节：可以添加更多字节的空间

任何write开头的操作都将从当前的writeIndex处开始写数据，并将它增加已经写入的字节数


## ByteBuf索引分区

### 可丢弃字节

对于已经读过的字节，我们需要回收，通过调用ByteBuf.discardReadBytes()来回收已经读取过的字节，discardReadBytes()将回收从索引0到readerIndex之间的字节。

调用discardReadBytes()方法之后会变成如下图所示; 

```
【可读字段】【可写字段】
```

虽然你可能会倾向于频繁地调用 discardReadBytes()方法以确保可写分段的最大化。

但是请注意，很明显discardReadBytes()函数很可能会导致内存的复制，它需要移动ByteBuf中可读字节到开始位置，所以该操作会导致时间开销。

说白了也就是时间换空间。


### 可读字节

ByteBuf 的可读字节分段存储了实际数据。

新分配的、包装的或者复制的缓冲区的默认的 readerIndex 值为 0。

任何名称以 read 或者 skip 开头的操作都将检索或者跳过位于当前 readerIndex 的数据，并且将它增加已读字节数。

当我们读取字节的时候，一般要先判断buffer中是否有字节可读，这时候可以调用isReadable()函数来判断：

源码如下：

```java
@Override
public boolean isReadable() {
    return writerIndex > readerIndex;
}
```

### 可写字节

可写字节分段是指一个拥有未定义内容的、写入就绪的内存区域。

新分配的缓冲区的 writerIndex 的默认值为 0。

任何名称以 write 开头的操作都将从当前的 writerIndex 处开始写数据，并将它增加已经写入的字节数。

如果写操作的目标也是 ByteBuf，并且没有指定 源索引的值，则源缓冲区的 readerIndex 也同样会被增加相同的大小。

其实也就是判断读索引是否小于写索引 来判断是否还可以读取字节。

在判断是否可写时也是判断写索引是否小于最大容量来判断。

```java
@Override
public boolean isWritable() {
    return capacity() > writerIndex;
}
```

## 清除缓冲区

清除ByteBuf来说，有两种形式，


### clear()

第一种是clear()函数：源码如下：

```java
@Override
public ByteBuf clear() {
    readerIndex = writerIndex = 0;
    return this;
}
```

很明显这种方式并没有真实的清除缓冲区中的数据，而只是把读/写索引值重新都置为0了，这与discardReadBytes()方法有很大的区别。

## 索引管理

从源码可知，每个ByteBuf有两个标注索引，

```java
private int markedReaderIndex;//标记读索引
private int markedWriterIndex;//标记写索引
```

可以通过重置方法返回上次标记的索引的位置。

通过调用markReaderIndex、markWriterIndex、resetReaderIndex、resetWriterIndex可以实现对读、写索引的标记与重置，可以通过readerIndex(int)、writerIndex(int)方法来移动读、写索引。

注意，任何试图将索引移动到一个无效位置的操作都会触发IndexOutBoundsException。

clear方法会将readerIndex和writerIndex置0，但是不会清除内存当中的内容，它仅仅是改变了索引的值。


## 查找操作

ByteBuf中最简单的查找方法是indexOf(fromIndex, toIndex, value)方法，这个方法直接返回，这个方法查询指定索引之间的字符与指定值是否匹配，并返回查找到的索引。

ByteBuf还提供了forEachByte()方法，这个方法接收一个ByteBufProcessor的实例，ByteBufProcessor接口只有一个方法：

```java
boolean process(byte value)
```

通过这种方式可以使用一些较为复杂的查询逻辑来进行查询操作，ByteBufProcessor针对一些常见的值定义了一些具体实例，如程序想要查找换行符

```java
ByteBuf buf = ...;
int index = buf.forEach(ByteBufProcessor.FIND_LF);
```

## 衍生的缓冲区

调用duplicate()、slice()、slice(int index, int length)等方法可以创建一个现有缓冲区的视图（现有缓冲区与原有缓冲区是指向相同内存）。

衍生的缓冲区有独立的readerIndex和writerIndex和标记索引。

如果需要现有的缓冲区的全新副本，可以使用copy()获得。


### 方法

Netty为ByteBuf提供了如下创建视图的方法

```
duplicate()
slice()
slice(int, int)
Unpooled。unmodifiableBuffer();
order(ByteOrder);
readSlice(int);
```

以上每个方法都会返回一个新的ByteBuf实例，他们维护自己的读、写索引，但是内部的存储是共享的，所以对视图实例的修改也会影响到源实例的内容。

如果需要一个ByteBuf的真是副本，可以使用copy()和copy(int, int)方法，这两个方法会返回一个拥有独立存储的ByteBuf。


# ByteBufHolder

我们时不时的会遇到这样的情况：即需要另外存储除有效的实际数据各种属性值。

HTTP响应就是一个很好的例子；与内容一起的字节的还有状态码，cookies等

Netty 提供的 ByteBufHolder 可以对这种常见情况进行处理。

ByteBufHolder 还提供了对于 Netty 的高级功能，如缓冲池，其中保存实际数据的 ByteBuf 可以从池中借用，如果需要还可以自动释放。

ByteBufHolder 有那么几个方法。到底层的这些支持接入数据和引用计数。表5.7所示的方法（忽略了那些从继承 ReferenceCounted 的方法）。

Table 5.7 ByteBufHolder operations

```
名称	描述
data()	返回 ByteBuf 保存的数据
copy()	制作一个 ByteBufHolder 的拷贝，但不共享其数据(所以数据也是拷贝).
```

如果你想实现一个“消息对象”有效负载存储在 ByteBuf，使用ByteBufHolder 是一个好主意。

# 创建ByteBuf的方法

前面我们也讲过了，ByteBuf主要有三种类型，heap、direct和composite类型，

下面介绍创建这三种Buffer的方法： 

(1) 通过ByteBufAllocator这个接口来创建ByteBuf，这个接口可以创建上面的三种Buffer，一般都是通过channel的alloc()接口获取。

(2) 通过 Unpooled 类里面的静态方法，创建Buffer

(3) 工具类 ByteBufUtil

## ByteBufAllocator

为了减少分配和释放内存的开销，Netty 通过支持池类 ByteBufAllocator，可用于分配的任何 ByteBuf 我们已经描述过的类型的实例。是否使用池是由应用程序决定的，表5.8列出了 ByteBufAllocator 提供的操作。

Table 5.8 ByteBufAllocator methods

```
名称	描述
buffer()/buffer(int)/buffer(int, int)	Return a ByteBuf with heap-based or direct data storage.
heapBuffer()/heapBuffer(int)/heapBuffer(int, int)	Return a ByteBuf with heap-based storage.
directBuffer()/directBuffer(int)/directBuffer(int, int)	Return a ByteBuf with direct storage.
compositeBuffer()/compositeBuffer(int)/heapCompositeBuffer()/heapCompositeBuffer(int)/directCompositeBuffer()/directCompositeBuffer(int)	Return a CompositeByteBuf that can be expanded by adding heapbased or direct buffers.
ioBuffer()	Return a ByteBuf that will be used for I/O operations on a socket.
```

通过一些方法接受整型参数允许用户指定 ByteBuf 的初始和最大容量值。

你可能还记得，ByteBuf 存储可以扩大到其最大容量。

### 引用的获取

得到一个 ByteBufAllocator 的引用很简单。

你可以得到从 Channel （在理论上，每 Channel 可具有不同的 ByteBufAllocator ），或通过绑定到的 ChannelHandler 的 ChannelHandlerContext 得到它，用它实现了你数据处理逻辑。

下面的列表说明获得 ByteBufAllocator 的两种方式。

### 使用方式

```java
Channel channel = ...;
ByteBufAllocator allocator = channel.alloc(); //1
....
ChannelHandlerContext ctx = ...;
ByteBufAllocator allocator2 = ctx.alloc(); //2
...
```

1.从 channel 获得 ByteBufAllocator

2.从 ChannelHandlerContext 获得 ByteBufAllocator

Netty 提供了两种 ByteBufAllocator 的实现，一种是 PooledByteBufAllocator,用ByteBuf 实例池改进性能以及内存使用降到最低，此实现使用一个“jemalloc”内存分配。其他的实现不池化 ByteBuf 情况下，每次返回一个新的实例。

Netty 默认使用 PooledByteBufAllocator，我们可以通过 ChannelConfig 或通过引导设置一个不同的实现来改变。更多细节在后面讲述 ，见 Chapter 9, "Bootstrapping Netty Applications"

## Unpooled （非池化）缓存

当未引用 ByteBufAllocator 时，上面的方法无法访问到 ByteBuf。

对于这个用例 Netty 提供一个实用工具类称为 Unpooled,，它提供了静态辅助方法来创建非池化的 ByteBuf 实例。

表5.9列出了最重要的方法

Table 5.9 Unpooled helper class

```
名称	描述
buffer() buffer(int) buffer(int, int)	Returns an unpooled ByteBuf with heap-based storage
directBuffer() directBuffer(int) directBuffer(int, int)	Returns an unpooled ByteBuf with direct storage
wrappedBuffer()	Returns a ByteBuf, which wraps the given data.
copiedBuffer()	Returns a ByteBuf, which copies the given data
```

在非联网项目，该 Unpooled 类也使得它更容易使用的 ByteBuf API，获得一个高性能的可扩展缓冲 API，而不需要 Netty 的其他部分的。

## ByteBufUtil

ByteBufUtil 静态辅助方法来操作 ByteBuf，因为这个 API 是通用的，与使用池无关，这些方法已经在外面的分配类实现。

也许最有价值的是 hexDump() 方法，这个方法返回指定 ByteBuf 中可读字节的十六进制字符串，可以用于调试程序时打印 ByteBuf 的内容。

一个典型的用途是记录一个 ByteBuf 的内容进行调试。十六进制字符串相比字节而言对用户更友好。 而且十六进制版本可以很容易地转换回实际字节表示。

另一个有用方法是 使用 `boolean equals(ByteBuf, ByteBuf)`, 用来比较 ByteBuf 实例是否相等。在 实现自己 ByteBuf 的子类时经常用到。


# Netty引用计数器

在Netty 4中为 ByteBuf 和 ByteBufHolder（两者都实现了 ReferenceCounted 接口）引入了引用计数器。

引用计数器本身并不复杂；它能够在特定的对象上跟踪引用的数目，实现了ReferenceCounted 的类的实例会通常开始于一个活动的引用计数器为 1。

而如果对象活动的引用计数器大于0，就会被保证不被释放。当数量引用减少到0，将释放该实例。

需要注意的是“释放”的语义是特定于具体的实现。最起码，一个对象，它已被释放应不再可用。

这种技术就是诸如 PooledByteBufAllocator 这种减少内存分配开销的池化的精髓部分。

## 示例


### 获取

```java
Channel channel = ...;
ByteBufAllocator allocator = channel.alloc(); //1
....
ByteBuf buffer = allocator.directBuffer(); //2
assert buffer.refCnt() == 1; //3
...
```

1.从 channel 获取 ByteBufAllocator

2.从 ByteBufAllocator 分配一个 ByteBuf

3.检查引用计数器是否是 1

### 释放

```java
ByteBuf buffer = ...;
boolean released = buffer.release(); //1
...
```

1. release（）将会递减对象引用的数目。当这个引用计数达到0时，对象已被释放，并且该方法返回 true。

如果尝试访问已经释放的对象，将会抛出 IllegalReferenceCountException 异常。

需要注意的是一个特定的类可以定义自己独特的方式其释放计数的“规则”。 

例如，release() 可以将引用计数器直接计为 0 而不管当前引用的对象数目。

## 谁负责 release

在一般情况下，最后访问的对象负责释放它。

在第6章我们会解释 ChannelHandler 和 ChannelPipeline 的相关概念。

# ByteBuf与ByteBuffer的对比

## ByteBuffer 缺点

（1）下面是NIO中ByteBuffer存储字节的字节数组的定义，我们可以知道ByteBuffer的字节数组是被定义成final的，也就是长度固定。

一旦分配完成就不能扩容和收缩，灵活性低，而且当待存储的对象字节很大可能出现数组越界，用户使用起来稍不小心就可能出现异常。

如果要避免越界，在存储之前就要只要需求字节大小，如果buffer的空间不够就创建一个更大的新的ByteBuffer，再将之前的Buffer中数据复制过去，这样的效率是奇低的。

（2）ByteBuffer只用了一个position指针来标识位置，读写模式切换时需要调用flip()函数和rewind()函数，使用起来需要非常小心，不然很容易出错误。

## ByteBuf的优点

（1）ByteBuf是吸取ByteBuffer的缺点之后重新设计，存储字节的数组是动态的，最大是Integer.MAX_VALUE。这里的动态性存在write操作中，write时得知buffer不够时，会自动扩容。

（2） ByteBuf的读写索引分离，使用起来十分方便。此外ByteBuf还新增了很多方便实用的功能。

# Netty 中的 ByteBuf 为什么会发生内存泄漏

该文所涉及的 netty 源码版本为 4.1.6。

在 Netty 中，ByetBuf 并不是只采用可达性分析来对 ByteBuf 底层的 byte[]数组来进行垃圾回收，而同时采用引用计数法来进行回收，来保证堆外内存的准确时机的释放。

在每个 ByteBuf 中都维护着一个 refCnt 用来对 ByteBuf 的被引用数进行记录，当 ByteBuf 的 retain()方法被调用时，将会增加 refCnt 的计数，而其 release()方法被调用时将会减少其被引用数计数。

```java
private boolean release0(int decrement) {
    for (;;) {
        int refCnt = this.refCnt;
        if (refCnt < decrement) {
            throw new IllegalReferenceCountException(refCnt, -decrement);
        }
        if (refCntUpdater.compareAndSet(this, refCnt, refCnt - decrement)) {
            if (refCnt == decrement) {
                deallocate();
                return true;
            }
            return false;
        }
    }
}
```

当调用了 ByteBuf 的 release()方法的时候，最后在上方的 release0()方法中将会为 ByteBuf 的引用计数减一，当引用计数归于 0 的时候，将会调用 deallocate()方法对其对应的底层存储数组进行释放(在池化的 ByteBuf 中，在 deallocate()方法里会把该 ByteBuf 的 byte[]回收到底层内存池中，以确保 byte[]可以重复利用)。  

由于 Netty 中的 ByteBuf 并不是随着申请之后会马上使其引用计数归 0 而进行释放，往往在这两个操作之间还有许多操作，如果在这其中如果发生异常抛出导致引用没有及时释放，在使用池化 ByetBuffer 的情况下内存泄漏的问题就会产生。 

当采用了池化的 ByteBuffer 的时候，比如 PooledHeapByteBuf 和 PooledDirectByteBuf，其 deallocate()方法一共主要分为两个步骤。

```java
@Override
protected final void deallocate() {
	if (handle >= 0) {
		final long handle = this.handle;
		this.handle = -1;
		memory = null;
		chunk.arena.free(chunk, handle, maxLength);
		recycle();
	}
}
```

- 将其底层的 byte[]通过 free()方法回收到内存池中等待下一次使用。

- 通过 recycle()方法将其本身回收到对象池中等待下一次使用。  

关键在第一步的内存回收到池中，如果其引用计数未能在 ByteBuf 对象被回收之前归 0，将会导致其底层占用 byte[]无法回收到内存池 PoolArena 中，导致该部分无法被重复利用，下一次将会申请新的内存进行操作，从而产生内存泄漏。

而非池化的 ByteBuffer 即使引用计数没有在对象被回收的时候被归 0，因为其使用的是单独一块 byte[]内存，因此也会随着 java 对象被回收使得底层 byte[]被释放（由 JDK 的 Cleaner 来保证）。

## Netty 进行内存泄漏检测的原理

在 Netty 对于 ByteBuf 的检测中，一共包含 4 个级别。

```java
if (level.ordinal() < Level.PARANOID.ordinal()) {
	if (leakCheckCnt ++ % samplingInterval == 0) {
		reportLeak(level);
		return new DefaultResourceLeak(obj);
	} else {
		return null;
	}
}
```

以默认的 SIMPLE 级别为例，在这个级别下，Netty 将会根据以 ByteBuf 创建的序列号与 113 进行取模来判断是否需要进行内存泄漏的检测追踪。

当取模成功的时候，将会为这个 ByteBuf 产生一个对应的 DefaultResourceLeak 对象，DefaultResourceLeak 是一个 PhantomReference 虚引用的子类，并有其对应的 ReferenceQueue。

之后通过 SimpleLeakAwareByteBuf 类来将被追踪的 ByteBuf 和 DefaultResourceLeak 包装起来。

```java
@Override
public boolean release(int decrement) {
	boolean deallocated = super.release(decrement);
	if (deallocated) {
		leak.close();
	}
	return deallocated;
}
```

在包装类中，如果该 ByteBuf 成功 deallocated 释放掉了其持有的 byte[]数组将会调用 DefaultResourceLeak 的 close()方法来已通知当前 ByteBuf 已经释放了其持有的内存。 

正是这个虚引用使得该 DefaultResourceLeak 对象被回收的时候将会被放入到与这个虚引用所对应的 ReferenceQueue 中。

```java
DefaultResourceLeak ref = (DefaultResourceLeak) refQueue.poll();
if (ref == null) {
	break;
}

ref.clear();

if (!ref.close()) {
	continue;
}

String records = ref.toString();
if (reportedLeaks.putIfAbsent(records, Boolean.TRUE) == null) {
	if (records.isEmpty()) {
		logger.error("LEAK: {}.release() was not called before it's garbage-collected. " +
				"Enable advanced leak reporting to find out where the leak occurred. " +
				"To enable advanced leak reporting, " +
				"specify the JVM option '-D{}={}' or call {}.setLevel()",
				resourceType, PROP_LEVEL, Level.ADVANCED.name().toLowerCase(), simpleClassName(this));
	} else {
		logger.error(
				"LEAK: {}.release() was not called before it's garbage-collected.{}",
				resourceType, records);
	}
}
```

Netty 会在下一次 ByteBuf 的采样中通过 reportLeak()方法将 ReferenceQueue 中的 DefaultResourceLeak 取出并判断其对应的 ByteBuf 是否已经在其回收前调用过其 close()方法，如果没有，显然在池化 ByteBuf 的场景下内存泄漏已经产生，将会以 ERROR 日志的方式进行日志打印。

以上内容可以结合 JVM 堆外内存的资料进行阅读。

# 小结 

ByteBuffer 就像是数组一样，而 ByteBuf 就像是链表。

底层的实现原理也是如此，掌握数据结构及其思想是非常重要的。

# 参考资料

《Netty in Action》 P76 

- doc

[ByteBuf.html](https://netty.io/4.0/api/io/netty/buffer/ByteBuf.html)

- 系列

[w3c school](https://www.w3cschool.cn/essential_netty_in_action/essential_netty_in_action-wv6i28be.html)

- other

[Netty原理篇-ByteBuf](https://yq.aliyun.com/articles/290834)

[ByteBuf：Netty的数据容器](https://www.jianshu.com/p/3fbf54b8e8ec)

[ByteBuf of Netty](https://adolphor.com/blog/2019/02/09/bytebuf-of-netty.html)

[Netty 4.x学习笔记 – ByteBuf](https://www.tuicool.com/articles/MBneaa)

* any list
{:toc}


