---
layout: post
title:  Solidity-10-types Value Types
date:  2022-05-22 09:22:02 +0800
categories: [Lang]
tags: [lang, solidity, sh]
published: true
---

# Types

Solidity 是一种静态类型语言，这意味着需要指定每个变量（状态和本地）的类型。 

Solidity 提供了几种基本类型，它们可以组合成复杂类型。

此外，类型可以在包含运算符的表达式中相互交互。 

有关各种运算符的快速参考，请参阅运算符的优先顺序。

Solidity 中不存在“未定义”或“空”值的概念，但新声明的变量始终具有取决于其类型的默认值。 

要处理任何意外值，您应该使用 revert 函数来恢复整个事务，或者返回一个带有第二个 bool 值表示成功的元组。

# 值类型

以下类型也称为值类型，因为这些类型的变量总是按值传递，即当它们用作函数参数或赋值时，它们总是被复制。

# 布尔值

bool：可能的值是常量 true 和 false。

Operators: 

`!` （逻辑否定）

&&（逻辑连接，“和”）

|| （逻辑析取，“或”）

==（平等）

`!=`（不等式）

# 整数

int / uint：各种大小的有符号和无符号整数。 

关键字 uint8 到 uint256，步长为 8（无符号 8 到 256 位）和 int8 到 int256。 uint 和 int 分别是 uint256 和 int256 的别名。

Operators: 

比较：<=、<、==、!=、>=、>（计算为布尔值）

位运算符：&、|、^（按位异或）、~（按位否定）

移位运算符：<<（左移）、>>（右移）

算术运算符：+、-、一元 -（仅适用于有符号整数）、*、/、%（取模）、**（取幂）

对于整数类型 X，您可以使用 `type(X).min` 和 `type(X).max` 来访问该类型可表示的最小值和最大值。

- warning

Solidity 中的整数被限制在一定范围内。 

例如，对于 uint32，这是 0 到 `2^32 - 1`。

对这些类型执行算术运算有两种模式：“包装”或“未检查”模式和“已检查”模式。 

默认情况下，算术始终是“检查”的，这意味着如果操作的结果超出类型的值范围，则调用将通过失败的断言恢复。 

您可以使用 unchecked { ... } 切换到“unchecked”模式。 

更多细节可以在关于未选中的部分中找到。

## 比较

比较的值是通过比较整数值获得的值。

## 位运算

对数字的二进制补码表示执行位运算。 这意味着，例如 ~int256(0) == int256(-1)。

## Shifts

移位操作的结果具有左操作数的类型，截断结果以匹配类型。 右操作数必须是无符号类型，尝试按有符号类型移位会产生编译错误。

可以通过以下方式使用乘以 2 的幂来“模拟”移位。 请注意，对左操作数类型的截断总是在最后执行，但没有明确提及。

x << y 等价于数学表达式 x * 2^y。

x >> y 等价于数学表达式 x / 2^y，向负无穷方向舍入。

在 0.5.0 版之前，负 x 的右移 x >> y 等价于向零舍入的数学表达式 x / 2^y，即使用向上舍入（向零）而不是向下舍入（向负无穷大） ）。

- NOTE

移位操作永远不会像算术运算那样执行溢出检查。 

相反，结果总是被截断。

## 加法、减法和乘法

加法、减法和乘法具有通常的语义，在上溢和下溢方面有两种不同的模式：

默认情况下，检查所有算术是否不足或溢出，但可以使用未检查块禁用此功能，从而导致算术包装。可以在该部分中找到更多详细信息。

表达式 -x 等价于 (T(0) - x)，其中 T 是 x 的类型。它只能应用于签名类型。如果 x 为负，-x 的值可以为正。二进制补码表示还有另一个警告：

如果你有 int x = type(int).min;，那么 -x 不适合正数范围。

这意味着未经检查的 { assert(-x == x); } 有效，并且在检查模式下使用表达式 -x 将导致断言失败。

## Division

由于运算结果的类型始终是操作数之一的类型，因此整数除法始终产生整数。

