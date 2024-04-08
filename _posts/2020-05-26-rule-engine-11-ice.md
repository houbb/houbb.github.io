---
layout: post
title: 规则引擎-11-ice Java规则引擎-ice，针对复杂/灵活变动业务，提供一个新的抽象编排解决方案，轻量级，高性能并提供可视化操作页面
date:  2020-5-26 16:05:35 +0800
categories: [Engine]
tags: [design, rule-engine, sf] 
published: true
---

## 背景介绍

业务中是否写了大量的 if-else？是否受够了这些 if-else 还要经常变动？

业务中是否做了大量抽象，发现新的业务场景还是用不上？

是否各种调研规则引擎，发现不是太重就是接入或维护太麻烦，最后发现还是不如硬编码？

接下来给大家介绍一款全新的开源规则引擎——ice，以一个简单的例子，从最底层的编排思想，阐述 ice 与其他规则引擎的不同；讲述 ice 是如何使用全新的设计思想，契合解耦和复用的属性，还你最大的编排自由度。

## 设计思路

为了方便理解，设计思路将伴随着一个简单的充值例子展开。

### 举例

X公司将在国庆放假期间，开展一个为期七天的充值小活动，活动内容如下：

**活动时间：**(10.1-10.7)

**活动内容：**

充值100元 送5元余额 (10.1-10.7)

充值50元   送10积分 (10.5-10.7)

**活动备注：** 不叠加送(充值100元只能获得5元余额，不会叠加赠送10积分)

简单拆解一下，想要完成这个活动，我们需要开发如下模块：


