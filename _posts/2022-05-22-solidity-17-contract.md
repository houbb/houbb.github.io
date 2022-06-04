---
layout: post
title:  Solidity-17-Contracts
date:  2022-05-22 09:22:02 +0800
categories: [Lang]
tags: [lang, solidity, sh]
published: true
---

# Contracts

Solidity 中的契约类似于面向对象语言中的类。

它们在状态变量中包含持久数据，以及可以修改这些变量的函数。 

在不同的合约（实例）上调用函数将执行 EVM 函数调用，从而切换上下文，使得调用合约中的状态变量不可访问。 

任何事情发生都需要调用合约及其函数。 

以太坊中没有“cron”概念来自动调用特定事件的函数。

# 创建合同

合约可以通过以太坊交易“从外部”创建，也可以从 Solidity 合约内部创建。

IDE（例如 Remix）使用 UI 元素使创建过程无缝。

在以太坊上以编程方式创建合约的一种方法是通过 JavaScript API web3.js。它有一个名为 web3.eth.Contract 的函数来促进合约的创建。

当一个合约被创建时，它的构造函数（一个使用 constructor 关键字声明的函数）被执行一次。

构造函数是可选的。只允许一个构造函数，这意味着不支持重载。

构造函数执行后，合约的最终代码存储在区块链上。此代码包括所有公共和外部函数以及可通过函数调用从那里访问的所有函数。部署的代码不包括构造函数代码或仅从构造函数调用的内部函数。

在内部，构造函数参数在合约本身的代码之后通过 ABI 编码传递，但如果您使用 web3.js，则不必关心这一点。

如果一个合约想要创建另一个合约，创建者必须知道创建的合约的源代码（和二进制文件）。

这意味着循环创建依赖是不可能的。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.9.0;


contract OwnedToken {
    // `TokenCreator` is a contract type that is defined below.
    // It is fine to reference it as long as it is not used
    // to create a new contract.
    TokenCreator creator;
    address owner;
    bytes32 name;

    // This is the constructor which registers the
    // creator and the assigned name.
    constructor(bytes32 name_) {
        // State variables are accessed via their name
        // and not via e.g. `this.owner`. Functions can
        // be accessed directly or through `this.f`,
        // but the latter provides an external view
        // to the function. Especially in the constructor,
        // you should not access functions externally,
        // because the function does not exist yet.
        // See the next section for details.
        owner = msg.sender;

        // We perform an explicit type conversion from `address`
        // to `TokenCreator` and assume that the type of
        // the calling contract is `TokenCreator`, there is
        // no real way to verify that.
        // This does not create a new contract.
        creator = TokenCreator(msg.sender);
        name = name_;
    }

    function changeName(bytes32 newName) public {
        // Only the creator can alter the name.
        // We compare the contract based on its
        // address which can be retrieved by
        // explicit conversion to address.
        if (msg.sender == address(creator))
            name = newName;
    }

    function transfer(address newOwner) public {
        // Only the current owner can transfer the token.
        if (msg.sender != owner) return;

        // We ask the creator contract if the transfer
        // should proceed by using a function of the
        // `TokenCreator` contract defined below. If
        // the call fails (e.g. due to out-of-gas),
        // the execution also fails here.
        if (creator.isTokenTransferOK(owner, newOwner))
            owner = newOwner;
    }
}


contract TokenCreator {
    function createToken(bytes32 name)
        public
        returns (OwnedToken tokenAddress)
    {
        // Create a new `Token` contract and return its address.
        // From the JavaScript side, the return type
        // of this function is `address`, as this is
        // the closest type available in the ABI.
        return new OwnedToken(name);
    }

    function changeName(OwnedToken tokenAddress, bytes32 name) public {
        // Again, the external type of `tokenAddress` is
        // simply `address`.
        tokenAddress.changeName(name);
    }

    // Perform checks to determine if transferring a token to the
    // `OwnedToken` contract should proceed
    function isTokenTransferOK(address currentOwner, address newOwner)
        public
        pure
        returns (bool ok)
    {
        // Check an arbitrary condition to see if transfer should proceed
        return keccak256(abi.encodePacked(currentOwner, newOwner))[0] == 0x7f;
    }
}
```

# Visibility and Getters

## State Variable Visibility

### public

公共状态变量与内部变量的不同之处仅在于编译器会自动为它们生成 getter 函数，这允许其他合约读取它们的值。 

当在同一个合约中使用时，外部访问（例如 this.x）调用 getter，而内部访问（例如 x）直接从存储中获取变量值。 

不生成设置器函数，因此其他合约无法直接修改它们的值。

### internal

内部状态变量只能从它们在衍生合同中定义的合同中访问。 它们不能被外部访问。 这是状态变量的默认可见性级别。

### private

私有状态变量类似于内部变量，但它们在派生合约中不可见。

- WARN

将某些内容设为私有或内部只会阻止其他合约读取或修改信息，但它仍然对区块链之外的整个世界可见。

## Function Visibility

Solidity 知道两种函数调用：确实创建实际 EVM 消息调用的外部函数调用和不创建实际 EVM 消息调用的内部函数调用。此外，派生合约可能无法访问内部功能。这产生了四种类型的功能可见性。

### external 外部的

外部函数是合约接口的一部分，这意味着它们可以从其他合约和交易中调用。外部函数 f 不能在内部调用（即 f() 不起作用，但 this.f() 起作用）。

### public

公共函数是合约接口的一部分，可以在内部调用，也可以通过消息调用。

### internal

内部函数只能从当前合约或从它派生的合约中访问。它们不能被外部访问。由于它们没有通过合约的 ABI 暴露给外部，它们可以获取内部类型的参数，如映射或存储引用。

### private

私有函数类似于内部函数，但它们在派生合约中不可见。

- 警告

将某些内容设为私有或内部只会阻止其他合约读取或修改信息，但它仍然对区块链之外的整个世界可见。

可见性说明符在状态变量的类型之后以及函数的参数列表和返回参数列表之间给出。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

contract C {
    function f(uint a) private pure returns (uint b) { return a + 1; }
    function setData(uint a) internal { data = a; }
    uint public data;
}
```

在下面的示例中，D 可以调用 c.getData() 来检索状态存储中数据的值，但不能调用 f。 

合同 E 是从 C 派生的，因此可以调用计算。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

contract C {
    uint private data;

    function f(uint a) private pure returns(uint b) { return a + 1; }
    function setData(uint a) public { data = a; }
    function getData() public view returns(uint) { return data; }
    function compute(uint a, uint b) internal pure returns (uint) { return a + b; }
}

// This will not compile
contract D {
    function readData() public {
        C c = new C();
        uint local = c.f(7); // error: member `f` is not visible
        c.setData(3);
        local = c.getData();
        local = c.compute(3, 5); // error: member `compute` is not visible
    }
}

contract E is C {
    function g() public {
        C c = new C();
        uint val = compute(3, 5); // access to internal member (from derived to parent contract)
    }
}
```

## Getter Functions

编译器会自动为所有公共状态变量创建 getter 函数。 

对于下面给出的合约，编译器将生成一个名为 data 的函数，它不接受任何参数并返回一个 uint，即状态变量 data 的值。 

状态变量可以在声明时进行初始化。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

contract C {
    uint public data = 42;
}

contract Caller {
    C c = new C();
    function f() public view returns (uint) {
        return c.data();
    }
}
```

getter 函数具有外部可见性。 

如果符号在内部被访问（即没有这个），它评估为一个状态变量。 

如果它是从外部访问的（即使用 this.），它会评估为一个函数。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.0 <0.9.0;

contract C {
    uint public data;
    function x() public returns (uint) {
        data = 3; // internal access
        return this.data(); // external access
    }
}
```

如果您有一个数组类型的公共状态变量，那么您只能通过生成的 getter 函数检索数组的单个元素。 

这种机制的存在是为了避免在返回整个阵列时产生高气体成本。 

您可以使用参数来指定要返回的单个元素，例如 myArray(0)。 

如果要在一次调用中返回整个数组，则需要编写一个函数，例如：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

contract arrayExample {
    // public state variable
    uint[] public myArray;

    // Getter function generated by the compiler
    /*
    function myArray(uint i) public view returns (uint) {
        return myArray[i];
    }
    */

    // function that returns entire array
    function getArray() public view returns (uint[] memory) {
        return myArray;
    }
}
```

