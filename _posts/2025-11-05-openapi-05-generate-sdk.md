---
layout: post
title: OpenAPI-05-openapi 如何为不同语言的生成 sdk 
date: 2025-11-05 14:12:33 +0800
categories: [HTTP]
tags: [http, openapi, sh]
published: true
---

# 前言

openapi 的标准化还有一个很大的好处，那就是 sdk 可以自动化生成。   

# 入门例子

## 安装

```
npm install @openapitools/openapi-generator-cli -g
```

版本确认

```
openapi-generator-cli version
```

## 异常

本地实际会报错：

```
Error: java.lang.UnsupportedClassVersionError: org/openapitools/codegen/OpenAPIGenerator has been compiled by a more recent version of the Java Runtime (class file version 55.0), this version of the Java Runtime only recognizes class file versions up to 52.0
        at java.lang.ClassLoader.defineClass1(Native Method)
        at java.lang.ClassLoader.defineClass(Unknown Source)
        at java.security.SecureClassLoader.defineClass(Unknown Source)
        at java.net.URLClassLoader.defineClass(Unknown Source)
        at java.net.URLClassLoader.access$100(Unknown Source)
        at java.net.URLClassLoader$1.run(Unknown Source)
        at java.net.URLClassLoader$1.run(Unknown Source)
        at java.security.AccessController.doPrivileged(Native Method)
        at java.net.URLClassLoader.findClass(Unknown Source)
        at java.lang.ClassLoader.loadClass(Unknown Source)
        at sun.misc.Launcher$AppClassLoader.loadClass(Unknown Source)
        at java.lang.ClassLoader.loadClass(Unknown Source)
        at sun.launcher.LauncherHelper.checkAndLoadMain(Unknown Source)
Error: A JNI error has occurred, please check your installation and try again
Exception in thread "main"
    at C:\Users\Administrator\AppData\Roaming\npm\node_modules\@openapitools\openapi-generator-cli\main.js:2:49314
    at ChildProcess.exithandler (node:child_process:424:5)
    at ChildProcess.emit (node:events:518:28)
    at maybeClose (node:internal/child_process:1101:16)
    at Socket.<anonymous> (node:internal/child_process:456:11)
    at Socket.emit (node:events:518:28)
    at Pipe.<anonymous> (node:net:346:12)

Node.js v22.18.0
```

### 原因

class file version 55.0 = Java 11 编译
class file version 52.0 = Java 8 运行时

也就是说：系统当前运行的 Java 是 Java 8，但 openapi-generator-cli 是用 Java 11+ 编译的。

### 解决方案

1) 升级 jdk 版本

2）指定 jdk 高版本

```
"C:\Program Files\Eclipse Adoptium\jdk-17\bin\java.exe" -jar \
  %APPDATA%\npm\node_modules\@openapitools\openapi-generator-cli\main.jar \
  generate -i http://localhost:8080/v3/api-docs -g java -o ./generated-sdk/java
```

## 生成

```
openapi-generator-cli generate \
  -i http://localhost:8080/v3/api-docs \
  -g java \
  -o ./generated-sdk/java \
  --api-package com.github.houbb.openapi.demo.api \
  --model-package com.github.houbb.openapi.demo.model \
  --invoker-package com.github.houbb.openapi.demo.invoker \
  --additional-properties=library=resttemplate,artifactId=openapi-java-sdk
```

| 参数                        | 说明                          |
| ------------------------- | --------------------------- |
| `-i`                      | 指定 OpenAPI 规范文件路径或 URL      |
| `-g`                      | 指定生成语言（`java`）              |
| `-o`                      | 输出目录                        |
| `--api-package`           | API 类所在包名                   |
| `--model-package`         | 模型类所在包名                     |
| `--invoker-package`       | SDK 内部调用工具包名                |
| `--additional-properties` | 附加配置，比如使用 `resttemplate` 实现 |

## 生成结果结构（示例）

```
generated-sdk/java/
├── pom.xml
├── README.md
├── src/main/java/com/github/houbb/openapi/demo/api/HelloApi.java
├── src/main/java/com/github/houbb/openapi/demo/model/HelloResponse.java
└── src/main/java/com/github/houbb/openapi/demo/invoker/ApiClient.java
```

## 打包

这个项目本身就是一个独立的 Maven SDK，你可以：

```
cd generated-sdk/java
mvn clean install
```

然后在其他项目中引用：

```xml
<dependency>
  <groupId>com.github.houbb.openapi.demo</groupId>
  <artifactId>openapi-java-sdk</artifactId>
  <version>1.0.0</version>
</dependency>
```

## 跨域问题

如果本地运行的 http://localhost:8080/v3/api-docs 不允许被 CLI 访问

你可以先下载一份 JSON：

```
curl -o openapi.json http://localhost:8080/v3/api-docs
```

然后：

```
openapi-generator-cli generate -i openapi.json -g java -o ./generated-sdk/java
```

# chat

## 直接生成在线包的思路

公司内部，或者自己使用，可以把 client 优化为 server

好处是可以直接 html 生成对应的 zip

## 代码

- index.html

