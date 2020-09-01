---
layout: post
title: js 手写实现简单版本的 jquery-01-入门教程
date:  2020-3-27 17:53:59 +0800
categories: [HTML]
tags: [html, js, sh]
published: true
---

# jquery

[jquery](https://jquery.com/download/) 作为一名功成身退的老将，实际上个人觉得所有的新框架都是换汤不换药。

所以还是觉得可以尝试下，自己实现简单版本的 JQuery。

## 设计目的

jQuery可以分解为JavaScript + Query。即JavaScript查询的意思。所以jQuery的核心目标就是JavaScript查询，通过选择DOM元素再对DOM元素进行操作。并解决了跨浏览器兼容问题，使DOM操作趋于统一。

## 如何实现

选择DOM是为了对其进行进一步的操作。

这些操作主要包括以下几个部分

- 属性操作

如class,style,attribute等

- 元素操作

如元素的创建、添加、移动、复制、删除等

- 内容操作

通过innerHTML等获取或设置元素的内容

- 样式操作

如对元素的width、height、position、display等样式进行获取或修改

- 事件操作

Event是用户与浏览器进行动态交互的重要模块。如添加、删除事件等

- 通信操作

Ajax技术用于客户端和服务器端进行异步通信，实现页面的局部刷新。


# jQuery 核心特性

## 1、jQuery()或$()

jQuery把所有的操作都包含在一个jQuery()函数中，提供了一个统一的操作入口jQuery()或$()。

jQuery框架的基础是查询，即查询文档元素对象。因此我们可以认为jQuery函数对象就是一个选择器，并在此基础上构建和运行查询过滤器。

需要注意的是：jQuery对象的方法都是针对DOM元素对象进行操作的。

## 2、jQuery构造函数

jQuery把所有操作都包装在一个jQuery()函数中，形成了统一(也是唯一)的操作入口。能够解析任意的数据类型，但是能够解析的参数包括以下四种类型

- $(expression,context)

expression可以是一个ID，DOM元素名，CSS表达式，XPath表达式。

context表示查找的上下文环境，若不写，则表示在整个document中查找

- $(html)

html表示一个HTML结构字符串，此时jQuery将创建一个对应结构的html文档片段。

```js
$("div").append($("<p>hello world</p>"))
```

- jQuery(element)

element表示一个DOM对象或集合，把DOM元素或集合当中的DOM元素转换为jQuery对象。

```js
$(document).ready(function () {
    alert("hello world");
})
//将document文档对象转换为jQuery对象，然后调用ready方法，ready处理函数为document绑定一个事件，当页面初始化之后，弹出弹出框。
```

- $(fn)

fn是一个处理函数，由于$(document).ready()使用频繁，所以jQuery使用$()来代替。表示在DOM元素解析完成后就执行代码

## 3、链式写法

核心就是通过return语句返回jQuery对象。

## 4、选择器

jQuery选择器支持ID,TagName,CSS1-CSS3的表达式(即支持用CSS选择器来选择元素)。

只需要将字符串传入jQuery()构造函数，就可以选择不同的DOM对象，然后处理成jQuery对象返回。

## 5、扩展性

为什么jQuery需要扩展性？

简单的说就是为了满足不同的开发需求。

为了保证jQuery的通用性并同时保证代码简洁性（就是体积越小越好），jQuery仅实现了基础的方法和函数。

但为了满足不同开发需求，留下了易于扩展的方法和接口。

# 整体概览

```js
(function(){

//替换全局的$,jQuery变量
var 
    _jQuery = window.jQuery,
    _$ = window.$,

    //jQuery实现
    jQuery = window.jQuery = window.$ = function( selector, context ) {
        return new jQuery.fn.init( selector, context );
    };

    //jQuery原型方法
    jQuery.fn = jQuery.prototype = {
        init: function( selector, context ) {},    
        //一些原型的属性和方法
    };

    //原型替换
    jQuery.fn.init.prototype = jQuery.fn;

    //原型扩展
    jQuery.extend = jQuery.fn.extend = function() {};
    jQuery.extend({
        // 一堆静态属性和方法
    });
})();
```



# 定义类型

在 JavaScript 中，可以把构造函数理解为一个类型，这个类型是 JavaScript 面向对象编程的基础。

定义一个函数就相当于构建了一个类型，然后借助这个类型类实例化对象。

## 示例

下面代码定义一个空类型，类名为 jQuery。

```js
var jQuery = function() {
    // 函数体
}
```

下面为 jQuery 扩展原型。

```js
var jQuery = function(){}
jQuery.prototype = {
    //扩展的原型对象
}
```

## 起一个别名

为 jQuery 的原型起个别名：fn。

如果直接命名为 fn，则表示它属于 window 对象，这样不安全。

更安全的方法是为 jQuery 类型对象定义一个静态引用 jQuery.fn，然后把 jQuery 的原型对象传递给这个属性 jQuery.fn。

实现代码如下：

```js
jQuery.fn = jQuery.prototype = {
    //扩展的原型对象
}
```

jQuery.fn 引用 jQuery.prototype，因此要访问 jQuery 的原型对象，可以使用 jQuery.fn，直接使用 jQuery.prototype 也是可以的。

下面为 jquery 类型起个别名：$。

```js
var $ = jQuery = function(){};
```

## 添加属性

模仿 jQuery 框架，给 jQuery 原型添加两个成员，一个是原型属性 version；另一个是原型方法 size()，分别定义 jQuery 框架的版本号和 jQuery 对象的长度。

```js
var $ = jQuery = function () {}
jQuery.fn = jQuery.prototype = {
    version : "3.2.1",  //原型属性
    size : function () {  //原型方法
        return this.length;
    }
}
```

# 返回 jQuery 对象

下面介绍如何调用原型成员：version 属性和 size() 方法。

一般可以按以下方式调用。

```js
var test = new $ ();  //实例化
console.log(test.version);  //读取属性，返回“3.2.1”
console.log(test.size());  //调用方法，返回undefined
```

但是，jQuery 框架按下面方法进行调用。

```js
$().version;
$().size();
```

jQuery 没有使用 new 命令调用 jQuery 构造函数，而是直接使用小括号运算符调用 jQuery() 构造函数，然后在后面直接访问原型成员。

如何实现这样的操作呢？

## 如何实现直接创建？

### 示例1

可以使用 return 语句返回一个 jQuery 实例。

```js
var $ = jQuery = function () {
    return new jQuery();  //返回类的实例
}
jQuery.fn = jQuery.prototype = {
    version : "3.2.1",  //原型属性
    size : function (){  //原型方法
        return this.length;
    }
}
```

执行下面的代码，则会如图出现内存溢出错误。

```js
$().version;
$().size();
```

**这说明在构造函数内部实例化对象是不允许的，因为这个引用会导致死循环。**

### 示例2

下面尝试使用工厂模式进行设计：在 jQuery() 构造函数中返回 jQuery 的原型引用。

```js
var $ = jQuery = function () {
    return jQuery.prototype;  //返回类的原型
}
jQuery.fn = jQuery.prototype = {
    version : "3.2.1",  //原型属性
    size : function (){  //原型方法
        return this.length;
    }
}

console.log($().version);  //读取属性，返回“3.2.1”
console.log($().size());  //调用方法，返回undefined
```

### 示例3

示例 2 基本实现了 `$().size()` 这种形式的用法，但是在构造函数中直接返回原型对象，设计思路过于狭窄，无法实现框架内部的管理和扩展。

下面模拟其他面向对象语言的设计模式：

在类型内部定义一个初始化构造函数 init()，当类型实例化后，直接执行初始化构造函数 init()，然后再返回 jQuery 的原型对象。

```js
var $ = jQuery = function () {
    return jQuery.fn.init();  //调用原型方法init()，模拟类的初始化构造函数
}
jQuery.fn = jQuery.prototype = {
    init : function () {  //在原型的初始化方法中返回原型对象
        return this;
    },
    version : "3.2.1",  //原型属性
    size : function () {  //原型方法
        return this.length;
    }
}
console.log($().version);  //读取属性，返回“3.2.1”
console.log($().size());  //调用方法，返回undefined
```

# 设计作用域

上面模拟了 jQuery 的用法，让 jQuery() 返回 jQuery 类型的原型。

实现方法：定义初始化函数 init() 返回 this，而 this 引用的是 jQuery 原型 jQuery.prototype。

但是，在使用过程中也会发现一个问题：作用域混乱，给后期的扩展带来隐患。

下面结合一个示例进行说明。

## 示例1

定义 jQuery 原型中包含一个 length 属性，同时初始化函数 init() 内部也包含一个 length 属性和一个 _size() 方法。

```js
var $ = jQuery = function () {
    return jQuery.fn.init();
}
jQuery.fn = jQuery.prototype = {
    init : function () {
        this.length = 0;  //原型属性
        this._size = function () {  //原型方法
            return this.length;
        }
        return this;
    },
    length : 1,
    version : "3.2.1",  //原型属性
    size : function () {  //原型方法
        return this.length;
    }
}
console.log($().version);  //返回“3.2.1”
console.log($()._size());  //返回0
console.log($().size());  //返回0
```

运行示例 1 可以看到 init() 函数内的 this 与外面的 this 均引用同一个对象：jQuery.prototype 原型对象。

因此，会出现 init() 函数内部的 this.length 会覆盖掉外部的 this.length。

简单概括：初始化函数 init() 的内、外作用域缺乏独立性，对于 jQuery 这样的框架来说，很有可能造成消极影响。

## jQuery 是如何避免的呢？

而 jQuery 框架是通过下面方式调用 init() 初始化函数。

```js
var $ = jQuery = function (selector, context) {
    return new jQuery.fn.init (selector, context);  //实例化init()，分隔作用域
}
```

使用 new 命令调用初始化函数 init()，创建一个独立的实例对象，这样就分隔了 init() 函数内外的作用域，确保内外 this 引用不同。

## 示例2

修改示例 1 中的 jQuery()，使用 return 返回新创建的实例。

```js
var $ = jQuery = function () {
    return new jQuery.fn.init ();
}
jQuery.fn = jQuery.prototype = {
    init : function () {
        this.length = 0;  //本地属性
        this._size = function () {  //本地方法
            return this.length;
        }
        return this;
    },
    length : 1,
    version : "3.2.1",  //原型属性
    size : function (){  //原型方法
        return this.length;
    }
}
console.log($().version);  //返回undefined
console.log($()._size());  //返回0
console.log($().size());  //抛出异常
```

运行示例 2 会发现：由于作用域被阻断，导致无法访问 jQuery.fn 对象的属性或方法。

# 跨域访问

下面来探索如何越过作用域的限制，实现跨域访问外部的 jQuery.prototype。

分析 jQuery 框架源码，发现它是**通过原型传递解决这个问题**。

实现方法：把 jQuery.fn 传递给 jQuery.fn.init.prototype，用 jQuery 的原型对象覆盖掉 init 的原型对象，从而实现跨域访问。

## 示例

下面代码具体演示了跨域访问的过程。

```js
var $ = jQuery = function () {
    return new jQuery.fn.init();
}
jQuery.fn = jQuery.prototype = {
    init : function () {
        this.length = 0;  //本地属性
        this._size = function () {  //本地方法
            return this.length;
        }
        return this;
    },
    length : 1,
    version : "3.2.1",  //原型属性
    size : function () {  //原型方法
        return this.length;
    }
}
jQuery.fn.init.prototype = jQuery.fn;  //使用jQuery的原型对象覆盖init的原型对象
console.log($().version);  //返回“3.2.1”
console.log($()._size());  //返回0
console.log($().size());  //返回0
```

# 设计选择器

下面探索 jQuery 内部的核心功能：选择器。

使用过 jQuery 的用户应该熟悉，jQuery 返回的是 jQuery 对象，jQuery 对象实际上就是伪类数组。

## 示例

下面示例尝试为 jQuery() 函数传递一个参数，并让它返回一个 jQuery 对象。

jQuery() 构造函数包含两个参数：selector 和 context。

其中 selector 表示选择器，context 表示匹配的上下文，即可选择的范围，它表示一个 DOM 元素。

为了简化操作，本例假设选择器的类型仅为标签选择器。

实现的代码如下：

```js
<script>
    var $ = jQuery = function (selector, context) {  //jQuery构造函数
        return new jQuery.fn.init(selector, context);  //jQuery实例对象
    }
    jQuery.fn = jQuery.prototype = {  //jQuery原型对象
        init : function (selector, context) {  //初始化构造函数
            selector = selector || document;  //初始化选择器，默认值为document
            context = context || document;  //初始化上下文对象，默认值为document
            if (selector.nodeType) {  //如果是DOM元素
                this[0] = selector;  //直接把该DOM元素传递给实例对象的伪数组
                this.length = 1;  //设置实例对象的length属性，表示包含1个元素
                this.context = selector;  //重新设置上下文为DOM元素
                return this;  //返回当前实例
            }
            if (typeof selector === "string") {  //如果是选择符类型的字符串
                var e = context.getElementsByTagName(selector);  //获取指定名称的元素
                for (var i = 0; i < e.length; i ++ ) {  //使用for把所有元素传入到当前实例数组中
                    this[i] = e[i];
                }
                this.length = e.length;  //设置实例的length属性，定义包含元素的个数
                this.context = context;  //保存上下文对象
                return this;  //返回当前实例
            } else {
                this.length = 0;  //设置实例的length属性值为0，表示不包含元素
                this.context = context;   //保存上下文对象
                return this;  //返回当前实例
            }
        }
    }
    jQuery.fn.init.prototype = jQuery.fn;
    window.onload = function () {
        console.log($("div").length);  //返回3
    }
</script>
<div></div>
<div></div>
<div></div>
```

在上面示例中，$("div") 基本拥有了 jQuery 框架中 $("div") 选择器的功能，使用它可以选取页面中的指定范围的 div 元素。

同时，读取 length 属性可以返回 jQuery 对象的长度。

# 设计迭代器

下面探索如何操作 jQuery 对象。

在 jQuery 框架中，jQuery 对象是一个普通的 JavaScript 对象，但是它以索引数组的形式包含了一组数据，这组数据就是使用选择器匹配的所有 DOM 元素。

操作 jQuery 对象实际上就是操作这些 DOM 元素，但是无法直接使用 JavaScript 方法操作 jQuery 对象。

只有逐一读取它包含的每一个 DOM 元素，才能够实现各种操作，如插入、删除、嵌套、赋值、读写属性等。

在实际使用 jQuery 过程中，我们可以看到类似下面的 jQuery 用法。

```js
$("div").html()
```

也就是直接在 jQuery 对象上调用 html() 方法来操作 jQuery 包含的所有 DOM 元素。

## 如何实现遍历？

那么这个功能是怎么实现的呢？

jQuery 定义了一个工具函数 each()，利用这个工具可以遍历 jQuery 对象中所有的 DOM 元素，并把操作 jQuery 对象的行为封装到一个回调函数中，然后通过在每个 DOM 元素上调用这个回调函数来实现逐一操作每个 DOM 元素。

- 实现代码如下：

```js
var $ = jQuery = function (selector, context) {  //jQuery构造函数
    return new jQuery.fn.init(selector,context);  //jQuery实例对象
}
jQuery.fn = jQuery.prototype = {  //jQuery原型对象
    init : function (selector,context){  //初始化构造函数
        selector = selector || document;  //初始化选择器，默认值为document
        context = context || document;  //初始化上下文对象，默认值document
        if (selector.nodeType) {  //如果是DOM元素
            this[0] = selector;  //直接把该DOM元素传递给实例对象的伪数组
            this.length = 1;  //设置实例对象的length属性，表示1个元素
            this.context = selector;  //重新设置上下文为DOM元素
            return this;  //返回当前实例
        }
        if (typeof selector === "string") {  //如果是选择符字符串
            var e = context.getElementsByTagName(selector);  //获取指定名称的元素
            for (var i = 0; i < e.length;i ++){  //使用for把所有元素传入当前实例数组中
                this[i] = e[i];
            }
            this.length = e.length;  //设置实例的length属性，定义包含元素的个数
            this.context = context;  //保存上下文对象
            return this;  //返回当前实例
        } else {
            this.length = 0;  //设置实例的length属性值为0，表示不包含元素
            this.context = context;  //保存上下文对象
            return this;  //返回当前实例
        }
    },
    html : function(val){  //模仿jQuery的html()方法，为匹配DOM元素插入html字符串
        jQuery.each(this,function(val){  //为每一个DOM元素执行回调函数
            this.innerHTML = val;
        },val);
    }
}
jQuery.fn.init.prototype = jQuery.fn;
//扩展方法：jQuery迭代函数
jQuery.each = function(object,callback,args){
    for(var i = 0;i<object.length;i ++){  //使用for迭代jQuery对象中每个DOM元素
        callback.call(object[i],args);  //在每个DOM元素上调用回调函数
    }
    return object;  //返回jQuery对象
}
```

在上面代码中，为 jQuery 对象绑定 html() 方法，然后利用 jQuery() 选择器获取页面中所有的 div 元素，调用 html() 方法，为所有匹配的元素插入 HTML 字符串。

each() 的当前作用对象是 jQuery 对象，故 this 指向当前 jQuery 对象；而在 html() 内部，由于是在指定 DOM 元素上执行操作，则 this 指向的是当前 DOM 元素，不再是 jQuery 对象。

```js
<script>
    window.onload = function () {
        $("div").html("<h1>你好</h1>");
    }
</script>
<div></div>
<div></div>
<div></div>
```

当然，上面示例所定义的 each() 函数和 html() 方法的功能比较有限。

在 jQuery 框架中，它封装的 each() 函数功能就很强大。

# 设计扩展

jQuery 提供了良好的扩展接口，方便用户自定义 jQuery 方法。

根据设计习惯，如果为 jQuery 或者 jQuery.prototype 新增方法时，可以直接通过点语法，或者在 jQuery.prototype 对象结构内增加。

但是，如果分析 jQuery 源码，会发现它是通过 extend() 函数来实现功能扩展的。

## 示例1

下面代码是 jQuery 框架通过 extend() 函数扩展的功能。

```js
jQuery.extend ({  //扩展工具函数
    noConflict : function (deep) {},
    isFunction : function (obj) {},
    isArray : function (obj) {},
    isXMLDoc : function (elem) {},
    globalEval : function (date) {}
});
```

或者：

```js
jQuery.fn.extend ({  //扩展jQuery对象方法
    show : function (speed, callback) {},
    hide : function (speed, callback) {},
    toggle : function (fn, fn2) {},
    fadeTo : function (speed, to, callback) {},
    animate : function (prop, speed, easing, callback) {},
    stop : function (clearQueue, gotoEnd) {}
});
```

这样做有什么好处呢？

方便用户快速扩展 jQuery 功能，但不会破坏 jQuery 框架的结构。

如果直接在 jQuery 源码中添加方法，这样容易破坏 jQuery 框架的纯洁性，也不方便后期代码维护。

如果不需要某个插件，使用 jQuery 提供的扩展工具添加，只需要简单地删除即可，而不需要在 jQuery 源码中去寻找要删除的代码段。

extend() 函数的功能很简单，它只是把指定对象的方法复制给 jQuery 对象或者 jQuery.prototype。

## 示例2

在下面示例中，为 jQuery 类型和 jQuery 对象定义了一个扩展函数 extend()，设计把参数对象包含的所有属性复制给 jQuery 或者 jQuery.prototype，这样就可以实现动态扩展 jQuery 方法。

```js
var $ = jQuery = function (selector, context) {  //jQuery构造函数
    return new jQuery.fn.init(selector, context);  //jQuery实例对象
}
jQuery.fn = jQuery.prototype = {  //jQuery原型对象
    init : function (selector, context) {  //初始化构造函数
        selector = selector || document;  //初始化选择器，默认值为document
        context = context || document;  //初始化上下文对象，默认值为document
        if (selector.nodeType) {  //如果是DOM元素
            this[0] = selector;  //直接把该DOM元素传递给实例对象的伪数组
            this.length = 1;  //设置实例对象的length属性，表示包含1个元素
            this.context = selector;  //重新设置上下文为DOM元素
            return this;  //返回当前实例
        }
        if (typeof selector === "string") {  //如果是选择符字符串
            var e = context.getElementsByTagName(selector);  //获取指定名称的元素
            for (var i = 0; i < e.length; i ++) {  //使用for把所有元素传入当前实例数组中
                this[i] = e[i];
            }
            this.length = e.length;  //设置实例的length属性，定义包含元素的个数
            this.context = context;  //保存上下文对象
            return this;  //返回当前实例
        } else {
            this.length = 0;  //设置实例的length属性值为0，表示不包含元素
            this.context = context;  //保存上下文对象
            return this;  //返回当前实例
        }
    }
}
jQuery.fn.init.prototype = jQuery.fn;
//扩展方法：jQuery迭代函数
jQuery.each = function (object, callback, args) {
    for (var i = 0; i < object.length; i ++) {  //使用for迭代jQuery对象中每个DOM元素
        callback.call(object[i], args);  //在每个DOM元素上调用回调函数
    }
    return object;  //返回jQuery对象
}
//jQuery扩展函数
jQuery.extend = jQuery.fn.extend = function (obj) {
    for (var prop in obj) {
        this[prop] = obj[prop];
    }
    return this;
}
//jQuery对象扩展方法
jQuery.fn.extend ({
    html : function (val) {  //模仿jQuery的html()方法，为匹配DOM元素插入html字符串
        jQuery.each (this, function (val) {  //为每一个DOM元素执行回调函数
            this.innerHTML = val;
        }, val);
    }
})
window.onload = function () {
    $("div").html("<h1>你好</h1>");
}
```

在上面示例中，先定义一个 jQuery 扩展函数 extend()，然后为 jQuery.fn 原型方法调用 extend() 函数，为其添加一个 jQuery 方法 html()。

# 传递参数

很多 jQuery 方法如果包含参数，一般都要求传递参数对象。

例如：

```js
$.ajax ({
    type : "GET",
    url : "test.js",
    dataType : "script"
});
```

使用对象直接量作为参数进行传递，方便参数管理。

当方法或者函数的参数长度不固定时，使用对象直接量作为参数进行传递有以下优势：

1. 参数个数不受限制

2. 参数顺序可以随意

这体现了 jQuery 用法的灵活性。

如果 ajax() 函数的参数长度和位置是固定的，如 `$.ajax("GET", "test.js", "script")`。

这种用法本身没有问题，但是很多 jQuery 方法包含大量的可选参数，参数位置没有必要限制，再使用传统方式来设计参数，就比较麻烦。

所以使用对象直接量作为参数进行传递，是最佳的解决方法。

## 参数处理问题

使用对象直接量作为参数进行传递，就涉及参数处理问题，如何解决并提取参数，如何处理默认值问题，我们可以通过下面的方式来实现。

【操作步骤】

1) 在前面示例基础上重新编写 jQuery.extend() 工具函数。

