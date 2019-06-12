---
layout: post
title:  Serializable ID-02-序列化标识
date:  2018-09-06 11:44:07 +0800
categories: [Java]
tags: [java, serial, id, sf]
published: true
---

# Serializable ID 作用

简单来说，Java的序列化机制是通过在运行时判断类的serialVersionUID来验证版本一致性的。

在进行反序列化时，JVM会把传来的字节流中的serialVersionUID与本地相应实体（类）的serialVersionUID进行比较，如果相同就认为是一致的，可以进行反序列化，否则就会出现序列化版本不一致的异常。 

# 不写的弊端

当实现 `java.io.Serializable` 接口的实体（类）没有显式地定义一个名为serialVersionUID，类型为long的变量时，Java序列化机制会根据编译的class自动生成一个serialVersionUID作序列化版本比较用，这种情况下，只有同一次编译生成的class才会生成相同的serialVersionUID 。 

如果我们不希望通过编译来强制划分软件版本，即实现序列化接口的实体能够兼容先前版本，未作更改的类，就需要显式地定义一个名为serialVersionUID，类型为long的变量，不修改这个变量值的序列化实体都可以相互进行串行化和反串行化。 

## 不同 JVM 的坑

如果没有声明serialVersionUID，JVM将使用自己的算法生成默认的SerialVersionUID，您可以在此处检查 [算法](http://docs.oracle.com/javase/6/docs/platform/serialization/spec/class.html#4100)。

默认的serialVersionUID计算对类详细信息非常敏感，可能因不同的JVM实现而异，并且在反序列化过程中会导致意外的InvalidClassExceptions。

## 客户端/服务器环境

- 客户端在Windows中使用SUN的JVM。

- 服务器在Linux中使用JRockit。

客户端通过套接字向服务器发送带有默认生成的serialVersionUID（例如123L）的可序列化类，服务器可以在反序列化过程中生成不同的serialVersionUID（例如124L），并引发意外的InvalidClassExceptions。

## 文件/数据库环境

-  App＃1在Windows中使用SUN的JVM。

-  App＃2在Linux中使用JRockit。

序列化允许保存到文件或数据库中。 

App＃1默认生成serialVersionUID（例如123L）将可序列化类存储到数据库中，而App＃2可能在反序列化过程中生成不同的serialVersionUID（例如124L），并引发意外的InvalidClassExceptions。

您可以在此处查看 [JVM 实现的列表](http://en.wikipedia.org/wiki/List_of_JVM_implementations)。

# 常见生成方式

## 手动写死

以前常见的，指定写死为 1

```java
private static final long serialVersionUID = 1L;
```

## IDE 生成

## 借助 JDK 内置的方法生成

```
$   serialver ${类名}
```

程序serialver可用于查明类是否可序列化并获取其serialVersionUID。 

当使用 `-show` 选项调用时，它会建立一个简单的用户界面。 

要查明某个类是否可序列化并找到其serialVersionUID，请输入其完整的类名，然后按Enter或Show按钮。

 打印的字符串可以复制并粘贴到演化的类中。

# 最佳实践

## 暴露的序列化对象

一定要显示指定一个序列号。

这样可以向前兼容。

也可以反过来用，如果想让没升级的服务全部不可用，就直接修改序列编号。

## 1L 还是随机

如果没有特殊需求，建议使用 1L，可以保证反序列化的成功。

如果想限制某些用户的使用，则可以使用随机的序列号。

# 个人收获

## 知识在于最常见的地方

很多东西我们都以为熟知了，然而熟悉的地方，恰恰使我们可以学习提升的地方。

只是我们经常对知识视而不见，缺少刨根问底的精神。

# 序列化实战

## 代码测试

### 测试类

```java
public class TestSerial implements Serializable {

    public byte version = 100;

    public byte count = 0;
}
```

### 生成序列化文件

```java
FileOutputStream fos = new FileOutputStream("temp.out");
ObjectOutputStream oos = new ObjectOutputStream(fos);
TestSerial ts = new TestSerial();
oos.writeObject(ts);
oos.flush();
oos.close();
```

### 读取序列化文件

```java
FileInputStream fis = new FileInputStream("temp.out");
ObjectInputStream oin = new ObjectInputStream(fis);
TestSerial ts = (TestSerial) oin.readObject();
System.out.println("version="+ts.version);
```

结果为 100

## 文件内容

我们看一下生成的文件。

- Hex 编码

```
ACED200573722022636F6D2E72796F2E
6A646B2E6A646B372E73657269616C2E
5465737453657269616C294ED17C81F5
A7D6022002422005636F756E74422007
76657273696F6E78702064
```

这些字节就是用来描述序列话以后的TestSerial对象的，我们注意到TestSerial类中只有两个域：

```
public byte version = 100;
public byte count = 0;
```

且都是byte型，理论上存储这两个域只需要2个byte，但是实际上temp.out占据空间为51

bytes，也就是说除了数据以外，还包括了对序列化对象的其他描述

当在命令行上使用一个或多个类名调用时，serialver以适合复制到不断发展的类的形式为每个类打印serialVersionUID。 

在没有参数的情况下调用时，它会打印一个使用行。

# 流唯一标识符

每个版本化的类必须标识它能够编写流并且可以从中读取的原始类版本。 

例如，版本化类必须声明：

```java
private static final long serialVersionUID = 3487495895819393L;
```

## 标识概念

流唯一标识符是类名，接口类名，方法和字段的64位散列。 

必须在除第一个类之外的所有类的版本中声明该值。

它可以在原始类中声明，但不是必需的。 
 
所有兼容类的值都是固定的。 
 
如果没有为类声明SUID，则该值默认为该类的哈希值。 
 
动态代理类和枚举类型的serialVersionUID始终具有值0L。 
 
数组类不能声明显式的 serialVersionUID，因此它们始终具有默认的计算值，但是对于数组类，不需要匹配serialVersionUID值。

> 强烈建议所有可序列化类显式声明serialVersionUID值，因为默认的serialVersionUID计算对类细节高度敏感，这些细节可能因编译器实现而异，因此在反序列化期间可能导致意外的serialVersionUID冲突，从而导致反序列化失败。

Externalizable类的初始版本必须输出将来可扩展的流数据格式。 

方法readExternal的初始版本必须能够读取writeExternal方法的所有未来版本的输出格式。

## 算法

serialVersionUID使用反映类定义的字节流的签名计算。

美国国家标准与技术研究院（NIST）安全散列算法（SHA-1）用于计算流的签名。

前两个32位数量用于形成64位散列。

java.lang.DataOutputStream用于将原始数据类型转换为字节序列。

输入到流的值由类的JavaTM虚拟机（VM）规范定义。

类修饰符可以包括ACC_PUBLIC，ACC_FINAL，ACC_INTERFACE和ACC_ABSTRACT标志;

其他标志被忽略，不会影响serialVersionUID计算。

同样，对于字段修饰符，在计算serialVersionUID值时仅使用ACC_PUBLIC，ACC_PRIVATE，ACC_PROTECTED，ACC_STATIC，ACC_FINAL，ACC_VOLATILE和ACC_TRANSIENT标志。

对于构造函数和方法修饰符，仅使用ACC_PUBLIC，ACC_PRIVATE，ACC_PROTECTED，ACC_STATIC，ACC_FINAL，ACC_SYNCHRONIZED，ACC_NATIVE，ACC_ABSTRACT和ACC_STRICT标志。

名称和描述符以java.io.DataOutputStream.writeUTF方法使用的格式编写。

### 核心步骤

流中的项目序列如下：

1、 The class name.

2、 The class modifiers written as a 32-bit integer.

3、 The name of each interface sorted by name.

4、For each field of the class sorted by field name (except private static and private transient fields:

4.1 The name of the field.

4.2 The modifiers of the field written as a 32-bit integer.

4.3 The descriptor of the field.

5、If a class initializer exists, write out the following:

5.2 The name of the method, `<clinit>`.

5.2 The modifier of the method, java.lang.reflect.Modifier.STATIC, written as a 32-bit integer.
The descriptor of the method, `()V`.

6、 For each non-private constructor sorted by method name and signature:

6.1 The name of the method, `<init>`.

6.2 The modifiers of the method written as a 32-bit integer.

6.3 The descriptor of the method.

7、For each non-private method sorted by method name and signature:

7.1 The name of the method.

7.2 The modifiers of the method written as a 32-bit integer.

7.3 The descriptor of the method.

8、The SHA-1 algorithm is executed on the stream of bytes produced by DataOutputStream and produces five 32-bit values `sha[0..4]`.

9、The hash value is assembled from the first and second 32-bit values of the SHA-1 message digest. If the result of the message digest, the five 32-bit words H0 H1 H2 H3 H4, is in an array of five int values named sha, the hash value would be computed as follows:

```java
long hash = ((sha[0] >>> 24) & 0xFF) |
	      ((sha[0] >>> 16) & 0xFF) << 8 |
	      ((sha[0] >>> 8) & 0xFF) << 16 |
	      ((sha[0] >>> 0) & 0xFF) << 24 |
	      ((sha[1] >>> 24) & 0xFF) << 32 |
	      ((sha[1] >>> 16) & 0xFF) << 40 |
	      ((sha[1] >>> 8) & 0xFF) << 48 |
	      ((sha[1] >>> 0) & 0xFF) << 56;
```


# 拓展阅读

[分布式 ID 生成](https://houbb.github.io/2018/09/05/distributed-id)

# 参考资料

[Java 序列化算法](https://www.cnblogs.com/zl1991/p/6322361.html)

[java序列化和序列化ID的作用](https://www.jianshu.com/p/321603426a81)

[java序列化声明一个显式的UID](https://wu-yansheng.iteye.com/blog/909626)

[understand-the-serialversionuid](https://www.mkyong.com/java-best-practices/understand-the-serialversionuid/)

[UUID 算法](https://docs.oracle.com/javase/6/docs/platform/serialization/spec/class.html#4100)

[how-to-generate-serialversionuid](https://www.mkyong.com/java/how-to-generate-serialversionuid/)

## Notepad++

https://blog.csdn.net/hong10086/article/details/76423268

* any list
{:toc}