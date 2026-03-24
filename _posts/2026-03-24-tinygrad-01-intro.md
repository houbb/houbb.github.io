---
layout: post
title: tinygrad 是一个端到端的深度学习框架
date: 2026-03-24 21:01:55 +0800
categories: [AI]
tags: [ai]
published: true
---

# tinygrad

介于 [PyTorch](https://github.com/pytorch/pytorch) 和 [karpathy/micrograd](https://github.com/karpathy/micrograd) 之间的项目。由 [tiny corp](https://tinygrad.org) 维护。

<h3>

[主页](https://github.com/tinygrad/tinygrad) | [文档](https://docs.tinygrad.org/) | [Discord](https://discord.gg/ZjZadyC7PK)

tinygrad 是一个端到端的深度学习框架：

- **张量库**，支持自动梯度
- **中间表示（IR）和编译器**，用于融合和降低内核
- **即时编译（JIT）+ 图执行**
- **神经网络 / 优化器 / 数据集**，用于实际训练

它的灵感来自 PyTorch（人机工程学）、JAX（函数式转换和基于 IR 的自动微分）和 TVM（调度和代码生成），但始终保持小巧且易于修改。

---

## tinygrad 对比

**PyTorch**

- ✅ 相似之处：即时执行的 `Tensor` API、自动梯度、`optim`、基本数据集和层。
- ✅ 可以编写熟悉的训练循环。
- 🔁 与 PyTorch 不同的是，整个编译器和 IR 都是可见且可修改的。

**JAX**

- ✅ 基于 IR 的原始操作自动微分（类似于 JAXPR + XLA）。
- ✅ 函数级 JIT（`TinyJit`），用于捕获和重放内核。
- 🔁 函数式转换较少（尚未完全支持 `vmap`/`pmap`），但易于阅读。

**TVM**

- ✅ 多次降低传递、调度和内核上的束搜索。
- ✅ 用于批量执行的设备“图”。
- 🔁 tinygrad 还提供了**前端框架**（张量、神经网络、优化器），而不仅仅是编译器。

---

### 懒惰计算

尝试一个矩阵乘法。可以看到，尽管采用了这种风格，但借助懒惰计算的力量，它被融合到一个内核中。

```sh
DEBUG=3 python3 -c "from tinygrad import Tensor;
N = 1024; a, b = Tensor.empty(N, N), Tensor.empty(N, N);
(a.reshape(N, 1, N) * b.T.reshape(1, N, N)).sum(axis=2).realize()"
```

我们可以将 `DEBUG` 改为 `4` 来查看生成的代码。

### 神经网络

事实证明，神经网络所需的 90% 就是一个不错的自动梯度/张量库。再加上一个优化器、一个数据加载器和一些计算，你就拥有了所需的一切。

```python
from tinygrad import Tensor, nn

class LinearNet:
  def __init__(self):
    self.l1 = Tensor.kaiming_uniform(784, 128)
    self.l2 = Tensor.kaiming_uniform(128, 10)
  def __call__(self, x:Tensor) -> Tensor:
    return x.flatten(1).dot(self.l1).relu().dot(self.l2)

model = LinearNet()
optim = nn.optim.Adam([model.l1, model.l2], lr=0.001)

x, y = Tensor.rand(4, 1, 28, 28), Tensor([2,4,3,7])  # 替换为真实的 mnist 数据加载器

with Tensor.train():
  for i in range(10):
    optim.zero_grad()
    loss = model(x).sparse_categorical_crossentropy(y).backward()
    optim.step()
    print(i, loss.item())
```

完整版本请参见 [examples/beautiful_mnist.py](examples/beautiful_mnist.py)，大约 5 秒即可达到 98% 的准确率。

## 加速器

tinygrad 已经支持多种加速器，包括：

- [x] [OpenCL](tinygrad/runtime/ops_cl.py)
- [x] [CPU](tinygrad/runtime/ops_cpu.py)
- [x] [METAL](tinygrad/runtime/ops_metal.py)
- [x] [CUDA](tinygrad/runtime/ops_cuda.py)
- [x] [AMD](tinygrad/runtime/ops_amd.py)
- [x] [NV](tinygrad/runtime/ops_nv.py)
- [x] [QCOM](tinygrad/runtime/ops_qcom.py)
- [x] [WEBGPU](tinygrad/runtime/ops_webgpu.py)

而且添加更多加速器也很容易！您选择的加速器只需要支持总共约 25 个低级操作。

要检查默认加速器，请运行：`python3 -c "from tinygrad import Device; print(Device.DEFAULT)"`

## 安装

目前推荐的 tinygrad 安装方式是从源码安装。

### 从源码安装

```sh
git clone https://github.com/tinygrad/tinygrad.git
cd tinygrad
python3 -m pip install -e .
```

### 直接安装（主分支）

```sh
python3 -m pip install git+https://github.com/tinygrad/tinygrad.git
```

## 文档

文档以及快速入门指南可以在[文档网站](https://docs.tinygrad.org/)上找到，该网站是根据 [docs/](/docs) 目录构建的。

### 与 PyTorch 对比的快速示例

```python
from tinygrad import Tensor

x = Tensor.eye(3, requires_grad=True)
y = Tensor([[2.0,0,-2.0]], requires_grad=True)
z = y.matmul(x).sum()
z.backward()

print(x.grad.tolist())  # dz/dx
print(y.grad.tolist())  # dz/dy
```

在 PyTorch 中实现相同的功能：
```python
import torch

x = torch.eye(3, requires_grad=True)
y = torch.tensor([[2.0,0,-2.0]], requires_grad=True)
z = y.matmul(x).sum()
z.backward()

print(x.grad.tolist())  # dz/dx
print(y.grad.tolist())  # dz/dy
```

## 贡献

最近人们对 tinygrad 产生了浓厚的兴趣。遵循以下准则将有助于您的 PR 被接受。

我们首先说明哪些情况会导致您的 PR 被关闭，并会附上本节的链接：

- 不要写代码高尔夫！虽然低代码行数是本项目的指导原则，但任何看起来像代码高尔夫的内容都将被关闭。真正的目标是降低复杂性和提高可读性，删除 `\n` 对此毫无帮助。
- 所有文档和空白字符的更改都将被关闭，除非您是知名贡献者。编写文档的人应该是对代码库最了解的人。没有证明这一点的人不应该乱动文档。空白字符的更改既无用，又存在引入错误的风险。
- 任何声称是“加速”的内容都必须经过基准测试。总的来说，目标是简单性，因此即使您的 PR 使性能略有提升，您也必须考虑在可维护性和可读性方面的权衡。
- 一般来说，核心 `tinygrad/` 文件夹之外的代码没有经过充分测试，因此除非那里的现有代码已损坏，否则您不应该更改它。
- 如果您的 PR 看起来“复杂”、差异很大或添加了很多行，则不会被审查或合并。请考虑将其分解为更小的 PR，每个 PR 都有明确的优点。我常见的一种模式是在添加新功能之前进行先决条件的重构。如果您可以（干净地）重构到该功能只需更改 3 行代码的程度，那就太好了，这样我们很容易审查。

现在，我们想要的是：

- 错误修复（带有回归测试）很棒！这个库还不是 1.0 版本，所以如果您偶然发现了一个错误，修复它，编写一个测试，并提交 PR，这是非常有价值的工作。
- 解决悬赏问题！tinygrad [为库的某些改进提供现金悬赏](https://docs.google.com/spreadsheets/d/1WKHbT-7KOgjEawq5h5Ic1qUWzpfAzuD_J06N1JwOCGs/edit?usp=sharing)。所有新代码都应该是高质量的并且经过充分测试。
- 功能。但是，如果您要添加一个功能，请考虑代码行数的权衡。如果是 3 行代码，那么它的有用性门槛就比 30 行或 300 行的功能要低。所有功能都必须有回归测试。通常在没有其他限制的情况下，您的功能的 API 应与 torch 或 numpy 匹配。
- 明确有益的重构。一般来说，如果您的重构不是明确有益的，它将被关闭。但有些重构非常棒！从深度核心的角度考虑可读性。更改空白字符或移动几个函数是无用的，但如果您发现两个 100 行的函数实际上可以使用同一个带参数的 110 行函数，同时还能提高可读性，这将是一个巨大的胜利。重构应通过[过程重放](#过程重放测试)测试。
- 测试/模糊测试。如果您能添加非脆弱的测试，我们非常欢迎。我们这里也有一些模糊测试工具，通过它们和改进它们可以发现大量错误。发现错误，甚至使用 `@unittest.expectedFailure` 编写（本应通过但实际失败的）测试，都是很棒的。这是我们取得进步的方式。
- 移除核心 `tinygrad/` 文件夹中的死代码。我们不关心 extra 中的代码，但移除核心库中的死代码是非常好的。这样可以减少新开发者阅读时产生的困惑。

### 运行测试

您应该使用 `pre-commit install` 安装预提交钩子。这将在每次提交时运行 linter、mypy 和一部分测试。

有关如何运行完整测试套件的更多示例，请参考 [CI workflow](.github/workflows/test.yml)。

在本地运行测试的一些示例：
```sh
python3 -m pip install -e '.[testing]'  # 安装测试所需的额外依赖
python3 test/backend/test_ops.py        # 仅运行操作测试
python3 -m pytest test/                 # 运行整个测试套件
```

#### 过程重放测试

[过程重放](https://github.com/tinygrad/tinygrad/blob/master/test/external/process_replay/README.md) 将您的 PR 生成的内核与主分支进行比较。如果您的 PR 是重构或加速，且没有预期的行为变化，则应在拉取请求标题中包含 [pr]。

# 参考资料

* any list
{:toc}