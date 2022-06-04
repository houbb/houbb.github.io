---
layout: post
title:  Solidity-15-Units and Globally Available Variables
date:  2022-05-22 09:22:02 +0800
categories: [Lang]
tags: [lang, solidity, sh]
published: true
---

# 以太单位 Ether Units

文字数字可以采用 wei、gwei 或 ether 的后缀来指定 Ether 的子面额，其中不带后缀的 Ether 数字被假定为 Wei。

```js
assert(1 wei == 1);
assert(1 gwei == 1e9);
assert(1 ether == 1e18);
```

小面额后缀的唯一效果是乘以十的幂。

- 笔记

0.7.0 版中删除了 finney 和 szabo 面额。

# 时间单位

文字数字后的秒、分钟、小时、天和周等后缀可用于指定时间单位，其中秒是基本单位，单位以下列方式被天真地考虑：

1 == 1 秒
1 分钟 == 60 秒
1 小时 == 60 分钟
1 天 == 24 小时
1 周 == 7 天

使用这些单位执行日历计算时要小心，因为并非每年都等于 365 天，而且由于闰秒，甚至每天都有 24 小时。 

由于无法预测闰秒，因此必须由外部预言机更新精确的日历库。

- NOTE

由于上述原因，后缀年份已在 0.5.0 版本中删除。

这些后缀不能应用于变量。 

例如，如果你想以天为单位解释一个函数参数，你可以通过以下方式：

```js
function f(uint start, uint daysAfter) public {
    if (block.timestamp >= start + daysAfter * 1 days) {
      // ...
    }
}
```

# 特殊变量和函数

全局命名空间中始终存在一些特殊的变量和函数，主要用于提供有关区块链的信息，或者是通用的实用函数。

## 区块和交易属性

```
blockhash(uint blockNumber) 返回 (bytes32)：当 blocknumber 是 256 个最近的块之一时给定块的哈希；否则返回零
block.basefee (uint)：当前区块的基本费用（EIP-3198 和 EIP-1559）
block.chainid (uint): 当前链id
block.coinbase（应付地址）：当前区块矿工的地址
block.difficulty (uint): 当前区块难度
block.gaslimit (uint): 当前区块gaslimit
block.number (uint): 当前块号
block.timestamp (uint): 当前区块时间戳，自 unix 纪元以来的秒数
gasleft() 返回 (uint256): 剩余气体
msg.data (bytes calldata): 完整的calldata
msg.sender（地址）：消息的发送者（当前通话）
msg.sig (bytes4)：calldata 的前四个字节（即函数标识符）
msg.value (uint): 随消息发送的wei数
tx.gasprice (uint)：交易的gas价格
tx.origin（地址）：交易的发送者（完整的调用链）
```

笔记

msg 的所有成员的值，包括 msg.sender 和 msg.value 可以随着每个外部函数调用而改变。这包括对库函数的调用。

笔记

当合约在链外而不是在区块中包含的交易的上下文中进行评估时，您不应假设 block.* 和 tx.* 指的是来自任何特定区块或交易的值。这些值由执行合约的 EVM 实现提供，并且可以是任意的。

笔记

不要依赖 block.timestamp 或 blockhash 作为随机源，除非你知道自己在做什么。

时间戳和区块哈希都会在一定程度上受到矿工的影响。例如，采矿社区中的不良行为者可以在选定的哈希上运行赌场支付功能，如果他们没有收到任何钱，只需重试不同的哈希。

当前区块的时间戳必须严格大于上一个区块的时间戳，但唯一的保证是它将位于规范链中两个连续区块的时间戳之间。

笔记

出于可扩展性的原因，区块哈希并非对所有区块都可用。您只能访问最近 256 个区块的哈希值，所有其他值将为零。

笔记

函数 blockhash 以前称为 block.blockhash，在 0.4.22 版本中已弃用，并在 0.5.0 版本中删除。

笔记

函数 gasleft 以前称为 msg.gas，在 0.4.21 版本中已弃用，并在 0.5.0 版本中删除。

