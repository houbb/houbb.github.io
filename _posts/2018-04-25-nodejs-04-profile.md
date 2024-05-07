---
layout: post
title:  NodeJs-04 Profile, Docker
date:  2018-04-25 14:05:12 +0800
categories: [NodeJs]
tags: [js, nodejs, nodejs-learn, js-learn]
published: true
---

# Profile

[NodeJS 调优](https://nodejs.org/en/docs/guides/simple-profiling/) 的方式有多种。

使用 profiler inside V8 可以让程序执行期间定期对栈进行采样。

## 启用

执行命令如下：

```
node --prof ${js_file_name}
```

## log

执行这个命令之后，会在 js 同级目录下生成一个 `isolate-0x102802400-v8.log` 文件。

里面记录的内容比较多，节选部分

```
v8-version,6,2,414,46,-node.23,0
shared-library,"/usr/local/bin/node",0x100000e00,0x100bb195a,0
shared-library,"/System/Library/Frameworks/CoreFoundation.framework/Versions/A/CoreFoundation",0x7fff314de860,0x7fff316d19ac,161239040
shared-library,"/usr/lib/libSystem.B.dylib",0x7fff575a094a,0x7fff575a0b2e,161239040
shared-library,"/usr/lib/libc++.1.dylib",0x7fff577d4f40,0x7fff5781c2b0,161239040
shared-library,"/usr/lib/libDiagnosticMessagesClient.dylib",0x7fff57229f08,0x7fff5722a90c,161239040
shared-library,"/usr/lib/libicucore.A.dylib",0x7fff582fefd0,0x7fff584b62e6,161239040
shared-library,"/usr/lib/libobjc.A.dylib",0x7fff58c4f000,0x7fff58c7065a,161239040
...
```

# Docker

[Docker](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/) 来运行我们的项目。

任意创建一个文件夹，用来保存本次演示的所有文件。

路径：

```
/Users/houbinbin/IT/learn/nodejs/docker
```

## 依赖文件的导入

- package.json

在 docker 文件夹下创建 `package.json` 文件，用来描述 app 及其依赖。

```json
{
  "name": "docker_web_app",
  "version": "1.0.0",
  "description": "Node.js on Docker",
  "author": "First Last <ryo@example.com>",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.16.1"
  }
}
```

- 安装依赖

直接运行如下命令：

```
npm install
```

日志如下：

```
houbinbindeMacBook-Pro:docker houbinbin$ npm install
npm notice created a lockfile as package-lock.json. You should commit this file.
npm WARN docker_web_app@1.0.0 No repository field.
npm WARN docker_web_app@1.0.0 No license field.

added 50 packages in 25.837s
```

## server.js

创建 `server.js` 文件，使用 [Express.js](https://expressjs.com/) 框架。

```js
'use strict';

const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  res.send('Hello world\n');
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
```

## Docker 相关文件

- Dockerfile

```
FROM node:carbon

# Create app directory
WORKDIR /Users/houbinbin/IT/learn/nodejs/docker

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "npm", "start" ]
```

- `.dockerignore` file

```
node_modules
npm-debug.log
```

## 构建镜像

- 构建

`-t` 打标签，可以后面更好的发现。

在有 `Dockerfile` 的路径下执行下面的命令： 

```
$ docker build -t ryo/node-web-app .
```


运行日志：

运行时需要下载东西，需要等待

```
Sending build context to Docker daemon  19.46kB
Step 1/7 : FROM node:carbon
carbon: Pulling from library/node
f2b6b4884fc8: Pull complete
4fb899b4df21: Pull complete
74eaa8be7221: Pull complete
2d6e98fe4040: Pull complete
452c06dec5fa: Pull complete
7b3c215894de: Pull complete
094529398b79: Pull complete
449fe646e95b: Pull complete
Digest: sha256:26e4c77f9f797c3993780943239fa79419f011dd93ae4e0097089e2145aeaa24
Status: Downloaded newer image for node:carbon
 ---> 4635bc7d130c
Step 2/7 : WORKDIR /Users/houbinbin/IT/learn/nodejs/docker
Removing intermediate container 93d8a67037ea
 ---> b2c2860c3e45
Step 3/7 : COPY package*.json ./
 ---> 3d56e8b7c31d
Step 4/7 : RUN npm install
 ---> Running in 5a1d1727f8b7
npm WARN docker_web_app@1.0.0 No repository field.
npm WARN docker_web_app@1.0.0 No license field.

added 50 packages in 2.855s
Removing intermediate container 5a1d1727f8b7
 ---> 4733df210d6a
Step 5/7 : COPY . .
 ---> ae01567caa9a
Step 6/7 : EXPOSE 8080
 ---> Running in 389a701bb420
Removing intermediate container 389a701bb420
 ---> ef93c9dda34a
Step 7/7 : CMD [ "npm", "start" ]
 ---> Running in d96d7e79b0cd
Removing intermediate container d96d7e79b0cd
 ---> 0aad7ad8e102
Successfully built 0aad7ad8e102
Successfully tagged ryo/node-web-app:latest
```

- 罗列镜像

```
$   docker images
```

结果

```
REPOSITORY                       TAG                 IMAGE ID            CREATED             SIZE
ryo/node-web-app                 latest              0aad7ad8e102        30 seconds ago      675MB
```

## 运行镜像

- 运行

```
$ docker run -p 49860:8080 -d ryo/node-web-app
```

- ps

```
$   docker ps
CONTAINER ID        IMAGE                            COMMAND                  CREATED             STATUS              PORTS                                                                     NAMES
9398f1a6a83e        ryo/node-web-app                 "npm start"              9 seconds ago       Up 7 seconds        0.0.0.0:49860->8080/tcp                                                   objective_dijkstra
```

```
$ docker logs 9398f1a6a83e

> docker_web_app@1.0.0 start /Users/houbinbin/IT/learn/nodejs/docker
> node server.js

Running on http://0.0.0.0:8080
```

## Test

```
$   curl -i localhost:49860
```

结果

```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 12
ETag: W/"c-M6tWOb/Y57lesdjQuHeB1P/qTV0"
Date: Wed, 25 Apr 2018 13:11:13 GMT
Connection: keep-alive

Hello world
```

* any list
{:toc}

