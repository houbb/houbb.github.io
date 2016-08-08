---
layout: post
title: Design Pattern
date:  2016-7-15 12:22:04 +0800
categories: [Design Pattern]
tags: [design pattern]
published: true
---

* any list
{:toc}

# Design Pattern

> "Each pattern describes a problem which occurs over and over again in our environment, and then describes the core of the solution
to that problem, in such a way that you can use this solution a million times over, without ever doing it the same way twice" [AIS+77].
    —— Christopher Alexander

In general, a pattern has four essential elements:

The **pattern name** is a handle we can use to describe a design problem, its solutions, and consequences in a word or two.

The **problem** describes when to apply the pattern.

The **solution** describes the elements that make up the design, their relationships, responsibilities, and collaborations.

The **consequences** are the results and trade-offs of applying the pattern.

# Singleton

> Intent

Ensure a class only has **one instance**, and provide a global point of *access to it*.

> Motivation

How do we ensure that a class has only one instance and that the instance is easily accessible?

A better solution is to make the class itself responsible for keeping track of its sole instance.
The class can ensure that no other instance can be created (by intercepting requests to create new objects),
and it can provide a way to access the instance. This is the Singleton pattern.

> Applicability

- there must be exactly one instance of a class, and it must be accessible to clients from a well-known access point.

- when the sole instance should be extensible by subclassing, and clients should be able to use an extended instance without modifying their code.

> Structure

![singleton]({{ site.url }}/static/app/img/2016-07-15-singleton.png)

> Consequences

The Singleton pattern has several benefits:

- Controlled access to sole instance.

- Reduced name space.

- Permits refinement of operations and representation.

- Permits a variable number of instances.

- More flexible than class operations.

> Implementation

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

Specify the kinds of objects to create using a prototypical instance, and create new objects by **copying this prototype**.

[zh_CN prototype](http://www.52ij.com/jishu/104.html)

> Applicability

Use the Prototype pattern when a system should be *independent of* how its products are created, composed, and represented; and

- when the classes to instantiate are specified at run-time, for example, by dynamic loading

- to avoid building a class hierarchy of factories that parallels the class hierarchy of products

- when instances of a class can have one of only a few different combinations of state.
It may be more convenient to install a corresponding number of prototypes and clone them rather than instantiating the class manually, each time with the appropriate state.

> Consequences

It hides the concrete product classes from the client, thereby reducing the number of names clients know about.
Moreover, these patterns let a client work with application-specific classes without modification.


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

![shallowCopy]({{site.url}}/static/app/img/2016-07-15-shallowCopy.png)

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

![shallowCopy]({{site.url}}/static/app/img/2016-07-15-deepCopy.png)

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

![simpleFactory]({{site.url}}/static/app/img/2016-07-15-simple-factory.png)


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

![simpleFactory]({{site.url}}/static/app/img/2016-07-15-factory-method.png)

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

Provide an interface for creating families of related or dependent objects without specifying their concrete classes.

> Applicability

- a system should be independent of how its products are created, composed, and represented.

- a system should be configured with one of multiple families of products.

- a family of related product objects is designed to be used together, and you need to enforce this constraint.

- you want to provide a class library of products, and you want to reveal just their interfaces, not their implementations.


> Structure

![abstractFactory]({{site.url}}/static/app/img/2016-07-16-abstract-factory.png)


> Consequences

- It isolates concrete classes.

- It makes exchanging product families easy.

- It promotes consistency among products.

- **Supporting new kinds of products is difficult**.


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







