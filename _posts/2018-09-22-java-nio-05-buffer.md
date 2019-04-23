---
layout: post
title:  Java NIO-05-Buffer
date:  2018-09-22 12:20:47 +0800
categories: [Java]
tags: [java, nio, java-base, sf]
published: true
---

# Buffer

## 作用

Java NIO Buffers用于和NIO Channel交互。正如你已经知道的，我们从channel中读取数据到buffers里，从buffer把数据写入到channels.

buffer 本质上就是一块内存区，可以用来写入数据，并在稍后读取出来。

这块内存被NIO Buffer包裹起来，对外提供一系列的读写方便开发的接口。

# 用法演示

## Basic Buffer Usage

利用Buffer读写数据，通常遵循四个步骤：

1. 把数据写入buffer；

2. 调用flip()；

3. 从 Buffer 中读取数据；

4. 调用 buffer.clear() 或者 buffer.compact()

当写入数据到buffer中时，buffer会记录已经写入的数据大小。

当需要读数据时，通过flip()方法把buffer从写模式调整为读模式；在读模式下，可以读取所有已经写入的数据。

当读取完数据后，需要清空buffer，以满足后续写入操作。

清空buffer有两种方式：调用clear()或compact()方法。

clear会清空整个buffer，compact() 则只清空已读取的数据，未被读取的数据会被移动到buffer的开始位置，写入位置则近跟着未读数据之后。

## 实例

这里有一个简单的buffer案例，包括了write，flip和clear操作：

```java
@Test
public void simpleTest() throws IOException {
    final String path = "/Users/houbinbin/code/_github/java-learn/java-learn-base/java-base-nio/src/main/resources/README.md";
    RandomAccessFile randomAccessFile = new RandomAccessFile(path, "rw");
    FileChannel fileChannel = randomAccessFile.getChannel();

    //create buffer with capacity of 48 bytes
    ByteBuffer buf = ByteBuffer.allocate(48);
    //read into buffer.
    int bytesRead = fileChannel.read(buf);
    while (bytesRead != -1) {
        //make buffer ready for read
        buf.flip();
        while (buf.hasRemaining()) {
            // read 1 byte at a time
            System.out.print((char) buf.get());
        }
        buf.clear(); //make buffer ready for writing
        bytesRead = fileChannel.read(buf);
    }
}
```

# Buffer 类型

## 基本类型

Java NIO有如下具体的Buffer类型：

- ByteBuffer

- MappedByteBuffer

- CharBuffer

- DoubleBuffer

- FloatBuffer

- IntBuffer

- LongBuffer

- ShortBuffer

正如你看到的，Buffer的类型代表了不同数据类型，换句话说，Buffer中的数据可以是上述的基本类型；

## 其他

- StringCharBuffer

对应 String

- MappedByteBuffer

# Buffer 属性

一个Buffer有三个属性是必须掌握的，分别是：

- capacity 容量

- position 位置

- limit 限制

position和limit的具体含义取决于当前buffer的模式。

capacity在两种模式下都表示容量。

