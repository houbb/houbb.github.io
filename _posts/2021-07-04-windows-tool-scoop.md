---
layout: post
title: 包管理工具 scoop windows10 安装笔记, scoop install GCC 实战笔记
date:  2021-06-20 16:52:15 +0800
categories: [Windows]
tags: [windows, tool]
published: true
---


# 是什么？

Scoop 是一个用于 Windows 操作系统的命令行包管理器，类似于其他操作系统上的包管理器（如 Linux 上的 apt、yum，macOS 上的 Homebrew）。

Scoop 的目标是简化 Windows 上软件的安装、更新和卸载过程，使得管理开发工具、实用程序和其他软件变得更加方便。

# windows10 安装笔记

```
PS C:\Users\Administrator> iwr -useb get.scoop.sh | iex                                                                 Initializing...
Running the installer as administrator is disabled by default, see https://github.com/ScoopInstaller/Install#for-admin for details.
Abort.
```

直接报错，查文档，建议：

```sh
iex "& {$(irm get.scoop.sh)} -RunAsAdmin"
```

继续报错：

```
PS C:\Users\Administrator> iex "& {$(irm get.scoop.sh)} -RunAsAdmin"
Initializing...
PowerShell requires an execution policy in [Unrestricted, RemoteSigned, ByPass] to run Scoop. For example, to set the execution policy to 'RemoteSigned' please run 'Set-ExecutionPolicy RemoteSigned -Scope CurrentUser'.
Abort.
```

执行下面的脚本；

```sh
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

选择 A:

```
执行策略更改
执行策略可帮助你防止执行不信任的脚本。更改执行策略可能会产生安全风险，如 https:/go.microsoft.com/fwlink/?LinkID=135170
中的 about_Execution_Policies 帮助主题所述。是否要更改执行策略?
[Y] 是(Y)  [A] 全是(A)  [N] 否(N)  [L] 全否(L)  [S] 暂停(S)  [?] 帮助 (默认值为“N”): A
```

重新运行：

```sh
iex "& {$(irm get.scoop.sh)} -RunAsAdmin"
```

安装成功日志：

```
Initializing...
Downloading ...
fatal: fetch-pack: invalid index-pack output
fetch-pack: unexpected disconnect while reading sideband packet
PS C:\Users\Administrator> ^C
PS C:\Users\Administrator> iex "& {$(irm get.scoop.sh)} -RunAsAdmin"
Initializing...
Downloading ...
Creating shim...
Adding ~\scoop\shims to your path.
Scoop was installed successfully!
```

# 安装 gcc

## 1) **添加 Scoop 的 extras 桶

Scoop 使用桶（buckets）来组织软件包。

`extras` 桶包含了一些额外的工具和软件包。

    ```powershell
    scoop bucket add extras
    ```

日志：

```
PS C:\Users\Administrator> scoop bucket add extras
Checking repo... OK
The extras bucket was added successfully.
```

##  2) **安装 GCC：** 

`extras` 桶中包含了 GCC，一个适用于 Windows 的 GCC 发行版。

您可以通过以下命令安装 GCC：

    ```powershell
    scoop install gcc
    ```

日志：

```
PS C:\Users\Administrator> scoop install gcc
Installing '7zip' (23.01) [64bit] from main bucket
7z2301-x64.msi (1.8 MB) [=====================================================================================] 100%
Checking hash of 7z2301-x64.msi ... ok.
Extracting 7z2301-x64.msi ... done.
Linking ~\scoop\apps\7zip\current => ~\scoop\apps\7zip\23.01
Creating shim for '7z'.
Creating shim for '7zFM'.
Creating shim for '7zG'.
Creating shortcut for 7-Zip (7zFM.exe)
Persisting Codecs
Persisting Formats
Running post_install script...
'7zip' (23.01) was installed successfully!
Notes
-----
Add 7-Zip as a context menu option by running: "C:\Users\Administrator\scoop\apps\7zip\current\install-context.reg"
Installing 'gcc' (11.2.0) [64bit] from main bucket
components-18.0.7z (96.4 MB) [================================================================================] 100%
Checking hash of components-18.0.7z ... ok.
Extracting components-18.0.7z ... done.
Running pre_install script...
Linking ~\scoop\apps\gcc\current => ~\scoop\apps\gcc\11.2.0
'gcc' (11.2.0) was installed successfully!
```

## 测试

```powershell
    gcc --version
