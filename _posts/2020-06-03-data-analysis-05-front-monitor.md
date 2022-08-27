---
layout: post
title: 数据分析-05-前端埋点介绍
date:  2020-6-3 13:34:28 +0800
categories: [Data]
tags: [data, data-analysis, monitor, apm, sh]
published: true
---

# 前端 or 后端？

埋点技术除了刚才的方式划分，还可以划分为前端埋点和后端埋点，后端埋点数据更可靠、更集中（且没有前端的多端问题）、更实时。

这篇文章主要是讨论前端埋点。

根据工作中对埋点的对比和整理，我们简单比较部分埋点方案：

对于语义明确的UI事件，自动埋点的数据一般会比手动埋点更加准确，更贴近用户行为，也更节省开发成本，侵入性更低。

主要是因为自动埋点语义简单明确，不像手动埋点由于开发习惯、代码风格、人的理解误差、分支处理等各种不确定因素变得没那么清晰明了。

比如：“下单”事件，自动埋点的PV肯定是>=手动埋点的，而UV差别可能不大。分析开发代码发现在onClick Listener中包含其他未覆盖到的分支，差别很可能就在代码分支当中。如果更进一步分析下代码可以发现，为什么开发不在分支当中埋点？可能这个分支会认为用户的这一次点击是“无效”的，但这只是程序逻辑的看法，用户可能不这么认为，用户很可能会觉得很奇怪没反应，然后再点一次。这些手动埋点不易察觉的细节，自动埋点都能记录，所以说，自动埋点在这些情况下会更贴近真正的用户行为。

自动埋点可降低原来手动埋点的个数和复杂性，使之更简化

比如：进入“商品详情页面”（展现），目前包括5个手动埋点，实际上用自动埋点只需要一个就够了，而且自动埋点不会遗漏。从数据来看，一个自动埋点的PV已经超过5个手动埋点之和。

自动埋点可采集界面环境数据，但是数据不够纯，需要进一步去噪
自动埋点能采集到大部分用户“看到的而且有用数据”。比如：“价格”这一属性，手动埋点可直接定义“amout: 5.2“来轻松获取数据，而自动埋点获取的是一串文本： “价格预估5.2元”，若要获取精确的5.2这个数值，就需要进一步解析。

自动埋点无法替代手动埋点，但可大大减少手动埋点工作量可预想的是，在用户行为分析上，自动埋点可以满足很大一部分需求函数级的埋点无法用自动埋点代替，后台非UI的事件也无法用自动埋点代替，自动埋点无法携带当时的业务场景数据，这些都表明了自动埋点无法完全替代手动埋点。

但单就用户行为分析来讲，自动埋点是可以覆盖用户的一些基本行为路径的，并能做一些较浅层次的分析。如果需要探究用户行为背后的原因、或需要进一步深入分析行为的时候，就是需要更多的后台逻辑事件、需要携带更多属性值的时候，就需要通过手动埋点来完成。所以，但是深层次的分析是你的重点，就需要使用手动埋点来解决。

埋点类型虽然当前也就这几类解决方案，而且真实的使用请求会根据业务混合使用多种埋点类型。但是我们除了选择好埋点类型外，要展开埋点工作，面临的沟通协调，如何准确多团队达成共识，并确保各方对业务和埋点深度理解，做要的工作和面临的挑战会更大。想要做好埋点工作，埋点需求的整理很重要，且需要遵守一定的原则，所以我们引用滴滴内部Omega团队针对这些原则的整理（本来很多内容均采用了Omega团队的日常工作整理，Omega是滴滴内部服务的强大数据采集和分析平台，期待Omega开源或开放的一天，在此感谢滴滴Omega团队的深度沉淀）：

# 埋点需求整理

原则是基于一系列问题展开，并基于这些问题确定埋点需求，我作为FE的RD，针对这些原则，虽然至今也没有真正全面的做到，但是如果遵循这些原则，将会受益良多（也欢迎大家补充问题内容），当你能清楚的回答这些问题，埋点工作将会更顺利的开展：

3个H，5个W

## HOW LONG：

埋点可用周期是多久，持续几个版本可以？

生命周期结束后是否可以考虑下掉？

## HOW MUCH：

现有的埋点哪些可以满足我的部分埋点需求？

哪些现有的埋点可以替代我要的部分埋点？

新的埋点有多少？这些埋点是否是最必要的？

## HOW：

怎样证明新功能效果？

需要哪些埋点？

我该怎么埋这些点？

部分埋点的计算逻辑是什么？

数据结果怎么看？漏斗？同环比？

