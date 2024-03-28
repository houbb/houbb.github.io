---
layout: post
title: test 之 jmockit-05-Measuring code coverage 测试代码覆盖率
date:  2023-05-09 +0800
categories: [Test]
tags: [junit, test, sh]
published: true
---

# 拓展阅读

[jmockit-01-jmockit 入门使用案例](https://houbb.github.io/2023/05/09/test-jmockit-00-intro)

[jmockit-02-概览](https://houbb.github.io/2023/05/09/test-jmockit-01-overview)

[jmockit-03-Mocking 模拟](https://houbb.github.io/2023/05/09/test-jmockit-03-mocking)

[jmockit-04-Faking 伪造](https://houbb.github.io/2023/05/09/test-jmockit-04-faking)

[jmockit-05-代码覆盖率](https://houbb.github.io/2023/05/09/test-jmockit-05-code-converate)

[mockito-01-入门介绍](https://houbb.github.io/2023/05/09/test-mockito-01-overivew)

[mockito-02-springaop 整合遇到的问题，失效](https://houbb.github.io/2023/05/09/test-mockito-02-springaop)


# 代码覆盖率 

代码覆盖率由一组软件指标组成，这些指标可以告诉您给定的测试套件覆盖了多少生产代码。 

它纯粹是定量的，并没有说明生产代码或测试代码的质量。 

也就是说，检查代码覆盖率报告有时会发现无法访问的代码，这些代码可以被消除。 

但更重要的是，此类报告可以用作发现缺失测试的指南。 

这不仅在为现有生产代码创建测试时有用，而且在首先编写测试时也很有用，例如在 TDD（测试驱动开发）实践中。

# 1 覆盖率指标

该工具生成的覆盖率指标告诉我们源文件中的可执行代码有多少已通过测试执行，以及有多少实例和静态非最终字段已通过测试运行完全执行。

每个可执行代码行都可以被覆盖、覆盖或部分覆盖。 

例如，第三种情况可能发生在复杂布尔表达式中包含多个逻辑条件的代码行中。 

该工具识别所有三种情况，相应地计算每个可执行代码行的覆盖率：0% 表示未覆盖的行，100% 表示覆盖的行，或者部分覆盖的行的中间值。

对于字段，要充分运用，每个字段都必须至少有一个测试读取分配给它的最后一个值。

源文件的覆盖百分比计算公式为 `100 * (NE + NFE) / (NS + NF)`，其中 NS 是行段总数，NF 是非最终字段数，NE 是已执行段数， NFE 是完全行使字段的数量。

反过来，包的百分比是根据属于该包的整个源文件集中的段和字段的总数和覆盖数量来计算的。 

最后，总代码覆盖率百分比是通过所有包的总数的相同公式计算的。

# 2 覆盖输出类型

JMockit Coverage 工具可以生成以下类型的输出：

HTML 报告：多页 HTML 报告写入当前工作目录下的“coverage-report”目录中（如果需要，可以指定不同的输出目录）。 

如果目录尚不存在，则创建该目录； 如果先前生成，其内容将被覆盖。 该报告将包括包含测试套件涵盖的所有 Java 源文件的页面。 

默认情况下，该工具在当前工作目录下直接或间接找到的所有名为“src”的目录中查找“.java”源文件； 还会搜索“src”和顶级包目录之间的任何中间子目录，例如“src/java”。

覆盖率数据文件：名称为“coverage.ser”的单个序列化文件写入当前工作目录或指定的输出目录下。 

如果该文件已存在，则其内容将被覆盖或附加当前测试运行的内存中结果（按照指定）。

这些文件可以由外部工具读取和处理。 

`mockit.coverage.data.CoverageData.readDataFromFile(File)` 方法将创建一个新的 CoverageData 实例，其中包含给定序列化文件中可用的所有覆盖数据。

## 2.1 调用点

当使用覆盖工具运行测试套件时，可以根据用户的选择收集可选的“调用点”信息。 调用点是源测试代码中执行特定生产代码行的点。

使用这些额外信息生成覆盖范围需要更多时间并产生更大的输出； 另一方面，了解哪些测试代码行导致在测试运行期间执行给定的生产代码行可能很有用。 

当包含在 HTML 报告中时，调用点列表首先显示为隐藏，但可以通过单击每个可执行代码行轻松查看。

# 3 配置覆盖工具

要在 JUnit/TestNG 测试运行中激活覆盖率工具，请使用 -javaagent JVM 初始化参数，并至少指定“coverage-output”和“coverage-classes”系统属性之一。 

（有关更多详细信息，请参阅使用 JMockit 运行测试。）可以通过设置以下一个或多个属性来配置该工具行为的所有方面。

coverage-output：html、html-cp（“cp”=“调用点”）、html-nocp、serial 和serial-append 之间的一个或多个逗号分隔值，用于选择要生成的输出类型 试运行结束。 默认情况下生成不带调用点的 HTML 报告 (html = html-nocp)。

“html”、“html-cp”和“html-nocp”值是互斥的，就像“serial”和“serial-append”一样。 但是，同时指定每对中的一个也是有效的。 在这种情况下，在测试运行结束时将写入两种输出。
“serial”或“serial-append”的存在会导致生成名称为“coverage.ser”的序列化数据文件； 使用“serial-append”，当前测试运行收集的覆盖率数据将附加到先前存在的数据文件的内容中（如果该文件不存在，则与“serial”具有相同的效果）。

coverage-outputDir：输出目录的绝对或相对路径，用于写入任何“coverage.ser”或“index.html”文件（加上HTML报告的其余“.html”文件，在自动创建的子目录中） 目录）。 默认情况下，使用正在运行的 JVM 的当前工作目录，并将所有 HTML 页面写入“coverage-report”子目录。

coverage-srcDirs：生成 HTML 报告时要搜索的以逗号分隔的 Java 源目录列表。 （这与序列化数据文件无关。）每个目录都由绝对或相对路径指定。 如果没有指定该目录，则搜索当前工作目录下的所有“src”目录。 但是，如果该属性设置为空字符串，则不会搜索源文件，并且仅生成 index.html 文件。

覆盖率类：类似操作系统的正则表达式（带有典型的“*”和“?”通配符），或者符合 java.util.regex 的正则表达式。 给定的表达式将用于从生产代码中选择应考虑覆盖的类（通过完全限定名称）。 默认情况下，会考虑测试运行期间加载的生产代码中的所有类以及不在 jar 文件内的类。

例如，“some.package.*”选择some.package或任何子包下的所有类。

作为一种特殊情况，如果该属性指定为“loaded”，则将考虑所有类，但仅考虑那些在测试运行期间由 JVM 加载的类； 属于代码库一部分但从未加载的类将被排除在外。 当测试运行仅包含少数测试且仅针对代码库的子集时，这非常有用。

覆盖范围排除：与之前的属性相同，但对于在检测类的覆盖范围时应排除在考虑范围之外的类名称。 此属性可以与覆盖范围类一起使用或单独使用。 默认情况下，选择覆盖范围的类别之间的任何类别都不会被排除在考虑范围之外。

覆盖率检查：一个或多个以分号分隔的规则，指定在测试运行结束时执行的最小覆盖率检查。 默认情况下，不执行此类检查。 有关详细信息，请参阅检查最小覆盖范围部分。

请注意，您应该能够使用 JUnit 或 TestNG 在 Maven Surefire 插件配置或您选择的 Java IDE 的测试运行配置中轻松指定这些属性； 不需要 JMockit 特定的插件。

# 4 多次测试运行的汇总报告

当覆盖率工具在测试运行结束时生成报告时，它总是会覆盖任何以前的报告。 

通常，生成报告的覆盖率数据仅反映当前测试运行期间收集的内容。 

现在假设您有多个测试套件或测试运行配置，并且您希望为全套测试所涵盖的代码生成单个聚合 HTML 报告。 

这就是“coverage.ser”序列化数据文件的用武之地。

要激活这些文件的生成，我们只需将覆盖输出系统属性设置为包含“serial”或“serial-append”的值。 

正如这两个值所表明的，有多种方法可以组合多个覆盖数据文件。 以下小节提供了每种情况的详细信息。

## 4.1 从多个数据文件生成汇总报告

假设我们想要从多个测试运行中收集覆盖率数据，然后生成一个汇总 HTML 报告，将所有测试运行的结果合并在一起。 

每个测试运行都需要生成自己的coverage.ser 文件，以便稍后可以在生成报告的最后一步中将它们合并在一起； 

因此，每次测试运行都应配置“coverage-output=serial”。 

请注意，为了保留每次测试运行生成的原始coverage.ser 输出文件，需要将它们写入或复制到不同的输出目录中。

假设两个或多个coverage.ser 文件位于不同的目录中，则可以通过执行mockit.coverage.CodeCoverage.main 方法（常规Java“main”方法）从它们生成聚合报告。 

为了实现这一点，jmockit-1.x.jar 文件是可执行的。 

作为示例，可以使用以下 Ant 任务：

```xml
<java fork="yes" dir="myBaseDir" jar="jmockit-1.x.jar">
   <jvmarg line="-Dcoverage-output=html"/>
   <arg line="module1-outDir anotherOutDir"/>
</java>
```

上面的示例使用“myBaseDir”作为运行单独的 JVM 实例的基目录。 

指定两个包含“coverage.ser”数据文件的输出目录作为命令行参数。

其他配置参数可以通过“coverage-xyz”系统属性指定。 

这个单独的 JVM 实例将读取每个“coverage.ser”数据文件，合并内存中的覆盖率数据，然后在退出之前生成聚合 HTML 报告。

## 4.2 从每次测试运行后附加的单个数据文件生成汇总报告

从执行多个测试运行中获取聚合覆盖率报告的另一种方法是将所有测试的覆盖率数据累积到单个数据文件中。 

这可以通过对所有测试运行使用相同的工作目录或将coverage-outputDir指向共享目录，同时为每个测试运行使用coverage-output=serial-append来实现。 

此外，序列中的最后一次测试运行还应该为覆盖输出属性指定 html 或 html-nocp 以及串行附加。 

当然，第一次测试运行一定不能从此文件中读取数据； 

因此，应该在第一次测试运行之前删除该文件，或者通过让第一次测试运行使用coverage-output=serial来忽略该文件。

因此，输出模式“serial”和“serial-append”之间的区别在于，对于第一个模式，我们有多个“coverage.ser”文件（每个文件位于单独的测试运行所使用的不同目录中），而对于第二个模式，我们共享 所有测试运行之间的单个数据文件。

# 5 检查最小覆盖范围

如果需要，JMockit Coverage 可以检查测试运行结束时的最终覆盖率百分比是否满足任意最小值。 

此类检查可以通过分配给“coverage-check”系统属性的一个或多个检查规则来指定（当多个检查规则时，必须用“;”字符分隔）。

每个检查规则必须采用 `[scope:]min percentage` 的形式。 

范围分为三种类型：

Total: 未指定范围时的默认值。 例如，规则“80”指定总覆盖率应至少为80%。

perFile：指定每个源文件必须满足的最小百分比。 如果一个或多个文件最终的百分比较低，则检查失败。 示例：“perFile:50”，表示每个源文件必须至少有 50% 的覆盖率。

Package: 指定给定包（包括子包）中源文件集的最小总百分比。 例如，规则“com.important:90”指定“com.important”下文件的总覆盖率应至少为 90%。

所有检查（如果有）都在测试运行结束时执行（实际上是在 JVM 关闭时）。 

其他形式的输出（HTML 报告、序列化文件）不受影响。 当单个检查失败时，一条描述性消息将打印到标准输出。 如果一项或多项检查失败，则采取两个最终操作来报告事实：首先，在当前工作目录中创建一个名为“coverage.check.failed”的空文件； 其次，抛出一个错误（具体来说是 AssertionError）。 

当执行检查但全部通过时，“coverage.check.failed”文件（如果当前目录中存在）将被删除。

使用文件来标记覆盖率检查的成功或失败意味着允许构建工具做出相应的反应，通常是在文件存在时使构建失败。 

例如，我们可以在 Maven pom.xml 文件中执行以下操作：

```xml
<plugin>
   <artifactId>maven-enforcer-plugin</artifactId>
   <executions>
      <execution>
         <id>coverage.check</id>
         <goals><goal>enforce</goal></goals>
         <phase>test</phase>
         <configuration>
            <rules>
               <requireFilesDontExist>
                  <files><file>target/coverage.check.failed</file></files>
               </requireFilesDontExist>
            </rules>
         </configuration>
      </execution>
   </executions>
</plugin>
```

# 6 在 Maven 项目中激活覆盖率

对于 Maven，surefire 插件通常负责运行测试。 

要激活和配置覆盖工具，请指定相应的“coverage-xyz”系统属性的值。

```xml
<plugin>
   <artifactId>maven-surefire-plugin</artifactId>
   <configuration>
      <argLine>
         -javaagent:"${settings.localRepository}"/org/jmockit/jmockit/${jmockit.version}/jmockit-${jmockit.version}.jar

         <!-- Coverage properties -->
         <!-- At least one of the following needs to be set: -->
         -Dcoverage-output=html             <!-- or html-cp, serial, serial-append; if not set, defaults to "html" -->
         -Dcoverage-classes=loaded          <!-- or a "*" expression for class names; if not set, measures all production code classes -->

         <!-- Other properties, if needed: -->
         -Dcoverage-outputDir=my-dir        <!-- default: target/coverage-report -->
         -Dcoverage-srcDirs=sources         <!-- default: all "src" directories -->
         -Dcoverage-excludes=some.package.* <!-- default: empty -->
         -Dcoverage-check=80                <!-- default: no checks -->
      </argLine>
   </configuration>
</plugin>
```

## 6.1 在 Maven 站点中包含 HTML 报告

为了将 JMockit 覆盖率 HTML 报告包含在生成的 Maven 站点文档中，需要提供 src/site/site.xml 描述符文件，其内容类似于下面所示的内容。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project
   xmlns="http://maven.apache.org/DECORATION/1.3.0"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:schemaLocation="http://maven.apache.org/DECORATION/1.3.0
                       http://maven.apache.org/xsd/decoration-1.3.0.xsd">
   <body>
      <menu ref="reports"/>
      <menu>
         <item name="Code Coverage Report" href="../../coverage-report/index.html"/>
      </menu>
   </body>
</project>
```

# 7 关闭覆盖范围

要暂时关闭特定测试运行的覆盖范围，我们可以将覆盖输出系统属性设置为未知的输出格式，例如“-Dcoverage-output=none”。

通过设置“-Dcoverage-classes=none”可以达到相同的效果。

另一种更具交互性的方法是在已生成相关输出文件时操纵其只读属性。 

要操作的特定文件始终位于工作目录中，对于序列化输出是“coverage.ser”，对于 HTML 输出是“coverage-report/index.html”。 

JMockit在启动时检查文件属性； 当标记为只读时，它无法被覆盖，因此 JMockit 完全避免了这种尝试。 

请注意，通常可以为 Java IDE 中的每个测试运行配置单独选择工作目录。 

此外，Java IDE 通常提供一种简单的机制来切换项目中文件的只读状态：

在 IntelliJ IDEA 中，可以通过双击状态栏来完成，并在编辑器中打开所需的文件； 在 Eclipse 中，编辑器中选定的文本文件的“属性”屏幕（可以通过键入“Alt+Enter”打开）中有一个“只读”复选框。

# 参考资料

http://jmockit.github.io/tutorial/Faking.html

* any list
{:toc}