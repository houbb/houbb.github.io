---
layout: post
title: gitnexus 核心使用实战
date: 2026-03-02 21:01:55 +0800
categories: [Agent]
tags: [ai, skills, sh]
published: true
---


# 安装

## 1. 安装

在测试的项目根目录执行 `npx gitnexus analyze`

```
D:\CoPaw\CoPaw-python\src\copaw> npx gitnexus analyze
Need to install the following packages:
gitnexus@1.3.6
Ok to proceed? (y) y

npm warn deprecated npmlog@6.0.2: This package is no longer supported.
npm warn deprecated are-we-there-yet@3.0.1: This package is no longer supported.
npm warn deprecated boolean@3.2.0: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
npm warn deprecated gauge@4.0.4: This package is no longer supported.
npm warn deprecated kuzu@0.11.3: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.

  GitNexus Analyzer

  Skipped 3 large files (>512KB, likely generated/vendored)
  ████████████████████████████████████████ 100% | Done

  Repository indexed successfully (6.6s)

  2,756 nodes | 6,841 edges | 215 clusters | 201 flows
  KuzuDB 2.5s | FTS 3.2s | Embeddings off (use --embeddings to enable)
  D:/CoPaw/CoPaw-python
  Context: AGENTS.md (created), CLAUDE.md (created), .claude/skills/gitnexus/ (6 skills)
  Hooks: Claude Code hook registered
```

### 说明

第一次安装还失败了，可以重试一下。

可以发现还有大文件默认跳过策略，超过 512kb，直接跳过。

初始化后会默认创建对应的几个文件：

该命令将自动完成：

* 代码库索引
* 安装 Agent Skills
* 注册 Claude Code Hooks
* 创建 `AGENTS.md` / `CLAUDE.md` 上下文文件

### Embeddings 向量化默认关闭了

`Embeddings off (use --embeddings to enable)` 

```
> npx gitnexus analyze --embeddings

  GitNexus Analyzer

  Already up to date
```

实际测试发现会报错：

```
npx gitnexus analyze --embeddings

  GitNexus Analyzer

  Skipped 1 large files (>512KB, likely generated/vendored)
  ████████████████████████████████████░░░░  90% | Embedding 0/?node:internal/deps/undici/undici:13510
      Error.captureStackTrace(err);
            ^

TypeError: fetch failed
    at node:internal/deps/undici/undici:13510:13
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
    at runNextTicks (node:internal/process/task_queues:69:3)
    at process.processImmediate (node:internal/timers:453:9)
    at async getModelFile (file:///C:/Users/dh/AppData/Local/npm-cache/_npx/5e786f48223a616c/node_modules/@huggingface/transformers/dis)
    at async getModelText (file:///C:/Users/dh/AppData/Local/npm-cache/_npx/5e786f48223a616c/node_modules/@huggingface/transformers/dis)
    at async getModelJSON (file:///C:/Users/dh/AppData/Local/npm-cache/_npx/5e786f48223a616c/node_modules/@huggingface/transformers/dis)
    at async Promise.all (index 0)
    at async loadTokenizer (file:///C:/Users/dh/AppData/Local/npm-cache/_npx/5e786f48223a616c/node_modules/@huggingface/transformers/di)
    at async AutoTokenizer.from_pretrained (file:///C:/Users/dh/AppData/Local/npm-cache/_npx/5e786f48223a616c/node_modules/@huggingface{
  [cause]: ConnectTimeoutError: Connect Timeout Error (attempted addresses: 2a03:2880:f11b:83:face:b00c:0:25de:443, 103.200.30.143:443,)
      at onConnectTimeout (node:internal/deps/undici/undici:2602:28)
      at Immediate._onImmediate (node:internal/deps/undici/undici:2568:35)
      at process.processImmediate (node:internal/timers:485:21) {
    code: 'UND_ERR_CONNECT_TIMEOUT'
  }
}

Node.js v22.19.0
```

## 2. 如需为编辑器配置 MCP：

```bash
npx gitnexus setup
```

设置成功日志

```
 GitNexus Setup
  ==============


  Claude Code detected. Run this command to add GitNexus MCP:

    claude mcp add gitnexus -- npx -y gitnexus mcp

  Configured:
    + Claude Code (MCP manual step printed)
    + OpenCode
    + Claude Code skills (6 skills → ~/.claude/skills/)
    + Claude Code hooks (PreToolUse)
    + OpenCode skills (6 skills → ~/.config/opencode/skill/)

  Skipped:
    - Cursor (not installed)

  Summary:
    MCP configured for: Claude Code (MCP manual step printed), OpenCode, Claude Code hooks (PreToolUse)
    Skills installed to: Claude Code skills (6 skills → ~/.claude/skills/), OpenCode skills (6 skills → ~/.config/opencode/skill/)

  Next steps:
    1. cd into any git repo
    2. Run: gitnexus analyze
    3. Open the repo in your editor — MCP is ready!
```



## 3. 代码测试

1) 查看当前仓库状态

```
npx gitnexus status
Repository: D:\aicode\openim-plateform
Indexed: 2026/3/2 14:54:09
Indexed commit: a5e57e5
Current commit: a5e57e5
Status: ✅ up-to-date
```

2）实际让其解释对应的原理

发现虽然走到了  skills，但是 hook 失败。

# 参考资料


[1]: https://github.com/abhigyanpatwari/GitNexus?utm_source=chatgpt.com "GitHub - abhigyanpatwari/GitNexus: The fastest way to chat with your code, 100% private - GitNexus is a client-side knowledge graph creator that runs entirely in your browser. Drop in a GitHub repo or ZIP file, and get an interactive knowledge graph with AI-powered chat interface. Perfect for code exploration"
[2]: https://qiita.com/nogataka/items/846d8931b6f36dea5d6a?utm_source=chatgpt.com "〖2026年2月22日〗GitHub日次トレンドTop9──AIセキュリティから金融データ基盤まで #AIエージェント - Qiita"
[3]: https://zenn.dev/pppp303/articles/weekly_ai_20260301?utm_source=chatgpt.com "週刊AI駆動開発 - 2026年03月01日"


* any list
{:toc}