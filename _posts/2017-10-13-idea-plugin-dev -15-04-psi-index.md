---
layout: post
title:  Idea Plugin Dev-15-04-Indexing and PSI Stubs
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# 索引

索引框架提供了一种快速定位特定元素的方法，例如，在大型代码库中包含特定单词或具有特定名称的方法的文件。 

插件开发者可以使用IDE自身构建的现有索引，也可以构建和使用自己的索引。

它支持两种主要类型的索引：

- 基于文件的索引

- 存根索引

基于文件的索引直接建立在文件的内容之上。 

存根索引建立在序列化的存根树之上。 

源文件的存根树是其 PSI 树的子集，它仅包含外部可见的声明，并以紧凑的二进制格式序列化。

查询基于文件的索引可以获得与特定条件匹配的文件集。 

查询存根索引可以获得一组匹配的 PSI 元素。 

因此，自定义语言插件开发人员通常在其插件实现中使用存根索引。

# 哑模式

编制索引可能是一个漫长的过程。 

它在后台执行，在此期间，IDE 功能仅限于不需要索引的功能：基本文本编辑、版本控制等。此限制由 DumbService 管理。 

通过 IndexNotReadyException 报告违规，请参阅其 javadoc 以了解如何调整调用者。

DumbService 提供 API 来查询 IDE 当前是处于“哑”模式（不允许索引访问）还是“智能”模式（所有索引已构建并可以使用）。 

它还提供了在索引准备好之前延迟代码执行的方法。

## 例子：

VirtualFileGist：ImageInfoIndex 计算需要在 UI 的特定部分显示的图像尺寸/位深度。

PsiFileGist：JavaSimplePropertyGist 在 Java 中提供简单的属性

# 提高索引性能

## 性能指标

在 2020.2 及之后的版本中，在日志目录（开发实例见沙箱目录）中生成 JSON 格式的索引性能指标。 从 2021.1 开始，这些内容还以 HTML 格式提供。

## 避免使用 AST

如果可能，使用词法分析器信息而不是解析树。

如果不可能，请使用不会在内部创建耗费大量内存的 AST 节点的轻型 AST，因此遍历它可能会更快。 

通过将 FileContent 输入参数转换为 PsiDependentFileContent 并调用 getLighterAST() 来获取 LighterAST。 

确保只遍历你需要的节点。 另请参阅 LighterASTNodeVisitor 和 LightTreeUtil 了解有用的实用方法。

对于存根索引，实施 LightStubBuilder。

如果自定义语言包含从不或很少包含任何存根的惰性可解析元素，请考虑实施 StubBuilder.skipChildProcessingWhenBuildingStubs()（最好使用 Lexer/节点文本）。

对于索引 XML，还可以考虑使用 NanoXmlUtil。

## 共享项目索引

对于更大的项目，构建和提供预构建的共享项目索引可能是有益的，请参阅共享项目索引。 

# File-Based Indexes

基于文件的索引基于 Map/Reduce 架构。 每个索引都有特定类型的键和特定类型的值。

键是稍后用于从索引中检索数据的键。

示例：在单词索引中，键是单词本身。

该值是任意数据，与索引中的键相关联。

示例：在单词索引中，该值是一个掩码，指示单词出现在哪个上下文中（代码、字符串文字或注释）。

在最简单的情况下，当需要知道哪些文件中存在某些数据时，该值的类型为 Void 并且不存储在索引中。

当索引实现索引文件时，它接收文件的内容并返回从文件中找到的键到关联值的映射。

访问索引时，指定您感兴趣的键并返回出现该键的文件列表，以及与每个文件关联的值。

# Implementing a File-Based Index

每个特定的索引实现都是一个类，扩展了通过 com.intellij.fileBasedIndex 扩展点注册的 FileBasedIndexExtension。

基于文件的索引的实现包括以下主要部分：

getIndexer() 返回实际负责根据文件内容构建一组键/值对的 DataIndexer 实现。

getKeyDescriptor() 返回负责比较键并将它们以序列化二进制格式存储的 KeyDescriptor。 最常用的实现可能是 EnumeratorStringDescriptor，它是为高效存储标识符而设计的。

getValueExternalizer() 返回负责以序列化二进制格式存储值的 DataExternalizer。

getInputFilter() 允许将索引仅限于一组特定的文件。 考虑使用 DefaultFileTypeSpecificInputFilter。

getName() 返回一个唯一的索引 ID。 考虑使用完全限定的索引类名，以免与使用相同 ID 定义索引的其他插件发生冲突，例如 com.example.myplugin.indexing.MyIndex。

getVersion() 返回索引实现的版本。 如果当前版本与用于构建它的索引实现的版本不同，则会自动重建索引。

如果没有值与文件关联（即值类型为 Void），则通过扩展 ScalarIndexExtension 来简化实现。 

如果每个文件只有一个值，则从 SingleEntryFileBasedIndexExtension 扩展。

另请参阅提高索引性能。

# 访问基于文件的索引

对基于文件的索引的访问是通过 FileBasedIndex 类执行的。

支持以下主要操作：

getAllKeys() 和 processAllKeys() 允许获取在文件中找到的所有键的列表，这些文件是指定项目的一部分。 

要优化性能，请考虑从 FileBasedIndexExtension.traceKeyHashToVirtualFileMapping() 返回 true（有关详细信息，请参阅 javadoc）。

