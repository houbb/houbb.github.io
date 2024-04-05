---
layout: post
title: 绘图工具 GoJS 介绍 绘图 js
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



# 入门例子

这个严格说是一个 js 库，不算是绘制工具。

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>GoJS入门示例</title>
    <!-- 引入GoJS库 -->
    <script src="https://unpkg.com/gojs/release/go.js"></script>
    <style>
      /* 为图表定义样式 */
      #myDiagramDiv {
        width: 100%;
        height: 600px;
        border: 1px solid black;
      }
    </style>
</head>
<body>
<!-- 定义图表的容器 -->
<div id="myDiagramDiv"></div>

<script>
// 初始化GoJS图表的函数
function init() {
  // 获取GoJS库中的对象创建方法
  var $ = go.GraphObject.make;  // 创建图表实例并指定容器  
  var myDiagram =   $(go.Diagram, "myDiagramDiv",  // 指定图表容器的ID
      {
        // 工具提示关闭
        "isReadOnly": true,
        // 允许链接节点
        "allowLink": true,
        // 允许删除节点和链接
        "allowDelete": true,
        // 模型数据
        "model": $          (go.GraphLinksModel,  
        // 创建模型            
        {              
          // 节点数据              
          nodeDataArray: [                
            { key: 1, text: "节点1" },                
            { key: 2, text: "节点2" },                
            { key: 3, text: "节点3" },                
            { key: 4, text: "节点4" }              
          ],              
          // 链接数据              
          linkDataArray: [                
            { from: 1, to: 2 },                
            { from: 2, to: 3 },                
            { from: 3, to: 4 }             
          ]            
          })      
        });  
        // 启动图表，渲染视图  
        myDiagram.start();
}

// 页面加载完成后初始化图表
window.onload = init;
</script>    

</body>
</html>       
```

这个示例创建了一个包含四个节点和三条链接的基本图表。每个节点都有一个标签显示节点的文本。链接根据`nodeDataArray`和`linkDataArray`中的数据自动创建。要运行这个示例，你需要将代码保存为一个`.html`文件，并在支持JavaScript的Web浏览器中打开它。GoJS库是通过CDN引入的，这意味着你不需要下载库文件，只需在HTML文件中添加一个`<script>`标签即可。这个例子仅仅是GoJS功能的冰山一角。GoJS还支持自定义节点和链接的样式、交互式模板、复杂的布局算法等高级功能。你可以通过访问GoJS的官方文档和示例来进一步学习和探索。

# GoJS图表组件简介

GoJS是一个JavaScript库，可以轻松在现代Web浏览器中创建交互式图表。GoJS支持图形模板和将图形对象属性绑定到模型数据。

您只需要保存和恢复模型，该模型由包含应用程序所需任何属性的简单JavaScript对象组成。

许多预定义的工具和命令实现了大多数图表所需的标准行为。

外观和行为的自定义主要是设置属性的问题。

# 一个简单的GoJS图表

以下代码定义了一个节点模板和模型数据，它产生了一个包含少量节点和链接的小图表。

```js
// 节点模板描述了每个节点应该如何构建
  diagram.nodeTemplate =
   new go.Node("Auto")  // 形状将围绕TextBlock
    .add(new go.Shape("RoundedRectangle")
      // Shape.fill绑定到Node.data.color
      .bind("fill", "color"))
    .add(new go.TextBlock({ margin: 8}) // 指定一个边距，在文本周围增加一些空间
      // TextBlock.text绑定到Node.data.key
      .bind("text", "key"));

  // 模型只包含描述图表的基本信息
  diagram.model = new go.GraphLinksModel(
  [
    // 一个JavaScript数组，每个节点一个JavaScript对象；
    // "color"属性是专门为这个应用程序添加的
    { key: "Alpha", color: "lightblue" },
    { key: "Beta", color: "orange" },
    { key: "Gamma", color: "lightgreen" },
    { key: "Delta", color: "pink" }
  ],
  [
    // 一个JavaScript数组，每个链接一个JavaScript对象
    { from: "Alpha", to: "Beta" },
    { from: "Alpha", to: "Gamma" },
    { from: "Beta", to: "Beta" },
    { from: "Gamma", to: "Delta" },
    { from: "Delta", to: "Alpha" }
  ]);

  // 启用Ctrl-Z撤销和Ctrl-Y重做
  diagram.undoManager.isEnabled = true;
