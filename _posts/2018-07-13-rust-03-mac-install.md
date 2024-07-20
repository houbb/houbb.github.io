---
layout: post
title:  rust-lang-03-mac install 安装笔记
date:  2018-07-13 10:32:21 +0800
categories: [Programming Language]
tags: [rust, book, sh]
published: true
---

# MAC 安装

- 执行命令

```sh
curl https://sh.rustup.rs -sSf | sh
```

执行此命令，可能会失败。(wall)

- 安装日志

```sh
houbinbindeMacBook-Pro:rust houbinbin
$ curl https://sh.rustup.rs -sSf | sh
info: downloading installer

Welcome to Rust!

This will download and install the official compiler for the Rust programming 
language, and its package manager, Cargo.

It will add the cargo, rustc, rustup and other commands to Cargo's bin 
directory, located at:

  /Users/houbinbin/.cargo/bin

This path will then be added to your PATH environment variable by modifying the
profile files located at:

  /Users/houbinbin/.profile
  /Users/houbinbin/.bash_profile

You can uninstall at any time with rustup self uninstall and these changes will
be reverted.

Current installation options:

   default host triple: x86_64-apple-darwin
     default toolchain: stable
  modify PATH variable: yes

1) Proceed with installation (default)
2) Customize installation
3) Cancel installation
>1

info: syncing channel updates for 'stable-x86_64-apple-darwin'
info: latest update on 2018-07-10, rust version 1.27.1 (5f2b325f6 2018-07-07)
info: downloading component 'rustc'
 56.5 MiB /  56.5 MiB (100 %)   9.4 MiB/s ETA:   0 s                
info: downloading component 'rust-std'
 44.8 MiB /  44.8 MiB (100 %)   6.5 MiB/s ETA:   0 s                
info: downloading component 'cargo'
info: downloading component 'rust-docs'
  8.8 MiB /   8.8 MiB (100 %)   4.3 MiB/s ETA:   0 s                
info: installing component 'rustc'
info: installing component 'rust-std'
info: installing component 'cargo'
info: installing component 'rust-docs'
info: default toolchain set to 'stable'

  stable installed - rustc 1.27.1 (5f2b325f6 2018-07-07)


Rust is installed now. Great!

To get started you need Cargo's bin directory ($HOME/.cargo/bin) in your PATH 
environment variable. Next time you log in this will be done automatically.

To configure your current shell run source $HOME/.cargo/env
```

- 刷新配置

```sh
source $HOME/.cargo/env
```

- 验证 

如下命令运行成功，则说明运行成功

```sh
rustc --version 
```

结果

```
rustc 1.27.1 (5f2b325f6 2018-07-07)
```

# 快速开始

- main.rs

```rs
fn main() {
    println!("Hello, world!");
}
```

- 编译运行

```
rustc main.rs
./main
```

- 运行结果

```
Hello, world!
```

# 参考资料

https://github.com/KaiserY/rust-book-chinese

* any list
{:toc}