---
layout: post
title: Tree-sitter 文档-13-ABI 版本（ABI Versions）
date: 2026-01-05 21:01:55 +0800
categories: [AST]
tags: [ast, tree-sitter, sh]
published: true
---

# ABI 版本（ABI Versions）

Tree-sitter 使用 **ABI（Application Binary Interface，应用二进制接口）版本号** 来确保：

> 语言解析器（parser）与 Tree-sitter 库本身在二进制层面兼容。

当 ABI 不兼容时，即使代码可以编译，程序在运行时也可能崩溃或无法加载解析器。 ([GitHub][1])

---

## 什么是 ABI 版本

每个由 Tree-sitter CLI 生成的语言都会被分配一个 **ABI 版本号**。

该版本号表示：

* 解析器生成时所使用的 Tree-sitter CLI 的内部接口版本
* 与 Tree-sitter 运行时库之间的二进制兼容关系

可以通过 API 获取该值：

```c
uint32_t ts_language_abi_version(const TSLanguage *);
```

该函数返回语言对应的 ABI 版本号，用于确认兼容性。 ([Docs.rs][2])

---

## ABI 兼容规则

Tree-sitter 的兼容策略如下：

* ✅ **向后兼容（Backward-compatible）**

  * 新版本库通常可以加载旧 ABI 生成的语言

* ❌ **不向前兼容（Forward-compatible）**

  * 旧版本库无法加载由更新 CLI 生成的语言

换句话说：

```
New Library + Old Parser   ✅
Old Library + New Parser   ❌
```

原因是 ABI 变化可能修改内部数据结构布局。 ([Docs.rs][3])

---

## ABI 不匹配时的表现

当 ABI 不一致时，通常会出现：

* 解析器加载失败
* 编辑器无法启用语法高亮
* 动态库加载错误
* 应用程序崩溃

例如：

```
supported between 13 and 13, found 12
```

表示当前 Tree-sitter 仅支持 ABI 13，但解析器是 ABI 12。

---

## ABI 与共享库文件名

现代 Tree-sitter 解析器通常在共享库名称中包含 ABI 版本，例如：

```
libtree-sitter-java.so.14.0
libtree-sitter-java.so.15.0
```

其中数字即 ABI 版本号，用于防止不同 ABI 的库互相覆盖。 ([lists.gnu.org][4])

---

## ABI 版本来源

ABI 版本由以下因素决定：

* Tree-sitter CLI 版本
* `parser.c` 中的 `LANGUAGE_VERSION`
* 生成解析器时的内部结构定义

当前库会声明自己支持的最大 ABI 版本，例如：

```
LANGUAGE_VERSION = 15
```

表示该运行时最多支持 ABI 15 的语言。 ([Docs.rs][3])

---

## 实践建议

当出现 ABI 问题时，应：

1. 重新生成语言解析器

```
tree-sitter generate
```

2. 或升级 Tree-sitter 运行时库

3. 保证以下版本一致：

```
tree-sitter CLI
tree-sitter runtime
language parser
```

---

## 核心结论

Tree-sitter 的 ABI 机制本质上是：

> **保证语法解析器与运行时在二进制结构层面的安全兼容机制。**


# 参考资料


[1]: https://github.com/tree-sitter/tree-sitter/issues/3925?utm_source=chatgpt.com "Please add to tree-sitter headers information about ABI version and/or Tree-sitter version · Issue #3925 · tree-sitter/tree-sitter · GitHub"
[2]: https://docs.rs/tree-sitter/latest/tree_sitter/ffi/fn.ts_language_abi_version.html?utm_source=chatgpt.com "ts_language_abi_version in tree_sitter::ffi - Rust"
[3]: https://docs.rs/tree-sitter/latest/tree_sitter/constant.LANGUAGE_VERSION.html?utm_source=chatgpt.com "LANGUAGE_VERSION in tree_sitter - Rust"
[4]: https://lists.gnu.org/archive/html/bug-gnu-emacs/2025-06/msg00535.html?utm_source=chatgpt.com "bug#78754: Tree-sitter started versioning their shared library filenames"

* any list
{:toc}