在 Solidity 中，除法向零舍入。

这意味着 int256(-5) / int256(2) == int256(-2)。

请注意，相比之下，文字除法会产生任意精度的小数值。

- NOTE

除以零会导致恐慌错误。 无法通过未选中的 { ... } 禁用此检查。

- NOTE

表达式 type(int).min / (-1) 是除法导致溢出的唯一情况。 

在检查算术模式下，这将导致断言失败，而在包装模式下，该值将是 type(int).min。

## Modulo 模

模运算 a % n 得到操作数 a 除以操作数 n 后的余数 r，其中 q = int(a / n) 且 r = a - (n * q)。 

这意味着模运算的结果与其左操作数（或零）相同，并且 a % n == -(-a % n) 对负 a 成立：

```
int256(5) % int256(2) == int256(1)

int256(5) % int256(-2) == int256(1)

int256(-5) % int256(2) == int256(-1)

int256(-5) % int256(-2) == int256(-1)
```

- NOTE

带零的模会导致紧急错误。 无法通过未选中的 { ... } 禁用此检查。

## 幂运算 Exponentiation

求幂仅适用于指数中的无符号类型。 

求幂的结果类型始终等于基数的类型。 请注意它足够大以容纳结果并为潜在的断言失败或包装行为做好准备。

- NOTE

在检查模式下，求幂只对小基数使用相对便宜的 exp 操作码。 对于 `x^3` 的情况，表达式 `x*x*x` 可能更便宜。 在任何情况下，gas 成本测试和优化器的使用都是可取的。

- NOTE

请注意，EVM 将 `0^0` 定义为 1。

# 定点数 Fixed Point Numbers

- 警告

Solidity 还不完全支持定点数。 

它们可以被声明，但不能被分配给或来自。

fixed / ufixed：各种大小的有符号和无符号定点数。 

关键字 ufixedMxN 和 fixedMxN，其中 M 表示该类型占用的位数，N 表示有多少个小数点可用。 

M 必须能被 8 整除，并且从 8 位变为 256 位。 

N 必须介于 0 和 80 之间，包括 0 和 80。 

ufixed 和 fixed 分别是 ufixed128x18 和 fixed128x18 的别名。

- Operators:

比较：<=、<、==、!=、>=、>（计算为布尔值）

算术运算符：+、-、一元 -、*、/、%（取模）

- NOTE

浮点数（许多语言中的浮点数和双精度数，更准确地说是 IEEE 754 数字）和定点数之间的主要区别在于，用于整数和小数部分（小数点后的部分）的位数在 前者，而后者严格定义。 

通常，在浮点中，几乎整个空间都用于表示数字，而只有少数位定义了小数点的位置。

# 地址 Address

地址类型有两种风格，它们基本相同：

地址：保存一个 20 字节的值（以太坊地址的大小）。

应付地址：与地址相同，但与附加成员转移和发送。

这种区别背后的想法是，应付地址是您可以将 Ether 发送到的地址，而您不应该将 Ether 发送到普通地址，例如，因为它可能是不是为接受 Ether 而构建的智能合约。

类型转换：

允许从地址到地址的隐式转换，而从地址到地址的转换必须通过 `payable(<address>)` 显式转换。

对于 uint160、整数文字、bytes20 和合约类型，允许与地址进行显式转换。

只有类型地址和合约类型的表达式可以通过显式转换payable(...)转换为类型地址payable。

对于合约类型，仅当合约可以接收以太币时才允许这种转换，即合约具有接收或应付回退功能。

请注意，payable(0) 是有效的，并且是该规则的一个例外。

- 笔记

如果您需要地址类型的变量并计划向其发送 Ether，则将其类型声明为地址支付以使此要求可见。 

另外，请尝试尽早进行这种区分或转换。

## 操作符

<=, <, ==, !=, >= and >

- WARN 

如果将使用较大字节大小的类型转换为地址，例如 bytes32，则地址将被截断。 

