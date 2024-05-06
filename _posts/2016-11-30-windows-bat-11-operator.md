---
layout: post
title: windows bat 脚本教程-11-operator 运算符
date:  2016-11-30 14:14:36 +0800
categories: [Windows]
tags: [windows, shell, bat]
published: true
---

# 运算符

**运算符**

运算符是告诉编译器执行特定数学或逻辑操作的符号。

在批处理脚本中，可以使用以下类型的运算符。

- 算术运算符
- 关系运算符
- 逻辑运算符
- 赋值运算符
- 位运算符

**算术运算符**

批处理脚本语言支持与任何语言相同的常规算术运算符。以下是可用的算术运算符。

| 运算符 | 描述                                | 示例               |
| ------ | ----------------------------------- | ------------------ |
| +      | 两个操作数的加法                    | 1 + 2 将得到 3     |
| -      | 第二个操作数减去第一个操作数        | 2 - 1 将得到 1     |
| *      | 两个操作数的乘法                    | 2 * 2 将得到 4     |
| /      | 分子除以分母的除法                  | 3 / 2 将得到 1.5   |
| %      | 取模运算符和整数/浮点数除法的余数 | 3 % 2 将得到 1     |

**关系运算符**

关系运算符允许比较对象。以下是可用的关系运算符。

| 运算符 | 描述                                  | 示例               |
| ------ | ------------------------------------- | ------------------ |
| EQU    | 测试两个对象之间的相等性              | 2 EQU 2 将得到 true |
| NEQ    | 测试两个对象之间的差异                | 3 NEQ 2 将得到 true |
| LSS    | 检查左侧对象是否小于右侧操作数        | 2 LSS 3 将得到 true |
| LEQ    | 检查左侧对象是否小于或等于右侧操作数  | 2 LEQ 3 将得到 true |
| GTR    | 检查左侧对象是否大于右侧操作数        | 3 GTR 2 将得到 true |
| GEQ    | 检查左侧对象是否大于或等于右侧操作数  | 3 GEQ 2 将得到 true |


**逻辑运算符**

逻辑运算符用于评估布尔表达式。以下是可用的逻辑运算符。

批处理语言配备了一套完整的布尔逻辑运算符，如 AND、OR、XOR，但仅用于二进制数。也没有 TRUE 或 FALSE 的值。条件中唯一可用的逻辑运算符是 NOT 运算符。

| 运算符 | 描述                 |
| ------ | -------------------- |
| AND    | 逻辑“与”运算符       |
| OR     | 逻辑“或”运算符       |
| NOT    | 逻辑“非”运算符       |

**赋值运算符**

批处理脚本语言还提供赋值运算符。以下是可用的赋值运算符。

| 运算符 | 描述                                       | 示例                               |
| ------ | ------------------------------------------ | ---------------------------------- |
| +=     | 将右操作数加到左操作数并将结果赋值给左操作数 | `Set /A a = 5`<br>`a += 3`<br>输出为 8 |
| -=     | 将左操作数减去右操作数并将结果赋值给左操作数 | `Set /A a = 5`<br>`a -= 3`<br>输出为 2 |
| *=     | 将右操作数与左操作数相乘并将结果赋值给左操作数 | `Set /A a = 5`<br>`a *= 3`<br>输出为 15 |
| /=     | 将左操作数除以右操作数并将结果赋值给左操作数 | `Set /A a = 6`<br>`a /= 3`<br>输出为 2 |
| %=     | 使用两个操作数取模并将结果赋值给左操作数     | `Set /A a = 5`<br>`a %= 3`<br>输出为 2 |

**位运算符**

批处理脚本中也可以使用位运算符。以下是可用的运算符。

| 运算符 | 描述                       |
| ------ | -------------------------- |
| &      | 位“与”运算符               |
| \|     | 位“或”运算符               |
| ^      | 位“异或”或“异或”运算符     |

以下是展示这些运算符的真值表。

| p    | q    | p & q | p \| q | p ^ q |
| ---- | ---- | ----- | ------ | ----- |
| 0    | 0    | 0     | 0      | 0     |
| 0    | 1    | 0     | 1      | 1     |
| 1    | 1    | 1     | 1      | 0     |
| 1    | 0    | 0     | 1      | 1     |


