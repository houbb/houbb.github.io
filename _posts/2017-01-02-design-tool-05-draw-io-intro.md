---
layout: post
title: 绘图工具 draw.io / diagrams.net 免费在线图表编辑器
date:  2017-01-02 00:19:56 +0800
categories: [Design]
tags: [design, tool]
published: true 
---

# 拓展阅读

[常见免费开源绘图工具](https://houbb.github.io/2017/01/01/design-tool-01-overview)

[OmniGraffle 创建精确、美观图形的工具](https://houbb.github.io/2017/01/01/design-tool-02-omniGraffle-intro)

[UML-架构图入门介绍 starUML](https://houbb.github.io/2017/01/01/design-tool-03-uml-intro)

[UML 绘制工具 starUML 入门介绍](https://houbb.github.io/2017/01/01/design-tool-04-staruml-intro)

[PlantUML 是绘制 uml 的一个开源项目](https://houbb.github.io/2017/01/01/design-tool-04-uml-plantuml)

[UML 等常见图绘制工具](https://houbb.github.io/2017/01/01/design-tool-04-uml-tools)

[绘图工具 draw.io / diagrams.net 免费在线图表编辑器](https://houbb.github.io/2017/01/01/design-tool-05-draw-io-intro)

[绘图工具 excalidraw 介绍](https://houbb.github.io/2017/01/01/design-tool-06-excalidraw-intro)

[绘图工具 GoJS 介绍 绘图 js](https://houbb.github.io/2017/01/01/design-tool-07-go-js-intro)

[原型设计工具介绍-01-moqups 介绍](https://houbb.github.io/2017/01/01/design-tool-ui-design-01-moqups)

[常见原型设计工具介绍](https://houbb.github.io/2017/01/01/design-tool-ui-design)



# draw.io

draw.io（现在被称为 diagrams.net）是一个流行的免费在线图表编辑器，它允许用户创建和共享各种类型的图表和图形。

这个工具提供了一个直观的界面和丰富的功能，使得用户能够轻松地设计出专业级别的图表，包括流程图、UML图、网络图、组织结构图、思维导图等。

以下是draw.io的一些主要特点和功能的详细介绍：

1. **用户界面**：draw.io拥有一个简洁且直观的用户界面，使得即使是初学者也能快速上手。它提供了一个绘图区域，用户可以在其中拖放各种形状和对象来构建图表。

2. **图表类型**：draw.io支持多种图表类型，包括但不限于流程图、UML图（用例图、类图、序列图、状态图、活动图等）、网络拓扑图、ER图、组织结构图和思维导图等。

3. **模板和样例**：draw.io提供了一系列的模板和样例图表，用户可以从中选择一个开始创建自己的图表，或者使用它们作为灵感来源。

4. **自定义形状**：除了内置的标准形状，draw.io还允许用户创建和保存自定义形状，以便在不同的图表中重复使用。

5. **协作功能**：draw.io支持实时协作，多个用户可以同时编辑同一张图表，这使得团队合作变得更加高效。

6. **云存储和分享**：draw.io允许用户将图表保存到云端，从而可以在任何设备上访问和编辑它们。同时，用户还可以通过链接与他人共享图表。

7. **导出选项**：用户可以将图表导出为多种格式，包括PNG、JPEG、SVG、PDF和XML等，以便于在其他应用程序中使用或打印。

8. **集成和扩展**：draw.io可以集成到许多流行的在线服务平台中，如Google Drive、OneDrive和Confluence等。此外，它还提供了API和SDK，允许开发者创建自定义插件和扩展。

9. **跨平台兼容性**：draw.io可以在所有主流的浏览器中运行，包括Chrome、Firefox、Safari和Edge等，不需要安装任何额外的软件。

10. **社区支持**：draw.io拥有一个活跃的在线社区，用户可以在社区中寻求帮助、分享技巧和图表，以及获取最新的更新和改进。

总的来说，draw.io是一个功能强大且易于使用的图表工具，适合各种用户，无论是学生、教师、设计师还是工程师，都可以利用它来提高工作效率和创造力。

![draw.io](https://www.drawio.com/assets/svg/home-dia2.svg)

# 在线体验

官方：www.diagrams.net

可以直接在线体验：[https://app.diagrams.net/](https://app.diagrams.net/)

无需注册，直接使用。

# draw.io 的实现原理

draw.io（现更名为diagrams.net）是一个基于Web的图表编辑器，其实现原理主要依赖于以下几个关键技术和概念：

1. **客户端渲染**：draw.io在用户的浏览器中进行大部分的图表渲染工作。这意味着所有的图形和布局计算都在用户的设备上进行，而不是在服务器上。这种方式减少了服务器的负载，并允许用户在没有网络连接的情况下编辑图表。

2. **HTML5 Canvas**：draw.io使用HTML5的Canvas元素来渲染图表。Canvas是一个强大的绘图工具，它允许开发者通过JavaScript API在网页上绘制图形。draw.io利用Canvas的高性能特性来渲染复杂的图表和图形。

3. **SVG (Scalable Vector Graphics)**：虽然draw.io主要使用Canvas进行渲染，但它也支持SVG格式的导入和导出。SVG是一种基于XML的矢量图形格式，它可以在不失真的情况下无限缩放，并且可以通过CSS和JavaScript进行操作。

4. **JavaScript框架和库**：draw.io使用多种JavaScript框架和库来实现其丰富的功能。例如，它可能使用jQuery来处理DOM操作，使用Lodash来进行函数式编程，以及使用其他专门的库来处理图形和图表的特定方面。

5. **客户端存储**：draw.io允许用户在本地存储他们的图表。这通常是通过浏览器的本地存储功能实现的，如LocalStorage或IndexedDB。这样，用户可以在没有网络连接时继续工作，并在连接恢复时同步更改。

6. **云服务集成**：draw.io提供了与云服务的集成，如Google Drive和Confluence，允许用户将他们的图表保存到云端。这些集成通常通过云服务提供的API实现，使得draw.io可以与这些服务无缝交互。

7. **自定义元素和插件**：draw.io支持用户创建自定义图形和模板，并且允许开发者编写自定义的插件来扩展draw.io的功能。这些自定义元素和插件通常使用JavaScript编写，并在draw.io的环境中运行。

8. **响应式设计**：draw.io的界面设计为响应式，这意味着它可以适应不同大小的屏幕和设备。这是通过使用流体布局、可伸缩的图形元素和响应式导航菜单实现的。

9. **多用户协作**：draw.io支持实时协作编辑，这是通过在客户端之间同步图表的状态来实现的。当一个用户对图表进行更改时，这些更改会被发送到服务器，并广播给所有正在查看和编辑该图表的其他用户。

通过这些技术和概念的结合，draw.io能够提供一个功能丰富、易于使用且响应迅速的在线图表编辑体验。




* any list
{:toc}