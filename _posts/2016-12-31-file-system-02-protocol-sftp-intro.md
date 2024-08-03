---
layout: post
title: 文件存储服务系统（File Storage Service System）-02-SFTP 协议介绍
date:  2016-12-31 10:48:42 +0800
categories: [File]
tags: [ftp, file]
published: true
---

# 文件服务系列

[文件存储服务系统（File Storage Service System）-00-文件服务器是什么？为什么需要？](https://houbb.github.io/2016/12/31/file-system-00-overview)

[文件存储服务系统（File Storage Service System）-01-常见的文件协议介绍](https://houbb.github.io/2016/12/31/file-system-01-protocol-overview)

[文件系统 FTP Ubuntu 安装入门介绍](https://houbb.github.io/2016/12/31/file-system-02-protocol-ftp-intro)

[文件存储服务系统（File Storage Service System）-02-SFTP 协议介绍](https://houbb.github.io/2016/12/31/file-system-02-protocol-sftp-intro)

[分布式文件服务系统（Distributed File System, DFS）-00-分布式文件服务系统是什么？](https://houbb.github.io/2016/12/31/file-system-distributed-00-overview)

[分布式存储系统-01-minio 入门介绍](https://houbb.github.io/2016/12/31/file-system-distributed-01-minio-overview)

[分布式存储系统-02-开源的分布式文件系统 Fastdfs 安装入门介绍](https://houbb.github.io/2016/12/31/file-system-distributed-02-fastdfs-intro)

[分布式存储系统-03-ceph 一个可扩展的分布式存储系统介绍](https://houbb.github.io/2016/12/31/file-system-distributed-03-ceph-intro)

[分布式存储系统-04-GlusterFS 是一个基于对象的开源分布式文件系统，适用于云存储和媒体流等场景](https://houbb.github.io/2016/12/31/file-system-distributed-04-glusterfs-intro)

[分布式存储系统-05-Lustre 是一个高性能的分布式文件系统，主要用于大型超级计算机集群](https://houbb.github.io/2016/12/31/file-system-distributed-05-lustre-intro)

[分布式存储系统-06-MooseFS 是一个开源的分布式文件系统，设计用于提供高可靠性和扩展性](https://houbb.github.io/2016/12/31/file-system-distributed-06-moosefs-intro)

[分布式存储系统-07-OpenAFS 是 Andrew File System 的开源实现，是一个分布式网络文件系统](https://houbb.github.io/2016/12/31/file-system-distributed-07-openafs-intro)

[分布式存储系统-08-OrangeFS 是 PVFS 的下一代版本，是一个面向高性能计算的开源并行文件系统](https://houbb.github.io/2016/12/31/file-system-distributed-08-orangefs-intro)

# chat

## 详细介绍一下 SFTP 文件协议

SFTP（SSH File Transfer Protocol）是一种用于通过安全通道传输文件的网络协议。

它作为 SSH（Secure Shell）协议的一部分，提供了安全的文件访问、传输和管理功能。以下是对 SFTP 文件协议的详细介绍：

### SFTP 协议概述

#### 工作原理

SFTP 是基于 SSH 协议的文件传输协议，通过加密的 SSH 连接提供文件传输服务。

它不同于传统的 FTP 和 FTPS 协议，不使用独立的传输通道，而是完全依赖于 SSH 通道。

#### 连接和认证

- **连接**：SFTP 使用标准的 SSH 端口（默认是 22）进行通信。客户端通过 SSH 连接到服务器，并在建立连接后启动 SFTP 子系统。
- **认证**：SFTP 继承了 SSH 的认证机制，支持基于密码、SSH 密钥和其他 SSH 认证方法。

### SFTP 命令和操作

SFTP 支持一组文件操作命令，以下是一些常见的命令：

- **ls / dir**：列出目录内容。
- **cd**：改变当前工作目录。
- **pwd**：显示当前工作目录。
- **get**：下载文件。
- **put**：上传文件。
- **rm**：删除文件。
- **mkdir**：创建目录。
- **rmdir**：删除目录。
- **rename**：重命名文件或目录。
- **chmod**：改变文件权限。
- **chown**：改变文件所有者。

这些命令在 SFTP 客户端中执行，通常是交互式命令行界面或图形用户界面（GUI）。

### 安全性

#### 加密和数据完整性

- **加密**：SFTP 通过 SSH 加密传输的数据，确保数据在传输过程中不被窃听或篡改。
- **数据完整性**：SSH 协议提供数据完整性校验，确保数据在传输过程中未被修改。

#### 认证

- **密码认证**：用户通过用户名和密码进行认证。
- **公钥认证**：用户通过 SSH 密钥对进行认证，提供更高的安全性。
- **双因素认证**：一些实现支持双因素认证，如密码+SSH 密钥或密码+一次性密码（OTP）。

### SFTP 的优缺点

#### 优点

- **安全性高**：通过 SSH 加密和认证，提供了高安全性的数据传输。
- **易用性**：与 FTP 类似的命令和操作，易于使用。
- **防火墙友好**：使用单一端口（通常是 22），比 FTP 的主动和被动模式更防火墙友好。
- **功能丰富**：支持文件的全面管理操作，如权限修改、文件重命名等。

#### 缺点

- **性能**：由于加密和认证过程，可能比未加密的 FTP 传输速度稍慢。
- **依赖 SSH**：需要 SSH 服务的支持，如果环境中没有 SSH 服务，SFTP 无法使用。

### 使用场景

- **安全文件传输**：在需要确保数据传输安全的场景中使用，如远程备份、机密数据传输等。
- **远程文件管理**：通过 SFTP 管理远程服务器上的文件，适合系统管理员和开发人员。
- **替代 FTP**：在需要替代不安全的 FTP 协议的场景中使用。

### SFTP 工具

#### SFTP 客户端

- **FileZilla**：跨平台的图形化 SFTP 客户端。
- **WinSCP**：Windows 平台下的 SFTP 客户端，支持图形界面和脚本。
- **Cyberduck**：支持 SFTP 的开源文件传输客户端，适用于 macOS 和 Windows。
- **OpenSSH**：提供命令行 SFTP 客户端，适用于大多数类 UNIX 系统。

#### SFTP 服务器

- **OpenSSH**：大多数 UNIX 和 Linux 系统默认安装的 SSH 服务，包含 SFTP 支持。
- **Bitvise SSH Server**：Windows 平台下的商业 SSH 和 SFTP 服务器。
- **ProFTPD**：FTP 服务器软件，支持 SFTP 模块。

### 示例：使用 OpenSSH 的 SFTP 客户端

以下是一个使用 OpenSSH 的 SFTP 客户端的基本示例：

1. **连接到 SFTP 服务器**：

    ```sh
    sftp user@hostname
    ```

2. **列出远程目录内容**：

    ```sh
    sftp> ls
    ```

3. **下载文件**：

    ```sh
    sftp> get remote_file local_file
    ```

4. **上传文件**：

    ```sh
    sftp> put local_file remote_file
    ```

5. **退出 SFTP 会话**：

    ```sh
    sftp> bye
    ```

### 结论

SFTP 协议提供了一种安全、可靠的文件传输方式，适用于各种需要高安全性和稳定性的文件传输场景。

其通过 SSH 提供的加密和认证机制，确保了数据的机密性和完整性，是替代传统 FTP 协议的优秀选择。

## 为什么需要 SFTP 协议？和 FTP 有什么区别

SFTP（SSH File Transfer Protocol）是为了提供安全的文件传输而设计的，它解决了传统 FTP 存在的诸多安全性问题。

以下是 SFTP 相对于 FTP 的主要优点和两者的关键区别：

### 为什么需要 SFTP 协议

1. **安全性**：
   - **加密传输**：SFTP 使用 SSH 加密所有数据传输，包括文件数据和命令。这防止了数据在传输过程中被窃听和篡改。
   - **认证机制**：SFTP 支持基于 SSH 密钥的认证，提供了比简单的用户名和密码更强的安全性。

2. **数据完整性**：
   - **完整性校验**：SSH 协议提供数据完整性校验，确保数据在传输过程中未被修改。

3. **防火墙友好**：
   - **单一端口**：SFTP 使用 SSH 的默认端口（通常是 22）进行通信，这比 FTP 的主动模式和被动模式更容易穿过防火墙。

4. **统一连接**：
   - **单一连接**：SFTP 使用单一的 SSH 连接进行控制命令和数据传输，而 FTP 需要分别建立控制连接和数据连接。

### SFTP 与 FTP 的主要区别

| 特性          | FTP                                    | SFTP                                    |
|---------------|----------------------------------------|-----------------------------------------|
| 安全性        | 不加密，数据和命令以明文传输           | 使用 SSH 加密，数据和命令安全传输       |
| 认证方式      | 用户名和密码                           | 用户名和密码、SSH 密钥、多种认证方式    |
| 传输端口      | 控制连接使用端口 21，数据连接使用动态端口 | 控制和数据传输均使用 SSH 端口（默认 22）|
| 传输模式      | 主动模式和被动模式，可能受防火墙限制    | 单一连接，防火墙友好                    |
| 数据完整性    | 无内置机制，依赖底层协议                | SSH 提供数据完整性校验                  |
| 文件操作命令  | 类似，但不完全相同                     | 类似，但通过 SSH 通道传输               |
| 实现复杂性    | 实现相对简单，但安全性差                | 实现较为复杂，但提供高安全性            |

### 详细对比

#### 安全性

- **FTP**：FTP 在设计时没有考虑安全性，所有数据（包括用户名和密码）都以明文形式传输，这使其容易受到中间人攻击和数据窃听。
- **SFTP**：SFTP 通过 SSH 加密所有传输的数据，确保数据在传输过程中不会被窃听或篡改。此外，SFTP 支持基于 SSH 密钥的认证，进一步提高了安全性。

#### 数据完整性

- **FTP**：FTP 没有内置的数据完整性检查机制，传输过程中数据可能被篡改而不被检测到。
- **SFTP**：SFTP 使用 SSH 提供的数据完整性校验，确保传输的数据未被修改。

#### 传输端口和防火墙

- **FTP**：FTP 使用两个端口，控制连接使用端口 21，数据连接使用动态分配的端口。这种设计在防火墙配置上可能遇到困难，因为需要同时开放多个端口。
- **SFTP**：SFTP 仅使用一个端口（默认是 22），所有的控制和数据传输都通过这个端口进行。这使得 SFTP 更加防火墙友好，简化了防火墙的配置。

#### 传输模式

- **FTP**：FTP 有主动模式和被动模式。主动模式要求服务器连接客户端指定的端口，这可能被客户端防火墙阻止；被动模式要求客户端连接服务器指定的端口，这可能被服务器防火墙阻止。
- **SFTP**：SFTP 通过单一的 SSH 连接进行所有数据传输，不需要额外的端口，避免了 FTP 在传输模式上的复杂性和防火墙问题。

#### 实现复杂性和使用场景

- **FTP**：FTP 实现相对简单，但由于缺乏安全性，通常需要通过其他方式（如 VPN）来保证数据传输的安全。
- **SFTP**：SFTP 实现较为复杂，但其内置的安全性使其成为传输敏感数据的首选。SFTP 常用于需要高安全性的数据传输场景，如远程备份、企业文件传输和系统管理等。

### 结论

SFTP 是一个安全、可靠的文件传输协议，通过 SSH 提供加密和认证机制，解决了传统 FTP 的安全性问题。

对于需要安全传输数据的场景，SFTP 是比 FTP 更好的选择。

## 给出 java 使用 SFTP 的入门例子

使用 Java 进行 SFTP 操作通常需要第三方库的支持，最常用的是 JSch（Java Secure Channel），这是一个纯 Java 实现的 SSH2 库。

以下是一个使用 JSch 库的简单 SFTP 示例，包括连接到 SFTP 服务器、上传文件和下载文件的代码。

### 1. 添加 JSch 依赖

如果使用 Maven 进行项目管理，可以在 `pom.xml` 文件中添加以下依赖：

```xml
<dependency>
    <groupId>com.jcraft</groupId>
    <artifactId>jsch</artifactId>
    <version>0.1.55</version>
</dependency>
```

### 2. 编写 Java 代码

以下是一个简单的 Java 类，演示如何使用 JSch 库连接到 SFTP 服务器、上传文件和下载文件。

```java
import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;
import com.jcraft.jsch.SftpException;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Properties;

public class SFTPExample {
    public static void main(String[] args) {
        String sftpHost = "example.com";
        String sftpUser = "username";
        String sftpPassword = "password";
        int sftpPort = 22;

        String localFile = "path/to/local/file.txt";
        String remoteFile = "path/to/remote/file.txt";

        Session session = null;
        ChannelSftp channelSftp = null;

        try {
            // 初始化 JSch 对象
            JSch jsch = new JSch();

            // 创建一个 SSH 会话
            session = jsch.getSession(sftpUser, sftpHost, sftpPort);
            session.setPassword(sftpPassword);

            // 设置 SSH 会话的配置
            Properties config = new Properties();
            config.put("StrictHostKeyChecking", "no");
            session.setConfig(config);

            // 连接到 SFTP 服务器
            session.connect();

            // 打开 SFTP 通道
            channelSftp = (ChannelSftp) session.openChannel("sftp");
            channelSftp.connect();

            // 上传文件
            try (FileInputStream fis = new FileInputStream(localFile)) {
                channelSftp.put(fis, remoteFile);
                System.out.println("File uploaded successfully to " + remoteFile);
            }

            // 下载文件
            try (FileOutputStream fos = new FileOutputStream("path/to/downloaded/file.txt")) {
                channelSftp.get(remoteFile, fos);
                System.out.println("File downloaded successfully from " + remoteFile);
            }

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (channelSftp != null) {
                channelSftp.disconnect();
            }
            if (session != null) {
                session.disconnect();
            }
        }
    }
}
```

### 3. 代码解释

- **初始化 JSch 对象**：`JSch jsch = new JSch();`
- **创建 SSH 会话**：使用 `jsch.getSession` 创建一个会话，并设置用户名、主机和端口。
- **设置会话配置**：通过 `Properties` 对象设置会话配置，例如禁用主机密钥检查（仅在测试环境中使用）。
- **连接到服务器**：通过 `session.connect()` 方法连接到 SFTP 服务器。
- **打开 SFTP 通道**：通过 `session.openChannel("sftp")` 打开一个 SFTP 通道，并连接到通道。
- **上传文件**：使用 `channelSftp.put` 方法上传文件。
- **下载文件**：使用 `channelSftp.get` 方法下载文件。
- **关闭连接**：最后，通过 `channelSftp.disconnect()` 和 `session.disconnect()` 关闭 SFTP 通道和 SSH 会话。

### 4. 注意事项

- **安全性**：在生产环境中，应启用严格的主机密钥检查，并使用更安全的认证方法（如公钥认证）。
- **错误处理**：代码中应包含更详细的错误处理机制，以处理各种可能的异常情况。
- **资源管理**：确保正确关闭文件流和网络连接，以避免资源泄漏。

通过上述代码示例，您可以在 Java 应用程序中使用 SFTP 协议进行文件传输操作。

* any list
{:toc}