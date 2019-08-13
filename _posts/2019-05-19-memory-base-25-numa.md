---
layout: post
title: Memory 内存知识-25-NUMA
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# NUMA Support

In section 2 we saw that, on some machines, the cost of access to specific regions of physical memory differs depending on where the access originated. 

This type of hardware requires special care from the OS and the applications.

We will start with a few details of NUMA hardware, then we will cover some of the support the Linux kernel provides for NUMA.

# NUMA Hardware

Non-uniform memory architectures are becoming more and more common. 

In the simplest form of NUMA, a processor can have local memory (see Figure 2.3) which is cheaper to access than memory local to other processors.

The difference in cost for this type of NUMA system is not high, i.e., the NUMA factor is low.

## 大型机的使用

NUMA is also–and especially–used in big machines. 

We have described the problems of having many processors access the same memory. 

For commodity（商业的） hardware all processors would share the same Northbridge (ignoring the AMD Opteron NUMA nodes for now, they have their own problems). 

This makes the Northbridge a severe bottleneck since all memory traffic is routed through it.

ps: 所有的内存访问都经过北桥，这就导致北桥会成为性能的瓶颈。

Big machines can, of course, use custom hardware in place of the Northbridge but, unless the memory chips used have multiple ports–i.e. they can be used from multiple busses–there still is a bottleneck. 

Multiport RAM is complicated（复杂） and expensive to build and support and, therefore, it is hardly ever used.

ps: 有替代北桥的方案，但是多 RAM 非常的复杂而且昂贵。

## AMD 的设计方案

The next step up in complexity is the model AMD uses where an interconnect mechanism (Hyper Transport in AMD’s case, technology they licensed from Digital) provides access for processors which are not directly connected to the RAM. 

The size of the structures which can be formed this way is limited unless one wants to increase the diameter（直径） (i.e., the maximum distance between any two nodes) arbitrarily（任意）.

## 拓扑结构

An efficient topology（拓扑） for connecting the nodes is the hypercube, which limits the number of nodes to 2C where C is the number of interconnect interfaces each node has.

Hypercubes（超立方体） have the smallest diameter（直径） for all systems with 2n CPUs and n interconnects. 

ps: 当然我认为球体是一种更完美的方式，但是在工程设计，显然立方体要更加简单。

### 图示

Figure 5.1 shows the first three hypercubes. 

