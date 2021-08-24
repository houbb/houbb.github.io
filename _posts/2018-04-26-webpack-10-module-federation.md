---
layout: post
title:  WebPack-10-module-federation
date:  2018-04-23 21:59:43 +0800
categories: [WebPack]
tags: [js, webpack]
published: true
---

# Module Federation

## 动机

多个独立的构建可以组成一个应用程序，这些独立的构建之间不应该存在依赖关系，因此可以单独开发和部署它们。

这通常被称作微前端，但并不仅限于此。


# 底层概念

我们区分本地模块和远程模块。本地模块即为普通模块，是当前构建的一部分。远程模块不属于当前构建，并在运行时从所谓的容器加载。

加载远程模块被认为是异步操作。当使用远程模块时，这些异步操作将被放置在远程模块和入口之间的下一个 chunk 的加载操作中。如果没有 chunk 加载操作，就不能使用远程模块。

chunk 的加载操作通常是通过调用 import() 实现的，但也支持像 require.ensure 或 require([...]) 之类的旧语法。

容器是由容器入口创建的，该入口暴露了对特定模块的异步访问。暴露的访问分为两个步骤：

1. 加载模块（异步的）

2. 执行模块（同步的）

步骤 1 将在 chunk 加载期间完成。步骤 2 将在与其他（本地和远程）的模块交错执行期间完成。这样一来，执行顺序不受模块从本地转换为远程或从远程转为本地的影响。

容器可以嵌套使用，容器可以使用来自其他容器的模块。容器之间也可以循环依赖。

# 高级概念

每个构建都充当一个容器，也可将其他构建作为容器。通过这种方式，每个构建都能够通过从对应容器中加载模块来访问其他容器暴露出来的模块。

共享模块是指既可重写的又可作为向嵌套容器提供重写的模块。它们通常指向每个构建中的相同模块，例如相同的库。

packageName 选项允许通过设置包名来查找所需的版本。默认情况下，它会自动推断模块请求，当想禁用自动推断时，请将 requiredVersion 设置为 false 。

# 构建块(Building blocks)

## ContainerPlugin (底层 API)

该插件使用指定的公开模块来创建一个额外的容器入口。

## ContainerReferencePlugin (底层 API)

该插件将特定的引用添加到作为外部资源（externals）的容器中，并允许从这些容器中导入远程模块。它还会调用这些容器的 override API 来为它们提供重载。本地的重载（当构建也是一个容器时，通过 __webpack_override__ 或 override API）和指定的重载被提供给所有引用的容器。

## ModuleFederationPlugin （高级 API）

ModuleFederationPlugin 组合了 ContainerPlugin 和 ContainerReferencePlugin。

# 概念目标

- 它既可以暴露，又可以使用 webpack 支持的任何模块类型

- 代码块加载应该并行加载所需的所有内容(web:到服务器的单次往返)

- 从使用者到容器的控制

重写模块是一种单向操作

同级容器不能重写彼此的模块。

- 概念适用于独立于环境

可用于 web、Node.js 等

- 共享中的相对和绝对请求

会一直提供，即使不使用

会将相对路径解析到 config.context

默认不会使用 requiredVersion

- 共享中的模块请求

只在使用时提供

会匹配构建中所有使用的相等模块请求

将提供所有匹配模块

将从图中这个位置的 package.json 提取 requiredVersion

当你有嵌套的 node_modules 时，可以提供和使用多个不同的版本

- 共享中尾部带有 /  的模块请求将匹配所有具有这个前缀的模块请求

# 用例

## 每个页面单独构建

单页应用的每个页面都是在单独的构建中从容器暴露出来的。

主体应用程序(application shell)也是独立构建，会将所有页面作为远程模块来引用。

通过这种方式，可以单独部署每个页面。在更新路由或添加新路由时部署主体应用程序。主体应用程序将常用库定义为共享模块，以避免在页面构建中出现重复。