## WHO：

我的产品设计面对的用户群里是谁？

用户特征是什么？

这部分特征用户对功能预期的数据结果是什么？

用户习惯是什么？

## WHAT：

我的新产品是什么？

新产品包含哪几个模块？

## WHY：

涉及新产品的目的是什么，为了解决什么问题？

## WHERE：

新功能展示在产品端的哪个位置？

在哪些版本生效？

哪些功能的展示或作用在哪里需要跟服务端等交互？

## WHEN：

功能是在用户场景什么时候调用产生？

调用过程中什么时候和服务端交互？

功能调用正常情况下需要大概需要多长时间？

什么情况会影响调用结果？

调用有风险的时候，是否需要加监测？

理清楚了埋点的思路，要让埋点顺利进行，且不影响线上功能，则需求严格的埋点规范和治理方案。

# 埋点规范

某些企业，保守估计，手动埋点的错误率可能会高达50%，比如一些简单页面的进入应该埋在 viewDidAppear（didMount...），按钮点击应该埋在 onClickListener等等都经常被开发弄错。

埋点工作本身并不难，是纯粹的体力活，但是要展开一个好的埋点工作，需要BI先梳理，然后再传达给RD，然后RD再去开发实现，最后应该经过测试验收，因为没有统一的标准，每个人的理解不一样，就很容易弄错，后面会和大家在详细聊聊埋点规范的问题。

我们了解的一些大公司，像Facebook等硅谷公司已经将埋点看得与产品设计同等重要，新功能还在设计阶段就先把衡量指标及埋点梳理好，而具体负责埋点的RD也是团队中最资深的RD（如果不是专职的话），RD需要每天不断的与BI沟通确保语义一致。

而我待过的滴滴、陆金所等公司的现状是，埋点的RD很多时候都是随机任务分工的，甚至经常被安排给实习生，埋点质量难以保证。

还有一种情况是产品为了快速上线需求，一味追求上线速度，在需求评审阶段没有梳理和提出埋点需求，上线后临时插入埋点需求，在未经过分析理解和测试验收的情况下匆匆加入埋点代码，而且测试经常也不重视测试（提出免测），导致埋点错误，甚至是业务代码错误等线上问题。

这种情况下自动埋点既能减少沟通开发的工作量，又能降低埋点出错的概率。

所以，自动埋点更适合公司在埋点规范没有完全建立，埋点质量普遍不高的阶段。但是公司体量到一定程度后，RD和产品经理将会更频繁的和手动埋点接触，我们作为一个手动埋点的深度用户团队，谈谈我自己的对手工埋点的痛点梳理：

- 埋点混乱

- 常常埋错，漏埋

- 业务变化后，老埋点数据失去意义

- 埋点数据无人使用，浪费资源

- 数据团队、研发团队、产品团队协作配合难度大

- 很多时候不太重视数据，而是重视业务的快速上线

- 埋点语义不明确，同一个按钮存在多种描述，不易检索

- 无用/重复埋点太多，干扰了正常埋点数据

- 大量存量埋点Owner离职或者转岗，导致大量僵尸埋点信息

那么如何避免以上问题呢？建立一个好的规范非常重要，包括命名规范和流程规范

# 埋点命名规范

我们当前的做法是埋点名称只能是由字母、数字、下划线组成，并保证在应用内唯一，比如sw是展示，ck是点击。

常用规则的举例如下：

比如行为埋点：`{团队|业务|角色}_{组件|页面}_{具体元素}_{动作}`

示例：

```
yourteam_fc_all_msg_ck
autoplatform_flowtab_sw ： autoplatform代表业务线，flowtab 代表功能，sw代表页面操作，sw是展示，ck是点击
uber_comt_share_ck ：uber业务线，comt评价组件，share分享按钮，ck点击
```

# 埋点流程规范

如果你发现每天有大量埋点错误反馈，并导致很多错误的分析结论，一个错误的分析结果还不如没有数据分析结果。

造成这个问题的原因包括：

1. 前端埋点涉及复杂的交互，难以找准埋点位置；

2. 埋点的验收流程不完善，没有经过测试和产品经理的测试和验收，验证不完备；

好的埋点需求应该和业务功能需求同等重要，也需要经历软件开发的整个生命周期，如果能严格按照一个规范的流程处理埋点，以上问题会得到更好的解决。

# 规范内容

## 需求阶段：

确定埋点信息，核心包括五方面信息：事件ID、埋点名称、埋点描述、埋点属性以及截图。

举例：

- 快车页面打车的埋点信息为：

