---
layout: post
title: java 程序如何打包成为一个可执行文件？ Launch4j 
date:  2017-06-28 23:15:43 +0800
categories: [Java]
tags: [jdk, java]
published: true
---

# 拓展阅读

[Java Functional java 函数式编程](https://houbb.github.io/2017/06/29/java-functional)

[Java Lambda](https://houbb.github.io/2017/06/28/java-lambda)


# Maven Launch4j 插件

## 描述

[Launch4j](http://launch4j.sourceforge.net/) 由 Grzegorz Kowal 开发，旨在将 JAR 文件封装成 Windows 可执行文件，简化 Java 桌面应用程序的部署。您可以选择将 JRE 打包在内，或者让 Launch4j 在硬盘上查找现有的 JRE。如果未找到 JRE，Launch4j 会显示下载页面。Launch4j 提供了许多功能，包括创建图形界面应用程序或控制台应用程序。您可以在 JRE 加载时显示启动画面，给您的应用程序设置自定义图标，修改 Windows 任务栏中的进程名称（默认是“java”），并设置其他多种进程属性。

Launch4j 可以在 Windows、Linux、Solaris 或 OS X 上运行。您可以通过 XML 文件来指定配置。有关此配置文件的更多信息，请访问 Launch4j 网站。您还可以通过 Launch4j GUI 来设置配置。

Maven 插件允许您在 Maven 构建过程中生成 Launch4j 可执行文件。它支持 Maven 2.0.4 和 Launch4j 3.x。根据操作系统，插件将下载一个包含平台特定二进制文件的额外工件，这些文件由 Launch4j 用于创建可执行文件。这个工件就像任何其他 Maven 依赖项一样，仅在第一次需要时下载。

## 将插件添加到 pom.xml

使用 Maven 插件，您可以在 POM 中指定 Launch4j 配置。我计划在未来支持外部配置文件，但目前必须使用 POM。此配置的格式与标准的 Launch4j XML 格式非常相似。主要有两个区别。首先，任何具有相同名称的元素列表必须包含在一个包装元素中。例如，您不能写：

[source,xml]
----
    <icon>logo.bin</icon>
    <var>this=that</var>
    <var>foo=bar</var>
    <var>blep=blurp</var>
----
您必须写成：

[source,xml]
----
    <icon>logo.bin</icon>
    <vars>
        <var>this=that</var>
        <var>foo=bar</var>
        <var>blep=blurp</var>
    </vars>
----
同样，`<lib>` 和 `<obj>` 元素也需要遵循此规则。

第二，`<classPath>` 元素的子元素有些不同。这是为了便于根据您的依赖项设置类路径。`<classPath>` 仍然包含 `<mainClass>` 元素，但不再包含 `<cp>` 元素。相反，它支持以下子元素：

 * `<addDependencies>` - 如果设置为 "true"，插件将基于运行时和编译时作用域中的所有依赖项构建类路径。默认情况下开启。

 * `<jarLocation>` - 如果启用了 `addDependencies` 特性，您可以使用此选项为每个 JAR 文件名添加前缀。如果您将应用程序与可执行文件一起打包，并且有一个 lib 目录包含所有 JAR 文件，则可以设置 `<jarLocation>lib/</jarLocation>`。

 * `<preCp>` - 在自动生成的类路径之前添加类路径条目。无论您是否启用了 `<addDependencies>`，此元素都能正常工作。条目之间应该用分号分隔，就像 Windows 样式的 `CLASSPATH` 变量一样。

 * `<postCp>` - 在自动生成的类路径之后添加类路径条目。无论您是否启用了 `<addDependencies>`，此元素都能正常工作。条目之间应该用分号分隔，就像 Windows 样式的 `CLASSPATH` 变量一样。

除此之外，XML 格式与 Launch4j 的标准格式相同。

== 示例

# 单模块项目

默认情况下，Launch4j 插件绑定到 `package` 阶段。假设您有一个名为 `encc` 的单模块项目，它是一个控制台应用程序，而不是图形界面应用程序，并且它以 JAR 文件形式打包，因此在 `package` 阶段会自动运行打包任务。在此过程中，您想使用 Launch4j 创建一个可执行文件，然后使用 assembly 插件将所有内容打包在一起。您可以将 Launch4j 和 assembly 插件都绑定到 `package` 阶段，POM 配置如下：

```xml
  <project>
    . . .
    <groupId>com.akathist.encc</groupId>
    <artifactId>encc</artifactId>
    <packaging>jar</packaging>
    . . .
    <build>
      <plugins>
        <plugin>
          <groupId>com.akathist.maven.plugins.launch4j</groupId>
          <artifactId>launch4j-maven-plugin</artifactId>
          <executions>
            <execution>
              <id>l4j-clui</id>
              <phase>package</phase>
              <goals><goal>launch4j</goal></goals>
              <configuration>
                <headerType>console</headerType>
                <outfile>target/encc.exe</outfile>
                <jar>target/encc-1.0.jar</jar>
                <errTitle>encc</errTitle>
                <classPath>
                  <mainClass>com.akathist.encc.Clui</mainClass>
                  <addDependencies>false</addDependencies>
                  <preCp>anything</preCp>
                </classPath>
                <jre>
                  <minVersion>1.5.0</minVersion>
                  <opts>
                    <opt>-Djava.endorsed.dirs=./endorsed</opt>
                  </opts>
                </jre>
                <versionInfo>
                  <fileVersion>1.2.3.4</fileVersion>
                  <txtFileVersion>txt file version?</txtFileVersion>
                  <fileDescription>a description</fileDescription>
                  <copyright>my copyright</copyright>
                  <productVersion>4.3.2.1</productVersion>
                  <txtProductVersion>txt product version</txtProductVersion>
                  <productName>E-N-C-C</productName>
                  <internalName>ccne</internalName>
                  <originalFilename>original.exe</originalFilename>
                </versionInfo>
              </configuration>
            </execution>
          </executions>
        </plugin>
        <plugin>
          <artifactId>maven-assembly-plugin</artifactId>
          <executions>
            <execution>
              <id>assembly</id>
              <phase>package</phase>
              <goals><goal>single</goal></goals>
              <configuration>
                <descriptors>
                  <descriptor>assembly.xml</descriptor>
                </descriptors>
              </configuration>
            </execution>
          </executions>
        </plugin>
      </plugins>
    </build>
    . . .
  </project>
```

注意：当您将 assembly 插件绑定到某个阶段时，必须使用 `assembly:single`，而不是 `assembly:assembly`，以避免其启动一个并行生命周期并重复执行。

# GUI 和控制台模式

假设您的应用程序可以在 GUI 模式或控制台模式下运行，并且您希望为每种模式创建一个单独的可执行文件。那么您的 POM 配置如下：

```xml
  <project>
    . . .
    <groupId>com.akathist.encc</groupId>
    <artifactId>encc</artifactId>
    <packaging>jar</packaging>
    . . .
    <build>
      <plugins>
        <plugin>
          <groupId>com.akathist.maven.plugins.launch4j</groupId>
          <artifactId>launch4j-maven-plugin</artifactId>
          <executions>
            <execution>
              <id>l4j-clui</id>
              <phase>package</phase>
              <goals><goal>launch4j</goal></goals>
              <configuration>
                <headerType>console</headerType>
                <outfile>target/encc.exe</outfile>
                <jar>target/encc-1.0.jar</jar>
                <errTitle>encc</errTitle>
                <classPath>
                  <mainClass>com.akathist.encc.Clui</mainClass>
                  <addDependencies>false</addDependencies>
                  <preCp>anything</preCp>
                </classPath>
                <jre>
                  <minVersion>1.5.0</minVersion>
                  <opts>
                    <opt>-Djava.endorsed.dirs=./endorsed</opt>
                  </opts>
                </jre>
                <versionInfo>
                  <fileVersion>1.2.3.4</fileVersion>
                  <txtFileVersion>txt file version?</txtFileVersion>
                  <fileDescription>a description</fileDescription>
                  <copyright>my copyright</copyright>
                  <productVersion>4.3.2.1</productVersion>
                  <txtProductVersion>txt product version</txtProductVersion>
                  <productName>E-N-C-C</productName>
                  <internalName>ccne</internalName>
                  <originalFilename>original.exe</originalFilename>
                </versionInfo>
              </configuration>
            </execution>
          </executions>
        </plugin>
        <plugin>
          <artifactId>maven-assembly-plugin</artifactId>
          <executions>
            <execution>
              <id>assembly</id>
              <phase>package</phase>
              <goals><goal>single</goal></goals>
              <configuration>
                <descriptors>
                  <descriptor>assembly.xml</descriptor>
                </descriptors>
              </configuration>
            </execution>
          </executions>
        </plugin>
      </plugins>
    </build>
    . . .
  </project>
```

注意，当你将 assembly 插件绑定到某个阶段时，必须使用 `assembly:single`，而不是 `assembly:assembly`，以防止它启动一个并行生命周期并使得所有内容运行两次。

# GUI 和控制台模式  

或者假设你的应用程序可以在 GUI 或控制台模式下运行，并且你想为每种模式创建不同的可执行文件。那么你的 POM 配置文件应如下所示：

```xml
  <project>
    . . .
    <groupId>com.akathist.encc</groupId>
    <artifactId>encc</artifactId>
    <packaging>jar</packaging>
    . . .
    <build>
      <plugins>
        <plugin>
          <groupId>com.akathist.maven.plugins.launch4j</groupId>
          <artifactId>launch4j-maven-plugin</artifactId>
          <executions>
            <execution>
              <id>l4j-clui</id>
              <phase>package</phase>
              <goals><goal>launch4j</goal></goals>
              <configuration>
                <headerType>console</headerType>
                <outfile>target/encc.exe</outfile>
                <jar>target/encc-1.0.jar</jar>
                <errTitle>encc</errTitle>
                <classPath>
                  <mainClass>com.akathist.encc.Clui</mainClass>
                  <addDependencies>false</addDependencies>
                  <preCp>anything</preCp>
                </classPath>
                <jre>
                  <minVersion>1.5.0</minVersion>
                </jre>
                <versionInfo>
                  <fileVersion>1.2.3.4</fileVersion>
                  <txtFileVersion>txt file version?</txtFileVersion>
                  <fileDescription>a description</fileDescription>
                  <copyright>my copyright</copyright>
                  <productVersion>4.3.2.1</productVersion>
                  <txtProductVersion>txt product version</txtProductVersion>
                  <productName>E-N-C-C</productName>
                  <internalName>ccne</internalName>
                  <originalFilename>original.exe</originalFilename>
                </versionInfo>
              </configuration>
            </execution>
                <execution>
                  <id>l4j-gui</id>
                  <phase>package</phase>
                  <goals><goal>launch4j</goal></goals>
                  <configuration>
                    <headerType>gui</headerType>
                    <outfile>target/enccg.exe</outfile>
                    <jar>target/encc-1.0.jar</jar>
                    <errTitle>enccg</errTitle>
                    <classPath>
                      <mainClass>com.akathist.encc.Gui</mainClass>
                    </classPath>
                    <jre>
                      <minVersion>1.5.0</minVersion>
                    </jre>
                    <versionInfo>
                      <fileVersion>1.2.3.4</fileVersion>
                      <txtFileVersion>txt file version?</txtFileVersion>
                      <fileDescription>a description</fileDescription>
                      <copyright>my copyright</copyright>
                      <productVersion>4.3.2.1</productVersion>
                      <txtProductVersion>txt product version</txtProductVersion>
                      <productName>E-N-C-C</productName>
                      <internalName>ccne</internalName>
                      <originalFilename>original.exe</originalFilename>
                    </versionInfo>
                  </configuration>
                </execution>
          </executions>
        </plugin>
        <plugin>
          <artifactId>maven-assembly-plugin</artifactId>
          <executions>
            <execution>
              <id>assembly</id>
              <phase>package</phase>
              <goals><goal>single</goal></goals>
              <configuration>
                <descriptors>
                  <descriptor>assembly.xml</descriptor>
                </descriptors>
              </configuration>
            </execution>
          </executions>
        </plugin>
      </plugins>
    </build>
    . . .
  </project>
```

# 参考资料

https://github.com/orphan-oss/launch4j-maven-plugin/blob/master/src/main/resources/README.adoc


* any list
{:toc}