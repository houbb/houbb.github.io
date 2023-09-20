---
layout: post
title:  周志明的架构课-62_Fenix'sBookstore的前端工程
date:   2015-01-01 23:20:27 +0800
categories: [周志明的架构课]
tags: [周志明的架构课, other]
published: true
---



62 _ Fenix's Bookstore的前端工程
你好，我是周志明，现在我们就到了课程的最后一个模块。在上节课的最后，我给你简要介绍过了这个模块的设置目的，也就是建立若干配套的代码工程，作为针对不同架构、技术方案（如单体架构、微服务、服务网格、无服务架构，等等）的演示程序。它们是整个课程中我所讲解的知识的实践示例。这些代码工程的内容不需要录制音频，你可以把它作为实际项目新创建时，可参考引用的基础代码。

这节课的内容是由这些工程的README.md文件同步而来的，不过因为没有经过持续集成工具自动处理，所以可能会有偶尔更新不一致的情况，我建议你可以到这些项目的GitHub页面上去查看最新情况。

* 文档工程：

* [软件架构探索](https://icyfenix.cn/)；
* [Vuepress支持的文档工程](https://github.com/fenixsoft/awesome-fenix)。
* 前端工程：

* [Mock.js支持的纯前端演示](https://bookstore.icyfenix.cn/)；
* [Vue.js 2实现前端工程](https://github.com/fenixsoft/fenix-bookstore-frontend)。
* 后端工程：

* [Spring Boot实现单体架构](https://github.com/fenixsoft/monolithic_arch_springboot)；
* [Spring Cloud实现微服务架构](https://github.com/fenixsoft/microservice_arch_springcloud)；
* [Kubernetes为基础设施的微服务架构](https://github.com/fenixsoft/microservice_arch_kubernetes)；
* [Istio为基础设施的服务网格架构](https://github.com/fenixsoft/servicemesh_arch_istio)；
* [AWS Lambda为基础的无服务架构](https://github.com/fenixsoft/serverless_arch_awslambda)。

在课程最开始的“[导读](https://time.geekbang.org/column/article/309747)”一节课中，我已经说明了“The Fenix Project”的意义。Fenix’s Bookstore的主要目的是展示不同的后端技术架构，相对来说，前端并不是它的重点。不过，前端的页面比起后端的各种服务来是要直观得多的，它能让使用者更容易理解我们将要做的是一件什么事情。

假设你是一名驾驶初学者，合理的学习路径肯定应该是把汽车发动，然后慢慢行驶起来，而不是马上从“引擎动力原理”“变速箱构造”入手，去设法深刻地了解一台汽车。所以，下面我们就先来运行下程序，看看最终的效果是什么样子吧。

## 运行程序

我们通过以下几种途径，就可以马上浏览最终的效果：

* 从互联网已部署（由[Travis-CI](https://travis-ci.com/)提供支持）的网站（由[GitHub Pages](https://pages.github.com/)提供主机），直接在浏览器访问： [http://bookstore.icyfenix.cn/](http://bookstore.icyfenix.cn/)。
* 通过Docker容器方式运行：
$ docker run -d -p 80:80 --name bookstore icyfenix/bookstore:frontend

然后在浏览器访问：[http://localhost](http://localhost/)。

* 通过Git上的源码，以开发模式运行：
/# 克隆获取源码 $ git clone https://github.com/fenixsoft/fenix-bookstore-frontend.git /# 进入工程根目录 $ cd fenix-bookstore-frontend /# 安装工程依赖 $ npm install /# 以开发模式运行，地址为localhost:8080 $ npm run dev

然后在浏览器访问：[http://localhost:8080](http://localhost:8080/)。

![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/%e5%91%a8%e5%bf%97%e6%98%8e%e7%9a%84%e6%9e%b6%e6%9e%84%e8%af%be/assets/1c11b7b4c00c48d98b2a6014ef411390.jpg)

也许你已经注意到了，以上这些运行方式，都没有涉及到任何的服务端、数据库的部署。因为在现代的软件工程里，基于MVVM的工程结构可以让前、后端的开发完全分离，只要互相约定好服务的位置及模型即可。

Fenix’s Bookstore以开发模式运行的时候，会自动使用Mock.js拦截住所有的远程服务请求，并通过事先准备好的数据来完成对这些请求的响应。

同时，你也应当注意到，在以纯前端方式运行的时候，所有对数据的修改请求实际都是无效的。比如用户注册，无论你输入何种用户名、密码，由于请求的响应是静态预置的，所以最终都会以同一个预设的用户登录。也正是因为这样，我并没有提供“默认用户”“默认密码”一类的信息供用户使用，你可以随意输入即可登录。

不过，那些只维护在前端的状态依然是可以变动的，典型的比如对购物车、收藏夹的增删改。让后端服务保持无状态，而把状态维持在前端中的设计，对服务的伸缩性和系统的鲁棒性都有着很大的益处，多数情况下都是值得倡导的良好设计。而其伴随而来的状态数据导致请求头变大、链路安全性等问题，都会在后面的服务端部分专门讨论和解决。

## 构建产品

要知道，当你把程序用于正式部署时，一般不应该部署开发阶段的程序，而是要进行产品化（Production）与精简化（Minification）。你可以通过以下命令，由node.js驱动webpack来自动完成：
/# 编译前端代码 $ npm run build

或者使用–report参数，同时输出依赖分析报告：

/# 编译前端代码并生成报告 $ npm run build --report

编译结果会存放在/dist目录中，你应该把它拷贝到Web服务器的根目录下使用。而对于Fenix’s Bookstore的各个服务端来说，则通常是拷贝到网关工程中静态资源目录下。

## 与后端联调

同样，出于前后端分离的目的，理论上后端通常只应当依据约定的服务协议（接口定位、访问传输方式、参数及模型结构、服务水平协议等）提供服务，并以此为依据，进行不依赖前端的独立测试，最终集成时使用的是编译后的前端产品。

不过，在开发期就进行的前后端联合，在现今许多的企业之中仍然是主流形式，由一个人“全栈式”地开发某个功能时更是如此。所以，当你要在开发模式中进行联调时，需要修改项目根目录下的main.js文件，使其不导入Mock.js，也就是如下代码所示的条件语句判断为假：
//*/* /* 默认在开发模式中启用mock.js代替服务端请求 /* 如需要同时调试服务端，请修改此处判断条件 /*/ // eslint-disable-next-line no-constant-condition if (process.env.MOCK) { require('./api/mock') }

当然，也有其他一些相反的情况，比如需要在生产包中，仍然继续使用Mock.js提供服务时（比如Docker镜像icyfenix/bookstore:frontend就是如此），同样也应该修改这个条件，使其结果为真，在开发模式依然导入了Mock.js即可。

## 工程结构

Fenix’s Bookstore的工程结构完全符合vue.js工程的典型习惯，事实上它在建立时就是通过vue-cli初始化的。这项工程的结构与其中各个目录的作用主要如下所示：
+---build webpack编译配置，该目录的内容一般不做改动 +---config webpack编译配置，用户需改动的内容提取至此 +---dist 编译输出结果存放的位置 +---markdown 与项目无关，用于支持markdown的资源（如图片） +---src | +---api 本地与远程的API接口 | | +---local 本地服务，如localStorage、加密等 | | +---mock 远程API接口的Mock | | | \---json Mock返回的数据 | | \---remote 远程服务 | +---assets 资源文件，会被webpack哈希和压缩 | +---components vue.js的组件目录，按照使用页面的结构放置 | | +---home | | | +---cart | | | +---detail | | | \---main | | \---login | +---pages vue.js的视图目录，存放页面级组件 | | \---home | +---plugins vue.js的插件，如全局异常处理器 | +---router vue-router路由配置 | \---store vuex状态配置 | \---modules vuex状态按名空间分隔存放 \---static 静态资源，编译时原样打包，不会做哈希和压缩

## 组件

Fenix’s Bookstore的前端部分是基于以下开源组件和免费资源构建的：

* [Vue.js](https://cn.vuejs.org/)：渐进式JavaScript框架。
* [Element](https://element.eleme.cn/#/zh-CN)：一套为开发者、设计师和产品经理准备的基于Vue 2.0的桌面端组件库。
* [Axios](https://github.com/axios/axios)：Promise based HTTP client for the browser and node.js。
* [Mock.js](http://mockjs.com/)：生成随机数据，拦截Ajax请求。
* [DesignEvo](https://www.designevo.com/cn)：一款由PearlMountain有限公司设计研发的Logo设计软件。

## 协议

课程的工程代码部分采用[Apache 2.0协议](https://www.apache.org/licenses/LICENSE-2.0)进行许可。在遵循许可的前提下，你可以自由地对代码进行修改、再发布，也可以将代码用作商业用途。但要求你：

* **署名**：在原有代码和衍生代码中，保留原作者署名及代码来源信息；
* **保留许可证**：在原有代码和衍生代码中，保留Apache 2.0协议文件。




# 参考资料

https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/%e5%91%a8%e5%bf%97%e6%98%8e%e7%9a%84%e6%9e%b6%e6%9e%84%e8%af%be/62%20_%20Fenix%27s%20Bookstore%e7%9a%84%e5%89%8d%e7%ab%af%e5%b7%a5%e7%a8%8b.md

* any list
{:toc}
