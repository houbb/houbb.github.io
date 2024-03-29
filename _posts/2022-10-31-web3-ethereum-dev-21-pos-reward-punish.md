---
layout: post
title: web3 以太坊开发-21-POS 奖励与惩罚 rewards and penalties
date: 2022-10-28 21:01:55 +0800
categories: [web3]
tags: [web3, dev, ethereum, sh]
published: true
---

# Ethereum 

以太坊使用其原生加密货币以太（ETH）来保护。

希望参与验证区块和识别链头的节点运营商将以太币存入以太坊上的智能合约。

然后他们以以太币支付运行验证器软件，检查通过点对点网络接收到的新块的有效性，并应用分叉选择算法来识别链的头部。

验证者有两个主要角色：

1）检查新块并“证明”它们是否有效，

2）从总验证者池中随机选择时提出新块。如果验证者在被询问时未能完成其中任何一项任务，他们就会错过以太币支付。验证者有时还负责签名聚合和参与同步委员会。

还有一些非常难以意外执行的操作，并且表示某些恶意意图，例如为同一插槽提出多个块或证明同一插槽的多个块。

这些是“可罚没”的行为，会导致验证者在从网络中移除之前燃烧一定数量的以太币（最多 1 ETH），这需要 36 天。

被削减的验证者的以太币在退出期间会慢慢流失，但在第 18 天，他们会收到“相关惩罚”，当更多的验证者在同一时间被削减时，这种惩罚会更大。

因此，信标链的激励结构为诚实付出代价并惩罚不良行为者。

所有奖励和惩罚在每个 epoch 应用一次。

# 奖励

当验证者做出与大多数其他验证者一致的投票、提出区块以及参与同步委员会时，验证者将获得奖励。 

每个 epoch 中的奖励值是从 base_reward 计算出来的。 

这是计算其他奖励的基本单位。 

base_reward 表示验证者在每个 epoch 的最佳条件下收到的平均奖励。 

这是根据验证者的有效余额和活跃验证者的总数计算得出的，如下所示：

```
base_reward = effective_balance * (base_reward_factor / (base_rewards_per_epoch * sqrt(sum(active_balance))))
```

其中 base_reward_factor 是 64，base_rewards_per_epoch 是 4，sum(active balance) 是所有活跃验证者的总质押以太币。

这意味着基本奖励与验证者的有效余额成正比，与网络上的验证者数量成反比。 

验证者越多，整体发行量越大（如 sqrt(N)，但每个验证者的 base_reward 越小（如 1/sqrt(N)）。

这些因素会影响 Staking 节点的 APR。阅读 Vitalik 注释中的基本原理 .

然后将总奖励计算为五个分量的总和，每个分量都有一个权重，确定每个分量在总奖励中增加了多少。 

组件是：

```
1. 源投票：验证者对正确的源检查点进行了及时的投票

2. 目标投票：验证者对正确的目标检查点进行了及时的投票

3. 头块投票：验证者及时对正确的头块进行投票

4. 同步委员会奖励：验证者参加过同步委员会

5.提议者奖励：验证者在正确的槽中提议了一个块
```

每个组件的权重如下：

```
TIMELY_SOURCE_WEIGHT    uint64(14)

TIMELY_TARGET_WEIGHT    uint64(26)

TIMELY_HEAD_WEIGHT  uint64(14)

SYNC_REWARD_WEIGHT  uint64(2)

PROPOSER_WEIGHT uint64(8)
```

这些权重总和为 64。奖励计算为适用权重之和除以 64。

及时进行源、目标和头部投票、提出区块并参与同步委员会的验证者可以获得 64/64 * base_reward == base_reward。

但是，验证者通常不是区块提议者，因此他们的最大奖励是 64-8 /64 * base_reward == 7/8 * base_reward。

既不是区块提议者也不是同步委员会的验证者可以获得 64-8-2 / 64 * base_reward == 6.75/8 * base_reward。