```js
var $ = jQuery = function (selector, context) {  //jQuery构造函数
    return new jQuery.fn.init(selector, context);  //jQuery实例对象
}
jQuery.fn = jQuery.prototype = {  //jQuery原型对象
    init : function (selector, context) {  //初始化构造函数
        selector = selector || document;  //初始化选择器，默认值为document
        context = context || document;  //初始化上下文对象，默认值为document
        if (selector.nodeType) {  //如果是DOM元素
            this[0] = selector;  //直接把该DOM元素传递给实例对象的伪数组
            this.length = 1;  //设置实例对象的length属性，表示包含1个元素
            this.context = selector;  //重新设置上下文为DOM元素
            return this;  //返回当前实例
        }
        if (typeof selector === "string") {  //如果是选择符字符串
            var e = context.getElementsByTagName(selector);  //获取指定名称的元素
            for (var i = 0; i < e.length; i ++) {  //使用for把所有元素传入当前实例数组中
                this[i] = e[i];
            }
            this.length = e.length;  //设置实例的length属性，定义包含元素的个数
            this.context = context;  //保存上下文对象
            return this;  //返回当前实例
        } else {
            this.length = 0;  //设置实例的length属性值为0，表示不包含元素
            this.context = context;  //保存上下文对象
            return this;  //返回当前实例
        }
    }
}
jQuery.fn.init.prototype = jQuery.fn;
//扩展方法：jQuery迭代函数
jQuery.each = function (object, callback, args) {
    for (var i = 0; i < object.length; i ++){  //使用for迭代jQuery对象中每个DOM元素
        callback.call(object[i], args);  //在每个DOM元素调用回调函数
    }
    return object;  //返回jQuery对象
}
/*重新定义jQuery扩展函数     */
jQuery.extend = jQuery.fn.extend = function () {
    var destination = arguments[0], source = arguments[1];  //获取第2个和第2个参数
    //如果两个参数都存在，且都为对象
    if (typeof destination == "object" && typeof source == "object") {
        //把第2个参数对合并到第1个参数对象中，并返回合并后的对象
        for (var property in source) {
            destination[property] = source[property];
        }
        return destination;
    } else {  //如果包含一个参数，则为jQuery扩展功能，把插件复制到jQuery原型对象上
        for (var prop in destination) {
            this[prop] = destination[prop];
        }
        return this;
    }
}
```

