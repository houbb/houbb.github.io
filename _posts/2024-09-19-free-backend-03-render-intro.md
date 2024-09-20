---
layout: post
title: 如何通过 render 部署一个免费的后端服务？最简单的代码例子+部署流程 需要绑定信用卡
date: 2024-09-19 21:01:55 +0800
categories: [Cloud]
tags: [cloud, deploy, sh]
published: true
---

# chat

## 如何通过 render 部署一个免费的后端服务？给出最简单的代码例子+部署流程

要通过 Render 部署一个免费的后端服务，Render 提供了一个简单的流程，可以使用 Node.js 快速搭建并部署一个后端服务。以下是最简单的代码例子和部署流程。

### 1. 编写简单的 Node.js 后端

首先，我们编写一个最简单的 Node.js 后端服务，使用 `Express` 框架。

#### 项目结构
```plaintext
my-node-app/
├── package.json
└── index.js
```

#### `package.json` 文件
```json
{
  "name": "my-node-app",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

#### `index.js` 文件
```javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello from Render!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
```

### 2. 部署流程

#### 1. 创建 GitHub 仓库

将上面的代码上传到 GitHub 仓库。Render 会通过 GitHub 进行代码的拉取和部署。

#### 2. 登录 Render 并创建新服务

1. 打开 [Render 官网](https://render.com/) 并注册或登录你的账户。
2. 登录后，点击 "New" 按钮，选择 "Web Service"。
3. 连接你的 GitHub 账户并选择刚刚创建的仓库。
4. 在 "Environment" 下选择 "Node"。
5. "Build Command" 可以留空，Render 会自动识别 Node 项目并运行 `npm install`。
6. "Start Command" 选择 `npm start` 或者留空，Render 会自动使用 `package.json` 里的 `start` 脚本。
7. 点击 "Create Web Service"。

#### 3. 等待部署完成

Render 会自动从你的 GitHub 仓库拉取代码，执行构建并部署。

几分钟后，你会看到服务成功启动，并且会提供一个免费域名访问你的后端服务。

你可以通过提供的 URL 访问你的后端服务，访问时将显示 `Hello from Render!`。

### 3. 注意事项

- Render 的免费版提供有限的资源，适合轻量级的后端服务。
- 每个服务有月度时限，如果长期运行，可以考虑升级为付费计划。

这样，你的免费后端服务就成功部署在 Render 上了！

# 参考资料

https://docs.railway.app/reference/pricing/plans#free-trial

* any list
{:toc}