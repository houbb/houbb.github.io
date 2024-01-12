---
layout: post
title:  test Symbolic Execution-02-pietrobraione/jbse A symbolic Java virtual machine for program analysis, verification and test generation
date:  2016-04-26 14:10:52 +0800
categories: [Test]
tags: [java, test]
published: true
---

# 拓展阅读

[开源 Auto generate mock data for java test.(便于 Java 测试自动生成对象信息)](https://github.com/houbb/data-factory)

[开源 Junit performance rely on junit5 and jdk8+.(java 性能测试框架。性能测试。压测。测试报告生成。)](https://github.com/houbb/junitperf)

[test fuzz-01-模糊测试（Fuzz Testing）](https://houbb.github.io/2016/04/26/test-fuzz-testing-01-overview)


# 关于

JBSE是一款用于自动程序分析、验证和测试生成的符号化Java虚拟机。

JBSE允许使用符号输入执行任意Java方法。符号输入表示JBSE对其没有任何初始假设的任意原始或引用值。

在执行过程中，JBSE在符号输入上引入了假设，例如在某一点决定是否应该遵循条件语句的“then”或“else”分支，或者决定是否通过具有符号引用的字段访问值或引发NullPointerException。

在这些情况下，JBSE拆分可能的情况并分析所有情况，通过可能的情况进行回溯。

通过这种方式，JBSE可以探索当使用可能是无限输入类的Java程序时的行为，而与程序测试不同，后者总是限制在研究单一行为。

JBSE是一个库，可以集成到需要对Java字节码程序的运行时行为进行分析的任何软件中。

# 安装JBSE

目前，JBSE只能通过从源代码构建来安装。当JBSE更加功能完备和稳定时，将提供正式的发行版本。

# 构建JBSE

JBSE使用包含在存储库中的Gradle版本8.4进行构建。首先确保所有依赖项都存在，包括Z3（参见“依赖项”部分）。

然后，克隆JBSE git存储库。如果使用命令行工作，这意味着运行git clone。接下来，您可能需要按照“修补测试”部分的说明修补测试类。

最后，通过从命令行调用gradlew build运行构建Gradle任务。

# 依赖项

JBSE有几个依赖项。它必须使用JDK版本8构建 - 不少也不多。

我们建议使用Adoptium v8的最新Eclipse Temurin与HotSpot JVM（请注意，具有OpenJ9 JVM的JDK目前不起作用，因为标准库类存在一些轻微的差异）。

存储库中包含的Gradle包装程序gradlew将负责选择正确版本的JDK。Gradle将自动解析和使用以下仅在编译时依赖项：

- JavaCC，用于编译JBSE设置文件的解析器。
- JUnit，用于运行回归测试套件。

Gradle自动解析并包含在构建路径中的运行时依赖项有：

- tools.jar库，它是每个JDK 8设置的一部分（注意，不是JRE的一部分）。
- Javassist，由JBSE用于所有字节码操作任务。

还有一个附加的运行时依赖项，由Gradle无法处理，因此您需要手动修复。JBSE需要在运行时与SMT求解器交互以剪枝不可行的程序路径。JBSE与Z3和CVC4很好配合，但与SMTLIB v2标准兼容并支持AUFNIRA逻辑的任何SMT求解器都应该可以工作。Z3和CVC4都作为独立的二进制文件分发，几乎可以安装在任何地方。我们强烈建议使用Z3，因为这是我们经常使用的。

# 修补测试

克隆了git存储库并确保了依赖项后，您可能需要修复一个Gradle无法自行修复的依赖项。

除非src/test目录下的（非常小的）回归测试套件通过，否则Gradle将不会构建JBSE项目。

所有测试都应该通过（我们在每次提交之前都测试JBSE），可能的例外是jbse.dec.DecisionProcedureTest类中的测试，它测试与Z3或CVC4的交互，因此如果没有正确的求解器安装可能会失败。

jbse.dec.DecisionProcedureTest类需要配置为使用其中一个求解器，并指向相应可执行文件的路径。

修改jbse.dec.DecisionProcedureTest类的第44行，将变量COMMAND_LINE定义为Z3_COMMAND_LINE或CVC4_COMMAND_LINE，具体取决于您的开发机上是否安装了Z3或CVC4。

在两种情况下，您还必须修改第45行，并将变量SMT_SOLVER_PATH分配为Z3或CVC4可执行文件在您的开发机上的路径。

# 在Eclipse下的工作

如果您想要通过最新的Eclipse for Java Developers构建和修改JBSE（正如我们所做），那么您很幸运：用于导入和构建JBSE的所有Eclipse插件已经包含在分发中。

唯一需要注意的是，由于从版本2020-09开始，Eclipse需要至少Java 11才能运行，因此您的开发机需要同时具备Java 11或更高版本（用于运行Eclipse）和Java 8设置（用于构建和运行JBSE）。在构建JBSE时，Gradle将自动选择正确版本的JDK。

如果您使用不同版本或较早版本的Eclipse，可能需要安装Eclipse Marketplace中提供的egit和Buildship插件。

然后，按照以下步骤在Eclipse中导入JBSE：

1. 为了避免冲突，建议在空的工作空间中导入JBSE。
2. 确保默认的Eclipse JRE是完整JDK 8设置的JRE子目录，而不是独立（即不是JDK的一部分）的JRE。执行以下步骤：从主菜单中选择Eclipse > Preferences...（在macOS下）或Window > Preferences...（在Windows和Linux下）。在左侧面板中选择Java > Compiler，在右侧下拉框“Compiler compliance level”中选择“1.8”。然后在左侧面板中选择Java > Installed JREs...，在右侧列表中选中与您的JDK 8设置相对应的行（如果不存在，请通过按“Add...”按钮添加）。
3. JBSE使用保留的sun.misc.Unsafe类，这是Eclipse默认禁止的。为了避免Eclipse抱怨，必须按照以下方式修改工作空间首选项：从主菜单中选择Eclipse > Preferences...（在macOS下）或Window > Preferences...（在Windows和Linux下）。在左侧面板中选择Java > Compiler > Errors/Warnings，然后在右侧面板中打开“Deprecated and restricted API”选项组，并对选项“Forbidden reference (access rules)”选择“Warning”或“Info”或“Ignore”。
4. 切换到Git透视图。如果您从命令行克隆了Github JBSE存储库，可以通过在Git Repositories视图下点击添加现有存储库的按钮来在Eclipse中导入克隆。否则，您可以通过在Git Repositories视图下再次点击克隆按钮来克隆存储库。Eclipse不希望您将存储库克隆到Eclipse工作空间下，而是希望您遵循将git存储库放在家目录的git子目录中的标准git约定。如果您从控制台克隆存储库，请按照此标准操作（如果您从Git透视图中克隆存储库，Eclipse会为您执行此操作）。
5. 切换回Java透视图，从主菜单中选择File > Import... 在弹出的Select the Import Wizard窗口中选择Gradle > Existing Gradle Project向导并按两次Next按钮。在显示的Import Gradle Project窗口中，在Project root directory字段中输入JBSE克隆的git存储库的路径，然后按Finish按钮确认。现在，您的工作空间应该有一个名为jbse的Java项目。
6. 不要忘记应用在“Building JBSE”部分开头描述的所有补丁。
7. 不幸的是，Buildship Gradle插件不能完全自动配置导入的JBSE项目。因此，在导入后，您将看到一些由于项目尚未生成一些源文件而导致的编译错误。按照以下方式解决情况：在Gradle Tasks视图中双击jbse > build > build任务，以使用Gradle首次构建JBSE。然后，在Package Explorer中右键单击jbse项目，在弹出的上下文菜单中选择Gradle > Refresh Gradle Project。之后，您应该不再看到错误。从此刻开始，您可以通过在Gradle Task视图中再次双击jbse > build > build任务来重新构建JBSE。除非您修改了build.gradle或settings.gradle文件，否则不再需要刷新Gradle项目。

# 部署JBSE

gradlew build命令将生成一个jar文件 `build/libs/jbse-<VERSION>.jar`，该文件还包括jbse.meta包及其子包，其中包含用于发出断言、假设和以其他方式控制分析过程的代码所需的API。该jar文件不包含运行时依赖项（Javassist和tools.jar），因此您需要将它们与之一起部署。

为了简化部署，Gradle还将构建一个 `uber-jar build/libs/jbse-<VERSION>-shaded.jar`，其中包含Javassist（但不包括tools.jar）。为了避免冲突，uber jar将javassist包重命名为jbse.javassist。

# 用法

在将来，您将在JBSE的用户手册中找到有关JBSE的完整描述和使用说明（目前正在开发中）。

与此同时，您可以查看JBSE示例项目，展示了JBSE一些功能的演示。

# 参考资料

* any list
{:toc}