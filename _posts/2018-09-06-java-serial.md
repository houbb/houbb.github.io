---
layout: post
title:  Serializable
date:  2018-09-06 11:44:07 +0800
categories: [Java]
tags: [java, sf]
published: true
excerpt: Java 序列化相关内容。
---

# 序列化

## 概念

Java平台允许我们在内存中创建可复用的Java对象，但一般情况下，只有当JVM处于运行时，这些对象才可能存在，即，这些对象的生命周期不会比JVM的生命周期更长。

但在现实应用中，就可能要求在JVM停止运行之后能够保存(持久化)指定的对象，并在将来重新读取被保存的对象。Java对象序列化就能够帮助我们实现该功能。

使用Java对象序列化，在保存对象时，会把其状态保存为一组字节，在未来，再将这些字节组装成对象。

必须注意地是，对象序列化保存的是对象的"状态"，即它的成员变量。

由此可知，对象序列化不会关注类中的静态变量。

## 应用场景

- 当你想把的内存中的对象状态保存到一个文件中或者数据库中时候；

- 当你想用套接字在网络上传送对象的时候；

- 当你想通过RMI传输对象的时候；

比如存入数据库、redis，rpc 调用。Http 请求等。

# 简单例子

- User.java

```java
public class User implements Serializable {

    private static final long serialVersionUID = 877904565615808690L;

    private String username;

    private String password;

    //Getter & Setter
    //toString()
}
```

- Main.java

```java
public static void main(String[] args) throws IOException, ClassNotFoundException {
    File file = new File("user.out");
    FileOutputStream fos = new FileOutputStream(file);
    ObjectOutputStream out = new ObjectOutputStream(fos);
    User user = new User();
    user.setUsername("ryo");
    user.setPassword("123456");
    out.writeObject(user);
    out.close();
    // 创建文件
    file.createNewFile();
    FileInputStream fis = new FileInputStream(file);
    ObjectInputStream in = new ObjectInputStream(fis);
    User userRead = (User)in.readObject();
    in.close();
    System.out.println(userRead);
}
```

日志

```
User{username='ryo', password='123456'}
```

`user.out` 存储了对应的内容。

# Serializable

## 作用

为什么一个类实现了 Serializable 接口，它就可以被序列化呢？

`ObjectOutputStream.writeObject0()` 源码如下：

```java
/**
 * Underlying writeObject/writeUnshared implementation.
 */
private void writeObject0(Object obj, boolean unshared)
    throws IOException
{
    //...

    // remaining cases
    if (obj instanceof String) {
        writeString((String) obj, unshared);
    } else if (cl.isArray()) {
        writeArray(obj, desc, unshared);
    } else if (obj instanceof Enum) {
        writeEnum((Enum<?>) obj, desc, unshared);
    } else if (obj instanceof Serializable) {
        writeOrdinaryObject(obj, desc, unshared);
    } else {
        if (extendedDebugInfo) {
            throw new NotSerializableException(
                cl.getName() + "\n" + debugInfoStack.toString());
        } else {
            throw new NotSerializableException(cl.getName());
        }
    }

    //...
}
```

从上述代码可知，如果被写对象的类型是String，或数组，或Enum，或Serializable，那么就可以对该对象进行序列化，否则将抛出NotSerializableException。

## 默认序列化机制

如果仅仅只是让某个类实现Serializable接口，而没有其它任何处理的话，则就是使用默认序列化机制。

使用默认机制，在序列化对象时，不仅会序列化当前对象本身，还会对该对象引用的其它对象也进行序列化，同样地，这些其它对象引用的另外对象也将被序列化，以此类推。

所以，如果一个对象包含的成员变量是容器类对象，而这些容器所含有的元素也是容器类对象，那么这个序列化的过程就会较复杂，开销也较大。

## 基础知识

1、在Java中，只要一个类实现了 `java.io.Serializable` 接口，那么它就可以被序列化。

2、通过 `ObjectOutputStream` 和 `ObjectInputStream` 对对象进行序列化及反序列化。

