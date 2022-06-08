---
layout: post
title: uniapp 教程-07-compiler 编译器
date: 2021-11-15 21:01:55 +0800
categories: [WEB]
tags: [web, cross-plateform, uni-app, sh]
published: true
---
 

# 什么是编译器

uni-app能实现一套代码、多端运行，核心是通过编译器 + 运行时实现的：

编译器：将uni-app统一代码编译生成每个平台支持的特有代码；如在小程序平台，编译器将.vue文件拆分生成wxml、wxss、js等代码。

运行时：动态处理数据绑定、事件代理，保证Vue和平台宿主数据的一致性；

uni-app项目根据所依赖的Vue版本不同，编译器的实现也不同：

vue2：uni-app编译器基于wepback实现

vue3：uni-app编译器基于Vite实现，编译速度更快，详见：vue3和vite双向加持，uni-app性能再次提升(opens new window)

uni-app项目根据创建方式的不同，编译器在使用上也有差异：

cli 方式创建的项目，编译器安装在项目下。编译器不会跟随HBuilderX升级。如需升级编译器，可以使用 @dcloudio/uvm 管理编译器的版本，如 npx @dcloudio/uvm。

HBuilderX可视化界面创建的项目，编译器在HBuilderX的安装目录下的plugin目录，随着HBuilderX的升级会自动升级编译器。

已经使用cli创建的项目，如果想继续在HBuilderX里使用，可以把工程拖到HBuilderX中。注意如果是把整个项目拖入HBuilderX，则编译时走的是项目下的编译器。如果是把src目录拖入到HBuilderX中，则走的是HBuilderX安装目录下plugin目录下的编译器。

# 条件编译处理多端差异

## 跨端兼容

uni-app 已将常用的组件、JS API 封装到框架中，开发者按照 uni-app 规范开发即可保证多平台兼容，大部分业务均可直接满足。

但每个平台有自己的一些特性，因此会存在一些无法跨平台的情况。

大量写 if else，会造成代码执行性能低下和管理混乱。

编译到不同的工程后二次修改，会让后续升级变的很麻烦。

在 C 语言中，通过 #ifdef、#ifndef 的方式，为 windows、mac 等不同 os 编译不同的代码。 

uni-app 参考这个思路，为 uni-app 提供了条件编译手段，在一个工程里优雅的完成了平台个性化实现。

## 条件编译

条件编译是用特殊的注释作为标记，在编译时根据这些特殊的注释，将注释里面的代码编译到不同平台。

写法：以 `#ifdef` 或 `#ifndef` 加 `%PLATFORM%` 开头，以 `#endif` 结尾。


```
#ifdef：if defined 仅在某平台存在
#ifndef：if not defined 除了某平台均存在
%PLATFORM%：平台名称
```

- 仅出现在 App 平台下的代码

```
#ifdef APP-PLUS
需条件编译的代码
#endif
```

- 除了 H5 平台，其它平台均存在的代码

```
#ifndef H5
需条件编译的代码
#endif
```

- 在 H5 平台或微信小程序平台存在的代码（这里只有`||`，不可能出现`&&`，因为没有交集

```
#ifdef H5 || MP-WEIXIN
需条件编译的代码
#endif
```

### %PLATFORM% 可取值如下：

| 值						| 生效条件	|
|:---|:---|
| VUE3						| HBuilderX 3.2.0+ 详情(opens new window)	|
| APP-PLUS					| App	|
| APP-PLUS-NVUE或APP-NVUE	| App nvue	|
| H5						| H5	|
| MP-WEIXIN					| 微信小程序	|
| MP-ALIPAY					| 支付宝小程序	|
| MP-BAIDU					| 百度小程序	|
| MP-TOUTIAO				| 字节跳动小程序	|
| MP-LARK					| 飞书小程序	|
| MP-QQ						| QQ小程序	|
| MP-KUAISHOU				| 快手小程序	|
| MP-JD						| 京东小程序	|
| MP-360					| 360小程序	|
| MP						| 微信小程序/支付宝小程序/百度小程序/字节跳动小程序/飞书小程序/QQ小程序/360小程序	|
| QUICKAPP-WEBVIEW			| 快应用通用(包含联盟、华为)	|
| QUICKAPP-WEBVIEW-UNION	| 快应用联盟	|
| QUICKAPP-WEBVIEW-HUAWEI	| 快应用华为	|

