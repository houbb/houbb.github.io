---
layout: post
title: windows bat 脚本教程-08-strings 字符串
date:  2016-11-30 14:14:36 +0800
categories: [Windows]
tags: [windows, shell, bat]
published: true
---

# strings

在 DOS 批处理脚本中处理字符串通常不像现代编程语言那样直观，但可以利用批处理命令和一些技巧来实现基本的字符串操作。

以下是对您提到的每个操作的示例和解释：

### 1. 创建字符串
在批处理中，直接赋值即可创建字符串：
```bat
@echo off
set greeting=Hello, World!
echo %greeting%
```

### 2. 空字符串
空字符串可以通过不赋任何值来创建：
```bat
@echo off
set emptyString=
echo %emptyString%   REM 这将输出一个空行
```

### 3. 字符串插值
在批处理中，可以通过变量嵌入来实现字符串插值：
```bat
@echo off
set name=World
set greeting=Hello, %name%!
echo %greeting%
```

### 4. 字符串连接
使用 `%var1% %var2%` 形式连接字符串：
```bat
@echo off
set part1=Hello,
set part2=World!
echo %part1% %part2%
```

### 5. 字符串长度
使用循环和字符串切片来计算长度：
```bat
@echo off
set str=Hello, World!
setlocal enableextensions
for /l %%i in (12,-1,1) do (
    if "!str:~%%i,1!"=="" (
        set "len=%%i"
        goto :eof
    )
)
echo Length: !len!
endlocal
```

### 6. 转换为整数
使用 `/A` 开关将字符串转换为整数：
```bat
@echo off
set /A num=%var%
echo Integer: %num%
```

### 7. 右对齐
批处理没有内置的右对齐功能，但可以通过计算空格数量来实现：
```bat
@echo off
set str=123
set "aligned=          %str%"
echo %aligned:~-10%
```

### 8. 左字符串
使用 `~` 运算符提取左边的字符：
```bat
@echo off
set str=Hello, World!
set "left=%str:~0,5%"
echo %left%   REM 输出 "Hello"
```

### 9. 中字符串
使用 `~` 运算符提取中间的字符：
```bat
@echo off
set str=Hello, World!
set "middle=%str:~7,5%"
echo %middle%   REM 输出 "World"
```

### 10. 删除
使用字符串替换来删除子字符串：
```bat
@echo off
set str=Hello, World!
set "newstr=%str:World!=%"
echo %newstr%   REM 输出 "Hello, "
```

### 11. 删除两端
删除字符串的首尾字符需要一些技巧：
```bat
@echo off
set str=Hello, World!
set "newstr=%str:~1,-1%"
echo %newstr%   REM 输出 "ell, World"
```

### 12. 删除所有空格
使用字符串替换来删除所有空格：
```bat
@echo off
set str=Hello, World!
set "newstr=%str: =%"
echo %newstr%   REM 输出 "Hello,World!"
```

### 13. 替换字符串
使用字符串替换来替换子字符串：
```bat
@echo off
set str=Hello, World!
set "newstr=%str:World!=there%"
echo %newstr%   REM 输出 "Hello, there"
```

### 14. 右字符串
提取字符串末尾的字符：
```bat
@echo off
set str=Hello, World!
set "right=%str:~-6%"
echo %right%   REM 输出 "World!"
```

请注意，批处理脚本的字符串处理能力有限，并且上述示例可能需要根据实际的脚本环境和需求进行调整。

# 参考资料

https://www.tutorialspoint.com/batch_script/batch_script_strings.htm

* any list
{:toc}