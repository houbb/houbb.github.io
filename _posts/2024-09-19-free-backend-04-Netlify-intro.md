---
layout: post
title: Netlify 提供了免费的部署计划，支持静态网站和无服务器函数（Netlify Functions）
date: 2024-09-19 21:01:55 +0800
categories: [Cloud]
tags: [cloud, deploy, sh]
published: true
---

# 部署实战笔记

# 如何通过 Netlify 部署一个免费的后端服务？给出最简单的代码例子+部署流程

要通过 Netlify 部署一个免费的后端服务，可以使用无服务器函数（Serverless Functions）来实现。以下是一个简单的代码示例和部署流程。

### 1. 创建项目结构

首先，创建一个新的文件夹并设置项目结构：

```
my-netlify-backend/
├── netlify.toml
└── functions/
    └── hello.js
```

### 2. 创建无服务器函数

#### `functions/hello.js`

在 `functions` 文件夹中创建一个名为 `hello.js` 的文件，内容如下：

```javascript
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from Netlify!' }),
  };
};
```

### 3. 创建配置文件

#### `netlify.toml`

在项目根目录下创建一个名为 `netlify.toml` 的文件，内容如下：

```toml
[build]
  functions = "functions"
```

这告诉 Netlify 你的无服务器函数位于 `functions` 文件夹中。

### 4. 部署到 Netlify

#### 1. 创建 GitHub 仓库

将你的项目代码上传到 GitHub 仓库。

#### 2. 登录 Netlify

