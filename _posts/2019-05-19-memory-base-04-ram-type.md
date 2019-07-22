---
layout: post
title: Memory 内存知识-04-RAM Types
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# RAM Types

There have been many types of RAM over the years and each type varies, sometimes significantly（显著）, from the other.

The older types are today really only interesting to the historians. 

We will not explore the details of those. 

Instead we will concentrate on（专注于） modern RAM types; 

we will only scrape the surface（刮擦表面-研究皮毛）, exploring some details which are visible to the kernel or application developer through their performance characteristics.

## 为什么有不同类型的 RAM

The first interesting details are centered around the question why there are different types of RAM in the same machine. 

More specifically, why are there both static RAM (SRAM5) and dynamic RAM (DRAM). 

The former is much faster and provides the same functionality.

Why is not all RAM in a machine SRAM? 

The answeris, as one might expect, cost. 

SRAM is much more expensive to produce and to use than DRAM. 

Both these cost factors are important, the second one increasing in importance more and more. 

To understand these differences we look at the implementation of a bit of storage for both SRAM and DRAM

## 下面的内容会讲解什么

In the remainder of this section we will discuss some low-level details of the implementation of RAM. 

We will keep the level of detail as low as possible. 

To that end, we will discuss the signals at a “logic level” and not at a level a hardware designer would have to use. 

That level of detail is unnecessary for our purpose here.

# Static RAM

