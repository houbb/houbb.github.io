---
layout: post
title: windows bat 脚本教程-21-printing 打印机
date:  2016-11-30 14:14:36 +0800
categories: [Windows]
tags: [windows, shell, bat]
published: true
---

# printing

下面是关于打印控制的两个命令的语法和示例：

**1. NET PRINT**
```batch
NET PRINT [/D:device] [[drive:][path]filename[...]]
```
这个命令用于在批处理脚本中控制打印任务。
```batch
NET PRINT C:\example.txt /D:LPT1
```
这个命令将example.txt文件打印到并行端口LPT1。

**2. 命令行打印机控制**
从Windows 2000开始，可以使用PRINTUI.DLL和RUNDLL32.EXE在Windows命令行中配置许多打印机设置。

```batch
RUNDLL32.EXE PRINTUI.DLL,PrintUIEntry [ options ] [ @commandfile ]
```
这个命令用于通过命令行配置打印机设置。

这些是用于控制打印机的命令行选项：

```
- **/dl**：删除本地打印机。
- **/dn**：删除网络打印机连接。
- **/dd**：删除打印机驱动程序。
- **/e**：显示打印首选项。
- **/f[file]**：指定 .inf 文件或输出文件。
- **/F[file]**：指定一个 INF 文件，/f 参数指定的 INF 文件可能依赖于它。
- **/ia**：使用 .inf 文件安装打印机驱动程序。
- **/id**：使用添加打印机驱动程序向导安装打印机驱动程序。
- **/if**：使用 .inf 文件安装打印机。
- **/ii**：使用添加打印机向导安装打印机，使用 .inf 文件。
- **/il**：使用添加打印机向导安装打印机。
- **/in**：添加网络打印机连接。
- **/ip**：使用网络打印机安装向导安装打印机。
- **/k**：将测试页面打印到指定的打印机，不能与安装打印机的命令一起使用。
- **/l[path]**：打印机驱动程序源路径。
- **/m[model]**：打印机驱动程序模型名称。
- **/n[name]**：打印机名称。
- **/o**：显示打印队列视图。
- **/p**：显示打印机属性。
- **/Ss**：将打印机设置存储到文件中。
- **/Sr**：从文件中恢复打印机设置。
- **/y**：将打印机设置为默认打印机。
- **/Xg**：获取打印机设置。
- **/Xs**：设置打印机设置。
```

这个例子演示了如何测试打印机是否存在：

```batch
SET PrinterName=Test Printer
SET file=%TEMP%\Prt.txt
RUNDLL32.EXE PRINTUI.DLL,PrintUIEntry /Xg /n "%PrinterName%" /f "%file%" /q

IF EXIST "%file%" (
   ECHO %PrinterName% 打印机存在
) ELSE (
   ECHO %PrinterName% 打印机不存在
)
```

这个脚本的步骤如下：

1. 首先设置打印机名称和文件名，后者将保存打印机的配置设置。

2. 使用`RUNDLL32.EXE PRINTUI.DLL`命令通过将配置设置发送到文件 `Prt.txt` 来检查打印机是否存在。

3. 如果 `Prt.txt` 文件存在，则打印机存在，否则打印机不存在。

# chat

## 详细介绍一下 bat 脚本中的打印机

在批处理脚本中，可以使用一系列命令和工具来管理打印机。以下是批处理脚本中常用的打印机相关概念和操作：

1. **打印机名称（Printer Name）**：指打印机在系统中的标识符，可以是本地打印机的名称或网络打印机的网络地址。

2. **打印机设置（Printer Settings）**：指打印机的各种配置选项，例如默认纸张大小、打印质量、打印机共享设置等。

3. **打印队列（Print Queue）**：指打印作业排队等待打印的位置。当多个打印任务发送到同一个打印机时，它们将按顺序排队等待打印。

4. **打印作业（Print Job）**：指由计算机发送到打印机的任务。每个打印作业都包含要打印的文档或图像的信息。

以下是批处理脚本中常用的打印机操作：

- **检查打印机是否存在**：可以通过查询系统中的打印机列表来检查特定打印机是否存在。

- **连接到打印机**：可以使用`NET USE`命令或`RUNDLL32.EXE`命令连接到网络打印机，或者使用`NET PRINT`命令控制本地打印机。

- **设置默认打印机**：可以使用`RUNDLL32.EXE`命令或其他方法设置默认打印机。

- **打印测试页面**：可以使用`RUNDLL32.EXE`命令或其他方法向打印机发送测试页面，以确保它正常工作。

- **列出打印机属性**：可以使用`RUNDLL32.EXE`命令或其他方法列出特定打印机的属性和配置。

通过这些操作，批处理脚本可以管理和控制系统中的打印机，使打印任务更加灵活和自动化。

## 给出上述操作的命令+例子

以下是一些批处理脚本中常用的打印机操作命令及其示例：

1. **检查打印机是否存在**：
```batch
RUNDLL32.EXE PRINTUI.DLL,PrintUIEntry /Xg /n "PrinterName" /f "%TEMP%\Prt.txt" /q

IF EXIST "%TEMP%\Prt.txt" (
   ECHO 打印机存在
) ELSE (
   ECHO 打印机不存在
)
```

2. **连接到打印机**：
```batch
NET USE LPT1: \\Server\PrinterName /PERSISTENT:YES
```

3. **设置默认打印机**：
```batch
RUNDLL32.EXE PRINTUI.DLL,PrintUIEntry /y /n "PrinterName"
```

4. **打印测试页面**：
```batch
RUNDLL32.EXE PRINTUI.DLL,PrintUIEntry /k /n "PrinterName"
```

5. **列出打印机属性**：
```batch
RUNDLL32.EXE PRINTUI.DLL,PrintUIEntry /p /n "PrinterName"
``` 

这些命令可以根据需要在批处理脚本中使用，以实现对打印机的各种操作和管理。

# 参考资料

https://www.tutorialspoint.com/batch_script/batch_script_printing.htm

* any list
{:toc}