```
  


您可以以多种方式与此图表交互：

您可以通过单击它来选择一个部分。选定的节点会用一个蓝色的矩形边框高亮显示。
  
  选定的链接会用跟随链接路径的蓝色线高亮显示。
  可以一次选择多个部分。在单击时按住Shift键以添加到选择中。在单击时按住Control键以切换该部分是否被选中。

  另一种多选的方法是在背景上（不是在部分上）鼠标按下一个点，等待一会儿，然后拖动一个框。当鼠标松开时框内的部分组成被选中。Shift和Control修饰键也可以在这时使用。
  Ctrl-A选择图表中的所有部分。

  通过选择一个或多个节点并拖动它们来移动它们。
  复制选定的部分可以使用复制/粘贴（Ctrl-C/Ctrl-V）或使用Ctrl-鼠标拖动。
  使用Delete键删除选定的部分。
  如果滚动条可见，或者整个部分集合小于图表的可视区域（"视口"），您可以在背景上（不是在部分上）鼠标按下并拖动来平移图表，如果您不等待。
  使用鼠标滚轮上下滚动，Shift-鼠标滚轮左右滚动。Ctrl-鼠标滚轮放大和缩小。
  您还可以在触摸屏设备上使用手指进行平移、捏合缩放、选择、复制、移动、删除、撤销和重做。大多数可以从键盘调用的命令都可以通过按下手指并保持不动一会儿以获取的默认上下文菜单调用。

  文档中所有示例的独特之处在于它们都是"活的"——没有屏幕截图！它们是由显示的源代码实现的实际图表。您可以与它们交互——有些甚至显示动画。

  如果您想查看更多GoJS能做什么的例子，请查看GoJS示例目录。
  
  为了更方便地搜索JavaScript代码和文档或通过修改示例进行实验，您可以以各种方式安装GoJS工具包：

  从下载页面下载ZIP文件。https://gojs.net/latest/download.html

  从GitHub上的GoJS下载我们。https://github.com/NorthwoodsSoftware/GoJS

  使用 `npm install gojs` 安装GoJS。

# GoJS概念

  图表由部分组成：可以通过链接相互连接的节点，并且可以组合到组中。所有这些部分都聚集在层中，并由布局排列。

  每个图表都有一个模型，它保存并解释您的应用程序数据，以确定节点之间的链接关系和组成员关系。大多数部分都绑定到您的应用程序数据。图表自动为模型的Model.nodeDataArray中的每个数据项创建一个节点或组，以及为模型的GraphLinksModel.linkDataArray中的每个数据项创建一个链接。您可以为每个数据对象添加所需的任何属性，但每种模型类型只期望几个属性。

  每个节点或链接通常由模板定义，该模板声明其外观和行为。每个模板由GraphObjects面板组成，例如TextBlocks或Shapes。所有部分都有默认模板，但几乎所有应用程序都会指定自定义模板以实现所需的外观和行为。GraphObject属性绑定到模型数据属性使每个节点或链接针对数据唯一。

  节点可以手动（交互式或程序性地）定位，也可以由Diagram.layout和每个Group.layout自动排列。节点的位置要么是通过它们的左上角点（GraphObject.position）确定，要么是通过节点中程序员定义的点（Part.location和Part.locationSpot）确定。

  工具处理鼠标和键盘事件。每个图表都有多个工具，执行交互任务，例如选择部分或拖动它们或在两个节点之间绘制新链接。ToolManager根据鼠标事件和当前情况决定哪个工具应该运行。

  每个图表还有一个CommandHandler，实现了各种命令，例如删除或复制。CommandHandler解释键盘事件，例如当ToolManager运行时的control-Z。

  图表提供了滚动图表部分和放大或缩小的能力。图表还包含所有层，这些层依次包含所有部分（节点和链接）。部分又由可能是嵌套的文本、形状和图像面板组成。这些JavaScript对象在内存中的层次结构形成了图表可能绘制的所有内容的“视觉树”。

  概览类允许用户查看整个模型并控制图表显示模型的哪一部分。调色板类包含用户可以拖放到图表中的部分。

  您可以在图表中选择一个或多个部分。模板实现可能会在选中时更改节点或链接的外观。图表还可能添加附加物以指示选择并支持工具，例如调整节点大小或重新连接链接。附加物也是实现工具提示和上下文菜单的方式。

  所有对图表、GraphObject、模型或模型数据状态的程序更改都应在单个事务中执行，每次用户操作一次，以确保更新正确进行并支持撤销/重做。所有预定义的工具和命令都执行事务，因此如果启用了UndoManager，每个用户操作都会自动撤销。图表上的DiagramEvents以及图表和GraphObjects上的事件处理程序都有文档记录，无论它们是在事务中引发的还是您需要进行事务处理以更改模型或图表。

# 创建图表

  GoJS不依赖于任何JavaScript库或框架，因此您应该能够在任何环境中使用它。但是它确实需要环境支持现代HTML和JavaScript。

## 加载GoJS

  在您可以执行任何JavaScript代码来构建图表之前，您需要加载GoJS库。当您包含库时，"go" JavaScript对象将保存所有GoJS类型。在开发过程中，我们建议您加载"go-debug.js"而不是"go.js"，以进行额外的运行时错误检查和调试能力。

  我们建议您声明您的Web页面支持现代HTML：

```html
  <!DOCTYPE html>  <!-- 声明标准模式。 -->
  <html>
    <head>
      ...
      <!-- 包含GoJS库。 -->
      <script src="go-debug.js"></script>
