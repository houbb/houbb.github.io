---
layout: post
title: Docker 在 Windows11 环境安装教程
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, windows, devops, sh]
published: true
---


# 实战

## 1、虚拟机打开

windows11 这里是华为系统，可能描述不同

1. windows 直接搜索【启用或关闭Windows功能】

2. 打开虚拟机功能


### 一、检查电脑是否开启虚拟化功能

打开任务管理器，查看性能选项卡中的CPU信息，在右下角可以看到虚拟化是否开启。如未开启需要重启到BIOS中进行修改。

### 二、在启用或关闭windows功能中打开windows相关功能

新版本的windows11在启用或关闭windows功能上隐藏较深。原win10系统只需要在设置中搜索启用或关闭windows功能即可。

新的windows11将这项功能放在了设置-应用中。

点击开始-设置-应用选项卡，下拉至最后点击“可选功能”，并在可选功能中选择“更多windows功能”。

在其中，我们需要选择“适用于linux的windows子系统”选项。

![适用于linux的windows子系统](https://img2022.cnblogs.com/blog/2377363/202208/2377363-20220819162219347-629648281.png)

重启后生效，然后进行下一步。

## 2、下载 WSL 软件，并安装

### 设置 wsl 版本

将 WSL 2 设置为默认版本

```
wsl --set-default-version 2
```

日志：

```
有关与 WSL 2 的主要区别的信息，请访问 https://aka.ms/wsl2
操作成功完成。
```



### 安装所选的 Linux 分发

运行windows11的终端，输入wsl --list --online选择要安装的版本。

列表如下：

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

这里选择比较常用的ubuntu20.04进行安装，在终端中输入

```
wsl --install -d Ubuntu-20.04
```

### 安装

等待安装结束。

如果安装失败，可以手动下载离线包安装：https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi

安装完毕后，可以在终端输入wsl进行检查。

```
Installing, this may take a few minutes...
WslRegisterDistribution failed with error: 0x800701bc
Error: 0x800701bc WSL 2 ?????????????????? https://aka.ms/wsl2kernel
```

### 失败原因

造成该问题的原因是WSL版本由原来的WSL1升级到WSL2后，内核没有升级，前往微软WSL官网下载安装适用于 x64 计算机的最新 WSL2 Linux 内核更新包即可。

> [微软官网](https://docs.microsoft.com/zh-cn/windows/wsl/wsl2-kernel)

下载链接：https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi




## 安装 docker

前往[Docker Desktop官方网站](https://www.docker.com/products/docker-desktop)下载最新版本的Docker Desktop for Windows。

点击安装，安装完成后重启。

### 验证安装结果

```
$ docker --version
Docker version 24.0.6, build ed223bc
```

## 运行 hello-world

```
$ docker run hello-world
```

### 启动报错

![启动报错](https://img-blog.csdnimg.cn/d1d59c5744f94ce0837c9ffb58583761.png)

```
docker desktop requires a newer WSL kernel version  
```

### 解决方式

命令行运行如下命令。

> 说明书：https://docs.microsoft.com/windows/wsl/wsl2-kernel

```
wsl --update
```

成功日志:

```
正在安装: 适用于 Linux 的 Windows 子系统
已安装 适用于 Linux 的 Windows 子系统。
```

可以重启电脑，保障生效。

测试了下，直接不重启也能生效。docker desktop 的页面效果如下：

![docker hello word](https://img-blog.csdnimg.cn/7d917bf9aab345c0834207b9f9a19528.png#pic_center)


# 入门例子

## 编写一个Dockerfile

创建一个文本文件并命名为Dockerfile，该文件用于定义如何构建Docker镜像。

在文件中输入以下内容：

```
# 使用官方的Node.js运行时镜像作为基础镜像
FROM node:14

# 在容器内创建一个工作目录
WORKDIR /app

# 复制当前目录下的所有文件到容器的工作目录
COPY . .

# 使用npm安装简单的HTTP服务器
RUN npm install

# 暴露容器的端口
EXPOSE 80

# 定义容器启动时运行的命令
CMD [ "node", "app.js" ]
```


# 拓展阅读

## WSL 的版本查看

### 检查正在运行的 WSL 版本

执行下面命令可以查看WSL版本（WSL分为WSL1和WSL2两个版本，WSL2支持用户界面）

```
wsl -l -v
```

### WSL1与WSL2版本切换

执行下面命令进行版本转换，这期间需要等待一段时间。

```
# 更改所有的Linux子系统
wsl --set-default-version <Version>  # 将<Version#>替换为 1 或 2
 
# 更改指定的Linux子系统
wsl --set-version Ubuntu-18.04 <Version>  # 将<Version#>替换为 1 或 2
```

## Q1-介绍一下 WSL 命令

Windows Subsystem for Linux（WSL）是一项在Windows上运行Linux发行版的功能，允许您在Windows系统上使用Linux工具和命令行界面。以下是一些常见的WSL命令和用法的简介：

1. **wsl**：
   - `wsl`命令用于启动WSL shell。可以在Windows的命令提示符或PowerShell中使用此命令来访问WSL发行版的终端。
   - 示例：`wsl`

2. **wsl --list**：
   - `wsl --list`命令显示已安装的WSL发行版的列表。它列出了所有可用的Linux发行版，以及它们的状态（正在运行或已停止）。
   - 示例：`wsl --list`

3. **wsl --set-version \<发行版名称\> \<版本\>**：
   - 通过此命令，您可以将WSL发行版从版本1升级到版本2，或从版本2降级到版本1。
   - 示例：`wsl --set-version Ubuntu-20.04 2`

4. **wsl --set-default-version \<版本\>**：
   - 此命令用于设置默认的WSL版本。可以将其设置为1或2，以指定新的WSL发行版将使用的默认版本。
   - 示例：`wsl --set-default-version 2`

5. **wsl --install**：
   - `wsl --install`命令用于快速安装WSL 2以及Ubuntu发行版。这是一种便捷的方法，可以在没有WSL的情况下将其安装到Windows系统中。
   - 示例：`wsl --install`

6. **wsl --shutdown**：
   - 使用`wsl --shutdown`可以关闭所有正在运行的WSL实例。这在需要重新启动WSL时很有用。
   - 示例：`wsl --shutdown`

7. **wsl \<发行版名称\> \<Linux命令\>**：
   - 使用此命令，您可以在特定的WSL发行版中执行Linux命令。例如，如果您有一个名为Ubuntu-20.04的WSL发行版，并想在其中运行`ls`命令，可以使用以下方式：
   - 示例：`wsl Ubuntu-20.04 ls`

这些是一些常见的WSL命令和用法。

WSL还提供了更多高级功能，允许您与Windows文件系统互操作，以及在Windows和Linux之间进行网络通信等。

## Q2-为什么需要 windows 上运行 linux ？

在Windows上运行Linux有多种用途和好处，因此需要Windows Subsystem for Linux（WSL）或其他类似的工具来实现这一目标。以下是一些可能的原因和需求：

1. **开发者工具和环境**：
   - 许多开发者喜欢使用Linux上的开发工具和环境，因为Linux在开发领域广泛使用，并提供了丰富的开发工具和命令行界面。通过在Windows上运行Linux，开发者可以轻松地访问Linux上的工具和环境，以进行应用程序开发和调试。

2. **跨平台开发**：
   - 开发跨平台应用程序时，需要在不同操作系统上测试和运行代码。通过在Windows上运行Linux，可以更轻松地进行跨平台开发和测试，而无需在多个计算机上设置不同的开发环境。

3. **云计算和容器化**：
   - 云计算和容器化技术（如Docker和Kubernetes）通常依赖于Linux环境来运行应用程序和服务。运行Linux在Windows上允许开发者和运维人员在本地测试和部署容器化应用程序，以及与云中的Linux环境进行交互。

4. **服务器管理**：
   - 许多服务器运行Linux操作系统。通过在Windows上运行Linux，系统管理员可以轻松地使用Linux命令行工具和脚本管理和监控远程服务器，而无需直接登录到服务器。

5. **教育和学习**：
   - 学生、教育机构和技术爱好者可以使用WSL或其他类似工具来学习Linux操作系统和命令行。这可以帮助他们获取有关Linux的知识和技能。

6. **快速原型开发**：
   - 在某些情况下，快速原型开发可能需要在Windows和Linux之间进行切换。WSL提供了在同一台计算机上同时运行两个操作系统的便利性，以加速原型开发流程。

7. **兼容性**：
   - 对于一些应用程序或任务，特定的Linux工具或库可能更适合。在这种情况下，将Linux集成到Windows环境中可以提高兼容性，并确保应用程序在Linux和Windows之间的移植性。

总之，运行Linux在Windows上提供了多种灵活性和适应性的优势，使用户能够在一个计算机上同时获得Windows和Linux的最佳特性。

这对于各种应用场景，从开发到服务器管理再到学习，都非常有价值。

## Q3-WSL 安装后，使用起来应该和直接使用 linux 还是有区别的把？

是的，WSL（Windows Subsystem for Linux）虽然可以在Windows上运行Linux，但与在本机Linux环境下使用仍然存在一些区别。以下是一些主要区别：

1. **性能差异**：
   - 由于WSL是通过虚拟化技术实现的，因此与本机Linux相比，性能可能稍有降低。这意味着在某些情况下，特别是在处理I/O密集型任务时，WSL可能会比本机Linux慢一些。

2. **文件系统差异**：
   - WSL使用Windows文件系统（NTFS）来存储Linux文件系统，这可能会导致一些文件系统相关的差异。例如，文件权限和符号链接在WSL中可能会有不同的行为。

3. **图形用户界面（GUI）**：
   - WSL主要是面向命令行的，虽然可以安装图形用户界面工具，但在WSL中运行Linux图形应用程序通常需要额外的配置，并不像在本机Linux环境下那么直接。

4. **内核差异**：
   - WSL使用Windows内核和Linux子系统，因此它的内核不同于本机Linux内核。这可能会导致一些与内核相关的限制或行为差异。

5. **硬件访问**：
   - 一些硬件访问和控制可能在WSL中受到限制，因为WSL是在虚拟化层中运行的，无法直接访问硬件。

6. **系统服务**：
   - 在WSL中，一些系统服务和守护进程（如systemd）可能不会像在本机Linux中那样正常运行。这可能需要一些特殊的配置或工作区。

尽管存在这些差异，WSL在Windows环境中运行Linux仍然非常有用，尤其是对于开发者、测试人员和需要在不同操作系统之间切换的用户。

WSL提供了方便的方式来访问Linux工具和环境，而无需离开Windows系统。

对于大多数开发和日常任务，WSL提供了足够的功能和性能。

然而，如果您需要特定于本机Linux环境的功能或性能，那么在本机Linux上运行可能更合适。

# 参考资料

chat

[旧版 WSL 的手动安装步骤](https://learn.microsoft.com/zh-cn/windows/wsl/install-manual#step-4---download-the-linux-kernel-update-package)

https://www.cnblogs.com/angbors/p/16602556.html

[Windows配置WSL](https://blog.csdn.net/KiWi_VC/article/details/123454284?)

[win10 WSL2问题解决WslRegisterDistribution failed with error: 0x800701bc](https://blog.csdn.net/qq_18625805/article/details/109732122)

https://learn.microsoft.com/zh-cn/windows/wsl/install-manual#step-4---download-the-linux-kernel-update-package

* any list
{:toc}