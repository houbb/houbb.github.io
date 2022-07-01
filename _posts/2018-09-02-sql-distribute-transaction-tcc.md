---
layout: post
title:  TCC Try-Confirm-Cancel 分布式事务
date:  2018-09-02 10:54:19 +0800
categories: [SQL]
tags: [sql, transaction, distributed, sh]
published: true
---

# TCC (Try-Confirm-Cancel) 

分布式事务 TCC (Try-Confirm-Cancel)。TCC事务机制相对于传统事务机制（X/Open XA），其特征在于它不依赖资源管理器(RM)对XA的支持，而是通过对（由业务系统提供的）业务逻辑的调度来实现分布式事务。 

## 概念

TCC 最早在 [《Life beyond Distributed Transactions:an Apostate’s Opinion》](http://adrianmarriott.net/logosroot/papers/LifeBeyondTxns.pdf) 中提出。

TCC事务机制相对于传统事务机制（X/Open XA），其特征在于它不依赖资源管理器(RM)对XA的支持，而是通过对（由业务系统提供的）业务逻辑的调度来实现分布式事务。

对于业务系统中一个特定的业务逻辑S，其对外提供服务时，必须接受一些不确定性，即对业务逻辑执行的一次调用仅是一个临时性操作，调用它的消费方服务M保留了后续的取消权。

如果M认为全局事务应该rollback，它会要求取消之前的临时性操作，这就对应S的一个取消操作。

而当M认为全局事务应该commit时，它会放弃之前临时性操作的取消权，这对应S的一个确认操作。 

每一个初步操作，最终都会被确认或取消。

因此，针对一个具体的业务服务，TCC事务机制需要业务系统提供三段业务逻辑：

初步操作Try、确认操作Confirm、取消操作Cancel。

- sql 核心思想对比

稍稍对照下关系型数据库事务的三种操作：DML、Commit和Rollback，会发现和TCC有异曲同工之妙。

在一个跨应用的业务操作中，Try操作是先把多个应用中的业务资源预留和锁定住，为后续的确认打下基础，类似的，DML操作要锁定数据库记录行，持有数据库资源；

Confirm操作是在Try操作中涉及的所有应用均成功之后进行确认，使用预留的业务资源，和Commit类似；

而Cancel则是当Try操作中涉及的所有应用没有全部成功，需要将已成功的应用进行取消(即Rollback回滚)。其中Confirm和Cancel操作是一对反向业务操作。

## 核心概念

### 初步操作 Try

TCC事务机制中的业务逻辑（Try），从执行阶段来看，与传统事务机制中业务逻辑相同。

但从业务角度来看，是不一样的。TCC机制中的Try仅是一个初步操作，它和后续的次确认一起才能真正构成一个完整的业务逻辑。

因此，可以认为 `[传统事务机制]的业务逻辑 = [TCC事务机制]的初步操作（Try） + [TCC事务机制]的确认逻辑（Confirm）`。

TCC 机制将传统事务机制中的业务逻辑一分为二，拆分后保留的部分即为初步操作（Try）；而分离出的部分即为确认操作（Confirm），被延迟到事务提交阶段执行。

TCC 事务机制以初步操作（Try）为中心，确认操作（Confirm）和取消操作（Cancel）都是围绕初步操作（Try）而展开。

因此，Try阶段中的操作，其保障性是最好的，即使失败，仍然有取消操作（Cancel）可以将其不良影响进行回撤。

### 确认操作 Confirm

确认操作（Confirm）是对初步操作（Try）的一个补充。

当TCC事务管理器认为全局事务可以正确提交时，就会逐个执行初步操作（Try）指定的确认操作（Confirm），将初步操作（Try）未完成的事项最终完成。

### 取消操作 Cancel

取消操作（Cancel）是对初步操作（Try）的一个回撤。

当TCC事务管理器认为全局事务不能正确提交时，就会逐个执行初步操作（Try）指定的取消操作（Cancel），将初步操作（Try）已完成的事项全部撤回。

在传统事务机制中，业务逻辑的执行和事务的处理，是在不同的阶段由不同的部件来处理的：业务逻辑部分访问资源实现数据存储，其处理是由业务系统负责；事务处理部分通过协调资源管理器以实现事务管理，其处理由事务管理器来负责。

二者没有太多交互的地方，所以，传统事务管理器的事务处理逻辑，仅需要着眼于事务完成（commit/rollback）阶段，而不必关注业务执行阶段。

而在TCC事务机制中的业务逻辑逻辑和事务处理处理，其关系就错综复杂：业务逻辑（Try/Confirm/Cancel）阶段涉及所参与资源事务的commit/rollback；

全局事务commit/rollback时又涉及到业务逻辑（Try/Confirm/Cancel）的执行。

## 优缺点

### 优点

1. 解决了跨应用业务操作的原子性问题，在诸如组合支付、账务拆分场景非常实用。

2. TCC实际上把数据库层的二阶段提交上提到了应用层来实现，对于数据库来说是一阶段提交

3. 规避了数据库层的2PC性能低下问题。

4. 实时业务，执行时间较短的业务

5. 强一致性的业务

### 缺点

TCC的Try、Confirm和Cancel操作功能需业务提供，开发成本高。

## 例子

TCC说实话，TCC的理论有点让人费解。故接下来将以账务拆分为例，对TCC事务的流程做一个描述，希望对理解TCC有所帮助。       

账务拆分的业务场景如下，分别位于三个不同分库的帐户A、B、C，A和B一起向C转帐共80元：

| 序号 | 账户 | 所在分库 | 操作 |
|:---|:---|:---|:---|
| 1 | A | 1 | 转给 C 30 元 |
| 2 | B | 2 | 转给 C 50 元 |
| 3 | C | 3 | 接收到 A 的 30 元，B 的 50 元 |

### Try：尝试执行业务

完成所有业务检查(一致性)：检查A、B、C的帐户状态是否正常，帐户A的余额是否不少于30元，帐户B的余额是否不少于50元。

预留必须业务资源(准隔离性)：帐户A的冻结金额增加30元，帐户B的冻结金额增加50元，这样就保证不会出现其他并发进程扣减了这两个帐户的余额而导致在后续的真正转帐操作过程中，帐户A和B的可用余额不够的情况。

### Confirm：确认执行业务

真正执行业务：如果Try阶段帐户A、B、C状态正常，且帐户A、B余额够用，则执行帐户A给账户C转账30元、帐户B给账户C转账50元的转帐操作。

不做任何业务检查：这时已经不需要做业务检查，Try阶段已经完成了业务检查。

只使用Try阶段预留的业务资源：只需要使用Try阶段帐户A和帐户B冻结的金额即可。

### Cancel：取消执行业务

释放Try阶段预留的业务资源：如果Try阶段部分成功，比如帐户A的余额够用，且冻结相应金额成功，帐户B的余额不够而冻结失败，
则需要对帐户A做Cancel操作，将帐户A被冻结的金额解冻掉。

## 与 2PC 对比

- 位于业务服务层而非资源层

- 没有单独的准备(Prepare)阶段， Try操作兼备资源操作与准备能力 

- Try操作可以灵活选择业务资源的锁定粒度(以业务定粒度) 

- 较高开发成本

# RESTful 处理

## 示例场景

一个简单的TCC应用如下: 图中蓝色方框Booking Process代表订票系统, 该系统分别对swiss和easyjet发起预留机票资源的请求

![condition](https://www.atomikos.com/pub/Main/AtomikosImages/tcc-context.png)


在步骤1.1对”swiss”发起Try预留请求. 服务提供方”swiss”将会等待Confirm操作, 如果超时那么就将会被自动撤销(Cancel)并释放资源. 确认资源的入口就是URI R1的HTTP PUT请求.

在步骤1.2中, 使用URI R2对”easyjet”作出如第一点中一样的预留资源操作

在步骤1.3中, Booking Process现在可以通过协调器(Coordinator)服务发起对上述两个预留资源的确认(Confirm)操作. 并且, 资源协调服务会处理相关服务的确认或者补偿操作.

如果在第3步之前有任何异常, 那么所有预留资源将会被Cancel或者等待超时然后被自动撤销. 

如果是在第3步Confirm之后才出现异常, 那么所有的资源都不会受到影响. 在第3步中发生的异常都会由Coordinator服务处理, 包括因为宕机或者是网络抖动所引起的恢复重试. 对REST服务提供了事务保证.

## 角色

这套API由3个角色组成: 参与者角色, 协调者角色和应用程序.

参与者是特指那些实现了TCC柔性事务的应用程序, 就正如本示例中的”swiss”和”easyjet”

协调者角色是特指那些管理一组相关参与者的服务调用, 如Confirm, Cancel操作, 在本示例中是”Transaction Coordinator”

应用程序, 这里我称之为请求方, 除了需要使用协调器外无其他要求, 如本示例中的”Booking Process”

# TCC服务提供方: 参与者API

## 参与者职责

参与者负责管理特定的业务资源. 

默认情况下业务预留资源在一定时间后会超时, 除非该预留资源被协调器所确认.

## 自动超时和撤回

每一个参与者的实现必须有自动Cancel超时资源的功能. 除非参与者接收到确认消息, 否则没有资源是不会过期的.

## 资源操作的入口

每个参与者的实现必须返回一个用于调用Confirm的链接. 这些链接可以包含Confirm的URI, 自动过期时间等元数据. 下面是一个简单例子

```
{ "participantLink": {"uri":"http://www.example.com/part/123", "expires":"2014-01-11T10:15:54Z" } }
```

## PUT to Confirm

在上述参与者返回的用于确认的链接中, 必须支持PUT方法以用于确认. 由于网络抖动等情况, 该操作必须具备幂等性.

```
PUT /part/123 HTTP/1.1
Host: www.example.com
Accept: application/tcc
```

注意请求头中MIME类型, 暗示了客户端的语义期望(可根据实际情况选择是否实现该MediaType). Confirm操作通常由协调者调用.

尽管参与者提供的API有指定的MIME类型, 但是这个类型仅仅用于指明语义, 实际上并不需要request body与response body.

如果一切正常, 那么参与者的响应如下

```
HTTP/1.1 204 No Content
```

如果Confirm请求送达参与者后发现预留资源早就被Cancel或者已经超时被回滚, 那么参与者的API必须返回404错误

```
HTTP/1.1 404 Not Found
```

## DELETE to Cancel: 可选实现

每个参与者URI或许会有实现DELETE方法去显式地接受撤销请求. 由于网络抖动等情况, 该操作必须具备幂等性.

```
DELETE /part/123 HTTP/1.1
Host: www.example.com
Accept: application/tcc
```

如果补偿成功则返回

```
HTTP/1.1 204 No Content
```

因为参与者有实现自动撤销超时资源的职责, 那么如果在显式地调用Cancel的时候有其他错误发生, 那么这些错误都可以被忽略而且不影响整体的分布式事务

在内部事务已经超时或者已经被参与者自身补偿之后, 那么他可以直接返回404

```
HTTP/1.1 404 Not Found
```

因为DELETE请求是一个可选操作, 有些参与者可能没有实现这个功能, 在这个情况下可以返回405

```
HTTP/1.1 405 Method Not Allowed
```

## GET方法故障诊断: 可选实现

参与方服务可以实现GET方法来用于故障的诊断. 但是这个超出了REST TCC的简约协议的意图, 所以这个功能就由实际情况来决定是否实现

# 协调器API: 面向请求方的开发者

协调器服务是由我们实现, 并交由请求方的开发人员使用. 因为这里从使用RESTful接口的设计角度来说明, 而不讨论协调器的内部实现.

## 协调器职责

1. 对所有参与者发起Confirm请求

2. 无论是协调器发生的错误还是调用参与者所产生的错误, 协调器都必须有自动恢复重试功能, 尤其是在确认的阶段.

3. 能判断有问题的Confirm操作的原因

4. 方便地进行Cancel操作

## PUT to Confirm

请求方对协调器发出PUT请求来确认当前的分布式事务. 这些事务就是参与者之前返回给请求方的确认链接

```
PUT /coordinator/confirm HTTP/1.1
Host: www.taas.com
Content-Type: application/tcc+json
{
"participantLinks": [
{
"uri": "http://www.example.com/part1",
"expires": "2014-01-11T10:15:54Z"
},
{
"uri": "http://www.example.com/part2",
"expires": "2014-01-11T10:15:54+01:00"
}
]
}
```

然后协调器会对参与者逐个发起Confirm请求, 如果一切顺利那么将会返回如下结果

```
HTTP/1.1 204 No Content
```

如果发起Confirm请求的时间太晚, 那么意味着所有被动方都已经进行了超时补偿

```
HTTP/1.1 404 Not Found
```

最最最糟糕的情况就是有些参与者确认了, 但是有些就没有. 这种情况就应该要返回409, 这种情况在Atomikos中定义为启发式异常

```
HTTP/1.1 409 Conflict
```

当然, 这种情况应该尽量地避免发生, 要求Confirm与Cancel实现幂等性, 出现差错时协调器可多次对参与者重试以尽量降低启发性异常发生的几率. 
万一409真的发生了, 则应该由请求方主动进行检查或者由协调器返回给请求方详细的执行信息, 例如对每个参与者发起故障诊断的GET请求, 记录故障信息并进行人工干预.

## PUT to Cancel

一个撤销请求跟确认请求类似, 都是使用PUT请求, 唯一的区别是URI的不同

```
PUT /coordinator/cancel HTTP/1.1
Host: www.taas.com
Content-Type: application/tcc+json
{
"participantLinks": [
{
"uri": "http://www.example.com/part1",
"expires": "2014-01-11T10:15:54Z"
},
{
"uri": "http://www.example.com/part2",
"expires": "2014-01-11T10:15:54Z"
}
]
}
```

唯一可预见的响应就是

```
HTTP/1.1 204 No Content
```

因为当预留资源没有被确认时最后都会被释放, 所以参与者返回其他错误也不会影响最终一致性。


# 参考资料

- pdf

[tcc](http://adrianmarriott.net/logosroot/papers/LifeBeyondTxns.pdf)

[Business_Activities](https://cdn.ttgtmedia.com/searchWebServices/downloads/Business_Activities.pdf)

- tcc

http://heshen.lofter.com/post/cfa6d_f793a34

https://www.cnblogs.com/duanxz/p/5226316.html

https://dzone.com/articles/transactions-for-the-rest-of-us

https://blog.csdn.net/liuxinghao/article/details/51867631

https://www.zhihu.com/question/48627764

- restful

http://blog.chriscs.com/2017/04/30/rest-tcc/

https://www.atomikos.com/Blog/TCCForTransactionManagementAcrossMicroservices

https://dzone.com/articles/transactions-for-the-rest-of-us

- open source

https://github.com/liuyangming/ByteTCC/wiki

https://my.oschina.net/fileoptions/blog/900650

https://github.com/prontera/spring-cloud-rest-tcc

https://juejin.im/entry/58eb48642f301e00624e573d

* any list
{:toc}