1. 打开 [Netlify 官网](https://www.netlify.com/) 并注册或登录。
2. 点击 "New site from Git" 按钮。

#### 3. 连接到 GitHub

1. 选择连接到 GitHub，并授权 Netlify 访问你的仓库。
2. 选择刚刚创建的仓库。

#### 4. 配置构建设置

- **Branch to deploy:** 选择你要部署的分支（通常是 `main` 或 `master`）。
- **Basic build settings:** 可以留空，Netlify 会自动识别项目。

#### 5. 部署

点击 "Deploy site" 按钮。Netlify 会自动构建并部署你的项目。

### 5. 访问无服务器函数

部署完成后，你可以访问无服务器函数的 URL。

可以在左侧的 LOGS 查看部署日志，以及链接。

https://app.netlify.com/sites/dynamic-pie-fb3d75/logs/functions

比如我的如下：

```
https://dynamic-pie-fb3d75.netlify.app/.netlify/functions/hello
```

返回：

```json
{"message":"Hello from Netlify!"}
```

# chat

## 详细介绍一下 Netlify

Netlify 是一个流行的前端平台，主要用于部署和托管静态网站和无服务器应用程序。

它提供了一系列功能，使开发者能够快速、轻松地构建、部署和管理现代 web 应用。

以下是关于 Netlify 的详细介绍，包括其主要功能、优点以及适用场景。

### 主要功能

1. **持续集成与持续部署（CI/CD）**
   - Netlify 自动检测 Git 仓库中的更改，支持 GitHub、GitLab 和 Bitbucket。
   - 每当代码更新时，Netlify 会自动构建并部署最新版本。

2. **无服务器函数（Serverless Functions）**
   - 允许开发者在无服务器环境中运行后端代码，支持 Node.js。
   - 适用于处理 API 请求、表单提交和处理用户身份验证等。

3. **全局内容分发网络（CDN）**
   - 自动将网站内容缓存到全球各地的 CDN 节点，提高加载速度和可用性。
   - 任何静态文件都能在全球范围内快速访问。

4. **自动 HTTPS**
   - Netlify 会为每个域名自动生成和管理 SSL 证书，确保安全连接。

5. **表单处理**
   - 内置表单处理功能，无需后端代码即可收集表单提交。
   - 支持自定义通知、Webhook 和数据存储。

6. **预览部署**
   - 提供预览功能，允许开发者在合并请求之前查看和测试更改。
   - 适用于团队协作和代码审查。

7. **自定义域名**
   - 支持自定义域名和子域名，并可以轻松配置 DNS。

8. **分析与监控**
   - 提供网站分析功能，跟踪访问量、流量来源等。
   - 可视化数据帮助了解用户行为。

### 优点

- **易于使用：** 界面友好，设置简单，无需复杂的配置。
- **快速部署：** 一键部署和自动构建，节省时间。
- **灵活性：** 适合静态网站、单页面应用（SPA）和 JAMstack 架构。
- **社区和插件：** 拥有丰富的文档、社区支持和第三方插件，增强功能。

### 适用场景

- **个人网站和博客：** 快速创建和部署个人项目。
- **企业网站：** 部署企业宣传页面、产品介绍等静态内容。
- **电子商务：** 利用无服务器函数和第三方服务构建简易电商平台。
- **文档和资源：** 提供产品文档、开发者指南和API文档。
- **Web 应用：** 结合 React、Vue、Angular 等现代前端框架构建复杂应用。

### 使用示例

1. **创建新的 Netlify 项目**
   - 登录 Netlify，选择连接到 GitHub 或其他 Git 服务。
   - 选择要部署的项目。

2. **配置构建设置**
   - 设置构建命令（如 `npm run build`）和发布目录（如 `dist` 或 `build`）。

3. **自定义域名与 HTTPS**
   - 在项目设置中添加自定义域名，自动配置 SSL。

4. **使用无服务器函数**
   - 在项目中创建 `netlify/functions` 文件夹，添加无服务器函数文件。
   - 示例：`hello.js`
     ```javascript
     exports.handler = async (event, context) => {
       return {
         statusCode: 200,
         body: JSON.stringify({ message: 'Hello from Netlify!' }),
       };
     };
     ```

### 总结

Netlify 是一个功能强大的平台，特别适合现代 web 开发和 JAMstack 架构。

通过其易用性、快速部署和强大的功能，开发者能够更高效地构建和管理各种类型的 web 应用。无论是个人项目还是企业网站，Netlify 都是一个理想的选择。

## Netlify 支持免费使用吗？免费的方案是什么样的？

是的，Netlify 提供了免费使用的方案，非常适合个人开发者、小型项目和初创企业。以下是免费方案的主要特点和限制：

### 免费方案特点

1. **静态网站托管**
   - 免费托管静态网站，支持无限的站点数量。

2. **持续集成与部署**
   - 连接到 GitHub、GitLab 或 Bitbucket 仓库，支持自动构建和部署。

3. **全局 CDN**
   - 所有内容自动通过全球内容分发网络（CDN）提供，确保快速加载。

4. **无服务器函数**
   - 每月支持最多 125,000 次无服务器函数调用，适合处理简单的后端逻辑。

5. **自动 HTTPS**
   - 自动为每个域名生成 SSL 证书，确保安全连接。

6. **表单处理**
   - 支持每月最多 100 次表单提交，无需额外设置后端。

7. **自定义域名**
   - 支持使用自定义域名，并自动配置 DNS 和 SSL。

8. **预览部署**
   - 每次推送到 Git 仓库时，自动生成预览部署，方便团队协作和代码审查。

9. **基本分析功能**
   - 提供基本的网站访问分析。

### 免费方案的限制

- **带宽限制：** 每月最多 100 GB 的带宽，适用于小型网站。如果超出限制，可能会影响访问。
- **功能限制：** 访问到的功能和支持相对较少，适合入门或小型项目。
- **无服务器函数限制：** 仅支持基本的无服务器函数调用，适合简单的应用需求。

### 适用对象

- **个人开发者：** 理想的选择，适合展示个人项目、作品集等。
- **小型企业：** 可以用来托管简单的企业网站或宣传页面。
- **初学者：** 学习前端开发、静态网站生成和持续部署的好平台。

### 升级选项

如果你需要更多的带宽、功能或支持，可以考虑升级到 Netlify 的付费方案，通常提供更多的调用次数、带宽和企业级支持。

总之，Netlify 的免费方案非常友好，适合快速启动项目和进行原型开发。

## 如何通过 Netlify 部署一个免费的后端服务？给出最简单的代码例子+部署流程

要通过 Netlify 部署一个免费的后端服务，可以使用无服务器函数（Serverless Functions）来实现。以下是一个简单的代码示例和部署流程。

### 1. 创建项目结构

首先，创建一个新的文件夹并设置项目结构：

```
my-netlify-backend/
├── netlify.toml
└── functions/
    └── hello.js
```

### 2. 创建无服务器函数

#### `functions/hello.js`

在 `functions` 文件夹中创建一个名为 `hello.js` 的文件，内容如下：

```javascript
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from Netlify!' }),
  };
};
```

### 3. 创建配置文件

#### `netlify.toml`

在项目根目录下创建一个名为 `netlify.toml` 的文件，内容如下：

```toml
[build]
  functions = "functions"
```

这告诉 Netlify 你的无服务器函数位于 `functions` 文件夹中。

### 4. 部署到 Netlify

#### 1. 创建 GitHub 仓库

将你的项目代码上传到 GitHub 仓库。

#### 2. 登录 Netlify

1. 打开 [Netlify 官网](https://www.netlify.com/) 并注册或登录。
2. 点击 "New site from Git" 按钮。

#### 3. 连接到 GitHub

1. 选择连接到 GitHub，并授权 Netlify 访问你的仓库。
2. 选择刚刚创建的仓库。

#### 4. 配置构建设置

- **Branch to deploy:** 选择你要部署的分支（通常是 `main` 或 `master`）。
- **Basic build settings:** 可以留空，Netlify 会自动识别项目。

#### 5. 部署

点击 "Deploy site" 按钮。Netlify 会自动构建并部署你的项目。

### 5. 访问无服务器函数

部署完成后，你可以访问无服务器函数的 URL。格式如下：

```
https://your-site-name.netlify.app/.netlify/functions/hello
```

访问该 URL 时，会返回：

```json
{"message":"Hello from Netlify!"}
```

### 6. 注意事项

- 确保你的项目结构和文件内容正确。
- 部署过程中可以查看构建日志，以确保没有错误。
- 如果需要处理更多复杂的逻辑，可以在 `hello.js` 中编写更多代码，处理不同的请求方法和路径。

通过以上步骤，你就可以在 Netlify 上成功部署一个免费的后端服务！


## 报错

```
报错：Page Not Found
Looks like you've followed a broken link or entered a URL that doesn't exist on this site.

 Back to our site

If this is your site, and you weren't expecting a 404 for this path, please visit Netlify's "page not found" support guide for troubleshooting tips.
```

出现 404 错误通常是因为无服务器函数的 URL 访问不正确或函数没有正确部署。请确保以下几点：

### 1. 函数目录和文件结构

确保你的项目结构如下：

```
my-netlify-backend/
├── netlify.toml
└── functions/
    └── hello.js
```

### 2. `hello.js` 内容

确保 `functions/hello.js` 文件内容如下：

```javascript
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from Netlify!' }),
  };
};
```

### 3. `netlify.toml` 内容

确保 `netlify.toml` 文件内容如下：

```toml
[build]
  functions = "functions"
```

### 4. 部署过程

1. **确认部署状态**：确保在 Netlify 的仪表板上查看到你的网站已成功部署。
2. **查看构建日志**：在 Netlify 仪表板中查看构建日志，确保没有错误发生。

### 5. 访问 URL

访问无服务器函数的 URL 时，请确保 URL 的格式是正确的：

```
https://your-site-name.netlify.app/.netlify/functions/hello
```

- 将 `your-site-name` 替换为你实际的网站名称。
- 确保使用的是 `.netlify/functions/` 路径。

### 6. 测试函数

可以在本地测试无服务器函数，使用 [Netlify CLI](https://docs.netlify.com/cli/get-started/) 进行本地开发。

#### 安装 Netlify CLI

```bash
npm install -g netlify-cli
```

#### 启动本地开发服务器

在项目根目录下运行：

```bash
netlify dev
```

这将启动一个本地开发服务器，你可以访问 `http://localhost:8888/.netlify/functions/hello` 来测试你的无服务器函数。

### 总结

如果以上步骤都正确但仍然出现 404 错误，请检查 Netlify 仪表板的设置，确保无服务器函数已成功部署。如果问题仍然存在，可以尝试重新部署或查看 Netlify 的支持文档以获取更多帮助。



# 参考资料


* any list
{:toc}