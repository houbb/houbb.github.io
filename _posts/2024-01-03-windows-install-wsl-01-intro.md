---
layout: post
title: windows 如何安装 wsl ubuntu
date: 2024-01-05 21:01:55 +0800
categories: [Windows]
tags: [windows, os, linux, sh]
published: true
---

# WSL 介绍

Windows Subsystem for Linux（简称WSL）是一个在Windows 10\11上能够运行原生Linux二进制可执行文件（ELF格式）的兼容层。

它是由微软与Canonical公司合作开发，其目标是使纯正的Ubuntu、Debian等映像能下载和解压到用户的本地计算机，并且映像内的工具和实用工具能在此子系统上原生运行。

2022年11月16日，微软 Win11/10 Linux 子系统 WSL 1.0.0 正式版发布。

要在 Windows 上安装WSL，请按照以下步骤操作：

注意：继续之前，请确保您的 Windows 版本支持 WSL。您必须使用 Windows 10 或更高版本，并且您的系统应使用 64 位处理器。


# 1、启用 WSL 功能：

以管理员身份打开 PowerShell。为此，请在 Windows 搜索栏中搜索 “PowerShell”，右键单击 “Windows PowerShell”，然后选择 “以管理员身份运行”。

运行以下命令启用 WSL 功能：

```sh
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
```

# 2、启用虚拟机平台：

运行以下命令启用虚拟机平台功能：

```sh
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

# 3、安装 Linux 发行版：

一、您可以从 Microsoft Store 上提供的多个 Linux 发行版中进行选择。

例如，访问 Microsoft Store 上的 Ubuntu 页面并单击 "获取 "即可安装 Ubuntu。

二、或者，你也可以使用命令行安装 Linux 发行版。

例如，要安装 Ubuntu，请运行以下命令：

```sh
wsl --install -d Ubuntu
```

如果想安装其他版本，可以运行以下命令

```sh
wsl --list --online
```

会显示：

```
NAME                                   FRIENDLY NAME
Ubuntu                                 Ubuntu
Debian                                 Debian GNU/Linux
kali-linux                             Kali Linux Rolling
Ubuntu-18.04                           Ubuntu 18.04 LTS
Ubuntu-20.04                           Ubuntu 20.04 LTS
Ubuntu-22.04                           Ubuntu 22.04 LTS
OracleLinux_7_9                        Oracle Linux 7.9
OracleLinux_8_7                        Oracle Linux 8.7
OracleLinux_9_1                        Oracle Linux 9.1
openSUSE-Leap-15.5                     openSUSE Leap 15.5
SUSE-Linux-Enterprise-Server-15-SP4    SUSE Linux Enterprise Server 15 SP4
SUSE-Linux-Enterprise-15-SP5           SUSE Linux Enterprise 15 SP5
openSUSE-Tumbleweed                    openSUSE Tumbleweed
```

我选择了Ubuntu-22.04

```
wsl --install -d Ubuntu-22.04
```

## 安装报错

```
Installing, this may take a few minutes...
WslRegisterDistribution failed with error: 0x800701bc
Error: 0x800701bc WSL 2 ?????????????????? https://aka.ms/wsl2kernel
```

### 原因分析

没有开启虚拟化

### 解决方案1

重启电脑，进入 BIOS 开启虚拟化技术

控制面板->启用或关闭windows功能，勾选 Hyper-V、适用于 Linux 的 Windows 子系统、虚拟机平台，勾选这三个选项。

重启电脑

PS: 发现电脑中的 hyper-v 不见了。

### 解决方案2

[Windows Subsystem for Linux (WSL2) - WSL 的基本命令](https://blog.csdn.net/chengyq116/article/details/104442532)

首先下载Windows Subsystem for Linux Update setup 官方版将WSL1升级到WSL2。

　　然后再次尝试即可。

　　如果还没有解决问题，就需要用管理权限打开cmd或者powershell，分别输入下面代码

　　用管理权限打开cmd或者powershell，分别输入下面代码

　　bcdedit /set hypervisorlaunchtype Auto

　　Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All

　　Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform

　　Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux

　　到这里就应该都没有问题了。

### 自己的原因

```
PS C:\WINDOWS\system32> wsl --status
默认版本：2

适用于 Linux 的 Windows 子系统内核可以使用“wsl --update”手动更新，但由于你的系统设置，无法进行自动更新。
 若要接收自动内核更新，请启用 Windows 更新设置:“在更新 Windows 时接收其他 Microsoft 产品的更新”。
 有关详细信息，请访问https://aka.ms/wsl2kernel。

未找到 WSL 2 内核文件。若要更新或恢复内核，请运行“wsl --update”。
PS C:\WINDOWS\system32>
PS C:\WINDOWS\system32>
PS C:\WINDOWS\system32> wsl --update
```

更新成功，后，重新执行命令就可以了。

```sh
wsl --install -d Ubuntu
```

# 4、为 Linux 环境设置用户名和密码

```
PS C:\WINDOWS\system32> wsl --install -d Ubuntu
Ubuntu 已安装。
正在启动 Ubuntu...
Installing, this may take a few minutes...
wsl: 检测到 localhost 代理配置，但未镜像到 WSL。NAT 模式下的 WSL 不支持 localhost 代理。
Please create a default UNIX user account. The username does not need to match your Windows username.
For more information visit: https://aka.ms/wslusers
Enter new UNIX username: dh
wsl: 检测到 localhost 代理配置，但未镜像到 WSL。NAT 模式下的 WSL 不支持 localhost 代理。
New password:
Retype new password:
passwd: password updated successfully
wsl: 检测到 localhost 代理配置，但未镜像到 WSL。NAT 模式下的 WSL 不支持 localhost 代理。
wsl: 检测到 localhost 代理配置，但未镜像到 WSL。NAT 模式下的 WSL 不支持 localhost 代理。
Installation successful!
wsl: 检测到 localhost 代理配置，但未镜像到 WSL。NAT 模式下的 WSL 不支持 localhost 代理。
To run a command as administrator (user "root"), use "sudo <command>".
See "man sudo_root" for details.

Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.146.1-microsoft-standard-WSL2 x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage


This message is shown once a day. To disable it please create the
/home/dh/.hushlogin file.
```

注意：这里输入密码不会像windows一样显示星号，甚至没有任何反应，但是不用管，直接输入两次一样的即可

注意：**需要重启电脑**

一、安装完成后，从 "开始 "菜单启动已安装的 Linux 发行版。

![初始页面](https://img-blog.csdnimg.cn/cafaa70154d54299b44391d40d8883e5.png)

## 查看版本

```
$ lsb_release -sr
22.04
```

# 5、更新和升级：

安装完成后，最好使用以下命令更新软件包列表并升级软件包：

```
sudo apt update
sudo apt upgrade
```

就是这样！你现在已经安装了 Windows Subsystem for Linux (WSL)，可以用它在 Windows 环境中运行 Linux 发行版。

您可以在 Linux 发行版上安装其他软件包和工具，就像在本地 Linux 系统上一样。

# 参考资料

[如何在windows上安装WSL？以实现windows操作系统运行linux](https://blog.csdn.net/weixin_40551464/article/details/133577201)

https://blog.csdn.net/xjyou456/article/details/129654673

https://blog.csdn.net/qq_17525509/article/details/122287051

https://www.jb51.net/os/win11/826180.html

https://cloud.tencent.com/developer/article/2066919

* any list
{:toc}