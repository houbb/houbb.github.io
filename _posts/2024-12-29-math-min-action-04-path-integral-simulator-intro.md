---
layout: post
title: 最小作用量与路径积分模拟（粒子运动）编程实现
date: 2024-12-29 01:18:08 +0800
categories: [Math]
tags: [math, sh]
published: true
---

# 前言

在网上刷到了最小作用量的视频，感觉很有趣。

和大家分享一下。


# 弹跳球

## 源码实现

路径积分是量子力学中的概念，在这个例子中，我们模拟多个粒子的路径，展示它们的随机运动。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Path Integral Simulation</title>
    <style>
        canvas {
            border: 1px solid black;
            background-color: #f0f0f0;
        }
    </style>
</head>
<body>
    <h1>Path Integral Simulation</h1>
    <canvas id="canvas" width="600" height="400"></canvas>

    <script>
        // 设置Canvas和绘图上下文
        const canvas = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");

        const numPaths = 1000;  // 模拟的路径数
        const timeSteps = 100;  // 每条路径的时间步数
        const maxDisplacement = 10; // 最大位移

        function pathIntegral(numPaths, timeSteps) {
            const paths = [];
            for (let i = 0; i < numPaths; i++) {
                let path = [{ x: canvas.width / 2, y: canvas.height / 2 }]; // 初始位置
                for (let t = 1; t < timeSteps; t++) {
                    let lastPoint = path[path.length - 1];
                    // 随机选择一个新的位置
                    let newX = lastPoint.x + (Math.random() * 2 - 1) * maxDisplacement;
                    let newY = lastPoint.y + (Math.random() * 2 - 1) * maxDisplacement;
                    path.push({ x: newX, y: newY });
                }
                paths.push(path);
            }
            return paths;
        }

        function drawPaths(paths) {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空画布
            paths.forEach(path => {
                ctx.beginPath();
                path.forEach((point, index) => {
                    if (index === 0) {
                        ctx.moveTo(point.x, point.y);
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                });
                ctx.strokeStyle = 'blue';
                ctx.lineWidth = 0.5;
                ctx.stroke();
            });
        }

        // 启动路径积分模拟
        const paths = pathIntegral(numPaths, timeSteps);
        drawPaths(paths);
    </script>
</body>
</html>
```


# 参考资料

* any list
{:toc}