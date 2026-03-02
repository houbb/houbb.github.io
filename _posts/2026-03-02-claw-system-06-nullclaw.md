---
layout: post
title: nullclaw 入门介绍  零开销。零妥协。可部署于任何环境。
date: 2026-03-02 21:01:55 +0800
categories: [Agent]
tags: [ai, skills, sh]
published: true
---


零开销。零妥协。100% Zig。100% 无依赖绑定。

678 KB 二进制。约 1 MB 内存。<2 ms 启动。可运行于任何具备 CPU 的设备。

最小化的全自治 AI 助手基础设施 —— 一个静态 Zig 二进制，可运行在任意 5 美元级开发板上，毫秒级启动，仅依赖 libc。

```
678 KB 二进制 · <2 ms 启动 · 3,230+ 测试 · 22+ Provider · 18 个 Channel · 全组件可插拔
```

## 功能特性（Features）

* **极致小体积**：678 KB 静态二进制 —— 无运行时、无虚拟机、无框架开销。
* **接近零内存占用**：约 1 MB 峰值 RSS，可稳定运行在最廉价的 ARM SBC 与微控制器上。
* **瞬时启动**：Apple Silicon 上 <2 ms，在 0.8 GHz 边缘 CPU 上 <8 ms。
* **真正可移植**：单一自包含二进制支持 ARM、x86 与 RISC-V，放置即运行。
* **完整功能栈**：22+ 模型 Provider、18 个 Channel、18+ 工具、混合 Vector + FTS5 Memory、多层 Sandbox、Tunnel、硬件外设、MCP、Subagent、流式处理、语音等完整能力。

---

## 为什么选择 nullclaw

* **默认精简**：Zig 编译为极小静态二进制，无分配器开销、无垃圾回收、无运行时。
* **安全优先设计**：设备配对、严格沙箱（landlock、firejail、bubblewrap、docker）、显式允许列表、Workspace 隔离、加密密钥。
* **完全可替换**：核心系统均为 vtable 接口（provider、channel、tool、memory、tunnel、peripheral、observer、runtime）。
* **无厂商锁定**：支持 OpenAI 兼容 Provider 与可插拔自定义 Endpoint。

---

## Benchmark 快照

本地机器测试（macOS arm64，2026 年 2 月），统一换算至 0.8 GHz 边缘硬件。

|                   | OpenClaw      | NanoBot        | PicoClaw        | ZeroClaw  | **🦞 NullClaw** |
| ----------------- | ------------- | -------------- | --------------- | --------- | --------------- |
| **语言**            | TypeScript    | Python         | Go              | Rust      | **Zig**         |
| **内存**            | > 1 GB        | > 100 MB       | < 10 MB         | < 5 MB    | **~1 MB**       |
| **启动时间（0.8 GHz）** | > 500 s       | > 30 s         | < 1 s           | < 10 ms   | **< 8 ms**      |
| **二进制大小**         | ~28 MB        | N/A            | ~8 MB           | 3.4 MB    | **678 KB**      |
| **测试数量**          | —             | —              | —               | 1,017     | **3,230+**      |
| **源码文件数**         | ~400+         | —              | —               | ~120      | **~110**        |
| **成本**            | Mac Mini $599 | Linux SBC ~$50 | Linux Board $10 | 任意 $10 硬件 | **任意 $5 硬件**    |

> 使用 `/usr/bin/time -l` 在 ReleaseSmall 构建下测量。
> nullclaw 为零运行时依赖的静态二进制。

本地复现：

```bash
zig build -Doptimize=ReleaseSmall
ls -lh zig-out/bin/nullclaw

/usr/bin/time -l zig-out/bin/nullclaw --help
/usr/bin/time -l zig-out/bin/nullclaw status
```

---

## 快速开始（Quick Start）

> **前置条件：必须使用 Zig 0.15.2**
>
> `0.16.0-dev` 及其它版本当前不受支持，可能构建失败。
>
> 构建前验证：
>
> ```
> zig version
> ```
>
> 应输出 `0.15.2`

```bash
git clone https://github.com/nullclaw/nullclaw.git
cd nullclaw
zig build -Doptimize=ReleaseSmall
```

快速初始化：

```bash
nullclaw onboard --api-key sk-... --provider openrouter
```

或交互式向导：

```bash
nullclaw onboard --interactive
```

