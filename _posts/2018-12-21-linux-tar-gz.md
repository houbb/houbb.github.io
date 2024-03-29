---
layout: post
title: linux tar gz 解压命令  linux 压缩命令
date: 2018-12-21 11:28:06 +0800
categories: [Linux]
tags: [linux, shell, sh]
published: true
---

# tar 文件解压

```
tar -xvf file.tar //解压 tar包

tar -xzvf file.tar.gz //解压tar.gz

tar -xjvf file.tar.bz2   //解压 tar.bz2

tar -xZvf file.tar.Z   //解压tar.Z
```

# gz 文件解压

```
gzip -b java.gz

gunzip FileName.gz
```


# 当然 linux 也可以进行文件的压缩

```
tar -zcvf output.tar.gz folder/
```

这个命令是用来将一个文件夹（folder/）中的内容压缩成一个名为output.tar.gz的压缩文件。

具体解释如下：

- `tar`: 是一个用于归档文件的命令行工具，它可以把一组文件和目录打包成一个文件。
- `-z`: 表示使用 gzip 格式进行压缩。gzip是一种常见的压缩算法，通常会用来减小文件的大小。
- `-c`: 表示创建一个新的归档文件。在这个命令中，它告诉tar创建一个新的压缩文件。
- `-v`: 表示详细输出（verbose），在命令执行过程中会显示正在处理的文件名。
- `-f output.tar.gz`: 指定了输出文件的名称。在这个例子中，输出文件名为output.tar.gz，其中".tar.gz"表示使用tar格式进行打包，并使用gzip进行压缩。
- `folder/`: 指定要归档的文件夹。在这个命令中，它告诉tar归档名为folder的文件夹中的所有内容。

综合起来，这个命令的作用是将指定文件夹中的所有内容打包成一个名为output.tar.gz的压缩文件。

## 例子

```sh
sudo tar -zcvf apache-seatunnel-2.3.4-withjars.tar.gz apache-seatunnel-2.3.4 
```

* any list
{:toc}