- 埋点ID为：gulf_p_f_home_order_ck

- 埋点名称为：呼叫快车

- 埋点描述：在快车首页点击呼叫快车按钮。

如何落地：

如果不按照规则和流程埋点将不会上报相关数据，制定强制规定。

开发什么功能：

埋点全文检索能力、自动找到重复埋点（语义相近或者数据相近）功能。

## 开发阶段：

务必和开发沟通，并让开发在完全理解业务语义的情况下，在前端按照埋点代码规范进行埋点。

举例：

比如针对商品购买按钮，在前端点击方法的第一行调用SDK，最好也传入文本字面描述。

如何落地：

静态代码检查。

开发什么功能：

开发探测每个埋点对应到的代码文件和代码行，开发根据人均事件量级进行监控报警功能。

## 测试阶段：

务必和测试沟通，并让测试在完全理解业务语义的情况下，通过CodeReview和埋点测试两种方式对埋点正确性进行验证。

举例：

比如针对商品购买按钮埋点，需要检查埋点测试中上传数据中事件ID、属性是否符合定义，另外触发时机是否正确。

如何落地：

规定如果未经测试的埋点不允许上报埋点数据。

开发什么功能：

提供所见即所得的埋点测试平台。

## 验收阶段：

确保相关人员在完全理解业务语义的情况下，可以通过与自比较和他比较的方式来进行验证。

举例：

- 自比较验证：同一APP某一个业务线的购买冒泡数量一定要小于所有业务线的冒泡数合计；

- 他比较验证：前端某业务点数量和对应服务端数据应该基本相当。

如何落地：

规定如果未经验证的埋点不允许上报埋点数据。

开发什么功能：

提供埋点实时数据查询。

## 清理阶段：

确认完全理解语义的情况下，可对业务发生巨大变化或者不在维护的埋点进行废弃。

举例：

百度糯米合并饿了么后，埋点在经历产品大改版后已经和其他业务线合并，需要废弃之前的遗留埋点。

如何落地：

3个月以上未被使用的埋点、1个月以上数据为0的埋点自动废弃。3个月后使用次日会自动开启采集。

开发什么功能：

根据规则提供针对未使用埋点的计算、并自动废弃。

可以看出，规范要落地，需要整个公司的共识，也需要从上而下的压力，还有强势的制度。比如针对全公司个部门做评分，评分规则基于埋点和数据分析抽象出来。

# 注意事项

另外我们在前端埋点中也遇到过一些注意事项，整理如下，希望对大家有所帮助。

## 一些埋点安全性问题：

如果你使用普通的http 协议，在数据传输的过程存在被劫持(包括不限于：JS代码注入等)的可能性，造成H5页面中出现诸如：未知的广告或者原网页被重定向等问题。

为了降低此类事件发生的可能性，建议最好使用https 协议（倡导全站https），以确保数据传输过程的完整性，安全性。

## 版本迭代的时候埋点需要注意什么？

- 如果是公用模块，可以非常放心安全的全量迁移埋点；

- 如果是新增模块，那就需要注意是否遵循了最新的埋点规范，有没有重复的埋点命名存在，埋点是否符合业务逻辑；

- 如果是下线模块，那就需要评估下线后对数据的影响范围，而且要第一时间充分周知相关方，让各方参与评估；

- 如果是更新模块，需要评估在原有埋点上需要修改的埋点内容，是否需要重新埋点，删除不需要的埋点，而且要修改功能的数据承接。

# 关于埋点上报的解决方案

一般会实现上个模块，Event收集器，Event缓存器，和Event上报器。

## Event上报模式

除了用户个人不希望耗费流量以外，也可能会因为弱网及断网情况，如果确保数据不丢失，基于这些问题而诞生的上传策略，来设计如何上报已收集的所有事件数据。

上报一般包括针对内存实时数据的上报和本地持久化数据上报两个部分，分别介绍一下它们的上报策略与实现方式：

## 内存埋点数据的实时上报

针对内存埋点数据的上报策略一般如下：

- 基于时间间隔：每隔 n秒（时间间隔可以根据公司的业务情况自定义）

- 基于数据条数：每累积 n条数据（条数可以自定义）

- 不间断实时上报，如果是低频率，数据量小，实时性要求高的数据可以不设限制


上述条件满足时，便会触发从内存中读取数据，并执行上传操作。Native可以创建了一个并发队列，H5会基于浏览器并发发送。

## 本地持久化数据的延迟上报

为了尽早的上传本地持久化埋点数据，以防用户卸载 App或者关闭浏览器造成本地数据的丢失，针对本地持久化数据的上传策略如下：

