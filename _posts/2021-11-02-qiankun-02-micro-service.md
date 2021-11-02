---
layout: post
title: qiankun-02-micro front-end 微前端简介
date: 2021-11-02 21:01:55 +0800
categories: [Web]
tags: [web, front-end, micro, sh]
published: true
---

# 微前端

用于构建具有多个可以独立发布功能的团队的现代 Web 应用程序的技术、策略和方法。

# 什么是微前端？

Micro Frontends 一词于 2016 年底首次出现在 ThoughtWorks Technology Radar 中。它将微服务的概念扩展到前端世界。

当前的趋势是构建一个功能丰富且功能强大的浏览器应用程序，也就是单页应用程序，它位于微服务架构之上。随着时间的推移，前端层（通常由一个单独的团队开发）不断增长并且变得更加难以维护。这就是我们所说的前端单体。

微前端背后的想法是将网站或 Web 应用程序视为由独立团队拥有的功能组合。每个团队都有自己关心和专攻的不同业务或任务领域。团队是跨职能的，从数据库到用户界面，端到端地开发其功能。

然而，这个想法并不新鲜。它与自包含系统概念有很多共同之处。在过去，像这样的方法被称为垂直化系统的前端集成。但微前端显然是一个更友好、更简洁的术语。

## Monolithic Frontends

