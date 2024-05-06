---
layout: post
title: windows bat 脚本教程-16-process 进程
date:  2016-11-30 14:14:36 +0800
categories: [Windows]
tags: [windows, shell, bat]
published: true
---

# 进程列表

**查看运行进程列表**

在批处理脚本中，可以使用`TASKLIST`命令获取系统中当前正在运行的进程列表。

**语法**

```
TASKLIST [/S 系统 [/U 用户名 [/P [密码]]]] [/M [模块] | /SVC | /V] [/FI 过滤器]
[/FO 格式] [/NH]
```

下面是可以用于`TASKLIST`命令的选项的描述。

**示例**

```
TASKLIST
```

上述命令将获取在您的本地系统上运行的所有进程列表。以下是在运行上述命令时生成的输出快照。

正如您从以下输出中所看到的，您不仅会获得系统上运行的各种进程，还会获得每个进程的内存使用情况。

```
Image Name                    PID       Session Name       Session#     Mem Usage
========================= ========    ================ =========== ============
System Idle Process             0        Services            0              4 K
System                          4        Services            0            272 K
smss.exe                      344        Services            0          1,040 K
csrss.exe                     528        Services            0          3,892 K
csrss.exe                     612        Console             1         41,788 K
wininit.exe                   620        Services            0          3,528 K
winlogon.exe                  648        Console             1          5,884 K
services.exe                  712        Services            0          6,224 K
lsass.exe                     720        Services            0          9,712 K
svchost.exe                   788        Services            0         10,048 K
svchost.exe                   832        Services            0          7,696 K
dwm.exe                       916        Console             1        117,440 K
nvvsvc.exe                    932        Services            0          6,692 K
nvxdsync.exe                  968        Console             1         16,328 K
nvvsvc.exe                    976        Console             1         12,756 K
svchost.exe                  1012        Services            0         21,648 K
svchost.exe                   236        Services            0         33,864 K
svchost.exe                   480        Services            0         11,152 K
svchost.exe                  1028        Services            0         11,104 K
svchost.exe                  1048        Services            0         16,108 K
wlanext.exe                  1220        Services            0         12,560 K
conhost.exe                  1228        Services            0          2,588 K
svchost.exe                  1276        Services            0         13,888 K
svchost.exe                  1420        Services            0         13,488 K
spoolsv.exe                  1556        Services            0          9,340 K
```

**保存进程列表到文件**

上述命令将`tasklist`显示的输出保存到`process.txt`文件中。

**查找内存使用超过40MB的进程**

```
tasklist /fi "memusage gt 40000"
```

上述命令将仅获取内存大于40MB的进程。以下是可能生成的示例输出。

```
Image Name                    PID      Session Name     Session#     Mem Usage
=========================   ======== ================ =========== ============
dwm.exe                        916     Console             1        127,912 K
explorer.exe                  2904     Console             1        125,868 K
ServerManager.exe             1836     Console             1         59,796 K
WINWORD.EXE                   2456     Console             1        144,504 K
chrome.exe                    4892     Console             1        123,232 K
chrome.exe                    4976     Console             1         69,412 K
chrome.exe                    1724     Console             1         76,416 K
chrome.exe                    3992     Console             1         56,156 K
chrome.exe                    1168     Console             1        233,628 K
chrome.exe                     816     Console             1         66,808 K
```

# **结束特定进程**

允许在运行Microsoft Windows XP专业版、Windows 2003或更高版本的用户通过进程ID（PID）或映像名称从Windows命令行终止任务。用于此目的的命令是`TASKKILL`命令。

**语法**

```
TASKKILL [/S system [/U username [/P [password]]]] { [/FI filter] 
[/PID processid | /IM imagename] } [/T] [/F]
```

以下是可以用于`TASKKILL`命令的选项的描述。

**示例**

```
taskkill /f /im notepad.exe
```

上述命令会终止打开的记事本任务（如果有打开的话）。

```
taskill /pid 9214
```

上述命令将终止具有进程ID为9214的进程。