现在您可以使用 getArray() 来检索整个数组，而不是 myArray(i)，它每次调用都返回一个元素。

下一个例子更复杂：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.0 <0.9.0;

contract Complex {
    struct Data {
        uint a;
        bytes3 b;
        mapping (uint => uint) map;
        uint[3] c;
        uint[] d;
        bytes e;
    }
    mapping (uint => mapping(bool => Data[])) public data;
}
```

它生成以下形式的函数。 

结构中的映射和数组（字节数组除外）被省略了，因为没有很好的方法来选择单个结构成员或为映射提供键：

```js
function data(uint arg1, bool arg2, uint arg3)
    public
    returns (uint a, bytes3 b, bytes memory e)
{
    a = data[arg1][arg2][arg3].a;
    b = data[arg1][arg2][arg3].b;
    e = data[arg1][arg2][arg3].e;
}
```

# Function Modifiers 功能修饰符

修饰符可用于以声明方式更改函数的行为。 

例如，您可以使用修饰符在执行函数之前自动检查条件。

修饰符是合约的可继承属性，可以被派生合约覆盖，但前提是它们被标记为虚拟。 

有关详细信息，请参阅修改器覆盖。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.1 <0.9.0;

contract owned {
    constructor() { owner = payable(msg.sender); }
    address payable owner;

    // This contract only defines a modifier but does not use
    // it: it will be used in derived contracts.
    // The function body is inserted where the special symbol
    // `_;` in the definition of a modifier appears.
    // This means that if the owner calls this function, the
    // function is executed and otherwise, an exception is
    // thrown.
    modifier onlyOwner {
        require(
            msg.sender == owner,
            "Only owner can call this function."
        );
        _;
    }
}

contract destructible is owned {
    // This contract inherits the `onlyOwner` modifier from
    // `owned` and applies it to the `destroy` function, which
    // causes that calls to `destroy` only have an effect if
    // they are made by the stored owner.
    function destroy() public onlyOwner {
        selfdestruct(owner);
    }
}

contract priced {
    // Modifiers can receive arguments:
    modifier costs(uint price) {
        if (msg.value >= price) {
            _;
        }
    }
}

contract Register is priced, destructible {
    mapping (address => bool) registeredAddresses;
    uint price;

    constructor(uint initialPrice) { price = initialPrice; }

    // It is important to also provide the
    // `payable` keyword here, otherwise the function will
    // automatically reject all Ether sent to it.
    function register() public payable costs(price) {
        registeredAddresses[msg.sender] = true;
    }

    function changePrice(uint price_) public onlyOwner {
        price = price_;
    }
}

contract Mutex {
    bool locked;
    modifier noReentrancy() {
        require(
            !locked,
            "Reentrant call."
        );
        locked = true;
        _;
        locked = false;
    }

    /// This function is protected by a mutex, which means that
    /// reentrant calls from within `msg.sender.call` cannot call `f` again.
    /// The `return 7` statement assigns 7 to the return value but still
    /// executes the statement `locked = false` in the modifier.
    function f() public noReentrancy returns (uint) {
        (bool success,) = msg.sender.call("");
        require(success);
        return 7;
    }
}
```

如果你想访问合约 C 中定义的修饰符 m，你可以使用 C.m 来引用它而无需虚拟查找。 

只能使用当前合约或其基础合约中定义的修饰符。 

修饰符也可以在库中定义，但它们的使用仅限于同一库的函数。

通过在以空格分隔的列表中指定多个修饰符来将多个修饰符应用于函数，并按显示的顺序进行评估。

修饰符不能隐式访问或更改它们修改的函数的参数和返回值。 

它们的值只能在调用时显式传递给它们。

从修饰符或函数体显式返回仅保留当前修饰符或函数体。 

分配返回变量，控制流在前面修饰符中的 `_` 之后继续。

- WARN

在早期版本的 Solidity 中，具有修饰符的函数中的 return 语句表现不同。

带有 return 的修饰符的显式返回； 不影响函数返回的值。 然而，修饰符可以选择根本不执行函数体，在这种情况下，返回变量被设置为它们的默认值，就像函数有一个空的函数体一样。

`_` 符号可以多次出现在修饰符中。 每次出现都替换为函数体。

修饰符参数允许使用任意表达式，在这种情况下，从函数中可见的所有符号在修饰符中都是可见的。 修饰符中引入的符号在函数中不可见（因为它们可能会因覆盖而改变）。

# 常量和不可变状态变量

状态变量可以声明为常量或不可变。

在这两种情况下，变量在合约构建后都不能修改。

对于常量变量，值必须在编译时固定，而对于不可变变量，它仍然可以在构造时赋值。

也可以在文件级别定义常量变量。

编译器不会为这些变量保留存储槽，每次出现都会被相应的值替换。

与常规状态变量相比，常量和不可变变量的 gas 成本要低得多。

对于常量变量，分配给它的表达式被复制到所有访问它的地方，并且每次都重新计算。

这允许局部优化。不可变变量在构造时被评估一次，它们的值被复制到代码中访问它们的所有位置。

对于这些值，保留 32 个字节，即使它们可以容纳更少的字节。因此，常量值有时可能比不可变值便宜。

目前并非所有常量和不可变类型都已实现。唯一支持的类型是字符串（仅用于常量）和值类型。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.4;

uint constant X = 32**22 + 8;

contract C {
    string constant TEXT = "abc";
    bytes32 constant MY_HASH = keccak256("abc");
    uint immutable decimals;
    uint immutable maxBalance;
    address immutable owner = msg.sender;

    constructor(uint decimals_, address ref) {
        decimals = decimals_;
        // Assignments to immutables can even access the environment.
        maxBalance = ref.balance;
    }

    function isBalanceTooHigh(address other) public view returns (bool) {
        return other.balance > maxBalance;
    }
}
```

## 常数 Constant

对于常量变量，该值在编译时必须是一个常量，并且必须在声明变量的地方赋值。 

任何访问存储、区块链数据（例如 block.timestamp、address(this).balance 或 block.number）或执行数据（msg.value 或 gasleft()）或调用外部合约的表达式都是不允许的。 

允许可能对内存分配产生副作用的表达式，但不允许对其他内存对象产生副作用的表达式。 

允许使用内置函数 keccak256、sha256、ripemd160、ecrecover、addmod 和 mulmod（尽管除了 keccak256，它们确实调用了外部合约）。

允许对内存分配器产生副作用的原因是应该可以构造复杂的对象，例如 查找表。 

此功能尚未完全可用。

## 不可变 Immutable

声明为不可变的变量比声明为常量的限制要少一些：不可变变量可以在合约的构造函数中或在它们声明时被分配一个任意值。它们只能分配一次，从那时起，即使在施工期间也可以读取。

编译器生成的合约创建代码将在返回之前修改合约的运行时代码，将所有对不可变对象的引用替换为分配给它们的值。如果您将编译器生成的运行时代码与实际存储在区块链中的运行时代码进行比较，这一点很重要。

- 笔记

在声明时分配的不可变对象仅在合约的构造函数执行后才被视为已初始化。这意味着您不能使用依赖于另一个不可变对象的值内联初始化不可变对象。但是，您可以在合约的构造函数中执行此操作。

这是防止对状态变量初始化和构造函数执行顺序的不同解释的保护措施，尤其是在继承方面。
 
# 函數 Functions

可以在合约内部和外部定义函数。

合约之外的函数，也称为“自由函数”，总是具有隐含的内部可见性。 

它们的代码包含在调用它们的所有合约中，类似于内部库函数。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.1 <0.9.0;

function sum(uint[] memory arr) pure returns (uint s) {
    for (uint i = 0; i < arr.length; i++)
        s += arr[i];
}

contract ArrayExample {
    bool found;
    function f(uint[] memory arr) public {
        // This calls the free function internally.
        // The compiler will add its code to the contract.
        uint s = sum(arr);
        require(s >= 10);
        found = true;
    }
}
```

- 笔记

在合约之外定义的功能仍然总是在合约的上下文中执行。 

