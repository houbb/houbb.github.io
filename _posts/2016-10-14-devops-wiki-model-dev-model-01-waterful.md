---
layout: post
title: Devops-wiki-开发模型-01-瀑布模型/瀑布模式（Waterfall Model）
date:  2016-10-14 10:15:54 +0800
categories: [Devops]
tags: [devops, ci, wiki, sh]
published: true
---

# 拓展阅读

[Devops-01-devops 是什么？](https://houbb.github.io/2016/10/14/devops-01-overview)

[Devops-02-Jpom 简而轻的低侵入式在线构建、自动部署、日常运维、项目监控软件](https://houbb.github.io/2016/10/14/devops-02-jpom)

[代码质量管理 SonarQube-01-入门介绍](https://houbb.github.io/2016/10/14/devops-sonarqube-01-intro)

[项目管理平台-01-jira 入门介绍 缺陷跟踪管理系统，为针对缺陷管理、任务追踪和项目管理的商业性应用软件](https://houbb.github.io/2016/10/14/project-manage-jira-01-intro)

[项目管理平台-01-Phabricator 入门介绍 一套集成的强大工具，帮助公司构建更高质量的软件](https://houbb.github.io/2016/10/14/project-manage-phabricator-01-overview)

[持续集成平台 01 jenkins 入门介绍](https://houbb.github.io/2016/10/14/devops-jenkins-01-intro)

[持续集成平台 02 jenkins plugin 插件](https://houbb.github.io/2016/10/14/devops-jenkins-02-plugin)

# 瀑布模型

瀑布模型是一种将开发活动分解为线性顺序阶段的方法，这意味着每个阶段都依赖于前一个阶段的交付物，并且每个阶段对应于任务的专业化[1]。

这种方法典型地应用于某些工程设计领域。在软件开发中[1]，瀑布模型通常是较不具备迭代性和灵活性的开发方法，因为进度主要是单向流动（像瀑布一样向下）通过构思、启动、分析、设计、构建、测试、部署和维护等阶段[2]。

瀑布模型是软件开发中最早的系统开发生命周期（SDLC）方法[3]。

瀑布开发模型起源于制造业和建筑业，在这些高度结构化的物理环境中，设计变更会在开发过程的早期就变得非常昂贵。当它首次被采用于软件开发时，尚没有被公认的其他替代方案来应对基于知识的创造性工作[4]。

# 历史

描述在软件工程中使用这些阶段的首次已知报告由Herbert D. Benington于1956年6月29日在“数字计算机高级编程方法研讨会”（Symposium on Advanced Programming Methods for Digital Computers）上进行。

该报告讲述了为SAGE（半自动地面环境）系统开发软件的过程。1983年，Benington重新出版了他的论文，并在前言中解释了这些阶段是根据任务的专业化有目的地组织的，并指出该过程实际上并不是严格的自上而下进行，而是依赖于原型。

尽管论文中没有使用“瀑布”这一术语，但通常[7]引用的“瀑布模型”第一张正式详细的过程图，来自于Winston W. Royce于1970年的一篇文章。[8][9][10] 然而，他评论说，该模型存在重大缺陷，主要是测试只在过程结束时进行，他将其描述为“有风险且[容易]失败”。 

他的论文其余部分介绍了五个步骤，他认为这些步骤是必要的，以“消除与未修改的瀑布方法相关的大多数开发风险”。

Royce的五个附加步骤（其中包括在开发的各个阶段编写完整文档）未能广泛采用，但他认为有缺陷的过程图成为描述“瀑布”方法的起点。

“瀑布”一词的最早使用可能出现在Bell和Thayer的1976年论文中。

1985年，美国国防部在DOD-STD-2167标准中采纳了瀑布模型，用于与软件开发承包商合作。该标准提到软件开发的迭代[14]“是软件开发周期的顺序阶段”，并指出“承包商应实施一个包括以下六个阶段的软件开发周期：软件需求分析、初步设计、详细设计、编码和单元测试、集成和测试”。


# 模型  

尽管Royce从未推荐或描述瀑布模型，但他批评了严格遵循以下阶段的做法：

- **系统和软件需求**：在产品需求文档中捕获
- **分析**：生成模型、模式和业务规则
- **设计**：生成软件架构
- **编码**：软件的开发、验证和集成
- **测试**：系统地发现和调试缺陷
- **操作**：安装、迁移、支持和维护完整系统

因此，瀑布模型主张，只有在前一个阶段经过审查和验证之后，才应进入下一个阶段。

然而，各种修改过的瀑布模型（包括Royce的最终模型）可能对这一过程进行了轻微或重大变更。

这些变更包括在发现缺陷后返回上一周期，或者在下游阶段被认为不足时返回设计阶段。

# 支持论点  

在软件生产周期的早期投入时间可以减少后期阶段的成本。例如，早期阶段（如需求规范）发现的问题，修复成本比在后期阶段（例如测试阶段）发现同样的错误要便宜得多（修复成本可能低50到200倍）。

在实际应用中，瀑布方法通常导致项目计划在前两个阶段上投入20%到40%的时间，30%到40%的时间用于编码，其余时间则用于测试和实施。由于项目组织需要高度结构化，大多数中型和大型项目会包括一套详细的程序和控制措施，来规范项目中的每一个过程。

另一个支持瀑布模型的论点是它强调文档（如需求文档和设计文档）以及源代码。在设计和文档不够充分的其他方法中，如果团队成员在项目完成之前离开，知识可能会丧失，项目可能难以从这一损失中恢复。如果有完整的设计文档（这也是瀑布模型的目标之一），新加入的团队成员和团队应该可以通过阅读文档来熟悉项目。

瀑布模型提供了一种结构化的方法；模型本身通过离散的、易于理解和解释的阶段线性推进，因此非常容易理解。它还在开发过程中提供了易于识别的里程碑，通常被用作许多软件工程教材和课程中的开发模型的入门示例。

类似地，模拟在瀑布模型中也可以发挥重要作用。通过创建正在开发的系统的计算机化或数学模拟，团队可以在进入下一阶段之前深入了解系统的性能。模拟可以用于测试和完善设计，识别潜在的问题或瓶颈，并为系统的功能和性能做出明智的决策。

# 批评  

客户可能在看到可工作的软件之前并不完全了解需求，因此可能会在后期修改需求，导致重新设计、重新开发和重新测试，从而增加成本。

设计师在设计新的软件产品或功能时，可能未能预见到未来的困难，在这种情况下，相比于设计时没有考虑到新发现的约束、需求或问题，最初对设计进行修订可以提高效率。

组织可能试图通过聘请系统分析师来应对客户缺乏明确需求的情况，分析现有的手工系统并研究它们的功能及如何替代。然而，实际上，很难在系统分析和编程之间维持严格的分离，因为实现任何非平凡的系统通常会暴露出系统分析师未曾考虑到的问题和边缘案例。

一些组织，如美国国防部，现在明确表示反对瀑布式方法，从1994年发布的MIL-STD-498开始，就鼓励采用渐进式收购和迭代增量开发。

# 修改版瀑布模型

为了应对“纯”瀑布模型的已知问题，许多“修改版瀑布模型”应运而生。这些模型可能解决了“纯”瀑布模型的一些或所有批评问题。

这些模型包括史蒂夫·麦康奈尔（Steve McConnell）所称的“修改版瀑布”模型：[17] 彼得·德格雷斯（Peter DeGrace）的“寿司模型”（重叠阶段的瀑布模型），瀑布模型与子项目相结合，以及瀑布模型与风险降低结合等。还有一些其他的软件开发模型组合，如“增量瀑布模型”[25]。

# 罗伊斯的最终模型

罗伊斯的最终模型  
温斯顿·W·罗伊斯（Winston W. Royce）的最终模型是他对最初“瀑布模型”的改进，指出反馈应该（而且通常会）从代码测试引导到设计（因为代码测试揭示了设计中的缺陷），并且从设计返回到需求规范（因为设计问题可能需要去除相互冲突或无法满足/无法设计的需求）。在同一篇论文中，罗伊斯还提倡大量文档工作，建议如果可能，做“两遍”（这与弗雷德·布鲁克斯的观点类似，他是《人月神话》的作者，也是软件项目管理领域的名人，提倡计划“抛掉一份”），并尽可能多地让客户参与（这一观点与极限编程的理念相似）。

罗伊斯关于最终模型的说明如下：

- 在分析和编码开始之前，完成整个程序设计
- 文档必须是最新的且完整的
- 如果可能，做两遍工作
- 测试必须经过计划、控制和监控
- 尽量让客户参与

# 参考资料

https://en.wikipedia.org/wiki/Waterfall_model#cite_note-15

* any list
{:toc}