getValues() 允许获取与特定键关联的所有值，但不能获取它们所在的文件。

getContainingFiles() 允许收集遇到特定键的所有文件。

processValues() 允许遍历遇到特定键的所有文件并同时访问关联的值。

## 嵌套索引访问

在嵌套调用（通常来自多个索引）中访问索引数据时，可能会有限制。

# 标准索引

IntelliJ 平台包含几个标准的基于文件的索引。 对插件开发者最有用的索引是：

- 单词索引

通常，应使用 PsiSearchHelper 类的辅助方法间接访问单词索引。

- 文件名索引

FilenameIndex 提供了一种快速查找与特定文件名匹配的所有文件的方法。

- 文件类型索引

FileTypeIndex 服务于类似的目标：它允许快速找到特定文件类型的所有文件。

- 附加索引根

要添加要索引的其他文件/目录，请实施 IndexableSetContributor 并在 com.intellij.indexedRootsProvider 扩展点中注册。

# Stub Indexes

## 存根树（Stub Trees）

存根树是文件 PSI 树的子集； 它以紧凑的序列化二进制格式存储。 

文件的 PSI 树可以由 AST（通过解析文件构建）或从磁盘反序列化的存根树来支持。 两者之间的切换是透明的。

存根树仅包含节点的子集。 通常，它仅包含从外部文件解析此文件中包含的声明所需的节点。 

尝试访问不属于存根树的任何节点或执行存根树无法满足的任何操作（例如，访问 PSI 元素的文本）会导致文件解析从 PSI 切换到 AST 支持。

存根树中的每个存根只是一个没有行为的 bean 类。 

存根存储相应 PSI 元素状态的子集，如元素名称、修饰符标志（如 public 或 final 等）。存根还包含指向其在树中父项的指针及其子存根列表。

要为您的自定义语言支持存根，您首先需要决定应将哪些 PSI 树元素存储为存根。 

通常，您需要为其他文件可见的方法或字段等存根。 

您通常不需要对外部不可见的语句或局部变量等存根。

### 实现

对于支持存根的每种语言，只需执行以下步骤一次：

将您的语言的文件元素类型（您从 ParserDefinition.getFileNodeType() 返回的元素类型）更改为扩展 IStubFileElementType 的类。

在您的 plugin.xml 中，定义 com.intellij.stubElementTypeHolder 扩展并指定包含您的语言解析器使用的 IElementType 常量的接口。 

定义用于所有存根元素类型的通用 externalIdPrefix（有关重要要求，请参阅 StubElementTypeHolderEP 文档）。

例子：

在 JavaPsiPlugin.xml 中注册的 JavaStubElementTypes

请参阅 Kotlin 示例的 Angular2MetadataElementTypes

对于要存储在存根树中的每种元素类型，您需要执行以下步骤：

为存根定义一个接口，派生自 StubElement 接口（示例）。

提供接口的实现（示例）。

确保 PSI 元素的接口扩展了由存根接口类型参数化的 StubBasedPsiElement（示例）。

确保 PSI 元素的实现类扩展了存根接口类型参数化的 StubBasedPsiElementBase（示例）。 

提供接受 ASTNode 的构造函数和接受存根的构造函数。

创建一个实现 IStubElementType 并使用存根接口和实际 PSI 元素接口（示例）进行参数化的类。 

实施 createPsi() 和 createStub() 方法以从存根创建 PSI，反之亦然。 实现用于将数据存储在二进制流中的 serialize() 和 deserialize() 方法。

解析时使用实现 IStubElementType 的类作为元素类型常量（示例）。

确保 PSI 元素接口中的所有方法在适当时访问存根数据而不是 PSI 树（示例：Property.getKey() 实现）。

如果您使用 Grammar-Kit 生成您的语言 PSI，请参阅存根索引支持部分以获取有关将您的语法与存根集成的说明。

默认情况下，如果 PSI 元素扩展 StubBasedPsiElement，则该类型的所有元素都将存储在存根树中。 

如果您需要更精确地控制存储哪些元素，请覆盖 IStubElementType.shouldCreateStub() 并为不应包含在存根树中的元素返回 false。 

排除不是递归的：如果返回 false 的元素的某些元素也是基于存根的 PSI 元素，它们将包含在存根树中。

### 序列化数据

用于序列化字符串数据，例如 元素名称，在存根中，我们建议使用 StubOutputStream.writeName() 和 StubInputStream.readName() 方法。 

这些方法确保每个唯一标识符仅在数据流中存储一次。 这减少了序列化存根树数据的大小。 另请参阅 DataInputOutputUtil。

如果您需要更改存根的存储二进制格式（例如，如果您想要存储一些额外的数据或一些新元素），请确保为您的语言提前从 IStubFileElementType.getStubVersion() 返回的存根版本。 

这将导致重建存根和存根索引，并将避免存储的数据格式与尝试加载它的代码之间的不匹配。

必须确保存储在存根树中的所有信息仅取决于为其构建存根的文件的内容，而不取决于任何外部文件。 

否则，当外部依赖项发生变化时，存根树将不会被重建，并且存根树中将有陈旧和不正确的数据。

# 参考资料

https://plugins.jetbrains.com/docs/intellij/indexing-and-psi-stubs.html

* any list
{:toc}