他们仍然可以访问变量 this，可以调用其他合约，向它们发送以太币并销毁调用它们的合约等等。 

与合约内定义的函数的主要区别在于，自由函数不能直接访问不在其范围内的存储变量和函数。

## 函数参数和返回变量

函数将类型化参数作为输入，并且与许多其他语言不同，它还可以返回任意数量的值作为输出。

### Function Parameters

函数参数的声明方式与变量相同，未使用的参数名称可以省略。

例如，如果您希望您的合约接受一种带有两个整数的外部调用，您可以使用如下内容：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

contract Simple {
    uint sum;
    function taker(uint a, uint b) public {
        sum = a + b;
    }
}
```

函数参数可以用作任何其他局部变量，也可以分配给它们。

- 笔记

外部函数不能接受多维数组作为输入参数。 

如果您通过添加 pragma abicoder v2 启用 ABI coder v2，则此功能是可能的； 到您的源文件。

内部函数可以在不启用该功能的情况下接受多维数组。

### 返回变量

函数返回变量在 return 关键字之后使用相同的语法声明。

例如，假设您要返回两个结果：作为函数参数传递的两个整数的总和和乘积，那么您可以使用以下内容：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

contract Simple {
    function arithmetic(uint a, uint b)
        public
        pure
        returns (uint sum, uint product)
    {
        sum = a + b;
        product = a * b;
    }
}
```

返回变量的名称可以省略。 

返回变量可以用作任何其他局部变量，并使用其默认值初始化并具有该值，直到它们被（重新）分配。

您可以显式分配给返回变量，然后像上面一样保留函数，或者您可以直接使用 return 语句提供返回值（单个或多个）：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

contract Simple {
    function arithmetic(uint a, uint b)
        public
        pure
        returns (uint sum, uint product)
    {
        return (a + b, a * b);
    }
}
```

如果您使用提前返回来离开具有返回变量的函数，则必须在返回语句中提供返回值。

- 笔记

您不能从非内部函数返回某些类型，尤其是多维动态数组和结构。 

如果通过添加 pragma abicoder v2 启用 ABI coder v2； 到您的源文件，则可以使用更多类型，但映射类型仍仅限于单个合约内，您无法转移它们。

### 返回多个值

当一个函数有多种返回类型时，语句return (v0, v1, ..., vn)可以用来返回多个值。 

组件的数量必须与返回变量的数量相同，并且它们的类型必须匹配，可能在隐式转换之后。

## 状态可变性

### 查看功能

函数可以声明为视图，在这种情况下它们承诺不修改状态。

- 笔记

如果编译器的 EVM 目标是 Byzantium 或更新的（默认），则在调用视图函数时使用操作码 STATICCALL，这会强制状态保持不变，作为 EVM 执行的一部分。 

对于库视图函数，使用 DELEGATECALL，因为没有组合 DELEGATECALL 和 STATICCALL。 

这意味着库视图函数没有阻止状态修改的运行时检查。 

这不应该对安全性产生负面影响，因为库代码通常在编译时已知并且静态检查器执行编译时检查。

以下语句被视为修改状态：

- 写入状态变量。

- 发射事件。

- 创建其他合同。

- 使用自毁。

- 通过调用发送以太币。

- 调用任何未标记为视图或纯函数的函数。

- 使用低级调用。

- 使用包含某些操作码的内联汇编。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.5.0 <0.9.0;

contract C {
    function f(uint a, uint b) public view returns (uint) {
        return a * (b + 42) + block.timestamp;
    }
}
```

- 笔记

函数上的常量曾经是查看的别名，但在 0.5.0 版中已删除。

- 笔记

Getter 方法是自动标记视图。

- 笔记

在 0.5.0 版本之前，编译器没有将 STATICCALL 操作码用于视图函数。 这通过使用无效的显式类型转换启用了视图函数中的状态修改。 

通过将 STATICCALL 用于视图函数，可以防止在 EVM 级别上对状态进行修改。

### 纯函数 Pure Functions

**函数可以声明为纯函数，在这种情况下它们承诺不会读取或修改状态。**

特别是，应该可以在编译时评估纯函数，仅给出其输入和 msg.data，但无需了解当前区块链状态。 

这意味着从不可变变量中读取可能是非纯操作。

- 笔记

如果编译器的 EVM 目标是 Byzantium 或更新的（默认），则使用操作码 STATICCALL，这不保证不读取状态，但至少不修改状态。

除了上面解释的状态修改语句列表之外，以下内容被认为是从状态中读取的：

从状态变量中读取。

访问地址(this).balance 或 `<address>.balance`。

访问 block、tx、msg 的任何成员（msg.sig 和 msg.data 除外）。

调用任何未标记为纯的函数。

使用包含某些操作码的内联汇编。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.5.0 <0.9.0;

contract C {
    function f(uint a, uint b) public pure returns (uint) {
        return a * (b + 42);
    }
}
```

纯函数能够使用 revert() 和 require() 函数在发生错误时恢复潜在的状态更改。

还原状态更改不被视为“状态修改”，因为仅还原先前在没有视图或纯限制的代码中所做的状态更改，并且该代码可以选择捕获还原而不传递它。

此行为也符合 STATICCALL 操作码。

- 警告

无法阻止函数在 EVM 级别读取状态，只能阻止它们写入状态（即只能在 EVM 级别强制执行视图，pure 不能）。

- 笔记

在 0.5.0 版本之前，编译器不将 STATICCALL 操作码用于纯函数。 这通过使用无效的显式类型转换启用了纯函数中的状态修改。 通过将 STATICCALL 用于纯函数，可以防止在 EVM 级别上修改状态。

- 笔记

在 0.4.17 版本之前，编译器没有强制 pure 没有读取状态。 它是一种编译时类型检查，可以规避在合约类型之间进行无效的显式转换，因为编译器可以验证合约的类型不做状态改变操作，但不能检查将要被 在运行时调用实际上就是那种类型。

## 特殊功能

### Receive Ether Function

一个合约最多可以有一个接收函数，使用 `receive() external paid { ... }` 声明（不带 function 关键字）。此函数不能有参数，不能返回任何内容，并且必须具有外部可见性和应付状态可变性。它可以是虚拟的，可以覆盖并且可以具有修饰符。

接收函数在调用带有空 calldata 的合约时执行。这是在普通 Ether 传输中执行的函数（例如，通过 .send() 或 .transfer()）。如果不存在这样的功能，但存在应付回退功能，则回退功能将在普通的以太币转账中被调用。如果既不存在接收 Ether 也不存在应付回退功能，则合约无法通过常规交易接收 Ether 并引发异常。

在最坏的情况下，接收功能只能依赖 2300 gas 可用（例如使用发送或传输时），几乎没有空间执行除基本日志记录之外的其他操作。

以下操作将消耗比 2300 气体津贴更多的气体：

1. 写入存储

2. 创建合同

3. 调用消耗大量gas的外部函数

4. 发送以太币

- 警告

当 Ether 直接发送到合约（没有函数调用，即发送方使用 send 或 transfer）但接收合约未定义接收 Ether 函数或应付回退函数时，将抛出异常，将 Ether 发送回（此在 Solidity v0.4.0 之前有所不同）。如果你希望你的合约接收 Ether，你必须实现一个接收 Ether 函数（不推荐使用支付回退函数来接收 Ether，因为回退被调用并且不会因发送方的接口混淆而失败）。

- 警告

没有接收 Ether 功能的合约可以接收 Ether 作为 coinbase 交易（又名矿工块奖励）的接收者或作为自毁的目的地。

合约无法对此类以太币转账做出反应，因此也无法拒绝它们。这是 EVM 的设计选择，Solidity 无法解决它。

这也意味着 address(this).balance 可能高于在合约中实现的一些手动记账的总和（即在接收 Ether 函数中更新了一个计数器）。

下面你可以看到一个使用函数 receive 的 Sink 合约示例。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;

// This contract keeps all Ether sent to it with no way
// to get it back.
contract Sink {
    event Received(address, uint);
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
```

### Fallback Function 后备功能

一个合约最多可以有一个回退函数，使用 `fallback () external [payable]` 或 `fallback (bytes calldata input) external [payable] return (bytes memory output)` 声明（两者都没有 function 关键字）。此功能必须具有外部可见性。回退函数可以是虚拟的，可以覆盖并且可以具有修饰符。

