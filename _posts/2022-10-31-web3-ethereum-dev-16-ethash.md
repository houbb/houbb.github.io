---
layout: post
title: web3 以太坊开发-16-ETHASH 工作量证明 pow
date: 2022-10-28 21:01:55 +0800
categories: [web3]
tags: [web3, dev, ethereum, sh]
published: true
---

# ETHASH

Ethash 是在现已弃用的工作量证明架构下，实际用于真正的以太坊主网的挖矿算法。 

Ethash 实际上是为 Dagger Hashimoto 算法进行重要更新后的一个特殊版本命名的新名称，但它仍然继承了其前身的基本原理。 

以太坊主网只使用过 Ethash - Dagger Hashimoto 是挖矿算法的研发版本，在以太坊主网上开始挖矿之前被取代。

> [详细了解 Ethash](https://ethereum.org/zh/developers/docs/consensus-mechanisms/pow/mining-algorithms/ethash/)

## 是什么？

Ethash 是 Dagger-Hashimoto 算法的修改版。 

Ethash 工作量证明是内存密集型算法，这被认为使算法可抵御专用集成电路。 

Ethash 专用集成电路最终被开发出来，但在工作量证明被关闭之前，图形处理单元挖矿仍然是一个可行的选择。 

Ethash 仍然用于在其他非以太坊工作量证明网络上挖掘其他币。

## ETHASH 是如何工作的？

内存硬度通过工作量证明算法实现，需要根据随机数和区块头选择固定资源子集。 

该资源（大小为几 GB）称为有向无环图。 

有向无环图每 30000 个区块更改一次（大约 125 小时的窗口，称为一个时段（大约 5.2 天）），需要一段时间才能生成。 

由于有向无环图仅依赖于区块高度，因此可以预先生成，但如果没有，则客户端需要等到此过程结束才能生成区块。 

如果客户端没有提前预生成和缓存有向无环图，网络可能会在每个时段过渡时遇到严重的区块延迟。 

请注意，不需要生成有向无环图即可验证，工作量证明本质上允许使用低端中央处理器和小内存进行验证。

该算法采取的一般路线如下：

1. 有一个种子，可以通过扫描区块头直到该点来为每个区块计算种子。

2. 从种子中可以计算出 16 MB 的伪随机缓存。 轻量级客户端存储缓存。

3. 我们可以从缓存中生成一个 1 GB 数据集，数据集中每个项目仅依赖于一小部分缓存中的项目。 全客户端和矿工存储数据集。 数据集随着时间的流逝而呈线性增长。

4. 采矿会抢走数据集的随机片段并将它们散列在一起。 可以通过使用缓存来重新生成您需要的数据集中的特定区块，以较低的内存进行验证，以使您只需要存储缓存。

每隔 30000 个区块更新一次大数据集，因此，矿工的绝大部分工作都是读取数据集，而不是对其进行修改。

## 定义

我们采用以下定义：

```
WORD_BYTES = 4                    # bytes in word
DATASET_BYTES_INIT = 2**30        # bytes in dataset at genesis
DATASET_BYTES_GROWTH = 2**23      # dataset growth per epoch
CACHE_BYTES_INIT = 2**24          # bytes in cache at genesis
CACHE_BYTES_GROWTH = 2**17        # cache growth per epoch
CACHE_MULTIPLIER=1024             # Size of the DAG relative to the cache
EPOCH_LENGTH = 30000              # blocks per epoch
MIX_BYTES = 128                   # width of mix
HASH_BYTES = 64                   # hash length in bytes
DATASET_PARENTS = 256             # number of parents of each dataset element
CACHE_ROUNDS = 3                  # number of rounds in cache production
ACCESSES = 64                     # number of accesses in hashimoto loop
```

## 参数

Ethash 的缓存和数据集的参数取决于区块号。 

缓存大小和数据集大小都呈线性增长；然而，我们总是取低于线性增长阈值的最高素数，以降低意外规律导致循环行为的风险。

```js
def get_cache_size(block_number):
    sz = CACHE_BYTES_INIT + CACHE_BYTES_GROWTH * (block_number // EPOCH_LENGTH)
    sz -= HASH_BYTES
    while not isprime(sz / HASH_BYTES):
        sz -= 2 * HASH_BYTES
    return sz

def get_full_size(block_number):
    sz = DATASET_BYTES_INIT + DATASET_BYTES_GROWTH * (block_number // EPOCH_LENGTH)
    sz -= MIX_BYTES
    while not isprime(sz / MIX_BYTES):
        sz -= 2 * MIX_BYTES
    return sz
```

附录中提供了数据集和缓存大小值表。

## 缓存生成

现在，我们来指定生成缓存的函数：

```js
def mkcache(cache_size, seed):
    n = cache_size // HASH_BYTES

    # Sequentially produce the initial dataset
    o = [sha3_512(seed)]
    for i in range(1, n):
        o.append(sha3_512(o[-1]))

    # Use a low-round version of randmemohash
    for _ in range(CACHE_ROUNDS):
        for i in range(n):
            v = o[i][0] % n
            o[i] = sha3_512(map(xor, o[(i-1+n) % n], o[v]))

    return o
```

缓存生成过程中，先按顺序填充 32 MB 内存，然后从严格内存硬哈希函数 (2014) 执行两次 Sergio Demian Lerner 的 RandMemoHash 算法。 

输出一组 524288 个 64 字节值。

# 数据聚合函数

我们使用灵感来自 FNV 哈希的算法，在部分情况下，这种算法可用作逻辑异或的不相关替代。 

请注意，我们使用全 32 位输入乘以素数，与之相对地，FNV-1 spec 用 1 个字节（8 个字节）依次乘以素数。

```js
FNV_PRIME = 0x01000193

def fnv(v1, v2):
    return ((v1 * FNV_PRIME) ^ v2) % 2**32
```

请注意，即使黄皮书也指出 fnv 为 `v1*(FNV_PRIME ^ v2)`，所有当前实现始终采用上述定义。

# 完整数据集计算

整个 1 GB 数据集中每个 64 字节项目的计算如下：

```js
def calc_dataset_item(cache, i):
    n = len(cache)
    r = HASH_BYTES // WORD_BYTES
    # initialize the mix
    mix = copy.copy(cache[i % n])
    mix[0] ^= i
    mix = sha3_512(mix)
    # fnv it with a lot of random cache nodes based on i
    for j in range(DATASET_PARENTS):
        cache_index = fnv(i ^ j, mix[j % r])
        mix = map(fnv, mix, cache[cache_index % n])
    return sha3_512(mix)
```

基本上，我们将来自 256 个伪随机选择的缓存节点的数据聚集起来求哈希值，以计算数据集节点。 

然后生成整个数据集：

```js
def calc_dataset(full_size, cache):
    return [calc_dataset_item(cache, i) for i in range(full_size // HASH_BYTES)]
```

# 主循环

现在，我们指定了类似“hashimoto”的主要循环。

在此循环中，我们聚合整个数据集的数据，以生成特定区块头和随机数的最终值。 

在下面的代码中，header 代表一个被截断区块头的递归长度前缀表示的 SHA3-256 哈希值。

被截断是指区块头被截去了 mixHash 和随机数字段。 

nonce 是指一个 64 位无符号整数的八个字节，按大端序排列。 

因此 `nonce[::-1]` 是上述值的八字节小端序表示：

```js
def hashimoto(header, nonce, full_size, dataset_lookup):
    n = full_size / HASH_BYTES
    w = MIX_BYTES // WORD_BYTES
    mixhashes = MIX_BYTES / HASH_BYTES
    # combine header+nonce into a 64 byte seed
    s = sha3_512(header + nonce[::-1])
    # start the mix with replicated s
    mix = []
    for _ in range(MIX_BYTES / HASH_BYTES):
        mix.extend(s)
    # mix in random dataset nodes
    for i in range(ACCESSES):
        p = fnv(i ^ s[0], mix[i % w]) % (n // mixhashes) * mixhashes
        newdata = []
        for j in range(MIX_BYTES / HASH_BYTES):
            newdata.extend(dataset_lookup(p + j))
        mix = map(fnv, mix, newdata)
    # compress mix
    cmix = []
    for i in range(0, len(mix), 4):
        cmix.append(fnv(fnv(fnv(mix[i], mix[i+1]), mix[i+2]), mix[i+3]))
    return {
        "mix digest": serialize_hash(cmix),
        "result": serialize_hash(sha3_256(s+cmix))
    }

def hashimoto_light(full_size, cache, header, nonce):
    return hashimoto(header, nonce, full_size, lambda x: calc_dataset_item(cache, x))

def hashimoto_full(full_size, dataset, header, nonce):
    return hashimoto(header, nonce, full_size, lambda x: dataset[x])
```

基本上，我们保持着一个宽 128 字节的“混合物”，并多次按顺序从整个数据集中获取 128 字节，并使用 fnv 函数将其与混合物结合起来。 

使用 128 字节的序列访问，以便每轮算法总是能从随机访问内存获取完整的页面，从而尽量减少转译后备缓冲区的疏忽，而专用集成电路在理论上能够避免这些疏忽。

如果此算法的输出低于所需目标，即证明随机数是有效的。 

请注意，在最后额外应用 sha3_256 将确保中间随机数的存在。

提供此证据可以证明至少做了少量工作；而且此快速外部工作量证明验证可以用于反分布式拒绝服务目的。 

也可提供统计保证，说明结果是一个无偏 256 位数字。

# 挖矿

挖矿算法定义如下：

```js
def mine(full_size, dataset, header, difficulty):
    # zero-pad target to compare with hash on the same digit
    target = zpad(encode_int(2**256 // difficulty), 64)[::-1]
    from random import randint
    nonce = randint(0, 2**64)
    while hashimoto_full(full_size, dataset, header, nonce) > target:
        nonce = (nonce + 1) % 2**64
    return nonce
```

## 定义种子哈希

为了计算用于在给定区块上挖掘的种子哈希值，我们使用以下算法：

```js
 def get_seedhash(block):
     s = '\x00' * 32
     for i in range(block.number // EPOCH_LENGTH):
         s = serialize_hash(sha3_256(s))
     return s
```

请注意，为了顺利挖矿和验证，我们建议在单个线程中预先计算未来的种子哈希值和数据集。


# 参考资料

https://ethereum.org/zh/developers/docs/consensus-mechanisms/pow/mining/

https://ethereum.org/zh/developers/docs/consensus-mechanisms/pow/mining-algorithms/

https://ethereum.org/zh/developers/docs/consensus-mechanisms/pow/mining-algorithms/ethash/

https://ethereum.org/zh/developers/docs/consensus-mechanisms/pow/mining-algorithms/ethash

* any list
{:toc}