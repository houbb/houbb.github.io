---
layout: post
title: mysql Tutorial-18-trigger manage
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, mysql, mysql-tutorial, sh]
published: false
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)

# mysql trigger

MySQL触发器（Triggers）是一种数据库对象，它在指定的事件发生时自动执行一系列的SQL语句。

这些事件可以是对表的INSERT、UPDATE或DELETE操作。

触发器可以用来实现复杂的数据逻辑、数据一致性约束和审计跟踪等功能。

下面是对MySQL触发器的详细介绍：

### 触发器的基本概念

1. **事件（Event）**：触发器依附于数据库表，并在特定的事件发生时被触发执行。常见的事件包括INSERT、UPDATE和DELETE。
  
2. **触发时间（Timing）**：触发器可以在事件执行前（BEFORE）或事件执行后（AFTER）执行。BEFORE触发器可以用来修改将要进行的操作，而AFTER触发器则用于在操作完成后执行一些操作。

3. **触发器类型（Trigger Type）**：MySQL支持两种类型的触发器，分别是行级触发器（FOR EACH ROW）和语句级触发器（FOR EACH STATEMENT）。行级触发器会在每一行受到影响时被触发执行，而语句级触发器则在每个SQL语句执行一次。

### 创建触发器

在MySQL中，使用`CREATE TRIGGER`语句来创建触发器。下面是一个创建触发器的示例：

```sql
CREATE TRIGGER trigger_name
    BEFORE INSERT ON table_name
    FOR EACH ROW
    BEGIN
        -- 触发器执行的SQL语句
    END;
```

### 触发器的语法说明

- `CREATE TRIGGER`后面跟着触发器的名称。

- `BEFORE`或`AFTER`关键字指定了触发器的触发时间。

- `INSERT`, `UPDATE`, 或 `DELETE`关键字指定了触发器的事件。

- `ON`后面跟着触发器要监听的表名。

- `FOR EACH ROW`指定了触发器的类型。

- `BEGIN`和`END`之间是触发器执行的SQL语句。


### 触发器的应用场景

1. **数据一致性约束**：通过触发器可以实现对数据的约束，例如检查某些列的值是否满足特定的条件。
   
2. **审计跟踪**：可以在表的INSERT、UPDATE或DELETE操作上创建触发器，以便记录这些操作的发生情况，以用于审计或日志记录。

3. **复杂业务逻辑**：某些复杂的业务逻辑需要在数据操作时进行多步处理，触发器可以用来实现这些逻辑。

4. **数据同步**：在一些需要数据同步的场景下，可以使用触发器在一个表发生改变时自动更新其他相关表的数据。

### 注意事项

1. **性能影响**：触发器的执行会增加数据库的负载，特别是在大型数据表上频繁操作时。需要注意触发器的设计，避免影响数据库性能。

2. **死锁风险**：当触发器中执行的SQL操作与当前事务中的其他操作产生竞争时，可能会导致死锁。因此，在编写触发器时要考虑事务的隔离级别和并发控制。

3. **递归触发器**：触发器的执行可能会导致其他触发器被激活，从而形成递归触发器的调用链。要注意避免触发器的循环调用，以免出现意外的行为。

总的来说，MySQL触发器是一种强大的数据库工具，可以用于实现各种复杂的数据处理逻辑和数据约束。

但是，在使用触发器时需要谨慎设计，以确保其不会影响数据库的性能和稳定性。

# 触发器的管理

## 详细介绍 mysql trigger 创建

当你创建MySQL触发器时，你需要考虑几个关键方面，包括触发器的名称、触发时机、事件类型、所影响的表以及触发器执行的操作。下面详细介绍了创建MySQL触发器时的各个方面：

### 1. 触发器的名称
触发器的名称应该简洁明了，能够清楚地表达触发器的功能或用途。MySQL要求触发器的名称在其所在的数据库中是唯一的。

### 2. 触发时机
MySQL触发器可以在特定的事件发生前（BEFORE）或发生后（AFTER）执行。在创建触发器时需要明确指定触发时机。

