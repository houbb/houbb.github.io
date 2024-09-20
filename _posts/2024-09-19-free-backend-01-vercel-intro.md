---
layout: post
title: 免费的后端服务器？ vercel nodejs 部署前后端实战笔记
date: 2024-09-19 21:01:55 +0800
categories: [Cloud]
tags: [cloud, deploy, sh]
published: true
---

# 部署实战

## 代码

代码直接放在 github 上，项目结构:

```plaintext
my-vercel-app/
├── api/
│   └── index.js
|── public/
│   └── index.html
├── package.json
└── vercel.json
```

- `package.json` 文件

```json
{
  "name": "my-vercel-app",
  "version": "1.0.0",
  "main": "api/index.js",
  "scripts": {
    "start": "node api/index.js"
  }
}
```

- `api/index.js` 文件

在 Vercel 中，每个 API 处理器就是一个无服务器函数。

我们用一个简单的函数来替代 Express。

```javascript
module.exports = (req, res) => {
  res.status(200).json({ message: 'Hello from Vercel!' });
};
```

- `vercel.json` 文件

确保 `vercel.json` 文件存在，以便 Vercel 识别到你希望部署的是 API 函数。

```json
{
  "version": 2,
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    }
  ]
}
```

- public/index.html 首页 HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Vercel App</title>
</head>
<body>
  <h1>Hello from Vercel!</h1>
  <p>This is the homepage.</p>
