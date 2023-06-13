---
layout: post
title: javafx-03-javafx 与 idea + swing
date:  2017-10-9 09:08:34 +0800
categories: [Java]
tags: [javafx]
published: false
---


# idea 开发工具界面是用 javafx 还是 swing 实现的？

IntelliJ IDEA开发工具的界面是使用Swing实现的，而不是JavaFX。Swing是Java平台的传统用户界面（UI）工具包，它提供了一组丰富的组件和布局管理器，用于构建桌面应用程序的图形界面。

虽然JavaFX是Java的新一代UI框架，但IntelliJ IDEA在其早期版本中选择了Swing作为UI工具包。Swing已经被广泛使用并具有丰富的功能，因此IntelliJ IDEA团队可能认为Swing更适合他们的需求。

值得注意的是，虽然IntelliJ IDEA的主界面是使用Swing构建的，但它也可以与JavaFX和其他UI框架集成，以支持其他功能和插件。

# idea 是如何实现页面的设置的？swing 样式设置不是很麻烦吗

在IntelliJ IDEA中，页面设置是通过使用Swing的UI组件和布局管理器来实现的。Swing提供了一系列的UI组件，如按钮、文本框、标签等，以及布局管理器，如流式布局、边界布局等，用于在界面上放置和排列这些组件。

虽然在传统的Swing开发中，手动设置Swing组件的样式可能会比较繁琐，但是IntelliJ IDEA通过其自身的UI设计和开发工具集成简化了这个过程。

IntelliJ IDEA提供了可视化的界面设计器，称为GUI Designer（或称为Form Designer），它允许开发者以可视化方式创建和编辑Swing界面。使用GUI Designer，你可以拖放和调整UI组件的位置和大小，设置它们的属性和样式，甚至编写与组件相关的事件处理代码，而不需要手动编写大量的Swing代码。

此外，IntelliJ IDEA还提供了丰富的UI主题和样式，你可以通过设置来自定义整个应用程序的外观。IDEA自带的Darcula主题是其中一个常用的选择，它提供了一种黑暗风格的外观。

总而言之，尽管Swing的样式设置可能相对繁琐，但通过IntelliJ IDEA提供的GUI Designer和样式主题支持，可以使界面设计和样式设置变得更加便捷和高效。

* any list
{:toc}