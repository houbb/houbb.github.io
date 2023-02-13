---
layout: post
title:  java 基础篇-05-String 字符串又长度限制吗？常量池详解 String 类源码分析
date:  2020-7-19 10:37:20 +0800
categories: [Java]
tags: [java, java-base, sf]
published: true
---

# 问题

字符串的不可变性

String、StringBuilder和StingBuffer之间的区别与联系

字符串拼接的几种方式和区别  
String对“+”的重载

String.valueOf和Integer.toString的区别

switch对String的支持

------------------------------------

String的长度限制

字符串池、Integer的缓存机制

常量池（运行时常量池、Class常量池）

[intern](https://houbb.github.io/2018/10/07/java-string-intern)

# Java String 有长度限制吗？

## 理论长度

```java
/**
 * Allocates a new {@code String} that contains characters from a subarray
 * of the <a href="Character.html#unicode">Unicode code point</a> array
 * argument.  The {@code offset} argument is the index of the first code
 * point of the subarray and the {@code count} argument specifies the
 * length of the subarray.  The contents of the subarray are converted to
 * {@code char}s; subsequent modification of the {@code int} array does not
 * affect the newly created string.
 *
 * @param  codePoints
 *         Array that is the source of Unicode code points
 *
 * @param  offset
 *         The initial offset
 *
 * @param  count
 *         The length
 *
 * @throws  IllegalArgumentException
 *          If any invalid Unicode code point is found in {@code
 *          codePoints}
 *
 * @throws  IndexOutOfBoundsException
 *          If the {@code offset} and {@code count} arguments index
 *          characters outside the bounds of the {@code codePoints} array
 *
 * @since  1.5
 */
public String(int[] codePoints, int offset, int count) {
    //...
}

/**
 * Returns the length of this string.
 * The length is equal to the number of <a href="Character.html#unicode">Unicode
 * code units</a> in the string.
 *
 * @return  the length of the sequence of characters represented by this
 *          object.
 */
public int length() {
    return value.length;
}
```

基本可以看出 String 的一些信息是 int 存储的，理论值应该是 Integer.MAX_VALUE=0x7fffffff=2^31 - 1，约等于 4G。

### 计算过程

```
2^31-1 =2147483647 个 16-bit Unicodecharacter 
2147483647 * 16 = 34359738352 位 
34359738352 / 8 = 4294967294 (Byte) 
4294967294 / 1024 = 4194303.998046875 (KB) 
4194303.998046875 / 1024 = 4095.9999980926513671875 (MB) 
4095.9999980926513671875 / 1024 = 3.99999999813735485076904296875 (GB)
```

## 实际

当然实际情况看要看 jvm 配置等信息。

String 作为对象，所以要关注下 jvm 堆内存的大小。

### 测试

实际编码过程中有时候可能没有这么乐观，你可以验证下 65535 应该就是直接声明的最长的长度了。

```java
String s = "a....a"; //65535 个a
```

直接编译会报错：

```
Error:(13, 20) java: 常量字符串过长
```

如果你是使用循环的话，则不会报错，比如下面这样：

```java
String s = "";
for(int i = 0; i < 65535; i++) {
    s += "a";
}
System.out.println(s);
```

那么问题来了，为什么会这样呢？

### 原因

这里实际上涉及到字符串的常量池概念。

当我们使用字符串字面量直接定义String的时候，是会把字符串在常量池中存储一份的。

ps: 主要是出于性能和内存等方面的考虑，所以会有常量池。

那么上面提到的65534其实是常量池的限制。

常量池中的每一种数据项也有自己的类型。Java中的UTF-8编码的Unicode字符串在常量池中以CONSTANT_Utf8类型表示。

CONSTANTUtf8info是一个CONSTANTUtf8类型的常量池数据项，它存储的是一个常量字符串。

常量池中的所有字面量几乎都是通过CONSTANTUtf8info描述的。CONSTANTUtf8_info的定义如下：

```c
CONSTANT_Utf8_info {
    u1 tag;
    u2 length;
    u1 bytes[length];
}
```

我们使用字面量定义的字符串在class文件中，是使用CONSTANTUtf8info存储的，而CONSTANTUtf8info中有u2 length;表明了该类型存储数据的长度。

u2是无符号的16位整数，因此理论上允许的的最大长度是2^16=65536。

而 java class 文件是使用一种变体UTF-8格式来存放字符的，null 值使用两个字节来表示，因此只剩下 65536-2 = 65534个字节。

关于这一点，在the class file format spec中也有明确说明：

```
The length of field and method names, field and method descriptors, and other constant string values is limited to 65535 characters by the 16-bit unsigned length item of the CONSTANTUtf8info structure (§4.4.7). Note that the limit is on the number of bytes in the encoding and not on the number of encoded characters. UTF-8 encodes some characters using two or three bytes. Thus, strings incorporating multibyte characters are further constrained.
```

简单翻译下：

字段和方法名称，字段和方法描述符以及其他常量字符串值的长度由CONSTANTUtf8info结构（第4.4.7节）的16位无符号长度项限制为65535个字符。 

请注意，限制是编码中的字节数，而不是编码的字符数。 

UTF-8使用两个或三个字节对某些字符进行编码。 

因此，进一步限制了包含多字节字符的字符串。

# java 字符串池

## 是什么

上面既然谈到了 String 的常量池概念，这里就来学习一下。

Java 设计者为 String 提供了字符串常量池以提高其性能。

## 设计理念

String 作为对象，分配肯定也可以其他对象一样，需要耗费响应的时间和空间代价。

但是 String 又是比较特殊的对象，因为太常用了，如果大量频繁的创建 String，肯定非常影响性能。

那么该怎么办呢？

### jvm 的优化

jvm 的优化如下：为字符串开辟一个字符串常量池，类似于缓存区。

创建字符串常量时，首先判断下字符串是否在常量池中，如果存在，则直接返回。不存在，则放入。（这一句也是晚上关于常量池对多的一种介绍，不过不够确切。）

ps: 像我刚才循环创建的长度超过 65535 的肯定是不会放入的。

### 放入的是对象还是引用？

R 的回答：

> 当创建一个string对象的时候，去字符串常量池看是否有相应的字面量，如果没有就创建一个。 这个说法从来都不正确。 对象在堆里。常量池存引用。

### 实现常量池的条件

实际上这里牵扯出了另外一个非常有趣的问题。

（1）那就是 String 为什么是不可变得？

从这个角度也许你能得到自己想要的答案。

常量池，顾名思义，就是一个放常量的池子。那么里面存放的值就应该是常量（有点废话），String 如果放在里面变来变去，是无法复用的。

字符串作为常量，不用担心被修改，所以共享不存在任何问题。

（2）引用的维护

运行时实例创建的全局字符串常量池中有一个表，总是为池中每个唯一的字符串对象维护一个引用,这就意味着它们一直引用着字符串常量池中的对象，所以，在常量池中的这些字符串一般不会被垃圾收集器回收。

这个和基本类型是类似的，一般不会参与垃圾回收。

ps: 只能说 jvm 作为基础，稍微学习下就涉及到 jvm 的相关知识。所以直接搞定是最好的。jvm 系列已经学过几遍了，有时间整理一下。

（3）GC 的问题

因为字符串常量池中持有了共享的字符串对象的引用，这就是说是不是会导致这些对象无法回收？

首先问题中共享的对象一般情况下都比较小。

据我查证了解，在早期的版本中确实存在这样的问题，但是随着弱引用的引入，目前这个问题应该没有了。

> [弱引用](https://houbb.github.io/2018/08/20/java-weak-reference)

## 常量池放在哪里？

这个涉及到 jmm(java 内存模型)，详情参考：

> [java 虚拟机(jvm)-02-java 内存模型(jmm)介绍](https://www.jianshu.com/p/a276b307f887)

![运行时内存模型](https://upload-images.jianshu.io/upload_images/5874675-6f8b8713127257f5.png?imageMogr2/auto-orient/strip)

### 基本概念

我们就其中的堆、栈、方法做下讲解。

- 堆

存储的是对象，每个对象都包含一个与之对应的class

JVM只有一个堆区(heap)被所有线程共享，堆中不存放基本类型和对象引用，只存放对象本身

对象的由垃圾回收器负责回收，因此大小和生命周期不需要确定

- 栈

每个线程包含一个栈区，栈中只保存基础数据类型的对象和自定义对象的引用(不是对象)

每个栈中的数据(原始类型和对象引用)都是私有的

栈分为3个部分：基本类型变量区、执行环境上下文、操作指令区(存放操作指令)

数据大小和生命周期是可以确定的，当没有引用指向数据时，这个数据就会自动消失

- 方法区

静态区，跟堆一样，被所有的线程共享

方法区中包含的都是在整个程序中永远唯一的元素，如class，static变量


### jdk 的版本

有很多会说字符串就是存放在方法区的。

实际上，这个字符串常量池的位置也是随着jdk版本的不同而位置不同。

在jdk6中，常量池的位置在永久代（方法区）中，此时常量池中存储的是对象。

在jdk7中，常量池的位置在堆中，此时，常量池存储的就是引用了。

在jdk8中，永久代（方法区）被元空间取代了。

ps: 很多人都停留在 jdk7

## 例子

```java
String str1 = "abc";
String str2 = "abc";
String str3 = "abc";
String str4 = new String("abc");
String str5 = new String("abc");
```

![输入图片说明](https://images.gitee.com/uploads/images/2020/1013/100612_89f437d5_508704.png)

### 经典面试题

面试题：`String str4 = new String("abc")` 创建多少个对象？

分析：

（1）在常量池中查找是否有“abc”对象

1.1 有则返回对应的引用实例

1.2 没有则创建对应的实例对象

（2）在堆中 new 一个 String("abc") 对象

（3）将对象地址赋值给str4,创建一个引用

所以，常量池中没有“abc”字面量则创建两个对象，否则创建一个对象，以及创建一个引用

## 操作字符串常量池的方式

- new

```java
String str1 = "hello";
String str2 = "hello";
  
System.out.printl（"str1 == str2" : str1 == str2 ) //true
```

- String.intern()

通过new操作符创建的字符串对象不指向字符串池中的任何对象，但是可以通过使用字符串的intern()方法来指向其中的某一个。

java.lang.String.intern()返回一个保留池字符串，就是一个在全局字符串池中有了一个入口。

如果以前没有在全局字符串池中，那么它就会被添加到里面。

## 字面量是何时进入常量池

HotSpot VM的实现来说，加载类的时候，那些字符串字面量会进入到当前类的运行时常量池，不会进入全局的字符串常量池;

在字面量赋值的时候，会翻译成字节码ldc指令，ldc指令触发lazy resolution动作

```
到当前类的运行时常量池（runtime constant pool，HotSpot VM里是ConstantPool + ConstantPoolCache）去查找该index对应的项

如果该项尚未resolve则resolve之，并返回resolve后的内容。

在遇到String类型常量时，resolve的过程如果发现StringTable已经有了内容匹配的java.lang.String的引用，则直接返回这个引用;

如果StringTable里尚未有内容匹配的String实例的引用，则会在Java堆里创建一个对应内容的String对象，然后在StringTable记录下这个引用，并返回这个引用出去。
```

# String +符号的实现

在我们使用中经常会用到+符号来拼接字符串，但是这个+符号在String中的实现还是有讲究的。

如果是相加含有String对象，则底部是使用StringBuilder实现的拼接的

```java
String str1 ="str1";
String str2 ="str2";
String str3 = str1 + str2;
```

如果相加的参数只有字面量或者常量或基础类型变量，则会直接编译为拼接后的字符串。

```java
String str1 =1+"str2"+"str3";
```

## 细节

如果使用字面量拼接的话，java常量池里是不会保存拼接的参数的，而是直接编译成拼接后的字符串保存，我们看看这段代码：

```java
String str1 = new String("aa"+"bb");
//String str3 = "aa";
String str2 = new StringBuilder("a").append("a").toString();
System.out.println(str2==str2.intern());
```

这段代码的输出是true。

可以得知，在str1变量的创建中，虽然我们用了字面量“aa”，但是我们常量池里并没有aa，所以str2==str.intern()才会返回true。

如果我们去掉str3的注释，重新运行，就会输出false。

# String 转换的差异

## 问题

String.valueOf和Integer.toString的区别

## 源码

jdk 版本

```
java version "1.8.0_191"
Java(TM) SE Runtime Environment (build 1.8.0_191-b12)
Java HotSpot(TM) 64-Bit Server VM (build 25.191-b12, mixed mode)
```

### String 源码

```java
/**
 * Returns the string representation of the <code>int</code> argument.
 * <p>
 * The representation is exactly the one returned by the
 * <code>Integer.toString</code> method of one argument.
 *
 * @param   i   an <code>int</code>.
 * @return  a string representation of the <code>int</code> argument.
 * @see     java.lang.Integer#toString(int, int)
 */
public static String valueOf(int i) {
    return Integer.toString(i);
}


/**
 * Returns the string representation of the <code>Object</code> argument.
 *
 * @param   obj   an <code>Object</code>.
 * @return  if the argument is <code>null</code>, then a string equal to
 *          <code>"null"</code>; otherwise, the value of
 *          <code>obj.toString()</code> is returned.
 * @see     java.lang.Object#toString()
 */
public static String valueOf(Object obj) {
    return (obj == null) ? "null" : obj.toString();
}
```

### Integer 源码

```java
/**
 * Returns a {@code String} object representing this
 * {@code Integer}'s value. The value is converted to signed
 * decimal representation and returned as a string, exactly as if
 * the integer value were given as an argument to the {@link
 * java.lang.Integer#toString(int)} method.
 *
 * @return  a string representation of the value of this object in
 *          base&nbsp;10.
 */
public String toString() {
    return toString(value);
}

/**
 * Returns a {@code String} object representing the
 * specified integer. The argument is converted to signed decimal
 * representation and returned as a string, exactly as if the
 * argument and radix 10 were given as arguments to the {@link
 * #toString(int, int)} method.
 *
 * @param   i   an integer to be converted.
 * @return  a string representation of the argument in base&nbsp;10.
 */
public static String toString(int i) {
    if (i == Integer.MIN_VALUE)
        return "-2147483648";
    int size = (i < 0) ? stringSize(-i) + 1 : stringSize(i);
    char[] buf = new char[size];
    getChars(i, size, buf);
    return new String(buf, true);
}
```

看源码感觉二者并没有太大的区别。

null 值的处理可能值得注意一下。

# 为什么需要 StringBuffer/StringBuilder 

## 为什么需要 StringBuffer?

其实归根到底，就是成也萧何败萧何。

java 在设计的时候将为了提升重用性，将 String 设计为不可变对象，这样才能在常量池中使用。

但是有时候场景就不适合：比如我们循环构建一个字符串，这个时候如果使用 String 的话，性能就会大打折扣。

这个时候很多优点经验的都会提醒你使用 StringBuffer 替换 String。

## StringBuilder

既生瑜，何生亮？

实际上 StringBuffer 在设计之初和 jdk 以前的很多类都是类似的。

```java
@Override
public synchronized StringBuffer append(String str) {
    toStringCache = null;
    super.append(str);
    return this;
}
```

随便选一个方法，会发现上面都加了一个 `synchronized`。

优点：StringBuffer 是多线程安全的。

缺点：对于非多线程的场景，性能会比较差。所以才有了 StringBuilder。

ps: 一般情况，我们使用 StringBuilder 即可。

# string 源码分析

ps: jdk1.8 为例。

## 类定义

```java
public final class String
    implements java.io.Serializable, Comparable<String>, CharSequence {
    /** The value is used for character storage. */
    private final char value[];

    /** Cache the hash code for the string */
    private int hash; // Default to 0

    /** use serialVersionUID from JDK 1.0.2 for interoperability */
    private static final long serialVersionUID = -6849794470754667710L;

    /**
     * Class String is special cased within the Serialization Stream Protocol.
     *
     * A String instance is written into an ObjectOutputStream according to
     * <a href="{@docRoot}/../platform/serialization/spec/output.html">
     * Object Serialization Specification, Section 6.2, "Stream Elements"</a>
     */
    private static final ObjectStreamField[] serialPersistentFields = new ObjectStreamField[0];
```

看的出来，使用的是 char 数组维护的内容。

## 构造器

仔细一看，构造器的类别还是挺多的。

```java
    public String() {
        this.value = "".value;
    }

    public String(String original) {
        this.value = original.value;
        // 计算了哈希
        this.hash = original.hash;
    }

    public String(char value[]) {
        this.value = Arrays.copyOf(value, value.length);
    }

    public String(char value[], int offset, int count) {
        if (offset < 0) {
            throw new StringIndexOutOfBoundsException(offset);
        }
        if (count <= 0) {
            if (count < 0) {
                throw new StringIndexOutOfBoundsException(count);
            }
            if (offset <= value.length) {
                this.value = "".value;
                return;
            }
        }
        // Note: offset or count might be near -1>>>1.
        if (offset > value.length - count) {
            throw new StringIndexOutOfBoundsException(offset + count);
        }
        this.value = Arrays.copyOfRange(value, offset, offset+count);
    }

    public String(int[] codePoints, int offset, int count) {
        if (offset < 0) {
            throw new StringIndexOutOfBoundsException(offset);
        }
        if (count <= 0) {
            if (count < 0) {
                throw new StringIndexOutOfBoundsException(count);
            }
            if (offset <= codePoints.length) {
                this.value = "".value;
                return;
            }
        }
        // Note: offset or count might be near -1>>>1.
        if (offset > codePoints.length - count) {
            throw new StringIndexOutOfBoundsException(offset + count);
        }

        final int end = offset + count;

        // Pass 1: Compute precise size of char[]
        int n = count;
        for (int i = offset; i < end; i++) {
            int c = codePoints[i];
            if (Character.isBmpCodePoint(c))
                continue;
            else if (Character.isValidCodePoint(c))
                n++;
            else throw new IllegalArgumentException(Integer.toString(c));
        }

        // Pass 2: Allocate and fill in char[]
        final char[] v = new char[n];

        for (int i = offset, j = 0; i < end; i++, j++) {
            int c = codePoints[i];
            if (Character.isBmpCodePoint(c))
                v[j] = (char)c;
            else
                Character.toSurrogates(c, v, j++);
        }

        this.value = v;
    }

    @Deprecated
    public String(byte ascii[], int hibyte, int offset, int count) {
        checkBounds(ascii, offset, count);
        char value[] = new char[count];

        if (hibyte == 0) {
            for (int i = count; i-- > 0;) {
                value[i] = (char)(ascii[i + offset] & 0xff);
            }
        } else {
            hibyte <<= 8;
            for (int i = count; i-- > 0;) {
                value[i] = (char)(hibyte | (ascii[i + offset] & 0xff));
            }
        }
        this.value = value;
    }

    @Deprecated
    public String(byte ascii[], int hibyte) {
        this(ascii, hibyte, 0, ascii.length);
    }
```

PS: 看了一下，各种构造器，很多种方法。此处不再赘述。

## 常见方法

### charAt

```java
public char charAt(int index) {
    if ((index < 0) || (index >= value.length)) {
        throw new StringIndexOutOfBoundsException(index);
    }
    return value[index];
}
```

这个方法，会比直接 value[index] 多进行范围的校验。

所以 leetcode 很多解法，都是建议先把 String 转为 char 数组，然后遍历字符。

### equals

```java
public boolean equals(Object anObject) {
    if (this == anObject) {
        return true;
    }
    if (anObject instanceof String) {
        String anotherString = (String)anObject;
        int n = value.length;
        if (n == anotherString.value.length) {
            char v1[] = value;
            char v2[] = anotherString.value;
            int i = 0;
            while (n-- != 0) {
                if (v1[i] != v2[i])
                    return false;
                i++;
            }
            return true;
        }
    }
    return false;
}
```

### hashCode

```java
public int hashCode() {
    int h = hash;
    if (h == 0 && value.length > 0) {
        char val[] = value;
        for (int i = 0; i < value.length; i++) {
            h = 31 * h + val[i];
        }
        hash = h;
    }
    return h;
}
```

# 小结

很多资料都是可能存在谬误的，包括本文。

但是我们力求准确，抱着质疑的心态去学习，大胆质疑，小心求证。

前段时间看到一句话很喜欢，**正是因为质疑的人多了，才有了真理。**

但是也不能陷入怀疑主义，这会令人陷入虚无。（老哲学家了~）

# 参考资料

[长度限制](https://blog.csdn.net/u012099869/article/details/61199442)

[长度限制](https://juejin.im/post/6844903917139001351)

[String：字符串常量池](https://segmentfault.com/a/1190000009888357)

[java基础：String — 字符串常量池与intern(二）](https://juejin.im/post/6844903741032759310)

[Java中的字符串常量池](https://droidyue.com/blog/2014/12/21/string-literal-pool-in-java/)

[new String(“字面量”) 中 “字面量” 是何时进入字符串常量池的?](https://juejin.im/post/6844903741032759310)

[深入解析String#intern](https://tech.meituan.com/2014/03/06/in-depth-understanding-string-intern.html)

[Java 字符串常量池介绍](https://javadoop.com/post/string)

* any list
{:toc}