如果没有其他函数与给定的函数签名匹配，或者根本没有提供数据并且没有接收 Ether 函数，则在调用合约时执行回退函数。回退函数总是接收数据，但为了也接收 Ether，它必须标记为应付。

如果使用带参数的版本，输入将包含发送到合约的完整数据（等于 msg.data），并且可以在输出中返回数据。返回的数据不会经过 ABI 编码。相反，它将在没有修改的情况下返回（甚至没有填充）。

在最坏的情况下，如果还使用支付回退函数代替接收函数，它只能依赖 2300 gas 可用（有关此含义的简要描述，请参阅接收以太函数）。

与任何函数一样，只要有足够的 gas 传递给它，fallback 函数就可以执行复杂的操作。

- 警告

如果不存在接收 Ether 功能，则还为普通 Ether 传输执行应付回退功能。如果您定义了一个应付回退函数来区分 Ether 传输和接口混淆，那么建议始终定义一个接收 Ether 函数。

- 笔记

如果要解码输入数据，可以检查函数选择器的前四个字节，然后可以使用 abi.decode 和数组切片语法来解码 ABI 编码的数据： (c, d) = abi.decode (输入[4:], (uint256, uint256));请注意，这仅应作为最后的手段使用，而应使用适当的功能。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.2 <0.9.0;

contract Test {
    uint x;
    // This function is called for all messages sent to
    // this contract (there is no other function).
    // Sending Ether to this contract will cause an exception,
    // because the fallback function does not have the `payable`
    // modifier.
    fallback() external { x = 1; }
}

contract TestPayable {
    uint x;
    uint y;
    // This function is called for all messages sent to
    // this contract, except plain Ether transfers
    // (there is no other function except the receive function).
    // Any call with non-empty calldata to this contract will execute
    // the fallback function (even if Ether is sent along with the call).
    fallback() external payable { x = 1; y = msg.value; }

    // This function is called for plain Ether transfers, i.e.
    // for every call with empty calldata.
    receive() external payable { x = 2; y = msg.value; }
}

contract Caller {
    function callTest(Test test) public returns (bool) {
        (bool success,) = address(test).call(abi.encodeWithSignature("nonExistingFunction()"));
        require(success);
        // results in test.x becoming == 1.

        // address(test) will not allow to call ``send`` directly, since ``test`` has no payable
        // fallback function.
        // It has to be converted to the ``address payable`` type to even allow calling ``send`` on it.
        address payable testPayable = payable(address(test));

        // If someone sends Ether to that contract,
        // the transfer will fail, i.e. this returns false here.
        return testPayable.send(2 ether);
    }

    function callTestPayable(TestPayable test) public returns (bool) {
        (bool success,) = address(test).call(abi.encodeWithSignature("nonExistingFunction()"));
        require(success);
        // results in test.x becoming == 1 and test.y becoming 0.
        (success,) = address(test).call{value: 1}(abi.encodeWithSignature("nonExistingFunction()"));
        require(success);
        // results in test.x becoming == 1 and test.y becoming 1.

        // If someone sends Ether to that contract, the receive function in TestPayable will be called.
        // Since that function writes to storage, it takes more gas than is available with a
        // simple ``send`` or ``transfer``. Because of that, we have to use a low-level call.
        (success,) = address(test).call{value: 2 ether}("");
        require(success);
        // results in test.x becoming == 2 and test.y becoming 2 ether.

        return true;
    }
}
```

## 函数重载 Function Overloading

一个合约可以有多个同名但参数类型不同的函数。 

这个过程称为“重载”，也适用于继承的函数。 

以下示例显示了合约 A 范围内的函数 f 的重载。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

contract A {
    function f(uint value) public pure returns (uint out) {
        out = value;
    }

    function f(uint value, bool really) public pure returns (uint out) {
        if (really)
            out = value;
    }
}
```

外部接口中也存在重载函数。 

如果两个外部可见函数的不同在于它们的 Solidity 类型而不是它们的外部类型，这是一个错误。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

// This will not compile
contract A {
    function f(B value) public pure returns (B out) {
        out = value;
    }

    function f(address value) public pure returns (address out) {
        out = value;
    }
}

contract B {
}
```

上面的两个 f 函数重载最终都接受了 ABI 的地址类型，尽管它们在 Solidity 中被认为是不同的。

### Overload resolution and Argument matching 过载解决和参数匹配

通过将当前作用域中的函数声明与函数调用中提供的参数匹配来选择重载函数。 如果所有参数都可以隐式转换为预期类型，则选择函数作为重载候选者。 如果不完全是一个候选人，则决议失败。

笔记

重载解析不考虑返回参数。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

contract A {
    function f(uint8 val) public pure returns (uint8 out) {
        out = val;
    }

    function f(uint256 val) public pure returns (uint256 out) {
        out = val;
    }
}
```

调用 f(50) 会产生类型错误，因为 50 可以隐式转换为 uint8 和 uint256 类型。 

另一方面，f(256) 将解析为 f(uint256) 重载，因为 256 不能隐式转换为 uint8。

# 事件 Events

Solidity 事件在 EVM 的日志记录功能之上提供了一个抽象。应用程序可以通过以太坊客户端的 RPC 接口订阅和监听这些事件。

事件是合约的可继承成员。当您调用它们时，它们会将参数存储在交易日志中——区块链中的一种特殊数据结构。这些日志与合约的地址相关联，并入区块链中，并在区块可访问时一直存在（从现在开始一直存在，但这可能会随着 Serenity 而改变）。无法从合约内部访问日志及其事件数据（甚至无法从创建它们的合约中访问）。

可以为日志请求 Merkle 证明，因此如果外部实体提供具有此类证明的合约，它可以检查日志是否确实存在于区块链中。你必须提供区块头，因为合约只能看到最后的 256 个区块哈希。

您可以将索引的属性添加到最多三个参数，这会将它们添加到称为“主题”的特殊数据结构中，而不是日志的数据部分。一个主题只能包含一个单词（32 个字节），因此如果您对索引参数使用引用类型，则该值的 Keccak-256 哈希值将存储为主题。

所有没有索引属性的参数都被 ABI 编码到日志的数据部分。

主题允许您搜索事件，例如在为某些事件过滤一系列块时。您还可以按发出事件的合约地址过滤事件。

例如，下面的代码使用 web3.js 的 subscribe("logs") 方法过滤与某个地址值的主题匹配的日志：

```js
var options = {
    fromBlock: 0,
    address: web3.eth.defaultAccount,
    topics: ["0x0000000000000000000000000000000000000000000000000000000000000000", null, null]
};
web3.eth.subscribe('logs', options, function (error, result) {
    if (!error)
        console.log(result);
})
    .on("data", function (log) {
        console.log(log);
    })
    .on("changed", function (log) {
});
```

事件签名的哈希是主题之一，除非您使用匿名说明符声明事件。 

这意味着无法按名称过滤特定的匿名事件，只能按合约地址过滤。 

匿名事件的优点是部署和调用成本更低。 它还允许您声明四个索引参数，而不是三个。

- 笔记

由于事务日志只存储事件数据而不存储类型，因此您必须知道事件的类型，包括索引哪个参数以及事件是否是匿名的，以便正确解释数据。 

特别是，可以使用匿名事件“伪造”另一个事件的签名。

## Members of Events

event.selector：对于非匿名事件，这是一个包含事件签名的 keccak256 散列的 bytes32 值，如默认主题中使用的那样。

## 例子

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.21 <0.9.0;

contract ClientReceipt {
    event Deposit(
        address indexed from,
        bytes32 indexed id,
        uint value
    );

    function deposit(bytes32 id) public payable {
        // Events are emitted using `emit`, followed by
        // the name of the event and the arguments
        // (if any) in parentheses. Any such invocation
        // (even deeply nested) can be detected from
        // the JavaScript API by filtering for `Deposit`.
        emit Deposit(msg.sender, id, msg.value);
    }
}
```

JavaScript API 中的使用如下：

```js
var abi = /* abi as generated by the compiler */;
var ClientReceipt = web3.eth.contract(abi);
var clientReceipt = ClientReceipt.at("0x1234...ab67" /* address */);

