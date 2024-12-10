---
layout: post
title: vite2.0-02-下一代的前端工具链 vite 实战入门笔记
date: 2024-05-07 21:01:55 +0800
categories: [Web]
tags: [web, vue, vite, sh]
published: true
---

# 总览

Vite（法语意为 "快速的"，发音 /vit/，发音同 "veet"）是一种新型前端构建工具，能够显著提升前端开发体验。它主要由两部分组成：

一个开发服务器，它基于 原生 ES 模块 提供了 丰富的内建功能，如速度快到惊人的 模块热更新（HMR）。

一套构建指令，它使用 Rollup 打包你的代码，并且它是预配置的，可输出用于生产环境的高度优化过的静态资源。

Vite 意在提供开箱即用的配置，同时它的 插件 API 和 JavaScript API 带来了高度的可扩展性，并有完整的类型支持。

你可以在 为什么选 Vite 中了解更多关于项目的设计初衷。

# 浏览器支持

默认的构建目标浏览器是能 在 script 标签上支持原生 ESM 和 原生 ESM 动态导入。

传统浏览器可以通过官方插件 @vitejs/plugin-legacy 支持 —— 查看 构建生产版本 章节获取更多细节。

# 在线试用 Vite

你可以通过 [StackBlitz](https://vite.new/) 在线试用 vite。

它直接在浏览器中运行基于 Vite 的构建，因此它与本地开发几乎无差别，同时无需在你的机器上安装任何东西。你可以浏览 vite.new/{template} 来选择你要使用的框架。

# 搭建第一个 Vite 项目

## node 版本

Vite 需要 Node.js 版本 >= 12.0.0。

```
λ node -v
v20.10.0
```

## install

```sh
$ npm init vite@latest
```

选择对应项：

```
Need to install the following packages:                                
create-vite@6.0.1                                                      
Ok to proceed? (y) y                                                   
                                                                       
                                                                       
> npx                                                                  
> create-vite                                                          
                                                                       
√ Project name: ... vite-project                                       
√ Select a framework: » Vue                                            
√ Select a variant: » TypeScript                                       
                                                                       
Scaffolding project in D:\tool\cmder_mini\vite-project...              
                                                                       
Done. Now run:                                                         
                                                                       
  cd vite-project                                                      
  npm install                                                          
  npm run dev                                                          
                                                                       
npm notice                                                             
npm notice New minor version of npm available! 10.7.0 -> 10.9.2        
npm notice Changelog: https://github.com/npm/cli/releases/tag/v10.9.2  
npm notice To update run: npm install -g npm@10.9.2                    
npm notice                                                             
```

默认的项目结构如下：

```
│  .gitignore                   
│  index.html                   
│  package.json                 
│  README.md                    
│  tsconfig.app.json            
│  tsconfig.json                
│  tsconfig.node.json           
│  vite.config.ts               
│                               
├─.vscode                       
│      extensions.json          
│                               
├─public                        
│      vite.svg                 
│                               
└─src                           
    │  App.vue                  
    │  main.ts                  
    │  style.css                
    │  vite-env.d.ts            
    │                           
    ├─assets                    
    │      vue.svg              
    │                           
    └─components                
            HelloWorld.vue      
```


## 安装依赖

```bash
npm install
```

## 本地启动

```
npm run dev
```

访问

http://localhost:5173/


# 参考资料

https://www.vitejs.net/guide/

* any list
{:toc}
