---
layout: post
title: dive-into-llms-34-CNN（Convolutional Neural Network，卷积神经网络）介绍 
date: 2025-11-03 20:40:12 +0800
categories: [AI]
tags: [ai, learn-note]
published: true
---



# chat

## 如果我想实现连续多个数字的图片识别，要如何实现？

如何解决这个思路呢?

我们可以不修改单个 CNN 数字解析，然后实现这个功能。

要支持**“一张图片中包含多个数字”（比如 123），我们可以不改模型结构，

而是在推理阶段**（inference）做「多数字分割 + 批量识别」。

也就是说，CNN 依然是识别“单个数字”，我们让它对每个数字小块依次预测。

这样你不需要重新训练新模型，也能直接识别「连续多个数字」。

## 完整实现：支持多数字识别（改进版）

下面这份是你代码的直接改进版，核心改动只有两个地方：

识别前，用 OpenCV 找轮廓 自动切割出每个数字；

逐个送入 CNN 模型识别后，拼接成结果字符串。

```py
import cv2
import numpy as np
import torch
import torch.nn as nn
from PIL import Image
import torchvision.transforms as transforms

# ======================
# ✅ 1. 定义 CNN 模型结构
# ======================
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
# ✅ 3. 图像预处理
# ======================
def preprocess_image_for_mnist(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = cv2.bitwise_not(gray)
    pil = Image.fromarray(gray)
    try:
        resample = Image.Resampling.LANCZOS
    except AttributeError:
        resample = Image.ANTIALIAS
    pil = pil.resize((28, 28), resample)
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.5,), (0.5,))
    ])
    tensor = transform(pil).unsqueeze(0)
    return tensor


# ======================
# ✅ 4. 分割多个数字
# ======================
def segment_digits(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = cv2.bitwise_not(gray)
    _, thresh = cv2.threshold(gray, 30, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    boxes = [cv2.boundingRect(c) for c in contours]
    boxes = sorted(boxes, key=lambda x: x[0])  # 按 x 坐标从左到右排序

    digits = []
    for (x, y, w, h) in boxes:
        if w > 10 and h > 10:  # 过滤噪点
            digit_img = gray[y:y+h, x:x+w]
            # 在方框内补白背景，让比例居中
            size = max(w, h)
            square = np.ones((size, size), dtype=np.uint8) * 0
            offset_x = (size - w) // 2
            offset_y = (size - h) // 2
            square[offset_y:offset_y + h, offset_x:offset_x + w] = digit_img
            square = cv2.bitwise_not(square)
            digits.append(square)

    return digits


# ======================
# ✅ 5. 绘图窗口
# ======================
canvas = np.ones((280, 560, 3), dtype=np.uint8) * 255
drawing = False
last_point = None
prediction_text = None

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


cv2.namedWindow("🖌 MNIST Multi-Digit Board", cv2.WINDOW_NORMAL)
cv2.setMouseCallback("🖌 MNIST Multi-Digit Board", draw)

print("🎨 用鼠标左键画多个数字（例如：1234）")
print("✅ 按 's' 识别所有数字")
print("🧹 按 'c' 清空画布")
print("❌ 按 'q' 退出")

# ======================
# ✅ 6. 主循环
# ======================
while True:
    display = canvas.copy()
    if prediction_text is not None:
        cv2.putText(display, f"RES: {prediction_text}", (10, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 0, 255), 3)

    cv2.imshow("🖌 MNIST Multi-Digit Board", display)
    key = cv2.waitKey(10) & 0xFF

    if key == ord('q'):
        break

    elif key == ord('c'):
        canvas[:] = 255
        prediction_text = None

    elif key == ord('s'):
        img_for_pred = canvas.copy()
        digits = segment_digits(img_for_pred)

        if not digits:
            print("⚠️ 没检测到数字，请重试！")
            continue

        preds = []
        for d in digits:
            tensor = preprocess_image_for_mnist(cv2.cvtColor(d, cv2.COLOR_GRAY2BGR))
            with torch.no_grad():
                outputs = model(tensor)
                _, predicted = torch.max(outputs, 1)
                preds.append(str(predicted.item()))

        prediction_text = "".join(preds)
        print(f"🧠 Predicted digits: {prediction_text}")

cv2.destroyAllWindows()
```

## 效果

效果还行，下一步可以直接试一下重新训练一个支持多个字符的模型

* any list
{:toc}