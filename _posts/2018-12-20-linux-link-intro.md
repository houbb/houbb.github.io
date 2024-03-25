---
layout: post 
title:  Linux 的硬链接与软链接简单介绍
date: 2018-12-20 17:21:25 +0800
categories: [Linux]
tags: [linux, sh]
published: true
---

# linux 命令基础汇总

| 命令&基础             | 描述                                   | 地址                                              |
|------------------|----------------------------------------|---------------------------------------------------|
| linux curl       | 命令行直接发送 http 请求               | [Linux curl 类似 postman 直接发送 get/post 请求](https://houbb.github.io/2018/12/20/linux-curl) |
| linux ln         | 创建链接（link）的命令               | [创建链接（link）的命令](https://houbb.github.io/2018/12/20/linux-ln) |
| linux link       | linux 软链接介绍               | [linux 软链接介绍](https://houbb.github.io/2018/12/20/linux-link-intro) |
| linux top        | 实时查看系统性能                       | [linux top-linux 内存](https://houbb.github.io/2018/12/21/linux-top)                 |
| linux tar gz     | 解压命令                               | [linux tar gz 解压命令](https://houbb.github.io/2018/12/21/linux-tar-gz)              |
| linux tail       | 显示文件末尾内容                       | [linux tail, linux head](https://houbb.github.io/2018/12/21/linux-tail)               |
| linux rm         | 删除文件或目录                         | [linux rm, mkdir](https://houbb.github.io/2018/12/21/linux-rm)                         |
| linux pwd        | 显示当前目录                           | [linux pwd](https://houbb.github.io/2018/12/21/linux-pwd)                               |
| linux ps         | 显示当前进程信息                       | [linux ps](https://houbb.github.io/2018/12/21/linux-ps)                                 |
| linux port       | 显示端口占用情况                       | [linux port 端口占用](https://houbb.github.io/2018/12/21/linux-port)                   |
| linux ping       | 测试网络连通性                         | [linux ping](https://houbb.github.io/2018/12/21/linux-ping)                             |
| linux mv         | 移动文件或目录                         | [linux mv](https://houbb.github.io/2018/12/21/linux-mv)                                 |
| linux ls         | 列出文件和目录                         | [linux ls](https://houbb.github.io/2018/12/21/linux-ls)                                 |
| linux less, more | 分页显示文件内容                       | [linux less, linux more](https://houbb.github.io/2018/12/21/linux-less)                 |
| linux grep       | 在文件中搜索指定字符串                 | [linux grep](https://houbb.github.io/2018/12/21/linux-grep)                               |
| linux file       | 确定文件类型                           | [linux file 命令](https://houbb.github.io/2018/12/21/linux-file)                         |
| linux diff       | 比较文件的不同                         | [linux diff](https://houbb.github.io/2018/12/21/linux-diff)                               |
| linux chmod      | 修改文件权限                           | [linux chmod](https://houbb.github.io/2018/12/21/linux-chmod)                             |
| linux cd         | 切换当前目录                           | [linux cd](https://houbb.github.io/2018/12/21/linux-cd)                                   |
| linux cat        | 显示文件内容                           | [linux cat](https://houbb.github.io/2018/12/21/linux-cat)                                 |
| linux telnet     | 远程登录                               | [linux telnet](https://houbb.github.io/2018/12/20/linux-telnet)                           |
| linux free       | 显示内存使用情况                       | [linux free-内存统计信息](https://houbb.github.io/2018/12/21/linux-free)                 |
| linux df         | 显示磁盘空间使用情况                   | [linux df-磁盘统计信息](https://houbb.github.io/2018/12/21/linux-df)                     |
| linux netstat   | 显示网络连接、路由表、接口统计等信息 | [linux netstat-显示系统网络连接、路由表、接口统计、masquerade 连接等信息](https://houbb.github.io/2018/12/20/linux-netstat) |
| linux load average   | 如何查看 linux 的负载 | [Linux Load AVG linux 平均负载是什么解释说明](https://houbb.github.io/2018/12/20/linux-load-avg) |


# 理解 Linux 的硬链接与软链接

## Linux 的文件与目录

现代操作系统为解决信息能独立于进程之外被长期存储引入了文件，文件作为进程创建信息的逻辑单元可被多个进程并发使用。
在 UNIX 系统中，操作系统为磁盘上的文本与图像、鼠标与键盘等输入设备及网络交互等 I/O 操作设计了一组通用 API，使他们被处理时均可统一使用字节流方式。
换言之，UNIX 系统中除进程之外的**一切皆是文件**，而 Linux 保持了这一特性。

为了便于文件的管理，Linux 还引入了目录（有时亦被称为文件夹）这一概念。目录使文件可被分类管理，
且目录的引入使 Linux 的文件系统形成一个层级结构的目录树。

- linux 目录结构

```
/              根目录
├── bin     存放用户二进制文件
├── boot    存放内核引导配置文件
├── dev     存放设备文件
├── etc     存放系统配置文件
├── home    用户主目录
├── lib     动态共享库
├── lost+found  文件系统恢复时的恢复文件
├── media   可卸载存储介质挂载点
├── mnt     文件系统临时挂载点
├── opt     附加的应用程序包
├── proc    系统内存的映射目录，提供内核与进程信息
├── root    root 用户主目录
├── sbin    存放系统二进制文件
├── srv     存放服务相关数据
├── sys     sys 虚拟文件系统挂载点
├── tmp     存放临时文件
├── usr     存放用户应用程序
└── var     存放邮件、系统日志等变化文件
```

- Linux 与其他类 UNIX 系统一样并不区分文件与目录

目录是记录了其他文件名的文件。
使用命令 mkdir 创建目录时，若期望创建的目录的名称与现有的文件名（或目录名）重复，则会创建失败。

- Linux 将设备当做文件进行处理
 
展示了如何打开设备文件 `/dev/input/event5` 并读取文件内容。
文件 event5 表示一种输入设备，其可能是鼠标或键盘等。
查看文件 /proc/bus/input/devices 可知 event5 对应设备的类型。
设备文件 /dev/input/event5 使用 read() 以字符流的方式被读取。
结构体 input_event 被定义在内核头文件 linux/input.h 中。


```
int fd; 
struct input_event ie; 
fd = open("/dev/input/event5", O_RDONLY); 
read(fd, &ie, sizeof(struct input_event)); 
printf("type = %d  code = %d  value = %d\n", 
            ie.type, ie.code, ie.value); 
close(fd);
```

## 硬链接与软链接

我们知道文件都有文件名与数据，这在 Linux 上被分成两个部分：
用户数据 (user data) 与元数据 (metadata)。

- 用户数据

用户数据，即文件数据块 (data block)，数据块是记录文件真实内容的地方；

- 元数据

而元数据则是文件的附加属性，如文件大小、创建时间、所有者等信息。
在 Linux 中，元数据中的 inode 号（inode 是文件元数据的一部分但其并不包含文件名，inode 号即索引节点号）才是文件的唯一标识而非文件名。

文件名仅是为了方便人们的记忆和使用，系统或程序通过 `inode` 号寻找正确的文件数据块。


### inode 查看

在 Linux 系统中查看 inode 号可使用命令 stat 或 ls -i（若是 AIX 系统，则使用命令 istat）。

- stat

```
stat 
781960224 815 crw--w---- 1 houbinbin tty 268435457 0 "Jun 19 14:44:07 2018" "Jun 19 14:44:07 2018" "Jun 19 14:44:07 2018" "Jan  1 08:00:00 1970" 131072 0 0 (stdin)
```

- ls -i

```
$ ls -i
8595863015 MySQL开发者SQL权威指南.pdf				8595863016 高可用MySQL：构建健壮的数据中心.pdf
8595863013 MySQL技术内幕(第4版).pdf				8595863019 高性能mysql第三版.pdf
8595863020 MySQL性能调优与架构设计.pdf				8595863014 深入理解MySQL核心技术__中文版.pdf
8595863021 read							8595863018 企业应用架构模式(PDF带书签索引版).pdf
```

### 硬链接 & 软链接

为解决文件的共享使用，Linux 系统引入了两种链接：硬链接 (hard link) 与软链接（又称符号链接，即 soft link 或 symbolic link）。

链接为 Linux 系统解决了**文件的共享使用，还带来了隐藏文件路径、增加权限安全及节省存储等好处**。

若一个 inode 号对应多个文件名，则称这些文件为硬链接。

换言之，硬链接就是同一个文件使用了多个别名（见 图 2.hard link 就是 file 的一个别名，他们有共同的 inode）。
硬链接可由命令 link 或 ln 创建。

- 硬链接创建

如下是对文件 oldfile 创建硬链接。

```
link oldfile newfile 
ln oldfile newfile
```

### 硬链接特性

由于硬链接是有着相同 inode 号仅文件名不同的文件，因此硬链接存在以下几点特性：

- 文件有相同的 inode 及 data block；

- 只能对已存在的文件进行创建；

- 不能交叉文件系统进行硬链接的创建；

- 不能对目录进行创建，只可对文件创建；

- 删除一个硬链接文件并不影响其他有相同 inode 号的文件。


硬链接不能对目录创建是受限于文件系统的设计（见 清单 4.对目录创建硬链接将失败）。
现 Linux 文件系统中的目录均隐藏了两个个特殊的目录：
当前目录`.`与父目录`..`。

### 软链接特性
 
与硬链接不同，若文件用户数据块中存放的内容是另一文件的路径名的指向，则该文件就是软连接。
软链接就是一个普通文件，只是数据块内容有点特殊。
软链接有着自己的 inode 号以及用户数据块。因此软链接的创建与使用没有类似硬链接的诸多限制：

- 软链接有自己的文件属性及权限等；

- 可对不存在的文件或目录创建软链接；

- 软链接可交叉文件系统；

- 软链接可对文件或目录创建；

- 创建软链接时，链接计数 i_nlink 不会增加；

- 删除软链接并不影响被指向的文件，但若被指向的原文件被删除，则相关软连接被称为死链接（即 dangling link，若被指向路径文件被重新创建，
死链接可恢复为正常的软链接）。

当然软链接的用户数据也可以是另一个软链接的路径，其解析过程是递归的。

但需注意：软链接创建时原文件的路径指向使用绝对路径较好。使用相对路径创建的软链接被移动后该软链接文件将成为一个死链接（如下所示的软链接 a 使用了相对路径，因此不宜被移动），因为链接数据块中记录的亦是相对路径指向。

# 作用

vue 的 web 项目，可以直接使用软连接使得页面和 web 页面关联起来。

## 软连接

如：

```sh
ln -s /home/hxzq/code/blog-vue/dist/* /home/hxzq/install/apache-tomcat-8.5.6-web/webapps/ROOT/
```

发版时，只需：

```
1. cd /home/hxzq/code/blog-vue
2. git pull
3. npm run build
```


# 参考文章

> [理解 Linux 的硬链接与软链接](https://www.ibm.com/developerworks/cn/linux/l-cn-hardandsymb-links/index.html) 

> [linux ln 命令使用参数详解(ln -s 软链接)](https://www.jb51.net/LINUXjishu/150570.html)

> [linux 创建连接命令 ln -s 软链接](https://www.cnblogs.com/kex1n/p/5193826.html)

* any list
{:toc}