## 将组件库作为容器

许多应用程序共享一个通用的组件库，可以将其构建成暴露所有组件的容器。

每个应用程序使用来自组件库容器的组件。可以单独部署对组件库的更改，而不需要重新部署所有应用程序。

应用程序自动使用组件库的最新版本。

# 动态远程容器

该容器接口支持 get  和 init 方法。 

init 是一个兼容 async 的方法，调用时，只含有一个参数：共享作用域对象(shared scope object)。此对象在远程容器中用作共享作用域，并由 host 提供的模块填充。 

可以利用它在运行时动态地将远程容器连接到 host 容器。

- init.js

```js
(async () => {
  // 初始化共享作用域（shared scope）用提供的已知此构建和所有远程的模块填充它
  await __webpack_init_sharing__('default');
  const container = window.someContainer; // 或从其他地方获取容器
  // 初始化容器 它可能提供共享模块
  await container.init(__webpack_share_scopes__.default);
  const module = await container.get('./module');
})();
```

容器尝试提供共享模块，但是如果共享模块已经被使用，则会发出警告，并忽略所提供的共享模块。容器仍能将其作为降级模块。

你可以通过动态加载的方式，提供一个共享模块的不同版本，从而实现 A/B 测试。

## 例子：

- init.js

```js
function loadComponent(scope, module) {
  return async () => {
    // 初始化共享作用域（shared scope）用提供的已知此构建和所有远程的模块填充它
    await __webpack_init_sharing__('default');
    const container = window[scope]; // 或从其他地方获取容器
    // 初始化容器 它可能提供共享模块
    await container.init(__webpack_share_scopes__.default);
    const factory = await window[scope].get(module);
    const Module = factory();
    return Module;
  };
}

loadComponent('abtests', 'test123');
```

# 基于 Promise 的动态 Remote

一般来说，remote 是使用 URL 配置的，示例如下：

```js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        app1: 'app1@http://localhost:3001/remoteEntry.js',
      },
    }),
  ],
};
```

但是你也可以向 remote 传递一个 promise，其会在运行时被调用。你应该用任何符合上面描述的 get/init 接口的模块来调用这个 promise。

例如，如果你想传递你应该使用哪个版本的联邦模块，你可以通过一个查询参数做以下事情：

```js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        app1: `promise new Promise(resolve => {
      const urlParams = new URLSearchParams(window.location.search)
      const version = urlParams.get('app1VersionParam')
      // This part depends on how you plan on hosting and versioning your federated modules
      const remoteUrlWithVersion = 'http://localhost:3001/' + version + '/remoteEntry.js'
      const script = document.createElement('script')
      script.src = remoteUrlWithVersion
      script.onload = () => {
        // the injected script has loaded and is available on window
        // we can now resolve this Promise
        const proxy = {
          get: (request) => window.app1.get(request),
          init: (arg) => {
            try {
              return window.app1.init(arg)
            } catch(e) {
              console.log('remote container already initialized')
            }
          }
        }
        resolve(proxy)
      }
      // inject this script with the src set to the versioned remoteEntry.js
      document.head.appendChild(script);
    })
    `,
      },
      // ...
    }),
  ],
};
```

请注意当使用该 API 时，你 必须 resolve 一个包含 get/init API 的对象

# 动态 Public Path

## 设置

提供一个 host api 以设置 publicPath $#offerahostapitosetthepublicPath$

可以允许 host 在运行时通过公开远程模块的方法来设置远程模块的 publicPath。

当你在 host 域的子路径上挂载独立部署的子应用程序时，这种方法特别有用。

场景：

你在 https://my-host.com/app/* 上有一个 host 应用，并且在 https://foo-app.com 上有一个子应用。子应用程序也挂载在 host 域上, 因此， https://foo-app.com is expected to be accessible via https://my-host.com/app/foo-app and https://my-host.com/app/foo/* requests are redirected to https://foo-app.com/* via a proxy.