# chat

## 详细介绍一下 bat 的 运算符

在批处理（Batch）文件中，运算符用于执行数学运算、字符串操作和逻辑比较。以下是一些常用的运算符及其用法：

### 数学运算符
批处理文件支持基本的数学运算，包括：

- 加法：`+`
- 减法：`-`
- 乘法：`*`
- 除法：`/`

数学运算通常与 `set /a` 命令结合使用，因为直接使用运算符在批处理中并不总是有效。例如：

```bat
@echo off
set /a value1=10
set /a value2=5
set /a result=value1+value2
echo %result%  ; 输出 15
```

### 字符串运算符
批处理文件也支持一些基本的字符串操作：

- 连接（追加）：`&`
- 表达式修改：`|`
- 变量替换：`%variable%`

字符串连接使用 `&` 运算符，例如：

```bat
set str1=Hello
set str2=World
set result=%str1%&%str2%
echo %result%  ; 输出 HelloWorld
```

### 逻辑运算符
逻辑运算符用于根据条件执行特定的逻辑判断：

- `&&`：逻辑与。如果两个命令都成功执行（即返回0的退出代码），则执行紧随其后的命令。
- `||`：逻辑或。如果两个命令中的任何一个成功执行，则执行紧随其后的命令。

例如：

```bat
@echo off
if exist file.txt (
    echo File exists.&&
    type file.txt
) else (
    echo File does not exist.
)
```

### 比较运算符
比较运算符用于比较两个值，并根据比较结果执行不同的命令：

- `==`：等于
- `!=`：不等于

这些运算符通常与 `if` 命令结合使用，例如：

```bat
if "%variable%" == "value" (
    echo Variable is equal to value.
)
```

### 文件存在检查
`if exist` 和 `if not exist` 用于检查文件或目录是否存在：

```bat
if exist file.txt (
    echo File exists.
) else if not exist file.txt (
    echo File does not exist.
)
```

### 变量存在检查
`if defined` 和 `if not defined` 用于检查变量是否已经声明：

```bat
if defined variable (
    echo Variable is defined.
) else if not defined variable (
    echo Variable is not defined.
)
```

### 错误级别检查
`if errorlevel` 和 `if not errorlevel` 用于检查前一个命令的退出状态：

```bat
command
if errorlevel 1 (
    echo The command failed.
)
```

### 注意事项
- 在使用字符串连接时，如果变量或字符串中包含空格，需要使用双引号将它们括起来。
- 在进行数学运算时，通常需要使用 `set /a` 命令，因为直接使用运算符可能无法正确执行。
- 在比较字符串时，确保使用双引号将变量和字符串值括起来，以避免批处理文件中的空格问题。

批处理文件中的运算符提供了执行数学运算、字符串操作和逻辑比较的能力，使得批处理文件能够执行更复杂的任务。

## 详细介绍 BAT 算术运算符

在批处理（Batch）文件中，算术运算符用于执行基本的数学运算。虽然批处理文件不像传统的编程语言那样直接支持算术运算，但可以通过特定的命令和技巧来实现这些操作。以下是批处理文件中常用的算术运算符及其用法：

### 基本算术运算符

1. **加法** (`+`): 用于计算两个数的和。
   ```bat
   set /a sum=var1+var2
   ```

2. **减法** (`-`): 用于计算两个数的差。
   ```bat
   set /a difference=var1-var2
   ```

3. **乘法** (`*`): 用于计算两个数的乘积。
   ```bat
   set /a product=var1*var2
   ```

4. **除法** (`/`): 用于计算两个数的商。注意，批处理中的除法是整数除法，不保留小数部分。
   ```bat
   set /a quotient=var1/var2
   ```

5. **取模** (`%`): 用于计算除法的余数。
   ```bat
   set /a remainder=var1%var2
   ```

### 使用 `set /a` 命令
在批处理文件中，`set /a` 命令用于执行算术运算。它可以直接执行上述的加法、减法、乘法和除法运算。例如：