3、虚拟机是否允许反序列化，不仅取决于类路径和功能代码是否一致，一个非常重要的一点是两个类的序列化 ID 是否一致（就是 `private static final long serialVersionUID`）

4、序列化并不保存静态变量。

5、要想将父类对象也序列化，就需要让父类也实现 Serializable 接口。

6、Transient 关键字的作用是控制变量的序列化，在变量声明前加上该关键字，可以阻止该变量被序列化到文件中，在被反序列化后，transient 变量的值被设为初始值，如 int 型的是 0，对象型的是 null。

7、服务器端给客户端发送序列化对象数据，对象中有一些数据是敏感的，比如密码字符串等，希望对该密码字段在序列化时，进行加密，而客户端如果拥有解密的密钥，只有在客户端进行反序列化时，才可以对密码进行读取，这样可以一定程度保证序列化对象的数据安全。

# Trasient

当某个字段被声明为transient后，默认序列化机制就会忽略该字段。

还是上面的例子，设置 username 为 transient，其他保持不变。

```java
transient private String username;

private String password;
```

日志:

```
User{username='null', password='123456'}
```

## 父类问题

要想将父类对象也序列化，就需要让父类也实现 Serializable 接口。

ps: 如果不想让字段序列化，可以使用 `transient` 关键字。

或者将字段放在父类，且父类不实现 `Serializable` 接口。

# 自定义序列化方法

影响序列化

- transient关键字

- writeObject()方法与readObject()方法

- Externalizable 接口

- readResolve() 方法

## 调用流程

在序列化过程中，虚拟机会试图调用对象类里的 writeObject 和 readObject 方法，进行用户自定义的序列化和反序列化，如果没有这样的方法，则默认调用是 ObjectOutputStream 的 defaultWriteObject 方法以及 ObjectInputStream 的 defaultReadObject 方法。

用户自定义的 writeObject 和 readObject 方法可以允许用户控制序列化的过程，比如可以在序列化的过程中动态改变序列化的数值。

## 脱敏加密

基于这个原理，可以在实际应用中得到使用，用于敏感字段的加密工作，清单 3 展示了这个过程。

- User.java

User 类中添加 2 个方法如下，其他保持不变。

```java
private void writeObject(ObjectOutputStream out) {
    try {
        ObjectOutputStream.PutField putFields = out.putFields();
        System.out.println("原密码:" + password);
        //模拟加密
        password = "encryption";
        putFields.put("password", password);
        System.out.println("加密后的密码" + password);
        out.writeFields();
    } catch (IOException e) {
        e.printStackTrace();
    }
}

private void readObject(ObjectInputStream in) {
    try {
        ObjectInputStream.GetField readFields = in.readFields();
        Object object = readFields.get("password", "");
        System.out.println("要解密的字符串:" + object.toString());
        //模拟解密,需要获得本地的密钥
        password = "pass";
    } catch (IOException | ClassNotFoundException e) {
        e.printStackTrace();
    }
}
```

运行日志：

```
原密码:123456
加密后的密码encryption
要解密的字符串:encryption
User{username='null', password='pass', id='1'}
```

# Externalizable

无论是使用transient关键字，还是使用writeObject()和readObject()方法，其实都是基于Serializable接口的序列化。

JDK中提供了另一个序列化接口--`Externalizable`，使用该接口之后，之前基于Serializable接口的序列化机制就将失效。

- Externalizable.java

```java
public interface Externalizable extends java.io.Serializable {}
```

- ExtUser.java

```java
public class ExtUser implements Externalizable {

    private static final long serialVersionUID = -6486845795910490036L;
    
    private String username;

    private String password;

    @Override
    public void writeExternal(ObjectOutput out) throws IOException {
        out.writeObject(username);
    }

    @Override
    public void readExternal(ObjectInput in) throws IOException, ClassNotFoundException {
        username = (String) in.readObject();
    }

    // Getter & Setter
    // toString()
}
```

- main()

