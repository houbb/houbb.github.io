---
layout: post
title: windows10 make 编译命令安装笔记
date:  2021-06-20 16:52:15 +0800
categories: [Windows]
tags: [windows, tool]
published: true
---


# Make for Windows

Make：GNU make 工具，用于维护程序的可执行文件和其他非源文件的生成

版本
3.81

## 描述

Make 是一个控制从程序的源文件生成可执行文件和其他非源文件的工具。Make 从一个称为 makefile 的文件获取构建程序的知识，该文件列出了每个非源文件以及如何从其他文件计算它。当您编写程序时，应为其编写一个 makefile，以便可以使用 Make 来构建和安装程序。

## Make 的功能

Make 使最终用户能够构建和安装您的软件包，而不需要了解这是如何完成的，因为这些细节记录在您提供的 makefile 中。
Make 根据已更改的源文件自动确定需要更新哪些文件。它还自动确定更新文件的正确顺序，以防一个非源文件依赖于另一个非源文件。因此，如果更改了一些源文件然后运行 Make，它不需要重新编译整个程序。它仅更新直接或间接依赖于您更改的源文件的那些非源文件。
Make 不限于任何特定语言。对于程序中的每个非源文件，makefile 指定了计算它的 shell 命令。这些 shell 命令可以运行编译器以生成对象文件，运行链接器以生成可执行文件，运行 ar 以更新库，或运行 TeX 或 Makeinfo 以格式化文档。
Make 不限于构建软件包。您还可以使用 Make 控制安装或卸载软件包，为其生成标签表，或执行其他您经常要做的操作，使其值得编写如何执行这些操作的说明。

## 主页

http://www.gnu.org/software/make

## 下载

如果您下载软件包的安装程序，那么在下面的要求中列出的依赖项，例如动态链接库（DLL），已经包含在其中，无需额外安装。如果您将软件包下载为 Zip 文件，则必须自行下载并安装依赖项的 Zip 文件。

其他软件包的开发者文件（头文件和库）并不包含在内；因此，如果您希望开发自己的应用程序，必须单独安装所需的软件包。

# install windows10

## 下载

我们这里下载安装程序，可以默认包含依赖项。

> [https://gnuwin32.sourceforge.net/downlinks/make.php](https://gnuwin32.sourceforge.net/downlinks/make.php)


## 配置变量

默认的安装路径：

```
C:\Program Files (x86)\GnuWin32\bin
```

下面的文件：

```
λ ls
 bin/   Cmder.exe*   config/   icons/   LICENSE   opt/   vendor/  'Version 1.3.24.236'
```

安装之后，发现默认没有加到 path 中。

我们编辑环境变量，把 `C:\Program Files (x86)\GnuWin32\bin` 加到 path 中。



## 测试

```
>make -v
GNU Make 3.81
Copyright (C) 2006  Free Software Foundation, Inc.
This is free software; see the source for copying conditions.
There is NO warranty; not even for MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.

This program built for i386-pc-mingw32
```



# 参考资料

chat

https://gnuwin32.sourceforge.net/packages/make.htm

https://blog.csdn.net/weixin_45903371/article/details/113886121

* any list
{:toc}