---
layout: post
title:  rust-lang-04-cargo rust 包管理入门介绍
date:  2018-07-13 10:32:21 +0800
categories: [Programming Language]
tags: [rust, book, sh]
published: true
---

# Cargo

Cargo 是 Rust 的构建系统和包管理工具，同时 Rustacean 们使用 Cargo 来管理它们的 Rust 项目。

Cargo 负责三个工作：构建你的代码，下载你代码依赖的库并编译这些库。我们把你代码需要的库叫做“依赖（dependencies）”因为你的代码依赖他们。

```sh
$ cargo --version
```

## 转换到 Cargo

- 创建源文件目录并移除旧的可执行文件

首先，回到你的终端，移动到你的hello_world目录，并输入如下命令：

```sh
$ mkdir src
$ mv main.rs src/main.rs # or 'move main.rs src/main.rs' on Windows
$ rm main  # or 'del main.exe' on Windows
```

Cargo 期望源文件位于 `src` 目录，所以先做这个。
这样将项目顶级目录（在这里，是 hello_world）留给 README，license 信息和其他跟代码无关的文件。这样，Cargo 帮助你保持项目干净整洁。一切井井有条。

- 创建配置文件

下一步，在 hello_world 目录创建一个文件，叫做 `Cargo.toml`。

这个文件使用 [TOML](https://github.com/toml-lang/toml)（Tom's Obvious, Minimal Language）格式。
TOML 类似于 INI，不过有一些额外的改进之处，并且被用作 Cargo 的配置文件。

输入如下内容

- Cargo.toml

```ini
[package]

name = "hello_world"
version = "0.0.1"
authors = [ "Your name <you@example.com>" ]
```

- 构建并运行 Cargo 项目

```sh
$ cargo build
   Compiling hello_world v0.0.1 (file:///home/yourname/projects/hello_world)
$ ./target/debug/hello_world
Hello, world!
```

你刚刚用 `cargo build` 构建了一个程序,
并用 `./target/debug/hello_world` 运行了它，
不过你也可以用如下的一步操作 `cargo run` 来完成这两步操作：

```sh
$ cargo run
     Running `target/debug/hello_world`
Hello, world!
```

注意这个例子并没有重新构建项目。
Cargo 发现文件并没有被修改，所以它只是运行了二进制文件。如果你修改了源文件，Cargo 会在运行前重新构建项目，这样你将看到像这样的输出：

```sh
$ cargo run
   Compiling hello_world v0.0.1 (file:///home/yourname/projects/hello_world)
     Running `target/debug/hello_world`
Hello, world!
```

Cargo 检查任何项目文件是否被修改，并且只会在你上次构建后修改了他们才重新构建。
对于简单的项目，Cargo 并不比使用rustc要好多少，不过将来它会变得有用。
这在你开始使用 crate 时显得尤为正确；（crate）在其他语言中有“库（library）”或“包（package）”这样的同义词。对于包含多个 crate 的项目，让 Cargo 来协调构建将会轻松很多。
有了 Cargo，你可以运行cargo build，而一切将有条不紊的运行。

- 发布构建

当你的项目准备好发布了，可以使用 `cargo build --release` 来优化编译项目。
这些优化可以让 Rust 代码运行的更快，不过启用他们会让程序花更长的时间编译。
这也是为何这是两种不同的配置，一个为了开发，另一个构建提供给用户的最终程序。

## 那个 `Cargo.lock` 是什么？

运行这个命令同时也会让 Cargo 创建一个叫做 Cargo.lock 的文件，它看起来像这样：

```ini
[root]
name = "hello_world"
version = "0.0.1"
```

Cargo 用Cargo.lock文件跟踪你程序的依赖。这里是 Hello World 项目的Cargo.lock文件。
这个项目并没有依赖，所以内容有一点稀少。
事实上，你自己甚至都不需要碰这个文件；仅仅让 Cargo 处理它就行了。

就是这样！如果你一路跟过来了，你应该已经成功使用 Cargo 构建了hello_world。
虽然这个项目很简单，现在它使用了很多在你余下的 Rust 生涯中将会用到的实际的工具。
事实上，你可以期望使用如下命令的变体开始所有的 Rust 项目：

```sh
$ git clone someurl.com/foo
$ cd foo
$ cargo build
```

## 创建新 Cargo 项目的简单方法

你并不需要每次都过一遍上面的操作来开始一个新的项目！Cargo 可以快速创建一个骨架项目目录这样你就可以立即开始开发了。
用 Cargo 来开始一个新项目，在命令行输入 `cargo new`：

```sh
$   cargo new hello_world --bin
```

这个命令传递了 `--bin` 参数因为我们的目标是直接创建一个可执行程序，而不是一个库。

可执行文件通常叫做二进制文件（因为它们位于 `/usr/bin`，如果你使用 Unix 系统的话）。

Cargo 为我们创建了两个文件和一个目录：
一个 `Cargo.toml` 和一个包含了 `main.rs` 文件的 **src** 目录。
这应该看起来很眼熟，他们正好是我们在之前手动创建的那样。
这些输出是你开始所需要的一切。

首先，打开Cargo.toml。它应该看起来像这样：

```ini
[package]

name = "hello_world"
version = "0.1.0"
authors = ["Your Name <you@example.com>"]

[dependencies]
```

Cargo 已经根据你给出的参数和git全局配置给出了合理的默认配置。你可能会注意到 Cargo 也把hello_world目录初始化为了一个git仓库。

这是应该写入 `src/main.rs` 的代码：

```rs
fn main() {
    println!("Hello, world!");
}
```

# 中文文档

> [中文文档](https://kaisery.gitbooks.io/rust-book-chinese/content/)

# 参考资料

https://github.com/KaiserY/rust-book-chinese

* any list
{:toc}