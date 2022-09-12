---
layout: post
title:  js 实现单例的几种方式 js singleton
date:  2022-08-28 09:22:02 +0800
categories: [JS]
tags: [js, id, uuid, sh]
published: true
---

# JS实现单例模式的6种方案汇总

单例模式的定义是保证一个类仅有一个实例,下面这篇文章主要给大家介绍了关于JS实现单例模式的6种方案,需要的朋友可以参考下

# 单例模式的概念

单例模式就是在系统中保存一个实例，就是一个全局变量，在团队开发中，为了实现一些相似的功能，比如不同页面之间的表单验证，可能需求是不一样的，但是呢命名可能一样，这时就会产生冲突，这时候单例模式就能很好的解决这个问题。

1. 一个实例只生产一次

2. 保证一个类仅有一个实例，并提供一个访问它的全局访问点

## 说说它的优点：

1，单例模式声明一个命名空间，它生成一个唯一的全局变量，一个命名空间，可以用声明对象的方式来声明：

```js
var mapleTao={ name:"mapleTao",init:function(){console.log(this.name)}};
```

有木有发现这个和对象有点类似呢，其实name，init是它的属性，通过mapleTao.name就获取它name的值，通过mapleTao.init()就可以调用init方法，这样在哎处理多需求页面，多人开发时就能很好的解决命名冲突的问题，以及可以更好的维护代码，更好的控制代码。

2，单例模式在全局中只声明一个变量，大家都知道在js中，假设你写了一个方法，如 function aa(){},这样就会在window中生成一个叫aa的变量，当实现一个功能时，在代码封装中，会创建好多函数，好多function，这样就会在window中创建好多变量，会占用更多的内存单元，全局变量的作用域很广，在众多处理函数中都可能改变，这样当出现bug时不容易快速找到，而通过单例模式创建的对象变量中可以更快速的找到问题，从而解决，这大大减少的问题修复的时间以及系统加载的时间。

3，在实现同一个功能的地方比通过new新创建对象对内存对资源的占用更据优势。

# 1、单例模式的实现思路

如何才能保证一个类仅有一个实例？

一般情况下，当我们创建了一个类（本质是构造函数）后，可以通过 new 关键字调用构造函数进而生成任意多的实例对象。

像这样：

```js
class SingleDog {
  show() {
    console.log('我是一个单例对象')
  }
}

const s1 = new SingleDog()
const s2 = new SingleDog()

console.log(s1 === s2)  // false
```

这里 new 了一个 s1，又 new 了一个 s2，很明显 s1 和 s2 之间没有任何瓜葛，两者是相互独立的对象，各占一块内存空间。

而单例模式想要做到的是，不管我们尝试去创建多少次，它都只给你返回第一次所创建的那唯一的一个实例。

要做到这一点，就需要构造函数具备判断自己是否已经创建过一个实例的能力。

现在把这段判断逻辑写成一个静态方法：

```js
class SingleDog {
  show() {
    console.log('我是一个单例对象')
  }
  static getInstance() {
    // 判断是否已经 new 过 1 个实例
    if (!SingleDog.instance) {
      // 若这个唯一的实例不存在，那么先创建它
      SingleDog.instance = new SingleDog()
    }
    // 如果这个唯一的实例已经存在，则直接返回
    return SingleDog.instance
  }
}

const s1 = SingleDog.getInstance()
const s2 = SingleDog.getInstance()

console.log(s1 === s2)  // true
```

除了楼上这种实现方式之外，getInstance 的逻辑还可以用闭包来实现：

```js
SingleDog.getInstance = (function () {
  // 定义自由变量 instance，模拟私有变量
  let instance = null
  return function () {
    // 判断自由变量是否为 null
    if (!instance) {
      // 如果为 null 则 new 出唯一实例
      instance = new SingleDog()
    }
    return instance
  }
})()
```

可以看出，在 getInstance 方法的判断和拦截下，我们不管调用多少次，SingleDog 都只会给我们返回一个实例，s1 和 s2 现在都指向这个唯一的实例。


# 单例模式的应用

## ① 实现一个 Storage

描述：

实现 Storage，使得该对象为单例，基于 localStorage 进行封装。

实现方法 setItem(key,value) 和 getItem(key)。

实现（静态方法版）：

```js
// 定义Storage
class Storage {
  static getInstance() {
    // 判断是否已经 new 过 1 个实例
    if (!Storage.instance) {
      // 若这个唯一的实例不存在，那么先创建它
      Storage.instance = new Storage()
    }
    // 如果这个唯一的实例已经存在，则直接返回
    return Storage.instance
  }
  getItem(key) {
    return localStorage.getItem(key)
  }
  setItem(key, value) {
    return localStorage.setItem(key, value)
  }
}

const storage1 = Storage.getInstance()
const storage2 = Storage.getInstance()

storage1.setItem('name', '李雷')
// 李雷
storage1.getItem('name')
// 也是李雷
storage2.getItem('name')

console.log(storage1 === storage2)  // true
```


# 生产实践——Vuex 中的单例模式

## 理解 Vuex 中的 Store

Vuex 使用单一状态树，用一个对象就包含了全部的应用层级状态。

至此它便作为一个“唯一数据源 (SSOT)”而存在。

这也意味着，每个应用将仅仅包含一个 store 实例。

