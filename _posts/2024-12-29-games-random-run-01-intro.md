---
layout: post
title: 生态沙盒之狼、羊、草
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

帮我用 html 实现一个 生态沙盒之狼、羊、草。

狼吃羊，羊吃草。

引入时间系统，一年 365 天，四季春夏秋冬。一年一个轮回，每天的天气可以随机模拟现实。

春夏多雨水，有助于草生长，冬天会下雪。

草会每天定时更新生成，生成后不会移动。春天生成速率为4，夏天为3，秋天为2，冬天为1。

羊会成群移动，看到狼会分散逃跑。羊分为公母两种性别，公母遇到一起会产生新的小羊。遇到草会吃掉草。

狼也会随机移动，碰到羊会吃掉羊。狼分性别：公母。公母遇到一起会产生新小狼。狼也是。 

羊吃不到草会衰弱，狼吃不到羊也会衰弱。衰弱后移动速度越来越慢，吃到食物后恢复，超过7天没有食物则会死亡消失。

生物的尸体会滋润土地，让草长的速率大幅度提高。

## 实现

```html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>狼、羊、草 沙盒模拟</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            display: flex;
            justify-content: space-between;
            margin: 0;
        }
        .left-panel {
            flex-grow: 1;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
        }
        .sandbox {
            display: grid;
            grid-template-columns: repeat(50, 15px);
            grid-template-rows: repeat(50, 15px);
            gap: 1px;
            margin-top: 20px;
        }
        .cell {
            width: 15px;
            height: 15px;
            border: 1px solid #ccc;
            text-align: center;
            vertical-align: middle;
            font-size: 12px;
            font-family: "Segoe UI Emoji", sans-serif;
        }
        .wolf {
            color: red;
        }
        .sheep {
            color: lightgreen;
        }
        .grass {
            color: green;
        }
        .empty {
            background-color: white;
        }
        .right-panel {
            width: 250px;
            margin-top: 20px;
            padding: 20px;
            background-color: #fff;
            border: 1px solid #ccc;
            font-size: 16px;
            text-align: left;
        }
        .right-panel div {
            margin: 10px 0;
        }
    </style>
</head>
<body>

    <div class="left-panel">
        <div class="sandbox" id="sandbox"></div>
    </div>
    
    <div class="right-panel">
        <h3>统计信息</h3>
        <div>当前天气: <span id="weather"></span></div>
        <div>当前季节: <span id="season"></span></div>
        <div>时间: <span id="time"></span></div>
        <div>狼的数量: <span id="wolfCount"></span></div>
        <div>羊的数量: <span id="sheepCount"></span></div>
        <div>草的数量: <span id="grassCount"></span></div>
        <div>模拟时间: <span id="simTime"></span> 秒</div>
    </div>

    <button onclick="startSimulation()">开始模拟</button>

    <script>
        const sandboxSize = 50;
        const seasons = ['春', '夏', '秋', '冬'];
        let grid = [];
        let animals = {
            wolf: [],
            sheep: []
        };
        let grass = [];
        let seasonIndex = 0;
        let weather = '晴天';
        let simTime = 0;
        let simInterval;
        
        function createSandbox() {
            const sandbox = document.getElementById('sandbox');
            for (let i = 0; i < sandboxSize; i++) {
                const row = [];
                for (let j = 0; j < sandboxSize; j++) {
                    const cell = document.createElement('div');
                    cell.classList.add('cell');
                    cell.dataset.row = i;
                    cell.dataset.col = j;
                    sandbox.appendChild(cell);
                    row.push(cell);
                }
                grid.push(row);
            }
        }

        function randomPosition() {
            return {
                row: Math.floor(Math.random() * sandboxSize),
                col: Math.floor(Math.random() * sandboxSize)
            };
        }

        function initializeEntities() {
            // 初始化草
            for (let i = 0; i < 500; i++) {
                const pos = randomPosition();
                if (!grass.some(g => g.row === pos.row && g.col === pos.col)) {
                    grass.push(pos);
                    grid[pos.row][pos.col].innerText = '🌿';
                }
            }
            // 初始化羊
            for (let i = 0; i < 20; i++) {
                const pos = randomPosition();
                animals.sheep.push(pos);
                grid[pos.row][pos.col].innerText = '🐑';
            }
            // 初始化狼
            for (let i = 0; i < 10; i++) {
                const pos = randomPosition();
                animals.wolf.push(pos);
                grid[pos.row][pos.col].innerText = '🐺';
            }
        }

        function nextSeason() {
            seasonIndex = (seasonIndex + 1) % 4;
            updateWeather();
        }

        function updateWeather() {
            // 简单的天气变化逻辑
            const weatherConditions = ['晴天', '雨天', '暴风雪'];
            weather = weatherConditions[Math.floor(Math.random() * 3)];
            document.getElementById('weather').textContent = weather;
        }

        function moveAnimals() {
			// 移动狼
			animals.wolf.forEach(wolf => {
				// 计算新位置
				const direction = Math.random() > 0.5 ? 1 : -1;
				const newRow = wolf.row + direction * (Math.random() > 0.5 ? 1 : 0);
				const newCol = wolf.col + direction * (Math.random() > 0.5 ? 1 : 0);

				// 判断新位置是否越界
				if (newRow >= 0 && newRow < sandboxSize && newCol >= 0 && newCol < sandboxSize) {
					// 清空原位置
					grid[wolf.row][wolf.col].innerText = ' ';

					// 更新狼的位置
					wolf.row = newRow;
					wolf.col = newCol;

					const cell = grid[wolf.row][wolf.col];

					// 狼碰到羊，吃掉羊
					if (cell.innerText === '🐑') {
						animals.sheep = animals.sheep.filter(s => s.row !== wolf.row || s.col !== wolf.col);
						cell.innerText = '🐺';
						// 羊的数量减少
						sheepCount--;
					} else {
						cell.innerText = '🐺';
					}
				}
			});

			// 移动羊
			animals.sheep.forEach(sheep => {
				// 计算新位置
				const direction = Math.random() > 0.5 ? 1 : -1;
				const newRow = sheep.row + direction * (Math.random() > 0.5 ? 1 : 0);
				const newCol = sheep.col + direction * (Math.random() > 0.5 ? 1 : 0);

				// 判断新位置是否越界
				if (newRow >= 0 && newRow < sandboxSize && newCol >= 0 && newCol < sandboxSize) {
					// 清空原位置
					grid[sheep.row][sheep.col].innerText = ' ';

					// 更新羊的位置
					sheep.row = newRow;
					sheep.col = newCol;

					const cell = grid[sheep.row][sheep.col];

					// 羊碰到草，吃掉草
					if (cell.innerText === '🌿') {
						grass = grass.filter(g => g.row !== sheep.row || g.col !== sheep.col);
						cell.innerText = '🐑';
						// 草的数量减少
						grassCount--;
					} else {
						cell.innerText = '🐑';
					}
				}
			});
		}


        function growGrass() {
            if (weather === '晴天' && seasonIndex === 0) {
                // 春天晴天草快速生长
                if (grass.length < 1000) {
                    const pos = randomPosition();
                    if (!grass.some(g => g.row === pos.row && g.col === pos.col)) {
                        grass.push(pos);
                        grid[pos.row][pos.col].innerText = '🌿';
                    }
                }
            }
        }

        function updateStats() {
            document.getElementById('season').textContent = seasons[seasonIndex];
            document.getElementById('time').textContent = new Date().toLocaleTimeString();
            document.getElementById('wolfCount').textContent = animals.wolf.length;
            document.getElementById('sheepCount').textContent = animals.sheep.length;
            document.getElementById('grassCount').textContent = grass.length;
            document.getElementById('simTime').textContent = simTime;
        }

		function resetInfo() {
			grid = [];
			animals = {
				wolf: [],
				sheep: []
			};
			grass = [];
			seasonIndex = 0;
			weather = '晴天';
			simTime = 0;
		}
		
		createSandbox();
        initializeEntities();
			
        function startSimulation() {
            simInterval = setInterval(() => {
                moveAnimals();
                growGrass();
                nextSeason();
                simTime++;
                updateStats();
            }, 1000); // 现实 1 分钟对应沙盒 1 小时
        }
    </script>

</body>
</html>
```

