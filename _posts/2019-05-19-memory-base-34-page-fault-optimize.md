---
layout: post
title: Memory 内存知识-34-缺页优化
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# 缺页优化

On operating systems like Linux with demand-paging support, an mmap call only modifies the page tables. 

It makes sure that, for file-backed pages, the underlying data can be found and, for anonymous memory, that, on access, pages initialized with zeros are provided. 

No actual memory is allocated at the time of the mmap call.

## 开辟内存

The allocation part happens when a memory page is first accessed, either by reading or writing data, or by executing code. 

In response to the ensuing page fault, the kernel takes control and determines, using the page table tree, the data which has to be present on the page. 

This resolution of the page fault is not cheap, but it happens for every single page which is used by a process.

## 降低缺页的开销

To minimize the cost of page faults, the total number of used pages has to be reduced. 

Optimizing the code for size will help with this. 

To reduce the cost of a specific code path (for instance, the start-up code), it is also possible to rearrange code so that, in that code path, the number of touched pages is minimized. 

It is not easy to determine the right order, though.

为了降低特定代码路径（例如，启动代码）的成本，还可以重新排列代码，以便在该代码路径中最小化所触摸页面的数量。

但是，要确定正确的顺序并不容易。

# 作者编写的工具

The author wrote a tool, based on the valgrind toolset, to measure page faults as they happen. 

Not the number of page faults, but the reason why they happen. 

The pagein tool emits information about the order and timing of page faults. 

## 输出例子

The output, written to a file named `pagein.<PID>`, looks as in Figure 7.8. 

```
0 0x3000000000 C    0 0x3000000B50: (within /lib64/ld-2.5.so)
1 0x 7FF000000 D    3320 0x3000000B53: (within /lib64/ld-2.5.so)
2 0x3000001000 C    58270 0x3000001080: _dl_start (in /lib64/ld-2.5.so)
3 0x3000219000 D    128020 0x30000010AE: _dl_start (in /lib64/ld-2.5.so)
4 0x300021A000 D    132170 0x30000010B5: _dl_start (in /lib64/ld-2.5.so)
5 0x3000008000 C    10489930 0x3000008B20: _dl_setup_hash (in /lib64/ld-2.5.so)
6 0x3000012000 C    13880830 0x3000012CC0: _dl_sysdep_start (in /lib64/ld-2.5.so)
7 0x3000013000 C    18091130 0x3000013440: brk (in /lib64/ld-2.5.so)
8 0x3000014000 C    19123850 0x3000014020: strlen (in /lib64/ld-2.5.so)
9 0x3000002000 C    23772480 0x3000002450: dl_main (in /lib64/ld-2.5.so)
```

The second column specifies the address of the page which is pagedin. 

Whether it is a code or data page is indicated in the third column, which contains ‘C’ or ‘D’ respectively. 

The fourth column specifies the number of cycles which passed since the first page fault. 

The rest of the line is valgrind’s attempt to find a name for the address which caused the page fault. 

The address value itself is correct but the name is not always accurate（准确） if no debug information is available.

## 例子解释

In the example in Figure 7.8, execution starts at address 3000000B5016, which forces the system to page in the page at address 300000000016. 

Shortly after that, the page after this is also brought in; the function called on that page is `_dl_start`. 

The initial code accesses a variable on page 7FF0000001.

 This happens just 3,320 cycles after the first page fault and is most likely the second instruction of the program (just three bytes after the first instruction). 
 
 If one looks at the program, one will notice that there is something peculiar about this memory access. 
 
 The instruction in question is a call instruction, which does not explicitly load or store data. 
 
 It does store the return address on the stack, though, and this is exactly what happens here. 
 
 This is not the official stack of the process, though, it is valgrind’s internal stack of the application. 
 
 This means when interpreting the results of pagein it is important to keep in mind that valgrind introduces some artifacts.

如果看一下这个程序，就会注意到这个内存访问有一些特殊之处。
 
有问题的指令是一个调用指令，它不显式加载或存储数据。
 
但它确实将返回地址存储在堆栈中，这正是这里发生的事情。
 
这不是该进程的官方堆栈，但它是valgrind应用程序的内部堆栈。
 
这意味着在解释pagein的结果时，重要的是要记住valgrind引入了一些工件。

