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

# Caveats（注意事项） Of Using A TLB

The TLB is a processor-core global resource. 

All threads and processes executed on the processor core use the same TLB. 

Since the translation of virtual to physical addresses depends on which page table tree is installed, the CPU cannot blindly reuse the cached entries if the page table is changed. 

Each process has a different page table tree (but not the threads in the same process) as does the kernel and the VMM (hypervisor) if present. 

It is also possible that the address space layout of a process changes. 

## 两种处理方式

There are two ways to deal with this problem:

（1） The TLB is flushed whenever the page table tree is changed.

（2） The tags for the TLB entries are extended to additionally and uniquely identify the page table tree they refer to.

## 刷新的方式

In the first case the TLB is flushed whenever a context switch is performed. 

Since, in most OSes, a switch from one thread/process to another requires executing some kernel code, TLB flushes are restricted to leaving (and sometimes entering) the kernel address space. 

On virtualized（虚拟化） systems it also happens when the kernel has to call the VMM and on the way back. 

If the kernel and/or VMM does not have to use virtual addresses, or can reuse the same virtual addresses as the process or kernel which
made the system/VMM call (i.e., the address spaces are overlaid), the TLB only has to be flushed if, upon leaving the kernel or VMM, the processor resumes execution of a different process or kernel.

Flushing the TLB is effective but expensive. 

ps: 刷新所有的页表信息是有效的，但是代价很大。

When executing a system call, for instance, the kernel code might be restricted to a few thousand instructions which touch,
perhaps, a handful of new pages (or one huge page, as is the case for Linux on some architectures). 

This work would replace only as many TLB entries as pages are touched. 

For Intel’s Core2 architecture with its 128 ITLB and 256 DTLB entries, a full flush would mean that more than 100 and 200 entries (respectively) would be flushed unnecessarily. 

When the system call returns to the same process, all those flushed TLB entries can be used again, but they will be gone. 

### TLB cache 为什么不再变大了

The same is true for often-used code in the kernel or VMM. 

On each entry into the kernel the TLB has to be filled from scratch even though the page tables for the kernel and VMM usually do not change and, therefore, TLB entries could, in theory, be preserved（罐头） for a very long time. 

This also explains why the TLB caches in today’s processors are not bigger: 

programs most likely will not run long enough to fill all these entries.

## 优化方案

This fact, of course, did not escape the CPU architects（架构）.

One possibility to optimize the cache flushes is to individually invalidate（单独地使无效） TLB entries. 

For instance, if the kernel code and data falls into a specific address range, only the pages falling into this address range have to evicted from the TLB. 

This only requires comparing tags and, therefore, is not very expensive. 

This method is also useful in case a part of the address space is changed, for instance, through a call to munmap.

ps: 利用降低刷新的范围来提升性能，这也是一种很常见的思考方式。

## 更好的解决方案

A much better solution is to extend the tag used for the TLB access. 

If, in addition to the part of the virtual address, a unique identifier for each page table tree (i.e., a process’s address space) is added, the TLB does not have to be completely flushed at all. 

The kernel, VMM, and the individual processes all can have unique identifiers.

The only issue with this scheme is that the number of bits available for the TLB tag is severely limited, while the number of address spaces is not. 

This means some identifier reuse is necessary. 

此方案的唯一问题是TLB标记的可用位数受到严格限制，而地址空间的数量则不然。

这意味着需要一些标识符重用。

When this happens the TLB has to be partially flushed (if this is possible). 

All entries with the reused identifier must be flushed but this is, hopefully, a much smaller set.

ps: 其实部分刷新，虽然会重新刷新所有的部分，但是重新刷新范围已经很小了。

This extended TLB tagging is of advantage outside the realm of virtualization when multiple processes are running on the system. 

If the memory use (and hence TLB entry use) of each of the runnable processes is limited, there is a good chance the most recently used TLB entries for a process are still in the TLB when it gets scheduled again. 

ps: 这符合局部性原理，这样缓存的命中率会更高。

### 额外的优点

But there are two additional advantages:

（1） Special address spaces, such as those used by the kernel and VMM, are often only entered for a short time; afterward control is often returned to the address space which initiated the entry. 

