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
torch.save(model.state_dict(), "model/mnist_model.pth")
print("✅ 模型已保存为 mnist_model.pth")
```

这会在当前目录生成一个 `model/mnist_model.pth` 文件，保存模型参数。

重新执行一遍：

```
python mnist_train.py
Epoch [1/5], Loss: 0.3826
Epoch [2/5], Loss: 0.1920
Epoch [3/5], Loss: 0.1380
Epoch [4/5], Loss: 0.1108
Epoch [5/5], Loss: 0.0957
✅ Accuracy on test set: 97.10%
🎉 训练完成！模型已经学会识别手写数字。
✅ 模型已保存为 mnist_model.pth
```

## 使用模型

新建一个 Python 文件，例如 mnist_predict.py，内容如下：

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
hidden_size = 128
num_classes = 10

# 创建模型实例并加载权重
model = NeuralNet(input_size, hidden_size, num_classes)
model.load_state_dict(torch.load("model/mnist_model.pth"))
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

保存成 digit.png 放在与你的 mnist_predict.py 同目录下。

## 测试

发现给数字 7 识别成了 0，只能说也不是那么准确。

```
> python mnist_predict.py
🧠 预测结果是数字：0
```

# 为什么翻车了？

段代码确实是 MNIST 入门版 —— 简单易懂，但它的能力有限：

它只用了两层全连接网络，没有卷积层（CNN），所以当你拿“现实截图”去识别，就很容易翻车。

MNIST 训练集的图片是这样的：

黑底白字

干净、居中、28×28 尺寸

而你截图的数字图片可能是：

白底黑字（反色）

背景杂、位置偏

尺寸不一样（不是 28×28）

有灰度、噪声或边缘模糊

## 升级版本 CNN

### 训练版本

- mnist_train_cnn.py

```py
# mnist_train_cnn.py
# 一个更强的 CNN 模型，用于手写数字识别

import torch
import torch.nn as nn
import torch.optim as optim
import torchvision
import torchvision.transforms as transforms


def main():
    # 1️⃣ 数据预处理
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.5,), (0.5,))
    ])

    # 2️⃣ MNIST 数据集
    train_dataset = torchvision.datasets.MNIST(
        root='./data', train=True, download=True, transform=transform)
    test_dataset = torchvision.datasets.MNIST(
        root='./data', train=False, download=True, transform=transform)

    train_loader = torch.utils.data.DataLoader(
        train_dataset, batch_size=64, shuffle=True)
    test_loader = torch.utils.data.DataLoader(
        test_dataset, batch_size=64, shuffle=False)

    # 3️⃣ 定义卷积神经网络
    class CNN(nn.Module):
        def __init__(self):
            super(CNN, self).__init__()
            self.conv1 = nn.Conv2d(1, 32, 3, padding=1)
            self.conv2 = nn.Conv2d(32, 64, 3, padding=1)
            self.pool = nn.MaxPool2d(2, 2)
            self.dropout = nn.Dropout(0.25)

            # 临时创建一个假输入自动推导 flatten 大小
            x = torch.zeros(1, 1, 28, 28)
            x = self._forward_features(x)
            flatten_size = x.view(1, -1).size(1)

            self.fc1 = nn.Linear(flatten_size, 128)
            self.fc2 = nn.Linear(128, 10)

        def _forward_features(self, x):
            x = torch.relu(self.conv1(x))
            x = self.pool(torch.relu(self.conv2(x)))
            x = self.dropout(x)
            return x

        def forward(self, x):
            x = self._forward_features(x)
            x = x.view(x.size(0), -1)
            x = torch.relu(self.fc1(x))
            x = self.fc2(x)
            return x

    model = CNN()

    # 4️⃣ 定义损失函数和优化器
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    # 5️⃣ 训练模型
    num_epochs = 5
    for epoch in range(num_epochs):
        running_loss = 0.0
        for images, labels in train_loader:
            outputs = model(images)
            loss = criterion(outputs, labels)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            running_loss += loss.item()

        print(f"Epoch [{epoch+1}/{num_epochs}], Loss: {running_loss/len(train_loader):.4f}")

    # 6️⃣ 测试准确率
    correct = 0
    total = 0
    with torch.no_grad():
        for images, labels in test_loader:
            outputs = model(images)
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    print(f"✅ Accuracy on test set: {100 * correct / total:.2f}%")

    # 保存模型
    torch.save(model.state_dict(), "model/mnist_cnn.pth")
    print("🎉 训练完成！模型已保存到 model/mnist_cnn.pth")


if __name__ == "__main__":
    main()
```

执行训练

```
> python mnist_train_cnn.py
Epoch [1/5], Loss: 0.1438
Epoch [2/5], Loss: 0.0460
Epoch [3/5], Loss: 0.0300
Epoch [4/5], Loss: 0.0203
Epoch [5/5], Loss: 0.0157
✅ Accuracy on test set: 98.74%
🎉 训练完成！模型已保存到 model/mnist_cnn.pth
```

感觉这个要比第一种方式慢了不少。

### 推理脚本（单个图片预测）

- mnist_cnn_predict.py：

```python
import torch
import torch.nn as nn
from PIL import Image
import torchvision.transforms as transforms