Native相关：

    App 冷启动

    App 进入前台

    App入后台

HTML5、Hybrid相关：

    localstorage，浏览器关闭埋点数据并不会被删除，如果用户再次访问，会启动上报

    基于Native提供的bridge，让Native帮忙持久化数据，并在再次进入时，启动上报

这里也可以创建一个单独的串行队列，来实现对本地持久化数据的逐个上报。


# 埋点统计数据

## 用户访问统计

用户访问统计包含 PV（Page View）、UV（Unique Visitor）、VV（Visit View）、IP 等。

PV 用来统计一天之内页面的被访问次数，机刷也可以造成 PV 数据提升。UV 用来统计一天之内访问页面的用户数量，一般使用 IP 统计（IP 统计并不谨慎，同一个办公区或校园公用一个 IP）；

使用 cookie + IP 统计（cookie 会被刷新，造成用户数被重复统计）；

使用 userAgent + API 统计（userAgent + API 相同的情况也常有发生）。

UV 统计的细化点是新访客数、新访客比率等。

VV 用来统计一天之内网站被用户访问的次数；用户访问网站到结束访问视为 1 次，因此同一个用户在一天之内可能造成多条 VV。

IP 用来统计一天之内访问网站的不重复 IP 数。

## 用户行为分析

用户行为分析包含页面点击量、用户点击流、用户访问路径、用户点击热力图、用户转化率、导流转化率、用户访问时长分析和用户访问内容分析等。

用户点击量用来统计用户在某个可点击或可操作区域的点击或操作次数。

用户点击流用来统计用户在页面中发生点击或操作动作的顺序；

埋点过程中，可先用 localStorage 存储用户点击或操作行为的唯一 id，然后在一次 VV 结束或下一次 VV 开始时上报。

用户访问路径用来统计用户访问页面的路径。

用户点击热力图用来统计用户在一张页面中的点击热衷区域；埋点过程中，可以对 document 点击绑定 click 事件，并上报 e.pageX、e.pageY 数据。用户转化率指的是访问页面的注册用户数和页面 PV 的比值。

导流转化率指的是导流页面 PV 和源页面 PV 的比值。

用户访问时长用来统计用户在关键内容页面的停留时长，以便分析用户是否对内容感兴趣。

## 埋点方案

前端埋点分为：代码埋点、可视化埋点、无痕埋点三种。

前端埋点又可以分为三类埋点方法:代码埋点，可视化埋点和无埋点。

