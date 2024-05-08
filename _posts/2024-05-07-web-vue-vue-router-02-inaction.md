---
layout: post
title: Vue Router-02-实战测试解决报错 npm ERR! Unsupported URL Type "workspace:" workspace:*
date: 2024-05-07 21:01:55 +0800
categories: [Web]
tags: [web, vue, vue-router, sh]
published: true
---

# 入门例子

https://github.com/vuejs/router/tree/main/packages/playground

我们下载到本地，进入到 playground 的目录。

然后 vite 直接启动。

文件列表如下：

```
│  env.d.ts
│  index.html
│  package.json
│  tsconfig.config.json
│  tsconfig.json
│  vite.config.ts
│
└─src
    │  App.vue
    │  AppLink.vue
    │  main.ts
    │  router.ts
    │  scrollWaiter.ts
    │  store.ts
    │
    ├─api
    │      index.ts
    │
    └─views
            ComponentWithData.vue
            Dynamic.vue
            Generic.vue
            GuardedWithLeave.vue
            Home.vue
            LongView.vue
            Nested.vue
            NestedWithId.vue
            NotFound.vue
            RepeatedParams.vue
            User.vue
```

启动

```sh
npm install
```

报错：

```
D:\js\vue-router\router\packages\playground>npm install
npm ERR! code EUNSUPPORTEDPROTOCOL
npm ERR! Unsupported URL Type "workspace:": workspace:*

npm ERR! A complete log of this run can be found in: C:\Users\dh\AppData\Local\npm-cache\_logs\2024-05-08T08_03_36_770Z-debug-0.log
```


## stackoverflow

https://stackoverflow.com/questions/69220042/npm-err-unsupported-url-type-workspace-workspace