# OPT1: 移动优化

## 需求

1）羊每次更新移动1步，优先向距离草最近的方向移动。如果目标位置有羊，则不做移动

2）狼每次更新，移动2步，优先向距离羊最近的方向移动。如果目标位置有狼，则不做移动

## 核心代码

```js
function findClosestEntity(entity, entityType) {
    const entityPositions = entityType === 'sheep' ? animals.sheep : grass;
    let closestEntity = null;
    let minDistance = Infinity;
    entityPositions.forEach(pos => {
        const distance = Math.abs(entity.row - pos.row) + Math.abs(entity.col - pos.col);
        if (distance < minDistance) {
            minDistance = distance;
            closestEntity = pos;
        }
    });
    return closestEntity;
}
```

# OPT2: 新生机制

## 需求

1）草每次更新，在空格的位置定时更新 10 个。

2）羊每吃一次草，产生一只新羊

3）狼每吃一次羊，产生一只新狼

# OPT3: 死亡机制

## 需求

1）如果一只羊，连续30次更新没有吃到草，则衰老死亡。如果一只狼，连续30次更新没有吃到草，则衰老死亡。

2）一只狼超过 100 次，一只羊超过 100 次，则衰老死亡。


# v2-鬼畜版移动

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>生态沙盒 - 狼、羊与草</title>
    <style>
        canvas {
            background-color: #f0f0f0;
        }
        .info {
            font-family: Arial, sans-serif;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <h1>生态沙盒 - 狼、羊与草</h1>
    <canvas id="canvas" width="800" height="600"></canvas>
    <div class="info">
        <p><strong>按键说明:</strong></p>
        <p>按下 "Start" 开始模拟，按下 "Pause" 停止模拟。</p>
    </div>

    <script>
        const canvas = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");

        // 初始参数
        const maxSheep = 20; // 羊的数量
        const maxWolves = 5; // 狼的数量
        const maxGrass = 100; // 草的数量

        const sheepArray = [];
        const wolfArray = [];
        const grassArray = [];

        // 构造草对象
        class Grass {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = 5;
            }
            grow() {
                // 草有几率变大
                if (Math.random() < 0.01) {
                    this.size = 5 + Math.random() * 3; // 随机变大
                }
            }
            draw() {
                ctx.font = `${this.size}px sans-serif`;
                ctx.fillStyle = "green";
                ctx.fillText("🌿", this.x, this.y);
            }
        }

        // 构造羊对象
        class Sheep {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = 20;
                this.energy = 100; // 羊的能量
                this.speed = 2;
            }
            move() {
                this.x += Math.random() * this.speed * 2 - this.speed;
                this.y += Math.random() * this.speed * 2 - this.speed;
                this.x = Math.max(0, Math.min(canvas.width, this.x)); // 保持在画布内
                this.y = Math.max(0, Math.min(canvas.height, this.y)); // 保持在画布内
            }
            eat(grass) {
                const dist = Math.sqrt(Math.pow(this.x - grass.x, 2) + Math.pow(this.y - grass.y, 2));
                if (dist < this.size + grass.size) {
                    grass.size = 0; // 羊吃掉草
                    this.energy += 20; // 羊增加能量
                    return true;
                }
                return false;
            }
            draw() {
                ctx.font = `${this.size}px sans-serif`;
                ctx.fillStyle = "white";
                ctx.fillText("🐑", this.x, this.y);
            }
        }

        // 构造狼对象
        class Wolf {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = 25;
                this.energy = 200; // 狼的能量
                this.speed = 3;
            }
            move() {
                this.x += Math.random() * this.speed * 2 - this.speed;
                this.y += Math.random() * this.speed * 2 - this.speed;
                this.x = Math.max(0, Math.min(canvas.width, this.x)); // 保持在画布内
                this.y = Math.max(0, Math.min(canvas.height, this.y)); // 保持在画布内
            }
            hunt(sheep) {
                const dist = Math.sqrt(Math.pow(this.x - sheep.x, 2) + Math.pow(this.y - sheep.y, 2));
                if (dist < this.size + sheep.size) {
                    this.energy += 50; // 吃掉羊获得能量
                    sheep.energy = 0; // 羊被吃掉
                    return true;
                }
                return false;
            }
            draw() {
                ctx.font = `${this.size}px sans-serif`;
                ctx.fillStyle = "gray";
                ctx.fillText("🐺", this.x, this.y);
            }
        }

        // 初始化生态系统
        function init() {
            // 创建草
            for (let i = 0; i < maxGrass; i++) {
                grassArray.push(new Grass(Math.random() * canvas.width, Math.random() * canvas.height));
            }
            // 创建羊
            for (let i = 0; i < maxSheep; i++) {
                sheepArray.push(new Sheep(Math.random() * canvas.width, Math.random() * canvas.height));
            }
            // 创建狼
            for (let i = 0; i < maxWolves; i++) {
                wolfArray.push(new Wolf(Math.random() * canvas.width, Math.random() * canvas.height));
            }
        }

        // 更新和绘制生态系统
        function update() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 更新草的状态
            grassArray.forEach(grass => {
                grass.grow();
                grass.draw();
            });

            // 更新羊的状态
            sheepArray.forEach(sheep => {
                sheep.move();
                // 羊吃草
                grassArray.forEach(grass => {
                    if (sheep.eat(grass)) {
                        grassArray.splice(grassArray.indexOf(grass), 1);
                        grassArray.push(new Grass(Math.random() * canvas.width, Math.random() * canvas.height));
                    }
                });
                sheep.draw();
            });

            // 更新狼的状态
            wolfArray.forEach(wolf => {
                wolf.move();
                // 狼捕食羊
                sheepArray.forEach(sheep => {
                    if (wolf.hunt(sheep)) {
                        sheepArray.splice(sheepArray.indexOf(sheep), 1);
                    }
                });
                wolf.draw();
            });

            // 移除死去的羊
            sheepArray.forEach(sheep => {
                if (sheep.energy <= 0) {
                    sheepArray.splice(sheepArray.indexOf(sheep), 1);
                }
            });

            // 移除死去的狼
            wolfArray.forEach(wolf => {
                if (wolf.energy <= 0) {
                    wolfArray.splice(wolfArray.indexOf(wolf), 1);
                }
            });

            // 更新草数量
            if (grassArray.length < maxGrass) {
                grassArray.push(new Grass(Math.random() * canvas.width, Math.random() * canvas.height));
            }
        }

        // 启动模拟
        let running = true;
        function animate() {
            if (running) {
                update();
            }
            requestAnimationFrame(animate);
        }

        // 按钮操作
        window.onload = () => {
            init();
            animate();
        };
    </script>
