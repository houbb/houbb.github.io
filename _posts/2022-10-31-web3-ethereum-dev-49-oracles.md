---
layout: post 
title: web3 以太坊开发-49-预言机 oracles
date: 2022-10-28 21:01:55 +0800
categories: [web3] 
tags: [web3, dev, ethereum, sh]
published: true
---

# 预言机

预言机是一个数据输入应用程序，它从区块链外部（链外）的数据源获取数据，并输入到区块链（链上），以供智能合约使用。

预言机之所以需要，是**由于在以太坊上运行的智能合约无法访问存储在区块链网络之外的信息**。

赋予智能合约使用链外数据输入的能力，扩展了去中心化应用程序的价值。

例如，去中心化市场预测依靠预言机来提供有关结果的信息，从而可以验证用户的预测。

假设Alice下注20ETH押注谁将成为下一任美国总统，市场预测去中心化应用dapp需要一个预言机来确认选举结果并决定Alice是否有资格获得付款。

# 什么是预言机

预言机是区块链与真实世界之间的桥梁。 

他们充当在链上的应用程序接口，你可以查询以获取信息到你的智能合约。 

可以是任何信息，从价格信息到天气预报。 

预言机可以是双向的，用于向真实世界“发送”数据。

# 为什么需要预言机？

使用以太坊这样的区块链，您需要确保：网络中每个节点都能够重放每个交易，并最终产生同样的结果。 

应用程序接口可能会引入可变数据。 

如果使用价格应用程序接口根据商定的 $USD 值发送以太币，查询将在不同日期返回不同的结果。 

更不用说，应用程序接口可能会被破解或弃用。 

一旦发生这种情况，网络中的节点将不会接受以太坊的当前状态，从而打破共识。

预言机可通过发布数据到区块链来解决这个问题。 以便任何重放交易的节点使用所有人都能看到的相同且不变的数据。 

要做到这一点，预言机通常由一个智能合约和某些可以查询应用程序接口的链下组件组成，然后定期发送交易以更新智能合约的数据。

## Oracle 问题

如前所述，以太坊交易无法直接获取链下数据。 

同时，依靠单一的事实来源提供数据并不安全，会使智能合约的去中心化失效。 

这便是预言机的问题。

我们可以使用去中心化预言机拉取多个数据来源，以避免预言机的问题；如果某个数据源被破解或失效，智能合约仍将按预期运行。

## 安全性

预言机的安全性等同于其数据源。 

如果一个去中心化应用程序使用 Uniswap 作为其以太币/DAI 价格的预言机，攻击者就可以在 Uniswap 上篡改价格，以操纵该去中心化应用程序对当前价格的理解。 

如何对付这个隐患的示例包括一种推送系统，如 MakerDAO 所使用的推送系统。

它会将来自若干外部数据源的价格数据进行比对，而不是仅仅依靠单一来源。

## 架构

这是一个简单预言机架构的示例，但还有更多方法可用来触发链下计算。

- 通过您的智能合约事件发出一份日志

- 一个链下服务已经订阅了（通常使用类似 JSON-RPC eth_subscribe的命令）这些特定的日志。

- 该链下服务会继续做一些日志所定义的任务。

- 链下服务使用智能合约二级交易中要求的数据作出回应。

如此可以 1 对 1 的方式获取数据，但是为了提高安全性，您可能希望对链下数据的收集方式进行去中心化。

下一步可能是建立这些节点的网络，将这些节点调用到不同的应用程序接口和源，并在链上汇总数据。

Chainlink 链下报告 (Chainlink OCR) 让链下预言机网络相互通信、为它们的回应附加加密签名、汇总它们的链下回应，并且仅随结果发送一个交易，以改进这种方法。 

这样可以减少消耗的燃料，但您仍然可以得到去中心化数据的保证，因为每个节点都对其负责的交易进行了签名，使得发送交易的节点无法更改该交易。 

