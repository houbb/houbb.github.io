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

在您的合约中使用这个构建模块，您需要先导入它，然后在您自己的合约中扩展它。 

这个将会允许您使用 Ownable 合约提供的修饰符来保护您的函数。


```js
import ".../Ownable.sol"; // Path to the imported library

contract MyContract is Ownable {
    // The following function can only be called by the owner
    function secured() onlyOwner public {
        msg.sender.transfer(1 ether);
    }
}
```

另一个比较受欢迎的例子是 SafeMath 或DsMath。 这些库（与基础合约不同）提供了语言本身不具有的带有溢出检查的算术函数。 

使用这些库而不是本地的算术操作可以来防止您的合约出现溢出错误，这些错误可能会导致灾难性的后果！

## 标准

为了促进可组合性和互操作性，以太坊社区已经以以太坊意见征求的形式定义了几个标准。 

您可以在标准部分阅读更多关于他们的信息。

当将以太坊意见征求作为您的合约的一部分时，更好的做法是寻找已有的标准去实现而不是试图推出您自己的方式。 

许多智能合约库包含了最流行的以太坊意见征求标准的实现。 

例如，普遍存在的 ERC20 同质化通证标准可在 HQ20 DappSys 和 OpenZeppelin 中找到。 

此外，一些以太坊意见征求还提供规范实现作为以太坊意见征求本身的一部分。

值得一提的是，一些以太坊意见征求不是独立的，而是对其他以太坊意见征求的补充。 

例如， ERC2612 为 ERC20 添加了一个扩展，以提高其可用性。

# 如何添加库

始终参考您所包含的库的文档，以获得关于如何将其包含在您的项目中的具体说明 一些 Solidity 合约库使用 npm 来打包，所以您可以直接 npm 安装它们。 

大多数编译合约的工具会在您的 node_modules 中查找智能合约库，所以您可以做以下工作。

```js
// This will load the @openzeppelin/contracts library from your node_modules
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyNFT is ERC721 {
    constructor() ERC721("MyNFT", "MNFT") public { }
}
```

无论您使用哪种方法，当包括一个库时，总是要注意语言的版本。 

例如，如果您用 Solidity 0.5 编写您的合约，您就不能使用 Solidity 0.6 的库。

## 何时使用

为您的项目使用智能合约库有几个好处。 

首先，它为您提供了现成的构建模块，您可以将其纳入您的系统，而不必自己编码，从而节省了您的时间。

安全性也是一个重要的优点。 开源智能合约库也经常受到严格审查。 

鉴于许多项目都依赖于它们，社区有强烈的动机来对它们持续审计。 

在应用程序代码中发现错误比在可重用的合约库中发现错误要常见得多。 

一些库还接受了外部审计，以提高安全性。

然而，使用智能合约库有可能将您不熟悉的代码纳入您的项目。 

导入一个合约并将其直接包含在您的项目中是很诱人的，但如果没有很好地理解该合约的作用，您可能会由于一个意外的行为而无意中在您的系统中引入一个问题。 

一定要确保阅读您要导入的代码的文档，然后在使其成为您的项目的一部分之前审查代码本身。

最后，在决定是否包括一个库时，要考虑其总体使用情况。 

一个被广泛采用的方案的好处是有一个更大的社区和更多的眼睛来关注它的问题。 

在使用智能合约进行建设时，安全应该是您的首要关注点！

# 关工具

## OpenZeppelin

[OpenZeppelin](https://github.com/OpenZeppelin/openzeppelin-contracts) 合约- 安全的智能合约开发库。

## DappSys

安全、简单、灵活的智能合约构建模块。

[GitHub](https://github.com/dapphub/dappsys)

## HQ20

一个带有合约、库和案例的 Solidity 项目，帮助您为现实世界建立功能齐全的分布式应用。

[GitHub](https://github.com/HQ20/contracts)

# 参考资料

https://ethereum.org/zh/developers/docs/smart-contracts/libraries/

* any list
{:toc}