Without tags, one or two TLB flushes are performed. 

With tags the calling address space’s cached translations are preserved and, since the kernel and VMM address space do not often change TLB entries at all, the translations from previous system calls, etc. can still be used.

（2）When switching between two threads of the same process no TLB flush is necessary at all. 

Without extended TLB tags the entry into the kernel destroys the first thread’s TLB entries, though.

## 当今处理器的实际设计

Some processors have, for some time, implemented these extended tags. 

AMD introduced a 1-bit tag extension with the Pacifica virtualization extensions. 

This 1-bit Address Space ID (ASID) is, in the context of virtualization, used to distinguish（区分） the VMM’s address space from that of
the guest domains（用户态）. 

ps: 个人理解是加一个标志位，用来区分 VMM 的地址属于哪一个线程。

This allows the OS to avoid flushing the guest’s TLB entries every time the VMM is entered (for instance, to handle a page fault) or the VMM’s TLB entries when control returns to the guest. 

The architecture will allow the use of more bits in the future. 

Other mainstream processors（主流处理器） will likely follow suit and support this feature.

# Influencing TLB Performance

There are a couple of factors which influence TLB performance. 

## 页的大小

The first is the size of the pages. 

Obviously, the larger a page is, the more instructions or data objects will fit into it. 

So a larger page size reduces the overall number of address translations which are needed, meaning that fewer entries in the TLB cache are needed. 

Most architectures nowadays allow the use of multiple different page sizes; 

some sizes can be used concurrently. 

For instance, the x86/x86-64 processors have a normal page size of 4kB but they can also use 4MB and 2MB pages respectively（分别）. 

IA-64 and PowerPC allow sizes like 64kB as the base page size.

优点：页越大，一次可以加载的内容就很多。需要加载的次数就会变少。当然，太大也是有缺点的。

### 大页的缺点

The use of large page sizes brings some problems with it, though. 

The memory regions used for the large pages must be contiguous in physical memory. 

If the unit size for the administration of physical memory is raised to the size of the virtual memory pages, the amount of wasted memory will grow. 

All kinds of memory operations (like loading executables) require alignment to page boundaries（页面边界对齐）.

This means, on average, that each mapping wastes half the page size in physical memory for each mapping.

This waste can easily add up; it thus puts an upper limit on the reasonable unit size for physical memory allocation.

这种浪费很容易累计; 因此，它为物理内存分配的合理单位大小设置了上限。

### 切分成 4K 的缺点

It is certainly not practical to increase the unit size to 2MB to accommodate large pages on x86-64. 

This is just too large a size. 

But this in turn means that each large page has to be comprised of many smaller pages.

And these small pages have to be contiguous in physical memory. 

Allocating 2MB of contiguous physical memory with a unit page size of 4kB can be challenging. 

It requires finding a free area with 512 contiguous pages.

This can be extremely difficult (or impossible) after the system runs for a while and physical memory becomes fragmented（支离破碎）.

随着程序的运行，程序的内存会变得支离破碎。这也使得想获得 512 个连续的页，是一件比较困难的事情。

## linux 

On Linux it is therefore necessary to allocate these big pages at system start time using the special hugetlbfs filesystem. 

A fixed number of physical pages are reserved（保留的） for exclusive use as big virtual pages. 

This ties down resources which might not always be used. 

It also is a limited pool; increasing it normally means restarting the system. 

Still, huge pages are the way to go in situations where performance is a premium, resources are plenty, and cumbersome setup is not a big deterrent.

尽管如此，在性能优势，资源丰富，繁琐的设置并不是一个很大的威慑力量的情况下，大页面是可行的方式。

Database servers are an example.

ps: linux 可以在系统启动的时候，预留一些大页。当然这是一把双刃剑。

## 提升最小虚拟页大小的问题

Increasing the minimum virtual page size (as opposed to optional big pages) has its problems, too. 

Memory mapping operations (loading applications, for example) must conform to these page sizes. 

No smaller mappings are possible. 

The location of the various parts of an executable have, for most architectures, a fixed relationship.

