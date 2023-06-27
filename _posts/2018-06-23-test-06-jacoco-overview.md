---
layout: post
title: test 系统学习-06-test jacoco
date:  2018-06-23 16:18:11 +0800
categories: [Test]
tags: [test, sh]
published: true
---

# JaCoCo - Java 代码覆盖率库

JaCoCo 是一个免费的 Java 代码覆盖库，根据 Eclipse 公共许可证分发。 

检查 http://www.jacoco.org/jacoco 获取更新和反馈。

这是基于提交 a6fabdaba5e9e96dcf761c134a3b3bc9b88c0943 于 2023/06/26 创建的版本 0.8.11.202306261236 的发行版。

# 一、JaCoCo简述

JaCoCo是一个开源的覆盖率工具，它针对的开发语言是java，其使用方法很灵活，可以嵌入到Ant、Maven中；可以作为Eclipse插件，可以使用其JavaAgent技术监控Java程序等等。

很多第三方的工具提供了对JaCoCo的集成，如sonar、Jenkins等。

JaCoCo包含了多种尺度的覆盖率计数器,包含指令级覆盖(Instructions,C0coverage)，分支（Branches,C1coverage）、圈复杂度(CyclomaticComplexity)、行覆盖(Lines)、方法覆盖(non-abstract methods)、类覆盖(classes)

# 二、JaCoCo基本概念

jacoco支持多种覆盖率的统计，包括：

行覆盖率：度量被测程序的每行代码是否被执行，判断标准行中是否至少有一个指令被执行。

类覆盖率：度量计算class类文件是否被执行。

分支覆盖率：度量if和switch语句的分支覆盖情况，计算一个方法里面的总分支数，确定执行和不执行的 分支数量。

方法覆盖率：度量被测程序的方法执行情况，是否执行取决于方法中是否有至少一个指令被执行。

指令覆盖：计数单元是单个java二进制代码指令，指令覆盖率提供了代码是否被执行的信息，度量完全 独立源码格式。

圈复杂度：在（线性）组合中，计算在一个方法里面所有可能路径的最小数目，缺失的复杂度同样表示测 试案例没有完全覆盖到这个模块。

# 三、JaCoCo使用方式

## 3.1 Apache Ant方式

参见 http://eclemma.org/jacoco/trunk/doc/ant.html

## 3.2 命令行方式

参见 http://www.eclemma.org/jacoco/trunk/doc/agent.html

大概的命令：

```
-javaagent:[yourpath/]jacocoagent.jar=[option1]=[value1],[option2]=[value2]
```

其他参数可以查看上面的链接

接口测试时，我们也是使用该方式来进行，具体的说明会在下面另外说明

## 3.3 Apache Maven方式

参见 http://www.eclemma.org/jacoco/trunk/doc/maven.html

这种方式适合Maven的项目。

## 3.4 Eclipse EclDmma Plugin方式

参见 http://www.eclemma.org/

该方式主要和eclipse集成，用户可以直观的看到覆盖率的情况

# 四、maven配置JaCoCo

jacoco支持生成单元测试的覆盖率和接口测试的覆盖率，本节详细描述如何用jacoco生成单元测试覆盖率。

想要在单元测试时统计单元测试的覆盖率，有两种方式，大家可以各取

## 4.1 mvn命令增加参数

在执行mvn命令时，加上“org.jacoco:jacoco-maven-plugin:prepare-agent”参数即可。 

示例：

```
mvn clean test org.jacoco:jacoco-maven-plugin:0.7.3.201502191951:prepare-agent install -Dmaven.test.failure.ignore=true
```

其中，jacoco-maven-plugin后面跟的是jacoco的版本； 【-Dmaven.test.failure.ignore=true】建议加上，否则如果单元测试失败，就会直接中断，不会产生.exec文件

执行以上命令后，会在当前目录下的target目录产生一个jacoco.exec文件，该文件就是覆盖率的文件：

