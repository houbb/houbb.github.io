---
layout: post
title: mysql Tutorial-17-key
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, mysql, mysql-tutorial, sh]
published: false
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)

# mysql key

当设计数据库时，主键（Primary Key）、外键（Foreign Key）、唯一键（Unique Key）、组合键（Composite Key）和备用键（Alternate Key）是常用的概念。

MySQL 中的含义和用法：

### 1. 主键（Primary Key）：

主键是一列或一组列，其值用于唯一标识表中的每一行记录。主键必须保证唯一性且不为空。在 MySQL 中，通常通过在创建表时使用 `PRIMARY KEY` 关键字来定义主键。

**示例：**
```sql
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE
);
```

### 2. 外键（Foreign Key）：

外键是一列或一组列，用于建立表与表之间的关联关系。外键用于实现数据的完整性约束，确保关联表中的数据始终具有一致性。在 MySQL 中，可以通过在创建表时使用 `FOREIGN KEY` 关键字来定义外键。

**示例：**
```sql
CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

### 3. 唯一键（Unique Key）：

唯一键是一列或一组列，其值必须保持唯一性，但允许为空。唯一键用于确保表中的数据具有唯一性，但与主键不同，唯一键允许空值。在 MySQL 中，可以通过在创建表时使用 `UNIQUE` 关键字来定义唯一键。

**示例：**
```sql
CREATE TABLE products (
    product_id INT PRIMARY KEY,
    product_code VARCHAR(50) UNIQUE,
    product_name VARCHAR(100) NOT NULL
);
```

### 4. 组合键（Composite Key）：

组合键是由表中的多列组合而成的键，用于唯一标识表中的每一行记录。组合键的值是多个列的组合，用于确保表中的数据具有唯一性。在 MySQL 中，可以通过在创建表时将多个列作为联合主键来定义组合键。

**示例：**
```sql
CREATE TABLE orders (
    order_id INT,
    user_id INT,
    PRIMARY KEY (order_id, user_id)
);
```

### 5. 备用键（Alternate Key）：

备用键是除主键外的其他键，用于提供对表中数据的另一种唯一性约束。备用键用于查询和索引，但不用于唯一标识每一行记录。在 MySQL 中，可以通过在创建表时使用 `UNIQUE` 关键字来定义备用键。

**示例：**
```sql
CREATE TABLE users (
    user_id INT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) NOT NULL
);
```

# mysql 主键

在 MySQL 中，主键（Primary Key）是一种用于唯一标识表中每一行记录的键。

主键的值必须唯一且不能为空，用于确保表中的每一行都有唯一的标识符。

主键在数据库设计中起着重要的作用，它可以用来：

- 唯一标识表中的每一行数据。
- 作为其他表的外键，用于建立表与表之间的关联关系。
- 作为数据的唯一索引，加快数据检索的速度。

以下是 MySQL 中主键的详细介绍：

### 创建主键：

在 MySQL 中，可以通过以下方式来创建主键：
1. 在创建表时指定主键：
   ```sql
   CREATE TABLE table_name (
       column1 datatype PRIMARY KEY,
       column2 datatype,
       ...
   );
   ```
2. 在创建表后通过 `ALTER TABLE` 添加主键：
   ```sql
   ALTER TABLE table_name
   ADD PRIMARY KEY (column1);
   ```

### 主键约束：

- 主键必须保证唯一性：表中每一行的主键值都必须唯一，不允许出现重复的值。
- 主键不能为 NULL：主键列的值不能为空，即主键列不允许为 NULL。
- 表中每一行必须有主键值：每一行都必须有主键值，即主键列的值不能为 NULL。

### 自动递增主键：

在 MySQL 中，常见的做法是使用自动递增的整数作为主键，即主键列设置为 `AUTO_INCREMENT`，这样可以自动为每一行分配唯一的主键值，而不需要手动指定。

```sql
CREATE TABLE table_name (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ...
);
```

### 复合主键（Composite Primary Key）：

在 MySQL 中，可以将多个列作为主键的一部分，形成复合主键，用于唯一标识表中的每一行记录。

```sql
CREATE TABLE table_name (
    column1 datatype,
    column2 datatype,
    ...
    PRIMARY KEY (column1, column2)
);
```

### 删除主键：

在 MySQL 中，可以通过 `ALTER TABLE` 命令来删除主键约束。

```sql
ALTER TABLE table_name
DROP PRIMARY KEY;
```



# mysql 外键

在 MySQL 中，外键（Foreign Key）是一种用于建立表与表之间关联关系的约束，它指定了一个表中的列（或一组列）与另一个表中的主键或唯一键列之间的关联关系。

外键约束用于确保数据的完整性，以及维护表之间的引用一致性。

以下是关于 MySQL 外键的详细介绍：

### 创建外键：

在 MySQL 中，可以通过以下方式来创建外键：

1. 在创建表时指定外键：

   ```sql
   CREATE TABLE child_table (
       column1 datatype,
       column2 datatype,
       ...
       FOREIGN KEY (column_name) REFERENCES parent_table(parent_column)
   );
   ```

2. 在创建表后通过 `ALTER TABLE` 添加外键：

   ```sql
   ALTER TABLE child_table
   ADD CONSTRAINT fk_name FOREIGN KEY (column_name) REFERENCES parent_table(parent_column);
   ```

### 外键约束：

- 外键用于建立表与表之间的关联关系：外键指定了一个表中的列（或一组列）与另一个表中的主键或唯一键列之间的关联关系。

- 外键确保引用的一致性：外键约束确保了在子表中的引用值必须存在于父表的关联列中，从而维护了表之间的引用一致性。

- 外键可以是可选的：外键可以允许 NULL 值，表示子表中的引用值可以为空。

### 删除外键：

在 MySQL 中，可以通过 `ALTER TABLE` 命令来删除外键约束。

```sql
ALTER TABLE child_table
DROP FOREIGN KEY fk_name;
```

### 外键操作的限制：

在 MySQL 中，对于外键操作有一些限制和要求：

- 父表的关联列必须是主键或唯一键：外键引用的父表中的列必须是主键或唯一键，以确保引用值的唯一性。

- 外键约束需要使用 InnoDB 存储引擎：在 MySQL 中，只有使用 InnoDB 存储引擎的表才支持外键约束。

### 外键的作用：

- 维护数据的完整性和一致性：外键约束确保了表之间的引用一致性，防止了无效引用的出现。

- 建立表之间的关联关系：外键约束定义了表与表之间的关联关系，使得表之间的数据具有更严密的关联性。

### 示例：

假设我们有两个表 `orders` 和 `customers`，我们可以使用外键约束来建立它们之间的关联关系：

```sql
CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);
```

在这个示例中，`orders` 表中的 `customer_id` 列是一个外键，它引用了 `customers` 表中的 `customer_id` 列，从而建立了这两个表之间的关联关系。

# mysql 唯一键

在 MySQL 中，唯一键（Unique Key）是一种约束，用于确保表中的某个列或一组列的值是唯一的。

与主键类似，唯一键也可以用于确保数据的唯一性，但与主键不同的是，唯一键允许包含 NULL 值。

如果列定义为唯一键，则在该列中的每个值都必须是唯一的，但 NULL 值除外。

以下是关于 MySQL 唯一键的详细介绍：

### 创建唯一键：

在 MySQL 中，可以通过以下方式来创建唯一键：

1. 在创建表时指定唯一键：
   ```sql
   CREATE TABLE table_name (
       column1 datatype,
       column2 datatype,
       ...
       UNIQUE (column_name)
   );
   ```
2. 在创建表后通过 `ALTER TABLE` 添加唯一键：

   ```sql
   ALTER TABLE table_name
   ADD CONSTRAINT uk_name UNIQUE (column_name);
   ```

### 唯一键约束：

- 唯一键用于确保某个列或一组列的值是唯一的：唯一键约束用于确保表中某个列或一组列的值是唯一的，即不允许出现重复值。

- 唯一键允许包含 NULL 值：与主键不同，唯一键允许包含 NULL 值，但在列中的每个非 NULL 值必须是唯一的。

- 可以定义多个唯一键：在同一表中可以定义多个唯一键，每个唯一键可以包含一个或多个列。

### 删除唯一键：

在 MySQL 中，可以通过 `ALTER TABLE` 命令来删除唯一键约束。

```sql
ALTER TABLE table_name
DROP INDEX uk_name;
```

### 唯一键的作用：

- 确保数据的唯一性：唯一键约束确保了表中某个列或一组列的值是唯一的，避免了数据的重复。

- 提高数据的完整性：唯一键约束有助于提高数据的完整性，防止了重复值的出现，从而保持了数据的一致性。

### 示例：
假设我们有一个 `users` 表，我们希望确保 `email` 列中的值是唯一的，可以使用唯一键约束来实现：

```sql
CREATE TABLE users (
    user_id INT PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    ...
);
```

在这个示例中，`email` 列被定义为唯一键，确保了表中每个用户的电子邮件地址都是唯一的。


# mysql 组合键

在 MySQL 中，组合键（Composite Key）是由表中的多个列组合而成的键，用于唯一标识表中的每一行记录。

与单一列的主键或唯一键不同，组合键由多个列的组合构成，确保了这些列的值的组合是唯一的。

组合键可以用于确保多个列的组合值的唯一性，并且可以在一些特定的查询场景下提高性能。

以下是关于 MySQL 组合键的详细介绍：

### 创建组合键：

在 MySQL 中，可以通过以下方式来创建组合键：

1. 在创建表时指定组合键：
   ```sql
   CREATE TABLE table_name (
       column1 datatype,
       column2 datatype,
       ...
       PRIMARY KEY (column1, column2)
   );
   ```
2. 在创建表后通过 `ALTER TABLE` 添加组合键：

   ```sql
   ALTER TABLE table_name
   ADD CONSTRAINT pk_name PRIMARY KEY (column1, column2);
   ```

### 组合键约束：

- 组合键由多个列的组合构成：组合键是由表中的多个列的组合构成的，用于唯一标识表中的每一行记录。

- 组合键的值必须唯一：组合键要求表中每一行记录的组合键值都必须是唯一的，即这些列的值的组合不允许重复。

- 可以包含 NULL 值：与单一列的主键不同，组合键可以包含 NULL 值，但整个组合键值必须唯一。

### 使用场景：

- 需要唯一性约束的多个列：当需要确保多个列的组合值的唯一性时，可以使用组合键约束。

- 多列查询的性能优化：在一些查询中，如果查询条件涉及到了组合键中的多个列，那么使用组合键可以提高查询的性能，因为组合键的索引可以直接满足查询条件。

### 示例：

假设我们有一个 `orders` 表，订单号和顾客 ID 组合在一起是唯一的，我们可以使用组合键来实现：

```sql
CREATE TABLE orders (
    order_id INT,
    customer_id INT,
    order_date DATE,
    PRIMARY KEY (order_id, customer_id)
);
```

在这个示例中，`(order_id, customer_id)` 组合在一起构成了组合键，确保了每个订单号和顾客 ID 的组合是唯一的。

### 注意事项：

- 设计组合键时需要注意列的顺序，不同的列顺序会影响索引的性能和查询优化。

- 组合键通常用于查询条件中涉及多个列的情况，以提高查询性能。


# mysql 备用键

在 MySQL 中，备用键（Alternate Key）是一种除了主键外的其他键，它用于提供对表中数据的另一种唯一性约束。

备用键通常用于标识表中的某些列的值是唯一的，但与主键不同，备用键并不用于唯一标识表中的每一行记录。

备用键可以包含 NULL 值，但在非 NULL 值中必须保持唯一。

以下是关于 MySQL 备用键的详细介绍：

### 创建备用键：

在 MySQL 中，可以通过以下方式来创建备用键：

1. 在创建表时指定唯一键：

   ```sql
   CREATE TABLE table_name (
       column1 datatype,
       column2 datatype,
       ...
       UNIQUE (column_name)
   );
   ```
2. 在创建表后通过 `ALTER TABLE` 添加唯一键：

   ```sql
   ALTER TABLE table_name
   ADD CONSTRAINT uk_name UNIQUE (column_name);
   ```

### 备用键约束：

- 备用键用于提供对表中数据的另一种唯一性约束：备用键约束用于确保表中某个列或一组列的值是唯一的，但并不用于唯一标识表中的每一行记录。

- 备用键允许包含 NULL 值：与主键不同，备用键允许包含 NULL 值，但在列中的每个非 NULL 值必须是唯一的。

### 删除备用键：

在 MySQL 中，可以通过 `ALTER TABLE` 命令来删除备用键约束。

```sql
ALTER TABLE table_name

DROP INDEX uk_name;
```

### 备用键的作用：

- 提供对表中数据的另一种唯一性约束：备用键约束用于确保表中某个列或一组列的值是唯一的，提供了对数据的另一种唯一性约束。

- 支持对表中数据的唯一性查询：备用键的存在使得可以通过某些列进行唯一性查询，而不是只能依赖于主键。

### 示例：
假设我们有一个 `products` 表，我们希望确保 `product_code` 列中的值是唯一的，可以使用备用键约束来实现：

```sql
CREATE TABLE products (
    product_id INT PRIMARY KEY,
    product_code VARCHAR(50) UNIQUE,
    product_name VARCHAR(100) NOT NULL
);
```

在这个示例中，`product_code` 列被定义为备用键，确保了表中每个产品的产品代码是唯一的。

### 注意事项：

- 备用键通常用于确保某些列的值的唯一性，但并不用于唯一标识每一行记录。

- 在设计数据库时，需要根据具体的业务需求和数据特点来确定是否需要添加备用键。

* any list
{:toc}