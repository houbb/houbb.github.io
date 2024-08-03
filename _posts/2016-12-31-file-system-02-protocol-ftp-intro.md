---
layout: post
title: 文件系统 FTP Ubuntu 安装入门介绍
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

# FTP

环境: Ubuntu 14.04

> [blog zh_CN](http://www.cnblogs.com/lidan/archive/2011/11/12/2246507.html)

> [ubuntu14.04](http://www.while0.com/36.html)


- Install

```
全新安装：apt-get install vsftpd
重新安装:apt-get --reinstall install vsftpd
卸载并清除配置文件：apt-get --purge remove vsftpd
```

- Start & Restart

```
$   service vsftpd start
$   service vsftpd restart
```

注意:

网上文章很多有提及```/etc/init.d/vsftpd start``` 之类的启动方式。但是这个目录下我不存在 vsftpd. 这个目录确实有: ```/etc/init/vsftpd.conf```

```
vsftpd 已經進化為 Upstart job
設定檔放在
/etc/init/vsftpd.conf
```

- Create ftp user

1.此用户只是用来使用ftp服务的
2.此用户不可登录服务器
3.此用户不能访问ftp指定文件夹之外的文件

(1) 创建一个用户ftp0

```
useradd -d /home/ftp0 -m ftp0
```

(2) 修改ftp0的密码

```
passwd ftp0
```

- Config ```/etc/vsftpd.conf```


```
anonymous_enable=NO         # 不允许匿名访问
write_enable=YES            # 允许写
local_enable=YES            # 允许本地主机访问
chroot_local_user=YES       # 只能访问自身的目录，此处有坑，需加上下面一行
```


报错误信息:

```
“500 OOPS: vsftpd: refusing to run with writable root inside chroot()”
```


从2.3.5之后，vsftpd增强了安全检查，如果用户被限定在了其主目录下，则该用户的主目录不能再具有写权限了！如果检查发现还有写权限，就会报该错误。


(1) 启用了chroot的话，根目录要设置为不可写

```
chmod a-w /home/ftp0
```

(2) 或者添加一句话

```
allow_writeable_chroot=YES #允许写自身的目录
```

可是添加这句话可能会导致服务重启失败。。。

无奈之下。。。```chroot_local_user=YES```这句话暂时不加。


- 让用户不能登录

```
$   usermod -s /sbin/nologin ftp0
```


after all these, restart the ftp service:

```
# service vsftpd restart
vsftpd stop/waiting
vsftpd start/pre-start, process 10305
# service vsftpd status
vsftpd start/running, process 10305
```


- Test

```
# ftp
ftp> open 192.168.2.108
Connected to 192.168.2.108.
220 (vsFTPd 3.0.2)
Name (192.168.2.108:hbb): ftp0
331 Please specify the password.
Password:
530 Login incorrect.
Login failed.
```

需要 ```vi /etc/shells```, 最后一行添加:

```
/sbin/nologin
```

重新测试:

```
# ftp
ftp> open 192.168.2.108
Connected to 192.168.2.108.
220 (vsFTPd 3.0.2)
Name (192.168.2.108:hbb): ftp0
331 Please specify the password.
Password:
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
```


21 端口查看:

```
netstat -npltu | grep 21
tcp        0      0 0.0.0.0:21              0.0.0.0:*               LISTEN      11398/vsftpd
```



# Ftp Java code

- Java 测试代码

```java
package com.ryo.ftp;

import org.apache.commons.net.ftp.FTPClient;
import org.apache.commons.net.ftp.FTPReply;

import java.io.File;
import java.io.FileInputStream;

/**
 * @author houbinbin
 * @on 17/1/1
 */
public class FTPTest {

    private FTPClient ftp;

    /**
     * @param path     上传到ftp服务器哪个路径下
     * @param addr     地址
     * @param port     端口号
     * @param username 用户名
     * @param password 密码
     * @return
     * @throws Exception
     */
    private boolean connect(String path, String addr, int port, String username, String password) throws Exception {
        boolean result = false;
        ftp = new FTPClient();
        int reply;
        ftp.connect(addr, port);
        ftp.login(username, password);
        ftp.setFileType(FTPClient.BINARY_FILE_TYPE);
        reply = ftp.getReplyCode();
        if (!FTPReply.isPositiveCompletion(reply)) {
            ftp.disconnect();
            return result;
        }
        ftp.changeWorkingDirectory(path);
        result = true;
        return result;
    }

    /**
     * @param file 上传的文件或文件夹
     * @throws Exception
     */
    private void upload(File file) throws Exception {
        if (file.isDirectory()) {
            ftp.makeDirectory(file.getName());
            ftp.changeWorkingDirectory(file.getName());
            String[] files = file.list();
            for (int i = 0; i < files.length; i++) {
                File file1 = new File(file.getPath() + "\\" + files[i]);
                if (file1.isDirectory()) {
                    upload(file1);
                    ftp.changeToParentDirectory();
                } else {
                    File file2 = new File(file.getPath() + "\\" + files[i]);
                    FileInputStream input = new FileInputStream(file2);
                    ftp.storeFile(file2.getName(), input);
                    input.close();
                }
            }
        } else {
            File file2 = new File(file.getPath());
            FileInputStream input = new FileInputStream(file2);
            ftp.storeFile(file2.getName(), input);
            input.close();
        }
    }

    //测试即使指定其他用户的文件夹,还要没有写的权限也无法上传。
    public static void main(String[] args) throws Exception {
        FTPTest t = new FTPTest();
        t.connect("/home/ftp0/", "192.168.2.108", 21, "ftp0", "123456");
        File file = new File("/Users/houbinbin/Downloads/ftptest.txt");
        t.upload(file);
    }

}
```


# chat

## 详细介绍一下 FTP 协议

FTP（File Transfer Protocol）是用于在网络上进行文件传输的标准协议。

它是应用层协议，使用 TCP 端口 21 进行通信，主要用于在客户端和服务器之间上传、下载和管理文件。以下是对 FTP 协议的详细介绍：

### FTP 协议概述

#### 工作原理

FTP 协议采用客户端-服务器架构，主要涉及两个通信通道：

1. **控制连接**：用于传输控制信息（如命令和响应），使用 TCP 端口 21。
2. **数据连接**：用于传输实际的文件数据，使用 TCP 端口 20 或动态分配的端口。

#### 传输模式

FTP 有两种传输模式：

1. **主动模式（Active Mode）**：
   - 客户端通过随机的高位端口连接到服务器的控制端口（21）。
   - 客户端在传输数据时告诉服务器监听一个随机高位端口。
   - 服务器从其数据端口（20）连接到客户端指定的高位端口进行数据传输。

2. **被动模式（Passive Mode）**：
   - 客户端通过随机的高位端口连接到服务器的控制端口（21）。
   - 客户端请求服务器进入被动模式，服务器选择一个随机高位端口并告知客户端。
   - 客户端从其随机高位端口连接到服务器的该随机高位端口进行数据传输。

### FTP 命令和响应

#### 常见 FTP 命令

- **USER**：提供用户名
- **PASS**：提供密码
- **CWD**：改变工作目录
- **PWD**：打印工作目录
- **LIST**：列出文件和目录
- **RETR**：下载文件
- **STOR**：上传文件
- **DELE**：删除文件
- **QUIT**：退出会话

#### 常见 FTP 响应代码

- **1xx**：积极的初始答复（如150，表示文件状态良好，准备打开数据连接）
- **2xx**：成功（如200，表示命令成功）
- **3xx**：需要进一步的信息（如331，表示用户名正确，需要密码）
- **4xx**：暂时的负面答复（如421，表示服务不可用，关闭控制连接）
- **5xx**：永久的负面答复（如530，表示未登录）

### 安全性

传统的 FTP 协议没有加密机制，传输的数据和凭证都是以明文形式发送的，这会导致安全风险。因此，衍生出了以下更安全的版本：

1. **FTPS（FTP Secure/SSL）**：通过 SSL/TLS 对 FTP 连接进行加密。
2. **SFTP（SSH File Transfer Protocol）**：虽然名称相似，但 SFTP 是基于 SSH 的完全独立的协议，提供加密的数据传输。

### 使用场景

- **文件共享**：FTP 服务器可用于在组织内部或与客户之间共享大文件。
- **网站管理**：许多网站管理员使用 FTP 来上传和管理网站文件。
- **数据备份**：FTP 可用于将数据备份到远程服务器。

### FTP 的优缺点

#### 优点

- **简单**：易于实现和使用。
- **跨平台**：广泛支持各种操作系统和设备。
- **效率高**：传输大文件时性能较好。

#### 缺点

- **不安全**：传统的 FTP 缺乏加密机制，容易被攻击。
- **防火墙问题**：主动模式和被动模式的连接建立可能会被防火墙阻止。
- **过时**：相对于现代文件传输协议，FTP 的功能和安全性不足。

### 相关工具

- **FTP 客户端**：FileZilla、WinSCP、Cyberduck 等。
- **FTP 服务器**：vsftpd、ProFTPD、FileZilla Server 等。

### 结论

FTP 协议作为一种古老而广泛使用的文件传输协议，尽管在现代安全要求下显得不够完善，但在一些场景中仍然非常有用。

对于需要更高安全性的场景，可以选择 FTPS 或 SFTP 等替代方案。

* any list
{:toc}