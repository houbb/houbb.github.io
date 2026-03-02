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

Thinking 中可以看到

```
用户想了解 OpenIM 项目中 WebSocket 的具体实现。根据 gitnexus-exploring skill 的工作流程，我需要：

先读取 gitnexus://repo/openim-plateform/context 来检查代码库状态
使用 gitnexus_query 查询 WebSocket 相关的执行流
分析返回的结果
让我开始执行这个工作流程。
```

```
gitnexus:// 资源似乎不能直接用 Read 工具读取。让我尝试使用 Glob 查找 GitNexus 的索引文件，或者直接搜索 WebSocket 相关的代码。

让我先尝试搜索项目中的 WebSocket 相关代码。
```




# 支持命令


## 1. agument  增强搜索结果

```
npx gitnexus augment "ChatController"
[GitNexus] 3 related symbols found:

ChatController.java (openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ChatController.java)

ChatController (openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ChatController.java)

ChatController (openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ChatController.java)
PS D:\aicode\openim-plateform>
PS D:\aicode\openim-plateform> 
PS D:\aicode\openim-plateform> npx gitnexus augment "chat"   

查不到任何结果
```

## 2. mcp query

```
npx gitnexus query "MessageService" -l 10 --repo openim-plateform
```

如下：

```
{
  "processes": [
    {
      "id": "proc_269_sendsinglemessage",
      "summary": "SendSingleMessage → GenerateConversationId",
      "priority": 0.077,
      "symbol_count": 2,
      "process_type": "intra_community",
      "step_count": 3
    },
    {
      "id": "proc_270_sendsinglemessage",
      "summary": "SendSingleMessage → GetMaxSeqId",
      "priority": 0.077,
      "symbol_count": 2,
      "process_type": "cross_community",
      "step_count": 3
    },
    {
      "id": "proc_271_sendsinglemessage",
      "summary": "SendSingleMessage → SetMessageId",
      "priority": 0.077,
      "symbol_count": 2,
      "process_type": "cross_community",
      "step_count": 3
    },
    {
      "id": "proc_272_sendsinglemessage",
      "summary": "SendSingleMessage → SetConversationId",
      "priority": 0.077,
      "symbol_count": 2,
      "process_type": "cross_community",
      "step_count": 3
    },
    {
      "id": "proc_273_sendsinglemessage",
      "summary": "SendSingleMessage → GetCode",
      "priority": 0.062,
      "symbol_count": 1,
      "process_type": "cross_community",
      "step_count": 3
    },
    {
      "id": "proc_274_sendsinglemessage",
      "summary": "SendSingleMessage → GetMsg",
      "priority": 0.062,
      "symbol_count": 1,
      "process_type": "cross_community",
      "step_count": 3
    },
    {
      "id": "proc_142_shareluckydraw",
      "summary": "ShareLuckyDraw → GenerateConversationId",
      "priority": 0.06,
      "symbol_count": 1,
      "process_type": "cross_community",
      "step_count": 3
    },
    {
      "id": "proc_143_shareluckydraw",
      "summary": "ShareLuckyDraw → GetMaxSeqId",
      "priority": 0.06,
      "symbol_count": 1,
      "process_type": "cross_community",
      "step_count": 3
    },
    {
      "id": "proc_144_shareluckydraw",
      "summary": "ShareLuckyDraw → SetMessageId",
      "priority": 0.06,
      "symbol_count": 1,
      "process_type": "cross_community",
      "step_count": 3
    },
    {
      "id": "proc_145_shareluckydraw",
      "summary": "ShareLuckyDraw → SetConversationId",
      "priority": 0.06,
      "symbol_count": 1,
      "process_type": "cross_community",
      "step_count": 3
    }
  ],
  "process_symbols": [
    {
      "id": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/EnhancedMessageController.java:sendSingleMessage",
      "name": "sendSingleMessage",
      "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/EnhancedMessageController.java",
      "startLine": 27,
      "endLine": 27,
      "module": "Service",
      "process_id": "proc_269_sendsinglemessage",
      "step_index": 1
    },
    {
      "id": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageService.java:saveMessage",
      "name": "saveMessage",
      "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageService.java",
      "startLine": 82,
      "endLine": 82,
      "module": "Service",
      "process_id": "proc_269_sendsinglemessage",
      "step_index": 2
    }
  ],
  "definitions": [
    {
      "id": "File:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/EnhancedMessageController.java",
      "name": "EnhancedMessageController.java",
      "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/EnhancedMessageController.java"
    },
    {
      "id": "Class:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/EnhancedMessageController.java:EnhancedMessageController",
      "name": "EnhancedMessageController",
      "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/EnhancedMessageController.java",
      "startLine": 15,
      "endLine": 15
    },
    {
      "id": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageReadService.java:markMessageAsRead",
      "name": "markMessageAsRead",
      "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageReadService.java",
      "startLine": 46,
      "endLine": 46,
      "module": "Service"
    },
    {
      "id": "File:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageReadService.java",
      "name": "MessageReadService.java",
      "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageReadService.java"
    },
    ...
  ]
}
```

