---
layout: post
title: JavaParser 系列学习-10-java-call-graph 生成Java代码中方法之间的调用链
date:  2020-5-29 14:24:18 +0800
categories: [java]
tags: [aop, ast, sh]
published: true
---

# java-callgraph

这是一个用于在Java中生成静态和动态调用图的程序套件。

javacg-static：从一个jar文件中读取类，遍历方法体并打印调用者-被调用者关系的表格。

javacg-dynamic：作为Java代理运行，并对用户定义的一组类的方法进行插装，以跟踪它们的调用。

在JVM退出时，打印调用者-被调用者关系的表格，以及调用次数。

## 编译

java-callgraph包使用Maven构建。

请安装Maven并执行以下操作：

```bash
mvn install
```

这将生成一个目标目录，其中包含以下三个JAR文件：

- `javacg-0.1-SNAPSHOT.jar`：这是标准的Maven打包JAR文件，包含静态和动态调用图生成器类。
- `javacg-0.1-SNAPSHOT-static.jar`：这是一个可执行JAR文件，包含静态调用图生成器。
- `javacg-0.1-SNAPSHOT-dycg-agent.jar`：这是一个可执行JAR文件，包含动态调用图生成器。

## 运行

调用图生成器的运行指南

静态调用图生成器

javacg-static 接受要分析的JAR文件作为参数。

```bash
java -jar javacg-0.1-SNAPSHOT-static.jar lib1.jar lib2.jar...
```

javacg-static生成的输出格式如下：

对于方法

```plaintext
M:class1:<method1>(arg_types) (typeofcall)class2:<method2>(arg_types)
```

这行意味着class1的method1调用了class2的method2。调

用类型可以有以下值（请参考JVM规范了解这些调用的含义）：

