---
layout: post
title: 高可用之熔断 Circuit Breaker-01-overview 断路器（Circuit Breaker）
date: 2018-12-23 13:55:13 +0800
categories: [Distributed]
tags: [distributed, ha, sh]
published: true
excerpt: 高可用之熔断
---

# 背景

当我们工作所在的系统处于分布式系统初期的时候，往往这时候每个服务都只部署了一个节点。

那么在这样的背景下，如果某个服务A需要发布一个新版本，往往会对正在运行的其它依赖服务A的程序产生影响。

甚至，一旦服务A的启动预热过程耗时过长，问题会更严重，大量请求会阻塞，产生级联影响，导致整个系统卡慢。

举个夸张的例子来形容：一幢楼的下水管是从最高楼直通到最低楼的，这个时候如果你家楼下的管道口堵住了，那么所有楼上的污水就会倒灌到你家。如果这导致你家的管道口也堵住了，之后又会倒灌到楼上一层，以此类推。

然而实际生活中一旦你发现了这个问题，必然会想办法先避免影响到自己家，然后跑到楼下让他们赶紧疏通管道。

此时，避免影响自己家的办法就可被称之为「熔断」。

ps: 在金融市场也有这个术语。

# 熔断器（CircuitBreaker）

熔断器的原理很简单，如同电力过载保护器。它可以实现快速失败，如果它在一段时间内侦测到许多类似的错误，会强迫其以后的多个调用快速失败，不再访问远程服务器，从而防止应用程序不断地尝试执行可能会失败的操作，使得应用程序继续执行而不用等待修正错误，或者浪费CPU时间去等到长时间的超时产生。熔断器也可以使应用程序能够诊断错误是否已经修正，如果已经修正，应用程序会再次尝试调用操作。

熔断器模式就像是那些容易导致错误的操作的一种代理。

这种代理能够记录最近调用发生错误的次数，然后决定使用允许操作继续，或者立即返回错误。

# 熔断的具体步骤

首先，需秉持的一个中心思想是：量力而行。

因为软件和人不同，没有奇迹会发生，什么样的性能撑多少流量是固定的。这是根本。

然后，这四步走分别是：

1. 定义一个识别是否处于“不可用”状态的策略

2. 切断联系

3. 定义一个识别是否处于“可用”状态的策略，并尝试探测

4. 重新恢复正常


## 定义一个识别是否处于“不正常”状态的策略

相信软件开发经验丰富的你也知道，识别一个系统是否正常，无非是两个点。

1. 是不是能调通

2. 如果能调通，耗时是不是超过预期的长

但是，由于分布式系统被建立在一个并不是100%可靠的网络上，所以上述的情况总有发生，因此我们不能将偶发的瞬时异常等同于系统“不可用”（避免以偏概全）。

由此我们需要引入一个「时间窗口」的概念，这个时间窗口用来“放宽”判定“不可用”的区间，也意味着多给了系统几次证明自己“可用”机会。

但是，如果系统还是在这个时间窗口内达到了你定义“不可用”标准，那么我们就要“断臂求生”了。

这个标准可以有两种方式来指定。

1. 阈值。比如，在10秒内出现100次“无法连接”或者出现100次大于5秒的请求。

2. 百分比。比如，在10秒内有30%请求“无法连接”或者30%的请求大于5秒。

最终会形成这样这样的一段代码。

```java
全局变量 errorcount = 0; //有个独立的线程每隔10秒（时间窗口）重置为0。
全局变量 isOpenCircuitBreaker = false;

//do some thing...

if(success){
    return success;
}
else{    
      errorcount++;
    if(errorcount == 不可用阈值){        
          isOpenCircuitBreaker = true;    
    }
}
```

## 切断联系

切断联系要尽可能的“果断”，既然已经认定了对方“不可用”，那么索性就默认“失败”，避免做无用功，也顺带能缓解对方的压力。

分布式系统中的程序间调用，一般都会通过一些RPC框架进行。

那么，这个时候作为客户端一方，在自己进程内通过代理发起调用之前就可以直接返回失败，不走网络。

这就是常说的「fail fast」机制。就是在前面提到的代码段之前增加下面的这段代码。

```java
if(isOpenCircuitBreaker == true){
    return fail;
}//do some thing...
```

## 定义一个识别是否处于“可用”状态的策略，并尝试探测

切断联系后，功能的完整性必然会受影响，所以还是需要尽快恢复回来，以提供完整的服务能力。

这事肯定不能人为去干预，及时性必然会受到影响。那么如何能够自动的识别依赖系统是否“可用”呢？这也需要你来定义一个策略。

一般来说这个策略与识别“不可用”的策略类似，只是这里是一个反向指标。

1. 阈值。比如，在10秒内出现100次“调用成功”并且耗时都小于1秒。

