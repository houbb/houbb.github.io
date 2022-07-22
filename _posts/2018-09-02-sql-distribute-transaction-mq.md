---
layout: post
title:  分布式事务-本地消息表 （经典的ebay模式）
date:  2018-09-02 10:54:19 +0800
categories: [SQL]
tags: [sql, mq, transaction, distributed, sh]
published: true
---

# 本地消息表（经典的ebay模式）

该方案的核心思想在于分布式系统在处理任务时通过消息日志的方式来异步执行。

消息日志可以存储至本地文本、数据库或消息队列，然后再通过业务规则定时任务或人工自动重试。

以在线支付系统的跨行转账为例：

## 第一步

第一步，伪代码如下，对用户id为A的账户扣款1000元，通过本地事务将事务消息(包括本地事务id、支付账户、收款账户、金额、状态等)插入至消息表：

```sql
Begin transaction
 
         update user_account set amount = amount - 1000 where userId = 'A'
 
         insert into trans_message(xid,payAccount,recAccount,amount,status) values(uuid(),'A','B',1000,1);
 
end transaction
 
commit;
```

## 第二步

第二步，通知对方用户id为B，增加1000元，通常通过消息MQ的方式发送异步消息，对方订阅并监听消息后自动触发转账的操作；

这里为了保证幂等性，防止触发重复的转账操作，需要在执行转账操作方新增一个trans_recv_log表用来做幂等，在第二阶段收到消息后，

通过判断trans_recv_log表来检测相关记录是否被执行，如果未被执行则会对B账户余额执行加1000元的操作，

并会将该记录增加至trans_recv_log,事件结束后通过回调更新trans_message的状态值。

# 消息中间件

## 非事务消息中间件

这里仍然以上面跨行转账为例，我们很难保证在扣款完成之后对MQ投递消息的操作就一定能成功。这样一致性似乎很难保证。

以下伪代码说明了消息投递的异常：

```java
try{
   boolean result = dao.update(model);//更新数据库失败抛出异常
   if(result){
        mq.send(model);//如果MQ超时或者接收方处理失败,抛出异常
   }
}catch(Exception ex){
    rollback();//如果异常回滚
}
```

对于以上的运行情况主要有以下几种：

1. 操作数据库成功，向MQ中投递消息也成功，该属于正常情况，一切都OK。

2. 操作数据库失败，不会向MQ中投递消息了。

3. 操作数据库成功，但是向MQ中投递消息时失败，向外抛出了异常，刚刚执行的更新数据库的操作将被回滚。

从上面分析的几种情况来看，基本上能确保,发送消息的可靠性。我们再来分析下消费者端的问题：

1. 接收者取出消息后，消费者对应的业务操作要执行成功。如果业务执行失败，消息不能失效或者丢失。需要保证消息与业务操作一致。

2. 尽量确保消息的幂等性。如果出现重复消息投递，能够进行幂等而不对业务产生影响。

### 最理想的流程

