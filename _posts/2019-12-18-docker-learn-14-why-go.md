---
layout: post
title: Docker learn-14-为什么选择 go 语言实现 docker
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, windows, devops, go-lang, sh]
published: true
---

# 为什么使用 Docker

## static compilation

- “go build” will embed everything you need(no more “install this in order to run my stuff”)

- … except dynamic libraries if you use cgo(cgo lets you use any C library)

- and … except libc

(but who doesn’t have libc?)

- you can have a real static binary (if you hack the build process a bit…)

easier to install, easier to test, easier to adopt

引导程序的良好候选者（即首先安装的东西，将安装其他东西）

## 中性

- it’s not C++

- it’s not Python

- it’s not Ruby

- it’s not Java

## 拥有我们需要的特性

good asynchronous primitives(wait for I/O, wait for processes…)

low-level interfaces(manage processes, syscalls…)

extensive standard library and data types

strong duck typing

## full development environment

Go addresses multiple issues of the development workflow.

- go doc (see documentation for any package)

- go get (fetch dependencies on github etc.)

- go fmt (solve “tabs vs. spaces” once for all)

- go test (runs all Test* functions in *_test.go)

- go run (rapid script-like prototyping)

## multi-arch build

...without pre-processors

```
_linux.go
_darwin.go
```

# 缺点

## maps aren’t thread-safe

刻意的决定：它们很快（取决于您确保它们的安全）

您必须使用sync.Mutex保护访问

or, use channels of channels!

```go
m := NewMap()
response := make(chan string)
m<-Get{Key: “fortytwo”, Replyto: response}
value := <-response
```

## go get

- 无法固定特定修订

Docker必须供应所有依赖项（即，将其源代码导入我们的存储库中）

必须手动处理私人仓库

## go test

在测试中不能包含 destructors/cleanups/

使用名为 `z_final_test.go` 的测试，在运行单个测试时效果不佳！

## go build

当它们共享一些通用代码时，构建多个二进制文件很痛苦

每个程序必须位于其自己的程序包中，并且程序包必须是“主程序”

您必须将共享/公用的内容放在一边，或者使用命名的导入技巧（令人毛骨悚然）

## flag package

不处理短/长选项（-o --option）

无法处理选项分组（-abc -a -b -c）

认真地只是不要使用它（改用getopt或go-flags），除非您的主要目标当然是Plan9！

## no IDE

# 参考资料

《为什么要用 Go 开发 Docker》

[为什么要使用 Go 语言？Go 语言的优势在哪里？](https://www.zhihu.com/question/21409296)

https://m.open-open.com/pdf/6eb4efc232ef4bc1b6d0ba0d31c09cb5.html

* any list
{:toc}