### 3. 事件类型
触发器可以关联到表的INSERT、UPDATE或DELETE事件。你可以选择一个或多个事件来触发触发器。

### 4. 所影响的表
触发器需要关联到一个或多个数据库表，并且在这些表上指定的事件发生时才会被触发执行。

### 5. 触发器执行的操作
触发器可以执行各种SQL操作，包括SELECT、INSERT、UPDATE、DELETE等，甚至是调用存储过程或函数。

### 创建触发器的语法
下面是创建MySQL触发器的基本语法：

```sql
CREATE TRIGGER trigger_name
    {BEFORE | AFTER} {INSERT | UPDATE | DELETE}
    ON table_name
    FOR EACH ROW
BEGIN
    -- 触发器执行的SQL语句
END;
```

其中：
- `trigger_name` 是触发器的名称。
- `BEFORE` 或 `AFTER` 指定了触发器的执行时机。
- `INSERT`、`UPDATE` 或 `DELETE` 指定了触发器关联的事件类型。
- `table_name` 是触发器关联的表名。
- `FOR EACH ROW` 指定了触发器的类型，即行级触发器。
- `BEGIN` 和 `END` 之间是触发器执行的SQL语句块。

### 示例

测试验证：

下面是 `orders` 和 `order_statistics` 表的建表语句示例：

```sql
-- 创建 orders 表
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    total_amount DECIMAL(10, 2)
);

-- 创建 order_statistics 表
CREATE TABLE order_statistics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_count INT,
    total_sales DECIMAL(10, 2)
);
```

在这个示例中，`orders` 表存储订单信息，包括订单号、顾客ID、订单日期、订单总金额等；

而 `order_statistics` 表用于存储订单统计信息，例如订单数量和总销售额等。


下面是一个示例，创建了一个在每次向 `orders` 表中插入新记录时自动更新 `order_count` 字段的触发器：

```sql
DELIMITER //
CREATE TRIGGER update_order_stat
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    UPDATE order_statistics SET order_count = order_count + 1;
    UPDATE order_statistics SET total_sales = total_sales + NEW.total_amount;
END;
//
DELIMITER ;
```

1) 它在 `orders` 表的 `INSERT` 事件发生后执行。每次有新的订单插入时，`order_statistics` 表中的 `order_count` 字段都会自动加一。

2) 在每次向 `orders` 表插入新交易记录时，自动将新增订单的交易金额累加到 `order_statistics.total_sales` 字段中。

我们查看一下创建的触发器：

```sql
mysql> SHOW TRIGGERS \G;
*************************** 1. row ***************************
             Trigger: update_order_stat
               Event: INSERT
               Table: orders
           Statement: BEGIN
    UPDATE order_statistics SET order_count = order_count + 1;
    UPDATE order_statistics SET total_sales = total_sales + NEW.total_amount;
END
              Timing: AFTER
             Created: 2024-04-01 09:05:42.63
            sql_mode: PIPES_AS_CONCAT,ANSI_QUOTES,NO_AUTO_VALUE_ON_ZERO,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION
             Definer: admin@%
character_set_client: utf8
collation_connection: utf8_general_ci
  Database Collation: utf8_general_ci
1 row in set (0.00 sec)
```

接下来我们插入数据，测试验证一下。

初始化统计数据：

```sql
insert into order_statistics(order_count, total_sales) values (0, 0); 
```

插入订单信息：

```sql
insert into orders(customer_id, order_date, total_amount) values (1, now(), 100);
insert into orders(customer_id, order_date, total_amount) values (1, now(), 200);
insert into orders(customer_id, order_date, total_amount) values (1, now(), 300);
```

触发器的结果确认：

```sql
mysql> select * from order_statistics;
+----+-------------+-------------+
| id | order_count | total_sales |
+----+-------------+-------------+
|  1 |           3 |      600.00 |
+----+-------------+-------------+
1 row in set (0.00 sec)
```

这个确实挺方便的。

### New. 是啥？

`NEW` 是MySQL中用于引用触发器中正在处理的行的伪行（pseudo row）关键字，它只能在触发器中使用。

