---
layout: post
title:  Solidity-09-Structure of a Contract
date:  2022-05-22 09:22:02 +0800
categories: [Lang]
tags: [lang, solidity, sh]
published: true
---

# Structure of a Contract

Solidity 中的契约类似于面向对象语言中的类。 

每个合约都可以包含状态变量、函数、函数修饰符、事件、错误、结构类型和枚举类型的声明。 

此外，合约可以继承自其他合约。

还有一些特殊类型的合约，称为库和接口。

关于合同的部分包含比本部分更多的详细信息，用于提供快速概述。

# 状态变量

状态变量是其值永久存储在合约存储中的变量。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.0 <0.9.0;

contract SimpleStorage {
    uint storedData; // State variable
    // ...
}
```

有关有效状态变量类型的信息，请参阅类型部分，有关可见性的可能选择，请参阅 Visibility 和 Getters。

# 函数  Functions

函数是代码的可执行单元。 

函数通常在合约内定义，但也可以在合约外定义。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.1 <0.9.0;

contract SimpleAuction {
    function bid() public payable { // Function
        // ...
    }
}

// Helper function defined outside of a contract
function helper(uint x) pure returns (uint) {
    return x * 2;
}
```

函数调用可以在内部或外部发生，并且对其他合约具有不同级别的可见性。 

函数接受参数并返回变量以在它们之间传递参数和值。

# 函数修饰符

函数修饰符可用于以声明的方式修改函数的语义（请参阅合约部分中的函数修饰符）。

重载，即具有不同参数的相同修饰符名称是不可能的。

像函数一样，修饰符可以被覆盖。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.9.0;

contract Purchase {
    address public seller;

    modifier onlySeller() { // Modifier
        require(
            msg.sender == seller,
            "Only seller can call this."
        );
        _;
    }

    function abort() public view onlySeller { // Modifier usage
        // ...
    }
}
```

# Events 事件

事件是与 EVM 日志记录工具的便利接口。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.21 <0.9.0;

contract SimpleAuction {
    event HighestBidIncreased(address bidder, uint amount); // Event

    function bid() public payable {
        // ...
        emit HighestBidIncreased(msg.sender, msg.value); // Triggering event
    }
}
```

有关如何声明事件以及如何在 dapp 中使用事件的信息，请参阅合约中的事件部分。

# 错误

错误允许您为故障情况定义描述性名称和数据。 

错误可用于还原语句。 

与字符串描述相比，错误要便宜得多，并且允许您对附加数据进行编码。 

您可以使用 NatSpec 向用户描述错误。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

/// Not enough funds for transfer. Requested `requested`,
/// but only `available` available.
error NotEnoughFunds(uint requested, uint available);

contract Token {
    mapping(address => uint) balances;
    function transfer(address to, uint amount) public {
        uint balance = balances[msg.sender];
        if (balance < amount)
            revert NotEnoughFunds(amount, balance);
        balances[msg.sender] -= amount;
        balances[to] += amount;
        // ...
    }
}
```

有关详细信息，请参阅合同部分中的错误和恢复声明。

# 结构类型 Struct Types

结构是自定义定义的类型，可以对多个变量进行分组（请参阅类型部分中的结构）。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.0 <0.9.0;

contract Ballot {
    struct Voter { // Struct
        uint weight;
        bool voted;
        address delegate;
        uint vote;
    }
}
```

# 枚举类型

枚举可用于创建具有一组有限“常量值”的自定义类型（请参阅类型部分中的枚举）。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.0 <0.9.0;

contract Purchase {
    enum State { Created, Locked, Inactive } // Enum
}
```

# 参考资料

https://docs.soliditylang.org/en/latest/structure-of-a-contract.html

* any list
{:toc}