为了减少转换歧义，版本 0.4.24 及更高版本的编译器强制您在转换中显式截断。 

以 32 字节值 0x111122223333444455556666777788889999AAAABBBBCCCCDDDDEEEEFFFFCCCC 为例。

可以使用address(uint160(bytes20(b)))，结果为0x111122223333444455556666777788889999aAaa，也可以使用address(uint160(uint256(b)))，结果为0x777788889999AaAAbBbbCcccddDdeeeEfFFfc

- 笔记

0.5.0 版引入了地址和应付地址之间的区别。 

同样从该版本开始，合约不是从地址类型派生的，但如果它们具有接收或应付回退功能，则仍可以显式转换为地址或应付地址。

## 地址成员 Members of Addresses

有关地址的所有成员的快速参考，请参阅地址类型的成员。

### balance and transfer 余额和转账

可以使用属性 balance 查询地址的余额，并使用 transfer 函数将 Ether（以 wei 为单位）发送到应付地址：

```js
address payable x = payable(0x123);
address myAddress = address(this);
if (x.balance < 10 && myAddress.balance >= 10) x.transfer(10);
```

如果当前合约的余额不够大或者以太币转账被接收账户拒绝，转账功能就会失败。 

传递函数在失败时恢复。

如果 x 是一个合约地址，它的代码（更具体地说：它的 Receive Ether Function，如果存在，或者它的 Fallback Function，如果存在）将与 transfer call 一起执行（这是 EVM 的一个特性，无法阻止） ）。 

如果该执行用完 gas 或以任何方式失败，则 Ether 转移将被恢复，当前合约将异常停止。

### send 发送

发送是 transfer 的低级对应物。 

如果执行失败，当前合约不会异常停止，但 send 会返回 false。

- WARN

使用 send 存在一些危险：如果调用堆栈深度为 1024，则传输失败（这总是由调用者强制执行的），如果接收者耗尽 gas，传输也会失败。 

因此，为了进行安全的 Ether 转账，请始终检查 send 的返回值，使用 transfer 甚至更好：使用收款人取款的模式。

### 调用、委托调用和静态调用 call, delegatecall and staticcall

为了与不遵守 ABI 的合约进行交互，或者为了更直接地控制编码，提供了函数调用、委托调用和静态调用。 

它们都采用单个字节内存参数并返回成功条件（作为布尔值）和返回的数据（字节内存）。 

函数 abi.encode、abi.encodePacked、abi.encodeWithSelector 和 abi.encodeWithSignature 可用于对结构化数据进行编码。

例子：

```js
bytes memory payload = abi.encodeWithSignature("register(string)", "MyName");
(bool success, bytes memory returnData) = address(nameReg).call(payload);
require(success);
```

- WARN

所有这些函数都是低级函数，应该小心使用。 

具体来说，任何未知的合约都可能是恶意的，如果您调用它，您会将控制权移交给该合约，该合约可能会反过来回调您的合约，因此请准备好在调用返回时更改您的状态变量。 

与其他合约交互的常规方式是调用合约对象 (x.f()) 上的函数。

- NOTE

以前版本的 Solidity 允许这些函数接收任意参数，并且还会以不同的方式处理 bytes4 类型的第一个参数。 

这些边缘情况在 0.5.0 版中被删除。

可以使用气体调节器调整供应的 gas：

```js
address(nameReg).call{gas: 1000000}(abi.encodeWithSignature("register(string)", "MyName"));
```

同样，也可以控制提供的 Ether 值：

```js
address(nameReg).call{value: 1 ether}(abi.encodeWithSignature("register(string)", "MyName"));
```

最后，可以组合这些修饰符。 

他们的顺序无关紧要：

```js
address(nameReg).call{gas: 1000000, value: 1 ether}(abi.encodeWithSignature("register(string)", "MyName"));
```

以类似的方式，可以使用函数delegatecall：不同之处在于只使用给定地址的代码，所有其他方面（存储，余额，......）都取自当前合约。 

