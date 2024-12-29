---
layout: post
title: 生态沙盒之鱼缸
date: 2024-12-29 01:18:08 +0800
categories: [Games]
tags: [games, sh]
published: true
---

# 前言

前两天刷视频，看到一个沙盒视频，感觉挺有趣，自己也想实现一下。

# 在线体验

游戏已经写好，在线版本：

> [https://houbb.github.io/games/slidingPuzzle/](https://houbb.github.io/games/slidingPuzzle/)

# 设定

要实现一个鱼缸生态沙盒的 HTML 实现，可以通过创建一个简单的模拟环境，其中有鱼、植物（比如水草）和水，模拟它们之间的互动关系，例如鱼吃植物、鱼之间的互动等。

以下是一个基于HTML和JavaScript的基本生态沙盒实现，包含了简单的生态系统，鱼的运动、植物的生长以及鱼和植物的互动。

## 思路：

1. 鱼：模拟鱼的运动，鱼有一定的速度，并且它们会在鱼缸中游动。鱼会吃水草并繁殖。

2. 水草：水草会随着时间增长，但也会受到鱼的吃食影响。

3. 生态规则：鱼吃水草，水草生长；鱼的种群数量随着时间变化，鱼的死亡和繁殖等。

## 实现步骤：

- 创建 `Fish` 类，模拟鱼的运动、吃食、死亡等行为。
- 创建 `Plant` 类，模拟水草的生长。
- 模拟一个简单的生态系统，其中鱼和水草之间互相作用。
- 通过定时更新和绘制来实现动态效果。

## 实现

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fish Tank Ecosystem</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f0f0f0;
        }

        canvas {
            border: 2px solid #000;
            background-color: #aaf;
        }
    </style>
</head>
<body>

<canvas id="canvas" width="600" height="400"></canvas>

<script>
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const numFish = 30; // 初始鱼的数量
    const numPlants = 50; // 初始水草的数量
    const maxFishSpeed = 2; // 鱼的最大速度
    const maxPlantGrowth = 10; // 水草最大生长量

    // 鱼类
    class Fish {
        constructor(x, y) {
            this.position = { x, y };
            this.velocity = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }; // 随机方向
            this.speed = Math.random() * maxFishSpeed;
        }

        update() {
            // 鱼的运动
            this.position.x += this.velocity.x * this.speed;
            this.position.y += this.velocity.y * this.speed;

            // 边界反射
            if (this.position.x > canvas.width || this.position.x < 0) {
                this.velocity.x = -this.velocity.x + Math.random() * 0.2 - 0.1; // 随机扰动
            }
            if (this.position.y > canvas.height || this.position.y < 0) {
                this.velocity.y = -this.velocity.y + Math.random() * 0.2 - 0.1;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = 'orange';
            ctx.fill();
        }

        eat(plant) {
            const distance = Math.sqrt(
                (this.position.x - plant.position.x) ** 2 + (this.position.y - plant.position.y) ** 2
            );
            if (distance < 15) {
                // 鱼吃到水草
                plant.size = Math.max(0, plant.size - 1); // 水草减少
                return true; // 鱼成功吃到水草
            }
            return false;
        }
    }

    // 水草类
    class Plant {
        constructor(x, y) {
            this.position = { x, y };
            this.size = Math.random() * maxPlantGrowth; // 水草初始大小
        }

        grow() {
            if (this.size < maxPlantGrowth) {
                this.size += 0.05; // 水草生长
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = 'green';
            ctx.fill();
        }
    }

    // 初始化鱼和水草
    const fishArray = [];
    const plantArray = [];

    for (let i = 0; i < numFish; i++) {
        fishArray.push(new Fish(Math.random() * canvas.width, Math.random() * canvas.height));
    }

    for (let i = 0; i < numPlants; i++) {
        plantArray.push(new Plant(Math.random() * canvas.width, Math.random() * canvas.height));
    }

    // 更新生态系统
    function updateEcosystem() {
        // 让鱼去吃水草
        fishArray.forEach(fish => {
            plantArray.forEach(plant => {
                if (fish.eat(plant)) {
                    // 如果鱼吃到水草，就停止循环
                    return;
                }
            });
        });

        // 让水草生长
        plantArray.forEach(plant => {
            plant.grow();
        });

        // 更新鱼的位置
        fishArray.forEach(fish => {
            fish.update();
        });
    }

    // 动画循环
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制水草
        plantArray.forEach(plant => {
            plant.draw();
        });

        // 绘制鱼
        fishArray.forEach(fish => {
            fish.draw();
        });

        // 更新生态系统
        updateEcosystem();

        requestAnimationFrame(animate);
    }

    animate();
</script>

</body>
</html>
```

## 解释

1. 鱼 (`Fish`) 类：
   - 位置 (`position`)：表示鱼的位置。
   - 速度 (`velocity`)：表示鱼的运动方向。
   - 速度 (`speed`)：控制鱼的游动速度。
   - `update` 方法：根据鱼的速度更新位置，并处理边界反射。
   - `eat` 方法：模拟鱼吃水草的行为，如果鱼靠近水草，则吃掉它，水草的大小减小。

2. 水草 (`Plant`) 类：
   - 位置 (`position`)：表示水草的位置。
   - 大小 (`size`)：水草的大小，随着时间逐渐生长，最大值为 `maxPlantGrowth`。
   - `grow` 方法：模拟水草的生长。
   - `draw` 方法：绘制水草。

3. 生态系统：
   - 每一帧更新时，鱼会去寻找并吃掉附近的水草。
   - 水草会不断生长，直到达到最大生长值。
   - 鱼和水草相互作用，鱼吃掉水草后，水草的大小减少。

4. 动画：
   - 使用 `requestAnimationFrame` 来创建平滑的动画循环。
   - 每一帧都会更新所有鱼和水草的位置以及状态。

## 改进与扩展

1. 鱼的繁殖：可以添加鱼的繁殖逻辑，当鱼吃到足够多的水草时，生成新的鱼。
2. 鱼的死亡：可以根据鱼的能量或生命周期来模拟鱼的死亡，或者如果鱼没有食物（水草），它就会死亡。
3. 多种鱼类：可以添加不同种类的鱼，它们有不同的速度、大小和行为。
4. 水草的死亡：水草可以受到鱼食用的影响，逐渐枯萎或死亡。

这个实现是一个基本的生态沙盒，可以通过增加更多的生态规则和交互来扩展这个系统，使其更加复杂和有趣。



# 参考资料

* any list
{:toc}