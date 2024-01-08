---
layout: post
title:  test mutation-03-变异测试 mujava Mutation system for Java programs, including OO mutation operators.
date:  2016-04-26 14:10:52 +0800
categories: [Test]
tags: [java, test]
published: true
---

# 拓展阅读

[开源 Auto generate mock data for java test.(便于 Java 测试自动生成对象信息)](https://github.com/houbb/data-factory)

[开源 Junit performance rely on junit5 and jdk8+.(java 性能测试框架。性能测试。压测。测试报告生成。)](https://github.com/houbb/junitperf)

[test 系统学习-04-test converate 测试覆盖率 jacoco 原理介绍](https://houbb.github.io/2018/06/23/test-04-test-converage)

# **µJava (muJava) 突变测试系统**

µJava是用于Java程序的一种突变测试系统。它可以自动生成传统突变测试和类级突变测试的变异体。

µJava可以测试单个类和包含多个类的包。用户通过在单独的JUnit类中将测试作为对待测类的方法调用序列提供。

µJava是韩国科学技术高等研究院（KAIST）和美国乔治梅森大学的两所大学的合作成果。

研究合作者是韩国KAIST的博士生Yu Seung Ma、KAIST的教授Yong Rae Kwon以及美国乔治梅森大学的教授Jeff Offutt。

设计的大部分工作由Jeff和YuSeung完成，最初的软件开发由YuSeung完成。在2012年和2013年，µJava进行了大规模修改，由Nan Li进行。

µJava是以“原样”提供给社区的。我们欢迎评论和反馈，但不能保证提供问题回答、故障修复或改进的支持（换句话说，我们没有支持的资金，只有良好的意图）。该页面包含以下内容：

1. **面向对象的Java和µJava的概述。**
2. **可下载文件的链接。**
3. **如何安装、设置和运行µJava的详细说明。**
4. **已发表论文的参考文献。**
5. **2007年3月：北卡罗来纳州立大学的Laurie Williams和Ben Smith修改了µJava成为Eclipse插件。他们的版本可以从sourcefourge获取。**

**I. 概述**

µJava由Ma、Offutt和Kwon构建[1]。µJava使用两种类型的突变操作符，即类级和方法级。

Ma、Kwon和Offutt设计了适用于Java类的类级突变操作符[2]，这是根据Offutt、Alexander等人关于面向对象故障的分类[3]设计的。

µJava根据专门用于面向对象故障的24个操作符创建Java类的面向对象突变。方法级（传统）突变基于Offutt等人的选择性操作符集[4]。

创建变异体后，µJava允许测试人员输入和运行测试，并评估测试的突变覆盖率。

在µJava中，对待测类的测试被编码在单独的类中，这些类调用待测类的方法。变异体是自动生成和执行的。等价的变异体必须手动识别。

µJava在PDF中提供了类级突变操作符和µJava使用的方法级突变操作符的单独描述。

**历史**

- 2003年。首次发布为JMutation（Java Mutation System）。
- 2004年。更名为MuJava（Mutation System for Java）。
- 2005年。软件著作权登记，保留所有权利。
- 2005年。发布第2版，修复了一些错误和修改了突变操作符。
- 2008年。发布第3版，对Java 1.5和1.6提供最低限度的支持。
- 2013年。发布第4版，以支持JUnit测试和Java 1.6语言功能，包括泛型、注解、枚举、可变参数、增强的for-each循环和静态导入。
- 2015年。附加和改进的错误消息。针对OpenJava的错误修复。许可证更改为Apache许可证。

# **下载 µJava**

虽然安装 µJava 在技术上并不复杂，也不复杂，但它将需要比安装许多商业软件包更多的努力。µJava 可在 Unix、Linux 和 Windows 平台上运行。您需要下载和部署三个文件；两个 Java 的 "jar" 文件和一个配置文件。

1. **mujava.jar** - µJava 系统库
2. **openjava.jar** - 为 µJava 改编的 OpenJava 库（OpenJava 网页）
3. **mujava.config** - 指定 µJava 系统主目录的文件

这两个 jar 文件应该放置在磁盘上的一个所有需要使用 µJava 的用户都可以访问的目录中，例如在 C:\mujava\。

µJava 在2013年4月进行了更新，以与 JUnit 和泛型一起使用。旧版本仍可供使用，如果您需要的话。

**版本 3**

1. **mujava-v3.jar** - µJava 系统库
2. **openjava2005.jar** - 为 µJava 改编的 OpenJava 库（OpenJava 网页）
3. **mujava-v3.config** - 指定 µJava 系统主目录的文件

版本 3 的问题：

- µJava 无法编译使用 Java 泛型的类。 （在版本 4 中已经更正）
- 故障修复，2011年12月5日：程序未正确初始化超时计数器，因此只有在用户明确设置它时，超时才起作用。这有时会导致 µJava 在执行期间冻结。
- 故障修复，2011年12月6日：µJava 错误地实现了 ROR 操作符。

µJava 在2008年12月进行了更新，以适应Java 1.5 和 1.6。旧版本仍可供使用，如果您需要的话。

**版本 2**

1. **mujava-v2.jar** - µJava 系统库（2006年5月的更新和故障修复）
2. **adaptedOJ.jar** - 为 µJava 改编的 OpenJava 库（OpenJava 网页）
3. **mujava.config** - 指定 µJava 系统主目录的文件

mujava.jar 文件在2006年5月进行了更新。旧版本 mujava-v1.jar 仍可供使用，如果需要的话。

尽管我们没有许可协议，但如果您使用 µJava，我们希望听到您的使用经验。特别是，如果您发表依赖于 µJava 的论文，请发送电子邮件至 "offutt [at] gmu.edu"，我们将在 µJava 网页上添加引用。 

**版本 1**

µJava 的新版本于2005年夏季提供。一些操作符已进行修改，并进行了许多故障修复。为了完整起见，仍提供先前的版本，但我们建议新用户使用当前版本。

版本1说明
版本1和版本2之间的区别
可下载的文件：
- jmutation.jar
- openjavaHelper.jar
- jmutation.config

# **使用 µJava 测试类**

µJava 系统要求修改 Java CLASSPATH，以包括 µJava jar、openjava jar、JUnit 库和 Java tools.jar 文件。此外，通用 PATH 变量必须包含 java bin 目录；这通常在安装 java 时自动设置，但并非总是如此。然后，使用一个 GUI（Java applet）生成变异体，测试人员必须创建测试，然后使用另一个 GUI 运行变异体。

1. **µJava 系统的环境设置**

设置 µJava 环境有三个步骤：(1) CLASSPATH，(2) 设置配置文件，(3) 创建子目录。

Java CLASSPATH 必须包括两个 µJava jar 文件和一个标准的 Java jar 文件。tools.jar 是 Java（JDK）编译器的标准配备，可能位于 "JavaHome/lib/" 目录中。两个 µJava 文件是 mujava.jar 和 openjava.jar，可从此站点下载。

**Windows**

在 DOS 窗口中，使用以下命令（假设 classes 在 C:\mujava 下）：

```bash
set CLASSPATH=%CLASSPATH%;C:\mujava\mujava.jar;C:\mujava\openjava.jar;C:\jdk1.7.0\lib\tools.jar;C:\mujava\classes
```

在 Cygwin 窗口中，使用以下命令：

```bash
CLASSPATH="$CLASSPATH;C:\mujava\mujava.jar;C:\mujava\openjava.jar;C:\jdk1.7.0\lib\tools.jar;C:\mujava\classes" ; export CLASSPATH
```

要在 Windows 中永久更改 CLASSPATH，请转到开始-设置-控制面板。双击系统，转到高级选项卡，选择环境变量。编辑 CLASSPATH 变量或者如果没有，则创建一个新变量。将 mujava.jar 和 openjava.jar 的完整路径添加到 CLASSPATH 中。

**Unix**

在 Unix 中，设置 CLASSPATH 环境变量。假设 jar 文件存储在用户 mujava 的主目录中：

```bash
CLASSPATH=$CLASSPATH:/home/mujava/mujava.jar:/home/mujava/openjava.jar:/java1.4/jdk1.7.0/lib/tools.jar ; export CLASSPATH
```

请注意，语法在不同的 shell 下会有所不同，将命令放入设置文件中（如 .login、.bash_profile 或 .bashrc）会更方便。

**Mac**

打开终端，键入 "echo $JAVA_HOME" 和 "echo $PATH"，确保环境变量 JAVA_HOME 和 PATH 设置正确。

获取 JAVA_HOME
获取 PATH

如果您不知道如何在 Mac 上安装 JDK 7，请阅读有关如何安装 JDK 7 以及如何设置 JAVA_HOME 和 PATH 环境变量的文章。

接下来，修改 mujava.config 文件，指向一个您希望存储源 Java 文件和 muJava 临时文件的目录。该目录必须是完整路径（无论是 Windows 还是 Unix）。例如，配置文件可能包含以下行：`MuJava_HOME=C:\home\mujava\exp`。

**重要提示：** 必须将配置文件复制到运行 muJava 系统的目录中。

最后，在 $MuJava_HOME 目录中为 muJava 系统创建目录结构。假设您的 MuJava_HOME 目录称为 MuJava，子目录应如下使用：

- **MuJava_HOME\src** - 用于测试的 Java 文件目录
- **MuJava_HOME\classes** - 从 MuJava_HOME\src 中的 Java 文件编译的类目录
- **MuJava_HOME\testset** - 用于测试集的目录
- **MuJava_HOME\result** - 用于生成的变异体的目录

手动创建这些子目录，或者使用 muJava 类 "mujava.makeMuJavaStructure"。

```bash
java mujava.makeMuJavaStructure
```

潜在问题：我们已经确定了安装 µJava 时可能出现的一些潜在问题。

- 重要的是 MuJava_HOME 变量不要有尾随斜杠。这会使 µJava 混淆。
- 如果您的 java 编译器和 JVM 的版本不同，µJava 可能会感到困惑。当计算机上的新应用程序更新 JVM 时，有时会发生这种情况。如果在编译或杀死变异体时出现问题，我们建议删除所有 Java 组件并重新安装最新版本。
- 如果您的 tools.jar 文件过时（Java 1.4 之前的版本），µJava 的某些部分可能无法正常工作。

# **2. 用 muJava 生成变异体**

**重要提示：** 您应该在包含 "mujava.config" 文件的目录中运行所有命令。

1. 将要测试的源文件放入 MuJava_HOME\src 目录。muJava 不会检查编译错误，因此所有 Java 文件都应正确编译。如果要测试的 Java 文件需要其他 Java 文件或类文件，则它们也应放置在 MuJava_HOME\src 中。例如，假设要测试 B，它是 A 的子类。然后，应将 A.java 和 B.java 放入 MuJava_HOME\src。如果文件具有包结构，则应将整个包存储在 MuJava_HOME\src 的子目录中。
   
2. 编译 MuJava_HOME\src 中的所有 Java 文件，并将 .class 文件复制到 MuJava_HOME\classes\ 目录中。
   
3. 从命令行启动 GUI。使用它生成变异体：
   ```bash
   java mujava.gui.GenMutantsMain
   ```
   此命令应该会弹出类似于以下屏幕的屏幕：

   ![GenMutantsMain GUI](attachment:image1.png)

   通过在左侧的框中单击来选择要变异的文件。通过选择其框来选择要使用的变异操作符。然后点击 RUN。

   **注意：** 类变异操作符产生的变异体要少得多。还请注意，许多状态消息会发送到命令窗口，而不是 GUI。

4. 生成变异体后，可以在 "Class Mutants Viewer" 和 "Traditional Mutants Viewer" 选项卡中查看变异体，如以下两个图所示：

   ![Class Mutants Viewer](attachment:image2.png)

   ![Traditional Mutants Viewer](attachment:image3.png)

5. 您可能想知道类的变异版本存储在何处。它们位于 MuJava_HOME\result\ 下。以下示例显示了 result 下的 Stack 目录，其中包含 class_mutants 中的面向对象的变异体和一个单独目录中的传统变异体。

   ```plaintext
   MuJava_HOME
   └── result
       └── Stack
           ├── class_mutants
           └── traditional_mutants
   ```

   一个简短的 shell 脚本将帮助您运行 µJava。以下是一个用于在 Windows 中创建变异体的示例 shell 脚本：

# **3. 创建测试集**

在 muJava 中，测试集必须是一个 JUnit 测试用例。不支持 JUnit 测试套件。每个测试都是一个包含对类中方法的方法调用序列的方法。测试方法和测试类应具有公共访问权限。

以下是一个名为 `testVendingMachine` 的用于类 `vendingMachine` 的 JUnit 测试类示例。JUnit 的 `.class` 文件应位于目录 MuJava_HOME\testset\ 中。

# **4. 运行变异体**

从另一个 GUI 中运行变异体。使用以下命令启动它：

```bash
java mujava.gui.RunTestMain
```

您应该会看到以下 GUI。您可以选择要运行的变异体集合以及要使用的测试集。"Class Mutants Viewer" 和 "Traditional Mutants Viewer" 选项卡将显示变异体的源视图。您可以设计测试来杀死变异体，方法是找到一个存活的变异体，然后分析程序以确定什么输入将其杀死。请记住，通常只有 5% 到 20% 的变异体是等效的。

下面的截图展示了运行 µJava 来杀死变异体：

![RunTestMain GUI](attachment:image4.png)


# 参考资料

https://github.com/jeffoffutt/muJava

* any list
{:toc}