```

如下：

```
> gcc --version
gcc.exe (GCC) 11.2.0
Copyright (C) 2021 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
```


# chat

## Q: 如何安装 GCC

在 Scoop 中安装 GCC（GNU Compiler Collection）非常简单。以下是安装步骤：

1. **安装 Scoop：** 如果您尚未安装 Scoop，可以通过以下 PowerShell 命令安装：

    ```powershell
    iwr -useb get.scoop.sh | iex
    ```

2. **添加 Scoop 的 extras 桶：** Scoop 使用桶（buckets）来组织软件包。`extras` 桶包含了一些额外的工具和软件包。您可以通过以下命令添加 `extras` 桶：

    ```powershell
    scoop bucket add extras
    ```

3. **安装 TDM-GCC：** `extras` 桶中包含了 TDM-GCC，一个适用于 Windows 的 GCC 发行版。您可以通过以下命令安装 TDM-GCC：

    ```powershell
    scoop install tdm-gcc
    ```

    这将自动下载并安装 TDM-GCC，并将其添加到系统的 PATH 环境变量中，使得您可以在命令行中直接访问 GCC 工具。

4. **验证安装：** 安装完成后，您可以在命令行中运行以下命令来验证 GCC 的安装：

    ```powershell
    gcc --version
    ```

    如果一切顺利，应该显示 GCC 的版本信息，表明安装成功。

通过以上步骤，您就成功在 Windows 上使用 Scoop 安装了 TDM-GCC，使得 GCC 在命令行中可用。

## windows scoop 如何安装 gcc

## Q: 介绍一下 windows 下的 Scoop

Scoop 是一个用于 Windows 操作系统的命令行包管理器，类似于其他操作系统上的包管理器（如 Linux 上的 apt、yum，macOS 上的 Homebrew）。

Scoop 的目标是简化 Windows 上软件的安装、更新和卸载过程，使得管理开发工具、实用程序和其他软件变得更加方便。

以下是 Scoop 的一些特点和使用方法：

1. **简单安装：** Scoop 本身可以通过一行命令进行安装。在 PowerShell 中运行以下命令即可：

    ```powershell
    iwr -useb get.scoop.sh | iex
    ```

2. **用户级安装：** Scoop 安装在用户的主目录下，无需管理员权限。这使得用户可以在没有管理员权限的情况下自由管理软件。

3. **软件安装：** 通过 Scoop，您可以使用类似下面的命令来安装软件：

    ```powershell
    scoop install <软件名称>
    ```

    例如，要安装 Git，可以运行：

    ```powershell
    scoop install git
    ```

4. **软件更新：** 使用 Scoop 可以轻松更新已安装的软件：

    ```powershell
    scoop update
    ```

5. **软件卸载：** Scoop 允许您卸载已安装的软件：

    ```powershell
    scoop uninstall <软件名称>
    ```

6. **桶（Buckets）：** Scoop 使用桶来组织软件的安装脚本和元数据。有许多社区维护的桶，用于支持大量常见的开源软件。

7. **自定义桶：** 用户可以创建自己的桶，以添加、修改或删除软件。

8. **环境变量管理：** Scoop 可以自动添加软件安装目录到系统的 PATH 环境变量中，方便直接在命令行中运行已安装的工具。

总体而言，Scoop 是一个强大而灵活的工具，使得在 Windows 环境中管理软件变得更加便捷。



# 参考资料

chat

https://github.com/grafana/grafana


* any list
{:toc}