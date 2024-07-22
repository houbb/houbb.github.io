---
layout: post
title:  rust-lang-07-baisc type 基本类型
date:  2018-07-13 10:32:21 +0800
categories: [Programming Language]
tags: [rust, book, sh]
published: true
---

# 基本类型

当一门语言不谈类型时，你得小心，这大概率是动态语言(别拍我，我承认是废话)。但是把类型大张旗鼓的用多个章节去讲的，Rust 是其中之一。

Rust 每个值都有其确切的数据类型，总的来说可以分为两类：基本类型和复合类型。 基本类型意味着它们往往是一个最小化原子类型，无法解构为其它类型(一般意义上来说)，由以下组成：

数值类型: 有符号整数 (i8, i16, i32, i64, isize)、 无符号整数 (u8, u16, u32, u64, usize) 、浮点数 (f32, f64)、以及有理数、复数
字符串：字符串字面量和字符串切片 &str
布尔类型： true和false
字符类型: 表示单个 Unicode 字符，存储为 4 个字节
单元类型: 即 () ，其唯一的值也是 ()


# 参考资料

https://course.rs/basic/base-type/index.html

* any list
{:toc}