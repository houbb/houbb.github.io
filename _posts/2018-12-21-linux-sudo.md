---
layout: post
title: linux sudo 使用 root 权限执行 linux chmod 权限赋值
date: 2018-12-21 11:28:06 +0800
categories: [Linux]
tags: [linux, shell, sh]
published: true
---

# chat

## 详细介绍一下 linux sudo 命令

`sudo` 是 Linux 和其他类 Unix 操作系统中的一个命令，用于以其他用户的身份执行命令，默认情况下是以超级用户（root）的身份执行。

它是 "Superuser Do" 的缩写。

以下是 `sudo` 命令的详细介绍：

### 1. **基本用法：**
   `sudo` 允许普通用户以超级用户权限执行特定的命令。基本语法如下：

   ```bash
   sudo [选项] 命令 [命令参数]
   ```

   例如，以超级用户权限查看 `/etc/passwd` 文件：

   ```bash
   sudo cat /etc/passwd
   ```

### 2. **特点：**
   - **权限提升：** 主要用于执行需要超级用户权限的任务，如安装软件、管理系统配置等。
   - **日志记录：** `sudo` 会记录命令的执行，以便系统管理员审查使用情况。
   - **权限控制：** 可以通过 `/etc/sudoers` 文件配置对哪些用户、哪些命令允许使用 `sudo`。

### 3. **配置文件 `/etc/sudoers`：**
   `/etc/sudoers` 文件定义了 `sudo` 命令的配置规则。最好使用 `visudo` 命令来编辑此文件，以确保语法正确性和防止可能的编辑错误。

   ```bash
   sudo visudo
   ```

   在该文件中，可以指定哪些用户、用户组，以及在哪些主机上可以执行哪些命令。例如：

   ```bash
   # Allow members of group sudo to execute any command
   %sudo   ALL=(ALL:ALL) ALL
   ```

### 4. **选项：**
   - **-u 用户：** 以指定用户的身份执行命令。
   - **-g 组：** 以指定组的身份执行命令。
   - **-l 或 --list：** 列出当前用户可执行的命令。
   - **-v 或 --validate：** 在一定时间内刷新 `sudo` 的密码缓存。

### 5. **密码缓存：**
   `sudo` 默认会缓存用户密码，以减少用户在一段时间内的重复输入。缓存时间可以在 `/etc/sudoers` 文件中配置。

### 6. **安全注意事项：**
   - **避免过度使用：** 只在需要时使用 `sudo`，以防止意外或滥用权限。
   - **谨慎编辑 sudoers 文件：** 使用 `visudo` 来编辑 `/etc/sudoers`，以避免语法错误。

### 7. **示例：**
   - **以其他用户身份执行命令：**
     ```bash
     sudo -u username command
     ```

   - **刷新 `sudo` 缓存：**
     ```bash
     sudo -v
     ```

   - **列出当前用户的 `sudo` 权限：**
     ```bash
     sudo -l
     ```

`sudo` 是管理 Linux 系统中的权限的强大工具，但要谨慎使用，以防止不必要的风险。

在多用户环境中，合理配置 `/etc/sudoers` 文件是确保系统安全的重要一环。

## 一个越权的命令?

有时候我们的账户没有权限，执行下面的命令：

```bash
sudo python -c 'import os; os.system("sudo su")'
```

### 作用

这个命令的作用是通过 Python 脚本尝试以超级用户权限运行一个命令。

具体来说，这个命令执行了以下操作：

```bash
sudo python -c 'import os; os.system("sudo su")'
```

1. `sudo`：在类Unix操作系统中，这是一个命令，允许有权限的用户根据安全策略执行超级用户或其他用户的命令。

2. `python`：启动 Python 解释器。

3. `-c 'import os; os.system("sudo su")'`：通过 `-c` 选项指定的 Python 一行脚本。它导入了 `os` 模块，然后使用 `os.system` 执行了命令 `"sudo su"`。

内部命令 `"sudo su"` 是尝试通过运行带有 `sudo` 的 `su` 命令切换到超级用户（root）的操作。`su` 命令用于切换到另一个用户，而与 `sudo` 一起使用时，通常表示切换到 root 用户。

然而，从 Python 脚本或一行命令中运行 `sudo su` 可能不会按预期工作，这是因为 `sudo` 和子进程管理的方式。

而且，通常不建议在脚本中嵌入此类命令，因为涉及到潜在的安全风险。

如果你有特定的目标或任务，提供更多上下文会更有助于我更好地帮助你。

以提升权限的方式运行命令应该小心谨慎，并且要清楚了解潜在的风险。

# 参考资料

[linux chmod](http://www.runoob.com/linux/linux-comm-chmod.html)

* any list
{:toc}