### 输出信息

The output of pagein can be used to determine which code sequences should ideally be adjacent in the program code. 

A quick look at the `/lib64/ld-2.5.so` code shows that the first instructions immediately call the function _dl_start, and that these two places are on different pages. 

Rearranging the code to move the code sequences onto the same page can avoid–or at least delay–a page fault. 

It is, so far, a cumbersome process to determine what the optimal code layout should be. 

Since the second use of a page is, by design, not recorded, one needs to use trial and error to see the effects of a change. 

Using call graph analysis, it is possible to guess about possible call sequences; 

this might help speed up the process of sorting the functions and variables.

重新排列代码以将代码序列移动到同一页面上可以避免或至少延迟页面错误。

到目前为止，确定最佳代码布局应该是一个繁琐的过程。

由于页面的第二次使用是按设计而未记录的，因此需要使用反复试验来查看更改的效果。

使用调用图分析，可以猜测可能的调用序列;

这可能有助于加快对函数和变量进行排序的过程。

# 调用序列的查看

At a very coarse（粗） level, the call sequences can be seen by looking a the object files making up the executable or DSO. 

在非常粗略级别，可以通过查看构成可执行文件或DSO的目标文件来查看调用序列。

Starting with one or more entry points (i.e., function names), the chain of dependencies can be computed. 

Without much effort this works well at the object file level. 

In each round, determine which object files contain needed functions and variables. 

The seed set has to be specified explicitly. 

Then determine all undefined references in those object files and add them to the set of needed symbols. 

Repeat until the set is stable.

## 确定执行顺序

The second step in the process is to determine an order. 

The various object files have to be grouped together to fill as few pages as possible. 

As an added bonus, no function should cross over a page boundary. 

A complication in all this is that, to best arrange the object files, it has to be known what the linker will do later. 

The important fact here is that the linker will put the object files into the executable or DSO in the same order in which they appear in the input files (e.g., archives), and on the command line. 

This gives the programmer sufficient control.

必须将各种目标文件组合在一起以填充尽可能少的页面。

作为额外的奖励，任何功能都不应越过页面边界。

所有这一切的复杂性在于，为了最好地安排目标文件，必须知道链接器稍后会做什么。

这里的重要事实是链接器将对象文件按照它们在输入文件（例如，存档）中出现的顺序和命令行中的顺序放入可执行文件或DSO中。

这为程序员提供了足够的控制。

## 重排序

For those who are willing to invest a bit more time, there have been successful attempts at reordering made using automatic call tracing via the `__cyg_profile_func_enter` and `__cyg_profile_func_exit` hooks gcc inserts when called with the -finstrument-functions option. 

对于那些愿意投入更多时间的人来说，在使用-finstrument-functions选项调用时，通过`__cyg_profile_func_enter`和`__cyg_profile_func_exit`钩子gcc插入使用自动调用跟踪进行重新排序的成功尝试。

See the gcc manual for more information on these `__cyg_*` interfaces. 

By creating a trace of the program execution, the programmer can more accurately determine the call chains（程序员可以更准确地确定调用链）. 

The results in are a 5% decrease in start-up costs, just through reordering of the functions. 

The main benefit is the reduced number of page faults, but the TLB cache also plays a role–an increasingly important role given that, in virtualized environments, TLB misses become significantly more expensive.

仅通过重新排序功能，结果就是启动成本降低了5％。

主要的好处是减少了页面错误的数量，但TLB缓存也发挥了作用 - 一个越来越重要的角色，因为在虚拟化环境中，TLB丢失变得非常昂贵。

By combining the analysis of the pagein tool with the call sequence information, it should be possible to optimize certain phases of the program (such as start-up) to minimize the number of page faults.


# Linux 

The Linux kernel provides two additional mechanisms to avoid page faults. 

## mmap 标志

The first one is a flag for mmap which instructs the kernel to not only modify the page table but, in fact, to pre-fault all the pages in the mapped area. 

This is achieved by simply adding the MAP_POPULATE flag to the fourth parameter of the mmap call. 

This will cause the mmap call to be significantly more expensive, but, if all pages which are mapped by the call are being used right away, the benefits can be large. 

