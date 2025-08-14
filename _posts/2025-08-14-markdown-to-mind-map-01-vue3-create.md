---
layout: post
title: 流程控制-01-vue3项目创建
date: 2025-8-14 20:40:12 +0800
categories: [FLOW]
tags: [flow, vue3, sh]
published: true
---


# 项目创建

```
npm create vite@latest markdown-to-mindmap -- --template vue
npm install
npm run dev
```

http://localhost:5173/ 可以查看效果


## 本地启动报错

```
error when starting dev server:
TypeError: crypto.hash is not a function
    at getHash (file:///D:/vue-demo/markdown-to-mindmap/node_modules/vite/dist/node/chunks/dep-CMEinpL-.js:2697:21)
    at getLockfileHash (file:///D:/vue-demo/markdown-to-mindmap/node_modules/vite/dist/node/chunks/dep-CMEinpL-.js:11653:9)
```

解决方式 降级到 Node 20.10 能跑的 Vite 版本


```bash
npm install vite@5.4.10 @vitejs/plugin-vue@5.1.4 --save-dev
```

然后清理依赖缓存并重装：

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```



# 参考资料

* any list
{:toc}