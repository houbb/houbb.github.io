---
layout: post
title:  GitBook-04-gitbook-cli 用法介绍
date: 2019-1-17 09:34:35 +0800
categories: [Git]
tags: [git, devops, git-learn, git-topic, gitbook, sh]
published: true
---


# 实战笔记

## node

```
>node -v
v20.10.0
```

## 安装 gitbook-cli

```
npm install -g gitbook-cli
```

版本验证：

```
$ gitbook -V
CLI version: 2.3.2
Installing GitBook 3.2.3
C:\Users\Administrator\AppData\Roaming\npm\node_modules\gitbook-cli\node_modules\npm\node_modules\graceful-fs\polyfills.js:287
      if (cb) cb.apply(this, arguments)
                 ^

TypeError: cb.apply is not a function
    at C:\Users\Administrator\AppData\Roaming\npm\node_modules\gitbook-cli\node_modules\npm\node_modules\graceful-fs\polyfills.js:287:18
    at FSReqCallback.oncomplete (node:fs:200:5)

Node.js v20.10.0
```

### 解决报错方式1

https://blog.csdn.net/qq_32966261/article/details/130645218

依赖版本问题

```
cd C:\Users\Administrator\AppData\Roaming\npm\node_modules\gitbook-cli\node_modules\npm\node_modules\
npm install graceful-fs@latest --save
```

重新测试：

```
$ gitbook -V
CLI version: 2.3.2
```

但是发现实际上命令没有效果？

### 方式2

打开polyfills.js文件，找到这个函数

```js
function statFix (orig) {
  if (!orig) return orig
  // Older versions of Node erroneously returned signed integers for
  // uid + gid.
  return function (target, cb) {
    return orig.call(fs, target, function (er, stats) {
      if (!stats) return cb.apply(this, arguments)
      if (stats.uid < 0) stats.uid += 0x100000000
      if (stats.gid < 0) stats.gid += 0x100000000
      if (cb) cb.apply(this, arguments)
    })
  }
}
```

在第62-64行调用了这个函数

```js
fs.stat = statFix(fs.stat)
fs.fstat = statFix(fs.fstat)
fs.lstat = statFix(fs.lstat)
```

把这三行代码注释掉就解决报错了

发现有一个新的报错

```
Error: Failed to parse json
Unexpected token 'u' at 1:1
uleon.fumika@gmail.com"
```

尝试清空缓存： `npm cache clean --force` 没啥用


手动删除 cache，下 gitbook 开头的文件夹。然后卸载重装。

```
C:\Users\Administrator\AppData\Roaming\npm-cache
```



### 方式3-安装旧版本

卸载以前的

```
npm uninstall -g gitbook-cli
```

或者指定安装旧版本：

```
npm install gitbook-cli@2.1.2 --global
```

测试版本：

```
$ gitbook -V
2.1.2
```

但是发现 gitbook init 的时候会报错

```
$ gitbook init
Installing GitBook 3.2.3

Error: Failed to parse json
Unexpected token 'u' at 1:1
uleon.fumika@gmail.com"
^
```

# gitbook-cli 使用

## 初始化

到对应的文件夹

```
cd D:\github\git-learn
gitbook init
```

# chat

## gitbook-cli

### GitBook CLI 入门使用教程

#### 一、GitBook CLI 概述与现状
GitBook CLI 是 GitBook 的命令行工具，允许用户本地创建、构建和预览电子书。但由于 GitBook 团队已将重心转向其在线平台（GitBook.com），CLI 自 2015 年起已停止活跃开发。当前 CLI 仍支持基本功能，但内容维护主要依赖 GitHub 集成，旧版文档仍可运行。建议用户关注其 GitHub 社区以获取最新动态。

---

#### 二、环境准备与安装
1. 系统要求：
   - Node.js：建议使用 v4.0.0 ~ v10.24.1（更高版本可能导致兼容性问题）。
   - 支持的操作系统：Windows、Linux、Unix 或 macOS。

