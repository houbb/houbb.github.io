---
layout: post
title:  从零开始构建现代计算机-01-序言
date:  2022-09-03 21:22:02 +0800
categories: [CS]
tags: [cs, basic, sh]
published: true
---

# 序言

真正的发现之旅不在于去新的地方，而在于拥有一双新的眼晴。-Marcel Proust(1871~1922)，作家

本书带你路上发现之旅。

你將学到三种知识：

一、计鲜机如何工作：

二、如何将复茶问题分解为易于管现的模块：

三、如何开发大规模硬件和软件系统。

整个学习过程是实践的过程，你将会从零开始创建一个完整的、可工作的计算机系统。

在进行实战的同时，你也会学到一些远比计算机本身更加亚要的知识。

心理学家CarlRogers曾说过：“唯一能影显薯影响行为的学习就是自我发现或自我适应一一真理汲取自经历体验。”

本章为你勾勒出本书中的发现、真理和经历体验。


# 上面的世界

如果你学习过菜门程序设计课程，在刚开始学习的时候可能週到了类似于如下程序的内容。

该程序是用Jack（一-门简单的、具有典型的基于对象的高级语言语法）编写的。

```c
class Main {

    function void main() {
        do Output.printString("Hello World");
        do Output.println();
        return;
    }

}
```

介绍：Hello,WorldBelow像HelloWorld这样的小程序表面上看起来十分简单。

你可曾想过如何才能在计算机中运行这个程序呢？

让我们米超示其中的原委．对于初学者而言，程序只是一堆存储在文本文件中的字符而己。

因此我们必须要做的第一件事情就是对该文本进行语法分析，揭示其语义，然后用茶种计算机能理解的低级裕言染重新表达程序。

这个調详过程（聊编译，compilation）产生的结果就是生成另外一个包含机器代码的文本文件。

当然，机器语言也是一种拍象，是一组计算机能理解的二进制代码。

