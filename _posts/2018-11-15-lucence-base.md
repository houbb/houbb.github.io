---
layout: post
title: Lucene Base
date:  2018-11-15 08:38:35 +0800
categories: [Search]
tags: [apache, search, sh]
published: true
excerpt: Lucene Base
---

# Lucene 基础知识

## 读写流程

Lucene的写流程和读流程如图1所示。

![Lucene的写流程和读流程](https://mmbiz.qpic.cn/mmbiz_png/odp4zTVAogoQtpiaia0KiaB2mic21VbgK00MHM3xoJXib4TzBPjlfvc5OawRfEiboiavaLI31LdfHPz25WJficasZPD6Cw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

其中，虚线箭头（a、b、c、d）表示写索引的主要过程，实线箭头（1-9）表示查询的主要过程。

## 核心模块

Lucene中的主要模块（见图1）及模块说明如下。

analysis模块：主要负责词法分析及语言处理，也就是我们常说的分词，通过该模块可最终形成存储或者搜索的最小单元Term。

index模块：主要负责索引的创建工作。

store模块：主要负责索引的读写，主要是对文件的一些操作，其主要目的是抽象出和平台文件系统无关的存储。

queryParser：主要负责语法分析，把我们的查询语句生成Lucene底层可以识别的条件。

search模块：主要负责对索引的搜索工作。

similarity模块：主要负责相关性打分和排序的实现。


# 核心术语

下面介绍Lucene中的核心术语。

Term：是索引里最小的存储和查询单元，对于英文来说一般指一个单词，对于中文来说一般指一个分词后的词。

词典（Term Dictionary，也叫作字典）：是Term的集合。词典的数据结构可以有很多种，每种都有自己的优缺点，比如：排序数组通过二分查找来检索数据；HashMap（哈希表）比排序数组的检索速度更快，但是会浪费存储空间；fst（finite-state transducer）有更高的数据压缩率和查询效率，因为词典是常驻内存的，而fst有很好的压缩率，所以fst在Lucene的新版本中有非常多的使用场景，也是默认的词典数据结构。

倒排表（Posting List）：一篇文章通常由多个词组成，倒排表记录的是某个词在哪些文章中出现过。

正向信息：原始的文档信息，可以用来做排序、聚合、展示等。

段（segment）：索引中最小的独立存储单元。一个索引文件由一个或者多个段组成。在Lucene中的段有不变性，也就是说段一旦生成，在其上只能有读操作，不能有写操作。

Lucene的底层存储格式如图2所示。

图5-2由词典和倒排表两部分组成，其中的词典就是Term的集合。词典中的Term指向的文档链表的集合，叫作倒排表。词典和倒排表是Lucene中很重要的两种数据结构，是实现快速检索的重要基石。词典和倒排表是分两部分存储的，在倒排表中不但存储了文档编号，还存储了词频等信息。

![5-2](https://mmbiz.qpic.cn/mmbiz_png/odp4zTVAogoQtpiaia0KiaB2mic21VbgK00MxLfzcQTHTQJ9bniaicJ5iaNUO6ibtX1Xge7CMpjOXF686MWaX9xfGicUc7w/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


在图2所示的词典部分包含三个词条（Term）：elasticsearch、lucene和solr。

词典数据是查询的入口，所以这部分数据是以fst的形式存储在内存中的。

在倒排表中，“lucene”指向有序链表3,7,15,30,35,67，表示字符串“lucene”在文档编号为3、7、15、30、35、67的文章中出现过，elasticsearch和solr同理。

# 检索方式

在Lucene的查询过程中的主要检索方式有以下四种。

## 1．单个词查询

指对一个Term进行查询。

比如，若要查找包含字符串“lucene”的文档，则只需在词典中找到Term“lucene”，再获得在倒排表中对应的文档链表即可，如图3所示。

![图3](https://mmbiz.qpic.cn/mmbiz_png/odp4zTVAogoQtpiaia0KiaB2mic21VbgK00MvVXq9iaicS06hXRsstK6BiaavBuOicc0mFXmAhmNouI8JbnlIB9W19iaeiag/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

## 2. AND

指对多个集合求交集。

比如，若要查找既包含字符串“lucene”又包含字符串“solr”的文档，则查找步骤如下。

在词典中找到Term“lucene”，得到“lucene”对应的文档链表。

在词典中找到Term“solr”，得到“solr”对应的文档链表。

合并链表，对两个文档链表做交集运算，合并后的结果既包含“lucene”，也包含“solr”。

如图4所示。

![图4](https://mmbiz.qpic.cn/mmbiz_png/odp4zTVAogoQtpiaia0KiaB2mic21VbgK00MOND4m9OIJHJEKO4kJx3oWCWdHPkX85UGZrIfhqWaeGyibqBBszqNxpQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

## 3．OR

指对多个集合求并集。比如，若要查找包含字符串“lucene”或者包含字符串“solr”的文档，则查找步骤如下。

在词典中找到Term“lucene”，得到“lucene”对应的文档链表。

在词典中找到Term“solr”，得到“solr”对应的文档链表。

合并链表，对两个文档链表做并集运算，合并后的结果包含“lucene”或者包含“solr”，如图5所示。

![图5](https://mmbiz.qpic.cn/mmbiz_png/odp4zTVAogoQtpiaia0KiaB2mic21VbgK00MbznRrsia1CibuiaCUib5Uq7BYbW8GLlCJ0MiacYxnJ9XSWaAh7AtmFwWuKw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


## 4. NOT

指对多个集合求差集。比如，若要查找包含字符串“solr”但不包含字符串“lucene”的文档，则查找步骤如下。

在词典中找到Term“lucene”，得到“lucene”对应的文档链表。

在词典中找到Term“solr”，得到“solr”对应的文档链表。

合并链表，对两个文档链表做差集运算，用包含“solr”的文档集减去包含“lucene”的文档集，运算后的结果就是包含“solr”但不包含“lucene”，如图6所示。

![图6](https://mmbiz.qpic.cn/mmbiz_png/odp4zTVAogoQtpiaia0KiaB2mic21VbgK00Mt8Nnz3B4z2pBQHFojpicVwqoeSdjBG1qz4vhFOM8JU327iaYbCqeQNicQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


通过上述四种查询方式，我们不难发现，由于Lucene是以倒排表的形式存储的，所以在Lucene的查找过程中只需在词典中找到这些Term，根据Term获得文档链表，然后根据具体的查询条件对链表进行交、并、差等操作，就可以准确地查到我们想要的结果，相对于在关系型数据库中的“like”查找要做全表扫描来说，这种思路是非常高效的。虽然在索引创建时要做很多工作，但这种一次生成、多次使用的思路也是非常高明的。

# 分段存储

在早期的全文检索中为整个文档集合建立了一个很大的倒排索引，并将其写入磁盘中，如果索引有更新，就需要重新全量创建一个索引来替换原来的索引。这种方式在数据量很大时效率很低，并且由于创建一次索引的成本很高，所以对数据的更新不能过于频繁，也就不能保证时效性。

现在，在搜索中引入了段的概念（将一个索引文件拆分为多个子文件，则每个子文件叫作段），每个段都是一个独立的可被搜索的数据集，并且段具有不变性，一旦索引的数据被写入硬盘，就不可再修改。

## 写操作

在分段的思想下，对数据写操作的过程如下。

新增。当有新的数据需要创建索引时，由于段的不变性，所以选择新建一个段来存储新增的数据。

删除。当需要删除数据时，由于数据所在的段只可读，不可写，所以Lucene在索引文件下新增了一个.del的文件，用来专门存储被删除的数据id。当查询时，被删除的数据还是可以被查到的，只是在进行文档链表合并时，才把已经删除的数据过滤掉。被删除的数据在进行段合并时才会真正被移除。

更新。更新的操作其实就是删除和新增的组合，先在.del文件中记录旧数据，再在新段中添加一条更新后的数据。

## 段不变性的优点如下

不需要锁。因为数据不会更新，所以不用考虑多线程下的读写不一致情况。

可以常驻内存。段在被加载到内存后，由于具有不变性，所以只要内存的空间足够大，就可以长时间驻存，大部分查询请求会直接访问内存，而不需要访问磁盘，使得查询的性能有很大的提升。

缓存友好。在段的声明周期内始终有效，不需要在每次数据更新时被重建。

增量创建。分段可以做到增量创建索引，可以轻量级地对数据进行更新，由于每次创建的成本很低，所以可以频繁地更新数据，使系统接近实时更新。

## 段不变性的缺点如下

当对数据进行删除时，旧数据不会被马上删除，而是在.del文件中被标记为删除。而旧数据只能等到段更新时才能真正被移除，这样会有大量的空间浪费。

更新。更新数据由删除和新增这两个动作组成。若有一条数据频繁更新，则会有大量的空间浪费。

由于索引具有不变性，所以每次新增数据时，都需要新增一个段来存储数据。当段的数量太多时，对服务器的资源（如文件句柄）的消耗会非常大，查询的性能也会受到影响。

在查询后需要对已经删除的旧数据进行过滤，这增加了查询的负担。

为了提升写的性能，Lucene并没有每新增一条数据就增加一个段，而是采用延迟写的策略，每当有新增的数据时，就将其先写入内存中，然后批量写入磁盘中。若有一个段被写到硬盘，就会生成一个提交点，提交点就是一个用来记录所有提交后的段信息的文件。一个段一旦拥有了提交点，就说明这个段只有读的权限，失去了写的权限；相反，当段在内存中时，就只有写数据的权限，而不具备读数据的权限，所以也就不能被检索了。从严格意义上来说，Lucene或者Elasticsearch并不能被称为实时的搜索引擎，只能被称为准实时的搜索引擎。


## 写索引的流程如下。

新数据被写入时，并没有被直接写到硬盘中，而是被暂时写到内存中。Lucene默认是一秒钟，或者当内存中的数据量达到一定阶段时，再批量提交到磁盘中，当然，默认的时间和数据量的大小是可以通过参数控制的。通过延时写的策略，可以减少数据往磁盘上写的次数，从而提升整体的写入性能。如图7所示。

![图7](https://mmbiz.qpic.cn/mmbiz_png/odp4zTVAogoQtpiaia0KiaB2mic21VbgK00Ma0ATovA2863FDricicyeJianpU1ArJRuIE0xYGThuNnaK2lwFXdY4jtGA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

在达到触发条件以后，会将内存中缓存的数据一次性写入磁盘中，并生成提交点。

清空内存，等待新的数据写入。如图8所示。

![图8](https://mmbiz.qpic.cn/mmbiz_png/odp4zTVAogoQtpiaia0KiaB2mic21VbgK00MhVtWaPQoh9qyJXyav7hXK3qva0Mc8qe9A726HE5jlP426puZdxibqoA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

从上述流程可以看出，数据先被暂时缓存在内存中，在达到一定的条件再被一次性写入硬盘中，这种做法可以大大提升数据写入的速度。

但是，由于数据先被暂时存放在内存中，并没有真正持久化到磁盘中，所以如果这时出现断电等不可控的情况，就会丢失数据，为此，Elasticsearch添加了事务日志，来保证数据的安全，参见5.2.3节。

# 段合并策略

虽然分段比每次都全量创建索引有更高的效率，但由于在每次新增数据时都会新增一个段，所以经过长时间的积累，会导致在索引中存在大量的段，当索引中段的数量太多时，不仅会严重消耗服务器的资源，还会影响检索的性能。

因为索引检索的过程是：查询所有段中满足查询条件的数据，然后对每个段里查询的结果集进行合并，所以为了控制索引里段的数量，我们必须定期进行段合并操作。但是如果每次合并全部的段，则将造成很大的资源浪费，特别是“大段”的合并。所以Lucene现在的段合并思路是：根据段的大小先将段进行分组，再将属于同一组的段进行合并。但是由于对超级大的段的合并需要消耗更多的资源，所以Lucene会在段的大小达到一定规模，或者段里面的数据量达到一定条数时，不会再进行合并。所以Lucene的段合并主要集中在对中小段的合并上，这样既可以避免对大段进行合并时消耗过多的服务器资源，也可以很好地控制索引中段的数量。

## 段合并的主要参数

mergeFactor：每次合并时参与合并的段的最少数量，当同一组的段的数量达到此值时开始合并，如果小于此值则不合并，这样做可以减少段合并的频率，其默认值为10。

SegmentSize：指段的实际大小，单位为字节。

minMergeSize：小于这个值的段会被分到一组，这样可以加速小片段的合并。

maxMergeSize：若一个段的文本数量大于此值，就不再参与合并，因为大段合并会消耗更多的资源。

## 段合并相关的动作主要有以下两个

对索引中的段进行分组，把大小相近的段分到一组，主要由LogMergePolicyl类来处理。

将属于同一分组的段合并成一个更大的段。

在段合并前对段的大小进行了标准化处理，通过logMergeFactorSegmentSize

计算得出，其中，MergeFactor表示一次合并的段的数量，Lucene默认该数量为10；SegmentSize表示段的实际大小。通过上面的公式计算后，段的大小更加紧凑，对后续的分组更加友好。

## 段分组的步骤如下

根据段生成的时间对段进行排序，然后根据上述标准化公式计算每个段的大小并且存放到段信息中，后面用到的描述段大小的值都是标准化后的值。如图9所示。

在数组中找到最大的段，然后生成一个由最大段的标准化值作为上限，减去LEVEL_LOG_SPAN（默认值为0.75）后的值作为下限的区间。小于等于上限并且大于下限的段，都被认为是属于同一个组的段，可以合并。

![图9](https://mmbiz.qpic.cn/mmbiz_png/odp4zTVAogoQtpiaia0KiaB2mic21VbgK00MrFMZvIsK9QFpibvoaYicUBvr2icEterlNkGtmRwNoPjK0ibsjU9ia3lWCeg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


在确定一个分组的上下限值后，就需要查找属于这个分组的段了，具体过程是：创建两个指针（在这里使用指针的概念是为了更好地理解）start和end，start指向数组的第1个段，end指向第start+MergeFactor个段，然后从end逐个向前查找落在区间的段，当找到第1个满足条件的段时，则停止，并把当前段到start之间的段统一分到一个组，无论段的大小是否满足当前分组的条件。如图10所示，第2个段明显小于该分组的下限，但还是被分到了这一组。

![图10](https://mmbiz.qpic.cn/mmbiz_png/odp4zTVAogoQtpiaia0KiaB2mic21VbgK00MqueHmhCGib4N1XMz01UuBe3YK2NmgB5eSmREkqCLDhDB2OhLdwQZaYg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

这样做的好处如下。

 1）增加段合并的概率，避免由于段的大小参差不齐导致段难以合并。

 2）简化了查找的逻辑，使代码的运行效率更高。

 在分组找到后，需要排除不参加合并的“超大”段，然后判断剩余的段是否满足合并的条件，如图5-10所示，mergeFactor=5，而找到的满足合并条件的段的个数为4，所以不满足合并的条件，暂时不进行合并，继续寻找下一个分组的上下限。

由于在第4步并没有找到满足段合并的段的数量，所以这一分组的段不满足合并的条件，继续进行下一分组段的查找。具体过程是：将start指向end，在剩下的段（从end指向的元素开始到数组的最后一个元素）中寻找最大的段，在找到最大的值后再减去LEVEL_LOG_SPAN的值，再生成一个分组的区间值；然后把end指向数组的第start+MergeFactor个段，逐个向前查找第1个满足条件的段；重复第3步和第4步。

如果一直没有找到满足合并条件的段，则一直重复第5步，直到遍历完整个数组。如图11所示。

![图11](https://mmbiz.qpic.cn/mmbiz_png/odp4zTVAogoQtpiaia0KiaB2mic21VbgK00MsIewuvApojWmZshg57I01jRaMj2CWyT8YqpzjDrL7tfNPX8CSAicU8w/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

在找到满足条件的mergeFactor个段时，就需要开始合并了。但是在满足合并条件的段大于mergeFactor时，就需要进行多次合并，也就是说每次依然选择mergeFactor个段进行合并，直到该分组的所有段合并完成，再进行下一分组的查找合并操作。

通过上述几步，如果找到了满足合并要求的段，则将会进行段的合并操作。因为索引里面包含了正向信息和反向信息，所以段合并的操作分为两部分：一个是正向信息合并，例如存储域、词向量、标准化因子等；一个是反向信息的合并，例如词典、倒排表等。在段合并时，除了需要对索引数据进行合并，还需要移除段中已经删除的数据。

# Lucene相似度打分

我们在前面了解到，Lucene的查询过程是：首先在词典中查找每个Term，根据Term获得每个Term所存在的文档链表；然后根据查询条件对链表做交、并、差等操作，链表合并后的结果集就是我们要查找的数据。这样做可以完全避免对关系型数据库进行全表扫描，可以大大提升查询效率。但是，当我们一次查询出很多数据时，这些数据和我们的查询条件又有多大关系呢？其文本相似度是多少呢？本节会回答这两个问题，并介绍Lucene最经典的两个文本相似度算法：基于向量空间模型的算法和基于概率的算法（BM25）。

如果对此算法不太感兴趣，那么只需了解对文本相似度有影响的因子有哪些，哪些是正向的、哪些是逆向的即可，不需要理解每个算法的推理过程。

但是这两个文本相似度算法有很好的借鉴意义。

## 1．文本相似度的主要影响因子

文本相似度的主要影响因子如下。

tf（termfrequency）：指某个词在文档中出现的次数，其值越大，就可认为这篇文章描述的内容与该词越相近，相似度得分就越高。在Lucene中的计算公式为：

![termfrequency](https://mmbiz.qpic.cn/mmbiz_png/odp4zTVAogoQtpiaia0KiaB2mic21VbgK00MymJrWib72sYYJoNTowJoTNMdfUmN7EyZPxLrRCicEgba71iaZAQBibhSpA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

其中，t表示Term，d表示文档。

df（inversedocument frequency）：这是一个逆向的指标，表示在整个文档集合中包含某个词的文档数量越少，这个词便越重要。公式为：

idf(t) = 1+Log（docCount/（docFreq+1））

其中，docCount表示索引中的文档总数，docFreq表示包含Term t的文档数，分母中docFreq+1是为了防止分母为0。

Length：这也是一个逆向的指标，表示在同等条件下，搜索词所在文档的长度越长，搜索词和文档的相似度就越低；文档的长度越短，相似度就越高。例如“lucene”出现在一篇包含10个字的文档中和一篇包含10000个字的文档中，那么我们可以认为10个字的那篇文章与“lucene”更相关。

## 调节

Lucene为了更好地调节相似度得分，增加了以下几种boost值。

term boost：查询在语句中每个词的权重，可以在查询中设定某些词更重要。

document boost：文档的权重，在创建索引时设置某些文档比其他文档更重要。比如我国某大型搜索引擎网站可以将其域名下网站的boost值设置得比其他网站的大一些，当有查询过来时，其域名下的网站就会有更好的排名。

field boost：域的权重，就是字段的权重，表明某些字段比其他字段更重要。比如，在有标题和正文的网站中，命中标题要比命中正文重要得多。

query boost()：查询条件的权重，在复合查询时使用，这种用法不常见。

# 参考资料

https://mp.weixin.qq.com/s?__biz=MzAwNTQ4MTQ4NQ==&mid=2453561733&idx=1&sn=c8c90e4995fac9c9eb1a2571d37349e5&chksm=8cd134e7bba6bdf17c1603fdfec40cd8853929bfb17f5b10e35821ad67c27ab4261c7f1a278b&scene=21#wechat_redirect

* any list
{:toc}