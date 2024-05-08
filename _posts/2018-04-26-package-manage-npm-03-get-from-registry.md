---
layout: post
title:  NPM-03-npm 从 registry 获取代码
date:  2018-04-24 22:22:23 +0800
categories: [NPM]
tags: [frontend, npm, npm]
published: true
---

# 搜索和选择要下载的包

您可以使用 npm 搜索栏查找要在项目中使用的包。 

npm search 使用 npms 和 npms 分析器； 有关两者的更多信息，请参阅 https://npms.io/about。

## 排名

包裹搜索排名标准

通常，有数十个甚至数百个具有相似名称和/或相似用途的包。 为了帮助您决定要探索的最佳包，我们使用 npms 分析器根据四个标准对每个包进行了排名：

人气

流行度表示软件包已被下载的次数。 这是其他人发现有用的软件包的有力指标。

质量

质量包括考虑因素，例如 README 文件的存在、稳定性、测试、最新的依赖项、自定义网站和代码复杂性。

保养

维护根据开发人员对软件包的关注程度对软件包进行排名。 例如，更频繁维护的包更有可能与当前或即将推出的 npm CLI 版本配合使用。

最优

Optimal 以一种有意义的方式将其他三个标准（流行度、质量、维护）组合成一个分数。

# 在本地下载和安装软件包

如果你想依赖你自己模块中的包，你可以在本地安装一个包，使用类似 Node.js require 的东西。 

这是 npm install 的默认行为。

## 安装无作用域的包

无作用域的包始终是公开的，这意味着任何人都可以搜索、下载和安装它们。 

要安装公共包，请在命令行上运行

```
npm install <package_name>
```

这将在您的当前目录中创建 node_modules 目录（如果尚不存在）并将包下载到该目录。

注意：如果本地目录下没有 package.json 文件，则安装最新版本的包。

如果有 package.json 文件，npm 会安装满足 package.json 中声明的 semver 规则的最新版本。

## 安装了一个作用域公共包

任何人都可以下载和安装作用域公共包，只要在安装过程中引用作用域名称：

```
npm install @scope/package-name
```

## 安装私有包

私有包只能由获得包读取权限的人下载和安装。 

由于私有包总是有作用域的，您必须在安装过程中引用作用域名称：

```
npm install @scope/private-package-name
```

## 测试包安装

要确认 npm install 正常工作，请在您的模块目录中检查 node_modules 目录是否存在，并且它包含您安装的软件包的目录：

```
ls node_modules
```

## 安装包版本

如果运行 npm install 的目录中有 package.json 文件，则 npm 安装满足 package.json 中声明的语义版本控制规则的最新版本的包。

如果没有 package.json 文件，则安装最新版本的包。

## Installing a package with dist-tags

和 npm publish 一样， `npm install <package_name>` 默认会使用 latest 标签。

要覆盖此行为，请使用 `npm install <package_name>@<tag>`。 

例如，要在标记为 beta 的版本上安装 example-package，您将运行以下命令：

```
npm install example-package@beta
```

# 全局下载和安装软件包

提示：如果您使用的是 npm 5.2 或更高版本，我们建议您使用 npx 来全局运行包。

全局安装包允许您将包中的代码用作本地计算机上的一组工具。

要全局下载和安装软件包，请在命令行上运行以下命令：

```
npm install -g <package_name>
```

如果您收到 EACCES 权限错误，您可能需要使用版本管理器重新安装 npm 或手动更改 npm 的默认目录。 

有关详细信息，请参阅“[在全局安装软件包时解决 EACCES 权限错误](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)”。


# 更新从注册表下载的包

更新您从注册表下载的本地和全局包有助于保持您的代码和工具稳定、可用和安全。

## 更新本地包

我们建议定期更新您的项目所依赖的本地包以改进您的代码，因为对其依赖项进行了改进。

（1）导航到项目的根目录并确保它包含 package.json 文件：

```
cd /path/to/project
```

（2）在您的项目根目录中，运行

```
npm update
```

（3）要测试更新，请运行过时的命令。 不应该有任何输出。

```
npm outdated
```

## 更新全局安装的包

注意：如果您使用的是 npm 2.6.0 或更低版本，请运行此脚本以更新所有过时的全局包。

但是，请考虑升级到最新版本的 npm：

```
npm install npm@latest -g
```

### 确定哪些全局包需要更新

要查看需要更新哪些全局包，请在命令行上运行：

```
npm outdated -g --depth=0
```

### 更新单个全局包

要更新单个全局包，请在命令行上运行：

```
npm update -g <package_name>
```

### 更新所有全局安装的包

要更新所有全局包，请在命令行上运行：

```
npm update -g
```

# 在项目中使用 npm 包

在 node_modules 中安装软件包后，您可以在代码中使用它。

## 在您的项目中使用无作用域的包

### Node.js 模块

如果您正在创建 Node.js 模块，则可以通过将其作为参数传递给 require 函数来使用模块中的包。

```js
var lodash = require('lodash');

var output = lodash.without([1, 2, 3], 1);
console.log(output);
```

### package.json 文件

在 package.json 中，列出依赖项下的包。 

您可以选择包含语义版本。

```json
{
  "dependencies": {
    "@package_name": "^1.0.0"
  }
}
```

## 在项目中使用作用域包

要使用作用域包，只需在使用包名称的任何地方包含作用域。

### Node.js module

```js
var projectName = require("@scope/package-name")
```

- package.json file

```json
{
  "dependencies": {
    "@scope/package_name": "^1.0.0"
  }
}
```

## 解决“找不到模块”错误

如果你没有正确安装一个包，当你尝试在你的代码中使用它时你会收到一个错误。 

例如，如果您引用 lodash 包而不安装它，您将看到以下错误：

```
module.js:340
    throw err;
          ^
Error: Cannot find module 'lodash'
```

对于作用域包，运行 `npm install <@scope/package_name>`

对于无作用域的包，运行 `npm install <package_name>`

# 使用已弃用的软件包

如果您安装了一个软件包，并显示了一条弃用消息，我们建议您尽可能按照说明进行操作。

这可能意味着更新到新版本，或更新您的包依赖项。

弃用消息并不总是意味着包或版本不可用； 这可能意味着该软件包未得到维护并且将不再由发布者更新。

# 卸载软件包和依赖项

如果您不再需要在代码中使用某个包，我们建议您卸载它并将其从项目的依赖项中删除。

## 卸载本地包

### 从 node_modules 目录中删除本地包

要从 node_modules 目录中删除包，请在命令行上使用卸载命令。 

如果包有范围，则包括范围。

- Unscoped package

```
npm uninstall <package_name>
```

- Scoped package

```
npm uninstall <@scope/package_name>
```

### 从 package.json 依赖项中删除本地包

要从 package.json 中的依赖项中删除包，请使用 --save 标志。 

如果包有范围，则包括范围。

- Unscoped package

```
npm uninstall --save <package_name>
```

-- Scoped package

```
npm uninstall --save <@scope/package_name>
```

## 卸载全局包

要卸载无作用域的全局包，请在命令行上使用带 -g 标志的卸载命令。 

如果包有范围，则包括范围。

- Unscoped package

```
npm uninstall -g <package_name>
```

- Scoped package

```
npm uninstall -g <@scope/package_name>
```

# TODO

可以和 CI/CD Docker 等持续集成。

# 参考资料

[about-npm](https://docs.npmjs.com/about-npm)

* any list
{:toc}