Instead of having a number of page faults, which each are pretty expensive due to the overhead incurred by synchronization requirements etc., the program would have one, more expensive, mmap call. 

由于同步要求等引起的开销，每个都非常昂贵，而不是有许多页面错误，程序将有一个更昂贵的mmap调用。

The use of this flag has disadvantages, though, in cases where a large portion of the mapped pages are not used soon (or ever) after the call. 

Mapped, unused pages are obviously a waste of time and memory. 

Pages which are immediately pre-faulted and only much later used also can clog up the system. 

The memory is allocated before it is used and this might lead to shortages of memory in the meantime. 

On the other hand, in the worst case, the page is simply reused for a new purpose (since it has not been modified yet), which is not that expensive but still, together with the allocation, adds some cost.

The granularity of MAP_POPULATE is simply too coarse.

MAP_POPULATE的粒度太粗糙了。

And there is a second possible problem: this is an optimization; 

it is not critical that all pages are, indeed, mapped in. 

If the system is too busy to perform the operation the pre-faulting can be dropped. 

Once the page is really used the program takes the page fault, but this is not worse than artificially creating resource scarcity.

## 另一种选择

An alternative is to use the POSIX_MADV_WILLNEED advice with the posix_madvise function. 

This is a hint to of huge pages which should be reserved to the operating system that, in the near future, the program
will need the page described in the call. 

The kernel is free to ignore the advice, but it also can pre-fault pages. 

### 优点

The advantage here is that the granularity is finer. 

Individual pages or page ranges in any mapped address space area can be pre-faulted. 

For memory-mapped files which contain a lot of data which is not used at runtime, this can have huge advantages over using MAP_POPULATE.

Beside these active approaches to minimizing the number of page faults, it is also possible to take a more passive approach which is popular with the hardware designers. 

A DSO occupies neighboring pages in the address space, one range of pages each for the code and the data. 

The smaller the page size, the more pages are needed to hold the DSO. 

This, in turn, means more page faults, too. 

Important here is that the opposite is also true. 

For larger page sizes, the number of necessary pages for the mapping (or anonymous memory) is reduced; with it falls the number of page faults.

这里的优点是粒度更精细。

任何映射的地址空间区域中的单个页面或页面范围都可以预先出现故障。

对于包含大量未在运行时使用的数据的内存映射文件，这比使用MAP_POPULATE具有巨大的优势。

除了这些最小化页面错误数量的主动方法之外，还可以采用受硬件设计者欢迎的更被动的方法。

DSO占用地址空间中的相邻页面，每个页面范围用于代码和数据。

页面大小越小，保存DSO所需的页面就越多。

反过来，这也意味着更多的页面错误。

这里重要的是相反的情况也是如此。

对于较大的页面大小，减少了映射（或匿名内存）所需页面的数量; 随之而来的是页面错误的数量。


## 大部分页的设计

Most architectures support page sizes of 4k. 

On IA-64 and PPC64, page sizes of 64k are also popular. 

That means the smallest unit in which memory is given out is 64k. 

The value has to be specified when compiling the kernel and cannot be changed dynamically (at least not at the moment). 

编译内核时必须指定该值，并且不能动态更改（至少目前不是这样）。

The ABIs of the multiple-page-size architectures are designed to allow running an application with either page size. 

The runtime will make the necessary adjustments, and a correctly-written program will not notice a thing. 

Larger page sizes mean more waste through partially-used pages, but, in some situations, this is OK.

当然较大的页会意味着浪费，当然大部分情况，这是可以忍受的。


# 非常大的 page size 设计

Most architectures also support very large page sizes of 1MB or more. 

Such pages are useful in some situations, too, but it makes no sense to have all memory given out in units that large. 

The waste of physical RAM would simply be too large. 

## 大页的优点

But very large pages have their advantages: 

if huge data sets are used, storing them in 2MB pages on x86-64 would require 511 fewer page faults (per large page) than using the same amount of memory with 4k pages. 

This can make a big difference. 

The solution is to selectively request memory allocation which, just for the requested address range, uses huge memory pages and, for all the other mappings in the same process, uses the normal page size.

但非常大的页面有其优点：

如果使用大量数据集，在x86-64上将它们存储在2MB页面中将需要比使用4k页面的相同内存量少511页面错误（每个大页面）。

