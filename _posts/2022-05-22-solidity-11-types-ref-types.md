---
layout: post
title:  Solidity-11-types Reference Types
date:  2022-05-22 09:22:02 +0800
categories: [Lang]
tags: [lang, solidity, sh]
published: true
---

# Reference Types

引用类型的值可以通过多个不同的名称进行修改。 

将此与值类型进行对比，只要使用值类型的变量，您就会获得一个独立的副本。 

因此，必须比值类型更仔细地处理引用类型。 

目前，引用类型包括结构、数组和映射。 

如果使用引用类型，则始终必须显式提供存储类型的数据区域：内存（其生命周期仅限于外部函数调用），存储（存储状态变量的位置，生命周期所在的位置） 仅限于合约的生命周期）或 calldata（包含函数参数的特殊数据位置）。

更改数据位置的赋值或类型转换将始终引发自动复制操作，而同一数据位置内的赋值仅在某些情况下复制存储类型。

# 数据位置 Data location

每个引用类型都有一个附加注释，即“数据位置”，关于它的存储位置。 

共有三个数据位置：内存、存储和调用数据。 

Calldata 是存储函数参数的不可修改、非持久性区域，其行为主要类似于内存。

- NOTE

如果可以，请尝试使用 calldata 作为数据位置，因为它可以避免复制，并且可以确保数据不能被修改。 

具有 calldata 数据位置的数组和结构也可以从函数返回，但不能分配此类类型。

- NOTE

在 0.6.9 版本之前，引用类型参数的数据位置仅限于外部函数中的调用数据、公共函数中的内存以及内部和私有函数中的内存或存储。 

现在所有函数都允许内存和调用数据，无论它们的可见性如何。

- NOTE

在 0.5.0 版本之前，数据位置可以省略，并且会根据变量的类型、函数类型等默认到不同的位置，但现在所有复杂类型都必须给出明确的数据位置。

## 数据位置和分配行为

数据位置不仅与数据的持久性有关，还与分配的语义有关：

- storage 和 memory 之间的分配（或来自 calldata）总是创建一个独立的副本。

- 从内存到内存的分配只会创建引用。 这意味着对一个内存变量的更改在引用相同数据的所有其他内存变量中也可见。

- 从存储到本地存储变量的分配也只分配一个引用。

- 存储的所有其他分配始终复制。 这种情况的示例是对状态变量或存储结构类型的局部变量成员的赋值，即使局部变量本身只是一个引用。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.5.0 <0.9.0;

