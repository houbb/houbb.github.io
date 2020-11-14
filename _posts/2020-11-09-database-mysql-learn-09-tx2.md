---
layout: post
title:  mysql（9）transaction 事务2
date:  2020-10-17 16:15:55 +0800
categories: [Database]
tags: [database, mysql, tx, sf]
published: true
---

# 7.3事务控制语句

在MySQL命令行的默认设置下， 事务都是自动提交(autocommit) 的， 即执行SQL语句后就会马上执行COMMIT操作。

因此要显式地开启一个事务需使用命令BEGIN、START TRANSACTION， 或者执行命令SET AUTOCOMMIT=0， 禁用当前会话的自动提交。

每个数据库厂商自动提交的设置都不相同， 每个DBA或开发人员需要非常明白这一点， 这对之后的SQL编程会有非凡的意义， 因此用户不能以之前的经验来判断MySQL数据库的运行方式。

在具体介绍其含义之前， 先来看看用户可以使用哪些事务控制语句。

- START TRANSACTION|BEGIN：显式地开启一个事务。

- COMMIT：要想使用这个语句的最简形式， 只需发出COMMIT。也可以更详细一些， 写为COMMITWORK，不过这二者几乎是等价的。COMMIT会提交事务，并使得已对数据库做的所有修改成为永久性的。

- ROLLBACK：要想使用这个语句的最简形式， 只需发出ROLLBACK。同样地，也可以写为ROLLBACKWORK， 但是二者几乎是等价的。回滚会结束用户的事务，并撤销正在进行的所有未提交的修改。

- SAVEPOINT identifier：SAVEPOINT允许在事务中创建一个保存点，一个事务中可以有多个SAVEPOINT。

- RELEASE SAVEPOINT identifier：删除一个事务的保存点， 当没有一个保存点执行这句语句时，会抛出一个异常。

- ROLLBACK TO[SAVEPOINT] identifier：这个语句与SAVEPOINT命令一起使用。可以把事务回滚到标记点，而不回滚在此标记点之前的任何工作。例如可以发出两条UPDATE语句， 后面跟一个SAVEPOINT， 然后又是两条DELETE语句。如果执行DELETE语句期间出现了某种异常情况， 并且捕获到这个异常，同时发出了ROLLBACK TO SAVEPOINT命令， 事务就会回滚到指定的SAVEPOINT ， 撤销DELETE完成的所有工作， 而UPDATE语句完成的工作不受影响。

- SET TRANSACTION：这个语句用来设置事务的隔离级别。InnoDB存储引擎提供的事务隔离级别有：READ UNCOMMITTED、READ COMMITTED、REPEATABLE READ、SERIALIZABLE。   

START TRANSACTION、BEGIN语句都可以在MySQL命令行下显式地开启一个事务。

但是在存储过程中，MySQL数据库的分析器会自动将BEGIN识别为BEGIN…END， 因此在存储过程中只能使用STARTTRANSACTION语句来开启一个事务。

COMMIT和COMMIT WORK语句基本是一致的，都是用来提交事务。

不同之处在于COMMITWORK用来控制事务结束后的行为是CHAIN还是RELEASE的。

如果是CHAIN方式， 那么事务就变成了链事务。

用户可以通过参数completion_type来进行控制， 该参数默认为0， 表示没有任何操作。在这种设置下COMMIT和COMMITWORK是完全等价的。

当参数completion_type的值为1时， COMMIT WORK等同于COMMIT AND CHAIN， 表示马上自动开启一个相同隔离级别的事务。

在这个示例中我们设置completion_type为1， 第一次通过COMMIT WORK来插人1这个记录。

之后插入记录2时我们并没有用BEGIN (或者START TRANSACTION )来显式地开启一个事务，之后再插人一条重复的记录2就会抛出异常。接着执行ROLLBACK操作， 最后发现只有1这一个记录， 2并没有被插入。

因为completion_type为1时， COMMIT WORK会自动开启一个链事务， 第二条INSERT INTO t SELECT 2语句是在同一个事务内的，因此回滚后2这条记录并没有被插人表t中。

参数completion_type为2时， COMMIT WORK等同于COMMIT AND RELEASE。


# 7.4隐式提交的SQL语句

以下这些SQL语句会产生一个隐式的提交操作， 即执行完这些语句后， 会有一个隐式的COMMIT操作。

- DDL语句：ALTERDATABASE...UPGRADEDATADIRECTORYNAME，ALTER EVENT ，ALTER PROCEDURE ，ALTERTABLE，ALTERVIEW，CREATE DATABASE ，CREATEEVENT， CREATE INDEX ， CREATEPROCEDURE ，CREATETABLE， CREATE TRIGGER ，CREATEVIEW，DROP DATABASE ，DROPEVENT，DROPINDEX， DROP PROCEDURE ，DROP TABLE ，DROP TRIGGER ，DROPVIEW，RENAMETABLE，TRUNCATETABLE。