这可以产生很大的不同。

解决方案是有选择地请求内存分配，仅针对请求的地址范围，使用大量内存页，并且对于同一进程中的所有其他映射，使用正常页大小。


- 个人收获

较大的页肯定会使得数据使用较少的页就可以存储。

这也意味着，缺页就会降低。

当然我们使用最多的方式，是可以结合。比如超过一定大小的信息，使用大页。

## 价格方面

Huge page sizes come with a price, though. 

Since the physical memory used for large pages must be continuous, it might, after a while, not be possible to allocate such pages due to memory fragmentation.

有时候想直接分配这么大的连续内存是很难做到的。

People are working on memory defragmentation and fragmentation avoidance, but it is very complicated. 

人们正致力于内存碎片整理和碎片避免，但它非常复杂。


## 系统启动的场景

For large pages of, say, 2MB the necessary 512 consecutive pages are always hard to come by, except at one time: when the system boots up. 

This is why the current solution for large pages requires the use of a special filesystem, hugetlbfs. 

对于2MB的大页面，必要的512个连续页面总是很难得到，除非有一次：系统启动时。

这就是当前大页面解决方案需要使用特殊文件系统hugetlbfs的原因。

This pseudo filesystem is allocated on request by the system administrator by writing the number of huge pages which should be reserved to

```
/proc/sys/vm/nr_hugepages
```

ps: 因为在系统启动初期，很多信息都是空的。所以会有很多连续的内存供使用。



# 操作失败的场景

This operation might fail if not enough continuous memory can be located. 

The situation gets especially interesting if virtualization is used. 

A virtualized system using the VMM model does not directly administrate physical memory and, therefore, cannot by itself allocate the hugetlbfs. 

如果使用虚拟化，情况会变得特别有趣。

使用VMM模型的虚拟化系统不直接管理物理内存，因此无法自行分配hugetlbfs。

It has to rely on the VMM, and this feature is not guaranteed to be supported. 

For the KVM model, the Linux kernel running the KVM module can perform the hugetlbfs allocation and possibly pass a subset of the pages thus allocated on to one of the guest domains.

它必须依赖VMM，并且不保证支持此功能。

对于KVM模型，运行KVM模块的Linux内核可以执行hugetlbfs分配，并可能将这样分配的页面子集传递给其中一个来宾域。

## 程序需要大页

Later, when a program needs a large page, there are multiple possibilities:

• the program can use the System V shared memory interfaces with the SHM_HUGETLB flag.

• a filesystem of type hugetlbfs can actually be mounted and the program can then create a file under the mount point and use mmap to map one or more pages as anonymous memory.

## 场景1

In the first case, the hugetlbfs need not be mounted. 

Code requesting one or more large pages could look like this:

```c
key_t k = ftok("/some/key/file", 42);
int id = shmget(k, LENGTH,
                SHM_HUGETLB|IPC_CREAT
                |SHM_R|SHM_W);
void *a = shmat(id, NULL, 0);
```

The critical parts of this code sequence are the use of the SHM_HUGETLB flag and the choice of the right value for LENGTH, which must be a multiple of the huge page size for the system. 

Different architectures have different values.

The use of the System V shared memory interface has the nasty problem of depending on the key argument to differentiate (or share) mappings. 

The *ftok* interface can easily produce conflicts which is why, if possible, it is better to use other mechanisms.

## 最佳实践

If the requirement to mount the hugetlbfs filesystem is not a problem, it is better to use it instead of System V shared memory.

The only real problems with using the special filesystem are that the kernel must support it, and that there is no standardized mount point yet. 

如果挂载hugetlbfs文件系统的要求不是问题，最好使用它而不是System V共享内存。

使用特殊文件系统的唯一真正问题是内核必须支持它，并且还没有标准化的挂载点。

Once the filesystem is mounted, for instance at /dev/hugetlb, a program can make easy use of it:

```c
int fd = open("/dev/hugetlb/file1",O_RDWR|O_CREAT, 0700);
void *a = mmap(NULL, LENGTH,PROT_READ|PROT_WRITE,fd, 0);
```

By using the same file name in the open call, multiple processes can share the same huge pages and collaborate. 

It is also possible to make the pages executable, in which case the PROT_EXEC flag must also be set in the mmap call. 