![image](https://user-images.githubusercontent.com/18375710/62909578-b8458100-bdaf-11e9-9b58-839b73bac2ff.png)

Each hypercube has a diameter of C which is the absolute minimum. 

AMD’s firstgeneration Opteron processors have three hypertransport links per processor. 

At least one of the processors has to have a Southbridge attached to one link, meaning, currently, that a hypercube with C = 2 can be implemented directly and efficiently. 

The next generation will at some point have four links, at which point C = 3 hypercubes will be possible.

### 解释

This does not mean, though, that larger accumulations（积累） of processors cannot be supported. 

There are companies which have developed crossbars（横杆） allowing larger sets of processors to be used (e.g., Newisys’s Horus). 

But these crossbars increase the NUMA factor and they stop being effective at a certain number of processors.

## 链接 cpus 组且实现共享内存

The next step up means connecting groups of CPUs and implementing a shared memory for all of them. 

All such systems need specialized hardware and are by no means commodity systems. 

Such designs exist at several levels of complexity. 

A system which is still quite close to a commodity machine is IBM x445 and similar machines.

They can be bought as ordinary 4U, 8-way machines with x86 and x86-64 processors. 

Two (at some point up to four) of these machines can then be connected to work as a single machine with shared memory. 

The interconnect used introduces a significant NUMA factor which the OS, as well as applications, must take into account.

## 另一方面

At the other end of the spectrum, machines like SGI’s Altix are designed specifically to be interconnected（互联）. 

SGI’s NUMAlink interconnect fabric（互联结构） is very fast and has low latency at the same time; 

both properties are requirements for high-performance computing (HPC), specifically when Message Passing Interfaces (MPI) are used.

The drawback is, of course, that such sophistication（诡辩） and specialization is very expensive. 

They make a reasonably low NUMA factor possible but with the number of CPUs these machines can have (several thousands) and the limited capacity of the interconnects, the NUMA factor is actually dynamic and can reach unacceptable levels depending on the workload.

它们可以实现相当低的NUMA因子，但是由于这些机器可以拥有的CPU数量（数千个）以及互连的有限容量，NUMA因子实际上是动态的，并且可以根据工作负载达到不可接受的水平。

## 小结

More commonly used are solutions where many commodity machines are connected using high-speed networking to form a cluster. 

These are no NUMA machines, though; 

they do not implement a shared address space and therefore do not fall into any category which is discussed here.

# OS Support for NUMA

To support NUMA machines, the OS has to take the distributed nature of the memory into account（考虑）. 

For instance, if a process is run on a given processor, the physical RAM assigned to the process’s address space should ideally come from local memory. 

Otherwise each instruction has to access remote memory for code and data.

There are special cases to be taken into account which are only present in NUMA machines. 

The text segment of DSOs is normally present exactly once in a machine’s physical RAM. 

## OS 的优化

But if the DSO is used by processes and threads on all CPUs (for instance, the basic runtime libraries like libc) this means that all but a few processors have to have remote accesses. 

ps: 所有其他的处理器必须有远程访问权限。

The OS ideally would “mirror” such DSOs into each processor’s physical RAM and use local copies. 

This is an optimization, not a requirement, and generally hard to implement. 

It might not be supported or only in a limited fashion.


## 如何避免情况恶化

To avoid making the situation worse, the OS should not migrate（迁移） a process or thread from one node to another.

The OS should already try to avoid migrating processes on normal multi-processor machines because migrating from one processor to another means the cache content is lost. 

If load distribution requires migrating a process or thread off of a processor, the OS can usually pick an arbitrary new processor which has sufficient（足够的） capacity left.

In NUMA environments the selection of the new processor is a bit more limited. 

The newly selected processor should not have higher access costs to the memory the process is using than the old processor; 

this restricts（限制） the list of targets. 

If there is no free processor matching that criteria available, the OS has no choice but to migrate to a processor where memory access is more expensive.

如果没有可用的处理器匹配该条件，则操作系统别无选择，只能迁移到内存访问更昂贵的处理器。

## 两种可能的方式

In this situation there are two possible ways forward.

### 可能有更适合的处理器

First, one can hope the situation is temporary and the process can be migrated back to a better-suited processor.

Alternatively, the OS can also migrate the process’s memory to physical pages which are closer to the newly used processor. 

This is quite an expensive operation. 

Possibly huge amounts of memory have to be copied, albeit（尽管） not necessarily in one step. 

While this is happening the process, at least briefly, has to be stopped so that modifications to the old pages are correctly migrated. 

There are a whole list of other requirements for page migration to be efficient and fast. 

In short, the OS should avoid it unless it is really necessary.

### 通常的场景

Generally, it cannot be assumed that all processes on a NUMA machine use the same amount of memory such that, with the distribution of processes across the processors, memory usage is also equally distributed. 

In fact, unless the applications running on the machines are very specific (common in the HPC world, but not outside) the memory use will be very unequal. 

Some applications will use vast amounts of memory, others hardly any. 

This will, sooner or later, lead to problems if memory is always allocated local to the processor where the request is originated. 

The system will eventually（终于） run out of（耗尽） memory local to nodes running large processes.

## 如何解决这些问题

In response to these severe problems, memory is, by default, not allocated exclusively on the local node. 

To utilize（利用） all the system’s memory the default strategy is to stripe the memory（对内存进行条带化）. 

This guarantees（担保） equal use of all the memory of the system. 

As a side effect（副作用）, it becomes possible to freely migrate processes between processors since, on average, the access cost to all the memory used does not change. 

For small NUMA factors, striping（条带化） is acceptable but still not optimal (see data in section 5.4).

## pessimization（最差化）

This is a pessimization which helps the system avoid severe problems and makes it more predictable under normal operation. 

But it does decrease overall system performance, in some situations significantly（显著）. 

This is why Linux allows the memory allocation rules to be selected by each process. 

A process can select a different strategy for itself and its children. 

We will introduce the interfaces which can be used for this in section 6.

# Published Information

## 内核缓存的相关信息

The kernel publishes, through the sys pseudo file system (sysfs), information about the processor caches below

```
/sys/devices/system/cpu/cpu*/cache
```

In section 6.2.1 we will see interfaces which can be used to query the size of the various caches. 

What is important here is the topology of the caches. 

The directories above contain subdirectories (named `index*`) which list information about the various caches the CPU possesses. 

The files type, level, and shared_cpu_map are the important files in these directories as far as the topology（拓扑） is concerned. 

## Intel Core2 的信息

For an Intel Core 2 QX6700 the information looks as in Table 5.1.

![image](https://user-images.githubusercontent.com/18375710/62912781-2132f600-bdbc-11e9-8c16-e4950d872ae8.png)

What this data means is as follows:

（1）Each core25 has three caches: L1i, L1d, L2.

（2）The L1d and L1i caches are not shared with any other core–each core has its own set of caches.

This is indicated by the bitmap in shared_cpu_map having only one set bit.

（3）The L2 cache on cpu0 and cpu1 is shared, as is the L2 on cpu2 and cpu3.

If the CPU had more cache levels, there would be more `index*` directories.

## 四插座，双核Opteron机器

For a four-socket, dual-core Opteron machine the cache information looks like Table 5.2. 

![image](https://user-images.githubusercontent.com/18375710/62916497-509d2f00-bdcb-11e9-988d-ec77659d3904.png)

As can be seen these processors also have three caches: L1i, L1d, L2. 

None of the cores shares any level of cache. 

The interesting part for this system is the processor topology. 

Without this additional information one cannot make sense of the cache data. 

The sys file system exposes this information in the files below

```
/sys/devices/system/cpu/cpu*/topology
```

## SMP Opteron machine

Table 5.3 shows the interesting files in this hierarchy for the SMP Opteron machine.

![image](https://user-images.githubusercontent.com/18375710/62916551-7de9dd00-bdcb-11e9-86de-b499a19416e8.png)

Taking Table 5.2 and Table 5.3 together we can see that

a) none of the CPU has hyper-threads (the thread_siblings bitmaps have one bit set),

b) the system in fact has a total of four processors (physical_package_id 0 to 3),

c) each processor has two cores, and

d) none of the cores share any cache.