在上面代码中重写了 jQuery.extend() 工具函数，让它实现了两个功能：合并对象、为 jQuery 扩展插件。

为此，在工具函数中使用 if 条件语句检测参数对象 arguments 所包含的参数个数，以及参数类型，来决定是合并对象还是扩展插件。

如果用户给了两个参数，且都为对象，则把第 2 个对象合并到第 1 个对象中，并返回第 1 个对象；如果用户给了一个参数，则继续沿用前面的设计方法，把参数对象复制到 jQuery 原型对象上，实现插件扩展。

2) 利用 jQuery.extend() 工具函数为 jQuery 扩展了一个插件 fontStyle()，使用这个插件可以定义网页字体样式。

```js
//jQuery对象扩展方法
jQuery.fn.extend ({
    fontStyle : function (obj) {  //设置字体样式
        var defaults = {  //设置默认值，可以扩展
            color : "#000",
            bgcolor : "#fff",
            size : "14px",
            style : "normal"
        };
        defaults = jQuery.extend (defaults, obj || {});  //如果传递参数，则覆盖原默认参数
        jQuery.each (this, function () {  //为每一个DOM元素执行回调函数
            this.style.color = defaults.color;
            this.style.backgroundColor = defaults.bgcolor;
            this.style.fontSize = defaults.size;
            this.style.fintStyle = defaults.style;
        });
    }
})
```

