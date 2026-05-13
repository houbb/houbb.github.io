---
layout: post 
title: GitHub - CloakHQ/CloakBrowser: 能通过所有机器人检测测试的隐身 Chromium 浏览器。
date: 2026-05-13 21:01:55 +0800
categories: [AI]
tags: [ai, agent]
published: true
---


# GitHub - CloakHQ/CloakBrowser: 能通过所有机器人检测测试的隐身 Chromium 浏览器。即插即用的 Playwright 替代品，带有源代码级指纹补丁。通过 30/30 项测试。

### 能通过所有机器人检测测试的隐身 Chromium 浏览器。

不是经过修补的配置。不是 JS 注入。

而是一个在 C++ 源代码级别修改了指纹的真实 Chromium 二进制文件。反机器人系统将其评分为正常浏览器——因为它**就是**一个正常浏览器。

_Cloudflare Turnstile — 3 项实时测试通过（有头模式，macOS）_

适用于 Python 和 JavaScript 的即插即用型 Playwright/Puppeteer 替代品。
相同 API，相同代码——只需替换导入语句。**3 行代码，30 秒解决屏蔽问题。**

*   **49 个源代码级 C++ 补丁** — 覆盖 Canvas、WebGL、音频、字体、GPU、屏幕、WebRTC、网络时序、自动化信号、CDP 输入行为
*   **`humanize=True`** — 拟人化的鼠标曲线、键盘敲击时机和滚动模式。一个标志即可通过行为检测
*   **0.9 的 reCAPTCHA v3 评分** — 人类级别，服务器端验证
*   **通过 Cloudflare Turnstile**、FingerprintJS、BrowserScan — 经过 30 多个检测网站测试
*   **自动更新二进制文件** — 后台更新检查，始终使用最新的隐身编译版本
*   **`pip install cloakbrowser`** 或 **`npm install cloakbrowser`** — 二进制文件自动下载，零配置
*   **免费且开源** — 无订阅，无使用限制

**立即尝试** — 无需安装：

```bash
docker run --rm cloakhq/cloakbrowser cloaktest
```

**Python:**

```python
from cloakbrowser import launch

browser = launch()
page = browser.new_page()
page.goto("https://protected-site.com")  # 不再被屏蔽
browser.close()
```

**JavaScript (Playwright):**

```javascript
import { launch } from 'cloakbrowser';

const browser = await launch();
const page = await browser.newPage();
await page.goto('https://protected-site.com');
await browser.close();
```

