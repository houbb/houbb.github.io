---
layout: post
title:  Solidity-18-Inline Assembly
date:  2022-05-22 09:22:02 +0800
categories: [Lang]
tags: [lang, solidity, sh]
published: true
---

# Inline Assembly

您可以使用接近以太坊虚拟机的语言将 Solidity 语句与内联汇编交错。这为您提供了更细粒度的控制，这在您通过编写库来增强语言时特别有用。

在 Solidity 中用于内联汇编的语言称为 Yul，它记录在其自己的部分中。本节将仅介绍内联汇编代码如何与周围的 Solidity 代码交互。

警告

内联汇编是一种在低级别访问以太坊虚拟机的方法。这绕过了几个重要的安全特性和对 Solidity 的检查。你应该只将它用于需要它的任务，并且只有在你有信心使用它的情况下。

内联汇编块由汇编 `{ ... }` 标记，其中大括号内的代码是 Yul 语言的代码。

内联汇编代码可以访问本地 Solidity 变量，如下所述。

不同的内联汇编块不共享命名空间，即不能调用 Yul 函数或访问在不同内联汇编块中定义的 Yul 变量。

# 例子

以下示例提供库代码来访问另一个合约的代码并将其加载到字节变量中。 

通过使用 `<address>.code`，“plain Solidity”也可以做到这一点。 

但这里的重点是，可重用的汇编库可以在不更改编译器的情况下增强 Solidity 语言。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

library GetCode {
    function at(address addr) public view returns (bytes memory code) {
        assembly {
            // retrieve the size of the code, this needs assembly
            let size := extcodesize(addr)
            // allocate output byte array - this could also be done without assembly
            // by using code = new bytes(size)
            code := mload(0x40)
            // new "memory end" including padding
            mstore(0x40, add(code, and(add(add(size, 0x20), 0x1f), not(0x1f))))
            // store length in memory
            mstore(code, size)
            // actually retrieve the code, this needs assembly
            extcodecopy(addr, add(code, 0x20), 0, size)
        }
    }
}
```

在优化器无法生成高效代码的情况下，内联汇编也很有用，例如：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;


library VectorSum {
    // This function is less efficient because the optimizer currently fails to
    // remove the bounds checks in array access.
    function sumSolidity(uint[] memory data) public pure returns (uint sum) {
        for (uint i = 0; i < data.length; ++i)
            sum += data[i];
    }

    // We know that we only access the array in bounds, so we can avoid the check.
    // 0x20 needs to be added to an array because the first slot contains the
    // array length.
    function sumAsm(uint[] memory data) public pure returns (uint sum) {
        for (uint i = 0; i < data.length; ++i) {
            assembly {
                sum := add(sum, mload(add(add(data, 0x20), mul(i, 0x20))))
            }
        }
    }

    // Same as above, but accomplish the entire code within inline assembly.
    function sumPureAsm(uint[] memory data) public pure returns (uint sum) {
        assembly {
            // Load the length (first 32 bytes)
            let len := mload(data)

            // Skip over the length field.
            //
            // Keep temporary variable so it can be incremented in place.
            //
            // NOTE: incrementing data would result in an unusable
            //       data variable after this assembly block
            let dataElementLocation := add(data, 0x20)

            // Iterate until the bound is not met.
            for
                { let end := add(dataElementLocation, mul(len, 0x20)) }
                lt(dataElementLocation, end)
                { data := add(dataElementLocation, 0x20) }
            {
                sum := add(sum, mload(dataElementLocation))
            }
        }
    }
}
```

# 访问外部变量、函数和库

您可以使用名称访问 Solidity 变量和其他标识符。

值类型的局部变量可直接在内联汇编中使用。它们都可以被读取和分配。

引用内存的局部变量计算为内存中变量的地址，而不是值本身。这些变量也可以被赋值，但请注意，赋值只会改变指针而不是数据，尊重 Solidity 的内存管理是您的责任。请参阅 Solidity 中的约定。