var depositEvent = clientReceipt.Deposit();

// watch for changes
depositEvent.watch(function(error, result){
    // result contains non-indexed arguments and topics
    // given to the `Deposit` call.
    if (!error)
        console.log(result);
});


// Or pass a callback to start watching immediately
var depositEvent = clientReceipt.Deposit(function(error, result) {
    if (!error)
        console.log(result);
});
```

输出：

```json
{
   "returnValues": {
       "from": "0x1111…FFFFCCCC",
       "id": "0x50…sd5adb20",
       "value": "0x420042"
   },
   "raw": {
       "data": "0x7f…91385",
       "topics": ["0xfd4…b4ead7", "0x7f…1a91385"]
   }
}
```

# 错误和 Revert 语句

Solidity 中的错误提供了一种方便且高效的方式来向用户解释操作失败的原因。 它们可以在合约内部和外部定义（包括接口和库）。

它们必须与 revert 语句一起使用，这会导致当前调用中的所有更改都被还原并将错误数据传递回调用者。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

/// Insufficient balance for transfer. Needed `required` but only
/// `available` available.
/// @param available balance available.
/// @param required requested amount to transfer.
error InsufficientBalance(uint256 available, uint256 required);

contract TestToken {
    mapping(address => uint) balance;
    function transfer(address to, uint256 amount) public {
        if (amount > balance[msg.sender])
            revert InsufficientBalance({
                available: balance[msg.sender],
                required: amount
            });
        balance[msg.sender] -= amount;
        balance[to] += amount;
    }
    // ...
}
```

错误不能被重载或覆盖，而是被继承。只要范围不同，就可以在多个地方定义相同的错误。错误实例只能使用 revert 语句创建。

该错误创建的数据随后通过还原操作传递给调用者，以返回到链外组件或在 try/catch 语句中捕获它。请注意，错误只能在来自外部调用时被捕获，在内部调用或同一函数内部发生的还原无法被捕获。

如果不提供任何参数，则错误只需要四个字节的数据，您可以使用上面的 NatSpec 进一步解释错误背后的原因，它没有存储在链上。这使得它同时成为一个非常便宜和方便的错误报告功能。

更具体地说，错误实例以与对同名和类型的函数的函数调用相同的方式进行 ABI 编码，然后将其用作还原操作码中的返回数据。这意味着数据包含一个 4 字节选择器，后跟 ABI 编码数据。选择器由错误类型签名的 keccak256-hash 的前四个字节组成。

- 笔记

合同可能会因同名的不同错误或什至在调用者无法区分的不同位置定义的错误而恢复。对于外部，即 ABI，只有错误的名称是相关的，而不是定义它的合同或文件。

语句 require(condition, "description");如果可以定义错误 Error(string)，则相当于 if (!condition) revert Error("description")。但是请注意，Error 是一种内置类型，不能在用户提供的代码中定义。

类似地，失败的断言或类似情况将恢复为内置类型 Panic(uint256) 的错误。

- 笔记

错误数据应该只用于给出失败的指示，而不是作为控制流的手段。原因是内部调用的还原数据默认通过外部调用链传播回来。这意味着内部调用可以“伪造”恢复看起来可能来自调用它的合约的数据。

# 继承

Solidity 支持多重继承，包括多态性。

多态性意味着函数调用（内部和外部）总是在继承层次结构中最派生的合约中执行同名（和参数类型）的函数。这必须使用 virtual 和 override 关键字在层次结构中的每个函数上显式启用。有关更多详细信息，请参阅函数覆盖。

可以通过使用 ContractName.functionName() 或使用 super.functionName() 显式指定合同在内部继承层次结构中进一步调用函数，如果您想在扁平继承层次结构中调用更高一级的函数（见下文）。

当一个合约继承自其他合约时，区块链上只创建一个合约，所有基础合约的代码都编译到创建的合约中。这意味着对基础合约函数的所有内部调用也只使用内部函数调用（super.f(..) 将使用 JUMP 而不是消息调用）。

状态变量遮蔽被视为错误。派生合约只能声明状态变量 x，如果在其任何基础中都没有同名的可见状态变量。

通用的继承系统与 Python 的非常相似，尤其是在多重继承方面，但也存在一些差异。

以下示例中给出了详细信息。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;


contract Owned {
    constructor() { owner = payable(msg.sender); }
    address payable owner;
}


// Use `is` to derive from another contract. Derived
// contracts can access all non-private members including
// internal functions and state variables. These cannot be
// accessed externally via `this`, though.
contract Destructible is Owned {
    // The keyword `virtual` means that the function can change
    // its behaviour in derived classes ("overriding").
    function destroy() virtual public {
        if (msg.sender == owner) selfdestruct(owner);
    }
}


// These abstract contracts are only provided to make the
// interface known to the compiler. Note the function
// without body. If a contract does not implement all
// functions it can only be used as an interface.
abstract contract Config {
    function lookup(uint id) public virtual returns (address adr);
}


abstract contract NameReg {
    function register(bytes32 name) public virtual;
    function unregister() public virtual;
}


// Multiple inheritance is possible. Note that `Owned` is
// also a base class of `Destructible`, yet there is only a single
// instance of `Owned` (as for virtual inheritance in C++).
contract Named is Owned, Destructible {
    constructor(bytes32 name) {
        Config config = Config(0xD5f9D8D94886E70b06E474c3fB14Fd43E2f23970);
        NameReg(config.lookup(1)).register(name);
    }

    // Functions can be overridden by another function with the same name and
    // the same number/types of inputs.  If the overriding function has different
    // types of output parameters, that causes an error.
    // Both local and message-based function calls take these overrides
    // into account.
    // If you want the function to override, you need to use the
    // `override` keyword. You need to specify the `virtual` keyword again
    // if you want this function to be overridden again.
    function destroy() public virtual override {
        if (msg.sender == owner) {
            Config config = Config(0xD5f9D8D94886E70b06E474c3fB14Fd43E2f23970);
            NameReg(config.lookup(1)).unregister();
            // It is still possible to call a specific
            // overridden function.
            Destructible.destroy();
        }
    }
}


// If a constructor takes an argument, it needs to be
// provided in the header or modifier-invocation-style at
// the constructor of the derived contract (see below).
contract PriceFeed is Owned, Destructible, Named("GoldFeed") {
    function updateInfo(uint newInfo) public {
        if (msg.sender == owner) info = newInfo;
    }

    // Here, we only specify `override` and not `virtual`.
    // This means that contracts deriving from `PriceFeed`
    // cannot change the behaviour of `destroy` anymore.
    function destroy() public override(Destructible, Named) { Named.destroy(); }
    function get() public view returns(uint r) { return info; }

    uint info;
}
```

请注意，上面我们调用 Destructible.destroy() 来“转发”销毁请求。 

这样做的方式是有问题的，如下例所示：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract owned {
    constructor() { owner = payable(msg.sender); }
    address payable owner;
}

contract Destructible is owned {
    function destroy() public virtual {
        if (msg.sender == owner) selfdestruct(owner);
    }
}

contract Base1 is Destructible {
    function destroy() public virtual override { /* do cleanup 1 */ Destructible.destroy(); }
}

contract Base2 is Destructible {
    function destroy() public virtual override { /* do cleanup 2 */ Destructible.destroy(); }
}

contract Final is Base1, Base2 {
    function destroy() public override(Base1, Base2) { Base2.destroy(); }
}
```

对 Final.destroy() 的调用将调用 Base2.destroy，因为我们在最终覆盖中明确指定了它，但此函数将绕过 Base1.destroy。 解决这个问题的方法是使用 super：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract owned {
    constructor() { owner = payable(msg.sender); }
    address payable owner;
}

contract Destructible is owned {
    function destroy() virtual public {
        if (msg.sender == owner) selfdestruct(owner);
    }
}

contract Base1 is Destructible {
    function destroy() public virtual override { /* do cleanup 1 */ super.destroy(); }
}


contract Base2 is Destructible {
    function destroy() public virtual override { /* do cleanup 2 */ super.destroy(); }
}