contract C {
    // The data location of x is storage.
    // This is the only place where the
    // data location can be omitted.
    uint[] x;

    // The data location of memoryArray is memory.
    function f(uint[] memory memoryArray) public {
        x = memoryArray; // works, copies the whole array to storage
        uint[] storage y = x; // works, assigns a pointer, data location of y is storage
        y[7]; // fine, returns the 8th element
        y.pop(); // fine, modifies x through y
        delete x; // fine, clears the array, also modifies y
        // The following does not work; it would need to create a new temporary /
        // unnamed array in storage, but storage is "statically" allocated:
        // y = memoryArray;
        // This does not work either, since it would "reset" the pointer, but there
        // is no sensible location it could point to.
        // delete y;
        g(x); // calls g, handing over a reference to x
        h(x); // calls h and creates an independent, temporary copy in memory
    }

    function g(uint[] storage) internal pure {}
    function h(uint[] memory) public pure {}
}
```

# Arrays 数组

数组可以具有编译时固定大小，也可以具有动态大小。

固定大小为 k 且元素类型为 T 的数组的类型写为 T[k]，动态大小的数组写为 T[]。

例如，一个由 5 个 uint 动态数组组成的数组写为 uint[][5]。与其他一些语言相比，这种表示法是相反的。在 Solidity 中，X[3] 始终是一个包含三个 X 类型元素的数组，即使 X 本身就是一个数组。在其他语言（例如 C）中并非如此。

索引从零开始，访问与声明的方向相反。

例如，如果您有一个变量 uint[][5] 内存 x，则使用 x[2][6] 访问第三个动态数组中的第七个 uint，并使用 x[2] 访问第三个动态数组。同样，如果你有一个类型 T 的数组 T[5] a 也可以是一个数组，那么 a[2] 总是有类型 T。

数组元素可以是任何类型，包括映射或结构。类型的一般限制适用，因为映射只能存储在存储数据位置，公开可见的函数需要 ABI 类型的参数。

可以将状态变量数组标记为 public 并让 Solidity 创建一个 getter。数字索引成为 getter 的必需参数。

访问超出其末尾的数组会导致断言失败。方法 .push() 和 .push(value) 可用于在数组末尾追加一个新元素，其中 .push() 追加一个零初始化元素并返回对它的引用。

## 字节和字符串作为数组

字节和字符串类型的变量是特殊的数组。 

bytes 类型与 bytes1[] 类似，但它紧紧地封装在 calldata 和内存中。 

string 等于 bytes 但不允许长度或索引访问。

Solidity 没有字符串操作函数，但有第三方字符串库。

您还可以使用 `keccak256(abi.encodePacked(s1)) == keccak256(abi.encodePacked(s2))` 通过 keccak256-hash 比较两个字符串，并使用 string.concat(s1, s2) 连接两个字符串。

**您应该在 bytes1[] 上使用字节，因为它更便宜，因为在内存中使用 bytes1[] 会在元素之间添加 31 个填充字节。**

请注意，在存储中，由于紧密包装，填充不存在，请参见字节和字符串。

作为一般规则，对任意长度的原始字节数据使用字节，对任意长度的字符串 (UTF-8) 数据使用字符串。

如果您可以将长度限制为一定数量的字节，请始终使用值类型之一 bytes1 到 bytes32 因为它们便宜得多。

- NOTE

如果要访问字符串 s 的字节表示，请使用 `bytes(s).length / bytes(s)[7] = 'x';`。 

请记住，您访问的是 UTF-8 表示的低级字节，而不是单个字符。

## 函数 bytes.concat 和 string.concat

您可以使用 string.concat 连接任意数量的字符串值。 

该函数返回一个字符串内存数组，其中包含参数的内容而没有填充。 

如果要使用不能隐式转换为字符串的其他类型的参数，则需要先将其转换为字符串。

类似地， bytes.concat 函数可以连接任意数量的字节或 bytes1 ... bytes32 值。 

该函数返回一个单字节内存数组，其中包含不带填充的参数内容。 

如果要使用字符串参数或其他不能隐式转换为字节的类型，则需要先转换为字节或 bytes1/…/bytes32。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

contract C {
    string s = "Storage";
    function f(bytes calldata bc, string memory sm, bytes16 b) public view {
        string memory concatString = string.concat(s, string(bc), "Literal", sm);
        assert((bytes(s).length + bc.length + 7 + bytes(sm).length) == bytes(concatString).length);

        bytes memory concatBytes = bytes.concat(bytes(s), bc, bc[:2], "Literal", bytes(sm), b);
        assert((bytes(s).length + bc.length + 2 + 7 + bytes(sm).length + b.length) == concatBytes.length);
    }
}
```

如果您在没有参数的情况下调用 string.concat 或 bytes.concat，它们将返回一个空数组。

## 分配内存数组

可以使用 new 运算符创建具有动态长度的内存数组。 

与存储数组相反，无法调整内存数组的大小（例如，.push 成员函数不可用）。 

您要么必须提前计算所需的大小，要么创建一个新的内存数组并复制每个元素。

与 Solidity 中的所有变量一样，新分配的数组的元素始终使用默认值进行初始化。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

contract C {
    function f(uint len) public pure {
        uint[] memory a = new uint[](7);
        bytes memory b = new bytes(len);
        assert(a.length == 7);
        assert(b.length == len);
        a[6] = 8;
    }
}
```

## 数组字面量 Array Literals

数组字面量是一个或多个表达式的逗号分隔列表，括在方括号 ([...]) 中。 

例如 [1, a, f(3)]。 

数组字面量的类型确定如下：

它始终是一个静态大小的内存数组，其长度是表达式的数量。

数组的基本类型是列表中第一个表达式的类型，这样所有其他表达式都可以隐式转换为它。 

如果这是不可能的，这是一个类型错误。

有一个所有元素都可以转换为的类型是不够的。 其中一个元素必须属于该类型。

在下面的示例中，[1, 2, 3] 的类型是 uint8[3] 内存，因为这些常量中的每一个的类型都是 uint8。 

如果希望结果为 uint[3] 内存类型，则需要将第一个元素转换为 uint。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

contract C {
    function f() public pure {
        g([uint(1), 2, 3]);
    }
    function g(uint[3] memory) public pure {
        // ...
    }
}
```

数组字面量 [1, -1] 无效，因为第一个表达式的类型是 uint8，而第二个表达式的类型是 int8，它们不能隐式相互转换。 

例如，要使其工作，您可以使用 [int8(1), -1]。

由于不同类型的固定大小的内存数组不能相互转换（即使基类型可以），如果你想使用二维数组字面量，你总是必须明确指定一个通用的基类型：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

contract C {
    function f() public pure returns (uint24[2][4] memory) {
        uint24[2][4] memory x = [[uint24(0x1), 1], [0xffffff, 2], [uint24(0xff), 3], [uint24(0xffff), 4]];
        // The following does not work, because some of the inner arrays are not of the right type.
        // uint[2][4] memory x = [[0x1, 1], [0xffffff, 2], [0xff, 3], [0xffff, 4]];
        return x;
    }
}
```

固定大小的内存数组不能分配给动态大小的内存数组，即以下是不可能的：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.0 <0.9.0;

// This will not compile.
contract C {
    function f() public {
        // The next line creates a type error because uint[3] memory
        // cannot be converted to uint[] memory.
        uint[] memory x = [uint(1), 3, 4];
    }
}
```