```bat
@echo off
set var1=10
set var2=3
set /a sum=var1+var2
echo The sum is: %sum%
```

### 注意事项
- 使用 `set /a` 命令时，确保不要在变量和运算符之间添加空格。例如，使用 `set /a sum=var1+var2` 而不是 `set /a sum=var1 + var2`。
- 批处理文件中的除法运算是整数除法，不会返回小数部分。如果需要进行浮点数运算，可能需要调用外部程序或使用其他方法。

### 扩展变量
在某些情况下，你可能需要对变量进行扩展，以获取其值并进行进一步的运算。这可以通过在变量周围使用 `!`（启用延迟变量扩展）或 `%`（正常变量扩展）来实现。例如：

```bat
@echo off
setlocal enabledelayedexpansion
set var1=5
set var2=2
set /a result=!var1! / !var2!
echo The result is: !result!
endlocal
```

### 示例
以下是一些使用算术运算符的批处理文件示例：

```bat
@echo off
set var1=7
set var2=3

:: 加法
set /a sum=var1+var2
echo %sum%

:: 减法
set /a difference=var1-var2
echo %difference%

:: 乘法
set /a product=var1*var2
echo %product%

:: 除法
set /a quotient=var1/var2
echo %quotient%

:: 取模
set /a remainder=var1%var2
echo %remainder%
```

通过使用这些算术运算符和 `set /a` 命令，你可以在批处理文件中执行各种数学运算，从而创建更复杂的脚本和自动化任务。

## 详细介绍 BAT 关系运算符

在批处理（Batch）文件中，关系运算符用于比较两个值，并根据比较结果返回真（true）或假（false）。这些运算符通常与 `if` 语句结合使用，以实现条件逻辑。以下是批处理文件中常用的关系运算符：

### 常用关系运算符

1. **等于** (`==`): 比较两个值是否相等。
   ```bat
   if "%var1%" == "%var2%" (
       echo var1 is equal to var2.
   )
   ```

2. **不等于** (`!=` 或 `<>`): 比较两个值是否不相等。
   ```bat
   if "%var1%" != "%var2%" (
       echo var1 is not equal to var2.
   )
   ```

3. **大于** (`>`): 比较两个数值是否第一个大于第二个。
   ```bat
   if %var1% > %var2% (
       echo var1 is greater than var2.
   )
   ```

4. **小于** (`<`): 比较两个数值是否第一个小于第二个。
   ```bat
   if %var1% < %var2% (
       echo var1 is less than var2.
   )
   ```

5. **大于等于** (`>=`): 比较两个数值是否第一个大于或等于第二个。
   ```bat
   if %var1% >= %var2% (
       echo var1 is greater than or equal to var2.
   )
   ```

6. **小于等于** (`<=`): 比较两个数值是否第一个小于或等于第二个。
   ```bat
   if %var1% <= %var2% (
       echo var1 is less than or equal to var2.
   )
   ```

### 使用注意事项

- 在使用字符串比较时，确保两个变量都用双引号包围，以避免空格和特殊字符引起的问题。
- 在进行数值比较时，不需要使用双引号，因为数值比较不涉及字符串解析。
- 字符串比较是区分大小写的，如果需要进行不区分大小写的比较，可以临时将变量转换为全小写或全大写进行比较。

### 示例

以下是一些使用关系运算符的批处理文件示例：

```bat
@echo off
set var1=5
set var2=10

:: 等于
if %var1% == %var2% (
    echo var1 is equal to var2.
) else (
    echo var1 is not equal to var2.
)

:: 大于
if %var1% > %var2% (
    echo var1 is greater than var2.
) else (
    echo var1 is not greater than var2.
)

:: 小于等于
if %var1% <= %var2% (
    echo var1 is less than or equal to var2.
) else (
    echo var1 is not less than or equal to var2.
)
```

通过使用关系运算符，你可以在批处理文件中实现复杂的条件逻辑，根据变量的值执行不同的命令或脚本块。这使得批处理文件能够更加灵活和强大。

## 详细介绍 BAT 逻辑运算符

