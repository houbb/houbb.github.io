---
layout: post
title: java 线程安全之无状态类
date:  2018-10-08 17:55:28 +0800
categories: [Pattern]
tags: [sql, java, pattern, thread-safe, sh]
published: true
---

# 无状态类

有状态就是有数据存储功能。有状态对象(Stateful Bean)，就是有实例变量的对象，可以保存数据，是非线程安全的。在不同方法调用间不保留任何状态。 

无状态就是一次操作，不能保存数据。无状态对象(Stateless Bean)，就是没有实例变量的对象.不能保存数据，是不变类，是线程安全的。 


# 无状态类例子：Servlet

线程安全类的一个很好的例子是java servlet，它没有字段和引用，没有其他类的字段等等。它们是无状态(stateless)的。

```java
public class StatelessFactorizer implements Servlet {

    public void service(ServletRequest req, ServletResponse resp) {
        BigInteger i = extractFromRequest(req);
        BigInteger[] factors = factor(i);
        encodeIntoResponse(resp, factors);
    }

}
```

特定计算的瞬态状态仅存在于存储在线程堆栈上的本地变量中，并且仅对执行线程可访问。 一个线程访问一个状态因数分解器不能影响另一个线程访问相同的无状态分解器的结果; 因为这两个线程不共享状态，所以它们好像访问了不同的实例。

由于访问无状态对象的线程的操作不会影响其他线程中操作的正确性，因此无状态对象是线程安全的。

# 拓展阅读

[不可变对象](https://houbb.github.io/2018/10/08/pattern-immutable)

# 参考资料

[面向对象设计讨论：有状态类还是无状态类？这是个难题](https://blog.csdn.net/u010642308/article/details/78201164)

[线程安全，有状态，无状态的对象](https://blog.csdn.net/aaa1117a8w5s6d/article/details/8295439)

[有状态和无状态](http://www.cnblogs.com/MRRAOBX/articles/4118573.html)

* any list
{:toc}