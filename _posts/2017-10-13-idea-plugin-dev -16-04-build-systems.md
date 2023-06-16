---
layout: post
title:  Idea Plugin Dev-16-04-Build System
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# 外部构建流程工作流程

当用户调用涉及执行外部构建（Make、Build Artifacts 等）的操作时，会发生以下步骤：

编译前任务在 IDE 进程中执行。

一些依赖于 PSI 的源代码生成任务（例如，UI 设计器表单到源代码编译）在 IDE 进程中执行。

调用 BuildTargetScopeProvider 扩展来计算外部构建的范围（根据要进行的目标模块和已知的更改集进行编译的构建目标集）。

生成外部构建过程（或重复使用现有的构建过程后台过程）。

外部构建过程加载项目模型（.idea、.iml 文件等），由 JpsModel 实例表示。

要构建的完整目标树是根据要编译的每个构建目标的依赖项计算的。

对于每个目标，计算能够构建该目标的构建器集。

对于每个目标和每个构建器，都会调用 build() 方法。 如果在设置中启用了“并行编译独立模块”选项，这可能会并行发生。 

对于模块级构建器，为单个目标调用构建器的顺序由它们的类别决定； 对于其他构建器，顺序未定义。

保存记录编译状态的缓存。

通过 CompileContext API 报告的编译消息被传输到 IDE 进程并显示在 UI 中（在 Messages 视图中）。

编译后任务在 IDE 进程中执行。

# 增量构建

为了支持增量构建，构建过程使用多个缓存，这些缓存在构建调用之间保持不变。 

即使您的编译器不支持增量构建，您仍然需要报告正确的信息，以便增量构建可以为其他编译器正常工作。

SourceToOutputMapping 是源文件和输出文件之间的多对多关系（“哪些源文件用于生成指定的输出文件”）。 

它由对 BuildOutputConsumer.registerOutputFile() 和 ModuleLevelBuilder.OutputConsumer.registerOutputFile() 的调用填充。

IDE 监视项目内容更改，并使用来自这些缓存的信息为每次编译生成一组脏文件和已删除文件。 

（脏文件需要重新编译，删除的文件需要删除它们的输出）。 

构建器还可以将其他文件报告为脏文件（例如，如果删除了一个方法，构建器可以将使用此方法的类报告为脏文件。）模块级构建器可以将一些文件添加到脏范围； 如果发生这种情况，并且如果构建器从其 build() 方法返回 ADDITIONAL_PASS_REQUIRED，则将使用新的脏作用域启动同一模块块的另一轮构建器执行。

构建器可能还希望拥有其自定义缓存来存储附加信息以支持目标的部分重新编译（例如，模块中 Java 文件之间的依赖关系）。 

要存储此数据，您可以将任意文件存储在从 BuildDataManager.getDataPaths().getTargetDataRoot() 返回的目录中，或者使用更高级别的 API：BuildDataManager.getStorage()

要在多个目标之间调用同一构建器之间传递自定义数据，您可以使用 CompileContext.getUserData() 和 CompileContext.putUserData()。

# 外部构建器中的服务和扩展

外部构建器进程使用标准的 Java 服务机制来支持插件。 

有几个服务接口（例如 BuilderService 可以在插件中实现以扩展构建器功能。需要通过创建包含实现类的 META-INF/services/$service-interface-fqn$ 文件来注册服务的实现 限定名称。

例如，BuilderService 实现在 META-INF/services/org.jetbrains.jps.incremental.BuilderService 文件中注册。

这些文件没有扩展名，因此您需要将相应的模式映射到 IDE 设置中的文本文件。

# 参考资料

https://plugins.jetbrains.com/docs/intellij/external-builder-api.html

* any list
{:toc}