---
layout: post
title:  Solidity-14-Conversions between Elementary Types
date:  2022-05-22 09:22:02 +0800
categories: [Lang]
tags: [lang, solidity, sh]
published: true
---

# 隐式转换 Implicit Conversions

在某些情况下，编译器会在赋值期间、将参数传递给函数以及应用运算符时自动应用隐式类型转换。

一般来说，如果在语义上有意义并且没有信息丢失，则值类型之间的隐式转换是可能的。

例如，uint8 可转换为 uint16，int128 可转换为 int256，但 int8 不可转换为 uint256，因为 uint256 不能保存 -1 等值。

如果将运算符应用于不同的类型，编译器会尝试将其中一个操作数隐式转换为另一个操作数的类型（赋值也是如此）。这意味着操作总是以操作数之一的类型执行。

有关可以进行哪些隐式转换的更多详细信息，请参阅有关类型本身的部分。

在下面的示例中，加法的操作数 y 和 z 的类型不同，但 uint8 可以隐式转换为 uint16，反之亦然。

因此，在 uint16 类型中执行加法之前，将 y 转换为 z 的类型。

表达式 y + z 的结果类型是 uint16。因为它被分配给类型为 uint32 的变量，所以在添加之后执行另一个隐式转换。

```js
uint8 y;
uint16 z;
uint32 x = y + z;
```

# 显式转换 Explicit Conversions

如果编译器不允许隐式转换，但您确信转换会起作用，则有时可以进行显式类型转换。 

这可能会导致意外行为并允许您绕过编译器的某些安全功能，因此请务必测试结果是否符合您的要求！

举一个将负整数转换为 uint 的示例：

```js
int  y = -3;
uint x = uint(y);
```

在此代码片段的末尾，x 将具有值 0xfffff..fd（64 个十六进制字符），在 256 位的二进制补码表示中为 -3。

如果将整数显式转换为更小的类型，则高阶位被截断：

```js
uint32 a = 0x12345678;
uint16 b = uint16(a); // b will be 0x5678 now
```

如果整数被显式转换为更大的类型，则在左侧填充（即，在高阶端）。 

转换的结果将等于原始整数：

```js
uint16 a = 0x1234;
uint32 b = uint32(a); // b will be 0x00001234 now
assert(a == b);
```

固定大小的字节类型在转换过程中表现不同。 

它们可以被认为是单个字节的序列，转换为更小的类型将切断序列：

```js
bytes2 a = 0x1234;
bytes1 b = bytes1(a); // b will be 0x12
```

如果将固定大小的字节类型显式转换为更大的类型，则会在右侧填充。 

访问固定索引处的字节将导致转换前后的值相同（如果索引仍在范围内）：

```js
bytes2 a = 0x1234;
bytes4 b = bytes4(a); // b will be 0x12340000
assert(a[0] == b[0]);
assert(a[1] == b[1]);
```

由于整数和固定大小的字节数组在截断或填充时表现不同，因此仅允许整数和固定大小的字节数组之间的显式转换，前提是两者具有相同的大小。 

如果要在整数和不同大小的固定大小字节数组之间进行转换，则必须使用中间转换来明确所需的截断和填充规则：

```js
bytes2 a = 0x1234;
uint32 b = uint16(a); // b will be 0x00001234
uint32 c = uint32(bytes4(a)); // c will be 0x12340000
uint8 d = uint8(uint16(a)); // d will be 0x34
uint8 e = uint8(bytes1(a)); // e will be 0x12
```

字节数组和字节调用数据切片可以显式转换为固定字节类型（bytes1/…/bytes32）。 

如果数组比目标固定字节类型长，最后会发生截断。 

如果数组比目标类型短，则将在末尾用零填充。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.5;

contract C {
    bytes s = "abcdefgh";
    function f(bytes calldata c, bytes memory m) public view returns (bytes16, bytes3) {
        require(c.length == 16, "");
        bytes16 b = bytes16(m);  // if length of m is greater than 16, truncation will happen
        b = bytes16(s);  // padded on the right, so result is "abcdefgh\0\0\0\0\0\0\0\0"
        bytes3 b1 = bytes3(s); // truncated, b1 equals to "abc"
        b = bytes16(c[:8]);  // also padded with zeros
        return (b, b1);
    }
}
```

# 文字和基本类型之间的转换 Conversions between Literals and Elementary Types

## 整数类型

十进制和十六进制数字文字可以隐式转换为任何足够大的整数类型，无需截断即可表示：

```js
uint8 a = 12; // fine
uint32 b = 1234; // fine
uint16 c = 0x123456; // fails, since it would have to truncate to 0x3456
```

- NOTE

在 0.8.0 版本之前，任何十进制或十六进制数字文字都可以显式转换为整数类型。


从 0.8.0 开始，此类显式转换与隐式转换一样严格，即仅当文字符合结果范围时才允许使用它们。

## 固定大小的字节数组

十进制数字文字不能隐式转换为固定大小的字节数组。 

十六进制数字文字可以，但前提是十六进制数字的数量完全适合字节类型的大小。 

作为一个例外，具有零值的十进制和十六进制文字都可以转换为任何固定大小的字节类型：

```js
bytes2 a = 54321; // not allowed
bytes2 b = 0x12; // not allowed
bytes2 c = 0x123; // not allowed
bytes2 d = 0x1234; // fine
bytes2 e = 0x0012; // fine
bytes4 f = 0; // fine
bytes4 g = 0x0; // fine
```

字符串文字和十六进制字符串文字可以隐式转换为固定大小的字节数组，如果它们的字符数与字节类型的大小匹配：

```js
bytes2 a = hex"1234"; // fine
bytes2 b = "xy"; // fine
bytes2 c = hex"12"; // not allowed
bytes2 d = hex"123"; // not allowed
bytes2 e = "x"; // not allowed
bytes2 f = "xyz"; // not allowed
```

# 地址

如地址文字中所述，通过校验和测试的正确大小的十六进制文字属于地址类型。 

没有其他文字可以隐式转换为地址类型。

从 bytes20 或任何整数类型到地址的显式转换导致地址支付。

地址 a 可以通过 `payable(a)` 转换为应付地址。

# 参考资料

https://docs.soliditylang.org/en/latest/types.html#conversions-between-elementary-types

* any list
{:toc}