添加了额外的奖励以激励快速证明。这是inclusion_delay_reward。它的值等于 base_reward 乘以 1/delay，其中 delay 是分隔块提议和证明的时隙数。

例如，如果证明是在区块提议的一个槽内提交的，证明者会收到 base_reward * 1/1 == base_reward。如果证明在下一个槽中到达，证明者收到 base_reward * 1/2 等等。

区块提议者为区块中包含的每个有效证明获得 8 / 64 * base_reward，因此奖励的实际值与证明验证者的数量成比例。区块提议者还可以通过在他们提议的区块中包含其他验证者的不当行为证据来增加他们的奖励。这些奖励是鼓励验证者诚实的“胡萝卜”。

包含 slashing 的区块提议者将获得 slashed_validators_effective_balance / 512 的奖励。

# 处罚

到目前为止，我们已经考虑了表现完美的验证者，但是那些没有及时进行 head、source 和 target 投票或者做得很慢的验证者呢？

错过目标投票和源投票的惩罚等于证明者提交投票后将获得的奖励。 

这意味着他们没有将奖励添加到他们的余额中，而是从他们的余额中删除了相等的价值。 

错过头票不会受到惩罚（即头票只会得到奖励，不会受到惩罚）。

包含延迟没有任何惩罚 - 奖励不会添加到验证者的余额中。 没有提出区块也不会受到惩罚。

# 削减 Slashing

Slashing 是一种更严重的行为，它会导致验证者从网络中被强制移除，并导致其质押的以太币丢失。

验证者可以通过三种方式被削减，所有这些都相当于不诚实的提议或区块证明：

- 通过为同一个插槽提议和签署两个不同的块

- 通过证明一个区块“包围”另一个区块（有效地改变历史）

- 通过证明同一区块的两个候选人的“双重投票”

如果检测到这些行为，验证者将被罚没。这意味着他们质押的 1/32 以太币（最多 1 个以太币）会立即被烧掉，然后开始 36 天的清除期。

在此移除期间，验证者权益逐渐流失。在中点（第 18 天）施加额外的惩罚，其幅度与削减事件前 36 天内所有被削减的验证者的总质押以太币成比例。

这意味着当更多的验证者被削减时，削减的幅度会增加。最大削减是所有被削减的验证者的全部有效余额（即，如果有很多验证者被削减，他们可能会失去全部股份）。

另一方面，一个单独的、孤立的削减事件只会烧掉验证者权益的一小部分。这种与被削减的验证者数量成比例的中点惩罚称为“相关惩罚”。

# 不活动泄漏

如果信标链已经超过四个时期而没有最终确定，则会激活称为“不活动泄漏”的紧急协议。不活动泄漏的最终目的是为链恢复最终性创造所需的条件。

如上所述，最终确定性需要总质押以太的 2/3 多数同意源和目标检查点。如果代表总验证者 1/3 以上的验证者下线或未能提交正确的证明，那么 2/3 的绝对多数不可能最终确定检查点。

不活动泄漏让属于不活动验证者的权益逐渐流失，直到他们控制不到总权益的 1/3，从而允许剩余的活动验证者完成链。无论不活跃的验证者池有多大，剩余的活跃验证者最终将控制超过 2/3 的权益。权益的损失是不活跃的验证者尽快重新激活的强大动力！

当小于 66% 的活跃验证者能够就区块链的当前负责人达成共识时，在 Medalla 测试网上遇到了不活动泄漏场景。不活动泄漏被激活，最终恢复了最终性！

信标链的奖励、惩罚和削减设计鼓励各个验证者正确行事。

然而，从这些设计选择中出现了一个系统，该系统强烈激励验证者在多个客户端之间平均分配，并且应该强烈抑制单一客户端的主导地位。

# 参考资料

https://ethereum.org/zh/developers/docs/consensus-mechanisms/pos/attestations/

* any list
{:toc}