![buffers-modes.png](http://tutorials.jenkov.com/images/java-nio/buffers-modes.png)

## 容量（Capacity）

作为一块内存，buffer有一个固定的大小，叫做capacity容量。

也就是最多只能写入容量值得字节，整形等数据。

一旦buffer写满了就需要清空已读数据以便下次继续写入新的数据。

## 位置（Position）

当写入数据到Buffer的时候需要中一个确定的位置开始，默认初始化时这个位置position为0，一旦写入了数据比如一个字节，整形数据，那么position的值就会指向数据之后的一个单元，position最大可以到capacity-1.

当从Buffer读取数据时，也需要从一个确定的位置开始。

buffer从写入模式变为读取模式时，position会归零，每次读取后，position向后移动。

## 上限（Limit）

在写模式，limit的含义是我们所能写入的最大数据量。它等同于buffer的容量。

一旦切换到读模式，limit则代表我们所能读取的最大数据量，他的值等同于写模式下position的位置。

数据读取的上限时buffer中已有的数据，也就是limit的位置（原position所指的位置）。

# Buffer 方法

## 分配 buffer

为了获取一个Buffer对象，你必须先分配。每个Buffer实现类都有一个allocate()方法用于分配内存。

下面看一个实例,开辟一个48字节大小的buffer：

```java
ByteBuffer buf = ByteBuffer.allocate(48);
```

## 写入数据到Buffer（Writing Data to a Buffer）

写数据到Buffer有两种方法：

- 从Channel中写数据到Buffer

```java
int bytesRead = inChannel.read(buf); //read into buffer.
```

- 手动写数据到Buffer，调用put方法

```java
buf.put(127);    
```

## 从Buffer读取数据（Reading Data from a Buffer）

从Buffer读数据也有两种方式。

- 从buffer读数据到channel

```java
//read from buffer into channel.
int bytesWritten = inChannel.write(buf);
```

- 从buffer直接读取数据，调用get方法

```java
byte aByte = buf.get();    
```

## 翻转

flip() 方法可以吧Buffer从写模式切换到读模式。

调用 flip() 方法会把position归零，并设置limit为之前的position的值。 

也就是说，现在position代表的是读取位置，limit标示的是已写入的数据位置。

ps: 读取的时候一定要调用这个方法，让读的位置定位到开始。

## rewind()

Buffer.rewind()方法将position置为0，这样我们可以重复读取buffer中的数据。limit保持不变。

## clear() & compact()

一旦我们从buffer中读取完数据，需要复用buffer为下次写数据做准备。只需要调用clear或compact方法。

clear方法会重置position为0，limit为capacity，也就是整个Buffer清空。实际上Buffer中数据并没有清空，我们只是把标记为修改了。

如果Buffer还有一些数据没有读取完，调用clear就会导致这部分数据被“遗忘”，因为我们没有标记这部分数据未读。

针对这种情况，如果需要保留未读数据，那么可以使用compact。 

因此compact和clear的区别就在于对未读数据的处理，是保留这部分数据还是一起清空。

## mark() & reset()

通过mark方法可以标记当前的position，通过reset来恢复mark的位置。

这个非常像canva的save和restore：

```java
buffer.mark();

//call buffer.get() a couple of times, e.g. during parsing.

buffer.reset();  //set position back to mark.    
```

## equals()

判断两个buffer相对，需满足：

1. 类型相同

2. buffer中剩余字节数相同

3. 所有剩余字节相等

从上面的三个条件可以看出，equals只比较buffer中的部分内容，并不会去比较每一个元素。

## compareTo()

compareTo也是比较buffer中的剩余元素，只不过这个方法适用于比较排序的：

# Scatter/Gather

Java NIO发布时内置了对scatter / gather的支持。scatter / gather是通过通道读写数据的两个概念。

Scattering read指的是从通道读取的操作能把数据写入多个buffer，也就是sctters代表了数据从一个channel到多个buffer的过程。

Gathering write则正好相反，表示的是从多个buffer把数据写入到一个channel中。

Scatter/gather在有些场景下会非常有用，比如需要处理多份分开传输的数据。

举例来说，假设一个消息包含了header和body，我们可能会把header和body保存在不同独立buffer中，这种分开处理header与body的做法会使开发更简明。

## Scatter Read

"scattering read"是把数据从单个Channel写入到多个buffer

```java
ByteBuffer header = ByteBuffer.allocate(128);
ByteBuffer body   = ByteBuffer.allocate(1024);

ByteBuffer[] bufferArray = { header, body };

channel.read(bufferArray);
```

观察代码可以发现，我们把多个buffer写在了一个数组中，然后把数组传递给channel.read()方法。

read()方法内部会负责把数据按顺序写进传入的buffer数组内。一个buffer写满后，接着写到下一个buffer中。

实际上，scattering read内部必须写满一个buffer后才会向后移动到下一个buffer，因此这并不适合消息大小会动态改变的部分，也就是说，如果你有一个header和body，并且header有一个固定的大小（比如128字节）,这种情形下可以正常工作。

## Gathering Writes

"gathering write"把多个buffer的数据写入到同一个channel中。

```java
ByteBuffer header = ByteBuffer.allocate(128);
ByteBuffer body   = ByteBuffer.allocate(1024);

ByteBuffer[] bufferArray = { header, body };

channel.write(bufferArray);
```

类似的传入一个buffer数组给write，内部机会按顺序将数组内的内容写进channel，这里需要注意，写入的时候针对的是buffer中position到limit之间的数据。

也就是如果buffer的容量是128字节，但它只包含了58字节数据，那么写入的时候只有58字节会真正写入。

因此gathering write是可以适用于可变大小的message的，这和scattering reads不同。

# 参考资料

[java.nio.Buffer flip()方法的用法详解](https://www.cnblogs.com/woshijpf/articles/3723364.html)

http://wiki.jikexueyuan.com/project/java-nio-zh/java-nio-buffer.html

http://wiki.jikexueyuan.com/project/java-nio-zh/java-nio-scatter-gather.html

* any list
{:toc}