```java
public static void main(String[] args) throws IOException, ClassNotFoundException {
    File file = new File("person.out");
    ObjectOutputStream oout = new ObjectOutputStream(new FileOutputStream(file));
    ExtUser user = new ExtUser();
    user.setUsername("ryo");
    user.setPassword("123456");
    oout.writeObject(user);
    oout.close();
    ObjectInputStream oin = new ObjectInputStream(new FileInputStream(file));
    Object newPerson = oin.readObject();
    oin.close();
    System.out.println(newPerson);
}
```

日志信息

```
ExtUser{username='ryo', password='null'}
```

# readResolve()

## 反序列单例问题

```java
public class SingleUser implements Serializable {

    private static final long serialVersionUID = -1393401178212187059L;

    private static class InstanceHolder {
        private static final SingleUser SINGLE_USER = new SingleUser("John");
    }

    private final String username;

    public SingleUser(String username) {
        this.username = username;
    }

    public static SingleUser getInstance() {
        return InstanceHolder.SINGLE_USER;
    }
}
```

- main()

```java
public static void main(String[] args) throws IOException, ClassNotFoundException {
    File file = new File("user.out");
    ObjectOutputStream oout = new ObjectOutputStream(new FileOutputStream(file));
    SingleUser user = SingleUser.getInstance();
    oout.writeObject(user);
    oout.close();
    ObjectInputStream oin = new ObjectInputStream(new FileInputStream(file));
    Object newUser = oin.readObject();
    oin.close();
    System.out.println(user == newUser);
}
```

输出日志

```
false
```

可是，对于单例而言。我们希望只有一个实例。

## 改进版本

- SingleUser.java

中添加如下代码

```java
private Object readResolve() throws ObjectStreamException {
    return InstanceHolder.SINGLE_USER;
}
```

则可以达到我们的预期

## readResolve

无论是实现Serializable接口，或是Externalizable接口，当从I/O流中读取对象时，readResolve()方法都会被调用到。

实际上就是用readResolve()中返回的对象直接替换在反序列化过程中创建的对象，而被创建的对象则会被垃圾回收掉。

# 序列化存储规则

## 说明

Java 序列化机制为了节省磁盘空间，具有特定的存储规则，当写入文件的为同一对象时，并不会再将对象的内容进行存储，而只是再次存储一份引用；

序列化到同一个文件时，如第二次修改了相同对象属性值再次保存时候，虚拟机根据引用关系知道已经有一个相同对象已经写入文件，因此只保存第二次写的引用，所以读取时，都是第一次保存的对象。

- 优点

该存储规则极大的节省了存储空间。

## 实例

- SerialRuleTest.java

```java
public class SerialRuleTest implements Serializable {

    private static final long serialVersionUID = 6464900554231479673L;

    private final int id;

    public SerialRuleTest(int id) {
        this.id = id;
    }

    public int getId() {
        return id;
    }
}
```

- main()

```java
public static void main(String[] args) throws IOException, ClassNotFoundException {
    ObjectOutputStream out = new ObjectOutputStream(
            new FileOutputStream("result.obj"));
    SerialRuleTest test = new SerialRuleTest(1);
    //试图将对象两次写入文件
    out.writeObject(test);
    out.flush();
    System.out.println(new File("result.obj").length());
    out.writeObject(test);
    out.close();
    System.out.println(new File("result.obj").length());
    ObjectInputStream oin = new ObjectInputStream(new FileInputStream(
            "result.obj"));

    //从文件依次读出两个文件
    SerialRuleTest t1 = (SerialRuleTest) oin.readObject();
    SerialRuleTest t2 = (SerialRuleTest) oin.readObject();
    oin.close();
    //判断两个引用是否指向同一个对象
    System.out.println(t1 == t2);
}
```

日志信息

```
84
89
true
```

- 解释说明

中对同一对象两次写入文件，打印出写入一次对象后的存储大小和写入两次后的存储大小，然后从文件中反序列化出两个对象，比较这两个对象是否为同一对象。

一般的思维是，两次写入对象，文件大小会变为两倍的大小，反序列化时，由于从文件读取，生成了两个对象，判断相等时应该是输入 false 才对。

