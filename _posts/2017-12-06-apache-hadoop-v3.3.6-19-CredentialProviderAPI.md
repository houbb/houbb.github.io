---
layout: post
title:  Apache Hadoop v3.3.6-19-CredentialProvider API Guide
date:  2017-12-06 05:47:35 +0800
categories: [Apache]
tags: [apache, big-data, hadoop]
published: true
---

## Overview

CredentialProvider API是用于插入可扩展凭证提供程序的SPI框架。

凭证提供程序用于将敏感令牌、密钥和密码的使用与其存储和管理的详细信息分离开来。选择各种存储机制来保护这些凭证的能力使我们能够将这些敏感资产保存为密文，远离窥探的目光，可能由第三方解决方案进行管理。

此文档旨在描述CredentialProvider API的设计、开箱即用的实现以及它们的使用方式以及如何采用它们的使用方式。

## Usage

### Usage Overview

让我们快速概述在Hadoop中保护密码或其他敏感令牌的凭证提供程序框架的使用。

**为什么使用它？**

有些部署对于如何在集群中存储和管理敏感令牌（如密码）非常敏感。例如，可能存在安全最佳实践和策略，要求这些信息永远不以明文形式存储。企业部署可能需要使用首选解决方案来管理凭据，因此我们需要一种方法来插入这些集成。

**常规使用模式**

Hadoop项目和生态系统中有很多地方可以利用凭证提供程序API，而这个数字还在不断增长。通常，使用模式包括相同的要求和流程。

1. 在特定于提供程序的存储中提供凭据。可以通过hadoop credential命令或可能通过提供程序特定的管理工具来完成此提供。
2. 配置凭证提供程序路径属性。提供程序路径属性`hadoop.security.credential.provider.path`是一个由逗号分隔的一个或多个凭证提供程序URI的列表，在尝试解析凭证别名时会遍历该列表。
   - 可以在core-site.xml中或与core-site.xml合并的特定于组件的配置文件中配置此属性。
   - 对于命令行界面（例如DistCp的界面），可以通过hadoop系统属性（“-D property=value”）添加该属性，并动态添加到Configuration中。
3. 使用新的`Configuration.getPassword`方法解析其凭证的功能或组件将自动获取对凭证提供程序API的支持。
   - 通过使用与现有明文密码相同的属性名称，此机制允许迁移到凭证提供程序，同时提供对明文的向后兼容性。
   - 在回退到配置中的明文密码之前，将审查整个凭证提供程序路径。
4. 不使用Hadoop的`org.apache.hadoop.conf.Configuration`类进行配置的功能或组件，或者具有凭证提供程序的其他内部用途的功能或组件，可以选择使用CredentialProvider API本身。
   - 可以在`Configuration.getPassword`和其单元测试中找到其使用的示例。

### Provision Credentials

**示例：ssl.server.keystore.password**

```bash
hadoop credential create ssl.server.keystore.password -value 123 \
  -provider localjceks://file/home/lmccay/aws.jceks
```

别名名称与用于从`Configuration.get()`方法获取凭据的配置属性相同。

### Configuring the Provider Path

现在，我们需要确保在运行时Configuration.getPassword方法已知此提供的凭证存储。如果没有配置凭证提供程序路径，则Configuration.getPassword()将跳过对凭证提供程序API的查询。因此，很重要的是在core-site.xml或组件的等效文件中配置以下内容。

```xml
<property>
  <name>hadoop.security.credential.provider.path</name>
  <value>localjceks://file/home/lmccay/aws.jceks</value>
  <description>Path to interrogate for protected credentials.</description>
</property>
```

有关提供程序路径的一些其他注意事项：

- 方案用于指示上述情况中的提供程序类型，例如localjceks提供程序不依赖于Hadoop FileSystem API，有时为了避免递归依赖，可能需要使用该方案。另一种由jceks表示的提供程序使用Hadoop FileSystem API，并且可以支持在HDFS或其他兼容文件系统中提供的密钥存储。第三种提供程序类型是用户类型。此提供程序可以管理存储在进程的Credentials文件中

的凭据。
- 路径配置接受一条由逗号分隔的提供程序或凭据存储路径。`Configuration.getPassword`方法将查询每个提供程序，按顺序进行，直到解析别名或用尽列表。根据对凭证的运行时需求，我们可能需要配置要检查的提供程序链。

总之，首先将凭证提供给提供程序，然后为功能或组件配置提供程序，它通常将通过使用`Configuration.getPassword`方法自动获取。

## Supported Features