## 示例：

- webpack.config.js (remote)

```js
module.exports = {
  entry: {
    remote: './public-path',
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'remote', // 该名称必须与入口名称相匹配
      exposes: ['./public-path'],
      // ...
    }),
  ],
};
```

- public-path.js (remote)

```js
export function set(value) {
  __webpack_public_path__ = value;
}
```

- src/index.js (host)

```js
const publicPath = await import('remote/public-path');
publicPath.set('/your-public-path');

//boostrap app  e.g. import('./boostrap.js')
```

## Infer publicPath from script

One could infer the publicPath from the script tag from document.currentScript.src and set it with the `__webpack_public_path__` module variable at runtime.

示例：

- webpack.config.js (remote)

```js
module.exports = {
  entry: {
    remote: './setup-public-path',
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'remote', // 该名称必须与入口名称相匹配
      // ...
    }),
  ],
};
```

- setup-public-path.js (remote)

```js
// 使用你自己的逻辑派生 publicPath，并使用 __webpack_public_path__ API 设置它
__webpack_public_path__ = document.currentScript.src + '/../';
```

# 故障排除

## Uncaught Error: 

```
Shared module is not available for eager consumption
```

应用程序正急切地执行一个作为全局主机运行的应用程序。有如下选项可供选择:

你可以在模块联邦的高级 API 中将依赖设置为即时依赖，此 API 不会将模块放在异步 chunk 中，而是同步地提供它们。这使得我们在初始块中可以直接使用这些共享模块。但是要注意，由于所有提供的和降级模块是要异步下载的，因此，建议只在应用程序的某个地方提供它，例如 shell。

我们强烈建议使用异步边界(asynchronous boundary)。它将把初始化代码分割成更大的块，以避免任何额外的开销，以提高总体性能。

例如，你的入口看起来是这样的：

- index.js

```js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
ReactDOM.render(<App />, document.getElementById('root'));
```

让我们创建 bootstrap.js 文件，并将入口文件的内容放到里面，然后将 bootstrap 引入到入口文件中:

- index.js

```js
+ import('./bootstrap');
- import React from 'react';
- import ReactDOM from 'react-dom';
- import App from './App';
- ReactDOM.render(<App />, document.getElementById('root'));
```

- bootstrap.js

```js
+ import React from 'react';
+ import ReactDOM from 'react-dom';
+ import App from './App';
+ ReactDOM.render(<App />, document.getElementById('root'));
```

这种方法有效，但存在局限性或缺点。

通过 ModuleFederationPlugin  将依赖的 eager 属性设置为 true

- webpack.config.js

```js
// ...
new ModuleFederationPlugin({
  shared: {
    ...deps,
    react: {
      eager: true,
    },
  },
});
```

## Uncaught Error: Module "./Button" does not exist in container.

错误提示中可能不会显示 "./Button"，但是信息看起来差不多。这个问题通常会出现在将 webpack beta.16 升级到 webpack beta.17 中。

在 ModuleFederationPlugin 里，更改 exposes:

```js
new ModuleFederationPlugin({
  exposes: {
-   'Button': './src/Button'
+   './Button':'./src/Button'
  }
});
```

## Uncaught TypeError: fn is not a function

此处错误可能是丢失了远程容器，请确保在使用前添加它。 如果已为试图使用远程服务器的容器加载了容器，但仍然看到此错误，则需将主机容器的远程容器文件也添加到 HTML 中。

## 来自多个 remote 的模块之间的冲突

如果你想从不同的 remote 中加载多个模块，建议为你的远程构建设置 output.uniqueName 以避免多个 webpack 运行时之间的冲突。 

If you're going to load multiple modules from different remotes, it's advised to set the output.uniqueName option for your remote builds to avoid collisions between multiple webpack runtimes.

# 参考资料

https://webpack.docschina.org/concepts/module-federation/

* any list
{:toc}