如果节点不进行交易处理，而由下一个节点发送交易，上报规则将会介入。

# 使用方法

使用诸如 Chainlink 等服务，您可以引用链上已经从现实世界中提取并汇总的去中心化数据。 

这有点像公共空间，但仅用于去中心化数据。 

您也可以构建自己的模块化预言机网络来获取您想要的任意自定义数据。 

此外，您可以执行链下运算并向真实世界发送信息。 

Chainlink 已具备相关基础设施，以：

- 在你的合约中获取加密货币价格

- 生成可验证的随机数字（对游戏有用）

- 调用外部应用程序接口 – 一种新颖的用法是 检查 wBTC 储备

以下为如何从智能合约中获取最新以太币价格的示例：

## Chainlink 数据源

```js
pragma solidity ^0.6.7;

import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";

contract PriceConsumerV3 {

    AggregatorV3Interface internal priceFeed;

    /**
     * Network: Kovan
     * Aggregator: ETH/USD
     * Address: 0x9326BFA02ADD2366b30bacB125260Af641031331
     */
    constructor() public {
        priceFeed = AggregatorV3Interface(0x9326BFA02ADD2366b30bacB125260Af641031331);
    }

    /**
     * Returns the latest price
     */
    function getLatestPrice() public view returns (int) {
        (
            uint80 roundID,
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        return price;
    }
}
```

## Chainlink VRF

Chainlink VRF（可验证随机函数）是为智能合约设计的可证明公平性和可验证的随机性来源。 

智能合约开发者可以使用 Chainlink VRF 作为防篡改随机数生成 (RNG)，为依赖不可预测结果的任何应用程序建立可靠的智能合约：

- 区块链游戏和非同质化代币

- 职责和资源的随机分配（例如随机分配审判者审理案件）

- 为共识机制选择一个有代表性的示例

随机数很难，因为区块链是决定性的。

在数据源之外使用 Chainlink 预言机需要遵循使用 Chainlink 的请求和接收周期。 

它们使用 LINK 代币向预言机供应商发送预言机燃料，以获得响应。 

LINK 代币专门设计用于与预言机协同作用，基于升级后的 ERC-677 代币，此代币向后兼容 ERC-20。 

以下代码如果部署到 Kovan 测试网，将获得一个经加密验证的随机数。 

要提出请求，请使用您可以从 Kovan LINK Faucet 获得的测试网 LINK 代币，为合约提供资金。

```js
pragma solidity 0.6.6;

import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

contract RandomNumberConsumer is VRFConsumerBase {

    bytes32 internal keyHash;
    uint256 internal fee;

    uint256 public randomResult;

    /**
     * Constructor inherits VRFConsumerBase
     *
     * Network: Kovan
     * Chainlink VRF Coordinator address: 0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9
     * LINK token address:                0xa36085F69e2889c224210F603D836748e7dC0088
     * Key Hash: 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4
     */
    constructor()
        VRFConsumerBase(
            0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9, // VRF Coordinator
            0xa36085F69e2889c224210F603D836748e7dC0088  // LINK Token
        ) public
    {
        keyHash = 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;
        fee = 0.1 * 10 ** 18; // 0.1 LINK (varies by network)
    }

    /**
     * Requests randomness from a user-provided seed
     */
    function getRandomNumber(uint256 userProvidedSeed) public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
        return requestRandomness(keyHash, fee, userProvidedSeed);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        randomResult = randomness;
    }
}
```

## Chainlink Keeper

智能合约无法在任意时间或任意条件下自动触发或执行。 

只有当另一个帐户（如用户、预言机或合约）发起交易时，才会发生状态变化。 

Chainlink Keeper 网络为智能合约提供了多种选择，以信任最小化和去中心化的方式将常规维护任务外包出去。

要使用 Chainlink Keeper，智能合约必须执行 KeeperCompatibleInterface，它由两个函数组成：

checkUpkeep - 检查合约是否需要完成工作。