在上面的插件函数 fontStyle() 中，首先定义一个默认配置对象 defaults。

初始化字体样式：字体颜色为黑色，背景色为白色，大小为 14 像素，样式为正常。

再使用 jQuery.extend() 工具函数把用户传递的参数对象 obj 合并到默认配置参数对象 defaults，返回并覆盖掉 defaults 对象。

为了避免用户没有传递参数，可以使用 `obj || {}` 检测用户是否传递参数对象，如果没有，则使用空对象参数合并操作。

最后，使用迭代函数 jQuery.each()，逐个访问 jQuery 对象中包含的 DOM 元素，然后分别为它设置字体样式。

3) 在页面中调用 jQuery 查找所有段落文本 p，然后调用 fontStyle() 方法，设置字体颜色为白色，背景色为黑色，大小为 24 像素，样式保持默认值。

```js
window.onload = function () {
    $("p").fontStyle ({
        color : "#fff" ,
        bgcolor : "#000" ,
        size : "24px"
    });
}
```

4) 在 `<body>` 内设计两段文本。

```js
<p>少年不知愁滋味，爱上层楼。爱上层楼，为赋新词强说愁</p>
<p>而今识尽愁滋味，欲说还休。欲说还休，却道天凉好个秋</p>
```

在 jQuery 框架中，extend() 函数功能很强大，它既能为 jQuery 扩展方法，也能处理参数对象并覆盖默认值。

