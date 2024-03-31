---
layout: post
title: 文件系统 FTP Ubuntu 安装入门介绍
date:  2016-12-31 10:48:42 +0800
categories: [File]
tags: [ftp, file]
published: true
---


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


* any list
{:toc}