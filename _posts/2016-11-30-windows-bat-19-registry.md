---
layout: post
title: windows bat 脚本教程-19-Registry 注册表
date:  2016-11-30 14:14:36 +0800
categories: [Windows]
tags: [windows, shell, bat]
published: true
---

# 注册表

注册表是Windows系统的关键元素之一。它包含有关操作系统各个方面的大量信息。几乎所有安装在Windows系统上的应用程序都以某种形式与注册表交互。

注册表包含两个基本元素：键和值。注册表键是类似于文件夹的容器对象。注册表值是类似于文件的非容器对象。

键可以包含值或更多的键。键使用类似于Windows路径名的语法进行引用，使用反斜杠表示层次结构的级别。

本章将介绍查询值、向注册表添加、删除和编辑值等各种功能。

| 序号 | 注册表类型及描述             |
|------|------------------------------|
| 1    | 从注册表中读取   从注册表中读取是通过 REG QUERY 命令完成的。            |
| 2    | 向注册表添加     向注册表添加是通过 REG ADD 命令完成的。            |
| 3    | 从注册表中删除    从注册表中删除是通过 REG DEL 命令完成的。           |
| 4    | 复制注册表键      从注册表中复制是通过 REG COPY 命令完成的。           |
| 5    | 比较注册表键     比较注册表键是通过 REG COMPARE 命令完成的。            |


# chat

## 详细介绍一下 bat 脚本中注册表

在批处理（.bat）脚本中，注册表是一个关键的系统组件，用于存储Windows操作系统的配置信息、用户设置以及安装的应用程序信息等。

通过批处理脚本，可以对注册表进行查询、添加、删除和编辑等操作，从而实现对系统配置和应用程序行为的控制和管理。

下面是关于批处理脚本中注册表的详细介绍：

**1. 读取注册表：** 通过使用`REG QUERY`命令，可以从注册表中读取特定键或值的信息。这可以帮助脚本获取系统配置信息或特定应用程序的设置。

**2. 添加到注册表：** 使用`REG ADD`命令可以向注册表中添加新的键或值。这对于自定义系统配置或安装应用程序时设置参数非常有用。

**3. 从注册表中删除：** 使用`REG DELETE`命令可以从注册表中删除指定的键或值。这对于清理系统残留或卸载应用程序时清除相关设置非常有用。

**4. 复制注册表键：** 使用`REG COPY`命令可以将一个注册表键及其子项复制到另一个位置。这可以用于备份注册表设置或在不同系统之间传输配置。

**5. 比较注册表键：** 使用`REG COMPARE`命令可以比较两个注册表键的内容。这对于检查系统配置的变化或验证更新操作的有效性非常有用。

通过这些注册表操作命令，批处理脚本可以实现对系统配置和应用程序设置的管理和控制。

但需要注意的是，在对注册表进行操作时，务必谨慎操作，避免对系统造成不必要的影响或损坏。

最好在操作之前备份注册表，以防止意外情况的发生。

## 分别给出上述的命令+例子

下面是每个注册表操作命令及其示例：

**1. 读取注册表：**
```batch
REG QUERY "HKCU\Software\Microsoft\Windows\CurrentVersion"
```
这个命令将查询当前用户的注册表中的指定键路径下的所有子项和值。

**2. 添加到注册表：**
```batch
REG ADD "HKLM\Software\MyApp" /v Version /t REG_SZ /d "1.0" /f
```
这个命令将在HKEY_LOCAL_MACHINE\Software路径下创建一个名为MyApp的新键，然后在该键下创建一个名为Version的字符串值，并将其设置为"1.0"。

**3. 从注册表中删除：**
```batch
REG DELETE "HKCU\Software\MyApp" /f
```
这个命令将删除当前用户的注册表中的HKEY_CURRENT_USER\Software路径下的名为MyApp的键及其所有子项和值。

**4. 复制注册表键：**
```batch
REG COPY "HKCU\Software\MyApp" "HKLM\Software\MyApp" /s /f
```
这个命令将当前用户的注册表中的HKEY_CURRENT_USER\Software\MyApp键及其所有子项和值复制到HKEY_LOCAL_MACHINE\Software\MyApp路径下。

**5. 比较注册表键：**
```batch
REG COMPARE "HKLM\Software\MyApp" "HKCU\Software\MyApp"
```
这个命令将比较HKEY_LOCAL_MACHINE\Software\MyApp键和HKEY_CURRENT_USER\Software\MyApp键的内容，并显示差异。



# 参考资料

https://www.tutorialspoint.com/batch_script/batch_script_registry.htm

* any list
{:toc}