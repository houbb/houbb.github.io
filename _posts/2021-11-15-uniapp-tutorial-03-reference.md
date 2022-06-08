---
layout: post
title: uniapp 教程-03-reference 引用
date: 2021-11-15 21:01:55 +0800
categories: [WEB]
tags: [web, cross-plateform, uni-app, sh]
published: true
---
 

# 引用组件

传统vue项目开发，引用组件需要导入 - 注册 - 使用三个步骤，如下：

```vue
<template>
	<view>
		<uni-rate text="1"></uni-rate>
	</view>
</template>

<script>
	//1.import
	import uniRate from '@component/uni-rate/uni-rate.vue';
	export default {
		components: {
			uniRate	//2. 注册
		}
	};
</script>
```

Vue 3.x 增加了script setup 特性，将三步优化为两步，无需注册步骤，更为简洁：

```vue
<template>
	<view>
		<uni-rate text="1"></uni-rate>
	</view>
</template>

<script setup>
	//1.import
	import uniRate from '@component/uni-rate/uni-rate.vue';
</script>
```

uni-app 的 easycom 机制，将组件引用进一步优化，开发者只管使用，无需考虑导入和注册，更为高效：

```vue
<template>
	<view>
		<uni-rate text="1"></uni-rate>
	</view>
</template>
```

在 uni-app 项目中，页面引用组件和组件引用组件的方式都是一样的（可以理解为：页面是一种特殊的组件），均支持通过 easycom 方式直接引用。