在触发器中，`NEW` 用于引用插入或更新操作中的新行的值，而 `OLD` 则用于引用更新或删除操作中受影响的旧行的值。

- 对于 `INSERT` 操作，`NEW` 表示新插入的行。

- 对于 `UPDATE` 操作，`NEW` 表示更新后的新行，而 `OLD` 则表示更新前的旧行。

- 对于 `DELETE` 操作，`OLD` 表示被删除的行。

因此，对于你的需求，在 `AFTER INSERT` 触发器中，使用 `NEW.total_amount` 可以引用新插入的行的 `total_amount` 值。

这样，在每次插入新订单时，触发器会自动将该订单的交易金额累加到 `order_statistics.total_sales` 字段中。

总之，`NEW` 和 `OLD` 是MySQL触发器中的固定写法，用于引用当前正在处理的行的值。

### 注意事项

- 在创建触发器时，要确保触发器的执行逻辑不会导致死锁或性能问题。

- 触发器的执行是隐式事务，因此在触发器中的SQL操作应该尽可能地简洁和高效。

## 详细介绍 mysql trigger 查看

你可以使用`SHOW TRIGGERS`语句来查看数据库中的所有触发器，以及它们的相关信息。

这个语句会返回一个结果集，包含了数据库中所有的触发器的详细信息。

```sql
SHOW TRIGGERS;
```

如果你想查看特定触发器的创建语句，可以使用`SHOW CREATE TRIGGER`语句，将触发器的名称作为参数传递给它。

```sql
SHOW CREATE TRIGGER trigger_name;
```

其中，`trigger_name` 是你想要查看创建语句的触发器的名称。执行这个命令后，你将会得到该触发器的创建语句。

测试：

```sql
mysql> show create trigger update_order_stat \G;
*************************** 1. row ***************************
               Trigger: update_order_stat
              sql_mode: PIPES_AS_CONCAT,ANSI_QUOTES,NO_AUTO_VALUE_ON_ZERO,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION
SQL Original Statement: CREATE DEFINER="admin"@"%" TRIGGER update_order_stat
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    UPDATE order_statistics SET order_count = order_count + 1;
    UPDATE order_statistics SET total_sales = total_sales + NEW.total_amount;
END
  character_set_client: utf8
  collation_connection: utf8_general_ci
    Database Collation: utf8_general_ci
               Created: 2024-04-01 09:05:42.63
1 row in set (0.00 sec)
```

## 详细介绍 mysql trigger 删除

删除MySQL触发器是很简单的，你只需要使用`DROP TRIGGER`语句，并提供要删除的触发器的名称即可。

以下是MySQL触发器删除的详细步骤：

### 1. 确定要删除的触发器名称

在执行删除操作之前，确保你已经知道了要删除的触发器的名称。你可以通过查询系统表来获取所有触发器的名称。

```sql
SHOW TRIGGERS;
```

### 2. 执行删除操作

使用`DROP TRIGGER`语句来删除指定的触发器。

```sql
DROP TRIGGER [IF EXISTS] trigger_name;
```

- `IF EXISTS` 可选参数，表示当触发器不存在时不会报错。
- `trigger_name` 是你要删除的触发器的名称。

### 示例

比如我们不再希望进行数据的累加统计。

假设你要删除一个名为 `update_order_stat` 的触发器，那么可以这样执行删除操作：

```sql
mysql> DROP TRIGGER IF EXISTS update_order_stat;
Query OK, 0 rows affected (0.02 sec)

mysql> show triggers;
Empty set (0.00 sec)
```

### 注意事项

- 删除触发器是一个敏感操作，请确保你确实想要删除该触发器。

- 删除触发器不会删除它所关联的表或其他对象。

- 删除触发器后，它将不再起作用，也不再存在于数据库中。

# 感觉触发器挺好用的，为什么平时开发很少用到？有什么优缺点？

触发器是数据库中强大的工具，可以用于实现许多功能和解决各种问题。

尽管如此，它们并不总是被广泛使用，原因可能包括以下几点：

### 优点：

