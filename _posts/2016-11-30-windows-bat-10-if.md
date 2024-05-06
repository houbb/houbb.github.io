---
layout: post
title: windows bat 脚本教程-10-if 条件判断 决策结构
date:  2016-11-30 14:14:36 +0800
categories: [Windows]
tags: [windows, shell, bat]
published: true
---

# **决策结构**

决策结构要求程序员指定一个或多个条件，以及在条件被判定为真时要执行的语句或语句，以及可选地，在条件被判定为假时要执行的其他语句。

| 序号 | 语句及描述               |
| ---- | ------------------------ |
| 1.   If 语句 | 第一个决策性语句是 'if' 语句 |
| 2.   If/else 语句 | 下一个决策性语句是 If/else 语句。以下是此语句的一般形式         |
| 3.   嵌套的 If 语句 | 有时，需要在彼此嵌套的多个 'if' 语句中。以下是此语句的一般形式 |

# chat

## 详细介绍一下 bat 的 if

在批处理（Batch）文件中，`if` 命令用于条件判断，它允许根据不同的条件执行不同的命令。

以下是 `if` 命令的一些基本用法和特性：

### 基本语法
`if` 命令的基本语法如下：

```bat
if [not] condition (
    command_if_true
) else (
    command_if_false
)
```

### 条件运算符
`if` 命令支持多种条件运算符，包括：

- `==`：等于
- `!=`：不等于
- `<`：小于
- `>`：大于
- `<=`：小于等于
- `>=`：大于等于
- `exist`：检查文件或目录是否存在
- `errorlevel`：检查退出代码
- `defined`：检查变量是否已定义

### 示例
以下是一些 `if` 命令的示例：

#### 检查变量是否相等
```bat
if "%variable%" == "value" (
    echo Variable is equal to value.
) else (
    echo Variable is not equal to value.
)
```

#### 检查文件是否存在
```bat
if exist filename.txt (
    echo File exists.
) else (
    echo File does not exist.
)
```

#### 检查错误级别
```bat
if errorlevel 1 (
    echo An error occurred.
)
```

#### 检查变量是否已定义
```bat
if defined variable (
    echo Variable is defined.
) else (
    echo Variable is not defined.
)
```

### 使用 `goto`
在一些情况下，你可能希望根据条件跳转到不同的标签位置。这时可以使用 `goto` 命令：

```bat
if "%variable%" == "value" goto equal
echo Variable is not equal to value.
goto end

:equal
echo Variable is equal to value.

:end
```

### 使用 `set` 命令
`if` 命令还可以与 `set` 命令结合使用，根据条件设置变量的值：

```bat
if "%variable%" == "" set "variable=value"
```

### 注意事项
- 在比较字符串时，需要确保使用双引号将变量和字符串值括起来，以避免批处理文件中的空格问题。
- `if` 命令不能嵌套使用。如果需要多重条件判断，可以使用多个 `if` 语句或 `goto` 命令。
- `errorlevel` 通常用于检查前一个命令的退出状态。一个成功的命令通常返回 `errorlevel` 0。

`if` 命令是批处理文件中实现条件逻辑的重要工具，通过它可以根据不同的条件执行不同的命令或操作。




# 参考资料

https://www.tutorialspoint.com/batch_script/batch_script_decision_making.htm

* any list
{:toc}