If the page size is increased beyond what has been taken into account when the executable or DSO was built, the load operation cannot be performed. 

如果页面大小增加到超出构建可执行文件或DSO时所考虑的大小，则无法执行加载操作。

It is important to keep this limitation in mind. 

### 例子

Figure 4.3 shows how the alignment requirements of an ELF binary can be determined.

```
$ eu-readelf -l /bin/ls
Program Headers:
Type Offset VirtAddr PhysAddr FileSiz MemSiz Flg Align
...
LOAD 0x000000 0x0000000000400000 0x0000000000400000 0x0132ac 0x0132ac R E 0x200000
LOAD 0x0132b0 0x00000000006132b0 0x00000000006132b0 0x001a71 0x001a71 RW 0x200000
```

It is encoded in the ELF program header. 

In this example, an x86-64 binary, the value is `200000_(16) = 2,097,152 = 2MB` which corresponds to the maximum page size supported by the processor.

## 使用大页的另一个影响

There is a second effect of using larger page sizes: the number of levels of the page table tree is reduced. 

Since the part of the virtual address corresponding to the page offset increases, there are not that many bits left which
need to be handled through page directories. 

This means that, in case of a TLB miss, the amount of work which has to be done is reduced.

Beyond using large page sizes, it is possible to reduce the number of TLB entries needed by moving data which is used at the same time to fewer pages. 

This is similar to some optimizations for cache use we talked about above.

Only now the alignment required is large. 

Given that the number of TLB entries is quite small this can be an important optimization.

收获：

（1）使用大页，从某种程度上降低了页表树的层数。

响应地，每一个目录，剩余的位数会降低（本来用来唯一标识一个进程-线程的）。不过一般都是够用的。

（2）除了使用大页面大小之外，还可以通过将同时使用的数据移动到更少的页面来减少所需的TLB条目的数量。

# Impact Of Virtualization（虚拟化的影响）

Virtualization of OS images will become more and more prevalent（流行）; 

this means another layer of memory handling is added to the picture. 

Virtualization of processes (basically jails) or OS containers do not fall into this category since only one OS is involved. 

Technologies like Xen or KVM enable–with or without help from the processor the execution of independent OS images. 

In these situations there is one piece of software alone which directly controls access to the physical memory.

## Xen 图示

