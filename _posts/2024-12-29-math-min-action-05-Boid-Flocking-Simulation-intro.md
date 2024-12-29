---
layout: post
title: 最小作用量与群体行为模拟编程实现
date: 2024-12-29 01:18:08 +0800
categories: [Math]
tags: [math, sh]
published: true
---

# 前言

在网上刷到了最小作用量的视频，感觉很有趣。

和大家分享一下。


# 粒子系统与群体行为模拟

将最小作用量原理（Principle of Least Action）和编程结合，可以延伸到许多有趣和有用的领域。

除了物理模拟和优化问题外，还可以应用到以下几个领域，下面是一些更为有趣的编程实现，可以帮助你理解最小作用量原理在不同领域的应用。

## 1. 粒子系统与群体行为模拟

在计算机图形学和仿真中，最小作用量原理可用于模拟粒子系统和群体行为。

例如，在生命游戏、粒子动画或群体智能模拟中，个体或粒子在不断地寻找“最优”状态，最终形成一种平衡。

## 示例：群体行为模拟（鸟群飞行、鱼群游动）

使用最小作用量原理，模拟多个粒子（鸟群或鱼群）按照某种规则行为运动，最终达到群体协调的效果。

粒子会根据距离、速度和方向进行调整，以减少总的“作用量”。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Boid Simulation (Flocking)</title>
    <style>
        canvas { background: #f0f0f0; }
    </style>
</head>
<body>
    <h1>Boid Flocking Simulation</h1>
    <canvas id="canvas" width="600" height="400"></canvas>

    <script>
        const canvas = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");

        const boids = [];
        const numBoids = 50;
        const maxSpeed = 2;

        class Boid {
            constructor(x, y) {
                this.position = { x, y };
                this.velocity = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
                this.acceleration = { x: 0, y: 0 };
            }

            update() {
                // 移动
                this.position.x += this.velocity.x;
                this.position.y += this.velocity.y;

                // 边界条件：如果飞出边界，则反向
                if (this.position.x > canvas.width) this.position.x = 0;
                if (this.position.x < 0) this.position.x = canvas.width;
                if (this.position.y > canvas.height) this.position.y = 0;
                if (this.position.y < 0) this.position.y = canvas.height;

                // 更新速度
                this.velocity.x += this.acceleration.x;
                this.velocity.y += this.acceleration.y;

                // 限制速度
                const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    const scale = maxSpeed / speed;
                    this.velocity.x *= scale;
                    this.velocity.y *= scale;
                }

                // 清空加速度
                this.acceleration.x = 0;
                this.acceleration.y = 0;
            }

            applyForce(force) {
                this.acceleration.x += force.x;
                this.acceleration.y += force.y;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = 'black';
                ctx.fill();
            }
        }

        // 模拟每只鸟的行为
        function flocking() {
            boids.forEach(boid => {
                let alignForce = { x: 0, y: 0 };
                let cohesionForce = { x: 0, y: 0 };
                let separationForce = { x: 0, y: 0 };
                let total = 0;

                // 遍历所有其他鸟
                boids.forEach(otherBoid => {
                    if (otherBoid !== boid) {
                        const distance = Math.sqrt(
                            (boid.position.x - otherBoid.position.x)  2 + (boid.position.y - otherBoid.position.y)  2
                        );

                        if (distance < 50) {  // 近距离内鸟群聚集

                            // 对齐：让鸟和附近的鸟匹配速度
                            alignForce.x += otherBoid.velocity.x;
                            alignForce.y += otherBoid.velocity.y;

                            // 聚合：让鸟靠近附近的鸟
                            cohesionForce.x += otherBoid.position.x;
                            cohesionForce.y += otherBoid.position.y;

                            // 排斥：避免过度靠近
                            separationForce.x += boid.position.x - otherBoid.position.x;
                            separationForce.y += boid.position.y - otherBoid.position.y;

                            total++;
                        }
                    }
                });

                // 如果有相邻的鸟群，进行合并行为
                if (total > 0) {
                    alignForce.x /= total;
                    alignForce.y /= total;

                    cohesionForce.x /= total;
                    cohesionForce.y /= total;
                    cohesionForce.x -= boid.position.x;
                    cohesionForce.y -= boid.position.y;

                    separationForce.x /= total;
                    separationForce.y /= total;

                    // 调整合力的方向
                    boid.applyForce(alignForce);
                    boid.applyForce(cohesionForce);
                    boid.applyForce(separationForce);
                }

                boid.update();
                boid.draw();
            });
        }

        // 初始化鸟群
        for (let i = 0; i < numBoids; i++) {
            boids.push(new Boid(Math.random() * canvas.width, Math.random() * canvas.height));
        }

        // 动画循环
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            flocking();
            requestAnimationFrame(animate);
        }

        animate();
    </script>
</body>
</html>
```

在这个示例中，我们实现了一个鸟群（Boids）行为模拟。

每个粒子（鸟）会根据附近的鸟群调整自己的方向、速度和位置，遵循某些规则（如对齐、聚合和排斥）。

这种群体行为的模拟也可以视作应用最小作用量原理的一种方式，因为鸟群的行为是自适应的，能使得群体的整体能量最小化。

# 参考资料

* any list
{:toc}