![埋点](https://pic4.zhimg.com/80/v2-092f46511654e5f687a3f940d1a8aed3_720w.jpg)

代码埋点即侵入式埋点，可以在任意时刻、任意位置精确地发送数据，但是工作量较大，对业务代码也有较大影响。

可视化埋点即以业务代码为输入，通过可视化系统配置埋点，最后以耦合的形式输出业务代码和埋点代码，但是可视化系统的埋点控件有限，并不能充分满足埋点需求。

无痕埋点即无差别地对所有事件等进行全埋点，但是没法定制埋点需求。

![埋点方案](https://pic1.zhimg.com/80/v2-d1ab1f15c99c36320435f001e65ac588_720w.jpg)

## 埋点上报数据

上报的主要数据包含：

appid、userAgent、timestamp（上报的时间戳）、currentUrl（用户当前的 url）、fromUrl（前一个页面的 url）、type（上报事件的类型）、element（触发上报事件的元素）、data（自定义数据）等。

数据可通过 OpenSSL 或 crypto 模块进行加密。

```js
{   
  // 上报接口本身提供
  currentUrl,  
  fromUrl,
  timestamp,
  userAgent: {
    os,
    netWord,
  }
  // 业务代码配置和自定义上报数据
  type,
  appid,
  element,
  data: {
    uid,
    uname
  }
}
```

- 数据

```
type - 上报类型
appid - 设备id
screen - 屏幕信息
userAgent - 浏览器信息
userInfo - 用户身份信息
timestamp - 上报时间
document.referrer - 访问来源
action - 上报事件的动作类型
element - 触发上报的元素
地理位置
访问渠道
以及其他自定义数据params等等
```

# 代码埋点

## 使用第三方sdk埋点

如百度统计、友盟、TalkingData、Google Analytics、Sensors Analytics等都提供了这一方案。

使用相对简单，在APP或者界面初始化的时候，初始化第三方数据分析服务商的SDK，然后在某个事件发生时就调用SDK里面相应的数据发送接口发送数据。

例如，我们想统计APP里面某个按钮的点击次数，则在APP的某个按钮被点击时，可以在这个按钮对应的 OnClick 函数里面调用SDK提供的数据发送接口来发送数据。

除此针对特定需求也可以统一封装数据上报通用sdk，各页面各业务模块按需调用，同时埋点的形式也是多种多样的

## 基于事件点击埋点

```js
// 上报sdk
export const sdk = {
  params: null,
  initParams() {
    const params={};
    params.domain = document.domain || '';
    params.title = document.title || '';
    params.referrer = document.referrer || '';
    params.sw = window.screen.width || 0;
    params.sh = window.screen.height || 0;
    params.lang = navigator.language || '';
    params.ua = navigator.userAgent || '';
    params.loadT = window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart || 0;
    params.timestamp= new Date();
    sdk.params = params;
  },
  report(params = {}) {
    // 上报
     if(!sdk.params){
        sdk.initParams();
    }
    const _params = merge({},sdk.params,params);
    request('/api/report',{params:_params});
  }
};

// react wapper组件式
// 封装埋点包裹组件
export default function TrackerClick(props) {
  const { children, type } = props;

  return React.Children.map(children, child => {
    React.cloneElement(child, {
      onClick: (e) => {
        const originClick = child.props.onClick;
        typeof originClick==='function' && originClick.call(child, e);
        sdk.dispatch({type});
      }
    })
  });
}

// 页面使用
<TrackerClick type="namespace.click">
    <Button onClick={handleClick}>查看</Button>
</TrackerClick>
```

```html
// 通用方式
//上报事件的绑定类型对应的绑定名称
const REPORT_EVENT_FUNC = 'data-reporteventfunc';
//上报事件数据对应的绑定参数名称
const REPORT_EVENT_DATA = 'data-reporteventdata';
document.body.addEventListener('click',function(e){
   if(e.target.getAttribute(REPORT_EVENT_FUNC)==='click'){
        const str=e.target.getAttribute(REPORT_EVENT_DATA);
        sdk.report(JSON.stringify(str));
   }
})

// 页面-react
<span 
    data-reporteventfunc="click" 
    data-reporteventdata={JSON.stringify({code:1,id:2})}></span>
// 页面-vue
<span 
    data-reporteventfunc="click" 
    :data-reporteventdata="JSON.stringify({code:1,id:2})"></span>
```

```js
// 使用装饰器，剥离埋点与业务逻辑实现上的耦合，实现低侵入埋点
@tracker((params)=>request('/api/report',{params}))
click(params){
 // click业务...
}

const tracker = partical=>(target, key, descriptor)=>{
    if (typeof partical!=='function') {
        throw new Error('tracker arguments is not a function ' + partical)
    }
    const oldValue=descriptor.value;
    descriptor.value=function(...args){
        partical.apply(this,args);
        return oldValue.apply(this,args);
    }
    return descriptor;
}
```

## 页面访问埋点-统计页面曝光时长

```js
// Vue中通过mixin
beforeRouteEnter(to, from, next) {
    this.enterTime=+ new Date();
},
beforeRouteLeave(to, from, next) {
     sdk.report({
         type: 'visit',
         name: to.name,
         enterTime: this.enterTime,
         leaveTime: +new Date(),
         params: {
             from: {
                 name: from.name,
                 path: from.path,
                 query: from.query
             },
             to: {
                 name: to.name,
                 path: to.path,
                 query: to.query
             },
         } 
     })
}
```

传统基于DOMContentLoaded、beforeunload、onload等也可以实现

## css 埋点

```html
<style>
.tracker:active::after{ 
    content: url("http://www.yzw.com/api/tracker/report?action=yourdata"); 
}
</style>
<a class="tracker">点击我，会发埋点数据</a>
```

## 埋点数据上报的形式

### xhr上报

适用于需要接受数据上报后的返回结果进行回调处理

### img/iframe/script上报

```js
sdk.report=(params){
    // 1.img标签
    var img = document.createElement("img");
    img.src = '/api/report?' + querystring.stringify(params);
    // 2.img对象
    const img = new Image();
    img.src='/api/report?' + querystring.stringify(params);
    // 3.script标签
    var script = document.createElement("script");
    script.src = src;
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
}
```

# 可视化埋点

方案有Mixpanel、TalkingData、诸葛IO、腾讯MTA，Sensors AnalyticsV1.3+等

可视化埋点通常流程为：

```
输入页面的url =>
页面加载完成后 =>
配置可视化的工具 =>
点击创建事件（click） =>
进入元素选择模式 =>
用鼠标点击页面上的某个元素（例如button、a这些element）=>
就可以在弹出的对话框里面 =>
设置这个事件的名称（比如叫TEST），选上报数据属性（properties）=>
保存配置 =>
用户访问点击按钮 =>
数据上报
```

其中针对元素标记多是利用xpath，是在xml文档中查找信息的语言，如下所示

```js
const getPath = function (elem) {
     if (elem.id != '') {
        return '//*[@id="' + elem.id + '"]';
     } 
     if (elem == document.body) {
        return '/html/' + elem.tagName.toLowerCase();
     } 
     let index = 1, siblings = elem.parentNode.childNodes;
     for (const i = 0, len = siblings.length; i < len; i++) {
        const sibling = siblings[i];
         if (sibling === elem) {
            return arguments.callee(elem.parentNode) + '/' + elem.tagName.toLowerCase() + '[' + (index) + ']';
         } else if (sibling.nodeType === 1 && sibling.tagName === elem.tagName) {
            index++;
         } 
     }
 }
```

通过上述方法，当我们点击某个元素时，将触发的元素event.target传入，即可得到完整的xpath。

如果将其换做dom的选择器，类似：div#container>div:nth-of-type(2)>p:nth-of-type(1)，由此，可以定位到具体的DOM节点




# 前端埋点原理图：

![前端埋点](https://img-blog.csdnimg.cn/20200101205052420.png)

如上所示，从broswer到page，再到javascript以及后端backend，浏览器返回正常程序运行结果，本地文件中返回最终的log，这很像是在用户程序中埋下了一段“暗代码”，无形之中“窃取”了用户的行为信息，淘宝、网易等都有这样的功能。

可以参考google做的Google Analysis这块产品）

步骤：

- 埋点阶段

- 数据收集阶段

- 后端处理阶段

如上，针对“前端埋点”，主要分为这么三部，对应到上面的原理图，步骤一即（create script element），步骤二即collect client data，步骤三即backend和log.

下面，分别按照上述三步来展示代码：

## 埋点阶段

```js
<script type="text/javascript">
    var _maq = _maq || [];
    _maq.push(['_setAccount', 'uuid']);
    (function () {
        var ma = document.createElement('script');
        ma.type = 'text/javascript';
        ma.async = true;
        ma.src = "http://localhost:8091/data/js/ma.js";
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(ma, s);
    })();
</script>
```

这里是正常的jsp、html页面，在页面的下端，往往插入一小段js代码，即我们的“埋点”，如上所示，“埋点”中的全局数组，用于收集该页面中需要被回传的用户行为，比如：域名、ip、url、搜索的内容、常按的按钮名称……，（这里暂时通过‘_setAccount’来传递了一个值为‘vincent’的用户名）

之后匿名的js函数，是埋点代码的重中之重，如上代码所示，在Dom节点添加名为‘script’的元素，设置"ma.async = true"，表示让其异步执行，并将其src属性指定为一个单独的js文件（将ma.js引入进来），最终将该element插到当前Dom树上。

而这个过程最终的目的即请求并执行上述的ma.js文件。

## 数据收集阶段

```js
(function () {
    var params = {};
    //Document对象数据
    if (document) {
        params.domain = document.domain || ''; //获取域名
        params.url = document.URL || '';       //当前Url地址
        params.title = document.title || '';
        params.referrer = document.referrer || '';  //上一跳路径
    }
    //Window对象数据
    if (window && window.screen) {
        params.sh = window.screen.height || 0;    //获取显示屏信息
        params.sw = window.screen.width || 0;
        params.cd = window.screen.colorDepth || 0;
    }
    //navigator对象数据
    if (navigator) {
        params.lang = navigator.language || '';    //获取所用语言种类
    }
    //解析_maq配置
    if (_maq) {
        for (var i in _maq) {                      //获取埋点阶段，传递过来的用户行为
            switch (_maq[i][0]) {
                case '_setAccount':
                    params.account = _maq[i][1];
                    break;
                default:
                    break;
            }
        }
    }
    //拼接参数串
    var args = '';
    for (var i in params) {
        // alert(i);
        if (args != '') {
            args += '&';
        }
        args += i + '=' + params[i];           //将所有获取到的信息进行拼接
    }
    //通过伪装成Image对象，请求后端脚本
    var img = new Image(1, 1);
    var src = 'http://localhost:8091/data/dataCollection/log.gif?args=' + encodeURIComponent(args);
    alert("请求到的后端脚本为" + src);
    img.src = src;
})();
```


如上代码所示，是ma.js文件中的代码，如上我做的注释，可以将这个过程分为3步骤;

1. 解析、获取用户各种信息，如上：1.通过dom树，获取到的url，域名，上一跳信息；2.通过windows，获取到的显视屏的分辨率、长宽（前两类通过内置的js对象获取）；3.通过_maq全局数组，获取埋点时埋下的用户行为数据。

2. 将上步的用户信息按特定格式拼接，装到args这个参数中。

3. 伪装成图片，请求到后端controller中，并将args作为http request参数传入，做后端分析。

之所以使用图片请求后端controller而不是ajax直接访问，原因在于ajax不能跨域请求，ma.js和后端分析的代码可能不在相同的域内，ajax做不到，而将image对象的src属性指向后端脚本并携带参数，就轻松实现了跨域请求。

## 后端处理阶段

```java
@Controller
@RequestMapping("/dataCollection")
public class DataCollection {
    @RequestMapping(value = "log.gif")
    public void analysis(String args, HttpServletResponse response) throws IOException {
        System.out.println(args);
         
		//日志收集 
        response.setHeader("Pragma", "No-cache");
        response.setHeader("Cache-Control", "no-cache");
        response.setDateHeader("Expires", 0);
        response.setContentType("image/gif");
        OutputStream out = response.getOutputStream();
        BufferedImage image = new BufferedImage(1, 1, BufferedImage.TYPE_INT_RGB);
        ImageIO.write(image, "gif", out);
        out.flush();
    }
}
```

如上所示， 通过解析http request中的参数，即将在前端获取到的用户信息拿到了后端，这个为了验证，将其打印到控制台，接下来就是做日志收集工作了，到此前端获取用户信息已经完成。

之后，生成一副1×1的空gif图片作为响应内容并将响应头的Content-type设为image/gif，返回到前端代码中。

至此，前端埋点的实现以及原理就ok了，包括Google Analytics也是这么个原理来做的。

目前我跑的程序已经收集到了用户的行为信息，但是存在一个问题就是用户删除cookie信息，比如清楚浏览器缓存，会造成收集到的数据比实际访问的行为数据要多得多，这个问题接下来会继续深入研究。


这个程序已经上传到我的GitHub上，感兴趣的朋友可以去下载，另外感谢网络上的关于这块的资料贡献者，能让我对行为分析有深入的认识，多谢。

# 成熟解决方案

## mixpanel

![mixpanel](https://pic2.zhimg.com/80/v2-df42c493e1d571b6f7478f5aa4c396a1_720w.jpg)

按我的个性化解读，mixpanel 分为三层结构：

基本工具层：提供类型判断、遍历、继承、bind 等基本的工具函数；json、base64、utf8 编解码能力；url 参数读写函数；cookie、localStorage 读写能力；dom 事件绑定能力；dom 节点查询能力；info 浏览器信息获取能力。

功能模块层：提供基于 DomTracker 实现的 LinkTracker 跳链接埋点、FormTracker 提交数据埋点功能；autotrack 自动埋点功能；基于 cookie 或 localStorage 的 MixpanelPersistence 持久化功能；MixpanelNotification 提示功能；gdbr 依据欧盟《通用数据保护条例》，首先判断用户是否设置了 navigator.doNotTrack 避免数据被追踪，其次判断持久层是否禁止数据被追踪，当两者同时允许追踪埋点数据时，mixpanel 才会上报埋点数据。

核心实现层：MixpanelLib 串联功能、处理选项、发送埋点数据等；MaxpanelGroup；MaxpanelPeople。

mixpanel 根据用户配置项，分别使用 img、script 节点、XHR 对象上报数据，这一逻辑实现在 mixpanelLib._send_request(url, data, callback) 方法中。

_send_request 方法会附加上报 ip 地址、时间戳等；callback 回调用于处理服务端响应及上传数据。

一般而言，在 _send_reques 方法执行前，mixpanel 会调用 gdbr 模块校验用户或持久层的 token 是否禁止数据被追踪；在 _send_reques 方法执行后，mixpanel 会调用 _check_and_handle_notifications 上报用户的唯一标识，并根据返回结果触发弹窗。

基于 _send_request，MixpanelLib 封装了 track(event_name, properties, callback)、_dom_loaded 等方法。

其中，track 方法附加上持久层的数据，并以 { event, properties } 格式发送到远程服务器中；track_pageview 方法（上报浏览器和页面信息）、LinkTracker、FormTracker 均基于 track 实现（LinkTracker、FormTracker 在上报数据完成后，再触发原始的跳链接、提交操作）。

_dom_loaded 在 DOMContentLoaded 事件中触发执行，为 LinkTracker、FormTracke 相关节点绑定事件。

autotrack 自动埋点先须由用户开启，其次请求服务器是否允许自动埋点，然后以事件委托的方式在 document 节点层面收集数据并上报。

mixpanel 有其成熟后的复杂度，个别内容不作详解，另作专题剖析。

## Sensors Analytics

使用者在自己的网页引入 Sensors Analytics 的 JavaScript SDK 代码后，从 Sensors Analytics 的后台可视化埋点管理界面跳转到使用者的网站界面时，会自动进入到可视化埋点模式。

在这个模式下，使用者在网页上点击任意 html元素时，Sensors Analytics 都会取到这个元素的url，层级关系等信息来描述这个 html 元素，当使用者设置了这个元素和某个事件相关联时，SDK 会把这些关联信息和客户生成配置信息，并且存放在 Sensors Analytics 提供的相应保存位置。

当真正的用户以普通模式访问这个网页时，SDK 会自动加载配置信息，从而在相应的元素被点击时，使用 Sensors Analytics 的数据发送接口来 track 事件。

从上面我们介绍的可视化埋点的方案可以看出，可视化埋点很好地解决了代码埋点的埋点代价大和更新代价大两个问题。

但是，可视化埋点能够覆盖的功能有限，目前并不是所有的控件操作都可以通过这种方案进行定制；同时，Mixpanel 为首的可视化埋点方案是不能自己设置属性的，例如，一个界面上有一个文本框和一个按钮，通过可视化埋点设置点击按钮为一个“提交”事件时，并不能将文本框的内容作为事件的属性进行上传的，因此，对于可视化埋点这种方案，在上传事件时，就只能上传 SDK 自动收集的设备、地域、网络等默认属性，以及一些通过代码设置的全局公共属性了；最后，作为前端埋点的一种方案，可视化埋点也依然没有解决传输时效性和数据可靠性的问题。

## 无埋点

Heap、百度（点击猴子）、GrowingIO等

与可视化埋点又类似，二者的区别就是可视化埋点先通过界面配置哪些控件的操作数据需要收集；

“无埋点”则是先尽可能收集所有的控件的操作数据，然后再通过界面配置哪些数据需要在系统里面进行分析。

“无埋点”相比可视化埋点的优点，一方面是解决了数据“回溯”的问题，例如，在某一天，突然想增加某个控件的点击的分析，如果是可视化埋点方案，则只能从这一时刻向后收集数据，而如果是“无埋点”，则从部署 SDK 的时候数据就一直都在收集了；另一方面，“无埋点”方案也可以自动获取很多启发性的信息，例如，“无埋点”可以告诉使用者这个界面上每个控件分别被点击的概率是多大，哪些控件值得做更进一步的分析等等。

当然，与可视化埋点一样，“无埋点”依然没有解决覆盖的功能优先，不能灵活地自定义属性，传输时效性和数据可靠性欠佳这几个缺点。甚至由于所有的控件事件都全部搜集，反而会给服务器和网络传输带来更大的负载。

技术实现上也可以通过拦截全局页面访问和事件响应，分析用户访问全流程路径，上报所有触发埋点，因此无埋点也叫全埋点。

## 方案的选择

每种方案各有优劣，并不存在某种普遍完美的可以适应一切场景的埋点方案，而是应该根据不同的产品，不同的分析需求，不同的系统架构，不同的使用场景，选择最合适的一种接入方案。

下面是一些典型的例子：

- 仅仅是分析UV、PV、点击量等基本指标，可以选择代码埋点或者可视化埋点等前端埋点方案；

- 精细化分析核心转化流程，则可能需要利用后端 SDK 或者 LogAgent 接入后端日志；

- 活动/新功能快速上线迭代时的效果评估，则可以利用可视化埋点快速完成；

- 对客服服务质量的考核，或者不同快递在不同省份运送不同品类产品的速度的比较，则需要使用后端 SDK 来对接第三方系统以便导入数据。

# 开源地址；

> github地址：git@github.com:zhangzhenhua92/datacollection.git


# 参考资料

[前端埋点实现及原理分析](https://blog.csdn.net/lucky541788/article/details/103795942/)

[前端埋点](https://zhuanlan.zhihu.com/p/91140517)

https://zhuanlan.zhihu.com/p/139425305

https://www.cnblogs.com/wuqilang/p/14737025.html

https://www.jianshu.com/p/645a26619508

[前端埋点概念整理](https://www.jianshu.com/p/f6e281d37f0c)

* any list
{:toc}