performUpkeep - 如果 checkUpkeep 有指示，随即执行合约内容。

以下示例是一个简单的 Counter 合约。 counter 变量通过每次调用 performUpkeep 来递增。 

您可以使用 Remix 查看以下代码

```js
// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

// KeeperCompatible.sol imports the functions from both ./KeeperBase.sol and
// ./interfaces/KeeperCompatibleInterface.sol
import "@chainlink/contracts/src/v0.7/KeeperCompatible.sol";

contract Counter is KeeperCompatibleInterface {
    /**
    * Public counter variable
    */
    uint public counter;

    /**
    * Use an interval in seconds and a timestamp to slow execution of Upkeep
    */
    uint public immutable interval;
    uint public lastTimeStamp;

    constructor(uint updateInterval) {
      interval = updateInterval;
      lastTimeStamp = block.timestamp;

      counter = 0;
    }

    function checkUpkeep(bytes calldata /* checkData */) external override returns (bool upkeepNeeded, bytes memory /* performData */) {
        upkeepNeeded = (block.timestamp - lastTimeStamp) > interval;
        // We don't use the checkData in this example. Upkeep 注册时会定义 checkData。
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        lastTimeStamp = block.timestamp;
        counter = counter + 1;
        // We don't use the performData in this example. Keeper 调用 checkUpkeep 函数 时，会生成 performData
   }
} 
```

部署了兼容 Keeper 的合约后，您必须注册 Upkeep 的合约，并用 LINK 为其添加资金。

这样才能通知 Keeper 网络有关您的合约事宜，工作才可以持续进行。

## Keeper 项目

