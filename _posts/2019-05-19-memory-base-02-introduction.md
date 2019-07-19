---
layout: post
title: Memory 内存知识-02-introduction
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# 1 Introduction

In the early days computers were much simpler. 

The various components of a system, such as the CPU, memory, mass storage（大容量存储）, and network interfaces, were developed together and, as a result, were quite balanced in their performance. 

For example, the memory and network interfaces were not (much) faster than the CPU at providing data.

This situation changed once the basic structure of computers stabilized（稳定） and hardware developers concentrated（集中精力）
on optimizing individual（个人） subsystems. 

Suddenly the performance of some components of the computer fell significantly（显著） behind and bottlenecks（瓶颈） developed. 

This was especially true for mass storage and memory subsystems which, for cost reasons, improved more slowly relative to other components.

The slowness of mass storage has mostly been dealt（处理） with using software techniques: 

operating systems keep most often used (and most likely to be used) data in main memory, which can be accessed at a rate orders of magnitude（大小） faster than the hard disk. 

Cache storage was added to the storage devices themselves, which requires no changes in the operating system to increase performance.

1 For the purposes of this paper, we will not go into more details of software optimizations for the mass storage access.

Unlike storage subsystems, removing the main memory as a bottleneck has proven（证明） much more difficult and almost all solutions require changes to the hardware. 

## 当今状况

Today these changes mainly come in the following forms:

• RAM hardware design (speed and parallelism).

• Memory controller designs.

• CPU caches.

• Direct memory access (DMA) for devices.

For the most part, this document will deal with CPU caches and some effects of memory controller design.

In the process of exploring these topics, we will explore DMA and bring it into the larger picture（带入更大的图景）. 

However, we will start with an overview of the design for today’s commodity（商业的） hardware. 

This is a prerequisite to understanding the problems and the limitations of efficiently using memory subsystems. 

We will also learn about, in some detail, the different types of RAM and illustrate why these differences still exist.

This document is in no way all inclusive and final. 

It is limited to commodity hardware and further limited to a subset of that hardware. 

Also, many topics will be discussed in just enough detail for the goals of this paper.

For such topics, readers are recommended to find more detailed documentation.

When it comes to operating-system-specific details and solutions, the text exclusively（仅仅） describes Linux. 

At no time will it contain any information about other OSes.

The author has no interest in discussing the implications（意义） for other OSes. 

If the reader thinks s/he has to use a different OS they have to go to their vendors and demand（供应与需求）
they write documents similar to this one.

One last comment before the start. 

The text contains a number of occurrences of the term “usually” and other, similar qualifiers（预选）. 

The technology discussed here exists in many, many variations in the real world and this paper only addresses the most common, mainstream （主流）versions.

It is rare that absolute statements can be made about this technology, thus the qualifiers.


# Document Structure

This document is mostly for software developers. 

It does not go into enough technical details of the hardware to be useful for hardware-oriented readers. 

But before we can go into the practical information for developers a lot of groundwork（基础知识） must be laid（铺设）.

To that end, the second section describes random-access memory (RAM) in technical detail. 

This section’s content is nice to know but not absolutely critical(紧要) to be able to understand the later sections. 

Appropriate back references to the section are added in places where the content is required 
so that the anxious（心急的） reader could skip most of this section at first.

The third section goes into a lot of details of CPU cache behavior. 

Graphs have been used to keep the text from being as dry as（枯燥） it would otherwise be. 

This content is essential（至关重要） for an understanding of the rest of the document.

Section 4 describes briefly how virtual memory is implemented. This is also required groundwork for the rest.

Section 5 goes into a lot of detail about Non Uniform Memory Access (NUMA) systems.

Section 6 is the central section of this paper. 

It brings together all the previous sections’ information and gives programmers advice on how to write code which performs well in the various situations. 

The very impatient reader could start with this section and, if necessary, go back to the earlier sections to freshen up（梳理） the knowledge of the underlying technology.

Section 7 introduces tools which can help the programmer do a better job. 

Even with a complete understanding of the technology it is far from obvious where in a nontrivial（平凡） software project the problems are. 

Some tools are necessary.

In section 8 we finally give an outlook（展望） of technology which can be expected in the near future or which might just simply be good to have.

# About this Document

The title of this paper is an homage to David Goldberg’s classic paper “What Every Computer Scientist Should
Know About Floating-Point Arithmetic” [12]. 

This paper is still not widely known, although it should be a prerequisite for anybody daring to touch a keyboard for
serious programming.

One word on the PDF: xpdf draws some of the diagrams rather poorly. 

It is recommended it be viewed with evince（表明） or, if really necessary, Adobe’s programs. 

If you use evince be advised that hyperlinks are used extensively throughout the document even though the viewer does
not indicate them like others do.

# 个人感受

main-stream 主流

bottle-necks 瓶颈

这两个词翻译的真直白。

# 参考资料

[What Every Programmer Should Know About Memory](https://people.freebsd.org/~lstewart/articles/cpumemory.pdf)

* any list
{:toc}