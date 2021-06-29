---
layout: post
title:  SFTP 的 java 使用实战
date:  2021-06-20 16:52:15 +0800
categories: [Tool]
tags: [tool, sftp, sh]
published: true
---

# 序言

SFTP 的客户端与服务端本质上还是通过 TCP 等网络协议通信。

界面让操作更加人性化，但是自动化的过程还是需要程序访问。

本人将简单记录一下如何通过 java 访问 SFTP 服务器。

# 快速开始

闲话少叙，直接上代码。

## maven 依赖

```xml
<dependency>
    <groupId>com.jcraft</groupId>
    <artifactId>jsch</artifactId>
    <version>0.1.53</version>
</dependency>
```

jsch 是比较常用的 sftp java 客户端包。

## 工具类

第一次使用这个工具，个人也不是很熟。

于是网上直接找一个工具方法。

```java
package com.github.houbb.sftp.learn.util;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.jcraft.jsch.*;

import java.io.*;
import java.util.Properties;
import java.util.Vector;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class SFTPUtil {

    private Log log = LogFactory.getLog(SFTPUtil.class);;

    private ChannelSftp sftp;

    private Session session;
    /** FTP 登录用户名*/
    private String username;
    /** FTP 登录密码*/
    private String password;
    /** 私钥 */
    private String privateKey;
    /** FTP 服务器地址IP地址*/
    private String host;
    /** FTP 端口*/
    private int port;

    /**
     * 构造基于密码认证的sftp对象
     * @param userName
     * @param password
     * @param host
     * @param port
     */
    public SFTPUtil(String username, String password, String host, int port) {
        this.username = username;
        this.password = password;
        this.host = host;
        this.port = port;
    }

    /**
     * 构造基于秘钥认证的sftp对象
     * @param userName
     * @param host
     * @param port
     * @param privateKey
     */
    public SFTPUtil(String username, String host, int port, String privateKey) {
        this.username = username;
        this.host = host;
        this.port = port;
        this.privateKey = privateKey;
    }

    public SFTPUtil(){}

    /**
     * 连接sftp服务器
     * @throws Exception
     */
    public void login(){
        try {
            JSch jsch = new JSch();
            if (privateKey != null) {
                jsch.addIdentity(privateKey);// 设置私钥
                log.info("sftp connect,path of private key file：{}" , privateKey);
            }
            log.info("sftp connect by host:{} username:{}",host,username);

            session = jsch.getSession(username, host, port);
            log.info("Session is build");
            if (password != null) {
                session.setPassword(password);
            }

            Properties config = new Properties();
            config.put("StrictHostKeyChecking", "no");

            // 关闭 Kerberos
            config.put("PreferredAuthentications","publickey,keyboard-interactive,password");
            session.setConfig(config);

            session.connect();
            log.info("Session is connected");

            Channel channel = session.openChannel("sftp");
            channel.connect();
            log.info("channel is connected");

            sftp = (ChannelSftp) channel;
            log.info(String.format("sftp server host:[%s] port:[%s] is connect successfull", host, port));
        } catch (JSchException e) {
            log.error("Cannot connect to specified sftp server : {}:{} \n Exception message is: {}", new Object[]{host, port, e.getMessage()});
        }
    }

    /**
     * 关闭连接 server
     */
    public void logout(){
        if (sftp != null) {
            if (sftp.isConnected()) {
                sftp.disconnect();
                log.info("sftp is closed already");
            }
        }
        if (session != null) {
            if (session.isConnected()) {
                session.disconnect();
                log.info("sshSession is closed already");
            }
        }
    }

    /**
     * 将输入流的数据上传到sftp作为文件
     * @param directory 上传到该目录
     * @param sftpFileName sftp端文件名
     * @param in 输入流
     * @throws SftpException
     * @throws Exception
     */
    public void upload(String directory, String sftpFileName, InputStream input) throws SftpException{
        try {
            sftp.cd(directory);
        } catch (SftpException e) {
            log.warn("directory is not exist");
            sftp.mkdir(directory);
            sftp.cd(directory);
        }
        sftp.put(input, sftpFileName);
        log.info("file:{} is upload successful" , sftpFileName);
    }

    /**
     * 上传单个文件
     * @param directory 上传到sftp目录
     * @param uploadFile 要上传的文件,包括路径
     * @throws FileNotFoundException
     * @throws SftpException
     * @throws Exception
     */
    public void upload(String directory, String uploadFile) throws FileNotFoundException, SftpException{
        File file = new File(uploadFile);
        upload(directory, file.getName(), new FileInputStream(file));
    }

    /**
     * 将byte[]上传到sftp，作为文件。注意:从String生成byte[]是，要指定字符集。
     * @param directory 上传到sftp目录
     * @param sftpFileName 文件在sftp端的命名
     * @param byteArr 要上传的字节数组
     * @throws SftpException
     * @throws Exception
     */
    public void upload(String directory, String sftpFileName, byte[] byteArr) throws SftpException{
        upload(directory, sftpFileName, new ByteArrayInputStream(byteArr));
    }

    /**
     * 将字符串按照指定的字符编码上传到sftp
     * @param directory 上传到sftp目录
     * @param sftpFileName 文件在sftp端的命名
     * @param dataStr 待上传的数据
     * @param charsetName sftp上的文件，按该字符编码保存
     * @throws UnsupportedEncodingException
     * @throws SftpException
     * @throws Exception
     */
    public void upload(String directory, String sftpFileName, String dataStr, String charsetName) throws UnsupportedEncodingException, SftpException{
        upload(directory, sftpFileName, new ByteArrayInputStream(dataStr.getBytes(charsetName)));
    }

    /**
     * 下载文件
     * @param directory 下载目录
     * @param downloadFile 下载的文件
     * @param saveFile 存在本地的路径
     * @throws SftpException
     * @throws FileNotFoundException
     * @throws Exception
     */
    public void download(String directory, String downloadFile, String saveFile) throws SftpException, FileNotFoundException{
        if (directory != null && !"".equals(directory)) {
            sftp.cd(directory);
        }
        File file = new File(saveFile);
        sftp.get(downloadFile, new FileOutputStream(file));
        log.info("file:{} is download successful" , downloadFile);
    }

    /**
     * 下载文件
     * @param directory 下载目录
     * @param downloadFile 下载的文件名
     * @return 字节数组
     * @throws SftpException
     * @throws IOException
     * @throws Exception
     */
    @Deprecated
    public byte[] download(String directory, String downloadFile) throws SftpException, IOException{
        if (directory != null && !"".equals(directory)) {
            sftp.cd(directory);
        }
        InputStream is = sftp.get(downloadFile);
//        byte[] fileData = IOUtils.toByteArray(is);
        log.info("file:{} is download successful" , downloadFile);
//        return fileData;
        return null;
    }

    /**
     * 删除文件
     * @param directory 要删除文件所在目录
     * @param deleteFile 要删除的文件
     * @throws SftpException
     * @throws Exception
     */
    public void delete(String directory, String deleteFile) throws SftpException{
        sftp.cd(directory);
        sftp.rm(deleteFile);
    }

    /**
     * 列出目录下的文件
     * @param directory 要列出的目录
     * @param sftp
     * @return
     * @throws SftpException
     */
    public Vector<?> listFiles(String directory) throws SftpException {
        return sftp.ls(directory);
    }

}
```

