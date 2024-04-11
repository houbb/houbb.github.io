---
layout: post
title: web server apache tomcat11-33-CDI 
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---

# Tomcat 中添加 CDI 和 JAX-RS 支持指南

## CDI 2 支持

CDI 2 支持由 `modules/owb` 可选模块提供。它打包了 Apache OpenWebBeans 项目，并允许将 CDI 2 支持添加到 Tomcat 容器中。该模块的构建过程使用 Apache Maven，并不作为二进制捆绑包提供，因为它是使用一些公开可用的 JAR 构建的。

构建 CDI 支持的过程如下：

```bash
cd $TOMCAT_SRC/modules/owb
mvn clean && mvn package
```

生成的 JAR 文件位于 `target/tomcat-owb-x.y.z.jar`（其中 x.y.z 取决于构建过程中使用的 Apache OpenWebBeans 版本），应通过 Jakarta EE 的 Tomcat 迁移工具处理，然后放置到 Tomcat 安装的 lib 文件夹中。

可以通过在 server.xml 中 Server 元素的嵌套中添加以下监听器来为容器中的所有 Web 应用程序启用 CDI 支持：

```xml
<Listener className="org.apache.webbeans.web.tomcat.OpenWebBeansListener" optional="true" startWithoutBeansXml="false" />
```

如果 CDI 容器加载失败，监听器将产生非致命错误。

也可以通过在 Server 元素的嵌套中的 webapp context.xml 文件中添加以下监听器来为单个 Web 应用程序启用 CDI 支持：

```xml
<Listener className="org.apache.webbeans.web.tomcat.OpenWebBeansContextLifecycleListener" />
```

## JAX-RS 支持

JAX-RS 支持由 `modules/cxf` 可选模块提供。它打包了 Apache CXF 项目，并允许将 JAX-RS 支持添加到单个 Web 应用程序中。该模块的构建过程使用 Apache Maven，并不作为二进制捆绑包提供，因为它是使用一些公开可用的 JAR 构建的。此支持依赖于 CDI 2 支持，CDI 2 支持应已在容器或 Web 应用程序级别先前安装。

构建 JAX-RS 支持的过程如下：

```bash
cd $TOMCAT_SRC/modules/cxf
mvn clean && mvn package
```

生成的 JAR 文件位于 `target/tomcat-cxf-x.y.z.jar`（其中 x.y.z 取决于构建过程中使用的 Apache CXF 版本），然后应放置到所需 Web 应用程序的 `/WEB-INF/lib` 文件夹中。

如果 CDI 2 支持在容器级别可用，则该 JAR 文件也可以放置在 Tomcat lib 文件夹中，但在这种情况下，CXF Servlet 声明必须根据需要单独添加到每个 Web 应用程序中（通常由 JAR 中存在的 Web 片段加载）。应使用的 CXF Servlet 类是 `org.apache.cxf.cdi.CXFCdiServlet`，应将其映射到 JAX-RS 资源可用的所需根路径。

整个 Web 应用程序应通过 Jakarta EE 的 Tomcat 迁移工具处理。

## Eclipse Microprofile 支持

ASF（Apache Software Foundation）提供了使用 CDI 2 扩展实现 Eclipse Microprofile 规范的工件。安装了 CDI 2 和 JAX-RS 支持后，它们将可供单个 Web 应用程序使用。

以下实现可用（参考：`org.apache.tomee.microprofile.TomEEMicroProfileListener`）作为必须添加到 Web 应用程序 `/WEB-INF/lib` 文件夹的 Maven 工件：

- 配置：Maven 工件：`org.apache.geronimo.config:geronimo-config`，CDI 扩展类：`org.apache.geronimo.config.cdi.ConfigExtension`
- 容错：Maven 工件：`org.apache.geronimo.safeguard:safeguard-parent`，CDI 扩展类：`org.apache.safeguard.impl.cdi.SafeguardExtension`
- 健康：Maven 工件：`org.apache.geronimo:geronimo-health`，CDI 扩展类：`org.apache.geronimo.microprofile.impl.health.cdi.GeronimoHealthExtension`
- 指标：Maven 工件：`org.apache.geronimo:geronimo-metrics`，CDI 扩展类：`org.apache.geronimo.microprofile.metrics.cdi.MetricsExtension`
- 开放追踪：Maven 工件：`org.apache.geronimo:geronimo-opentracing`，CDI 扩展类：`org.apache.geronimo.microprofile.opentracing.microprofile.cdi.OpenTracingExtension`
- OpenAPI：Maven 工件：`org.apache.geronimo:geronimo-openapi`，CDI 扩展类：`org.apache.geronimo.microprofile.openapi.cdi.GeronimoOpenAPIExtension`
- REST 客户端：Maven 工件：`org.apache.cxf:cxf-rt-rs-mp-client`，CDI 扩展类：`org.apache.cxf.microprofile.client.cdi.RestClientExtension`
- JSON Web 令牌：注意：仅供参考，在 Apache TomEE 外不可用；Maven 工件：`org.apache.tomee:mp-jwt`，CDI 扩展类：`org.apache.tomee.microprofile.jwt.cdi.MPJWTCDIExtension`

# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/cdi.html

* any list
{:toc}