计划在将来取消此限制，但由于数组在 ABI 中的传递方式，它会产生一些复杂性。

如果要初始化动态大小的数组，则必须分配各个元素：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

contract C {
    function f() public pure {
        uint[] memory x = new uint[](3);
        x[0] = 1;
        x[1] = 3;
        x[2] = 4;
    }
}
```

## 数组成员

- length：

数组有一个包含元素数量的长度成员。 内存数组的长度在创建后是固定的（但是是动态的，即它可以依赖于运行时参数）。

- push():

动态存储数组和字节（不是字符串）有一个名为 push() 的成员函数，您可以使用它在数组末尾附加一个零初始化元素。 

它返回对元素的引用，因此可以像 x.push().t = 2 或 x.push() = b 一样使用它。

- push(x):

动态存储数组和字节（不是字符串）有一个名为 push(x) 的成员函数，您可以使用它在数组末尾附加给定元素。 

该函数不返回任何内容。

- pop():

动态存储数组和字节（不是字符串）有一个名为 pop() 的成员函数，您可以使用它从数组末尾删除一个元素。 

这也隐式调用删除元素上的删除。 该函数不返回任何内容。

- NOTE

通过调用 push() 增加存储数组的长度具有恒定的 gas 成本，因为存储是零初始化的，而通过调用 pop() 减少长度的成本取决于被删除元素的“大小”。 

如果该元素是一个数组，它可能会非常昂贵，因为它包括显式清除已删除的元素，类似于对它们调用 delete。

要在外部（而不是公共）函数中使用数组数组，您需要激活 ABI coder v2。

在拜占庭之前的 EVM 版本中，无法访问函数调用返回的动态数组。 如果您调用返回动态数组的函数，请确保使用设置为拜占庭模式的 EVM。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;

contract ArrayContract {
    uint[2**20] aLotOfIntegers;
    // Note that the following is not a pair of dynamic arrays but a
    // dynamic array of pairs (i.e. of fixed size arrays of length two).
    // Because of that, T[] is always a dynamic array of T, even if T
    // itself is an array.
    // Data location for all state variables is storage.
    bool[2][] pairsOfFlags;

    // newPairs is stored in memory - the only possibility
    // for public contract function arguments
    function setAllFlagPairs(bool[2][] memory newPairs) public {
        // assignment to a storage array performs a copy of ``newPairs`` and
        // replaces the complete array ``pairsOfFlags``.
        pairsOfFlags = newPairs;
    }

    struct StructType {
        uint[] contents;
        uint moreInfo;
    }
    StructType s;

    function f(uint[] memory c) public {
        // stores a reference to ``s`` in ``g``
        StructType storage g = s;
        // also changes ``s.moreInfo``.
        g.moreInfo = 2;
        // assigns a copy because ``g.contents``
        // is not a local variable, but a member of
        // a local variable.
        g.contents = c;
    }

    function setFlagPair(uint index, bool flagA, bool flagB) public {
        // access to a non-existing index will throw an exception
        pairsOfFlags[index][0] = flagA;
        pairsOfFlags[index][1] = flagB;
    }

    function changeFlagArraySize(uint newSize) public {
        // using push and pop is the only way to change the
        // length of an array
        if (newSize < pairsOfFlags.length) {
            while (pairsOfFlags.length > newSize)
                pairsOfFlags.pop();
        } else if (newSize > pairsOfFlags.length) {
            while (pairsOfFlags.length < newSize)
                pairsOfFlags.push();
        }
    }

    function clear() public {
        // these clear the arrays completely
        delete pairsOfFlags;
        delete aLotOfIntegers;
        // identical effect here
        pairsOfFlags = new bool[2][](0);
    }

    bytes byteData;

    function byteArrays(bytes memory data) public {
        // byte arrays ("bytes") are different as they are stored without padding,
        // but can be treated identical to "uint8[]"
        byteData = data;
        for (uint i = 0; i < 7; i++)
            byteData.push();
        byteData[3] = 0x08;
        delete byteData[2];
    }

    function addFlag(bool[2] memory flag) public returns (uint) {
        pairsOfFlags.push(flag);
        return pairsOfFlags.length;
    }

    function createMemoryArray(uint size) public pure returns (bytes memory) {
        // Dynamic memory arrays are created using `new`:
        uint[2][] memory arrayOfPairs = new uint[2][](size);

        // Inline arrays are always statically-sized and if you only
        // use literals, you have to provide at least one type.
        arrayOfPairs[0] = [uint(1), 2];

        // Create a dynamic byte array:
        bytes memory b = new bytes(200);
        for (uint i = 0; i < b.length; i++)
            b[i] = bytes1(uint8(i));
        return b;
    }
}
```