在批处理（Batch）文件中，逻辑运算符用于组合多个条件，决定基于这些条件的逻辑结果。以下是批处理文件中常用的逻辑运算符及其用法：

### 常用逻辑运算符

1. **逻辑与** (`&&`): 当两个条件都为真时，执行逻辑与运算符后面的命令。
   ```bat
   if condition1 && condition2 (
       echo Both conditions are true.
   )
   ```

2. **逻辑或** (`||`): 当两个条件中至少有一个为真时，执行逻辑或运算符后面的命令。
   ```bat
   if condition1 || condition2 (
       echo At least one condition is true.
   )
   ```

3. **逻辑非** (`!`): 用于反转条件的真假值。
   ```bat
   if not condition (
       echo The condition is false.
   )
   ```

### 使用逻辑运算符

逻辑运算符通常与 `if` 语句结合使用，以实现更复杂的条件逻辑。例如：

```bat
@echo off
set /a var1=5
set /a var2=10

:: 使用逻辑与
if %var1% > 3 && %var2% < 20 (
    echo var1 is greater than 3 and var2 is less than 20.
)

:: 使用逻辑或
if %var1% > 10 || %var2% < 5 (
    echo Either var1 is greater than 10 or var2 is less than 5.
)

:: 使用逻辑非
if not %var1% == %var2% (
    echo var1 is not equal to var2.
)
```

### 注意事项

- 在使用逻辑运算符时，确保每个条件都被正确地评估。例如，使用 `&&` 或 `||` 时，每个条件都应该能够独立返回一个布尔值。
- 当使用 `if` 语句结合逻辑运算符时，命令块需要用括号 `()` 包围起来。
- 逻辑非运算符 `!` 仅用于 `if` 语句中，并且它直接作用于后面的条件。

### 逻辑运算符的组合使用

逻辑运算符可以组合使用，以实现更复杂的逻辑。例如：

```bat
@echo off
set /a var1=5
set /a var2=10

:: 组合使用逻辑与和逻辑非
if %var1% > 3 && %var2% < 15 || !%var1% == %var2% (
    echo The combined conditions are true.
)
```

### 逻辑运算符与命令执行

逻辑运算符也用于命令执行，而不仅仅是条件语句中：

- 使用 `&&` 可以确保当第一个命令成功执行（返回0）时，才执行第二个命令。
- 使用 `||` 可以确保当第一个命令失败（非0返回）时，执行第二个命令。

```bat
command1 && command2
command1 || command2
```

这种用法允许在批处理文件中实现基于前一个命令执行结果的流程控制。

逻辑运算符是批处理文件中实现复杂条件逻辑和命令流程控制的重要工具，通过它们可以编写功能更强大的自动化脚本。

## 详细介绍 BAT 赋值运算符

在批处理（Batch）文件中，赋值运算符用于给变量设置值或更新变量的值。以下是批处理中常用的赋值运算符及其用法：

### 基本赋值运算符

1. **简单赋值** (`=`): 用于给变量分配一个值。
   ```bat
   set var=value
   ```

2. **追加赋值** (`&=` 或 `+=`): 用于将字符串或数值添加到变量的现有值上。

### 追加赋值的实现

在标准的批处理语法中，没有直接的追加赋值运算符，但可以通过以下方法实现追加：

#### 追加字符串

```bat
set "var=%var% more text"
```

这里使用了延迟变量扩展（通过 `%var%` 替换为变量的值，然后连接更多的文本），从而实现字符串的追加赋值。

#### 追加数值

在批处理中，数值的追加可以通过 `set /a` 命令实现：

```bat
set /a var+=1
```

这将变量 `var` 的值增加1。如果要增加一个特定的数值，可以先计算新的值，然后再赋值：

```bat
set /a temp=%var%+5
set var=%temp%
```

### 示例

以下是一些使用赋值运算符的批处理文件示例：

```bat
@echo off
set var=Hello
set "var=%var% World"  ; 追加字符串

set /a num=10
set /a num+=5  ; 数值追加

echo %var%  ; 输出 "Hello World"
echo %num%  ; 输出 "15"
```

### 注意事项