| Feature/Component      | Description                                                                                                                                                                                              | Link                           |
|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------|
| LDAPGroupsMapping       | LDAPGroupsMapping用于在LDAP中查找给定用户的组。使用CredentialProvider API来保护LDAP绑定密码以及SSL所需的密码。                                                                                   | [LDAP Groups Mapping](#)       |
| SSL Passwords           | FileBasedKeyStoresFactory利用凭证提供程序API来解析与SSL相关的密码。                                                                                                                                      | [TODO](#)                      |
| HDFS                    | DFSUtil使用Configuration.getPassword()使用凭证提供程序API和/或回退到ssl-server.xml中存储的明文值。基于Zookeeper的联邦状态存储和故障转移控制器使用Configuration.getPassword来获取Zookeeper身份验证信息，提供回退到明文身份验证信息。 | [TODO](#)                      |
| YARN                    | WebAppUtils通过Configuration的新方法getPassword来使用凭证提供程序API。这为在ssl-server.xml文件中以明文形式存储密码的情况提供了替代方案，同时保持向后兼容性。基于Zookeeper的资源管理器状态存储使用Configuration.getPassword来获取Zookeeper身份验证信息，提供回退到明文身份验证信息。 | [TODO](#)                      |
| KMS                     | 使用HttpServer2.loadSSLConfiguration，该方法利用Configuration.getPassword来读取与SSL相关的凭据。它们可以通过凭证提供程序解析，或者在允许时从配置中获取明文。                                  | [KMS](#)                       |
| HttpFS                   | 使用HttpServer2.loadSSLConfiguration，该方法利用Configuration.getPassword来读取与SSL相关的凭据。它们可以通过凭证提供程序解析，或者在允许时从配置中获取明文。                                  | [HttpFS Server Setup](#)       |
| AWS S3A                  | 使用Configuration.getPassword来获取S3凭据。它们可以通过凭证提供程序API解析，也可以从配置中获取以保持向后兼容性。                                                                              | [AWS S3/S3A Usage](#)          |
| Azure WASB               | 使用Configuration.getPassword来获取WASB凭据。它们可以通过凭证提供程序API解析，也可以从配置中获取以保持向后兼容性。                                                                           | [Azure WASB Usage](#)          |
| Azure ADLS               | 使用Configuration.getPassword来获取ADLS凭据。它们可以通过凭证提供程序API解析，也可以从配置中获取以保持向后兼容性。                                                                          | [Azure ADLS Usage](#)          |
| Apache Accumulo          | trace.password属性由跟踪器用于与Accumulo进行身份验证并将跟踪持久化在trace表中。使用CredentialProvider API从提供程序或从配置中获取trace.password。                                                    | [TODO](#)                      |
| Apache Slider            | 向Slider添加了一个功能，以提示用户获取所需的密码，并使用CredentialProvider存储它们，以便稍后由应用程序检索。                                                                                 | [TODO](#)                      |
| Apache Hive              | 通过Credential Provider API保护了元存储密码、与SSL相关的密码和JDO字符串密码。                                                                                                                         | [TODO](#)                      |
| Apache HBase             | HBase RESTServer使用新的Configuration.getPassword方法，因此将首先检查凭证提供程序API，然后在允许时回退到明文。                                                                                  | [TODO](#)                      |
| Apache Oozie             | 使用Credential Provider API保护SSL、电子邮件和JDBC密码。                                                                                                                                              | [TODO](#)                      |
| Apache Ranger            | 使用Credential Provider API保护数据库、信任和密钥库密码。                                                                                                                                             | [TODO](#)                      |

(Note: "TODO" indicates that the specific link or documentation is not provided in the current content.)

以下是技术文档的中文翻译，表格形式的部分已经尽量使用表格返回：

## Credential Management **凭证管理**

*Hadoop 凭证命令*
```
用法: hadoop credential <子命令> [选项]

详见命令手册中的命令选项详情
```

凭证命令用于为特定凭证存储提供程序提供密码或密钥。为了明确指定使用哪个提供程序存储，应使用 `-provider` 选项。

**示例:** `hadoop credential create ssl.server.keystore.password -provider jceks://file/tmp/test.jceks`

为了指定特定的提供程序类型和位置，用户必须在 `core-site.xml` 中提供 `hadoop.security.credential.provider.path` 配置元素，或在每个凭证管理命令上使用命令行选项 `-provider`。该提供程序路径是一个逗号分隔的 URL 列表，指示应查询的提供程序类型和位置。例如，以下路径: `user:///,jceks://file/tmp/test.jceks,jceks://hdfs@nn1.example.com/my/path/test.jceks` 表示应通过用户提供程序查询当前用户的凭证文件，本地文件 `/tmp/test.jceks` 是 Java Keystore 提供程序，而位于 HDFS 中的文件 `nn1.example.com/my/path/test.jceks` 也是 Java Keystore 提供程序的存储。

**提供程序类型**
| 提供程序类型                          | 提供程序 URI                    | 描述                                                                                                             |
| ------------------------------------ | ------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| UserProvider                         | user:///                       | 从用户的凭证文件中检索凭证。该文件用于存储执行作业和应用程序所需的各种令牌、秘密和密码。                                   |
| JavaKeyStoreProvider                 | jceks://SCHEME/path-to-keystore | 从文件系统中的 Java keystore 文件中检索凭证。底层使用 Hadoop 文件系统 API 允许在本地文件系统或群集存储中存储凭证。          |
| LocalJavaKeyStoreProvider            | localjceks://file/path-to-keystore | 从必须存储在本地文件系统上的 Java keystore 中访问凭证。这对于凭证可能导致对 HDFS 访问的递归依赖是必要的。             |
| BouncyCastleFIPSKeyStoreProvider     | bcfks://SCHEME/path-to-keystore  | 从文件系统中的 Bouncy Castle FIPS keystore 文件中检索凭证。底层使用 Hadoop 文件系统 API 允许在本地文件系统或群集存储中存储凭证。  |
| LocalBouncyCastleFIPSKeyStoreProvider | localbcfks://file/path-to-keystore | 从必须存储在本地文件系统上的 Bouncy Castle FIPS keystore 中访问凭证。这对于凭证可能导致对 HDFS 访问的递归依赖是必要的。   |

当凭证存储在文件系统中时，遵循以下规则：

- 存储在本地 `localjceks://` 或 `localbcfks://` 文件中的凭证在读取配置的过程中加载。对于在 YARN 应用程序中使用，这意味着它们必须在整个群集的本地文件系统中可见。
- 使用 `jceks://` 或 `bcfks://` 提供程序存储的凭证可以存储在群集文件系统中，因此在整个群集中可见，但不能存储在需要特定凭证才能访问的文件系统中。

为了使用 `jceks` URI 包装文件系统 URI，请按照以下步骤操作。Bouncy Castle FIPS 提供程序遵循相似的步骤，用 `bcfks` 替换 `jceks` 并配置 OS/JDK 级 FIPS 提供程序。

1. 将文件系统 URI，例如 `hdfs://namenode:9001/users/alice/secrets.jceks`。
2. 在 URL 前面加上 `jceks://`：`jceks://hdfs://namenode:9001/users/alice/secrets.jceks`。
3. 用 @ 符号替换第二个 `://` 字符：`jceks://hdfs@namenode:9001/users/alice/secrets.jceks`。

**示例**

为了避免无限递归，文件系统（如abfs、s3a、adls和wasb）明确排除存储在其自身文件系统方案中的路径上的密钥库，即使它们存储在使用不同一组凭据的容器中，也是如此。

例如，不能使用存储在 `s3a://shared/secrets/secret.jceks` 中的凭据来读取容器 `s3a://private/` 的凭据。

| Path URI                                             | jceks URI                                                 |
| ---------------------------------------------------- | --------------------------------------------------------- |
| `hdfs://namenode.example.org:9001/user/alice/secret.jceks` | `jceks://hdfs@namenode.example.org:9001/user/alice/secret.jceks` |
| `file:///tmp/secrets.jceks`                         | `jceks://file/tmp/secret.jceks`                           |
| `s3a://container1/secrets/secret.jceks`             | `jceks://s3a@container1/secrets/secret.jceks`             |
| `wasb://account@container/secret.jceks`             | `jceks://wasb@account@container/secret.jceks`             |
| `abfs://account@container/secret.jceks`             | `jceks://abfs@account@container/secret.jceks`             |
| `https://user:pass@service/secret.jceks?token=aia`  | `jceks://https@user:pass@service/secret.jceks?token=aia` |

**密钥库密码**

Java中的密钥库通常由密码保护。基于OS级文件权限以及可能存在于目标文件系统的任何其他基于策略的访问保护，是保护基于密钥库的凭据提供程序的主要方法。

尽管密码不是保护的主要来源，但了解所需的机制和可用的选项以管理这些密码非常重要。

同样，了解在运行时将需要访问用于保护密钥库的密码的所有相关方也非常重要。

**选项**

| 选项                        | 描述                                                    | 备注                                               |
| --------------------------- | ------------------------------------------------------- | -------------------------------------------------- |
| Default password            | 这是一个硬编码为“none”的密码。                            | 这是一个在开源项目中硬编码的密码，因此具有明显的缺点。然而，机制部分将显示它比其他更复杂的选项更简单，因此几乎同样安全。 |
| Environment variable        | `HADOOP_CREDSTORE_PASSWORD`                              | 该选项使用环境变量来传递密码，该密码应在 `hadoop.security.credential.provider.path` 配置属性中配置的所有密钥库中使用。路径中的所有基于密钥库的提供程序都需要使用相同的密码进行保护。 |
| Password-file               | `hadoop.security.credstore.java-keystore-provider.password-file` | 该选项使用“side file”，其位置在 `hadoop.security.credstore.java-keystore-provider.password-file` 配置属性中配置，以传递密码，该密码应在 `hadoop.security.credential.provider.path` 配置属性中配置的所有密钥库中使用。 |

**机制**

极其重要的是要考虑到对保护的凭证的所有运行时消费者（MapReduce 作业/应用程序）都需要访问用于保护密钥库提供程序的密码。

传递这个密码可以通过多种方式完成，上述的选项部分对此进行了描述。

| 密钥库密码          | 描述                                                                                                           | 同步要求 | 明文 | 文件权限 |
| ------------------- | -------------------------------------------------------------------------------------------------------------- | -------- | ---- | -------- |
| Default Password    | 默认情况下硬编码的密码。实际上，当使用默认密码为所有基于密钥库的凭证存储时，我们利用文件权限来保护凭证存储，而密钥库密码只是持久化密钥库的形式。 | 否       | 是   | 否（已记录）|
| Environment Variable | `HADOOP_CREDSTORE_PASSWORD` 环境变量必须设置为用于配置在 `provider path` 中可能配置的所有密钥库的自定义密码。路径中的所有基于密钥库的提供程序的环境变量都需要使用相同的密码。设置环境变量可能需要从脚本或其他明文存储机制设置。正在运行的进程的环境变量可以通过各种 Unix 命令获得。 | 是       | 是   | 否       |
| Password File        | `hadoop.security.credstore.java-keystore-provider.password-file` 配置属性必须设置为包含可能在 `provider path` 中配置的所有密钥库的自定义密码的“side file”位置。需要访问基于密钥库的凭证提供程序的任何进程都需要将此配置属性设置为适当的文件位置。对于整个以逗号分隔的提供程序路径只有一个密码文件。很难知道每个密钥库所需的密码，因此建议对所有基于密钥库的凭证提供程序使用相同的密码以避免此问题。密码文件是需要管理的额外文件，以明文存储密码，并且需要设置文件权限，以确保只有需要访问它们的人能够访问。如果文件权限设置不当，则访问密钥库的密码将以明文形式提供。 | 是       | 是   | 是       |

使用默认密码意味着无需对运行时消费者进行额外的通信/同步。默认密码已知，但文件权限是保护密钥库的主要手段。

当文件权限被规遇时，与“side files”不同，没有标准工具可以暴露受保护的凭证——即使知道密码也是如此。Keytool 需要六个或更多字符的密码，而且不知道如何从密钥库中检索一般的秘密。编辑器不会显示存储在密钥库中的秘密，也不会显示 cat、more 或任何其他标准工具。这就是为什么密钥库提供程序比“side file”存储凭据更好的原因。

尽管如此，有人很容易编写代码来使用 API 访问存储在基于密钥库的凭证提供程序中的凭据。再次强调，当使用默认密码时，密码只是持久化密钥库的形式。唯一的保护是文件权限和操作系统级别的访问策略。

用户可能决定使用“side file” 存储密钥库本身的密码，这是支持的。只是需要注意这种正确性级别所需的机制非常重要。

**禁用回退到明文**

如果没有凭证提供程序，或者无法找到密钥，Credentials.getPassword() 操作会回退到使用配置 XML 文件中的条目。

可以通过将配置选项 `hadoop.security.credential.clear-text-fallback` 从 true 更改为 false 来禁用此操作：

```xml
<property>
  <name>hadoop.security.credential.clear-text-fallback</name>
  <value>false</value>
  <description>
    true 或 false 表示是否回退到将凭证密码存储为明文。默认值为 true。此属性仅在无法从凭证提供程序获取密码时起作用。
  </description>
</property>
```

一旦设置，通过 getPassword() API 查找的所有配置选项都必须通过凭证提供程序提供。

# 参考资料

https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/CredentialProviderAPI.html

* any list
{:toc}