## 3. mcp context 符号 360 信息

```
npx gitnexus context "MessageService" --repo openim-plateform 2>&1
```

结果：

```
{
  "status": "found",
  "symbol": {
    "uid": "Class:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageService.java:MessageService",
    "name": "MessageService",
    "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageService.java",
    "startLine": 38,
    "endLine": 38
  },
  "incoming": {},
  "outgoing": {},
  "processes": []
}
```


### 方法

```
npx gitnexus context "saveMessage" --repo openim-plateform
```

```
> npx gitnexus context "saveMessage" --repo openim-plateform
{
  "status": "found",
  "symbol": {
    "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageService.java:saveMessage",
    "name": "saveMessage",
    "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageService.java",
    "startLine": 82,
    "endLine": 82
  },
  "incoming": {
    "calls": [
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/WebhookDispatcherService.java:sendBotMessage", 
        "name": "sendBotMessage",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/WebhookDispatcherService.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/WebhookDispatcherService.java:sendErrorMessage",
        "name": "sendErrorMessage",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/WebhookDispatcherService.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MomentForwardService.java:forwardMomentToChat",
        "name": "forwardMomentToChat",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MomentForwardService.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MomentForwardService.java:forwardCommentToChat",
        "name": "forwardCommentToChat",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MomentForwardService.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageService.java:saveMessage",
        "name": "saveMessage",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageService.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/handler/WebSocketHandler.java:handleMessage",
        "name": "handleMessage",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/handler/WebSocketHandler.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/TodoController.java:createTodo",
        "name": "createTodo",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/TodoController.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ScheduleEventController.java:createEvent",  
        "name": "createEvent",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ScheduleEventController.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/RollCallController.java:createRollCall",    
        "name": "createRollCall",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/RollCallController.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ReminderController.java:createReminder",    
        "name": "createReminder",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ReminderController.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/GroupLotteryController.java:createLottery", 
        "name": "createLottery",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/GroupLotteryController.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/EnhancedMessageController.java:sendSingleMessage",
        "name": "sendSingleMessage",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/EnhancedMessageController.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ChatController.java:sendMessageByConversationId",
        "name": "sendMessageByConversationId",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ChatController.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ChatController.java:sendMessage",
        "name": "sendMessage",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ChatController.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ChatController.java:createVote",
        "name": "createVote",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ChatController.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ChatController.java:createCheckin",
        "name": "createCheckin",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ChatController.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/plugin/controller/TodoPluginController.java:createTodo",
        "name": "createTodo",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/plugin/controller/TodoPluginController.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/plugin/controller/PollPluginController.java:createPoll",
        "name": "createPoll",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/plugin/controller/PollPluginController.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/plugin/controller/LuckyDrawController.java:createLuckyDraw",
        "name": "createLuckyDraw",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/plugin/controller/LuckyDrawController.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/plugin/controller/LuckyDrawController.java:shareLuckyDraw",
        "name": "shareLuckyDraw",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/plugin/controller/LuckyDrawController.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/plugin/controller/LotteryPluginController.java:shareLottery",
        "name": "shareLottery",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/plugin/controller/LotteryPluginController.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/plugin/controller/FortuneDrawController.java:shareFortune",
        "name": "shareFortune",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/plugin/controller/FortuneDrawController.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/plugin/controller/FormPluginController.java:createForm",
        "name": "createForm",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/plugin/controller/FormPluginController.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/plugin/controller/CalendarPluginController.java:createEvent",
        "name": "createEvent",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/plugin/controller/CalendarPluginController.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/plugin/controller/AIPluginController.java:createConversation",
        "name": "createConversation",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/plugin/controller/AIPluginController.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/message/StructuredMessageService.java:sendStructuredMessage",
        "name": "sendStructuredMessage",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/message/StructuredMessageService.java"
      }
    ]
  },
  "outgoing": {
    "calls": [
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageService.java:saveMessage",
        "name": "saveMessage",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageService.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageService.java:saveGroupMessage",
        "name": "saveGroupMessage",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageService.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageService.java:createOrUpdateConversation",
        "name": "createOrUpdateConversation",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageService.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageService.java:generateConversationId",   
        "name": "generateConversationId",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageService.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageService.java:handleLinkMessage",        
        "name": "handleLinkMessage",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageService.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageReadService.java:initializeMessageReadStat",
        "name": "initializeMessageReadStat",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageReadService.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/handler/WebSocketHandler.java:sendMessageToUser",      
        "name": "sendMessageToUser",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/handler/WebSocketHandler.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/mapper/IMMessageMapper.java:getMaxSeqId",
        "name": "getMaxSeqId",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/mapper/IMMessageMapper.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/entity/MessageUserDelete.java:setConversationId",      
        "name": "setConversationId",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/entity/MessageUserDelete.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/entity/MessageUserDelete.java:getMessageId",
        "name": "getMessageId",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/entity/MessageUserDelete.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/entity/MessageUserDelete.java:setMessageId",
        "name": "setMessageId",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/entity/MessageUserDelete.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/entity/MessageUserDelete.java:setStatus",
        "name": "setStatus",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/entity/MessageUserDelete.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/entity/MessageUserDelete.java:setCreateTime",
        "name": "setCreateTime",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/entity/MessageUserDelete.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/entity/MessageUserDelete.java:setUpdateTime",
        "name": "setUpdateTime",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/entity/MessageUserDelete.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/entity/MessageAt.java:setSenderId",
        "name": "setSenderId",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/entity/MessageAt.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/entity/MessageAt.java:setReceiverId",
        "name": "setReceiverId",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/entity/MessageAt.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/entity/MessageAt.java:setMessageType",
        "name": "setMessageType",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/entity/MessageAt.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/entity/IMMessage.java:setContent",
        "name": "setContent",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/entity/IMMessage.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/entity/IMMessage.java:setQuoteMessageId",
        "name": "setQuoteMessageId",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/entity/IMMessage.java"
      },
      {
        "uid": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/entity/IMMessage.java:setSeqId",
        "name": "setSeqId",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/entity/IMMessage.java"
      }
    ]
  },
  "processes": [
    {
      "id": "proc_142_shareluckydraw",
      "name": "ShareLuckyDraw → GenerateConversationId",
      "step_index": 2,
      "step_count": 3
    },
    {
      "id": "proc_143_shareluckydraw",
      "name": "ShareLuckyDraw → GetMaxSeqId",
      "step_index": 2,
      "step_count": 3
    },
    {
      "id": "proc_144_shareluckydraw",
      "name": "ShareLuckyDraw → SetMessageId",
      "step_index": 2,
      "step_count": 3
    },
    {
      "id": "proc_145_shareluckydraw",
      "name": "ShareLuckyDraw → SetConversationId",
      "step_index": 2,
      "step_count": 3
    },
    {
      "id": "proc_269_sendsinglemessage",
      "name": "SendSingleMessage → GenerateConversationId",
      "step_index": 2,
      "step_count": 3
    },
    {
      "id": "proc_270_sendsinglemessage",
      "name": "SendSingleMessage → GetMaxSeqId",
      "step_index": 2,
      "step_count": 3
    },
    {
      "id": "proc_271_sendsinglemessage",
      "name": "SendSingleMessage → SetMessageId",
      "step_index": 2,
      "step_count": 3
    },
    {
      "id": "proc_272_sendsinglemessage",
      "name": "SendSingleMessage → SetConversationId",
      "step_index": 2,
      "step_count": 3
    },
    {
      "id": "proc_286_sendmessagebyconvers",
      "name": "SendMessageByConversationId → GenerateConversationId",
      "step_index": 2,
      "step_count": 3
    },
    {
      "id": "proc_287_sendmessagebyconvers",
      "name": "SendMessageByConversationId → GetMaxSeqId",
      "step_index": 2,
      "step_count": 3
    },
    {
      "id": "proc_288_sendmessagebyconvers",
      "name": "SendMessageByConversationId → SetMessageId",
      "step_index": 2,
      "step_count": 3
    },
    {
      "id": "proc_289_sendmessagebyconvers",
      "name": "SendMessageByConversationId → SetConversationId",
      "step_index": 2,
      "step_count": 3
    },
    {
      "id": "proc_292_sendmessage",
      "name": "SendMessage → GenerateConversationId",
      "step_index": 2,
      "step_count": 3
    },
    {
      "id": "proc_293_sendmessage",
      "name": "SendMessage → GetMaxSeqId",
      "step_index": 2,
      "name": "SendMessage → GenerateConversationId",
      "step_index": 2,
      "step_count": 3
    },
    {
      "id": "proc_293_sendmessage",
      "name": "SendMessage → GetMaxSeqId",
      "step_index": 2,
      "step_count": 3
    },
    {
      "id": "proc_293_sendmessage",
      "name": "SendMessage → GetMaxSeqId",
      "step_index": 2,
      "id": "proc_293_sendmessage",
      "name": "SendMessage → GetMaxSeqId",
      "step_index": 2,
      "name": "SendMessage → GetMaxSeqId",
      "step_index": 2,
      "step_index": 2,
      "step_count": 3
    },
    {
      "id": "proc_294_sendmessage",
      "name": "SendMessage → SetMessageId",
      "step_index": 2,
      "step_count": 3
    },
    {
      "id": "proc_295_sendmessage",
      "name": "SendMessage → SetConversationId",
      "step_index": 2,
      "step_count": 3
    }
  ]
}
```