contract Final is Base1, Base2 {
    function destroy() public override(Base1, Base2) { super.destroy(); }
}
```

如果 Base2 调用 super 的函数，它不会简单地在其基础合约之一上调用此函数。 

相反，它会在最终继承图中的下一个基础合约上调用此函数，因此它将调用 Base1.destroy()（请注意，最终继承顺序是 - 从派生最多的合约开始：Final、Base2、Base1、Destructible、 拥有）。 

使用 super 时调用的实际函数在使用它的类的上下文中是未知的，尽管它的类型是已知的。 这与普通的虚拟方法查找类似。

## 函数覆盖 Function Overriding

如果基函数被标记为虚拟，则可以通过继承合约来更改它们的行为来覆盖基本函数。

然后，覆盖函数必须在函数头中使用 override 关键字。 

重写函数只能将重写函数的可见性从外部更改为公共。 

可变性可以更改为更严格的顺序：nonpayable 可以被 view 和 pure 覆盖。 

view 可以被 pure 覆盖。 

应付账款是一个例外，不能更改为任何其他可变性。

以下示例演示了不断变化的可变性和可见性：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract Base
{
    function foo() virtual external view {}
}

contract Middle is Base {}

contract Inherited is Middle
{
    function foo() override public pure {}
}
```

对于多重继承，必须在 override 关键字之后显式指定定义相同函数的最派生基础合约。 

换句话说，您必须指定所有定义相同功能且尚未被另一个基础合约覆盖的基础合约（在通过继承图的某个路径上）。 

此外，如果合约从多个（不相关的）基础继承相同的功能，它必须显式覆盖它：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;

contract Base1
{
    function foo() virtual public {}
}

contract Base2
{
    function foo() virtual public {}
}

contract Inherited is Base1, Base2
{
    // Derives from multiple bases defining foo(), so we must explicitly
    // override it
    function foo() public override(Base1, Base2) {}
}
```

如果函数是在通用基础合约中定义的，或者如果通用基础合约中有一个唯一函数已经覆盖了所有其他函数，则不需要显式覆盖说明符。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;

contract A { function f() public pure{} }
contract B is A {}
contract C is A {}
// No explicit override required
contract D is B, C {}
```

更正式地说，如果有一个基础合约是签名的所有覆盖路径的一部分，并且（1）该基础实现该函数并且没有来自多个基础的路径，则不需要重写从多个基础继承的函数（直接或间接） 当前与基础的合约提到了具有该签名的函数，或者 (2) 该基础没有实现该功能，并且在从当前合约到该基础的所有路径中最多有一次提及该功能。

从这个意义上说，签名的覆盖路径是通过继承图的路径，该路径从所考虑的合同开始，到提及具有该签名的未覆盖功能的合同结束。

如果您不将覆盖的函数标记为虚拟，则派生合约将无法再更改该函数的行为。

笔记

具有私有可见性的函数不能是虚拟的。

笔记

没有实现的功能必须在接口之外标记为虚拟。 在接口中，所有功能都自动被认为是虚拟的。

笔记

从 Solidity 0.8.8 开始，重写接口函数时不需要 override 关键字，除非函数在多个基中定义。

如果函数的参数和返回类型与变量的 getter 函数匹配，则公共状态变量可以覆盖外部函数：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;

contract A
{
    function f() external view virtual returns(uint) { return 5; }
}

contract B is A
{
    uint public override f;
}
```

## 修饰符覆盖 Modifier Overriding

函数修饰符可以相互覆盖。 

这与函数覆盖的工作方式相同（除了修饰符没有重载）。 

virtual 关键字必须用在 override 修饰符上， override 关键字必须用在 override 修饰符上：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;

contract Base
{
    modifier foo() virtual {_;}
}

contract Inherited is Base
{
    modifier foo() override {_;}
}
```

在多重继承的情况下，必须明确指定所有直接基础合约：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;

contract Base1
{
    modifier foo() virtual {_;}
}

contract Base2
{
    modifier foo() virtual {_;}
}

contract Inherited is Base1, Base2
{
    modifier foo() override(Base1, Base2) {_;}
}
```

## 构造函数

构造函数是使用构造函数关键字声明的可选函数，在创建合约时执行，您可以在其中运行合约初始化代码。

在执行构造函数代码之前，如果内联初始化状态变量，则将其初始化为其指定值，否则将其初始化为默认值。

构造函数运行后，合约的最终代码将部署到区块链。 代码的部署成本与代码长度成线性关系。 

此代码包括作为公共接口一部分的所有函数以及可通过函数调用从那里访问的所有函数。 

它不包括仅从构造函数调用的构造函数代码或内部函数。

如果没有构造函数，合约将假定默认构造函数，相当于constructor() {}。 

例如：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

abstract contract A {
    uint public a;

    constructor(uint a_) {
        a = a_;
    }
}

contract B is A(1) {
    constructor() {}
}
```

您可以在构造函数中使用内部参数（例如存储指针）。 在这种情况下，必须将合约标记为抽象，因为这些参数不能从外部分配有效值，而只能通过派生合约的构造函数分配。

警告

在 0.4.22 版本之前，构造函数被定义为与合约同名的函数。 此语法已被弃用，并且在 0.5.0 版中不再允许使用。

警告

在 0.7.0 版本之前，您必须将构造函数的可见性指定为内部或公共。

## 基础构造函数的参数

所有基础合约的构造函数都将按照下面解释的线性化规则进行调用。 

如果基本构造函数有参数，则派生合约需要指定所有参数。 

这可以通过两种方式完成：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract Base {
    uint x;
    constructor(uint x_) { x = x_; }
}

// Either directly specify in the inheritance list...
contract Derived1 is Base(7) {
    constructor() {}
}

// or through a "modifier" of the derived constructor...
contract Derived2 is Base {
    constructor(uint y) Base(y * y) {}
}

// or declare abstract...
abstract contract Derived3 is Base {
}

// and have the next concrete derived contract initialize it.
contract DerivedFromDerived is Derived3 {
    constructor() Base(10 + 10) {}
}
```

一种方法是直接在继承列表中（即 Base(7)）。

另一个是作为派生构造函数 (Base(y * y)) 的一部分调用修饰符的方式。

如果构造函数参数是一个常量并定义合约的行为或描述它，那么第一种方法会更方便。

如果 base 的构造函数参数依赖于派生合约的参数，则必须使用第二种方法。参数必须在继承列表或派生构造函数的修饰符样式中给出。在这两个地方指定参数是错误的。

如果派生合约没有为其所有基础合约的构造函数指定参数，则必须将其声明为抽象的。

在这种情况下，当另一个合约派生自它时，该合约的继承列表或构造函数必须为所有未指定其参数的基类提供必要的参数（否则，该其他合约也必须声明为抽象）。

例如，在上面的代码片段中，请参阅 Derived3 和 DerivedFromDerived。

## 多重继承和线性化

允许多重继承的语言必须处理几个问题。

一是钻石问题。 

Solidity 类似于 Python，因为它使用“C3 线性化”来强制基类的有向无环图 (DAG) 中的特定顺序。这导致了理想的单调性属性，但不允许某些继承图。特别是，在 is 指令中给出基类的顺序很重要：您必须按照从“最类似基类”到“最衍生”的顺序​​列出直接基类合约。请注意，此顺序与 Python 中使用的顺序相反。

解释这一点的另一种简化方法是，当调用在不同合约中多次定义的函数时，以深度优先的方式从右到左（在 Python 中从左到右）搜索给定的碱基，在第一次匹配时停止.如果已经搜索了基本合约，则跳过它。

在下面的代码中，Solidity 将给出错误“继承图的线性化不可能”。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.0 <0.9.0;

contract X {}
contract A is X {}
// This will not compile
contract C is A, X {}
```

这样做的原因是C请求X覆盖A（通过指定A，X的顺序），但A本身请求覆盖X，这是一个无法解决的矛盾。

由于您必须显式覆盖从多个基类继承的函数而无需唯一覆盖，因此 C3 线性化在实践中并不太重要。

继承线性化特别重要但可能不太清楚的一个领域是在继承层次结构中有多个构造函数时。 构造函数将始终以线性化顺序执行，无论继承合约的构造函数中提供它们的参数的顺序如何。 例如：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract Base1 {
    constructor() {}
}