[npm install初始化出现问题： npm ERR! Unsupported URL Type "workspace:": workspace:*](https://www.cnblogs.com/Qqhx/p/16994605.html)


## 尝试1：更新 npm 版本

现在：

```sh
>node -v
v20.10.0
```

更新

```sh
npm install -g npm@latest
```

确认：

```
>npm -v
10.7.0
```

还是会报错，报错信息不变。

### chat 原因 2

这个错误表明 npm 遇到了不支持的 URL 类型 "workspace:"，可能是由于项目中使用了 npm Workspaces 功能导致的。

这种情况下，npm Workspaces 允许你在一个父项目中管理多个子项目，但某些情况下可能导致依赖安装问题。

要解决这个问题，你可以尝试以下几种方法：

1. **清除 npm 缓存**：有时候缓存中的某些文件可能会导致问题。你可以尝试清除 npm 缓存，然后重新安装依赖：

   ```
   npm cache clean --force
   ```

尝试，依然报错，且错误不变。

2. **使用 Yarn 安装**：尝试使用 Yarn 而不是 npm 来安装依赖。Yarn 有时候对于特定的依赖关系处理会更好一些：

   ```
   yarn install
   ```

3. **手动安装依赖**：如果上述方法都不起作用，你可以尝试手动安装依赖。首先，检查项目的 `package.json` 文件，找到 `dependencies` 和 `devDependencies` 字段，然后手动安装其中列出的所有依赖项：

   ```
   npm install <dependency1> <dependency2> ...
   ```

   请确保你按照正确的顺序安装所有的依赖项。

4. **检查 npm 版本**：确保你正在使用的 npm 版本是最新的。你可以通过运行 `npm -v` 命令来检查当前安装的 npm 版本，并在需要时更新到最新版本。

如果你仍然遇到问题，请提供更多的信息，例如项目中的 `package.json` 文件内容以及任何其他可能有助于诊断问题的细节。



## 尝试2：改为使用 yarn

```
>yarn -v
1.22.21
```

本机已经安装了，如果没有安装：

```sh
npm install -g yarn
```

yarn 安装

```
yarn install
```

报错：

```
D:\js\vue-router\router\packages\playground>yarn install
error This project's package.json defines "packageManager": "yarn@pnpm@8.15.3". However the current global version of Yarn is 1.22.21.

Presence of the "packageManager" field indicates that the project is meant to be used with Corepack, a tool included by default with all official Node.js distributions starting from 16.9 and 14.19.
Corepack must currently be enabled by running corepack enable in your terminal. For more information, check out https://yarnpkg.com/corepack.
```

### chat 原因

这个错误表明项目中的 `package.json` 文件定义了 `packageManager` 为 `"yarn@pnpm@8.15.3"`，但当前全局安装的 Yarn 版本是 1.22.21，导致了冲突。

要解决这个问题，你可以按照以下步骤操作：

1. **启用 Corepack**：按照错误提示，在终端中运行 `corepack enable` 命令来启用 Corepack，以支持当前项目。这会让项目使用 Corepack 来处理依赖管理。

2. **更新项目配置**：如果你希望项目继续使用 Yarn 而不是 Corepack，你可以编辑项目中的 `package.json` 文件，将 `packageManager` 字段修改为匹配你全局 Yarn 版本的值。在这种情况下，将其修改为 `"yarn@1.22.21"`。

3. **安装指定版本的 Yarn**：如果你不想使用 Corepack，并且希望项目继续使用 Yarn，你可以在本地安装与项目配置相匹配的 Yarn 版本。你可以使用 npm 或者 Yarn 来安装特定版本的 Yarn。例如，运行以下命令来安装 8.15.3 版本的 Yarn：

   ```
   npm install yarn@8.15.3
   ```

   或者使用 Yarn：

   ```
   yarn add yarn@8.15.3
   ```

选择适合你需求的方法来解决问题。

### 再次验证

```
>corepack enable
Internal Error: EPERM: operation not permitted, open 'D:\Program Files\nodejs\pnpm'
Error: EPERM: operation not permitted, open 'D:\Program Files\nodejs\pnpm'
```

权限问题，我们以管理员启动命令行。

```sh
d:
cd D:\js\vue-router\router\packages\playground 
```

再次执行就正常了。

再次执行，报错：

```
>yarn install
Usage Error: This project is configured to use pnpm

$ yarn ...
```

## 尝试3：pnpm install

因为上面的报错，我们来尝试一下 pnpm

### chat 原因

这个错误表明项目当前配置为使用 pnpm，而不是常规的 Yarn。

因此，你在尝试运行 `yarn install` 时会得到此错误。

要解决这个问题，你有几个选项：

1. **使用 pnpm 安装依赖**：根据项目的配置，你应该使用 pnpm 来安装依赖，而不是 Yarn。你可以运行以下命令来安装依赖：

   ```
   pnpm install
   ```

   这将使用 pnpm 来安装项目所需的依赖项。

2. **切换为 Yarn**：如果你想使用 Yarn 而不是 pnpm，你需要修改项目的配置。你可以编辑项目中的 `package.json` 文件，将 `packageManager` 字段设置为 `"yarn"`，然后再运行 `yarn install` 命令。

3. **全局安装 Yarn**：如果你选择切换为 Yarn，并且项目中未指定具体版本的 Yarn，你需要先在全局安装 Yarn。你可以使用以下命令来全局安装 Yarn：

   ```
   npm install -g yarn
   ```

   安装完成后，你可以按照第二个选项中的步骤来修改项目配置并安装依赖。

选择适合你情况的选项来解决问题。 

### 实战验证

```
pnpm install
```

日志：

```
>pnpm install
Scope: all 4 workspace projects
../..                                    | +920 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

   ╭─────────────────────────────────────────────────────────────────╮
   │                                                                 │
   │                Update available! 8.15.3 → 9.1.0.                │
   │   Changelog: https://github.com/pnpm/pnpm/releases/tag/v9.1.0   │
   │     Run "corepack prepare pnpm@9.1.0 --activate" to update.     │
   │                                                                 │
   │     Follow @pnpmjs for updates: https://twitter.com/pnpmjs      │
   │                                                                 │
   ╰─────────────────────────────────────────────────────────────────╯

Downloading registry.npmmirror.com/typescript/5.3.3: 5.76 MB/5.76 MB, done
../..                                    | Progress: resolved 920, reused 0, downloaded 920, added 920, done
../../node_modules/.pnpm/yorkie@2.0.0/node_modules/yorkie: Running install script, done in 146ms
../../node_modules/.pnpm/vue-demi@0.14.7_vue@3.4.23/node_modules/vue-demi: Running postinstall script, done in 197ms
../../node_modules/.pnpm/geckodriver@3.2.0/node_modules/geckodriver: Running postinstall script...
```



# chat

## pnpm 是什么？和 npm 有什么区别？

pnpm 是一个 JavaScript 项目的包管理器，类似于 npm 和 Yarn。它允许你管理项目的依赖项，安装、更新和删除依赖，并提供一致的开发环境。

与 npm 和 Yarn 不同，pnpm 使用一种称为“符号链接依赖”的技术来管理依赖项。这意味着当你安装一个依赖项时，它不会在每个项目中创建独立的拷贝，而是将其保存在一个共享的存储库中，并使用符号链接将它们链接到每个项目的 `node_modules` 目录。这种方法可以节省磁盘空间，并提高依赖项的安装速度。

下面是一些 pnpm 与 npm 的主要区别：

1. **符号链接依赖**：pnpm 使用符号链接来共享依赖项，而不是在每个项目中复制依赖项的拷贝。这可以减少磁盘空间的占用，并提高依赖项的安装速度。

2. **并行安装**：pnpm 具有更好的并行安装能力，可以更快地安装项目的依赖项。

3. **版本控制**：pnpm 使用一个单一的版本控制文件来跟踪每个依赖项的版本，而不是像 npm 那样在每个项目中维护一个完整的依赖树。这使得版本控制更加简洁。

4. **缓存管理**：pnpm 有一个集中的缓存位置，用于存储下载的依赖项，而不是像 npm 那样在每个项目中维护一个缓存目录。这有助于节省磁盘空间并提高性能。

总的来说，pnpm 提供了一种更加高效和节省空间的方式来管理 JavaScript 项目的依赖项，尤其是对于拥有多个项目的开发者来说。

# 参考资料

https://github.com/jekip/naive-ui-admin

* any list
{:toc}
