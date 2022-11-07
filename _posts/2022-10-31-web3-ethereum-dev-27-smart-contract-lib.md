---
layout: post 
title: web3 以太坊开发-27-以太坊智能合约库 smart contracts libraries
date: 2022-10-28 21:01:55 +0800
categories: [web3]
tags: [web3, dev, ethereum, sh]
published: true
---

# 智能合约库

您无需从头开始编写项目中的每一个智能合约 我们有许多开源代码的智能合约库可为您的项目提供可重复利用的构建块，从而使您不必重新开始。

# 资料库中的内容

您通常可以在智能合约库中找到两种构建模块：可以添加到合约中的可复用代码，与各种标准的实现。

## 行为

当编写智能合约时，您很可能会发现自己在写重复的代码。 

比如说在智能合约中指派一个管理员地址执行受保护的操作，或添加一个紧急暂停按钮以应对预料不到的问题。

智能合约库通常提供这些行为的可复用实现方式为标准库或在 solidity 中通过继承的方式实现。

例如，以下是不可拥有的合约的简化版本来自 OpenZeppelin 合约库，它设计了一个作为合约所有者的地址，并且提供了一个修饰者来限制该所有者获得一种方法。

```js
contract Ownable {
    address public owner;

    constructor() internal {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }
}
```




# 参考资料

https://ethereum.org/zh/developers/docs/smart-contracts/libraries/

* any list
{:toc}