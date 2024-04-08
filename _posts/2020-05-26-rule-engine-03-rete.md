---
layout: post
title: 规则引擎-03-RETE 算法
date:  2020-5-26 16:05:35 +0800
categories: [Engine]
tags: [design, rule-engine, sf]
published: true
---

# 基于 rete 算法的规则引擎

在 AI 领域，产生式系统是一个很重要的理论，产生式推理分为正向推理和逆向推理产生式，其规则的一般形式是：IF 条件 THEN 操作。

rete 算法是实现产生式系统中正向推理的高效模式匹配算法，通过形成一个 rete 网络进行模式匹配，利用基于规则的系统的时间冗余性和结构相似性特征，提高系统模式匹配效率。

本文将介绍的 Drools 引擎就是利用 rete 算法对规则进行分析，形成 rete 网络，对模式进行匹配。

# rete 算法研究

## rete 算法概述

Rete 算法最初是由卡内基梅隆大学的 Charles L.Forgy 博士在 1974 年发表的论文中所阐述的算法, 该算法提供了专家系统的一个高效实现。

自 Rete 算法提出以后, 它就被用到一些大型的规则系统中, 像 ILog、Jess、JBoss Rules 等都是基于 RETE 算法的规则引擎。

Rete 在拉丁语中译为”net”，即网络。

Rete 匹配算法是一种进行大量模式集合和大量对象集合间比较的高效方法，通过网络筛选的方法找出所有匹配各个模式的对象和规则。

其核心思想是**将分离的匹配项根据内容动态构造匹配树，以达到显著降低计算量的效果。**

Rete 算法可以被分为两个部分：规则编译和规则执行。

当 Rete 算法进行事实的断言时，包含三个阶段：匹配、选择和执行，称做 match-select-act cycle。

## rete 算法相关概念

Rete 算法规则相关的概念有如下几个：

### Fact

Fact：已经存在的事实，它是指对象之间及对象属性之间的多元关系，为简单起见，事实用一个三元组来表示：（标识符 `^` 属性 值）。

例如如下事实：

```
w1:(B1 ^ on B2) w6:(B2 ^color blue) 
w2:(B1 ^ on B3) w7:(B3 ^left-of B4) 
w3:(B1 ^ color red) w8:(B3 ^on table) 
w4:(B2 ^on table) w9:(B3 ^color red) 
w5:(B2 ^left-of B3)
```

### Rule：规则，

包含条件和行为两部分，条件部分又叫左手元（LHS），行为部分又叫右手元（RHS）。

条件部分可以有多条条件，并且可以用 and 或 or 连接。

其一般形式如下：

```
(name-of-this-production 
 LHS /*one or more conditions*/ 
 --> 
 RHS /*one or more actions*/ 
 ) 
```

例如，下面的例子：
 
```
(find-stack-of-two-blocks-to-the-left-of-a-red-block 
(^on) 
(^left-of) 
(^color red) 
--> 
...RHS... 
)
 ```

### Patten

Patten：模式，也就是规则的条件部分，是已知事实的泛化形式，是未实例化的多元关系。

比如，前面的那条规则的条件部分：

```
 (^on) 
 (^left-of) 
 (^color red) 
```

### Rete 网络的概念

RootNode：Rete 网络的根节点，所有对象通过 Root 节点进入网络。

ObjectTypeNode：对象类型节点，保证所传入的对象只会进入自己类型所在的网络，提高了工作效率。

AlphaNode：Alpha 节点是规则的条件部分的一个模式，一个对象只有和本节点匹配成功后，才能继续向下传播。

JoinNode：用作连接（jion）操作的节点，相当于 and，相当于数据库的表连接操作，属于 betaNode 类型的节点。BetaNode 节点用于比较两个对象和它们的字段。两个对象可能是相同或不同的类型。我们将这两个输入称为左和右。BetaNode 的左输入通常是一组对象的数组。BetaNode 具有记忆功能。左边的输入被称为 Beta Memory，会记住所有到达过的语义。右边的输入成为 Alpha Memory，会记住所有到达过的对象。

NotNode：根据右边输入对左边输入的对象数组进行过滤，两个 NotNode 可以完成‘ exists ’检查。

LeftInputAdapterNodes：将单个对象转化成对象数组。

Terminal Nodes 被用来表明一条规则已经匹配了它的所有条件（conditions）。

## 简单的网络

展示的是一个简单的 rete 网络：

![简单的 rete 网络](https://www.ibm.com/developerworks/cn/opensource/os-drools/image001.png)

## 创建 rete 网络

Rete 算法的编译结果是创建了规则集对应的 Rete 网络, 它是一个事实可以在其中流动的图。

创建 rete 网络的过程如下： 

1) 创建根节点； 

2) 加入一条规则 1 (Alpha 节点从 1 开始，Beta 节点从 2 开始 )； 

a. 取出规则中的一个模式 1，检查模式中的参数类型，如果是新类型，则加入一个类型节点； 

