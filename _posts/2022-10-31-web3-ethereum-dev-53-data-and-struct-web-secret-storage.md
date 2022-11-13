---
layout: post 
title: web3 以太坊开发-53-web3-secret-storage
date: 2022-10-28 21:01:55 +0800
categories: [web3] 
tags: [web3, dev, ethereum, sh]
published: true
---

# Web3 secret storage definition

为了让你的应用在以太坊上运行，你可以使用 web3.js 库提供的 web3 对象。 

在后台，它通过 RPC 调用与本地节点通信。 web3 适用于任何暴露 RPC 层的以太坊节点。

web3 包含 eth 对象 - web3.eth。

```js
var fs = require("fs")
var recognizer = require("ethereum-keyfile-recognizer")

fs.readFile("keyfile.json", (err, data) => {
  var json = JSON.parse(data)
  var result = recognizer(json)
})

/** result
 *               [ 'web3', 3 ]   web3 (v3) keyfile
 *  [ 'ethersale', undefined ]   Ethersale keyfile
 *                        null     invalid keyfile
 */
```

# 定义

文件的实际编码和解码与版本 1 相比基本保持不变，只是加密算法不再固定为 AES-128-CBC（AES-128-CTR 现在是最低要求）。

大部分含义/算法与版本 1 类似，除了 mac，它以 SHA3 (keccak-256) 的形式给出，它是派生密钥的倒数第二个最左 16 个字节与完整密文的连接。

密钥文件直接存储在 ~/.web3/keystore（适用于类 Unix 系统）和 ~/AppData/Web3/keystore（适用于 Windows）中。

它们可以命名为任何名称，但一个好的约定是 `<uuid>.json`，其中 `<uuid>` 是提供给密钥的 128 位 UUID（密钥地址的隐私保护代理）。

所有此类文件都有一个关联的密码。要导出给定 .json 文件的密钥，首先导出文件的加密密钥；这是通过获取文件的密码并将其传递给 kdf 密钥所描述的密钥派生函数来完成的。 

KDF 函数的依赖于 KDF 的静态和动态参数在 kdfparams 键中描述。

PBKDF2 必须得到所有最低兼容实现的支持，但表示：

    kdf：pbkdf2

对于 PBKDF2，kdfparams 包括：

    prf：必须是hmac-sha256（未来可能会扩展）；
    c：迭代次数；
    salt：传递给 PBKDF 的盐；
    dklen：派生密钥的长度。必须 >= 32。

一旦导出了文件的密钥，就应该通过 MAC 的导出来验证它。 MAC 应计算为字节数组的 SHA3 (keccak-256) 哈希，该字节数组由派生密钥的最左 16 个字节与密文密钥内容的连接形成，即：

```
KECCAK(DK[16..31] ++ <ciphertext>)
```

（其中 ++ 是连接运算符）

此值应与 mac 键的内容进行比较；如果它们不同，则应请求替代密码（或取消操作）。

在文件的密钥被验证后，密文（文件中的密文密钥）可以使用由密钥指定的对称加密算法进行解密，并通过 cipherparams 密钥进行参数化。如果派生密钥大小和算法的密钥大小不匹配，则应使用派生密钥最右边的零填充字节作为算法的密钥。

所有最低兼容的实现都必须支持 AES-128-CTR 算法，通过以下方式表示：

    密码：aes-128-ctr

此密码采用以下参数，作为 cipherparams 密钥的密钥：

    iv：密码的 128 位初始化向量。

密码的密钥是派生密钥的最左边 16 个字节，即 DK[0..15]

密钥的创建/加密本质上应该与这些指令相反。确保 uuid、salt 和 iv 实际上是随机的。

除了应该作为版本的“硬”标识符的版本字段之外，实现还可以使用次要版本来跟踪对格式的较小的、非破坏性的更改。

# Test Vectors

Details:

```
Address: 008aeeda4d805471df9b2a5b0f38a0c3bcba786b
ICAP: XE542A5PZHH8PYIZUBEJEO0MFWRAPPIL67
UUID: 3198bc9c-6672-5ab3-d9954942343ae5b6
Password: testpassword
Secret: 7a28b5ba57c53603b0b07b56bba752f7784bf506fa95edc395f5cf6c7514fe9d
```

## BKDF2-SHA-256

使用 AES-128-CTR 和 PBKDF2-SHA-256 测试向量：

~/.web3/keystore/3198bc9c-6672-5ab3-d9954942343ae5b6.json的文件内容：

