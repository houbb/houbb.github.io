---
layout: post
title: Memory 内存知识-24-虚拟内存
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# Virtual Memory

The virtual memory (VM) subsystem of a processor implements the virtual address spaces provided to each process.

This makes each process think it is alone in the system. 

ps: 让每一个进程认为自己在系统中是独一无二的。

The list of advantages of virtual memory are described in detail elsewhere so they will not be repeated here. 

Instead this section concentrates on（专注于） the actual implementation details of the virtual memory subsystem and the associated costs.

## MMU

A virtual address space is implemented by the Memory Management Unit (MMU) of the CPU. 

The OS has to fill out the page table data structures, but most CPUs do the rest of the work themselves. 

This is actually a pretty complicated mechanism;（复杂机制） 

the best way to understand it is to introduce the data structures used to describe the virtual address space.

## 输入输出的处理

The input to the address translation performed by the MMU is a virtual address. 

MMU执行的地址转换的输入是虚拟地址。

There are usually few–if any–restrictions（限制） on its value. 

Virtual addresses are 32-bit values on 32-bit systems, and 64-bit values on 64-bit systems.

On some systems, for instance x86 and x86-64, the addresses used actually involve another level of indirection:

these architectures use segments which simply cause an offset to be added to every logical address. 

ps: 实际地址=物理起始地址+offset

We can ignore this part of address generation, it is trivial and not something that programmers have to care about with respect（尊重） to performance of memory handling.

# Simplest Address Translation

The interesting part is the translation of the virtual address to a physical address. 

The MMU can remap（重映射） addresses on a page-by-page basis（逐页）. 

Just as when addressing cache lines, the virtual address is split into distinct（不同） parts.

These parts are used to index into various tables which are used in the construction（施工） of the final physical address.

For the simplest model we have only one level of tables.