# 设计独立空间

当在页面中引入多个 JavaScript 框架，或者编写了大量 JavaScript 时，很难确保这些代码不发生冲突。

如果希望 jQuery 框架与其他代码完全隔离开，闭包体是一种最佳的方式。

## 示例

在下面示例中，把前面设计的 jQuery 框架模型放入匿名函数中，然后自调用，并传入 Window 对象。

```js
(function(window) {
    var $ = jQuery = function(selector,context){  //jQuery构造函数
        return new jQuery.fn.init(selector,context);  //jQuery实例对象
    }
    jQuery.fn = jQuery.prototype = {  //jQuery原型对象
        init : function(selector,context){  //初始化构造函数
        //省略代码，参考上面示例代码
        }
     }
     jQuery.fn.init.prototype = jQuery.fn;
     //扩展方法：jQuery迭代函数
     jQuery.each = function(object,callback,args){
      for(var i=0;i<object.length;i++){  //使用for迭代jQuery对象中每个DOM元素
          callback.call(object[i],args);  //在每个DOM元素上调用函数
          }
          return object;  //返回jQuery对象
      }
    //jQuery扩展函数
    jQuery.extend = jQuery.fn.extend = function(){
        var destination = arguments[0], source = arguments[1];  //获取第1个和第2个参数
        //如果两个参数都存在，且都为对象
        if(typeof destination == "object" && typeof source == "object"){
            //把第2个参数对合并到第1个参数对象中，并返回合并后的对象
           for(var property in source){
               destination[property] = source[property];
           }
           return destination;
        } else {  //如果包含一个参数，则把插件复制到jQuery原型对象上
            for(var prop in destination){
                this[prop] = destination[prop];
            }
            return this;
        }
    }
    //开放jQuery接口
    window.jQuery = window.$ = jQuery;
}) (window)
```

