---
layout: post
title: AI MCP(大模型上下文)-11-微软 Playwright MCP server
date: 2025-4-15 17:51:19 +0800
categories: [AI]
tags: [ai, mcp, sh]
published: true
---

# Playwright MCP

一个基于 [Playwright](https://playwright.dev) 的 Model Context Protocol（MCP）服务器，提供浏览器自动化能力。

此服务器允许大语言模型（LLMs）通过结构化的可访问性快照与网页交互，绕过截图或视觉模型的需求。

### 主要特性

- **快速且轻量**：利用 Playwright 的可访问性树，而非基于像素的输入。
- **适用于大语言模型**：无需视觉模型，仅依赖结构化数据。
- **工具使用确定性强**：避免了基于截图方案中常见的模糊不清问题。

### 应用场景

- 网页导航和表单填写
- 结构化内容的数据提取
- 由大语言模型驱动的自动化测试
- 面向智能体的通用浏览器交互

### 配置示例

```js
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest"
      ]
    }
  }
}
```

### 在 VS Code 中安装

你可以通过以下按钮在 VS Code 中安装 Playwright MCP 服务器：

[<img src="https://img.shields.io/badge/VS_Code-VS_Code?style=flat-square&label=Install%20Server&color=0098FF" alt="Install in VS Code">](https://insiders.vscode.dev/redirect?url=vscode%3Amcp%2Finstall%3F%257B%2522name%2522%253A%2522playwright%2522%252C%2522command%2522%253A%2522npx%2522%252C%2522args%2522%253A%255B%2522-y%2522%252C%2522%2540playwright%252Fmcp%2540latest%2522%255D%257D)  
[<img alt="Install in VS Code Insiders" src="https://img.shields.io/badge/VS_Code_Insiders-VS_Code_Insiders?style=flat-square&label=Install%20Server&color=24bfa5">](https://insiders.vscode.dev/redirect?url=vscode-insiders%3Amcp%2Finstall%3F%257B%2522name%2522%253A%2522playwright%2522%252C%2522command%2522%253A%2522npx%2522%252C%2522args%2522%253A%255B%2522-y%2522%252C%2522%2540playwright%252Fmcp%2540latest%2522%255D%257D)

或者使用 VS Code 命令行工具手动安装：

```bash
# 安装到 VS Code
code --add-mcp '{"name":"playwright","command":"npx","args":["@playwright/mcp@latest"]}'
```

```bash
# 安装到 VS Code Insiders
code-insiders --add-mcp '{"name":"playwright","command":"npx","args":["@playwright/mcp@latest"]}'
```

安装完成后，即可在 VS Code 中与 GitHub Copilot Agent 搭配使用该服务器。

---

### 命令行选项

Playwright MCP 服务器支持以下命令行选项：

- `--browser <browser>`：要使用的浏览器或浏览器通道，支持：
  - `chrome`, `firefox`, `webkit`, `msedge`
  - Chrome 版本：`chrome-beta`, `chrome-canary`, `chrome-dev`
  - Edge 版本：`msedge-beta`, `msedge-canary`, `msedge-dev`
  - 默认值：`chrome`
- `--caps <caps>`：要启用的功能列表（以逗号分隔），可选值：tabs, pdf, history, wait, files, install。默认启用全部。
- `--cdp-endpoint <endpoint>`：指定要连接的 CDP 端点
- `--executable-path <path>`：浏览器可执行文件路径
- `--headless`：以无界面模式运行（默认为带界面）
- `--port <port>`：用于 SSE 通信的监听端口
- `--user-data-dir <path>`：用户数据目录路径
- `--vision`：使用截图运行服务器（默认使用 Aria 快照）

---

### 用户数据目录

Playwright MCP 启动浏览器时，会使用新的用户配置文件，存放位置如下：

- Windows：`%USERPROFILE%\AppData\Local\ms-playwright\mcp-chrome-profile`
- macOS：`~/Library/Caches/ms-playwright/mcp-chrome-profile`
- Linux：`~/.cache/ms-playwright/mcp-chrome-profile`

所有的登录信息都会保存在这个配置文件中。如果你想清除离线状态，可以在会话之间手动删除它。

---

### 无界面浏览器运行

适用于后台或批处理任务：

```js
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--headless"
      ]
    }
  }
}
```

---

### 在无 DISPLAY 的 Linux 上运行带界面浏览器

若在无图形环境的 Linux 系统或 IDE 的后台进程中运行：

1. 在有图形环境的 shell 中启动 MCP 服务器，并添加 `--port` 以启用 SSE。
```bash
npx @playwright/mcp@latest --port 8931
```

2. 在 MCP 客户端配置中设置 `url`：
```js
{
  "mcpServers": {
    "playwright": {
      "url": "http://localhost:8931/sse"
    }
  }
}
```

---

### 工具运行模式

工具可运行于两种模式：

1. **快照模式（默认）**：使用可访问性快照，性能更佳、更稳定
2. **视觉模式**：使用截图进行基于图像的交互

使用视觉模式只需添加 `--vision` 参数：

```js
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--vision"
      ]
    }
  }
}
```

视觉模式适合可通过 X/Y 坐标与元素交互的模型。

---

### 自定义传输的编程用法

```js
import { createServer } from '@playwright/mcp';

const server = createServer({
  launchOptions: { headless: true }
});
transport = new SSEServerTransport("/messages", res);
server.connect(transport);
```

---

### 基于快照的交互指令

- **browser_click**：点击网页元素
- **browser_hover**：悬停元素
- **browser_drag**：拖放两个元素之间
- **browser_type**：在输入框中输入文字，可选择回车提交或逐字输入
- **browser_select_option**：在下拉列表中选择项
- **browser_snapshot**：获取当前页面的可访问性快照
- **browser_take_screenshot**：截图（仅查看用，无法进行后续操作）

---

### 基于视觉的交互指令

- **browser_screen_move_mouse**：移动鼠标到指定位置
- **browser_screen_capture**：截图当前页面
- **browser_screen_click**：点击指定位置
- **browser_screen_drag**：鼠标拖动操作
- **browser_screen_type**：输入文字，可选择是否提交
- **browser_press_key**：模拟键盘按键（如 ArrowLeft 或 'a'）

---

### 标签页管理

- **browser_tab_list**：列出所有标签页
- **browser_tab_new**：新建标签页（可指定网址）
- **browser_tab_select**：切换标签页（通过索引）
- **browser_tab_close**：关闭标签页（不指定默认关闭当前）

---

### 网页导航

- **browser_navigate**：跳转到指定网址
- **browser_navigate_back**：返回上一页
- **browser_navigate_forward**：前进到下一页

---

### 键盘交互

- **browser_press_key**：模拟按键操作

---

### 文件与媒体

- **browser_file_upload**：上传文件（支持多个路径）
- **browser_pdf_save**：保存网页为 PDF

---

### 工具类操作

- **browser_wait**：等待指定秒数（最多 10 秒）
- **browser_close**：关闭当前页面
- **browser_install**：安装缺失的浏览器


# 参考资料

https://github.com/microsoft/playwright-mcp

* any list
{:toc}