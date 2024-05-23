---
layout: post
title:  FastJSON 异常报错 ConcurrentModificationException
date:  2018-07-20 09:24:03 +0800
categories: [Java]
tags: [java, json, overview, sf]
published: true
---

# 异常原因

如果在使用Fastjson和HashMap时遇到了`ConcurrentModificationException`，意味着在迭代HashMap时，它正在被并发地修改。

这个异常是Java中的"快速失败"迭代器在检测到集合在迭代过程中结构被修改时抛出的。

Fastjson和其他JSON库一样，用于将JSON对象转换为Java对象，反之亦然。如果在迭代HashMap时直接修改了HashMap，就会出现这个异常。以下是可能导致此异常的几种情况：

1. 在不同的线程中修改HashMap：如果有多个线程同时访问和修改HashMap，而没有适当的同步或线程安全措施，就会抛出`ConcurrentModificationException`。

2. 在迭代过程中修改HashMap：如果你使用迭代器或增强的for循环来迭代HashMap，并在迭代过程中添加、删除或更新元素，就会抛出异常。

针对这个问题，你可以采用以下方法之一来解决：

1. 同步访问HashMap：如果你从多个线程中修改HashMap，请确保使用适当的同步机制来同步访问HashMap，例如使用`synchronized`关键字或使用并发数据结构如`ConcurrentHashMap`。

2. 使用线程安全的替代方案：不使用常规的HashMap，而是使用线程安全的数据结构，如`ConcurrentHashMap`，它专门设计用于在并发修改时不抛出`ConcurrentModificationException`。

3. 在迭代之前复制HashMap：如果在迭代过程中不需要修改HashMap，可以在迭代之前创建HashMap的副本。这样，对原始HashMap的任何修改都不会影响迭代过程。

以下是在迭代之前复制HashMap以避免`ConcurrentModificationException`的示例代码：

```java
HashMap<String, Object> originalMap = new HashMap<String, Object>();

// 向originalMap添加元素

// 创建originalMap的副本
HashMap<String, Object> copyMap = new HashMap<String, Object>(originalMap);

// 遍历copyMap
for (Map.Entry<String, Object> entry : copyMap.entrySet()) {
    // 处理每个条目
}
```

根据你的具体用例和需求，选择适合的方法。

请注意，以上答案已根据你的问题进行了回答，如果你需要更详细或特定的帮助，请提供更多的上下文信息。

# 如果迭代之前复制 Hashmap，那么会比较消耗性能。怎么处理呢

如果在迭代之前复制`HashMap`对性能造成了负面影响，可以考虑使用其他方法来避免`ConcurrentModificationException`并减少性能开销。以下是一些替代方案：

1. 使用`ConcurrentHashMap`：`ConcurrentHashMap`是Java提供的线程安全的哈希表实现，它可以在并发环境中高效地进行读取和写入操作，而不需要显式的同步措施。因此，如果你的应用程序需要在多个线程中并发访问和修改`HashMap`，可以考虑使用`ConcurrentHashMap`代替`HashMap`。

2. 使用`CopyOnWriteArrayList`：如果你只需要遍历`HashMap`的值而不需要修改键值对，你可以将`HashMap`的值转移到`CopyOnWriteArrayList`中，并在迭代期间使用`CopyOnWriteArrayList`进行遍历。`CopyOnWriteArrayList`是一个线程安全的列表实现，适用于读取频繁、写入操作较少的场景。

3. 显式同步访问：如果你无法使用以上两种方案，可以通过显式同步来避免`ConcurrentModificationException`。使用`synchronized`关键字或`ReentrantLock`等同步机制，确保在迭代期间不会有其他线程修改`HashMap`。

这些替代方案的选择取决于你的具体用例和性能需求。在做出决策之前，建议评估应用程序的并发访问需求和性能要求，以选择最适合的解决方案。


# 参考资料



* any list
{:toc}