也可与 Puppeteer 一起使用：`import { launch } from 'cloakbrowser/puppeteer'`（[详见此处](https://github.com#puppeteer)）

## 安装

**Python:**

```bash
pip install cloakbrowser
```

**JavaScript / Node.js:**

```bash
# 配合 Playwright 使用
npm install cloakbrowser playwright-core

# 配合 Puppeteer 使用
npm install cloakbrowser puppeteer-core
```

首次运行时，隐身 Chromium 二进制文件会被自动下载（约 200MB，缓存在本地）。

**可选：** 从代理 IP 自动检测时区/区域设置：

```bash
pip install cloakbrowser[geoip]
```

**从 Playwright 迁移？** 只需改动一行代码：

```diff
- from playwright.sync_api import sync_playwright
- pw = sync_playwright().start()
- browser = pw.chromium.launch()
+ from cloakbrowser import launch
+ browser = launch()

page = browser.new_page()
page.goto("https://example.com")
# ... 其余代码无需改动即可工作
```

> ⭐ **点个 Star** 以示支持 — **[关注发布](https://github.com/CloakHQ/CloakBrowser/subscription)** 以在新版本发布时收到通知。

## 浏览器配置文件管理器

Multilogin、GoLogin 和 AdsPower 的自托管替代方案。创建具有唯一指纹、代理和持久会话的浏览器配置文件。通过 noVNC 在您的浏览器中启动并与它们交互。

```bash
docker run -p 8080:8080 -v cloakprofiles:/data cloakhq/cloakbrowser-manager
```

打开 [http://localhost:8080](http://localhost:8080)。创建一个配置文件。点击 **Launch**。完成。

→ **[CloakBrowser Manager](https://github.com/CloakHQ/CloakBrowser-Manager)** — 免费，开源 (MIT)

* * *

## 最新版本: v0.3.26 (Chromium 146.0.7680.177.4)

*   **`launch_context_async()`** — `launch_context()` 的异步版本。将关键字参数转发给 `browser.new_context()`，用于设置 `storage_state`、`permissions`、`extra_http_headers` 等，无需持久化配置文件文件夹。
*   **JS `contextOptions` 应急出口** — 从 `launchContext()` / `launchPersistentContext()` 向 Playwright 的 `newContext()` 转发任意选项（包括 `storageState`）。
*   **原生 SOCKS5 代理** — 所有启动函数（Python + JS）中直接支持 `proxy="socks5://user:pass@host:port"`。通过 UDP ASSOCIATE 使 QUIC/HTTP3 隧道穿透 SOCKS5。
*   **Chromium 146 升级** — 将所有补丁从 145.0.7632.x 版本重新基于 146.0.7680.177 版本。
*   **57 个指纹补丁** — 增加了额外的检测向量覆盖（WebAuthn、AAC 音频、窗口位置）以及 WebGL/Canvas 一致性修复。
*   **WebRTC IP 欺骗** — `--fingerprint-webrtc-ip=auto` 会解析您代理的出口 IP 并欺骗 WebRTC ICE 候选地址。使用 `geoip=True` 时自动注入（无需额外网络调用）。
*   **代理信号移除** — DNS/连接/SSL 时序归零，代理缓存头剥离，Proxy-Connection 头泄漏已修复。
*   **`cloakserve` CDP 多路复用器** — 重写为多连接 CDP 代理，支持按连接分别设置指纹种子。
*   **人性化 CDP 隔离** — 键盘事件现在使用隔离世界和可信分发，以实现更好的行为隐身。
*   **`humanize=True`** — 一个标志即可使所有鼠标、键盘和滚动交互表现得像真实用户。贝塞尔曲线、逐字符输入、真实的滚动模式。
*   **零标志隐身** — 二进制文件在启动时自动生成随机指纹种子。无需任何配置。
*   **基于代理 IP 的时区和区域设置** — `launch(proxy="...", geoip=True)` 自动检测时区和区域设置。
*   **持久化配置文件** — `launch_persistent_context()` 在会话间保留 Cookies 和 localStorage，绕过无痕浏览检测。

详见 [CHANGELOG.md](https://github.com/CloakHQ/CloakBrowser/blob/main/CHANGELOG.md)。

## 为什么选择 CloakBrowser？

*   **配置级别的补丁会被破解** — `playwright-stealth`、`undetected-chromedriver` 和 `puppeteer-extra` 要么注入 JavaScript，要么调整标志。每次 Chrome 更新都会破坏它们。反机器人系统本身就能检测到这些补丁。
*   **CloakBrowser 修补 Chromium 源代码** — 指纹在 C++ 级别被修改，并编译到二进制文件中。检测网站看到的是一个真实的浏览器，因为它**就是**一个真实的浏览器。
*   **源代码级别隐身** — C++ 补丁在二进制级别处理指纹（GPU、屏幕、UA、硬件报告）。没有 JavaScript 注入，没有配置级别的破解。大多数隐身工具只在表层进行修补。
*   **所有环境下行为一致** — 在本地、Docker 和 VPS 上工作方式完全相同。无需特定环境的补丁或配置。
*   **适用于 AI 代理和自动化框架** — 为 browser-use、Crawl4AI、Scrapling、Stagehand、LangChain、Selenium 等提供即插即用的隐身功能。参见 [框架集成](#framework-integrations)。

CloakBrowser 不解决 CAPTCHA 验证码——它**防止**验证码出现。不内置验证码解决服务、不内置代理轮换——请自行准备代理，使用您已经熟悉的 Playwright API。

## 测试结果

所有测试均针对实时检测服务验证。最后测试时间：2026 年 4 月（Chromium 146）。

| 检测服务 | 原生 Playwright | CloakBrowser | 备注 |
| :--- | :--- | :--- | :--- |
| **reCAPTCHA v3** | 0.1 (机器人) | **0.9** (人类) | 服务器端验证 |
| **Cloudflare Turnstile** (非交互式) | 失败 | **通过** | 自动解析 |
| **Cloudflare Turnstile** (托管式) | 失败 | **通过** | 单次点击 |
| **ShieldSquare** | 被屏蔽 | **通过** | 生产网站 |
| **FingerprintJS** 机器人检测 | 被检测到 | **通过** | demo.fingerprint.com |
| **BrowserScan** 机器人检测 | 被检测到 | **正常** (4/4) | browserscan.net |
| **bot.incolumitas.com** | 13 项失败 | **1 项失败** | 仅 WEBDRIVER 规范 |
| **deviceandbrowserinfo.com** | 6 个真标志 | **0 个真标志** | `isBot: false` |
| `navigator.webdriver` | `true` | **`false`** | 源代码级补丁 |
| `navigator.plugins.length` | 0 | **5** | 真实的插件列表 |
| `window.chrome` | `undefined` | **`object`** | 像真实 Chrome 一样存在 |
| UA 字符串 | `HeadlessChrome` | **`Chrome/146.0.0.0`** | 无无头模式泄露 |
| CDP 检测 | 被检测到 | **未被检测到** | `isAutomatedWithCDP: false` |
| TLS 指纹 | 不匹配 | **与 Chrome 相同** | ja3n/ja4/akamai 匹配 |
| **已对 30 多个检测网站进行测试** |

### 证据

_reCAPTCHA v3 得分 0.9 — 服务器端验证（人类水平）_

_Cloudflare Turnstile 非交互式挑战 — 自动解决_

_BrowserScan 机器人检测 — 正常（通过 4/4 项检查）_

_FingerprintJS 网页抓取演示 — 提供了数据，未被屏蔽_

_deviceandbrowserinfo.com 行为机器人检测 — 启用 humanize=True 时显示“You are human!”（通过 24/24 项信号）_

## 对比

| 特性 | Playwright | playwright-stealth | undetected-chromedriver | Camoufox | CloakBrowser |
| :--- | :--- | :--- | :--- | :--- | :--- |
| reCAPTCHA v3 得分 | 0.1 | 0.3-0.5 | 0.3-0.7 | 0.7-0.9 | **0.9** |
| Cloudflare Turnstile | 失败 | 有时成功 | 有时成功 | 通过 | **通过** |
| 补丁级别 | 无 | JS 注入 | 配置补丁 | C++ (Firefox) | **C++ (Chromium)** |
| 经受 Chrome 更新 | 不适用 | 经常失效 | 经常失效 | 是 | **是** |
| 维护状态 | 活跃 | 过时 | 过时 | 不稳定 | **活跃** |
| 浏览器引擎 | Chromium | Chromium | Chrome | Firefox | **Chromium** |
| Playwright API | 原生 | 原生 | 否 (Selenium) | 否 | **原生** |

## 工作原理

CloakBrowser 是一个围绕定制构建的 Chromium 二进制文件的轻量级包装器（Python + JavaScript）：

1.  **您安装** → `pip install cloakbrowser` 或 `npm install cloakbrowser`
2.  **首次启动** → 为您的平台自动下载二进制文件（Chromium 146）
3.  **每次启动** → Playwright 或 Puppeteer 使用我们的二进制文件和隐身参数启动
4.  **您编写代码** → 标准的 Playwright/Puppeteer API，无需学习新东西

该二进制文件包含 49 个源代码级补丁，涵盖 Canvas、WebGL、音频、字体、GPU、屏幕属性、WebRTC、网络时序、硬件报告、自动化信号移除以及 CDP 输入行为模拟。

这些补丁被编译到 Chromium 二进制文件中——不是通过 JavaScript 注入，也不是通过标志设置。

二进制文件下载使用 SHA-256 校验和进行验证，以确保完整性。

## API

### `launch()`

```python
from cloakbrowser import launch

# 基本用法 — 无头模式，默认隐身配置
browser = launch()

# 有头模式（看到浏览器窗口）
browser = launch(headless=False)

# 使用代理（HTTP 或 SOCKS5）
browser = launch(proxy="http://user:pass@proxy:8080")
browser = launch(proxy="socks5://user:pass@proxy:1080")

# 使用代理字典（绕过、分离认证字段）
browser = launch(proxy={"server": "http://proxy:8080", "bypass": ".google.com", "username": "user", "password": "pass"})

# 使用额外的 Chrome 参数
browser = launch(args=["--disable-gpu"])

# 使用时区和区域设置（设置二进制标志 — 不可检测的 CDP 模拟）
browser = launch(timezone="America/New_York", locale="en-US")

# 从代理 IP 自动检测时区/区域设置（需要：pip install cloakbrowser[geoip]）
# 同时自动注入 --fingerprint-webrtc-ip 以防止 WebRTC IP 泄露（无额外成本）
# 注意：会通过您的代理发出 HTTP 调用以解析出口 IP（ipify.org, checkip.amazonaws.com）
browser = launch(proxy="http://proxy:8080", geoip=True)

# 明确指定的时区/区域设置始终优先于自动检测
browser = launch(proxy="http://proxy:8080", geoip=True, timezone="Europe/London")

# 仅 WebRTC IP 欺骗（无需 geoip 依赖 — 通过代理发出 HTTP 调用来解析出口 IP）
browser = launch(proxy="http://proxy:8080", args=["--fingerprint-webrtc-ip=auto"])

# 明确指定 WebRTC IP（无网络调用）
browser = launch(proxy="http://proxy:8080", args=["--fingerprint-webrtc-ip=1.2.3.4"])

# 拟人化的鼠标、键盘和滚动行为
browser = launch(humanize=True)

# 使用更慢、更审慎的动作
browser = launch(humanize=True, human_preset="careful")

# 不使用默认隐身参数（自行携带指纹标志）
browser = launch(stealth_args=False, args=["--fingerprint=12345"])
```

返回一个标准的 Playwright `Browser` 对象。所有 Playwright 方法都可使用：`new_page()`、`new_context()`、`close()` 等。

### `launch_async()`

```python
import asyncio
from cloakbrowser import launch_async

async def main():
    browser = await launch_async()
    page = await browser.new_page()
    await page.goto("https://example.com")
    print(await page.title())
    await browser.close()

asyncio.run(main())
```

### `launch_context()`

便捷函数，在一次调用中同时创建浏览器和上下文，并可设置用户代理、视口、区域设置和时区：

```python
from cloakbrowser import launch_context

context = launch_context(
    user_agent="自定义 UA",
    viewport={"width": 1920, "height": 1080},
    locale="en-US",
    timezone="America/New_York",
)
page = context.new_page()
page.goto("https://protected-site.com")
context.close()
```

额外的关键字参数会转发给 Playwright 的 `browser.new_context()` — 使用此参数可以在不需要持久化配置文件文件夹的情况下设置 `storage_state`、`permissions`、`extra_http_headers` 等：

```python
from cloakbrowser import launch_context

# 从 JSON 文件恢复已保存的会话（cookies、localStorage）
context = launch_context(storage_state="state.json")
page = context.new_page()
page.goto("https://example.com")
# 保存状态以便下次运行
context.storage_state(path="state.json")
context.close()
```

### `launch_context_async()`

`launch_context()` 的异步版本。相同的签名和关键字参数转发：

```python
import asyncio
from cloakbrowser import launch_context_async

async def main():
    ctx = await launch_context_async(storage_state="state.json")
    page = await ctx.new_page()
    await page.goto("https://example.com")
    await ctx.storage_state(path="state.json")
    await ctx.close()

asyncio.run(main())
```

### `launch_persistent_context()`

与 `launch_context()` 相同，但使用持久化用户配置文件。Cookies、localStorage 和缓存在会话间持久保存。

当您需要以下功能时使用此方法：

*   **在多次运行中保持登录状态**（cookies/会话在重启后仍然存在）
*   **绕过无痕浏览检测**（有些网站会标记空的、临时的配置文件）
*   **加载 Chrome 扩展程序**（扩展程序只能从真实的用户数据目录加载）
*   **构建自然的浏览历史**（缓存的字体、Service Worker、IndexedDB 会随时间累积，使配置文件看起来更真实）

```python
from cloakbrowser import launch_persistent_context

# 首次运行 — 创建配置文件
ctx = launch_persistent_context("./my-profile", headless=False)
page = ctx.new_page()
page.goto("https://protected-site.com")
ctx.close()  # 配置文件已保存

# 下次运行 — cookies、localStorage 自动恢复
ctx = launch_persistent_context("./my-profile", headless=False)
```

支持所有与 `launch_context()` 相同的选项：`proxy`、`user_agent`、`viewport`、`locale`、`timezone`、`color_scheme`、`geoip`。

异步版本：`launch_persistent_context_async()`。

**存储配额与检测权衡：** 默认情况下，二进制文件会标准化存储配额以通过 FingerprintJS 检测，这会阻止报告非无痕配额值的持久化上下文。这意味着那些惩罚无痕模式（如 BrowserScan 的 `notPrivate` 检查，-10 分）的检测服务仍会标记它。如果您的目标网站惩罚无痕模式但不使用 FingerprintJS，请设置更高的配额以显示为常规配置文件：

```python
ctx = launch_persistent_context("./my-profile", args=["--fingerprint-storage-quota=5000"])
```

| 配额设置 | FingerprintJS | BrowserScan `notPrivate` |
| :--- | :--- | :--- |
| 默认（自动，~500MB） | 通过 | -10（标记为无痕） |
| `--fingerprint-storage-quota=5000` | 可能触发检测 | 通过（显示为非无痕） |

### CLI

从命令行预下载二进制文件或检查安装状态：

```bash
python -m cloakbrowser install      # 下载二进制文件并显示进度
python -m cloakbrowser info         # 显示版本、路径、平台
python -m cloakbrowser update       # 检查并下载更新的二进制文件
python -m cloakbrowser clear-cache  # 删除缓存的二进制文件
```

### 工具函数

```python
from cloakbrowser import binary_info, clear_cache, ensure_binary

# 检查二进制文件安装状态
print(binary_info())
# {'version': '146.0.7680.177.3', 'platform': 'linux-x64', 'installed': True, ...}

# 强制重新下载
clear_cache()

# 预下载二进制文件（例如，在 Docker 构建期间）
ensure_binary()
```

## JavaScript / Node.js API

CloakBrowser 提供了一个带有完整类型定义的 TypeScript 包。选择 Playwright 或 Puppeteer — 底层使用的是相同的隐身二进制文件。

### Playwright（默认）

```typescript
import { launch, launchContext, launchPersistentContext } from 'cloakbrowser';

// 基本用法
const browser = await launch();

// 带选项
const browser = await launch({
  headless: false,
  proxy: 'http://user:pass@proxy:8080',
  args: ['--fingerprint=12345'],
  timezone: 'America/New_York',
  locale: 'en-US',
  humanize: true,
});

// 便捷方法：一次调用创建浏览器 + 上下文
const context = await launchContext({
  userAgent: '自定义 UA',
  viewport: { width: 1920, height: 1080 },
  locale: 'en-US',
  timezone: 'America/New_York',
});
const page = await context.newPage();

// 持久化配置文件 — cookies/localStorage 在重启后保留，避免无痕检测
const ctx = await launchPersistentContext({
  userDataDir: './chrome-profile',
  headless: false,
  proxy: 'http://user:pass@proxy:8080',
});
```

> **注意：** 上面的每个示例都是独立的 — 不应作为一个代码块运行。

所有 Python 选项在 JS 中都可使用：`stealthArgs: false` 禁用默认值，`geoip: true` 从代理 IP 自动检测时区/区域设置。

### Puppeteer

> **注意：** 建议对于带有 reCAPTCHA Enterprise 的网站使用 Playwright 包装器。Puppeteer 的 CDP 协议会泄露自动化信号，reCAPTCHA Enterprise 可以检测到这些信号，导致间歇性的 403 错误。这是 Puppeteer 的一个已知限制，并非 CloakBrowser 特有。为获得最佳效果，请使用 Playwright。

```typescript
import { launch } from 'cloakbrowser/puppeteer';

const browser = await launch({ headless: true });
const page = await browser.newPage();
await page.goto('https://example.com');
await browser.close();
```

### 实用函数 (JS)

```typescript
import { ensureBinary, clearCache, binaryInfo } from 'cloakbrowser';

// 预下载二进制文件（例如，在 Docker 构建期间）
await ensureBinary();

// 检查安装状态
console.log(binaryInfo());

// 强制重新下载
clearCache();
```

## 人类行为

传递 `humanize=True` 可以使所有鼠标、键盘和滚动交互与真实用户无法区分。所有 Playwright 调用（`page.click()`、`page.fill()`、`page.type()`、`page.mouse.*`、`page.keyboard.*`、定位器 API）和 Puppeteer 调用（`page.click()`、`page.type()`、`page.mouse.*`、`page.keyboard.*`、ElementHandle API）都会自动被替换为拟人化的等效操作。无需更改代码。

```python
browser = launch(humanize=True)
page = browser.new_page()
page.goto("https://example.com")
page.locator("#email").fill("user@example.com")  # 逐字符时机，思考停顿
page.locator("button[type=submit]").click()       # 贝塞尔曲线，真实的瞄准点
```

```javascript
// Playwright
import { launch } from 'cloakbrowser';
const browser = await launch({ humanize: true });

// Puppeteer
import { launch } from 'cloakbrowser/puppeteer';
const browser = await launch({ humanize: true });
```

**变化：**

| 交互 | 默认 | 使用 `humanize=True` |
| :--- | :--- | :--- |
| 鼠标移动 | 瞬间传送 | 带有缓动和轻微过冲的贝塞尔曲线 |
| 点击 | 瞬间 | 真实的瞄准点 + 按下持续时间 |
| 键盘 | 瞬间填充 | 逐字符时机，思考停顿，偶尔打错并自纠正 |
| 滚动 | 跳跃 | 加速 → 巡航 → 减速微步骤 |
| `fill()` | 瞬间设置值 | 清除现有内容，逐字符输入 |

**预设** — `default`（正常速度）或 `careful`（更慢、更审慎，动作之间有空闲微小移动）：

```python
browser = launch(humanize=True, human_preset="careful")
```

```javascript
const browser = await launch({ humanize: true, humanPreset: 'careful' });
```

**自定义配置** — 覆盖任何参数：

```python
browser = launch(humanize=True, human_config={
    "mistype_chance": 0.05,              # 5% 的拼写错误率并自纠正
    "typing_delay": 100,                 # 更慢的输入速度（毫秒/字符）
    "idle_between_actions": True,        # 点击之间微小移动
    "idle_between_duration": [0.3, 0.8], # 空闲持续时间范围（秒）
})
```

```javascript
const browser = await launch({
    humanize: true,
    humanConfig: {
        mistype_chance: 0.05,
        typing_delay: 100,
        idle_between_actions: true,
        idle_between_duration: [0.3, 0.8],
    }
});
```

如果需要在特定调用中使用原始速度，可以在 `page._original` 访问原始的、未经修补的 Playwright 页面。

> **注意 (Playwright):** 始终使用 `page.click(selector)`、`page.type(selector, text)`、`page.hover(selector)` 或 `page.locator(selector).*` — 这些方法会经过完整的人性化处理流程。避免使用 `page.query_selector()` — `ElementHandle` 对象会绕过所有补丁，因此鼠标移动会瞬间传送，键盘事件没有时间控制，滚动也没有人性化曲线。
>
> **注意 (Puppeteer):** 基于选择器的方法（`page.click()`、`page.type()`）和 ElementHandle 方法（`el.click()`、`el.type()`）都已完全人性化。`page.$()`、`page.$$()` 和 `page.waitForSelector()` 会自动返回修补后的句柄。

> 贡献者 [@evelaa123](https://github.com/evelaa123) — 完整的 Playwright 和 Puppeteer API 覆盖。

## 配置

| 环境变量 | 默认值 | 描述 |
| :--- | :--- | :--- |
| `CLOAKBROWSER_BINARY_PATH` | — | 跳过下载，使用本地的 Chromium 二进制文件 |
| `CLOAKBROWSER_CACHE_DIR` | `~/.cloakbrowser` | 二进制文件缓存目录 |
| `CLOAKBROWSER_DOWNLOAD_URL` | `cloakbrowser.dev` | 二进制文件的自定义下载 URL |
| `CLOAKBROWSER_AUTO_UPDATE` | `true` | 设置为 `false` 以禁用后台更新检查 |
| `CLOAKBROWSER_SKIP_CHECKSUM` | `false` | 设置为 `true` 以在下载后跳过 SHA-256 验证 |
| `CLOAKBROWSER_GEOIP_TIMEOUT_SECONDS` | `5` | GeoIP 解析的最大秒数，超时后继续（不依赖 GeoIP） |

## 指纹管理

该二进制文件**默认即为隐身** — 无需任何标志。它在启动时自动生成一个随机指纹种子，并欺骗所有可检测的值（GPU、硬件规格、屏幕尺寸、Canvas、WebGL、音频、字体）。每次启动都会产生一个全新的、一致的标识。

**指纹工作原理：**

| 场景 | 发生什么 |
| :--- | :--- |
| **无标志** | 启动时自动生成随机种子。GPU、屏幕、硬件规格和所有噪声补丁都自动被欺骗。每次启动都是新身份。 |
| **`--fingerprint=seed`** | 从种子生成确定性身份。相同种子 = 跨启动相同指纹。用于会话持久化（回访访客）。 |
| **`--fingerprint=seed` + 明确标志** | 明确标志覆盖单个自动生成的值。种子填充其余所有内容。 |

二进制文件在编译时检测其平台 — macOS 二进制文件报告为 macOS 并带有 Apple GPU，Linux 二进制文件报告为 Linux 并带有 NVIDIA GPU。**包装器**在 Linux 上通过传递 `--fingerprint-platform=windows` 来覆盖此设置，因此会话显示为 Windows 桌面（更常见的指纹，更难聚类）。直接运行二进制文件时，使用 `--fingerprint-platform` 进行跨平台欺骗。

> **提示：再次访问同一网站时使用固定的种子。** 随机种子会使每个会话看起来像不同的设备 — 如果从同一 IP 重复访问同一站点，这可能会引起怀疑。对于 reCAPTCHA v3 Enterprise 和类似的评分系统，固定的种子会在会话间产生一致的指纹，使您看起来像回访访客：
> ```python
> browser = launch(args=["--fingerprint=12345"])
> ```
> ```javascript
> const browser = await launch({ args: ['--fingerprint=12345'] });
> ```

### 默认指纹

每个 `launch()` 调用都会自动设置这些。**包装器**应用平台感知的默认值 — 在 Linux 上，它伪装成 Windows 以获得更常见的指纹；在 macOS 上，它作为原生 Mac 浏览器运行：

| 标志 | Linux/Windows 默认值 | macOS 默认值 | 控制内容 |
| :--- | :--- | :--- | :--- |
| `--fingerprint` | 随机 (10000–99999) | 随机 (10000–99999) | Canvas、WebGL、音频、字体、客户端矩形的主种子 |
| `--fingerprint-platform` | `windows` | `macos` | `navigator.platform`、User-Agent 操作系统、GPU 池选择 |

二进制文件从种子自动生成所有其他内容：GPU、硬件并发数、设备内存和屏幕尺寸。每个种子产生一个唯一、一致的指纹。如果需要，可以用明确的标志覆盖。

> **直接使用二进制文件？** 它开箱即用，零标志 —— 二进制文件会自动欺骗所有内容。传递 `--fingerprint=seed` 以获得持久身份，或使用类似 `--fingerprint-gpu-renderer` 的明确标志覆盖任何自动生成的值。

### 附加标志

二进制文件支持但**默认未设置** — 通过 `args` 传递以自定义：

| 标志 | 控制内容 |
| :--- | :--- |
| `--fingerprint-gpu-vendor` | WebGL `UNMASKED_VENDOR_WEBGL`（从种子 + 平台自动生成） |
| `--fingerprint-gpu-renderer` | WebGL `UNMASKED_RENDERER_WEBGL`（从种子 + 平台自动生成） |
| `--fingerprint-hardware-concurrency` | `navigator.hardwareConcurrency`（自动生成：`8`） |
| `--fingerprint-device-memory` | `navigator.deviceMemory`，单位 GB（自动生成：`8`） |
| `--fingerprint-screen-width` | 屏幕宽度（自动生成：Windows/Linux 为 `1920`，macOS 为 `1440`） |
| `--fingerprint-screen-height` | 屏幕高度（自动生成：Windows/Linux 为 `1080`，macOS 为 `900`） |
| `--fingerprint-brand` | 浏览器品牌：`Chrome`、`Edge`、`Opera`、`Vivaldi` |
| `--fingerprint-brand-version` | 品牌版本（UA + Client Hints） |
| `--fingerprint-platform-version` | Client Hints 平台版本 |
| `--fingerprint-location` | 地理位置坐标 |
| `--fingerprint-timezone` | 时区（例如 `America/New_York`） |
| `--fingerprint-locale` | 区域设置（例如 `en-US`） |
| `--fingerprint-storage-quota` | 覆盖存储配额（MB）— 影响 `storage.estimate()`、`storageBuckets` 和遗留的 webkit API。设置 `--fingerprint` 时自动标准化 |
| `--fingerprint-taskbar-height` | 覆盖任务栏高度（二进制默认值：Windows=48，Mac=95，Linux=0） |
| `--fingerprint-fonts-dir` | 包含目标平台字体的目录路径（参见 [Linux 上的字体设置](#font-setup-on-linux)）|
| `--fingerprint-webrtc-ip` | WebRTC ICE 候选 IP 替换。使用 `auto` 从代理出口 IP 解析（通过代理发出 HTTP 调用），或传递明确的 IP。当 `geoip=True` 时自动注入 |
| `--fingerprint-noise=false` | 在保持确定性指纹种子激活的同时，禁用噪声注入（canvas、WebGL、音频、客户端矩形）|
| `--enable-blink-features=FakeShadowRoot` | 访问封闭的 shadow DOM 元素 |

> **注意：** 所有隐身测试均使用上述默认指纹配置验证。更改这些标志可能会影响检测结果 — 在生产环境中使用前请测试您的配置。

### Linux 上的字体设置

**对于激进的防机器人网站（Kasada、Akamai）是必需的。** 这些系统在隐藏的 Canvas 上渲染表情符号并对像素输出进行哈希。精简的 Linux 环境（Docker、云虚拟机）通常缺少表情符号和扩展字体，产生的哈希值与任何真实浏览器都不匹配。安装标准字体包以解决此问题：

```bash
sudo apt install -y fonts-noto-color-emoji fonts-freefont-ttf fonts-unifont \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-tlwg-loma-otf
```

Docker 镜像（`cloakhq/cloakbrowser`）已预装了这些字体。如果您在 Linux 服务器或自定义 Docker 镜像上直接运行二进制文件，请手动安装它们。

**可选：用于 CreepJS 字体枚举的 Windows 字体。** 上面的软件包可以修复反机器人 Canvas 检查，但不会提高您的 CreepJS 字体得分。为此，您需要来自 Windows 机器 `C:\Windows\Fonts\` 目录的实际 Windows 字体（Segoe UI、Calibri、Bahnschrift 等）— `ttf-mscorefonts-installer` 只有旧的 XP 时代字体，不够用。

```bash
mkdir -p ~/.local/share/fonts/windows
cp /path/to/windows/fonts/*.ttf ~/.local/share/fonts/windows/
cp /path/to/windows/fonts/*.TTF ~/.local/share/fonts/windows/
fc-cache -f  # 对于手动复制的字体是必需的

browser = launch(
    args=["--fingerprint-fonts-dir=/home/user/.local/share/fonts/windows"],
)
```

### 示例

```python
# 固定种子以获得持久身份
browser = launch(args=["--fingerprint=42069"])

# 完全控制 — 禁用默认值，自己设置所有内容
browser = launch(stealth_args=False, args=[
    "--fingerprint=42069",
    "--fingerprint-platform=windows",
])

# 覆盖 GPU 使其看起来像特定机器
browser = launch(args=[
    "--fingerprint-gpu-vendor=Intel Inc.",
    "--fingerprint-gpu-renderer=Intel Iris OpenGL Engine",
])
```

## 示例

**Python** — 参见 [`examples/`](https://github.com/CloakHQ/CloakBrowser/blob/main/examples)：

*   [`basic.py`](https://github.com/CloakHQ/CloakBrowser/blob/main/examples/basic.py) — 启动并加载页面
*   [`persistent_context.py`](https://github.com/CloakHQ/CloakBrowser/blob/main/examples/persistent_context.py) — 具有 cookie/localStorage 持久性的持久化配置文件
*   [`recaptcha_score.py`](https://github.com/CloakHQ/CloakBrowser/blob/main/examples/recaptcha_score.py) — 检查您的 reCAPTCHA v3 得分
*   [`stealth_test.py`](https://github.com/CloakHQ/CloakBrowser/blob/main/examples/stealth_test.py) — 对 6 个检测网站运行测试
*   [`fingerprint_scan_test.py`](https://github.com/CloakHQ/CloakBrowser/blob/main/examples/fingerprint_scan_test.py) — 对 fingerprint-scan.com 和 CreepJS 进行测试

**JavaScript** — 参见 [`js/examples/`](https://github.com/CloakHQ/CloakBrowser/blob/main/js/examples)：

*   [`basic-playwright.ts`](https://github.com/CloakHQ/CloakBrowser/blob/main/js/examples/basic-playwright.ts) — Playwright 启动并加载
*   [`basic-puppeteer.ts`](https://github.com/CloakHQ/CloakBrowser/blob/main/js/examples/basic-puppeteer.ts) — Puppeteer 启动并加载
*   [`stealth-test.ts`](https://github.com/CloakHQ/CloakBrowser/blob/main/js/examples/stealth-test.ts) — 对 6 个检测网站运行测试

### 框架集成

CloakBrowser 可与任何使用 Playwright 或 Chromium 的框架一起使用：

```python
# 选项 1：框架直接启动我们的二进制文件（Selenium、Stagehand、undetected-chromedriver）
from cloakbrowser.download import ensure_binary
from cloakbrowser.config import get_default_stealth_args
binary_path = ensure_binary()          # 如果需要则自动下载
stealth_args = get_default_stealth_args()  # 所有指纹标志

# 选项 2：CloakBrowser 先启动，框架通过 CDP 连接（browser-use、Crawl4AI、Scrapling）
from cloakbrowser import launch_async
browser = await launch_async(args=["--remote-debugging-port=9242"])
# 将您的框架连接到 http://127.0.0.1:9242 — 所有隐身标志都已设置
# 注意：人性化功能需要包装器（见下文）
```

> **通过 CDP 使用人性化功能**：隐身指纹补丁通过 CDP 自动工作，但 `humanize=True` 是包装器级别的特性。如果您通过 CDP 从单独的脚本连接到 CloakBrowser，请导入修补函数以添加人性化功能：
> ```python
> from cloakbrowser.human import patch_browser, resolve_config
> patch_browser(browser, resolve_config('default'))
> ```
> ```typescript
> import { patchBrowser, resolveConfig } from 'cloakbrowser/human';
> patchBrowser(browser, resolveConfig('default'));
> ```

| 框架 | Stars | 语言 | 示例 |
| :--- | :--- | :--- | :--- |
| [browser-use](https://github.com/browser-use/browser-use) | 70K | Python | [`browser_use_example.py`](https://github.com/CloakHQ/CloakBrowser/blob/main/examples/integrations/browser_use_example.py) |
| [Crawl4AI](https://github.com/unclecode/crawl4ai) | 58K | Python | [`crawl4ai_example.py`](https://github.com/CloakHQ/CloakBrowser/blob/main/examples/integrations/crawl4ai_example.py) |
| [Crawlee](https://github.com/apify/crawlee-python) | 8.6K | Python | [`crawlee_example.py`](https://github.com/CloakHQ/CloakBrowser/blob/main/examples/integrations/crawlee_example.py) |
| [Scrapling](https://github.com/D4Vinci/Scrapling) | 21K | Python | [`scrapling_example.py`](https://github.com/CloakHQ/CloakBrowser/blob/main/examples/integrations/scrapling_example.py) |
| [Stagehand](https://github.com/browserbase/stagehand) | 21K | TypeScript | [`stagehand.ts`](https://github.com/CloakHQ/CloakBrowser/blob/main/js/examples/stagehand.ts) |
| [LangChain](https://github.com/langchain-ai/langchain) | 100K+ | Python | [`langchain_loader.py`](https://github.com/CloakHQ/CloakBrowser/blob/main/examples/integrations/langchain_loader.py) |
| [Selenium](https://github.com/SeleniumHQ/selenium) | — | Python | [`selenium_example.py`](https://github.com/CloakHQ/CloakBrowser/blob/main/examples/integrations/selenium_example.py) |
| [undetected-chromedriver](https://github.com/ultrafunkamsterdam/undetected-chromedriver) | 12K | Python | [`undetected_chromedriver.py`](https://github.com/CloakHQ/CloakBrowser/blob/main/examples/integrations/undetected_chromedriver.py) |
| [agent-browser](https://github.com/nichochar/agent-browser) | — | Shell | [`agent_browser.sh`](https://github.com/CloakHQ/CloakBrowser/blob/main/examples/integrations/agent_browser.sh) |

### 部署集成

| 平台 | 示例 |
| :--- | :--- |
| [AWS Lambda](https://aws.amazon.com/lambda/) | [`aws_lambda/`](https://github.com/CloakHQ/CloakBrowser/blob/main/examples/integrations/aws_lambda) — 在 Lambda 中执行一次性抓取（容器镜像）|

## 平台

| 平台 | Chromium 版本 | 补丁数 | 状态 |
| :--- | :--- | :--- | :--- |
| Linux x86_64 | 146 | 57 | ✅ 最新 |
| Linux arm64 (RPi, Graviton) | 146 | 57 | ✅ 最新 |
| macOS arm64 (Apple Silicon) | 145 | 26 | ✅ |
| macOS x86_64 (Intel) | 145 | 26 | ✅ |
| Windows x86_64 | 146 | 57 | ✅ 最新 |

包装器会根据您的平台自动下载正确的二进制文件。

**macOS 首次启动：** 二进制文件是临时签名的。首次运行时，macOS 的 Gatekeeper 会阻止它。右键单击应用程序 → **打开** → 在对话框中单击**打开**。这只需执行一次。

## Docker

Docker Hub 上的预构建镜像 — 无需安装，无需设置。

### 快速测试

```bash
docker run --rm cloakhq/cloakbrowser cloaktest
```

### 运行脚本

```bash
# 内联脚本
docker run --rm cloakhq/cloakbrowser python -c "from cloakbrowser import launch
browser = launch()
page = browser.new_page()
page.goto('https://example.com')
print(page.title())
browser.close()
"

# 挂载您自己的脚本
docker run --rm -v ./my_script.py:/app/my_script.py cloakhq/cloakbrowser python my_script.py

# 使用代理
docker run --rm cloakhq/cloakbrowser python -c "from cloakbrowser import launch
browser = launch(proxy='http://user:pass@proxy:8080')
page = browser.new_page()
page.goto('https://example.com')
print(page.title())
browser.close()
"
```

### CDP 服务器模式

启动一个持久的隐身浏览器，并通过 Chrome DevTools Protocol 远程连接：

```bash
docker run -d --name cloak -p 127.0.0.1:9222:9222 cloakhq/cloakbrowser cloakserve
```

然后从您的主机连接：

```python
from playwright.sync_api import sync_playwright

pw = sync_playwright().start()
browser = pw.chromium.connect_over_cdp("http://localhost:9222")
page = browser.new_page()
page.goto("https://example.com")
print(page.title())
browser.close()
```

向浏览器传递额外标志：

```bash
# 使用代理
docker run -d --name cloak -p 127.0.0.1:9222:9222 cloakhq/cloakbrowser \
  cloakserve --proxy-server=http://proxy:8080

# 有头模式（在容器内渲染到 Xvfb）
docker run -d --name cloak -p 127.0.0.1:9222:9222 cloakhq/cloakbrowser \
  cloakserve --headless=false
```

停止服务器：

```bash
docker stop cloak && docker rm cloak
```

> **安全：** CDP 授予对浏览器的完全控制权（执行 JS、读取页面、访问文件）。示例中绑定到 `127.0.0.1`，因此只有您的机器可以连接。切勿在没有额外身份验证的情况下将端口 9222 暴露给公共互联网。

### Docker Compose

```yaml
services:
  cloakbrowser:
    image: cloakhq/cloakbrowser
    command: cloakserve
    restart: unless-stopped
    ports:
      - "127.0.0.1:9222:9222"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9222/json/version"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
```

**按连接设置指纹种子** — 从单个容器运行多个浏览器身份。每个唯一的种子会生成一个独立的 Chrome 进程，带有自己的指纹：

```python
# 每个种子都有独特的 canvas 噪声、客户端矩形和其他浏览器信号
b1 = pw.chromium.connect_over_cdp("http://localhost:9222?fingerprint=11111")
b2 = pw.chromium.connect_over_cdp("http://localhost:9222?fingerprint=22222")

# 通过查询参数进行完全身份控制
b3 = pw.chromium.connect_over_cdp(
    "http://localhost:9222?fingerprint=33333"
    "&timezone=Asia/Tokyo&locale=ja-JP&platform=macos"
    "&hardware-concurrency=4&device-memory=8"
)

# 从代理出口 IP 自动检测时区/区域设置
b4 = pw.chromium.connect_over_cdp(
    "http://localhost:9222?fingerprint=44444"
    "&proxy=http://proxy:8080&geoip=true"
)
```

支持的查询参数：`fingerprint`、`timezone`、`locale`、`platform`、`platform-version`、`brand`、`brand-version`、`gpu-vendor`、`gpu-renderer`、`hardware-concurrency`、`device-memory`、`screen-width`、`screen-height`、`proxy`、`geoip`。相同种子重用相同进程（第一个连接的参数生效）。无种子 = 共享默认进程（向后兼容）。在 `GET /` 处检查活动进程（返回带有 PID、端口和连接数的 JSON）。

**持久化配置文件** — 挂载一个卷以在容器重启后保留 cookies 和会话：

```bash
docker run --rm -v ./my-profile:/profile cloakhq/cloakbrowser python -c "from cloakbrowser import launch_persistent_context
ctx = launch_persistent_context('/profile')
page = ctx.new_page()
page.goto('https://example.com')
ctx.close()
"
```

使用相同的卷再次运行 — cookies、localStorage 和缓存会自动恢复。

**资源使用：** 空闲时约 190MB RAM，3 个标签页时约 280MB。每个额外标签页约 30MB。

### 使用您自己的镜像进行扩展

```dockerfile
FROM cloakhq/cloakbrowser
COPY your_script.py /app/
CMD ["python", "your_script.py"]
```

**从 pip 构建您自己的镜像** — 使用 `python -m cloakbrowser install` 在构建期间下载二进制文件并显示可见进度：

```dockerfile
FROM python:3.12-slim
RUN pip install cloakbrowser && python -m cloakbrowser install
COPY your_script.py /app/
CMD ["python", "/app/your_script.py"]
```

**从源码构建** — 如果您更喜欢构建自己的镜像，也包含一个 [`Dockerfile`](https://github.com/CloakHQ/CloakBrowser/blob/main/Dockerfile)：

```bash
docker build -t cloakbrowser .
```

CloakBrowser 在本地、Docker 和 VPS 上工作方式完全相同。无需特定环境的配置。

**注意：** 如果您在带有 uvloop 的 Web 服务器中运行 CloakBrowser（例如 `uvicorn[standard]`），请使用 `--loop asyncio` 以避免子进程管道挂起。

## 故障排除

* * *

### 在激进的网站（DataDome、Turnstile）上仍然被屏蔽？

有些网站即使有我们的 C++ 补丁，也能检测到无头模式。使用虚拟显示器在**有头模式**下运行：

```bash
# 安装 Xvfb（虚拟帧缓冲器）
sudo apt install xvfb

# 启动虚拟显示器
Xvfb :99 -screen 0 1920x1080x24 &
export DISPLAY=:99
```

```python
from cloakbrowser import launch

# 有头模式 + 住宅代理，实现最大隐身效果
browser = launch(headless=False, proxy="http://your-residential-proxy:port")
page = browser.new_page()
page.goto("https://heavily-protected-site.com")  # 通过 DataDome 等
browser.close()
```

这会在虚拟显示器上运行一个真实的有头浏览器 — 不需要物理显示器。结合下文推荐的配置以获得最大的隐身效果。

* * *

### 针对反机器人网站的推荐配置

大多数屏蔽不是因为浏览器指纹检测，而是因为缺少以下三项中的一项：

```python
browser = launch(
    proxy="http://your-residential-proxy:port",  # 住宅 IP — 数据中心 IP 仅凭声誉就会被屏蔽
    geoip=True,      # 使时区 + 区域设置与代理出口 IP 匹配（没有这个：UTC + en-US = 机器人信号）
    headless=False,   # 有头模式 — 即使有 C++ 补丁，有些网站也能检测无头模式
    humanize=True,    # 拟人化的鼠标、键盘、滚动行为
)
```

```javascript
const browser = await launch({
    proxy: 'http://your-residential-proxy:port',
    geoip: true,
    headless: false,
    humanize: true,
});
```

如果您的代理支持 SOCKS5，请使用它以获得更好的兼容性 — SOCKS5 隧道传输原始 TCP，避免了某些代理在使用 HTTP/2 时出现的 HTTP CONNECT 问题：

```python
browser = launch(proxy="socks5://user:pass@proxy:1080", geoip=True, headless=False, humanize=True)
```

如果在此之后您仍然被屏蔽，请检查下面的字体设置。

* * *

### 在配置正确的情况下，仍然被 Kasada / Akamai 网站屏蔽？

在精简的 Linux 环境中，缺少字体包会导致 Canvas 表情符号渲染产生的哈希值不被反机器人系统识别。这是在代理、geoip 和有头模式都已正确设置后，在激进网站上遇到屏蔽的最常见原因。

请安装上面 [Linux 上的字体设置](#font-setup-on-linux) 中列出的字体包。

* * *

### 网站挑战新会话，但在首次访问后可以工作

有些网站会挑战首次访问者（通过 HTTP/2 且没有 cookies）。这会影响所有 Chromium 浏览器，而不仅仅是 CloakBrowser。使用持久化配置文件预先 warm up cookies，然后在会话间重用：

```python
from cloakbrowser import launch_persistent_context

# 首次运行：使用 --disable-http2 进行 warm up
ctx = launch_persistent_context("./profile", args=["--disable-http2"])
page = ctx.new_page()
page.goto("https://example.com")  # warm up cookies
ctx.close()

# 后续运行 — 不再需要 --disable-http2
ctx = launch_persistent_context("./profile")
page = ctx.new_page()
page.goto("https://example.com")  # 使用已保存的 cookies 通过
```

```javascript
import { launchPersistentContext } from 'cloakbrowser';

// 首次运行：使用 --disable-http2 进行 warm up
let ctx = await launchPersistentContext({ userDataDir: './profile', args: ['--disable-http2'] });
let page = await ctx.newPage();
await page.goto('https://example.com');
await ctx.close();

// 后续运行 — 不再需要 --disable-http2
ctx = await launchPersistentContext({ userDataDir: './profile' });
```

对于无状态/临时用例，`launch(args=["--disable-http2"])` 强制使用 HTTP/1.1，这可以绕过该检查。仅在需要该功能的网站上使用此标志 — 大多数网站使用 HTTP/2 也能正常工作。如果您的代理支持 SOCKS5，请改用 `proxy="socks5://user:pass@host:port"` — SOCKS5 完全绕过 HTTP CONNECT。

* * *

### 某些功能不工作？请确保您使用的是最新版本

旧版本可能使用过时的隐身参数或下载了较旧的二进制文件：

```bash
pip install -U cloakbrowser    # Python
npm install cloakbrowser@latest # JavaScript
docker pull cloakhq/cloakbrowser:latest  # Docker
```

* * *

### 二进制文件下载失败/超时

设置自定义下载 URL 或使用本地二进制文件：

```bash
export CLOAKBROWSER_BINARY_PATH=/path/to/your/chrome
```

* * *

### 新更新破坏了某些功能？回滚到之前的版本

安装特定版本的包装器以同时降级包装器及其下载的二进制文件：

```bash
pip install cloakbrowser==0.3.21              # Python
npm install cloakbrowser@0.3.21               # JavaScript
docker pull cloakhq/cloakbrowser:0.3.21       # Docker
```

每个包装器版本都固定其自己的二进制版本，因此降级包装器会在下次启动时自动为您获取匹配的二进制文件。

* * *

### macOS：“应用程序已损坏”或 Gatekeeper 阻止启动

二进制文件是临时签名的。macOS 会隔离下载的文件。运行一次以清除：

```bash
xattr -cr ~/.cloakbrowser/chromium-*/Chromium.app
```

* * *

### “playwright install” vs CloakBrowser 二进制文件

您**不需要** `playwright install chromium`。CloakBrowser 会下载自己的二进制文件。您只需要 Playwright 的系统依赖项：

```bash
playwright install-deps chromium
```

* * *

### macOS：在某些 Linux 上能通过的网站却被屏蔽

macOS 的指纹配置文件存在已知的不一致之处，会被激进的机器人检测捕捉到。如果某个网站在 macOS 上屏蔽您，但在 Linux 上能工作，请通过传递 `stealth_args=False` 并手动设置 `--fingerprint-platform=windows` 以及匹配的 GPU 标志来切换到 Windows 指纹配置文件（有关完整标志列表，请参见[指纹管理](#fingerprint-management)）。

* * *

### 网站检测到无痕/隐私浏览模式

默认情况下，`launch()` 打开一个无痕上下文。有些网站会惩罚这个。使用 `launch_persistent_context()` 来获得具有 cookie 持久性的真实配置文件：

```python
from cloakbrowser import launch_persistent_context

ctx = launch_persistent_context("./my-profile", headless=False)
```

如果网站仍然标记为无痕，请提高存储配额以显示为常规浏览会话。有关这如何影响不同检测服务的详细信息，请参见 [存储配额权衡](#launch_persistent_context)。

* * *

### reCAPTCHA v3 得分低 (0.1–0.3)

避免使用 `page.wait_for_timeout()` — 它会发送 CDP 协议命令，reCAPTCHA 会检测到这些命令。改用原生 sleep：

```python
# 不好的方式 — 发送 CDP 命令，reCAPTCHA 会检测到
page.wait_for_timeout(3000)

# 好的方式 — 对浏览器不可见
import time
time.sleep(3)
```

```javascript
// 不好的方式 — 发送 CDP 命令
await page.waitForTimeout(3000);

// 好的方式 — 对浏览器不可见
await new Promise(r => setTimeout(r, 3000));
```

最大化 reCAPTCHA 得分的其他技巧：

*   **尝试 Patchright 后端** — 在 Playwright 协议层抑制额外的 CDP 自动化信号。使用 `pip install cloakbrowser[patchright]` 安装，然后使用 `launch(backend="patchright")` 或全局设置 `CLOAKBROWSER_BACKEND=patchright`。注意：Patchright 会破坏代理认证和 `add_init_script` — 仅当您在尝试上述步骤后分数仍然很低时再使用它。
*   **使用 Playwright，而不是 Puppeteer** — Puppeteer 会发送更多 CDP 协议流量，reCAPTCHA 可以检测到（[详细信息](#puppeteer)）。
*   **使用住宅代理** — 数据中心 IP 因其 IP 信誉而被标记，而非浏览器指纹。
*   **在触发 reCAPTCHA 之前在页面上停留 15 秒以上** — 短暂的访问得分较低。
*   **请求间隔开** — 在同一会话中背靠背调用 `grecaptcha.execute()` 会受到惩罚。在带有 reCAPTCHA 的页面之间等待 30 秒以上。
*   **使用固定的指纹种子** 以获得跨会话的一致设备身份（参见[指纹管理](#fingerprint-management)）。
*   **使用 `page.type()` 而不是 `page.fill()`** 来填写表单 — `fill()` 直接设置值而不产生键盘事件，reCAPTCHA 的行为分析会标记这一点。带延迟的 `type()` 模拟真实的击键：
    ```python
    page.type("#email", "user@example.com", delay=50)
    ```
*   **在 reCAPTCHA 检查触发前，最小化 `page.evaluate()` 调用** — 每次调用都会发送 CDP 流量。

## 常见问题 (FAQ)

**问：这合法吗？** 答：CloakBrowser 是建立在开源 Chromium 之上的浏览器。我们不纵容非法使用。未经授权自动化系统、凭证填充和滥用账户创建是明确禁止的。完整条款请参见 [BINARY-LICENSE.md](https://github.com/CloakHQ/CloakBrowser/blob/main/BINARY-LICENSE.md)。

**问：这与 Camoufox 有何不同？** 答：Camoufox 修补 Firefox。我们修补 Chromium。Chromium 意味着原生的 Playwright 支持、更大的生态系统以及与真实 Chrome 匹配的 TLS 指纹。Camoufox 在 2026 年初回归，但处于不稳定的测试阶段 — CloakBrowser 已可用于生产环境。

**问：检测网站最终会发现这个吗？** 答：有可能。机器人检测是一场军备竞赛。源代码级别的补丁比配置级别的补丁更难检测，但并非不可能。我们会在检测技术发展时积极监控和更新。

**问：我可以使用自己的代理吗？** 答：可以。在 `launch()` 中传递 `proxy="http://user:pass@host:port"` 或 `proxy="socks5://user:pass@host:port"`。原生支持 HTTP 和 SOCKS5 代理。

## 路线图

| 功能 | 状态 |
| :--- | :--- |
| Linux x64 — Chromium 146（57 个补丁）| ✅ 已发布 |
| macOS arm64/x64 — Chromium 145（26 个补丁）| ✅ 已发布 |
| Windows x64 — Chromium 146（57 个补丁）| ✅ 已发布 |
| JavaScript/Puppeteer + Playwright 支持 | ✅ 已发布 |
| 每个会话的指纹轮换 | ✅ 已发布 |
| 内置代理轮换 | 📋 计划中 |

## 链接

*   📋 **更新日志** — [CHANGELOG.md](https://github.com/CloakHQ/CloakBrowser/blob/main/CHANGELOG.md)
*   🌐 **网站** — [cloakbrowser.dev](https://cloakbrowser.dev)
*   🐛 **错误报告 & 功能请求** — [GitHub Issues](https://github.com/CloakHQ/CloakBrowser/issues)
*   📦 **PyPI** — [pypi.org/project/cloakbrowser](https://pypi.org/project/cloakbrowser/)
*   📦 **npm** — [npmjs.com/package/cloakbrowser](https://www.npmjs.com/package/cloakbrowser)
*   ☕ **支持** — [ko-fi.com/cloakhq](https://ko-fi.com/cloakhq)
*   📧 **联系方式** — [cloakhq@pm.me](mailto:cloakhq@pm.me)

## 安全性

所有版本均已签名，以确保供应链安全验证。

```bash
# 验证 GPG 签名（二进制发布标签）
gpg --keyserver keyserver.ubuntu.com --recv-keys C60C0DDC9D0DE2DD
git verify-tag chromium-v146.0.7680.177.3

# 验证 GitHub 二进制证明（Sigstore）
gh attestation verify cloakbrowser-linux-x64.tar.gz --repo CloakHQ/cloakbrowser

# 验证 Docker 镜像签名（Cosign/Sigstore）
cosign verify \
  --certificate-identity-regexp "https://github.com/CloakHQ/CloakBrowser/" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  cloakhq/cloakbrowser:latest
```

## 许可证

*   **包装器代码**（本仓库） — MIT。参见 [LICENSE](https://github.com/CloakHQ/CloakBrowser/blob/main/LICENSE)。
*   **CloakBrowser 二进制文件**（编译后的 Chromium） — 免费使用，不允许再分发。参见 [BINARY-LICENSE.md](https://github.com/CloakHQ/CloakBrowser/blob/main/BINARY-LICENSE.md)。

## 贡献

欢迎提交问题和 PR。如果某些功能不工作，请[提交 Issue](https://github.com/CloakHQ/CloakBrowser/issues) — 我们会快速响应。

## 贡献者

*   [@evelaa123](https://github.com/evelaa123) — 人性化行为、持久化上下文、Windows 修复
*   [@yahooguntu](https://github.com/yahooguntu) — 持久化上下文
*   [@kitiho](https://github.com/kitiho) — 空视口修复
*   [@eofreternal](https://github.com/eofreternal) — humanConfig 类型修复、人性化方法选项类型
*   [@manaskarra](https://github.com/manaskarra) — iframe 作用域修复（用于人性化的 frame 操作）、GeoIP 超时保护
*   [@Youhai020616](https://github.com/Youhai020616) — SOCKS5 凭据编码日志记录
*   [@AlexTech314](https://github.com/AlexTech314) — AWS Lambda 集成


# 参考资料

* any list
{:toc}