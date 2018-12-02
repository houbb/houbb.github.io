---
layout: post
title: Mac Automation-03-name index 
date: 2018-12-01 11:35:23 +0800
categories: [Mac]
tags: [mac, auto, sh]
published: true
excerpt: Mac Automation 名字属性
---

# name 属性

万物皆有名字。

我们要检查的Finder窗口的第一个属性是它的name属性。

窗口名称是窗口标题栏中显示的窗口标题。对于Finder窗口，name属性的值是其内容在Finder窗口中显示的文件夹或磁盘的名称。

要检索窗口的name属性的值，我们将使用命令“get。”当我们想要从可编写脚本的元素或对象中提取信息或数据时，使用此动词。

从打开的脚本窗口中删除上一个脚本，然后输入，编译并运行以下脚本：

```
tell application "Finder" to get the name of front Finder window
```

可能会报错，说无法获得 finder。

我们打开一个即可，输出的结果是 mac 的用户名称。

- 比如获取 google 浏览的 title

```
tell application "Google Chrome" to get the title of front window
```

结果:

```
"AppleScript: Beginner's Tutorial"
```

## name 只读属性

对于Finder窗口，name属性是只读属性。它可用于引用Finder窗口，但其值不能通过脚本更改。 

Finder窗口的name属性值始终是显示其内容的文件夹或磁盘的名称。

从脚本窗口中删除上一个脚本，然后输入，编译并运行以下脚本。如果计算机上的不同，请务必将“Macintosh HD”替换为打开的Finder窗口的名称。

```
tell application "Finder" to close Finder window "Macintosh HD"
```

如前面的脚本所示，您可以使用name属性作为引用特定Finder窗口的方法。运行脚本时，将关闭名为“Macintosh HD”的Finder窗口。

之前的脚本是有效的，因为它是一个完全限定的tell语句，因为它既指向接收命令的对象，在这种情况下是打开的窗口，并指示要执行的所需操作，关闭窗口。所有tell语句都是以这种方式构造的。


# Index 属性

如果您正在编写将在多台计算机上使用的脚本，则使用name属性来引用Finder窗口并不总是找到特定窗口的最可靠方法。

两个窗口可能具有相同的名称。

引用打开的Finder窗口的另一种更通用的方法是通过其索引属性。

此只读属性的值是与打开的Finder窗口的堆叠顺序中窗口的图层位置对应的数字。在计算机上，没有两个窗口可以占用同一层。

一个窗口始终位于另一个窗口的顶部或前面。索引属性反映了这一事实。

## 初步使用

例如，前Finder窗口将始终具有索引值“1”，因为它是打开窗口堆栈中的第一个窗口，而最后一个Finder窗口将始终具有等于打开的Finder窗口数量的索引值。

让我们看看index属性如何用于引用Finder窗口。

首先，让我们使用这个脚本重新打开上一个窗口：

```
tell application "Finder" to open the startup disk
```

利用下面的脚本获取当前 finder 窗口的下标：

```
tell application "Finder" to get the index of Finder window "Macintosh HD"
```

结果是 `1`

## 再打开一个 finder

下面的命令，会让 finder 直接跳到当前用户目录下。

```
tell application "Finder" to open home
```

再次执行原来的命令：

```
tell application "Finder" to get the index of Finder window "Macintosh HD"
```

这次的执行结果为 `2`

## 获取不同层的名称

获取每一个窗口的名字：

```
tell application "Finder" to get the name of Finder Window 1
tell application "Finder" to get the name of Finder Window 2
```

## 描述性指数值

正如您在之前的脚本中看到的那样，AppleScript语言被设计为“类似于英语”，并且可以以对话方式编写。因此，也可以使用描述性术语和数值来描述索引属性的值。

例如，尝试以下两个脚本：

```
tell application "Finder" to  get the index of the first Finder window
tell application "Finder" to  get the index of the second Finder window
```

或者

```
tell application "Finder" to get the index of the 1st Finder window

tell application "Finder" to get the index of the 2nd Finder window
```

## 相对位置

除了识别以文本形式写入的索引值之外，AppleScript还将接受根据窗口相对于其他窗口的位置描述的索引值。

相对位置有时候很方便。

例如：

也可以使用关键词 `middle`

```
get the index of the front Finder window
 --> returns: 1
tell application "Finder" to  get the index of the back Finder window
 --> returns: 2
tell application "Finder" to  get the index of the last Finder window
 --> returns: 2
tell application "Finder" to get the index of the  Finder window before the last Finder window
 --> returns: 1
tell application "Finder" to get the index of the  Finder window after the front Finder window
 --> returns: 2
```

## 查找窗口索引参考

index属性的值可以使用任何先前的方法表示。

所有这些都是有效的，可以自由和互换使用。

以下是可以引用Finder窗口的方法的摘要：

```
by name:
Finder window "Documents"

by numeric index:
Finder window 1

by descriptive index:
the first Finder window
the second Finder window
the fifth Finder window
the 1st Finder window
the 23rd Finder window

by relative position index:
the front Finder window
the middle Finder window
the back Finder window
the last Finder window

by random index:
some Finder window
```

## 改变查找窗口的索引值

到目前为止，我们已经通过使用它们来引用特定的Finder窗口来检查名称和索引属性。 

name属性是一个只读属性，换句话说，它的值可以获取但不能更改。

但是，Finder窗口的index属性是一个可编辑的属性，这意味着它的值可以更改。

接下来，我们将更改打开的Finder窗口的index属性的值。

要更改属性的值，我们将在脚本中使用动词“set”。 Set是用于更改属性值的动词或命令。

从脚本窗口中删除上一个脚本，然后输入，编译并运行以下脚本：

```
tell application "Finder" to  set the index of the last Finder window to 1
```

显示主目录内容的Finder窗口现在再次成为前Finder窗口。

该脚本通过使用最后一个Finder窗口的index属性的值作为前Finder窗口的index属性的值来实现此目的。

> 注意：当您更改Finder窗口的索引属性的值时，您可以更改其后面的一些打开的Finder窗口的索引值。


# 参考资料

[The First Step](https://www.macosxautomation.com/applescript/firsttutorial/index.html)

* any list
{:toc}