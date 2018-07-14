---
layout: post
title:  WebAssembly & asmjs
date:  2018-07-14 21:07:13 +0800
categories: [Web]
tags: [js, web]
published: true
---

# Asm.js

[asm.js](http://asmjs.org/) an extraordinarily optimizable, low-level subset of JavaScript

## 困难

C/C++ 编译成 JS 有两个最大的困难。

- C/C++ 是静态类型语言，而 JS 是动态类型语言。

- C/C++ 是手动内存管理，而 JS 依靠垃圾回收机制。

asm.js 就是为了解决这两个问题而设计的：**它的变量一律都是静态类型，并且取消垃圾回收机制**。
除了这两点，它与 JavaScript 并无差异，也就是说，asm.js 是 JavaScript 的一个严格的子集，只能使用后者的一部分语法。


# WebAssembly

[WebAssembly](https://webassembly.org/) 是基于堆栈的虚拟机的二进制指令格式。
Wasm被设计成可移植的目标，用于编译高级语言，如 `C/C++/Rust`，支持在web上为客户机和服务器应用程序部署。

## 特性

- 高效、快速

Wasm堆栈机器被设计成以一种大小和装载时高效的二进制格式进行编码。WebAssembly旨在利用广泛的平台上的通用硬件功能，以本地速度执行。

- 安全

WebAssembly描述了一个内存安全、沙箱化的执行环境，甚至可以在现有的JavaScript虚拟机中实现。当嵌入到web中时，WebAssembly将强制执行浏览器的同源和权限安全策略。

- 开放和debuggable

WebAssembly被设计成一种文本格式，用于手工调试、测试、实验、优化、学习、教学和编写程序。当在web上查看Wasm模块的源时，将使用文本格式。

- 开放web平台的一部分

WebAssembly是为了维护web的无版本、特性测试和向后兼容的本质而设计的。
WebAssembly模块将能够调用JavaScript上下文中并通过从JavaScript可访问的相同Web api访问浏览器功能。WebAssembly也支持非web嵌入。

# 快速开始

> [塔克 web 游戏](https://webassembly.org/demo/)

> [Quick Start](https://webassembly.org/getting-started/developers-guide/)

## 安装 mac toolchain

```sh
$ git clone https://github.com/juj/emsdk.git
$ cd emsdk
$ ./emsdk install latest
$ ./emsdk activate latest
```

## 更新配置

此命令将相关的环境变量和目录条目添加到PATH中，以设置当前终端，以便轻松访问编译器工具。

```sh
$ source ./emsdk_env.sh --build=Release
```

## 编译并运行一个简单的程序

现在我们有了一个完整的工具链，我们可以使用它来编译一个简单的WebAssembly程序。然而，还有一些需要注意的地方:

- 我们必须将链接器标志 `-s WASM=1` 传递给 `emcc` (否则，默认情况下，`emcc` 将发出 asm.js)。

- 如果我们想要 Emscripten 生成一个运行我们程序的HTML页面，除了 Wasm 二进制文件和 JavaScript 包装器之外，我们还必须指定一个输出文件名和 `html` 扩展名。

- 最后，要实际运行程序，我们不能简单地在web浏览器中打开HTML文件，因为文件协议方案不支持跨源请求。我们必须通过HTTP提供输出文件。

下面的命令将创建一个简单的“hello world”程序并编译它。

```sh
$ mkdir hello
$ cd hello
$ cat << EOF > hello.c
#include <stdio.h>
int main(int argc, char ** argv) {
  printf("Hello, webassembly!\n");
}
EOF
$ emcc hello.c -s WASM=1 -o hello.html
```

要通过HTTP服务编译后的文件，可以使用emrun web服务器提供的Emscripten SDK:

```
$ emrun --no_browser --port 18080 .
```

## 访问

浏览器访问 [http://localhost:18080/hello.html](http://localhost:18080/hello.html)

# 参考文献

> [Why WebAssembly is Faster Than asm.js](https://hacks.mozilla.org/2017/03/why-webassembly-is-faster-than-asm-js/)

> [asm.js 和 Emscripten 入门教程](http://www.ruanyifeng.com/blog/2017/09/asmjs_emscripten.html)

> [WebAssembly 现状与实战](https://www.ibm.com/developerworks/cn/web/wa-lo-webassembly-status-and-reality/index.html)

* any list
{:toc}