contract Base2 {
    constructor() {}
}

// Constructors are executed in the following order:
//  1 - Base1
//  2 - Base2
//  3 - Derived1
contract Derived1 is Base1, Base2 {
    constructor() Base1() Base2() {}
}

// Constructors are executed in the following order:
//  1 - Base2
//  2 - Base1
//  3 - Derived2
contract Derived2 is Base2, Base1 {
    constructor() Base2() Base1() {}
}

// Constructors are still executed in the following order:
//  1 - Base2
//  2 - Base1
//  3 - Derived3
contract Derived3 is Base2, Base1 {
    constructor() Base1() Base2() {}
}
```

## 继承不同种类的同名成员

如果合约中的以下任何一对由于继承而具有相同的名称，则为错误：

一个函数和一个修饰符

一个函数和一个事件

事件和修饰符

作为一个例外，状态变量 getter 可以覆盖外部函数。

# Abstract Contracts 抽象合同

当至少其中一个功能未实现或未为其所有基本合约构造函数提供参数时，必须将合约标记为抽象。 

即使不是这种情况，合同仍可能被标记为抽象，例如当您不打算直接创建合同时。 

抽象契约类似于接口，但接口在它可以声明的内容方面受到更多限制。

使用 abstract 关键字声明抽象合约，如以下示例所示。 

请注意，该合约需要定义为抽象的，因为声明了函数 utterance()，但没有提供实现（没有给出实现主体 { }）。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;

abstract contract Feline {
    function utterance() public virtual returns (bytes32);
}
```

这样的抽象合约不能直接实例化。 

如果抽象合约本身确实实现了所有定义的功能，这也是正确的。 

抽象合约作为基类的用法如下例所示：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;

abstract contract Feline {
    function utterance() public pure virtual returns (bytes32);
}

contract Cat is Feline {
    function utterance() public pure override returns (bytes32) { return "miaow"; }
}
```

如果合约继承自抽象合约，并且没有通过覆盖实现所有未实现的功能，则也需要将其标记为抽象。

请注意，没有实现的函数与函数类型不同，尽管它们的语法看起来非常相似。

没有实现的函数示例（函数声明）：

```js
function foo(address) external returns (address);
```

类型为函数类型的变量的声明示例：

```js
function(address) external returns (address) foo;
```

抽象契约将契约的定义与其实现分离，提供更好的可扩展性和自文档化，并促进模板方法等模式和消除代码重复。 

抽象契约的用处与在接口中定义方法的用处相同。 

这是抽象合约的设计者说“我的任何孩子都必须实现这个方法”的一种方式。

# 接口

接口类似于抽象合约，但它们不能实现任何功能。 

还有更多限制：

它们不能从其他合约继承，但可以从其他接口继承。

所有声明的函数在接口中必须是外部的，即使它们在合约中是公共的。

他们不能声明构造函数。

他们不能声明状态变量。

他们不能声明修饰符。

未来可能会取消其中一些限制。

接口基本上仅限于 Contract ABI 可以表示的内容，ABI 和接口之间的转换应该是可能的，不会丢失任何信息。

接口由它们自己的关键字表示：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.2 <0.9.0;

interface Token {
    enum TokenType { Fungible, NonFungible }
    struct Coin { string obverse; string reverse; }
    function transfer(address recipient, uint amount) external;
}
```

合约可以像继承其他合约一样继承接口。

接口中声明的所有函数都是隐式虚函数，任何覆盖它们的函数都不需要 override 关键字。 这并不自动意味着可以再次覆盖覆盖函数 - 只有在覆盖函数被标记为虚拟时才有可能。

接口可以从其他接口继承。 这与普通继承具有相同的规则。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.2 <0.9.0;

interface ParentA {
    function test() external returns (uint256);
}

interface ParentB {
    function test() external returns (uint256);
}

interface SubInterface is ParentA, ParentB {
    // Must redefine test in order to assert that the parent
    // meanings are compatible.
    function test() external override(ParentA, ParentB) returns (uint256);
}
```

在接口和其他类似合约的结构中定义的类型可以从其他合约访问：Token.TokenType 或 Token.Coin。

# 图书馆 Libraries

库类似于合约，但它们的目的是它们只在特定地址部署一次，并且它们的代码使用 EVM 的 DELEGATECALL（CALLCODE 直到 Homestead）功能重用。 

这意味着如果调用库函数，它们的代码将在调用合约的上下文中执行，即 this 指向调用合约，尤其是可以访问调用合约的存储。 

由于库是一段孤立的源代码，它只能访问调用合约的状态变量，如果它们被显式提供（否则它无法命名它们）。 

如果库函数不修改状态（即如果它们是视图或纯函数），则只能直接调用库函数（即不使用 DELEGATECALL），因为假定库是无状态的。 

特别是，不可能销毁库。

- 笔记

在 0.4.20 版本之前，可以通过绕过 Solidity 的类型系统来销毁库。从那个版本开始，库包含一种不允许直接调用状态修改函数的机制（即没有 DELEGATECALL）。

库可以被视为使用它们的合约的隐含基础合约。它们在继承层次结构中不会显式可见，但对库函数的调用看起来就像对显式基础合约的函数的调用（使用像 L.f() 这样的合格访问）。当然，对内部函数的调用使用内部调用约定，这意味着所有内部类型都可以传递，并且存储在内存中的类型将通过引用传递而不是复制。为了在 EVM 中实现这一点，从合约调用的内部库函数的代码以及从其中调用的所有函数将在编译时包含在调用合约中，并且将使用常规 JUMP 调用而不是 DELEGATECALL。

- 笔记

当涉及到公共函数时，继承类比就失效了。使用 L.f() 调用公共库函数会导致外部调用（准确地说是 DELEGATECALL）。相反，当 A 是当前合约的基础合约时，A.f() 是内部调用。

以下示例说明了如何使用库（但使用手动方法，请务必查看 using for 以获得更高级的示例来实现集合）。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;


// We define a new struct datatype that will be used to
// hold its data in the calling contract.
struct Data {
    mapping(uint => bool) flags;
}

library Set {
    // Note that the first parameter is of type "storage
    // reference" and thus only its storage address and not
    // its contents is passed as part of the call.  This is a
    // special feature of library functions.  It is idiomatic
    // to call the first parameter `self`, if the function can
    // be seen as a method of that object.
    function insert(Data storage self, uint value)
        public
        returns (bool)
    {
        if (self.flags[value])
            return false; // already there
        self.flags[value] = true;
        return true;
    }

    function remove(Data storage self, uint value)
        public
        returns (bool)
    {
        if (!self.flags[value])
            return false; // not there
        self.flags[value] = false;
        return true;
    }

    function contains(Data storage self, uint value)
        public
        view
        returns (bool)
    {
        return self.flags[value];
    }
}


contract C {
    Data knownValues;

    function register(uint value) public {
        // The library functions can be called without a
        // specific instance of the library, since the
        // "instance" will be the current contract.
        require(Set.insert(knownValues, value));
    }
    // In this contract, we can also directly access knownValues.flags, if we want.
}
```

当然，您不必按照这种方式使用库：也可以在不定义结构数据类型的情况下使用它们。 

函数也可以在没有任何存储引用参数的情况下工作，并且它们可以有多个存储引用参数并且可以在任何位置。

对 Set.contains、Set.insert 和 Set.remove 的调用都编译为对外部合约/库的调用 (DELEGATECALL)。 

如果您使用库，请注意执行了实际的外部函数调用。 

但是，msg.sender、msg.value 和 this 将在这次调用中保留它们的值（在 Homestead 之前，由于使用了 CALLCODE，msg.sender 和 msg.value 改变了）。

以下示例显示了如何使用存储在内存中的类型和库中的内部函数来实现自定义类型，而无需外部函数调用的开销：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

struct bigint {
    uint[] limbs;
}