备注：download 中的 `IOUtils.toByteArray(is)` 被我注释掉了，这个需要额外引入 apache 的包。

## 实战总结

### upload 的文件夹问题

```java
try {
    sftp.cd(directory);
} catch (SftpException e) {
    log.warn("directory is not exist");
    sftp.mkdir(directory);
    sftp.cd(directory);
}
```

这里对目标服务器的 sftp 文件夹做了一次不存在则创建的兼容。

实际发现只能支持一个层级，比如 `/app`。

如果是多个层级，依然会报错，比如 `/app/test/`

### 文件流的关闭

单个文件上传，建议使用下面的方式。

这样上传之后，可以保证文件流被正常关闭。

```java
/**
 * 上传单个文件
 *
 * @param directory  上传到sftp目录
 * @param uploadFile 要上传的文件,包括路径
 */
public void upload(String directory, String uploadFile)  {
    File file = new File(uploadFile);
    try(FileInputStream inputStream = new FileInputStream(file)) {
        upload(directory, file.getName(), inputStream);
    } catch (SftpException | IOException e) {
        throw new RuntimeException(e);
    }
}
```

## 测试代码

这里直接把 `Main.java` 测试文件，上传到 sftp 服务器的根路径。

```java
public static void main(String[] args) throws SftpException, IOException {
    SFTPUtil sftp = new SFTPUtil("sftp", "123456", "127.0.0.1", 33);
    sftp.login();
    File file = new File("D:\\gitee\\sftp-learn\\src\\main\\java\\com\\github\\houbb\\sftp\\learn\\Main.java");
    InputStream is = new FileInputStream(file);
    sftp.upload("/", "Main.java", is);
    sftp.logout();
}
```

