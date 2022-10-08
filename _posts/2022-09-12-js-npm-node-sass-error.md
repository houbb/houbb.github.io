---
layout: post
title:  Node Sass does not yet support your current environment Windows 64-bit with Unsupported runtime 报错问题解决办法
date:  2022-10-01 09:22:02 +0800
categories: [JS]
tags: [js, error, npm, sh]
published: true
---

# 报错：

```
Node Sass does not yet support your current environment Windows 64-bit with Unsupported runtime 
```

从报错的信息可以很容易推断出是【node-sass】插件不支持当前环境，所以解决办法就是删掉原来不支持本机的【node-sass】插件，然后再重新安装支持的【node-sass】插件就行了。

删除【node-sass】插件：

```
cnpm uninstall --save node-sass
```

安装【node-sass】插件：

```
cnpm install --save node-sass
```

如果删除的命令报错则可以跳过删除，直接安装即可。

ps: cnpm 如果没有，使用 npm。

# 参考资料

[npm报错Can‘t find Python executable “python“, you can set the PYTHON env variable.](https://blog.csdn.net/u012069313/article/details/122734723)

https://blog.csdn.net/hzxOnlineOk/article/details/78284161

https://blog.csdn.net/gxgalaxy/article/details/105200828

* any list
{:toc}