---
layout: post
title:  Vue Cli-04-创建一个项目
date:  2018-06-14 15:16:10 +0800
categories: [Vue]
tags: [vue]
published: true
---

# vue create

运行以下命令来创建一个新项目：

```
vue create hello-world
```

初始化完成后有日志提示，目录如下：

```
babel.config.js  node_modules/  package.json  package-lock.json  public/  README.md  src/
```

## 命令可选项

vue create 命令有一些可选项，你可以通过运行以下命令进行探索：

```
vue create --help
```

如下：

```
用法：create [options] <app-name>

创建一个由 `vue-cli-service` 提供支持的新项目


选项：

  -p, --preset <presetName>       忽略提示符并使用已保存的或远程的预设选项
  -d, --default                   忽略提示符并使用默认预设选项
  -i, --inlinePreset <json>       忽略提示符并使用内联的 JSON 字符串预设选项
  -m, --packageManager <command>  在安装依赖时使用指定的 npm 客户端
  -r, --registry <url>            在安装依赖时使用指定的 npm registry
  -g, --git [message]             强制 / 跳过 git 初始化，并可选的指定初始化提交信息
  -n, --no-git                    跳过 git 初始化
  -f, --force                     覆写目标目录可能存在的配置
  -c, --clone                     使用 git clone 获取远程预设选项
  -x, --proxy                     使用指定的代理创建项目
  -b, --bare                      创建项目时省略默认组件中的新手指导信息
  -h, --help                      输出使用帮助信息
```

## 使用图形化界面

你也可以通过 vue ui 命令以图形化界面创建和管理项目：

```
vue ui
```

# 拉取 2.x 模板 (旧版本)

Vue CLI >= 3 和旧版使用了相同的 vue 命令，所以 Vue CLI 2 (vue-cli) 被覆盖了。

如果你仍然需要使用旧版本的 vue init 功能，你可以全局安装一个桥接工具：

```
npm install -g @vue/cli-init
# `vue init` 的运行效果将会跟 `vue-cli@2.x` 相同
vue init webpack my-project
```

# 参考资料

https://cli.vuejs.org/zh/guide/creating-a-project.html#vue-create

* any list
{:toc}