Java 序列化机制为了节省磁盘空间，具有特定的存储规则，当写入文件的为同一对象时，并不会再将对象的内容进行存储，而只是再次存储一份引用，上面增加的 5 字节的存储空间就是新增引用和一些控制信息的空间。

反序列化时，恢复引用关系，t1 和 t2 指向唯一的对象，二者相等，输出 true。

该存储规则极大的节省了存储空间。

# 为什么序列化不是默认添加

## 其中最大的问题是对象的引用

假如我有两个类，分别是A和B，B类中含有一个指向A类对象的引用，现在我们对两个类进行实例化

```java
A a = new A();
B b = new B();
```

这时在内存中实际上分配了两个空间，一个存储对象a，一个存储对象b，接下来我们想将它们写入到磁盘的一个文件中去，就在写入文件时出现了问题！

因为对象b包含对对象a的引用，所以系统会自动的将a的数据复制一份到b中。

这样的话当我们从文件中恢复对象时（也就是重新加载到内存中）时

内存分配了三个空间，而对象a同时在内存中存在两份。

这样的问题会很多，必须对a进行修改等操作，需要维护每一份的拷贝来达到数据的一致性。

很大程度上浪费空间和影响性能。

## 安全机制

不是默认序列化很重要的一个原因就是为了安全,java的类安全机制是做的很好的.

对于一个你要传输的对象,比如写到文件,或者进行rmi传输等等,在传输的过程中,这个对象的private等域是不受保护的。

## 资源分配

还有就是一些资源分配的问题,比如thread,序列化是很难对他重新分配资源,

所以并非所有的类都可以序列化.

同时添加序列化，会进行一系列的比较操作，可参考序列化机制，也会占资源，所以不需要流传输的就大可不必序列化。

# 序列化的漏洞

如果Java应用对用户输入，即不可信数据做了反序列化处理，那么攻击者可以通过构造恶意输入，让反序列化产生非预期的对象，非预期的对象在产生过程中就有可能带来任意代码执行。

所以这个问题的根源在于类ObjectInputStream在反序列化时，没有对生成的对象的类型做限制；假若反序列化可以设置Java类型的白名单，那么问题的影响就小了很多。

# 序列化 ID 的问题

## 作用

简单来说，Java的序列化机制是通过判断类的serialVersionUID来验证版本一致性的。

在进行反序列化时，JVM会把传来的字节流中的serialVersionUID与本地相应实体类的serialVersionUID进行比较，
如果相同就认为是一致的，可以进行反序列化，否则就会出现序列化版本不一致的异常，即是InvalidCastException。

**虚拟机是否允许反序列化，不仅取决于类路径和功能代码是否一致，一个非常重要的一点是两个类的序列化 ID 是否一致。**

## 最佳实践

1. 为每一个序列化对象，添加 `serialVersionUID`。避免每次生成消耗性能。

2. 保证同一个对象的 `serialVersionUID` 的一致性，否则反序列化会失败。

ps: 第一条《Thinking in Java》 有提到过。

## 1L 还是随机？

序列化 ID 在 Eclipse/Idea 下提供了两种生成策略，一个是固定的 1L，一个是随机生成一个不重复的 long 类型数据（实际上是使用 JDK 工具生成）。

在这里有一个建议，如果没有特殊需求，就是用默认的 1L 就可以，这样可以确保代码一致时反序列化成功。

那么随机生成的序列化 ID 有什么作用呢，有些时候，通过改变序列化 ID 可以用来限制某些用户的使用。

## 应用

比如 Facade 模式中，外部系统调用我们的序列化实例。

当对象出现更新时，我们更新 `serialVersionUID` 的值，让其必须也随之强制更新，否则直接报错。

# 参考资料

http://www.blogjava.net/jiangshachina/archive/2012/02/13/369898.html

- 序列化与反序列化

http://www.importnew.com/24490.html

http://www.importnew.com/24490.html

[java序列化和序列化ID的作用](https://www.jianshu.com/p/321603426a81)

- serialVersionUID

https://www.jianshu.com/p/5a85011de960

https://blog.csdn.net/qq_27093465/article/details/78544505


* any list
{:toc}