![Static RAM](https://user-images.githubusercontent.com/18375710/61600200-11633e80-ac62-11e9-95e0-8213ad18d0e0.png)

Figure 2.4 shows the structure of a 6 transistor SRAM cell. 

The core of this cell is formed by the four transistors（晶体管） M1 to M4 which form two cross-coupled inverters（两个交叉耦合的逆变器）. 

They have two stable states, representing 0 and 1 respectively（分别）.

The state is stable as long as power on Vdd is available.

If access to the state of the cell is needed the word access line WL is raised. 

This makes the state of the cell immediately available for reading on BL and BL. 

If the cell state must be overwritten the BL and BL lines are first set to the desired values and then WL is raised. 

Since the outside drivers are stronger than the four transistors (M1through M4) this allows the old state to be overwritten.

See [20] for a more detailed description of the way the cell works. 

For the following discussion it is important to note that.

## 注意内容

- one cell requires six transistors. There are variants with four transistors but they have disadvantages.

- maintaining the state of the cell requires constant power.

- the cell state is available for reading almost immediately once the word access line WL is raised.
The signal is as rectangular (changing quickly between the two binary states) as other transistor controlled signals.

- the cell state is stable, no refresh cycles are needed.

ps: 这些是计算机组成原理的基础知识。

## 优缺点

There are other, slower and less power-hungry, SRAM forms available, but those are not of interest here since we are looking at fast RAM. 

These slow variants are mainly interesting because they can be more easily used in a system than dynamic RAM because of their simpler
interface.

SRAM 使用起来接口设计比较简单，但是价格昂贵（相对而言）。一个最小的电路单元需要 6 个电路元件。

# Dynamic RAM

Dynamic RAM is, in its structure, much simpler than static RAM. 

Figure 2.5 shows the structure of a usual DRAM cell design. 

All it consists of is one transistor and one capacitor（电容器）. 

This huge difference in complexity of course means that it functions very differently than static RAM.

![Dynamic RAM](https://user-images.githubusercontent.com/18375710/61600431-21c7e900-ac63-11e9-833d-d31f220d136d.png)

A dynamic RAM cell keeps its state in the capacitor C.

The transistor M is used to guard the access to the state.

To read the state of the cell the access line AL is raised;

this either causes a current to flow on the data line DL or not, depending on the charge in the capacitor. 

To write to the cell the data line DL is appropriately（适当） set and then AL is raised for a time long enough to charge or drain（充电或者排水）the capacitor.

## 带来的问题

There are a number of complications（并发症，复杂性） with the design of dynamic RAM. 

The use of a capacitor means that reading the cell discharges the capacitor. 

The procedure cannot be repeated indefinitely（无限期）, the capacitor must be recharged at some point. 

Even worse, to accommodate（容纳） the huge number of cells (chips with 109 or more cells are now common) the capacity to the capacitor must be low (inthe femto-farad range or lower). 

A fully charged capacitor holds a few 10’s of thousands of electrons. 

Even though the resistance（电阻） of the capacitor is high (a couple of tera-ohms) it only takes a short time for the capacity to
dissipate. 

### 漏电及其解决方案

This problem is called “leakage”（漏电）.

This leakage is why a DRAM cell must be constantly refreshed. 

For most DRAM chips（芯片） these days this refresh must happen every 64ms. 

During the refresh cycle no access to the memory is possible since a refresh is simply a memory read operation where the result is discarded.

For some workloads（工作负载） this overhead might stall up to 50% of the memory accesses (see [3]).

### 信息无法直接使用

A second problem resulting from the tiny charge is that the information read from the cell is not directly usable.

The data line must be connected to a sense amplifier（放大器） which can distinguish between a stored 0 or 1 over the whole range of charges which still have to count as 1.

### 读操作导致电容器耗尽 

A third problem is that reading a cell causes the charge of the capacitor to be depleted（耗尽）. 

This means every read operation must be followed by an operation to recharge the capacitor. 

This is done automatically by feeding the output of the sense amplifier back into the capacitor. 

It does mean, though, the reading memory content requires additional energy and, more importantly, time.

### 充电和放电是耗时的

A fourth problem is that charging and draining a capacitor is not instantaneous（瞬间的）. 

The signals received by the sense amplifier are not rectangular, so a conservative estimate（保守估计） as to when the output of the cell is usable has to be used. 

The formulas for charging and discharging a capacitor are

![charging and draining](https://user-images.githubusercontent.com/18375710/61601550-89346780-ac68-11e9-9044-a323b2b9d54a.png)

This means it takes some time (determined by the capacity C and resistance R) for the capacitor to be charged and
discharged. 

It also means that the current which can be detected（检测） by the sense amplifiers is not immediately available. 

Figure 2.6 shows the charge and discharge curves. 

The X–axis is measured in units of RC (resistance multiplied by capacitance)（电阻乘以电容） which is a unit of time.

Unlike the static RAM case where the output is immediately available when the word access line is raised, it will
always take a bit of time until the capacitor discharges sufficiently. 

This delay severely limits how fast DRAM can be.

![image](https://user-images.githubusercontent.com/18375710/61601872-f3014100-ac69-11e9-8fe8-f5167865618c.png)

## 优点

The simple approach has its advantages, too. 

The main advantage is size. 

The chip real estate needed for one DRAM cell is many times smaller than that of an SRAM cell. 

The SRAM cells also need individual power for the transistors maintaining the state. 

The structure of the DRAM cell is also simpler and more regular which means packing many of them close together on a die is
simpler.

## 总结

Overall, the (quite dramatic) difference in cost wins. 

Except in specialized hardware – network routers, for example – we have to live with main memory which is based on DRAM. 

This has huge implications on the programmer which we will discuss in the remainder of this paper.

But first we need to look into a few more details of the actual use of DRAM cells.

# DRAM Access

A program selects a memory location using a virtual address. 

The processor translates this into a physical address and finally the memory controller selects the RAM chip corresponding to that address. 

To select the individual（个人） memory cell on the RAM chip, parts of the physical address are passed on in the form of a number of address lines.

It would be completely impractical（不切实际的） to address memory locations individually from the memory controller: 

4GB of RAM would require 232 address lines. 

Instead the address is passed encoded as a binary number using a smaller set of address lines. 

The address passed to the DRAM chip this way must be demultiplexed（解复用） first. 

A demultiplexer with N address lines will have 2N output lines. 

These output lines can be used to select the memory cell. 

Using this direct approach is no big problem for chips with small capacities.

But if the number of cells grows this approach is not suitable anymore. 

A chip with 1Gbit6 capacity would need 30 address lines and 230 select lines. 

The size of a demultiplexer increases exponentially with the number of input lines when speed is not to be sacrificed. 

A demultiplexer for 30 address lines needs a whole lot of chip real estate in addition to the complexity (size and time) of
the demultiplexer. 

Even more importantly, transmitting 30 impulses on the address lines synchronously is much harder than transmitting “only” 15 impulses. 

Fewer lines have to be laid out at exactly the same length or timed appropriately.

![image](https://user-images.githubusercontent.com/18375710/61608149-3ec0e400-ac84-11e9-9a84-8a638367b944.png)

Figure 2.7 shows a DRAM chip at a very high level. 

The DRAM cells are organized in rows and columns. 

They could all be aligned in one row but then the DRAM chip would need a huge demultiplexer. 

With the array approach the design can get by with one demultiplexer and one multiplexer of half the size.8 This is a huge saving
on all fronts. 

In the example the address lines a0 and a1 through the **row address selection (RAS)9** demultiplexer select the address lines of a whole row of cells. 

When reading, the content of all cells is thusly made available to the **column address selection (CAS)9** multiplexer. 

Based on the address lines a2 and a3 the content of one column is then made available to the data pin of the DRAM chip. 

This happens many times in parallel on a number of DRAM chips to produce a total number of bits corresponding to the width of the data bus

For writing, the new cell value is put on the data bus and, when the cell is selected using the RAS and CAS, it is stored in the cell. 

A pretty straightforward design. 

There are in reality – obviously（明显） – many more complications（并发症）. 

There need to be specifications for how much delay there is after the signal before the data will be available on the data bus for reading. 

The capacitors（电容器） do not unload instantaneously（瞬间）, as described in the previous section. 

The signal from the cells is so weak that it needs to be amplified（放大）.

For writing it must be specified how long the data must be available on the bus after the RAS and CAS is done to successfully store the new value in the cell (again, capacitors do not fill or drain instantaneously). 

These timing constants are crucial（关键） for the performance of the DRAM chip. 

We will talk about this in the next section.

A secondary scalability（可扩展性） problem is that having 30 address lines connected to every RAM chip is not feasible（可行） either.

Pins of a chip are precious resources. 

It is “bad” enough that the data must be transferred as much as possible in parallel (e.g., in 64 bit batches). 

The memory controller must be able to address each RAM module (collection of RAM chips). 

If parallel access to multiple RAM modules is required for performance reasons and each RAM module requires its own set of 30 or more address lines, then the memory controller needs to have, for 8 RAM modules, a whopping（高达） 240+ pins only for the address handling.

To counter these secondary scalability problems DRAM chips have, for a long time, multiplexed the address itself. 

That means the address is transferred in two parts. 

The first part consisting of address bits (a0 and a1 in the example in Figure 2.7) select the row. 

This selection remains active until revoked. 

Then the second part, address bits a2 and a3 , select the column. 

The crucial difference is that only two external address lines are needed. 

A few more lines are needed to indicate when the RAS and CAS signals are available but this is a small price to pay for cutting the number of address lines in half. 

This address multiplexing brings its own set of problems, though. 

We will discuss them in section 2.2.

# Conclusions

Do not worry if the details in this section are a bit overwhelming（压倒）. 

## 主要内容

The important things to take away from this section are:

- there are reasons why not all memory is SRAM

- memory cells need to be individually selected to be used

- the number of address lines is directly responsible（主管） for the cost of the memory controller, motherboards, DRAM module, and DRAM chip

- it takes a while before the results of the read or write operation are available

## 下期内容

The following section will go into more details about the actual process of accessing DRAM memory. 

We are not going into more details of accessing SRAM, which is usually directly addressed. 

This happens for speed and because the SRAM memory is limited in size. 

SRAM is currently used in CPU caches and on-die（片上） where the connections are small and fully under control of the CPU designer. 

CPU caches are a topic which we discuss later but all we need to know is that SRAM cells have a certain maximum speed which depends on the effort spent on the SRAM. 

The speed can vary from only slightly slower than the CPU core to one or two orders of magnitude（大小） slower.

# 参考资料

[cpumemory.pdf-5](https://people.freebsd.org/~lstewart/articles/cpumemory.pdf)

* any list
{:toc}