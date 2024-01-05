---
layout: post
title:  test mutation-01-变异测试 PITest PIT 是一种先进的变异测试系统，为 Java 和 JVM 提供黄金标准的测试覆盖率。
date:  2016-04-26 14:10:52 +0800
categories: [Test]
tags: [java, test]
published: true
---

# 拓展阅读

[test 系统学习-04-test converate 测试覆盖率 jacoco 原理介绍](https://houbb.github.io/2018/06/23/test-04-test-converage)

[test 系统学习-05-test jacoco 测试覆盖率与 idea 插件](https://houbb.github.io/2018/06/23/test-05-jacoco-idea-plugin)

[test 系统学习-06-test jacoco](https://houbb.github.io/2018/06/23/test-06-jacoco-overview)

[SonarQube](https://houbb.github.io/2016/10/14/sonarQube)

[Docker learn-29-docker 安装 sonarQube with mysql](https://houbb.github.io/2019/12/18/docker-learn-29-install-devops-sonar)

[Ubuntu Sonar](https://houbb.github.io/2018/08/14/ubuntu-sonar)

# PITest

实际应用的变异测试

PIT 是一种先进的变异测试系统，为 Java 和 JVM 提供黄金标准的测试覆盖率。

它具有快速、可扩展的特点，并与现代测试和构建工具集成。

# 快速入门

PIT 可以直接从命令行、Ant 或 Maven 启动。

第三方组件提供了与 Gradle、Eclipse、IntelliJ 等集成的方式（详情请参阅链接部分）。

急于开始的用户可以直接跳转到他们选择的构建工具部分 - 但最好先阅读基本概念部分。

# Maven 快速入门

**安装**

PIT 从版本 0.20 开始可以在 Maven 中央仓库中获取。

**入门**

将插件添加到 pom.xml 文件的 build/plugins 部分：

```xml
<plugin>
    <groupId>org.pitest</groupId>
    <artifactId>pitest-maven</artifactId>
    <version>LATEST</version>
</plugin>
```

就这样，您已经准备好运行了。

默认情况下，PIT 将对项目中的所有代码进行变异。

您可以使用 targetClasses 和 targetTests 限制哪些代码进行变异以及运行哪些测试。

如果要使用确切的类名，请务必阅读 glob 部分。

```xml
<plugin>
    <groupId>org.pitest</groupId>
    <artifactId>pitest-maven</artifactId>
    <version>LATEST</version>
    <configuration>
        <targetClasses>
            <param>com.your.package.root.want.to.mutate*</param>
        </targetClasses>
        <targetTests>
            <param>com.your.package.root*</param>
        </targetTests>
    </configuration>
</plugin>
```

在 1.2.0 版本之前，如果没有提供 targetClasses，PIT 会假设您的类位于与项目组 ID 匹配的包中。

在 1.2.0 及更高版本中，PIT 将扫描您的项目以确定存在哪些类。

PIT 提供两个目标：

**mutationCoverage 目标**

mutationCoverage 目标分析与目标测试和目标类过滤器匹配的代码库中的所有类。

可以直接从命令行运行：

```bash
mvn test-compile org.pitest:pitest-maven:mutationCoverage
```

这将在 target/pit-reports/YYYYMMDDHHMI 中输出一个 HTML 报告。

为了加速对相同代码库的重复分析，请将 withHistory 参数设置为 true。

```bash
mvn -DwithHistory test-compile org.pitest:pitest-maven:mutationCoverage
```

**scmMutationCoverage 目标**

scmMutationCoverage 目标仅分析与过滤器匹配且源文件在项目源代码控制系统中具有给定状态的类（默认为 ADDED 或 MODIFIED）。这提供了在检查代码之前/推送代码到存储库之前检查更改覆盖率的一种快速方式。

```bash
mvn org.pitest:pitest-maven:scmMutationCoverage -Dinclude=ADDED,UNKNOWN -DmutationThreshold=85
```

要使用此目标，maven-scm 插件必须为项目正确配置。

此目标目前不能保证分析对非公共类的更改，这些类不是内部类。

# **通配符匹配规则（Globs）**

通配符匹配规则相当简单，并且只要您匹配包（如 `com.your.package.root.want.to.mutate*`）就能按预期工作。

但是，如果匹配确切的类名，则不会包含内部类。

如果您需要内部类，您可以在通配符的末尾添加一个 '*' 以匹配它们（`com.package.Class*` 而不是 com.package.Class），或者为其添加另一条规则（`com.package.Class.*` 除了 com.package.Class）。

**其他选项**

PIT 试图在开箱即用时合理工作，但同时提供了许多配置选项。

线程数量和变异操作符列表都值得尝试。

**features**
要启用或禁用的 pitest 特性列表。可用选项在启用详细日志记录时显示在控制台输出中。pitest 插件可能会添加其他特性。

一些特性默认启用，必须使用 -featureName 禁用，其他必须使用 +featureName 明确启用。

例如

```xml
<features>
  <feature>-frecord</feature>
  <feature>+auto_threads</feature>
</features>
```

将禁用对编译器生成的支持 Java records 的代码中的垃圾变异的过滤，并基于当前机器报告的核心数自动设置线程数。

**reportsDirectory**
报告的输出目录

**targetClasses**
要进行变异的类。这表示为通配符的列表。

例如

```xml
<targetClasses>
    <param>com.mycompany.*</param>
</targetClasses>
```

或者

```xml
<targetClasses>
    <param>com.mycompany.package.*</param>
    <param>com.mycompany.packageB.Foo*</param>
    <param>com.partner.*</param>
</targetClasses>
```

如果没有提供 targetClasses，则 pitest 将自动确定要进行变异的内容。

在 1.2.0 版本之前，pitest 假设所有代码都位于与 Maven 组 ID 匹配的包中。在 1.2.0 及更高版本中，将通过扫描 Maven 输出目录来确定要进行变异的类。

**targetTests**
可以向此参数提供通配符的列表，以限制可运行的测试。

此参数可用于将 PIT 指向顶级套件或套件。支持自定义套件，例如 ClassPathSuite。通过这些套件找到的测试也可以通过距离过滤器进行限制（见下文）。

... 其他参数省略

**报告目标**

**介绍**

从版本 1.1.6 开始，PIT Maven 插件具有一个 Maven 报告目标。此目标应仅作为 Maven 站点生命周期的一部分调用。要执行此目标，必须已经执行 mutationCoverage 目标以生成 HTML 报告（即如果指定了 outputFormat 参数，则参数中必须包含 HTML）。然后，report 目标将最新的 HTML 报告复制到站点目录。如果存在多个报告（例如 timestampedReports 设置为 true 的情况），则仅使用创建时间最新的报告。

要生成 PIT 站点报告，请按照上述“入门”部分和下面解释的 <reporting> 部分在项目的 pom 中设置 pitest-maven 插件。然后，执行 mutationCoverage 目标和 site 生命周期。例如：

```bash
mvn clean org.pitest:pitest-maven:mutationCoverage site
```

**POM 配置**

以下配置是生成 PIT 站点报告所需的最小配置：

```xml
<reporting>
    <plugins>
        <plugin>
            <groupId>org.pitest</groupId>
            <artifactId>pitest-maven</artifactId>
            <version>LATEST</version>
            <reportSets>
                <reportSet>
                    <reports>
                        <report>report</report>
                    </reports>
                </reportSet>
            </reportSets>
        </plugin>
    </plugins>
</reporting>
```

**其他参数**

存在其他参数以定制报告的生成。它们包括：

- **skip**: 一个布尔值，指示是否跳过报告生成。默认值为 false。用户属性是 ${pit.report.skip}。

- **reportsDirectory**: 指示 mutationCoverage 目标写入 pit HTML 报告的位置。此参数无需设置，除非在执行 mutationCoverage 目标时设置了 reportsDirectory 参数。此参数中的值必须是 pit HTML 报告所在目录的绝对路径。默认值是 ${project.build.directory}/pit-reports，用户属性是 ${reportsDirectory}。

- **sourceDataFormats**: 指定用于生成站点报告的数据文件的字符串列表。目前，唯一支持的值是“HTML”，因此不应使用此参数。pitest-maven 插件的将来版本可能会实现其他源数据格式（例如 XML 或 CSV）。默认值是“HTML”，用户属性是 ${pit.report.sourceDataFormats}。

- **siteReportName**: 确定在生成的 Maven 站点的“Project Reports”部分中显示的 pit 报告的名称。默认值是 “PIT Test Report”，用户属性是 ${pit.report.name}。

- **siteReportDescription**: 确定 pit 报告在生成的 Maven 站点的“Project Reports”部分中的“Description”。默认值是 “Report of the pit test coverage”，用户属性是 ${pit.report.description}。

- **siteReportDirectory**: 确定在写入 Maven 站点的目录（通常为 target/site）下的子目录的名称。默认值是 “pit-reports”，这意味着 pit 报告将写入 target/site/pit-reports。用户属性是 ${pit.report.outputdir}。

**示例显示所有选项**

```xml
<reporting>
    <plugins>
        <plugin>
            <groupId>org.pitest</groupId>
            <artifactId>pitest-maven</artifactId>
            <version>LATEST</version>
            <configuration>
                <skip>false</skip>
                <reportsDirectory>${project.build.directory}/pit-custom-output-dir</reportsDirectory>
                <sourceDataFormats>
                    <sourceDataFormat>HTML</sourceDataFormat>
                </sourceDataFormats>
                <siteReportName>my-pit-report-name</siteReportName>
                <siteReportDescription>my pit report custom description</siteReportDescription>
                <siteReportDirectory>pit-custom-site-directory</siteReportDirectory>
            </configuration>
            <reportSets>
                <reportSet>
                    <reports>
                        <report>report</report>
                    </reports>
                </reportSet>
            </reportSets>
        </plugin>
    </plugins>
</reporting>
```

**处理由多个 Maven 模块组成的项目（PitMP）**

PitMP（PIT for Multi-module Project）是一个在多模块项目上运行 PIT 的 Maven 插件。

默认情况下，PIT 仅变异与测试套件相同模块中定义的类。

与此同时，PitMP 在完整项目上运行 PIT：测试套件针对项目的所有类生成的变异体进行执行。

作为回报，它为项目生成全局变异分数。插件的关键原理是一些项目包括旨在评估其他模块中代码区域的正确性的测试用例。

PitMP 扩展了 PIT，而不是重新编写 PIT 功能。因此，可以使用所有 PIT 属性。

PitMP 运行测试套件，就像 PIT 一样，只是将要变异的类的列表扩展到整个项目树，而不仅仅是变异测试套件模块的类。

PitMP 可在 Maven Central 上找到，源代码和文档可在 PitMP GitHub 上找到。

**将 pitest 集成到拉取请求中**

Arcmutate 提供了拉取请求集成和其他高级功能。

# **基本概念**

**变异操作符**

PIT应用一组可配置的变异操作符（或变异器）到通过编译代码生成的字节码中。

例如，CONDITIONALS_BOUNDARY_MUTATOR 将修改语句生成的字节码

```java
if (i >= 0) {
    return "foo";
} else {
    return "bar";
}
```

使其等同于

```java
if (i > 0) {
    return "foo";
} else {
    return "bar";
}
```

PIT定义了许多这样的操作，它们以各种方式变异字节码，包括删除方法调用，反转逻辑语句，更改返回值等。

为了做到这一点，PIT要求字节码中存在以下调试信息：

- 行号
- 源文件名

大多数构建系统默认启用此信息。

**突变体**

通过应用变异操作符，PIT将生成许多变异体（可能是非常大量的）。这些是包含变异（或错误）的Java类，它们应该使它们的行为与未变异的类不同。

然后，PIT将使用此变异体而不是未变异的类运行您的测试。有效的测试集应该在变异体存在时失败。

**等效变异**

在实践中事情并非如此简单，因为并非所有变异都会与未变异的类行为不同。这些变异被称为等效变异。

等效变异可能是等效的原因有各种各样，包括：

- 结果变异体的行为与原始行为完全相同
- 例如，以下两个语句在逻辑上是等效的。

  ```java
  int i = 2;
  if (i >= 1) {
      return "foo";
  }
  ```

  ```java
  int i = 2;
  if (i > 1) {
      return "foo";
  }
  ```

- 产生的变异体的行为不同，但在测试范围之外的方式。
  一个常见的例子是与日志记录或调试相关的代码的变异。大多数团队不希望测试这些。PIT通过不对包含对常见日志框架的调用的行生成变异（此框架的列表可配置，要启用日志记录语句的变异，请禁用功能 FLOGCALL）来避免生成这种类型的等效变异。

**运行测试**

PIT会自动运行对变异代码的单元测试。在运行测试之前，PIT对测试执行传统的行覆盖分析，然后使用此数据以及测试的定时信息来选择一组针对变异代码的测试用例。

这种方法使PIT比先前的变异测试系统（如Jester和Jumble）快得多，并使PIT能够测试整个代码库，而不仅仅是单个类。

对于每个变异，PIT将报告以下结果之一：

- 被杀死
- 存活的
- 无覆盖
- 不可行的
- 超时
- 内存错误
- 运行错误

被杀死意味着测试成功地捕获了变异。

存活意味着未被覆盖的测试未检测到变异。

无覆盖与存活相同，只是没有测试涉及创建变异的代码行。

如果变异导致无限循环，例如从for循环中删除计数器的增量，变异可能会超时。

不可行的变异是由于字节码在某种程度上无效而无法由JVM加载的变异。PIT试图最小化它创建的不可行变异的数量。

内存错误可能是由于变异导致系统使用的内存增加，或者可能是在存在变异的情况下重复运行测试所需的额外内存开销引起的。如果看到大量内存错误，请考虑为测试配置更多的堆和永久代空间。

运行错误意味着在尝试测试变异时出现了问题。某些类型的不可行变异目前可能会导致运行错误。如果看到大量运行错误，这可能表明发生了某些问题。

在正常情况下，您不应看到任何不可行的变异或运行错误。

# mutators

> [mutators](https://pitest.org/quickstart/mutators/)

**内置变异操作符**

PIT目前提供了一些内置的变异操作符，默认情况下大多数都是激活的。默认集合可以被覆盖，并通过将所需操作符的名称传递给`mutators`参数来选择不同的操作符。

为了使配置更容易，一些变异操作符被放在一起形成组。在`mutators`参数中传递组的名称将激活该组的所有变异操作符。

变异是在编译器生成的字节码上执行的，而不是在源文件上执行的。这种方法的优点是通常更快，更容易集成到构建中，但有时可能很难简单地描述变异操作符如何映射到Java源文件的等效更改。

这些操作符主要设计为稳定的（即不太容易检测），并且最小化它们生成的等效变异的数量。那些不符合这些要求的操作符默认情况下是禁用的。

从arcmutate还可以获得其他操作符。

# **增量分析**

PIT包含一个实验性功能，允许在非常庞大的代码库上使用 - 增量分析。

如果激活了这个选项，PIT将跟踪代码和测试的变化，并存储先前运行的结果。然后，它将使用这些信息来避免在逻辑上可以推断结果时重新运行分析。

有一些优化是可能的：

1. 如果在上一次运行中检测到无限循环，并且类没有更改，则可以假定此变异仍导致无限循环。
2. 如果在上次运行中杀死了一个变异，并且既没有更改受测试的类也没有更改杀死变异的测试，则可以假定该变异仍然被杀死。
3. 如果在上次运行中变异存活，没有新测试覆盖它，并且覆盖测试没有更改，则它必须仍然存活。
4. 如果以前杀死的变异，但类或杀死变异的测试发生了更改，则很可能最后一个杀死变异的测试仍然会杀死它，因此它应该优先于其他测试。（自1.14.4版本以来）
5. 如果一个类以前的变异数量存活，但类发生了更改，则很可能这些变异仍然会存活。如果它们同时启用并且不能作为单个元变异体被杀死，则不需要单独分析这些变异。（尚未实施）

除了第4点外，所有这些优化都会引入一定程度的潜在错误到分析中。

主要问题是类的行为不仅由其字节码定义，还由其依赖关系定义（即它与之交互的类以及它们交互的类的图形）。PIT将仅考虑这些依赖关系中最强的 - 更改超类和外部类时，决定类行为是否可能已更改。

因此，增量功能基于这样一个假设，即一个类的依赖关系的更改很少会改变变异的状态。尽管这个假设似乎合理，但目前尚未经证明。

优化5）带有附加风险，即元变异体中的变异可能互相抵消，使类的行为保持不变。同样，这似乎是罕见的，但尚未量化。

增量分析目前由两个参数控制：

- `historyInputLocation`
- `historyOutputLocation`

或对于maven：

- `historyInputFile`
- `historyOutputFile`

这些指向读取和写入突变分析结果的位置。这可以是相同的位置。

如果使用不同的位置，您将需要实现一些机制在运行之间交换值，因为PIT目前本身不提供这样的机制。


# **高级用法**

**插件**

PIT提供了一些扩展点，允许用户定义的功能插入。根据扩展点，默认行为将被替换或扩展。

插件必须以限定的工厂名称列入文件，该文件位于classpath:META-INF/services，文件名是工厂接口的限定名称（例如，org.pitest.mutationtest.MutationResultListenerFactory），打包到jar文件中，并添加到启动PIT的classpath中。如果插件代码具有依赖关系，则这些依赖关系必须包含在jar中，或者手动添加到classpath中。

启动类路径（也称为工具类路径）和系统受测试类路径（也称为客户端类路径）通常是分开的，因此如果受测试系统包含与插件使用的库的冲突版本，则不应发生冲突。然而，某些插件在执行测试时必须存在 - 这些插件应该不包含任何依赖关系，或者应该将它们重新定位到内部包中，以确保不发生冲突。具有此要求的扩展点很容易识别，因为它们扩展了ClientClasspathPlugin接口。

要与maven mojo插件正确配合使用，插件应在JAR清单中包含与插件的maven组ID和构件ID匹配的实现供应商和实现标题。

下面描述了扩展点。请注意，随着开发的继续，描述的接口可能会发生变化。

**突变结果监听器（又名输出格式）**

突变结果监听器在分析突变详细信息时接收这些详细信息。大多数情况下，结果监听器以结构化格式导出结果，但也可用于其他目的。

可以提供多个结果监听器。每个监听器必须提供唯一的名称，以便用户在outputFormats配置参数中包含该名称，从而启用监听器。

要创建一个新的监听器，实现org.pitest.mutationtest.MutationResultListenerFactory接口。

**突变过滤器**

突变过滤器在每个类的每个生成的突变的完整列表之前被传递。它可以基于任何任意标准从此列表中删除突变。

可以提供多个过滤器。将应用类路径上的所有过滤器，除非它们实现了一些机制来禁用自己。

要创建新的突变过滤器，实现org.pitest.mutationtest.filter.MutationFilterFactory接口。

这个接口现在已被org.pitest.mutationtest.build.MutationInterceptor取代，并将在1.2.3版本中删除。

**突变拦截器**

突变拦截器在每个类的每个生成的突变之前将完整的突变列表传递给每个类，这些突变在通过测试之前被挑战。它还传递了一个mutater，该mutater可用于生成突变体以及未突变类的基于树的表示的字节码。

拦截器可以修改提供的突变，从列表中过滤掉突变，或执行生成报告等副作用。

拦截器应通过实现type方法来指示它们将执行的操作类型。它们可以声明自己为

- OTHER - 一些未指定的目的
- MODIFY - 以在功能上显著的方式修改突变体（例如标记为中毒的JVM）
- FILTER - 从处理中删除突变
- MODIFY_COSMETIC - 以不会影响处理的方式修改突变（例如更新描述）
- REPORT - 输出突变体的最终状态

拦截器声明的类型仅用于确定运行它们的顺序。

拦截器还声明它们提供的功能 - 这允许通过PIT的简单功能语言启用和禁用拦截器并传递参数。

例如

```
+FOO(max[42] allow[cats] allow[dogs])
```

启用一个名为FOO的功能，并使用max = 42和allow = [cats, dogs]配置它。

要创建新的拦截器，实现org.pitest.mutationtest.build.MutationInterceptorFactory接口。

**测试优先级排序器**

测试优先级排序器为每个突变分配要针对其运行的测试，并决定使用它们来挑战变异体的顺序。

只能提供一个测试优先级排序器。

要创建新的测试优先级排序器，实现org.pitest.mutationtest.build.TestPrioritiserFactory接口。

**突变体**

从版本1.7.0开始，默认的突变引擎Gregor允许将新的突变体添加为插件。

通过实现org.pitest.mutationtest.engine.gregor.MethodMutatorFactory接口创建新的突变体，该接口充当ASM MethodVisitors的工厂。

重要的是，由突变体创建的MethodVisitor不要对字节码进行其他更改（例如，通过未调用super.visitX），并且仅在context.shouldMutate返回true时才激活其突变。

突变器的实例必须仅突变方法中的一个位置，并且只能突变一种类型的突变。

突变器必须提供名称和全局唯一ID。

名称（例如'CONDITIONALS_BOUNDARY'）是人类可读的，并且用于从构建脚本中激活/停用突变器。如果它们逻辑上产生相同的逻辑效果，同一（或不同）突变器的多个实例可以共享相同的名称。

全局唯一ID必须对每个突变体实例唯一，并且在多次运行之间必须一致。

对于大多数突变器，通常只会有一个实例，名称和ID可以相同。

有时将有许多实例。例如，创建了org.pitest.mutationtest.engine.gregor.mutators.experimental.RemoveSwitchMutator的100个实例。每个实例都有一个不同的唯一ID，并且仅影响switch语句中的某个分支。

除了实现org.pitest.mutationtest.engine.gregor.MethodMutatorFactory接口外，突变器还必须提供以下之一

- 无参数构造函数
- 一个枚举实例
- 返回List的public static方法的工厂

**突变器组**

可以使用在1.7.0中引入的org.pitest.mutationtest.engine.gregor.config.MutatorGroup来引入新的突变器组。

它定义了一个允许将现有突变器组合在一起并赋予新名称的方法。

```java
public void register(Map<String, List<MethodMutatorFactory>> mutators) {
    mutators.put("MYGROUP", gather(mutators,"INVERT_NEGS",
            "RETURN_VALS",
            "MATH",
            "CONDITIONALS_BOUNDARY",
            "INCREMENTS"));
```

**突变引擎**

Pit被设计为支持其他突变引擎的集成。尽管可以提供多个突变引擎插件，但在单个分析中目前只能使用一个引擎。

mutationEngine配置参数指定要使用的引擎。如果没有提供任何引擎，则使用默认引擎。

实现突变引擎是非平凡的 - 有关所需内容的详细信息，请参见org.pitest.mutationtest.engine.gregor.*包。

**激活极端突变（pit-descartes）**

pit-descartes是Pit的一种突变引擎，实现了极端突变运算符。

极端突变测试最初由Niedermayr和同事提出，其目标是完全删除由至少一个测试用例覆盖的每个方法的整个逻辑。在void方法中删除所有语句。在其他情况下，方法体被替换为return语句。

引入这种引擎的关键原因如下：

- 方法是关于代码和测试套件进行推理的良好抽象水平
- 极端突变生成的突变体比Pit的默认突变运算符少得多
- 极端突变是在运行细粒度突变运算符之前加强测试套件的良好初步分析

pit-descartes的目标是在PIT的世界中引入这种类型的突变运算符的有效实现。

pit-descartes可在Maven Central找到，源代码和文档可在Descartes github找到。

# chat

## 详细介绍一下 PITest (PIT)

[PITest](https://pitest.org/)，通常称为PIT，是一个用于Java代码的开源突变测试框架。

突变测试是一种评估测试套件质量的方法，它通过对源代码进行故意引入变异（mutations），然后运行测试套件来检查是否能够检测到这些变异。

PITest帮助开发人员识别他们的测试用例对于代码变化的覆盖程度，以及是否足够强大，能够捕捉到引入的变异。

以下是PITest的一些主要特性和用法：

1. **突变测试：** PITest主要用于执行突变测试。它通过在源代码中引入各种类型的变异（例如修改算术运算符、改变条件语句等），然后运行测试套件来检查是否有测试能够发现这些变异。如果测试套件能够检测到变异，说明测试用例足够健壮。

2. **广泛的变异类型：** PITest支持许多不同类型的变异，包括条件变异、算术操作变异、返回值变异等。这使得它能够更全面地评估测试用例的质量。

3. **集成性：** PITest可以轻松集成到常见的构建工具和持续集成系统中，如Maven、Gradle、Jenkins等。这使得它能够无缝地与现有的开发工作流程整合。

4. **可配置性：** PITest提供了许多配置选项，使得用户可以根据项目的需求进行定制。这包括指定要进行突变的代码位置、变异的类型、测试的范围等。

5. **报告和结果：** PITest生成详细的报告，显示哪些变异被检测到，哪些测试用例通过了，哪些失败了。这些报告可用于帮助开发人员改进测试套件和增强代码的质量。

6. **快速反馈：** PITest旨在提供快速的反馈，以便开发人员能够及时调整和改进他们的测试用例。这有助于在开发过程中快速发现和解决代码的问题。

7. **支持多线程：** PITest支持多线程执行变异测试，提高了执行速度。

在使用PITest时，开发人员通常按照以下步骤操作：

- 配置PITest：通过构建工具（如Maven或Gradle）添加PITest的插件，并配置变异测试的参数。
- 运行PITest：运行PITest，它会对源代码进行变异，并执行测试套件。
- 查看报告：查看PITest生成的报告，了解测试用例的覆盖情况和变异测试的结果。
- 优化测试用例：根据报告的结果，优化测试用例以提高代码覆盖率和质量。

总体而言，PITest是一个强大的突变测试工具，可帮助开发人员提高其代码的质量和可靠性。

## 详细介绍一下 PITest (PIT)，到底是如何提升测试质量的呢?

PITest（PIT）是一个用于Java项目的开源突变测试框架。

突变测试是一种软件测试方法，通过对源代码进行有目的的修改（即引入突变），然后运行现有的测试套件，来检测测试用例是否能够发现这些变化。

PIT通过模拟引入各种不同类型的突变来评估测试套件的质量，帮助开发人员发现可能存在的测试不足之处。

以下是PITest如何提升测试质量的几个方面：

1. **发现测试不足：** PIT通过引入不同类型的突变（如修改条件、删除语句等）来模拟可能存在的代码错误。如果测试套件能够发现这些引入的变化，说明测试覆盖率相对较高，测试质量较好。反之，如果测试套件无法捕获变化，可能存在测试不足，需要进一步补充测试用例。

2. **提供变异测试报告：** PIT生成详细的变异测试报告，其中包含有关每个引入的突变的信息，以及测试套件对这些突变的反应（杀死、存活等）。这些报告可以帮助开发人员快速了解项目中存在的测试覆盖问题，以及哪些代码区域需要更多的测试用例。

3. **自动化测试过程：** PIT可以轻松集成到常见的构建工具（如Maven、Ant等）中，并能够在项目构建过程中自动执行变异测试。这使得开发人员无需手动执行变异测试，节省了时间，同时确保了在每次构建时都能够进行全面的测试。

4. **突变引擎插件支持：** PIT允许用户通过添加突变引擎插件来扩展其突变测试的能力。这意味着用户可以根据项目的特定需求添加自定义的突变操作，以更全面地评估测试套件的覆盖率。

5. **集成到持续集成流程：** 通过将PIT集成到持续集成流程中，可以确保每次代码更改都经过全面的变异测试。这有助于在早期发现潜在的问题，并促使开发人员编写更健壮、全面的测试用例。

总体而言，PITest通过变异测试的方式，帮助开发人员评估测试套件的质量，发现测试不足，提供详细的测试报告，并通过自动化集成和持续集成流程，促进项目的测试全面性和质量提升。


## 对源代码进行有目的的修改（即引入突变），这样我们的方法都被修改了？测试的还是原来的代码吗？

突变测试的核心思想是对源代码进行有目的的修改，即引入一些变异（mutations），然后运行测试套件来检测这些变异是否被测试用例捕获。

在突变测试中，原始代码（未引入变异）仍然是用于运行测试用例的基础，而测试用例并不知道具体的变异。

具体的流程如下：

1. **引入变异：** 通过对源代码进行一系列有目的的修改，例如修改条件、删除语句等，生成一组变异体。每个变异体都代表了源代码的一个变异版本。

2. **运行测试：** 使用原始的测试套件（未修改的测试用例），对每个变异体进行测试。每个变异体都被当做一种潜在的代码错误或缺陷。

3. **分析结果：** 对于每个变异体，观察测试结果。如果测试套件成功捕获了变异，说明该变异被杀死（killed），即测试用例能够检测到潜在问题。如果测试套件未能捕获变异，说明该变异存活（survived），即测试用例无法检测到潜在问题。

4. **生成报告：** 根据测试结果生成详细的变异测试报告，其中包括哪些变异被杀死，哪些存活，以及测试覆盖率等信息。

在这个过程中，测试套件对于变异体的反应决定了该测试用例的质量。如果测试套件足够健壮，能够捕获大多数变异，那么测试质量相对较高。

如果测试套件未能捕获很多变异，可能存在测试不足的情况。

需要注意的是，虽然测试套件用于检测变异，但测试套件并不知道具体的变异内容。

测试用例是基于原始代码编写的，而不是基于变异后的代码。

这样可以确保测试用例对变异的检测不是基于变异内容的特定知识，而是基于代码行为的泛化能力。

## PIT 支持测试覆盖率的原理和 jacoco 的差异？

PIT（PITest）和 JaCoCo（Java Code Coverage Library）是两个在Java项目中用于测试覆盖率的工具，它们之间存在一些关键的差异。

### PIT（PITest）：

1. **原理：**
   - PIT通过引入人为的变异（mutations）来评估测试覆盖率。它对源代码进行修改，引入各种类型的变异，然后运行测试套件，检查是否有测试用例可以检测到这些变异。
   - PIT的目标是找到那些能够“杀死”变异的测试用例，即能够检测到引入的错误。这种方法更关注测试用例是否足够强大，能够发现代码中的潜在问题。

2. **变异类型：**
   - PIT支持多种变异类型，包括条件变异、算术操作变异、返回值变异等。这使得PIT能够模拟代码中的各种可能的错误情况。

3. **报告：**
   - PIT生成详细的报告，显示哪些变异被检测到，哪些测试用例通过了，哪些失败了。这些报告可以帮助开发人员理解测试套件的覆盖情况和质量。

### JaCoCo：

1. **原理：**
   - JaCoCo通过静态字节码分析来计算代码覆盖率。它跟踪代码中每一行的执行情况，生成覆盖率报告。JaCoCo的目标是提供全面的代码覆盖率信息，而不是关注测试用例是否足够强大以发现潜在问题。

2. **变异类型：**
   - 与PIT不同，JaCoCo不引入人为的变异。它仅仅通过监控代码的执行情况来计算覆盖率，而不关心测试用例是否能够发现变异。

3. **报告：**
   - JaCoCo生成覆盖率报告，显示每个类、方法和代码行的覆盖率情况。这些报告可以帮助开发人员了解项目中哪些代码被测试覆盖，哪些没有被测试覆盖。

### 主要差异：

1. **测试用例的目标：**
   - PIT主要关注测试用例是否足够强大，能够发现代码中的潜在问题（通过变异测试）。
   - JaCoCo关注提供全面的代码覆盖率信息，以便了解哪些代码被测试覆盖。

2. **变异引入：**
   - PIT通过引入变异来评估测试覆盖率，模拟潜在的错误情况。
   - JaCoCo通过监控实际代码执行情况来计算覆盖率，不引入人为的变异。

3. **适用场景：**
   - PIT适用于希望评估测试用例质量、寻找潜在问题的开发人员。
   - JaCoCo适用于希望获得全面代码覆盖率信息的开发人员。

在实践中，通常可以结合使用PIT和JaCoCo，以便全面评估测试覆盖率和测试用例的质量。

## 给一个 PIT java 测试的入门例子？

以下是一个简单的基于Java的PITest（PIT）测试的入门例子。

在这个例子中，我们将使用Maven构建工具，并假设你已经在项目中配置了PIT插件。

1. **创建一个简单的Java项目：**

   创建一个基本的Java项目，例如使用Maven的标准目录结构。在`src/main/java`目录下创建一个简单的Java类，比如`Calculator.java`：

   ```java
   public class Calculator {
       public int add(int a, int b) {
           return a + b;
       }

       public int subtract(int a, int b) {
           return a - b;
       }
   }
   ```

2. **编写测试用例：**

   在`src/test/java`目录下创建一个测试类，比如`CalculatorTest.java`：

   ```java
   import static org.junit.Assert.assertEquals;

   import org.junit.Test;

   public class CalculatorTest {
       @Test
       public void testAdd() {
           Calculator calculator = new Calculator();
           assertEquals(5, calculator.add(2, 3));
       }

       @Test
       public void testSubtract() {
           Calculator calculator = new Calculator();
           assertEquals(2, calculator.subtract(5, 3));
       }
   }
   ```

3. **配置PIT插件：**

   在Maven的`pom.xml`文件中添加PIT插件的配置。
   
   确保插件的版本号是当前最新的版本。
   
   这是一个简单的PIT插件配置示例：

   ```xml
   <build>
       <plugins>
           <plugin>
               <groupId>org.pitest</groupId>
               <artifactId>pitest-maven</artifactId>
               <version>最新版本号</version>
               <configuration>
                   <targetClasses>
                       <param>com.example.*</param>
                   </targetClasses>
                   <targetTests>
                       <param>com.example.*Test</param>
                   </targetTests>
               </configuration>
           </plugin>
       </plugins>
   </build>
   ```

   替换`com.example.*`和`com.example.*Test`为你的实际包名。

4. **运行PITest：**

   打开终端，并在项目根目录执行以下Maven命令：

   ```bash
   mvn clean install org.pitest:pitest-maven:mutationCoverage
   ```

   这个命令将执行PITest，生成变异测试报告，并将报告存储在`target/pit-reports`目录下。

5. **查看报告：**

   打开生成的变异测试报告，查看测试覆盖率、变异的数量、被杀死的变异等详细信息。
   
   报告通常以HTML格式提供，你可以在浏览器中打开。

这个简单的例子演示了如何使用PITest来进行Java代码的变异测试。请注意，具体的配置和命令可能会根据你的项目结构和需求有所不同。

## PIT 变异测试是对常规的测试用例能力增强吗？和常规的 junit 的关系是什么？

是的，PIT的变异测试旨在增强常规测试用例的能力。变异测试通过在源代码中引入故意的变异，模拟潜在的错误情况，然后运行测试套件来检测这些变异。

如果测试用例能够发现引入的错误（即杀死变异），则说明测试用例具有足够的能力，能够捕获代码中的潜在问题。

如果测试用例未能检测到变异（即变异存活），则可能表示测试用例不足以捕捉到代码的某些错误情况，从而提供了有关测试覆盖不足的信息。

与常规的JUnit测试框架关系如下：

1. **JUnit测试用例：**
   - JUnit是一种常规的单元测试框架，用于编写和执行单元测试。开发人员使用JUnit编写测试用例来验证代码的正确性。
   - JUnit测试用例在常规情况下可能无法覆盖到所有潜在的错误情况，因为它们通常是基于预期输出的。变异测试的目的是通过引入潜在的错误情况，挑战并提高测试用例的质量。

2. **PIT变异测试：**
   - PIT是一个变异测试框架，与JUnit结合使用，用于增强测试用例的能力。PIT通过引入各种类型的变异，如修改条件语句、算术运算符等，来模拟可能的错误。
   - PIT执行变异测试，将测试用例应用于变异后的代码，并生成有关测试覆盖、变异存活/死亡等的详细报告。

3. **增强测试能力：**
   - 通过PIT的变异测试，开发人员能够识别测试用例的弱点，即那些不能捕获到的错误情况。这样，他们可以根据报告的信息来改进和完善测试用例，以提高测试覆盖率和质量。
   - 变异测试的结果可以指导开发人员了解测试用例对代码的哪些部分覆盖不足，从而提高代码的鲁棒性。

总体而言，PIT变异测试与JUnit紧密配合，帮助开发人员挑战和完善他们的测试用例，提高代码的测试覆盖率和质量。

## junit 中我们经常为测试编写断言，变异测试的话是如何确认断言，以及结果的正确性的？

在变异测试中，确认断言和结果的正确性是关键的一步。

由于**变异测试的目的是检查测试用例是否足够强大，能够捕捉引入的变异，因此需要一种机制来验证测试用例是否在变异的情况下能够正确地检测到错误**。

PITest（PIT）框架在变异测试中通过以下方式来确认断言和结果的正确性：

1. **变异测试报告：** PIT生成详细的变异测试报告，其中包含了每个变异的执行情况、测试用例的覆盖情况、变异是否被“杀死”等信息。

2. **被杀死的变异（Killed Mutants）：** 在变异测试中，如果测试用例能够检测到引入的错误（变异），则该变异被称为被杀死。变异测试报告会明确列出哪些变异被杀死，即测试用例能够成功地捕捉到变异并产生失败。

3. **存活的变异（Surviving Mutants）：** 如果测试用例未能检测到变异，该变异被称为存活。存活的变异表示测试用例在这种情况下可能不足以发现潜在问题。变异测试报告也会明确列出哪些变异存活。

4. **AssertionError捕获：** 当测试用例中的断言失败时，PIT将捕获AssertionError异常，将其视为成功的变异被杀死。这表明测试用例能够发现引入的错误。

5. **报告中的详细信息：** 变异测试报告通常会提供关于测试用例执行、变异被杀死或存活的详细信息。这包括哪些断言失败、哪些变异被检测到等。

通过分析变异测试报告，开发人员可以清晰地了解哪些测试用例成功地检测到了变异，以及哪些测试用例未能捕捉到潜在的问题。

这种信息有助于改进测试用例，使其更加健壮和全面。

## PIT 生成变异测试的原理是什么？

PIT（PITest）生成变异测试的原理涉及引入人为的变异（mutations）来模拟潜在的错误情况，然后运行测试套件来检测这些变异。以下是PIT生成变异测试的基本原理：

1. **选择变异点：** PIT首先选择源代码中的变异点，这些点是将被修改的代码位置。变异点可以是各种不同的地方，例如条件语句、循环、算术运算符、方法调用等。

2. **应用变异：** 在选择的变异点上，PIT引入不同类型的变异。变异的方式可以是修改条件语句的关系运算符、改变算术运算符、插入删除代码等。每一次变异都代表一种可能的错误情况。

3. **生成变异后的代码：** 引入变异后，PIT生成变异后的代码。这是一个经过修改的代码版本，其中包含了一种或多种变异。

4. **运行测试套件：** 对于每个变异后的代码版本，PIT运行测试套件。测试套件包含了一系列的测试用例，用于验证程序的正确性。

5. **检测变异的存活或死亡：** 如果测试用例能够发现引入的错误（变异），则该变异被称为“被杀死”（killed）。如果测试用例未能检测到变异，该变异被称为“存活”（survived）。变异测试的目标是尽可能多地杀死变异。

6. **生成变异测试报告：** 最终，PIT生成详细的变异测试报告，其中包含有关每个变异的执行情况、测试用例的覆盖情况、变异是否被杀死或存活等信息。

通过变异测试报告，开发人员可以清晰地了解测试用例对于引入的变异的检测能力。报告中详细列出了哪些变异被检测到，哪些存活，以及测试用例的覆盖情况。这种信息有助于开发人员改进测试用例，提高测试覆盖率和质量。

## PIT 的最佳实践

PIT（PITest）作为一个变异测试工具，可以帮助开发人员评估测试用例的质量，并发现潜在的代码问题。以下是一些使用PIT的最佳实践：

1. **整合到 CI/CD 流程中：**
   - 将PIT整合到持续集成（CI）和持续交付（CD）流程中，以确保每次代码提交都经过变异测试。这有助于及早发现代码中的问题，并提高代码质量。

2. **定期运行变异测试：**
   - 定期运行PIT测试，而不仅仅是在代码提交时运行。这有助于检测代码库中的长期问题，并确保测试用例对代码的各个部分都有足够的覆盖。

3. **配置适当的变异操作：**
   - 根据项目的特性和需求，选择适当的变异操作。PIT支持多种变异操作，包括条件变异、算术运算变异等。了解项目的代码结构和潜在的问题，选择相应的变异操作。

4. **设置合理的超时时间：**
   - 在PIT配置中设置适当的超时时间。超时时间用于确保PIT在执行变异测试时不会无限制地运行下去。根据项目的规模和复杂性，设置合理的超时时间，以便及时获得结果。

5. **分析变异测试报告：**
   - 仔细分析PIT生成的变异测试报告。报告提供了关于每个变异的执行情况、测试覆盖情况以及哪些变异被杀死的详细信息。这些信息可以帮助你了解测试用例的覆盖程度和质量。

6. **集成到开发环境中：**
   - 集成PIT到开发者的集成开发环境（IDE）中，例如Eclipse或IntelliJ IDEA。这样，开发者可以在编码过程中就得到即时的变异测试反馈，帮助他们编写更健壮的代码。

7. **监视变异测试覆盖率的演变：**
   - 定期监视变异测试的覆盖率，并注意其演变趋势。通过比较不同时间点的覆盖率，可以了解测试用例质量的变化，并采取相应的措施来改进。

8. **结合其他测试方法：**
   - 变异测试是测试工具的一部分，结合其他测试方法，如单元测试、集成测试等，可以更全面地评估代码的质量。不要仅依赖变异测试，而是将其与其他测试方法相结合使用。

9. **定期审查和更新测试用例：**
   - 定期审查变异测试报告，并根据报告的反馈更新测试用例。添加新的测试用例，覆盖变异测试尚未涵盖的部分，以提高测试的全面性。

10. **分享经验和最佳实践：**
    - 在团队内分享PIT的经验和最佳实践。确保团队成员了解如何使用PIT，理解变异测试的价值，并在项目中共同努力提高代码质量。

这些最佳实践可以帮助团队更有效地利用PIT进行变异测试，从而提高测试用例的质量，减少代码中的潜在问题。

## 给出 PIT 的学习资料？包含网址

以下是学习PIT（PITest）变异测试工具的一些建议资料，包括官方文档、教程和相关资源：

1. **官方文档：**
   - [PITest 官方文档](https://pitest.org/)
   - [PIT GitHub 仓库](https://github.com/pitest/pitest)

2. **入门教程：**
   - [PITest 入门教程](https://pitest.org/quickstart/)

3. **视频教程：**
   - [PIT Mutation Testing - A Quick Introduction](https://www.youtube.com/watch?v=nLgT5a9T8Uc) - 由PITest作者提供的快速介绍视频。

4. **博客文章和文章：**
   - [Introduction to Mutation Testing with PITest](https://www.baeldung.com/java-mutation-testing-with-pitest) - Baeldung 网站上的文章，提供了PITest的介绍和使用方法。
   - [Getting Started with Mutation Testing using PIT](https://www.infoq.com/articles/getting-started-mutation-testing/) - InfoQ 上的文章，介绍了使用PIT进行变异测试的入门步骤。

5. **社区和讨论：**
   - [PIT Google Groups 论坛](https://groups.google.com/g/pit-users) - PItest用户的讨论和问答社区，你可以在这里获取帮助、分享经验和了解最新动态。

6. **演示项目：**
   - [PITest Demo Project](https://github.com/pitest/pitest-demo) - 一个官方维护的演示项目，可以用来学习如何在实际项目中使用PIT。

请确保检查官方文档，因为它包含了详细的配置和使用说明，以及其他重要信息。随着项目的发展，新的学习资源和教程可能会出现，因此你还可以在相关社区和平台上查找最新的资料。


# 参考资料

https://pitest.org/quickstart/maven/

* any list
{:toc}