delegatecall 的目的是使用存储在另一个合约中的库代码。 

用户必须确保两个合约中的存储布局都适合使用委托调用。

- NOTE

在 homestead 之前，只有一个称为 callcode 的有限变体可用，它不提供对原始 msg.sender 和 msg.value 值的访问。 

此功能已在 0.5.0 版中删除。

由于也可以使用拜占庭静态调用。 

这与调用基本相同，但如果被调用函数以任何方式修改状态，则会恢复。

所有三个函数 call、delegatecall 和 staticcall 都是非常低级的函数，只能作为最后的手段使用，因为它们破坏了 Solidity 的类型安全。

gas 选项适用于所有三种方法，而 value 选项仅在调用时可用。

- NOTE

最好避免在智能合约代码中依赖硬编码的 gas 值，无论状态是读取还是写入，因为这可能有很多陷阱。 

此外，未来 gas 的获取可能会发生变化。

### code and codehash

您可以查询任何智能合约的部署代码。 

使用 .code 将 EVM 字节码作为字节内存获取，该内存可能为空。 

使用 .codehash 获取该代码的 Keccak-256 哈希（作为 bytes32）。 

请注意，addr.codehash 比使用 keccak256(addr.code) 便宜。

- NOTE

所有合约都可以转换为地址类型，因此可以使用address(this).balance查询当前合约的余额。

# 合约类型

每个合约都定义了自己的类型。 

您可以将合约隐式转换为它们继承的合约。

合约可以显式转换为地址类型或从地址类型转换。

仅当合约类型具有接收或应付回退功能时，才能显式转换到地址应付类型。 

转换仍然使用 address(x) 执行。 

如果合约类型没有接收或应付回退功能，则可以使用payable(address(x)) 转换为应付地址。 

您可以在有关地址类型的部分中找到更多信息。

- NOTE

在 0.5.0 版本之前，合约直接从地址类型派生，没有地址和应付地址的区别。

如果您声明一个合约类型的局部变量 (MyContract c)，您可以调用该合约上的函数。 请注意从相同合同类型的某个地方分配它。

您还可以实例化合约（这意味着它们是新创建的）。 您可以在“新合同”部分找到更多详细信息。

合约的数据表示与地址类型的数据表示相同，并且这种类型也用于 ABI。

合约不支持任何运算符。

合约类型的成员是合约的外部函数，包括任何标记为公共的状态变量。

对于合同 C，您可以使用 type(C) 访问有关合同的类型信息。

# 固定大小的字节数组

值类型 bytes1、bytes2、bytes3、...、bytes32 包含从 1 到最多 32 个字节的序列。

Operators:

比较：<=、<、==、!=、>=、>（计算为布尔值）

位运算符：&、|、^（按位异或）、~（按位否定）

移位运算符：<<（左移）、>>（右移）

索引访问：如果 x 是 bytesI 类型，则 `x[k] for 0 <= k < I` 返回第 k 个字节（只读）。

移位运算符使用无符号整数类型作为右操作数（但返回左操作数的类型），它表示要移位的位数。 

按有符号类型移位会产生编译错误。

## 成员：

.length 产生字节数组的固定长度（只读）。

- NOTE 

bytes1[] 类型是一个字节数组，但是由于填充规则，它为每个元素浪费了 31 个字节的空间（存储空间除外）。 最好使用 bytes 类型。

- NOTE 

在 0.8.0 版本之前，byte 曾经是 bytes1 的别名。

# 动态大小的字节数组 

bytes:

动态大小的字节数组，请参阅数组。 不是 value-type 

string:

动态大小的 UTF-8 编码字符串，请参阅数组。 不是 value-type 

# 地址文字 Address Literals

通过地址校验和测试的十六进制文字，例如 0xdCad3a6d3569DF655070DEd06cb7A1b2Ccd1D3AF 属于地址类型。 

长度在 39 到 41 位之间且未通过校验和测试的十六进制文字会产生错误。 

您可以预先（对于整数类型）或附加（对于 bytesNN 类型）零来消除错误。

