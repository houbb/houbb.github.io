---
layout: post
title: Mac Automation-05-Position
date: 2018-12-01 11:35:23 +0800
categories: [Mac]
tags: [mac, auto, sh]
published: true
excerpt: Mac Automation 位置
---

# 位置属性

position 属性的值指示Finder窗口在桌面上的放置位置。

其值显示为两个数字的列表，描述Finder窗口左上角相对于桌面显示左上角的位置。可以读取和编辑position属性的值。

## 获取位置

从脚本窗口中删除上一个脚本，然后输入，编译并运行以下脚本：

```
tell application "Finder" to get the position of the front Finder window
```

结果：

```
{3, 97}
```

## 设置属性

在AppleScript中，列表用大括号括起来，每个列表项用逗号分隔。列表以开括号“{”字符开头，以紧密括号“}”字符结尾。 AppleScript列表可以包含任何类型的信息，例如文本字符串，数字，引用或数据类型的任意组合。

在位置列表中，第一个列表项是描述从桌面显示的左侧以像素为单位的水平距离的数字。第二个列表项是一个数字，用于描述距桌面显示顶部的垂直距离（以像素为单位）。这两个数字一起描述了窗口左上角开始的屏幕上的特定点。

让我们更改前Finder窗口的position属性的值，以移动靠近屏幕左上角的窗口。

从脚本窗口中删除上一个脚本，然后输入，检查并运行以下脚本：

```
tell application "Finder" to set the position of the front Finder window to {94, 134}
```

则 finder 窗口则会按照我们设置的位置重新布置。

## 垂直偏移 Exception

与大多数其他可编写脚本的应用程序不同，它使用从屏幕顶部到窗口顶部的距离来确定其垂直位置，Finder使用从屏幕顶部到窗口标题栏下方的距离，从而添加标题栏的高度，一个额外的22像素，到测量。无论Finder窗口是否显示其工具栏，这都适用。此例外仅适用于Finder应用程序。

在下图中，两个Finder窗口的垂直偏移量为44，其中包括桌面菜单栏高度的22个像素加上Finder窗口标题栏高度的22个像素，总垂直偏移量为44像素。如图所示，两个窗口的顶部垂直位于相同的位置，紧邻菜单栏的底部。



# Bounds 属性

如果您发现自己总是调整窗口大小，则可能会使用bounds属性编写许多脚本。

bounds属性的值描述了目标窗口的大小和位置。

这是通过指定两个点来完成的：窗口的左上角和窗口的右下角。这两个坐标组合成一个四项目列表，用于勾勒出窗口的矩形形状。

与position属性一样，可以读取和编辑bounds属性的值。

首先，让我们使用这个脚本获取最前面窗口的边界：

```
tell application "Finder" to get the bounds of the front window
```

返回结果

```
{177, 205, 947, 641}
```

## 设置属性

```
tell application "Finder" to set the bounds of the front Finder window to {24, 96, 524, 396}
```


## 获取卓淼的尺寸

```
tell application "Finder" to get the bounds of the window of the desktop
```



# 参考资料

[位置属性](https://www.macosxautomation.com/applescript/firsttutorial/10.html)



* any list
{:toc}