library BigInt {
    function fromUint(uint x) internal pure returns (bigint memory r) {
        r.limbs = new uint[](1);
        r.limbs[0] = x;
    }

    function add(bigint memory a, bigint memory b) internal pure returns (bigint memory r) {
        r.limbs = new uint[](max(a.limbs.length, b.limbs.length));
        uint carry = 0;
        for (uint i = 0; i < r.limbs.length; ++i) {
            uint limbA = limb(a, i);
            uint limbB = limb(b, i);
            unchecked {
                r.limbs[i] = limbA + limbB + carry;

                if (limbA + limbB < limbA || (limbA + limbB == type(uint).max && carry > 0))
                    carry = 1;
                else
                    carry = 0;
            }
        }
        if (carry > 0) {
            // too bad, we have to add a limb
            uint[] memory newLimbs = new uint[](r.limbs.length + 1);
            uint i;
            for (i = 0; i < r.limbs.length; ++i)
                newLimbs[i] = r.limbs[i];
            newLimbs[i] = carry;
            r.limbs = newLimbs;
        }
    }

    function limb(bigint memory a, uint index) internal pure returns (uint) {
        return index < a.limbs.length ? a.limbs[index] : 0;
    }

    function max(uint a, uint b) private pure returns (uint) {
        return a > b ? a : b;
    }
}

contract C {
    using BigInt for bigint;

    function f() public pure {
        bigint memory x = BigInt.fromUint(7);
        bigint memory y = BigInt.fromUint(type(uint).max);
        bigint memory z = x.add(y);
        assert(z.limb(1) > 0);
    }
}
```

可以通过将库类型转换为地址类型来获取库的地址，即使用地址(LibraryName)。

由于编译器不知道库的部署地址，因此编译后的十六进制代码将包含 `__$30bbc0abd4d6364515865950d3e0d10953$__` 形式的占位符。

占位符是完全限定库名称的 keccak256 哈希的十六进制编码的 34 个字符前缀，例如，如果库存储在 library/ 中名为 bigint.sol 的文件中，则为 library/bigint.sol:BigInt目录。

此类字节码不完整，不应部署。占位符需要替换为实际地址。

您可以通过在编译库时将它们传递给编译器或使用链接器更新已编译的二进制文件来做到这一点。

有关如何使用命令行编译器进行链接的信息，请参阅库链接。

与合约相比，库在以下方面受到限制：

他们不能有状态变量

他们不能继承也不能被继承

他们无法接收以太币

他们不能被摧毁

（这些可能会在稍后解除。）

## 库中的函数签名和选择器

虽然对公共或外部库函数的外部调用是可能的，但此类调用的调用约定被认为是 Solidity 内部的，与为常规合约 ABI 指定的不同。

外部库函数支持比外部合约函数更多的参数类型，例如递归结构和存储指针。

出于这个原因，用于计算 4 字节选择器的函数签名是按照内部命名模式计算的，并且合约 ABI 中不支持的类型的参数使用内部编码。

以下标识符用于签名中的类型：

值类型、非存储字符串和非存储字节使用与合约 ABI 中相同的标识符。

非存储数组类型遵循与合约 ABI 中相同的约定，即 `<type>[]` 用于动态数组，`<type>[M]` 用于 M 元素的固定大小数组。

非存储结构由它们的完全限定名称引用，即合同 C { struct S { ... } } 的 C.S。

存储指针映射使用 `mapping(<keyType> => <valueType>)` 存储，其中 `<keyType>` 和 `<valueType>` 分别是映射的键和值类型的标识符。

其他存储指针类型使用其对应的非存储类型的类型标识符，但会附加一个空格，然后是存储。

参数编码与常规合约 ABI 相同，除了存储指针，它们被编码为 uint256 值，指的是它们指向的存储槽。

与合约 ABI 类似，选择器由签名的 Keccak256-hash 的前四个字节组成。它的值可以使用 .selector 成员从 Solidity 中获取，如下所示：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.5.14 <0.9.0;

library L {
    function f(uint256) external {}
}

contract C {
    function g() public pure returns (bytes4) {
        return L.f.selector;
    }
}
```

## 库的调用保护

如介绍中所述，如果使用 CALL 而不是 DELEGATECALL 或 CALLCODE 执行库的代码，除非调用视图或纯函数，否则它将恢复。

EVM 没有为合约提供直接的方法来检测它是否使用 CALL 调用，但合约可以使用 ADDRESS 操作码来找出它当前运行的“位置”。生成的代码将此地址与构建时使用的地址进行比较，以确定调用方式。

更具体地说，库的运行时代码总是以 push 指令开始，它在编译时是 20 字节的零。当部署代码运行时，这个常量在内存中被当前地址替换，修改后的代码存储在合约中。在运行时，这会导致部署时间地址成为第一个被压入堆栈的常量，并且调度程序代码将当前地址与任何非视图和非纯函数的该常量进行比较。

这意味着存储在链上的库的实际代码与编译器报告为 deployBytecode 的代码不同。

# Using For

将 A 用于 B 的指令；可用于将函数 (A) 作为成员函数附加到任何类型 (B)。这些函数将接收它们被调用的对象作为它们的第一个参数（如 Python 中的 self 变量）。

它在文件级别或合同内部的合同级别有效。

第一部分 A 可以是以下之一：

文件级或库函数列表（使用 {f, g, h, L.t} 表示 uint;） - 只有这些函数将附加到类型。

库的名称（使用 L 表示 uint；）- 库的所有函数（公共的和内部的）都附加到类型

在文件级别，第二部分 B 必须是显式类型（没有数据位置说明符）。在合约内部，您还可以使用 using L for *;，其效果是库 L 的所有函数都附加到所有类型。

如果指定库，则库中的所有函数都会附加，即使是第一个参数的类型与对象类型不匹配的函数。在调用函数并执行函数重载决议时检查类型。

如果使用函数列表（使用 {f, g, h, L.t} 表示 uint;），则类型 (uint) 必须隐式转换为每个函数的第一个参数。即使没有调用这些函数，也会执行此检查。

用 A 换 B；指令仅在当前范围内（合同或当前模块/源单元）有效，包括其所有功能，并且在使用它的合同或模块之外无效。

当该指令在文件级别使用并应用于在同一文件中的文件级别定义的用户定义类型时，可以在末尾添加单词 global。这将产生这样的效果，即函数在类型可用的任何地方（包括其他文件）都附加到类型上，而不仅仅是在 using 语句的范围内。

让我们以这种方式重写库部分中的设置示例，使用文件级函数而不是库函数。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

struct Data { mapping(uint => bool) flags; }
// Now we attach functions to the type.
// The attached functions can be used throughout the rest of the module.
// If you import the module, you have to
// repeat the using directive there, for example as
//   import "flags.sol" as Flags;
//   using {Flags.insert, Flags.remove, Flags.contains}
//     for Flags.Data;
using {insert, remove, contains} for Data;

function insert(Data storage self, uint value)
    returns (bool)
{
    if (self.flags[value])
        return false; // already there
    self.flags[value] = true;
    return true;
}

function remove(Data storage self, uint value)
    returns (bool)
{
    if (!self.flags[value])
        return false; // not there
    self.flags[value] = false;
    return true;
}

function contains(Data storage self, uint value)
    public
    view
    returns (bool)
{
    return self.flags[value];
}


contract C {
    Data knownValues;

    function register(uint value) public {
        // Here, all variables of type Data have
        // corresponding member functions.
        // The following function call is identical to
        // `Set.insert(knownValues, value)`
        require(knownValues.insert(value));
    }
}
```

也可以以这种方式扩展内置类型。 

在这个例子中，我们将使用一个库。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

library Search {
    function indexOf(uint[] storage self, uint value)
        public
        view
        returns (uint)
    {
        for (uint i = 0; i < self.length; i++)
            if (self[i] == value) return i;
        return type(uint).max;
    }
}
using Search for uint[];

contract C {
    uint[] data;

    function append(uint value) public {
        data.push(value);
    }

    function replace(uint from, uint to) public {
        // This performs the library function call
        uint index = data.indexOf(from);
        if (index == type(uint).max)
            data.push(to);
        else
            data[index] = to;
    }
}
```

请注意，所有外部库调用都是实际的 EVM 函数调用。 

这意味着如果您传递内存或值类型，将执行复制，即使是 self 变量。 

唯一不会执行复制的情况是使用存储引用变量或调用内部库函数时。

# 参考资料

https://docs.soliditylang.org/en/latest/control-structures.html

* any list
{:toc}