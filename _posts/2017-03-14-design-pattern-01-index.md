---
layout: post
title: Design Pattern 01-入门案例 单例+工厂+抽象工厂
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# Design Pattern

> "Each pattern describes a problem which occurs over and over again in our environment, and then describes the core of the solution
to that problem, in such a way that you can use this solution a million times over, without ever doing it the same way twice" [AIS+77].
    —— Christopher Alexander

一般来说，模式有四个基本要素：

**模式名称** 是一个句柄，我们可以用一两个词来描述设计问题、它的解决方案和后果。

**问题** 描述了何时应用模式。

**解决方案** 描述了构成设计的元素、它们之间的关系、职责和协作。

**后果** 是应用该模式的结果和权衡。

# Singleton

> 意图

确保一个类只有**一个实例**，并提供一个全局*访问点*。

> 动机

我们如何确保一个类只有一个实例并且该实例易于访问？

更好的解决方案是让类本身负责跟踪它的唯一实例。
该类可以确保不能创建其他实例（通过拦截创建新对象的请求），
它可以提供一种访问实例的方法。 这就是单例模式。

> 适用性

- 一个类必须只有一个实例，并且客户端必须可以从众所周知的访问点访问它。

- 当唯一实例应该可以通过子类化进行扩展时，客户应该能够在不修改代码的情况下使用扩展实例。

> 结构

