---
layout: post
title: uniapp 教程-10-web SSR 服务端渲染
date: 2021-11-15 21:01:55 +0800
categories: [WEB]
tags: [web, cross-plateform, uni-app, sh]
published: true
---
 

# uni-app 对于 SSR 的支持

uni-app已支持vue 3.0开发，详见：https://ask.dcloud.net.cn/article/37834(opens new window)

uni-app官方基于vue 3.0 & uniCloud提供了简单、易用的SSR支持。

news.dcloud.io (opens new window)是一套基于uni-app & uniCloud 开发的新闻系统，你可以通过浏览器查看源码，这是一个服务端渲染（SSR）的站点示例。

# 什么是服务器端渲染 (SSR)？

uni-app 默认情况下，是在客户端中输出 Vue 组件，进行生成 DOM 和操作 DOM。然而，也可以将同一个组件渲染为服务器端的 HTML 字符串，将它们直接发送到浏览器，最后将这些静态标记"激活"为客户端上完全可交互的应用程序。

服务器渲染的 uni-app 应用程序也可以被认为是"同构"或"通用"，因为应用程序的大部分代码都可以在服务器和客户端上运行。

# 为什么使用服务器端渲染 (SSR)？

与传统 SPA (单页应用程序 (Single-Page Application)) 相比，服务器端渲染 (SSR) 的优势主要在于：

1. 更好的 SEO，搜索引擎爬虫抓取工具可以直接查看完全渲染的页面。

2. 更快的内容到达时间 (time-to-content)，特别是对于缓慢的网络情况或运行缓慢的设备。无需等待所有的 JavaScript 都完成下载并执行，才显示服务器渲染的标记，所以你的用户将会更快速地看到完整渲染的页面。通常可以产生更好的用户体验，并且对于那些「内容到达时间(time-to-content) 与转化率直接相关」的应用程序而言，服务器端渲染 (SSR) 至关重要。

使用服务器端渲染 (SSR) 时还需要有一些权衡之处：

开发条件所限。浏览器特定的代码，只能在某些生命周期钩子函数 (lifecycle hook) 中使用；一些外部扩展库 (external library) 可能需要特殊处理，才能在服务器渲染应用程序中运行。

涉及构建设置和部署的更多要求。与可以部署在任何静态文件服务器上的完全静态单页面应用程序 (SPA) 不同，服务器渲染应用程序，需要处于 Node.js server 运行环境。

更多的服务器端负载。在 Node.js 中渲染完整的应用程序，显然会比仅仅提供静态文件的 server 更加大量占用 CPU 资源 (CPU-intensive - CPU 密集)，因此如果你预料在高流量环境 (high traffic) 下使用，请准备相应的服务器负载，并明智地采用缓存策略。

幸运的是，以上问题，uniCloud (opens new window)均为您提供了解决方案

unicloud-db (opens new window)组件是 uniCloud 提供的一个数据库查询组件，内置支持SSR，开发者无需任何额外开发。

uniCloud 云函数与静态托管，提供了弹性扩容、大并发承载、防DDoS攻击的世界最顶级的IT基础设施，通过 HBuilderX 可将 uni-app 项目一键部署为支持 SSR 的 h5 网站

# 编写通用代码

在进一步介绍之前，让我们花点时间来讨论编写"通用"代码时的约束条件 - 即运行在服务器和客户端的代码。

由于用例和平台 API 的差异，当运行在不同环境中时，我们的代码将不会完全相同。所以这里我们将会阐述你需要理解的关键事项。

## 服务器上的数据响应

在纯客户端应用程序 (client-only app) 中，每个用户会在他们各自的浏览器中使用新的应用程序实例。

对于服务器端渲染，我们也希望如此：每个请求应该都是全新的、独立的应用程序实例，以便不会有交叉请求造成的状态污染 (cross-request state pollution)。

因为实际的渲染过程需要确定性，所以我们也将在服务器上“预取”数据 ("pre-fetching" data) - 这意味着在我们开始渲染时，我们的应用程序就已经解析完成其状态。

