---
layout: post
title: windows bat 脚本教程-07-comments 注释
date:  2016-11-30 14:14:36 +0800
categories: [Windows]
tags: [windows, shell, bat]
published: true
---

# 注释

### 批处理脚本的注释和文档

为脚本添加注释或文档始终是一个良好的实践。这对于维护脚本以理解脚本实际上做了什么是必需的。

例如，考虑以下没有任何注释的代码片段。

如果任何没有开发过以下脚本的普通人试图理解脚本，那么这个人要理解脚本实际上做了什么将需要很长时间。

```bat
@echo off 
if not "%OS%"=="Windows_NT" goto Syntax 
echo.%* | find "?" >nul 
if not errorlevel 1 goto Syntax 
if not [%2]==[] goto Syntax 
setlocal 
set WSS= 
if not [%1]==[] for /f "tokens=1 delims=\ " %%A in ('echo.%~1') do set WSS=%%A 
for /f "tokens=1 delims=\ " %%a in ('net view ^| find /i "\\%WSS%"') do for /f "tokens=1 delims= " %%A in ('nbtstat -a %%a ^| find /i /v "%%a" ^| find "<03>"') do echo.%%a %%A 
endlocal 
goto:eof 
echo Display logged on users and their workstations. 
echo Usage: ACTUSR [ filter ] 
if "%OS%"=="Windows_NT" echo Where: filter is the first part of the computer name(s) to be displayed
```

#### 使用 Rem 语句添加注释

在批处理脚本中创建注释有两种方式；一种就是通过 Rem 命令。

任何跟随 Rem 语句的文本都将被视为注释，并且不会被执行。

以下是该语句的一般语法。

#### 语法
```bat
Rem Remarks
```
其中 ‘Remarks’ 是需要添加的注释。

以下示例展示了 Rem 命令的简单用法。

#### 示例
```bat
@echo off 
Rem This program just displays Hello World 
set message=Hello World 
echo %message%
```
输出
上述命令产生的输出如下。你会注意到带有 Rem 语句的行将不会被执行。

```
Hello World
```

#### 使用 :: 语句添加注释

在批处理脚本中创建注释的另一种方式是通过 :: 命令。

任何跟随 :: 语句的文本都将被视为注释，并且不会被执行。以下是该语句的一般语法。

#### 语法
```bat
:: Remarks
```
其中 ‘Remarks’ 是需要添加的注释。

以下示例展示了 "::" 命令的用法。

#### 示例
```bat
@echo off 
:: This program just displays Hello World 
set message = Hello World 
echo %message%
```
输出
上述命令产生的输出如下。你会注意到带有 :: 语句的行将不会被执行。

```
Hello World
```

#### 注意
- 如果你有太多的 Rem 行，它可能会减慢代码速度，因为在最后，批处理文件中的每行代码仍然需要被执行。

让我们看看本主题开头我们看到的大型脚本示例，并看看当文档添加到其中时它看起来如何。

```bat
::===============================================================
:: The below example is used to find computer and logged on users
::
::===============================================================
@echo off 
:: Windows version check 
if not "%OS%"=="Windows_NT" goto Syntax 
echo.%* | find "?" >nul 
:: Command line parameter check 
if not errorlevel 1 goto Syntax 
if not [%2]==[] goto Syntax 
:: Keep variable local 
setlocal 
:: Initialize variable 
set WSS= 
:: Parse command line parameter 
if not [%1]==[] for /f "tokens=1 delims=\ " %%A in ('echo.%~1') do set WSS=%%A 
:: Use NET VIEW and NBTSTAT to find computers and logged on users 
for /f "tokens=1 delims=\ " %%a in ('net view ^| find /i "\\%WSS%"') do for /f "tokens=1 delims= " %%A in ('nbtstat -a %%a ^| find /i /v "%%a" ^| find "<03>"') do echo.%%a %%A 
:: Done 
endlocal 
goto:eof 
:Syntax 
echo Display logged on users and their workstations. 
echo Usage: ACTUSR [ filter ] 
if "%OS%"=="Windows_NT" echo Where: filter is the first part of the computer name(s) to be displayed
```

现在你可以看到，代码对于没有开发过代码的用户来说更加易于理解，因此更易于维护。

# chat

## 详细介绍一下 bat 的注释

批处理（Batch）文件中的注释是用来解释代码或临时禁用代码行的一种方式。

注释在批处理文件执行时不会被解释或执行。以下是关于批处理文件中注释的详细介绍：

### 单行注释

在批处理文件中，单行注释以 `::` 或 `REM` 开始，直到该行的末尾。

这两者在功能上是等价的，你可以选择使用任何一个。例如：

```bat
:: 这是一个单行注释
REM 这也是一个单行注释
```

### 多行注释
批处理文件不支持真正的多行注释。如果你需要对多行代码进行注释，你需要在每一行的开始都加上 `::` 或 `REM`。

例如：

```bat
:: 第一行注释
:: 第二行注释
:: 第三行注释
REM 第一行注释
REM 第二行注释
REM 第三行注释
```

### 禁用代码
你可以使用注释来临时禁用批处理文件中的代码行。例如：

```bat
REM echo This line will not be executed
```

### 注释变量
在批处理文件中，注释不能包含在变量的声明中。例如，以下代码将不会按预期工作：

```bat
:: set var=This is not a comment
set var::This is a comment
```

在上面的例子中，`set var::This is a comment` 实际上会将变量 `var` 设置为 `:This is a comment`，因为 `::` 是注释的开始，所以 `This is a comment` 部分不会被执行。

### 注释批处理文件的头部
通常在批处理文件的开头，会使用注释来提供关于该脚本的信息，如作者、创建日期、脚本的用途等。例如：

```bat
:: ==========================================
:: Author: Your Name
:: Created: 2023-05-06
:: Purpose: This script demonstrates the use of comments in batch files.
:: ==========================================

echo Hello, World!
```

### 结合使用 `@echo off` 和注释
当使用 `@echo off` 命令时，所有随后的 `echo` 命令都不会在命令行中显示其输出。

然而，`echo` 仍然可以用于生成注释，因为即使它们被禁用，注释仍然有效。例如：

```bat
@echo off
echo This line will not be displayed
REM This is a comment and will not be executed or displayed
```

### 注意事项

- 注释不应该用于隐藏恶意代码或意图。

- 确保注释清晰、简洁，有助于理解代码。

批处理文件中的注释是编写者用来解释代码、临时禁用代码或提供脚本信息的重要工具。正确使用注释可以提高代码的可读性和维护性。



# 参考资料

https://www.tutorialspoint.com/batch_script/batch_script_comments.htm

* any list
{:toc}