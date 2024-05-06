---
layout: post
title: windows bat 脚本教程-22-debugging 调试
date:  2016-11-30 14:14:36 +0800
categories: [Windows]
tags: [windows, shell, bat]
published: true
---

# 调试

在调试批处理脚本时，使用echo命令是一种简单有效的方法。它可以在命令提示符中显示消息，并帮助您找出问题出在哪里。

以下是一个简单示例，根据给定的输入显示偶数。echo命令用于显示结果，以及如果没有提供输入。类似地，当您认为可能发生错误时，可以在所需位置使用echo命令。

例如，如果给定的输入是负数，小于2等。

```batch
@echo off  
if [%1] == [] ( 
   echo 未提供输入值
   goto stop 
)  
rem 显示数字 
for /l %%n in (2,2,%1) do ( 
   echo %%n 
)  
:stop 
pause 
```

上述脚本会根据给定的输入显示偶数。如果没有输入提供，它会显示一条消息并退出。

另一种方法是在出现错误时暂停批处理执行。当脚本暂停时，开发人员可以修复问题，然后重新启动处理。

在下面的示例中，由于必须提供输入值而未提供，批处理脚本被暂停。 

```batch
@echo off  
if [%1] == [] ( 
   echo 未提供输入值，请按任意键继续...
   pause
   exit /b 1
)  
rem 执行其他操作...
```

当输入值未提供时，脚本将显示一条消息并暂停执行，等待用户按下任意键继续。

例子：

```bat
@echo off  
if [%1] == [] ( 
   echo input value not provided 
   goto stop 
) else ( 
   echo "Valid value"     
)  
:stop 
pause 
```

Output

```
C:\>test.bat 
 input value not provided 
Press any key to continue.. 
```

在调试过程中，将错误消息记录到另一个文件中是一种非常有用的方法。这样可以在逐步查看错误日志时更容易理解出错的原因。

以下是一个示例，考虑以下 test.bat 文件：

```batch
net statistics /Server 
```

在这个 .bat 文件中给出的命令是错误的。让我们记录消息并查看结果。

在命令行中执行以下命令：

```batch
C:\>test.bat > testlog.txt 2> testerrors.txt
```

文件 testerrors.txt 将显示以下错误消息：

```
The option /SERVER is unknown.  
The syntax of this command is:  
NET STATISTICS 
[WORKSTATION | SERVER]  
More help is available by typing NET HELPMSG 3506.
```

开发人员可以查看上面的文件，修复程序并再次执行。

使用 ErrorLevel 检测错误并记录它们

ErrorLevel 在命令执行成功时返回 0，失败时返回 1。

考虑以下示例：

```batch
@echo off 
PING google.com  
if errorlevel 1 GOTO stop  
:stop 
   echo 无法连接到 google.com 
pause
```

在执行过程中，您可以看到错误以及日志：

```batch
C:\>test.bat > testlog.txt
```

testlog.txt 文件的内容如下：

```
Pinging google.com [172.217.26.238] with 32 bytes of data: 
Reply from 172.217.26.238: bytes=32 time=160ms TTL=111 
Reply from 172.217.26.238: bytes=32 time=82ms TTL=111 
Reply from 172.217.26.238: bytes=32 time=121ms TTL=111 
Reply from 172.217.26.238: bytes=32 time=108ms TTL=111  
Ping statistics for 172.217.26.238: 
   Packets: Sent = 4, Received = 4, Lost = 0 (0% loss), 
Approximate round trip times in milli-seconds: 
   Minimum = 82ms, Maximum = 160ms, Average = 117ms
   Connected successfully 
Press any key to continue . . .
```

在失败的情况下，您将在 testlog.txt 文件中看到以下日志：

```
Ping request could not find host google.com. Please check the name and try again. 
Unable to connect to google.com 
Press any key to continue . . .
```

# chat

## Q: 详细介绍一下 bat 脚本中的调试

批处理（Batch）脚本的调试通常不像高级编程语言那样有专门的调试工具，但你可以采用一些技巧和方法来帮助你识别和解决问题。

以下是一些调试批处理脚本的常用方法：

### 1. 使用 `echo` 命令

在脚本中的关键位置插入 `echo` 命令来打印变量的值或执行的命令，这有助于你追踪脚本的执行流程和变量的状态。

```bat
@echo off
set var=someValue
echo The value of var is: %var%
```

### 2. 使用 `echo` 与变量回显

关闭变量回显可以简化输出并使输出更清晰。

```bat
@echo off
setlocal disabledelayedexpansion
```

### 3. 使用 `goto` 和标签

使用 `goto` 命令跳转到标签（Label）可以帮助你快速定位脚本中的特定部分，也可以用来重构脚本。

```bat
:ErrorHandling
if errorlevel 1 (
    echo An error occurred.
    goto End
)
```

### 4. 检查错误级别

在命令后检查 `errorlevel` 可以帮助你确定命令是否成功执行。

```bat
command
if errorlevel 1 goto ErrorHandler
```

### 5. 使用批处理内的注释

使用注释来解释复杂的逻辑或命令，使脚本更易于理解。

```bat
rem This command will copy the source file to the destination
copy source.txt destination.txt
```

### 6. 分解复杂脚本

将复杂的脚本分解成多个小的、易于管理的部分，每个部分保存为独立的批处理文件，并通过 `call` 命令调用。

```bat
call :FunctionName
goto :eof

:FunctionName
rem Function code here
```

### 7. 使用日志文件

将输出重定向到日志文件，以便于后续分析。

```bat
echo Logging output to log.txt
@echo on
```

### 8. 逐步执行

手动执行脚本的每一部分，观察每一步的输出和行为，这有助于定位问题。

### 9. 使用 `call` 与 `exit /b`

使用 `call` 调用函数，并在必要时使用 `exit /b` 退出当前批处理或函数。

```bat
:Function
rem Some code...
exit /b
```

### 10. 避免使用复杂的变量

复杂或难以理解的变量可能会引入错误。确保变量的使用清晰明确。

### 11. 使用在线资源

当遇到问题时，利用在线社区和论坛来寻求帮助。

### 12. 学习常见错误

熟悉常见的批处理错误和它们的含义，比如 `errorlevel` 的不同值。

### 13. 编写文档

为你的脚本编写文档，说明每个部分的功能和用途。

### 14. 使用专门的调试工具

虽然不多，但有些第三方工具可以帮助调试批处理脚本，例如通过设置断点和逐步执行。

### 15. 测试

在不同的环境和条件下测试你的脚本，确保它的行为符合预期。

### 注意事项

- 批处理脚本的调试主要依赖于打印输出和手动检查。
- 保持脚本的组织结构清晰，使用函数和标签可以帮助你更好地管理和调试脚本。
- 记录和理解 `errorlevel` 的值对于调试非常重要。

虽然批处理脚本的调试可能比较原始，但通过上述方法，你可以更有效地识别和修复脚本中的问题。

## Q: bat 脚本中调试有哪些技巧？

# 参考资料

https://www.tutorialspoint.com/batch_script/batch_script_debugging.htm

* any list
{:toc}