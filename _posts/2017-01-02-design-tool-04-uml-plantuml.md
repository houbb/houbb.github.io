---
layout: post
title:  PlantUML 是绘制 uml 的一个开源项目
date:  2017-01-02 00:19:56 +0800
categories: [Design]
tags: [design, uml, tool]
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



# PlantUML

[PlantUML](http://plantuml.com/) 是绘制 uml 的一个开源项目.

支持快速绘制:

- 时序图

- 用例图

- 类图

- 活动图 (here is the legacy syntax)

- 组件图

- 状态图

- 对象图

- 部署图
 
- Timing diagram
 
同时还支持以下非UML图:

- Wireframe graphical interface

- 架构图

- Specification and Description Language (SDL)

- Ditaa diagram

- 甘特图
 
- Mathematic with AsciiMath or JLaTeXMath notation

# Example

- 原始文本

```
Bob->Alice : hello
```

- 效果

```
 ┌───┐          ┌─────┐
 │Bob│          │Alice│
 └─┬─┘          └──┬──┘
   │    hello      │   
   │──────────────>│   
 ┌─┴─┐          ┌──┴──┐
 │Bob│          │Alice│
 └───┘          └─────┘
```

# Integration

## Graphviz 安装

PlantUML 是依赖于 [Graphviz](http://www.graphviz.org/) 的
 
### MAC 安装

```
$   brew install graphviz
```

## Idea

[Idea PlantUML](https://blog.csdn.net/tterminator/article/details/78177619)

## VSCode

[VSCode PlantUML](https://blog.csdn.net/qq_15437667/article/details/70163125)

- Install PlantUML 插件

1. 直接安装插件

2. 编辑内容如下：

```uml
@startuml

Bob -> Alice : Hello, how are you
Alice -> Bob : Fine, thank you, and you?

@enduml
```

使用 <kbd>Alt</kbd>+<kbd>D</kbd> 直接开启预览

![2018-04-09-plantuml-vscode.png](https://raw.githubusercontent.com/houbb/resource/master/img/tools/uml/plantuml/2018-04-09-plantuml-vscode.png)

* any list
{:toc}