- NOTE

混合大小写地址校验和格式在 EIP-55 中定义。

# 有理数和整数文字 Rational and Integer Literals

整数文字由 0-9 范围内的数字序列组成。它们被解释为小数。例如，69 表示六十九。 

Solidity 中不存在八进制文字，前导零无效。

十进制小数文字由 a 组成。一侧至少有一个数字。示例包括 1.、.1 和 1.3。

还支持 2e10 形式的科学记数法，其中尾数可以是小数，但指数必须是整数。

文字 MeE 等价于 `M * 10**E`。示例包括 2e10、-2e10、2e-10、2.5e1。

下划线可用于分隔数字文字的数字以提高可读性。

例如十进制 123_000、十六进制 0x2eff_abde、科学十进制 1_2e345_678 都是有效的。下划线只允许在两位数之间，并且只允许一个连续的下划线。包含下划线的数字文字没有添加额外的语义含义，下划线被忽略。

数字文字表达式保持任意精度，直到它们被转换为非文字类型（即，通过将它们与数字文字表达式（如布尔文字）以外的任何内容一起使用或通过显式转换）。这意味着计算不会溢出，除法不会在数字文字表达式中截断。

例如，`(2**800 + 1) - 2**800` 产生常量 1（类型为 uint8），尽管中间结果甚至不适合机器字长。

此外，`0.5 * 8` 会产生整数 4（尽管在两者之间使用了非整数）。

- WARN

虽然大多数运算符在应用于文字时都会产生文字表达式，但有些运算符不遵循此模式：

三元运算符 (... ? ... : ...),

数组下标 (`<array>[<index>]`)。

您可能期望像 `255 + (true ? 1 : 0)` 或 `255 + [1, 2, 3][0]` 这样的表达式等同于直接使用文字 256，但实际上它们是在 uint8 类型内计算的并且可能溢出 .

只要操作数是整数，任何可以应用于整数的运算符也可以应用于数字文字表达式。 

如果两者中的任何一个是小数，则不允许位运算，并且如果指数是小数，则不允许取幂（因为这可能导致非有理数）。

将文字数字作为左（或基）操作数和整数类型作为右（指数）操作数的移位和取幂始终在 uint256（对于非负文字）或 int256（对于负文字）类型中执行，无论类型如何 右（指数）操作数。

- WARN

在 0.4.0 版本之前的 Solidity 中，整数文字的除法用于截断，但现在它转换为有理数，即 5 / 2 不等于 2，而是等于 2.5。

- NOTE

Solidity 对每个有理数都有一个数字文字类型。 

整数文字和有理数文字属于数字文字类型。 

此外，所有数字文字表达式（即仅包含数字文字和运算符的表达式）都属于数字文字类型。 

所以数字文字表达式 1 + 2 和 2 + 1 都属于有理数 3 的相同数字文字类型。

- NOTE

数字文字表达式在与非文字表达式一起使用时立即转换为非文字类型。 

不考虑类型，分配给下面 b 的表达式的值计算为整数。 

因为 a 是 uint128 类型，但表达式 2.5 + a 必须具有正确的类型。 

由于 2.5 和 uint128 的类型没有通用类型，因此 Solidity 编译器不接受此代码。

```
uint128 a = 1;
uint128 b = 2.5 + a + 0.5;
```

# 字符串文字和类型 String Literals and Types


字符串文字用双引号或单引号（“foo”或“bar”）编写，它们也可以分成多个连续的部分（“foo”“bar”相当于“foobar”），这在以下情况下会很有帮助 处理长字符串。 

它们并不意味着 C 中的尾随零； “foo”代表三个字节，而不是四个。 

与整数文字一样，它们的类型可以变化，但它们可以隐式转换为 bytes1、...、bytes32（如果它们适合），也可以转换为字节和字符串。

例如，对于 bytes32 samevar = "stringliteral"，当分配给 bytes32 类型时，字符串文字会以其原始字节形式进行解释。

