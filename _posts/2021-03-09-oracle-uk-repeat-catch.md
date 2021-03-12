---
layout: post
title:  mybatis plus BatchUpdateException ORA-00001 违反唯一约束条件应该如何捕获？
date:  2021-3-09 16:52:15 +0800
categories: [Database]
tags: [oracle, mybatis, sh]
published: true
---


# 问题描述

对于 oracle 数据库，我们的表通常会创建唯一索引。

不过有时候因为并发等问题，重复插入失败是很正常的，我们希望捕获掉对应的异常，输出 warn 级别的日志即可。

实际使用的 mybatis-plus 作为数据库操作框架，记录一下一些小问题。

# 单个插入的重复

这个比较符合预期，实现如下：

```java
try {
    userService.insert(user);
} catch (DuplicateKeyException exception) {
    logger.warn("插入重复，插入失败。", exception);
}
```

直接捕获 DuplicateKeyException，然后处理即可。


# 批量插入的重复

这里主要是为了记录批量插入的问题。

此处使用的 MP 的 insertBatch 方法，发现主键重复，使用 `DuplicateKeyException` 却捕获不到对应的异常。

看日志是 `BatchExecutorException`，发现还是无法捕获。

无奈最后 debug，发现实际抛出的是 `MybatisPlusException` 异常。

但是这个异常实际上不是很明确，比如数据库非 NULL 的，如果我们插入 NULL，也会报这个错误。

## 解决方案

把主键冲突的异常获取如下：

```
org.apache.ibatis.exceptions.PersistenceException: 
### Error flushing statements.  Cause: org.apache.ibatis.executor.BatchExecutorException: xxx.insert (batch index #1) failed. Cause: java.sql.BatchUpdateException: ORA-00001: 违反唯一约束条件 (xxx)
```

这是一个本地化的异常提示，我们可以选取唯一的错误码 ORA-00001

```java
try {
    xxxService.insertBatch(list);
} catch (MybatisPlusException exception) {
    String message = exception.getCause().getLocalizedMessage();
    // oracle 的重复异常的唯一码
    if(message.contains("ORA-00001:")) {
        logger.warn("信息插入重复，插入失败。", exception);
    } else {
        throw exception;
    }
}
```

## 工具方法

当然，可以写成一个工具方法，便于复用。

```java
/**
 * oracle 重复键异常处理
 *
 * 作用：mybatis insertBatch 会对异常封装，无法只管获取是否为重复。
 * @param exception 异常
 * @param logInfo 提示
 */
public static void oracleDuplicateKeyException(MybatisPlusException exception, String logInfo) {
    String message = exception.getCause().getLocalizedMessage();
    // oracle 的重复异常的唯一码
    if(message.contains("ORA-00001:")) {
        logger.warn(logInfo, exception);
    } else {
        throw exception;
    }
}
```





* any list
{:toc}