![image](https://user-images.githubusercontent.com/18375710/62842847-e3fd3400-bce7-11e9-82be-4b958eddf15c.png)

## 图示解释

Figure 4.1 shows how the different parts of the virtual address are used. 

A top part is used to select an entry in a Page Directory; 

each entry in that directory can be individually（逐个） set by the OS. 

The page directory entry determines（确定） the address of a physical memory page; 

more than one entry in the page directory can point to the same physical address. 

The complete physical address of the memory cell is determined by combining the page address from the page directory with the low bits from the virtual address. 

The page directory entry also contains some additional information about the page such as access permissions.

ps: 访问权限是要控制的，防止被非法访问。

## 数据结构

The data structure for the page directory is stored in main memory. 

The OS has to allocate contiguous（邻近的） physical memory and store the base address of this memory region in a special register. 

ps：临近的物理地址，顺序读写的效率非常高。

The appropriate（适当） bits of the virtual address are then used as an index into the page directory, which is actually an array of directory entries.

## 例子

For a concrete（具体，实际） example, this is the layout used for 4MB pages on x86 machines. 

The Offset part of the virtual address is 22 bits in size, enough to address every byte in a 4MB page. 

The remaining 10 bits of the virtual address select one of the 1024 entries in the page directory. 

Each entry contains a 10 bit base address of a 4MB page which is combined with the offset to form a complete 32 bit address.


# Multi-Level Page Tables

## 一级分页的缺陷

4MB pages are not the norm, they would waste a lot of memory since many operations an OS has to perform require alignment（对齐） to memory pages. 

With 4kB pages (the norm on 32-bit machines and, still, often on 64-bit machines), the Offset part of the virtual address is only 12 bits in size. 

This leaves 20 bits as the selector of the page directory. 

A table with 220 entries is not practical（不切实际）. 

Even if each entry would be only 4 bytes the table would be 4MB in size. 

With each process potentially（可能） having its own distinct page directory much of the physical memory of the system would be tied up （绑起来）for these page directories.

## 解决方案

The solution is to use multiple levels of page tables. 

The level then form a huge, sparse（稀疏） page directory; 

address space regions which are not actually used do not require allocated memory. 

The representation（表示） is therefore much more compact, making it possible to have the page tables for many processes in memory without impacting（影响） performance too much.

ps: 感觉类似于多级索引。

## 当今的主流设计

Today the most complicated page table structures comprise（包括） four levels. 

Figure 4.2 shows the schematics（原理图） of such an implementation. 

![image](https://user-images.githubusercontent.com/18375710/62843349-d8ac0780-bceb-11e9-950e-f41fa4ffb1d4.png)

The virtual address is, in this example, split into at least five parts. 

Four of these parts are indexes into the various directories. 

The level 4 directory is referenced using a special-purpose register（专用寄存器） in the CPU.

The content of the level 4 to level 2 directories is a reference to next lower level directory. 

If a directory entry is marked empty it obviously need not point to any lower directory. 

ps: 如果目录为空，就不需要指向下层了。

This way the page table tree can be sparse and compact（稀疏紧凑）. 

The entries of the level 1 directory are, just like in Figure 4.1, partial physical addresses, plus auxiliary（辅助的，新增的） data like access permissions.

ps: 其实 level 1 就和原来的简单映射类似了。

## 页树遍历

To determine the physical address corresponding to a virtual address the processor first determines the address of the highest level directory. 

This address is usually stored in a register. 

Then the CPU takes the index part of the virtual address corresponding to this directory and uses that index to pick the appropriate（适当） entry. 

This entry is the address of the next directory, which is indexed using the next part of the virtual address. 

This process continues until it reaches the level 1 directory, at which point the value of the directory entry is the high part of the physical address. 

The physical address is completed by adding the page offset bits from the virtual address. 

This process is called page tree walking. 

Some processors (like x86 and x86-64) perform this operation in hardware, others need assistance（帮助） from the OS.

ps: 整体流程也比较简单。开始从寄存器中寻找最高级别目录，然后依次通过指针进行下一个目录的索引，直到 level 1 级别的目录。然后才停止遍历。


## 每一个进程

Each process running on the system might need its own page table tree. 

It is possible to partially share trees but this is rather the exception（这是例外）. 

It is therefore good for performance and scalability if the memory needed by the page table trees is as small as possible. 

ps: 分页表的大小越小，性能和拓展性就越好。这是肯定的，但也不太现实。

The ideal case for this is to place the used memory close together in the virtual address space; 

the actual physical addresses used do not matter. 

ps: 处理的方式是在虚拟内存中连续，不关系物理地址。但是这也带来一个问题，物理地址不连续，寻址耗时将会变得较多。

A small program might get by with using just one directory at each of levels 2, 3, and 4 and a few level 1 directories. 

On x86-64 with 4kB pages and 512 entries per directory this allows the addressing of 2MB with a total of 4 directories (one for each level). 

1GB of contiguous memory can be addressed with one directory for levels 2 to 4 and 512 directories for level 1.


## 内存分配的假设

Assuming all memory can be allocated contiguously is too simplistic, though. 

For flexibility（灵活性） reasons the stack and the heap area of a process are, in most cases, allocated at pretty much opposite ends of the address space.（分配在地址空间的几乎相反的两端。）

ps: 比如 jvm 的分配就是，堆栈是从两端开始分别分配的。一个天，一个地，如果二者相遇，就是内存不够的时候了。

This allows either area to grow as much as possible if needed. 

This means that there are most likely two level 2 directories needed and correspondingly（相应地） more lower level directories.

## 安全因素

But even this does not always match current practice. 

For security reasons the various parts of an executable (code, data, heap, stack, Dynamic Shared Objects (DSOs), aka shared libraries) are mapped at randomized addresses.

The randomization extends to the relative position of the various parts; 

that implies that the various memory regions in use in a process are widespread throughout the virtual address space. （遍布整个虚拟地址空间。）

By applying some limits to the number of bits of the address which are randomized the range can be restricted, but it certainly, in most cases, will not allow a process to run with just one or two directories for levels 2 and 3.

### 安全与性能的平衡

If performance is really much more important than security, randomization can be turned off. 

The OS will then usually at least load all DSOs contiguously in virtual memory.


# Optimizing Page Table Access

All the data structures for the page tables are kept in the main memory; 

this is where the OS constructs and updates the tables. 

Upon creation of a process or a change of a page table the CPU is notified. 

The page tables are used to resolve every virtual address into a physical address using the page table walk described above. 

More to the point: at least one directory for each level is used in the process of resolving a virtual address. 

This requires up to four memory accesses (for a single access by the running process) which is slow. 

It is possible to treat these directory table entries as normal data and cache them in L1d, L2, etc., but this would still be far too slow.

ps: 如果是一般的程序，那就是 4 级甚至更多的目录。所以就需要 4 次访问，最简单的想法，就是直接利用 cache 缓存这些信息，加快访问速度。

## 早年的设计

From the earliest days of virtual memory, CPU designers have used a different optimization. 

A simple computation can show that only keeping the directory table entries in the L1d and higher cache would lead to horrible （可怕的）performance. 

Each absolute address computation（计算） would require a number of L1d accesses corresponding to the page table depth. 

These accesses cannot be parallelized since they depend on the previous lookup’s result. 

This alone would, on a machine with four page table levels, require at the very least 12 cycles. 

Add to that the probability of an L1d miss and the result is nothing the instruction pipeline can hide. 

The additional L1d accesses also steal precious bandwidth to the cache（窃取宝贵的带宽到缓存）.

ps: 因为每一次查询都依赖上一次的结果，所以无法并行。导致很多优化无法进行。

## 替换的解决方案

So, instead of just caching the directory table entries, the complete computation of the address of the physical page is cached. 

For the same reason that code and data caches work, such a cached address computation is effective. 

Since the page offset part of the virtual address does not play any part in the computation of the physical page address, only the rest of the virtual address is used as the tag for the cache. 

Depending on the page size this means hundreds or thousands of instructions or data objects share the same tag and therefore same physical
address prefix.

由于虚拟地址的页面偏移部分在物理页面地址的计算中不起任何作用，因此仅将虚拟地址的其余部分用作高速缓存的标记。

这取决于页面大小，这意味着数百或数千个指令或数据对象共享相同的标签，因此具有相同的物理标签地址前缀。

### TLB

The cache into which the computed values are stored is called the Translation Look-Aside Buffer (TLB). 

It is usually a small cache since it has to be extremely fast.

ps: 原来对于 TLB 的认知，就是从 vm 获取物理地址，存在一个速度差（这样就可以使用缓存）。

现在看来，原来其实也有缓存的方式，只不过性能很差。

### 多级 TLB

Modern CPUs provide multi-level TLB caches, just as for the other caches; 

the higher-level caches are larger and slower. 

The small size of the L1TLB is often made up for by making the cache fully associative, with an LRU eviction policy. 

Recently, this cache has been growing in size and, in the process, was changed to be set associative.

As a result, it might not be the oldest entry which gets evicted and replaced whenever a new entry has to be added.

ps: 这种 cache 分层的思想，其实和 CPU 对应的缓存是多么的相似。

### Tag 

As noted above, the tag used to access the TLB is a part of the virtual address. 

If the tag has a match in the cache, the final physical address is computed by adding the page offset from the virtual address to the cached value. 

This is a very fast process; 

it has to be since the physical address must be available for every instruction using absolute addresses and, in some cases, for L2 look-ups which use the physical address as the key. 

If the TLB lookup misses the processor has to perform a page table walk; this can be quite costly.

ps: 换言之，如果 TLB 没有命中。那么我们就必须执行一遍页表遍历，这自然很耗性能。

## 预取

Prefetching code or data through software or hardware could implicitly prefetch entries for the TLB if the address is on another page. 

This cannot be allowed for hardware prefetching because the hardware could initiate（发起） page table walks that are invalid. 

Programmers therefore cannot rely on hardware prefetching to prefetch TLB entries.

It has to be done explicitly using prefetch instructions.

TLBs, just like data and instruction caches, can appear in multiple levels. 

Just as for the data cache, the TLB usually appears in two flavors: an instruction TLB (ITLB) and a data TLB (DTLB). 

Higher-level TLBs such as the L2TLB are usually unified, as is the case with the other caches.

# 参考资料

P38

* any list
{:toc}