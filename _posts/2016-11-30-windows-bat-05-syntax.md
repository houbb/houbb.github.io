---
layout: post
title: windows bat 脚本教程-05-syntax 语法
date:  2016-11-30 14:14:36 +0800
categories: [Windows]
tags: [windows, shell, bat]
published: true
---

通常，批处理文件的第一行通常包含以下命令。

# ECHO 命令

```
@echo off
```

默认情况下，批处理文件在运行时会显示其命令。这个第一个命令的目的是关闭此显示。命令 "echo off" 关闭整个脚本的显示，除了 "echo off" 命令本身。

前面的 "at" 符号 "@" 使该命令也适用于自身。

# 文档 Documentation

批处理文件通常还包含以 "Rem" 命令开头的行。这是一种输入注释和文档的方法。计算机会忽略 Rem 后面的任何内容。

对于复杂程度逐渐增加的批处理文件，这通常是一个好主意以添加注释。

# 第一个批处理脚本程序

让我们构建我们的简单的第一个批处理脚本程序。打开记事本并输入以下代码行。将文件保存为 “List.cmd”。

代码的功能如下 −

使用 echo off 命令确保在执行代码时不显示命令。

Rem 命令用于添加注释以说明这个批处理文件具体做了什么。

dir 命令用于获取位置 C:\Program Files 的内容。

‘>’ 命令用于将输出重定向到文件 C:\lists.txt。

最后，echo 命令用于告知用户操作已完成。

```bat
@echo off 
Rem 这是用于列出目录 Program Files 中所有文件的操作
dir "C:\Program Files" > C:\lists.txt 
echo "程序已完成"
```

执行以上命令时，C:\Program Files 中文件的名称将被发送到文件 C:\Lists.txt，并且在命令提示符中将显示消息 “程序已完成”。


# chat

## 介绍一下 bat 的基本语法

批处理（Batch）文件是一种在Windows操作系统中自动执行一系列命令的脚本文件。

它们通常用于自动化重复性的任务。以下是批处理文件的一些基本语法和概念：

1. **注释**：
   - 以 `::` 或 `REM` 开头的行被视为注释，不会被执行。

   ```bat
   :: 这是一个注释
   REM 这也是一个注释
   ```

2. **命令回显**：
   - `@echo off` 关闭命令的回显，使得批处理执行时不会显示每一条命令。
   - `@echo on` 打开命令回显，显示执行的命令。

3. **变量**：
   - 使用 `set` 命令定义变量，如 `set var=somevalue`。
   - 使用 `%var%` 引用变量的值。

4. **条件语句**：
   - `if` 语句用于执行条件性命令。
   - 示例：`if "%var%"=="value" (echo var is value)`

5. **循环**：
   - `for` 循环遍历集合或执行循环体多次。
   - 示例：
     ```bat
     for %%i in (*.txt) do (
         echo %%i
     )
     ```

6. **函数**：
   - 批处理没有真正的函数，但可以使用 `goto` 标签和 `call` 命令模拟函数行为。

7. **标签（Goto Labels）**：
   - 使用 `:label` 定义标签，然后用 `goto label` 跳转到该标签。

8. **重定向**：
   - `>` 将命令的输出重定向到文件。
   - `>>` 将输出追加到现有文件。

   ```bat
   dir > list.txt
   echo Hello World >> output.txt
   ```

9. **管道**：
   - `|` 将一个命令的输出作为另一个命令的输入。

   ```bat
   dir | find "example"
   ```

10. **错误处理**：
    - 使用 `errorlevel` 检查命令是否成功执行。

11. **延迟变量扩展**：
    - 在某些情况下，使用 `!var!` 代替 `%var%` 可以解决变量扩展的问题。

12. **批处理参数**：
    - `%1`、`%2`、... 表示批处理参数，类似于位置参数。

13. **结束本地化变量**：
    - 使用 `endlocal` 结束 `setlocal` 的作用域，通常与 `setlocal` 配对使用。

14. **执行外部程序**：
    - 可以直接在批处理文件中调用外部程序，如 `notepad.exe`。

15. **批处理文件扩展名**：
    - 默认的批处理文件扩展名是 `.bat` 或 `.cmd`。

16. **退出批处理**：
    - 使用 `exit` 退出批处理文件的执行。

这些是批处理文件的一些基本语法元素。编写批处理文件时，可以结合使用这些元素来创建复杂的自动化脚本。




# 参考资料

https://www.tutorialspoint.com/batch_script/batch_script_syntax.htm

* any list
{:toc}