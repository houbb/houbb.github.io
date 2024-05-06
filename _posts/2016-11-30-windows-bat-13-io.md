---
layout: post
title: windows bat 脚本教程-13-Input / Output 输入/输出
date:  2016-11-30 14:14:36 +0800
categories: [Windows]
tags: [windows, shell, bat]
published: true
---

# IO

**标准输入、标准输出和标准错误**

在键盘输入、屏幕上打印文本以及在屏幕上打印错误时，有三个通用的“文件”。

称为 stdin 的“标准输入”文件包含程序/脚本的输入。称为 stdout 的“标准输出”文件用于写入输出以在屏幕上显示。最后，称为 stderr 的“标准错误”文件包含用于在屏幕上显示的任何错误消息。

这三个标准文件，也称为标准流，分别使用编号 0、1 和 2 进行引用。stdin 是文件 0，stdout 是文件 1，stderr 是文件 2。

**重定向输出（stdout 和 stderr）**

批处理文件中的一种常见做法是将程序的输出发送到日志文件。> 运算符将 stdout 或 stderr 发送或重定向到另一个文件。以下示例显示了如何实现这一点。

```batch
Dir C:\ > list.txt
```

在上述示例中，命令 Dir C:\ 的 stdout 被重定向到文件 list.txt。

如果将数字 2 添加到重定向过滤器，则会将 stderr 重定向到文件 lists.txt。

```batch
Dir C:\ 2> list.txt
```

甚至可以使用文件编号和 ‘&’ 前缀将 stdout 和 stderr 流组合在一起。以下是一个示例。

```batch
DIR C:\ > lists.txt 2>&1
```

**抑制程序输出**

伪文件 NUL 用于丢弃程序的任何输出。以下示例显示了将 DIR 命令的输出发送到 NUL 以丢弃输出。

```batch
Dir C:\ > NUL
```

**标准输入**

要使用标准输入，必须使用一种解决方法来实现。这可以通过重定向命令提示符自己的 stdin（称为 CON）来实现。

以下示例显示了如何将输出重定向到一个名为 lists.txt 的文件。执行以下命令后，命令提示符将接受用户输入，直到获取 EOF 字符。然后，它将所有输入发送到文件 lists.txt。

```batch
TYPE CON > lists.txt
```

# chat

## 详细介绍一下 bat 的 input/output

在批处理（Batch）文件中，输入（Input）和输出（Output）是脚本与用户或其他程序交互的基本方式。

以下是批处理文件中输入和输出的详细介绍：

### 输出（Output）

1. **`echo` 命令**：最常用的输出命令，用于在命令行显示文本或变量的值。
   ```bat
   echo Hello, World!
   ```

2. **命令行参数**：批处理文件可以接受命令行参数，这些参数在脚本中以 `%1` 到 `%9` 的形式存在，分别代表第一个到第九个参数。
   ```bat
   @echo off
   echo The first parameter is: %1
   ```

3. **重定向输出**：使用重定向运算符 `>` 或 `>>` 可以将命令的输出保存到文件中。
   ```bat
   echo This is a redirected output. > output.txt
   echo This line will be appended. >> output.txt
   ```

4. **管道**：使用 `|` 可以将一个命令的输出作为另一个命令的输入。
   ```bat
   dir | find "example"
   ```

### 输入（Input）

1. **`set` 命令**：用于从命令行或脚本中设置变量的值。
   ```bat
   set var=value
   ```

2. **`set /p` 命令**：允许从键盘接收输入，并将其存储在变量中。
   ```bat
   @echo off
   set /p var=Enter a value: 
   echo You entered: %var%
   ```

3. **选择输入**：使用 `choice` 命令可以让用户从一组选项中做出选择。
   ```bat
   @echo off
   echo Press 1 for option 1, or 2 for option 2.
   choice /c:12
   if errorlevel 2 goto option2
   echo You selected option 1.
   goto end
   :option2
   echo You selected option 2.
   :end
   ```

4. **读取文件输入**：可以使用 `type` 命令或 `for` 循环来读取文件内容。
   ```bat
   type input.txt
   ```

5. **输入回显**：`echo` 命令可以被禁用或启用，以控制命令行的输出。
   ```bat
   @echo off
   echo This line will not be echoed.
   ```

### 示例

以下是一些输入和输出的示例：

```bat
@echo off
echo Please enter your name:
set /p name=>
echo Hello, %name%. Nice to meet you!

echo The current date is: %date%
echo The current time is: %time%

echo This will be displayed on the screen.
echo And this will be appended to file.txt.
echo Append this line. >> file.txt

dir | find "batch"
```

### 注意事项

- 使用 `echo` 命令时，如果需要输出文本中的百分号 `%`，应使用两个百分号 `%%` 来避免与变量解析冲突。
- 使用 `set /p` 时，输入的值将包含任何尾随空格，除非使用 `set /p var=Prompt:` 格式，这样用户输入后按回车键将不包含尾随空格。
- 批处理文件的输出默认是发送到命令行窗口。可以使用 `echo` 命令结合重定向运算符将输出保存到文件中。

通过这些输入和输出的方法，批处理文件能够与用户进行交互，并与其他程序或脚本交换数据。




# 参考资料

https://www.tutorialspoint.com/batch_script/batch_script_input_output.htm

* any list
{:toc}