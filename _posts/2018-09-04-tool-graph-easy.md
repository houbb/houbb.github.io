---
layout: post
title:  Graph Easy
date:  2018-09-04 09:38:54 +0800
categories: [Tool]
tags: [tool, graph, ascii, sh]
published: true
excerpt: Graph Easy 工具，让你优雅的绘制 ascii 图。
---

# Graph Easy

[Graph::Easy](https://metacpan.org/pod/Graph::Easy) lets you generate graphs consisting of various shaped nodes connected by edges (with optional labels).

It can read and write graphs in a variety of formats, as well as render them via its own grid-based layouter.

Since the layouter works on a grid (manhattan layout), the output is most useful for flow charts, network diagrams, or hierarchy trees.

[语法](http://bloodgate.com/perl/graph/manual/overview.html)

# 下载安装

- 命令行

mac 几行命令搞定。

```
# 1. 
brew install graphviz

# 2. 安装 cpan，一路「回车」
cpan

# 3. 安装 Graph Easy
sudo cpan Graph:Easy
```

- 下载 & 解压

[下载](https://cpan.metacpan.org/authors/id/S/SH/SHLOMIF/Graph-Easy-0.76.tar.gz)

加压后进入文件夹：

```
$ pwd
/Users/houbinbin/Downloads/Graph-Easy-0.76

$ ls
Build.PL	MANIFEST	Makefile.PL	bin		scripts
CHANGES		MANIFEST.SKIP	README		examples	t
INSTALL		META.json	TODO		inc
LICENSE		META.yml	bench		lib
```

- 安装

```
$ perl Makefile.PL 
# 执行测试
$ make test 
# 测试全部ok后,用超级用户安装
$ sudo make install
```

- 测试信息

```
$ graph-easy --version
Graph::Easy v0.76  (c) by Tels 2004-2008.  Released under the GPL 2.0 or later.

Running under Perl v5.018002.
```

# 使用

- 执行命令

```
$   echo "[ Bonn ] -> [ Berlin ] [ Berlin ] -> [ Frankfurt ] { border: 1px dotted black; } [ Frankfurt ] -> [ Dresden ] [ Berlin ] ..> [ Potsdam ] [ Potsdam ] => [ Cottbus ]" | graph-easy
```

- 效果

```
+------+     +---------+     .............     +---------+
| Bonn | --> | Berlin  | --> : Frankfurt : --> | Dresden |
+------+     +---------+     :...........:     +---------+
               :
               :
               v
             +---------+     +-----------+
             | Potsdam | ==> |  Cottbus  |
             +---------+     +-----------+
```


# 其他例子

```
echo "[ DB-M1 ] - 4 -> [ DB-M2 ] [ DB-M2 ] - 4 -> [ DB-M1 ]" | graph-easy
echo "[ DB-M1 ] <-> [ DB-M2 ] " | graph-easy
echo "[ DB-M1 ] - 4 -> [ DB-M2 ] [ DB-M1 ] . (1,2,3,4) .> [ M1-insert ] [ DB-M2 ] . (1,2,3,4) .> [ M2-insert ] [ DB-M2 ] - 4 -> [ DB-M1 ]" | graph-easy
```

or

```
graph-easy <<< '[ DB-Master ] - 4 -> [ DB-Shadow Master ] [ DB-Master ] . (1,2,3,4) .> [ Master-insert ] [ DB-Shadow Master ] '

graph-easy <<< '[ DB-Master ] - 4 -> [ DB-Shadow Master ] [ DB-Master ] . (1,2,3,4) .> [ Master-insert ] [ DB-Shadow Master ] [ DB-Master ] - 网络抖动，故障转移 -> [ DB-Shadow Master ]'
```

## 自用的例子

```
graph-easy <<< '[ 服务层 ] - (如果是写操作) -> [ 主数据库 ] [ 服务层 ] - (如果是读操作) -> [ 从数据库 ]'
```

- hash 分片

```
graph-easy <<< '[ user-service ] - (%2==1) -> [ db1 ] [ user-service ] - (%2==0) -> [ db2 ]'
```

## 流程控制

- 垂直拆分

```
graph-easy <<< '[ user-center ] { flow: down; } -> [ user-db ]'
```

- 多表 join 

```
graph-easy <<< 'graph { flow: up; } [ user-base ], [ user-ext ] --> { end: back,0; } [ user-service ]'
```

- 水平拆分


```
graph-easy <<< 'graph { flow: down; } [user-center] - (0-10W) -> [user-db1] [user-center] - (10W-20W) -> [user-db2]'
```

- 前后端分离

```
graph-easy <<< 'graph { flow: down; } [用户前台] -> [user-center] --> { start: front,0; } [user-db1],[user-db2],[user-db3]'
```

- 多对多服务

```
graph-easy <<< '[Application] - 1 ->  [f-service] - 4 -> [Application] [f-service] - 2 -> [BD-T1] [f-service] {flow:down;}- 3 ->[esb] - 5 -> [data-center] - 6 -> [ DB-T2 ]'
```

方案 2

```
graph-easy <<< '[Application] - 1 ->  [f-service] - 3 -> [Application] [f-service] - 2 -> [BD-T1] [f-service] {flow:down;}- 4 ->[log] - 5 -> [service] - 6 -> [ DB-T2 ]'
```

- 数据一致性

```
graph-easy <<< '[f-service]{flow:down;}--> { start: front,0; }[BD-T1], [DB-T2] [Pair check]{flow:up;}--> { start: front,0; }[BD-T1], [DB-T2]'
```

- database

```
graph-easy <<< '[service-A] - put ->  [cache] - get -> [service-B]
```

```
graph-easy <<< '[service] - Put ->  [cache] [service] - Update ->  [cache] [service] - Apply ->  [sso]'
```

# 参考资料

https://www.jianshu.com/p/54255050d42f

https://juejin.im/post/5a09c43451882535c56c6bbf

* any list
{:toc}