> [jvm 调用规范](https://docs.oracle.com/javase/specs/)

- M 代表 invokevirtual 调用
- I 代表 invokeinterface 调用
- O 代表 invokespecial 调用
- S 代表 invokestatic 调用
- D 代表 invokedynamic 调用

对于invokedynamic调用，无法推断参数类型。

对于类别（Classes）

```plaintext
C:class1 class2
```

这表示class1中的某些方法调用了class2中的某些方法。

# 动态调用图生成器

javacg-dynamic 使用 javassist 在方法的入口和出口点插入探针。

为了能够分析一个类，javassist必须在插装时解析所有相关的类。

为此，它会从JVM的引导类加载器（boot classloader）中读取类。

默认情况下，JVM会将引导类路径（boot classpath）设置为使用Java的默认类路径实现（在Windows和Linux上是rt.jar，在Mac上是classes.jar）。

引导类路径可以通过 -Xbootclasspath 选项进行扩展，这与传统的 -classpath 选项相同。

为了使javacg-dynamic按预期工作，建议将引导类路径设置为与正常应用程序类路径相同或适当的子集。

此外，由于插装所有方法会生成庞大的调用图，这并不一定有助于分析（例如，它将包括Java的默认类路径条目），javacg-dynamic 包括了通过包含和排除语句来限制要插装的类集的支持。

这些选项会追加到 -javaagent 参数，并具有以下格式：

```
-javaagent:javacg-dycg-agent.jar="incl=mylib.*,mylib2.*,java.nio.*;excl=java.nio.charset.*"
```

上面的示例将插装所有位于mylib、mylib2和java.nio命名空间下的类，但不包括那些位于java.nio.charset命名空间下的类。

```
java
-Xbootclasspath:/System/Library/Java/JavaVirtualMachines/1.6.0.jdk/Contents/Classes/classes.jar:mylib.jar
-javaagent:javacg-0.1-SNAPSHOT-dycg-agent.jar="incl=mylib.*;"
-classpath mylib.jar mylib.Mainclass
```

javacg-dynamic生成两种类型的输出。在标准输出上，它以以下方式写入方法调用对：

```
class1:method1 class2:method2 numcalls
```

它还生成一个名为`calltrace.txt`的文件，其中包含方法的入口和退出时间戳，使得javacg-dynamic成为一种简易的性能分析工具。格式如下：

```
<>[stack_depth][thread_id]fqdn.class:method=timestamp_nanos
```

输出行以“<”或“>”开头，具体取决于它是方法的入口还是退出。

接着它写入堆栈深度、线程ID、类名和方法名，然后是时间戳。

提供的`process_trace.rb`脚本用于处理调用图输出，以生成每个方法的总时间信息。

# 例子

以下示例对Dacapo基准套件进行插装，以生成动态调用图。

Dacapo基准测试以一个包含所有依赖库的大型jar归档文件的形式提供。

为了构建javacg-dyn程序所需的引导类路径，请将`dacapo.jar`提取到一个目录中：所有必需的库都可以在该目录中找到。

运行Batik Dacapo基准测试：

```
java -Xbootclasspath:/System/Library/Java/JavaVirtualMachines/1.6.0.jdk/Contents/Classes/classes.jar:jar/batik-all.jar:jar/xml-apis-ext.jar -javaagent:target/javacg-0.1-SNAPSHOT-dycg-agent.jar="incl=org.apache.batik.*,org.w3c.*;" -jar dacapo-9.12-bach.jar batik -s small |tail -n 10
```

```
[...]
org.apache.batik.dom.AbstractParentNode:appendChild org.apache.batik.dom.AbstractParentNode:fireDOMNodeInsertedEvent 6270<br/>
org.apache.batik.dom.AbstractParentNode:fireDOMNodeInsertedEvent org.apache.batik.dom.AbstractDocument:getEventsEnabled 6280<br/>
org.apache.batik.dom.AbstractParentNode:checkAndRemove org.apache.batik.dom.AbstractNode:getOwnerDocument 6280<br/>
org.apache.batik.dom.util.DoublyIndexedTable:put org.apache.batik.dom.util.DoublyIndexedTable$Entry:DoublyIndexedTable$Entry 6682<br/>
org.apache.batik.dom.util.DoublyIndexedTable:put org.apache.batik.dom.util.DoublyIndexedTable:hashCode 6693<br/>
org.apache.batik.dom.AbstractElement:invalidateElementsByTagName org.apache.batik.dom.AbstractElement:getNodeType 7198<br/>
org.apache.batik.dom.AbstractElement:invalidateElementsByTagName org.apache.batik.dom.AbstractDocument:getElementsByTagName 14396<br/>
org.apache.batik.dom.AbstractElement:invalidateElementsByTagName org.apache.batik.dom.AbstractDocument:getElementsByTagNameNS 28792<br/>
```

Running the lucene Dacapo benchmark:

```
java -Xbootclasspath:/System/Library/Java/JavaVirtualMachines/1.6.0.jdk/Contents/Classes/classes.jar:jar/lucene-core-2.4.jar:jar/luindex.jar -javaagent:target/javacg-0.1-SNAPSHOT-dycg-agent.jar="incl=org.apache.lucene.*;" -jar dacapo-9.12-bach.jar luindex -s small |tail -n 10
```

```
[...]
org.apache.lucene.analysis.Token:setTermBuffer org.apache.lucene.analysis.Token:growTermBuffer 43449<br/>
org.apache.lucene.analysis.CharArraySet:getSlot org.apache.lucene.analysis.CharArraySet:getHashCode 43472<br/>
org.apache.lucene.analysis.CharArraySet:getSlot org.apache.lucene.analysis.CharArraySet:equals 46107<br/>
org.apache.lucene.index.FreqProxTermsWriter:appendPostings org.apache.lucene.store.IndexOutput:writeVInt 46507<br/>
org.apache.lucene.store.IndexInput:readVInt org.apache.lucene.index.ByteSliceReader:readByte 63927<br/>
org.apache.lucene.index.TermsHashPerField:writeVInt org.apache.lucene.index.TermsHashPerField:writeByte 63927<br/>
org.apache.lucene.store.IndexOutput:writeVInt org.apache.lucene.store.BufferedIndexOutput:writeByte 94239<br/>
org.apache.lucene.index.TermsHashPerField:quickSort org.apache.lucene.index.TermsHashPerField:comparePostings 107343<br/>
org.apache.lucene.analysis.Token:termBuffer org.apache.lucene.analysis.Token:initTermBuffer 162115<br/>
org.apache.lucene.analysis.Token:termLength org.apache.lucene.analysis.Token:initTermBuffer 205554<br/>
```

# 已知的限制：

1. **静态调用图生成器** 不考虑通过反射调用的方法。

2. **动态调用图生成器** 在多线程程序中可能无法可靠工作（或根本无法工作）。

3. **动态调用图生成器** 对异常处理不够好，因此某些方法可能看起来像是从未返回。

## 拓展阅读

针对上面的问题，国内有一个仓库进行了优化：

> [java-callgraph2](https://github.com/Adrninistrator/java-callgraph2)

# 参考资料

https://github.com/gousiosg/java-callgraph

* any list
{:toc}