![单例](https://raw.githubusercontent.com/houbb/resource/master/img/2016-07-15-singleton.png)

> 后果

单例模式有几个好处：

- 对唯一实例的控制访问。

- 减少名称空间。

- 允许改进操作和表示。

- 允许可变数量的实例。

- 比类操作更灵活。

> 实现

[singleton zh_CN](http://cantellow.iteye.com/blog/838473)
[singleton2 zh_CN](http://blog.csdn.net/jason0539/article/details/23297037/)

## lazy loading

- thread not safe

```java
package com.ryo.singleton;

/**
 * Created by 侯彬彬 on 2016/7/15.
 */
public class Lazy {
    private Lazy(){}

    private static Lazy lazy = null;

    public static Lazy instance() {
        if(lazy == null) {
            lazy = new Lazy();
        }

        return lazy;
    }
}
```

- thread safe

It's pity this way is inefficiency.

```java
public class LazyThreadSafe {
    private LazyThreadSafe(){}

    private static LazyThreadSafe lazy = null;

    public static synchronized LazyThreadSafe instance() {
        if(lazy == null) {
            lazy = new LazyThreadSafe();
        }

        return lazy;
    }
}
```

Best practice: a good way to solve it. (Lazy loading and thread safe)

```java
package com.ryo.singleton;

public class Singleton {
    private Singleton(){}

    private static class SingletonHolder {
        private static final Singleton INSTANCE = new Singleton();
    }

    public static  Singleton instance() {
       return SingletonHolder.INSTANCE;
    }
}
```

## starve

Thread safe, not lazy loading. Usually, we can use this...

```java
package com.ryo.singleton;

public class Starve {
    private Starve(){}
    private static Starve starve = new Starve();

    public static Starve instance() {
        return starve;
    }
}
```

## enum

The best way to realize singleton is to use **enum**

> [enum](http://837062099.iteye.com/blog/1454934)


# Prototype

使用原型实例指定要创建的对象种类，并通过**复制此原型**来创建新对象。

[zh_CN原型](http://www.52ij.com/jishu/104.html)

> 适用性

当系统应该*独立于*其产品的创建、组合和表示方式时，使用原型模式； 和

- 当要实例化的类在运行时指定时，例如，通过动态加载

- 避免构建与产品类层次结构平行的工厂类层次结构

- 当一个类的实例可以具有仅有的几种不同状态组合中的一种时。

安装相应数量的原型并克隆它们可能更方便，而不是每次都使用适当的状态手动实例化类。

> 后果

它向客户端隐藏了具体的产品类别，从而减少了客户端知道的名称数量。

此外，这些模式让客户端无需修改即可使用特定于应用程序的类。

> Implementation

- Prototype.java

```java
package com.ryo.prototype;

/**
 * Created by 侯彬彬 on 2016/7/15.
 */
public class Prototype implements Cloneable {
    private String name;

    public Prototype(String name) {
        this.name = name;
    }

    @Override
    protected Object clone() throws CloneNotSupportedException {
        return super.clone();
    }

    @Override
    public String toString() {
        return "Prototype{" +
                "name='" + name + '\'' +
                '}';
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

- PrototypeTest.java

```java
public class PrototypeTest extends TestCase {
    @Test
    public void testClone() throws Exception {
        Prototype prototype = new Prototype("ryo");
        final String json = "Prototype{name='ryo'}";

        assertEquals(json, prototype.toString());

        Prototype clone = (Prototype) prototype.clone();
        assertEquals(json, clone.toString());
    }
}
```

## shallow copy

![shallowCopy](https://raw.githubusercontent.com/houbb/resource/master/img/2016-07-15-shallowCopy.png)

Java object's ```clone()``` is shallow copy. See the flowing demo.

- Person.java

```java
public class Person {
    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public String toString() {
        return "Person{" +
                "name='" + name + '\'' +
                ", age=" + age +
                '}';
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

- Prototype.java

```java
public class Prototype implements Cloneable {
    private Person person;

    public Prototype(Person person) {
        this.person = person;
    }

    public Person getPerson() {
        return person;
    }

    @Override
    protected Object clone() throws CloneNotSupportedException {
        return super.clone();
    }

    @Override
    public String toString() {
        return "Prototype{" +
                "person=" + person +
                '}';
    }
}
```

- test

```java
public class PrototypeTest extends TestCase {
    @Test
    public void testClone() throws Exception {
        Person person = new Person("ryo", 23);
        Prototype prototype = new Prototype(person);

        Prototype clone = (Prototype) prototype.clone();
        Person person1 = clone.getPerson();
        person1.setName("jack");

        assertEquals("Prototype{person=Person{name='jack', age=23}}", prototype.toString());
    }
}
```

## deep copy

![shallowCopy](https://raw.githubusercontent.com/houbb/resource/master/img/2016-07-15-deepCopy.png)

- add ```Serializable``` for Person

```java
public class Person implements Serializable {
    //...
}
```

- DeepCopy.java

```java
package com.ryo.prototype;

import java.io.*;

/**
 * Created by 侯彬彬 on 2016/7/15.
 */
public class DeepCopy implements Cloneable, Serializable {
    private Person person;

    public DeepCopy(Person person) {
        this.person = person;
    }

    public Person getPerson() {
        return person;
    }

    @Override
    public String toString() {
        return "DeepCopy{" +
                "person=" + person +
                '}';
    }

    public Object deepClone() {
        ByteArrayOutputStream bo = new ByteArrayOutputStream();
        Object object = null;
        try {
            ObjectOutputStream oo = new ObjectOutputStream(bo);
            oo.writeObject(this);
            ByteArrayInputStream bi = new ByteArrayInputStream(bo.toByteArray());
            ObjectInputStream oi = new ObjectInputStream(bi);
            object = oi.readObject();
        } catch (ClassNotFoundException | IOException e) {
            e.printStackTrace();
        }

        return object;
    }
}
```

- DeepCopyTest.java

```java
public class DeepCopyTest extends TestCase {

    @Test
    public void testDeepClone() throws Exception {
        Person person = new Person("ryo", 23);
        DeepCopy deepCopy = new DeepCopy(person);

        DeepCopy clone = (DeepCopy) deepCopy.deepClone();
        Person person1 = clone.getPerson();
        person1.setName("jack");

        assertEquals("DeepCopy{person=Person{name='jack', age=23}}", clone.toString());
        assertEquals("DeepCopy{person=Person{name='ryo', age=23}}", deepCopy.toString());
    }
}
```

# Factory

## simple factory

![simpleFactory](https://raw.githubusercontent.com/houbb/resource/master/img/2016-07-15-simple-factory.png)


- interface

```java
public interface Car {
    String info();
}
```

- class1

```java
public class BaomaCar implements Car {
    public static final String BAO_MA = "Baoma";

    @Override
    public String info() {
        return BAO_MA;
    }
}
```

- class2

```java
public class AodiCar implements Car {
    public static final String AO_DI = "Ao di";

    @Override
    public String info() {
        return AO_DI;
    }
}
```

- factory

```java
public class SimpleFactory {
    private SimpleFactory(){}

    public static Car factory(String type) {
        Car car = null;

        if (type.equals(BaomaCar.BAO_MA)) {
            car = new BaomaCar();
        } else if (type.equals(AodiCar.AO_DI)) {
            car = new AodiCar();
        }

        return car;
    }
}
```

- test

```java
@Test
public void testFactory() {
    Car car = SimpleFactory.factory(BaomaCar.BAO_MA);
    assertEquals(BaomaCar.BAO_MA, car.info());

    Car car1 = SimpleFactory.factory(AodiCar.AO_DI);
    assertEquals(AodiCar.AO_DI, car1.info());
}
```

## factory method

![simpleFactory](https://raw.githubusercontent.com/houbb/resource/master/img/2016-07-15-factory-method.png)

- Interface

```java
public interface Movable {
    void run();
}
```

- class1

```java
public class AirMovable implements Movable {
    @Override
    public void run() {
        System.out.println("air running...");
    }
}
```

- class2

```java
public class SeaMovable implements Movable {
    @Override
    public void run() {
        System.out.println("Sea running...");
    }
}
```

- InterfaceFactory

```java
public abstract class AbstractMoveFactory {
    abstract Movable getInstance();
}
```

- class1Factory

```java
public class SeaMoveFactory extends AbstractMoveFactory {
    @Override
    Movable getInstance() {
        return new SeaMovable();
    }
}
```

- class2Factory

```java
public class AirMoveFactory extends AbstractMoveFactory {
    @Override
    Movable getInstance() {
        return new AirMovable();
    }
}
```

- test

```java
public class FactoryMethodTest extends TestCase {
    @Test
    public void testGetInstance() {
        AbstractMoveFactory abstractMoveFactory = new AirMoveFactory();
        Movable movable = abstractMoveFactory.getInstance();
        movable.run();
    }

    @Test
    public void testGetInstance2() {
        AbstractMoveFactory abstractMoveFactory = new SeaMoveFactory();
        Movable movable = abstractMoveFactory.getInstance();
        movable.run();
    }
}
```

- result

```
Sea running...
air running...

Process finished with exit code 0
```

## abstract factory

> Intent

提供一个接口，用于创建相关或依赖对象的系列，而无需指定它们的具体类。

> 适用性

- 系统应该独立于其产品的创建、组合和表示方式。

- 系统应配置多个产品系列之一。

- 一系列相关的产品对象旨在一起使用，您需要强制执行此约束。

- 你想提供一个产品的类库，你只想展示它们的接口，而不是它们的实现。

> Structure

![abstractFactory](https://raw.githubusercontent.com/houbb/resource/master/img/2016-07-16-abstract-factory.png)


> Consequences

- 它隔离具体类。

- 它使产品系列的交换变得容易。

- 它促进了产品之间的一致性。

- **支持新产品很困难**。

> Implementation

- AbstractFactory.java

```java
public abstract class AbstractFactory {
    public abstract Vehicle createVehicle();
    public abstract Fruit createFruit();
}
```

- DefaultFactory.java

```java
public class DefaultFactory extends AbstractFactory {
    @Override
    public Vehicle createVehicle() {
        return new Boat();
    }

    @Override
    public Fruit createFruit() {
        return new Apple();
    }
}
```

- Vehicle and Boat

```java
public interface Vehicle {
    void info();
}

public class Boat implements Vehicle {
    @Override
    public void info() {
        System.out.println("Vehicle boat...");
    }
}
```

- Fruit & Apple

```java
public interface Fruit {
    void info();
}

public class Apple implements Fruit {
    @Override
    public void info() {
        System.out.println("Fruit Apple...");
    }
}
```

- test

```java
public class AbstractFactoryTest extends TestCase {
    @Test
    public void testCreateVehicle() throws Exception {
        DefaultFactory defaultFactory = new DefaultFactory();
        Vehicle vehicle = defaultFactory.createVehicle();
        vehicle.info();
    }


    @Test
    public void testCreateFruit() throws Exception {
        DefaultFactory defaultFactory = new DefaultFactory();
        Fruit fruit = defaultFactory.createFruit();
        fruit.info();
    }
}
```

- result

```java
Fruit Apple...
Vehicle boat...

Process finished with exit code 0
```

* any list
{:toc}