字符串文字只能包含可打印的 ASCII 字符，即 0x20 .. 0x7E 之间的字符。

此外，字符串文字还支持以下转义字符

```
\<newline> (escapes an actual newline)

\\ (backslash)

\' (single quote)

\" (double quote)

\n (newline)

\r (carriage return)

\t (tab)

\xNN (hex escape, see below)

\uNNNN (unicode escape, see below)
```

\xNN 采用十六进制值并插入适当的字节，而 \uNNNN 采用 Unicode 代码点并插入 UTF-8 序列。

- NOTE

在 0.8.0 版之前，还有三个额外的转义序列：\b、\f 和 \v。 它们通常以其他语言提供，但在实践中很少需要。 

如果您确实需要它们，它们仍然可以通过十六进制转义符插入，即分别为 \x08、\x0c 和 \x0b，就像任何其他 ASCII 字符一样。

以下示例中的字符串长度为 10 个字节。 它以换行字节开头，后跟双引号，单引号和反斜杠字符，然后（不带分隔符）字符序列 abcdef。

```
"\n\"\'\\abc\
def"
```

任何不是换行符的 Unicode 行终止符（即 LF、VF、FF、CR、NEL、LS、PS）都被视为终止字符串文字。 

换行符仅在字符串文字前面没有 `\` 时才终止。

# Unicode 文字

虽然常规字符串文字只能包含 ASCII，但 Unicode 文字（以关键字 unicode 为前缀）可以包含任何有效的 UTF-8 序列。 它们还支持与常规字符串文字完全相同的转义序列。

```js
string memory a = unicode"Hello 😃";
```

# 十六进制文字 Hexadecimal Literals

十六进制文字以关键字 hex 为前缀，并用双引号或单引号括起来 (hex"001122FF", hex'0011_22_FF')。 

它们的内容必须是十六进制数字，可以选择使用单个下划线作为字节边界之间的分隔符。 

文字的值将是十六进制序列的二进制表示。

由空格分隔的多个十六进制文字连接成一个文字： hex"00112233" hex"44556677" 等价于 hex"0011223344556677"

十六进制文字的行为类似于字符串文字，并且具有相同的可转换性限制。

# 枚举

枚举是在 Solidity 中创建用户定义类型的一种方式。 

它们可以显式转换为所有整数类型，但不允许隐式转换。 

整数的显式转换在运行时检查该值是否在枚举范围内，否则会导致 Panic 错误。 

枚举至少需要一个成员，声明时它的默认值是第一个成员。 枚举不能有超过 256 个成员。

数据表示与 C 中的枚举相同：选项由从 0 开始的后续无符号整数值表示。

使用 type(NameOfEnum).min 和 type(NameOfEnum).max 你可以获得给定枚举的最小值和最大值。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.8;

contract test {
    enum ActionChoices { GoLeft, GoRight, GoStraight, SitStill }
    ActionChoices choice;
    ActionChoices constant defaultChoice = ActionChoices.GoStraight;

    function setGoStraight() public {
        choice = ActionChoices.GoStraight;
    }

    // Since enum types are not part of the ABI, the signature of "getChoice"
    // will automatically be changed to "getChoice() returns (uint8)"
    // for all matters external to Solidity.
    function getChoice() public view returns (ActionChoices) {
        return choice;
    }

    function getDefaultChoice() public pure returns (uint) {
        return uint(defaultChoice);
    }

    function getLargestValue() public pure returns (ActionChoices) {
        return type(ActionChoices).max;
    }

    function getSmallestValue() public pure returns (ActionChoices) {
        return type(ActionChoices).min;
    }
}
```

- NOTE

枚举也可以在文件级别声明，在合约或库定义之外。

# 用户定义值类型

用户定义的值类型允许在基本值类型上创建零成本抽象。这类似于别名，但具有更严格的类型要求。

用户定义的值类型使用类型 C 定义为 V，其中 C 是新引入类型的名称，V 必须是内置值类型（“基础类型”）。