其中倒数第二行代码：

```js
window.jQuery = window.$ = jQuery;
```

其主要作用是：把闭包体内的私有变量 jQuery 传递给参数对象 window 的 jQuery 属性，而参数对象 window 引用外部传入的 window 变量，window 变量引用全局对象 window。

所以，在全局作用域中就可以通过 jQuery 变量来访问闭包体内的 jQuery 框架，通过这种方式向外界暴露自己，允许外界使用 jQuery 框架。

但是，**外界只能访问 jQuery，不能访问闭包体内其他私有变量。**（迪米特法则）

至此，jQuery 框架的设计模型就初见端倪了，后面的工作就是根据需要使用 extend() 函数扩展 jQuery 功能。


## 命名冲突

同时，为了防止同其他框架协作时发生 `$` 简写的冲突，我们可以封装一个noConflict()方法解决$简写冲突。

思路分析：在匿名执行jQuery框架的最前面，先用_$，_jQuery两个变量存储外部的$，jQuery的值。

执行noConflict()函数时再恢复外部变量$，jQuery的值。

```js
(function(){
    var 
        window = this,
        _jQuery = window.jQuery,//存储外部jQuery变量
        _$ = window.$,//存储外部$变量
        jQuery = window.jQuery = window.$ = function( selector, context ) {
            return new jQuery.fn.init( selector, context );
        };
        jQuery.noConflict = function( deep ) {
            window.$ = _$;//将外部变量又重新赋值给$
            if ( deep )
                window.jQuery = _jQuery;//将外部变量又重新赋值给jQuery
            return jQuery;
        },
})();
```

