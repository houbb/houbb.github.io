---
layout: post
title: windows bat 脚本教程-04-files 文件
date:  2016-11-30 14:14:36 +0800
categories: [Windows]
tags: [windows, shell, bat]
published: true
---

# 实战


感觉这个教程教的东西比较危险，上来就是删除。

我们一个个来，CRUD。

## 查询文件夹所有文件

```bat
@echo off

echo current path:
echo %CD%


echo current files:
dir /b

pause
```

效果：

```
current path:
D:\bat
current files:
1.doc
readFiles.bat
请按任意键继续. . .
```

## 文件重命名

要编写一个批处理脚本，将当前目录下的所有 `.doc` 文件后缀名改为 `.txt`，你可以使用以下步骤创建一个简单的批处理文件：

脚本：

```bat
@echo off
for %%f in (*.doc) do (
    ren "%%f" "%%~nf.txt"
)

echo DONE!
```

当你运行这个批处理文件时，它会执行以下操作：

1. `@echo off`: 这个命令关闭了批处理文件的命令回显，这意味着在运行脚本时不会在屏幕上显示每个命令的执行结果。

2. `for %%f in (*.doc) do ...`: 这是一个 for 循环，它遍历当前目录下所有的 ".doc" 文件。`%%f` 是循环变量，它会依次代表每个 ".doc" 文件的文件名。

3. `ren "%%f" "%%~nf.txt"`: 在循环中，对于每个 ".doc" 文件，`ren` 命令将其文件名从 `%%f`（即原文件名）改为 `"%%~nf.txt"`。`%%~nf` 表示文件名的基本部分，也就是没有扩展名的部分，因此通过将其与 ".txt" 后缀连接起来，就将扩展名从 ".doc" 改为 ".txt"。

总而言之，这个脚本会遍历当前目录下所有的 ".doc" 文件，并将它们的扩展名改为 ".txt"。

## 删除文件

- delFiles.bat

```bat
@echo off
for %%f in (*.doc) do (
    del "%%f" 

    echo "DEL %%f"
)

echo DONE!
```

执行：

```
D:\bat>delete_txt.bat
"DEL 1.txt"
DONE!
```

## 创建一个文件

如何通过 bat 脚本创建一个 create.txt 文件？并在其中写入内容 hello bat

您可以使用 `echo` 命令将文本写入一个文件中。

以下是一个批处理文件，它创建一个名为 "create.txt" 的文件，并在其中写入内容 "hello bat"：

- create_file.bat

```batch
@echo off
echo hello bat > create.txt
```

这个脚本首先关闭命令回显，然后使用 `echo` 命令将文本 "hello bat" 写入 "create.txt" 文件中。


---------------------------------------------------------------------------


# 教程

### 创建批处理文件

批处理文件通常在记事本中创建。因此，最简单的方法是打开记事本并输入脚本所需的命令。

对于这个练习，打开记事本并输入以下语句：

```plaintext
:: Deletes All files in the Current Directory With Prompts and Warnings 
::(Hidden, System, and Read-Only Files are Not Affected) 
::
@ECHO OFF 
DEL /Q 
RD /S /Q
```

### 保存批处理文件

创建批处理文件后，下一步是保存你的批处理文件。

批处理文件的扩展名可以是 .bat 或 .cmd。在命名批处理文件时应记住的一些通用规则：

- 尽量避免在命名批处理文件时使用空格，这有时会在它们从其他脚本调用时引起问题。
- 不要将它们命名为系统已有的常见批处理文件，例如 ping.cmd。

请注意，上面的代码示例中 `DEL . DR` 似乎是一个不完整的命令，我已将其更正为 `DEL /Q` 和 `RD /S /Q`，这些命令用于删除文件和目录，其中 `/Q` 参数用于安静模式，不提示确认。

如果需要针对隐藏、系统和只读文件，可能需要额外的命令或参数。

### 保存批处理文件的注意事项

当保存您的批处理文件时，请注意以下几点：

1. 在文件名的末尾加上 `.bat` 或 `.cmd` 扩展名。
2. 选择“保存类型”为“所有文件”。
3. 将整个文件名用引号括起来，例如 `"mybatchfile.bat"`。

### 执行批处理文件的步骤

以下是执行批处理文件的步骤：

**步骤 1** - 打开命令提示符 (cmd.exe)。

**步骤 2** - 导航到存储 `.bat` 或 `.cmd` 文件的位置。

**步骤 3** - 如下图所示输入文件名，并按下回车键执行批处理文件。

```plaintext
C:\Users\Username> cd path\to\batchfile
C:\Users\Username\path\to\batchfile> mybatchfile.bat
```

请确保将 `path\to\batchfile` 替换为批处理文件的实际路径，将 `mybatchfile.bat` 替换为批处理文件的实际文件名。

如果您的批处理文件名或路径中包含空格，请确保使用引号将整个文件名括起来，以确保命令行正确解析您的文件名。

### 修改批处理文件的步骤

以下是修改现有批处理文件的步骤：

**步骤 1** - 打开 Windows 资源管理器。

**步骤 2** - 导航到存储 `.bat` 或 `.cmd` 文件的位置。

**步骤 3** - 右键点击该文件，并从上下文菜单中选择“编辑”选项。文件将在记事本中打开，以便进行进一步编辑。

请确保在编辑批处理文件时遵循正确的语法和命令格式，以避免运行错误。编辑完成后，保存文件并关闭记事本。根据所做的更改，您可能需要以管理员权限重新运行命令提示符或重启计算机以使更改生效。




# 参考资料

https://www.tutorialspoint.com/batch_script/batch_script_commands.htm

* any list
{:toc}