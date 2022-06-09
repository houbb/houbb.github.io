---
layout: post
title: uniapp 教程-17-app nvue NativeJS
date: 2021-11-15 21:01:55 +0800
categories: [WEB]
tags: [web, cross-plateform, uni-app, sh]
published: true
---

# 概述

Native.js技术，简称NJS，是一种将手机操作系统的原生对象转义，映射为JS对象，在JS里编写原生代码的技术。 

如果说Node.js把js扩展到服务器世界，那么Native.js则把js扩展到手机App的原生世界。 

HTML/JS/Css全部语法只有7万多，而原生语法有几十万，Native.js大幅提升了HTML5的能力。 

NJS突破了浏览器的功能限制，也不再需要像Hybrid那样由原生语言开发插件才能补足浏览器欠缺的功能。 

NJS编写的代码，最终需要在HBuilder里打包发行为App安装包，或者在支持Native.js技术的浏览器里运行。目前Native.js技术不能在普通手机浏览器里直接运行。

NJS大幅扩展了HTML5的能力范围，原本只有原生或Hybrid App的原生插件才能实现的功能如今可以使用JS实现。

NJS大幅提升了App开发效率，将iOS、Android、Web的3个工程师组队才能完成的App，变为1个web工程师就搞定。

NJS不再需要配置原生开发和编译环境，调试、打包均在HBuilder里进行。没有mac和xcode一样可以开发iOS应用。

如果不熟悉原生API也没关系，我们汇总了很多NJS的代码示例，复制粘贴就可以用。

http://ask.dcloud.net.cn/article/114(opens new window)

再次强调，Native.js不是一个js库，不需要下载引入到页面的script中，也不像nodejs那样有单独的运行环境，Native.js的运行环境是集成在5+runtime里的，使用HBuilder打包的app或流应用都可以直接使用Native.js。

## 注意事项：

Uni-app不支Native.js执行UI相关操作的API调用及webview相关API调用。将失效无法正常使用。Uni-app不推荐使用Native.js

## 技术要求

由于NJS是直接调用Native API，需要对Native API有一定了解，知道所需要的功能调用了哪些原生API，能看懂原生代码并参考原生代码修改为JS代码。 

否则只能直接copy别人写好的NJS代码。

# 开始使用

TODO....

# 参考资料

https://uniapp.dcloud.net.cn/tutorial/native-js.html#%E6%A6%82%E8%BF%B0

* any list
{:toc}