This is exactly what corresponds to（对应于） earlier Opterons

## NUMA 相关信息

What is completely missing in the data provided（没有提及的信息） so far is information about the nature of NUMA on this machine.

Any SMP Opteron machine is a NUMA machine. 

For this data we have to look at yet another part of the sys file system which exists on NUMA machines, namely in the hierarchy（等级制度） below 

```
/sys/devices/system/node
```

This directory contains a subdirectory for every NUMA node on the system. 

In the node-specific directories there are a number of files. 

## sysfs 相关文件信息 

The important files and their content for the Opteron machine described in the previous two tables are shown in Table 5.4.

![image](https://user-images.githubusercontent.com/18375710/62916881-c2c24380-bdcc-11e9-8c79-ec2faa2ba922.png)

## 小结

This information ties all the rest together; now we have a complete picture of the architecture of the machine.

We already know that the machine has four processors.

Each processor constitutes its own node as can be seen by the bits set in the value in cpumap file in the `node*` directories. 

The distance files in those directories contains a set of values, one for each node, which represent a cost of memory accesses at the respective nodes. 

In this example all local memory accesses have the cost 10, all remote access to any other node has the cost 20.

This means that, even though the processors are organized as a two-dimensional hypercube（二维超立方体） (see Figure 5.1), accesses between processors which are not directly connected is not more expensive. 

The relative values of the costs should be usable as an estimate（估计） of the actual difference of the access times. 

The accuracy（准确性） of all this information is another question.

# Remote Access Costs

The distance is relevant, though. 

## 读写性能对比图

In AMD documents the NUMA cost of a four socket machine. 

For write operations the numbers are shown in Figure 5.3. 

![image](https://user-images.githubusercontent.com/18375710/62917616-86dcad80-bdcf-11e9-99e3-6b12574d7d6e.png)


Writes are slower than reads, this is no surprise. 

The interesting parts are the costs of the 1- and 2-hop cases. 

The two 1-hop cases actually have slightly different costs.

The fact we need to remember from this chart is that 2-hop reads and writes are 30% and 49% (respectively) slower than 0-hop reads. 

2-hop writes are 32% slower than 0-hop writes, and 17% slower than 1-hop writes. 

The relative position of processor and memory nodes can make a big difference.

The next generation of processors from AMD will feature four coherent HyperTransport links per processor（每个处理器有四个连贯的HyperTransport链接）. 

In that case a four socket machine would have diameter of one. 

With eight sockets the same problem returns, with a vengeance（复仇）, since the diameter（直径） of a hypercube with eight nodes is three.

### 更简单的方式

All this information is available but it is cumbersome（笨重，累赘） to use. 

In section 6.5 we will see an interface which helps accessing and using this information easier.

## 进程状态

The last piece of information the system provides is in the status of a process itself. 

It is possible to determine how the memory-mapped files, the Copy-On-Write (COW) pages and anonymous memory are distributed over the
nodes in the system. 

For each process the kernel provides a pseudo-file /proc/PID/numa_maps, where PID is the ID of the process, as shown in Figure 5.2. 

- Figure 5.2: Content of /proc/PID/numa_maps

```
00400000 default file=/bin/cat mapped=3 N3=3
00504000 default file=/bin/cat anon=1 dirty=1 mapped=2 N3=2
00506000 default heap anon=3 dirty=3 active=0 N3=3
38a9000000 default file=/lib64/ld-2.4.so mapped=22 mapmax=47 N1=22
38a9119000 default file=/lib64/ld-2.4.so anon=1 dirty=1 N3=1
38a911a000 default file=/lib64/ld-2.4.so anon=1 dirty=1 N3=1
38a9200000 default file=/lib64/libc-2.4.so mapped=53 mapmax=52 N1=51 N2=2
38a933f000 default file=/lib64/libc-2.4.so
38a943f000 default file=/lib64/libc-2.4.so anon=1 dirty=1 mapped=3 mapmax=32 N1=2 N3=1
38a9443000 default file=/lib64/libc-2.4.so anon=1 dirty=1 N3=1
38a9444000 default anon=4 dirty=4 active=0 N3=4
2b2bbcdce000 default anon=1 dirty=1 N3=1
2b2bbcde4000 default anon=2 dirty=2 N3=2
2b2bbcde6000 default file=/usr/lib/locale/locale-archive mapped=11 mapmax=8 N0=11
7fffedcc7000 default stack anon=2 dirty=2 N3=2
```

The important information in the file is the values for N0 to N3, which indicate（表明） the number of pages allocated for the memory area on nodes 0 to 3. 

It is a good guess that the program was executed on a core on node 3. 

The program itself and the dirtied pages are allocated on that node. 

Read-only mappings, such as the first mapping for ld-2.4.so and libc-2.4.so as well as the shared file locale-archive are allocated on other nodes.

## 对比读写性能图

As we have seen in Figure 5.3, when performed across nodes the read performance falls by 9% and 30% respectively for 1- and 2-hop reads. 

For execution, such reads are needed and, if the L2 cache is missed, each cache line incurs these additional costs. 

All the costs measured for large workloads beyond the size of the cache would have to be increased by 9%/30% if the memory is remote to
the processor.

## 实际使用中的测量

To see the effects in the real world we can measure the bandwidth as in section 3.5.1 but this time with the memory being on a remote node, one hop away（一跳之遥）. 

The result of this test when compared with the data for using local memory can be seen in Figure 5.4. 

![image](https://user-images.githubusercontent.com/18375710/62918071-28b0ca00-bdd1-11e9-89f8-e7e5ebcb5025.png)

The numbers have a few big spikes（一些大的尖峰） in both directions which are the result of a problem of measuring multi-threaded code and can be ignored. 

The important information in this graph is that read operations are always 20% slower. 

ps: 这幅图醉核心的信息，读操作要慢 20%

This is significantly slower than the 9% in Figure 5.3, which is, most likely, not a number for uninterrupted（不断） read/write operations and might refer to older processor revisions. 

Only AMD knows.

For working set sizes which fit into the caches, the performance of write and copy operations is also 20% slower.

For working sets exceeding the size of the caches, the write performance is not measurably slower than the operation on the local node. 

The speed of the interconnect is fast enough to keep up with the memory. 

The dominating factor（主导因素） is the time spent waiting on the main memory.

# 参考资料

P42

[what-is-pessimization](https://stackoverflow.com/questions/32618848/what-is-pessimization)

* any list
{:toc}