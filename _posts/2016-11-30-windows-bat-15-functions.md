---
layout: post
title: windows bat 脚本教程-15-functions 函数
date:  2016-11-30 14:14:36 +0800
categories: [Windows]
tags: [windows, shell, bat]
published: true
---

# functions

## 基本概念

**函数**

函数是一组语句，按特定顺序组织在一起以执行特定任务。在批处理脚本中，采用类似的方法将逻辑语句组合在一起形成函数。

与其他语言一样，批处理脚本中的函数遵循相同的过程 -

- 函数声明 - 它告诉编译器关于函数的名称、返回类型和参数。
- 函数定义 - 它提供函数的实际主体。

**函数定义**

在批处理脚本中，函数是使用标签语句定义的。当函数新定义时，它可能接受一个或多个值作为输入参数，处理主体中的函数，并将值作为输出返回到函数。

每个函数都有一个函数名，描述函数执行的任务。要使用函数，您需要使用其名称“调用”该函数，并传递与函数参数类型匹配的输入值（称为参数）。

以下是一个简单函数的语法。

```batch
:function_name 
Do_something 
EXIT /B 0
```

function_name 是赋予函数的名称，应该具有一定的意义，以匹配函数实际执行的任务。

EXIT 语句用于确保函数正确退出。

以下是一个简单函数的示例。

**示例**

```batch
:Display 
SET /A index=2 
echo The value of index is %index% 
EXIT /B 0
```

## 列表

**序号	函数及描述**

1. 调用函数
   通过使用 call 命令在批处理脚本中调用函数。
   
2. 具有参数的函数
   函数可以通过在调用函数时简单地传递参数来使用参数。
   
3. 具有返回值的函数
   函数可以通过简单地传递变量名称来使用返回值。
   
4. 函数中的局部变量
   函数中的局部变量可用于避免名称冲突，并将变量更改保持在函数范围内。
   
5. 递归函数
   完全封装函数的能力，使变量更改保持在函数范围内，并对调用者不可见。
   
6. 文件 I/O
   在批处理脚本中，可以执行期望在任何编程语言中执行的正常文件 I/O 操作。
   
7. 创建文件
   使用重定向过滤器 > 创建新文件。该过滤器可用于将任何输出重定向到文件。
   
8. 写入文件
   写入文件内容也是使用重定向过滤器 > 完成的。该过滤器可用于将任何输出重定向到文件。
   
9. 追加文件
   写入文件内容也是使用双重重定向过滤器 >> 完成的。该过滤器可用于将任何输出追加到文件。
   
10. 从文件读取
    在批处理脚本中，通过使用 FOR 循环命令来遍历文件中定义的每一行来读取文件。
   
11. 删除文件
    对于删除文件，批处理脚本提供了 DEL 命令。
   
12. 重命名文件
    对于重命名文件，批处理脚本提供了 REN 或 RENAME 命令。
   
13. 移动文件
    对于移动文件，批处理脚本提供了 MOVE 命令。
   
14. 批处理文件 - 管道
    管道运算符 (|) 将一个命令的输出（默认情况下为 STDOUT）传递到另一个命令的输入（默认情况下为 STDIN）。
   
15. 批处理文件 - 输入
    当运行批处理文件时，它会提供选项来传递命令行参数，然后可以在程序中读取这些参数进行进一步处理。
   
16. 使用 SHIFT 运算符
    命令行参数的一个限制是它只能接受到 %9 为止的参数。让我们以此限制为例。
   
17. 文件夹
    在批处理脚本中，可以执行期望在任何编程语言中执行的正常基于文件夹的操作。
   
18. 创建文件夹
    使用 MD（Make directory）命令创建文件夹。
   
19. 列出文件夹内容
    可以使用 dir 命令列出文件夹内容。该命令允许您查看当前目录中可用的文件和目录。
   
20. 删除文件夹
    对于删除文件夹，批处理脚本提供了 DEL 命令。
   
21. 重命名文件夹
    对于重命名文件夹，批处理脚本提供了 REN 或 RENAME 命令。
   
22. 移动文件夹
    对于移动文件夹，批处理脚本提供了 MOVE 命令。



# chat

## 详细介绍一下 bat 的函数

在批处理（Batch）文件中，并没有传统编程语言中所理解的“函数”概念。不过，批处理提供了一些方法来创建可重复使用的代码块，这些可以被视作批处理的“函数”：

### 批处理中的函数模拟

1. **使用 `goto` 标签**：批处理文件中可以使用 `goto` 命令配合标签（label）来模拟函数的行为。代码块的开始部分可以用一个标签标记，然后通过 `goto` 命令跳转到这个标签来执行代码块。

```bat
@echo off
:MyFunction
rem 这里是函数的代码
echo Function code here
goto :eof

:main
echo Before calling function
goto MyFunction
:eof
```

2. **使用 `call` 命令**：`call` 命令可以调用批处理文件中的一个部分并执行到该部分结束，然后返回到调用它的行的下一条命令继续执行。

```bat
@echo off
:MyFunction
echo This is a called function.

:main
echo Before calling function
call :MyFunction
echo After calling function
goto :eof
```

3. **使用批处理文件包含**：可以使用 `@echo off` 命令关闭命令的输出，然后使用 `call` 命令来包含另一个批处理文件，这可以模拟库或者模块的功能。

```bat
@echo off
call mymodule.bat
```

### 参数传递

在批处理中模拟函数时，可以通过命令行参数（`%1`, `%2`, ...）来传递参数。

```bat
:MyFunction arg1 arg2
echo First argument is: %1
echo Second argument is: %2
goto :eof
```

然后在调用时传入参数：

```bat
goto :MyFunction param1 param2
```

### 返回值

批处理没有直接的方法返回值，但可以通过修改环境变量或使用输出文件来传递执行结果。

### 局部变量

批处理不支持局部变量，但可以使用延迟变量扩展（`!variable!`）来模拟局部变量的行为。

```bat
@echo off
setlocal enabledelayedexpansion
set "localVar=localValue"
goto :MyFunction

:MyFunction
set /a "localVar+=1"
echo localVar is now: !localVar!
goto :eof
```

### 注意事项

- 使用 `goto` 和 `call` 命令时，要注意避免无限循环或难以理解的代码结构。
- 批处理的“函数”不能直接返回值，需要通过变通的方法来实现。
- 批处理文件的“函数”在执行完毕后，通常使用 `goto :eof` 来标记结束，`:eof` 是一个特殊的标签，表示文件的结尾。

尽管批处理没有真正的函数，但通过使用标签、`call` 和 `goto` 命令，可以创建可重复使用的代码块，这在一定程度上模拟了函数的行为。



# 参考资料

https://www.tutorialspoint.com/batch_script/batch_script_functions.htm

* any list
{:toc}