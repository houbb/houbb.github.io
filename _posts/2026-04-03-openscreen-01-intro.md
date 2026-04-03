---
layout: post 
title: OpenScreen 是一个免费、开源的屏幕录制工具，可作为 Screen Studio 的替代方案（某种程度上）
date: 2026-04-03 21:01:55 +0800
categories: [AI]
tags: [ai, video]
published: true
---

# OpenScreen

## ⚠️ 注意

> 该项目目前仍处于 **Beta 阶段**，可能存在一些 bug，但希望你能获得不错的体验。

---

# OpenScreen

**OpenScreen 是一个免费、开源的屏幕录制工具，可作为 Screen Studio 的替代方案（某种程度上）。** ([Awesome Lists][1])

如果你不想为 Screen Studio 每月支付 $29，但又希望拥有一个**简单易用、能制作精美演示视频的工具**，那么这个项目就是为你准备的。

* ❌ 不是 1:1 完全替代 Screen Studio
* ✅ 更轻量、更简单
* ✅ 覆盖大多数常见需求
* ✅ 完全免费、无套路

如果你需要非常高级的功能，建议支持 Screen Studio（它确实很优秀）。
但如果你只需要一个**免费 + 开源 + 可控**的工具，OpenScreen 已经足够。

---

## 🆓 许可

* 100% 免费（个人 / 商业均可使用）
* 支持修改、分发
* MIT License

👉 总结：**没有水印、没有订阅、没有限制** ([Awesome Lists][1])

---

# 🚀 核心功能

### 🎥 录制能力

* 录制整个屏幕或指定应用
* 支持导入已有视频进行编辑

### 🔍 缩放与镜头控制

* 手动添加缩放（Zoom）
* 自定义缩放深度
* 精确控制缩放的：

  * 时间
  * 位置
  * 动画

### ✂️ 视频编辑

* 裁剪录制内容（隐藏不需要区域）
* 剪切片段（Trim）
* 调整视频片段速度（加速 / 减速）
* 支持时间轴编辑

### 🎨 视觉增强

* 背景支持：

  * 壁纸
  * 纯色
  * 渐变
  * 自定义图片
* 动态模糊（Motion Blur）
* 边框、间距可配置

### 📝 标注系统

* 添加：

  * 文本
  * 箭头
  * 图片
* 支持自定义字体（包括 Google Fonts）

### 🎬 导出能力

* 支持多种分辨率
* 支持多种比例：

  * 16:9
  * 9:16
  * 1:1 等
* GIF 导出（新版本支持）
* 导出速度优化（新版本大幅提升）

---

# 📦 安装方式

## 👉 推荐方式（普通用户）

直接从 GitHub Releases 下载对应系统安装包

支持：

* macOS（.dmg）
* Windows（.exe）
* Linux（.AppImage） ([Codakey][2])

---

## 🍎 macOS 安装注意事项

由于没有开发者签名，可能被 Gatekeeper 拦截：

执行：

```bash
xattr -rd com.apple.quarantine /Applications/Openscreen.app
```

然后：

1. 打开「系统设置 > 隐私与安全」
2. 授权：

   * 屏幕录制
   * 辅助功能

---

## 🐧 Linux

```bash
chmod +x Openscreen-Linux-*.AppImage
./Openscreen-Linux-*.AppImage
```

如果报 sandbox 错误：

```bash
./Openscreen-Linux-*.AppImage --no-sandbox
```

---

# 🧱 技术栈

OpenScreen 基于以下技术构建：

* Electron（桌面应用）
* React（UI）
* TypeScript（类型系统）
* Vite（构建工具）
* PixiJS（图形渲染）
* dnd-timeline（时间轴拖拽）

👉 本质：**Electron + Canvas 渲染 + 视频处理 pipeline**

---

# 🧠 架构关键点（补充理解）

根据项目结构：

* `frameRenderer.ts` → 帧渲染（合成效果）
* `videoExporter.ts` → 视频导出核心
* `streamingDecoder.ts` → 视频解码
* `annotationRenderer.ts` → 标注系统 ([Codakey][2])

👉 本质架构：

```
录制/导入视频
    ↓
时间轴编辑（zoom / trim / speed）
    ↓
Canvas 渲染（PixiJS）
    ↓
编码导出（WebCodecs / WASM）
```

---

# ⚙️ 构建方式（开发者）

```bash
git clone https://github.com/siddharthvaddem/openscreen.git
cd openscreen
npm install
npm run dev
```

打包：

```bash
npm run build
npm run dist
```

---

# 🤝 贡献

欢迎贡献代码！

可以查看：

* Issues
* Roadmap

项目作者表示：

> “我刚开始做开源，不太懂，如果有问题欢迎提 Issue 🙏”

---

# 📜 License

MIT License

👉 使用该软件即表示：

* 作者不承担任何责任
* 风险自负

---

# 🧩 一句话总结（架构视角）

OpenScreen 本质是：

> 一个 **基于 Electron 的本地视频录制 + 时间轴编辑 + 动效增强工具**，主打“低成本制作产品演示视频”。

---

# 🔥 我帮你补一层“架构级理解”（重点）

如果你是架构师视角，这个项目核心价值在：

### 1️⃣ 技术点

* WebCodecs / 视频编码
* Canvas 实时渲染（PixiJS）
* Timeline 编辑器（类似剪映）
* Electron 跨平台

### 2️⃣ 产品定位

* 对标 Screen Studio
* 目标用户：

  * 开发者
  * SaaS 产品演示
  * 教程制作

### 3️⃣ 商业模型（你可以借鉴）

* 当前：完全开源免费
* 可扩展：

  * 模板市场
  * AI 自动剪辑
  * 云渲染


# 参考资料

* any list
{:toc}