笔记

在 0.7.0 版本中，别名 now (for block.timestamp) 已被删除。

## ABI 编码和解码功能

```
abi.decode(bytes memory encodedData, (...)) 返回 (...)：ABI 解码给定数据，而类型在括号中作为第二个参数给出。示例： (uint a, uint[2] memory b, bytes memory c) = abi.decode(data, (uint, uint[2], bytes))
abi.encode(...) 返回（字节内存）：ABI 编码给定的参数
abi.encodePacked(...) 返回（字节内存）：对给定参数执行打包编码。请注意，打包编码可能不明确！
abi.encodeWithSelector(bytes4 selector, ...) 返回（字节内存）：ABI 从第二个开始对给定参数进行编码，并将给定的四字节选择器放在前面
abi.encodeWithSignature(string memory signature, ...) 返回 (bytes memory): 等价于 abi.encodeWithSelector(bytes4(keccak256(bytes(signature))), ...)
abi.encodeCall(function functionPointer, (...)) 返回（字节内存）：ABI 使用元组中的参数对 functionPointer 的调用进行编码。执行完整的类型检查，确保类型与函数签名匹配。结果等于 abi.encodeWithSelector(functionPointer.selector, (...))
```

笔记

这些编码函数可用于为外部函数调用制作数据，而无需实际调用外部函数。

此外，keccak256(abi.encodePacked(a, b)) 是一种计算结构化数据哈希的方法（尽管请注意，可以使用不同的函数参数类型来制造“哈希冲突”）。

有关编码的详细信息，请参阅有关 ABI 和紧密打包编码的文档。

## 字节的成员

bytes.concat(...) 返回（字节内存）：将可变数量的字节和 bytes1、...、bytes32 参数连接到一个字节数组

## 字符串成员

string.concat(...) 返回（字符串内存）：将可变数量的字符串参数连接到一个字符串数组

## 错误处理

有关错误处理以及何时使用哪个函数的更多详细信息，请参阅有关断言和要求的专用部分。

- assert(bool condition)

如果条件不满足，则会导致 Panic 错误并因此状态更改恢复 - 用于内部错误。

- require(bool condition)

如果条件不满足，则恢复 - 用于输入或外部组件中的错误。

- require(bool condition, string memory message)

如果条件不满足，则恢复 - 用于输入或外部组件中的错误。 还提供错误消息。

- revert()

中止执行并恢复状态更改

- revert(string memory reason)

中止执行并恢复状态更改，提供解释性字符串

## 数学和密码函数

- addmod(uint x, uint y, uint k) returns (uint)

计算 (x + y) % k，其中以任意精度执行加法，并且不会在 2**256 处回绕。 断言 k != 0 从版本 0.5.0 开始。

- mulmod(uint x, uint y, uint k) returns (uint)

计算 (x * y) % k，其中以任意精度执行乘法，并且不会在 2**256 处回绕。 断言 k != 0 从版本 0.5.0 开始。

- keccak256(bytes memory) returns (bytes32)

计算输入的 Keccak-256 哈希

- sha256(bytes memory) returns (bytes32)

计算输入的 SHA-256 哈希

- ripemd160(bytes memory) returns (bytes20)

计算输入的 RIPEMD-160 哈希

- ecrecover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) returns (address)

从椭圆曲线签名中恢复与公钥关联的地址或在错误时返回零。 函数参数对应签名的 ECDSA 值：

r = 签名的前 32 个字节

s = 第二个 32 字节的签名

v = 签名的最后 1 个字节

ecrecover 返回一个地址，而不是一个应付地址。 请参阅应付转换地址，以防您需要将资金转移到恢复的地址。

有关更多详细信息，请阅读示例用法。

- WARNING

如果您使用 ecrecover，请注意可以将有效签名转换为不同的有效签名，而无需知道相应的私钥。 

在 Homestead 硬分叉中，此问题已针对 _transaction_ 签名（参见 EIP-2）进行了修复，但 ecrecover 功能保持不变。