总体说来，这种方式比较简单，在与jekins集成时也非常方便，推荐大家用这种方式进行配置。

## 4.2 在pom文件中添加jacoco插件

具体的配置方法如下：

### 1.添加依賴

```xml
<dependency>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.3</version>
</dependency>
```

### 2.配置plugins

```xml
<plugin>
 <groupId>org.jacoco</groupId>
 <artifactId>jacoco-maven-plugin</artifactId>
 <version>0.8.3</version>
 <configuration>
   <includes>
     <include>com/**/*</include>
   </includes>
 </configuration>
 <executions>
   <execution>
     <id>pre-test</id>
     <goals>
       <goal>prepare-agent</goal>
     </goals>
   </execution>
   <execution>
     <id>post-test</id>
     <phase>test</phase>
     <goals>
       <goal>report</goal>
     </goals>
   </execution>
 </executions>
</plugin>
```

其中包含(includes)或排除(excludes)字段的值应该是相对于目录/ classes /的编译类的类路径(而不是包名)，使用标准通配符语法:

```
*   Match zero or more characters
**  Match zero or more directories
?   Match a single character
```

你也可以这样排除一个包和它的所有子包/子包：

```xml
<exclude>com/src/**/*</exclude>
```

这将排除某些包装中的每个课程，以及任何孩子。

例如，com.src.child也不会包含在报表中。

也可以在pom中指定筛选规则：

```xml
      <plugin>
        <groupId>org.jacoco</groupId>
        <artifactId>jacoco-maven-plugin</artifactId>
        <version>${jacoco.version}</version>
        <configuration>
          <includes>
            <include>com/src/**/*</include>
          </includes>
          <!-- rules裏面指定覆蓋規則 -->
          <rules>
            <rule implementation="org.jacoco.maven.RuleConfiguration">
              <element>BUNDLE</element>
              <limits>　　
                <!-- 指定方法覆蓋到50% -->
                <limit implementation="org.jacoco.report.check.Limit">
                  <counter>METHOD</counter>
                  <value>COVEREDRATIO</value>
                  <minimum>0.50</minimum>
                </limit>
                <!-- 指定分支覆蓋到50% -->
                <limit implementation="org.jacoco.report.check.Limit">
                  <counter>BRANCH</counter>
                  <value>COVEREDRATIO</value>
                  <minimum>0.50</minimum>
                </limit>
                <!-- 指定類覆蓋到100%，不能遺失任何類 -->
                <limit implementation="org.jacoco.report.check.Limit">
                  <counter>CLASS</counter>
                  <value>MISSEDCOUNT</value>
                  <maximum>0</maximum>
                </limit>
              </limits>
            </rule>
          </rules>
        </configuration>
        <executions>
          <execution>
            <id>pre-test</id>
            <goals>
              <goal>prepare-agent</goal>
            </goals>
          </execution>
          <execution>
            <id>post-test</id>
            <phase>test</phase>
            <goals>
              <goal>report</goal>
            </goals>
          </execution>
        </executions>
      </plugin>
```

此时运行mvn test生成index.html（即覆盖率报告）位置在：

```
${PROJECT_PATH}\target\site\jacoco\index.html
```

也可以指定输出目录：

```xml
<execution>
    <id>post-unit-test</id>
    <phase>test</phase>
    <goals>
        <goal>report</goal>
    </goals>
    <configuration>
        <dataFile>target/jacoco.exec</dataFile>
        <outputDirectory>target/jacoco-ut</outputDirectory>
    </configuration>
</execution>
```

在这里，我们将单元测试结果的输出目录确定为target/jacoco-ut目录下~

# Jacoco入门指北

前阵子使用 Jacoco 进行代码覆盖率测试，由于项目特殊遇到了不少坑，网上搜到的教程感觉也不够全面，干脆自己整理一份

## 0. 前言

本次所用到的工具软件的版本信息如下

