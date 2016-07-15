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

## Lazy loading

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

## Starve

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



