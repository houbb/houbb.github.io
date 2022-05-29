---
layout: post
title:  Solidity-02-Introduction to Smart Contracts
date:  2022-05-22 09:22:02 +0800
categories: [Lang]
tags: [lang, solidity, sh]
published: true
---

# 一个简单的智能合约

让我们从一个基本示例开始，该示例设置变量的值并将其公开以供其他合约访问。 

如果您现在不了解所有内容也没关系，我们稍后会详细介绍。

## Storage Example

```ts
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

contract SimpleStorage {
    uint storedData;

    function set(uint x) public {
        storedData = x;
    }

    function get() public view returns (uint) {
        return storedData;
    }
}
```

第一行告诉您源代码是在 GPL 3.0 版下获得许可的。机器可读的许可证说明符在默认发布源代码的设置中很重要。

下一行指定源代码是为 Solidity 版本 0.4.16 或更高版本的语言编写的，但不包括版本 0.9.0。这是为了确保合约不能与新的（破坏性的）编译器版本一起编译，因为它的行为可能会有所不同。编译指示是编译器关于如何处理源代码的常见指令（例如编译指示一次）。

Solidity 意义上的合约是位于以太坊区块链上特定地址的代码（其功能）和数据（其状态）的集合。

行 `uint storedData;` 声明一个名为 storedData 的状态变量，类型为 uint（256 位无符号整数）。您可以将其视为数据库中的单个插槽，您可以通过调用管理数据库的代码的函数来查询和更改它。在此示例中，合约定义了可用于修改或检索变量值的函数 set 和 get。

要访问当前合约的成员（如状态变量），通常不需要添加 this。前缀，您只需通过其名称直接访问它。与其他一些语言不同，省略它不仅仅是风格问题，它会导致访问成员的方式完全不同，稍后会详细介绍。

除了（由于以太坊构建的基础设施）允许任何人存储世界上任何人都可以访问的单个号码之外，该合约还没有做太多事情，而没有（可行的）方法来阻止你发布这个号码。

任何人都可以使用不同的值再次调用 set 并覆盖您的号码，但该号码仍存储在区块链的历史记录中。稍后，您将看到如何施加访问限制，以便只有您可以更改号码。

- 警告

使用 Unicode 文本时要小心，因为看起来相似（甚至相同）的字符可能有不同的代码点，因此被编码为不同的字节数组。

- 笔记

所有标识符（合约名称、函数名称和变量名称）都仅限于 ASCII 字符集。 可以将 UTF-8 编码的数据存储在字符串变量中。

# 子货币示例

以下合约实现了最简单的加密货币形式。 该合约仅允许其创建者创建新硬币（可能有不同的发行方案）。 

任何人都可以互相发送硬币，而无需使用用户名和密码进行注册，您所需要的只是一个以太坊密钥对。

```ts
pragma solidity ^0.8.4;

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
        balances[receiver] += amount;
    }

    // Errors allow you to provide information about
    // why an operation failed. They are returned
    // to the caller of the function.
    error InsufficientBalance(uint requested, uint available);

    // Sends an amount of existing coins
    // from any caller to an address
    function send(address receiver, uint amount) public {
        if (amount > balances[msg.sender])
            revert InsufficientBalance({
                requested: amount,
                available: balances[msg.sender]
            });

        balances[msg.sender] -= amount;
        balances[receiver] += amount;
        emit Sent(msg.sender, receiver, amount);
    }
}
```

这份合约引入了一些新概念，让我们一一来介绍。

`address public minter;` 声明一个地址类型的状态变量。 地址类型是一个 160 位的值，不允许任何算术运算。 它适用于存储合约地址，或属于外部账户的密钥对的公共部分的哈希。

关键字 public 自动生成一个函数，允许您从合约外部访问状态变量的当前值。 如果没有这个关键字，其他合约就无法访问该变量。 编译器生成的函数代码等价于以下（暂时忽略external和view）：

```ts
function minter() external view returns (address) { return minter; }
```

