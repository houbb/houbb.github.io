---
layout: post
title: VUE3-53-vue 使用 fontawesome
date: 2021-08-02 21:01:55 +0800
categories: [VUE]
tags: [vue, hello-world, vue-learn, sh]
published: true
---

# 说明

一开始想使用 element-ui 中的 icon 来解决问题，后来发现没有 e-mail 之类的图标。

于是，决定引入一下 font-awesome。

# 引入方式

1、在项目中安装 fontawesome：

```
npm install font-awesome --save
```

会在 package.json 中引入 

```json
"dependencies": {
    "axios": "^0.19.2",
    "core-js": "^3.6.4",
    "element-ui": "^2.15.5",
    "font-awesome": "^4.7.0",
},
```

2、在 main.js 中引入相关的文件：

```js
import 'font-awesome/css/font-awesome.min.css'
```

3、在需要使用的地方，`class="fa 类名"`，请注意一定要在前面添加 fa 类，否则无法正常显示；

官网：[https://fontawesome.com/](https://fontawesome.com/)

v4.7: https://fontawesome.com/v4.7/icons/



# 参考资料

[Vue项目中使用FontAwesome](https://blog.csdn.net/u013840388/article/details/108293432)

* any list
{:toc}