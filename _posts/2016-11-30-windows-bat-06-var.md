---
layout: post
title: windows bat 脚本教程-06-Variables 变量
date:  2016-11-30 14:14:36 +0800
categories: [Windows]
tags: [windows, shell, bat]
published: true
---

# 变量

### 批处理文件中的变量类型

批处理文件中有两种类型的变量。

一种是为了在调用批处理文件时可以传递的参数，另一种是通过 `set` 命令进行设置。

#### 命令行参数
批处理脚本支持命令行参数的概念，可以在调用批处理文件时向其传递参数。这些参数可以通过变量 %1, %2, %3 等在批处理文件中被调用。

以下示例展示了一个接受3个命令行参数的批处理文件，并将它们回显到命令行屏幕。

```bat
@echo off 
echo %1 
echo %2 
echo %3
```
如果上述批处理脚本存储在名为 test.bat 的文件中，我们运行该批处理如下：

```bat
Test.bat 1 2 3
```
执行批处理文件时，命令提示符中的输出将如下所示。

#### 命令行参数
上述命令产生的输出如下：

```
1 
2 
3
```
如果我们运行该批处理如下：

```bat
Example 1 2 3 4
```
输出将与上述相同。然而，第四个参数将被忽略。

#### Set 命令
变量还可以通过 `set` 命令进行初始化。以下是 set 命令的语法。

#### 语法
```bat
set /A variable-name=value
```
其中，

- variable-name 是你想要设置的变量的名称。
- value 是需要设置的值。
- /A – 如果值需要是数字类型，则使用这个开关。

以下示例展示了 set 命令的简单用法。

#### 示例
```bat
@echo off 
set message=Hello World 
echo %message%
```
在上述代码片段中，定义了一个名为 message 的变量，并将其设置为 "Hello World"。

要显示变量的值，请注意变量需要用 % 符号包围。

#### 输出
上述命令产生的输出如下：

```
Hello World
```

#### 处理数值
在批处理脚本中，也可以定义一个变量来保存数值。这可以通过使用 /A 开关来完成。

以下代码展示了如何使用 /A 开关设置数值的简单方法。

```bat
@echo off 
SET /A a = 5 
SET /A b = 10 
SET /A c = %a% + %b% 
echo %c%
```
我们首先将两个变量 a 和 b 的值分别设置为 5 和 10。

我们将这些值相加并存储在变量 c 中。

最后，我们显示变量 c 的值。

上述程序的输出将是 15。

批处理文件中所有算术运算符都是有效的。以下示例展示了算术运算符在批处理文件中的使用。

```bat
@echo off 
SET /A a = 5 
SET /A b = 10 
SET /A c = %a% + %b% 
echo %c% 
SET /A c = %a% - %b% 
echo %c% 
SET /A c = %b% / %a% 
echo %c% 
SET /A c = %b% * %a% 
echo %c%
```
上述命令产生的输出如下。

```
15 
-5 
2 
50
```

#### 局部变量与全局变量
在任何编程语言中，都有一种将变量标记为具有某种作用域的选项，即它们可以访问的代码部分。通常，具有全局作用域的变量可以从程序的任何地方访问，而局部作用域变量在它们可以访问的范围内有明确的定义。

DOS脚本也有局部和全局作用域变量的定义。默认情况下，变量对整个命令提示符会话是全局的。调用 SETLOCAL 命令可以使变量局部于脚本的作用域。调用 SETLOCAL 后，任何变量赋值在调用 ENDLOCAL、EXIT 或脚本执行到达文件末尾 (EOF) 时都会恢复。以下示例展示了在脚本中设置局部变量和全局变量时的区别。

#### 示例
```bat
@echo off 
set globalvar = 5
SETLOCAL
set var = 13145
set /A var = %var% + 5
echo %var% 
echo %globalvar%
ENDLOCAL
```
关于上述程序的几个关键点。

- ‘globalvar’ 被定义为全局作用域，并在整个脚本中可用。
- ‘var’ 变量被定义在局部作用域内，因为它被包含在 ‘SETLOCAL’ 和 ‘ENDLOCAL’ 块之间。因此，一旦执行了 ‘ENDLOCAL’ 语句，此变量将被销毁。

#### 输出
上述命令产生的输出如下：

```
13150
5
```
你会注意到命令 `echo %var%` 不会产生任何结果，因为在执行了 ENDLOCAL 语句之后，‘var’ 变量将不再存在。

#### 处理环境变量
如果你有将在批处理文件之间使用的变量，那么最好使用环境变量。一旦定义了环境变量，就可以通过 % 符号访问它。以下示例展示了如何在系统上查看已定义的 JAVA_HOME。JAVA_HOME 变量是通常被各种应用程序广泛使用的关键组件。

```bat
@echo off 
echo %JAVA_HOME%
```
输出将显示 JAVA_HOME 目录，这将取决于不同的系统。以下是输出的一个示例。

```
C:\Atlassian\Bitbucket\4.0.1\jre
```


# chat

## 详细介绍一下 bat 中的变量

在批处理（Batch）文件中，变量是用来存储数据的一种方式。它们允许你存储和操作数据，使得批处理文件更加灵活和强大。以下是一些关于批处理文件中变量的基本概念和使用方法：

### 变量的声明和使用
- **声明变量**：使用 `set` 命令来声明一个变量。例如，`set var=value`。
- **使用变量**：在变量名前后加上百分号（`%`）来引用变量的值。例如，`%var%`。

### 变量的范围
- **局部变量**：在脚本或批处理文件中定义的变量只在该脚本或批处理文件中有效。
- **全局变量**：使用 `setx` 命令定义的变量可以在所有新打开的命令行窗口和程序中使用。

### 特殊变量
- `%0` 到 `%9`：这些是特殊变量，分别代表批处理文件的参数。`%0` 是批处理文件本身的名称，`%1` 到 `%9` 是传递给批处理文件的参数。

### 延迟变量扩展
- **启用**：使用 `setlocal enabledelayedexpansion` 启用延迟变量扩展。
- **使用**：在启用了延迟变量扩展后，可以使用 `!variable!` 来引用变量的值，而不是 `%variable%`。

### 字符串操作
- **连接**：使用 `&` 或 `^` 来连接字符串。
- **子字符串**：使用 `%variable:substring%` 来获取变量中的子字符串。

### 环境变量
- 环境变量是操作系统级别的变量，可以在所有命令行程序和批处理文件中使用。

### 示例
```bat
@echo off
set var=Hello World
echo %var%

setlocal enabledelayedexpansion
set /a counter=1
:loop
echo !counter!
set /a counter+=1
if %counter% leq 5 goto loop
endlocal

echo %time% %date%

setx myvar "This is a global variable"
```

### 注意事项
- 在使用变量时，确保变量名不包含空格。
- 使用 `set` 命令可以查看当前批处理文件中定义的所有变量及其值。

变量是批处理文件中非常有用的工具，可以帮助你创建更复杂和灵活的自动化脚本。

# 参考资料

https://www.tutorialspoint.com/batch_script/batch_script_variables.htm

* any list
{:toc}