你可以自己添加一个像上面这样的函数，但是你会有一个同名的函数和状态变量。 

您不需要这样做，编译器会为您计算出来。

下一行，`mapping (address => uint) public balances;` 也创建一个公共状态变量，但它是一个更复杂的数据类型。 映射类型将地址映射到无符号整数。

映射可以看作是虚拟初始化的哈希表，这样每个可能的键从一开始就存在，并映射到一个字节表示全为零的值。 

但是，既不可能获得映射的所有键的列表，也不可能获得所有值的列表。 

记录您添加到映射中的内容，或在不需要的上下文中使用它。 

或者更好的是，保留一个列表，或者使用更合适的数据类型。

在映射的情况下，由 public 关键字创建的 getter 函数更为复杂。 

它如下所示：

```ts
function balances(address account) external view returns (uint) {
    return balances[account];
}
```

您可以使用该功能查询单个账户的余额。

`event Sent(address from, address to, uint amount);` 声明一个“事件”，它在函数 send 的最后一行发出。 

以太坊客户端（例如 Web 应用程序）可以在无需太多成本的情况下侦听在区块链上发出的这些事件。 

一旦它发出，侦听器就会收到 from、to 和 amount 的参数，这使得跟踪交易成为可能。

要监听此事件，您可以使用以下 JavaScript 代码，该代码使用 web3.js 创建 Coin 合约对象，并且任何用户界面都会从上面调用自动生成的 balances 函数：

```ts
Coin.Sent().watch({}, '', function(error, result) {
    if (!error) {
        console.log("Coin transfer: " + result.args.amount +
            " coins were sent from " + result.args.from +
            " to " + result.args.to + ".");
        console.log("Balances now:\n" +
            "Sender: " + Coin.balances.call(result.args.from) +
            "Receiver: " + Coin.balances.call(result.args.to));
    }
})
```

构造函数是一个特殊的函数，在合约创建过程中执行，之后不能调用。在这种情况下，它会永久存储创建合同的人的地址。 

msg 变量（连同 tx 和 block）是一个特殊的全局变量，包含允许访问区块链的属性。 

msg.sender 始终是当前（外部）函数调用的来源地址。

构成合约以及用户和合约可以调用的函数是 mint 和 send。

mint 函数将一定数量的新创建的硬币发送到另一个地址。 

require 函数调用定义了在未满足时还原所有更改的条件。

在这个例子中， `require(msg.sender == minter);` 确保只有合约的创建者才能调用 mint.一般来说，创建者可以铸造任意数量的代币，但在某些时候，这会导致一种称为“溢出”的现象。

请注意，由于默认的 Checked 算法，如果表达式 `balances[receiver] += amount;` 则交易将恢复。

溢出，即任意精度算术中的 `balances[receiver] + amount` 大于 `uint (2**256 - 1)` 的最大值时。

这也适用于报表 `balances[receiver] += amount;` 在函数发送中。

错误允许您向调用者提供有关条件或操作失败原因的更多信息。错误与revert 语句一起使用。 

revert 语句无条件中止并恢复类似于 require 函数的所有更改，但它还允许您提供错误的名称和将提供给调用者（并最终提供给前端应用程序或块浏览器）的附加数据以便更容易地调试或响应故障。

任何人（已经拥有其中一些硬币）都可以使用发送功能将硬币发送给其他任何人。如果发件人没有足够的硬币发送，则 if 条件评估为真。

因此，还原将导致操作失败，同时使用 InsufficientBalance 错误向发送者提供错误详细信息。

- 注意

如果您使用此合约将硬币发送到某个地址，当您在区块链浏览器上查看该地址时，您将看不到任何内容，因为您发送硬币的记录和更改的余额仅存储在该特定硬币的数据存储中合同。 

通过使用事件，您可以创建一个“区块链浏览器”来跟踪新硬币的交易和余额，但您必须检查硬币合约地址而不是硬币所有者的地址。

# 参考资料

https://docs.soliditylang.org/en/latest/introduction-to-smart-contracts.html

* any list
{:toc}