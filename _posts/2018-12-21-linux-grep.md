---
layout: post
title: linux grep
date: 2018-12-21 11:28:06 +0800
categories: [Linux]
tags: [linux, shell, sh]
published: true
excerpt: linux grep 命令
---

# grep

Linux grep命令用于查找文件里符合条件的字符串。

grep指令用于查找内容包含指定的范本样式的文件，如果发现某文件的内容符合所指定的范本样式，预设grep指令会把含有范本样式的那一列显示出来。

若不指定任何文件名称，或是所给予的文件名为"-"，则grep指令会从标准输入设备读取数据。

## 命令信息

```
$   info grep
```

可以参看对应的命令信息

- -a 或 --text : 不要忽略二进制的数据。

- -A<显示行数> 或 --after-context=<显示行数> : 除了显示符合范本样式的那一列之外，并显示该行之后的内容。

- -b 或 --byte-offset : 在显示符合样式的那一行之前，标示出该行第一个字符的编号。

- -B<显示行数> 或 --before-context=<显示行数> : 除了显示符合样式的那一行之外，并显示该行之前的内容。

- -c 或 --count : 计算符合样式的列数。

- -C<显示行数> 或 --context=<显示行数>或-<显示行数> : 除了显示符合样式的那一行之外，并显示该行之前后的内容。

- -d <动作> 或 --directories=<动作> : 当指定要查找的是目录而非文件时，必须使用这项参数，否则grep指令将回报信息并停止动作。

- -e<范本样式> 或 --regexp=<范本样式> : 指定字符串做为查找文件内容的样式。

- -E 或 --extended-regexp : 将样式为延伸的普通表示法来使用。

- -f<规则文件> 或 --file=<规则文件> : 指定规则文件，其内容含有一个或多个规则样式，让grep查找符合规则条件的文件内容，格式为每行一个规则样式。

- -F 或 --fixed-regexp : 将样式视为固定字符串的列表。

- -G 或 --basic-regexp : 将样式视为普通的表示法来使用。

- -h 或 --no-filename : 在显示符合样式的那一行之前，不标示该行所属的文件名称。

- -H 或 --with-filename : 在显示符合样式的那一行之前，表示该行所属的文件名称。

- -i 或 --ignore-case : 忽略字符大小写的差别。

- -l 或 --file-with-matches : 列出文件内容符合指定的样式的文件名称。

- -L 或 --files-without-match : 列出文件内容不符合指定的样式的文件名称。

- -n 或 --line-number : 在显示符合样式的那一行之前，标示出该行的列数编号。

- -q 或 --quiet或--silent : 不显示任何信息。

- -r 或 --recursive : 此参数的效果和指定"-d recurse"参数相同。

- -s 或 --no-messages : 不显示错误信息。

- -v 或 --revert-match : 显示不包含匹配文本的所有行。

- -V 或 --version : 显示版本信息。

- -w 或 --word-regexp : 只显示全字符合的列。

- -x --line-regexp : 只显示全列符合的列。

- -y : 此参数的效果和指定"-i"参数相同。

## 重要的参数

- -i 或 --ignore-case : 忽略字符大小写的差别。

- -v 或 --revert-match : 显示不包含匹配文本的所有行。

- -n 或 --line-number : 在显示符合样式的那一行之前，标示出该行的列数编号。

# 案例

## 查看历史命令

```
$ history | grep cat
   27  sudo cat /var/lib/docker/repositories | python -mjson.tool
  434  cat vpn.sh 
  450  cat /etc/profile
  456  cat .ssh/id_rsa.pub
  501  history | grep cat
```

## 查看包含某项内容的日志信息

```
$   grep -a '关键字' xxx.log
```

可以把 xxx.log 所有关于关键字的信息都打印出来。


## 查看匹配的前几行和后几行

```
less xxx.log | grep -a10 -b10 "${keyword}"
```

匹配关键词的前几行和后几行。

## 多次过滤

我们可以对某次过滤的结果再次过滤

```
$   history | grep cat | grep vpn
  434  cat vpn.sh 
  502  history | grep cat | grep vpn
```

# 查看过滤后的前(后)几条

多个命令的结合。

展现：less/cat/more

过滤：grep

前几行：head/tail

```
$ less application.2019-04-27-0.log | grep 'npay' | head -n 10
```

查看包含关键词 napy 的数据，匹配的前几个。

# 统计某个正则出现的次数

```
egrep -o  '正则表达式' XXX.log | sort -n | uniq  -c
```

XXX.log 符合正则的信息，`-o` 表示只显示匹配内容

sort -n  按值进行排序

uniq  -c 独一无二的结果，和对应的次数。

# 语法高亮

有时候 grep 之后不是高亮的，看起来比较痛苦。

```
export GREP_OPTIONS='--color=always' 
```

设置即可。

## 参数说明

export GREP_OPTIONS='--color=XXX' ; color有三个值供选择: never always auto ;

always和auto的区别: always会在任何情况下都给匹配字段加上颜色标记; auto 只给最后一个管道符匹配项加亮显示；

export GREP_COLOR='a;b' #默认是1;31，即高亮的红色; 您可以根据自己的喜好设置不同的颜色； 

a可以选择:【0,1,4,5,7,8】

0 关闭所有属性
1 设置高亮度
4 下划线
5 闪烁
7 反显
8 消隐

b可以选择:【30-37或40-47】

30 black
31 red
32 green
33 yellow
34 blue
35 purple
36 cyan
37 white
30 — 37 设置前景色
40 — 47 设置背景色

# 参考资料

[linux 命令大全](http://www.runoob.com/linux/linux-command-manual.html)

* any list
{:toc}