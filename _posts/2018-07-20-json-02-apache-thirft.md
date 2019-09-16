---
layout: post
title: 跨语言传输协议-Thirft
date:  2018-09-20 10:06:48 +0800
categories: [Protocol]
tags: [protocol, google, sh]
published: true
---

# Apache Thrift

[Apache Thrift](https://thrift.apache.org/) 软件框架，用于可伸缩的跨语言服务开发，它将软件堆栈和代码生成引擎结合在一起，构建了在c++、Java、Python、PHP、Ruby、Erlang、Perl、Haskell、c#、Cocoa、JavaScript、Node之间高效无缝地工作的服务。js、Smalltalk、OCaml、Delphi等语言。

## 优点

Thrift实际上是实现了C/S模式，通过代码生成工具将接口定义文件生成服务器端和客户端代码（可以为不同语言），从而实现服务端和客户端跨语言的支持。用户在Thirft描述文件中声明自己的服务，这些服务经过编译后会生成相应语言的代码文件，然后用户实现服务（客户端调用服务，服务器端提服务）便可以了。其中protocol（协议层, 定义数据传输格式，可以为二进制或者XML等）和transport（传输层，定义数据传输方式，可以为TCP/IP传输，内存共享或者文件共享等）被用作运行时库。

Thrift支持二进制，压缩格式，以及json格式数据的序列化和反序列化。这让用户可以更加灵活的选择协议的具体式。更完美的是，协议是可自由扩展的，新版本的协议，完全兼容老的版本！

## 缺点

文档不是很全。

# 跨语言传输协议

在现在的技术体系中，能用于描述通讯协议的方式很多，如 [xml](https://houbb.github.io/2017/06/21/xml)、
[json](https://houbb.github.io/2018/07/20/json)、[protobuf](https://houbb.github.io/2018/03/16/google-protocol-buffer)、thrift。

# 参考资料

[比较跨语言通讯框架：thrift和Protobuf](http://bijian1013.iteye.com/blog/2232207)


* any list
{:toc}