类似地，引用静态大小的 calldata 数组或 calldata 结构的局部变量计算为 calldata 中变量的地址，而不是值本身。也可以为该变量分配一个新的偏移量，但请注意，不会执行任何验证以确保该变量不会指向超出 calldatasize() 的位置。

对于外部函数指针，可以使用 x.address 和 x.selector 访问地址和函数选择器。选择器由四个右对齐字节组成。这两个值都可以分配给。例如：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.10 <0.9.0;

contract C {
    // Assigns a new selector and address to the return variable @fun
    function combineToFunctionPointer(address newAddress, uint newSelector) public pure returns (function() external fun) {
        assembly {
            fun.selector := newSelector
            fun.address  := newAddress
        }
    }
}
```

对于动态调用数据数组，您可以使用 x.offset 和 x.length 访问它们的调用数据偏移量（以字节为单位）和长度（元素数）。这两个表达式也可以赋值，但对于静态情况，不会执行验证以确保生成的数据区域在 calldatasize() 的范围内。

对于本地存储变量或状态变量，单个 Yul 标识符是不够的，因为它们不一定占用单个完整的存储槽。因此，它们的“地址”由一个槽和该槽内的字节偏移量组成。要检索变量 x 指向的槽，您使用 x.slot，并检索您使用 x.offset 的字节偏移量。使用 x 本身会导致错误。

您还可以分配给本地存储变量指针的 .slot 部分。对于这些（结构、数组或映射），.offset 部分始终为零。

但是，不能分配给状态变量的 .slot 或 .offset 部分。

局部 Solidity 变量可用于赋值，例如：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract C {
    uint b;
    function f(uint x) public view returns (uint r) {
        assembly {
            // We ignore the storage slot offset, we know it is zero
            // in this special case.
            r := mul(x, sload(b.slot))
        }
    }
}
```

- 警告

如果您访问的变量类型跨度小于 256 位（例如 uint64、address 或 bytes16），则不能对不属于该类型编码的位做出任何假设。 

特别是，不要假设它们为零。 

为了安全起见，在重要的上下文中使用数据之前，请务必正确清除数据：

`uint32 x = f(); assembly { x := and(x, 0xffffffff) /* 现在使用 x */ }` 要清理带符号的类型，您可以使用 signextend 操作码： `assembly { signextend(<num_bytes_of_x_minus_one>, x) }`

从 Solidity 0.6.0 开始，内联汇编变量的名称可能不会影响内联汇编块范围内可见的任何声明（包括变量、合同和函数声明）。

从 Solidity 0.7.0 开始，在内联汇编块中声明的变量和函数可能不包含 .，而是使用 . 从内联汇编块外部访问 Solidity 变量是有效的。

# 避免的事情

内联汇编可能有一个相当高级的外观，但它实际上是非常低级的。 

函数调用、循环、ifs 和开关通过简单的重写规则进行转换，之后，汇编器为您做的唯一一件事就是重新排列函数式操作码、计算变量访问的堆栈高度和删除汇编局部变量的堆栈槽 当到达他们的块的末尾时。

# Solidity 中的约定

## 类型变量的值

与 EVM 组装相比，Solidity 具有比 256 位更窄的类型，例如uint24。

为了提高效率，大多数算术运算忽略了类型可以短于 256 位这一事实，并且在必要时清除高阶位，即在将它们写入内存或执行比较之前不久。

这意味着如果您从内联汇编中访问这样的变量，您可能必须先手动清除高阶位。

## 内存管理

Solidity 通过以下方式管理内存。在内存的 0x40 位置有一个“空闲内存指针”。

如果要分配内存，请使用从该指针指向的位置开始的内存并对其进行更新。

不能保证之前没有使用过内存，因此你不能假设它的内容是零字节。没有释放或释放分配的内存的内置机制。

这是一个汇编片段，可用于按照上述过程分配内存

```js
function allocate(length) -> pos {
  pos := mload(0x40)
  mstore(0x40, add(pos, length))
}
```

内存的前 64 字节可用作“暂存空间”，用于短期分配。 

