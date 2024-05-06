---
layout: post
title: windows bat 脚本教程-23-logging 日志
date:  2016-11-30 14:14:36 +0800
categories: [Windows]
tags: [windows, shell, bat]
published: true
---

# 日志

在批处理脚本中，可以使用重定向命令来记录日志。

## 语法

```batch
test.bat > testlog.txt 2> testerrors.txt
```

## 示例

创建一个名为 test.bat 的文件，并在文件中输入以下命令。

```batch
net statistics /Server
```

上述命令存在错误，因为 net statistics 命令的选项使用错误的方式给出了。

## 输出

如果使用上述 test.bat 文件运行以下命令：

```batch
test.bat > testlog.txt 2> testerrors.txt
```

然后打开 testerrors.txt 文件，你将看到以下错误信息：

```
The option /SERVER is unknown.
The syntax of this command is −

NET STATISTICS
[WORKSTATION | SERVER]
More help is available by typing NET HELPMSG 3506.
```

如果你打开名为 testlog.txt 的文件，它将显示执行了哪些命令的日志。

```batch
C:\tp>net statistics /Server
```

# chat

## 详细介绍一下 bat 脚本中的日志

在批处理（Batch）脚本中，日志记录是一项重要的实践，它可以帮助开发者和系统管理员追踪脚本的行为、调试问题以及审计操作。以下是在批处理脚本中创建和使用日志文件的一些方法和技巧：

### 1. 使用 `echo` 命令写入日志

批处理中最基本和最常用的日志记录方法是使用 `echo` 命令将文本追加到日志文件中。

```bat
@echo off
echo [%date% %time%] Script started. >> log.txt
echo [%date% %time%] An important event occurred. >> log.txt
```

### 2. 重定向输出到日志文件

使用重定向运算符 `>` 或 `>>` 可以将命令的输出直接写入日志文件，覆盖或追加内容。

```bat
@echo off
dir C:\importantfolder > dir_output.txt
echo. >> dir_output.txt
echo [%date% %time%] Directory listing completed. >> dir_output.txt
```

### 3. 使用管道和 `find` 命令

如果需要过滤日志输出，可以使用管道 `|` 将输出传递给 `find` 命令。

```bat
@echo off
net user | find "Username" > user_log.txt
```

### 4. 使用 `type` 命令显示日志内容

可以在脚本中使用 `type` 命令来显示日志文件的内容。

```bat
@echo off
type log.txt
```

### 5. 日志文件的路径和名称

日志文件可以放在任何可访问的位置，并且可以根据需要设置文件名，以便于管理和搜索。

```bat
@echo off
echo Log entry. >> "%SystemDrive%\logs\%computername%_%date:~-4,4%-%date:~-7,2%-%date:~-10,2%.log"
```

### 6. 错误重定向

使用 `2>` 或 `>>` 将错误输出追加到日志文件中。

```bat
@echo off
command 2>> error_log.txt
```

### 7. 结合 `echo` 和变量

使用变量可以创建更灵活的日志记录格式。

```bat
@echo off
set log_message=[%date% %time%] Task completed successfully.
echo %log_message% >> log.txt
```

### 8. 日志级别

可以创建不同级别的日志记录，例如信息、警告、错误等。

```bat
@echo off
set info_message=INFO: Task started.
set error_message=ERROR: Task failed.

echo %info_message% >> log.txt
if errorlevel 1 (
    echo %error_message% >> error_log.txt
)
```

### 9. 日志文件的维护

定期清理或归档旧的日志文件，以避免它们占用过多磁盘空间。

```bat
@echo off
if exist log.txt if "%date:~-4,4%-%date:~-7,2%-%date:~-10,2%" lss "2021-01-01" (
    del log.txt
)
```

### 10. 使用第三方工具

有些第三方批处理调试工具或日志记录库可以帮助创建更复杂和功能更丰富的日志系统。

### 注意事项

- 使用 `%date%` 和 `%time%` 变量时，建议用双引号括起来，以确保在日期和时间之间可能存在的空格被正确处理。
- 日志文件应放置在具有适当权限的稳定位置，以防止未授权访问或数据丢失。
- 日志记录应平衡信息量和性能影响，过多的日志记录可能会拖慢脚本执行。

通过这些方法，你可以在批处理脚本中实现有效的日志记录，从而更好地追踪脚本的行为和调试可能出现的问题。

## > 和 >> 二者有什么区别？

在批处理（Batch）文件中，`>` 和 `>>` 是两个用于输出重定向的运算符，它们在功能上有所不同：

1. `>`：大于符号用于将命令的输出重定向到一个文件中。如果指定的文件已经存在，使用 `>` 运算符会截断（覆盖）该文件，即删除原有文件内容，然后写入新的输出。如果文件不存在，`>` 运算符会创建一个新文件并写入输出。

   示例：
   ```bat
   @echo off
   echo This is the start of the file. > output.txt
   echo This line will not be included as the file has been truncated.
   ```

2. `>>`：双大于符号用于将命令的输出追加到一个已存在的文件末尾。如果文件不存在，`>>` 运算符会创建一个新文件。使用 `>>` 运算符不会覆盖现有文件内容，而是在文件末尾添加输出。

   示例：
   ```bat
   @echo off
   echo This line will be appended to the file. >> output.txt
   echo Another line appended to the file.
   ```

在实际使用中，选择 `>` 或 `>>` 取决于你是希望覆盖现有文件还是追加到现有文件。

通常，如果你想保留现有文件内容并在文件末尾添加更多内容，应该使用 `>>`。而如果你希望用新内容替换现有文件内容，或者当文件不存在时创建一个新文件，应该使用 `>`。


# 参考资料

https://www.tutorialspoint.com/batch_script/batch_script_logging.htm

* any list
{:toc}