Jacoco 版本：0.8.0
Eclemma 版本：3.0.0
Eclipse 版本：4.3
JDK 版本：1.8
ANT 版本：1.9

## 1. 工具介绍

JaCoCo，即 Java Code Coverage，是一款开源的 Java 代码覆盖率统计工具。

支持 Ant 、Maven、Gradle 等构建工具，支持 Jenkins、Sonar 等持续集成工具，支持 Java Agent 技术远程监控 Java 程序运行情况，支持Eclipse、IDEA等IDE，提供HTML，CSV 等格式的报表导出，轻量级实现，对外部库和系统资源的依赖性小，性能开销小。

JaCoCo 支持从 JDK1.0 版本到 JDK1.8 版本 的 Java 类文件。

但是，JaCoCo 工具所需的JRE 版本最小为 1.5。另外，1.6及以上版本的测试中的类文件必须包含有效的堆栈映射帧。

## 2. 入门使用

本文将以 tcpserver 模式远程获取应用覆盖率，通过 Ant 脚本执行相关命令，在 Eclipse 上查看源码覆盖率情况。

### 2.1 配置部署

先从官网获取 Jacoco 的压缩包， 将其上传到你要进行覆盖率检测的应用所在的服务器上。

在解压后的 lib 目录下找到 jacocoagent ，将其路径添加到 JAVA_OPTS 环境变量中（如果项目中用到了 Tomcat，也可以直接将其添加到 CATALINA_OPTS 的环境变量中，JAVA_OPTS 只是更通用而已）。

如果是 Windows 系统，将以下内容追加到 JAVA_OPTS 环境变量

```
-javaagent:D:\jacoco-0.7.9\lib\jacocoagent.jar=includes=*,address=10.1.231.168,port=6300,output=tcpserver,append=true;%JAVA_OPTS%
```

如果是 Linux 系统，可以直接编辑 .bash_profile

```
export JACOCO="-javaagent:/$your_path/jacocoagent.jar=includes=com.grgbanking.*,output=tcpserver,address=11.111.1.11,port=6300,append=true"
export JAVA_OPTS="$JACOCO":"$JAVA_OPTS" 
```

其中常用选项的含义如下

javaagent: 指定 Jacocoagent 的路径

includes: 表示只对指定包下的类进行覆盖率注入分析，默认为 *，示例中只分析 com.test 包的类。

output: 表示覆盖率的输出方式。在 tcpserver 模式下，Jacoco 会在客户端执行 dump 操作时将目前收集获取到的覆盖率数据统一写到指定的ip和端口。在 file 模式下，Jacoco 只会在JVM 终止的时候才将收集到的覆盖率数据写入到指定的 exec 文件里去。注意，不管是任何模式，应用运行过程中的临时覆盖率数据都是保存在服务端的内存中的，因此对于 tcpserver 模式来说，如果 JVM 不小心终止了，那么在这个覆盖率统计周期内的覆盖率数据都会丢失。还有一个 tcpclient 模式则是以客户端的形式启动，由于目前没有这个使用场景，这里不过多讨论。

address: 只限 tcpserver 与 tcpclient 使用，表示监听的应用服务器IP地址或主机名。可根据实际情况自由选择。

port: 只限 tcpserver 与 tcpclient 使用，表示监听的应用服务器的端口号，一般用默认6300即可。

append: 表示覆盖率数据的追加方式，默认为true。客户端在执行 dump 操作时，如果该 exec 覆盖率文件已存在，那么该轮的覆盖率数据会直接在文本末尾进行追加，因此会导致覆盖率数据文件越来越大。如果改为false，则客户端执行 dump 操作时会直接清空原覆盖率文件的内容，保证该覆盖率文件只有该轮的覆盖率数据。

修改好以后启动 Java 应用，读取 JAVA_OPTS 环境变量的信息，Jacoco 被加载进。检查下6300端口如果已监听，说明服务端 Jacoco 启动成功。