## 4. impact

```
npx gitnexus impact "MessageService" --repo openim-plateform
```

实际上：

```
{
  "target": {
    "id": "Class:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageService.java:MessageService",
    "name": "MessageService",
    "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageService.java"
  },
  "direction": "upstream",
  "impactedCount": 0,
  "risk": "LOW",
  "summary": {
    "direct": 0,
    "processes_affected": 0,
    "modules_affected": 0
  },
  "affected_processes": [],
  "affected_modules": [],
  "byDepth": {}
}
```

感觉不太对，为什么影响范围是空呢？

### 方法

测试了下方法是对的：

```
npx gitnexus impact "saveMessage" --repo openim-plateform   
{
  "target": {
    "id": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageService.java:saveMessage",
    "name": "saveMessage",
    "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MessageService.java"
  },
  "direction": "upstream",
  "impactedCount": 36,
  "risk": "CRITICAL",
  "summary": {
    "direct": 25,
    "processes_affected": 20,
    "modules_affected": 5
  },
  "affected_processes": [
    {
      "name": "ForwardMoment → GetTargetGroupId",
      "hits": 2,
      "step_count": 4
    },
    {
      "name": "ForwardMoment → GetMomentId",
      "hits": 2,
      "step_count": 3
    },
    {
      "name": "ForwardComment → GetCommentId",
      "hits": 2,
      "step_count": 3
    },
    {
      "name": "ForwardMoment → GetConversationId",
      "hits": 2,
      "step_count": 4
    },
    {
      "name": "ForwardMoment → GetTargetUserId",
      "hits": 2,
      "step_count": 4
    },
    {
      "name": "SendMessage → SetConversationId",
      "hits": 1,
      "step_count": 3
    },
    {
      "name": "ForwardComment → SelectByCommentId",
      "hits": 1,
      "step_count": 3
    },
    {
      "name": "SendSingleMessage → GenerateConversationId",
      "hits": 1,
      "step_count": 3
    },
    {
      "name": "ForwardMoment → GetVisibilityType",
      "hits": 1,
      "step_count": 3
    },
    {
      "name": "ShareLuckyDraw → SetConversationId",
      "hits": 1,
      "step_count": 3
    },
    {
      "name": "SendMessageByConversationId → GetMsg",
      "hits": 1,
      "step_count": 3
    },
    {
      "name": "DispatchWebhook → GetConversationId",
      "hits": 1,
      "step_count": 3
    },
    {
      "name": "SendMessage → GetMaxSeqId",
      "hits": 1,
      "step_count": 3
    },
    {
      "name": "ShareLuckyDraw → SetMessageId",
      "hits": 1,
      "step_count": 3
    },
    {
      "name": "SendMessage → GetCode",
      "hits": 1,
      "step_count": 3
    },
    {
      "name": "ForwardMoment → GetAuthorId",
      "hits": 1,
      "step_count": 3
    },
    {
      "name": "SendSingleMessage → GetMsg",
      "hits": 1,
      "step_count": 3
    },
    {
      "name": "ForwardMoment → GetDeleteTime",
      "hits": 1,
      "step_count": 3
    },
    {
      "name": "SendSingleMessage → GetMaxSeqId",
      "hits": 1,
      "step_count": 3
    },
    {
      "name": "ForwardComment → GetMomentId",
      "hits": 1,
      "step_count": 3
    }
  ],
  "affected_modules": [
    {
      "name": "Entity",
      "hits": 12,
      "impact": "direct"
    },
    {
      "name": "Controller",
      "hits": 9,
      "impact": "direct"
    },
    {
      "name": "Service",
      "hits": 9,
      "impact": "direct"
    },
    {
      "name": "Message",
      "hits": 5,
      "impact": "direct"
    },
    {
      "name": "Model",
      "hits": 1,
      "impact": "direct"
    }
  ],
  "byDepth": {
    "1": [
      {
        "depth": 1,
        "id": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/WebhookDispatcherService.java:sendBotMessage",  
        "name": "sendBotMessage",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/WebhookDispatcherService.java",
        "relationType": "CALLS",
        "confidence": 0.3
      },
      {
        "depth": 1,
        "id": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/WebhookDispatcherService.java:sendErrorMessage",
        "name": "sendErrorMessage",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/WebhookDispatcherService.java",
        "relationType": "CALLS",
        "confidence": 0.3
      },
      {
        "depth": 1,
        "id": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MomentForwardService.java:forwardMomentToChat", 
        "name": "forwardMomentToChat",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MomentForwardService.java",
        "relationType": "CALLS",
        "confidence": 0.3
      },
      {
        "depth": 1,
        "id": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MomentForwardService.java:forwardCommentToChat",
        "name": "forwardCommentToChat",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/service/MomentForwardService.java",
        "relationType": "CALLS",
        "confidence": 0.3
      },
      {
        "depth": 1,
        "id": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/handler/WebSocketHandler.java:handleMessage",
        "name": "handleMessage",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/handler/WebSocketHandler.java",
        "relationType": "CALLS",
        "confidence": 0.9
      },
      {
        "depth": 1,
        "id": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/TodoController.java:createTodo",
        "name": "createTodo",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/TodoController.java",
        "relationType": "CALLS",
        "confidence": 0.9
      },
      {
        "depth": 1,
        "id": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ScheduleEventController.java:createEvent",   
        "name": "createEvent",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ScheduleEventController.java",
        "relationType": "CALLS",
        "confidence": 0.9
      },
      {
        "depth": 1,
        "id": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/RollCallController.java:createRollCall",     
        "name": "createRollCall",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/RollCallController.java",
        "relationType": "CALLS",
        "confidence": 0.9
      },
      {
        "depth": 1,
        "id": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ReminderController.java:createReminder",     
        "name": "createReminder",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ReminderController.java",
        "relationType": "CALLS",
        "confidence": 0.9
      },
      {
        "depth": 1,
        "id": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/GroupLotteryController.java:createLottery",  
        "name": "createLottery",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/GroupLotteryController.java",
        "relationType": "CALLS",
        "confidence": 0.9
      },
      {
        "depth": 1,
        "id": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/EnhancedMessageController.java:sendSingleMessage",
        "name": "sendSingleMessage",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/EnhancedMessageController.java",
        "relationType": "CALLS",
        "confidence": 0.9
      },
      {
        "depth": 1,
        "id": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ChatController.java:sendMessageByConversationId",
        "name": "sendMessageByConversationId",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ChatController.java",
        "relationType": "CALLS",
        "confidence": 0.9
      },
      {
        "depth": 1,
        "id": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ChatController.java:sendMessage",
        "name": "sendMessage",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ChatController.java",
        "relationType": "CALLS",
        "confidence": 0.9
      },
      {
        "depth": 1,
        "id": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ChatController.java:createVote",
        "name": "createVote",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ChatController.java",
        "relationType": "CALLS",
        "confidence": 0.9
      },
      {
        "depth": 1,
        "id": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ChatController.java:createCheckin",
        "name": "createCheckin",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/controller/ChatController.java",
        "relationType": "CALLS",
        "confidence": 0.9
      },
      {
        "depth": 1,
        "id": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/plugin/controller/TodoPluginController.java:createTodo",
        "name": "createTodo",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/plugin/controller/TodoPluginController.java",
        "relationType": "CALLS",
        "confidence": 0.9
      },
      {
        "depth": 1,
        "id": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/plugin/controller/PollPluginController.java:createPoll",
        "name": "createPoll",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/plugin/controller/PollPluginController.java",
        "relationType": "CALLS",
        "confidence": 0.9
      },
      {
        "depth": 1,
        "id": "Method:openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/plugin/controller/LuckyDrawController.java:createLuckyDraw",
        "name": "createLuckyDraw",
        "filePath": "openim-plateform-server/src/main/java/com/github/houbb/openim/plateform/server/plugin/controller/LuckyDrawController.java",
        "relationType": "CALLS",
        "confidence": 0.9
      }
...  
```