1. **数据一致性和完整性**：触发器可以用于实施数据约束和完整性规则，确保数据库中的数据始终保持一致和完整。

2. **业务逻辑的封装**：触发器允许在数据库层面上实现业务逻辑，这样可以确保逻辑的统一性和可靠性，避免重复代码和逻辑分散。

3. **自动化处理**：通过触发器，可以自动执行某些操作，而不需要应用程序的干预，这有助于提高数据处理的效率和准确性。

### 缺点：

1. **难以维护**：触发器将业务逻辑分散到数据库层面，可能导致数据库对象的复杂性增加，降低代码的可维护性和可读性。

2. **性能影响**：触发器的执行会增加数据库的负载，特别是在大型数据表上频繁操作时，可能会影响数据库的性能和响应时间。

3. **隐式事务**：触发器中的操作被视为隐式事务，这可能会引起事务的嵌套和死锁等问题，需要谨慎设计和调试。

4. **不易调试**：由于触发器是在数据库中执行的，因此调试起来相对困难，特别是对于复杂的业务逻辑和数据流程。

5. **数据库依赖性**：过度使用触发器可能会增加数据库与应用程序的耦合度，使得数据库的移植和扩展变得更加困难。

### 适用场景：

- 数据完整性和约束：当需要强制执行数据约束时，如唯一性约束、外键约束等。

- 审计跟踪：记录对数据库的变更，以实现审计跟踪和日志记录。

- 数据自动化处理：在某些场景下，需要在数据操作时自动执行一些操作，如更新其他表、发送通知等。

总的来说，触发器是数据库中强大的工具，但是在使用时需要权衡其优缺点，根据具体场景进行选择。

在某些情况下，触发器是非常有用的，但在其他情况下，可能会导致不必要的复杂性和性能问题。


# trigger 的触发时机有哪些？

MySQL中触发器的触发时机主要有两种：BEFORE和AFTER。

每种时机又可以针对不同的操作进行触发。具体如下：

1. **BEFORE触发时机**：

   - `BEFORE INSERT`：在插入操作执行之前触发。

   - `BEFORE UPDATE`：在更新操作执行之前触发。

   - `BEFORE DELETE`：在删除操作执行之前触发。

2. **AFTER触发时机**：

   - `AFTER INSERT`：在插入操作执行之后触发。

   - `AFTER UPDATE`：在更新操作执行之后触发。

   - `AFTER DELETE`：在删除操作执行之后触发。

这些触发时机允许你在特定的操作前后执行自定义的SQL语句，以实现对数据的控制、审计、自动化处理等功能。

例如，BEFORE触发器可以用于在执行操作之前进行数据验证或修改，而AFTER触发器则可以用于在操作执行完成后进行后续处理，如更新其他表或记录审计日志等。

# before/after insert

当触发时机为`BEFORE INSERT`和`AFTER INSERT`时，触发器的执行流程如下：

### BEFORE INSERT触发时机

1. **触发时机**：

   - `BEFORE INSERT`触发器在执行插入操作之前触发。

2. **触发器逻辑**：

   - 在`BEFORE INSERT`触发器中，你可以对即将插入的数据进行修改或验证。

   - 如果触发器中修改了数据，则最终插入到数据库中的数据将受到触发器修改的影响。

   - 如果触发器中执行了错误处理逻辑（例如使用`SIGNAL`语句），插入操作将被取消，数据不会被插入。

### AFTER INSERT触发时机

1. **触发时机**：

   - `AFTER INSERT`触发器在执行插入操作之后触发。

2. **触发器逻辑**：

   - 在`AFTER INSERT`触发器中，你可以在数据插入到数据库之后执行一些后续操作，如更新其他相关表、记录审计日志等。

   - 由于触发时机为`AFTER INSERT`，因此在触发器中不能再修改正在插入的数据，因为数据已经插入到数据库中了。

   - 如果触发器中抛出错误或执行失败，插入操作已经完成的数据不会被回滚，但触发器中的操作将被取消。

### 适用场景

- `BEFORE INSERT`触发器适用于对即将插入的数据进行预处理、验证或修正。