As in the System V shared memory example, the value of LENGTH must be a multiple of the system’s huge page size.

## 防御性写

A defensively-written program (as all programs should be) can determine the mount point at runtime using a function like this:

```c
char *hugetlbfs_mntpoint(void) {
  char *result = NULL;
  FILE *fp = setmntent(_PATH_MOUNTED, "r");
  if (fp != NULL) {
    struct mntent *m;
    while ((m = getmntent(fp)) != NULL)
       if (strcmp(m->mnt_fsname,
                  "hugetlbfs") == 0) {
         result = strdup(m->mnt_dir);
break; }
    endmntent(fp);
  }
  return result;
}
```

More information for both these cases can be found in the hugetlbpage.txt file which comes as part of the kernel source tree. 

The file also describes the special handling needed for IA-64.

## 大页的优点图示

![image](https://user-images.githubusercontent.com/18375710/64474273-b6e85800-d1a5-11e9-8389-911570dcdc01.png)

To illustrate the advantages of huge pages, Figure 7.9 shows the results of running the random Follow test for NPAD=0. 

为了说明大页面的优点，图7.9显示了运行NPAD = 0的随机Follow测试的结果。

This is the same data shown in Figure 3.15, but, this time, we measure the data also with memory allocated in huge pages. 

As can be seen the performance advantage can be huge. 

For 220 bytes the test using huge pages is 57% faster. 

This is due to the fact that this size still fits completely into one single 2MB page and, therefore, no DTLB misses occur.

### 效益说明

After this point, the winnings are initially smaller but grow again with increasing working set size. 

The huge pages test is 38% faster for the 512MB working set size. 

The curve for the huge page test has a plateau at around 250 cycles. 

Beyond working sets of 227 bytes, the numbers rise significantly again. 

The reason for the plateau is that 64 TLB entries for 2MB pages cover 227 bytes.

在此之后，奖金最初较小，但随着工作组尺寸的增加而再次增长。

对于512MB工作集大小，大页面测试速度提高了38％。

巨大页面测试的曲线在大约250个周期处有一个平台。

除了227字节的工作集之外，数字再次显着上升。

平台的原因是2MB页面的64个TLB条目覆盖227个字节。

## 大页的主要成本 TLB 未命中

As these numbers show, a large part of the costs of using large working set sizes comes from TLB misses. 

Using the interfaces described in this section can pay off bigtime. 

The numbers in the graph are, most likely, upper limits, but even real-world programs show a significant speed-up. 

Databases, since they use large amounts of data, are among the programs which use huge pages to- day.

正如这些数字所示，使用大型工作集大小的大部分成本来自TLB未命中。

使用本节中描述的接口可以带来巨大的回报。

图中的数字很可能是上限，但即使是现实世界的程序也显示出显着的加速。

数据库，因为它们使用大量数据，是今天使用大页面的程序之一。

# 大页的局限性

There is currently no way to use large pages to map filebacked data. 

There is interest in implementing this capability, but the proposals made so far all involve explicitly using large pages, and they rely on the hugetlbfs filesystem. 

This is not acceptable: large page use in this case must be transparent. 

The kernel can easily determine which mappings are large and automatically use large pages. 

A big problem is that the kernel does not always know about the use pattern. 

If the memory, which could be mapped as a large page, later requires 4k-page granularity (for instance, because the protection of parts
of the memory range is changed using mprotect) a lot of precious resources, in particular the linear physical memory, will have been wasted. 

So it will certainly be some more time before such an approach is successfully implemented.

目前无法使用大页面来映射文件备份数据。

有兴趣实现此功能，但到目前为止所提出的建议都涉及明确使用大页面，并且它们依赖于hugetlbfs文件系统。

这是不可接受的：在这种情况下，大页面使用必须是透明的。

内核可以轻松确定哪些映射很大并自动使用大页面。

一个大问题是内核并不总是知道使用模式。

如果可以映射为大页面的内存以后需要4k页的粒度（例如，因为部件的保护）
使用mprotect改变存储器范围）许多宝贵的资源，特别是线性物理存储器，将被浪费掉。

因此，在成功实施这种方法之前，肯定会有更多的时间。

# 参考资料

P89

* any list
{:toc}