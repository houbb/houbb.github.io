---
layout: post
title: 轻松学习多线程 06-Immutable 不可变模式
date:  2019-1-19 11:21:15 +0800
categories: [Thread]
tags: [thread, java, sh]
published: true
---

# Immutable

想破坏也破坏不了。

Immutable 可以确保实例状态不发生改变，访问这类实例时**不需要执行耗时的互斥处理**，可以提升性能。

# 实际案例

## 定义

- Person.java

不可变对象类

```java
/**
 * 不可变类
 *
 * @author bbhou
 * @version 1.0.0
 * @since 1.0.0
 */
public final class Person {

    private final String name;

    private final String address;

    public Person(String name, String address) {
        this.name = name;
        this.address = address;
    }

    public String getName() {
        return name;
    }

    public String getAddress() {
        return address;
    }

    @Override
    public String toString() {
        return "Person{" +
                "name='" + name + '\'' +
                ", address='" + address + '\'' +
                '}';
    }

}
```

- PrintPersonThread.java

线程类

```java
public class PrintPersonThread extends Thread {

    private Person person;

    public PrintPersonThread(Person person) {
        this.person = person;
    }

    @Override
    public void run() {
        int limit = 100;
        for(int i = 0; i< limit; i++) {
            System.out.println(Thread.currentThread().getName()+":  " + person);
        }
    }

}
```

## 测试

- 运行

```java
public class Main {

    public static void main(String[] args) {
        Person person = new Person("as", "asdf");
        new PrintPersonThread(person).start();
        new PrintPersonThread(person).start();
        new PrintPersonThread(person).start();
    }

}
```

- 测试结果


```
...
Thread-1:  Person{name='as', address='asdf'}
Thread-2:  Person{name='as', address='asdf'}
Thread-2:  Person{name='as', address='asdf'}
Thread-2:  Person{name='as', address='asdf'}
Thread-2:  Person{name='as', address='asdf'}
Thread-2:  Person{name='as', address='asdf'}
Thread-2:  Person{name='as', address='asdf'}
Thread-2:  Person{name='as', address='asdf'}
Thread-2:  Person{name='as', address='asdf'}
Thread-2:  Person{name='as', address='asdf'}
Thread-2:  Person{name='as', address='asdf'}
Thread-2:  Person{name='as', address='asdf'}
Thread-2:  Person{name='as', address='asdf'}
Thread-0:  Person{name='as', address='asdf'}
Thread-2:  Person{name='as', address='asdf'}
Thread-0:  Person{name='as', address='asdf'}
Thread-2:  Person{name='as', address='asdf'}
Thread-0:  Person{name='as', address='asdf'}
Thread-0:  Person{name='as', address='asdf'}
Thread-0:  Person{name='as', address='asdf'}
Thread-0:  Person{name='as', address='asdf'}
Thread-2:  Person{name='as', address='asdf'}
Thread-0:  Person{name='as', address='asdf'}
Thread-2:  Person{name='as', address='asdf'}
Thread-0:  Person{name='as', address='asdf'}
Thread-0:  Person{name='as', address='asdf'}
Thread-0:  Person{name='as', address='asdf'}
...
```

# 实现方式

- 确保类不会被覆写
（1）一般是用 **final** 修饰不可变类
（2）或者使用静态工厂创建方法，确保构造函数私有的

- 字段不可变
所有的字段必须是私有的，并且加上修饰符 **final**

- 不提供改变对象的方法
此处不单单指 setter，所有修改状态的方法都要避免

- 如果存在可变字段
则必须进行保守型复制，且只能由该类自身进行修改

# 适用场景

- 实例创建后，状态不再发生变化

- 实例是被共享的，且频繁被访问

# UML & Code

- UML

![UML关系](https://imgconvert.csdnimg.cn/aHR0cDovL2ltZy5ibG9nLmNzZG4ubmV0LzIwMTgwMzAxMTcwMTA3MjY2?x-oss-process=image/format,png)

- 代码地址

> [immutable](https://github.com/houbb/thread-learn/tree/master/easy-learn/src/main/java/com/github/houbb/thread/learn/easy/learn/immutable)

# 系列导航

> [多线程系列导航](http://blog.csdn.net/ryo1060732496/article/details/79376415)

* any list
{:toc}