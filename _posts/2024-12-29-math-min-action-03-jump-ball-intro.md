---
layout: post
title: 最小作用量与弹跳球编程实现
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

```html
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>弹跳球模拟</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      background-color: #f0f0f0;
    }
    canvas {
      display: block;
      background-color: #fff;
    }
  </style>
</head>
<body>
  <canvas id="ballCanvas"></canvas>

  <script>
    const canvas = document.getElementById('ballCanvas');
    const ctx = canvas.getContext('2d');
    const g = 0.2;  // 重力加速度
    const damping = 0.9;  // 弹性碰撞的能量损失系数
    let width, height;

    // 设置canvas尺寸
    function resizeCanvas() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }

    // 球体属性
    let ball = {
      x: 0,           // 初始X位置
      y: 0,           // 初始Y位置
      radius: 20,     // 半径
      vx: 3,          // X轴速度
      vy: -10,        // Y轴速度（向上）
      color: 'red'    // 球的颜色
    };

    // 更新球的位置和速度
    function updateBall() {
      // 更新速度（考虑重力）
      ball.vy += g;

      // 更新位置
      ball.x += ball.vx;
      ball.y += ball.vy;

      // 碰到地面，反弹
      if (ball.y + ball.radius > height) {
        ball.y = height - ball.radius;  // 保证球不穿过地面
        ball.vy = -ball.vy * damping;   // 反向速度并减小弹性
      }

      // 碰到左右边界，反弹
      if (ball.x + ball.radius > width || ball.x - ball.radius < 0) {
        ball.vx = -ball.vx * damping;
      }
    }

    // 绘制球体
    function drawBall() {
      ctx.clearRect(0, 0, width, height);  // 清空画布
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = ball.color;
      ctx.fill();
      ctx.closePath();
    }

    // 动画循环
    function animate() {
      updateBall();
      drawBall();
      requestAnimationFrame(animate);
    }

    // 初始化
    function init() {
      resizeCanvas();  // 确保先设置canvas尺寸
      ball.x = width / 2;  // 使用动态的canvas宽度
      ball.y = height / 2; // 使用动态的canvas高度
      animate();
    }

    // 调整窗口大小时重新设置canvas
    window.addEventListener('resize', resizeCanvas);

    init();
  </script>
</body>
</html>
```


# 参考资料

* any list
{:toc}