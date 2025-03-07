---
layout: post
title: 体验了一下 Trae AI 编辑器 时代学习编程如此丝滑 
date: 2025-3-7 19:49:19 +0800
categories: [AI]
tags: [ai, vue3, vu3, learn, sh]
published: true
---


# 前言

最近 AI 如火如荼，Deepseek, 机器人、manus 令人应接不暇。

还是那句话，打不过就加入。

于是下载了个国产的 Trae 编辑器，体验一下 builder 模式。

整体体验还是比较丝滑的。

# 实战笔记

我的问题

```
帮我生成一个 vue3 技术栈，最经典的 hell world 入门项目
```

选择的是 deepseek 模型。

## AI builder 模式

然后，基本就是傻瓜式的等待+点击就行。

下面是 AI 的回答，好处就是可以直接验证效果+实时反馈。

--------------------------------

我将为您创建一个基于Vue3的经典Hello World项目。

首先需要初始化Vue项目结构，创建必要的组件文件，并配置基础路由（如有需要）。

我会使用Vite作为构建工具来搭建现代Vue3开发环境，并添加一个展示"Hello World"的组件。

最后将确保项目能够正确运行并通过本地服务器预览效果。

我将使用Vite初始化一个新的Vue3项目，这是目前Vue官方推荐的现代构建工具。

hello-world 终端

```
npm create vite@latest hello-world -- --template vue-ts
```

检测到npm安装失败，可能是由于镜像源问题。我将尝试更换为国内淘宝镜像源后重新执行命令。

hello-world 终端

```
npm config set registry https://registry.npmmirror.com
```

镜像源已成功更换，现在重新执行Vue3项目初始化命令以确保依赖正确下载。

hello-world 终端

```
npm install
```

检测到package.json存在于hello-world子目录中，现在需要进入该目录安装依赖。

hello-world\hello-world 终端

```
npm install
```

项目依赖已安装完成，现在启动开发服务器以便预览Hello World效果。

hello-world\hello-world 终端

```
npm run dev
```

开发服务器已启动，现在为您打开预览窗口以查看Hello World效果。

正在确认开发服务器运行状态以确保预览可用。

已成功创建基于Vue3的Hello World项目！

- 使用Vite搭建了现代化的Vue3开发环境
- 创建了标准的Vue项目结构（包含App.vue/main.ts等核心文件）
- 安装了必要依赖并配置了TypeScript支持
- 开发服务器已在本地5173端口运行
现在可以通过 http://localhost:5173 访问您的Hello World应用，页面将显示Vue的默认欢迎界面。

# 目录结构

## 文件的作用

当然，我们可以从零开始学习，当自己是小白。

然后直接询问：用目录文件结构+注释的方式来回答。解释一下项目的目录结构。

## AI 回答

我将通过目录文件结构和注释的方式来介绍Vue3项目的整体结构。

首先会列出主要文件和目录，然后为每个核心文件添加详细的功能说明注释，帮助用户理解项目组织方式。

以下是Vue 3项目的目录结构和核心文件注释：

```
hello-world/
├── public/               # 静态资源目录
│   └── vite.svg          # Vite logo
├── src/                  # 源代码目录
│   ├── assets/           # 静态资源
│   ├── components/       # 组件目录
│   │   └── HelloWorld.vue # 示例组件
│   ├── App.vue           # 根组件
│   ├── main.ts           # 应用入口
│   ├── style.css         # 全局样式
│   └── vite-env.d.ts     # Vite环境类型声明
├── .gitignore            # Git忽略文件
├── index.html            # 应用入口HTML
├── package.json          # 项目依赖和脚本
├── README.md             # 项目说明
├── tsconfig.json         # TypeScript配置
├── tsconfig.app.json     # 应用TypeScript配置
├── tsconfig.node.json    # Node TypeScript配置
└── vite.config.ts        # Vite配置文件
```

核心文件功能注释：

```
- src/main.ts: Vue应用入口，创建并挂载根实例
- src/App.vue: 应用根组件，包含主要布局和子组件
- src/components/HelloWorld.vue: 示例组件，展示Vue基础功能
- src/style.css: 全局样式文件
- src/vite-env.d.ts: Vite环境变量类型声明
- vite.config.ts: Vite配置文件，包含插件和构建配置
- package.json: 项目依赖和脚本配置
- tsconfig.*.json: TypeScript配置文件，分别用于不同环境
```

# 文件解释

假设我们是一个小白，就可以继续让 AI 解释其中的一个文件。

比如：帮我详细解释一下 `package.json`，循序渐进，从整体作用，相关技术栈，再到文件中具体每一行的详细解释。让我一个小白也能由浅入深理解。

## AI 回答

package.json是Node.js项目的核心配置文件，用于管理项目元数据、依赖项和脚本。

在您的Vue3项目中，它定义了项目的基本信息、开发和生产环境所需的依赖包，以及常用的npm脚本命令。

具体来说，文件中的"dependencies"部分列出了项目运行时必需的依赖（如Vue），而"devDependencies"则包含了开发工具（如Vite、TypeScript等）。"scripts"部分定义了常用的命令，如启动开发服务器、构建生产包等。

这个文件是项目构建和运行的基础，确保所有开发者使用相同的依赖版本和构建流程。

我将以代码注释的方式为您呈现完整的package.json文件解释，每个字段后添加行内注释说明其作用。以下是融合后的文件内容：

```json
{
    "name": "hello-world",  // 项目名称
    "private": true,        // 私有项目(禁止发布到npm)
    "version": "0.0.0",    // 初始版本号
    "type": "module",      // 使用ES模块规范
    "scripts": {           // 可执行命令
        "dev": "vite",       // 启动开发服务器
        "build": "vue-tsc -b && vite build",  // 构建生产包
        "preview": "vite preview"             // 预览构建结果
    },
    "dependencies": {       // 生产依赖
        "vue": "^3.5.13"      // Vue3核心框架
    },
    "devDependencies": {    // 开发依赖
        "@vitejs/plugin-vue": "^5.2.1",  // Vite的Vue插件
        "@vue/tsconfig": "^0.7.0",       // Vue的TS配置预设
        "typescript": "~5.7.2",          // TypeScript编译器
        "vite": "^6.2.0",                // Vite构建工具
        "vue-tsc": "^2.2.4"             // Vue类型检查工具
    }
}
```

# 总结

这种面向 AI 的编辑器最大的优点是可以获取到代码完整的上下文，包含命令行错误信息等，不需要我们费劲描述，生成的代码也可以直接更新到代码中。

以后类似的工具估计会越来越多，相信不就得将来，每一个软件都会内置 AI。

# 参考资料

* any list
{:toc}