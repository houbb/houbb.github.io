---
layout: post
title: Windows Chocolatey
date:  2018-10-30 16:54:03 +0800
categories: [Tool]
tags: [tool, windows, sh]
published: true
excerpt:  Windows Chocolatey 一款优雅的 windows 包管理工具
---

# chocolatey 

[chocolatey](https://chocolatey.org/) windows 的包管理工具。

类似于  brew apt-get

# 安装

使用 windows cmd.exe 管理员模式

运行命令：

```
@"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"
```

## 安装日志

powershell 执行命令：

```sh
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

- 日志

```
Microsoft Windows [版本 10.0.17134.345]
(c) 2018 Microsoft Corporation。保留所有权利。

C:\Windows\system32>@"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"
Getting latest version of the Chocolatey package for download.
Getting Chocolatey from https://chocolatey.org/api/v2/package/chocolatey/0.10.11.
Downloading 7-Zip commandline tool prior to extraction.
Extracting C:\Users\binbin.hou\AppData\Local\Temp\chocolatey\chocInstall\chocolatey.zip to C:\Users\binbin.hou\AppData\Local\Temp\chocolatey\chocInstall...
Installing chocolatey on this machine
Creating ChocolateyInstall as an environment variable (targeting 'Machine')
  Setting ChocolateyInstall to 'C:\ProgramData\chocolatey'
WARNING: It's very likely you will need to close and reopen your shell
  before you can use choco.
Restricting write permissions to Administrators
We are setting up the Chocolatey package repository.
The packages themselves go to 'C:\ProgramData\chocolatey\lib'
  (i.e. C:\ProgramData\chocolatey\lib\yourPackageName).
A shim file for the command line goes to 'C:\ProgramData\chocolatey\bin'
  and points to an executable in 'C:\ProgramData\chocolatey\lib\yourPackageName'.

Creating Chocolatey folders if they do not already exist.

WARNING: You can safely ignore errors related to missing log files when
  upgrading from a version of Chocolatey less than 0.9.9.
  'Batch file could not be found' is also safe to ignore.
  'The system cannot find the file specified' - also safe.
chocolatey.nupkg file not installed in lib.
 Attempting to locate it from bootstrapper.
PATH environment variable does not have C:\ProgramData\chocolatey\bin in it. Adding...
警告: Not setting tab completion: Profile file does not exist at
'C:\Users\binbin.hou\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1'.
Chocolatey (choco.exe) is now ready.
You can call choco from anywhere, command line or powershell by typing choco.
Run choco /? for a list of functions.
You may need to shut down and restart powershell and/or consoles
 first prior to using choco.
Ensuring chocolatey commands are on the path
Ensuring chocolatey.nupkg is in the lib folder
```

## 常见命令

search - 搜索包 choco search something 
list - 列出包 choco list -lo 
install - 安装 choco install baretail 
pin - 固定包的版本，防止包被升级 choco pin windirstat 
upgrade - 安装包的升级 choco upgrade baretail 
uninstall - 安装包的卸载 choco uninstall baretail 


安装Ruby Gem - choco install compass -source ruby 
安装Python Egg - choco install sphynx -source python 
安装IIS服务器特性 - choco install IIS -source windowsfeatures 
安装Webpi特性 - choco install IIS7.5Express -source webpi 


# 安装 docker

## 查询

```
C:\Windows\system32> choco search docker
Chocolatey v0.10.11
docker 18.06.1 [Approved] Downloads cached for licensed users
docker-compose 1.22.0 [Approved] Downloads cached for licensed users
docker-for-windows 18.06.1.19507 [Approved] Downloads cached for licensed users
...
```

## 安装 docker 

```
choco install docker-for-windows -y
```

## 直接安装报错

调整安装的位置

```
choco  install docker-for-windows -y --install-directory=D:\choco\docker
choco  install docker-for-windows -y -ia "INSTALLDIR=""D:\choco\docker"""
choco install docker-for-windows -ia "INSTALLDIR=""D:\choco\docker"""
```


ps: 用【管理员】运行命令行

重启你的电脑。Docker会问你是否要启用Hyper-V。

选择 yes

你需要知道Docker需要启用VT-X/AMD-v的硬件虚拟化扩展来运行容器。你需要在重启电脑时在BIOS里面配置它。

你可以用systeminfo命令来检查VT-x/AMD-v是否打开。

如果你不确定VT-x/AMD-v是否打开，也不用担心。因为你没有的话，Docker会报错：

Hardware assisted virtualization and data execution protection must be enabled in the BIOS.

# 参考资料

[如何在Windows 10上运行Docker和Kubernetes？](http://dockone.io/article/8136)

[使用chocolatey中的命令choco install时如何改变安装软件的路径？](https://ask.csdn.net/questions/245687)


* any list
{:toc}