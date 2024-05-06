---
layout: post
title: windows bat 脚本教程-09-arrays 数组
date:  2016-11-30 14:14:36 +0800
categories: [Windows]
tags: [windows, shell, bat]
published: true
---

# arrays

**批处理脚本中的数组实现**

**介绍**
在批处理脚本中，数组没有特定的类型定义，但可以被实现。当在批处理脚本中实现数组时，需要注意以下几点。

**定义数组**
数组的每个元素都需要使用 `set` 命令定义。

**迭代数组**
需要使用 `for` 循环来遍历数组的值。

**创建数组**
通过以下 `set` 命令创建数组。

```batch
set a[0]=1
```

其中，0 是数组的索引，1 是分配给数组第一个元素的值。

另一种实现数组的方法是定义一个值列表，然后通过值列表进行迭代。以下示例展示了如何实现这一点。

**示例**

```batch
@echo off 
set list=1 2 3 4 
(for %%a in (%list%) do ( 
   echo %%a 
))
```

**输出**

上述命令产生以下输出。

```
1
2
3
4
```

**访问数组**
您可以使用下标语法从数组中检索值，即在数组名称后紧跟方括号，方括号内是您想要检索的值的索引。

```batch
@echo off 
set a[0]=1 
echo %a[0]%
```

在这个例子中，索引从 0 开始，这意味着可以使用索引 0 访问第一个元素，使用索引 1 访问第二个元素，依此类推。让我们检查以下示例以创建、初始化和访问数组。

```batch
@echo off
set a[0]=1 
set a[1]=2 
set a[2]=3 
echo The first element of the array is %a[0]% 
echo The second element of the array is %a[1]% 
echo The third element of the array is %a[2]%
```

**输出**

上述命令产生以下输出。

```
The first element of the array is 1 
The second element of the array is 2 
The third element of the array is 3
```

**修改数组**
要向数组末尾添加一个元素，您可以使用 `set` 命令和数组元素的最后索引。

```batch
@echo off 
set a[0]=1  
set a[1]=2  
set a[2]=3 
Rem 添加一个元素到数组末尾 
Set a[3]=4 
echo The last element of the array is %a[3]%
```

**输出**

上述命令产生以下输出。

```
The last element of the array is 4
```

您可以通过在给定索引处分配新值来修改数组的现有元素，如以下示例所示。

```batch
@echo off 
set a[0]=1 
set a[1]=2  
set a[2]=3 
Rem 为数组的第二个元素设置新值 
Set a[1]=5 
echo The new value of the second element of the array is %a[1]%
```

**输出**

上述命令产生以下输出。

```
The new value of the second element of the array is 5
```

**遍历数组**
通过使用 `for` 循环并遍历数组的每个元素来实现对数组的遍历。以下示例展示了实现数组的简单方法。

```batch
@echo off 
setlocal enabledelayedexpansion 
set topic[0]=comments 
set topic[1]=variables 
set topic[2]=Arrays 
set topic[3]=Decision making 
set topic[4]=Time and date 
set topic[5]=Operators 

for /l %%n in (0,1,5) do ( 
   echo !topic[%%n]! 
)
```

**总结**

上述程序需要注意以下几点。

- 每个数组元素都需要使用 `set` 命令进行具体定义。
- 使用 `/L` 参数的 `for` 循环用于遍历数组。

**输出**

上述命令产生以下输出。

```
Comments 
variables 
Arrays 
Decision making 
Time and date 
Operators
```


**数组的长度**

数组的长度通过对数组中的值列表进行迭代来完成，因为没有直接的函数来确定数组中元素的数量。

```batch
@echo off 
set Arr[0]=1 
set Arr[1]=2 
set Arr[2]=3 
set Arr[3]=4 
set "x=0" 
:SymLoop 

if defined Arr[%x%] ( 
   call echo %%Arr[%x%]%% 
   set /a "x+=1"
   GOTO :SymLoop 
)
echo "数组的长度为" %x%
```

**输出**

上述命令产生以下输出。

```
1
2
3
4
"数组的长度为" 4
```

**在数组中创建结构体**

在批处理文件中也可以使用额外的编码来实现结构体。以下示例展示了如何实现这一点。

**示例**

```batch
@echo off 
set obj[0].Name=Joe 
set obj[0].ID=1 
set obj[1].Name=Mark 
set obj[1].ID=2 
set obj[2].Name=Mohan 
set obj[2].ID=3 
FOR /L %%i IN (0,1,2) DO  (
   call echo Name = %%obj[%%i].Name%%
   call echo Value = %%obj[%%i].ID%%
)
```

**关键点**

关于上述代码，需要注意以下几点。

- 使用 `set` 命令定义的每个变量与数组的每个索引相关联有 2 个值。
- 将变量 i 设置为 0，以便我们可以循环遍历结构体的长度，该长度为 3。
- 我们始终检查 i 的值是否等于 len 的值，如果不是，我们就循环执行代码。
- 我们能够使用 obj[%i%] 符号访问结构体的每个元素。

**输出**

上述命令产生以下输出。

```
Name=Joe 
Value=1 
Name=Mark 
Value=2 
Name=Mohan 
Value=3
```

# chat

## 详细介绍一下 bat 数组

在批处理（Batch）文件中，并没有直接支持传统编程语言中数组的概念。

不过，批处理文件通过一些特殊的方法来模拟数组的功能，这通常涉及到使用变量和批处理命令来实现类似数组的操作。

### 基本概念

在批处理中，数组可以通过以下方式模拟：

- **单个变量存储**：使用单个变量来存储一系列以某种分隔符分隔的值。
- **变量扩展**：利用批处理的变量扩展特性来获取或设置变量的一部分。

### 使用变量存储数组
在批处理中，你可以将多个值存储在单个变量中，并通过特定的分隔符将它们分隔开。例如：

```bat
set myArray=one,two,three
```

### 访问数组元素
要访问这些值，你可以使用 `for` 循环结合延迟变量扩展来遍历数组中的每个元素：

```bat
@echo off
setlocal enabledelayedexpansion
set myArray=one,two,three

for %%i in (%myArray%) do (
    echo !%%i!
)
```

### 修改数组元素
要修改数组中的某个特定元素，你需要重新构造整个数组，因为批处理中没有直接的索引操作：

```bat
@echo off
setlocal enabledelayedexpansion
set myArray=one,two,three

:: 修改第二个元素为 "newTwo"
set myArray=one,newTwo,three
```

### 动态数组
批处理中没有直接的动态数组支持，但你可以通过维护一个计数器和一系列变量来模拟动态数组的行为：

```bat
@echo off
setlocal enabledelayedexpansion
set counter=0

:: 添加元素到“动态数组”
call :AddToArray myArray newElement
call :AddToArray myArray anotherElement

goto :eof

:AddToArray arrayName element
set /a counter+=1
set "%arrayName%[!counter!]=%element%"
goto :eof
```

### 注意事项
- 在批处理中，数组的大小是固定的，一旦定义了数组的元素数量，就不能改变。
- 使用变量存储数组时，需要注意分隔符的选择，以避免与数组元素中可能存在的字符冲突。
- 批处理中的数组操作通常比传统编程语言中的数组操作要复杂和低效。

虽然批处理文件没有直接的数组支持，但通过一些技巧和方法，你仍然可以实现类似数组的功能，以满足特定的编程需求。




# 参考资料

https://www.tutorialspoint.com/batch_script/batch_script_arrays.htm

* any list
{:toc}