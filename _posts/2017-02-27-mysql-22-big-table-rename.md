---
layout: post
title:  MySQL-22-mysql 特别大的表加索引加不上，如何通过 rename 的方式尽可能减少影响？
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

有一张大表，发现加索引直接导致超时，如何通过 rename 尽可能降低风险？

# 流程简单版本

## 核心流程

可以通过 rename

1) 创建新表


    ```sql
    CREATE TABLE new_table LIKE old_table;
    ```

2) 执行索引+字段等操作

```sql
INSERT INTO new_table SELECT * FROM old_table;
```

3) 复制数据

```sql
INSERT INTO new_table SELECT * FROM old_table;
```

4) rename

```sql
RENAME TABLE old_table TO old_table_backup;
RENAME TABLE new_table TO old_table;
```

5) 旧表移除-可选

```sql
DROP TABLE old_table_backup;
```

## 不足

复制数据这一步，如果服务有写入，会导致数据不是最新，最全。






# chat


## 流程

在MySQL中，如果一个表非常大，添加索引可能会非常耗时，并且可能会影响到数据库的性能和可用性。

一种常见的做法是通过`RENAME`命令将大表重命名，然后创建一个新表，并将数据从旧表复制到新表，同时在新表上添加索引。这种方法可以减少对生产环境的影响，因为你可以逐步将数据从旧表迁移到新表，并且在这个过程中对新表进行索引。

以下是通过`RENAME`操作来添加索引的步骤：

1. **创建新表**：首先，创建一个与原表结构相同的新表，但是不要立即添加索引。

    ```sql
    CREATE TABLE new_table LIKE old_table;
    ```

2. **复制数据**：使用`INSERT INTO ... SELECT * FROM ...`语句将数据从旧表复制到新表。

    ```sql
    INSERT INTO new_table SELECT * FROM old_table;
    ```

3. **添加索引**：在新表上添加所需的索引。

    ```sql
    ALTER TABLE new_table ADD INDEX index_name (column1, column2, ...);
    ```

4. **重命名旧表**：将旧表重命名为一个临时名称，以避免与新表冲突。

    ```sql
    RENAME TABLE old_table TO old_table_backup;
    ```

5. **重命名新表**：将新表重命名为原表的名称。

    ```sql
    RENAME TABLE new_table TO old_table;
    ```

6. **验证数据**：确保新表和旧表的数据一致性。

7. **清理**：在确认新表工作正常并且数据一致后，可以删除旧表的备份。

    ```sql
    DROP TABLE old_table_backup;
    ```

8. **更新应用程序**：更新任何依赖于原表的应用程序或脚本，确保它们现在指向新表。

请注意，这个过程可能需要在维护窗口或低峰时段进行，以减少对生产环境的影响。此外，确保在执行这些步骤之前备份你的数据，以防万一出现问题。

另外，如果你的表非常大，复制数据可能会花费一些时间。在这种情况下，你可能需要考虑使用更高级的迁移策略，比如使用`pt-table-sync`这样的工具，它可以在复制数据的同时保持两个表之间的同步。这样，你可以逐步将查询负载转移到新表，同时逐步停止对旧表的写入操作。

## 如何保证这些动作的事务性？防止不同的 rename 之间有时间差？

在MySQL中，`RENAME TABLE`操作本身是原子性的，这意味着它要么完全成功，要么完全不执行。

然而，如果你需要在`RENAME TABLE`操作前后执行其他操作（例如创建新表、复制数据、添加索引等），并希望整个序列作为一个单一的事务来执行，以保证数据的一致性和完整性，你可以采取以下步骤：

1. **使用事务**：确保你的操作在一个事务中执行。在MySQL的InnoDB存储引擎中，事务是支持的。

    ```sql
    START TRANSACTION;
    ```

2. **执行操作**：执行创建新表、复制数据、添加索引等操作。

3. **重命名表**：在事务的最后执行`RENAME TABLE`操作。

    ```sql
    RENAME TABLE old_table TO old_table_backup, new_table TO old_table;
    COMMIT;
    ```

    注意：在事务中使用`RENAME TABLE`时，你需要确保所有的表操作（创建、复制、索引添加）都在事务中完成，然后再执行`RENAME TABLE`。

4. **验证事务**：在`RENAME TABLE`之后，立即进行事务提交。如果有任何操作失败，事务将回滚到开始状态。

5. **错误处理**：如果在事务过程中发生错误，使用`ROLLBACK`来撤销所有更改。

    ```sql
    ROLLBACK;
    ```

6. **监控性能**：由于操作可能涉及到大量数据，监控数据库性能以确保操作不会对生产环境造成过大影响。

7. **使用锁**：在复制数据和重命名表的过程中，考虑使用适当的锁定机制来防止其他操作干扰。例如，你可以在复制数据时使用`LOCK TABLES`，但请注意这会阻塞对表的所有其他操作。

8. **备份数据**：在执行任何操作之前，确保你有完整的数据备份，以防需要恢复数据。

9. **逐步迁移**：如果表非常大，考虑逐步迁移数据，例如通过分批复制数据，然后逐步将查询和更新操作转移到新表。

10. **使用工具**：考虑使用专业的数据库迁移工具，这些工具可能提供了更高级的事务性和错误恢复机制。

请注意，虽然`RENAME TABLE`是原子性的，但在实际操作中，特别是在生产环境中，最好还是通过测试来验证你的迁移策略在特定情况下的行为。此外，确保在低峰时段进行这些操作，以最小化对用户的影响。

# 参考资料

https://zhuanlan.zhihu.com/p/625676479?utm_id=0

* any list
{:toc}