---
layout: post
title:  Idea Plugin Dev-17-01-Testing Overview
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# Testing Overview

IntelliJ 平台代码库中的大多数测试都是模型级功能测试。 

这意味着以下内容：

测试在无头环境中运行，该环境对大多数组件（许多 UI 组件除外）使用实际生产实现。

这些测试通常将功能作为一个整体进行测试，而不是对构成其实现的各个功能进行测试。

这些测试不测试 Swing UI，而是直接使用底层模型（另请参阅 UI 测试）。

大多数测试将一个源文件或一组源文件作为输入数据，执行一个功能，并将输出与预期结果进行比较。 

结果可以指定为另一组源文件、输入文件中的特殊标记或直接在测试代码中。

这种测试方法最显着的好处是测试非常稳定，并且一旦编写就需要很少的维护，无论底层实现被重构或重写多少。

在一个拥有 20 多年生命周期并经历过多次内部重构的产品中，我们发现与更孤立的单元测试相比，这种好处大大超过了测试执行速度较慢和故障调试更困难的缺点。

# Mocks

我们的测试方法的另一个结果是我们没有提供推荐的模拟方法。 

我们的代码库中有一些使用 JMock 的测试。 

不过，总的来说，我们发现很难模拟您的插件类需要具有的与 IntelliJ 平台组件的所有交互。 

我们建议改用真实组件。 

另请参阅如何在测试中替换组件/服务？ 

以及如何替换测试中的扩展点？。

用户界面测试

