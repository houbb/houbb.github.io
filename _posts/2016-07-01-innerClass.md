---
layout: post
title: Inner Class
date:  2016-7-1 14:13:31 +0800
categories: [Java]
tags: [inner class]
published: false
---

* any list
{:toc}

# Member Inner Class

It may looks like this.

```java
public class MemberInner {
    private String name = "outer";
    private int value = 10;

    public void outInfo() {
    }

    public class Inner {
        private String name = "inner";
        private int count = 5;

        public void innerInfo() {
        }
    }
}
```

## out -> inner

MemberInner visit Inner.member & Inner.method. By create instance of inner class.

```java
public void outInfo() {
    Inner inner = new Inner();
    System.out.println(inner.count);
}
```

- test

```java
@Test
public void testOutInfo() {
    MemberInner memberInner = new MemberInner();
    memberInner.outInfo();
}
```

- result

```
5

Process finished with exit code 0
```

## inner -> outer

Inner class can directly visit outer class's members and methods. If inner has the same name with outer, use ```Outer.this.member```

```java
public void innerInfo() {
    System.out.println(name);   
    System.out.println(value); 
    System.out.println(MemberInner.this.name);   
}
```

- test

use ```(new Outerclass()).new Innerclass();``` to create inner class.

```java
@Test
public void testInnerInfo() {
    MemberInner.Inner inner = new MemberInner().new Inner();
    inner.innerInfo();
}
```

- result

```
inner
10
outer

Process finished with exit code 0
```

# Static Inner Class

It may look like this

```java
public class StaticInner {
    private String name;
    private static int value = 10;

    public static class Inner {
        public void info() {
        }
    }
}
```

## inner -> outer

Because inner class is a ```static``` class, so the inner class can only visit **static member** & **static method**

```java
public void info() {
    System.out.println(value);
}`
```

# Local Inner Class

- In the method of out class, just like other local var, no ```private```, ```public```, ```protected```.

- Can only visit ```final``` var jdk1.7 and before.

It may like this: 

```java
public class LocalInner {
    public void localInfo() {
        String name = "local";
        final int value = 10;

        class Inner {
            public void innerInfo() {
                System.out.println(value);
            }
        }
    }
}
```


# Anonymous Inner Class

- It's just an inner class without name.

- Without name, so can use only once

- It must extends superClass or implements an interface

## common way

- Person.java

```java
public abstract class Person {
    abstract void say();
}
```

- Student.java

```java
public class Student extends Person {
    @Override
    void say() {
        System.out.println("Say student");
    }
}
```

## extends class

If the *Student* only use once, we can achieve it like this

```java
@Test
public void testAnonymous() {
    Person person = new Person() {
        @Override
        void say() {
            System.out.println("Say hello...");
        }
    };

    person.say();
}
```

## implements interface

- Sayable.java

```java
public interface Sayable {
    void say();
}
```

- test

```java
 @Test
public void testAnonymousImpl() {
    Sayable sayable = new Sayable() {
        @Override
        public void say() {
            System.out.println("Say world...");
        }
    };
    sayable.say();
}
```