为了将该抽象形式具体化，就必须由菜种硬件体系(hartarearchitecture）來实现。

这个硬件体系叉是由芯片組（chipset〉——存器、内存单元、ALU等—米实现的，其中轩个硬件没各都是由许多基本逻辑门(logicgates）樂成构建出米的。而这些门又是由诸如Nand和Nor这样的原始门(primiticegats）构建而成的。

当然，每个原始门又是由著千个转换设备(svitchingderices）组成，这些设备一般用品体管实现。

每个晶体管又是由⋯⋯好了，我们不再继线深究下去，因为那己经到达了汁算机科学饭域的尽头，物理领域的开瑞。

你可能会想：“在我的计算机上，编译和运行程序是相当容易的——我只要点一些按紐或编写一些命令！”

确突，现代计算机系统就像一座巨大的冰山，大多数人只看到了最项端的一角。大多数人学界的计算系统知识也是想路和浅显的。

如果你希望能够探紫到底层去，那你反而足幸运的！在那个精影的世界，其有计算机科学饭城里面的一些最关阳的
东西。

对底层世界的深刻理解也是区分普通程序员和高级开发者（既能开发应用程序，也能开发复杂的殛件和软件系统的人）的标准。

理解（我们指的是深之入骨的透彻理解）这些系统工作原理和方式的**最好方法就是从头开始构建完整的汁算机系统**。

# 抽象 Abstractions

你可能会觉得奇怪，如何能多仅利用一些基本的逻辑门来从零开始去构建完经的计算机系统。

这一定是极为复杂的任务！解决这种复杂性的办法是，将整个项日划分为许多个模块（modales)，然后在本书的每一發里单独处理其中一个模块。

你可能还会觉得奇怪，如何可能单独地描述和村建这些校块呢？

它们显然都是相互关联的呀！正如我们在书中將下面的世界要展示的，好的楼块化设计意味者：可以单独处理每个模块，而完全不管系统的其他部分。

实际上，你甚至可以按照任意顾序来构建这些模缺！


这种良好的设计方式得益于人类独一无二的天赋：我们所拥有的建立和使用抽象概念(abstractions）的能力，一般所调抽象概念，是作为表达思想的方式，将事物本质性的东西从思维上独立出来，以求用概括的方式来把握事物。

而在计算机科学领城里，我们將抽象的概念定义得非常具体，认为它是关于“事物婴做什么”的概念，而不用考志“如何來做"，这种功能性定义必须包含足够的信息以便使用该事物能够提供的服务。

事物在实现中的所有内容（包括技巧、内部信息、精妙之处等)，都对要使用该事物的客户隐藏起来，因为这些与客户并没有关系，对于所要进行的专业实战而言，我们就需要建立、使用非实
现这种抽象，硬件和次件开发者都会定义抽象（也称为“接口”，interfaces)，然后进行实现或阳给其他人来实现。

抽象通常是分层构建（一层构建在另一层之上)，从而形成了越来越高层级的抽象能力。

设计庭好的抽象是一门实號艺术，学攊这门艺术的最好方法就是学习很多例子。

因此，木书林于“先抽象香实现”的范式来进行啊迷。

每一童都介绍了一个关键的硬件或软件抽象，以及实际实现该抽象的实践项目。

抽象的楼块化特性使得每一章的内容各自独立，谈者只需关心两件事情：理解抽象，然后利用抽象服务和底层构建模块来实现它。

在本书的发现之旅的途中前进时，街次你回头看，都会欣喜地发现计蜂机系统正在你的努力之下遂浙成形。

# 下面的世界 The World Below

计笲系统设计中蕴含的多层（multi-tier）抽象结构可以用自顶向下(top-dorom）的形式米描述，以此来展示商級抽象如何被简化或表示成较简单抽象。

同样的结构也可以用自下而上(botlom-up〉的形式来描述，以比展示底层抽象如何构建更复杂的抽象。

本书采用后一种方式进行阐述：从最恭本的元業（原始逻排门）开始，然后一直向上:层进发，意到最后构建完整的计算机系统。如果说构建这样的系统好比業登珠秘朗玛峰，那么让计算机运行用菜种高級语言编写的程序就好比是在峰顶插上一只族子。

由于我们准备从山底开始逐浙向上幣登，因此我们先从反方向的角度来概览本书结构，首先从大家最熟悉的高級程序设计开始。

概览主要有三个部分，从最顶端开始，人们能好编写和运行商級程序（第9章和第12毫)。

然后开始探素通向硬件领城的道路，去领略將高級程序翻译成低級海言过程中的摄山曲径（第6、7、8、10、11章)。最后到达最底层，描还如何构建典型的硬件平台（第1至5章

# 高級语言的领地 High-Level-Language Land

我们的旅程中最帝级的抽象就是程序设计艺术，企业家和程序员们构想实际应用，然后程序员们縮写代码来实现这些构想。

他们的工作中有两个关從的工具，在他们者米是理所当然就具各了的：

1）所使用的高级语高：

2）支持高级语言的丰宮的服务程序本。

例如，數想语句 `do Output.printString("Hello World");` 这条代码调用了用于打印字符串的抽象服务，而该服务必须是在菜个地方己经被实現了才行。

继线深究不难发现，这个打印字符串服务通帶是由採作系统和标准语言程序库联合提供的。

那什么是标准语言程序库（standard language library)呢？