测试日志如下：

```
[INFO] [2021-06-22 20:38:06.245] [main] [c.g.h.s.l.u.SFTPUtil.login] - sftp connect by host:127.0.0.1 username:sftp
[INFO] [2021-06-22 20:38:06.264] [main] [c.g.h.s.l.u.SFTPUtil.login] - Session is build
[INFO] [2021-06-22 20:38:07.409] [main] [c.g.h.s.l.u.SFTPUtil.login] - Session is connected
[INFO] [2021-06-22 20:38:07.459] [main] [c.g.h.s.l.u.SFTPUtil.login] - channel is connected
[INFO] [2021-06-22 20:38:07.460] [main] [c.g.h.s.l.u.SFTPUtil.login] - sftp server host:[127.0.0.1] port:[33] is connect successfull
[INFO] [2021-06-22 20:38:07.466] [main] [c.g.h.s.l.u.SFTPUtil.upload] - file:Main.java is upload successful
[INFO] [2021-06-22 20:38:07.466] [main] [c.g.h.s.l.u.SFTPUtil.logout] - sftp is closed already
[INFO] [2021-06-22 20:38:07.470] [main] [c.g.h.s.l.u.SFTPUtil.logout] - sshSession is closed already
```

然后，就可以在 `D:\sftp` 目录下看到 Main.java 文件。

# Kerberos 身份验证问题

## 问题描述

一开始我在测试的时候，总是提示输入 Kerberos 的账户信息。

这会导致程序的阻塞，明明已经指定账户密码了，为什么还需要输入什么 Kerberos 信息呢？

```
Kerberos username [xxx]
Kerberos password
```

## 原因

于是，去查了一下这给问题。

一般情况下，我们登录sftp服务器，用户名认证或者密钥认证即可。

但是如果对方服务器设置了Kerberos 身份验证，而已方又没有对应的配置时，则会提示输入。

不过，我也没找到服务器设置这个的地方。

## 解决方案

简单的解决办法是，可以去掉 Kerberos 身份验证来解决

```java
session.setConfig("PreferredAuthentications", "publickey,keyboard-interactive,password");
```

或者

```java
// 关闭 Kerberos
config.put("PreferredAuthentications","publickey,keyboard-interactive,password");
session.setConfig(config);
```

下面的也就是我加在 login 方法中的配置。

## 认证方式说明

以上是通过设置常见的三种认证协议方式，来忽略其他方式。

（1）publickey：基于公共密钥的安全验证方式（public key authentication method），通过生成一组密钥（public key/private key）来实现用户的登录验证。

（2）keyboard-interactive：基于键盘交互的验证方式（keyboard interactive authentication method），通过服务器向客户端发送提示信息，然后由客户端根据相应的信息通过手工输入的方式发还给服务器端。

（3）password：基于口令的验证方式（password authentication method），通过输入用户名和密码的方式进行远程机器的登录验证。

# Kerberos 认证协议

## Kerberos认证协议

Kerberos 是一种网络认证协议，其设计目标是通过密钥系统为客户机 / 服务器应用程序提供强大的认证服务。

## 认证流程

使用Kerberos时，一个客户端需要经过三个步骤来获取服务:

认证：客户端向认证服务器发送一条报文，并获取一个含时间戳的Ticket-Granting Ticket（TGT）。

授权：客户端使用TGT向Ticket-Granting Server（TGS）请求一个服务Ticket。

服务请求：客户端向服务器出示服务Ticket，以证实自己的合法性。该服务器提供客户端所需服务，在Hadoop应用中，服务器可以是 namenode 或 jobtracker。

# 小结

SFTP 的 java 使用入门也非常简单，当然我们到这里是不应该结束的。

还应该思考一个问题，这个工具类是否进行进一步的封装，让其变得更加简单易用呢？

# 参考资料

[JSch登录sftp，跳过 Kerberos username 身份验证提示](https://blog.csdn.net/a718515028/article/details/80356337)

* any list
{:toc}