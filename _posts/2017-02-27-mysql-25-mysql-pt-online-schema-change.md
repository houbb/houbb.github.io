---
layout: post
title:  MySQL-25-mysql pt-online-schema-change pt-osc 
date:  2017-7-17 10:26:01 +0800
categories: [MySQL]
tags: [sp]
published: true
---

# 拓展阅读

[MySQL 00 View](https://houbb.github.io/2017/02/27/mysql-00-view)

[MySQL 01 Ruler mysql 日常开发规范](https://houbb.github.io/2017/02/27/mysql-01-ruler)

[MySQL 02 truncate table 与 delete 清空表的区别和坑](https://houbb.github.io/2017/02/27/mysql-truncate)

[MySQL 03 Expression 1 of ORDER BY clause is not in SELECT list,references column](https://houbb.github.io/2017/02/27/mysql-03-error)

[MySQL 04 EMOJI 表情与 UTF8MB4 的故事](https://houbb.github.io/2017/02/27/mysql-04-emoj-and-utf8mb4)

[MySQL 05 MySQL入门教程（MySQL tutorial book）](https://houbb.github.io/2017/02/27/mysql-05-learn-book)

[MySQL 06 mysql 如何实现类似 oracle 的 merge into](https://houbb.github.io/2017/02/27/mysql-06-merge-into)

[MySQL 07 timeout 超时异常](https://houbb.github.io/2017/02/27/mysql-07-timeout-errors)

[MySQL 08 datetime timestamp 以及如何自动更新，如何实现范围查询](https://houbb.github.io/2017/02/27/mysql-08-datetime-timestamp)

[MySQL 09 MySQL-09-SP mysql 存储过程](https://houbb.github.io/2017/02/27/mysql-09-sp)

[MySQL 09 MySQL-group by 分组](https://houbb.github.io/2017/02/27/mysql-10-groupby)

# 场景

有一张大表，发现加索引直接导致超时，如何通过 mysql online DDL 尽可能降低风险？

我们要理解这个方案的优缺点。

# 一、pt-online-schema-change

pt-online-schema-change（下面简称pt-osc） 是 Percona 公司提供的一种在线改表的工具，也是目前业界使用最普遍和熟知的一种工具。

下面我们就从工作流程、使用限制和风险等方面做一个整体了解。

说明：以下均以在表 t1 上添加一个列 c4 为例。

# 1.1 主要工作流程

pt-osc 的主要工作流程如下：

## 1. 创建影子表

创建 t1 表的副本_t1_new。此时 _t1_new 里没有任何数据，表结构和 t1 完全相同；

## 2. 在影子表上执行变更

在 _t1_new 表上添加列 c4 ，执行语句为 ALTER 语句，因为此时 _t1_new 里没有数据，且业务上不会使用到该表，不会有阻塞发生，所以变更很快就能完成；

## 3. 创建触发器

在表 t1上创建触发器，分别对应 INSERT，DELETE 和 UPDATE 操作。创建触发的目的就是为了在变更期间发生在 t1 上的 DML 操作同步到 _t1_new 上，保证数据的一致性。

### a：INSERT触发器

```sql
CREATE TRIGGER `pt_osc_test_t1_ins` 
AFTER INSERT ON `test`.`t1` FOR 
EACH ROW REPLACE INTO `test`.`_t1_new` (`id`, `col1`, `col2`, `col3`) 
VALUES (NEW.`id`, NEW.`col1`, NEW.`col2`, NEW.`col3`);
```

在原表中的插入操作，对于每一条新增的数据，在影子表中都会执行一条REPLACE INTO 操作。

对于原表来说，若是能插入成功，那么在影子表中也能插入成功；在原表中插入不成功也就不会触发触发器的执行，也就是影子表不会有任何变化， 那么为什么原表的 INSERT 操作会触发影子表的 INPLACE 操作呢？

这是因为在 MYSQL 中，REPLACE 操作也会触发 INSERT 触发器，所以这里触发器的动作若是改成 INSERT 操作，那么在原表上的 REPLACE 操作在触发 INSERT 操作上时就很可能会报错，导致影子表的数据没有变更，从而导致数据丢失。

### b：DELETE 触发器

```sql
CREATE TRIGGER `pt_osc_test_t1_del` 
AFTER DELETE ON `test`.`t1` FOR
EACH ROW DELETE IGNORE FROM `test`.`_t1_new` 
WHERE `test`.`_t1_new`.`id` <=> OLD.`id`
```

DELETE 触发器相对比较简单，在原表的 DELETE 操作，每删除一行都会触发在影子表上的删除动作，只是注意触发器上的是 DELETE IGNORE ，因为在原表上删除的数据，在影子表上可能存在也可能不存在。

### c：UPDATE触发器

```sql
CREATE TRIGGER `pt_osc_test_t1_upd` 
AFTER UPDATE ON `test`.`oldmapping` FOR EACH ROW 
BEGIN 
DELETE IGNORE FROM `test`.`_t1_new` 
WHERE !(OLD.`id` <=> NEW.`id`) AND `test`.`_t1_new`.`id` <=> OLD.`id`;
REPLACE INTO `test`.`_t1_new` (`id`, `col1`, `col2`, `col3`) 
VALUES (NEW.`id`, NEW.`col1`, NEW.`col2`, NEW.`col3`);
END
```

先看触发器中的 REPLACE INTO 语句，在原表更新数据的情况下，对于每一条发生更新的数据，都会触发在影子表上的REPLACE INTO操作。对于影子表，若存在被更新的数据就会更新相应数据，但是对于不存在的数据就会添加到影子表中，由于同步原表数据是使用的INSERT IGNORE INTO 这种语句，所以即便这里提前将数据添加到影子表也不影响。

但是为什么这里还是REPLACE INTO 操作呢？

因为在MySQL中，`INSERT INTO ... ON DUPLICATE UPDATE` 也会更新数据，触发的也是UPDATE触发器。

再看触发器中的DELETE IGNORE 语句，这个语句主要为了在原表上主键（或者唯一键）的值发生变更时，先删除影子表中的对应的数据，然后使用REPLACE INTO 在影子表中插入变更后的数据。若是没有DELETE 操作，那么执行REPLACE INTO 后影子表上就会多出一条更新前的数据，导致数据不一致。

## 4. 同步数据

循环将数据库从 T1 拷贝到 _t1_new，主要执行的就是 `INSERT ... SELECT ... LOCK IN SHARE MODE`。

注意此时正在同步的数据是无法进行 DML 操作的；另外根据选项设置，每次循环时都会监控主从延迟情况或着数据库负载情况。

这里有一个有趣的事情，pt-osc 是怎么获取现有数据的上下边界的呢？换句话说若是需要变更的表的主键为自增列（ID），那么同步到 ID 的哪个值原始数据才算是同步完成呢？

a: 在开始第一次数据同步前，会先获取整个原始数据的下边界，也是第一次循环的下边界

```sql
SELECT /*!40001 SQL_NO_CACHE */ `id` FROM t1  FORCE INDEX(`PRIMARY`) ORDER BY `id` LIMIT 1 /*first lower boundary*/
 // 假设返回数据是 1
```

b：然后获取本次循环的上边界和下次循环的上边界

```sql
SELECT /*!40001 SQL_NO_CACHE */ `id` FROM t1  FORCE INDEX(`PRIMARY`) WHERE ((`id` >= '1')) ORDER BY `id` LIMIT 999, 2 /*next chunk boundary*/
// `id` >= '1' 中 1 是 a步骤中获取的,也就是本次循环的下边界值
// LIMIT 999,2 中 999 和 --chunk-size 设置有关，--chunk-size 减 1；2是固定的。假如返回两条数据1000,10001，那么第一条数据1000就是本次循环的上边界，第二条数据10001是下次循环的下边界
```

c：同步数据

```sql
INSERT LOW_PRIORITY IGNORE INTO `_t1_new` (`id`, `c1`, `c2`, `c3`) SELECT `id`, `c1`, `c2`, `c3`
 FROM t1  FORCE INDEX(`PRIMARY`) WHERE ((`id` >= '1')) AND ((`id` <= '1000')) LOCK IN SHARE MODE /*pt-online-schema-change 11260 copy nibble*/
 // 1000 是步骤b中获取的上边界值
```

d：循环步骤 b 获取上下边界

```sql
SELECT /*!40001 SQL_NO_CACHE */ `id` FROM t1  FORCE INDEX(`PRIMARY`) WHERE ((`id` >= '10001')) ORDER BY `id` LIMIT 999, 2 /*next chunk boundary*/
// 10001 是上次循环执行步骤b获取的下边界值
```

若上面能返回两条数据，那么本次循环还不能将 t1 中未同步的的数据全部同步；

若上面只返回一条数据，则本次循环刚好能将未同步的的数据全部同步，数据的上边界就是此次获取的 id 值；此次数据同步完，进入步骤 5 ；
若上面返回数据为空，则本次循环也能将未同步的的数据全部同步，且同步的数据量小于 --chunk-size 设置的数量，需要执行下面语句获取此次循环的上边界。
这里还要考虑一点，基于上面的方式，已经通过 INSERT 触发器插入到 _t1_new 表的数据，是不是会被重复插入？若是 t1 上的 INSERT 速度大于数据同步的速度，那是不是数据同步就会一直持续，表的变更也就一直不能完成呢？e：循环步骤c 同步数据

## 5. 分析表

确认数据拷贝完成后执行ANALYZE TABLE 操作，这一步主要是为了防止执行完第六步以后，相关的SQL无法选择正确的执行计划；

## 6. 更改表名

RENAME TABLE t1 TO _t1_old, _t1_new TO t1;

## 7. 删除原始表

删除原始表 _t1_old 和触发器。

从上面步骤可以看出，pt-osc 是先在空的影子表上执行 DDL 变更，这样无论 MySQL 的版本是否支持 ONLINE DDL ，都不会影响原始表上的操作，并且对于空表的结构和属性变更是非常快的。

# 使用限制和风险

## 使用限制

由于 pt-osc 需要使用触发器来同步表上的变更，所以在使用时也有一些相应的限制：

原始表上必须有主键或者唯一键，因为创建的 DELETE 触发器依赖主键或者唯一键进行数据同步；不过，若原始表上没有主键或者唯一键，但是即将执行的变更包含创建主键或唯一键的操作也可以；

原始表上不能存在触发器；

pt-online-schema-change 适用于 Percona XtraDB Cluster (PXC) 5.5.28-23.7 及更高版本，但有两个限制：只能更改 InnoDB 表，并且 wsrep_OSU_method 必须设置为 TOI。

如果主机是集群节点并且表是 MyISAM 或正在转换为 MyISAM (ENGINE=MyISAM)，或者wsrep_OSU_method 不是 TOI，则该工具将退出并报错。

## 使用风险

## 更改列名：

a：使用CHANGE方式更改非主键或者非唯一键的列名

例如语句如下：

```
The tool should handle this correctly, but you should test it first because if it fails the renamed columns' data will be lost!  Specify --no-check-alter to disable this check and perform the --alter
```

该语句不会执行，而是会抛出警告并推迟，警告如下：

```
The tool should handle this correctly, but you should test it first because if it fails the renamed columns' data will be lost!  Specify --no-check-alter to disable this check and perform the --alter
```

大概意思就是该工具正常情况是能正确执行的，但是更改列名若是失败可能会导致数据丢失，所以这种操作我们可以先使用 --dry-run 选项打印一下相关操作的语句，确认是否有问题。若没有问题可以在上面的语句上加上 --no-check-alter 选项，语句就能正常执行了。b：更改主键或者唯一键的列名

pt-osc 创建的DELETE触发器是依赖表的主键或者唯一键的，所以若表上只有唯一键或者主键（若两者都有，也一般会使用主键），那么请不要更改对应列名，这会导致在原始表上执行的删除操作报错，并且无法同步到影子表，导致最终数据不一致。

例如以下语句：

```sql
pt-online-schema-change -u user -ppasswd  -h127.0.0.1 -P3308 D=test,t=ptosc --alter "change id id_new int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'primary key' "  --print --dry-run --check-alter
```

注意以下输出：

```
Using original table index PRIMARY for the DELETE trigger instead of new table index PRIMARY because the new table index uses column id_new which does not exist in the original table.
CREATE TRIGGER `pt_osc_test_ptosc_del` AFTER DELETE ON `test`.`ptosc` FOR EACH ROW DELETE IGNORE FROM `test`.`_ptosc_new` WHERE `test`.`_ptosc_new`.`id` <=> OLD.`id`
```

显而易见，由于原始表和影子表上的主键列列名不一致，导致触发器创建的是有问题的。c：先删除列然后添加改名后列

这种情况下，pt-osc不会将删除前列的数据同步到改名后的列。

## 2. 更改有外键引用的表的结构或者属性

更改有外键引用的表会让操作比较负载，目前 pt-osc 提供三种方式处理外键：

rebuild_constraints：该方式会在第六步更改表名后，执行一个原子操作先删除外键再重新添加外键。
drop_swap：该方式会在第六步更改表名前删除原始表，然后将影子表重命名。这会导致表短暂的不存在，若是对表的查询很频繁会导致错误。
none：该方式执行的操作和处理无外键引用的表是相同的，但是外键实际上是引用了已经删除的表。
以上方式的具体解释请参看--alter-foreign-keys-method 的具体解释。

## 3. 创建唯一索引或者主键

由于 pt-osc 使用 INSERT LOW_PRIORITY IGNORE 方式同步原始表和影子表之间的数据，所以若新建唯一索引的列上有重复数据将会导致数据的丢失。若是需要创建唯一索引或主键需要提前确认数据是否重复，是否允许缺失等，需要指定选项 --no-check-alter。

## 4. 锁争用问题

另外还有一个需要注意的问题，由于表上创建有触发器，若表的更新此时比较频繁很可能遇见锁争用问题。之前在给线上表增加索引时就遇见过这种问题，应用端频繁的报死锁错误，在停止 pt-osc 并删除触发器后死锁问题解决。

# 丰富的监控功能

该工具除了提供更改表结构的功能外，还提供了其他非常丰富和友好的功能，如：

该工具可以监控变更期间主从延迟情况，默认是监控所有的从库，若发现有其中一个从库延迟时间超过了 --max-lag 参数设置的数值，则该工具会停止新旧表表之间的数据同步，直到复制延迟低于 --max-lag 设置的数值 。由于生产环境很多时候是一主多从的架构，我们可能只关心某一（几）台从库的延迟情况，这个时候可以使用 --check-slave-lag参数指定需要关注的从库节点。

该工具可以监控变更期间数据库的负载情况，其对应选项为 --max-load 或者 --critical-load。
指定了--max-load 选项后，pt-osc 会在每次同步数据后执行 SHOW GLOBAL STATUS 查看选项定义的需要关注的状态参数，若状态变量高于阈值则会暂停数据同步。--max-load 可以执行单个或多个状态变量，如可以设置为 “Threads_connected:110” or “Threads_connected=110”，也就是 Threads_connected 超过 110 时会暂定数据同步。

--critical-load 和--max-load 类似，只是当指定的状态变量超过阈值时 pt-online-schema-change 会退出，并删除创建的触发器等。这是为了防止由于添加触发器而导致数据库负载异常情况发生。

该工具默认设置 innodb_lock_wait_timeout=1 and (for MySQL 5.5 and newer) lock_wait_timeout=60 ，以防在发生锁争用时阻塞其他正常业务的事务执行。

若要更改或者设置其他参数，可以通过 --set-vars 参数设置。


# chat

## 是什么？

`pt-online-schema-change`（简称 `pt-osc`）是 Percona Toolkit 的一部分，由 Percona 公司开发，用于 MySQL 和 MariaDB 数据库。

它是一套高级的数据库管理工具，专门设计用来在不锁定表的情况下执行在线的 DDL 变更操作。

这使得数据库管理员能够在不中断应用程序的情况下，对数据库结构进行修改。

### 主要功能

1. **在线 DDL 变更**：`pt-OC` 可以在不锁定表的情况下，对数据库表进行结构变更，如添加或删除列、修改列的数据类型、重命名列、添加索引等。

2. **数据一致性**：在执行 DDL 变更过程中，`pt-OC` 会保证数据的一致性，确保在变更过程中写入的数据在新旧表结构中都能正确反映。

3. **并发写入**：`pt-OC` 支持在执行 DDL 变更的同时，允许其他用户对表进行正常的读写操作。

4. **自动调整**：`pt-OC` 能够根据系统负载自动调整复制数据的速度，以减少对生产环境的影响。

5. **错误恢复**：如果 DDL 变更过程中出现错误，`pt-OC` 可以自动回滚到变更前的状态，减少数据丢失的风险。

6. **日志记录**：`pt-OC` 提供详细的日志记录功能，帮助管理员监控变更过程并进行问题排查。

### 工作原理

`pt-OC` 的工作原理大致如下：

1. **创建影子表**：`pt-OC` 首先会创建一个与原表结构相同的空表，称为影子表。

2. **复制数据**：然后，`pt-OC` 会逐步将原表的数据复制到影子表中。在这个过程中，它会跟踪原表的所有写操作，并将这些写操作应用到影子表上，以保持数据的一致性。

3. **应用变更**：在数据复制的同时，`pt-OC` 会在影子表上应用所需的 DDL 变更。

4. **切换表**：一旦数据复制和 DDL 变更完成，`pt-OC` 会将应用程序的写入操作切换到影子表，并将原表重命名为一个临时名称。

5. **清理**：最后，`pt-OC` 会删除原表的临时名称表，完成整个在线 DDL 变更过程。

### 使用示例

以下是使用 `pt-OC` 添加一个新列的示例命令：

```bash
pt-online-schema-change --alter "ALTER TABLE your_table ADD COLUMN new_column INT" D=your_database,t=your_table,h=your_host,u=username,p=password --execute
```

这个命令会执行以下步骤：

- `--alter`：指定要执行的 DDL 语句。
- `D=your_database`：指定数据库名。
- `t=your_table`：指定要变更的表名。
- `h=your_host`：指定数据库服务器的主机名或 IP 地址。
- `u=username`：指定数据库用户名。
- `p=password`：指定数据库密码。
- `--execute`：实际执行 DDL 变更。

### 注意事项

- 在使用 `pt-OC` 之前，建议在测试环境中进行充分的测试，以确保变更不会影响生产数据。
- `pt-OC` 可能不支持所有类型的 DDL 变更，特别是那些涉及外键约束或触发器的变更。
- 在执行 DDL 变更时，虽然 `pt-OC` 可以减少锁定，但仍然可能对性能产生一定影响，特别是在数据量大或变更复杂的情况下。

`pt-OC` 是数据库管理员进行在线 DDL 变更的有力工具，可以显著减少因数据库结构变更导致的服务中断时间。

## 如何保证一致性

`pt-online-schema-change`（简称 `pt-osc`）在执行过程中通过以下机制来保证数据的一致性：

1. **影子表（Ghost Table）**：
   `pt-osc` 创建一个与原表结构相同的空表，称为影子表。这个表用于复制原表的数据，并在复制过程中应用 DDL 变更。

2. **数据复制**：
   `pt-osc` 逐步将原表的数据复制到影子表中。在复制过程中，它会使用 MySQL 的二进制日志复制（binlog）功能，确保原表的所有写操作都被记录，并实时应用到影子表中。

3. **写操作同步**：
   当原表有写入操作（INSERT、UPDATE、DELETE）时，`pt-osc` 会将这些操作同步到影子表。这确保了影子表始终与原表保持一致的状态。

4. **变更应用**：
   在数据复制的同时，`pt-osc` 会在影子表上应用所需的 DDL 变更。由于这些变更仅在影子表上进行，原表的读写操作不受影响。

5. **切换写入**：
   当数据复制和 DDL 变更完成后，`pt-osc` 会将应用程序的写入操作从原表切换到影子表。这个切换过程是原子的，确保在切换瞬间数据的一致性。

6. **原表锁定**：
   在切换写入操作之后，`pt-osc` 会锁定原表，进行最后的清理工作，如重命名表等。这个锁定过程非常短暂，对生产环境的影响很小。

7. **错误恢复**：
   如果 `pt-osc` 在执行过程中遇到错误，它可以自动回滚到变更前的状态。这包括撤销 DDL 变更、恢复原表的数据等，以确保数据的一致性和完整性。

8. **监控和日志**：
   `pt-osc` 提供详细的日志记录功能，帮助管理员监控变更过程并进行问题排查。通过日志，管理员可以及时发现并解决数据一致性问题。

通过这些机制，`pt-osc` 能够在不锁定表的情况下，安全地执行在线 DDL 变更，同时保证数据的一致性和完整性。然而，需要注意的是，`pt-osc` 可能不支持所有类型的 DDL 变更，特别是那些涉及外键约束或触发器的变更。在使用 `pt-osc` 之前，建议在测试环境中进行充分的测试，以确保变更不会影响生产数据。


# 参考资料

https://zhuanlan.zhihu.com/p/625676479?utm_id=0

* any list
{:toc}