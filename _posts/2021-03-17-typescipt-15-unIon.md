---
layout: post
title: Typescript-15-union type 联合类型
date:  2021-3-09 16:52:15 +0800
categories: [Web]
tags: [web, js, typescript, ts, ts-learn, js-learn, typescript-learn, sh]
published: true
---

# TypeScript 联合类型

联合类型（Union Types）可以通过管道( `|`)将变量设置多种类型，赋值时可以根据设置的类型来赋值。

注意：只能赋值指定的类型，如果赋值其它类型就会报错。

## 语法

创建联合类型的语法格式如下：

```
Type1|Type2|Type3 
```

## 实例

```js
var val:string|number 
val = 12 
console.log("数字为 "+ val) 
val = "ECHO" 
console.log("字符串为 " + val)
```

## 当做参数

也可以将联合类型作为函数参数使用：

```js
function disp(name:string|string[]) { 
        if(typeof name == "string") { 
                console.log(name) 
        } else { 
                var i; 
                for(i = 0;i<name.length;i++) { 
                console.log(name[i])
                } 
        } 
} 
disp("ECHO") 
console.log("输出数组....") 
disp(["ECHO","Google","Taobao","Facebook"])
```

# 联合类型数组

我们也可以将数组声明为联合类型：

```js
var arr:number[]|string[]; 
var i:number; 
arr = [1,2,4] 
console.log("**数字数组**")  
 
for(i = 0;i<arr.length;i++) { 
   console.log(arr[i]) 
}  
 
arr = ["Runoob","Google","Taobao"] 
console.log("**字符串数组**")  
 
for(i = 0;i<arr.length;i++) { 
   console.log(arr[i]) 
}
```

# 参考资料

https://www.runoob.com/typescript/ts-tuple.html

* any list
{:toc}
