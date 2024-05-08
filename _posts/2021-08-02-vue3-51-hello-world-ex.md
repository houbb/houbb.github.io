---
layout: post
title: VUE3-20-VUE 入门例子实战完善版本
date: 2021-08-02 21:01:55 +0800
categories: [VUE]
tags: [vue, hello-world, vue-learn, sh]
published: true
---

# 基础版本

基础版本毕竟过于基础，实际使用还是需要引入一些常见的包。

比如 axios vuex  vouter element-ui .

# 改进版本

## 文件

```
λ ls -a

.browserslistrc  .editorconfig  .env.dev  .env.prod  .env.test  .eslintrc.js  .gitignore  babel.config.js  package.json  package-lock.json  public/  README.md  src/  vue.config.js
```

## .browserslistrc 

这个配置能够分享目标浏览器和nodejs版本在不同的前端工具。

这些工具能根据目标浏览器自动来进行配置。

### 使用方法

(1) package.json （推荐

```js
{
  "browserslist": [
    "last 1 version",
    "> 1%",
    "maintained node versions",
    "not dead"
  ]
}
```

(2) .browserslistrc

```
# Browsers that we support 
 
last 1 version
> 1%
maintained node versions
not dead
```

Browserslist 的数据都是来自 [Can I Use](https://caniuse.com/) 的。

如果你想知道配置语句的查询结果可以使用[online demo] (https://browserl.ist/)

## .editorconfig

这个主要是 vscode 的配置文件。

至于是否需要上传，很多人的观点是不同的。

该文件用来定义项目的编码规范，编辑器的行为会与.editorconfig 文件中定义的一致，并且其优先级比编辑器自身的设置要高，这在多人合作开发项目时十分有用而且必要。

内容如下：

```
[*.{js,jsx,ts,tsx,vue}]
indent_style = space
indent_size = 4
trim_trailing_whitespace = true
insert_final_newline = true
```

## 环境配置

主要是给 vue-cli 使用的 env 配置，共计三个：

```
.env.dev  .env.prod  .env.test
```

- .env.dev

```
NODE_ENV = 'development'
VUE_APP_CURRENTMODE = 'dev'
VUE_APP_BASEURL = ''
```

- .env.test

```
NODE_ENV = 'test'
VUE_APP_CURRENTMODE = 'test'
VUE_APP_BASEURL = '测试环境api地址'
```

- .env.prod

```
NODE_ENV = 'production'
VUE_APP_CURRENTMODE = 'prod'
VUE_APP_BASEURL = '正式环境api地址'
```

## .eslintrc.js

在团队协作中，为避免低级 Bug、产出风格统一的代码，会预先制定编码规范。

使用 Lint 工具和代码风格检测工具，则可以辅助编码规范执行，有效控制代码质量。

```js
module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
```

.eslintrc 放在项目根目录，则会应用到整个项目；如果子目录中也包含 .eslintrc 文件，则子目录会忽略根目录的配置文件，应用该目录中的配置文件。

这样可以方便地对不同环境的代码应用不同的规则。

## babel.config.js

babel 配置，和原来大同小异。

```js
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ]
}
```

## package.json && package-lock.json

这里指定了一些常用的包。

```js
λ cat package.json                                                  
{                                                                   
    "name": "vue-hello",                                            
    "version": "0.1.0",                                             
    "private": true,                                                
    "scripts": {                                                    
        "dev": "vue-cli-service serve",                             
        "build:test": "vue-cli-service build --mode test",          
        "build:prod": "vue-cli-service build --mode production",    
        "build": "vue-cli-service build",                           
        "lint": "vue-cli-service lint"                              
    },                                                              
    "dependencies": {                                               
        "axios": "^0.19.2",                                         
        "core-js": "^3.6.4",                                        
        "element-ui": "^2.15.5",                                    
        "iview": "^3.5.4",                                          
        "moment": "^2.29.1",                                        
        "node-sass": "^4.14.1",                                     
        "vue": "^2.6.11",                                           
        "vue-router": "^3.0.7",                                     
        "vuex": "^3.1.2"                                            
    },                                                              
    "devDependencies": {                                            
        "@vue/cli-plugin-babel": "^4.2.0",                          
        "@vue/cli-plugin-eslint": "^4.2.0",                         
        "@vue/cli-service": "^4.2.0",                               
        "@vue/eslint-config-standard": "^5.1.0",                    
        "babel-eslint": "^10.0.3",                                  
        "eslint": "^6.7.2",                                         
        "eslint-plugin-import": "^2.20.1",                          
        "eslint-plugin-node": "^11.0.0",                            
        "eslint-plugin-promise": "^4.2.1",                          
        "eslint-plugin-standard": "^4.0.0",                         
        "eslint-plugin-vue": "^6.1.2",                              
        "sass-loader": "^8.0.2",                                    
        "vue-template-compiler": "^2.6.11"                          
    }                                                               
}                                                                   
```

## vue.config.js


vue.config.js 是一个可选的配置文件，如果项目的 (和 package.json 同级的) 根目录中存在这个文件，那么它会被 @vue/cli-service 自动加载。

你也可以使用 package.json 中的 vue 字段，但是注意这种写法需要你严格遵照 JSON 的格式来写。

```js
// vue.config.js
const path = require('path')

function resolve (dir) {
  return path.join(__dirname, dir)
}
module.exports = {
  // 部署应用包时的基本URL，默认为'/'
  // 假设你的应用将会部署在域名的根部,比如，https://www.vue-cli.com/,则设置为"/"
  // 如果你的应用是部署在一个子路径下，那么你需要在这里指定子路径，比如，如果你部署在 https://www.my-vue.com/my-app/; 那么将这个值改为 “/my-app/”
  publicPath: '/',

  // 将构建好的文件输出到哪里 当运行 vue-cli-service build 时生成的生产环境构建文件的目录。注意目标目录在构建之前会被清除 (构建时传入 --no-clean 可关闭该行为)。
  outputDir: 'dist',

  // 放置生成的静态资源(js、css、img、fonts)的目录。
  assetsDir: '',

  // 指定生成的 index.html 的输出路径
  indexPath: 'index.html',

  // 默认情况下，生成的静态资源在它们的文件名中包含了 hash 以便更好的控制缓存。然而，这也要求 index 的 HTML 是被 Vue CLI 自动生成的。如果你无法使用 Vue CLI 生成的 index HTML，你可以通过将这个选项设为 false 来关闭文件名哈希
  filenameHashing: true,

  // 构建多页面应用，页面的配置
  pages: {
    index: {
      // page 的入口
      entry: 'src/main.js',
      // 模板来源
      template: 'public/index.html',
      // 在 dist/index.html 的输出
      filename: 'index.html',
      // 当使用 title 选项时，
      // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
      title: 'Index Page',
      // 在这个页面中包含的块，默认情况下会包含
      // 提取出来的通用 chunk 和 vendor chunk。
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    }
    // 当使用只有入口的字符串格式时，
    // 模板会被推导为 `public/subpage.html`
    // 并且如果找不到的话，就回退到 `public/index.html`。
    // 输出文件名会被推导为 `subpage.html`。
    // subpage: 'src/subpage/main.js'
  },

  // 是否在开发环境下通过 eslint-loader 在每次保存时 lint 代码。这个值会在 @vue/cli-plugin-eslint 被安装之后生效。
  // 设置为 true 时，eslint-loader 会将 lint 错误输出为编译警告。默认情况下，警告仅仅会被输出到命令行，且不会使得编译失败。
  // 如果你希望让 lint 错误在开发时直接显示在浏览器中，你可以使用 lintOnSave: 'error'。这会强制 eslint-loader 将 lint 错误输出为编译错误，同时也意味着 lint 错误将会导致编译失败。
  lintOnSave: false,

  // 是否使用包含运行时编译器的 Vue 构建版本。设置为 true 后你就可以在 Vue 组件中使用 template 选项了，但是这会让你的应用额外增加 10kb 左右。
  runtimeCompiler: false,

  // 默认情况下 babel-loader 会忽略所有 node_modules 中的文件。如果你想要通过 Babel 显式转译一个依赖，可以在这个选项中列出来。
  transpileDependencies: [],

  // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
  productionSourceMap: true,

  // 是一个函数，会接收一个基于 webpack-chain 的 ChainableConfig 实例。允许对内部的 webpack 配置进行更细粒度的修改。
  chainWebpack: (config) => {
    // 配置别名
    config.resolve.alias
      .set('@', resolve('src'))
      .set('assets', resolve('src/assets'))
      .set('components', resolve('src/components'))
      .set('router', resolve('src/router'))
      .set('utils', resolve('src/utils'))
      .set('store', resolve('src/store'))
      .set('views', resolve('src/views'))
  },

  // 是否为 Babel 或 TypeScript 使用 thread-loader。该选项在系统的 CPU 有多于一个内核时自动启用，仅作用于生产构建。
  parallel: require('os').cpus().length > 1,

  // 向 PWA 插件传递选项。
  // https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-pwa
  pwa: {},

  // 所有 webpack-dev-server 的选项都支持。注意：有些值像 host、port 和 https 可能会被命令行参数覆写。
  // 有些值像 publicPath 和 historyApiFallback 不应该被修改，因为它们需要和开发服务器的 publicPath 同步以保障正常的工作。
  // 代理配置
  devServer: {
    host: '0.0.0.0',
    port: 8080, // 端口号
    https: false, // https:{type:Boolean}
    open: true, // 配置自动启动浏览器  open: 'Google Chrome'-默认启动谷歌

    // 配置单个代理
    // proxy: 'http://10.64.64.108:30104'

    // 配置多个代理
    // proxy: {
    //   '/api': {
    //     // target: "https://127.0.0.0:8080", // 目标主机
    //     target: '',
    //     ws: true, // 代理的WebSockets
    //     changeOrigin: true, // 允许websockets跨域
    //     pathRewrite: {
    //       '^/api': ''
    //     }
    //   }
    // }
  },

  // 第三方插件选项
  // 这是一个不进行任何 schema 验证的对象，因此它可以用来传递任何第三方插件选项。
  pluginOptions: {
    foo: {
      // 插件可以作为 `options.pluginOptions.foo` 访问这些选项。
    }
  },

  // 有的时候你想要向 webpack 的预处理器 loader 传递选项。你可以使用 vue.config.js 中的 css.loaderOptions 选项。比如你可以这样向所有 Sass/Less 样式传入共享的全局变量
  css: {
    loaderOptions: {
      // 给 sass-loader 传递选项
      sass: {
        prependData: `
                @import "@/assets/css/common.scss";
                @import "@/assets/css/mixin.scss";
                @import "@/assets/css/reset.scss";
                @import "@/assets/css/var.scss"; 
                `
      }
    }
  }
}
```

## public 文件夹

下面三个文件：

```
config.json  favicon.ico  index.html
```

- config.json

```json
{
    "state": {
        "code": 200,
        "msg": "操作成功"
    },
    "data": {}
}
```

感觉这东西没必要放在这里

- index.html

默认的页面

```html
<!DOCTYPE html>
<html lang="zh">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <link rel="icon" href="<%= BASE_URL %>favicon.ico">
    <title>
        <%= htmlWebpackPlugin.options.title %>
    </title>
</head>
<style lang="scss" scoped>

</style>

<body>
    <noscript>
      <strong>We're sorry but <%= htmlWebpackPlugin.options.title %> doesn't work properly without JavaScript enabled. Please enable it to continue.</strong>
    </noscript>
    <div id="app"></div>
    <!-- built files will be auto injected -->
</body>

</html>
```

# src

这里使我们日常编码的重头戏。

## 文件

整体结构如下：

```
│  App.vue    
│  main.js
│
├─api    # 请求 api
│      api.js
│      axios.js
│      getData.js
│
├─assets  # 静态资源
│  ├─css
│  │      common.scss
│  │      mixin.scss
│  │      reset.scss
│  │      var.scss
│  │
│  └─images
│          logo.png
│
├─components # 组件
│  ├─IconButton
│  │  │  index.vue
│  │  │
│  │  └─images
│  │          again.png
│  │
│  ├─imageSelector
│  │      index.vue
│  │
│  └─leftNav
│          index.vue
│
├─mixins  # 混入 js
│      myMixins.js
│
├─router  # 路由
│      index.js
│
├─store   # 数据存储
│      index.js
│
├─utils   # 工具类
│      auth.js
│      storage.js
│
└─views  # 视图层
    ├─home
    │      index.vue
    │
    ├─login
    │      index.vue
```

## App.vue

```html
<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {}
</script>

<style lang="scss">
html {
    height: 100%;
}
body {
    height: 100%;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
```

## main.js

```js
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import iview from 'iview'
import 'iview/dist/styles/iview.css'
import auth from '@/utils/auth'
import '@/assets/css/common.scss' /* 引入公共样式 */
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)
Vue.config.productionTip = false
Vue.use(iview)
Vue.directive('auth', auth)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
```

这里引入了几个核心的组件。

## api

共计三个文件：

```
api.js  axios.js  getData.js
```


- axios.js

内容被迁移到 api.js 中，可忽略。

- api.js

```js
/**axios封装
 * 请求拦截、相应拦截、错误统一处理
 */
 import axios from 'axios';import QS from 'qs';
 import { Message } from 'element-ui';
 import store from '../store/index'
  
 // 环境的切换
 if (process.env.NODE_ENV == 'development') {    //集成
     axios.defaults.baseURL = 'http://127.0.0.1:8081/context-path/';
 } else if (process.env.NODE_ENV == 'test') {    //测试
     axios.defaults.baseURL = '';
 } else if (process.env.NODE_ENV == 'production') {     //生产
     axios.defaults.baseURL = '';
 }
  
 // 请求超时时间
 axios.defaults.timeout = 10000;
  
 // post请求头
 // 如果是后端使用 @RequestBody 注解，这里需要调整为传入 json 的入参。 和后面 post 方法保持一致，QS.stringify(params) 也要同时去掉。
 axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

/** 
  * get方法，对应get请求 
  * @param {String} url [请求的url地址] 
  * @param {Object} params [请求时携带的参数] 
  */
 export function get(url, params){    
     return new Promise((resolve, reject) =>{        
         axios.get(url, {            
             params: params        
         })        
         .then(res => {            
             resolve(res.data);        
         })        
         .catch(err => {            
             reject(err.data)        
         })    
     });
 }
 /** 
  * post方法，对应post请求 
  * @param {String} url [请求的url地址] 
  * @param {Object} params [请求时携带的参数] 
  */
 export function post(url, params) {    
     return new Promise((resolve, reject) => {         
         axios.post(url, QS.stringify(params))        
         .then(res => {            
             resolve(res.data);        
         })        
         .catch(err => {            
             reject(err.data)        
         })    
     });
 }

 // 请求拦截器
 axios.interceptors.request.use(    
     config => {
         // 每次发送请求之前判断是否存在token，如果存在，则统一在http请求的header都加上token，不用每次请求都手动添加了
         // 即使本地存在token，也有可能token是过期的，所以在响应拦截器中要对返回状态进行判断
         const token = store.state.token;        
         token && (config.headers.Authorization = token);        
         return config;    
     },    
     error => {        
         return Promise.error(error);    
     })
  
 // 响应拦截器
 axios.interceptors.response.use(    
     response => {        
         if (response.status === 200) {            
             return Promise.resolve(response);        
         } else {            
             return Promise.reject(response);        
         }    
     },
     // 服务器状态码不是200的情况    
     error => {        
         if (error.response.status) {            
             switch (error.response.status) {                
                 // 401: 未登录                
                 // 未登录则跳转登录页面，并携带当前页面的路径                
                 // 在登录成功后返回当前页面，这一步需要在登录页操作。                
                 case 401:                    
                     router.replace({                        
                         path: '/login',                        
                         query: { redirect: router.currentRoute.fullPath } 
                     });
                     break;
                 // 403 token过期                
                 // 登录过期对用户进行提示                
                 // 清除本地token和清空vuex中token对象                
                 // 跳转登录页面                
                 case 403:                     
                     Message({
                        message: '登录过期，请重新登录',
                        type: 'error',
                        duration:  1000
                      })
                     // 清除token                    
                     localStorage.removeItem('token');                    
                     store.commit('loginSuccess', null);                    
                     // 跳转登录页面，并将要浏览的页面fullPath传过去，登录成功后跳转需要访问的页面
                     setTimeout(() => {                        
                         router.replace({                            
                             path: '/login',                            
                             query: { 
                                 redirect: router.currentRoute.fullPath 
                             }                        
                         });                    
                     }, 1000);                    
                     break; 
                 // 404请求不存在                
                 case 404:                    
                     Message({
                        message: '网络请求不存在',
                        type: 'error',
                        duration:  1000
                      })
                 break;                
                 // 其他错误，直接抛出错误提示                
                 default:                    
                    Message({                        
                         message: error.response.data.message,                        
                         duration: 1500,                        
                         type: 'error',                   
                     });
                     
             }            
             return Promise.reject(error.response);        
         }       
     }
 );
```


- getData.js

依赖 api 的，后端数据查询的统一封装类。

```js
// import { get, post } from './axios'
import { get, post } from './api'
// 获取用户信息（统一认证登录的用户）
export function getLoginInfo () {
  return get('/oauth/getLoginInfo')
}

// 登录
export function login (params) {
  return post('/oauth/login', params)
}

// 退出
export function logout (params) {
  return get('/oauth/logout', params)
}
```

## assets

都是静态文件，样式和图片，暂时忽略。

## components

用户自定义的一些组件，暂时不看。

## minix

- myMixins.js

内容非常简单：

```js
export const myMixins = {
  components:{},
  data() {
    return {}
  },
  created() {
    console.log('xxx from mixins')
  }
}
```

## router

路由信息。

- index.js

```js
import Vue from 'vue'
import VueRouter from 'vue-router'
import MainPage from '../views/mainPage'
import Login from '../views/login'

Vue.use(VueRouter)

// 主页面MainPage下面的子页面
let pages = [
    'login',
].map(name => ({
    path: name,
    name: name,
    component: () =>
        import (`@/views/${name}`)
}))

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [{
            path: '/',
            name: 'mainPage',
            component: MainPage,
            children: pages,
            meta: {
                requiresAuth: true // 访问该路由时需要判断是否登录
            }
        },
        {
            path: '/login',
            name: 'login',
            component: Login
        },
    ]
})
export default router
```

## store

数据存储。

- index.js

```js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loginInfo: {}
  },
  mutations: {
    setLoginInfo (state, data) {
      state.loginInfo = data
    }
  },
  actions: {},
  modules: {}
})
```

## utils

工具类

- auth.js

```js
import store from "@/store";

export default {
    bind(el, binding, vnode) {
        let auths = store.getters.auths.map(it => it.menuCode);
        let hasAuth = auths.includes(binding.value);
        if (hasAuth) {
            delete el.style.display;
        } else {
            el.style.display = "none";
        }
    }
}
```


- storage.js

```js
export default {
    setItem(key, value) {
        value = JSON.stringify(value);
        window.localStorage.setItem(key, value)
    },
    getItem(key, defaultValue) {
        let value = window.localStorage.getItem(key)
        try {
            value = JSON.parse(value)
        } catch (err) {
            throw new Error(err)
        }
        return value || defaultValue
    },
    removeItem(key) {
        window.localStorage.removeItem(key)
    },
    clear() {
        window.localStorage.clear()
    }
}
```

## views

视图层

### mainPage

- index.vue

```html
<template>
    <div class="mainPage">
        <div class="page-header">
            <img src="@/assets/images/logo.png" class="header-logo" />
            <div class="header-title">后台管理系统</div>
            <div class="header-right">
                <Icon type="ios-contact" />
                <div class="userName">{{loginInfo.userName}}</div>
                <Poptip placement="bottom-end" class="operation">
                    <Icon type="md-arrow-dropdown" class="option-icon"/>
                    <div slot="content">
                        <p class="exit" @click="exit">退出</p>
                    </div>
                </Poptip>
            </div>
        </div>
        <div class="page-body">
            <LeftNav class="body-left" />
            <router-view class="body-right" />
        </div>
    </div>
</template>
<script>
import LeftNav from '@/components/leftNav'
import { getLoginInfo, logout } from '@/api/getData'
import store from '@/store'
export default {
  components: { LeftNav },

  //   路由拦截
  async beforeRouteEnter (to, from, next) {
    // 每次刷新页面新vuex会清空页面，因此需要调用一次获取用户信息接口获取用户信息再存入vuex
    // const { data } = await getLoginInfo()
    // store.commit('setLoginInfo', data)

    // 判断当前路由是否需要登录验证
    const token = window.localStorage.getItem('token')
    if (to.meta.requiresAuth) {
      if (token) {
        // const firstPage = data.roleMenu[0].to
        const firstPage='outInterface'
        console.log(firstPage,'---');
        next({ path: firstPage })
      } else {
        // 将页面路由重定向到登录页进行登录
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
      }
    } else {
      next()
    }
  },
  beforeDestroy () {
    logout()
  },
  computed: {
    loginInfo () {
      return this.$store.state.loginInfo
    }
  },
  methods: {
    exit () {
      this.$Modal.confirm({
        title: '注意',
        content: '是否要退出系统？',
        onOk: () => {
          this.$router.push({ name: 'login' })
          window.localStorage.clear()
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.mainPage {
  position: relative;
  height: 100%;
}
.page-header {
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 1000;
  color: #fff;
  background: #3c435b;
  height: 65px;
  text-align: left;

  > * {
    display: inline-block;
    vertical-align: middle;
    line-height: 65px;
  }
}
.header-logo {
  margin: 0 6px;
}
.header-title {
  font-size: 22px;
  font-weight: bold;
  margin-right: 50px;
}
.header-right {
  float: right;
  background: #565969;
}

.header-right > * {
  display: inline-block;
  line-height: 65px;
  vertical-align: middle;
}

i {
  margin: 0 10px;
  font-size: 30px;
}
.operation /deep/ .ivu-poptip-popper {
  min-width: 110px;
}
.option-icon {
  cursor: pointer;
  margin: 0 10px;
  font-size: 24px;
}
.operation p {
  display: block;
  cursor: pointer;
  color: #3c435b;
  line-height: 36px;
  height: 36px;
  text-align: left;
  padding-left: 20px;
  &:hover {
    background: rgba(221, 236, 255, 1);
  }
}

.page-body {
  height: 100%;
  padding-top: 65px;
  box-sizing: border-box;
}
.body-left {
  float: left;
  height: 100%;
  text-align: left;
  background: #515a6e;
  overflow: auto;
}
.body-right {
  overflow: auto;
}
</style>
```

### home 

- index.vue

```html
<template>
  <h1>home</h1>
</template>

<script>

export default {
  name: 'home',
  data() {
    return {
      
    }
  },
}
</script>
<style lang="scss" scoped>
</style>
```

### login

- index.vue

```html
<template>
<div class="login">
  <div class="login-card">
    <Card>
        <p slot="title" class="login-header">欢迎登陆</p>
        <Form class="login-form" ref="loginForm" :model="formData" :rules="rules" @keydown.enter.native="handleSubmit">
          <FormItem prop="userName">
            <Input v-model="formData.userName" placeholder="请输入邮箱账号">
              <span slot="prepend">
                <Icon :size="16" type="ios-person"></Icon>
              </span>
            </Input>
          </FormItem>
          <FormItem prop="password">
            <Input type="password" v-model="formData.password" placeholder="请输入密码">
              <span slot="prepend">
                <Icon :size="14" type="md-lock"></Icon>
              </span>
            </Input>
          </FormItem>
          <FormItem>
            <Button @click="handleSubmit" type="primary" long>登录</Button>
          </FormItem>
        </Form>
      </Card>
  </div>
</div>
</template>
<script>
import { login } from '@/api/getData.js'
export default {
  data () {
    return {
      loding: false,
      formData: {
        userName: '',
        password: ''
      }
    }
  },
  computed: {
    rules () {
      return {
        userName: [
          { required: true, message: '账号不能为空', trigger: 'blur' }
        ],
        password: [{ required: true, message: '密码不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    async handleSubmit () {
      // 先校验表单输入
      // const flag = await this.$refs.loginForm.validate()
      // if (!flag) return
      // try {
      //   this.loading = true
      //   // 调用登录接口
      //   const { msg, data } = await login({
      //     userName: this.formData.userName,
      //     password: this.formData.password
      //   })
      //   this.$Message.success(msg)
      //   window.localStorage.setItem('token', data.token) // 登录成功后将后台返回的token存到localStorage
      //   // 跳回指的路由
      //   const redirectUrl = decodeURIComponent(this.$route.query.redirect || '/')
      //   console.log(redirectUrl, '------')
      //   this.$router.push({ path: redirectUrl })
      // } catch (e) {
      //   this.$Message.error(e)
      // } finally {
      //   this.loading = false
      // }

      // 登录成功以后，跳转的指定页面
      this.$router.push( '/home' )

      // 无后台接口伪造数据
      // let token = "12345";
      // window.localStorage.setItem("token", token);
      // let redirectUrl = decodeURIComponent(this.$route.query.redirect || "/");
      // this.$router.push({ path: redirectUrl });
    }
  }
}
</script>
<style lang="scss" scoped>
.login {
  width: 100%;
  height: 100%;
  background-image: url("../../../src/assets/images/bg.png");
  background-size: cover;
  background-position: center;
  position: relative;
  &-card {
    position: absolute;
    right: 160px;
    top: 50%;
    transform: translateY(-60%);
    width: 300px;
    &-header {
      font-size: 16px;
      font-weight: 300;
      text-align: center;
      padding: 30px 0;
    }
    &-tip {
      font-size: 10px;
      text-align: center;
      color: #c3c3c3;
    }
  }
}
</style>
```


# 参考资料

[browserslist 详解](https://www.jianshu.com/p/d45a31c50711)

[ESLint 的使用和.eslintrc.js配置](https://www.jianshu.com/p/ad6784d028aa)

[vue.config.js 配置](https://www.jianshu.com/p/b358a91bdf2d)

[vue中mixins的使用方法和注意点（详）](https://www.jianshu.com/p/bcff647d24ec)

* any list
{:toc}