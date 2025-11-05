---
layout: post
title: dive-into-llms-31-如何入门深度学习
date: 2025-11-03 20:40:12 +0800
categories: [AI]
tags: [ai, learn-note]
published: true
---



# 准备工作

## 下载 python

https://www.python.org/ftp/python/3.12.6/python-3.12.6-amd64.exe

下载后直接安装，勾选上 ADD PATH 选项。

## 安装

```sh
pip install torch torchvision
```

## 编码

- mnist_train.py

```py
# mnist_train.py
# 一个最简单的 PyTorch 神经网络：手写数字识别

import torch
import torch.nn as nn
import torch.optim as optim
import torchvision
import torchvision.transforms as transforms


def main():
    # 1️⃣ 数据预处理：把图片转成 tensor 并归一化
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.5,), (0.5,))
    ])

    # 2️⃣ 下载并加载 MNIST 数据集
    train_dataset = torchvision.datasets.MNIST(
        root='./data', train=True, download=True, transform=transform)
    test_dataset = torchvision.datasets.MNIST(
        root='./data', train=False, download=True, transform=transform)

    train_loader = torch.utils.data.DataLoader(
        train_dataset, batch_size=64, shuffle=True)
    test_loader = torch.utils.data.DataLoader(
        test_dataset, batch_size=64, shuffle=False)

    # 3️⃣ 定义一个简单的神经网络
    class SimpleNN(nn.Module):
        def __init__(self):
            super(SimpleNN, self).__init__()
            self.flatten = nn.Flatten()  # 把 28x28 展开成一维
            self.fc1 = nn.Linear(28 * 28, 128)
            self.relu = nn.ReLU()
            self.fc2 = nn.Linear(128, 10)  # 10 个输出类别（数字 0~9）

        def forward(self, x):
            x = self.flatten(x)
            x = self.fc1(x)
            x = self.relu(x)
            x = self.fc2(x)
            return x

    model = SimpleNN()

    # 4️⃣ 定义损失函数和优化器
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    # 5️⃣ 训练模型
    num_epochs = 5
    for epoch in range(num_epochs):
        running_loss = 0.0
        for images, labels in train_loader:
            # 前向传播
            outputs = model(images)
            loss = criterion(outputs, labels)

            # 反向传播和优化
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            running_loss += loss.item()

        print(f"Epoch [{epoch+1}/{num_epochs}], Loss: {running_loss/len(train_loader):.4f}")

    # 6️⃣ 测试模型准确率
    correct = 0
    total = 0
    with torch.no_grad():
        for images, labels in test_loader:
            outputs = model(images)
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    print(f"✅ Accuracy on test set: {100 * correct / total:.2f}%")

    print("🎉 训练完成！模型已经学会识别手写数字。")


if __name__ == "__main__":
    main()
```


## 运行

```
python mnist_train.py
```

## 测试效果

执行后的测试效果

```
>python mnist_train.py
100.0%
100.0%
100.0%
100.0%
Epoch [1/5], Loss: 0.3926
Epoch [2/5], Loss: 0.2096
Epoch [3/5], Loss: 0.1493
Epoch [4/5], Loss: 0.1209
Epoch [5/5], Loss: 0.1010
✅ Accuracy on test set: 96.60%
🎉 训练完成！模型已经学会识别手写数字。
```


# 如何使用

## 说明

模型的训练之后，我们可以保存之后使用。

## 保存

训练结束后加上

```java
torch.save(model.state_dict(), "mnist_model.pth")
print("✅ 模型已保存为 mnist_model.pth")
```

这会在当前目录生成一个 mnist_model.pth 文件，保存模型参数。

## 使用模型

新建一个 Python 文件，例如 predict.py，内容如下：

```python
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image

# 定义和训练时一样的模型结构
class NeuralNet(nn.Module):
    def __init__(self, input_size, hidden_size, num_classes):
        super(NeuralNet, self).__init__()
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_size, num_classes)

    def forward(self, x):
        out = self.fc1(x)
        out = self.relu(out)
        out = self.fc2(out)
        return out

# 模型超参数（要和训练时一样）
input_size = 28 * 28
hidden_size = 100
num_classes = 10

# 创建模型实例并加载权重
model = NeuralNet(input_size, hidden_size, num_classes)
model.load_state_dict(torch.load("mnist_model.pth"))
model.eval()  # 进入推理模式

# 图像预处理：灰度化、缩放、转Tensor、标准化
transform = transforms.Compose([
    transforms.Grayscale(num_output_channels=1),  # 转为灰度
    transforms.Resize((28, 28)),
    transforms.ToTensor(),
    transforms.Normalize((0.1307,), (0.3081,))
])

# 读取要识别的图片路径
img_path = "digit.png"   # 你要识别的图片路径
image = Image.open(img_path).convert('L')  # 转为灰度
image = transform(image).view(-1, 28*28)

# 模型预测
with torch.no_grad():
    output = model(image)
    _, predicted = torch.max(output.data, 1)
    print(f"🧠 预测结果是数字：{predicted.item()}")
```

## 图片准备

图片要求：

背景最好是白色或黑色；

数字区域要清晰；

尺寸不限（代码会自动缩放到 28×28）；

可以用手机拍照然后裁剪成正方形。

保存成 digit.png 放在与你的 predict.py 同目录下。











* any list
{:toc}