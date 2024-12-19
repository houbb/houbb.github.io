---
layout: post
title: java 程序如何打包成为一个可执行文件？ lzPack 
date:  2017-06-28 23:15:43 +0800
categories: [Java]
tags: [jdk, java]
published: true
---

# 拓展阅读

[Java Functional java 函数式编程](https://houbb.github.io/2017/06/29/java-functional)

[Java Lambda](https://houbb.github.io/2017/06/28/java-lambda)

# lzPack 

# IzPack  
[![Java CI with Maven](https://github.com/izpack/izpack/actions/workflows/maven.yml/badge.svg)](https://github.com/izpack/izpack/actions/workflows/maven.yml)  
[![Apache License 2.0](https://img.shields.io/badge/license-Apache%20License%202.0-blue)](http://www.apache.org/licenses/LICENSE-2.0)  
[![Maven Central](https://maven-badges.herokuapp.com/maven-central/org.codehaus.izpack/izpack-core/badge.svg)](https://search.maven.org/search?q=g:org.codehaus.izpack)  
[![Java 8](https://img.shields.io/badge/java-8-blue.svg)](https://adoptium.net/)  
[![javadoc](https://javadoc.io/badge2/org.codehaus.izpack/izpack-api/javadoc.svg)](https://javadoc.io/doc/org.codehaus.izpack/izpack-api)

[IzPack](http://izpack.org/) 是一个广泛使用的工具，用于将 Java 平台上的应用程序打包为跨平台的安装程序。

## 许可证

IzPack 发布在 [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0) 下，这意味着你可以根据需要进行修改，几乎没有任何限制。

一些第三方组件（例如外观和感觉库）可能会在不同的许可证下发布。

## 从源代码构建 IzPack

IzPack 需要 Java SE 1.8 和至少 Maven 3。由于 JDK 兼容性，使用 JDK 1.8 编译时，最大支持的 Maven 版本为 3.6.3。

```bash
mvn verify install
```

构建会生成一个 IzPack 安装程序 JAR 文件，位于 `izpack-dist/target` 目录下。

IzPack Maven 插件位于 `izpack-maven-plugin` 模块中。

## 为 IzPack 做贡献

虽然在 [我们的 JIRA 跟踪器](https://izpack.atlassian.net/) 上报告问题很有帮助，但调查并提供修补程序要好得多！

我们建议你 [遵循我们的贡献指南](http://izpack.org/developers/)，特别是你需要在 GitHub 上拥有一个 [https://github.com/izpack/izpack](https://github.com/izpack/izpack) 的分支。

然后，你可以通过拉取请求贡献代码。

我们非常倾向于通过拉取请求而不是在 JIRA 问题中附加补丁来进行贡献。

## 资源

在从 Codehaus 服务迁移时，我们将不同的服务分配给了不同的提供商。由于迁移速度较快，暂时没有出现与 Codehaus 服务相当的紧凑型解决方案。以下是一些无法避免的小问题。

如果你想了解项目提供的服务，请访问 [http://izpack.org/](http://izpack.org/) 网站。

基于 `master` 分支的最新快照构建可在 Sonatype 服务器上找到：

[https://oss.sonatype.org/content/repositories/snapshots/org/codehaus/izpack/](https://oss.sonatype.org/content/repositories/snapshots/org/codehaus/izpack/)

以下是不同提供商的新增服务列表：

### IzPack@Github

如果你想参与开发或改进我们的网站，可以注册一个 GitHub 账户并发送拉取请求。你只需要基本的 Git 知识和使用 GitHub 服务的经验。

目前请勿使用 GitHub 问题追踪器或 Wiki。我们使用更高级的服务来处理这部分内容。

#### 源代码

IzPack 的源代码托管在 [https://github.com/izpack/izpack](https://github.com/izpack/izpack) 上。  

查看“开发与贡献”部分，了解如何贡献代码修改。

克隆 GitHub 仓库，为每个修改创建一个分支，使用相关的 JIRA 问题作为分支名称，然后从该分支发送拉取请求，这样可以为每个发布创建变更日志，并避免将多个问题的变更混在一起。

#### 网站

IzPack 网站托管在 [https://github.com/izpack/izpack.github.io](https://github.com/izpack/izpack.github.io) 上。  
对于更大的更改或重构，请为每个更改创建一个特定的分支，并发送拉取请求。

最终的网站 [https://izpack.github.io](https://izpack.github.io) 通过相应的 DNS 配置直接转发到 izpack.org。

### IzPack@Sonatype

Sonatype 提供将快照和发布版部署到 Maven Central 仓库的服务。

作为一个开源项目，并且具备相应许可证，Sonatype 为我们的二进制文件提供了一个暂存仓库，并为我们免费提供 Nexus 专业版仓库服务。  
有关如何设置和使用该服务的更多信息，请查看我们的 Wiki 页面 [部署 IzPack](https://izpack.atlassian.net/wiki/display/IZPACK/Deploying+IzPack)。

### IzPack@Atlassian

我们已通过 Atlassian 提供的开源许可证，设置了新的 JIRA 和 Confluence 云实例。中央地址为 [https://izpack.atlassian.net/](https://izpack.atlassian.net/)。

虽然注册用户数量有限，但目前每个人都可以注册。

从 Codehaus JIRA 导入遗留问题后有一个缺点：JIRA 和 Confluence 使用相同的用户账户，每个用户可以单独启用这两个功能。以前的用户已连同他们参与的所有问题一起被重新创建，但只是他们的同义词。自动生成的用户名和邮件地址丢失。如果你之前已经在 Codehaus 注册，请在重新注册之前尝试在一些旧问题中查找你的用户名，并通过邮件联系我（重置）用户名和邮件地址。请告知我问题中显示的全名、当前的电子邮件地址以及你参与的至少一个 Codehaus JIRA 问题。这将有助于整理问题引用并清理重复的用户账户。之后，你可能能够重置该迁移账户的密码并重新登录。如果你认为这是个问题，直接注册也可以，我会定期手动清理用户账户。仅有 Confluence 用户需要重新注册。

你可以使用一个用户账户同时注册 JIRA 和 Confluence。你可以选择使用其中的任一服务。

#### 问题追踪器 - JIRA

IzPack 问题将继续通过 JIRA 进行跟踪，中央地址为 [https://izpack.atlassian.net/](https://izpack.atlassian.net/)。

顺便提一下，前 Codehaus 管理员慷慨提供了从旧的 Codehaus 问题到新地址的 HTTP 重定向，以防仍有旧链接。这已经为所有 IZPACK 问题激活，并且它们的 ID 保持不变。

GitHub 问题追踪已被禁用，以免混淆任何人，并且因为目前它过于简单，不能为我们提供实际的优势。

#### Confluence - Wiki

IzPack Wiki 已被重新导入并托管在 Confluence 上。与 GitHub Wiki 相比，Confluence 提供了更舒适的选择和更好的用户体验。

IzPack Confluence 的中央入口点为 [https://izpack.atlassian.net/wiki](https://izpack.atlassian.net/wiki)，或者直接查看 [IzPack 文档](https://izpack.atlassian.net/wiki/display/IZPACK/)。内容被视为与 IzPack 5 版本一致，欢迎直接帮助我们改进文档。

### IzPack@Twitter

IzPack 有一个 [Twitter 账户](https://twitter.com/izpack)。我们将在上面转发博客帖子，注册的 Twitter 用户也可以在上面发布推文。或者你也可以关注我们，以获取最新消息。


# 参考资料

https://github.com/orphan-oss/launch4j-maven-plugin/blob/master/src/main/resources/README.adoc


* any list
{:toc}