---
layout: post
title: Tauri 2.0-10-应用体积（App Size）
date: 2026-03-15 21:01:55 +0800
categories: [Tauri]
tags: [cross-platefrom, sh]
published: true
---

# 应用体积（App Size）

虽然 **Tauri 默认生成的二进制文件非常小**，但如果想进一步 **优化体积大小**，下面给出一些建议和技巧，帮助达到理想的体积结果。([Tauri][1])

## Cargo 配置（Cargo Configuration）

对 Rust 项目进行一些编译配置，可以显著影响最终的体积大小。([Tauri][1])

在 `src-tauri/Cargo.toml` 中添加如下 `profile` 设置：

```toml
[profile.dev]
incremental = true # 让编译器按较小步骤增量编译

[profile.release]
codegen-units = 1   # 让 LLVM 更好地进行优化
lto = true          # 启用链接时优化（Link Time Optimization）
opt-level = "s"     # 优先优化体积；如果想优先速度可用 "3"
panic = "abort"     # 通过禁用 panic 处理来提高性能并减少体积
strip = true        # 从二进制中移除调试符号
```

**配置项说明：**([Tauri][1])

* `incremental`：启用增量编译，使编译更快，模块更独立。
* `codegen-units`：减少代码生成单元数量，有助于 LLVM 完整优化。
* `lto`：启用链接时优化，让整个程序优化得更彻底。
* `opt-level`：优化等级，可选 `"s"`（更小）或 `"3"`（更快）。
* `panic = "abort"`：移除 panic 回溯与 unwind，降低体积。
* `strip`：从最终二进制中移除符号/调试信息。

这些 Cargo Profile 设置不会依赖前端框架，因此对所有 Tauri 项目都适用。([Tauri][1])

---

## 移除未使用命令（Remove Unused Commands）

在较新的 Tauri 版本中，可以通过配置 **去除未使用的命令** 来减少最终二进制体积：([Tauri][1])

在 `tauri.conf.json` 中：

```json
{
  "build": {
    "removeUnusedCommands": true
  }
}
```

启用后：

* Tauri 在构建时会检查所有 capability（权限）文件中允许使用的命令
* 只包含实际允许且使用的命令
* 未被允许或未被使用的命令不会编译进二进制

这个功能依赖：

* `tauri@2.4`
* `tauri-build@2.1`
* `tauri-plugin@2.1`
* `tauri-cli@2.4`
  （需要满足这些版本才能使用）([Tauri][1])

实现机制：

* `tauri-cli` 会与 `tauri-build` 和其他构建脚本通信
* 使用环境变量 `REMOVE_UNUSED_COMMANDS` 指定 capability 文件目录
* 根据允许的 ACL（允许列表）生成一个有效命令清单
* 这些无用命令不会被 `generate_handler` 宏编译进最终程序

⚠️ 注意：如果你在运行时动态添加 ACL，则此优化不会覆盖该部分，所以需要仔细检查命令权限与实际使用。([Tauri][1])

---

## 体积优化建议总结

虽然这个文档主要侧重于 **Rust 后端二进制体积优化**，但还可以补充一些常见优化实践（社区和相关资料中常见的建议）：

* 在前端构建中只打包必要的 JS / CSS 资源
* 尽量不要包含大的自定义字体或大型静态资源
* 在 `tauri.conf.json` 中只启用需要的 API allowlist
* 使用 Rust 编译器优化特性（如上设置）
* 对大型资源进行压缩或延迟加载

这些优化原则有助于降低最终安装包的整体体积。([jonaskruckenberg.github.io][2])

---

## Tauri 体积为何小？

Tauri 相对于 Electron /传统 Web 打包框架体积小的核心原因包括：

* **不打包浏览器引擎**：Tauri 使用操作系统自带的 WebView（如 Edge WebView2 / WebKit）而不是捆绑 Chromium，这使得最小应用可只有几百 KB 甚至低于 1 MB。([Tauri][3])
* **Rust 编译优化**：编译产物是原生二进制，可通过 Cargo 配置进一步瘦身。([Tauri][1])

---

💡 最直观的经验：

| 技术           | App 初始体积       | 是否包含浏览器内核         |              |
| ------------ | -------------- | ----------------- | ------------ |
| **Tauri**    | 最少 ≈ 600 KB 起步 | ❌ 否（使用系统 WebView） |              |
| **Electron** | ≈ 50 MB 或更大    | ✔ 是（捆绑 Chromium）  | ([Tauri][3]) |


# 参考资料

* any list
{:toc}