2. 安装步骤：
   - 安装 Node.js：从 [Node.js 官网](https://nodejs.org) 下载对应版本。
   - 配置镜像源（可选） ：加快下载速度：
     ```bash
     npm config set registry https://registry.npm.taobao.org/
     ```

   - 全局安装 GitBook CLI：
     ```bash
     npm install -g gitbook-cli
     ```

   - 验证安装：
     ```bash
     gitbook -V  # 输出 CLI 和 GitBook 版本，如 CLI version: 2.3.2, GitBook version: 3.2.3
     ```


---

#### 三、初始化项目
1. 创建项目目录：
   ```bash
   mkdir mybook && cd mybook
   ```


2. 初始化书籍结构：
   ```bash
   gitbook init  # 生成 README.md（书籍简介）和 SUMMARY.md（目录结构）
   ```


3. 编辑 `SUMMARY.md`：
   - 使用 Markdown 语法定义章节层级，例如：
     ```markdown
     # Summary
     * [第一章](chapter1.md)
       * [第一节](section1.md)
     * [第二章](chapter2.md)
     ```

   - 重新运行 `gitbook init` 以生成对应文件。

---

#### 四、编写与预览内容
1. 启动本地服务器：
   ```bash
   gitbook serve  # 默认端口 4000，访问 http://localhost:4000 预览
   ```

   - 自定义端口：
     ```bash
     gitbook serve --port 2333
     ```


2. 构建静态文件：
   ```bash
   gitbook build  # 生成到默认的 _book 目录
   ```

   - 指定输出目录：
     ```bash
     gitbook build ./mybook --output=dist
     ```


---

#### 五、版本管理与高级操作
1. 版本控制：
   - 查看已安装版本：
     ```bash
     gitbook ls
     ```

   - 安装特定版本：
     ```bash
     gitbook fetch 2.6.7  # 安装旧版本（如解决兼容性问题）
     ```

   - 更新至最新版本：
     ```bash
     gitbook update
     ```


2. 指定 GitBook 版本构建：
   ```bash
   gitbook build --gitbook=2.6.7  # 强制使用指定版本
   ```


3. 插件管理：
   - 安装插件需在 `book.json` 中配置，例如：
     ```json
     {
       "plugins": ["theme-default"]
     }
     ```

   - 初始化插件：
     ```bash
     gitbook install
     ```


---

#### 六、部署与发布
1. 本地部署：
   - 将 `_book` 目录上传至服务器，通过 Nginx/Apache 托管静态文件。

2. Docker 部署：
   - 编写 Dockerfile：
     ```dockerfile
     FROM nginx:alpine
     COPY _book /usr/share/nginx/html
     ```

   - 构建并运行容器：
     ```bash
     docker build -t mybook .
     docker run -d -p 80:80 mybook
     ```


3. 集成 GitBook.com：
   - 注册 GitBook 账号，创建 Space 并关联 GitHub 仓库实现自动同步。

---

#### 七、常见问题与解决
1. Node 版本过高导致错误：
   - 现象：`TypeError: cb.apply is not a function`。
   - 解决方案：
- 使用 `nvm` 切换至 Node.js v10 或更低版本：
       ```bash
       nvm install 10.24.1
       nvm use 10.24.1
       ```

- 或修改 `graceful-fs` 代码（临时修复）。

2. 构建后链接失效：
   - 原因：GitBook 3.x 版本与旧主题不兼容。
   - 解决：强制使用 2.x 版本构建：
     ```bash
     gitbook build --gitbook=2.6.7
     ```


3. 插件加载失败：
   - 检查 `book.json` 格式，确保插件名称正确，并运行 `gitbook install` 重新安装。

---

#### 八、注意事项
- 兼容性：推荐使用 Node.js v10 及以下，避免高版本问题。
- 长期维护：由于 CLI 已停止更新，建议复杂项目迁移至 GitBook.com 或替代工具（如 MkDocs）。
- 多语言支持：通过 `LANGS.md` 配置多语言目录结构。

通过以上步骤，您可以快速上手 GitBook CLI 的基本操作，并应对常见开发场景。尽管工具已不再更新，但其轻量级特性仍适合小型文档项目。


# 参考资料

https://docs.gitbook.com/

https://docs.gitbook.com/getting-started/quickstart

https://blog.csdn.net/weixin_42349568/article/details/108414441

https://www.cnblogs.com/cyxroot/p/13754475.html

* any list
{:toc}