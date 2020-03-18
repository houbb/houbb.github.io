---
layout: post
title: linux paste 命令如 hsell 读取连个文件，并将相同的行内容合并
date: 2018-12-05 11:35:23 +0800
categories: [Linux]
tags: [vim, linux, sh]
published: true
excerpt: Vim 常用命令
---

# 场景

从数据库中将数据的 key 放在一个文件中 keys.txt，将 value 放在另一个文件 value.txt 中。

现在想把二者合并成同一个文件，使用`,`逗号隔开。

当然，如果是文件下载下来可以有很多种方式，不过有时候环境限制，会比较麻烦。

就想直接采用 shell 来处理下。

# paste 方法

因为我两个文件的行数一致，所以直接处理会比较简单。

```
$   paste -d',' key.txt value.txt >> key_value.txt
```

将相同的行，使用连接符号 `,` 隔开，输出到文件 key_value.txt 文件中。

# 方法二

其实做过编程的都知道，上面的方法只是对一个过程的封装，我们当然也可以自己实现。

```sh
LE=$(sed -n '$=' ./ab)  //获取ab的行数
for((j=1;j<2;j++));    //此处for循环用于合并多个文件，单数是源文件名，双数是目标文件名
do
        SRC=$(sed -n "${j}p" ./ab)  //获取指定行的内容
        TGT=$(sed -n "$[$j+1]p" ./ab)
        LEN=$(sed -n '$=' ./${SRC})
        for((i=1;i<$LEN+1;i++));
        do
                VAL=$(sed -n "${i}p" ./${SRC})
                VAL1=$(sed -n "${i}p" ./${TGT})
                echo $VAL"-"$VAL1 >> ./out/${SRC};
        done
done
```

这里说白了就是具体的实现流程，可以作为一种思路的参考。

# 参考资料

[shell实现读取两个相同行的文件并根据指定分隔符拼接成一个文件](https://blog.csdn.net/qq_35001776/article/details/82792069)

[shell脚本读取文件行的四种方法](https://blog.csdn.net/Luqing1123570994/article/details/94637371)

[shell读取文件的指定行字符串 -sed](https://www.cnblogs.com/aggavara/archive/2012/11/12/2765938.html)

* any list
{:toc}