至此，我们已经模拟实现了一个简单的jQuery框架。以后就可以根据x项目需要不断的扩展jQUery的方法即可。

# 拓展

例如，在闭包体外，直接引用 jQuery.fn.extend() 函数为 jQuery 扩展 fontStyle 插件。

```js
//jQuery对象扩展方法
jQuery.fn.extend ({
    fontStyle : function (obj) {  //设置字体样式
        var defaults = {  //设置默认值，可以扩展
            color : "#000",
            bgcolor : "#fff",
            size : "14px",
            style : "normal"
        };
        defaults = jQuery.extend (defaults, obj || {});
        jQuery.each (this, function () {
            this.style.color = defaults.color;
            this.style.backgroundColor = defaults.bgcolor;
            this.style.fontSize = defaults.size;
            this.style.fontStyle = defaults.style;
        });
    }
})
```

最后，就可以在页面中使用这个插件了。

```js
window.onload = function () {
    $("p").fontStyle ({
        color : "#fff",
        bgcolor : "#000",
        size : "24px"
    });
}
```

# 拓展阅读

[jquery](https://houbb.github.io/2018/04/22/web-jquery)
 
# 个人规划

类似于 mvp.css 自己实现一套比较适合个人的前端小框架。

手写一个 bootstrap 或者 semantic 样式，设计属于自己的样式框架。

上传到 github 并且发布到 npm，上传到 CDN 便于使用。

# 参考资料

《JavaScript高级程序设计》和《悟透JavaScript》

[JS实现简单的 jQuery 框架（非常详细）](http://c.biancheng.net/view/5826.html)

[简单实现 jQuery](https://www.jianshu.com/p/813216c7e9b2)

[从零实现一个简易jQuery框架之一—jQuery框架概述](https://www.cnblogs.com/yuliangbin/p/9281252.html)

[从零实现一个简易的jQuery框架之二—核心思路详解](https://www.cnblogs.com/yuliangbin/p/9286575.html)

[jQuery：从零开始，DIY一个jQuery（1）](https://www.cnblogs.com/vajoy/p/5510743.html)

[jQuery：从零开始，DIY一个jQuery（2）](https://www.cnblogs.com/vajoy/p/5728755.html)

[jQuery：从零开始，DIY一个jQuery（3）](https://www.cnblogs.com/vajoy/p/5748815.html)

* any list
{:toc}