---
layout: post
title:  js obfuscator JS 混淆算法
date:  2022-08-27 09:22:02 +0800
categories: [Tool]
tags: [tool, js, safe, sh]
published: true
---


# JavaScript 混淆器工具

一个免费且高效的 JavaScript 混淆器（包括对 ES2022 的支持）。 

使您的代码更难复制并防止人们窃取您的工作。 

该工具是 Timofey Kachalov 创建的优秀（和开源）javascript-obfuscator@4.0.0 的 Web UI。

对应的 ui 地址：

> [javascript-obfuscator-ui](https://github.com/javascript-obfuscator/javascript-obfuscator-ui)

https://github.com/ginqi7/JsPatronum

## 这是什么？

该工具将您的原始 JavaScript 源代码转换为一种新的表示形式，在未经授权的情况下更难理解、复制、重用和修改。 

混淆后的结果将具有原始代码的确切功能。

## 那么，它就像 UglifyJS、Closure Compiler 等？

是和不是。 

虽然 UglifyJS（和其他缩小器）确实使输出代码更难理解（压缩和丑陋），但可以使用 JS 美化器轻松将其转换为可读的东西。

该工具通过使用各种转换和“陷阱”来防止这种情况，例如自我防御和调试保护。

## 混淆是如何工作的？

通过一系列转换，例如变量/函数/参数重命名、字符串删除等，您的源代码被转换为不可读的东西，同时工作与以前完全一样。

## 听起来很棒！

只需粘贴您的代码或将其上传到下方，然后单击“混淆”。

此外，请务必阅读所有选项以了解代码保护和代码大小/速度之间的所有权衡。

## 安装

```
$ npm install --save-dev javascript-obfuscator
```

或者从 CDN

```js
<script src="https://cdn.jsdelivr.net/npm/javascript-obfuscator/dist/index.browser.js"></script>
```

## 使用

```js
var JavaScriptObfuscator = require('javascript-obfuscator');

var obfuscationResult = JavaScriptObfuscator.obfuscate(
    `
        (function(){
            var variable1 = '5' - 3;
            var variable2 = '5' + 3;
            var variable3 = '5' + - '2';
            var variable4 = ['10','10','10','10','10'].map(parseInt);
            var variable5 = 'foo ' + 1 + 1;
            console.log(variable1);
            console.log(variable2);
            console.log(variable3);
            console.log(variable4);
            console.log(variable5);
        })();
    `,
    {
        compact: false,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        numbersToExpressions: true,
        simplify: true,
        stringArrayShuffle: true,
        splitStrings: true,
        stringArrayThreshold: 1
    }
);

console.log(obfuscationResult.getObfuscatedCode());
```

数据结果如下：

```js
/*
var _0x9947 = [
    'map',
    'log',
    'foo\x20',
    'bvmqO',
    '133039ViRMWR',
    'xPfLC',
    'ytpdx',
    '1243717qSZCyh',
    '2|7|4|6|9|',
    '1ErtbCr',
    '1608314VKvthn',
    '1ZRaFKN',
    'XBoAA',
    '423266kQOYHV',
    '3|0|5|8|1',
    '235064xPNdKe',
    '13RUDZfG',
    '157gNPQGm',
    '1639212MvnHZL',
    'rDjOa',
    'iBHph',
    '9926iRHoRl',
    'split'
];
function _0x33e4(_0x1809b5, _0x37ef6e) {
    return _0x33e4 = function (_0x338a69, _0x39ad79) {
        _0x338a69 = _0x338a69 - (0x1939 + -0xf * 0x1f3 + 0x1 * 0x469);
        var _0x2b223a = _0x9947[_0x338a69];
        return _0x2b223a;
    }, _0x33e4(_0x1809b5, _0x37ef6e);
}
(function (_0x431d87, _0x156c7f) {
    var _0x10cf6e = _0x33e4;
    while (!![]) {
        try {
            var _0x330ad1 = -parseInt(_0x10cf6e(0x6c)) * -parseInt(_0x10cf6e(0x6d)) + -parseInt(_0x10cf6e(0x74)) * -parseInt(_0x10cf6e(0x78)) + parseInt(_0x10cf6e(0x6a)) + -parseInt(_0x10cf6e(0x70)) + parseInt(_0x10cf6e(0x6e)) * -parseInt(_0x10cf6e(0x75)) + parseInt(_0x10cf6e(0x72)) + -parseInt(_0x10cf6e(0x67)) * parseInt(_0x10cf6e(0x73));
            if (_0x330ad1 === _0x156c7f)
                break;
            else
                _0x431d87['push'](_0x431d87['shift']());
        } catch (_0x9f878) {
            _0x431d87['push'](_0x431d87['shift']());
        }
    }
}(_0x9947, -0xb6270 + 0x4dfd2 * 0x2 + 0x75460 * 0x2), function () {
    var _0x1f346d = _0x33e4, _0x860db8 = {
            'ytpdx': _0x1f346d(0x6b) + _0x1f346d(0x71),
            'bvmqO': function (_0x560787, _0x519b9e) {
                return _0x560787 - _0x519b9e;
            },
            'rDjOa': function (_0x4501fe, _0x2b07a3) {
                return _0x4501fe + _0x2b07a3;
            },
            'xPfLC': function (_0x5f3c9b, _0x434936) {
                return _0x5f3c9b + _0x434936;
            },
            'XBoAA': function (_0x535b8a, _0x42eef4) {
                return _0x535b8a + _0x42eef4;
            },
            'iBHph': _0x1f346d(0x65)
        }, _0x346c55 = _0x860db8[_0x1f346d(0x69)][_0x1f346d(0x79)]('|'), _0x3bf817 = 0x4bb * 0x1 + 0x801 + -0xcbc;
    while (!![]) {
        switch (_0x346c55[_0x3bf817++]) {
        case '0':
            console[_0x1f346d(0x7b)](_0x4c96d8);
            continue;
        case '1':
            console[_0x1f346d(0x7b)](_0x101028);
            continue;
        case '2':
            var _0x65977d = _0x860db8[_0x1f346d(0x66)]('5', -0x586 + -0x2195 + -0x6 * -0x685);
            continue;
        case '3':
            console[_0x1f346d(0x7b)](_0x65977d);
            continue;
        case '4':
            var _0x56d39b = _0x860db8[_0x1f346d(0x76)]('5', -'2');
            continue;
        case '5':
            console[_0x1f346d(0x7b)](_0x56d39b);
            continue;
        case '6':
            var _0x544285 = [
                '10',
                '10',
                '10',
                '10',
                '10'
            ][_0x1f346d(0x7a)](parseInt);
            continue;
        case '7':
            var _0x4c96d8 = _0x860db8[_0x1f346d(0x68)]('5', 0x622 * -0x6 + 0x4a * 0x3 + 0x1 * 0x23f1);
            continue;
        case '8':
            console[_0x1f346d(0x7b)](_0x544285);
            continue;
        case '9':
            var _0x101028 = _0x860db8[_0x1f346d(0x6f)](_0x860db8[_0x1f346d(0x6f)](_0x860db8[_0x1f346d(0x77)], 0x6fb * 0x5 + 0x1ebf * 0x1 + -0x41a5), 0x209 * 0xa + 0x1314 + -0x276d);
            continue;
        }
        break;
    }
}());
*/
```

# 反混淆工具

js obfuscator

[JS代码混淆与还原](https://github.com/kuizuo/js-de-obfuscator)

https://github.com/Its-Vichy/ClearJS

https://github.com/conanliu/de-js-obfuscator

## 原理

基于 AST 

# 自己实现

可以把 ui 自己放在网站上。

# 服务平台

# 参考资料

[JS代码混淆与还原](https://github.com/kuizuo/js-de-obfuscator)

https://github.com/javascript-obfuscator/javascript-obfuscator

* any list
{:toc}