---
layout: post
title: Mac Automation-02-Properties and Values
date: 2018-12-01 11:35:23 +0800
categories: [Mac]
tags: [mac, auto, sh]
published: true
excerpt: Mac Automation Properties 和 Values 
---

# 属性和值

磁盘，文件，文件夹，别名文件，文档文件，应用程序文件，剪辑，字体手提箱，软件包，Internet位置文件，应用程序文件，窗口和Finder窗口都是属于Finder应用程序的对象或“元素”。
它们是Finder应用程序在组织和显示信息时使用的项目。

这些项目中的每一项都具有定义或描述特定项目的属性。

其中一些属性对于每个项目都是唯一的，其中一些属性由所有Finder项目共享。

例如，虽然Internet位置文件或“链接”是唯一具有描述Internet上位置的属性的Finder元素，但它仍然共享所有Finder元素共有的一些属性，例如其图标大小或其在文件夹中的位置窗口或桌面上。与其他Finder元素（如文件夹或文档文件）一样，链接文件具有name属性，其值为带有图标的文本，可由计算机用户编辑。

记住脚本化对象的一个​​重要规则是：

> 每个脚本化应用程序都包含具有属性的元素或对象。这些属性具有可以读取或操作的值。

此规则也适用于Finder应用程序和所有可编写脚本的应用程序。 

Finder应用程序的所有元素都具有属性，例如其名称，大小和位置。所有这些属性都有值，其中一些可以编辑，一些只能读取。

# Think Big Start Small(伟大始于渺小)

您对AppleScript的探索是学习AppleScript语言的基本原理以及如何在编写脚本时应用它们。

无论脚本有多复杂，脚本中应用的基本原理都保持不变。

在编写诸如Finder窗口之类的公共对象的脚本中学到的经验教训属于所有可编写脚本的对象和应用程序，并且可以用于以后创建更复杂和功能更强大的自动化工具。

您将通过检查Finder窗口的属性开始成为Scripter的过程，并学习如何使用脚本操作它们。

# 脚本编辑器

由于本教程非常“实用”，我们将立即编写脚本。要编写脚本，您将使用系统中安装的脚本编辑器应用程序。

您可以在计算机主硬盘驱动器上Applications文件夹中的AppleScript文件夹中找到此应用程序。

立即导航到此文件夹，然后双击“脚本编辑器”图标以启动该应用程序。

## hello world

您将通过以“tell statements”的形式编写一系列简单的脚本命令来开始学习AppleScript的过程。tell语句是以动词：tell开头的单行脚本。此动词用于在特定应用程序或可编写脚本的对象上引导脚本操作。 

tell语句由两部分组成：

1. 对要编写脚本的对象的引用，以及要执行的操作。

2. 使用这种语法格式或语法，我们可以编写脚本来指示Finder执行我们想要的任何操作。

这是我们的第一个脚本：

```
tell application "Finder" to close every window
```

在脚本编辑器脚本窗口的顶部窗格中完全按照显示输入此脚本（确保用直引号括起单词“Finder”）。单击脚本窗口上的“编译”按钮以确认它已正确写入并准备要使用的脚本。

接下来，单击“运行”按钮以播放脚本。操作系统将读取脚本并将相应的命令发送到Finder应用程序，然后按照说明关闭所有打开的窗口。

恭喜，您已经编写并运行了第一个AppleScript脚本！

请注意，“Finder”一词用脚本中的引号括起来。始终在脚本中引用名称和文本数据。这样做是为了向脚本编辑器指示引用的材料是文本数据，并且在编译脚本以准备执行时不被视为命令或指令。

从脚本窗口中删除上一个脚本，然后输入，编译并运行以下脚本：

```
tell application "Finder" to open the startup disk
```

现在，桌面上将出现一个新的Finder窗口，显示启动盘的内容。我们将在检查Finder窗口的属性时使用这个新打开的窗口。

## Finder

Finder窗口与Finder应用程序使用的其他窗口不同，它们显示文件夹的内容，可能包含工具栏和侧边栏。

本章的其余脚本示例在引用Finder窗口时将使用术语Finder窗口而不是通用术语窗口。

# 参考资料

[The First Step](https://www.macosxautomation.com/applescript/firsttutorial/index.html)

* any list
{:toc}