空闲内存指针之后的 32 个字节（即，从 0x60 开始）意味着永久为零，并用作空动态内存数组的初始值。 

这意味着可分配内存从 0x80 开始，这是空闲内存指针的初始值。

Solidity 中的内存数组中的元素总是占用 32 字节的倍数（对于 bytes1[] 甚至是这样，但对于字节和字符串则不然）。

多维内存数组是指向内存数组的指针。 

动态数组的长度存储在数组的第一个槽中，然后是数组元素。


- 警告

静态大小的内存数组没有长度字段，但以后可能会添加它以允许在静态和动态大小的数组之间更好地转换，所以不要依赖这个。

## 内存安全

在不使用内联汇编的情况下，编译器可以依靠内存始终保持良好定义的状态。

这与通过 Yul IR 的新代码生成管道特别相关：此代码生成路径可以将局部变量从堆栈移动到内存以避免堆栈太深错误并执行额外的内存优化，如果它可以依赖于内存使用的某些假设.

虽然我们建议始终尊重 Solidity 的内存模型，但内联汇编允许您以不兼容的方式使用内存。

因此，默认情况下，将堆栈变量移动到内存和其他内存优化在存在任何包含内存操作或分配给内存中的实体变量的内联汇编块时禁用。

但是，您可以专门注释一个组装块，以表明它实际上尊重 Solidity 的内存模型，如下所示：

```js
assembly ("memory-safe") {
    ...
}
```

特别是，内存安全的汇编块只能访问以下内存范围：

使用类似于上述分配函数的机制由您自己分配的内存。

Solidity 分配的内存，例如您引用的内存数组范围内的内存。

上面提到的内存偏移量 0 和 64 之间的暂存空间。

位于汇编块开头的空闲内存指针值之后的临时内存，即在空闲内存指针处“分配”而不更新空闲内存指针的内存。

此外，如果汇编块分配给内存中的 Solidity 变量，您需要确保对 Solidity 变量的访问仅访问这些内存范围。

由于这主要与优化器有关，因此即使组装块恢复或终止，仍需要遵循这些限制。例如，以下程序集片段不是内存安全的，因为 returndatasize() 的值可能超过 64 字节的暂存空间：

```js
assembly {
  returndatacopy(0, 0, returndatasize())
  revert(0, returndatasize())
}
```

另一方面，以下代码是内存安全的，因为空闲内存指针指向的位置之外的内存可以安全地用作临时暂存空间：

```js
assembly ("memory-safe") {
  let p := mload(0x40)
  returndatacopy(p, 0, returndatasize())
  revert(p, returndatasize())
}
```

请注意，如果没有后续分配，则不需要更新空闲内存指针，但只能使用从空闲内存指针给出的当前偏移量开始的内存。

如果内存操作使用零长度，也可以只使用任何偏移量（不仅在它落入暂存空间的情况下）：

```js
assembly ("memory-safe") {
  revert(0, 0)
}
```

请注意，不仅内联汇编本身的内存操作可能是内存不安全的，而且对内存中引用类型的solidity变量的赋值也是如此。 例如以下不是内存安全的：

```js
bytes memory x;
assembly {
  x := 0x40
}
x[0x20] = 0x42;
```

既不涉及访问内存的任何操作也不分配给内存中的任何实体变量的内联汇编被自动认为是内存安全的，并且不需要注释。

警告

您有责任确保程序集真正满足内存模型。 如果您将程序集块注释为内存安全，但违反了内存假设之一，这将导致无法通过测试轻松发现的不正确和未定义的行为。

如果您正在开发一个旨在跨多个版本的solidity兼容的库，您可以使用特殊注释将程序集块注释为内存安全：

```js
/// @solidity memory-safe-assembly
assembly {
    ...
}
```

请注意，我们将在未来的中断版本中禁止通过注释进行注释，因此如果您不关心与旧编译器版本的向后兼容性，则更喜欢使用方言字符串。

# 参考资料

https://docs.soliditylang.org/en/latest/assembly.html

* any list
{:toc}