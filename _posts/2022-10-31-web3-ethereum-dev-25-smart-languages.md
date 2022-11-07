---
layout: post 
title: web3 以太坊开发-25-以太坊智能合约语言 smart contracts languages
date: 2022-10-28 21:01:55 +0800
categories: [web3]
tags: [web3, dev, ethereum, sh]
published: true
---

# 智能合约语言

关于以太坊的一个重要方面是，智能合约可以使用相对友好的开发者语言编程。 

如果您熟悉 Python 或任何大括号语言，可以找到一种语法熟悉的语言。

最受欢迎和维护得最好的两种语言是：

Solidity

Vyper

更有经验的开发者也可能想要使用 Yul：一种用于以太坊虚拟机的中间语言，或者是 Yul+ 语言，这是一种 Yul 扩展。

如果您很好奇，喜欢帮助测试仍在大力发展的新语言，则可以尝试使用 Fe，这是一种新兴的智能合约语言，目前仍处于起步阶段。

# SOLIDITY

执行智能合约的目标导向高级语言。

受 C++ 影响最深的大括号编程语言。

静态类型（编译时已知变量类型）。

## 支持：

继承（您可以拓展其它合约）。

库（您可以创建从不同的合约调用的可重用代码 - 就像静态函数在其它面向对象编程语言的静态类中一样）。

复杂的用户自定义类型。

> [官网](https://soliditylang.org/)

## 例子

```js
/ SPDX-License-Identifier: GPL-3.0
pragma solidity >= 0.7.0;

contract Coin {
    // The keyword "public" makes variables
    // accessible from other contracts
    address public minter;
    mapping (address => uint) public balances;

    // Events allow clients to react to specific
    // contract changes you declare
    event Sent(address from, address to, uint amount);

    // Constructor code is only run when the contract
    // is created
    constructor() {
        minter = msg.sender;
    }

    // Sends an amount of newly created coins to an address
    // Can only be called by the contract creator
    function mint(address receiver, uint amount) public {
        require(msg.sender == minter);
        require(amount < 1e60);
        balances[receiver] += amount;
    }

    // Sends an amount of existing coins
    // from any caller to an address
    function send(address receiver, uint amount) public {
        require(amount <= balances[msg.sender], "Insufficient balance.");
        balances[msg.sender] -= amount;
        balances[receiver] += amount;
        emit Sent(msg.sender, receiver, amount);
    }
}
```

# VYPER

类 Python 编程语言

强类型

小而且易懂的编译器代码

高效的字节码生成

为了让合约更安全和易于审核，特意提供比 Solidity 少的功能。 

> [原理文档](https://vyper.readthedocs.io/en/latest/index.html)

## 不支持

Vyper 不支持：

- 修饰符

- 继承

- 内联汇编

- 函数重载

- 操作符重载

- 递归调用

- 无限长度循环

- 二进制定长浮点

PS: 这里看得出来，还是 SOLIDITY 值得学习。

# YUL 和 YUL+

如果您是以太坊的新手并且尚未使用智能合约语言进行任何编码，我们建议您开始使用 Solidity 或 Vyper。 

只有在您熟知智能合约安全最佳做法和使用 EVM 的具体细节后，才可以查看 Yul 或 Yul+。

## Yul

以太坊的中继语言。

支持 EVM 和 Ewasm，一种以太坊风格的 WebAssembly，以及旨在成为两个平台均可用的公分母。

高级优化阶段的良好目标，既使 EVM 和 eWASM 平台均等受益。

## Yul+

Yul 的低级、高效扩展。

最初设计用于乐观卷叠合约。

Yul+ 可以被视为对 Yul 的实验性升级建议，为其添加新功能。

## 重要的链接

https://docs.soliditylang.org/en/latest/yul.html

## 例子

以下简单示例实现了幂函数。 

它可以使用 `solc --strict-assembly --bin input.yul` 编译。 

这个例子应该 存储在 input.yul 文件中。

```js
{
    function power(base, exponent) -> result
    {
        switch exponent
        case 0 { result := 1 }
        case 1 { result := base }
        default
        {
            result := power(mul(base, base), div(exponent, 2))
            if mod(exponent, 2) { result := mul(base, result) }
        }
    }
    let res := power(calldataload(0), calldataload(32))
    mstore(0, res)
    return(0, 32)
}
```

# FE

以太坊虚拟机 (EVM) 静态类型语言。

受到 Python 和 Rust 的启发。

目标是容易学习 - 甚至对以太坊生态系统为新的开发者来说也是如此。

[Fe](https://github.com/ethereum/fe) 开发仍处于早期阶段，该语言于 2021 年 1 月发行。

## 合约示例

以下是在 Fe 中执行的简单的智能合约。

```js
type BookMsg = bytes[100]

contract GuestBook:
    pub guest_book: map<address, BookMsg>

    event Signed:
        book_msg: BookMsg

    pub def sign(book_msg: BookMsg):
        self.guest_book[msg.sender] = book_msg

        emit Signed(book_msg=book_msg)

    pub def get_msg(addr: address) -> BookMsg:
        return self.guest_book[addr].to_mem()
```

# 如何选择

与任何其他编程语言一样，它主要是关于为合适的工作以及个人喜好选择合适的工具。

如果您还没有尝试过任何一种语言，请考虑以下几点：

## Solidity 的优点是什么？

如果您是初学者，这里有很多教程和学习工具。 

在通过编码学习部分了解更多相关信息。

提供出色的开发者工具。

Solidity 拥有庞大的开发人员社区，这意味着您很可能会很快找到问题的答案。

## Vyper 的优点是什么？

想要编写智能合约的 Python 开发人员入门的好方法。

Vyper 的功能较少，因此非常适合快速制作创意原型。

Vyper 旨在易于审计并最大限度地提高人类可读性

## Yul 和 Yul+ 的优点是什么？

简单而实用的低级语言。

允许更接近原始 EVM，这有助于优化合约的 gas 使用量。

# 参考资料

https://ethereum.org/zh/developers/docs/smart-contracts/languages/

* any list
{:toc}