也就是说，将数据进行响应式的过程在服务器上是多余的，所以默认情况下禁用。禁用响应式数据，还可以避免将「数据」转换为「响应式对象」的性能开销。

## 组件生命周期钩子函数

由于没有动态更新，所有的生命周期钩子函数中，只有 beforeCreate 和 created 会在服务器端渲染 (SSR) 过程中被调用。

这就是说任何其他生命周期钩子函数中的代码（例如 beforeMount 或 mounted），只会在客户端执行。

此外还需要注意的是，你应该避免在 beforeCreate 和 created 生命周期时产生全局副作用的代码，例如在其中使用 setInterval 设置 timer。

在纯客户端 (client-side only) 的代码中，我们可以设置一个 timer，然后在 beforeUnmount 或 unmounted 生命周期时将其销毁。

但是，由于在 SSR 期间并不会调用销毁钩子函数，所以 timer 将永远保留下来。为了避免这种情况，请将副作用代码移动到 beforeMount 或 mounted 生命周期中。

## 访问特定平台(Platform-Specific) API

通用代码不可接受特定平台的 API，因此如果你的代码中，直接使用了像 window 或 document，这种仅浏览器可用的全局变量，则会在 Node.js 中执行时抛出错误，反之也是如此。

对于仅浏览器可用的 API，通常方式是，在「纯客户端 (client-only)」的生命周期钩子函数中惰性访问 (lazily access) 它们。

请注意，考虑到如果第三方 library 不是以上面的通用用法编写，则将其集成到服务器渲染的应用程序中，可能会很棘手。你可能要通过模拟 (mock) 一些全局变量来使其正常运行，但这只是 hack 的做法，并且可能会干扰到其他 library 的环境检测代码。

# 数据预取和状态

在服务器端渲染(SSR)期间，我们本质上是在渲染我们应用程序的"快照"，所以如果应用程序依赖于一些异步数据，那么在开始渲染过程之前，需要先预取和解析好这些数据。

另一个需要关注的问题是在客户端，在挂载 (mount) 到客户端应用程序之前，需要获取到与服务器端应用程序完全相同的数据 - 否则，客户端应用程序会因为使用与服务器端应用程序不同的状态，然后导致混合失败。

为了解决这个问题，获取的数据需要位于视图组件之外，即放置在专门的数据预取存储容器(data store)或"状态容器(state container)"中。

首先，在服务器端，我们可以在渲染之前预取数据，并将数据填充到 store 中。

此外，我们将在 HTML 中序列化(serialize)和内联预置(inline)状态。这样，在挂载(mount)到客户端应用程序之前，可以直接从 store 获取到内联预置(inline)状态。

对于简单应用，我们可以直接使用@dcloudio/uni-app提供的ssrRef（等同于 vue3 的 ref (opens new window)）,shallowSsrRef（等同于 vue3 的 shallowRef (opens new window)），来确保服务端数据与客户端数据的一致性

在非组件生命周期中使用ssrRef和shallowSsrRef时，数据将被存储在全局

ssrRef和shallowSsrRef均支持第二个参数，作为数据的key

- 示例：

```js
import { ssrRef } from '@dcloudio/uni-app'
const categories = ssrRef([], 'categories'); // 在非组件生命周期中使用时，为全局数据，可以跨组件跨页面使用
export default {
	setup (){
		const items = ssrRef([]); // 在生命周期中使用时，为组件级别作用域，不指定第二个参数key的情况下，编译器会自动补充(默认，以文件+函数位置做base64生成key)
		return { items, categories }
	}
}
```

## 负责的例子

对于复杂应用，我们可以使用官方状态管理库Vuex(opens new window)

- 示例：

我们先创建一个 store/index.js 文件，里面会模拟一些根据 id 获取 item 的逻辑：