请参阅专用的 [intellij-ui-test-robot](https://github.com/JetBrains/intellij-ui-test-robot) 库。 

它通过 runIdeForUiTests 任务与基于 Gradle 的设置完全集成。

请不要使用 platform/testGuiFramework，因为它仅供内部使用。

# Tests and Fixtures

IntelliJ 平台测试基础设施不依赖于任何特定的测试框架。 

事实上，IntelliJ IDEA 团队使用 JUnit、TestNG 和 Cucumber 来测试项目的不同部分。 

但是，大多数测试都是使用 JUnit 3 编写的。

在编写测试时，您可以选择是使用标准基类来执行为您设置的测试，还是使用 fixture 类，后者允许您手动执行设置，而不会将您绑定到特定的测试框架。

使用前一种方法，您可以使用 BasePlatformTestCase（2019.2 之前的 LightPlatformCodeInsightFixtureTestCase）等类。

使用后一种方法，您可以使用 IdeaTestFixtureFactory 类为测试环境创建固定装置实例。 

您需要从测试框架使用的测试设置方法中调用夹具创建和设置方法。

# Light and Heavy Tests

插件测试在真实而非模拟的 IntelliJ 平台环境中运行，并为大多数应用程序和项目服务使用真实的实现。

加载和初始化项目的所有项目组件和服务以运行测试是一个相对昂贵的操作，我们希望避免为每个测试都这样做。 

根据加载和执行时间，我们对 IntelliJ 平台测试框架中可用的轻测试和重测试进行了区分：

在可能的情况下，轻度测试会重用之前测试运行的项目。

繁重的测试为每个测试创建一个新项目。

轻型和重型测试使用不同的基类或夹具类，如下所述。

# Light 测试

编写简单测试的标准方法是扩展以下类之一：

## LightProjectDescriptor

编写轻型测试时，您可以指定测试中需要具备的项目要求，例如模块类型、配置的 SDK、方面、库等。

您可以通过扩展 LightProjectDescriptor 类并返回您的项目描述符来实现 （通常存储在静态最终字段中）来自 getProjectDescriptor()。

在执行每个测试之前，如果测试用例返回与前一个相同的项目描述符，则项目实例将被重用，或者如果描述符不同（equals() = false）则重新创建。

# Heavy Tests

多模块 Java 项目的设置代码如下所示：

```java
TestFixtureBuilder<IdeaProjectTestFixture> projectBuilder =
        IdeaTestFixtureFactory.getFixtureFactory().createFixtureBuilder(getName());

// Repeat the following line for each module
JavaModuleFixtureBuilder moduleFixtureBuilder =
        projectBuilder.addModule(JavaModuleFixtureBuilder.class);

myFixture = JavaTestFixtureFactory.getFixtureFactory()
        .createCodeInsightFixture(projectBuilder.getFixture());
```

# Test Project and Testdata Directories

测试夹具创建一个测试项目环境。 

除非您自定义项目创建，否则测试项目将有一个模块和一个名为 src 的源根目录。 

测试项目文件存在于临时目录或内存文件系统中，具体取决于使用的 TempDirTestFixture 实现。

BasePlatformTestCase（在 2019.2 中从 LightPlatformCodeInsightFixtureTestCase 重命名）使用内存中实现； 

如果您通过调用 IdeaTestFixtureFactory.createCodeInsightFixture() 设置测试环境，您可以指定要使用的实现。

# 测试数据文件

在您的插件中，您通常将测试的测试数据（例如将执行插件功能的文件和预期的输出文件）存储在 testdata 目录中。 

这只是您插件的内容根目录下的一个目录，但不在源代码根目录下。 

testdata 中的文件通常不是有效的源代码，不能编译。

要指定测试数据的位置，您必须覆盖 getTestDataPath() 方法。 

默认实现假定作为 IntelliJ 平台源代码树的一部分运行，不适用于第三方插件。

要将文件或目录从您的测试数据目录复制到测试项目目录，您可以使用 CodeInsightTestFixture 中的 copyFileToProject() 和 copyDirectoryToProject() 方法。

插件测试中的大多数操作都需要在内存编辑器中打开一个文件，其中将执行突出显示、完成和其他操作。 

内存中的编辑器实例由 CodeInsightTestFixture.getEditor() 返回。 

要将文件从 testdata 目录复制到测试项目目录并立即在编辑器中打开它，您可以使用 CodeInsightTestFixture.configureByFile() 或 configureByFiles() 方法。 

后者将多个文件复制到测试项目目录，并在内存编辑器中打开其中的第一个。

或者，您可以使用其他方法之一，该方法采用带有 @TestDataFile 注释的参数。 

这些方法将指定文件从 testdata 目录复制到测试项目目录，在内存编辑器中打开第一个指定文件，然后执行请求的操作，例如突出显示或代码完成。

# 特殊标记

在内存编辑器中打开文件时，文件内容中的特殊标记可以指定插入符号位置或选择。

您可以使用以下标记之一：

`<caret>` 指定插入符应放置的位置。

`<selection>` 和 `</selection>` 指定所选文本范围的开始和结束。

`<block>` 和 `</block>` 指定列选择的起点和终点。

# Writing Tests

在大多数情况下，一旦您将必要的文件复制到测试项目并加载到内存编辑器中，编写测试本身就涉及调用您的插件代码并且对测试框架的依赖性很小。

但是，对于许多常见情况，框架提供了可以使测试更容易的辅助方法：

type() 模拟将字符或字符串输入到内存编辑器中。

performEditorAction() 模拟在内存编辑器上下文中执行操作。

complete() 模拟代码完成调用并返回完成列表中显示的查找元素列表（如果完成没有建议或自动插入一个建议，则返回 null）。

findUsages() 模拟 Find Usages 的调用并返回找到的用法。

findSingleIntention() 结合 launchAction() 模拟调用具有指定名称的意图操作或检查快速修复。

renameElementAtCaret() 或 rename() 模拟重命名重构的执行。

要将执行操作的结果与预期结果进行比较，您可以使用 checkResultByFile() 方法。 

具有预期结果的文件还可以包含标记以指定预期的插入符号位置或选定的文本范围。 

假设您正在测试修改多个文件的操作（例如，项目范围内的重构）。 

在这种情况下，您可以使用 PlatformTestUtil.assertDirectoriesEqual() 将测试项目下的整个目录与预期输出进行比较。

# Testing Highlighting

在编写插件测试时，一个常见的任务是测试各种突出显示（检查、注释器、解析器错误突出显示等）。 

IntelliJ 平台为此任务提供了专用的实用程序和标记格式。

要测试当前加载到内存编辑器中的文件的突出显示，请调用 CodeInsightTestFixture.checkHighlighting()。 

该方法的参数指定在将结果与预期结果进行比较时应考虑哪些严重性：始终考虑错误，而警告、弱警告和信息是可选的。 

要忽略验证额外突出显示，请将参数 ignoreExtraHighlighting 设置为 true。

或者，您可以使用 CodeInsightTestFixture.testHighlighting()，它将测试数据文件加载到内存编辑器中并将其突出显示为单个操作。

# 参考资料

https://plugins.jetbrains.com/docs/intellij/testing-plugins.html

* any list
{:toc}