---
layout: post
title: windows install linux 实战笔记 windows 安装 linux WSL 
date: 2023-10-20 21:01:55 +0800
categories: [Windows]
tags: [windows, linux, os, sh]
published: true
---

# windows 下的 linux 命令

如果你在Windows系统上使用Linux命令，可以通过使用Linux子系统（Windows Subsystem for Linux，WSL）来获得Linux环境。


## 确保 wsl 已经启用

启用WSL功能：

打开控制面板：你可以在Windows搜索框中输入"控制面板"，然后选择控制面板应用程序。

选择"程序"：在控制面板中，选择"程序"。

选择"启用或关闭Windows功能"：在"程序和功能"窗口中，你会看到一个选项"启用或关闭Windows功能"，点击它。

启用"适用于Linux的Windows子系统"：在Windows功能窗口中，找到"适用于Linux的Windows子系统"（Windows Subsystem for Linux），勾选它，然后点击"确定"。在选择该选项后，Windows可能需要重启。

安装Linux发行版：启用了WSL后，在Microsoft Store中安装一个Linux发行版，例如Ubuntu、Debian等。安装完成后，启动它以完成WSL的初始化。

## 1. 安装 wsl

以下是在Windows上安装WSL的步骤：

1. 安装Windows子系统Linux（WSL）

首先，确保你的Windows版本支持WSL。Windows 10的版本1709及以上都支持WSL。然后，按照以下步骤安装WSL：

2. 打开PowerShell（管理员权限）。

运行以下命令启用WSL功能：

```sh
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
```

对应日志：

```
部署映像服务和管理工具
版本: 10.0.19041.844

映像版本: 10.0.19045.2788

启用一个或多个功能
[==========================100.0%==========================]
操作成功完成。
```

## 2. 从Microsoft Store安装Linux分发版

在命令提示符或PowerShell中，输入以下命令来列出Microsoft Store中可用的Linux分发版：

```sh
wsl --list --online
```

选择并安装所需的Linux分发版：

在列表中选择你想要安装的Linux分发版（例如，Ubuntu、Debian等），然后运行以下命令来安装它。

以Ubuntu为例：

```sh
   wsl --install -d Ubuntu
```

需要耐心等待安装完成。

### 安装报错

报错：

```
Ubuntu 已安装。
正在启动 Ubuntu...
Installing, this may take a few minutes...
WslRegisterDistribution failed with error: 0x80004002
Error: 0x80004002 ??????
```

原因：

错误代码`0x80004002`通常表示"未找到"或"无法找到指定的文件"。

在WSL中，这种错误通常与无法找到Linux发行版的安装包或配置文件有关。以下是一些可能导致此错误的原因和解决方法：

1. **未安装Linux发行版**：确保你已经在Microsoft Store中安装了所需的Linux发行版。如果你已经安装了，尝试重新安装它，有时重新安装可以解决问题。

2. **安装文件损坏**：有时，安装文件可能损坏。尝试删除Linux发行版并重新安装它。你可以使用以下命令删除Linux发行版（请将`YourDistributionName`替换为你的Linux分发版的名称）：

```bash
wsl --unregister YourDistributionName
```

   然后，从Microsoft Store中重新安装Linux发行版。

3. **Windows更新问题**：确保你的Windows系统已经安装了最新的更新。有时，Windows的更新可能修复与WSL相关的问题。

4. **文件权限问题**：如果WSL需要访问某些文件，确保相关文件和目录的权限设置是正确的。如果WSL试图访问一个没有权限的文件或目录，可能导致安装失败。

5. **检查WSL服务状态**：确保WSL服务正在运行。你可以在Windows服务管理器中查找"LxssManager"服务，并确保它的状态是"运行中"。

ps: 我这里是 wls 服务没有重启导致的。


## 成功日志

```
Installing, this may take a few minutes...
Please create a default UNIX user account. The username does not need to match your Windows username.
For more information visit: https://aka.ms/wslusers
Enter new UNIX username: houbinbin
New password:
Retype new password:
passwd: password updated successfully
操作成功完成。
Installation successful!
```

# 运行测试

直接搜索 lunix，选择【适用于lunix的windows子系统】，直接进入命令行：

```
To run a command as administrator (user "root"), use "sudo <command>".
See "man sudo_root" for details.

Welcome to Ubuntu 22.04.2 LTS (GNU/Linux 5.15.90.1-microsoft-standard-WSL2 x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage


This message is shown once a day. To disable it please create the
/home/houbinbin/.hushlogin file.
houbinbin@PC-20230404XHIO:~$
```

# linux 对应的文件在 windows 的哪里

在Windows系统中，Linux子系统（Windows Subsystem for Linux，WSL）的文件系统位于特定的位置，具体取决于WSL版本。

以下是不同版本WSL对应的文件系统位置：

## wls1

类似于

```
C:\Users\YourUsername\AppData\Local\Packages\CanonicalGroupLimited.UbuntuonWindows_79rhkp1fndgsc\LocalState
```

## wls2

在WSL 2中，文件系统位于虚拟硬盘中。

你可以通过以下路径访问WSL 2的文件系统：

```
\\wsl$\Ubuntu-20.04  # 这是Ubuntu 20.04的一个示例路径
```

在这个路径中，Ubuntu-20.04是你安装的Linux分发版的名称。

你可以通过Windows资源管理器、命令提示符或PowerShell等方式访问这个路径。

比如我这个就是在 

```
\\wsl.localhost\Ubuntu\home\houbinbin
```

# WSL 的文件在哪里？

有时候还是希望 linux 的数据可以和 windows 互通。

以自己的账户为例，默认的路径应该是：

```
\\wsl.localhost\Ubuntu\home\dh
```

# 参考资料

chat

* any list
{:toc}