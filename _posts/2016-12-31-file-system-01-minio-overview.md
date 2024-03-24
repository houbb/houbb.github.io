---
layout: post
title: 分布式存储系统-01-minio 入门介绍
date:  2016-12-31 10:48:42 +0800
categories: [File]
tags: [distributed, file]
published: true
---

# MinIO

[MinIO](https://github.com/minio/minio) 是一个在GNU Affero通用公共许可证v3.0下发布的高性能对象存储系统。它与亚马逊S3云存储服务兼容的API。

使用MinIO构建用于机器学习、分析和应用程序数据工作负载的高性能基础架构。

此README提供了在裸机硬件上运行MinIO的快速入门说明，包括基于容器的安装。对于Kubernetes环境，请使用MinIO Kubernetes Operator。

## 容器安装

使用以下命令将独立的MinIO服务器作为容器运行。

独立的MinIO服务器最适合早期开发和评估。某些功能，如版本控制、对象锁定和桶复制，需要使用纠删码分布式部署MinIO。

对于扩展开发和生产，使用启用纠删码的MinIO部署，具体来说，每个MinIO服务器至少需要4个驱动器。有关更完整的文档，请参阅MinIO纠删码概述。

### 稳定版本

运行以下命令以使用临时数据卷将MinIO的最新稳定镜像作为容器运行：

```
podman run -p 9000:9000 -p 9001:9001 \
  quay.io/minio/minio server /data --console-address ":9001"
```

MinIO部署将使用默认的根凭据minioadmin:minioadmin启动。您可以使用MinIO Console进行部署测试，这是MinIO服务器内置的嵌入式对象浏览器。将运行在主机机器上的Web浏览器指向http://127.0.0.1:9000，并使用根凭据登录。您可以使用浏览器创建存储桶、上传对象，并浏览MinIO服务器的内容。

您还可以使用任何兼容S3的工具连接，比如MinIO客户端mc命令行工具。有关使用mc命令行工具的详细信息，请参阅使用MinIO客户端mc进行测试。对于应用程序开发人员，请参阅https://min.io/docs/minio/linux/developers/minio-drivers.html查看支持的语言的MinIO SDK。

注意：要在具有持久性存储的环境中部署MinIO，您必须使用podman -v选项将主机操作系统上的本地持久性目录映射到容器中。

例如，-v /mnt/data:/data将主机操作系统上的/mnt/data驱动器映射到容器上的/data。

## window10 安装笔记

要在64位Windows主机上运行MinIO，请从以下URL下载MinIO可执行文件：

[https://dl.min.io/server/minio/release/windows-amd64/minio.exe](https://dl.min.io/server/minio/release/windows-amd64/minio.exe)

使用以下命令在Windows主机上运行独立的MinIO服务器。将D:\替换为您希望MinIO存储数据的驱动器或目录的路径。

您必须更改终端或PowerShell目录到minio.exe可执行文件所在的位置，或将该目录的路径添加到系统的$PATH：

```bash
minio.exe server D:\
```

MinIO部署将使用默认的根凭据minioadmin:minioadmin启动。

您可以使用MinIO Console进行部署测试，这是MinIO服务器内置的嵌入式基于Web的对象浏览器。

将运行在主机机器上的Web浏览器指向http://127.0.0.1:9000，并使用根凭据登录。

您可以使用浏览器创建存储桶、上传对象，并浏览MinIO服务器的内容。

您还可以使用任何兼容S3的工具连接，比如MinIO客户端mc命令行工具。有关使用mc命令行工具的详细信息，请参阅使用MinIO客户端mc进行测试。

对于应用程序开发人员，请参阅[MinIO SDKs for supported languages](https://min.io/docs/minio/linux/developers/minio-drivers.html)查看支持的语言的MinIO SDK。

注意：独立的MinIO服务器最适合早期开发和评估。

某些功能，如版本控制、对象锁定和桶复制，需要使用纠删码分布式部署MinIO。

对于扩展开发和生产，请使用启用纠删码的MinIO部署，具体来说，每个MinIO服务器至少需要4个驱动器。

有关更完整的文档，请参阅[MinIO Erasure Code Overview](https://docs.min.io/docs/minio-erasure-code-quickstart-guide.html)。

### 默认凭证

minioadmin:minioadmin

# oss-spring-boot-starter

兼容S3协议的通用文件存储工具类

- MINIO

- 阿里云

- 华为云

- 腾讯云

- 京东云

## maven

```xml
<dependency>
    <groupId>com.pig4cloud.plugin</groupId>
    <artifactId>oss-spring-boot-starter</artifactId>
    <version>${lastVersion}</version>
</dependency>
```

## 配置文件

```
oss:
  endpoint: http://minio.pig4cloud.com
  access-key: lengleng
  secret-key: lengleng
```

## 代码

```java
@Autowired
private OssTemplate template;
/**
 * 上传文件
 * 文件名采用uuid,避免原始文件名中带"-"符号导致下载的时候解析出现异常
 *
 * @param file 资源
 * @return R(bucketName, filename)
 */
@PostMapping("/upload")
public R upload(@RequestParam("file") MultipartFile file, HttpServletRequest request) {
	template.putObject(CommonConstants.BUCKET_NAME, fileName, file.getInputStream());
	return R.ok(resultMap);
}
```



# chat

## 详细介绍下什么事文件存储 s3 协议

S3（Simple Storage Service）是由亚马逊（Amazon）提供的对象存储服务，是亚马逊Web Services（AWS）的一部分。

S3协议是S3服务用于管理和存储数据的API规范，它采用HTTP协议，并基于RESTful设计原则。

S3协议主要用于文件存储，它提供了简单而强大的接口，允许用户在云中存储和检索大量的非结构化数据，如图片、视频、文档等。

以下是S3协议的一些关键特点和概念：

1. **存储桶（Bucket）：** 在S3中，数据存储在称为存储桶的容器中。每个存储桶都有一个唯一的名称，且在全局范围内必须是唯一的。存储桶是S3存储层次结构的最上层。

2. **对象（Object）：** 存储在S3存储桶中的每个文件都称为对象。对象包含数据、元数据（键/值对）和一个唯一的键。对象的键是在存储桶内唯一的。

3. **访问权限控制：** S3提供了灵活的访问权限控制，可以通过存储桶策略（Bucket Policies）、访问控制列表（Access Control Lists，ACLs）和AWS Identity and Access Management（IAM）来管理。这样，用户可以精确控制对存储桶和对象的读写权限。

4. **数据一致性：** S3提供了强一致性和事件ual一致性。在写入后，数据将立即对所有后续读取请求可见，确保了数据的一致性。

5. **版本控制：** S3支持版本控制，允许用户对存储桶中的对象进行版本控制。这使得用户可以检索、还原以及删除对象的先前版本。

6. **事件通知：** S3可以配置为在存储桶中的对象上发生特定事件时触发通知。这使得用户能够建立基于对象变更的自动化工作流程。

7. **数据传输加密：** S3通过SSL/TLS进行数据传输加密，以确保在传输过程中数据的安全性。

8. **多区域复制：** 用户可以设置多区域复制，将存储桶中的数据在不同AWS区域之间进行复制，以提高数据的可用性和灾难恢复能力。

对于S3协议，虽然它最初是亚马逊AWS的一部分，但由于其广泛的采用，其他对象存储服务（如MinIO、Ceph等）也实现了S3兼容的API，以使用户能够在不同的云环境中轻松迁移和使用S3的生态系统。

## 详细介绍一下技术中间件 MinIO

MinIO 是一种开源的对象存储服务器，它允许用户构建高性能的分布式存储基础设施。

MinIO 主要用于存储大量的非结构化数据，比如图片、视频、日志文件等。下面是对 MinIO 技术中间件的详细介绍：

### 1. 对象存储

MinIO 是一个对象存储系统，它采用分布式架构来存储和检索对象。对象存储是一种数据存储方式，其中数据被组织为对象，每个对象都有一个唯一的标识符，通常是一个键。MinIO 对象存储支持标准的 HTTP/RESTful API，这意味着你可以使用各种编程语言和工具来访问和管理存储在 MinIO 中的数据。

### 2. 分布式架构

MinIO 被设计为高度可扩展的分布式存储系统。它允许用户将存储容量水平扩展，通过添加新的节点来增加存储容量和性能。分布式架构使得 MinIO 能够应对大规模的数据和高并发的访问需求。

### 3. 兼容 S3

MinIO 完全兼容Amazon S3 API，这意味着你可以使用现有的 S3 客户端工具和库与 MinIO 进行交互。

这种兼容性使得 MinIO 成为一个理想的替代品，可以用于搭建私有云存储或混合云环境，同时保持与 AWS S3 兼容的应用程序的无缝迁移。

### 4. 安全性

MinIO 提供了一系列安全特性，包括数据加密、访问控制、身份验证等。你可以配置 MinIO 来使用 TLS/SSL 进行数据传输加密，并通过访问策略和身份验证机制来控制用户对存储桶和对象的访问权限。

### 5. 高性能

MinIO 被设计为高性能的对象存储系统。它采用分布式方式存储数据，并通过并行处理来提高数据的读写性能。MinIO 还利用了现代硬件的优势，包括 SSD、多核处理器等，以确保最佳的性能表现。

### 6. 基于事件的触发器

MinIO 支持基于事件的触发器，允许用户在对象存储上设置触发器来响应特定的事件，比如在对象创建、删除或修改时触发某些操作。这使得 MinIO 更加灵活，可以与其他系统进行集成，构建复杂的工作流程。

### 7. 社区支持和活跃开发

MinIO 是一个开源项目，拥有活跃的社区支持和开发团队。这意味着用户可以从社区中获取支持，参与讨论，提出建议，并在项目的持续改进中发挥作用。

总体而言，MinIO 是一个强大而灵活的对象存储解决方案，适用于各种规模和类型的应用程序，从小型项目到大规模企业级应用。

## 开源的对象存储系统还有哪些？越多越好

开源的对象存储系统有很多，以下是一些比较知名的开源对象存储系统：

1. **Ceph：** Ceph 是一个分布式存储系统，提供对象存储、块存储和文件系统。它设计用于高性能和高可靠性，并支持横向扩展。

2. **Swift：** OpenStack Swift 是 OpenStack 项目的一部分，为对象存储提供了一个高度可扩展和可靠的解决方案。它是一个基于 RESTful 的存储系统。

3. **MinIO：** 如前面所述，MinIO 是一个高性能的、S3 兼容的对象存储系统，适用于私有云和混合云环境。

4. **RadosGW：** RadosGW 是 Ceph 存储系统的一部分，它提供 S3 和 Swift 的接口，允许你使用 Ceph 存储系统作为后端。

5. **OpenIO：** OpenIO 是一个开源的对象存储系统，它专注于大规模分布式存储。它支持对象、块和文件存储。

6. **MinStor：** MinStor 是一个开源的、轻量级的对象存储系统，具有简单的部署和管理。它采用 Go 语言编写。

7. **Rook：** Rook 是一个开源的云原生存储编排系统，它可以在 Kubernetes 上运行 Ceph、NFS、EdgeFS（分布式对象存储）等存储系统。

8. **Scality Ring：** Scality Ring 是一个分布式存储解决方案，提供对象存储、文件存储和块存储。它设计用于支持大规模的、可扩展的存储需求。

9. **DragonDisk：** DragonDisk 是一个跨平台的 Amazon S3 客户端，它不仅是一个客户端工具，也是一个开源的对象存储系统。

10. **SeaweedFS：** SeaweedFS 是一个简单且高效的分布式文件系统，支持对象存储和文件存储。

请注意，这只是一小部分开源对象存储系统的列表，社区和市场上还存在许多其他项目和解决方案。

选择适合你需求的对象存储系统时，建议考虑性能、可靠性、可扩展性、安全性以及社区活跃度等因素。

## 给出上面这些的对比表格

以下是一些开源对象存储系统的简要对比，考虑到系统的不同特点，表格中包含了一些关键方面的比较。

请注意，这只是一个概览，具体的需求和场景可能需要更详细的评估。

| 特性/系统        | Ceph              | Swift (OpenStack) | MinIO            | RadosGW (Ceph)    | OpenIO          | MinStor           | Rook (Ceph)    | Scality Ring  | DragonDisk        | SeaweedFS      |
|-----------------|-------------------|-------------------|------------------|-------------------|-----------------|-------------------|-----------------|---------------|-------------------|---------------|
| **对象存储**    | ✓                 | ✓                 | ✓                | ✓                 | ✓               | ✓                 | ✓               | ✓             | ✓                 | ✓             |
| **块存储**      | ✓                 | ✗                 | ✗                | ✓                 | ✗               | ✗                 | ✓               | ✓             | ✗                 | ✗             |
| **文件系统**    | ✓                 | ✗                 | ✗                | ✓                 | ✓               | ✗                 | ✓               | ✓             | ✗                 | ✓             |
| **兼容 S3**      | 部分              | 部分              | ✓                | ✓                 | ✗               | 部分              | ✓               | ✓             | ✓                 | ✗             |
| **分布式架构**   | ✓                 | ✓                 | ✓                | ✓                 | ✓               | ✓                 | ✓               | ✓             | ✓                 | ✓             |
| **易用性**      | 中等              | 中等              | 高               | 中等              | 中等            | 高                | 中等            | 中等          | 高                | 中等          |
| **安全性**      | ✓                 | ✓                 | ✓                | ✓                 | ✓               | ✓                 | ✓               | ✓             | ✓                 | ✓             |
| **社区支持**    | 高                | 高                | 高               | 高                | 中等            | 中等              | 高              | 中等          | 中等              | 中等          |
| **部署难度**    | 中等              | 中等              | 低               | 中等              | 中等            | 低                | 中等            | 中等          | 低                | 中等          |

这个表格只是一个简单的比较，实际选择时还需要根据具体的需求、场景和优先级进行更详细的评估。

每个系统都有其独特的特点和优势，取决于具体的使用情境，可能有不同的最佳选择。

## 给出所有 java 技术栈的开源对象存储系统

以下是一些基于Java技术栈的开源对象存储系统：

1. **MinIO:** MinIO 是一个高性能的开源对象存储系统，使用Go语言编写，但提供了Java SDK，允许Java开发人员轻松地与MinIO进行集成。

2. **Ceph:** Ceph 是一个分布式存储系统，其中的 RadosGW（RADOS Gateway）组件提供了对象存储服务。虽然 Ceph 是用C++编写的，但它提供了 Java 的 SDK，使得 Java 开发人员可以方便地使用 Ceph 对象存储服务。

3. **OpenIO:** OpenIO 是一个基于对象存储的分布式存储系统，使用C言语编写，但它提供了Java客户端库，以支持Java开发人员在其应用程序中使用 OpenIO。

这里列举的系统中，MinIO 的 Java SDK 是直接面向 Java 开发者的，而Ceph 和 OpenIO 虽然主要使用其他语言编写，但提供了Java的客户端库，使得Java开发者可以轻松地与它们进行集成。

这些系统都是开源的，可以根据具体需求选择合适的对象存储解决方案。

# 小结

s3 协议是一个好东西，可以让很多非标的东西标准化起来。

文件服务器发展到今天，如果从头开始创建成本比较高，直接这种基于成熟的工具部署，然后通过 java client 访问的方式还是很方便的。

# 参考资料

https://github.com/metersphere/metersphere

* any list
{:toc}