easycom 规范详细介绍，参考：[easycom](https://uniapp.dcloud.net.cn/collocation/pages.html#easycom)

# js 文件引入

js文件或script标签内（包括 renderjs 等）引入js文件时，可以使用相对路径和绝对路径，形式如下

```js
// 绝对路径，@指向项目根目录，在cli项目中@指向src目录
import add from '@/common/add.js';

// 相对路径
import add from '../../common/add.js';
```

- 注意

js 文件不支持使用 `/` 开头的方式引入

## NPM 支持

ni-app支持使用npm安装第三方包。

此文档要求开发者们对npm有一定的了解，因此不会再去介绍npm的基本功能。

如若之前未接触过npm，请翻阅NPM官方文档 (opens new window)进行学习。

### 初始化 npm 工程

若项目之前未使用npm管理依赖（项目根目录下无package.json文件），先在项目根目录执行命令初始化npm工程：

```
npm init -y
```

cli项目默认已经有package.json了。HBuilderX创建的项目默认没有，需要通过初始化命令来创建。

### 安装依赖

在项目根目录执行命令安装npm包：

```
npm install packageName --save
```

### 使用

安装完即可使用npm包，js中引入npm包：

```js
import package from 'packageName'
const package = require('packageName')
```

### 注意

为多端兼容考虑，建议优先从 uni-app插件市场 (opens new window)获取插件。

直接从 npm 下载库很容易只兼容H5端。

非 H5 端不支持使用含有 dom、window 等操作的 vue 组件和 js 模块，安装的模块及其依赖的模块使用的 API 必须是 uni-app 已有的 API（兼容小程序 API），比如：支持高德地图微信小程序 SDK (opens new window)。

类似jQuery (opens new window)等库只能用于H5端。

node_modules 目录必须在项目根目录下。不管是cli项目还是HBuilderX创建的项目。

关于ui库的获取，详见多端UI库

# 引用 css

使用 `@import` 语句可以导入外联样式表，`@import` 后跟需要导入的外联样式表的相对路径，用 `;` 表示语句结束。

示例代码：

```html
<style>
    @import "../../common/uni.css";

    .uni-card {
        box-shadow: none;
    }
</style>
```

# 引入静态资源

## 模板内引入静态资源

template内引入静态资源，如image、video等标签的src属性时，可以使用相对路径或者绝对路径，形式如下

```xml
<!-- 绝对路径，/static指根目录下的static目录，在cli项目中/static指src目录下的static目录 -->
<image class="logo" src="/static/logo.png"></image>
<image class="logo" src="@/static/logo.png"></image>

<!-- 相对路径 -->
<image class="logo" src="../../static/logo.png"></image>
```

注意

- `@` 开头的绝对路径以及相对路径会经过 base64 转换规则校验

- 引入的静态资源在非 h5 平台，均不转为 base64。

- H5 平台，小于 4kb 的资源会被转换成 base64，其余不转。

- 自HBuilderX 2.6.6起template内支持@开头路径引入静态资源，旧版本不支持此方式

- App 平台自HBuilderX 2.6.9起template节点中引用静态资源文件时（如：图片），调整查找策略为【基于当前文件的路径搜索】，与其他平台保持一致

- 支付宝小程序组件内 image 标签不可使用相对路径

## css 引入静态资源

css文件或style标签内引入css文件时（scss、less 文件同理），可以使用相对路径或绝对路径（HBuilderX 2.6.6）

```js
/* 绝对路径 */
@import url('/common/uni.css');
@import url('@/common/uni.css');
/* 相对路径 */
@import url('../../common/uni.css');
```

注意

自HBuilderX 2.6.6起支持绝对路径引入静态资源，旧版本不支持此方式

css文件或style标签内引用的图片路径可以使用相对路径也可以使用绝对路径，需要注意的是，有些小程序端 css 文件不允许引用本地文件（请看注意事项）。

```css
/* 绝对路径 */
background-image: url(/static/logo.png);
background-image: url(@/static/logo.png);
/* 相对路径 */
background-image: url(../../static/logo.png);
```

Tips

- 引入字体图标请参考，字体图标

- `@` 开头的绝对路径以及相对路径会经过 base64 转换规则校验

- 不支持本地图片的平台，小于 40kb，一定会转 base64。（共四个平台 mp-weixin, mp-qq, mp-toutiao, app v2）

- h5 平台，小于 4kb 会转 base64，超出 4kb 时不转。

- 其余平台不会转 base64

# 引用原生插件

## uni.requireNativePlugin(PluginName)

引入 App 原生插件。

平台差异说明：App

自 HBuilderX 1.4 版本起，uni-app 支持引入原生插件，使用方式如下：

```js
const PluginName = uni.requireNativePlugin(PluginName); // PluginName 为原生插件名称
```

不管是vue文件还是nvue文件，都是这个API。

## 内置原生插件

内置原生插件,uni-app已默认集成，支持直接在内置基座运行。

仅在nvue页面，支持引入BindingX，animation， DOM.addRule等。

在vue页面，支持引入clipboard，storage，stream，deviceInfo等。

使用方式：可通过uni.requireNativePlugin直接使用。

示例：

```vue
<template>
	<view>
		<text class="my-iconfont">&#xe85c;</text>	
	</view>
</template>
<script>
	export default{
		beforeCreate() {
			const domModule = uni.requireNativePlugin('dom')
			domModule.addRule('fontFace', {
				'fontFamily': "myIconfont",
				'src': "url('http://at.alicdn.com/t/font_2234252_v3hj1klw6k9.ttf')"
			});
		}
	}
</script>
<style>
	.my-iconfont {
		font-family:myIconfont;
		font-size:60rpx;
		color: #00AAFF;
	}
</style>
```

非内置原生插件，分为 本地插件 和 云端插件 。集成原生插件后，需要提交云端打包或制作自定义基座运行才会生效。

## 本地插件(非内置原生插件)

本地插件，是uni-app项目nativeplugins目录(目录不存在则创建)下的原生插件。

### 第一步：获取本地原生插件

（1）方式一：插件市场下载免费uni-app原生插件

可以登录uni原生插件市场 (opens new window)，在免费的插件详情页中点击“下载for离线打包”下载原生插件（zip格式），解压到HBuilderX的uni-app项目下的“nativeplugins”目录（如不存在则创建），以下是“DCloud-RichAlert”插件举例，它的下载地址是：https://ext.dcloud.net.cn/plugin?id=36(opens new window)

下载解压后目录结构如下：

![目录结构](https://bjetxgzv.cdn.bspapp.com/VKCEYUGU-uni-app-doc/c6b5e6d0-4f2b-11eb-b680-7980c8a877b8.png)

（2）方式二：开发者自己开发uni-app原生插件

原生插件开发完成后按指定格式压缩为zip包，参考uni-app原生插件格式说明文档 (opens new window)。 按上图的格式配置到uni-app项目下的“nativeplugins”目录。

### 第二步：配置本地原生插件

在manifest.json -> App原生插件配置 -> 选择本地插件 -> 选择需要打包生效的插件 -> 保存后提交云端打包生效。

![配置本地原生插件](https://bjetxgzv.cdn.bspapp.com/VKCEYUGU-uni-app-doc/c79438e0-4f2b-11eb-8a36-ebb87efcf8c0.png)

### 第三步：开发调试本地原生插件

在vue页面或nvue页面引入这个原生插件。

使用uni.requireNativePlugin的api，参数为插件的id。

```js
const dcRichAlert = uni.requireNativePlugin('DCloud-RichAlert')
```

### 第四步：打包发布

使用自定义基座开发调试本地原生插件后，不可直接将自定义基座apk作为正式版发布。 

应该重新提交云端打包（不能勾选“自定义基座”）生成正式版本。

## 云端插件(非内置原生插件)

云端插件，已经在插件市场绑定或购买的插件，无需下载插件到工程中，云打包时会直接合并打包原生插件到APP中。（试用插件只能在自定义基座中使用）

### 第一步：购买或下载uni-app原生插件

使用前需先登录uni原生插件市场 (opens new window)，在插件详情页中购买，免费插件也可以在插件市场0元购。购买后才能够云端打包使用插件。

购买插件时请选择正确的appid，以及绑定正确包名

### 第二步：使用自定义基座打包uni原生插件 （注：请使用真机运行自定义基座）

在manifest.json -> App原生插件配置 -> 选择云端插件 -> 选择需要打包的插件 -> 保存后提交云端打包生效。

![使用自定义基座打包uni原生插件](https://bjetxgzv.cdn.bspapp.com/VKCEYUGU-uni-app-doc/c8512040-4f2b-11eb-8a36-ebb87efcf8c0.png)

### 第三步：开发调试uni-app原生插件

在vue页面或nvue页面引入这个原生插件。

使用uni.requireNativePlugin的api，参数为插件的id。

1.在页面引入原生插件，uni.requireNativePlugin 使用后返回一个对象：

```js
const dcRichAlert = uni.requireNativePlugin('DCloud-RichAlert')
```

2.使用原生插件

```js
dcRichAlert.show({
	position: 'bottom',
	title: "提示信息",
	titleColor: '#FF0000',
	content: "<a href='https://uniapp.dcloud.io/' value='Hello uni-app'>uni-app</a> 是一个使用 Vue.js 开发跨平台应用的前端框架!\n免费的\n免费的\n免费的\n重要的事情说三遍",
	contentAlign: 'left',
	checkBox: {
		title: '不再提示',
		isSelected: true
	},
	buttons: [{
		title: '取消'
	}, {
		title: '否'
	}, {
		title: '确认',
		titleColor: '#3F51B5'
	}]
}, result => {
	console.log(result)
});
```

### 第四步：打包发布

使用自定义基座开发调试uni-app原生插件后，不可直接将自定义基座apk作为正式版发布。 

应该重新提交云端打包（不能勾选“自定义基座”）生成正式版本。

# 注意事项

1.可以在 插件市场 查看更多插件，如需开发uni原生插件请参考 uni原生插件开发文档 (opens new window)。 

2.如果插件需要传递文件路径，则需要传手机文件的绝对路径，可使用 5+ IO模块 (opens new window)的相关 API 得到文件的绝对路径。

# 参考资料

https://uniapp.dcloud.net.cn/tutorial/page-component.html

https://uniapp.dcloud.net.cn/plugin/native-plugin.html

* any list
{:toc}
