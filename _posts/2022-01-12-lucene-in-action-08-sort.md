---
layout: post
title: Lucene in action-08-sort 排序
date: 2022-01-10 21:01:55 +0800 
categories: [Lucene]
tags: [Lucene, search, sh]
published: true
---

# 排序

很多使用 Lucene 米实现搜索功能的应用程序都可以利用第三章中介绍的 API 来完成。

但是有些项目单靠前面介绍的基本搜索机制仍然无法实现其功能。

因此在本章中，我们将进一步介绍 Lucene 中更多更为复杂的内置搜索功能。

PhrasePrefixQuery 和 MultiFieldQueryParser这两个类为我们引出了本章要介绍的Lucene 附加的内置功能。

如果你使用 Lucene 的时间不长，就可能对这些特性的理解不够透彻。排序、跨度查询和项向量都是 Lucene1.4中引入的新特性，它们在很大程度上增强了 Lucene 的功能及其灵活性。

# 5.1 对搜索结果进行排序

在Lucene1.4之前，返回的搜索结果都是按照得分递减的顺序排列的，这样的排列顺序确保了将相关度最大的文档排在最前。假设我们要为一个名为 BookScene 的虚拟书店开发一个应用程序，要求它能够对搜索结果分类显示，并且在同一分类中的各种书籍要根据查询相关度进行排序。

要实现这个功能，可以在 Lucene 的外部附加一段对搜索结果进行搜集和分类的程序：但当结果的数目相当庞大时，这样的实现方法可能会成为制约应用程序性能的瓶颈。

不过值得庆幸的是，开发专家 Tim Jones 已经对 Lucene 做了有效的补充，他为 Lucene 加入了成熟且完善的搜索结果排序功能。

在本节中，我们将尝试用各种方法对搜索结果进行排序，例如使用一个或多个域的值对结果按升序或降序进行排列。

## 5.1.1 使用排序方法

IndexSearcher 类包含了几个可重载的 search 方法。到目前为止，我们只讲述了基本的 search(Query)方法，它返回的是按相关性降序排列的结果。能够对结果排序的 search方法声明为 search(Query， Sort)。程序5.1为我们示范了如何使用这个 search 方法对结果进行排序。 displayHits 方法使用 search(Query， Sort)方法并将命中的 Hits 对象显示出来。下面的例子通过 displayHits 方法来说明不同排序方法的运行结果。



# 参考资料

《Lucene in Action II》

* any list
{:toc}