</body>
</html>
```

# v3-疯狂移动版本

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>生态沙盒 - 狼、羊与草</title>
    <style>
        canvas {
            background-color: #f0f0f0;
        }
        .info {
            font-family: Arial, sans-serif;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <h1>生态沙盒 - 狼、羊与草</h1>
    <canvas id="canvas" width="800" height="600"></canvas>
    <div class="info">
        <p><strong>按键说明:</strong></p>
        <p>按下 "Start" 开始模拟，按下 "Pause" 停止模拟。</p>
    </div>

    <script>
        const canvas = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");

        // 初始参数
        const maxSheep = 20; // 羊的数量
        const maxWolves = 5; // 狼的数量
        const maxGrass = 100; // 草的数量

        const sheepArray = [];
        const wolfArray = [];
        const grassArray = [];

        // 构造草对象
        class Grass {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = 5;
            }
            grow() {
                // 草有几率变大
                if (Math.random() < 0.01) {
                    this.size = 5 + Math.random() * 3; // 随机变大
                }
            }
            draw() {
                ctx.font = `${this.size}px sans-serif`;
                ctx.fillStyle = "green";
                ctx.fillText("🌿", this.x, this.y);
            }
        }

        // 构造羊对象
        class Sheep {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = 20;
                this.energy = 100; // 羊的能量
                this.speed = 2;
                this.isScattering = false;
                this.targetX = this.x;
                this.targetY = this.y;
            }
            move() {
                // 羊群行为：优先向草移动
                const closestGrass = this.findClosestGrass();
                if (closestGrass) {
                    let angle = Math.atan2(closestGrass.y - this.y, closestGrass.x - this.x);
                    this.x += this.speed * Math.cos(angle);
                    this.y += this.speed * Math.sin(angle);
                } else {
                    // 如果没有草可吃，羊进行随机移动或群体行为
                    if (this.isScattering) {
                        this.x += Math.random() * this.speed * 2 - this.speed;
                        this.y += Math.random() * this.speed * 2 - this.speed;
                        if (Math.random() < 0.05) this.isScattering = false; // 停止散开
                    } else {
                        let angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
                        this.x += this.speed * Math.cos(angle);
                        this.y += this.speed * Math.sin(angle);
                    }
                }
                this.x = Math.max(0, Math.min(canvas.width, this.x)); // 保持在画布内
                this.y = Math.max(0, Math.min(canvas.height, this.y)); // 保持在画布内
            }

            findClosestGrass() {
                let closestGrass = null;
                let minDist = Infinity;
                grassArray.forEach(grass => {
                    const dist = Math.sqrt(Math.pow(this.x - grass.x, 2) + Math.pow(this.y - grass.y, 2));
                    if (dist < minDist) {
                        minDist = dist;
                        closestGrass = grass;
                    }
                });
                return closestGrass;
            }

            eat(grass) {
                const dist = Math.sqrt(Math.pow(this.x - grass.x, 2) + Math.pow(this.y - grass.y, 2));
                if (dist < this.size + grass.size) {
                    grass.size = 0; // 羊吃掉草
                    this.energy += 20; // 羊增加能量
                    return true;
                }
                return false;
            }

            draw() {
                ctx.font = `${this.size}px sans-serif`;
                ctx.fillStyle = "white";
                ctx.fillText("🐑", this.x, this.y);
            }
        }

        // 构造狼对象
        class Wolf {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = 25;
                this.energy = 200; // 狼的能量
                this.speed = 2;
                this.targetX = this.x;
                this.targetY = this.y;
            }
            move() {
                // 向羊群移动
                const closestSheep = this.findClosestSheep();
                if (closestSheep) {
                    let angle = Math.atan2(closestSheep.y - this.y, closestSheep.x - this.x);
                    this.x += this.speed * Math.cos(angle);
                    this.y += this.speed * Math.sin(angle);
                }
                this.x = Math.max(0, Math.min(canvas.width, this.x)); // 保持在画布内
                this.y = Math.max(0, Math.min(canvas.height, this.y)); // 保持在画布内
            }

            hunt(sheep) {
                const dist = Math.sqrt(Math.pow(this.x - sheep.x, 2) + Math.pow(this.y - sheep.y, 2));
                if (dist < this.size + sheep.size) {
                    this.energy += 50; // 吃掉羊获得能量
                    sheep.energy = 0; // 羊被吃掉
                    return true;
                }
                return false;
            }

            findClosestSheep() {
                let closestSheep = null;
                let minDist = Infinity;
                sheepArray.forEach(sheep => {
                    const dist = Math.sqrt(Math.pow(this.x - sheep.x, 2) + Math.pow(this.y - sheep.y, 2));
                    if (dist < minDist) {
                        minDist = dist;
                        closestSheep = sheep;
                    }
                });
                return closestSheep;
            }

            draw() {
                ctx.font = `${this.size}px sans-serif`;
                ctx.fillStyle = "gray";
                ctx.fillText("🐺", this.x, this.y);
            }
        }

        // 初始化生态系统
        function init() {
            // 创建草
            for (let i = 0; i < maxGrass; i++) {
                grassArray.push(new Grass(Math.random() * canvas.width, Math.random() * canvas.height));
            }
            // 创建羊
            for (let i = 0; i < maxSheep; i++) {
                sheepArray.push(new Sheep(Math.random() * canvas.width, Math.random() * canvas.height));
            }
            // 创建狼
            for (let i = 0; i < maxWolves; i++) {
                wolfArray.push(new Wolf(Math.random() * canvas.width, Math.random() * canvas.height));
            }
        }

        // 更新和绘制生态系统
        function update() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 更新草的状态
            grassArray.forEach(grass => {
                grass.grow();
                grass.draw();
            });

            // 更新羊的状态
            sheepArray.forEach(sheep => {
                sheep.move();
                // 羊吃草
                grassArray.forEach(grass => {
                    if (sheep.eat(grass)) {
                        grassArray.splice(grassArray.indexOf(grass), 1);
                        grassArray.push(new Grass(Math.random() * canvas.width, Math.random() * canvas.height));
                    }
                });
                sheep.draw();
            });

            // 更新狼的状态
            wolfArray.forEach(wolf => {
                wolf.move();
                // 狼捕食羊
                sheepArray.forEach(sheep => {
                    if (wolf.hunt(sheep)) {
                        sheepArray.splice(sheepArray.indexOf(sheep), 1);
                    }
                });
                wolf.draw();
            });

            // 移除死去的羊
            sheepArray.forEach(sheep => {
                if (sheep.energy <= 0) {
                    sheepArray.splice(sheepArray.indexOf(sheep), 1);
                }
            });

            // 移除死去的狼
            wolfArray.forEach(wolf => {
                if (wolf.energy <= 0) {
                    wolfArray.splice(wolfArray.indexOf(wolf), 1);
                }
            });

            // 更新草数量
            if (grassArray.length < maxGrass) {
                grassArray.push(new Grass(Math.random() * canvas.width, Math.random() * canvas.height));
            }

            // 显示统计信息
            document.querySelector('.info').innerHTML = `
                <p>羊数量: ${sheepArray.length}</p>
                <p>狼数量: ${wolfArray.length}</p>
                <p>草数量: ${grassArray.length}</p>
            `;
        }

        // 启动模拟
        init();
        setInterval(update, 1000 / 60); // 60 FPS
    </script>
</body>
</html>
```

