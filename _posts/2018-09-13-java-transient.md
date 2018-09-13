---
layout: post
title: Java Transient
date:  2018-09-13 11:19:18 +0800
categories: [Java]
tags: [java, key-word, sf]
published: true
excerpt: java 关键字 transient
---

# Transient

## 概念

Java对象序列化是 JDK 1.1 中引入的一组开创性特性之一，用于作为一种将Java对象的状态转换为字节数组，以便存储或传输的机制，以后，仍可以将字节数组转换回 Java 对象原有的状态。

我们都知道一个对象只要实现了Serilizable接口,这个对象就可以被序列化,java的这种序列化模式为开发者提供了很多便利，我们可以不必关系具体序列化的过程，只要这个类实现了Serilizable接口,这个类的所有属性和方法都会自动序列化。

然而在实际开发过程中，我们可能会遇到这样的问题，这个类的某些属性需要序列化，而其他属性不需要被序列化，比如一些敏感信息(如密码)，为了安全起见，不希望在网络操作中被传输，这些信息对应的变量就可以加上 transient 关键字。

ps: 或者一些没有必要持久化的属性，或者特别大的属性，都可以考虑添加 `transient`。

参见：[java Serializable 接口](#Serializable)

## 特性

1）一旦变量被transient修饰，变量将不再是对象持久化的一部分，该变量内容在序列化后无法获得访问。

2）transient关键字只能修饰变量，而不能修饰方法和类。注意，本地变量是不能被transient关键字修饰的。变量如果是用户自定义类变量，则该类需要实现Serializable接口。

3）被transient关键字修饰的变量不再能被序列化，一个静态变量不管是否被transient修饰，均不能被序列化。

# 实例

## 代码

- User.java

```java
public class User implements Serializable {

    private static final long serialVersionUID = 8847076198927159179L;

    private String username;

    // transient修饰的变量不再被序列化
    private transient String password;

    // 一个静态变量不管是否被transient修饰，均不能被序列化
    private static transient String address;

    public User(String username, String password, String address) {
        this.username = username;
        this.password = password;
        User.address = address;
    }

    //Getter Setter 
    //toString()
}
```

### 常规测试

- commonTest

普通的测试

```java
@org.junit.jupiter.api.Test
public void commonTest(){
    User person = new User("ryo", "24", "beijing");
    try {
        // 将对象写入文件
        ObjectOutputStream os = new ObjectOutputStream(new FileOutputStream("test.txt"));
        os.writeObject(person);
        os.flush();
        os.close();
        // 读取对象文件
        ObjectInputStream ins = new ObjectInputStream(new FileInputStream("test.txt"));
        User per = (User) ins.readObject();
        System.out.println(per);
    } catch (IOException | ClassNotFoundException e) {
        e.printStackTrace();
    }
}
```

日志信息：

```
User{username='ryo', password='null', address='beijing'}
```

我们发现 password 确实没有被序列化，但是 address 是怎么回事？

实际上是这样的：

第三点确实没错（一个静态变量不管是否被transient修饰，均不能被序列化），反序列化后类中static型变量username的值为当前JVM中对应static变量的值，这个值是JVM中的不是反序列化得出的，不相信？

好吧，下面我来证明：

### jvm 的验证测试

- jvmTest

```java
@org.junit.jupiter.api.Test
public void jvmTest() {
    User person = new User("ryo", "24", "beijing");
    try {
        // 将对象写入文件
        ObjectOutputStream os = new ObjectOutputStream(new FileOutputStream("test.txt"));
        os.writeObject(person);
        os.flush();
        os.close();

        // 读取对象文件
        // 反序列之前设置 address 的值
        User.setAddress("shanghai");
        ObjectInputStream ins = new ObjectInputStream(new FileInputStream("test.txt"));
        User per = (User) ins.readObject();
        System.out.println(per);
    } catch (IOException | ClassNotFoundException e) {
        e.printStackTrace();
    }
}
```

日志结果如下：

```
User{username='ryo', password='null', address='shanghai'}
```

如果 address 被序列化了，结果应该还是 'beijing' 才对。

## 思考题

一个字段被声明为 `transient` 就真的不能被序列化了吗？

这个参见 [Serializable](#Serializable) 里面，和序列化相关的，我们可以通过自定义 `Externalizable` 对其进行操作。

我们知道在Java中，对象的序列化可以通过实现两种接口来实现，若实现的是Serializable接口，则所有的序列化将会自动进行，若实现的是Externalizable接口，则没有任何东西可以自动序列化，需要在writeExternal方法中进行手工指定所要序列化的变量，这与是否被transient修饰无关。

但是不建议这么做。

# 拓展阅读

## Serializable

[java Serializable 接口](https://houbb.github.io/2018/09/06/java-serial)

# 参考资料

https://www.jianshu.com/p/3ad7731ead76

http://www.cnblogs.com/lanxuezaipiao/p/3369962.html

http://www.importnew.com/12611.html

* any list
{:toc}