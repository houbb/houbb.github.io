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

# Precharge and Activation（预充电和激活）

Figure 2.8 does not cover the whole cycle. 

It only shows parts of the full cycle of accessing DRAM. 

Before a new RAS signal can be sent the currently latched row must be deactivated and the new row must be precharged. 

We can concentrate（浓缩） here on the case where this is done with an explicit（明确的） command. 

There are improvements to the protocol which, in some situations, allows this extra step to be avoided. 

The delays introduced by precharging still affect the operation, though.

## SDRAM 模型

![image](https://user-images.githubusercontent.com/18375710/61675477-0fb17d80-ad2b-11e9-9744-506d251b1c04.png)

Figure 2.9 shows the activity starting from one CAS signal to the CAS signal for another row. 

The data requested with the first CAS signal is available as before, after CL cycles. 

In the example two words are requested which, on a simple SDRAM, takes two cycles to transmit（传递）. 

Alternatively（另外）, imagine four words on a DDR chip.

## DRAM 模型

Even on DRAM modules with a command rate of one the precharge command cannot be issued right away. 

It is necessary to wait as long as it takes to transmit the data. 

In this case it takes two cycles. 

This happens to be the same as CL but that is just a coincidence（巧合，像抛硬币一样。）. 

The precharge signal has no dedicated（专用） line; instead, some implementations issue it by lowering the Write Enable (WE)
and RAS line simultaneously（同时）.

This combination has no useful meaning by itself (see [18] for encoding details).

ps: 也就是无法立刻被执行。需要去等待信息的传递时间。这种本身是没有意义的。

## 预充电命令 tRP 等待

Once the precharge command is issued it takes tRP (Row Precharge time) cycles until the row can be selected. 

In Figure 2.9 much of the time (indicated by the purplish color-紫色部分表示) overlaps（冲突） with the memory transfer (light blue).

This is good! 

But tRP is larger than the transfer time and so the next RAS signal is stalled（停滞） for one cycle.

If we were to continue the timeline in the diagram we would find that the next data transfer happens 5 cycles after the previous one stops. 

This means the data bus is only in use two cycles out of seven. （利用率只有 2/7）

Multiply this with the FSB speed and the theoretical 6.4GB/s for a 800MHz bus become 1.8GB/s. 

That is bad and must be avoided. 

The techniques described in section 6 help to raise this number. 

But the programmer usually has to do her share.

## SDRAM 模型 tRAS 等待问题

There is one more timing value for a SDRAM module which we have not discussed. 

In Figure 2.9 the precharge command was only limited by the data transfer time. 

Another constraint（约束） is that an SDRAM module needs time after a RAS signal before it can precharge another row (denoted（表示） as tRAS). 

This number is usually pretty high, in the order of two or three times the tRP value. 

This is a problem if, after a RAS signal, only one CAS signal follows and the data transfer is finished in a few cycles.

Assume that in Figure 2.9 the initial CAS signal was preceded directly by a RAS signal and that tRAS is 8 cycles. 

Then the precharge command would have to be delayed by one additional cycle since the sum of tRCD, CL, and tRP (since it is larger than the data transfer time) is only 7 cycles.

## DDR 模型表示 

DDR modules are often described using a special notation: w-x-y-z-T. 

For instance: 2-3-2-8-T1. This means:

![image](https://user-images.githubusercontent.com/18375710/61676341-20172780-ad2e-11e9-9ca4-2b27c49d0c14.png)

There are numerous other timing constants which affect the way commands can be issued and are handled. 

Those five constants are in practice sufficient to determine the performance of the module, though.

ps: 使用这 5 个常量足以确定模块的性能。

It is sometimes useful to know this information for the computers in use to be able to interpret（翻译） certain measurements（测量）. 

It is definitely useful to know these details when buying computers since they, along with the FSB and SDRAM module speed, are among the most important factors determining a computer’s speed.

The very adventurous reader could also try to tweak（拧） a system. 

Sometimes the BIOS allows changing some or all these values. 

SDRAM modules have programmable registers where these values can be set. 

Usually the BIOS picks the best default value. 

If the quality of the RAM module is high it might be possible to reduce the one or the other latency without affecting the stability of the computer. 

Numerous overclocking websites（无数超频网站） all around the Internet provide ample（充足） of documentation for doing this. 

Do it at your own risk, though and do not say you have not been warned.

# Recharging

A mostly-overlooked topic when it comes to DRAM access is recharging. 

As explained in section 2.1.2, DRAM cells must constantly be refreshed. 

This does not happen completely transparently（完全透明） for the rest of the system. 

ps: 这个充电环节并不是完全透明的，换言之，我们需要掌握其原理和过程。

At times when a row10 is recharged no access is possible. 

The study in [3] found that “surprisingly, DRAM refresh organization can affect performance dramatically”.

ps：充电可以显著影响性能。个人推广猜测，放电也是同样的道理。

Each DRAM cell must be refreshed every 64ms according to the JEDEC (Joint Electron Device Engineering Council) specification. （联合电子器件工程评议会规格）

If a DRAM array has 8,192 rows this means the memory controller has to issue a refresh command on averge every 7.8125µs (refresh commands
can be queued so in practice the maximum interval between two requests can be higher). 

It is the memory controller’s responsibility to schedule the refresh commands. 

The DRAM module keeps track of the address of the last refreshed row and automatically increases the address counter for each new request.

There is really not much the programmer can do about the refresh and the points in time when the commands are issued. 

But it is important to keep this part of the DRAM life cycle in mind when interpreting measurements. 

If a critical word has to be retrieved（纠正） from a row which currently is being refreshed the processor could be stalled（停滞） for quite a long time. 

How long each refresh takes depends on the DRAM module.

# Memory Types

It is worth spending some time on the current and soonto-be（很快成为） current memory types in use. 

We will start with SDR (Single Data Rate) SDRAMs since they are the basis of the DDR (Double Data Rate) SDRAMs. 

## SDRs

SDRs were pretty simple. 

The memory cells and the data transfer rate were identical

![image](https://user-images.githubusercontent.com/18375710/61677120-ef84bd00-ad30-11e9-9548-8016a4b90706.png)

In Figure 2.10 the DRAM cell array can output the memory content at the same rate it can be transported over the memory bus. 

If the DRAM cell array can operate at 100MHz, the data transfer rate of the bus of a single cell is thus 100Mb/s. 

The frequency f for all components is the same. 

Increasing the throughput of the DRAM chip is expensive since the energy consumption（消费） rises with the frequency. 

With a huge number of array cells this is prohibitively（登天） expensive.

```
Power = Dynamic Capacity * Voltage^2 * Frequency.
```

In reality it is even more of a problem since increasing the frequency usually also requires increasing the voltage（电压） to maintain stability of the system. 

## DDR SDRAM

DDR SDRAM (called DDR1 retroactively（追溯）) manages to improve the throughput without increasing any of the involved frequencies.

![image](https://user-images.githubusercontent.com/18375710/61677441-3921d780-ad32-11e9-8831-b004c93368d5.png)

The difference between SDR and DDR1 is, as can be seen in Figure 2.11 and guessed from the name, that twice
the amount of data is transported per cycle. 

ps: 直观的发现，多了一个 IO Buffer。

I.e., the DDR1 chip transports data on the rising and falling edge.

This is sometimes called a “double-pumped” bus. 

To make this possible without increasing the frequency of the cell array a buffer has to be introduced. 

This buffer holds two bits per data line. 

This in turn requires that, in the cell array in Figure 2.7, the data bus consists of two lines. 

Implementing this is trivial: one only has to use the same column address for two DRAM cells and access them in parallel. 

The changes to the cell array to implement this are also minimal.

The SDR DRAMs were known simply by their frequency (e.g., PC100 for 100MHz SDR). 

To make DDR1 DRAM sound better the marketers had to come up with a new scheme since the frequency did not change. 

They came with a name which contains the transfer rate in bytes a DDR module (they have 64-bit busses) can sustain（支持）:

```
100MHz × 64bit × 2 = 1, 600MB/s
```

### DDR2 SDRAM

Hence a DDR module with 100MHz frequency is called PC1600. 

With 1600 > 100 all marketing requirements are fulfilled; 

it sounds much better although the improvement is really only a factor of two.

![image](https://user-images.githubusercontent.com/18375710/61677710-1e9c2e00-ad33-11e9-9be4-00e8a27ee0b1.png)

To get even more out of the memory technology DDR2 includes a bit more innovation（革新）. 

The most obvious change that can be seen in Figure 2.12 is the doubling of the frequency of the bus. 

Doubling the frequency means doubling the bandwidth. 

ps: 双倍的频率，意味着双倍的带宽。也就是可以更多倍了，当然这一切的增长都是有瓶颈的。

Since this doubling of the frequency is not economical for the cell array it is now required that the I/O buffer gets four bits in each clock cycle which it then can send on the bus. 

This means the changes to the DDR2 modules consist of making only the I/O buffer component of the DIMM capable of running
at higher speeds. 

This is certainly possible and will not require measurably more energy, it is just one tiny component and not the whole module. 

The names the marketers came up with for DDR2 are similar to the DDR1 names only in the computation of the value the factor of
two is replaced by four (we now have a quad-pumped bus). 

- 当今使用的模型

Table 2.1 shows the names of the modules in use today.

![image](https://user-images.githubusercontent.com/18375710/61677939-ec3f0080-ad33-11e9-95ed-4b1589df6b55.png)

There is one more twist（曲解） to the naming. 

The FSB speed used by CPU, motherboard（主机板）, and DRAM module is specified by using the effective frequency. 

I.e., it factors in the transmission on both flanks of the clock cycle and thereby inflates the number. 

So, a 133MHz module with a 266MHz bus has an FSB “frequency” of 533MHz.

## DDR3 SDRAM

The specification for DDR3 (the real one, not the fake GDDR3 used in graphics cards) calls for more changes along the lines of the transition to DDR2. 

The voltage（电压） will be reduced from 1.8V for DDR2 to 1.5V for DDR3.

Since the power consumption equation is calculated using the square of the voltage this alone brings a 30% improvement. 

Add to this a reduction in die size plus other electrical advances and DDR3 can manage, at the same frequency, to get by with half the power consumption.

Alternatively, with higher frequencies, the same power envelope can be hit. 

Or with double the capacity the same heat emission（发射） can be achieved.

The cell array of DDR3 modules will run at a quarter of the speed of the external bus which requires an 8 bit I/O
buffer, up from 4 bits for DDR2. 

See Figure 2.13 for the schematics（原理图）.

![image](https://user-images.githubusercontent.com/18375710/61678225-d120c080-ad34-11e9-87f9-89381cdad6d6.png)

Initially DDR3 modules will likely have slightly higher CAS latencies just because the DDR2 technology is more mature（成熟）. 

This would cause DDR3 to be useful only at frequencies which are higher than those which can be achieved with DDR2, and, even then, mostly when bandwidth is more important than latency. 

There is already talk about 1.3V modules which can achieve the same CAS latency as DDR2. 

In any case, the possibility of achieving higher speeds because of faster buses will outweigh（超过） the increased latency.

### 问题

One possible problem with DDR3 is that, for 1,600Mb/s transfer rate or higher, the number of modules per channel may be reduced to just one. 

In earlier versions this requirement held for all frequencies, so one can hope that the requirement will at some point be lifted for all
frequencies. 

Otherwise the capacity of systems will be severely limited.

Table 2.2 shows the names of the DDR3 modules we are likely to see. 

JEDEC agreed so far on the first four types. 

Given that Intel’s 45nm processors have an FSB speed of 1,600Mb/s, the 1,866Mb/s is needed for the overclocking
market. 

We will likely see more of this towards the end of the DDR3 lifecycle.

![image](https://user-images.githubusercontent.com/18375710/61678514-98cdb200-ad35-11e9-8d3c-3c61d055e3a6.png)

# DDR Memory 的问题

All DDR memory has one problem: the increased bus frequency makes it hard to create parallel data busses.

A DDR2 module has 240 pins. 

All connections to data and address pins must be routed so that they have approximately the same length. 

Even more of a problem is that, if more than one DDR module is to be daisy-chained（菊花链） on the same bus, the signals get more and more distorted（扭曲） for each additional module. 

The DDR2 specification allow only two modules per bus (aka channel), the DDR3 specification only one module for high frequencies. 

With 240 pins per channel a single Northbridge cannot reasonably drive more than two channels.

The alternative is to have external memory controllers (as in Figure 2.2) but this is expensive.

ps: 内存控制器，价格昂贵。

What this means is that commodity（商业的） motherboards are restricted to hold at most four DDR2 or DDR3 modules.

This restriction severely limits the amount of memory a system can have. 

Even old 32-bit IA-32 processors can handle 64GB of RAM and memory demand even for home use is growing, so something has to be done.

One answer is to add memory controllers into each processor as explained in section 2. 

AMD does it with the Opteron line and Intel will do it with their CSI technology. 

This will help as long as the reasonable amount of memory a processor is able to use can be connected to a single processor. 

In some situations this is not the case and this setup will introduce a NUMA architecture and its negative effects. 

For some situations another solution is needed.

## Intel 的处理方式

Intel’s answer to this problem for big server machines, at least at the moment, is called Fully Buffered DRAM (FBDRAM). 

The FB-DRAM modules use the same memory chips as today’s DDR2 modules which makes them relatively cheap to produce. 

The difference is in the connection with the memory controller. 

Instead of a parallel data bus FB-DRAM utilizes a serial bus (Rambus DRAM had this back when, too, and SATA is the successor of PATA,
as is PCI Express for PCI/AGP). 

The serial bus can be driven at a much higher frequency, reverting（回复） the negative impact of the serialization and even increasing the bandwidth. 

### 顺序化 BUS 的优点

The main effects of using a serial bus are

1. more modules per channel can be used.

2. more channels per Northbridge/memory controller can be used.

3. the serial bus is designed to be fully-duplex (two lines).

4. it is cheap enough to implement a differential bus (two lines in each direction) and so increase the speed.

An FB-DRAM module has only 69 pins, compared with the 240 for DDR2. 

Daisy chaining FB-DRAM modules is much easier since the electrical effects of the bus can be handled much better. 

The FB-DRAM specification allows up to 8 DRAM modules per channel.

Compared with the connectivity requirements of a dualchannel Northbridge（双通道北桥） it is now possible to drive 6 channels of FB-DRAM with fewer pins: 2 × 240 pins versus 6 × 69 pins. 

The routing for each channel is much simpler which could also help reducing the cost of the motherboards.

Fully duplex parallel busses are prohibitively（登天） expensive for the traditional DRAM modules, duplicating all those lines is too costly. 

ps: 就是太贵。

With serial lines (even if they are differential, as FB-DRAM requires) this is not the case and so the serial bus is designed to be fully duplexed, which means, in some situations, that the bandwidth is theoretically doubled alone by this. 

But it is not the only place where parallelism is used for bandwidth increase. 

Since an FB-DRAM controller can run up to six channels at the same time the bandwidth can be increased even for systems with smaller amounts of RAM by using FB-DRAM.

Where a DDR2 system with four modules has two channels, the same capacity can be handled via four channels using an ordinary FB-DRAM controller. 

The actual bandwidth of the serial bus depends on the type of DDR2 (or DDR3) chips used on the FB-DRAM module.

### 优缺点

- 优点

We can summarize the advantages like this:

![image](https://user-images.githubusercontent.com/18375710/61679279-4b067900-ad38-11e9-8ec3-446fe2764e4b.png)

- 缺点

There are a few drawbacks to FB-DRAMs if multiple DIMMs on one channel are used. 

The signal is delayed–albeit minimally–at each DIMM in the chain, thereby increasing the latency. 

A second problem is that the chip driving the serial bus requires significant amounts of energy because of the very high frequency and the need to drive a bus. 

But for the same amount of memory with the same frequency FB-DRAM can always be faster than DDR2 and DDR3 since the up-to four DIMMS can each get their own channel; 

for large memory systems DDR simply has no answer using commodity components.

# Conclusions

This section should have shown that accessing DRAM is not an arbitrarily（任意的） fast process. 

At least not fast compared with the speed the processor is running and with which it can access registers and cache. 

It is important to keep in mind the differences between CPU and memory frequencies. 

An Intel Core 2 processor running at 2.933GHz and a 1.066GHz FSB have a clock ratio of 11:1 (note: the 1.066GHz bus is quad-pumped). 

Each stall of one cycle on the memory bus means a stall of 11 cycles for the processor. 

For most machines the actual DRAMs used are slower, thusly increasing the delay. 

Keep these numbers in mind when we are talking about stalls in the upcoming sections.

The timing charts for the read command have shown that DRAM modules are capable of high sustained data rates.

Entire DRAM rows could be transported without a single stall. 

The data bus could be kept occupied 100%. 

For DDR modules this means two 64-bit words transferred each cycle. 

With DDR2-800 modules and two channels this means a rate of 12.8GB/s.

But, unless designed this way, DRAM access is not always sequential. 

Non-continuous memory regions are used which means precharging and new RAS signals are needed. 

This is when things slow down and when the DRAM modules need help. 

The sooner the precharging can happen and the RAS signal sent the smaller the penalty when the row is actually used.

Hardware and software prefetching (see section 6.3) can be used to create more overlap in the timing and reduce the stall. 

Prefetching also helps shift memory operations in time so that there is less contention at later times, right before the data is actually needed. 

This is a frequent problem when the data produced in one round has to be stored and the data required for the next round has to be
read. 

By shifting the read in time, the write and read operations do not have to be issued at basically the same time.

# 参考资料

[cpumemory.pdf-7](https://people.freebsd.org/~lstewart/articles/cpumemory.pdf)

* any list
{:toc}