```js
import { createStore } from 'vuex'

// 模拟接口获取数据
function fetchItem(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        title: 'title' + id,
      })
    }, 300)
  })
}

export default () => {
  return createStore({
    state() {
      return {
        items: {},
      }
    },
    actions: {
      fetchItem({ commit }, id) {
        return fetchItem(id).then((item) => {
          commit('setItem', { id, item })
        })
      },
    },
    mutations: {
      setItem(state, { id, item }) {
        state.items[id] = item
      },
    },
  })
}
```

2) 然后修改 main.js

```js
import { createSSRApp } from 'vue'
import App from './App.vue'
import createStore from './store'
export function createApp() {
  const app = createSSRApp(App)
  
  const store = createStore() // 创建 store
  app.use(store)
  
  return {
	app,
	store,// 必须返回 store
  }
}
```

3) 在页面或组件中使用

```vue
<template>
  <text v-if="item">{{ item.title }}</text>
  <text v-else>...</text>
</template>

<script>
const id = 1;// 模拟ID
export default {
  computed: {
	item() {
	  return this.$store.state.items[id]
	}
  },
  serverPrefetch() {// 服务端预取数据的生命周期
	return this.fetchItem()
  },
  mounted() { // 仅客户端执行的生命周期
	if (!this.item) { // 判断服务端是否已正常获取，若未获取，重新调用加载数据
	  this.fetchItem()
	}
  },
  methods: {
	fetchItem() {
	  return this.$store.dispatch('fetchItem', id)
	}
  }
}
</script>
```

# 发行与部署

发行ssr会得到两部分内容，云端部分和静态资源部分。在uniCloud内部署需要将云端部分部署到云函数内，静态资源部分部署在前端网页托管内。

## 部署到uniCloud

### 前置步骤

务必完成前置步骤之后再进行后续操作

- 开通uniCloud (opens new window)以及前端网页托管(opens new window)

- 云函数绑定自定义url化域名，参考文档：云函数Url化(opens new window)

- 前端网页托管绑定自定义域名，参考文档：前端网页托管配置域名(opens new window)

- 将前两步部署的域名都配置在跨域配置内，即允许云函数跨域访问前端网页托管内的资源，也允许前端网页托管跨域访问云函数。参考文档：H5中使用uniCloud的跨域处理(opens new window)

- 从插件市场导入uni-ssr (opens new window)到项目内

### 编译发行

使用HBuilderX发行并自动部署

需要HBuilderX版本3.2.7及以上版本，目前仅支持部署静态资源到阿里云的服务空间

通过HBuilderX的发行菜单->网站 PC-Web或手机H5、勾选ssr、勾选将编译后的资源部署在uniCloud前端网页托管

配置uni-ssr的云函数URL化路径，请参考文档：云函数URL化(opens new window)

## 手动发行部署

1) 配置vite.config.js中的base为前端网页托管地址

```js
import {
	defineConfig
} from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
// https://vitejs.dev/config/
export default defineConfig({
	base: 'https://static-xxxx.bspapp.com/', // uniCloud 前端网页托管资源地址（主要是应用编译后的js，图片等静态资源，可以配置为二级目录）
	plugins: [
		uni(),
	],
})
```

2) 编译：

cli工程：npm run build:h5:ssr或通过HBuilderX 3.1.16及以上版本的发行菜单->网站 PC-Web或手机H5、勾选ssr

非cli工程：通过HBuilderX 3.1.16及以上版本的发行菜单->网站 PC-Web或手机H5、勾选ssr

以ssr模式发行

3) 部署静态资源到前端网页托管(opens new window)

将编译后的dist/build/h5/client中的资源上传至前端网页托管，推荐使用免费的阿里云服务空间

4) 部署uni-ssr云函数

将编译后的dist/build/h5/server目录拷贝至uni-ssr云函数根目录，并上传。

5) 配置uni-ssr的云函数URL化路径，请参考文档：云函数URL化

# 参考资料

https://uniapp.dcloud.net.cn/tutorial/ssr.html

* any list
{:toc}
