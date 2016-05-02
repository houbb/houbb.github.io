---
layout: post
title: Reflecting
date:  2016-5-2 10:31:09 +0800
categories: [Java]
tags: [reflecting]
published: false
---

* any list
{:toc}

## Mock

If you use The **Third-party** API, may need mock.

> Before use mock, you must sure have the problem of **dependency**.


## Reflection


> getClass()

Here is the jdk1.7 doc.

```java
public Class<?>[] getClasses()
```
The actual result type is Class<? extends |X|> where |X| is the erasure of the static type of the expression on which getClass is called.


> JUnit

JUnit also use reflection to get the methods list.

- method must start with 'test';
- method must return void;
- method not accept any arguments.


## Use JUnit




