---
layout: post
title:  低代码开源源码学习-02-github actions ci 持续集成
date:  2022-09-03 21:22:02 +0800
categories: [Tool]
tags: [low-code, sh]
published: true
---

# GitHub Actions 入门教程

GitHub Actions 是 GitHub 的持续集成服务，于2018年10月推出。

这些天，我一直在试用，觉得它非常强大，有创意，比 Travis CI 玩法更多。

本文是一个简单教程，演示如何使用 GitHub Actions 自动发布一个 React 应用到 GitHub Pages。

# GitHub Actions 是什么？

大家知道，持续集成由很多操作组成，比如抓取代码、运行测试、登录远程服务器，发布到第三方服务等等。GitHub 把这些操作就称为 actions。

很多操作在不同项目里面是类似的，完全可以共享。

GitHub 注意到了这一点，想出了一个很妙的点子，允许开发者把每个操作写成独立的脚本文件，存放到代码仓库，使得其他开发者可以引用。

如果你需要某个 action，不必自己写复杂的脚本，直接引用他人写好的 action 即可，整个持续集成过程，就变成了一个 actions 的组合。这就是 GitHub Actions 最特别的地方。

GitHub 做了一个[官方市场](https://github.com/marketplace?type=actions)，可以搜索到他人提交的 actions。

另外，还有一个 [awesome actions](https://github.com/sdras/awesome-actions) 的仓库，也可以找到不少 action。

![whatis](https://www.wangbase.com/blogimg/asset/201909/bg2019091105.jpg)

上面说了，每个 action 就是一个独立脚本，因此可以做成代码仓库，使用userName/repoName的语法引用 action。

比如，actions/setup-node就表示github.com/actions/setup-node这个仓库，它代表一个 action，作用是安装 Node.js。

事实上，GitHub 官方的 actions 都放在 github.com/actions 里面。

既然 actions 是代码仓库，当然就有版本的概念，用户可以引用某个具体版本的 action。

下面都是合法的 action 引用，用的就是 Git 的指针概念，详见[官方文档](https://help.github.com/en/articles/about-actions#versioning-your-action)。

```
actions/setup-node@74bc508 # 指向一个 commit
actions/setup-node@v1.0    # 指向一个标签
actions/setup-node@master  # 指向一个分支
```

# 基本概念

GitHub Actions 有一些自己的术语。

（1）workflow （工作流程）：持续集成一次运行的过程，就是一个 workflow。

（2）job （任务）：一个 workflow 由一个或多个 jobs 构成，含义是一次持续集成的运行，可以完成多个任务。

（3）step（步骤）：每个 job 由多个 step 构成，一步步完成。

（4）action （动作）：每个 step 可以依次执行一个或多个命令（action）。

# 三、workflow 文件

GitHub Actions 的配置文件叫做 workflow 文件，存放在代码仓库的 `.github/workflows` 目录。

workflow 文件采用 YAML 格式，文件名可以任意取，但是后缀名统一为 `.yml`，比如foo.yml。

一个库可以有多个 workflow 文件。

GitHub 只要发现.github/workflows目录里面有.yml文件，就会自动运行该文件。

workflow 文件的配置字段非常多，详见[官方文档](https://help.github.com/en/articles/workflow-syntax-for-github-actions)。

下面是一些基本字段。

## name

name字段是 workflow 的名称。如果省略该字段，默认为当前 workflow 的文件名。

```yml
name: GitHub Actions Demo
```

## on

on字段指定触发 workflow 的条件，通常是某些事件。

```yml
on: push
```

上面代码指定，push事件触发 workflow。

on字段也可以是事件的数组。

```yml
on: [push, pull_request]
```

上面代码指定，push事件或pull_request事件都可以触发 workflow。

完整的事件列表，请查看[官方文档](https://help.github.com/en/articles/events-that-trigger-workflows)。

除了代码库事件，GitHub Actions 也支持外部事件触发，或者定时运行。

## `on.<push|pull_request>.<tags|branches>`

指定触发事件时，可以限定分支或标签。

```yml
on:
  push:
    branches:    
      - master
```

上面代码指定，只有master分支发生push事件时，才会触发 workflow。

## jobs.${job_id}.name

workflow 文件的主体是jobs字段，表示要执行的一项或多项任务。

jobs字段里面，需要写出每一项任务的job_id，具体名称自定义。job_id里面的name字段是任务的说明。

```yml
jobs:
  my_first_job:
    name: My first job
  my_second_job:
    name: My second job
```


上面代码的jobs字段包含两项任务，job_id分别是my_first_job和my_second_job。

## jobs.${job_id}.needs

needs字段指定当前任务的依赖关系，即运行顺序。

```yml
jobs:
  job1:
  job2:
    needs: job1
  job3:
    needs: [job1, job2]
```

上面代码中，job1必须先于job2完成，而job3等待job1和job2的完成才能运行。因此，这个 workflow 的运行顺序依次为：job1、job2、job3。

## jobs.${job_id}.runs-on

runs-on字段指定运行所需要的虚拟机环境。它是必填字段。目前可用的虚拟机如下。

```
ubuntu-latest，ubuntu-18.04或ubuntu-16.04
windows-latest，windows-2019或windows-2016
macOS-latest或macOS-10.14
```

下面代码指定虚拟机环境为ubuntu-18.04。

```
runs-on: ubuntu-18.04
```

## jobs.${job_id}.steps

steps字段指定每个 Job 的运行步骤，可以包含一个或多个步骤。

每个步骤都可以指定以下三个字段。

```
jobs.<job_id>.steps.name：步骤名称。
jobs.<job_id>.steps.run：该步骤运行的命令或者 action。
jobs.<job_id>.steps.env：该步骤所需的环境变量。
```

下面是一个完整的 workflow 文件的范例。

```yml
name: Greeting from Mona
on: push

jobs:
  my-job:
    name: My Job
    runs-on: ubuntu-latest
    steps:
    - name: Print a greeting
      env:
        MY_VAR: Hi there! My name is
        FIRST_NAME: Mona
        MIDDLE_NAME: The
        LAST_NAME: Octocat
      run: |
        echo $MY_VAR $FIRST_NAME $MIDDLE_NAME $LAST_NAME.
```

上面代码中，steps字段只包括一个步骤。该步骤先注入四个环境变量，然后执行一条 Bash 命令。

# 实例：React 项目发布到 GitHub Pages

下面是一个实例，通过 GitHub Actions 构建一个 React 项目，并发布到 GitHub Pages。

最终代码都在这个仓库里面，发布后的参考网址为 ruanyf.github.io/github-actions-demo。

## 1. 资格

第一步，GitHub Actions 目前还处在测试阶段，需要到这个网址申请测试资格。申请以后，可能需要几天才能通过。据说，2019年11月就会放开。

获得资格后，仓库顶部的菜单会出现Actions一项。

![actions](https://www.wangbase.com/blogimg/asset/201909/bg2019091106.jpg)

## 2. 构建秘钥

第二步，这个示例需要将构建成果发到 GitHub 仓库，因此需要 GitHub 密钥。

按照[官方文档](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)，生成一个密钥。

然后，将这个密钥储存到当前仓库的Settings/Secrets里面。

（1）生成 ACCESS_TOKEN

到 [https://github.com/settings/tokens](https://github.com/settings/tokens) 下面。

设置生成一个新的 ACCESS_TOKEN `gph_xxxx`

（2）设置

然后，将这个密钥储存到当前仓库的 [Settings/Secrets](https://github.com/houbb/idrag/settings/secrets/actions) 里面。

名字自己起，比如我定义为：IDRAG_ACCESS_TOKEN

## 3. 构建 React 应用

第三步，本地计算机使用create-react-app，生成一个标准的 React 应用。

```
$ npx create-react-app github-actions-demo
$ cd github-actions-demo
```

然后，打开package.json文件，加一个homepage字段，表示该应用发布后的根目录（参见 [官方文档](https://create-react-app.dev/docs/deployment/#building-for-relative-paths)）。

```
"homepage": "https://[username].github.io/github-actions-demo",
```

上面代码中，将 [username]替换成你的 GitHub 用户名，参见范例。

## 4. 编写 ci.yml

第四步，在这个仓库的 `.github/workflows` 目录，生成一个 workflow 文件，名字可以随便取，这个示例是 ci.yml。

我们选用一个别人已经写好的 `action：JamesIves/github-pages-deploy-action`，它提供了 workflow 的范例文件，直接拷贝过来就行了（查看源码）。

- ci.yml

```yml
name: GitHub Actions Build and Deploy
on:
  push:
    branches:
      - main
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2.3.1
        with:
          persist-credentials: false
      - name: Install and Build
        run: |
          npm install
          npm run-script build
      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@3.7.1
        with:
          GITHUB_TOKEN: ${{ secrets.IDRAG_ACCESS_TOKEN }}
          BRANCH: master
          FOLDER: dist
          CLEAN: true
          REPOSITORY_NAME: houbb/houbb.github.io
          TARGET_FOLDER: idrag
```

上面这个 workflow 文件的要点如下。

- 整个流程在master分支发生push事件时触发。

- 只有一个job，运行在虚拟机环境ubuntu-latest。

- 第一步是获取源码，使用的 action 是actions/checkout。

- 第二步是构建和部署，使用的 action 是JamesIves/github-pages-deploy-action。

- 第二步需要四个环境变量，分别为 GitHub 密钥、发布分支、构建成果所在目录、构建脚本。其中，只有 GitHub 密钥是秘密变量，需要写在双括号里面，其他三个都可以直接写在文件里。


### 指定 node 版本的例子

```yml
name: GitHub Actions Build and Deploy
on:
  push:
    branches:
      - main
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2.3.1
        with:
          persist-credentials: false
      - name: NODE 
        uses: actions/setup-node@v3
        with:
          node-version: 16
      - name: Install and Build
        run: |
          npm install
          npm run-script build
      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@3.7.1
        with:
          GITHUB_TOKEN: ${{ secrets.GO_ACCESS_TOKEN }}
          BRANCH: master
          FOLDER: dist
          CLEAN: true
          REPOSITORY_NAME: houbb/houbb.github.io
          TARGET_FOLDER: games/gobang
```

## 5. 第五步，保存上面的文件后，将整个仓库推送到 GitHub。

GitHub 发现了 workflow 文件以后，就会自动运行。

你可以在网站上实时查看运行日志，日志默认保存30天。

> [运行日志](https://github.com/houbb/idrag/actions/runs/3168776264)

## 6. 查看效果

运行结束以后，可以在线查看效果。

代码效果：https://github.com/houbb/houbb.github.io/tree/master/idrag

页面效果：[houbb.github.io/idrag](houbb.github.io/idrag)

# 参考资料

[github action GITHUB_TOKEN 的使用，不用添加秘钥直接提交到当前仓库](https://neucrack.com/p/385)

[GitHub Actions & GITHUB_TOKEN All In One](https://www.cnblogs.com/xgqfrms/p/16459487.html)

[GitHub Actions 入门教程](https://www.ruanyifeng.com/blog/2019/09/getting-started-with-github-actions.html)

* any list
{:toc}