函数 C.wrap 用于从底层类型转换为自定义类型。类似地，函数 C.unwrap 用于将自定义类型转换为底层类型。

C 类型没有任何运算符或绑定的成员函数。特别是，即使是运算符 == 也没有定义。不允许与其他类型进行显式和隐式转换。

这种类型的值的数据表示是从底层类型继承的，底层类型也在 ABI 中使用。

以下示例说明了一个自定义类型 UFixed256x18，它表示具有 18 个小数的十进制定点类型和一个用于对该类型进行算术运算的最小库。

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.8;

// Represent a 18 decimal, 256 bit wide fixed point type using a user defined value type.
type UFixed256x18 is uint256;

/// A minimal library to do fixed point operations on UFixed256x18.
library FixedMath {
    uint constant multiplier = 10**18;

    /// Adds two UFixed256x18 numbers. Reverts on overflow, relying on checked
    /// arithmetic on uint256.
    function add(UFixed256x18 a, UFixed256x18 b) internal pure returns (UFixed256x18) {
        return UFixed256x18.wrap(UFixed256x18.unwrap(a) + UFixed256x18.unwrap(b));
    }
    /// Multiplies UFixed256x18 and uint256. Reverts on overflow, relying on checked
    /// arithmetic on uint256.
    function mul(UFixed256x18 a, uint256 b) internal pure returns (UFixed256x18) {
        return UFixed256x18.wrap(UFixed256x18.unwrap(a) * b);
    }
    /// Take the floor of a UFixed256x18 number.
    /// @return the largest integer that does not exceed `a`.
    function floor(UFixed256x18 a) internal pure returns (uint256) {
        return UFixed256x18.unwrap(a) / multiplier;
    }
    /// Turns a uint256 into a UFixed256x18 of the same value.
    /// Reverts if the integer is too large.
    function toUFixed256x18(uint256 a) internal pure returns (UFixed256x18) {
        return UFixed256x18.wrap(a * multiplier);
    }
}
```

请注意 UFixed256x18.wrap 和 FixedMath.toUFixed256x18 如何具有相同的签名，但执行两个非常不同的操作： 

UFixed256x18.wrap 函数返回一个与输入具有相同数据表示的 UFixed256x18，而 toUFixed256x18 返回一个具有相同数值的 UFixed256x18。

# 函数类型

函数类型是函数的类型。 

函数类型的变量可以从函数中赋值，函数类型的函数参数可以用来传递函数到函数调用和从函数调用返回函数。 

函数类型有两种形式——内部函数和外部函数：

内部函数只能在当前合约内部调用（更具体地说，在当前代码单元内部，还包括内部库函数和继承函数），因为它们不能在当前合约上下文之外执行。 

调用内部函数是通过跳转到它的入口标签来实现的，就像在内部调用当前合约的函数一样。

外部函数由地址和函数签名组成，它们可以通过外部函数调用传递和返回。

函数类型表示如下：

```js
function (<parameter types>) {internal|external} [pure|view|payable] [returns (<return types>)]
```

与参数类型相比，返回类型不能为空 - 如果函数类型不应该返回任何内容，则必须省略整个返回 (<return types>) 部分。

默认情况下，函数类型是内部的，因此可以省略 internal 关键字。请注意，这仅适用于函数类型。必须为合约中定义的函数明确指定可见性，它们没有默认值。

转换：

当且仅当函数类型 A 的参数类型相同、返回类型相同、内部/外部属性相同且 A 的状态可变性比 B 的状态可变性更具限制性时，函数类型 A 才能隐式转换为函数类型 B 。 

尤其是：

纯函数可以转换为视图和非付费函数

视图函数可以转换为非付费函数

应付函数可以转换为非应付函数

函数类型之间没有其他转换是可能的。

关于应付和不应付的规则可能有点混乱，但本质上，如果一个函数是应付的，这意味着它也接受零 Ether 的支付，所以它也是不应付的。另一方面，非支付函数将拒绝发送给它的以太币，因此非支付函数不能转换为支付函数。

如果函数类型变量未初始化，调用它会导致 Panic 错误。如果在对函数使用 delete 后调用函数，也会发生同样的情况。

如果在 Solidity 的上下文之外使用外部函数类型，它们将被视为函数类型，它将地址和函数标识符一起编码为单个 bytes24 类型。

请注意，当前合约的公共功能既可以用作内部功能，也可以用作外部功能。要将 f 用作内部函数，只需使用 f，如果要使用其外部形式，请使用 this.f。

内部类型的函数可以分配给内部函数类型的变量，而不管它是在哪里定义的。这包括合约和库的私有、内部和公共功能以及免费功能。

另一方面，外部函数类型仅与公共和外部合约函数兼容。库被排除在外，因为它们需要委托调用并为其选择器使用不同的 ABI 约定。

接口中声明的函数没有定义，因此指向它们也没有意义。

## 成员：

外部（或公共）函数具有以下成员：

.address 返回函数合约的地址。

.selector 返回 ABI 函数选择器

- 笔记

外部（或公共）函数曾经有额外的成员 .gas(uint) 和 .value(uint)。 这些在 Solidity 0.6.2 中已弃用，并在 Solidity 0.7.0 中删除。 

而是使用 {gas: ...} 和 {value: ...} 分别指定发送给函数的 gas 量或 wei 量。 

有关详细信息，请参阅外部函数调用。

显示如何使用成员的示例：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.4 <0.9.0;

contract Example {
    function f() public payable returns (bytes4) {
        assert(this.f.address == address(this));
        return this.f.selector;
    }

    function g() public {
        this.f{gas: 10, value: 800}();
    }
}
```