单一状态树让我们能够直接地定位任一特定的状态片段，在调试的过程中也能轻易地取得整个当前应用状态的快照。 ——Vuex 官方文档

在 Vue 中，组件之间是独立的，组件间通信最常用的办法是 props（限于父组件和子组件之间的通信），稍微复杂一点的（比如兄弟组件间的通信）我们通过自己实现简单的事件监听函数也能解决掉。

但当组件非常多、组件间关系复杂、且嵌套层级很深的时候，这种原始的通信方式会使我们的逻辑变得复杂难以维护。

这时最好的做法是将共享的数据抽出来、放在全局，供组件们按照一定的的规则去存取数据，保证状态以一种可预测的方式发生变化。

于是便有了 Vuex，这个用来存放共享数据的唯一数据源，就是 Store。

## Vuex 如何确保 Store 的唯一性

```js
// 安装 vuex 插件
Vue.use(Vuex)

// 将 store 注入到 Vue 实例中
new Vue({
  el: '#app',
  store
})
```

通过调用 Vue.use() 方法，我们安装了 Vuex 插件。

Vuex 插件是一个对象，它在内部实现了一个 install 方法，这个方法会在插件安装时被调用，从而把 Store 注入到 Vue 实例里去，也就是说每 install 一次，都会尝试给 Vue 实例注入一个 Store。

在 install 方法里，有一段逻辑和我们楼上的 getInstance 非常相似的逻辑：

```js
let Vue // 这个 Vue 的作用和上面的 instance 作用一样
...

export function install(_Vue) {
  // 判断传入的 Vue 实例对象是否已经被 install 过 Vuex 插件（是否有了唯一的 state）
  if (Vue && _Vue === Vue) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        '[vuex] already installed. Vue.use(Vuex) should be called only once.'
      )
    }
    return
  }
  // 若没有，则为这个 Vue 实例对象 install 一个唯一的 Vuex
  Vue = _Vue
  // 将 Vuex 的初始化逻辑写进 Vue 的钩子函数里
  applyMixin(Vue)
}
```

以上便是 Vuex 源码中单例模式的实现办法了，可以说和 getInstance 如出一辙。

通过这种方式，可以保证一个 Vue 实例（即一个 Vue 应用）只会被 install 一次 Vuex 插件，所以每个 Vue 实例只会拥有一个全局的 Store。

------------------------------------------------------------------------------------------------

# 方式1

利用 `instanceof` 判断是否使用new关键字调用函数进行对象的实例化

```js
function User() {
    if (!(this instanceof User)) {
        return
    }
    if (!User._instance) {
        this.name = '无名'
        User._instance = this
    }
    return User._instance
}

const u1 = new User()
const u2 = new User()

console.log(u1===u2);// true
```

# 方式2

在函数上直接添加方法属性调用生成实例

```js
function User(){
    this.name = '无名'
}
User.getInstance = function(){
    if(!User._instance){
        User._instance = new User()
    }
    return User._instance
}

const u1 = User.getInstance()
const u2 = User.getInstance()

console.log(u1===u2);
```

## 方式3

使用闭包，改进方式2

```js
function User() {
    this.name = '无名'
}
User.getInstance = (function () {
    var instance
    return function () {
        if (!instance) {
            instance = new User()
        }
        return instance
    }
})()

const u1 = User.getInstance()
const u2 = User.getInstance()

console.log(u1 === u2);
```

# 方式4

使用包装对象结合闭包的形式实现

```js
const User = (function () {
    function _user() {
        this.name = 'xm'
    }
    return function () {
        if (!_user.instance) {
            _user.instance = new _user()
        }
        return _user.instance
    }
})()

const u1 = new User()
const u2 = new User()

console.log(u1 === u2); // true
```

当然这里可以将闭包部分的代码单独封装为一个函数

在频繁使用到单例的情况下，推荐使用类似此方法的方案，当然内部实现可以采用上述任意一种

```js
function SingleWrapper(cons) {
    // 排除非函数与箭头函数
    if (!(cons instanceof Function) || !cons.prototype) {
        throw new Error('不是合法的构造函数')
    }
    var instance
    return function () {
        if (!instance) {
            instance = new cons()
        }
        return instance
    }
}

function User(){
    this.name = 'xm'
}

const SingleUser = SingleWrapper(User)
const u1 = new SingleUser()
const u2 = new SingleUser()
console.log(u1 === u2);
```

# 方式5

在构造函数中利用new.target判断是否使用new关键字

```js
class User{
    constructor(){
        if(new.target !== User){
            return
        }
        if(!User._instance){
            this.name = 'xm'
            User._instance = this
        }
        return User._instance
    }
}

const u1 = new User()
const u2 = new User()
console.log(u1 === u2);
```

# 方式6

使用static静态方法

```js
class User {
    constructor() {
        this.name = 'xm'
    }
    static getInstance() {
        if (!User._instance) {
            User._instance = new User()
        }
        return User._instance
    }
}


const u1 = User.getInstance()
const u2 = User.getInstance()

console.log(u1 === u2);
```

--------------------------------------------------------------------------------------------------------------






# 参考资料

https://www.jb51.net/article/212634.htm

http://t.zoukankan.com/Leophen-p-14823177.html


* any list
{:toc}