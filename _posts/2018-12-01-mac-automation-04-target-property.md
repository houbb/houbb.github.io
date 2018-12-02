---
layout: post
title: Mac Automation-04-Traget Property
date: 2018-12-01 11:35:23 +0800
categories: [Mac]
tags: [mac, auto, sh]
published: true
excerpt: Mac Automation 目标属性
---

# 目标属性

目标属性的值是对其内容显示在Finder窗口中的文件夹或磁盘的引用。可以读取和更改此值。让我们来看看这两个动作。

首先，让我们获取最前面窗口的target属性的值：

```
tell application "Finder" to get the target of the front Finder window
```

返回值

```
folder "houbinbin" of folder "Users" of startup disk of application "Finder"
```

如您所见，此脚本的结果是对其内容显示在Finder窗口中的文件夹的引用，在本例中是您的主目录。

此参考描述了目标文件夹在其对象层次结构中的位置或其在“命令链”中的位置。

返回的对象引用通过使用所有格“of”清楚地显示目标文件夹包含在启动盘上的“Users”文件夹中，该文件夹是Finder应用程序的一个元素。

您将在编写的脚本中经常使用此分层引用结构。

接下来，我们将更改打开的Finder窗口的目标。

要更改属性的值，我们将在脚本中使用动词“set”。 Set是用于更改属性值的动词或命令。

从脚本窗口中删除上一个脚本，然后输入，编译并运行以下脚本：

```
tell application "Finder" to set the target of the front Finder window to the startup disk
```

# Finder参考

由于您经常在编写的脚本中使用对象引用，因此这里简要介绍如何创建用于Finder应用程序的对象引用。

首先，在前Finder窗口中，导航到主目录中的Documents文件夹。

在Documents文件夹中，创建一个名为“Smith Project”的新文件夹。我们将在以下示例中使用此文件夹。

要构造对特定Finder磁盘项的对象引用，只需从要引用的项开始，并列出每个文件夹或包含对象层次结构的项，直到到达包含该项的磁盘为止。

例如，要在主目录的Documents文件夹中创建名为“Smith Project”的文件夹的Finder引用，请开始Finder引用，其中引用项的名称前面有一个类标识符，指示项目的类型，例如作为“文件夹”或“文档文件”。

```
folder "Smith Project"
folder "Smith Project" of folder "Documents"
folder "Smith Project" of folder "Documents" of ¬
 folder <name of your home directory>
folder "Smith Project" of folder "Documents" of ¬
 folder <name of your home directory> of ¬
 folder "Users" of disk "Macintosh HD"
```

您现在已经构建了对位于主目录的Documents文件夹中的Finder项“Smith Project”的对象引用。

对Finder项的对象引用有时可能很长。

为了缩短我们的示例引用，并使其更通用和更易于编写，
我们可以选择使用本章前面提到的特殊Finder术语“home”替换与您的Home目录及其父容器相关的引用部分：

```
folder "Smith Project" of folder "Documents" of home
```

## 综合应用

指定 finder 跳转到指定文件夹(前期是这个文件夹在指定位置确实存在)

```
tell application "Finder" to set the target of ¬
 the front Finder window to folder "Smith Project" of ¬
 folder "Documents" of home
```

# Toobar 属性

在Mac OSX中，Finder窗口经过重新设计，功能更强大，易于使用。

其中一个新窗口功能是位于Finder窗口顶部的工具栏区域。此区域包含工具栏选项表中提供的显示，导航和操作工具，当您从Finder的“查看”菜单中选择“自定义工具栏...”时出现该工具栏。

Mac OSX版本10.3中引入的工具栏可见属性的值为true或false，表示工具栏是否在目标Finder窗口中可见。

如果值为true，则工具栏可见。如果值为false，则窗口显示时没有工具栏。

作为读/写属性，意味着可以访问和编辑其值，可以更改工具栏可见属性的值以切换Finder窗口工具栏的显示。

试试这些脚本：

```
tell application "Finder" to  set toolbar visible of the front Finder window to false
```

会将 finder 变得很丑。

```
tell application "Finder" to  set toolbar visible of the front Finder window to true
```

# Status Bar 属性

在Mac OS X 10.4版中引入，状态栏可见属性确定Finder窗口是否显示状态栏。

与工具栏可见属性一样，此属性也具有布尔值，换句话说：true或false。

由于状态栏仅在未显示工具栏时可见，因此请更改上一个脚本以将工具栏可见属性设置为false：

```
tell application "Finder" to set toolbar visible of  Finder window 1 to false
tell application "Finder" to  set statusbar visible of the front Finder window to true
```

这样可以看到当前文件夹有多少文件，占用大小等状态信息。

# Sidebar 宽度属性

Mac OS X 10.4版中引入的另一个Finder窗口属性是侧边栏宽度属性。此属性的值是一个整数，表示边栏的宽度（以像素为单位），可以同时读取和更改。

试试这个将侧边栏宽度设置为240像素的脚本：

```
tell application "Finder" to set the sidebar width of  Finder window 1 to 240
```

把每一个窗口的侧边栏宽度都设置为 240

```
tell application "Finder" to set the sidebar width of  every Finder window  to 240
```

## 按照另一个宽度来

```
tell application "Finder" to set the sidebar width of ¬
 Finder window 1 to the sidebar width of Finder window 2
```

# 视图属性

我们将检查的下一个Finder窗口属性是当前视图属性。

此属性的值是用于显示Finder窗口内容的方法，可以是以下四种枚举之一：图标视图，列表视图，列视图和（Mac OS X v10.5中的新增功能）流视图。

> icon view, list view, flow view, or column view

## 读取

与目标和工具栏可见属性一样，可以同时读取和编辑此属性：

```
tell application "Finder" to ¬
	get the current view of the front Finder window
```

结果

```
column view
```

## 设置

将当前视图设置为 column view

```
tell application "Finder" to ¬
 set the current view of the front Finder window to column view
```




# 参考资料

[The Target Property](https://www.macosxautomation.com/applescript/firsttutorial/05.html)

* any list
{:toc}