会发现一个问题，很快狼就把羊吃完了。

# v3-引入羊群的繁衍

当然 这里还是缺少了狼群的繁衍机制，但是相对比较平衡。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>生态沙盒 - 狼、羊与草</title>
    <style>
        canvas {
            background-color: #f0f0f0;
        }
        .info {
            font-family: Arial, sans-serif;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <h1>生态沙盒 - 狼、羊与草</h1>
    <canvas id="canvas" width="1600" height="800"></canvas>
    <div class="info">
        <p><strong>按键说明:</strong></p>
        <p>按下 "Start" 开始模拟，按下 "Pause" 停止模拟。</p>
    </div>

    <script>
        const canvas = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");

        // 初始参数
        const maxSheep = 20; // 羊的数量
        const maxWolves = 5; // 狼的数量
        const maxGrass = 100; // 草的数量

        const sheepArray = [];
        const wolfArray = [];
        const grassArray = [];

        // 构造草对象
        class Grass {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = 5;
            }
            grow() {
                // 草有几率变大
                if (Math.random() < 0.05) { // 草生长的概率提高
                    this.size = 5 + Math.random() * 3; // 随机变大
                }
            }
            draw() {
                ctx.font = `${this.size}px sans-serif`;
                ctx.fillStyle = "green";
                ctx.fillText("🌿", this.x, this.y);
            }
        }

        // 构造羊对象
        class Sheep {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = 20;
                this.energy = 100; // 羊的能量
                this.speed = 1;
                this.isScattering = false;
                this.targetX = this.x;
                this.targetY = this.y;
            }
            move() {
                // 羊群行为：优先向草移动
                const closestGrass = this.findClosestGrass();
                if (closestGrass) {
                    let angle = Math.atan2(closestGrass.y - this.y, closestGrass.x - this.x);
                    this.x += this.speed * Math.cos(angle);
                    this.y += this.speed * Math.sin(angle);
                } else {
                    // 如果没有草可吃，羊进行随机移动或群体行为
                    if (this.isScattering) {
                        this.x += Math.random() * this.speed * 2 - this.speed;
                        this.y += Math.random() * this.speed * 2 - this.speed;
                        if (Math.random() < 0.05) this.isScattering = false; // 停止散开
                    } else {
                        let angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
                        this.x += this.speed * Math.cos(angle);
                        this.y += this.speed * Math.sin(angle);
                    }
                }
                this.x = Math.max(0, Math.min(canvas.width, this.x)); // 保持在画布内
                this.y = Math.max(0, Math.min(canvas.height, this.y)); // 保持在画布内
                this.energy -= 0.1; // 移动消耗能量
            }

            findClosestGrass() {
                let closestGrass = null;
                let minDist = Infinity;
                grassArray.forEach(grass => {
                    const dist = Math.sqrt(Math.pow(this.x - grass.x, 2) + Math.pow(this.y - grass.y, 2));
                    if (dist < minDist) {
                        minDist = dist;
                        closestGrass = grass;
                    }
                });
                return closestGrass;
            }

            eat(grass) {
                const dist = Math.sqrt(Math.pow(this.x - grass.x, 2) + Math.pow(this.y - grass.y, 2));
                if (dist < this.size + grass.size) {
                    grass.size = 0; // 羊吃掉草
                    this.energy += 30; // 羊增加能量
                    return true;
                }
                return false;
            }

            breed() {
			    // 避免羊群膨胀
                if (this.energy >= 200 && sheepArray.length < 100) {
                    this.energy -= 100; // 繁殖消耗能量
                    return new Sheep(Math.random() * canvas.width, Math.random() * canvas.height); // 新羊出生
                }
                return null;
            }

            draw() {
                ctx.font = `${this.size}px sans-serif`;
                ctx.fillStyle = "white";
                ctx.fillText("🐑", this.x, this.y);
            }
        }

        // 构造狼对象
        class Wolf {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = 25;
                this.energy = 200; // 狼的能量
                this.speed = 2;
                this.targetX = this.x;
                this.targetY = this.y;
            }
            move() {
                // 向羊群移动
                const closestSheep = this.findClosestSheep();
                if (closestSheep) {
                    let angle = Math.atan2(closestSheep.y - this.y, closestSheep.x - this.x);
                    this.x += this.speed * Math.cos(angle);
                    this.y += this.speed * Math.sin(angle);
                }
                this.x = Math.max(0, Math.min(canvas.width, this.x)); // 保持在画布内
                this.y = Math.max(0, Math.min(canvas.height, this.y)); // 保持在画布内
                this.energy -= 0.5; // 狼每次移动消耗能量
            }

            hunt(sheep) {
                const dist = Math.sqrt(Math.pow(this.x - sheep.x, 2) + Math.pow(this.y - sheep.y, 2));
                if (dist < this.size + sheep.size) {
                    this.energy += 50; // 吃掉羊获得能量
                    sheep.energy = 0; // 羊被吃掉
                    return true;
                }
                return false;
            }

            findClosestSheep() {
                let closestSheep = null;
                let minDist = Infinity;
                sheepArray.forEach(sheep => {
                    const dist = Math.sqrt(Math.pow(this.x - sheep.x, 2) + Math.pow(this.y - sheep.y, 2));
                    if (dist < minDist) {
                        minDist = dist;
                        closestSheep = sheep;
                    }
                });
                return closestSheep;
            }

            draw() {
                ctx.font = `${this.size}px sans-serif`;
                ctx.fillStyle = "gray";
                ctx.fillText("🐺", this.x, this.y);
            }
        }

        // 初始化生态系统
        function init() {
            // 创建草
            for (let i = 0; i < maxGrass; i++) {
                grassArray.push(new Grass(Math.random() * canvas.width, Math.random() * canvas.height));
            }
            // 创建羊
            for (let i = 0; i < maxSheep; i++) {
                sheepArray.push(new Sheep(Math.random() * canvas.width, Math.random() * canvas.height));
            }
            // 创建狼
            for (let i = 0; i < maxWolves; i++) {
                wolfArray.push(new Wolf(Math.random() * canvas.width, Math.random() * canvas.height));
            }
        }

        // 更新和绘制生态系统
        function update() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 更新草的状态
            grassArray.forEach(grass => {
                grass.grow();
                grass.draw();
            });

            // 更新羊的状态
            let newSheep = [];
            sheepArray.forEach(sheep => {
                sheep.move();
                // 羊吃草
                grassArray.forEach(grass => {
                    if (sheep.eat(grass)) {
                        grassArray.splice(grassArray.indexOf(grass), 1);
                        grassArray.push(new Grass(Math.random() * canvas.width, Math.random() * canvas.height));
                    }
                });
                // 羊繁殖
                let babySheep = sheep.breed();
                if (babySheep) {
                    newSheep.push(babySheep);
                }
                sheep.draw();
            });
            sheepArray.push(...newSheep);

            // 更新狼的状态
            wolfArray.forEach(wolf => {
                wolf.move();
                // 狼捕食羊
                sheepArray.forEach(sheep => {
                    if (wolf.hunt(sheep)) {
                        sheepArray.splice(sheepArray.indexOf(sheep), 1);
                    }
                });
                wolf.draw();
            });

            // 移除死去的羊
            sheepArray.forEach(sheep => {
                if (sheep.energy <= 0) {
                    sheepArray.splice(sheepArray.indexOf(sheep), 1);
                }
            });

            // 移除死去的狼
            wolfArray.forEach(wolf => {
                if (wolf.energy <= 0) {
                    wolfArray.splice(wolfArray.indexOf(wolf), 1);
                }
            });

            // 更新草数量
            if (grassArray.length < maxGrass) {
                grassArray.push(new Grass(Math.random() * canvas.width, Math.random() * canvas.height));
            }

            // 显示统计信息
            document.querySelector('.info').innerHTML = `
                <p>羊数量: ${sheepArray.length}</p>
                <p>狼数量: ${wolfArray.length}</p>
                <p>草数量: ${grassArray.length}</p>
            `;
        }

        // 启动模拟
        init();
        setInterval(update, 1000 / 60); // 60 FPS
    </script>