支持输入 OpenAPI JSON/YAML、指定 URL 读取文档、验证、下载 Redoc 文档、选择语言并请求生成 SDK。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>OpenAPI 工具箱</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50 text-gray-800 p-6">
  <div class="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-lg">
    <h1 class="text-2xl font-bold mb-4 text-center">OpenAPI 工具箱</h1>

    <div class="space-y-4">
      <div>
        <label class="block mb-2 font-semibold">OpenAPI URL：</label>
        <div class="flex space-x-2">
          <input id="apiUrl" type="text" placeholder="http://localhost:8080/v3/api-docs"
                 class="flex-1 border p-2 rounded" />
          <button id="loadBtn" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">加载</button>
        </div>
      </div>

      <div>
        <label class="block mb-2 font-semibold">或直接粘贴 OpenAPI JSON/YAML：</label>
        <textarea id="specInput" rows="12" class="w-full border p-2 rounded font-mono text-sm"
                  placeholder="在这里粘贴 OpenAPI 规范..."></textarea>
      </div>

      <div class="flex space-x-3">
        <button id="validateBtn" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">验证</button>
        <button id="downloadBtn" class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">下载 Redoc HTML</button>
      </div>

      <div class="border-t pt-4 mt-4">
        <label class="block mb-2 font-semibold">生成 SDK：</label>
        <div class="flex space-x-2">
          <select id="language" class="border p-2 rounded w-40">
            <option value="java">Java</option>
            <option value="python">Python</option>
            <option value="typescript-axios">TypeScript (Axios)</option>
            <option value="go">Go</option>
            <option value="csharp">C#</option>
          </select>
          <button id="generateBtn" class="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
            生成 SDK
          </button>
        </div>
      </div>

      <div id="message" class="mt-4 text-sm text-gray-600"></div>
    </div>
  </div>

  <script src="main.js"></script>
</body>
</html>
```

- 前端逻辑（main.js）

负责加载 URL、验证规范、生成 Redoc HTML 文件、调用后端生成 SDK。

```js
document.getElementById("loadBtn").addEventListener("click", async () => {
  const url = document.getElementById("apiUrl").value.trim();
  const msg = document.getElementById("message");
  if (!url) return (msg.innerText = "请输入 OpenAPI URL");

  try {
    const res = await fetch(url);
    const text = await res.text();
    document.getElementById("specInput").value = text;
    msg.innerText = "✅ 已加载 OpenAPI 文档";
  } catch (err) {
    msg.innerText = "❌ 加载失败：" + err.message;
  }
});

document.getElementById("validateBtn").addEventListener("click", async () => {
  const text = document.getElementById("specInput").value.trim();
  const msg = document.getElementById("message");
  if (!text) return (msg.innerText = "请先输入或加载 OpenAPI 内容");

  try {
    JSON.parse(text);
    msg.innerText = "✅ JSON 格式有效";
  } catch {
    msg.innerText = "⚠️ 不是合法的 JSON，可能是 YAML 或格式错误";
  }
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  const spec = document.getElementById("specInput").value.trim();
  if (!spec) return alert("请先输入或加载 OpenAPI 内容");

  const blob = new Blob([
    `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>API Docs</title>
  <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
</head>
<body>
  <redoc spec-url="spec.json"></redoc>
</body>
</html>`
  ], { type: "text/html" });

  const zip = new JSZip();
  zip.file("spec.json", spec);
  zip.file("index.html", blob);

  zip.generateAsync({ type: "blob" }).then(content => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = "redoc-docs.zip";
    a.click();
  });
});

document.getElementById("generateBtn").addEventListener("click", async () => {
  const text = document.getElementById("specInput").value.trim();
  const lang = document.getElementById("language").value;
  const msg = document.getElementById("message");

  if (!text) return (msg.innerText = "请先输入 OpenAPI 内容");

  msg.innerText = "⏳ 正在生成 SDK，请稍候...";
  try {
    const res = await fetch("/generate-sdk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spec: text, lang }),
    });

    if (!res.ok) throw new Error("生成失败");
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sdk-${lang}.zip`;
    a.click();

    msg.innerText = "✅ SDK 已生成并下载";
  } catch (err) {
    msg.innerText = "❌ 生成失败：" + err.message;
  }
});
```

- 后端部分（server.js）

使用 Node.js + Express + OpenAPI Generator CLI 生成 SDK。

```js
import express from "express";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(bodyParser.json({ limit: "10mb" }));

app.post("/generate-sdk", async (req, res) => {
  const { spec, lang } = req.body;
  const id = Date.now();
  const tempDir = path.join(__dirname, `temp-${id}`);
  const specPath = path.join(tempDir, "openapi.json");
  const outputDir = path.join(tempDir, "sdk");

  fs.mkdirSync(tempDir, { recursive: true });
  fs.writeFileSync(specPath, spec);

  try {
    execSync(`openapi-generator-cli generate -i ${specPath} -g ${lang} -o ${outputDir}`, {
      stdio: "ignore"
    });

    const zipPath = path.join(tempDir, "sdk.zip");
    execSync(`cd ${outputDir} && zip -r ${zipPath} .`);

    res.download(zipPath, `sdk-${lang}.zip`, () => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });
  } catch (err) {
    res.status(500).send("生成失败：" + err.message);
  }
});

app.listen(3000, () => console.log("✅ 服务器已启动：http://localhost:3000"));
```

## 使用步骤

其实我们是加了一个壳，这样可以通过 html 拉起 client 命令。

1) 安装

```
npm install -g @openapitools/openapi-generator-cli
```

2) 启动服务器

```
node server.js
```

3) 打开页面

http://localhost:3000

4）操作

输入 OpenAPI URL 或 JSON，点击“生成 SDK”即可下载压缩包。

# 参考资料

* any list
{:toc}