- `AFTER INSERT`触发器适用于在数据插入完成后执行一些额外的后续操作，如更新其他相关表、发送通知等。

综上所述，`BEFORE INSERT`触发器用于在插入数据之前进行处理，而`AFTER INSERT`触发器则用于在插入操作完成后执行后续处理。

这两种触发时机可以在不同的场景下实现对数据的控制和后续处理。

## 实际测试

我们首先准备 2 张测试表：

```sql
drop table if exists orders;
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    order_amount DECIMAL(10, 2)
);

drop table if exists order_history;
CREATE TABLE order_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    oper_type varchar(32),
    insertion_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    order_amount DECIMAL(10, 2)
);
```

创建触发器：

```sql
-- 创建 BEFORE INSERT 触发器
drop trigger if exists before_insert_order_history;

DELIMITER //
CREATE TRIGGER before_insert_order_history
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    -- 在订单插入前，将订单金额记录到 order_history 表中
    INSERT INTO order_history (order_id, oper_type, insertion_time, order_amount)
    VALUES (NEW.order_id, 'insert', NULL, NEW.order_amount);
END;
//
DELIMITER ;

-- 创建 AFTER INSERT 触发器
drop trigger if exists after_insert_order_history;

DELIMITER //
CREATE TRIGGER after_insert_order_history
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    -- 在订单插入后，更新 order_history 表中的插入时间
    UPDATE order_history SET insertion_time = CURRENT_TIMESTAMP
    WHERE order_id = NEW.order_id;
END;
//
DELIMITER ;
```

测试插入：

```sql
insert into orders(customer_id, order_amount) values (1, 100);
insert into orders(customer_id, order_amount) values (2, 200);
```

看一下结果：

```
mysql> select * from order_history;
+----+----------+-----------+---------------------+--------------+
| id | order_id | oper_type | insertion_time      | order_amount |
+----+----------+-----------+---------------------+--------------+
|  1 |        0 | insert    | 2024-04-01 09:23:24 |       100.00 |
|  2 |        0 | insert    | 2024-04-01 09:23:25 |       200.00 |
+----+----------+-----------+---------------------+--------------+
2 rows in set (0.00 sec)

mysql> select * from orders;
+----------+-------------+--------------+
| order_id | customer_id | order_amount |
+----------+-------------+--------------+
|        1 |           1 |       100.00 |
|        2 |           2 |       200.00 |
+----------+-------------+--------------+
2 rows in set (0.00 sec)
```

### 为什么 order_id = 0 呢？

order_id为0是因为在BEFORE INSERT触发器中，order_id被插入到order_history表中时，实际上NEW.order_id还未被赋值，因为此时订单还未插入到orders表中，所以会被赋予默认值0。

解决这个问题的方法是在AFTER INSERT触发器中更新order_history表中的order_id字段，这时order_id已经被赋予了正确的值。以下是修改后的触发器：

我们修正一下：

```sql
-- 创建 BEFORE INSERT 触发器
drop trigger if exists before_insert_order_history;

DELIMITER //
CREATE TRIGGER before_insert_order_history
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    -- 在订单插入前，将订单金额记录到 order_history 表中
    INSERT INTO order_history (order_id, oper_type, insertion_time, order_amount)
    VALUES (NEW.order_id, 'insert', NULL, NEW.order_amount);
END;
//
DELIMITER ;

-- 创建 AFTER INSERT 触发器
drop trigger if exists after_insert_order_history;

DELIMITER //
CREATE TRIGGER after_insert_order_history
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    -- 在订单插入后，更新 order_history 表中的插入时间
    UPDATE order_history 
    SET insertion_time = CURRENT_TIMESTAMP,
    order_id = NEW.order_id
    WHERE order_id = 0
    AND oper_type = 'insert';
END;
//
DELIMITER ;
```

再次插入测试:

```sql
insert into orders(customer_id, order_amount) values (3, 100);
insert into orders(customer_id, order_amount) values (4, 200);
```

这次就正常了。

