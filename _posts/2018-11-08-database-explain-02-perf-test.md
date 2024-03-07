---
layout: post
title: MySQL explain 性能测试验证记录
date:  2018-11-8 18:08:03 +0800
categories: [Database]
tags: [sql, mysql, database, explain, sh]
published: true
---

# 测试

## 场景

测试联合索引的效果。

## 建表语句

当然，你可以使用 SQL 查询和操作来实现这个目标。以下是一个示例的 SQL 脚本，可以在 MySQL 数据库中执行，来插入 100 万条数据并确保 `user_id` 相同：

```sql
-- 创建 user 表
CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    user_name VARCHAR(255),
    user_status INT,
    INDEX idx_user_id (user_id)
);

-- 创建 user_ex 表
CREATE TABLE user_ex (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    remark TEXT,
    INDEX idx_user_id (user_id)
);
```

## 数据初始化

不依赖语言的方式，直接借助于 SQL 初始化 100W 条数据。

非常抱歉，我之前提供的 SQL 语句有一些错误。MySQL 不支持在普通 SQL 查询中使用 `DECLARE` 和 `WHILE` 控制流语句。

对于此类任务，你可能需要使用存储过程或外部编程语言来实现。如果你不想使用编程语言，下面是一个使用存储过程的示例：

```sql
-- 创建存储过程来插入数据
DELIMITER //

CREATE PROCEDURE InsertTestData()
BEGIN
    DECLARE i INT DEFAULT 1;
    WHILE i <= 100000 DO
        INSERT INTO user (user_id, user_name, user_status)
        VALUES (i, 'name', i % 8);

        INSERT INTO user_ex (user_id, remark)
        VALUES (i, 'remark');
        
        SET i = i + 1;
    END WHILE;
END //

DELIMITER ;

-- 调用存储过程
CALL InsertTestData();

-- 删除存储过程
DROP PROCEDURE IF EXISTS InsertTestData;
```

这个示例使用了存储过程 `InsertTestData` 来插入数据。你可以在 MySQL 客户端中执行这些语句。这些语句将创建存储过程、插入数据，然后删除存储过程。这个方法依然是基于编程的，但是不需要外部编程语言，而是使用了 MySQL 内部的存储过程功能。

# TODO....

测试验证, 根据实际效果+测试数据验证。

# 参考资料

NONE

* any list
{:toc}