![](http://waitmoon.com/images/introduction/2-dark.png#dark)

![](http://waitmoon.com/images/introduction/2-light.png#light)

如图，当用户充值成功后，会产生对应充值场景的参数包裹Pack(类Activiti/Drools的Fact)，包裹里会有充值用户的uid，充值金额cost，充值的时间requestTime等信息。我们可以通过定义的key，拿到包裹中的值(类似map.get(key))。

模块怎么设计无可厚非，重点要讲的是后面的怎么编排实现配置自由，接下来将通过已有的上述节点，讲解不同的规则引擎在核心的编排上的优缺点，并比较ice是怎么做的。

### 流程图式实现

类Activiti、 Flowable实现：

![](http://waitmoon.com/images/introduction/3-dark.png#dark)
![](http://waitmoon.com/images/introduction/3-light.png#light)

流程图式实现，应该是我们最常想到的编排方式了~ 看起来非常的简洁易懂，通过特殊的设计，如去掉一些不必要的线，可以把UI做的更简洁一些。但由于有时间属性，其实时间也是一个规则条件，加上之后就变成了：

![](http://waitmoon.com/images/introduction/4-dark.png#dark)
![](http://waitmoon.com/images/introduction/4-light.png#light)

看起来也还好

### 执行树式实现

类Drools实现(When X Then Y)：

![](http://waitmoon.com/images/introduction/5-dark.png#dark)
![](http://waitmoon.com/images/introduction/5-light.png#light)

这个看起来也还好，再加上时间线试试：

![](http://waitmoon.com/images/introduction/6-dark.png#dark)
![](http://waitmoon.com/images/introduction/6-light.png#light)

依旧比较简洁，至少比较流程图式，我会比较愿意修改这个。

### 变动

上面两种方案的优点在于，可以把一些零散的配置结合业务很好的管理了起来，对配置的小修小改，都是信手拈来，但是真实的业务场景，可能还是要锤爆你，有了灵活的变动，一切都不一样了。

#### 理想

*不会变的，放心吧，就这样，上*

#### 现实

①充值100元改成80吧，10积分变20积分吧，时间改成10.8号结束吧（*微微一笑*，毕竟我费了这么大劲搞规则引擎，终于体现到价值了！）

②用户参与积极性不高啊，去掉不叠加送吧，都送（*稍加思索*，费几个脑细胞挪一挪还是可以的，怎么也比改代码再上线强吧！）

③5元余额不能送太多，设置个库存100个吧，对了，库存不足了充100元还是得送10积分的哈（*卒…*早知道还不如硬编码了）

以上变动其实并非看起来不切实际，毕竟真实线上变动比这离谱的多的是，流程图式和执行树式实现的主要缺点在于，牵一发而动全身，改动一个节点需要瞻前顾后，如果考虑不到位，很容易弄错，而且这还只是一个简单的例子，现实的活动内容要比这复杂的多的多，时间线也是很多条，考虑到这，再加上使用学习框架的成本，往往得不偿失，到头来发现还不如硬编码。

怎么办？

### ice是怎么做的？

#### 引入关系节点

关系节点为了控制业务流转

**AND**

所有子节点中，有一个返回false 该节点也将是false，全部是true才是true，在执行到false的地方终止执行，类似于Java的&&

**ANY**

所有子节点中，有一个返回true 该节点也将是true，全部false则false，在执行到true的地方终止执行，类似于Java的||

**ALL**

所有子节点都会执行，有任意一个返回true该节点也是true，没有true有一个节点是false则false，没有true也没有false则返回none，所有子节点执行完毕终止

**NONE**

所有子节点都会执行，无论子节点返回什么，都返回none

**TRUE**

所有子节点都会执行，无论子节点返回什么，都返回true，没有子节点也返回true(其他没有子节点返回none)

#### 引入叶子节点

叶子节点为真正处理的节点

**Flow**

一些条件与规则节点，如例子中的ScoreFlow

**Result**

一些结果性质的节点，如例子中的AmountResult，PointResult

**None**

一些不干预流程的动作，如装配工作等，如下文会介绍到的TimeChangeNone

有了以上节点，我们要怎么组装呢？

![](http://waitmoon.com/images/introduction/7-dark.png#dark)
![](http://waitmoon.com/images/introduction/7-light.png#light)

如图，使用树形结构(对传统树做了镜像和旋转)，执行顺序还是类似于中序遍历，从root执行，root是个关系节点，从上到下执行子节点，若用户充值金额是70元，执行流程：

```[ScoreFlow-100:false]→[AND:false]→[ScoreFlow-50:true]→[PointResult:true]→[AND:true]→[ANY:true]```

这个时候可以看到，之前需要剥离出的时间，已经可以融合到各个节点上了，把时间配置还给节点，如果没到执行时间，如发放积分的节点10.5日之后才生效，那么在10.5之前，可以理解为这个节点不存在。

#### 变动的解决

对于①直接修改节点配置就可以

对于②直接把root节点的ANY改成ALL就可以(叠加送与不叠加送的逻辑在这个节点上，属于这个节点的逻辑就该由这个节点去解决)

对于③由于库存的不足，相当于没有给用户发放，则AmountResult返回false，流程还会继续向下执行，不用做任何更改

再加一个棘手的问题，当时间线复杂时，测试工作以及测试并发要怎么做？

一个10.1开始的活动，一定是在10.1之前开发上线完毕，比如我在9.15要怎么去测试一个10.1开始的活动？在ice中，只需要稍微修改一下：

![](http://waitmoon.com/images/introduction/8-dark.png#dark)
![](http://waitmoon.com/images/introduction/8-light.png#light)

如图，引入一个负责更改时间的节点TimeChangeNone(更改包裹中的requestTime)，后面的节点执行都是依赖于包裹中的时间即可，TimeChangeNone类似于一个改时间的插件一样，如果测试并行，那就给多个测试每人在自己负责的业务上加上改时间插件即可。

#### 特性

为什么这么拆解呢？为什么这样就能解决这些变动与问题呢？

其实，就是使用树形结构解耦，流程图式和执行树式实现在改动逻辑的时候，不免需要瞻前顾后，但是ice不需要，ice的业务逻辑都在本节点上，每一个节点都可以代表单一逻辑，比如我改不叠加送变成叠加送这一逻辑就只限制在那个ANY节点逻辑上，只要把它改成我想要的逻辑即可，至于子节点有哪些，不用特别在意，节点之间依赖包裹流转，每个节点执行完的后续流程不需要自己指定。

因为自己执行完后的执行流程不再由自己掌控，就可以做到复用：

![](http://waitmoon.com/images/introduction/9-dark.png#dark)
![](http://waitmoon.com/images/introduction/9-light.png#light)

如图，参与活动这里用到的TimeChangeNone，如果现在还有个H5页面需要做呈现，不同的呈现也与时间相关，怎么办？只需要在呈现活动这里使用同一个实例，更改其中一个，另一个也会被更新，避免了到处改时间的问题。

同理，如果线上出了问题，比如sendAmount接口挂了，由于是error不会反回false继续执行，而是提供了可选策略，比如将Pack以及执行到了哪个节点落盘起来，等到接口修复，再继续丢进ice重新跑即可(由于落盘时间是发生问题时间，完全不用担心活动结束了的修复不生效问题)，同样的，如果是不关键的业务如头像服务挂了，但是依然希望跑起来，只是没有头像而已，这样可以选择跳过错误继续执行。这里的落盘等规则不细展开描述。同样的原理也可以用在mock上，只需要在Pack中增加需要mock的数据，就可以跑起来。

#### 引入前置节点

![](http://waitmoon.com/images/introduction/10-dark.png#dark)
![](http://waitmoon.com/images/introduction/10-light.png#light)

上面的逻辑中可以看到有一些AND节点紧密绑定的关系，为了视图与配置简化，增加了前置(forward)节点概念，当且仅当前置节点执行结果为非false时才会执行本节点，语义与AND相连的两个节点一致。

# 参考资料

https://github.com/deliveredtechnologies/rulebook

* any list
{:toc}