```sql
mysql> select * from order_history;
+----+----------+-----------+---------------------+--------------+
| id | order_id | oper_type | insertion_time      | order_amount |
+----+----------+-----------+---------------------+--------------+
|  3 |        3 | insert    | 2024-04-01 09:28:48 |       100.00 |
|  4 |        4 | insert    | 2024-04-01 09:28:48 |       200.00 |
+----+----------+-----------+---------------------+--------------+
```


# before/after update

## 说明

当触发器的触发时机为`BEFORE UPDATE`和`AFTER UPDATE`时，它们分别在数据库表的更新操作之前和之后触发。

下面我将详细介绍这两个触发时机的特点和使用方法：

### BEFORE UPDATE 触发时机
1. **触发时机**：
   - `BEFORE UPDATE`触发器在执行更新操作之前触发。
2. **触发器逻辑**：
   - 在`BEFORE UPDATE`触发器中，你可以访问和修改正在更新的数据行（NEW）和更新前的数据行（OLD）。
   - 你可以在触发器中修改NEW中的值，以修改即将更新到数据库表中的数据。
   - 如果触发器中执行了错误处理逻辑（例如使用`SIGNAL`语句），更新操作将被取消，数据不会被更新。

### AFTER UPDATE 触发时机
1. **触发时机**：
   - `AFTER UPDATE`触发器在执行更新操作之后触发。
2. **触发器逻辑**：
   - 在`AFTER UPDATE`触发器中，你可以访问更新后的数据行（NEW）和更新前的数据行（OLD）。
   - 你可以在触发器中执行一些后续操作，如记录日志、发送通知等。
   - 由于触发时机为`AFTER UPDATE`，因此在触发器中不能再修改正在更新的数据行。

### 适用场景

- `BEFORE UPDATE`触发器适用于在更新数据之前进行预处理、验证或修正。

- `AFTER UPDATE`触发器适用于在数据更新完成后执行一些额外的后续操作，如记录日志、发送通知等。

## 例子

触发器脚本：

```sql
drop trigger if exists before_update_order_history;

DELIMITER //
CREATE TRIGGER before_update_order_history
BEFORE update ON orders
FOR EACH ROW
BEGIN
    INSERT INTO order_history (order_id, oper_type, insertion_time, order_amount)
    VALUES (NEW.order_id, 'update', NULL, NEW.order_amount);
END;
//
DELIMITER ;

drop trigger if exists after_update_order_history;

DELIMITER //
CREATE TRIGGER after_update_order_history
AFTER update ON orders
FOR EACH ROW
BEGIN
    UPDATE order_history 
    SET insertion_time = CURRENT_TIMESTAMP,
    order_id = NEW.order_id
    WHERE order_id = 0
    AND oper_type = 'update';
END;
//
DELIMITER ;
```


更新数据测试：

```sql
update orders set order_amount = 111 where order_id=1;
update orders set order_amount = 222 where order_id=2;
```

数据确认：

```
mysql> select * from order_history where oper_type = 'update';
+----+----------+-----------+---------------------+--------------+
| id | order_id | oper_type | insertion_time      | order_amount |
+----+----------+-----------+---------------------+--------------+
|  5 |        1 | update    | 2024-04-01 09:33:49 |       111.00 |
|  6 |        2 | update    | 2024-04-01 09:33:50 |       222.00 |
+----+----------+-----------+---------------------+--------------+
2 rows in set (0.00 sec)
```

# before/after delete

## 说明

当触发器的触发时机为`BEFORE DELETE`和`AFTER DELETE`时，它们分别在数据库表的删除操作之前和之后触发。下面我将详细介绍这两个触发时机的特点和使用方法：

### BEFORE DELETE 触发时机

1. **触发时机**：

   - `BEFORE DELETE`触发器在执行删除操作之前触发。

2. **触发器逻辑**：

   - 在`BEFORE DELETE`触发器中，你可以访问和修改即将被删除的数据行（OLD）。

   - 你可以在触发器中对即将被删除的数据行进行预处理、验证或修正。

   - 如果触发器中执行了错误处理逻辑（例如使用`SIGNAL`语句），删除操作将被取消，数据不会被删除。