![成功](https://user-gold-cdn.xitu.io/2018/3/10/1620fc30782107d1?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)


## 支持事务的消息中间件

Apache开源的RocketMQ中间件能够支持一种事务消息机制，确保本地操作和发送消息的异步处理达到本地事务的结果一致。

第一阶段，RocketMQ在执行本地事务之前，会先发送一个Prepared消息，并且会持有这个消息的接口回查地址。

第二阶段，执行本地事物操作。

第三阶段，确认消息发送，通过第一阶段拿到的接口地址URL执行回查，并修改状态，如果本地事务成功，则修改状态为已提交，否则修改状态为已回滚。

![mq](http://incdn1.b0.upaiyun.com/2017/08/a49f1f4038275d09709a7627b53ceb18.png)

其中，如果第三阶段的确认消息发送失败后，RocketMQ会有定时任务扫描集群中的事务消息，如果发现还是处于prepare状态的消息，它会向消息发送者确认本地事务是否已执行成功。
RocketMQ会根据发送端设置的策略来决定是回滚还是继续发送确认消息。

这样就保证了消息的发送与本地事务同时成功或同时失败。

再回到上面转账的例子，如果用户A的账户余额已经减少，且消息已经发送成功，作为消费者用户B开始消费这条消息，这个时候就会出现消费失败和消费超时两个问题，解决超时问题的思路就是一直重试，直到消费端消费消息成功，整个过程中有可能会出现消息重复的问题，就需要采用前面说的幂等方案来进行处理。

### 失败 rollback

![失败-回滚](https://user-gold-cdn.xitu.io/2018/3/10/1620fc307be6c55d?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### rollback 丢失

上面所介绍的Commit和Rollback都属于理想情况，但在实际系统中，Commit和Rollback指令都有可能在传输途中丢失。

那么当出现这种情况的时候，消息中间件是如何保证数据一致性呢？——答案就是超时询问机制。

![超时询问机制](https://user-gold-cdn.xitu.io/2018/3/10/1620fc307c2d185e?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

系统A除了实现正常的业务流程外，还需提供一个事务询问的接口，供消息中间件调用。

当消息中间件收到一条事务型消息后便开始计时，如果到了超时时间也没收到系统A发来的Commit或Rollback指令的话，就会主动调用系统A提供的事务询问接口询问该系统目前的状态。

该接口会返回三种结果：

- 提交

若获得的状态是“提交”，则将该消息投递给系统B。

- 回滚

若获得的状态是“回滚”，则直接将条消息丢弃。

- 处理中

若获得的状态是“处理中”，则继续等待。

### 消息丢失的重试

如果消息在投递过程中丢失，或消息的确认应答在返回途中丢失，那么消息中间件在等待确认应答超时之后就会重新投递，直到下游消费者返回消费成功响应为止。

当然，一般消息中间件可以设置消息重试的次数和时间间隔，比如：当第一次投递失败后，每隔五分钟重试一次，一共重试3次。

如果重试3次之后仍然投递失败，那么这条消息就需要人工干预。

![消息丢失后的重试](https://user-gold-cdn.xitu.io/2018/3/10/1620fc3078194980?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

# 实际方案

## 方案 1 - 本地消息表

假设消息中间件没有提供“事务消息”功能，比如你用的是Kafka。那如何解决这个问题呢？

解决方案如下： 

（1）Producer端准备1张消息表，把update DB和insert message这2个操作，放在一个DB事务里面。

（2）准备一个后台程序，源源不断的把消息表中的message传送给消息中间件。失败了，不断重试重传。允许消息重复，但消息不会丢，顺序也不会打乱。

（3）Consumer端准备一个判重表。处理过的消息，记在判重表里面。实现业务的幂等。但这里又涉及一个原子性问题：如果保证消息消费 + insert message到判重表这2个操作的原子性？

消费成功，但insert判重表失败，怎么办？关于这个，在Kafka的源码分析系列，第1篇，exactly once问题的时候，有过讨论。

通过上面3步，我们基本就解决了这里update db和发送网络消息这2个操作的原子性问题。

但这个方案的一个缺点就是：需要设计DB消息表，同时还需要一个后台任务，不断扫描本地消息。导致消息的处理和业务逻辑耦合额外增加业务方的负担。

## 方案 2 - RocketMQ 事务消息

为了能解决该问题，同时又不和业务耦合，RocketMQ提出了“事务消息”的概念。

具体来说，就是把消息的发送分成了2个阶段：Prepare阶段和确认阶段。

具体来说，上面的2个步骤，被分解成3个步骤： 

(1) 发送 Prepared 消息 

(2) update DB 

(3) 根据 update DB 结果成功或失败，Confirm 或者取消 Prepared 消息。

可能有人会问了，前2步执行成功了，最后1步失败了怎么办？

这里就涉及到了RocketMQ的关键点：RocketMQ会定期（默认是1分钟）扫描所有的Prepared消息，询问发送方，到底是要确认这条消息发出去？还是取消此条消息？

具体代码实现如下：

也就是定义了一个checkListener，RocketMQ会回调此Listener，从而实现上面所说的方案。

```java
// 也就是上文所说的，当RocketMQ发现`Prepared消息`时，会根据这个Listener实现的策略来决断事务
TransactionCheckListener transactionCheckListener = new TransactionCheckListenerImpl();
// 构造事务消息的生产者
TransactionMQProducer producer = new TransactionMQProducer("groupName");
// 设置事务决断处理类
producer.setTransactionCheckListener(transactionCheckListener);
// 本地事务的处理逻辑，相当于示例中检查Bob账户并扣钱的逻辑
TransactionExecuterImpl tranExecuter = new TransactionExecuterImpl();
producer.start()
// 构造MSG，省略构造参数
Message msg = new Message(......);
// 发送消息
SendResult sendResult = producer.sendMessageInTransaction(msg, tranExecuter, null);
producer.shutdown();
```

```java
public TransactionSendResult sendMessageInTransaction(.....)  {
    // 逻辑代码，非实际代码
    // 1.发送消息
    sendResult = this.send(msg);
    // sendResult.getSendStatus() == SEND_OK
    // 2.如果消息发送成功，处理与消息关联的本地事务单元
    LocalTransactionState localTransactionState = tranExecuter.executeLocalTransactionBranch(msg, arg);
    // 3.结束事务
    this.endTransaction(sendResult, localTransactionState, localException);
}
```

总结：对比方案2和方案1，RocketMQ最大的改变，其实就是把“扫描消息表”这个事情，不让业务方做，而是消息中间件帮着做了。

至于消息表，其实还是没有省掉。因为消息中间件要询问发送方，事物是否执行成功，还是需要一个“变相的本地消息表”，记录事物执行状态。

## 方案 3 - 人工介入

可能有人又要说了，无论方案1，还是方案2，发送端把消息成功放入了队列，但消费端消费失败怎么办？

消费失败了，重试，还一直失败怎么办？是不是要自动回滚整个流程？

答案是人工介入。从工程实践角度讲，这种整个流程自动回滚的代价是非常巨大的，不但实现复杂，还会引入新的问题。

比如自动回滚失败，又怎么处理？

对应这种极低概率的case，采取人工处理，会比实现一个高复杂的自动化回滚系统，更加可靠，也更加简单。

# 实际案例分析

然而在海量数据的场景下，我需要对数据库做拆分，即分库分表。

下面我们举个下订单的场景，总共有3个实体，商品、用户、订单，我们按照user_id来sharding。

所以相同user_id的用户和订单在同一个物理库下，而商品表中不存在user_id，所以商品表在不同的物理库下。

下订单的场景，主要涉及到两个事务操作，扣减库存和生成订单，因为两个操作涉及不同的数据库，所以无法保证强一致性。

## 本地消息表

我们可以通过本地消息表，来实现最终一致性，具体流程如下图：

![本地消息表](https://raw.githubusercontent.com/houbb/resource/master/img/sql/transaction/20180902-transaction-mq-caseone.png)

流程说明：

- 交易流水号

调用外部服务，生成全局唯一的交易流水号 trans_id。

- 事务

事务一：1) 扣减库存 2) 根据流水单号，生成对应商品的冻结记录。

消息表主要由商品ID、交易流水号、冻结数、消息状态这四个字段构成，因为消息表和商品表在同一个物理库下，所以TX1中的操作1和操作2是可以构成事务操作的。冻结记录的状态有三种：已冻结、释放已售出、释放未售出。冻结记录的初始状态为已冻结。

事务一如果成功，则进行事务二；如果事务一失败，则直接返回。

事务二：根据交易流水号 trans_id 生成订单，订单的状态有三种：未支付、已支付、超时，订单的初始状态为未支付。

若订单创建成功，则进行后续的支付流程。

如果事务二失败，由于网络抖动超时等原因，不一定是真的生成订单失败，即 在事务二失败的情况下，可能生成了订单，也可能确实没有生成订单。

- 定时任务

定时任务一：设置一个每隔 15 分钟的定时任务（即一个订单必须在 15 分钟内完成支付），从订单表里捞出最近半小时内的所有订单，对每一个订单做如下处理。

若订单超时未支付，开启事务 `SELECT FOR UPDATE` 锁住该订单，即用悲观锁阻止用户对订单进行支付等操作，然后通过订单的 trans_id 去冻结表更新对应冻结记录的状态，置为释放未售出，并回滚商品数量，回滚商品的操作完成后，将订单状态置为超时，若事务中调用的回滚商品数量的服务失败，则可以发出报警人工处理，或通过更长时间的定时任务去处理；若订单为已支付，则将冻结表中记录的状态置为释放已售出。

定时任务二：因为存在事务一成功，而事务二的订单确实没有创建成功的情况，这样会冻结一部分商品的数量，所以可以捞取出创建超过 10 分钟状态为已冻结的所有冻结记录，根据每个冻结记录的 trans_id 去订单表查询，若不存在对应的订单，则将冻结记录的状态更新为释放未售出，并回滚商品数量。

- 注意 

在定时任务一中，对于超时未支付的订单，会先回滚冻结表，然后将订单状态置为超时，但这最后一步将订单置为超时可能会失败，这样会出现不一致的状态，即订单状态为未支付，而冻结记录的状态为释放未售出。

所以，在支付的时候需要做一个前置校验，检查冻结记录的状态是否为已冻结，若不是，则拒绝支付。

## 变种

在上面这种模型的基础上，还有一种变种，如下图：

![本地消息表-变种](https://raw.githubusercontent.com/houbb/resource/master/img/sql/transaction/20180902-transaction-mq-casetwo.png)

即在 TX2 失败的情况下，跳转到 TX3

- 流程

根据 trans_id 查询订单，若订单不存在，则直接将冻结记录置为释放未售出，并回滚库存；

若订单存在，则说明 TX2 因为网络抖动等原因而失败，其实订单创建成功，则进行正常的支付流程。

- 注意点

需要注意的是：根据 trans_id 查询订单的时候，一定要开启事务，这样才会强制走主库，若不开启事务，则会走备库，

因为 MySQL 主从同步延迟的问题，备库很可能无法查询到订单，从而回滚库存，这显然是错误的。

### 优点

将定时任务的压力均匀地分配到每一次调用中，提高数据库的可用性。

# 参考资料

https://queue.acm.org/detail.cfm?id=1394128

http://www.importnew.com/26212.html

https://juejin.im/post/5aa3c7736fb9a028bb189bca

https://blog.csdn.net/chunlongyu/article/details/53844393

https://segmentfault.com/a/1190000012415698

[我说分布式事务之消息最终一致性事务（二）：RocketMQ的实现](https://mp.weixin.qq.com/s/Uci2bMt6IYrUYiunV1n_EQ)

* any list
{:toc}