---
layout: post
title: web3 scrypt 密钥派生函数
date: 2022-10-28 21:01:55 +0800
categories: [web3]
tags: [coin, pow, sh]
published: true
---

# scrypt

scrypt（念作“ess crypt”），是加拿大计算机科学家暨计算机安全研究人员科林·珀西瓦尔（Colin Percival）于2009年所发明的密钥派生函数，当初设计用在他所创立的Tarsnap服务上。

设计时考虑到大规模的客制硬件攻击而刻意设计**需要大量内存运算**。

2016年，scrypt算法发布在RFC 7914。

scrypt的简化版被用在数个密码货币的工作量证明（Proof-of-Work）上。

# 概观

scrypt需要使用大量内存的原因来自于产生大量伪随机性（英语：pseudorandom）资料作为算法计算的基础。

一旦这些资料被产生后，算法将会以伪随机性的顺序读取这些资料产生结果。

因此最直接的实做方式将会需要大量内存将这些资料储存在内存内供算法计算。

另外一方面，由于伪随机性资料是透过算法产生，在实做上也可以在需要存取时再计算以降低内存使用量。

但由于计算成本很高，这个实做方法将大幅降低算法的速度。

这就是scrypt设计时考虑到的时空权衡，攻击者可以使用后者的方法但计算速度很慢，或是用前者的方法但因内存成本而难以大规模平行化。

# 密码货币上的使用

scrypt被用在数个密码货币的工作量证明算法上。

首先被Tenebrix所使用（2011年九月)，而后被莱特币（Litecoin）与多吉币（Dogecoin）所采用。

因GPU在计算使用scrypt的密码货币较CPU有效率，这导致了高阶显卡在2013年年底的短缺。

在2014年开始，市场上已经有使用ASIC计算scrypt算法的挖矿机。

# 参考资料

https://zh.wikipedia.org/wiki/Scrypt

* any list
{:toc}