## 2.2 数据获取

在正常运行过程中，服务器端的 Jacoco 只是将获取的覆盖率数据保存到内存中，我们还需要在客户端上进行操作才能将覆盖率数据 dump 到客户端。

Jacoco 为我们提供了 Ant、Maven、CLI 等多种方式进行操作，其中 CLI 方式唯一的用途就是可以用来执行 execinfo 命令，这个命令是 Ant 与 Maven 所没有的，它可以将 exec 简单转成文本格式方便你查看每个类的覆盖率百分比。

Maven 与 Ant 大同小异，由于项目中使用 Ant 进行构建，下文中将以 Ant 为例讲解。

在使用 Ant 脚本获取覆盖率之前，我们需要先去官网下载好 Ant，注意安装过程中要手动勾选 “添加到环境变量” 的相关选项，省得以后要自己添加。

安装好以后打开 cmd 输入ant -version，如果能显示相关的版本信息例如 “ Apache Ant(TM) version 1.9.11 compiled on March 23 2018 ”，则说明 Ant 安装成功。

虽然官方也提供了 Ant脚本，但较为简单，部分内容没有说明，因此文末会附上我在项目中使用的完整脚本。

## 2.3 统计分析

对于不熟悉 Java 或者对项目目录结构不了解的朋友，往往会由于源码和字节码不匹配或者路径错误导致在结合源码查看覆盖率时反复折腾，跑半天不知道生成的 exec 到底有没有统计到。这时候我们可以使用 CLI 中的 execinfo 命令，简单查看下 exec 文件中的覆盖率是否为0。

```
java -jar D:\jacococli.jar execinfo E:\jacoco\igaps1008.exec
```

这种方式只能查看 exec 文件的概况，要想结合源码查看详细的覆盖率使用情况，我们还是需要花点时间，配置好源码和字节码，这样才能在 IDE 中查看源码覆盖率。

首先需要在 Eclipse 中安装 Eclemma 插件，你可以使用 Eclipse 的 MarketPlace 在线安装，

也可以下载离线安装包 eclemma-3.0.0.zip，分别将里面的 features 和 plugins 文件夹里的 jar 包拷贝到 Eclipse 对应的文件夹中，重启 Eclipse 后如果有显示覆盖率图标或视图就说明安装成功了。

接着下载项目源码并将项目导入到 Eclipse 中

注意导入前取消 Eclipse 中的自动编译（即 Project - build automatically ）， 然后拷贝服务器上的字节码文件到这个项目的编译输出文件夹中。例如这个项目的编译输出文件夹为根目录下bin目录，那么就把字节码文件都拷贝到这个目录下，到这里我们的项目就准备好了。

在 Eclipse 控制台 Coverage 视图窗口的空白位置，右键--Import Session，在 Coverage Session 窗口，选择第三个代理模式，Agent address 填写需要监控覆盖率的远程服务器地址。点击下一步后，选择需要查看覆盖率的源码，一般不需要勾选include binary libraries，再点击Finish即可查看覆盖率。

# 3. 注意事项

## 官方文档才是王道

