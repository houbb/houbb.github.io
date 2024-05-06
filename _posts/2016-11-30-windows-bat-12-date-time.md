---
layout: post
title: windows bat 脚本教程-12-date time 日期与时间
date:  2016-11-30 14:14:36 +0800
categories: [Windows]
tags: [windows, shell, bat]
published: true
---

# 日期

**DOS 脚本中的日期和时间**

在 DOS 脚本中，有以下两个基本命令用于获取系统的日期和时间。

**DATE**

此命令获取系统日期。

**语法**
```
DATE
```

**示例**
```batch
@echo off 
echo %DATE%
```

**输出**
命令提示符中将显示当前日期。例如，

```
Mon 12/28/2015
```

**TIME**

此命令设置或显示时间。

**语法**
```
TIME
```

**示例**
```batch
@echo off 
echo %TIME%
```

**输出**
将显示当前系统时间。例如，

```
22:06:52.87
```

以下是一些可以用于以不同格式获取日期和时间的实现。

**日期格式为 年-月-日**

**示例**
```batch
@echo off 
echo/Today is: %year%-%month%-%day% 
goto :EOF 
setlocal ENABLEEXTENSIONS 
set t=2&if "%date%z" LSS "A" set t=1 

for /f "skip=1 tokens=2-4 delims=(-)" %%a in ('echo/^|date') do ( 
   for /f "tokens=%t%-4 delims=.-/ " %%d in ('date/t') do ( 
      set %%a=%%d&set %%b=%%e&set %%c=%%f)) 
endlocal&set %1=%yy%&set %2=%mm%&set %3=%dd%&goto :EOF
```

**输出**
上述命令产生以下输出。

```
Today is: 2015-12-30
```

# chat

## Q: 详细介绍一下 bat 中的 date 和 time

在批处理（Batch）文件中，`date` 和 `time` 是两个内置的变量，它们分别代表当前的系统日期和时间。

你可以在批处理脚本中使用这些变量来获取或设置系统日期和时间，或者在命令中使用它们来格式化输出。

### 使用 `date` 和 `time` 变量

- **获取当前日期**：在批处理文件中，`%date%` 变量包含了当前的系统日期。默认格式通常为 `MM/DD/YYYY`，但这可能会根据系统的区域设置而变化。

- **获取当前时间**：`%time%` 变量包含了当前的系统时间。默认格式通常为 `HH:MM:SS`，同样，这也可能会根据系统的区域设置而变化。

### 示例

```bat
@echo off
echo Current date is: %date%
echo Current time is: %time%
```

测试效果：

```
D:\bat>date_time.bat
Current date is: 2024/05/06 周一
Current time is: 16:32:59.97
DONE!
```


### 修改日期和时间格式

默认的日期和时间格式可能不适合所有的需求，因此你可以使用 `set` 命令来修改它们的显示格式。

例如：

```bat
@echo off
set "date=%date:~6,4%-%date:~0,2%-%date:~3,2%"
set "time=%time:~0,2%:%time:~3,2%:%time:~6,2%"
echo Current date is: %date%
echo Current time is: %time%
```

### 设置系统日期和时间

在批处理文件中，你可以使用 `date` 和 `time` 命令来设置系统的日期和时间，而不是使用变量。

请注意，这需要管理员权限。

```bat
@echo off
date 05/06/2024
time 15:30:00
```

### 使用 `choice` 命令

`choice` 命令可以让用户输入一个字符来做出选择，通常与 `%timeout` 一起使用，来给用户一个默认的选择。

```bat
@echo off
echo Press 'Y' to continue, or any other key to exit.
choice /c YN /t 5
if errorlevel 2 goto exit
echo You pressed 'Y'.

:exit
```

### 注意事项

- 使用 `%date%` 和 `%time%` 变量时，建议使用双引号来避免空格和特殊字符的问题。
- 在修改日期和时间格式时，需要使用 `set` 命令和适当的字符串操作来实现。
- 使用 `date` 和 `time` 命令设置系统日期和时间时，确保你有足够的权限，并且知道正确格式。

通过使用 `date` 和 `time` 变量以及相关命令，批处理文件可以执行与日期和时间相关的操作，如记录日志、安排任务或提供用户交互。



# 参考资料

https://www.tutorialspoint.com/batch_script/batch_script_date_time.htm

* any list
{:toc}