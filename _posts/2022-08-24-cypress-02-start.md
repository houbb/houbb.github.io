---
layout: post
title:  前端端到端测试 cypress-02-start 入门使用
date:  2022-08-24 09:22:02 +0800
categories: [Project]
tags: [project, web, test, e2e, sh]
published: true
---

# install

```
npm install cypress --save-dev
```

这将在本地安装柏树作为您项目的DEV依赖性。

确保您已经运行了npm init或在项目根部具有node_modules文件夹或package.json文件，以确保在正确的目录中安装柏树。

请注意，柏树NPM软件包是柏树二进制的包装纸。 

NPM软件包的版本确定了二进制下载的版本。 

从3.0版开始，将二进制文件下载到全局高速缓存目录中，以在各个项目中使用。

系统代理属性http_proxy，https_proxy和no_proxy被尊重用于下载柏树二进制。 

您还可以使用NPM属性NPM_Config_proxy和NPM_Config_https_proxy。 

这些具有较低的优先级，因此仅当解决系统属性不使用代理时才使用它们。

## 最佳实践

推荐的方法是使用NPM安装柏树，因为：

- 柏树像其他任何依赖性一样被版本化。

- 它简化了连续集成中的柏树。


# 打开 app

## cypress open

现在，您可以从项目root打开柏树以下方式之一：

使用NPX

注意：NPM> V5.2包含NPX或可以单独安装。

```
npx cypress open
```

The long way with the full path

```
./node_modules/.bin/cypress open
```

Or with the shortcut using npm bin

```
$(npm bin)/cypress open
```

After a moment, the Cypress Launchpad will open.


# 添加NPM脚本

虽然每次将柏树的完整途径写出通往柏树的完整路径并没有错，但是将柏树命令添加到package.json文件中的脚本字段中要容易得多，更清晰。

```js
{
  "scripts": {
    "cypress:open": "cypress open"
  }
}
```

Now you can invoke the command from your project root like so:

```
npm run cypress:open
```






# 参考资料

https://docs.cypress.io/guides/getting-started/installing-cypress#npm-install

* any list
{:toc}