# 模型结构需与训练时一致
class CNN(nn.Module):
    def __init__(self):
        super(CNN, self).__init__()
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.dropout = nn.Dropout(0.25)
        self.fc1 = nn.Linear(64 * 14 * 14, 128)
        self.fc2 = nn.Linear(128, 10)

    def forward(self, x):
        x = torch.relu(self.conv1(x))
        x = torch.relu(self.conv2(x))
        x = self.pool(x)              # 一次池化，28→14
        x = self.dropout(x)
        x = x.view(-1, 64 * 14 * 14)  # 改成对应的维度
        x = torch.relu(self.fc1(x))
        x = self.fc2(x)
        return x

# 加载模型
model = CNN()
model.load_state_dict(torch.load("model/mnist_cnn.pth"))
model.eval()

# 图片预处理
transform = transforms.Compose([
    transforms.Grayscale(),
    transforms.Resize((28, 28)),
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))
])

# 你的截图路径
img_path = "digit.png"
image = Image.open(img_path).convert("RGB")
image = transform(image).unsqueeze(0)

# 推理
with torch.no_grad():
    outputs = model(image)
    _, predicted = torch.max(outputs, 1)
    print(f"🧠 模型预测结果: {predicted.item()}")
```

执行测试：

```
🧠 模型预测结果: 7
```

这次对了。

后续我们可以从理论角度看一下为什么 CNN 的效果更好。

# v3-实时手写数字识别

## 思路

上面的 CNN 已经可以识别数字，但是不够有趣。

我们可以实现一个画板，手动写数字，然后让其预测。

## 安装依赖

可以通过 opencv 构建一个画板

我们先安装一下依赖

```
pip install torch torchvision opencv-python pillow numpy
```

## 实现

```python
import cv2
import numpy as np
import torch
import torch.nn as nn
from PIL import Image
import torchvision.transforms as transforms

# ======================
# ✅ 1. 定义 CNN 模型结构（与训练时一致）
# ======================
class CNN(nn.Module):
    def __init__(self):
        super(CNN, self).__init__()
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.dropout = nn.Dropout(0.25)
        # 注意是 64 * 14 * 14（因为只池化一次）
        self.fc1 = nn.Linear(64 * 14 * 14, 128)
        self.fc2 = nn.Linear(128, 10)

    def forward(self, x):
        x = torch.relu(self.conv1(x))
        x = torch.relu(self.conv2(x))
        x = self.pool(x)
        x = self.dropout(x)
        x = x.view(-1, 64 * 14 * 14)
        x = torch.relu(self.fc1(x))
        x = self.fc2(x)
        return x


# ======================
# ✅ 2. 加载模型
# ======================
model = CNN()
model.load_state_dict(torch.load("model/mnist_cnn.pth", map_location="cpu"))
model.eval()

# ======================
# ✅ 3. 图像预处理函数
# ======================
def preprocess_image_for_mnist(image):
    # 转成灰度
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # 反色：白底黑字 -> 黑底白字
    gray = cv2.bitwise_not(gray)
    # 转 PIL
    pil = Image.fromarray(gray)
    # 兼容 Pillow 新旧版本
    try:
        resample = Image.Resampling.LANCZOS
    except AttributeError:
        resample = Image.ANTIALIAS
    pil = pil.resize((28, 28), resample)
    # 变成 Tensor
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.5,), (0.5,))
    ])
    tensor = transform(pil).unsqueeze(0)
    return tensor


# ======================
# ✅ 4. OpenCV 绘图窗口
# ======================
canvas = np.ones((280, 280, 3), dtype=np.uint8) * 255
drawing = False
last_point = None

def draw(event, x, y, flags, param):
    global drawing, last_point
    if event == cv2.EVENT_LBUTTONDOWN:
        drawing = True
        last_point = (x, y)
    elif event == cv2.EVENT_MOUSEMOVE and drawing:
        cv2.line(canvas, last_point, (x, y), (0, 0, 0), 12)
        last_point = (x, y)
    elif event == cv2.EVENT_LBUTTONUP:
        drawing = False
        last_point = None

cv2.namedWindow("MNIST Draw Board")
cv2.setMouseCallback("MNIST Draw Board", draw)

print("🎨 Draw a digit with the mouse.")
print("✅ Press 's' to save & predict.")
print("🧹 Press 'c' to clear.")
print("❌ Press 'q' to quit.")

# ======================
# ✅ 5. 主循环
# ======================
while True:
    cv2.imshow("MNIST Draw Board", canvas)
    key = cv2.waitKey(1) & 0xFF

    if key == ord('q'):
        break

    elif key == ord('c'):
        canvas[:] = 255  # 清空画板

    elif key == ord('s'):
        # 拷贝当前画布
        img_for_pred = canvas.copy()

        # 预处理成模型输入
        tensor = preprocess_image_for_mnist(img_for_pred)

        # 模型预测
        with torch.no_grad():
            outputs = model(tensor)
            _, predicted = torch.max(outputs, 1)
            result = predicted.item()

        print(f"🧠 Predicted digit: {result}")

        # 在窗口上显示识别结果（保留当前画面）
        display = img_for_pred.copy()
        cv2.putText(display, f"RES: {result}", (10, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 255), 3)

        # 显示预测结果窗口
        cv2.imshow("MNIST Draw Board", display)

        # 等待 2 秒，让你能看清结果
        key2 = cv2.waitKey(2000) & 0xFF
        if key2 == ord('q'):
            break
        elif key2 == ord('c'):
            canvas[:] = 255  # 清空
        else:
            # 2 秒后回到原画布
            cv2.imshow("MNIST Draw Board", canvas)


cv2.destroyAllWindows()
```

测试

```
python mnist_draw_predict.py
```

但是实际发现预测的效果一般。

* any list
{:toc}