![image](https://user-images.githubusercontent.com/18375710/62848232-3ef55200-bd0d-11e9-8fe8-60c766bb52fa.png)

In the case of Xen (see Figure 4.4) the Xen VMM is that piece of software. 

The VMM does not implement many of the other hardware controls itself, though. 

Unlike VMMs on other, earlier systems (and the first release of the Xen VMM) the hardware outside of memory and processors is controlled by the privileged Dom0 domain.

Currently, this is basically the same kernel as the unprivileged DomU kernels and, as far as memory handling is concerned, they do not differ. 

Important here is that the VMM hands out physical memory to the Dom0 and DomU kernels which, themselves, then implement the usual memory handling as if they were running directly on a processor.

### 实现每一个部分

To implement the separation of the domains which is required for the virtualization to be complete, the memory handling in the Dom0 and DomU kernels does not have unrestricted（无限制） access to physical memory. 

The VMM does not hand out memory by giving out individual physical pages and letting the guest OSes handle the addressing;

this would not provide any protection against faulty or rogue guest domains. 

Instead, the VMM creates its own page table tree for each guest domain and hands out memory using these data structures. 

The good thing is that access to the administrative information of the page table tree can be controlled. 

If the code does not have appropriate privileges（适当的特权） it cannot do anything.

### 访问权限

This access control is exploited（利用） in the virtualization Xen provides, regardless of whether para- or hardware (aka
full) virtualization is used. 

The guest domains（用户态） construct their page table trees for each process in a way which is intentionally（故意地） quite similar for para- and hardware virtualization.

Whenever the guest OS modifies its page tables the VMM is invoked. 

The VMM then uses the updated information in the guest domain to update its own shadow page tables. 

These are the page tables which are actually used by the hardware. 

Obviously, this process is quite expensive: each modification of the page table tree requires an invocation（调用） of the VMM. 

While changes to the memory mapping are not cheap without virtualization they become even more expensive now.

### 消耗的额外资源

The additional costs can be really large, considering that the changes from the guest OS to the VMM and back themselves are already quite expensive. 

This is why the processors are starting to have additional functionality to avoid the creation of shadow page tables. 

This is good not only because of speed concerns but it also reduces memory consumption by the VMM. 

这不仅是因为速度问题，而且还减少了VMM的内存消耗。

Intel has Extended Page Tables (EPTs) and AMD calls it Nested Page Tables (NPTs). 

Basically both technologies have the page tables of the guest OSes produce “host virtual addresses” from the “guest virtual address”. 

The host virtual addresses must then be further translated, using the perdomain EPT/NPT trees, into actual physical addresses.

This will allow memory handling at almost the speed of the no-virtualization case since most VMM entries for memory handling are removed. 

It also reduces the memory use of the VMM since now only one page table tree for each domain (as opposed to process) has to be maintained.

这将允许几乎以非虚拟化情况的速度处理内存，因为大多数用于内存处理的VMM条目被删除。

它还减少了VMM的内存使用，因为现在只需要维护每个域（而不是进程）的一个页表树。

## TLB

The results of the additional address translation steps are also stored in the TLB. 

That means the TLB does not store the virtual physical address but, instead, the complete result of the lookup. 

It was already explained that AMD’s Pacifica extension introduced the ASID to avoid TLB flushes on each entry. 

The number of bits for the ASID is one in the initial release of the processor extensions;

this is just enough to differentiate VMM and guest OS. 

Intel has virtual processor IDs (VPIDs) which serve the same purpose, only there are more of them. 

But the VPID is fixed for each guest domain and therefore it cannot be used to mark separate processes and avoid TLB flushes at that level, too.


## 地址空间修改的工作量

The amount of work needed for each address space modification is one problem with virtualized OSes. 

There is another problem inherent（固有） in VMM-based virtualization, though: 

there is no way around having two layers of memory handling. 

But memory handling is hard (especially when taking complications like NUMA into account, see section 5). 

The Xen approach of using a separate VMM makes optimal (or even good) handling hard since all the complications of a memory management implementation, including “trivial” things like discovery of memory regions, must be duplicated in the VMM. 

The OSes have fully-fledged（羽翼丰满） and optimized implementations; one really wants to avoid duplicating them.

## KVM Linux kernel

![image](https://user-images.githubusercontent.com/18375710/62848946-3e11ef80-bd10-11e9-8ae8-bd52223df8b6.png)

This is why carrying the VMM/Dom0 model to its conclusion is such an attractive alternative（诱人的选择）. 

Figure 4.5 shows how the KVM Linux kernel extensions try to solve the problem. 

There is no separate VMM running directly on the hardware and controlling all the guests; 

instead, a normal Linux kernel takes over this functionality. 

This means the complete and sophisticated（复杂的） memory handling functionality in the Linux kernel is used to manage the memory of the system. 

Guest domains run alongside the normal user-level processes in what the creators call “guest mode”. 

ps: 用户所有的执行，就是建立在 linux 系统态之上的。

The virtualization functionality, para- or full virtualization, is controlled by the KVM VMM. 

This is just another userlevel process which happens to control a guest domain using the special KVM device the kernel implements.

### 优点 

The benefit of this model over the separate VMM of the Xen model is that, even though there are still two memory handlers at work when guest OSes are used, there only needs to be one implementation, that in the Linux kernel. 

It is not necessary to duplicate the same functionality in another piece of code like the Xen VMM. 

This leads to less work, fewer bugs, and, perhaps, less friction（摩擦，冲突） where the two memory handlers touch since the memory
handler in a Linux guest makes the same assumptions as the memory handler in the outer Linux kernel which runs on the bare hardware.

## 总结

Overall, programmers must be aware that, with virtualization used, the cost of cache misses (instruction, data, or TLB) is even higher than without virtualization. 

Any optimization which reduces this work will pay off even more in virtualized environments. 

Processor designers will, over time, reduce the difference more and more through technologies like EPT and NPT but it will never
completely go away.

# 参考资料

P38

* any list
{:toc}