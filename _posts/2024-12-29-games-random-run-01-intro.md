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



# 参考资料

* any list
{:toc}