显示如何使用内部函数类型的示例：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

library ArrayUtils {
    // internal functions can be used in internal library functions because
    // they will be part of the same code context
    function map(uint[] memory self, function (uint) pure returns (uint) f)
        internal
        pure
        returns (uint[] memory r)
    {
        r = new uint[](self.length);
        for (uint i = 0; i < self.length; i++) {
            r[i] = f(self[i]);
        }
    }

    function reduce(
        uint[] memory self,
        function (uint, uint) pure returns (uint) f
    )
        internal
        pure
        returns (uint r)
    {
        r = self[0];
        for (uint i = 1; i < self.length; i++) {
            r = f(r, self[i]);
        }
    }

    function range(uint length) internal pure returns (uint[] memory r) {
        r = new uint[](length);
        for (uint i = 0; i < r.length; i++) {
            r[i] = i;
        }
    }
}


contract Pyramid {
    using ArrayUtils for *;

    function pyramid(uint l) public pure returns (uint) {
        return ArrayUtils.range(l).map(square).reduce(sum);
    }

    function square(uint x) internal pure returns (uint) {
        return x * x;
    }

    function sum(uint x, uint y) internal pure returns (uint) {
        return x + y;
    }
}
```

另一个使用外部函数类型的例子：

```js
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.9.0;


contract Oracle {
    struct Request {
        bytes data;
        function(uint) external callback;
    }

    Request[] private requests;
    event NewRequest(uint);

    function query(bytes memory data, function(uint) external callback) public {
        requests.push(Request(data, callback));
        emit NewRequest(requests.length - 1);
    }

    function reply(uint requestID, uint response) public {
        // Here goes the check that the reply comes from a trusted source
        requests[requestID].callback(response);
    }
}


contract OracleUser {
    Oracle constant private ORACLE_CONST = Oracle(address(0x00000000219ab540356cBB839Cbe05303d7705Fa)); // known contract
    uint private exchangeRate;

    function buySomething() public {
        ORACLE_CONST.query("USD", this.oracleResponse);
    }

    function oracleResponse(uint response) public {
        require(
            msg.sender == address(ORACLE_CONST),
            "Only oracle can call this."
        );
        exchangeRate = response;
    }
}
```


# 参考资料

https://docs.soliditylang.org/en/latest/types.html

* any list
{:toc}