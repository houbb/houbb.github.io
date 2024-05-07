---
layout: post
title: Typescript-09-function 函数
date:  2021-3-09 16:52:15 +0800
categories: [Web]
tags: [web, js, typescript, ts, ts-learn, js-learn, typescript-learn, sh]
published: true
---

# TypeScript 函数

函数是一组一起执行一个任务的语句。

您可以把代码划分到不同的函数中。如何划分代码到不同的函数中是由您来决定的，但在逻辑上，划分通常是根据每个函数执行一个特定的任务来进行的。

函数声明告诉编译器函数的名称、返回类型和参数。函数定义提供了函数的实际主体。

# 函数定义

函数就是包裹在花括号中的代码块，前面使用了关键词 function：

语法格式如下所示：

```js
function function_name()
{
    // 执行代码
}
```

## 例子

```js
function () {   
    // 函数定义
    console.log("调用函数") 
}
```

# 调用函数

函数只有通过调用才可以执行函数内的代码。

语法格式如下所示：

```js
function_name()
```

## 实例

```js
function test() {   // 函数定义
    console.log("调用函数") 
} 
test()              // 调用函数
```

# 函数返回值

有时，我们会希望函数将执行的结果返回到调用它的地方。

通过使用 return 语句就可以实现。

在使用 return 语句时，函数会停止执行，并返回指定的值。

## 语法

语法格式如下所示：

```js
function function_name():return_type { 
    // 语句
    return value; 
}
```

return_type 是返回值的类型。

return 关键词后跟着要返回的结果。

一个函数只能有一个 return 语句。

返回值的类型需要与函数定义的返回类型(return_type)一致。

## 例子

```js
function msg():string{
    return "hello function return";
}

function log(msg) {
    console.log(msg);
}

log(msg());
```

执行结果：

```
hello function return
```

# 带参数函数

在调用函数时，您可以向其传递值，这些值被称为参数。

这些参数可以在函数中使用。

您可以向函数发送多个参数，每个参数使用逗号 , 分隔：

## 语法


语法格式如下所示：

```js
function func_name( param1 [:datatype], param2 [:datatype]) {   
}
```

param1、param2 为参数名。

datatype 为参数类型。

## 例子

```js
function add(num1:number, num2:number) {
    var sum = num1 + num2;
    
    console.log(sum);
}

add(1,2);
```

输出结果：

```
3
```

# 可选参数和默认参数

## 可选参数

在 TypeScript 函数里，如果我们定义了参数，则我们必须传入这些参数，除非将这些参数设置为可选，可选参数使用问号标识 `？`。

### 例子

```js
function showName(firstName:string, secondName?: string) {
    var fullName = firstName;
    
    if(secondName) {
        fullName = firstName + "  " + secondName;
    }
    
    console.log(fullName);
}

showName("hello", "world");
showName("hello");
```

输出：

```
hello  world
hello
```

可选参数必须跟在必需参数后面。 

如果上例我们想让 firstName 是可选的，secondName 必选，那么就要调整它们的位置，把 firstName 放在后面。

如果都是可选参数就没关系。

##  默认参数

我们也可以设置参数的默认值，这样在调用函数的时候，如果不传入该参数的值，则使用默认参数，语法格式为：

```js
function function_name(param1[:type],param2[:type] = default_value) { 
}
```

注意：参数不能同时设置为可选和默认。

这也很好理解，一旦设置默认值，那不传的时候值已经固定了。

### 例子

```js
function showName(firstName:string, secondName: string="default") {
    var fullName = firstName + "  " + secondName;

    console.log(fullName);
}

showName("hello", "world");
showName("hello");
```

输出：

```
hello  world
hello  default
```

#  剩余参数

有一种情况，我们不知道要向函数传入多少个参数，这时候我们就可以使用剩余参数来定义。

剩余参数语法允许我们将一个不确定数量的参数作为一个数组传入。

ps: 类似于 java 中的可变参数。

## 例子

```js
function showName(firstName:string, ...restNames: string[]) {
    var fullName = firstName + "  " + restNames.join(" ");

    console.log(fullName);
}

showName("hello", "world", "var");
showName("hello", "world");
showName("hello");
```

输出：

```
hello  world var
hello  world
hello
```

# 匿名函数

匿名函数是一个没有函数名的函数。

匿名函数在程序运行时动态声明，除了没有函数名外，其他的与标准函数一样。

我们可以将匿名函数赋值给一个变量，这种表达式就成为函数表达式。

## 语法

语法格式如下：

```js
var res = function( [arguments] ) { ... }
```

### 例子

```js
var m1 = function() {
    console.log("hello no param");
}

m1();

var m2 = function(param:string) {
    console.log("param " + param);
}

m2("has param");
```

输出结果：

```
hello no param
param has param
```

## 匿名函数自调用

匿名函数自调用在函数后使用 () 即可： 

```js
(function () { 
    var x = "Hello!!";   
    console.log(x)     
 })()
```

输出：

```
Hello!!
```

# 构造函数

TypeScript 也支持使用 JavaScript 内置的构造函数 `Function()` 来定义函数：

## 语法

语法格式如下：

```js
var res = new Function ([arg1[, arg2[, ...argN]],] functionBody)
```

参数说明：

arg1, arg2, ... argN：参数列表。

functionBody：一个含有包括函数定义的 JavaScript 语句的字符串。 

## 例子

```js
var myFunction = new Function("a", "b", "return a * b"); 
var x = myFunction(4, 3); 
console.log(x);
```

# 递归函数

递归函数即在函数内调用函数本身。 

## 例子

最经典的斐波那契：

```js
function factorial(number) {
    if (number <= 0) {         // 停止执行
        return 1; 
    } else {     
        return (number * factorial(number - 1));     // 调用自身
    } 
}; 
console.log(factorial(6));      // 输出 720
```

# Lambda 函数

Lambda 函数也称之为箭头函数。

箭头函数表达式的语法比函数表达式更短。

函数只有一行语句：

```js
( [param1, parma2,…param n] )=>statement;
```

## 实例

以下实例声明了 lambda 表达式函数，函数返回两个数的和：

```js
var foo = (x:number)=>10 + x 
console.log(foo(100))      //输出结果为 110
```

## 代码块

函数是一个语句块：

```js
( [param1, parma2,…param n] )=> {
 
    // 代码块
}
```

## 类型推断

我们可以不指定函数的参数类型，通过函数内来推断参数类型: 

```js
var func = (x)=> { 
    if(typeof x=="number") { 
        console.log(x+" 是一个数字") 
    } else if(typeof x=="string") { 
        console.log(x+" 是一个字符串") 
    }  
} 
func(12) 
func("Tom")
```

## 单个参数 () 是可选的：

```js
var display = x => { 
    console.log("输出为 "+x) 
} 
display(12)
```

## 无参数

无参数时可以设置空括号：

```js
var disp =()=> { 
    console.log("Function invoked"); 
} 
disp();
```

# 函数重载

重载是方法名字相同，而参数不同，返回类型可以相同也可以不同。

每个重载的方法（或者构造函数）都必须有一个独一无二的参数类型列表。

## 参数类型不同：

```js
function disp(string):void; 
function disp(number):void;
```

## 参数数量不同：

```js
function disp(n1:number):void; 
function disp(x:number,y:number):void;
```

## 参数类型顺序不同：

```js
function disp(n1:number,s1:string):void; 
function disp(s:string,n:number):void;
```

如果参数类型不同，则参数类型应设置为 any。

参数数量不同你可以将不同的参数设置为可选。

# 参考资料

https://www.runoob.com/typescript/ts-function.html

* any list
{:toc}