b. 检查模式 1 对应的 Alpha 节点是否已存在，如果存在则记录下节点位置，如果没有则将模式 1 作为一个 Alpha 节点加入到网络中，同时根据 Alpha 节点的模式建立 Alpha 内存表； 

c. 重复 b 直到所有的模式处理完毕； 

d. 组合 Beta 节点，按照如下方式： Beta(2) 左输入节点为 Alpha(1)，右输入节点为 Alpha(2) Beta(i) 左输入节点为 Beta(i-1)，右输入节点为 Alpha(i) i>2 并将两个父节点的内存表内联成为自己的内存表； 

e. 重复 d 直到所有的 Beta 节点处理完毕； 

f. 将动作（Then 部分）封装成叶节点（Action 节点）作为 Beta(n) 的输出节点； 

3) 重复 2) 直到所有规则处理完毕； 执行完上述步骤，建立的 rete 网络如下图 2 (a 图为含有 3 个规则的 rete 网络，b 图为含有一个规则的 rete 网络 )：

- beta-network and alpha-network

![beta-network and alpha-network](https://www.ibm.com/developerworks/cn/opensource/os-drools/image002.png)

上图（a 图和 b 图），他们的左边的部分都是 beta-network, 右边都是 alpha-network, 圆圈是 join-node。

右边的 alpha-network 是根据事实库和规则条件构建的，其中除 alpha-network 节点的节点都是根据每一条规则条件的模式, 从事实库中 match 过来的，即在编译构建网络的过程中静态建立的。

只要事实库是稳定的，RETE 算法的执行效率应该是非常高的，其原因就是已经通过静态的编译，构建了 alpha-network。

左边的 beta-network 表现出了 rules 的内容，其中 p1,p2,p3 共享了许多 BetaMemory 和 join-node, 这样能加快匹配速度。

## Rete 算法的匹配过程

匹配过程如下：

1) 对于每个事实，通过 select 操作进行过滤，使事实沿着 rete 网达到合适的 alpha 节点。

2) 对于收到的每一个事实的 alpha 节点，用 Project( 投影操作 ) 将那些适当的变量绑定分离出来。使各个新的变量绑定集沿 rete 网到达适当的 bete 节点。

3) 对于收到新的变量绑定的 beta 节点，使用 Project 操作产生新的绑定集，使这些新的变量绑定沿 rete 网络至下一个 beta 节点以至最后的 Project。

4) 对于每条规则，用 project 操作将结论实例化所需的绑定分离出来。

如果把 rete 算法类比到关系型数据库操作，则事实集合就是一个关系，每条规则就是一个查询，再将每个事实绑定到每个模式上的操作看作一个 Select 操作，记一条规则为 P，规则中的模式为 c1,c2,…,ci, Select 操作的结果记为 r(ci), 则规则 P 的匹配即为 r(c1)◇r(c2)◇…◇(rci)。

其中◇表示关系的连接（Join）操作。

Rete 网络的连接（Join）和投影 (Project) 和对数据库的操作形象对比如图 3 所示：

- 图 3. join and project

![join and project](https://www.ibm.com/developerworks/cn/opensource/os-drools/image003.png)

## 算法特点

Rete 算法有如下特点：

a． Rete 算法是一种启发式算法，不同规则之间往往含有相同的模式，因此在 beta-network 中可以共享 BetaMemory 和 betanode。如果某个 betanode 被 N 条规则共享，则算法在此节点上效率会提高 N 倍。

b. Rete 算法由于采用 AlphaMemory 和 BetaMemory 来存储事实，当事实集合变化不大时，保存在 alpha 和 beta 节点中的状态不需要太多变化，避免了大量的重复计算，提高了匹配效率。

c. 从 Rete 网络可以看出，Rete 匹配速度与规则数目无关，这是因为事实只有满足本节点才会继续向下沿网络传递。

## 不足

Rete 算法的不足：

a. 事实的删除与事实的添加顺序相同, 除了要执行与事实添加相同的计算外, 还需要执行查找, 开销很高。

b. RETE 算法使用了β存储区存储已计算的中间结果, 以牺牲空间换取时间, 从而加快系统的速度。然而β存储区根据规则的条件与事实的数目而成指数级增长, 所以当规则与事实很多时, 会耗尽系统资源 。

## 建议

针对 Rete 算法的特点和不足，在应用或者开发基于 Rete 算法的规则引擎时，提出如下建议：

a. 容易变化的规则尽量置后匹配，可以减少规则的变化带来规则库的变化。

b. 约束性较为通用或较强的模式尽量置前匹配，可以避免不必要的匹配。

c. 针对 Rete 算法内存开销大和事实增加删除影响效率的问题，技术上应该在 alpha 内存和 beata 内存中，只存储指向内存的指针，并对指针建里索引（可用 hash 表或者非平衡二叉树）。

d. Rete 算法 JoinNode 可以扩展为 AndJoinNode 和 OrJoinNode，两种节点可以再进行组合。

# 参考资料

[开源规则流引擎实践](https://www.ibm.com/developerworks/cn/opensource/os-drools/index.html)

* any list
{:toc}