```

  如果您正在使用RequireJS，GoJS支持UMD模块定义。
  
  此外，扩展类的模块化版本现在可在../extensionsTS/中获得，其中扩展类已翻译成TypeScript并编译成.js文件。
  
  将每个扩展文件复制到您的项目中，并更新其require语句，以便所有代码加载相同的GoJS库，并且只加载一次。

  在ES6（ECMAScript 2015）或TypeScript代码中，只需导入go.js库：

```js
import * as go from "./path/to/gojs/release/go";
```
  
  或者，根据您的npm环境：
  
  ```js
  import * as go from "gojs";
  ```  

  如果您想使用ES6模块，请使用../release/目录中的go-module.js。扩展类也可作为ES6模块在../extensionsJSM/目录中获得。
  
  再次，请将文件复制到您的项目中，以便您可以调整import语句以获得与代码其余部分导入的相同的GoJS库。


```js
import * as go from "./path/to/gojs/release/go-module.js";
import { DoubleTreeLayout } from "./path/to/gojs/extensionsJSM/DoubleTreeLayout.js";
```
  
## 在Div元素中托管GoJS

  每个图表必须由HTML Div元素托管。GoJS将管理该Div元素的内容，但您可以像任何HTML元素一样对其进行定位、大小和样式设置。
  
  图表将向该Div元素添加一个Canvas元素，图表将在其中进行绘制——这是用户实际看到的。Canvas元素自动调整大小以与Div元素具有相同的大小。

```html
<body>
    ...
    <!-- 对于图表的DIV需要明确的大小，否则我们什么也看不到。
    在这种情况下，我们还添加了一个边框以帮助看到边缘。 -->
    <div id="myDiagramDiv" style="border: solid 1px blue; width:400px; height:150px"></div>
```

  然后您可以使用对该Div元素的引用在JavaScript 中创建图表。通过构建纯JavaScript对象并将它们添加到图表的模型中来构建图表。
  
  请注意，在JavaScript代码中对GoJS类型（如Diagram）的所有引用都以"go."为前缀。

```js
<!-- 使用JavaScript在DIV元素中创建图表。 -->
  <!-- "go"对象是包含所有GoJS类型的"命名空间"。 -->
  <script>
    var diagram = new go.Diagram("myDiagramDiv");
    diagram.model = new go.GraphLinksModel(
      [{ key: "Hello" },   // 两个节点数据，在数组中
        { key: "World!" }],
      [{ from: "Hello", to: "World!" }]  // 一个链接数据，在数组中
    );
  </script>
```
  
  这完成了您在上面看到的“Hello World!”实时图表的实现。

# 开发您的图表

  GoJS在出现问题时输出错误或警告消息。在使用GoJS开发时，请务必检查浏览器的开发控制台以获取信息。
  
  "go-debug.js"版本的库包含额外的类型检查和错误检查代码，应在开发期间使用。"go.js"版本的错误检查较少，但因此更快，应在使用生产环境中使用。

  您的JavaScript代码应仅使用API中记录的属性和方法。
  
  GoJS库是“压缩的”，所以如果您在调试器中查看GoJS类的实例，您会看到许多一个或两个字母的属性名。所有这些都是您不应使用的内部名称。目前，唯一一个字母的属性名是Point、Rect、Spot和LayoutVertex上的"x"和"y"。唯一的两个字母的属性名是InputEvent.up。否则，您不应尝试在任何GoJS定义的对象上使用任何一两个字母的属性名。

  不要修改GoJS类的原型。

  只使用API中记录的属性和方法。

  您还可以使用TypeScript以获得更好的“编译时”类型检查。GoJS的TypeScript定义文件命名为"go.d.ts"，位于与"go.js"和"go-debug.js"库相同的目录中。在某些编辑器中，访问定义文件还可以在编辑TypeScript代码时大大改进文档反馈。扩展类也已翻译成TypeScript，可在../extensionsJSM/中获得。将扩展定义复制到您的项目中，并确保它们导入与您的所有代码相同的GoJS库。

  要了解新功能和错误修复，请阅读更改日志。了解在下载页面获取最新版本。

  您可以看到您可以构建的各种类型的图表在GoJS示例中。

  在接下来的介绍页面中，我们讨论构建GoJS部件并将它们添加到图表中。


* any list
{:toc}