### AFTER DELETE 触发时机

1. **触发时机**：

   - `AFTER DELETE`触发器在执行删除操作之后触发。

2. **触发器逻辑**：

   - 在`AFTER DELETE`触发器中，你可以访问已被删除的数据行（OLD）。

   - 你可以在触发器中执行一些后续操作，如记录日志、发送通知等。

   - 由于触发时机为`AFTER DELETE`，因此在触发器中不能再修改已被删除的数据行。

### 适用场景

- `BEFORE DELETE`触发器适用于在删除数据之前进行预处理、验证或修正。

- `AFTER DELETE`触发器适用于在数据删除成功后执行一些额外的后续操作，如记录日志、发送通知等。

## 测试

触发器脚本：

```sql
drop trigger if exists before_delete_order_history;

DELIMITER //
CREATE TRIGGER before_delete_order_history
BEFORE delete ON orders
FOR EACH ROW
BEGIN
    INSERT INTO order_history (order_id, oper_type, insertion_time, order_amount)
    VALUES (OLD.order_id, 'delete', NULL, OLD.order_amount);
END;
//
DELIMITER ;

drop trigger if exists after_delete_order_history;

DELIMITER //
CREATE TRIGGER after_delete_order_history
AFTER delete ON orders
FOR EACH ROW
BEGIN
    UPDATE order_history 
    SET insertion_time = CURRENT_TIMESTAMP,
    order_id = OLD.order_id
    WHERE order_id = 0
    AND oper_type = 'delete';
END;
//
DELIMITER ;
```


更新数据测试：

```sql
delete from orders where order_id=1;
delete from orders where order_id=2;
```

数据确认：

```
mysql> select * from order_history where oper_type = 'delete';
+----+----------+-----------+---------------------+--------------+
| id | order_id | oper_type | insertion_time      | order_amount |
+----+----------+-----------+---------------------+--------------+
|  7 |        1 | delete    | 2024-04-01 09:39:08 |       111.00 |
|  8 |        2 | delete    | 2024-04-01 09:39:08 |       222.00 |
+----+----------+-----------+---------------------+--------------+
2 rows in set (0.00 sec)
```

# 小结

以下是关于MySQL触发器的总结：

### 1. 触发时机：

- MySQL触发器可以在以下四种时机被触发：`BEFORE INSERT`、`AFTER INSERT`、`BEFORE UPDATE`、`AFTER UPDATE`、`BEFORE DELETE`、`AFTER DELETE`。

- `BEFORE`触发器在操作执行之前触发，允许修改即将被操作的数据。

- `AFTER`触发器在操作执行之后触发，用于执行后续操作或记录日志等。

### 2. 触发器逻辑：

- 触发器的逻辑由SQL语句组成，在`BEGIN`和`END`之间定义。

- 在触发器内部，可以访问`NEW`和`OLD`伪行来引用即将被操作或已被操作的数据行。

- 可以使用条件语句（如`IF`语句）和流程控制语句（如`CASE`语句）来根据需要执行不同的逻辑。

### 3. 触发器的应用：

- 实施数据约束和完整性：通过触发器可以实现数据约束，如唯一性约束、外键约束等。

- 记录审计日志：通过触发器可以记录对数据库的数据变更操作，用于审计跟踪和安全性监控。

- 自动化处理：触发器可以用于执行自动化处理，如在插入、更新或删除数据时自动执行一些操作。

### 4. 触发器的注意事项：

- 触发器的性能影响：过度使用触发器可能会影响数据库的性能和响应时间，特别是在大型数据表上。

- 触发器的维护和调试：触发器增加了数据库对象的复杂性，可能会降低代码的可维护性和可读性。

- 触发器的数据库依赖性：过度依赖触发器可能会增加数据库与应用程序的耦合度，使得数据库的移植和扩展变得更加困难。

总的来说，MySQL触发器是数据库中强大的工具，可以实现数据约束、审计跟踪、自动化处理等功能。

不过实际开发中，为了维护方便，都是用代码实现这种触发器的能力。

# 参考资料

* any list
{:toc}