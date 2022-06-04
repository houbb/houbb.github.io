---
layout: post
title:  Solidity-12-types Mapping Types
date:  2022-05-22 09:22:02 +0800
categories: [Lang]
tags: [lang, solidity, sh]
published: true
---

# Mapping Types

映射类型使用语法映射（KeyType => ValueType），映射类型的变量使用语法映射（KeyType => ValueType）变量名声明。 

KeyType 可以是任何内置值类型、字节、字符串或任何协定或枚举类型。不允许使用其他用户定义或复杂类型，例如映射、结构或数组类型。 ValueType 可以是任何类型，包括映射、数组和结构。

**您可以将映射视为哈希表，它被虚拟初始化，使得每个可能的键都存在，并映射到字节表示全为零的值，即类型的默认值。**

相似性到此为止，关键数据不存储在映射中，仅使用其 keccak256 散列来查找值。

因此，映射没有长度或设置键或值的概念，因此如果没有有关已分配键的额外信息，就无法擦除（请参阅清除映射）。

映射只能具有存储的数据位置，因此允许用于状态变量，作为函数中的存储引用类型，或作为库函数的参数。它们不能用作公开可见的合约函数的参数或返回参数。这些限制也适用于包含映射的数组和结构。

您可以将映射类型的状态变量标记为 public，Solidity 会为您创建一个 getter。 KeyType 成为 getter 的参数。如果 ValueType 是值类型或结构，则 getter 返回 ValueType。如果 ValueType 是一个数组或一个映射，则 getter 以递归方式为每个 KeyType 提供一个参数。

在下面的示例中，MappingExample 合约定义了一个公共余额映射，键类型为地址，值类型为 uint，将以太坊地址映射到无符号整数值。

由于 uint 是值类型，因此 getter 返回一个与该类型匹配的值，您可以在 MappingUser 合约中看到该值返回指定地址的值。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.0 <0.9.0;

contract MappingExample {
    mapping(address => uint) public balances;

    function update(uint newBalance) public {
        balances[msg.sender] = newBalance;
    }
}

contract MappingUser {
    function f() public returns (uint) {
        MappingExample m = new MappingExample();
        m.update(100);
        return m.balances(address(this));
    }
}
```

下面的示例是 ERC20 代币的简化版本。 

_allowances 是另一个映射类型中的映射类型的示例。 

下面的示例使用 _allowances 记录允许其他人从您的帐户中提取的金额。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.9.0;

contract MappingExample {

    mapping (address => uint256) private _balances;
    mapping (address => mapping (address => uint256)) private _allowances;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }

    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
        require(_allowances[sender][msg.sender] >= amount, "ERC20: Allowance not high enough.");
        _allowances[sender][msg.sender] -= amount;
        _transfer(sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
        require(_balances[sender] >= amount, "ERC20: Not enough funds.");

        _balances[sender] -= amount;
        _balances[recipient] += amount;
        emit Transfer(sender, recipient, amount);
    }
}
```

# 可迭代映射 Iterable Mappings

你不能迭代映射，即你不能枚举它们的键。 

但是，可以在它们之上实现一个数据结构并对其进行迭代。 

例如，下面的代码实现了一个 IterableMapping 库，然后用户合约将数据添加到该库中，并且 sum 函数迭代以对所有值求和。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.8;

struct IndexValue { uint keyIndex; uint value; }
struct KeyFlag { uint key; bool deleted; }

struct itmap {
    mapping(uint => IndexValue) data;
    KeyFlag[] keys;
    uint size;
}

type Iterator is uint;

library IterableMapping {
    function insert(itmap storage self, uint key, uint value) internal returns (bool replaced) {
        uint keyIndex = self.data[key].keyIndex;
        self.data[key].value = value;
        if (keyIndex > 0)
            return true;
        else {
            keyIndex = self.keys.length;
            self.keys.push();
            self.data[key].keyIndex = keyIndex + 1;
            self.keys[keyIndex].key = key;
            self.size++;
            return false;
        }
    }

    function remove(itmap storage self, uint key) internal returns (bool success) {
        uint keyIndex = self.data[key].keyIndex;
        if (keyIndex == 0)
            return false;
        delete self.data[key];
        self.keys[keyIndex - 1].deleted = true;
        self.size --;
    }

    function contains(itmap storage self, uint key) internal view returns (bool) {
        return self.data[key].keyIndex > 0;
    }

    function iterateStart(itmap storage self) internal view returns (Iterator) {
        return iteratorSkipDeleted(self, 0);
    }

    function iterateValid(itmap storage self, Iterator iterator) internal view returns (bool) {
        return Iterator.unwrap(iterator) < self.keys.length;
    }

    function iterateNext(itmap storage self, Iterator iterator) internal view returns (Iterator) {
        return iteratorSkipDeleted(self, Iterator.unwrap(iterator) + 1);
    }

    function iterateGet(itmap storage self, Iterator iterator) internal view returns (uint key, uint value) {
        uint keyIndex = Iterator.unwrap(iterator);
        key = self.keys[keyIndex].key;
        value = self.data[key].value;
    }

    function iteratorSkipDeleted(itmap storage self, uint keyIndex) private view returns (Iterator) {
        while (keyIndex < self.keys.length && self.keys[keyIndex].deleted)
            keyIndex++;
        return Iterator.wrap(keyIndex);
    }
}

// How to use it
contract User {
    // Just a struct holding our data.
    itmap data;
    // Apply library functions to the data type.
    using IterableMapping for itmap;

    // Insert something
    function insert(uint k, uint v) public returns (uint size) {
        // This calls IterableMapping.insert(data, k, v)
        data.insert(k, v);
        // We can still access members of the struct,
        // but we should take care not to mess with them.
        return data.size;
    }

    // Computes the sum of all stored data.
    function sum() public view returns (uint s) {
        for (
            Iterator i = data.iterateStart();
            data.iterateValid(i);
            i = data.iterateNext(i)
        ) {
            (, uint value) = data.iterateGet(i);
            s += value;
        }
    }
}
```


# 参考资料

https://docs.soliditylang.org/en/latest/types.html#mapping-types

* any list
{:toc}