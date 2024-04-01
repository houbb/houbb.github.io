---
layout: post
title: mysql Tutorial-07-table column constraint 约束
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, mysql, mysql-tutorial, sh]
published: false
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)


# mysql 的表的 constraint 约束

## 说明

下面是 MySQL 中常见的表约束及其解释和示例：

1. **NOT NULL**:
   - `NOT NULL` 约束用于确保列中的值不为空。
   - 示例：

    ```sql
    CREATE TABLE employees (
        employee_id INT NOT NULL,
        employee_name VARCHAR(50) NOT NULL,
        ...
    );
    ```

2. **UNIQUE**:
   - `UNIQUE` 约束用于确保列中的值是唯一的，但允许空值。
   - 示例：

    ```sql
    CREATE TABLE employees (
        employee_id INT UNIQUE,
        employee_email VARCHAR(100) UNIQUE,
        ...
    );
    ```

3. **PRIMARY KEY**:
   - `PRIMARY KEY` 约束用于定义表中的主键，确保每行数据都具有唯一标识符，并且不为空。
   - 一个表只能有一个主键。
   - 示例：

    ```sql
    CREATE TABLE employees (
        employee_id INT PRIMARY KEY,
        ...
    );
    ```

4. **FOREIGN KEY**:
   - `FOREIGN KEY` 约束用于定义表之间的关系，确保一个表中的数据在另一个表中存在对应的值。
   - 外键约束通常用于实现引用完整性。
   - 示例：

    ```sql
    CREATE TABLE orders (
        order_id INT PRIMARY KEY,
        customer_id INT,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    );
    ```

5. **CHECK**:
   - `CHECK` 约束用于定义表中列的值的范围或条件，确保插入或更新的数据满足指定的条件。
   - 示例：

    ```sql
    CREATE TABLE employees (
        employee_id INT PRIMARY KEY,
        employee_age INT CHECK (employee_age >= 18)
    );
    ```

6. **DEFAULT**:
   - `DEFAULT` 约束用于为列指定默认值，当插入数据时，如果未提供该列的值，则使用默认值。
   - 示例：

    ```sql
    CREATE TABLE employees (
        employee_id INT PRIMARY KEY,
        employee_status VARCHAR(20) DEFAULT 'Active'
    );
    ```

7. **CREATE INDEX**:
   - `CREATE INDEX` 命令用于创建索引，索引可以提高数据检索的效率。
   - 示例：

    ```sql
    CREATE INDEX idx_employee_name ON employees (employee_name);
    ```

8. **AUTO_INCREMENT**:
   - `AUTO_INCREMENT` 约束用于自动为列生成唯一的整数值，通常用于创建自增主键。
   - 示例：

    ```sql
    CREATE TABLE employees (
        employee_id INT PRIMARY KEY AUTO_INCREMENT,
        ...
    );
    ```

这些约束可以单独使用，也可以组合使用以满足特定的需求。它们确保了数据库中的数据完整性、一致性和有效性。


## 实际测试

我们来一张表，尽可能多的用到上面的约束。

这里故意把外键约束注释掉了，老马不是很喜欢用这个约束，程序中如果有外键限制，**建议使用程序去保证**。

以下是一个建表语句，其中包含了上面提到的几种约束：

```sql
CREATE TABLE employees_constraint (
    -- 员工ID，不能为空，且必须是唯一的主键
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- 员工姓名，不能为空，且必须是唯一的
    employee_name VARCHAR(50) NOT NULL UNIQUE,
    
    -- 部门ID，可以为空，但如果有值，必须在departments表中存在对应的部门ID
    -- department_id INT,FOREIGN KEY (department_id) REFERENCES departments(department_id),
    
    -- 员工年龄，不能为空，且必须大于等于18岁
    employee_age INT NOT NULL CHECK (employee_age >= 18),
    
    -- 员工邮箱，可以为空，但如果有值，必须是唯一的
    employee_email VARCHAR(100) UNIQUE,
    
    -- 员工状态，默认为'Active'
    employee_status VARCHAR(20) DEFAULT 'Active'
);
```

这个建表语句创建了一个名为 `employees` 的表，其中包含了主键约束、唯一约束、CHECK约束和DEFAULT约束。

效果：

```
mysql> desc employees_constraint;
+-----------------+--------------+------+-----+---------+----------------+
| Field           | Type         | Null | Key | Default | Extra          |
+-----------------+--------------+------+-----+---------+----------------+
| employee_id     | int(11)      | NO   | PRI | NULL    | auto_increment |
| employee_name   | varchar(50)  | NO   | UNI | NULL    |                |
| employee_age    | int(11)      | NO   |     | NULL    |                |
| employee_email  | varchar(100) | YES  | UNI | NULL    |                |
| employee_status | varchar(20)  | YES  |     | Active  |                |
+-----------------+--------------+------+-----+---------+----------------+
5 rows in set (0.00 sec)
```

# 参考资料

https://www.tutorialspoint.com/mysql/mysql_create_table.htm

https://blog.csdn.net/miyatang/article/details/78227344

* any list
{:toc}