---
layout: post
title: linux nohup 用于使程序在退出终端或注销用户后继续运行
date: 2018-12-21 11:28:06 +0800
categories: [Linux]
tags: [linux, shell, sh]
published: true
---

# 详细介绍一下 linux nohup 命令

`nohup` 是在 Unix 和类 Unix 操作系统中的一个命令，用于使程序在退出终端或注销用户后继续运行，同时将输出重定向到一个文件。

`nohup` 是 "no hang up" 的缩写，表示不挂断。

使用 `nohup` 可以使命令或进程在后台运行，即使你注销或关闭终端，该进程也会继续执行。

以下是 `nohup` 命令的基本用法：

```bash
nohup command [options] > output_file 2>&1 &
```

- `command`：要运行的命令或程序。
- `[options]`：命令的选项。
- `output_file`：输出重定向到的文件。
- `2>&1`：将标准错误（stderr）重定向到标准输出（stdout），以确保所有输出都被记录到 `output_file`。
- `&`：使命令在后台运行。

例如，要使用 `nohup` 运行一个脚本文件 `myscript.sh`，并将输出重定向到 `output.log` 文件，可以执行以下命令：

```bash
nohup ./myscript.sh > output.log 2>&1 &
```

这将在后台运行 `myscript.sh`，并将标准输出和标准错误写入 `output.log` 文件。

你可以使用 `ps` 或 `jobs` 命令来查看后台运行的任务。

```bash
ps aux | grep myscript.sh
```

或者

```bash
jobs
```

请注意，使用 `nohup` 启动的任务会继续运行，即使你注销登录或关闭终端窗口。

这在需要长时间运行的任务、远程服务器上的任务或希望脱离终端的任务时非常有用。

# 例子

```
nohup java -jar xxx.jar& 
```

这样一个启动 java 命令是什么意思？

`nohup java -jar xxx.jar &` 是一个常见的在后台运行 Java 可执行 JAR 文件的命令。

让我们详细解释每个部分：

1. **`nohup`：** 表示 "no hang up"，这个命令会让后面的命令在后台运行，即使终端会话被关闭或注销。

2. **`java -jar xxx.jar`：** 这是实际要执行的命令。在这个例子中，它运行了一个 Java 可执行 JAR 文件。通常，这是启动一个 Java 应用程序的命令。`xxx.jar` 应该替换为你实际的 JAR 文件名称。

3. **`&`：** 在命令的末尾，表示在后台运行。这样做可以让你继续使用当前终端会话而不阻塞，而执行的程序将继续在后台运行。

综合起来，这个命令的目的是在后台运行一个 Java 可执行 JAR 文件，而且这个任务不会受到当前终端会话的影响。具体的使用场景可能包括在服务器上运行一个长时间运行的 Java 应用程序或在终端中执行任务后不希望该任务占用终端。

注意：执行这个命令后，你可能会在当前终端看不到程序的输出。如果你希望将输出保存到文件，你可以将命令修改为：

```bash
nohup java -jar xxx.jar > output.log 2>&1 &
```

这样会将标准输出和标准错误都重定向到 `output.log` 文件中。

# 参考资料


* any list
{:toc}