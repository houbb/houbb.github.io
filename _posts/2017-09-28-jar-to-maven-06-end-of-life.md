---
layout: post
title:  maven-06-maven 中央仓库 OSSRH 停止服务，Central Publishing Portal 迁移实战笔记
date:  2017-09-28 18:52:13 +0800
categories: [Maven]
tags: [maven, bash, bat, sh]
published: true
---

# maven 系列

[maven-01-发布到中央仓库概览](https://houbb.github.io/2017/09/28/jar-to-maven-01-overview)

[maven-02-发布到中央仓库常用脚本](https://houbb.github.io/2017/09/28/jar-to-maven-02-script)

[maven-03-发布到中央仓库之持续集成](https://houbb.github.io/2017/09/28/jar-to-maven-03-ci)

[maven-04-发布到中央仓库之 Ignore Licence](https://houbb.github.io/2017/09/28/jar-to-maven-04-ignore-licence)

[maven-05-maven 配置进阶学习](https://houbb.github.io/2017/09/28/jar-to-maven-05-maven-advanced)

[maven-06-maven 中央仓库 OSSRH 停止服务，Central Publishing Portal 迁移实战](https://houbb.github.io/2017/09/28/jar-to-maven-06-end-of-life)

# 前言

今天发布一下自己的项目到 maven 中央仓库，报错：

```
[ERROR] Failed to execute goal org.apache.maven.plugins:maven-deploy-plugin:2.7:deploy (default-deploy) on project sensitive-word: Failed to deploy artifacts: Could not transfer artifact com.github.houbb:sensitive-word:jar:
0.26.1 from/to oss (https://oss.sonatype.org/service/local/staging/deploy/maven2/): Authorization failed for https://oss.sonatype.org/service/local/staging/deploy/maven2/com/github/houbb/sensitive-word/0.26.1/sensitive-word-0.26.1.jar 403 Forbidden -> [Help 1]
```

很奇怪，为什么不行了？

## 原因

在 [maven 仓库页面](https://oss.sonatype.org/#welcome) 可以看到一句话：

```
The OSSRH service will reach end-of-life on June 30th, 2025. Learn more about how to transfer to the Central Publishing Portal here.
```

就是 

```
OSSRH 服务将于 2025 年 6 月 30 日停止服务。请点击此处了解如何迁移到 Central Publishing Portal。
```

> [Central Publishing Portal 如何迁移](https://central.sonatype.org/pages/ossrh-eol/#central-support)

# 实战的一些笔记

下面记录了老马从旧的 OSSRH 迁移到 Central Publishing Portal 的笔记。

## 登录

我们登录 [https://central.sonatype.com/](https://central.sonatype.com/)

使用以前的 OSSRH 账户密码登录即可，发现是可以的。

当然也可以重新注册。参考 [Register to Publish Via OSSRH](https://central.sonatype.org/register/legacy/#create-an-account)

## Namespace 概念

注册好之后,我们需要创建Namespace才能发包,Namespace相当于我们maven项目中的 Group Id ,你得拥有这个Namespace,才能发布以这个Namespace为Group Id的包,否则是没有权限的. Namespace的拥有者也可以邀请你协助发包.

当然创建Namespace,需要你证明你拥有该域名.如果你没有域名,但是你的代码托管在某些代码托管平台,也可以创建 [托管平台域名.用户名] 格式的Namespace,具体创建和验证方式,官方已经说的很清楚了: 

[Register a Namespace](https://central.sonatype.org/register/namespace/),这里就不再赘述.

创建好Namespace后,就可以发包了,当然还需要做一些准备工作,例如创建Portal Token,生成GPG签名等.这些我就不单独说明了.

本篇文章的重点是从OSSRH迁移到Central Portal, 创建Token这些也会在迁移过程中提现,大体上是一样的.当然你也可以参考官方文档: [Publishing Your Components](https://central.sonatype.org/publish-ea/publish-ea-guide/#publishing-your-components)

## 从 OSSRH 迁移到Central Portal

之前注册过OSSRH的同学,登录后会自动跳转到Namespaces界面,如果没有跳转, 右上角点击你的头像(用户名),然后点击 View Namespaces 即可, 或者 [点此跳转](https://central.sonatype.com/publishing/namespaces)

Namespaces 页面会自动列出你的 OSSRH 中的 Namespaces, 我们可以选中一个进行迁移

目前迁移有两个限制:

1) Namespace 只能有一个发布者

2) Namespace 不能有父 Namespace 或者子Namespace

当然随着Central Portal不断完善,这些限制也会逐步取消

老马发现自己的默认就是 `Central Portal Namespaces`，应该是迁移完成了。

```
Central Portal Namespaces
com.github.houbb
```

如下图

![maven-central-migrate](https://houbb.github.io/static/img/2025-07-05-maven-central-migrate.png)

### 启用 snapshots

也可以点击右侧的【...】，选择 `Enable SNAPSHOTs`，来启用 snapshots。不过我暂时用不到。

## 直接通过 portal maven 插件发布

下面是项目 pom.xml 中旧的配置文件内容。

```xml
<profiles>
        <profile>
            <id>release</id>
            <build>
                <plugins>
                    <!-- Source -->
                    <plugin>
                        <groupId>org.apache.maven.plugins</groupId>
                        <artifactId>maven-source-plugin</artifactId>
                        <version>${plugin.maven-source-plugin.version}</version>
                        <executions>
                            <execution>
                                <phase>package</phase>
                                <goals>
                                    <goal>jar-no-fork</goal>
                                </goals>
                            </execution>
                        </executions>
                    </plugin>
                    <!-- Javadoc -->
                    <plugin>
                        <groupId>org.apache.maven.plugins</groupId>
                        <artifactId>maven-javadoc-plugin</artifactId>
                        <version>${plugin.maven-javadoc-plugin.version}</version>
                        <executions>
                            <execution>
                                <phase>package</phase>
                                <goals>
                                    <goal>jar</goal>
                                </goals>
                            </execution>
                        </executions>
                    </plugin>
                    <!-- GPG -->
                    <plugin>
                        <groupId>org.apache.maven.plugins</groupId>
                        <artifactId>maven-gpg-plugin</artifactId>
                        <version>${plugin.maven-gpg-plugin.version}</version>
                        <executions>
                            <execution>
                                <phase>verify</phase>
                                <goals>
                                    <goal>sign</goal>
                                </goals>
                            </execution>
                        </executions>
                    </plugin>
                </plugins>
            </build>
            <distributionManagement>
                <snapshotRepository>
                    <id>oss</id>
                    <url>https://oss.sonatype.org/content/repositories/snapshots/</url>
                </snapshotRepository>
                <repository>
                    <id>oss</id>
                    <url>https://oss.sonatype.org/service/local/staging/deploy/maven2/</url>
                </repository>
            </distributionManagement>
        </profile>
    </profiles>
```

Central Publisher Portal 支持通过 Maven 进行发布，这里直接调整为对应的 `central-publishing-maven-plugin` 插件信息

```xml
    <profiles>
        <profile>
            <id>release</id>
            <build>
                <plugins>
                    <plugin>
                        <groupId>org.sonatype.central</groupId>
                        <artifactId>central-publishing-maven-plugin</artifactId>
                        <version>0.8.0</version>
                        <extensions>true</extensions>
                        <configuration>
                            <publishingServerId>central</publishingServerId>
                        </configuration>
                    </plugin>
                    

                    <!-- Source -->
                    <plugin>
                        <groupId>org.apache.maven.plugins</groupId>
                        <artifactId>maven-source-plugin</artifactId>
                        <version>${plugin.maven-source-plugin.version}</version>
                        <executions>
                            <execution>
                                <phase>package</phase>
                                <goals>
                                    <goal>jar-no-fork</goal>
                                </goals>
                            </execution>
                        </executions>
                    </plugin>
                    <!-- Javadoc -->
                    <plugin>
                        <groupId>org.apache.maven.plugins</groupId>
                        <artifactId>maven-javadoc-plugin</artifactId>
                        <version>${plugin.maven-javadoc-plugin.version}</version>
                        <executions>
                            <execution>
                                <phase>package</phase>
                                <goals>
                                    <goal>jar</goal>
                                </goals>
                            </execution>
                        </executions>
                    </plugin>
                    <!-- GPG -->
                    <plugin>
                        <groupId>org.apache.maven.plugins</groupId>
                        <artifactId>maven-gpg-plugin</artifactId>
                        <version>${plugin.maven-gpg-plugin.version}</version>
                        <executions>
                            <execution>
                                <phase>verify</phase>
                                <goals>
                                    <goal>sign</goal>
                                </goals>
                            </execution>
                        </executions>
                    </plugin>
                </plugins>
            </build>
        </profile>
    </profiles>
```

### 插件介绍

Central Publisher Portal 支持通过 Maven 进行发布。

```
该插件不会生成构建有效发布包所需的所有前置文件，因此您需要按照文档的说明自行构建 Javadoc 和 sources 的 `.jar` 文件，以及 GPG 签名文件。

此外，还有一些额外的元数据要求（特别是在 POM 文件中必须包含的字段），这些是插件不会强制校验的。请参阅我们的\[要求文档]\(requirements documentation)获取指导。

该插件会为发布包中的文件生成必要的校验和。请参见下方的插件配置选项。默认情况下，它会生成所有可接受格式的校验和（MD5、SHA1、SHA256 和 SHA512）。
```

说明，插件本身并不提供 Sources/Javadocs/gpg signature，如果不添加对应的插件，实际上会上传失败，尝试过报错如下：

```
Deployment 311052ae-940e-445c-8c1f-edc141b86ad9 failed
pkg:maven/com.github.houbb/sensitive-word@0.26.1:
 - Sources must be provided but not found in entries
 - Javadocs must be provided but not found in entries
 - Missing signature for file: sensitive-word-0.26.1.jar
 - Missing signature for file: sensitive-word-0.26.1.pom
```

## 令牌

发布是需要令牌的。

我们需要在 [https://central.sonatype.org/publish/generate-portal-token/](https://central.sonatype.org/publish/generate-portal-token/) 页面生成对应的令牌。

登录页面，在 [https://central.sonatype.com/account](https://central.sonatype.com/account) 页面点击【Generate User Token】

会生成对应的账户信息，把这个信息放在 maven 的 `.m2` 下的 `setting.xml` 中。

```xml
<settings>
  <servers>
    <server>
      <id>central</id>
      <username><!-- your token username --></username>
      <password><!-- your token password --></password>
    </server>
  </servers>
</settings>
```

## deploy 部署到中央仓库
 
当您的构建配置完成后，运行 mvn deploy 将生成一个发布包并将其上传到 Portal 进行验证。

成功发布的输出大致如下所示：

执行命令：

```
mvn clean deploy -P release -Dmaven.test.skip=true
```

其中 `-Dmaven.test.skip=true` 用于跳过测试。

成功日志如下：

```
[INFO] --- central-publishing-maven-plugin:0.8.0:publish (injected-central-publishing) @ sensitive-word ---
[INFO] Using Central baseUrl: https://central.sonatype.com
[INFO] Using credentials from server id central in settings.xml
[INFO] Using Usertoken auth, with namecode: ~~~~~~~
[INFO] Staging 7 files
[INFO] Staging D:\github\sensitive-word\target\sensitive-word-0.26.1.jar
[INFO] Installing D:\github\sensitive-word\target\sensitive-word-0.26.1.jar to D:\github\sensitive-word\target\central-staging\com\github\houbb\sensitive-word\0.26.1\sensitive-word-0.26.1.jar
[INFO] Installing D:\github\sensitive-word\pom.xml to D:\github\sensitive-word\target\central-staging\com\github\houbb\sensitive-word\0.26.1\sensitive-word-0.26.1.pom
[INFO] Staging D:\github\sensitive-word\target\sensitive-word-0.26.1-sources.jar
[INFO] Installing D:\github\sensitive-word\target\sensitive-word-0.26.1-sources.jar to D:\github\sensitive-word\target\central-staging\com\github\houbb\sensitive-word\0.26.1\sensitive-word-0.26.1-sources.jar
[INFO] Staging D:\github\sensitive-word\target\sensitive-word-0.26.1-javadoc.jar
[INFO] Installing D:\github\sensitive-word\target\sensitive-word-0.26.1-javadoc.jar to D:\github\sensitive-word\target\central-staging\com\github\houbb\sensitive-word\0.26.1\sensitive-word-0.26.1-javadoc.jar
[INFO] Staging D:\github\sensitive-word\target\sensitive-word-0.26.1.jar.asc
[INFO] Installing D:\github\sensitive-word\target\sensitive-word-0.26.1.jar.asc to D:\github\sensitive-word\target\central-staging\com\github\houbb\sensitive-word\0.26.1\sensitive-word-0.26.1.jar.asc
[INFO] Staging D:\github\sensitive-word\target\sensitive-word-0.26.1.pom.asc
[INFO] Installing D:\github\sensitive-word\target\sensitive-word-0.26.1.pom.asc to D:\github\sensitive-word\target\central-staging\com\github\houbb\sensitive-word\0.26.1\sensitive-word-0.26.1.pom.asc
[INFO] Staging D:\github\sensitive-word\target\sensitive-word-0.26.1-sources.jar.asc
[INFO] Installing D:\github\sensitive-word\target\sensitive-word-0.26.1-sources.jar.asc to D:\github\sensitive-word\target\central-staging\com\github\houbb\sensitive-word\0.26.1\sensitive-word-0.26.1-sources.jar.asc        
[INFO] Staging D:\github\sensitive-word\target\sensitive-word-0.26.1-javadoc.jar.asc
[INFO] Installing D:\github\sensitive-word\target\sensitive-word-0.26.1-javadoc.jar.asc to D:\github\sensitive-word\target\central-staging\com\github\houbb\sensitive-word\0.26.1\sensitive-word-0.26.1-javadoc.jar.asc        
[INFO] Pre Bundling - deleted D:\github\sensitive-word\target\central-staging\com\github\houbb\sensitive-word\maven-metadata-central-staging.xml
[INFO] Generate checksums for dir: com\github\houbb\sensitive-word\0.26.1
[INFO] Going to create D:\github\sensitive-word\target\central-publishing\central-bundle.zip by bundling content at D:\github\sensitive-word\target\central-staging
[INFO] Created bundle successfully D:\github\sensitive-word\target\central-staging\central-bundle.zip
[INFO] Going to upload D:\github\sensitive-word\target\central-publishing\central-bundle.zip
[INFO] Uploaded bundle successfully, deployment name: Deployment, deploymentId: 93b6a38b-412a-47e7-b220-b7cd92c1e6f3. Deployment will require manual publishing
[INFO] Waiting until Deployment 93b6a38b-412a-47e7-b220-b7cd92c1e6f3 is validated
[INFO] Deployment 93b6a38b-412a-47e7-b220-b7cd92c1e6f3 has been validated. To finish publishing visit https://central.sonatype.com/publishing/deployments
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  40.747 s
[INFO] Finished at: 2025-07-05T16:55:39+08:00
[INFO] ------------------------------------------------------------------------
```

## 完成发布

我们访问 [https://central.sonatype.com/publishing/deployments](https://central.sonatype.com/publishing/deployments) 可以看到等待我们发布的 jar 信息。

和以前 oss 类似，【Drop】移除，【Publish】发布。我们点击发布按钮即可。

安心等待发布完成，可以点击上方的【Refresh】刷新。

(发布的体感比较慢，主要是没有 OSSRH 的具体执行进度。大概等个十多分钟)

等到看到 published 已发布的绿色状态，说明发布完成，可以像以前一样正常使用。

# 参考资料

https://central.sonatype.org/publish/publish-portal-maven/

https://central.sonatype.org/publish/publish-portal-api/#uploading-a-deployment-bundle

https://blog.csdn.net/qq213539/article/details/145294380

* any list
{:toc}