- 用来隐式地修改MySQL架构的操作：CREATEUSER、DROPUSER、GRANT、RENAMEUSER、REVOKE、SETPASSWORD。

- 管理语句：ANALYZETABLE、CACHEINDEX、CHECKTABLE、LOADINDEXINTOCACHE、OPTIMIZETABLE、REPAIRTABLE。

注意我发现MicrosoftSQLServer的数据库管理员或开发人员往往忽视对于DDL语句的隐式提交操作，因为在MicrosoftSQLServer数据库中， 即使是DDL也是可以回滚的。

这和InnoDB存储引擎、Oracle这些数据库完全不同。

另外需要注意的是，TRUNCATE TABLE语句是DDL，因此虽然和对整张表执行 DELETE 结果是一样的，但是是不能回滚的。

# 7.5 对于事务操作的统计

由于InnoDB存储引擎是支持事务的， 因此InnoDB存储引擎的应用需要在考虑每秒请求数(QuestionPerSecond，QPS)的同时， 应该关注每秒事务处理的能力(TransactionPerSecond，TPS)。

计算TPS的方法是 (com_commit + com_rollback ) /time。

但是利用这种方法进行计算的前提是：所有的事务必须都是显式提交的，如果存在隐式地提交和回滚(默认autocommit=1)， 不会计算到com_commit和com rollback变量中。

# 7.6 事务的隔离级别

令人惊讶的是，大部分数据库系统都没有提供真正的隔离性，最初或许是因为系统实现者并没有真正理解这些问题。

如今这些问题已经弄清楚了，但是数据库实现者在正确性和性能之间做了妥协。

ISO和ANIS SQL标准制定了四种事务隔离级别的标准， 但是很少有数据库厂商遵循这些标准。

比如Oracle数据库就不支持READUNCOMMITTED和REPEATABLE READ的事务隔离级别。

SQL标准定义的四个隔离级别为：

- READ UNCOMMITTED

- READ COMMITTED

- REPEATABLE READ

- SERIALIZABLE


##  READ UNCOMMITTED

READ UNCOMMITTED称为浏览访问(browseaccess)， 仅仅针对事务而言的。

READ COMMITTED称为游标稳定(cursorstability)。REPEATABLEREAD是2.9999°的隔离， 没有幻读的保护。SERIALIZABLE称为隔离， 或3°的隔离。SQL和SQL 2标准的默认事务隔离级别是SERIALIZABLE。

InnoDB存储引擎默认支持的隔离级别是REPEATABLE READ ， 但是与标准SQL不同的是，InnoDB存储引擎在REPEATABLEREAD事务隔离级别下， 使用Next-KeyLock锁的算法， 因此避免幻读的产生。

这与其他数据库系统(如Microsoft SQLServer数据库) 是不同的。所以说，InnoDB存储引擎在默认的REPEATABLE READ的事务隔离级别下已经能完全保证事务的隔离性要求， 即达到SQL标准的SERIALIZABLE隔离级别。

隔离级别越低，事务请求的锁越少或保持锁的时间就越短。这也是为什么大多数数据库系统默认的事务隔离级别是READCOMMITTED。

据了解，大部分的用户质疑SERIALIZABLE隔离级别带来的性能问题， 但是根据Jim Gray在《Transaction Processing》一书中指出， 两者的开销几乎是一样的， 甚至SERIALIZABLE可能更优!!!

因此在InnoDB存储引擎中选择REPEATABLEREAD的事务隔离级别并不会有任何性能的损失。

同样地， 即使使用READCOMMITTED的隔离级别，用户也不会得到性能的大幅度提升。

在InnoDB存储引擎中， 可以使用以下命令来设置当前会话或全局的事务隔离级别：


```
SET[GLOBAL I SESSION] TRANSACTION ISOLATION LEVEL

READ UNCOMMITTED
| READ COMMITTED
| REPEATABLE READ
| SERIALIZABLE
```

如果想在MySQL数据库启动时就设置事务的默认隔离级别， 那就需要修改MySQL的配置文件， 在[mysqld] 中添加如下行：

```
[mysqld]
transaction-isolation=  READ-COMMITTED
```

在SERIALIABLE的事务隔离级别，InnoDB存储引擎会对每个SELECT语句后自动加上LOCKINSHAREMODE， 即为每个读取操作加一个共享锁。

因此在这个事务隔离级别下，读占用了锁，对一致性的非锁定读不再予以支持。这时，事务隔离级别SERIALIZABLE符合数据库理论上的要求， 即事务是well-formed的， 并且是two-phrased的。有兴趣的读者可进一步研究。


因为InnoDB存储引擎在REPEATABLE READ隔离级别下就可以达到3°的隔离，因此一般不在本地事务中使用SERIALIABLE的隔离级别。SERIALIABLE的事务隔离级别主要用于InnoDB存储引擎的分布式事务。