[Chainlink Keeper](https://keepers.chain.link/)

[Keep3r 网络](https://docs.keep3r.network/)

## Chainlink API 调用

Chainlink 应用程序接口调用是以网络调用的传统方式（应用程序接口调用）从链下获取数据的最简单方式。 

做一个这样的实例，并且只有一个预言机，使得它在本质上是集中的。 

要保持它真正去中心化，智能合约平台需要使用在外部数据市场中找到的许多节点。

在 kovan 网络上部署以下代码以进行测试

这也遵循了预言机的请求和接收周期，并且需要从 Kovan LINK（预言机燃料）获得资金才能工作。

```js
pragma solidity ^0.6.0;

import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";

contract APIConsumer is ChainlinkClient {

    uint256 public volume;

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    /**
     * Network: Kovan
     * Oracle: 0x2f90A6D021db21e1B2A077c5a37B3C7E75D15b7e
     * Job ID: 29fa9aa13bf1468788b7cc4a500a45b8
     * Fee: 0.1 LINK
     */
    constructor() public {
        setPublicChainlinkToken();
        oracle = 0x2f90A6D021db21e1B2A077c5a37B3C7E75D15b7e;
        jobId = "29fa9aa13bf1468788b7cc4a500a45b8";
        fee = 0.1 * 10 ** 18; // 0.1 LINK
    }

    /**
     * Create a Chainlink request to retrieve API response, find the target
     * data, then multiply by 1000000000000000000 (to remove decimal places from data).
     */
    function requestVolumeData() public returns (bytes32 requestId)
    {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);

        // Set the URL to perform the GET request on
        request.add("get", "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD");

        // Set the path to find the desired data in the API response, where the response format is:
        // {"RAW":
        //   {"ETH":
        //    {"USD":
        //     {
        //      "VOLUME24HOUR": xxx.xxx,
        //     }
        //    }
        //   }
        //  }
        request.add("path", "RAW.ETH.USD.VOLUME24HOUR");

        // Multiply the result by 1000000000000000000 to remove decimals
        int timesAmount = 10**18;
        request.addInt("times", timesAmount);

        // Sends the request
        return sendChainlinkRequestTo(oracle, request, fee);
    }

    /**
     * Receive the response in the form of uint256
     */
    function fulfill(bytes32 _requestId, uint256 _volume) public recordChainlinkFulfillment(_requestId)
    {
        volume = _volume;
    }
}
```

# 预言机服务

## 服务

- [Chainlink](https://chain.link/)

- [Witnet](https://witnet.io/)

- [Provable](https://provable.xyz/)

- [Paralink](https://paralink.network/)

- [Dos.Network](https://dos.network/)

## 构建一个预言机智能合约

此为 Pedro Costa 编写的预言机合约示例。 

您可以在他的以下文章中找到更多注解：在以太网部署区块链预言机

```js
pragma solidity >=0.4.21 <0.6.0;

contract Oracle {
  Request[] requests; //list of requests made to the contract
  uint currentId = 0; //increasing request id
  uint minQuorum = 2; //minimum number of responses to receive before declaring final result
  uint totalOracleCount = 3; // Hardcoded oracle count

  // defines a general api request
  struct Request {
    uint id;                            //request id
    string urlToQuery;                  //API url
    string attributeToFetch;            //json attribute (key) to retrieve in the response
    string agreedValue;                 //value from key
    mapping(uint => string) anwers;     //answers provided by the oracles
    mapping(address => uint) quorum;    //oracles which will query the answer (1=oracle hasn't voted, 2=oracle has voted)
  }

  //event that triggers oracle outside of the blockchain
  event NewRequest (
    uint id,
    string urlToQuery,
    string attributeToFetch
  );

  //triggered when there's a consensus on the final result
  event UpdatedRequest (
    uint id,
    string urlToQuery,
    string attributeToFetch,
    string agreedValue
  );

  function createRequest (
    string memory _urlToQuery,
    string memory _attributeToFetch
  )
  public
  {
    uint lenght = requests.push(Request(currentId, _urlToQuery, _attributeToFetch, ""));
    Request storage r = requests[lenght-1];

    // Hardcoded oracles address
    r.quorum[address(0x6c2339b46F41a06f09CA0051ddAD54D1e582bA77)] = 1;
    r.quorum[address(0xb5346CF224c02186606e5f89EACC21eC25398077)] = 1;
    r.quorum[address(0xa2997F1CA363D11a0a35bB1Ac0Ff7849bc13e914)] = 1;

    // launch an event to be detected by oracle outside of blockchain
    emit NewRequest (
      currentId,
      _urlToQuery,
      _attributeToFetch
    );

    // increase request id
    currentId++;
  }

  //called by the oracle to record its answer
  function updateRequest (
    uint _id,
    string memory _valueRetrieved
  ) public {

    Request storage currRequest = requests[_id];

    //check if oracle is in the list of trusted oracles
    //and if the oracle hasn't voted yet
    if(currRequest.quorum[address(msg.sender)] == 1){

      //marking that this address has voted
      currRequest.quorum[msg.sender] = 2;

      //iterate through "array" of answers until a position if free and save the retrieved value
      uint tmpI = 0;
      bool found = false;
      while(!found) {
        //find first empty slot
        if(bytes(currRequest.anwers[tmpI]).length == 0){
          found = true;
          currRequest.anwers[tmpI] = _valueRetrieved;
        }
        tmpI++;
      }

      uint currentQuorum = 0;

      //iterate through oracle list and check if enough oracles(minimum quorum)
      //have voted the same answer has the current one
      for(uint i = 0; i < totalOracleCount; i++){
        bytes memory a = bytes(currRequest.anwers[i]);
        bytes memory b = bytes(_valueRetrieved);

        if(keccak256(a) == keccak256(b)){
          currentQuorum++;
          if(currentQuorum >= minQuorum){
            currRequest.agreedValue = _valueRetrieved;
            emit UpdatedRequest (
              currRequest.id,
              currRequest.urlToQuery,
              currRequest.attributeToFetch,
              currRequest.agreedValue
            );
          }
        }
      }
    }
  }
}
```

# 参考资料

https://ethereum.org/zh/developers/docs/oracles/

* any list
{:toc}