2. 百分比。比如，在10秒内有95%请求“调用成功”并且98%的请求小于1秒。

同样包含「时间窗口」、「阈值」以及「百分比」。

稍微不同的地方在于，大多数情况下，一个系统“不可用”的状态往往会持续一段时间，不会那么快就恢复过来。

所以我们不需要像第一步中识别“不可用”那样，无时无刻的记录请求状况，而只需要在每隔一段时间之后去进行探测即可。

所以，这里多了一个「间隔时间」的概念。这个间隔幅度可以是固定的，比如30秒。也可以是动态增加的，通过线性增长或者指数增长等方式。

```java
全局变量 successCount = 0; 
//有个独立的线程每隔10秒（时间窗口）重置为0。
//并且将下面的isHalfOpen设为false。

全局变量 isHalfOpen = true;
//有个独立的线程每隔30秒（间隔时间）重置为true。

//do some thing...
if(success){
    if(isHalfOpen){        
          successCount ++;
        if(successCount = 可用阈值){
            isOpenCircuitBreaker = false;       
        }    
    }       
  return success;
}else{    
    errorcount++;
    if(errorcount == 不可用阈值){
        isOpenCircuitBreaker = true;    
    }
}
```

另外，尝试探测本质上是一个“试错”，要控制下“试错成本”。所以我们不可能拿100%的流量去验证，一般会有以下两种方式：

1. 放行一定比例的流量去验证。

2. 如果在整个通信框架都是统一的情况下，还可以统一给每个系统增加一个专门用于验证程序健康状态检测的独立接口。这个接口额外可以多返回一些系统负载信息用于判断健康状态，如CPU、I/O的情况等。

## 重新恢复正常

一旦通过了衡量是否“可用”的验证，整个系统就恢复到了“正常”状态，此时需要重新开启识别“不可用”的策略。

就这样，系统会形成一个循环。


## 核心思想

这就是一个完整的熔断机制的面貌。了解了这些核心思想，用什么框架去实施就变得不是那么重要了，因为大部分都是换汤不换药。

上面聊到的这些可以说是主干部分，还有一些最佳实践可以让你在实施熔断的时候拿捏的更到位。

# 最佳实践

## 什么场景最适合做熔断

一个事物在不同的场景里会发挥出不同的效果。以下是我能想到最适合熔断发挥更大优势的几个场景：

1. 所依赖的系统本身是一个共享系统，当前客户端只是其中的一个客户端。这是因为，如果其它客户端进行胡乱调用也会影响到你的调用。

2. 所以依赖的系统被部署在一个共享环境中（资源未做隔离），并不独占使用。比如，和某个高负荷的数据库在同一台服务器上。

3. 所依赖的系统是一个经常会迭代更新的服务。这点也意味着，越“敏捷”的系统越需要“熔断”。

4. 当前所在的系统流量大小是不确定的。比如，一个电商网站的流量波动会很大，你能抗住突增的流量不代表所依赖的后端系统也能抗住。这点也反映出了我们在软件设计中带着“面向怀疑”的心态的重要性。

## 做熔断时还要注意的一些地方

与所有事物一样，熔断也不是一个完美的事物，我们特别需要注意2个问题。

首先，如果所依赖的系统是多副本或者做了分区的，那么要注意其中个别节点的异常并不等于所有节点都存在异常，所以需要区别对待。

其次，熔断往往应作为最后的选择，我们应优先使用一些「降级」或者「限流」方案。

因为“部分胜于无”，虽然无法提供完整的服务，但尽可能的降低影响是要持续去努力的。

比如，抛弃非核心业务、给出友好提示等等，这部分内容我们会在后续的文章中展开。

# 开源框架

[hystrix](https://houbb.github.io/2018/08/19/hystrix)

[resilience4j](https://houbb.github.io/2018/11/28/resilience4j)

[sentinel](https://houbb.github.io/2018/12/18/sentinel)

# 拓展阅读

[Bloom Filter](https://houbb.github.io/2018/12/05/bloom-filter)

[Cache 之旅系列](https://houbb.github.io/2018/08/31/cache-01-talk)

[ActiveMQ](https://houbb.github.io/2017/06/07/activemq)

# 参考资料

[熔断](https://mp.weixin.qq.com/s?__biz=MzAxODcyNjEzNQ==&mid=2247486481&idx=1&sn=87aee20e301d87030be2636cd0a124b7&chksm=9bd0a189aca7289f0a5e8a91907d21e32bd367341251c713e76c2fd97f6f64c06379ad7c4f93&scene=21#wechat_redirect)

[springcloud(四)：熔断器Hystrix - 纯洁的微笑](https://www.cnblogs.com/ityouknow/p/6868833.html)

[服务熔断、降级、限流、异步RPC -- HyStrix](https://blog.csdn.net/chunlongyu/article/details/53259014)

* any list
{:toc}