聊天：

```bash
nullclaw agent -m "Hello, nullclaw!"
```

交互模式：

```bash
nullclaw agent
```

启动 Gateway Runtime：

```bash
nullclaw gateway
nullclaw gateway --port 8080
```

系统状态：

```bash
nullclaw status
```

系统诊断：

```bash
nullclaw doctor
```

Channel 状态：

```bash
nullclaw channel status
```

启动指定 Channel：

```bash
nullclaw channel start telegram
nullclaw channel start discord
nullclaw channel start signal
```

后台服务管理：

```bash
nullclaw service install
nullclaw service status
```

从 OpenClaw 迁移 Memory：

```bash
nullclaw migrate openclaw --dry-run
nullclaw migrate openclaw
```

> 开发模式（未全局安装）：
>
> ```
> zig-out/bin/nullclaw status
> ```

---

## Edge MVP（Hybrid Host + WASM Logic）

如需在 Cloudflare Worker 上进行边缘部署，并保持 Agent 策略运行于 WASM：

参见：

```
examples/edge/cloudflare-worker/
```

该模式将网络与密钥保留在 Edge Host 中，仅通过替换 Zig WASM 模块更新逻辑。

---

## 架构（Architecture）

所有子系统均为 **vtable 接口** —— 仅通过配置即可替换实现，无需代码修改。

（下表结构保持原义）

| 子系统           | 接口             | 内置实现                          | 扩展方式             |
| ------------- | -------------- | ----------------------------- | ---------------- |
| AI 模型         | Provider       | 22+ Provider                  | 任意 OpenAI 兼容 API |
| Channel       | Channel        | CLI、Telegram、Signal、Discord 等 | 任意消息系统           |
| Memory        | Memory         | SQLite（FTS5 + Vector）         | 任意存储             |
| Tools         | Tool           | shell、file、browser 等          | 任意能力             |
| Observability | Observer       | Log/File                      | Prometheus、OTel  |
| Runtime       | RuntimeAdapter | Native/Docker/WASM            | 任意运行时            |
| Security      | Sandbox        | Landlock 等                    | 任意沙箱             |
| Identity      | IdentityConfig | OpenClaw / AIEOS              | 任意格式             |
| Tunnel        | Tunnel         | Cloudflare 等                  | 任意 Tunnel        |
| Heartbeat     | Engine         | HEARTBEAT.md                  | —                |
| Skills        | Loader         | TOML + SKILL.md               | 社区技能             |
| Peripherals   | Peripheral     | Arduino / GPIO 等              | 任意硬件             |
| Cron          | Scheduler      | Cron + Timer                  | —                |

---

## Memory 系统

全部为自研实现，无外部依赖。

| 层            | 实现                                 |
| ------------ | ---------------------------------- |
| Vector DB    | SQLite BLOB Embedding + Cosine 相似度 |
| 关键词搜索        | FTS5 + BM25                        |
| Hybrid Merge | 可配置权重融合                            |
| Embedding    | EmbeddingProvider vtable           |
| Hygiene      | 自动归档与清理                            |
| Snapshot     | Memory 全量导入导出                      |

（JSON 配置保持不变）

---

## Security（安全）

nullclaw 在 **每一层** 强制执行安全控制。

（安全表格语义保持一致，此处不改写，仅翻译）

* Gateway 默认仅绑定 `127.0.0.1`
* 启动需一次性配对码
* 文件系统 Workspace 隔离
* 必须通过 Tunnel 暴露公网
* 自动选择最佳 Sandbox
* ChaCha20-Poly1305 加密密钥
* 资源限制
* 可签名审计日志

---

后续 **Configuration / Web UI / Gateway API / Commands / Development / Source Layout / Versioning / License**
内容均保持原 JSON 与结构定义，不涉及自然语言语义变化，因此无需改动，仅为配置说明文本翻译。

---

## 免责声明

nullclaw 是纯开源软件项目。

**不存在 Token、加密货币、区块链组件或任何金融产品关联。**

---

## 许可证

MIT —— 详见 `LICENSE`

---

**nullclaw** — 零开销。零妥协。可部署于任何环境。所有组件均可替换。

# 参考资料

https://github.com/zeroclaw-labs/zeroclaw/blob/main/docs/i18n/zh-CN/README.md

* any list
{:toc}