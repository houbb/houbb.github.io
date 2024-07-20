---
layout: post
title:  rust-lang-03-windows install 安装笔记 rustup 方式
date:  2018-07-13 10:32:21 +0800
categories: [Programming Language]
tags: [rust, book, sh]
published: true
---

# 使用 rustup (推荐)

## rustup

我们选择 x64

> [https://static.rust-lang.org/rustup/dist/x86_64-pc-windows-msvc/rustup-init.exe](https://static.rust-lang.org/rustup/dist/x86_64-pc-windows-msvc/rustup-init.exe)

下载后双击安装即可。

### 安装完成日志

```
info: default toolchain set to 'stable-x86_64-pc-windows-msvc'

  stable-x86_64-pc-windows-msvc installed - rustc 1.79.0 (129f3b996 2024-06-10)


Rust is installed now. Great!

To get started you may need to restart your current shell.
This would reload its PATH environment variable to include
Cargo's bin directory (%USERPROFILE%\.cargo\bin).
```



## Windows 子系统 Linux

如果您是 Windows 子系统 Linux 用户，请在终端中运行以下命令，然后按照屏幕上的指示安装 Rust。

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
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

https://www.rust-lang.org/tools/install

* any list
{:toc}