![微前端](https://micro-frontends.org/ressources/diagrams/organisational/monolith-frontback-microservices.png)

## Organisation in Verticals

![E2E](https://micro-frontends.org/ressources/diagrams/organisational/verticals-headline.png)

# 什么是现代 Web 应用程序？

在介绍中，我使用了“构建现代 Web 应用程序”这个短语。 让我们定义与该术语相关的假设。

为了从更广泛的角度来看，Aral Balkan 写了一篇关于他所谓的文档到应用程序连续体的博客文章。 

他提出了滑动比例的概念，其中一个由静态文档构建并通过链接连接的站点位于左端，而一个纯行为驱动的、无内容的应用程序（如在线照片编辑器）位于右侧。

如果您将项目放在此范围的左侧，则网络服务器级别的集成非常适合。 

使用此模型，服务器从构成用户请求的页面的所有组件中收集并连接 HTML 字符串。 

更新是通过从服务器重新加载页面或通过 ajax 替换部分页面来完成的。 

Gustaf Nilsson Kotte 写了一篇关于这个主题的综合文章。

当您的用户界面必须提供即时反馈时，即使是在不可靠的连接上，纯服务器渲染站点也不再足够。 

要实现 Optimistic UI 或 Skeleton Screens 等技术，您还需要能够在设备本身上更新您的 UI。 

Google 的术语 Progressive Web Apps 恰如其分地描述了成为网络的好公民（渐进式增强）同时提供类似应用程序的性能的平衡行为。 

这种应用程序位于站点应用程序连续体中间的某个地方。 

在这里，仅基于服务器的解决方案已不再足够。 

我们必须将集成移动到浏览器中，这也是本文的重点。

# 微前端背后的核心思想

## 技术不可知

每个团队都应该能够选择和升级他们的堆栈，而无需与其他团队协调。自定义元素是隐藏实现细节同时为其他人提供中立界面的好方法。

## 隔离团队代码

即使所有团队都使用相同的框架，也不要共享运行时。构建自包含的独立应用程序。不要依赖共享状态或全局变量。

## 建立团队前缀

就目前无法隔离的命名约定达成一致。

命名空间 CSS、事件、本地存储和 Cookie，以避免冲突并澄清所有权。

## 优先使用本机浏览器功能而不是自定义 API

使用浏览器事件进行通信，而不是构建一个全局的 PubSub 系统。如果您真的必须构建跨团队 API，请尝试使其尽可能简单。

## 构建弹性站点

即使 JavaScript 失败或尚未执行，您的功能也应该很有用。使用通用渲染和渐进增强来提高感知性能。

# DOM 就是 API

自定义元素，来自 Web 组件规范的互操作性方面，是集成在浏览器中的一个很好的原语。

每个团队使用他们选择的 Web 技术构建他们的组件，并将其包装在自定义元素中（例如 `<order-minicart></order-minicart>）`。

此特定元素（标记名称、属性和事件）的 DOM 规范充当其他团队的合同或公共 API。优点是他们可以使用组件及其功能而无需了解实现。他们只需要能够与 DOM 交互。

但是仅自定义元素并不能满足我们所有的需求。为了解决渐进增强、通用渲染或路由，我们需要额外的软件。

此页面分为两个主要区域。首先，我们将讨论页面组合——如何将不同团队拥有的组件组合成一个页面。之后，我们将展示实现客户端页面转换的示例。

# 页面组成

除了用不同框架编写的代码在客户端和服务器端的集成本身之外，还有很多侧面的话题需要讨论：隔离js的机制，避免css冲突，按需加载资源，团队之间共享公共资源，处理数据获取并为用户考虑良好的加载状态。

我们将一步一步地讨论这些主题。

## 基础原型

该模型拖拉机商店的产品页面将作为以下示例的基础。

它具有一个变体选择器，可在三种不同的拖拉机型号之间切换。 

更改产品图片时，会更新名称、价格和建议。 

还有一个购买按钮，可将选定的变体添加到购物篮中，顶部的迷你购物篮会相应更新。

![model store](https://micro-frontends.org/0-model-store/)

所有 HTML 都是使用纯 JavaScript 和 ES6 模板字符串在客户端生成的，没有依赖项。 

代码使用简单的状态/标记分离，并在每次更改时重新渲染整个 HTML 客户端 - 现在没有花哨的 DOM 差异，也没有通用渲染。 

也没有团队分离——代码写在一个 js/css 文件中。

## 客户端集成

在此示例中，页面被拆分为三个团队拥有的单独组件/片段。 

Team Checkout（蓝色）现在负责与购买过程有关的所有事情——即购买按钮和迷你篮。 

Team Inspire（绿色）管理此页面上的产品推荐。 

该页面本身归 Team Product（红色）所有。

![客户端集成](https://micro-frontends.org/1-composition-client-only/)

团队产品决定包含哪些功能以及它在布局中的位置。 

该页面包含可由 Team Product 本身提供的信息，例如产品名称、图像和可用的变体。 

但它也包括来自其他团队的片段（自定义元素）。

## 如何创建自定义元素？

让我们以购买按钮为例。 

团队产品包括一个按钮，只需将 `<blue-buy sku="t_porsche"></blue-buy>` 添加到标记中的所需位置。 

为此，Team Checkout 必须在页面上注册元素 blue-buy。

```js
class BlueBuy extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<button type="button">buy for 66,00 €</button>`;
  }

  disconnectedCallback() { ... }
}
window.customElements.define('blue-buy', BlueBuy);
```

现在，每次浏览器遇到新的 blue-buy 标签时，都会调用 connectedCallback。 

这是对自定义元素的根 DOM 节点的引用。 

可以使用标准 DOM 元素的所有属性和方法，如 innerHTML 或 getAttribute()。

命名元素时，规范定义的唯一要求是名称必须包含破折号 (-) 以保持与即将推出的新 HTML 标签的兼容性。 

在接下来的示例中，使用命名约定 [team_color]-[feature]。 

团队命名空间防止冲突，这样功能的所有权就变得显而易见，只需查看 DOM。

## 亲子通信/DOM修改

当用户在变体选择器中选择另一台拖拉机时，必须相应地更新购买按钮。 

为了实现这个团队产品，可以简单地从 DOM 中删除现有元素并插入一个新元素。

```js
container.innerHTML;
// => <blue-buy sku="t_porsche">...</blue-buy>
container.innerHTML = '<blue-buy sku="t_fendt"></blue-buy>';
```

旧元素的 disconnectedCallback 被同步调用，为元素提供清理事件侦听器之类的机会。 

之后，新创建的 t_fendt 元素的 connectedCallback 被调用。

另一个更高效的选择是仅更新现有元素上的 sku 属性。

```js
document.querySelector('blue-buy').setAttribute('sku', 't_fendt');
```

如果 Team Product 使用具有 DOM diffing 功能的模板引擎，例如 React，则算法会自动完成。

![TP](https://micro-frontends.org/ressources/video/custom-element-attribute.gif)

为了支持这一点，自定义元素可以实现 attributeChangedCallback 并指定应触发此回调的观察属性列表。

```js
const prices = {
  t_porsche: '66,00 €',
  t_fendt: '54,00 €',
  t_eicher: '58,00 €',
};

class BlueBuy extends HTMLElement {
  static get observedAttributes() {
    return ['sku'];
  }
  connectedCallback() {
    this.render();
  }
  render() {
    const sku = this.getAttribute('sku');
    const price = prices[sku];
    this.innerHTML = `<button type="button">buy for ${price}</button>`;
  }
  attributeChangedCallback(attr, oldValue, newValue) {
    this.render();
  }
  disconnectedCallback() {...}
}
window.customElements.define('blue-buy', BlueBuy);
```

为了避免重复，引入了从 connectedCallback 和 attributeChangedCallback 调用的 render() 方法。 

这个方法收集需要的数据和innerHTML的新标记。 

当决定在自定义元素中使用更复杂的模板引擎或框架时，这就是它的初始化代码所在的地方。

## 浏览器支持

上面的示例使用 Chrome、Safari 和 Opera 目前支持的自定义元素 V1 规范。 

但是使用 document-register-element 一个轻量级且经过实战测试的 polyfill 可以在所有浏览器中运行。 

在幕后，它使用了广泛支持的 Mutation Observer API，因此在后台没有进行 hacky DOM 树监视。

## 框架兼容性

因为自定义元素是 Web 标准，所有主要的 JavaScript 框架，如 Angular、React、Preact、Vue 或 Hyperapp 都支持它们。 

但是当你深入细节时，在一些框架中仍然存在一些实现问题。 

在 Custom Elements Everywhere，Rob Dodson 已经整合了一个兼容性测试套件，突出显示了未解决的问题。

## 避免框架无政府状态

使用自定义元素是在各个团队的片段之间实现大量解耦的好方法。 

这样，每个团队都可以自由选择他们选择的前端框架。 

但仅仅因为你可以并不意味着混合不同的技术是一个明智的想法。 

尽量避免微前端无政府状态，并在各个团队之间建立合理的对齐水平。

通过这种方式，团队可以相互分享学习和最佳实践。 当您想要建立一个中央模式库时，它也将使您的生活更轻松。 

也就是说，当您使用遗留应用程序并希望迁移到新的技术堆栈时，混合技术的能力会很方便。

## 父子或兄弟姐妹通信/DOM 事件

但传递属性并不足以满足所有交互。在我们的示例中，当用户点击购买按钮时，迷你篮子应该刷新。

这两个片段都归 Team Checkout（蓝色）所有，因此他们可以构建某种内部 JavaScript API，让迷你篮子知道按钮何时被按下。但这需要组件实例相互了解，并且也会违反隔离。

更简洁的方法是使用 PubSub 机制，其中一个组件可以发布消息，其他组件可以订阅特定主题。幸运的是，浏览器内置了此功能。这正是单击、选择或鼠标悬停等浏览器事件的工作方式。除了本机事件之外，还可以使用 new CustomEvent(...) 创建更高级别的事件。事件总是与它们被创建/分派的 DOM 节点相关联。大多数本地事件还具有冒泡功能。这使得监听 DOM 特定子树上的所有事件成为可能。如果要侦听页面上的所有事件，请将事件侦听器附加到 window 元素。以下是示例中 blue:basket:changed-event 的创建方式：

```js
class BlueBuy extends HTMLElement {
  [...]
  connectedCallback() {
    [...]
    this.render();
    this.firstChild.addEventListener('click', this.addToCart);
  }
  addToCart() {
    // maybe talk to an api
    this.dispatchEvent(new CustomEvent('blue:basket:changed', {
      bubbles: true,
    }));
  }
  render() {
    this.innerHTML = `<button type="button">buy</button>`;
  }
  disconnectedCallback() {
    this.firstChild.removeEventListener('click', this.addToCart);
  }
}
```

迷你篮子现在可以在窗口上订阅此事件，并在刷新数据时收到通知。

```js
class BlueBasket extends HTMLElement {
  connectedCallback() {
    [...]
    window.addEventListener('blue:basket:changed', this.refresh);
  }
  refresh() {
    // fetch new data and render it
  }
  disconnectedCallback() {
    window.removeEventListener('blue:basket:changed', this.refresh);
  }
}
```

通过这种方法，迷你篮子片段将一个侦听器添加到其范围（窗口）之外的 DOM 元素。 

这对于许多应用程序来说应该没问题，但是如果您对此感到不舒服，您也可以实现一种方法，其中页面本身（团队产品）侦听事件并通过在 DOM 元素上调用 refresh() 来通知迷你篮子。

```js
// page.js
const $ = document.getElementsByTagName;

$('blue-buy')[0].addEventListener('blue:basket:changed', function() {
  $('blue-basket')[0].refresh();
});
```

命令式调用 DOM 方法并不常见，但可以在例如视频元素 api 中找到。 

如果可能，应首选使用声明式方法（属性更改）。

# 服务器端渲染/通用渲染

自定义元素非常适合在浏览器中集成组件。 

但是当构建一个可以在网络上访问的站点时，初始加载性能很重要，用户会看到一个白屏，直到所有 js 框架都被下载和执行。 

此外，最好考虑一下如果 JavaScript 失败或被阻止，网站会发生什么。 Jeremy Keith 在他的电子书/播客 Resilient Web Design 中解释了重要性。 

因此，在服务器上呈现核心内容的能力是关键。 

遗憾的是，Web 组件规范根本没有讨论服务器渲染。 

没有 JavaScript，没有自定义元素 :(

## 自定义元素 + 服务器端包括 = ❤️

为了使服务器渲染工作，前面的示例被重构。 

每个团队都有自己的快速服务器，自定义元素的 render() 方法也可以通过 url 访问。

```js
$ curl http://127.0.0.1:3000/blue-buy?sku=t_porsche
<button type="button">buy for 66,00 €</button>
```

自定义元素标记名称用作路径名称 - 属性成为查询参数。 

现在有一种方法可以服务器渲染每个组件的内容。 

结合 `<blue-buy>`-Custom Elements 可以实现非常接近通用 Web 组件的东西：

```xml
<blue-buy sku="t_porsche">
  <!--#include virtual="/blue-buy?sku=t_porsche" -->
</blue-buy>
```

#include 注释是服务器端包含的一部分，这是大多数 Web 服务器中可用的功能。 

是的，这与过去在我们的网站上嵌入当前日期所使用的技术相同。 

还有一些替代技术，如 ESI、nodesi、comoxure 和定制，但对于我们的项目，SSI 已证明自己是一种简单且极其稳定的解决方案。

在 Web 服务器将完整页面发送到浏览器之前，#include 注释将替换为 /blue-buy?sku=t_porsche 的响应。 

nginx中的配置是这样的：

```js
upstream team_blue {
  server team_blue:3001;
}
upstream team_green {
  server team_green:3002;
}
upstream team_red {
  server team_red:3003;
}

server {
  listen 3000;
  ssi on;

  location /blue {
    proxy_pass  http://team_blue;
  }
  location /green {
    proxy_pass  http://team_green;
  }
  location /red {
    proxy_pass  http://team_red;
  }
  location / {
    proxy_pass  http://team_red;
  }
}
```

指令 ssi: on; 启用 SSI 功能，并为每个团队添加一个上游和位置块，以确保所有以 /blue 开头的 url 将路由到正确的应用程序 (team_blue:3001)。 

另外/路由映射到团队红色，它控制主页/产品页面。

该动画展示了浏览器中禁用 JavaScript 的拖拉机商店。

![image](https://micro-frontends.org/ressources/video/server-render.mp4)

变体选择按钮现在是实际链接，每次点击都会导致页面重新加载。 

右侧的终端说明了如何将页面请求路由到团队红色的过程，红色团队控制产品页面，然后标记由团队蓝色和绿色的片段补充。

当重新打开 JavaScript 时，只有第一个请求的服务器日志消息将是可见的。 

所有后续的拖拉机更改都在客户端处理，就像在第一个示例中一样。 

在后面的示例中，产品数据将从 JavaScript 中提取并根据需要通过 REST api 加载。

您可以在本地机器上使用此示例代码。 

只需要安装 Docker Compose。

```
git clone https://github.com/neuland/micro-frontends.git
cd micro-frontends/2-composition-universal
docker-compose up --build
```

然后 Docker 在端口 3000 上启动 nginx 并为每个团队构建 node.js 映像。 

当您在浏览器中打开 http://127.0.0.1:3000/ 时，您应该会看到一个红色的拖拉机。 

docker-compose 的组合日志可以很容易地查看网络中正在发生的事情。 遗憾的是没有办法控制输出颜色，所以你必须忍受团队蓝色可能以绿色突出显示的事实:)

src 文件被映射到各个容器中，当您进行代码更改时，节点应用程序将重新启动。 

更改 nginx.conf 需要重新启动 docker-compose 才能生效。

所以请随意摆弄并提供反馈。

## 数据获取和加载状态

SSI/ESI 方法的一个缺点是，最慢的片段决定了整个页面的响应时间。 

所以最好是可以缓存片段的响应。 

对于生产成本高且难以缓存的片段，将它们从初始渲染中排除通常是个好主意。 

它们可以在浏览器中异步加载。 

在我们的示例中，显示个性化推荐的 green-recos 片段是一个候选对象。

一种可能的解决方案是红队只是跳过 SSI 包含。

- before

```xml
<green-recos sku="t_porsche">
  <!--#include virtual="/green-recos?sku=t_porsche" -->
</green-recos>
```

- after

```xml
<green-recos sku="t_porsche"></green-recos>
```

渲染只发生在浏览器中。但是，从动画中可以看出，这种变化现在引入了大量的页面回流。推荐区域最初是空白的。球队果岭 JavaScript 被加载并执行。进行用于获取个性化推荐的 API 调用。呈现推荐标记并请求关联的图像。该片段现在需要更多空间并推动页面布局。

有不同的选项可以避免像这样烦人的回流。控制页面的红色团队可以固定推荐容器的高度。在响应式网站上，确定高度通常很棘手，因为不同的屏幕尺寸可能会有所不同。但更重要的问题是，这种团队间的协议在红队和绿队之间造成了紧密的耦合。如果绿队想在 reco 元素中引入一个额外的副标题，它必须在新的高度上与红队协调。两个团队都必须同时推出他们的更改，以避免破坏布局。

更好的方法是使用一种称为骨架屏幕的技术。红色团队将绿色-recos SSI 包含在标记中。此外，绿色团队更改了其片段的服务器端渲染方法，以便生成内容的示意图版本。骨架标记可以重用部分真实内容的布局样式。这样它就保留了所需的空间，实际内容的填充不会导致跳转。

骨架屏幕对于客户端渲染也非常有用。 当您的自定义元素由于用户操作而被插入到 DOM 中时，它可以立即呈现骨架，直到它需要来自服务器的数据到达为止。

即使在像变体选择这样的属性更改时，您也可以决定切换到骨架视图，直到新数据到达。 通过这种方式，用户可以得到片段中正在发生的事情的指示。 

但是，当您的端点快速响应时，新旧数据之间的短暂骨架闪烁也可能令人讨厌。 

保留旧数据或使用智能超时会有所帮助。 所以明智地使用这种技术并尝试获得用户反馈。

# 参考资料

https://micro-frontends.org/

* any list
{:toc}