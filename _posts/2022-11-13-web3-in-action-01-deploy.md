---
layout: post 
title: web3 学习实战笔记-01-部署第一个智能合约 & 使用事件记录智能合约中的数据
date: 2022-10-28 21:01:55 +0800
categories: [web3] 
tags: [web3, dev, ethereum, sh]
published: true
---

# 编写合约

第一步访问 [Remix](https://remix.ethereum.org/) 并创建一个新文件。 

在 Remix 界面的左上角添加一个新文件，并输入所需的文件名。

![create file](https://img-blog.csdnimg.cn/b1c74624e7e1414a9e57d20bcc908c91.png#pic_center)

## 编写合约

我们新建一个文件，名称为 first.sol

内容如下：

```js
// SPDX-License-Identifier: MIT
pragma solidity >=0.5.17;

contract Counter {

    // Public variable of type unsigned int to keep the number of counts
    uint256 public count = 0;

    // Function that increments our counter
    function increment() public {
        count += 1;
    }

    // Not necessary getter to get the count value
    function getCount() public view returns (uint256) {
        return count;
    }

}
```

如果您曾经写过程序，应该可以轻松猜到这个程序是做什么的。 下面按行解释：

第 3 行：定义了一个名为Counter的合约。

第 6 行：我们的合约存储了一个无符号整型count，从 0 开始。

第 9 行：第一个函数将修改合约的状态并且increment()变量 count。

第 14 行，第二个函数是一个 getter 函数，能够从智能合约外部读取count变量的值。 

请注意，因为我们将count变量定义为公共变量，所以这个函数是不必要的，但它可以作为一个例子展示。

第一个简单的智能合约到此结束。 正如您所知，它看上去像是 Java、C++这样的面向对象编程语言中的一个类。 现在可以运行我们的合约了。

# 部署合约

当我们写了第一个智能合约后，我们现在可以将它部署在区块链中并运行它。

在区块链上部署智能合约实际上只是发送了一个包含已编译智能合约代码的交易，并且没有指定任何收件人。

## 编译合约

我们首先点击左侧的编译图标来编译合约：

![编译合约](https://ethereum.org/static/6fd0898b122d5126282251a22247319c/39d76/remix-compile-button.png)

然后点击编译按钮：

![编译按钮](https://ethereum.org/static/b880ab53901e8bcd64a7e0af42ec5dd4/a2d48/remix-compile.png)

您可以选择“Auto compile”选项，这样在将合约内容保存到文本编辑器时合约也随之编译。

## 部署

然后切换到部署和运行交易屏幕：

![部署](https://ethereum.org/static/4c224fed8caab2d19cd6d021e674f598/9fc4b/remix-deploy.png)

在“部署和运行交易”屏幕上，仔细检查显示的合约名称并点击“部署”。 

正如您在页面顶部所见，当前环境是“JavaScript 虚拟机”，这意味着我们将在本地测试区块链上部署我们的智能合约并与之交互，以便能够更快地进行测试且无须支付任何费用。

![部署](https://ethereum.org/static/f42cf3639030e0c2b1f7c64144ae1403/99f37/remix-deploy-button.png)

点击“部署”按钮后，您可以看到合约在底部显示出来。 

点击左侧的箭头展开，可以看到合约的内容。 

这里有我们的变量counter、函数increment()和 getter getCounter()。

如果您点击count或getCount按钮，它将实际检索合约的count变量的内容，并显示出来。 

因为我们尚未调用increment函数，它应该显示 0。

## 测试

现在点击按钮来调用increment函数。 您可以在窗口底部看到交易产生的日志。 当按下检索数据按钮而非increment按钮时，您看到的日志有所不同。 

这是因为读取区块链的数据不需要任何交易（写入）或费用。 因为只有修改区块链的状态需要进行交易。

```
[vm]from: 0x5B3...eddC4to: Counter.(constructor)value: 0 weidata: 0x608...70033logs: 0hash: 0xaf4...d29a5
transact to Counter.increment pending ... 
[vm]from: 0x5B3...eddC4to: Counter.increment() 0xd91...39138value: 0 weidata: 0xd09...de08alogs: 0hash: 0xeb6...d68a8
call to Counter.getCount
CALL
[call]from: 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4to: Counter.getCount()data: 0xa87...d942c
call to Counter.getCount
CALL
[call]from: 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4to: Counter.getCount()data: 0xa87...d942c
transact to Counter.increment pending ... 
[vm]from: 0x5B3...eddC4to: Counter.increment() 0xd91...39138value: 0 weidata: 0xd09...de08alogs: 0hash: 0x167...34bce
call to Counter.getCount
CALL
[call]from: 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4to: Counter.getCount()data: 0xa87...d942c
```

在按下 increment 按钮后，将产生一个交易来调用我们的increment()函数，如果我们点击 count 或 getCount 按钮，将读取我们的智能合约的最新状态，count 变量大于 0。

# 使用事件记录智能合约中的数据

## 说明

在 solidity 中，事件是智能合约可触发的调度信号。 

去中心化应用或其他任何连接到以太坊 JSON-PRC API 的程序，都可以监听这些事件，并执行相应操作。 

可以建立事件的索引，以便稍后可以搜索到事件历史记录。

在撰写这篇文章之时，以太坊区块链上最常见的事件是由 ERC20 代币转账时触发的 Transfer 事件。

```js
event Transfer(address indexed from, address indexed to, uint256 value);
```

事件签名在合约代码内声明，并且可以使用 `emit` 关键字来触发。 

例如，transfer 事件记录了谁发起了转账(from)，转账给谁(to)，以及转账的代币数转账(value)。

## 合约编写

我们再次回到 Counter 智能合约，决定在每次值发生变化时进行记录。 

由于这个合约不是为了部署，而是作为基础，通过扩展来构建另一个合约：因此它被称为抽象合约。 

在我们 counter 示例中，它将类似于如下：

```js
pragma solidity >= 0.5.17;

contract Counter {

    event ValueChanged(uint oldValue, uint256 newValue);

    // Private variable of type unsigned int to keep the number of counts
    uint256 private count = 0;

    // Function that increments our counter
    function increment() public {
        count += 1;
        emit ValueChanged(count - 1, count);
    }

    // Getter to get the count value
    function getCount() public view returns (uint256) {
        return count;
    }

}
```

注意：

第 5 行：我们声明了事件及其包含的内容、旧值以及新值。

第 13 行：当我们增加 count 变量的值时，我们会触发事件。

如果我们现在部署合约并调用 increment 函数，如果您在名为 logs 的数组内单击新交易，我们将看到 Remix 会自动显示它。

ps: 我这里测试没看到到。。

日志在调试智能合约时非常有用，另一方面，如果您构建一个不同人使用的应用，并且使分析更容易跟踪和了解您的智能合约的使用情况，那么日志也是非常重要的手段。 

交易生成的日志会显示常见的区块浏览器中，并且，举例来说，您也可以使用它们来创建链外脚本，用于侦听特定的事件，并且这些事件发生时采取相应操作。

# 参考资料

https://ethereum.org/zh/developers/tutorials/deploying-your-first-smart-contract/#writing-our-contract

https://ethereum.org/zh/developers/tutorials/logging-events-smart-contracts/

* any list
{:toc}