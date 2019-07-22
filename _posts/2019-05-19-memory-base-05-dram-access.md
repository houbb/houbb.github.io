---
layout: post
title: Memory 内存知识-05-DRAM Access Technical Details
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# DRAM Access Technical Details

## 前景回顾

In the section introducing DRAM we saw that DRAM chips multiplex（多路复用） the addresses in order to save resources int the form of address pins（地址引脚）. 

We also saw that accessing DRAM cells takes time since the capacitors in those cells do not discharge instantaneously（瞬间放电） to produce a stable signal; 

we also saw that DRAM cells must be refreshed.

Now it is time to put this all together and see how all these factors determine（确定） how the DRAM access has to happen.

## 重点

We will concentrate（专注于） on current technology; 

we will not discuss asynchronous DRAM and its variants as they are simply not relevant（贴题） anymore. 

Readers interested in this topic are referred to [3] and [19]. 

We will also not talk about Rambus DRAM (RDRAM) even though the technology is not obsolete（过时的）. 

It is just not widely used for system memory. 

We will concentrate exclusively（专注于） on Synchronous DRAM (SDRAM) and its successors Double Data Rate DRAM (DDR)

## Synchronous DRAM

Synchronous DRAM, as the name suggests, works relative to a time source. 

The memory controller provides a clock, the frequency of which determines the speed of the Front Side Bus (FSB) – the memory controller interface used by the DRAM chips. 

As of this writing, frequencies of 800MHz, 1,066MHz, or even 1,333MHz are available with higher frequencies (1,600MHz) being announced （公布）for the next generation. 

This does not mean the frequency used on the bus is actually this high. 

Instead, today’s buses are double- or quad-pumped（四抽）, meaning that data is transported two or four times per cycle. 

Higher numbers sell so the manufacturers（制造商） like to advertise a quad-pumped 200MHz bus as an “effective” 800MHz bus.

## SDRAM 现状

For SDRAM today each data transfer consists of 64 bits – 8 bytes. 

The transfer rate of the FSB is therefore 8 bytes multiplied by the effective bus frequency (6.4GB/s for the quad-pumped 200MHz bus). 

That sounds a lot but it is the burst（爆发） speed, the maximum speed which will never be surpassed（超越）.

ps: 正如同在算法计算复杂度一样，一般我们应该考虑最大复杂度，而不是最好的性能场景。

As we will see now the protocol for talking to the RAM modules has a lot of downtime（停机） when no data can be transmitted（发送）. 

It is exactly this downtime which we must understand and minimize to achieve the best performance.

# Read Access Protocol

Figure 2.8 shows the activity on some of the connectors of a DRAM module which happens in three differently colored phases. 

As usual, time flows from left to right. 

A lot of details are left out. 

Here we only talk about the bus clock, RAS and CAS signals, and the address and data buses. 

A read cycle begins with the memory controller making the row address available on the address bus and lowering the RAS signal. 

All signals are read on the rising edge of the clock (CLK) so it does not matter if the signal is not completely square as long as it is stable at the time it is read. 

Setting the row address causes the RAM chip to start latching（闭锁） the addressed row

![image](https://user-images.githubusercontent.com/18375710/61629712-4ef2b680-acb8-11e9-91c3-922530641522.png)

The CAS signal can be sent after tRCD (RAS-to-CAS Delay) clock cycles. 

The column address is then transmitted（发送） by making it available on the address bus and lowering the CAS line. 

Here we can see how the two parts of the address (more or less halves, nothing else makes sense) can be transmitted over the same address bus.

Now the addressing is complete and the data can be transmitted. 

The RAM chip needs some time to prepare for this. 

The delay is usually called CAS Latency (CL). 

In Figure 2.8 the CAS latency is 2. 

It can be higher or lower, depending on the quality of the memory controller, motherboard, and DRAM module. 

The latency can also have half values. 

With CL=2.5 the first data would be available at the first falling flank（侧面） in the blue area.

With all this preparation to get to the data it would be wasteful to only transfer one data word. 

This is why DRAM modules allow the memory controller to specify how much data is to be transmitted. 

Often the choice is between 2, 4, or 8 words. 

This allows filling entire lines in the caches without a new RAS/CAS sequence. 

It is also possible for the memory controller to send a new CAS signal without resetting the row selection. 

In this way, consecutive（连续） memory addresses can be read from or written to significantly faster because the RAS signal does not have to be sent and the row does not have to be deactivated （停用）(see below). 

Keeping the row “open” is something the memory controller has to decide. 

Speculatively leaving it open all the time has disadvantages with real-world applications (see [3]). 

Sending new CAS signals is only subject to the Command Rate of the RAM module (usually specified as Tx, where x is a value like 1 or 2; it will be 1 for high-performance DRAM modules which accept new commands every cycle).

## 例子分析

In this example the SDRAM spits out（吐出） one word per cycle. 

This is what the first generation does. 

DDR is able to transmit two words per cycle. 

This cuts down on the transfer time but does not change the latency（频率）. 

In principle, DDR2 works the same although in practice it looks different. 

There is no need to go into the details here. 

It is sufficient to note that DDR2 can be made faster, cheaper, more reliable, and is more energy efficient (see [6] for more information).

# 参考资料

[cpumemory.pdf-7](https://people.freebsd.org/~lstewart/articles/cpumemory.pdf)

* any list
{:toc}