- 在连接字符串时，使用双引号可以防止空格被解释，确保字符串正确连接。
- 使用 `set /a` 命令进行数值操作时，不要在变量和运算符之间添加空格。
- 批处理文件的赋值运算符功能相对有限，特别是在数值操作方面，需要使用特定的命令来实现。

通过使用赋值运算符，你可以在批处理文件中创建和修改变量，从而实现更复杂的脚本逻辑。

## 详细介绍 BAT 位运算符

批处理（Batch）文件中并不直接支持位运算符，因为它们是针对二进制数的运算，而批处理文件主要处理的是字符串和数值运算。然而，Windows命令行提供了一些与位运算相关的命令，可以用来模拟位运算的功能。

### 位运算符简介

位运算符在编程中通常用于对整数的二进制表示进行操作，包括：

1. **按位与** (`&`): 对应二进制位都为1时，结果为1。
2. **按位或** (`|`): 对应二进制位至少有一个为1时，结果为1。
3. **按位非** (`~`): 反转所有的二进制位。
4. **按位异或** (`^`): 对应二进制位不相同时结果为1。
5. **左移** (`<<`): 将二进制数的位向左移动指定的位数。
6. **右移** (`>>`): 将二进制数的位向右移动指定的位数。

### 批处理中的位运算模拟

虽然批处理文件本身不支持位运算，但可以通过调用外部程序（如 `debug.exe`）或使用Windows命令行的一些特性来实现类似的功能。

#### 使用 `debug.exe`

Windows的 `debug.exe` 工具可以用来执行一些低级别的操作，包括位运算。然而，这个工具在现代Windows系统中可能不可用或不推荐使用。

#### 使用命令行特性

例如，可以使用 `bcdedit` 来查看和修改启动配置数据（BCD store）中的某些值，这些值经常使用十六进制的位运算。

```bat
bcdedit /set {current} safeboot minimal
```

上面的命令使用了按位或操作来设置启动选项。

### 批处理中模拟位运算的替代方法

在批处理中，如果你需要进行位运算，你可能需要：

1. 将数值转换为字符串形式的二进制表示。
2. 使用字符串操作来模拟位运算。
3. 将结果转换回数值形式。

这个过程相当复杂，并且不是批处理所擅长的。通常，如果需要进行位运算，我们会推荐使用支持位运算的编程语言，如C、C++、Python等。

### 示例

这里提供一个简单的示例，说明如何在批处理中模拟按位与操作：

```bat
@echo off
setlocal enabledelayedexpansion

:: 假设我们要计算 2 & 3 的结果
set /a num1=2
set /a num2=3

:: 将数值转换为二进制字符串
for /L %%i in (31,-1,0) do (
    if /i "!num1!" >= "1" (
        set /a "binaryNum1=(num1>>i)&1"
    ) else (
        set "binaryNum1=0"
    )
    set "binaryStr=!binaryNum1!!binaryStr!"
)

for /L %%i in (31,-1,0) do (
    if /i "!num2!" >= "1" (
        set /a "binaryNum2=(num2>>i)&1"
    ) else (
        set "binaryNum2=0"
    )
    set "binaryStr2=!binaryNum2!!binaryStr2!"
)

:: 执行按位与操作
set "resultStr="
for /L %%i in (0,1,%binaryStr:~0,1%) do (
    if "!binaryStr:~%%i,1!"=="1" (
        if "!binaryStr2:~%%i,1!"=="1" (
            set "resultStr=1!resultStr!"
        ) else (
            set "resultStr=0!resultStr!"
        )
    ) else (
        set "resultStr=0!resultStr!"
    )
)

:: 将结果转换回数值
set /a "result=0"
for /L %%i in (0,1,%resultStr:~0,1%) do (
    set /a "result=result + (resultStr:~%%i,1) * (2^(%resultStr:~0,1%-%%i))"
)

echo The result of %num1% & %num2% is: %result%
endlocal
```

请注意，这个示例非常基础，并且仅用于说明如何在批处理中模拟位运算。

在实际应用中，直接使用支持位运算的编程语言会更加高效和准确。

# 参考资料

https://www.tutorialspoint.com/batch_script/batch_script_operators.htm

* any list
{:toc}