---
layout: post
title:  锁专题（9） SynchronousQueue 同步队列源码解析
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, source-code, queue, data-struct, sf]
published: flase
---

# SynchronousQueue 



# 源码分析


## 类定义

```java
public class SynchronousQueue<E> extends AbstractQueue<E>
    implements BlockingQueue<E>, java.io.Serializable {
    private static final long serialVersionUID = -3223113410248163686L;
}
```

实现了阻塞队列接口，继承自 AbstractQueue 抽象队列。







# 小结


希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

jdk 源码

[DelayQueue 的使用](https://blog.csdn.net/hsqingwei/article/details/88850835)

[Java延时队列DelayQueue的使用](https://my.oschina.net/lujianing/blog/705894)

* any list
{:toc}