# **启动新进程**

DOS脚本还可以完全启动新进程。这是通过使用`START`命令实现的。

**语法**

```
START "title" [/D path] [options] "command" [parameters]
```

其中：

- `title`：CMD窗口标题栏的文本（必需）。
- `path`：起始目录。
- `command`：要运行的命令、批处理文件或可执行程序。
- `parameters`：传递给命令的参数。

以下是可以用于`START`命令的选项的描述。

**示例**

```
START "Test Batch Script" /Min test.bat
```

上述命令将在一个新窗口中运行批处理脚本`test.bat`。窗口将以最小化模式启动，并且标题为“Test Batch Script”。

```
START "" "C:\Program Files\Microsoft Office\Winword.exe" "D:\test\TESTA.txt"
```

上述命令实际上会在另一个进程中运行Microsoft Word，然后在MS Word中打开文件`TESTA.txt`。

# chat

## 详细介绍一下 bat 脚本 process

在批处理（Batch）脚本中，"process"一词可以有几种不同的含义，具体取决于上下文。

以下是几种可能的解释：

### 1. 执行命令或程序的过程

批处理脚本主要用于自动化命令行任务，因此“process”可以简单指执行一系列命令或程序的过程。

### 示例

```bat
@echo off
echo Starting the process...
rem 执行一系列命令
dir C:\Users
echo Process completed.
```

### 2. 后台进程

在批处理中，可以使用 `start` 命令来启动一个后台进程，这在需要异步执行任务时非常有用。

### 示例

```bat
@echo off
echo Launching a background process...
start "" "C:\Program Files\MyApp\myapp.exe"
echo Background process started.
```

### 3. 批处理脚本作为进程

批处理脚本本身作为一个进程在Windows操作系统中运行。可以使用任务管理器查看批处理脚本的进程信息。

### 4. 处理输入/输出

批处理脚本可以执行一些基本的输入/输出处理，例如：

- 使用 `echo` 命令输出文本。
- 使用 `set` 命令设置或修改环境变量。
- 使用 `goto` 和 `call` 命令控制流程。
- 使用管道 (`|`) 将一个命令的输出作为另一个命令的输入。

### 示例

```bat
@echo off
set /p input="Enter something: "
echo You entered: %input%
```

### 5. 处理错误和退出代码

批处理脚本可以检查命令的退出代码（errorlevel），以确定命令是否成功执行，并据此做出决策。

### 示例

```bat
@echo off
net stop "My Service" >nul
if %errorlevel% equ 0 (
    echo Service stopped successfully.
) else (
    echo Failed to stop service.
)
```

### 6. 处理命令行参数

批处理脚本可以接受命令行参数，并在脚本中使用这些参数。

### 示例

```bat
@echo off
if "%1"=="" (
    echo Usage: %0 parameter
) else (
    echo You provided the parameter: %1
)
```

### 7. 批处理脚本的进程控制

批处理脚本可以使用Windows命令来控制进程，如：

- `tasklist`：列出所有进程。
- `taskkill`：结束进程。

### 示例

```bat
@echo off
tasklist /FI "IMAGENAME eq myapp.exe"
if %errorlevel% equ 0 (
    echo Process is running, terminating...
    taskkill /IM myapp.exe /F
) else (
    echo Process is not running.
)
```

### 注意事项

- 批处理脚本通常用于自动化和简化命令行任务，但它们在处理复杂逻辑和数据结构方面有限。
- 批处理脚本的执行是同步的，除非使用特定的命令或技术（如 `start`）来创建异步进程。
- 批处理脚本的“进程”概念与编程语言中的函数或方法不同，它们更多地是一系列命令的顺序执行。

批处理脚本在Windows系统中是一种强大的自动化工具，尽管它们在功能上受到一些限制，但对于许多基本任务来说，它们提供了一种简单且高效的方式来自动化命令行操作。

# 参考资料

https://www.tutorialspoint.com/batch_script/batch_script_process.htm

* any list
{:toc}