这通常不是问题，除非您要求签名是唯一的或使用它们来识别项目。

OpenZeppelin 有一个 ECDSA 帮助程序库，您可以将其用作 ecrecover 的包装器，而不会出现此问题。

- NOTE

在私有区块链上运行 sha256、ripemd160 或 ecrecover 时，您可能会遇到 Out-of-Gas。 

这是因为这些功能是作为“预编译合约”实现的，并且只有在它们收到第一条消息后才真正存在（尽管它们的合约代码是硬编码的）。 

不存在的合约的消息更昂贵，因此执行可能会遇到 Out-of-Gas 错误。 

此问题的解决方法是先将 Wei（例如 1）发送到每个合同，然后再将它们用于实际合同。 

这在主网上或测试网上都不是问题。

## 地址类型的成员

`<address>.balance (uint256)`

魏地址余额

`<address>.code（bytes memory）`

地址处的代码（可以为空）

`<address>.codehash (bytes32)`

地址的代码哈希

`<address payable>.transfer(uint256 amount)`

将给定数量的 Wei 发送到地址，失败时恢复，转发 2300 气体津贴，不可调整

`<address payable>.send(uint256 amount) returns (bool)`

发送给定数量的 Wei 到地址，失败返回 false，转发 2300 gas 津贴，不可调整

`<address>.call(bytes memory) returns (bool, bytes memory)`

使用给定的payload发出低级CALL，返回成功条件和返回数据，转发所有可用gas，可调

`<address>.delegatecall(bytes memory) returns (bool, bytes memory)`

使用给定的payload发出低级DELEGATECALL，返回成功条件和返回数据，转发所有可用gas，可调

`<address>.staticcall(bytes memory) returns (bool, bytes memory)`

使用给定的有效载荷发出低级 STATICCALL，返回成功条件和返回数据，转发所有可用的 gas，可调

有关详细信息，请参阅地址部分。

## 合同相关

- this (current contract’s type)

当前合约，可显式转换为地址

- selfdestruct(address payable recipient)

销毁当前合约，将其资金发送到给定地址并结束执行。 

注意 selfdestruct 有一些继承自 EVM 的特性：

接收合约的接收函数没有被执行。

合约只有在交易结束时才真正被销毁，而 revert 可能会“撤消”销毁。

此外，当前合约的所有函数都可以直接调用，包括当前函数。

笔记

在 0.5.0 版本之前，有一个名为自杀的函数，其语义与 selfdestruct 相同。

## 类型信息

表达式 type(X) 可用于检索有关类型 X 的信息。

目前，对该功能的支持有限（X 可以是合同或整数类型），但将来可能会扩展。

以下属性可用于合同类型 C：

- type(C).name

合同的名称。

- type(C).creationCode

包含合约创建字节码的内存字节数组。

这可以在内联汇编中用于构建自定义创建例程，尤其是通过使用 create2 操作码。此属性不能在合约本身或任何派生合约中访问。它导致字节码包含在调用站点的字节码中，因此不可能进行这样的循环引用。

- type(C).runtimeCode

包含合约运行时字节码的内存字节数组。

这是通常由 C 的构造函数部署的代码。

如果 C 有使用内联汇编的构造函数，这可能与实际部署的字节码不同。

另请注意，库在部署时会修改其运行时字节码以防止常规调用。

与 .creationCode 相同的限制也适用于此属性。

除了上述属性之外，接口类型 I 还可以使用以下属性：

- type(I).interfaceId:

包含给定接口 I 的 EIP-165 接口标识符的 bytes4 值。此标识符定义为接口本身内定义的所有函数选择器的 XOR - 不包括所有继承的函数。

以下属性可用于整数类型 T：

- type(T).min

类型 T 可表示的最小值。

- type(T).max

类型 T 可表示的最大值。

# 参考资料

https://docs.soliditylang.org/en/latest/units-and-global-variables.html

* any list
{:toc}