</body>
</html>
```

## vercel 注册+部署

#### 1. 创建 GitHub 仓库

将上面的代码上传到 GitHub 仓库，Vercel 将会通过 GitHub 仓库进行代码拉取。

#### 2. 登录 Vercel 并创建项目

1. 打开 [Vercel 官网](https://vercel.com/) 并注册或登录。
2. 登录后点击 "New Project" 按钮。
3. 连接 Vercel 到 GitHub 账户，并选择刚刚创建的 GitHub 仓库。
4. 点击 "Import" 按钮。
5. Vercel 会自动识别项目并进行部署。

#### 3. 等待部署完成

Vercel 会自动从你的 GitHub 仓库拉取代码并执行部署，几分钟后你的后端服务就会自动上线。

#### 4. 访问服务

## 访问

部署成功后，Vercel 会提供一个 URL。

比如我的：

https://my-vercel-m2twrk8yh-houbb1s-projects.vercel.app/

直接返回首页：

```html
Hello from Vercel!
This is the homepage.
```

访问 api:

https://my-vercel-m2twrk8yh-houbb1s-projects.vercel.app/api/index


返回：

```json
{"message":"Hello from Vercel!"}
```




# chat

## 详细介绍一下 vercel 

Vercel 是一个面向开发者的平台，专注于前端框架的快速部署和优化，尤其是与静态网站和服务器渲染的网站相关的项目。

它由 Vercel Inc. 开发，之前被称为 ZEIT。以下是 Vercel 的一些关键特点和功能：

### 1. **自动化部署**
Vercel 提供了一个极简的部署流程。通过将代码推送到 GitHub、GitLab 或 Bitbucket，Vercel 会自动检测项目并进行构建、部署和发布。这种自动化流程大大简化了持续集成和持续交付（CI/CD）的过程。

### 2. **静态和动态内容支持**
- **静态网站生成**：Vercel 可以快速部署生成的静态网站，支持优化和缓存机制，以提高性能。
- **服务器端渲染**：Vercel 支持使用 Next.js 等框架进行服务器端渲染 (SSR)，使得应用程序能够动态生成内容并优化加载时间。

### 3. **边缘网络**
Vercel 利用全球内容分发网络（CDN）来分发和缓存内容，这样可以提高访问速度和性能。它将静态内容和动态内容分发到离用户更近的边缘位置，从而减少延迟。

### 4. **预览环境**
每次推送代码时，Vercel 会为每个拉取请求（Pull Request）自动创建一个预览环境。这使得开发者可以在合并到主分支之前对变更进行测试和审核。

### 5. **无服务器功能**
Vercel 提供了无服务器函数支持，可以运行后端代码而无需管理服务器基础设施。

这些函数可以处理 API 请求、表单处理等任务，适合与静态和动态内容一起使用。

### 6. **集成和插件**
Vercel 提供了与许多流行工具和服务的集成，如 Slack、Sentry、GitHub Actions 等。此外，还有插件系统可以扩展其功能。

### 7. **开发体验**
Vercel 提供了友好的用户界面和开发者工具，可以方便地管理项目和查看部署状态。它支持自定义域名、SSL 证书管理和其他功能，以确保网站的安全性和可靠性。

### 8. **优化和性能**
Vercel 的平台内建了一些优化功能，如自动图像优化和智能缓存策略，帮助提升站点的加载速度和性能。

### 9. **定价**
Vercel 提供了免费计划和付费计划。免费计划通常适用于个人项目和小型应用，而付费计划则提供了更多的功能、支持和资源，适用于团队和企业。

总的来说，Vercel 通过简化部署流程、提供强大的性能优化功能和无缝的集成，使得前端开发变得更加高效和便捷。如果你的项目涉及到静态网站、动态网站或服务器端渲染，Vercel 都是一个值得考虑的选择。

## Vercel  支持部署后端服务吗？

Vercel 主要专注于前端和静态网站的部署，但它也提供了一些后端服务的支持。具体来说，Vercel 的后端支持包括：

### 1. **无服务器函数 (Serverless Functions)**
Vercel 允许你在项目中使用无服务器函数，这些函数可以用来处理 API 请求、表单提交、身份验证等后端逻辑。

无服务器函数是 Vercel 的核心功能之一，可以用多种编程语言编写，例如 JavaScript、TypeScript 和 Go。

这些函数在需要时才会被调用，因此不需要你管理服务器基础设施。

### 2. **API 路由**
你可以在 Vercel 上创建 API 路由，将它们与前端代码无缝集成。通过在项目的 `api` 目录下创建文件夹和文件，你可以定义不同的 API 路由，每个路由都可以对应一个无服务器函数。这使得你能够在一个项目中同时处理前端和后端代码。

### 3. **静态和动态内容结合**
对于需要动态生成内容的应用，你可以利用无服务器函数处理数据并将结果返回给前端。这种模式适合于动态内容的生成和处理，但还是需要注意，如果你的后端逻辑比较复杂或需要长期运行的任务，可能会有一定的限制。

### 4. **集成其他后端服务**
虽然 Vercel 主要提供无服务器计算，但它可以很容易地与其他后端服务集成，例如数据库、第三方 API、身份验证服务等。你可以将这些服务与 Vercel 部署的前端和无服务器函数结合使用，以实现完整的应用功能。

### 5. **限制**
由于 Vercel 的无服务器函数是基于事件驱动的，它们在执行时间和内存使用上有一定的限制。如果你的应用有需要长时间运行的任务或复杂的计算，可能需要考虑其他平台或服务。

### 6. **部署和配置**
后端服务的配置和部署通常与前端项目配置一起进行。例如，你可以在 `vercel.json` 文件中配置无服务器函数的设置和路由规则。

总的来说，虽然 Vercel 的核心功能是针对前端和静态内容的，但它通过无服务器函数和 API 路由功能，支持一定程度的后端服务。如果你的项目需要更复杂的后端逻辑或长时间运行的任务，可能需要考虑与其他后端服务集成或使用专门的后端平台。

## Vercel Functions 可以做什么？默认支持哪些语言？我的 java 程序支持部署吗？

Vercel Functions 是 Vercel 平台提供的无服务器计算功能，允许你在 Vercel 上运行后端代码。

它的主要用途包括：

### **功能和用途**

1. **API 端点**：可以用来创建 RESTful API 端点，处理 HTTP 请求和响应。
2. **表单处理**：处理表单提交和数据验证。
3. **数据处理**：执行数据处理任务，如数据转换、清洗和存储。
4. **动态内容生成**：根据请求生成动态内容或响应，适合与静态网站或服务器端渲染（SSR）结合使用。
5. **集成外部服务**：与其他 API 和外部服务集成，处理第三方数据或执行操作。

### **默认支持的语言**

Vercel Functions 默认支持以下编程语言：

- **JavaScript (Node.js)**：Vercel 的主要语言，支持 Node.js 12.x 和 14.x。
- **TypeScript**：与 JavaScript 相同，通过 TypeScript 编译器（tsc）进行编译。
- **Go**：支持 Go 1.17+。
- **Python**：支持 Python 3.8+。

### **Java 支持**

默认情况下，Vercel Functions 并不直接支持 Java。

Vercel 的无服务器函数平台主要面向 Node.js、Go 和 Python 等语言。如果你希望在 Vercel 上运行 Java 程序，你可能需要考虑以下替代方案：

1. **Java 转译**：将 Java 代码转译为 JavaScript 或其他支持的语言。例如，使用 GraalVM 可以将 Java 代码编译为 JavaScript 代码，虽然这可能会引入复杂性。

2. **外部服务**：将 Java 程序部署到支持 Java 的其他无服务器平台或云服务（如 AWS Lambda、Google Cloud Functions、Azure Functions），然后通过 Vercel 函数或前端代码调用这些外部服务。

3. **容器化**：将 Java 应用容器化并部署到支持容器的云服务平台（如 AWS Fargate、Google Cloud Run、Azure Container Instances），然后通过 Vercel 函数与容器化应用进行交互。

如果你需要在 Vercel 上使用 Java，考虑上述替代方案可能会是一个解决方案，但直接在 Vercel Functions 上运行 Java 代码目前是不支持的。

## 为什么默认支持的是上面的语言，但是不支持 java 呢？

Vercel 的无服务器函数平台主要支持 JavaScript (Node.js)、TypeScript、Go 和 Python，这些选择是基于几个因素的考虑：

### **1. **广泛使用的语言**
- **JavaScript/TypeScript**：这两种语言在前端开发中非常流行，与 Vercel 的前端优化和静态站点生成目标非常契合。TypeScript，作为 JavaScript 的超集，提供了类型安全和更好的开发体验。
- **Go**：Go 以其高效的性能和并发处理能力在现代云原生应用中受到青睐。Go 的设计简洁且性能优秀，适合无服务器架构。
- **Python**：Python 在数据处理、自动化和简单的 Web 服务中有广泛应用。它的易用性和广泛的库支持使其成为无服务器计算的热门选择。

### **2. **需求和性能**
- **性能考虑**：Node.js、Go 和 Python 在短时间执行任务和处理高并发请求时表现出色。它们的运行时性能和启动速度（冷启动时间）使得它们适合无服务器函数环境。
- **开发者需求**：这些语言在无服务器计算领域有广泛的应用案例和需求。它们的社区支持也较强，提供了丰富的工具和库来简化无服务器开发。

### **3. **生态系统与集成**
- **生态系统**：支持的语言具有成熟的生态系统和工具链，可以无缝集成到 Vercel 的平台上。这包括构建、部署和监控工具的支持。
- **集成**：这些语言与 Vercel 的其他功能（如边缘计算、静态生成）有很好的集成性，能够充分发挥 Vercel 平台的优势。

### **4. **复杂性和资源管理**
- **复杂性**：支持 Java 需要管理较为复杂的运行时环境，例如 JVM（Java Virtual Machine）。这会增加平台的管理复杂性和维护成本。
- **资源使用**：Java 的启动时间（冷启动时间）相对较长，可能不适合无服务器函数的短暂和高效的要求。无服务器环境通常需要快速启动和响应，因此选择运行时性能较好的语言有助于提供更好的用户体验。

### **5. **社区和用户反馈**
- **用户反馈**：平台的语言选择也受到用户需求的影响。Vercel 根据开发者的实际需求和反馈选择支持的语言，以便更好地服务其用户群体。

虽然 Vercel 默认不支持 Java，但你仍然可以通过其他方式（如容器化、外部服务）将 Java 应用与 Vercel 集成。

这样可以充分利用 Vercel 的前端优化能力，同时在支持的环境中运行 Java 代码。


## velcel 部署

在 Vercel 上免费部署一个简单的 Node.js 后端服务也是非常方便的，Vercel 支持静态站点和无服务器（Serverless）函数。

由于 Vercel 更专注于无服务器架构，部署过程稍有不同，需要将代码调整为 Vercel 的 Serverless 函数格式。

### 1. 调整代码适应 Vercel

Vercel 无法直接部署 Node.js Express 应用，但可以使用无服务器函数（Serverless Functions）来处理请求。以下是将代码调整为 Vercel 可用的最简单方式：

#### 项目结构
```plaintext
my-vercel-app/
├── api/
│   └── index.js
├── package.json
└── vercel.json
```

#### `package.json` 文件
```json
{
  "name": "my-vercel-app",
  "version": "1.0.0",
  "main": "api/index.js",
  "scripts": {
    "start": "node api/index.js"
  }
}
```

#### `api/index.js` 文件

在 Vercel 中，每个 API 处理器就是一个无服务器函数。我们用一个简单的函数来替代 Express。

```javascript
module.exports = (req, res) => {
  res.status(200).json({ message: 'Hello from Vercel!' });
};
```

#### `vercel.json` 文件

确保 `vercel.json` 文件存在，以便 Vercel 识别到你希望部署的是 API 函数。

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ]
}
```