```json
{
  "crypto": {
    "cipher": "aes-128-ctr",
    "cipherparams": {
      "iv": "6087dab2f9fdbbfaddc31a909735c1e6"
    },
    "ciphertext": "5318b4d5bcd28de64ee5559e671353e16f075ecae9f99c7a79a38af5f869aa46",
    "kdf": "pbkdf2",
    "kdfparams": {
      "c": 262144,
      "dklen": 32,
      "prf": "hmac-sha256",
      "salt": "ae3cd4e7013836a3df6bd7241b12db061dbe2c6785853cce422d148a624ce0bd"
    },
    "mac": "517ead924a9d0dc3124507e3393d175ce3ff7c1e96529c6c555ce9e51205e9b2"
  },
  "id": "3198bc9c-6672-5ab3-d995-4942343ae5b6",
  "version": 3
}
```

Intermediates:

Derived key: f06d69cdc7da0faffb1008270bca38f5e31891a3a773950e6d0fea48a7188551 MAC Body: e31891a3a773950e6d0fea48a71885515318b4d5bcd28de64ee5559e671353e16f075ecae9f99c7a79a38af5f869aa46 MAC: 517ead924a9d0dc3124507e3393d175ce3ff7c1e96529c6c555ce9e51205e9b2 Cipher key: f06d69cdc7da0faffb1008270bca38f5

## Scrypt

Test vector using AES-128-CTR and Scrypt:

```js
{
  "crypto": {
    "cipher": "aes-128-ctr",
    "cipherparams": {
      "iv": "83dbcc02d8ccb40e466191a123791e0e"
    },
    "ciphertext": "d172bf743a674da9cdad04534d56926ef8358534d458fffccd4e6ad2fbde479c",
    "kdf": "scrypt",
    "kdfparams": {
      "dklen": 32,
      "n": 262144,
      "p": 8,
      "r": 1,
      "salt": "ab0c7876052600dd703518d6fc3fe8984592145b591fc8fb5c6d43190334ba19"
    },
    "mac": "2103ac29920d71da29f15d75b4a16dbe95cfd7ff8faea1056c33131d846e3097"
  },
  "id": "3198bc9c-6672-5ab3-d995-4942343ae5b6",
  "version": 3
}
```

Intermediates:

Derived key: fac192ceb5fd772906bea3e118a69e8bbb5cc24229e20d8766fd298291bba6bd MAC Body: bb5cc24229e20d8766fd298291bba6bdd172bf743a674da9cdad04534d56926ef8358534d458fffccd4e6ad2fbde479c MAC: 2103ac29920d71da29f15d75b4a16dbe95cfd7ff8faea1056c33131d846e3097 Cipher key: fac192ceb5fd772906bea3e118a69e8b

# 版本 1 的更改

此版本修复了与此处发布的版本 1 的若干不一致之处。简而言之，这些是：

- 大小写不合理且不一致（scrypt 小写、Kdf 混合大小写、MAC 大写）。

- 解决不必要的问题并损害隐私。

- Salt 本质上是密钥派生函数的一个参数，值得与它相关联，而不是一般的加密。

- SaltLen 不必要（只需从 Salt 派生）。

- 给出了密钥派生函数，但加密算法是硬指定的。

- 版本本质上是数字，但它是一个字符串（结构化版本控制可以使用字符串，但对于很少更改的配置文件格式可以被视为超出范围）。

- KDF 和密码在概念上是同级概念，但组织方式不同。

- MAC 是通过与空白无关的数据块计算的（！）

已对格式进行更改以提供以下文件，其功能等同于先前链接页面上给出的示例：

```json
{
  "crypto": {
    "cipher": "aes-128-cbc",
    "ciphertext": "07533e172414bfa50e99dba4a0ce603f654ebfa1ff46277c3e0c577fdc87f6bb4e4fe16c5a94ce6ce14cfa069821ef9b",
    "cipherparams": {
      "iv": "16d67ba0ce5a339ff2f07951253e6ba8"
    },
    "kdf": "scrypt",
    "kdfparams": {
      "dklen": 32,
      "n": 262144,
      "p": 1,
      "r": 8,
      "salt": "06870e5e6a24e183a5c807bd1c43afd86d573f7db303ff4853d135cd0fd3fe91"
    },
    "mac": "8ccded24da2e99a11d48cda146f9cc8213eb423e2ea0d8427f41c3be414424dd",
    "version": 1
  },
  "id": "0498f19a-59db-4d54-ac95-33901b4f1870",
  "version": 2
}
```

# 版本 2 的更改

版本 2 是早期的 C++ 实现，存在许多错误。 

所有必需品都保持不变。

# 参考资料

https://ethereum.org/zh/developers/docs/data-structures-and-encoding/web3-secret-storage/

* any list
{:toc}