# Array Slices 数组切片

数组切片是数组连续部分的视图。 

它们写为 x[start:end]，其中 start 和 end 是导致 uint256 类型（或隐式转换为它）的表达式。 

切片的第一个元素是 x[start]，最后一个元素是 x[end - 1]。

如果 start 大于 end 或者 end 大于数组的长度，则抛出异常。

start 和 end 都是可选的：start 默认为 0，end 默认为数组的长度。

数组切片没有任何成员。 它们可以隐式转换为其基础类型的数组并支持索引访问。 

索引访问在底层数组中不是绝对的，而是相对于切片的开头。

数组切片没有类型名称，这意味着没有变量可以将数组切片作为类型，它们只存在于中间表达式中。

- NOTE

到目前为止，数组切片仅针对 calldata 数组实现。

数组切片对于 ABI 解码函数参数中传递的辅助数据很有用：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.5 <0.9.0;
contract Proxy {
    /// @dev Address of the client contract managed by proxy i.e., this contract
    address client;

    constructor(address client_) {
        client = client_;
    }

    /// Forward call to "setOwner(address)" that is implemented by client
    /// after doing basic validation on the address argument.
    function forward(bytes calldata payload) external {
        bytes4 sig = bytes4(payload[:4]);
        // Due to truncating behaviour, bytes4(payload) performs identically.
        // bytes4 sig = bytes4(payload);
        if (sig == bytes4(keccak256("setOwner(address)"))) {
            address owner = abi.decode(payload[4:], (address));
            require(owner != address(0), "Address of owner cannot be zero.");
        }
        (bool status,) = client.delegatecall(payload);
        require(status, "Forwarded call failed.");
    }
}
```

# 结构 Structs

Solidity 提供了一种以结构的形式定义新类型的方法，如下例所示：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;

// Defines a new type with two fields.
// Declaring a struct outside of a contract allows
// it to be shared by multiple contracts.
// Here, this is not really needed.
struct Funder {
    address addr;
    uint amount;
}

contract CrowdFunding {
    // Structs can also be defined inside contracts, which makes them
    // visible only there and in derived contracts.
    struct Campaign {
        address payable beneficiary;
        uint fundingGoal;
        uint numFunders;
        uint amount;
        mapping (uint => Funder) funders;
    }

    uint numCampaigns;
    mapping (uint => Campaign) campaigns;

    function newCampaign(address payable beneficiary, uint goal) public returns (uint campaignID) {
        campaignID = numCampaigns++; // campaignID is return variable
        // We cannot use "campaigns[campaignID] = Campaign(beneficiary, goal, 0, 0)"
        // because the right hand side creates a memory-struct "Campaign" that contains a mapping.
        Campaign storage c = campaigns[campaignID];
        c.beneficiary = beneficiary;
        c.fundingGoal = goal;
    }

    function contribute(uint campaignID) public payable {
        Campaign storage c = campaigns[campaignID];
        // Creates a new temporary memory struct, initialised with the given values
        // and copies it over to storage.
        // Note that you can also use Funder(msg.sender, msg.value) to initialise.
        c.funders[c.numFunders++] = Funder({addr: msg.sender, amount: msg.value});
        c.amount += msg.value;
    }

    function checkGoalReached(uint campaignID) public returns (bool reached) {
        Campaign storage c = campaigns[campaignID];
        if (c.amount < c.fundingGoal)
            return false;
        uint amount = c.amount;
        c.amount = 0;
        c.beneficiary.transfer(amount);
        return true;
    }
}
```

该合约不提供众筹合约的全部功能，但它包含理解结构所需的基本概念。 

结构类型可以在映射和数组中使用，它们本身可以包含映射和数组。

结构不可能包含自己类型的成员，尽管结构本身可以是映射成员的值类型，也可以包含其类型的动态大小的数组。 

这个限制是必要的，因为结构的大小必须是有限的。

请注意，在所有函数中，结构类型如何分配给具有数据位置存储的局部变量。 

这不会复制结构，而只会存储一个引用，以便对局部变量成员的赋值实际上写入状态。

当然，您也可以直接访问该结构的成员，而无需将其分配给局部变量，如 `campaigns[campaignID].amount = 0`。

- NOTE

在 Solidity 0.7.0 之前，允许包含仅存储类型（例如映射）成员的内存结构，并且像上面示例中的活动 `[campaignID] = Campaign(beneficiary, goal, 0, 0)` 之类的分配将起作用并且只是默默地跳过 那些成员。

# 参考资料

https://docs.soliditylang.org/en/latest/types.html#reference-types

* any list
{:toc}