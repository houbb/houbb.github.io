---
layout: post
title: 分布式存储系统-24-S3SQL 
date:  2016-12-31 10:48:42 +0800
categories: [File]
tags: [distributed, dfs, cloud-native, file]
published: true
---


# S3QL

S3QL 是一个文件系统，它使用像 `Google Storage`、`Amazon S3` 或 OpenStack 等存储服务来在线存储所有数据。

S3QL 实际上提供了一个动态、无限容量的虚拟驱动器，可以从任何有互联网连接的计算机访问。

S3QL 是一个功能齐全的 UNIX 文件系统，在概念上与本地文件系统（如 ext4）无法区分。此外，S3QL 还具有额外的功能，如压缩加密、数据去重、不可变树和快照，使其特别适合在线备份和归档。

S3QL 的设计强调简单性和优雅性，而非性能和功能的逐渐增加。

代码从一开始就注重可读性和可维护性。

固有的错误检测和处理被包括在内，S3QL 配有大量自动化的测试用例，涵盖了其所有组件。

- [Google Storage](https://cloud.google.com/storage/docs)
- [Amazon S3](https://aws.amazon.com/s3/)
- [OpenStack](https://www.openstack.org/software/)

---

### 特性

* **透明性**：从概念上讲，S3QL 与本地文件系统无法区分。例如，它支持硬链接、符号链接、标准 UNIX 权限、扩展属性和最大 2 TB 的文件大小。
* **动态大小**：S3QL 文件系统的大小会根据需求动态增长和缩小。
* **压缩**：所有数据在存储前可以使用 LZMA、bzip2 或 deflate（gzip）算法进行压缩。
* **加密**：在压缩（但在上传前）后，所有数据都可以使用 256 位密钥进行 AES 加密。额外的 SHA256 HMAC 校验和用于保护数据免受篡改。
* **数据去重**：如果多个文件内容相同，冗余数据只会存储一次。这适用于文件系统中所有文件，即使文件的部分内容相同，其他部分不同。
* **不可变树**：目录树可以设置为不可变，这样其内容就不能再以任何方式更改。可以用来确保备份在创建后不能被修改。
* **写时复制快照**：S3QL 可以复制整个目录树而不使用额外的存储空间。只有当其中一个副本被修改时，修改的数据部分才会占用额外的存储空间。这可以用来创建智能快照，保存目录在不同时间点的状态，并且占用最少的空间。
* **网络延迟独立的性能**：所有不涉及写入或读取文件内容的操作（如创建目录、移动、重命名、修改文件和目录的权限）都非常快速，因为它们是通过没有任何网络交易进行的。

  S3QL 通过将整个文件和目录结构保存在数据库中来实现这一点。这个数据库被本地缓存，并且远程副本是异步更新的。

* **支持低带宽连接**：S3QL 将文件内容拆分为较小的块，并将这些块本地缓存。这最小化了读取和写入数据所需的网络事务次数，并减少了当文件部分读取或写入时需要传输的数据量。

---

### 开发状态

S3QL 被认为是稳定的，并适用于生产环境。从版本 2.17.1 开始，S3QL 使用语义化版本控制。这意味着不兼容的版本（例如需要升级文件系统版本的版本）将在主版本号增加时反映出来。

---

### 支持的平台

S3QL 在 Linux 下开发和测试。用户还报告了 S3QL 在 OS-X、FreeBSD 和 NetBSD 上成功运行。我们尽力保持与这些系统的兼容性，但由于缺乏预发布测试人员，我们无法保证每个版本都能在所有非 Linux 系统上运行。如果您发现任何 bug，请报告，我们会尽力修复。

---

### 常见用法

在挂载文件系统之前，需要初始化存储数据的后端。这可以通过 *mkfs.s3ql* 命令完成。这里我们使用 Amazon S3 后端，*nikratio-s3ql-bucket* 是将存储文件系统的 S3 存储桶。

```bash
mkfs.s3ql s3://ap-south-1/nikratio-s3ql-bucket
```

要将存储在 S3 存储桶 *nikratio_s3ql_bucket* 中的 S3QL 文件系统挂载到目录 `/mnt/s3ql`，请输入：

```bash
mount.s3ql s3://ap-south-1/nikratio-s3ql-bucket /mnt/s3ql
```

现在，您可以让您最喜欢的备份程序将备份写入目录 `/mnt/s3ql`，数据将存储在 Amazon S3 上。完成后，必须使用以下命令卸载文件系统：

```bash
umount.s3ql /mnt/s3ql
```

---

### 需要帮助？

以下资源可用：

* `S3QL 用户指南`_
* `S3QL Wiki`_
* `S3QL 邮件列表`_。您可以通过发送邮件到 `s3ql+subscribe@googlegroups.com` 进行订阅。
* 请报告您遇到的任何 bug，在 `GitHub 问题跟踪器`_ 中进行报告。

---

### 贡献

S3QL 的源代码可以在 GitHub 上找到。

- [S3QL 用户指南](https://www.rath.org/s3ql-docs/)
- [S3QL Wiki](https://github.com/s3ql/s3ql/wiki)
- [S3QL 邮件列表](https://groups.google.com/g/s3ql)
- [GitHub 问题跟踪器](https://github.com/s3ql/s3ql/issues)
- [GitHub](https://github.com/s3ql/s3ql)


# 参考资料

https://github.com/s3ql/s3ql/blob/master/README.rst

* any list
{:toc}