在READCOMMITTED的事务隔离级别下， 除了唯一性的约束检查及外键约束的检查需要gaplock，InnoDB存储引擎不会使用gaplock的锁算法。但是使用这个事务隔离级别需要注意一些问题。

首先， 在MySQL 5.1中，READCOMMITTED事务隔离级别默认只能工作在replication (复制) 二进制日志为ROW的格式下。如果二进制日志工作在默认的STATEMENT下， 则会出现如下的错误：

# 7.7 分布式事务

## 7.7.1 MySQL数据库分布式事务

InnoDB存储引擎提供了对XA事务的支持， 并通过XA事务来支持分布式事务的实现。

分布式事务指的是允许多个独立的事务资源(transactional resources) 参与到一个全局的事务中。

事务资源通常是关系型数据库系统，但也可以是其他类型的资源。全局事务要求在其中的所有参与的事务要么都提交， 要么都回滚，这对于事务原有的ACID要求又有了提高。

另外，在使用分布式事务时，InnoDB存储引擎的事务隔离级别必须设置为SERIALIZABLE。

XA事务允许不同数据库之间的分布式事务， 如一台服务器是MySQL数据库的， 另一台是Oracle数据库的， 又可能还有一台服务器是SQLServer数据库的， 只要参与在全局事务中的每个节点都支持XA事务。

分布式事务可能在银行系统的转账中比较常见，如用户David需要从上海转10000元到北京的用户Mariah的银行卡中：

```
Banke shanghai：
UPDATE account SET money -money-10000 WHERE user='David'；
#Banke Beijing
UPDATE account SET money=money + 10000 WHERE user='Mariah'；
```

在这种情况下，一定需要使用分布式事务来保证数据的安全。

如果发生的操作不能全部提交或回滚， 那么任何一个结点出现问题都会导致严重的结果。

要么星David的账户被扣款， 但是Mariah没收到， 又或者是David的账户没有扣款， Mariah却收到钱了。

XA事务由一个或多个资源管理器( Resource Managers) 、一个事务管理器( TransactionManager) 以及一个应用程序( Application Program) 组成。

- 资源管理器：提供访问事务资源的方法。通常一个数据库就是一个资源管理器。口事务管理器：协调参与全局事务中的各个事务。需要和参与全局事务的所有资源管理器进行通信。

- 应用程序：定义事务的边界，指定全局事务中的操作。

在MySQL数据库的分布式事务中， 资源管理器就是MySQL数据库， 事务管理器为连接MySQL服务器的客户端。

图7-22显示了一个分布式事务的模型。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1114/193301_cd07c0d0_508704.png "屏幕截图.png")

分布式事务使用两段式提交(two-phasecommit) 的方式。

在第一阶段，所有参与全局事务的节点都开始准备(PREPARE)， 告诉事务管理器它们准备好提交了。

在第二阶段，事务管理器告诉资源管理器执行ROLLBACK还是COMMIT。

如果任何一个节点显示不能提交，则所有的节点都被告知需要回滚。

可见与本地事务不同的是，分布式事务需要多一次的PREPARE操作，待收到所有节点的同意信息后， 再进行COMMIT或是ROLLBACK操作。

## 7.7.2 内部XA事务

之前讨论的分布式事务是外部事务， 即资源管理器是MySQL数据库本身。在MySQL数据库中还存在另外一种分布式事务， 其在存储引擎与插件之间， 又或者在存储引擎与存储引擎之间，称之为内部XA事务。

最为常见的内部 XA 事务存在于binlog与InnoDB存储引擎之间。

由于复制的需要，因此目前绝大多数的数据库都开启了binlog功能。

在事务提交时， 先写二进制日志， 再写InnoDB存储引擎的重做日志。对上述两个操作的要求也是原子的， 即二进制日志和重做日志必须同时写人。

若二进制日志先写了， 而在写入InnoDB存储引擎时发生了宕机， 那么slave可能会接收到master传过去的二进制日志并执行， 最终导致了主从不一致的情况。

如图7-23所示。

在图7-23中， 如果执行完①、②后在步骤③之前MySQL数据库发生了宕机， 则会发生主从不一致的情况。

为了解决这个问题， MySQL数据库在binlog与InnoDB存储引擎之间采用XA事务。

当事务提交时， InnoDB存储引擎会先做一个PREPARE操作， 将事务的xid写人， 接着进行二进制日志的写人， 如图7-24所示。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1114/193624_94854fe8_508704.png "屏幕截图.png")

如果在InnoDB存储引擎提交前， MySQL数据库宕机了， 那么MySQL数据库在重启后会先检查准备的UX ID事务是否已经提交，若没有，则在存储引擎层再进行一次提交操作。

# 小结

# 参考资料

《mysql 技术内幕》

* any list
{:toc}