### 支持的文件

.vue

.js

.css

pages.json

各预编译语言文件，如：.scss、.less、.stylus、.ts、.pug

### 注意：

- 条件编译是利用注释实现的，在不同语法里注释写法不一样，js使用 `//` 注释、css 使用 `/*` 注释 `*/`、vue/nvue 模板里使用 `<!-- 注释 -->`；

- 条件编译APP-PLUS包含APP-NVUE和APP-VUE，APP-PLUS-NVUE和APP-NVUE没什么区别，为了简写后面出了APP-NVUE ；

- 使用条件编译请保证编译前和编译后文件的正确性，比如json文件中不能有多余的逗号；

- VUE3 需要在项目的 manifest.json 文件根节点配置 "vueVersion" : "3"

## API 的条件编译

```js
// #ifdef  %PLATFORM%
平台特有的API实现
// #endif
```

示例，如下代码仅在 App 下出现:

![仅在 App 下出现](https://bjetxgzv.cdn.bspapp.com/VKCEYUGU-uni-app-doc/07834e90-4f3c-11eb-b680-7980c8a877b8.png)

示例，如下代码不会在 H5 平台上出现：

![不会在 H5 平台上出现](https://bjetxgzv.cdn.bspapp.com/VKCEYUGU-uni-app-doc/06a79490-4f3c-11eb-b680-7980c8a877b8.png)

除了支持单个平台的条件编译外，还支持多平台同时编译，使用 || 来分隔平台名称。

示例，如下代码会在 App 和 H5 平台上出现：

![会在 App 和 H5 平台上出现](https://bjetxgzv.cdn.bspapp.com/VKCEYUGU-uni-app-doc/05c1ef80-4f3c-11eb-b680-7980c8a877b8.png)

## 组件的条件编译

```xml
<!--  #ifdef  %PLATFORM% -->
平台特有的组件
<!--  #endif -->
```

示例，如下公众号关注组件仅会在微信小程序中出现：

```xml
<view>
    <view>微信公众号关注组件</view>
    <view>
        <!-- uni-app未封装，但可直接使用微信原生的official-account组件-->
        <!-- #ifdef MP-WEIXIN -->
		        <official-account></official-account>
		    <!-- #endif -->
    </view>
</view>
```

## 样式的条件编译

```js
/*  #ifdef  %PLATFORM%  */
平台特有样式
/*  #endif  */
```

注意： 样式的条件编译，无论是 css 还是 sass/scss/less/stylus 等预编译语言中，必须使用 `/*注释*/` 的写法。

## pages.json 的条件编译

下面的页面，只有运行至 App 时才会编译进去。

![pages.json](https://bjetxgzv.cdn.bspapp.com/VKCEYUGU-uni-app-doc/04ecec40-4f3c-11eb-97b7-0dc4655d6e68.png)

不同平台下的特有功能，以及小程序平台的分包，都可以通过 pages.json 的条件编译来更好地实现。

这样，就不会在其它平台产生多余的资源，进而减小包体积。

json的条件编译，如不同平台的key名称相同，cli项目下开发者自己安装的校验器会报错，需自行关闭这些校验器对json相同key的校验规则。

如果使用HBuilderX的校验器，无需在意此问题，HBuilderX的语法校验器为此优化过。

## static 目录的条件编译

在不同平台，引用的静态资源可能也存在差异，通过 static 的的条件编译可以解决此问题，static 目录下新建不同平台的专有目录（目录名称同 `%PLATFORM%` 值域,但字母均为小写），专有目录下的静态资源只有在特定平台才会编译进去。

如以下目录结构，a.png 只有在微信小程序平台才会编译进去，b.png 在所有平台都会被编译。

```
┌─static                
│  ├─mp-weixin
│  │  └─a.png     
│  └─b.png
├─main.js        
├─App.vue      
├─manifest.json 
└─pages.json  
```

## 整体目录条件编译

如果想把各平台的页面文件更彻底的分开，也可以在uni-app项目根目录创建platforms目录，然后在下面进一步创建app-plus、mp-weixin等子目录，存放不同平台的文件。

注意

platforms 目录下只支持放置页面文件（即页面vue文件），如果需要对其他资源条件编译建议使用static 目录的条件编译(opens new window)

## HBuilderX 支持

HBuilderX 为 uni-app 的条件编译提供了丰富的支持:

### 代码块支持

在 HBuilderX 中开发 uni-app 时，通过输入 ifdef 可快速生成条件编译的代码片段

![代码块支持](https://bjetxgzv.cdn.bspapp.com/VKCEYUGU-uni-app-doc/0a1766f0-4f3c-11eb-8a36-ebb87efcf8c0.png)

### 语法高亮

在 HBuilderX 中对条件编译的代码注释部分提供了语法高亮，可分辨出写法是否正确，使得代码更加清晰（独立js文件需在编辑器右下角切换javascript es6+编辑器，独立css文件暂不支持高亮，但不高亮不影响使用）

![语法高亮](https://bjetxgzv.cdn.bspapp.com/VKCEYUGU-uni-app-doc/0868a580-4f3c-11eb-8a36-ebb87efcf8c0.png)

### 正确注释和快速选中

在 HBuilderX 中，ctrl+alt+/ 即可生成正确注释（js：`//` 注释、css：`/*` 注释 `*/`、vue/nvue模板： `<!-- 注释 -->`）。

![正确注释和快速选中](https://bjetxgzv.cdn.bspapp.com/VKCEYUGU-uni-app-doc/0af9d7b0-4f3c-11eb-8a36-ebb87efcf8c0.png)

点击 ifdef 或 endif 可快速选中条件编译部分；点击左侧的折叠图标，可折叠条件编译部分代码。

![collpase](https://bjetxgzv.cdn.bspapp.com/VKCEYUGU-uni-app-doc/09460d30-4f3c-11eb-8a36-ebb87efcf8c0.png)

## 注意

Android 和 iOS 平台不支持通过条件编译来区分，如果需要区分 Android、iOS 平台，请通过调用 uni.getSystemInfo 来获取平台信息。

支持ifios、ifAndroid代码块，可方便编写判断。

有些跨端工具可以提供js的条件编译或多态，但这对于实际开发远远不够。uni-app不止是处理js，任何代码都可以多端条件编译，才能真正解决实际项目的跨端问题。

另外所谓多态在实际开发中会造成大量冗余代码，很不利于复用和维护。

举例，微信小程序主题色是绿色，而百度支付宝小程序是蓝色，你的应用想分平台适配颜色，只有条件编译是代码量最低、最容易维护的。

有些公司的产品运营总是给不同平台提不同需求，但这不是拒绝uni-app的理由。

关键在于项目里，复用的代码多还是个性的代码多，正常都是复用的代码多，所以仍然应该多端。

而个性的代码放到不同平台的目录下，差异化维护。

# 环境变量

uni-app 项目中配置环境变量主要有如下三种方式：

## vue-config.js

在 vue.config.js 中可以修改 webpack 配置，包括环境变量，具体参考 vue-config.js。

## package.json

在自定义条件编译平台时，可以在 package.json 文件的 env 节点下配置环境变量，具体参考 package.json

## .env

CLI 创建的项目中可以在根目录中放置 .env 文件来指定环境变量，具体参考：环境变量。

# 编译器配置

你可以通过如下入口，对uni-app编译器进行配置：

## manifest.json

在manifest.json中，你可以配置Vue的版本（Vue2/Vue3），以及发行H5平台路由模式，详见： manifest.json

## vue.config.js

在 vue.config.js 中可以修改 webpack 配置，包括环境变量，具体参考 vue-config.js。

## package.json

在自定义条件编译平台时，可以在 package.json 文件的 env 节点下配置环境变量，具体参考 package.json

## .env

CLI 创建的项目中可以在根目录中放置 .env 文件来指定环境变量，具体参考：环境变量。

# 参考资料

https://uniapp.dcloud.net.cn/tutorial/compiler.html

* any list
{:toc}