# 附录


### CLI 命令

```bash
gitnexus setup                    # 为你的编辑器配置 MCP（一次性）
gitnexus analyze [path]           # 索引一个仓库（或更新过时的索引）
gitnexus analyze --force          # 强制完全重新索引
gitnexus analyze --skip-embeddings  # 跳过嵌入生成（更快）
gitnexus mcp                     # 启动 MCP 服务器（stdio）——服务于所有已索引的仓库
gitnexus serve                   # 启动本地 HTTP 服务器（多仓库），供 Web UI 连接
gitnexus list                    # 列出所有已索引的仓库
gitnexus status                  # 显示当前仓库的索引状态
gitnexus clean                   # 删除当前仓库的索引
gitnexus clean --all --force     # 删除所有索引
gitnexus wiki [path]             # 从知识图谱生成仓库维基
gitnexus wiki --model <model>    # 使用自定义 LLM 模型生成维基（默认：gpt-4o-mini）
gitnexus wiki --base-url <url>   # 使用自定义 LLM API 基础 URL 生成维基
```

### 你的 AI 智能体获得什么

**通过 MCP 暴露的 7 个工具**：

| 工具               | 功能                                                      | `repo` 参数 |
| ------------------ | ----------------------------------------------------------------- | -------------- |
| `list_repos`     | 发现所有已索引的仓库                                 | —             |
| `query`          | 按流程分组的混合搜索（BM25 + 语义 + RRF）             | 可选       |
| `context`        | 360 度符号视图——分类的引用、流程参与度 | 可选       |
| `impact`         | 影响范围分析，按深度分组并带置信度          | 可选       |
| `detect_changes` | Git diff 影响分析——将更改的行映射到受影响的流程       | 可选       |
| `rename`         | 多文件协调重命名，结合图谱和文本搜索            | 可选       |
| `cypher`         | 原始 Cypher 图谱查询                                          | 可选       |

# 参考资料


[1]: https://github.com/abhigyanpatwari/GitNexus?utm_source=chatgpt.com "GitHub - abhigyanpatwari/GitNexus: The fastest way to chat with your code, 100% private - GitNexus is a client-side knowledge graph creator that runs entirely in your browser. Drop in a GitHub repo or ZIP file, and get an interactive knowledge graph with AI-powered chat interface. Perfect for code exploration"
[2]: https://qiita.com/nogataka/items/846d8931b6f36dea5d6a?utm_source=chatgpt.com "〖2026年2月22日〗GitHub日次トレンドTop9──AIセキュリティから金融データ基盤まで #AIエージェント - Qiita"
[3]: https://zenn.dev/pppp303/articles/weekly_ai_20260301?utm_source=chatgpt.com "週刊AI駆動開発 - 2026年03月01日"


* any list
{:toc}