强烈建议在使用 Jacoco 之前阅读[官方文档](https://www.jacoco.org/jacoco/trunk/doc/index.html)，虽然是英文，但是内容也很简单，花1个小时大概浏览下能对 Jacoco 有个系统性的了解。

这里对 Jacoco 的官方部分 FAQ 进行了简单翻译，同时加入了部分自己在使用过程中遇到的坑。

## 源代码没有覆盖率高亮问题

必须确保使用调试信息编译类文件以包含行号，如果使用 Ant 编译脚本，则需要检查脚本中 javac 相关部分是否没有设置 debug=true。
源文件必须在报表生成时正确提供。即指定的源文件夹必须是定义Java包的文件夹的直接父级。

## 覆盖率统计偏差

既然 Jacoco 是依据 class 文件进行覆盖率的统计，那么在用 EclEmma 合并会话数据时，应该保证多个会话的所测试 class 文件字节码内容是相同的，即多次测试过程中被测试 Java 类的源文件没有被修改并且重新编译过。

所以在 Eclipse 中，测试用例开始执行执行后，应该保证 Testee 源文件不被改动。如果修改了被测试源文件并保存（ Eclipse 会自动重新编译），请将之前的所有测试用例重新以 Coverage As 模式执行一般，否则合并后的覆盖率测试数据会有误差。

另外，由于 JaCoCo 分析统计的是编译后的 class 文件中字节码指令的执行情况。

例如某源文件中有一个静态的方法 someMethod，但是在编译时 Javac 会自动为我们的类生成一个构造方法（本例中没有提供非空的构造方法），所以这个类同时有 someMethod 和一个构造方法。由于在执行静态方法过程中没有调用到构造函数，所以会显示覆盖率不是100%

## Android应用使用覆盖率

由于Android不能通过JVM停止后自动dump覆盖率数据，因此当Android应用进程不存在或停止的时候，覆盖率数据不会生成。要想获得Android应用的覆盖率，，必须使用离线插桩模式进行覆盖率分析

## 多源文件目录

Ant 脚本执行起来很方便，但如果要执行 report 命令则需要注意，如果该应用编译后的class 或 jar 分别在几个不同的目录下，那么就需要分别在 Ant 脚本中指定 group，同时每个 group 也都要指定源文件 sourcefiles 以及 编译后的类文件 classfiles。

同样的，如果 项目的源码存放目录也没有统一的入口，那也需要在一个 sourcefiles 中指定多个 fileset，就如本脚本中分别指定了 `<fileset dir="${JacocoClassPath}/lib/core"/>` 和 `<fileset dir="${JacocoClassPath}/project"/>` 这2个 classfiles 一样。

## Eclipse中导入覆盖率数据时出错

如果在Eclipse的Eclemma插件中导入exec文件时弹窗，提示 “Error while loading coverage session (code 5001).”

一般是因为eclipse 中导入的项目编译输出文件夹目录结构不合法导致，同时 class 文件必须是从服务器中获取的，不能使用 eclipse 自己的编译器编译的 class。

由于 Eclipse 默认会开启自动编译，所以哪怕你没有手动编译，在你导入项目的时候 Eclipse 已经帮你编译了一次了。这里必须删掉编译后的 class 然后重新拷贝一份服务器上的 class 文件

# 4. 技术原理

运行时分析 (Runtime Profilling) 技术 在 PureCoverage 中有使用，他就是通过 JVMTI 来监听 JVM 的相关事件进行覆盖率数据收集，而 Jacoco 则是使用字节码注入(Byte Code Instrumentation)的方式，使用 ASM 库在字节码中插入 Probe 探针，通过统计运行时探针的覆盖情况来统计覆盖率信息。

## 技术原理

### On-the-fly 模式：

JVM 中通过 javaagent 参数指定特定的 jar 文件启动 Instrumentation 的代理程序，代理程序在通过 Class Loader 装载一个 class 前判断是否转换修改 class文件，将统计代码插入 class，测试覆盖率分析可以在 JVM 执行测试代码的过程中完成。

## Offline 模式：

在测试前先对文件进行插桩，然后生成插过桩的 class 或 jar 包，测试插过桩的 class 和 jar 包后，会生成动态覆盖信息到文件，最后统一对覆盖信息进行处理，并生成报告。

存在如下情况不适合 on-the-fly，需要采用 offline 提前对字节码插桩：

- 运行环境不支持 java agent。

- 部署环境不允许设置 JVM 参数。

- 字节码需要被转换成其他的虚拟机如 Android Dalvik VM。

- 动态修改字节码过程中和其他 agent 冲突。

- 无法自定义用户加载类。

# 6 Maven 使用

有两种方式可以通过maven调用jacoco获取覆盖率

## 方法1

直接运行以下命令，会自动下载jacoco依赖，同时忽略运行过程中的测试错误

```
mvn clean test org.jacoco:jacoco-maven-plugin:0.8.3:prepare-agent install -Dmaven.test.failure.ignore=true
```

执行完成后会在当前目录target目录下生成jacoco.exec文件
方便与jenkins进行集成

## 方法2

在pom中添加jacoco插件

```xml
<build>
        <plugins>
            <plugin>
                <groupId>org.jacoco</groupId>
                <artifactId>jacoco-maven-plugin</artifactId>
                <version>0.8.5</version>
                <configuration>
                    <!--
                        包含(includes)或排除(excludes)字段的值应该是相对于目录/ classes /的编译类的类路径(而不是包名)
                        使用标准通配符语法:*匹配0个或n个字符, ** 匹配0个或n个目录, ? 匹配1个字符
                    -->
                    <includes>
                        <include>com/src/**/*</include>
                    </includes>
                    <!--你也可以这样排除一个包和它的所有子包/子包 -->
                    <excludes>
                        <exclude>com/src/**/*</exclude>
                    </excludes>
                        
                      <!-- rules裏面指定覆蓋規則 -->
                    <rules>
                        <rule implementation="org.jacoco.maven.RuleConfiguration">
                        <element>BUNDLE</element>
                        <limits>　　
                            <!-- 指定方法覆蓋到50% -->
                            <limit implementation="org.jacoco.report.check.Limit">
                            <counter>METHOD</counter>
                            <value>COVEREDRATIO</value>
                            <minimum>0.50</minimum>
                            </limit>
                            <!-- 指定分支覆蓋到50% -->
                            <limit implementation="org.jacoco.report.check.Limit">
                            <counter>BRANCH</counter>
                            <value>COVEREDRATIO</value>
                            <minimum>0.50</minimum>
                            </limit>
                            <!-- 指定類覆蓋到100%，不能遺失任何類 -->
                            <limit implementation="org.jacoco.report.check.Limit">
                            <counter>CLASS</counter>
                            <value>MISSEDCOUNT</value>
                            <maximum>0</maximum>
                            </limit>
                        </limits>
                        </rule>
                    </rules>
                </configuration>
                <executions>
                    <execution>
                        <id>default-prepare-agent</id>
                        <goals>
                            <goal>prepare-agent</goal>
                        </goals>
                    </execution>
                    <execution>
                        <id>default-report</id>
                        <goals>
                            <goal>report</goal>
                        </goals>
                    </execution>
                    <execution>
                        <id>default-check</id>
                        <goals>
                            <goal>check</goal>
                        </goals>
                        <configuration>
                            <rules>
                                <rule>
                                    <element>BUNDLE</element>
                                    <limits>
                                        <limit>
                                            <counter>COMPLEXITY</counter>
                                            <value>COVEREDRATIO</value>
                                            <minimum>0.10</minimum>
                                        </limit>
                                    </limits>
                                </rule>
                            </rules>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
```

# 参考资料

https://www.jacoco.org/jacoco/trunk/index.html

https://www.cnblogs.com/jockming/p/17102590.html

https://blog.51cto.com/u_15075508/4193250

https://blog.csdn.net/John_Zhang_/article/details/118713724

https://www.pkslow.com/archives/maven-jacoco-sonar

https://developer.aliyun.com/article/917448

[Maven整合JaCoCo和Sonar，看看你的测试写够了没](https://www.pkslow.com/archives/maven-jacoco-sonar)

[Intellij IDEA中代码覆盖率测试工具 JaCoCo 简单使用](https://summer2zz.blog.csdn.net/article/details/102887144)

[Java单元测试jacoco IDEA使用教程（配合JUnit）](https://blog.csdn.net/u014772376/article/details/115379984)

* any list
{:toc}