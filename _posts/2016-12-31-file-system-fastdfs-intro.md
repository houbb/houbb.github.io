---
layout: post
title: 开源的分布式文件系统 Fastdfs 安装入门介绍
date:  2016-12-31 10:48:42 +0800
categories: [File]
tags: [distributed, file]
published: false
---




# fastdfs

[FastDFS](https://www.oschina.net/p/fastdfs) 是一个开源的分布式文件系统，她对文件进行管理，功能包括：文件存储、文件同步、文件访问（文件上传、文件下载）等，解决了大容量存储和负载均衡的问题。
特别适合以文件为载体的在线服务，如相册网站、视频网站等等。

> [blog zh_CN](http://blog.csdn.net/poechant/article/details/6977407)


# Install libevent in MAC

> [blog zh_CN](http://soartju.iteye.com/blog/803477)

FastDFS depends on [libevent](http://libevent.org/). Ensure install path is ```/usr```.

- Download

download from ```https://github.com/downloads/libevent/libevent/libevent-1.4.14b-stable.tar.gz```

- Move at the fit place

```
houbinbindeMacBook-Pro:usr houbinbin$ mv ~/Downloads/libevent-1.4.14b-stable.tar.gz ~/it/tools/libevent/
houbinbindeMacBook-Pro:usr houbinbin$ cd ~/it/tools/libevent/
houbinbindeMacBook-Pro:libevent houbinbin$ ls
libevent-1.4.14b-stable.tar.gz		libevent-release-1.4.15-stable		libevent-release-1.4.15-stable.tar.gz
```

- Unzip

```
houbinbindeMacBook-Pro:libevent houbinbin$ tar -zxf libevent-1.4.14b-stable.tar.gz
houbinbindeMacBook-Pro:libevent houbinbin$ ls
libevent-1.4.14b-stable			libevent-1.4.14b-stable.tar.gz		libevent-release-1.4.15-stable		libevent-release-1.4.15-stable.tar.gz
```


- Config

切换至管理员模式

```
$   su
```

Enter ```libevent-1.4.14b-stable``` directory

```
$ ./configure --prefix=/usr
$   make clean
$   make
$   make install
```

报错如下

```
sh-3.2# sudo make install
/Applications/Xcode.app/Contents/Developer/usr/bin/make  install-recursive
Making install in .
test -z "/usr/bin" || ./install-sh -c -d "/usr/bin"
 /usr/bin/install -c event_rpcgen.py '/usr/bin'
install: /usr/bin/event_rpcgen.py: Operation not permitted
make[3]: *** [install-binSCRIPTS] Error 71
make[2]: *** [install-am] Error 2
make[1]: *** [install-recursive] Error 1
make: *** [install] Error 2
```

> [blog zh_CN](http://blog.csdn.net/dreamderekwq/article/details/52507202)

# Install in Ubuntu

```
$   wget https://github.com/downloads/libevent/libevent/libevent-1.4.14b-stable.tar.gz
$   tar -zxf libevent-1.4.14b-stable.tar.gz
$   cd libevent-1.4.14b-stable/
```

切换至root

```
$   su
```

```
$ ./configure --prefix=/usr
$   make clean
$   make
$   make install
```

查看安装情况

```
$   ls -al /usr/lib | grep libevent

lrwxrwxrwx   1 root root           21  1月  1 17:42 libevent-1.4.so.2 -> libevent-1.4.so.2.2.0
-rwxr-xr-x   1 root root       469241  1月  1 17:42 libevent-1.4.so.2.2.0
-rw-r--r--   1 root root       852258  1月  1 17:42 libevent.a
lrwxrwxrwx   1 root root           26  1月  1 17:42 libevent_core-1.4.so.2 -> libevent_core-1.4.so.2.2.0
-rwxr-xr-x   1 root root       175126  1月  1 17:42 libevent_core-1.4.so.2.2.0
-rw-r--r--   1 root root       285860  1月  1 17:42 libevent_core.a
-rwxr-xr-x   1 root root          988  1月  1 17:42 libevent_core.la
lrwxrwxrwx   1 root root           26  1月  1 17:42 libevent_core.so -> libevent_core-1.4.so.2.2.0
lrwxrwxrwx   1 root root           27  1月  1 17:42 libevent_extra-1.4.so.2 -> libevent_extra-1.4.so.2.2.0
-rwxr-xr-x   1 root root       369127  1月  1 17:42 libevent_extra-1.4.so.2.2.0
-rw-r--r--   1 root root       683908  1月  1 17:42 libevent_extra.a
-rwxr-xr-x   1 root root          995  1月  1 17:42 libevent_extra.la
lrwxrwxrwx   1 root root           27  1月  1 17:42 libevent_extra.so -> libevent_extra-1.4.so.2.2.0
-rwxr-xr-x   1 root root          953  1月  1 17:42 libevent.la
lrwxrwxrwx   1 root root           21  1月  1 17:42 libevent.so -> libevent-1.4.so.2.2.0
```


* any list
{:toc}