操作系统(OS,OperatingSystem）又是如何工作的呢？

这些问题会在第12章子以讨论。

第12章首先介绍一些与os服务相关的关键算法，然后利用这些算法米实现各种数学西数、字行串换作、肉存分配任务和输入/输出（V0）程序。

最后得到的就是用Jack语言總写的简单操作系统。

Jack是一门简单的基干对象(object-based〉的语言，仅用来说明现代编程话言（如Java和C#）的设计和实现中所然含的关键的软件工程思想。

第9章中详細介绍Jack语言，并说明如何构建Jack应用程序（比如小游戏)。

着你具有面向对象语言的编程经验，则马上就能编写Jack程序，并在本书第9章之前开发的计算机平台上观染其运行情况。

但是，第9章的目的不是让你成为Jack程序员，而是为后续章节中开发编译器和榮作系统作必要准备。

# 向下通往硬件领地之路 The Road Downto Hardware Land

任何程序在实际运行之前，首先必须技翻译成菜种目标计穿机平台的机器语言。

这个编译（compilation）过程十分复杂，于是被划分为若干个抽象层级，这些抽象层一般包含三种翻译器：

一是编译器，二是虚拟机，三是汇编编泽器。

我们会用5个章节的篇幅米介绍这三个内容。

我们将编译器(compriler）的任务从概念上分为两个阶段：语法分析(syntaxanalysis)和代码生成(codegeneration)。

首先在第一阶段，要对源文本进行分析，然后将其分组成有意义的语言结构，并将这些结构保存在称为“语法分析树（parsetree）”的数据结构中。

这种进行语法分析的任务，统称为语法分析（syntax analysis)，会在第10章中进行阀还。

这为第二阶段作好了准备。第11章闽达语法分析村如何技递归处理，以便生成用中间话音编写的程序。

Jack编译器生成的中间代码描述了在基于堆栈的虚拟机（VM）上的一系列通用的揉作步聚。

第7全8章介绍这种模到以及实現在其上的虚拟机。

由于VM的输出是一个大的汇编程序，因此必须将其进一步翻译成二进制代码。

编写汇编编译器是相对容易的任务，会在第6章中进行闸述。

# 硬件的領地 Hardware Land

现在我们己经从机器语言到机器本身，到达旅程中最具奥秘的终点，软件终于在此处与硬件会合。

Hack也就在这里进入到我们眼前的图景当中。Hack是一个通用计算机系统，力求在简单性和功能性之间取得平街。

利用第1至3章中介绍的芯片组和相关指导信息，我们可以在几个小时之内就构建好Hack体系结构。

同时，Hack也具有足够的通用特性，足以用来说明任何数字计算机设计中的关键保作原则和硬件元素。

第4帝介绍了Hack平台的机器语言，而计算机设计本身则在第5章中讨论。

利用与本书配套的基于软件的硬件仿宾器以及附录A中介绍的硬件描述语言(HDL,Hardware Deseription Language)，读者可以在自己的计算机上构建这个基于Hack平台的计算机以及
木书所提到的所有芯片和门电路。

所有开发出来的硬件模块都可以利用本书提供的测试脚本来进行测试（关于测试脚本语言可以参考附录B

由此构建而成的计算机是基于典型的设备的，比如CPU、RAM、ROM、模拟屏豬和健盘等組件，在第了章中简单地讨论时序選辑并构建计算机的寄存器（registers）利内存系统(memorysystems)。

在第2章中简单地介绍布尔运算，然后构建计算机的組合選我（最终完成算术逻報单元即ALU芯片的构建)。

在这些章节中涉及的所有花片都是基于一组菇本選辑门而构成，我们在第1華介绍并构建这些基本速辑门。

当然，抽象层级并不止干此。

基本运辑门是利用基于固态物理理论以及量子理论的技术，由晶体管构建而成的，事交上，正定在这里，自然世界（naturalwori）之抽象（由物理学家来研究和猫还）才演化成为人造世界(syntheticworia）之抽象（由计算机科学家构建和研究）的构建模块。

到这里我们就结束了整个旅程桃览——从蒸于对象的软件的最高层级一直下降到了构建硬件平台的砖瓦泥土。

这种典型的多层次系统的模块化结构不仅体现了一种功能强大的工程范式，也反映了人为推理中的中心敦条之一，这可以追潮到2500年前：我们所考店的不是目的、而是朝向目的的实现的东西。医生并不考應是否要使一个人健康，淡说家并不考店是否要去说服听众……他们是先碗定一个目的、然后来考感用什么手段和方式来达到目的。

如果有几种手段，他们考越的就是哪种手段最能实现目的、如果只有一科手段，他们考店的就是怎祥利用这一手段去达到到的，这一手段又需要通过哪种手段来获得。这样，他们就在所发现的东西中一直追湖到最初的东西……分析的终点也就是起点.(Aristotles,NicomacheanEthics,Bookm1,3,7112b)

本书的计划就是按照实现的顺序来展开用还。

首先是菜本選辑门的构建（第1章然后由下而上的构建组合芯片和时序芯片（第2至3章)，从典型的计算机体系架构（第4至§章）和软件层級（第6至8章)，一直讲到实现基于对象的浯言（第9章）的编译器〈第10至11章)，最终实现一个简单的茶作系统（第12章）。

希望读者己经对这芝任务有了基本概念，并渴望开始这段冒险之族．好的，段设你准备好了，让我们开始倒數：1，0，出发！

# 参考资料

《从零开始构建现代计算机》

* any list
{:toc}