### 2. 部署流程

#### 1. 创建 GitHub 仓库

将上面的代码上传到 GitHub 仓库，Vercel 将会通过 GitHub 仓库进行代码拉取。

#### 2. 登录 Vercel 并创建项目

1. 打开 [Vercel 官网](https://vercel.com/) 并注册或登录。
2. 登录后点击 "New Project" 按钮。
3. 连接 Vercel 到 GitHub 账户，并选择刚刚创建的 GitHub 仓库。
4. 点击 "Import" 按钮。
5. Vercel 会自动识别项目并进行部署。

#### 3. 等待部署完成

Vercel 会自动从你的 GitHub 仓库拉取代码并执行部署，几分钟后你的后端服务就会自动上线。

#### 4. 访问服务

部署成功后，Vercel 会提供一个 URL。你可以通过这个 URL 访问部署的后端服务，例如 `https://your-app.vercel.app/api/index`，这时会返回 `{"message":"Hello from Vercel!"}`。

### 3. 注意事项

- Vercel 提供的无服务器函数适合处理简单的 API 请求。
- Vercel 的免费计划有一定的请求配额，适用于小型项目或测试阶段。

通过这些步骤，你就可以在 Vercel 上免费部署一个简单的后端服务了。


## 部署完成后访问 404

在 Vercel 上，访问根路径（`/`）时会尝试加载一个静态站点，而当前项目是通过无服务器函数提供 API 端点的。由于项目没有配置静态页面，访问根路径时会导致 404 错误。

要解决这个问题，你有两种选择：

### 1. 添加静态页面

如果你希望访问根路径 `/` 时看到一个页面，可以添加一个简单的静态 HTML 文件。

#### 项目结构更新
```plaintext
my-vercel-app/
├── api/
│   └── index.js
├── public/
│   └── index.html
├── package.json
└── vercel.json
```

#### `public/index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Vercel App</title>
</head>
<body>
  <h1>Hello from Vercel!</h1>
  <p>This is the homepage.</p>
</body>
</html>
```

Vercel 会自动将 `public/index.html` 作为根路径的页面展示。添加 `public/` 文件夹和 `index.html` 后，重新部署项目即可解决根路径报 404 的问题。

### 2. 使用 API 路径

如果你只想提供 API 服务，建议使用 API 路径进行访问。例如，访问你的后端 API 路径：

```bash
https://my-vercel-app-pink.vercel.app/api/index
```

这个路径会返回 `{"message": "Hello from Vercel!"}`，因为你部署的无服务器函数位于 `api/index.js`。

### 解决步骤

1. 如果你希望根路径展示静态内容，按 **方法 1** 添加 `index.html` 并重新部署。
2. 如果你只需要 API，不需要根路径静态内容，可以直接通过 `/api/index` 访问服务。

这将解决 Vercel 上 404 错误的问题。

# 参考资料

https://github.com/ctripcorp/x-pipe

* any list
{:toc}