</body>
</html>
```


# 让其更加有趣的一些方式

为了让这个沙盒更加真实和有趣，可以从以下几个方面进行改进：

### 1. 增加生态平衡与互动
   - 食物链关系：狼和羊之间的互动可以变得更具生动性。例如，狼可以捕食羊，羊可以吃草，草在被吃掉后需要一定时间才能重新生长。
     - 捕食与繁殖机制：狼吃掉羊后可以繁殖出新的狼，而羊被吃掉会影响羊群的数量。这样可以模拟食物链和生态平衡的动态变化。
     - 羊的繁殖：羊在食物丰富的情况下会繁殖，数量增多。草的生长速度和羊的数量相关。草短缺时，羊的繁殖速度会变慢。

### 2. 天气与季节影响
   - 天气变化：可以加入天气变化机制，例如晴天、雨天、雪天等，不同天气对动物行为和草的生长速度产生影响。
     - 下雨：雨天可以加速草的生长，但狼和羊的移动速度减慢。
     - 寒冷天气：冬季可能导致草的生长停止，狼和羊的活动减少，羊可能需要更多的食物来维持生存。
   
   - 季节变化：在不同的季节，草的生长和动物的活动有所不同。例如，冬季草可能不再生长，动物也可能会寻找更多的食物，甚至进入冬眠状态。

### 3. 随机事件与突发情况
   - 疾病或灾难：引入一些随机事件，例如突然爆发的疾病或自然灾害，可能会影响动物的数量。比如，草可能因病害无法生长，狼和羊的数量减少。
   - 动物行为改变：狼和羊可能有某些时段进入“警戒模式”或休息模式，改变它们的移动和捕食行为。

### 4. 更智能的行为模型
   - 群体行为：狼和羊不仅可以根据单独的目标（如最近的羊或草）做出反应，还可以形成群体行为。例如，狼群可以合作围捕羊群，羊群可以相互保护避免被狼捕捉。
     - 羊群中的羊可以通过彼此靠近来提高逃脱的几率。
     - 狼群的协同捕猎可以在猎物数量多时更有效地捕捉羊。

### 5. 环境影响
   - 地形和障碍物：加入不同的地形（如山脉、河流、树林）可以让动物的移动变得更加复杂。有些地形可能会阻碍狼和羊的移动，增加策略性。
   - 有限的空间：设定特定的区域作为动物的栖息地，动物在栖息地附近活动，并且在一定范围内寻找食物和伙伴。

### 6. 时间与事件的关联
   - 昼夜循环：引入昼夜循环，不同时间段动物的活动有所不同。比如白天狼更加活跃，羊也容易找到草，而夜间它们会寻找避难所休息。
   - 繁殖周期：动物的繁殖不应是瞬间的，而应基于一定的生命周期。每种动物都有自己的生命周期和繁殖季节。

### 7. 增强统计数据与图形
   - 可视化统计：增加更详细的统计图表，比如狼和羊的生存曲线、草的覆盖率、环境温度等。
   - 动态反馈：通过图形和文字形式更直观地显示游戏内生态变化，例如通过图标或颜色变化表示草的生长、动物数量的变化等。

### 8. 玩家互动
   - 玩家控制的元素：允许玩家对环境进行一些干预，如播种草、驱赶狼群、引入新的物种等，增加策略性和玩家的参与感。
   - 任务与目标：设定任务或目标（如维持一定数量的羊，控制狼群数量等），增加游戏性和挑战。

### 9. 动物的感知与智能
   - 感知机制：动物可以感知周围的环境，做出更灵活的反应。例如，狼能够感知羊的移动，羊也能够感知狼的接近，从而采取不同的策略（逃跑、集结、隐匿）。
   - 嗅觉与视觉：加入更复杂的行为模型，例如狼可以依赖嗅觉追踪羊，而羊则更多依赖视觉来躲避天敌。

### 10. 优化沙盒界面
   - 动态展示：随着动物的移动，沙盒画面应该动态更新，以便玩家观察到更真实的变化。例如，狼和羊之间的追逐，草的生长，或者环境的变化。
   - 音效与动画：加上一些简单的音效和动画，比如狼的叫声，羊的走动，草的生长声等，使得沙盒更加生动和有趣。

### 11. 更多种类的物种
   - 引入其他动物和植物：除了狼和羊，还可以引入其他动物（如狐狸、兔子等）和植物（如花朵、灌木等），让生态系统更丰富。
   - 竞争与合作：不同物种之间也可以有竞争关系或共生关系，例如兔子和羊可以共享草，而狼与狐狸可能竞争捕猎机会。

### 12. 更加复杂的进化机制
   - 进化与适应：引入基因变异机制，使得狼和羊在一定条件下可以进化，适应不同的环境挑战，例如变得更加耐寒、速度更快或有更强的繁殖能力。

通过这些改进，沙盒不仅能够更具真实性，还能增强其趣味性和挑战性，让玩家更加沉浸在动态变化的生态系统中，同时体验到更复杂的策略和互动。



# chat

## 经典沙盒

类似的经典生态沙盒模拟（或称为“生命模拟”）涉及到模拟生物、生态系统及其交互。

这些沙盒通过模拟个体与环境之间的关系，展现了自然界的一些规则，通常是基于生物行为、资源分配、繁殖、死亡等原则。

以下是一些经典的生态沙盒或生命模拟系统：

### 1. Conway's Game of Life (康威生命游戏)
   - 类型: 细胞自动机
   - 概述: 这是一个经典的二维离散生命模拟，基于简单的规则：细胞根据周围的细胞数量变化状态（生与死）。这个模型虽然简单，但却能模拟出复杂的生命行为（如自复制、滑翔模式等）。它通常用于模拟自组织行为和复杂系统。
   - 链接: [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life)

### 2. SimLife
   - 类型: 生态系统模拟
   - 概述: 由Maxis公司开发，玩家在其中创建和管理一个虚拟的生态系统。模拟的对象包括不同种类的生物，它们会繁衍生息、竞争资源、捕食和被捕食。玩家可以控制生态环境的条件，并观察物种如何生存和演化。
   - 链接: [SimLife (Wikipedia)](https://en.wikipedia.org/wiki/SimLife)

### 3. Spore
   - 类型: 生物进化模拟
   - 概述: 由Maxis开发，Spore允许玩家从微生物开始，逐渐进化到空间文明的层面。玩家可以自定义生命体，并操控它们在不同的生态系统中生存和发展。游戏结合了角色扮演、模拟、战略和策略元素，玩家可以创建并管理生物的进化过程。
   - 链接: [Spore (Wikipedia)](https://en.wikipedia.org/wiki/Spore)

### 4. SimEarth
   - 类型: 行星生态系统模拟
   - 概述: 另一款Maxis的经典游戏，玩家在其中控制一个行星的生态系统，从最初的原始条件到进化成复杂的生态系统。玩家需要控制气候、地理条件、物种的多样性以及灾难等因素，以维持行星的平衡。
   - 链接: [SimEarth (Wikipedia)](https://en.wikipedia.org/wiki/SimEarth)

### 5. Ecosystem (Ecosystem Simulation)
   - 类型: 生态系统与物种相互作用模拟
   - 概述: 这类游戏通常模拟复杂的生态系统，其中包含多种物种的相互作用，玩家需要管理生物、资源和环境等因素，使得生态系统健康运作。游戏的重点是模拟不同物种的生命周期、繁殖、捕食、合作和竞争。
   - 示例: [Ecosystem Simulator](https://www.evo-ca.org/)

### 6. Noita
   - 类型: 物理沙盒，液体与物质交互
   - 概述: 虽然Noita更侧重于基于物理引擎的沙盒玩法，但它提供了一个复杂的模拟环境，在这个环境中不同物质之间相互作用，产生有趣的效果。游戏的一个独特方面是每个像素都可以被视为一个独立的物质单位，可以与周围环境进行交互。这种物理模拟环境可以用来模拟化学反应、火灾、爆炸等自然现象。
   - 链接: [Noita](https://www.notion.so/Noita)

### 7. Aquarium Simulation (水族馆模拟)
   - 类型: 水族馆生态模拟
   - 概述: 在这些游戏中，玩家设计并管理一个虚拟的水族馆，安排鱼类、植物和其他水生生物的相互关系。这些游戏强调物种的平衡与维持生态健康。
   - 示例: [Fish Tycoon](https://en.wikipedia.org/wiki/Fish_Tycoon)

### 8. The Endless Forest
   - 类型: 虚拟生物生态互动
   - 概述: 这是一款多玩家的虚拟世界游戏，玩家在其中扮演一种名为“心灵鹿”的动物，在一片森林中与其他玩家互动。游戏强调生态环境与物种之间的交流和互动，允许玩家探索生物的社会行为、繁殖和环境适应等方面。
   - 链接: [The Endless Forest](https://en.wikipedia.org/wiki/The_Endless_Forest)

### 9. Planet Coaster & Planet Zoo
   - 类型: 主题公园与动物园模拟
   - 概述: 这些游戏由Frontier Developments开发，尽管它们主要是关于管理主题公园或动物园，但它们也具有模拟生态系统和动物行为的功能。在《Planet Zoo》中，玩家需要管理动物栖息地，确保物种繁衍生息并保持生态平衡。
   - 链接: [Planet Zoo (Wikipedia)](https://en.wikipedia.org/wiki/Planet_Zoo)

### 10. Oxygen Not Included
   - 类型: 生存与生态模拟
   - 概述: 这是一款以空间站为背景的生态模拟游戏，玩家需要在一个封闭的环境中为一群幸存者提供氧气、水、食物等资源，并维持生态系统的平衡。游戏的核心机制是模拟物理、热量、气体和水的循环等复杂过程，要求玩家解决与生态系统相关的各种问题。
   - 链接: [Oxygen Not Included (Wikipedia)](https://en.wikipedia.org/wiki/Oxygen_Not_Included)

### 11. Species: Artificial Life, Real Evolution
   - 类型: 人工生命与进化模拟
   - 概述: 这是一个模拟进化过程的沙盒游戏，玩家创建和观察不同的生物体（种群），并根据环境的压力和选择规则，生物体会进化出各种特性。游戏强调遗传学、自然选择以及如何通过模拟改变生物的形态和行为。
   - 链接: [Species: Artificial Life, Real Evolution](https://speciesgame.com/)

### 12. Eco
   - 类型: 生态学与资源管理
   - 概述: 《Eco》是一款多人合作沙盒游戏，玩家必须通过建立生态系统来维护地球的生物多样性，并避免由于过度开发资源而导致生态崩溃。游戏模拟了生态学、环境科学、资源管理和社会合作等方面的内容。
   - 链接: [Eco (Wikipedia)](https://en.wikipedia.org/wiki/Eco_(video_game))

### 总结：
这些经典的生态沙盒游戏涵盖了从简单的生命游戏（如康威生命游戏）到复杂的生物进化和生态管理模拟（如《Spore》与《Eco》）。它们为玩家提供了一个虚拟的实验环境，可以探索不同物种之间的关系、生态平衡、资源竞争和生物演化等过程。每个游戏都提供了独特的玩法和挑战，是理解生态学和自然规律的一个有趣途径。

# 参考资料

* any list
{:toc}