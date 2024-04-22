---
layout: post
title: web server apache tomcat11-11-Jasper 2 JSP Engine How To
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---

# 前言

整理这个官方翻译的系列，原因是网上大部分的 tomcat 版本比较旧，此版本为 v11 最新的版本。

## 开源项目

> 从零手写实现 tomcat [minicat](https://github.com/houbb/minicat) 别称【嗅虎】心有猛虎，轻嗅蔷薇。

## 系列文章

[web server apache tomcat11-01-官方文档入门介绍](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-01-intro)

[web server apache tomcat11-02-setup 启动](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-02-setup)

[web server apache tomcat11-03-deploy 如何部署](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-03-deploy)

[web server apache tomcat11-04-manager 如何管理？](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-04-manager)

[web server apache tomcat11-06-Host Manager App -- Text Interface](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-06-host-manager)

[web server apache tomcat11-07-Realm Configuration](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-07-relam)

[web server apache tomcat11-08-JNDI Resources](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-08-jndi)

[web server apache tomcat11-09-JNDI Datasource](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-09-jdbc-datasource)

[web server apache tomcat11-10-Class Loader](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-10-classloader-howto)

...

## 概述

Tomcat 11.0 使用 Jasper 2 JSP 引擎来实现 JavaServer Pages 2.3 规范。

Jasper 2 已进行了重新设计，以显著提高性能，超过了原始的 Jasper。除了一般性的代码改进外，还进行了以下更改：

- JSP 自定义标签池化 - 用于 JSP 自定义标签的 Java 对象现在可以进行池化和重用。这显著提升了使用自定义标签的 JSP 页面的性能。
- 后台 JSP 编译 - 如果您对已经编译过的 JSP 页面进行更改，Jasper 2 可以在后台重新编译该页面。之前编译过的 JSP 页面仍然可用于提供请求。一旦新页面成功编译，它将替换旧页面。这有助于提高生产服务器上 JSP 页面的可用性。
- 当包含的页面更改时重新编译 JSP - Jasper 2 现在可以检测到在编译时从 JSP 中包含的页面发生更改，然后重新编译父 JSP。
- 使用 JDT 编译 JSP 页面 - Eclipse JDT Java 编译器现在用于执行 JSP java 源代码编译。该编译器从容器类加载器加载源依赖项。仍然可以使用 Ant 和 javac。
- Jasper 实现为 servlet 类 org.apache.jasper.servlet.JspServlet。

### 配置

默认情况下，Jasper 配置用于进行 Web 应用程序开发。有关在生产 Tomcat 服务器上配置 Jasper 的信息，请参阅生产配置部分。

实现 Jasper 的 servlet 使用全局的 $CATALINA_BASE/conf/web.xml 中的初始化参数进行配置。

- checkInterval - 如果 development 为 false，且 checkInterval 大于零，则启用后台编译。checkInterval 是检查 JSP 页面（及其依赖文件）是否需要重新编译的时间间隔（以秒为单位）。默认为 0 秒。
- classdebuginfo - 编译的类文件是否应包含调试信息？true 或 false，默认为 true。
- classpath - 定义用于编译生成的 Servlet 的类路径。仅当 ServletContext 属性 org.apache.jasper.Constants.SERVLET_CLASSPATH 未设置时，此参数才会生效。当 Jasper 在 Tomcat 中使用时，此属性始终设置。默认情况下，类路径是基于当前 Web 应用程序动态创建的。
- compiler - Ant 应该使用哪个编译器来编译 JSP 页面。此属性的有效值与 Ant 的 javac 任务的 compiler 属性相同。如果未设置该值，则默认情况下将使用默认的 Eclipse JDT Java 编译器，而不是使用 Ant。没有默认值。如果设置了此属性，则应使用 `setenv.[sh|bat]` 将 ant.jar、ant-launcher.jar 和 tools.jar 添加到 CLASSPATH 环境变量中。
- compilerSourceVM - 源文件与哪个 JDK 版本兼容？（默认值：17）
- compilerTargetVM - 生成的文件与哪个 JDK 版本兼容？（默认值：17）
- development - Jasper 是否在开发模式下使用？如果为 true，则可以通过 modificationTestInterval 参数指定 JSP 检查修改的频率。true 或 false，默认为 true。
- displaySourceFragment - 是否应在异常消息中包含源片段？true 或 false，默认为 true。
- dumpSmap - 是否应将 JSR45 调试的 SMAP 信息转储到文件中？true 或 false，默认为 false。如果 suppressSmap 为 true，则为 false。
- enablePooling - 确定是否启用标签处理程序池。这是一个编译选项。它不会改变已经编译过的 JSP 的行为。true 或 false，默认为 true。
- engineOptionsClass - 允许指定用于配置 Jasper 的 Options 类。如果不存在，将使用默认的 EmbeddedServletOptions。
- errorOnUseBeanInvalidClassAttribute - 当 useBean 动作的 class 属性的值不是有效的 bean 类时，Jasper 是否应发出错误？true 或 false，默认为 true。
- fork - 是否让 Ant 在单独的 JVM 中执行 JSP 页面编译？true 或 false，默认为 true。
- genStringAsCharArray - 是否应将文本字符串生成为 char 数组，以在某些情况下提高性能？默认为 false。
- javaEncoding - 用于生成 Java 源文件的 Java 文件编码。

默认为 UTF8。
- keepgenerated - 是否应保留每个页面的生成的 Java 源代码，而不是删除它？true 或 false，默认为 true。
- mappedfile - 是否应使用一个 print 语句生成静态内容，以便易于调试？true 或 false，默认为 true。
- maxLoadedJsps - 加载到 Web 应用程序中的最大 JSP 数量。如果加载的 JSP 数量超过此限制，则将卸载最近未使用的 JSP，以便任何时刻加载的 JSP 数量不超过此限制。零或更少的值表示没有限制。默认值为 -1。
- jspIdleTimeout - JSP 可空闲的时间量（以秒为单位），在此之后将卸载它。零或更少的值表示永不卸载。默认值为 -1。
- modificationTestInterval - 导致在指定的时间间隔（以秒为单位）内不检查 JSP（及其依赖文件）是否已修改，从上次检查 JSP 是否已修改的时间开始计算。值为 0 会导致每次访问时都检查 JSP。仅在开发模式下使用。默认为 4 秒。
- recompileOnFail - 如果 JSP 编译失败，是否应忽略 modificationTestInterval，并在下次访问时触发重新编译尝试？仅在开发模式下使用，默认情况下禁用，因为编译可能很昂贵，并且可能导致资源使用过多。
- scratchdir - 编译 JSP 页面时应使用的临时目录是什么？默认为当前 Web 应用程序的工作目录。
- suppressSmap - 是否应抑制 JSR45 调试的 SMAP 信息的生成？true 或 false，默认为 false。
- trimSpaces - 是否应从输出中删除完全由空格组成的模板文本（true），替换为空格（single），还是保持不变（false）？或者，扩展选项将从模板文本中删除前导和尾随空格，并将模板文本中的空格和换行符序列折叠到单个换行符。请注意，如果 JSP 页面或标签文件指定了 trimDirectiveWhitespaces 值为 true，则该设置将优先于此配置设置。默认为 false。
- xpoweredBy - 由生成的 Servlet 添加 X-Powered-By 响应头？true 或 false，默认为 false。
- strictQuoteEscaping - 当属性值中使用脚本表达式时，是否严格应用 JSP.1.6 中关于引号字符转义的规则？true 或 false，默认为 true。
- quoteAttributeEL - 当 JSP 页面中的属性值中使用 EL 时，是否应用 JSP.1.6 中描述的属性引号规则到表达式中？true 或 false，默认为 true。
- variableForExpressionFactory - 用于表达式语言表达式工厂的变量名称。如果未指定，则将使用默认值 _el_expressionfactory。
- variableForInstanceManager - 用于实例管理器工厂的变量名称。如果未指定，则将使用默认值 _jsp_instancemanager。
- poolTagsWithExtends - 默认情况下，使用 extends 属性从其自己的基类指定的 JSP 将禁用标签池，因为 Jasper 无法保证已进行必要的初始化。这可能会对性能产生负面影响。通过提供替代的基类调用 Servlet.init() 中的 _jspInit()，将此属性设置为 true 将启用使用替代基类的池。如果替代基类不调用 _jspInit() 并且此属性为 true，则在尝试使用标签时将会发生 NPE。true 或 false，默认为 false。
- strictGetProperty - 如果为 true，则要求在 jsp:getProperty 动作中引用的对象在之前必须被“引入”到 JSP 处理器中，如 JSP 2.0 和后续版本的规范 JSP.5.3 中所指定的。true 或 false，默认为 true。
- strictWhitespace - 如果为 false，则将松开属性名称之前的空格的要求，以便缺少空格不会导致错误。true 或 false，默认为 true。
- jspServletBase - 从 JSP 生成的 Servlet 的基类。如果未指定，则将使用默认值 org.apache.jasper.runtime.HttpJspBase。
- serviceMethodName - 基类调用的服务方法的名称。如果未指定，则将使用默认值 _jspService。
- servletClasspathAttribute - 提供 JSP 类路径的 ServletContext 属性的名称。如果未指定，则将使用默认值 org.apache.catalina.jsp_classpath。
- jspPrecompilationQueryParameter - 导致 JSP 引擎仅预生成 Servlet 而不调用它的查询参数的名称。如果未指定，则将使用默认值 jsp_precompile，如 JSP 规范（JSP.11.4.2）中定义的。
- generatedJspPackageName - 编译 JSP 的默认包名称。如果未指定，则将使用默认值 org.apache.jsp。
- generatedTagFilePackageName - 来自标签文件生成的标签处理程序的默认包名称。如果未指定，则将使用默认值 org.apache.jsp.tag。
- tempVariableNamePrefix - 用于生成临时变量名称的前缀。如果未指定，则将使用默认值 _jspx_temp。
- useInstanceManagerForTags - 如果为 true，则使用实例管理器来获取标签处理程序实例。true 或 false，默认为 false。
- limitBodyContentBuffer - 如果为 true，则任何标签缓冲区扩展超出 bodyContentTagBufferSize 初始化参数值的标签缓冲区都将被销毁，并创建一个新的缓冲区。true 或 false，默认为 false。
- bodyContentTagBufferSize - 创建标签缓冲区时要使用的大小（以字符为单位）。如果未指定，则将使用默认值 org.apache.jasper.Constants.DEFAULT_TAG_BUFFER_SIZE（512）。

Eclipse JDT 中的 Java 编译器作为默认编译器包含在内。它是一个先进的 Java 编译器，将从 Tomcat 类加载器加载所有依赖项，这将在具有数十个 JAR 的大型安装上进行编译时有很大帮助。在快速服务器上，这将允许即使对于大型 JSP 页面也可以实现次秒级别的重新编译周期。

以前 Tomcat 版本中使用的 Apache Ant 可以用作新编译器的替代方案，方法是通过上面解释的编译器属性进行配置。

如果需要更改应用程序的 JSP Servlet 设置，可以通过重新定义 /WEB-INF/web.xml 中的 JSP Servlet 来覆盖默认配置。

然而，如果尝试在另一个容器上部署应用程序，可能会导致问题，因为 JSP Servlet 类可能无法识别。

可以通过使用特定于 Tomcat 的 /WEB-INF/tomcat-web.xml 部署描述符来解决此问题。其格式与 /WEB-INF/web.xml 相同。

它将覆盖任何默认设置，但不覆盖 /WEB-INF/web.xml 中的设置。由于它是 Tomcat 特定的，因此仅在应用程序部署在 Tomcat 上时才会处理。



# 已知问题

如 bug 39089 中所述，已知的 JVM 问题 bug 6294277 可能会在编译非常大的 JSP 时导致 java.lang.InternalError: name is too long to represent 异常。如果观察到这种情况，则可以通过以下方式解决：

- 减小 JSP 的大小
- 通过将 suppressSmap 设置为 true 来禁用 SMAP 生成和 JSR-045 支持。

## 生产配置

可以进行的主要 JSP 优化是对 JSP 的预编译。然而，这可能不可行（例如，当使用 jsp-property-group 功能时）或不实际，在这种情况下，Jasper servlet 的配置变得至关重要。

在生产 Tomcat 服务器中使用 Jasper 2 时，您应考虑从默认配置中进行以下更改。

- development - 要禁用对 JSP 页面编译的访问检查，请将其设置为 false。
- genStringAsCharArray - 为了生成稍微更有效的 char 数组，请将其设置为 true。
- modificationTestInterval - 如果必须出于任何原因设置 development 为 true（例如，动态生成 JSP），将其设置为一个较高的值将显著提高性能。
- trimSpaces - 要从响应中删除不必要的字节，请考虑将其设置为 single 或 extended。

## Web 应用程序编译

使用 Ant 是使用 JSPC 编译 Web 应用程序的首选方法。请注意，当预编译 JSP 时，仅当 suppressSmap 为 false 且 compile 为 true 时，SMAP 信息才会包含在最终类中。使用下面给出的脚本（"deployer" 下载中包含类似的脚本）来预编译 webapp：

```xml
<project name="Webapp Precompilation" default="all" basedir=".">

   <import file="${tomcat.home}/bin/catalina-tasks.xml"/>

   <target name="jspc">

    <jasper
             validateXml="false"
             uriroot="${webapp.path}"
             webXmlInclude="${webapp.path}/WEB-INF/generated_web.xml"
             outputDir="${webapp.path}/WEB-INF/src" />

  </target>

  <target name="compile">

    <mkdir dir="${webapp.path}/WEB-INF/classes"/>
    <mkdir dir="${webapp.path}/WEB-INF/lib"/>

    <javac destdir="${webapp.path}/WEB-INF/classes"
           debug="on" failonerror="false"
           srcdir="${webapp.path}/WEB-INF/src"
           excludes="**/*.smap">
      <classpath>
        <pathelement location="${webapp.path}/WEB-INF/classes"/>
        <fileset dir="${webapp.path}/WEB-INF/lib">
          <include name="*.jar"/>
        </fileset>
        <pathelement location="${tomcat.home}/lib"/>
        <fileset dir="${tomcat.home}/lib">
          <include name="*.jar"/>
        </fileset>
        <fileset dir="${tomcat.home}/bin">
          <include name="*.jar"/>
        </fileset>
      </classpath>
      <include name="**" />
      <exclude name="tags/**" />
    </javac>

  </target>

  <target name="all" depends="jspc,compile">
  </target>

  <target name="cleanup">
    <delete>
        <fileset dir="${webapp.path}/WEB-INF/src"/>
        <fileset dir="${webapp.path}/WEB-INF/classes/org/apache/jsp"/>
    </delete>
  </target>

</project>
```

## 运行脚本

可以使用以下命令行来运行脚本（将令牌替换为 Tomcat 基本路径和应预编译的 Web 应用程序路径）：

```
$ANT_HOME/bin/ant -Dtomcat.home=<$TOMCAT_HOME> -Dwebapp.path=<$WEBAPP_PATH>
```

然后，必须将预编译期间生成的 Servlet 的声明和映射添加到 Web 应用程序部署描述符中。将 ${webapp.path}/WEB-INF/generated_web.xml 插入到 ${webapp.path}/WEB-INF/web.xml 文件的正确位置。重新启动 Web 应用程序（使用管理器）并测试以确保它使用预编译的 Servlet 正常运行。还可以在 Web 应用程序部署描述符中放置适当的令牌，以使用 Ant 过滤功能自动插入生成的 Servlet 声明和映射。这实际上是 Tomcat 分发的所有 Web 应用程序在构建过程中自动编译的方式。

在 jasper 任务中，您可以使用 addWebXmlMappings 选项，将 ${webapp.path}/WEB-INF/generated_web.xml 与当前 Web 应用程序部署描述符合并在一起，位于 ${webapp.path}/WEB-INF/web.xml。

当您希望为 JSP 使用特定版本的 Java 时，请添加 javac 编译器任务属性 source 和 target，并使用适当的值。例如，使用 16 来为 Java 16 编译 JSP。

对于生产环境，您可能希望使用 debug="off" 来禁用调试信息。

当您不希望在第一个 JSP 语法错误时停止 JSP 生成时，请使用 failOnError="false"，并且使用 showSuccess="true" 将所有成功的 JSP 到 Java 生成打印出来。有时，当您清理生成的 Java 源文件位于 ${webapp.path}/WEB-INF/src 和编译的 JSP Servlet 类位于 ${webapp.path}/WEB-INF/classes/org/apache/jsp 时，这非常有帮助。

提示：

当您切换到另一个 Tomcat 版本时，请使用新的 Tomcat 版本重新生成和重新编译您的 JSP。
使用 Servlet 上下文参数来禁用 PageContext 池化 org.apache.jasper.runtime.JspFactoryImpl.POOL_SIZE=-1，并通过 JSP Servlet init-param limitBodyContentBuffer=true 限制缓冲。请注意，从默认值更改可能会影响性能，但这将取决于应用程序。

## 优化

Jasper 提供了许多扩展点，使用户能够优化其环境的行为。

其中一个扩展点是标签插件机制。这允许为 Web 应用程序提供替代的标签处理程序实现。通过位于 WEB-INF 下的 tagPlugins.xml 文件注册标签插件。Jasper 包含了 JSTL 的一个示例插件。

第二个扩展点是表达式语言解释器。可以通过 ServletContext 配置替代解释器。有关如何配置替代 EL 解释器的详细信息，请参阅 ELInterpreterFactory javadoc。在 org.apache.jasper.optimizations.ELInterpreterTagSetters 中提供了一个主要针对标签设置的替代解释器。有关优化和它们对规范合规性的影响的详细信息，请参阅 javadoc。

还提供了将字符串值强制转换为枚举的扩展点。它提供在 org.apache.jasper.optimizations.StringInterpreterEnum。有关优化以及它们对规范合规性的影响的详细信息，请参阅 javadoc。




# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/jasper-howto.html

* any list
{:toc}