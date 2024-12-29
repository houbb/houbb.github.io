---
layout: post
title: 最小作用量与双摆曲线解释及编程实现
date: 2024-12-29 01:18:08 +0800
categories: [Math]
tags: [math, sh]
published: true
---

# 前言

在网上刷到了最小作用量的视频，感觉很有趣。

和大家分享一下。


# 双摆曲线介绍

是的，双摆系统（Double Pendulum）是一个典型的混动系统（nonlinear dynamic system），具体来说，它是一个非线性动力学系统，具有复杂的动力学行为，尤其是在某些条件下表现出高度敏感的混沌现象。

在物理学中，双摆系统由两个连接的摆组成，其中第一个摆挂在固定点上，第二个摆通过第一个摆的末端挂起。

这个系统的运动方程是由两个互相耦合的二阶非线性常微分方程组成，且由于存在多种相互作用力（如重力、摆臂的相互作用等），该系统通常表现出以下特征：

### 双摆系统的混动性特点：

1. 非线性：双摆的运动方程是非线性的，意味着其动力学行为无法用线性方程来描述。非线性行为通常导致系统的解在不同初始条件下会有完全不同的演化轨迹。
   
2. 混沌：当双摆的初始角度和角速度在一定范围内变化时，系统可能会进入混沌状态。混沌的特点是初始条件微小的变化会导致最终结果的巨大差异，即“蝴蝶效应”。在混沌状态下，双摆的运动无法用简单的周期性模式来描述。

3. 能量传递和耦合：两个摆相互耦合，第一个摆的运动会影响第二个摆的运动，反之亦然。由于这种相互耦合，能量在系统内不断传递，并导致复杂的动态行为。

4. 敏感的初始条件：即便是微小的初始角度或角速度的变化，也会显著影响系统的长期行为，这也是混沌系统的一个关键特征。

### 数学模型

双摆系统通常用以下方程描述：

1. 第一个摆的角度方程（θ₁）：

```
(m₁ + m₂) * l₁ * θ̈₁ + m₂ * l₂ * θ̈₂ * cos(θ₁ - θ₂) + m₂ * l₂ * θ̇₂² * sin(θ₁ - θ₂) + (m₁ + m₂) * g * sin(θ₁) = 0
```


2. 第二个摆的角度方程（θ₂）：

```
m₂ * l₂ * θ̈₂ + m₂ * l₁ * θ̈₁ * cos(θ₁ - θ₂) - m₂ * l₁ * θ̇₁² * sin(θ₁ - θ₂) + m₂ * g * sin(θ₂) = 0
```

在这些方程中，`θ₁` 和 `θ₂` 是两个摆的角度，`l₁` 和 `l₂` 是摆臂的长度，`m₁` 和 `m₂` 是两个摆的质量，`g` 是重力加速度，`θ̇₁` 和 `θ̇₂` 是角速度，`θ̈₁` 和 `θ̈₂` 是角加速度。

由于双摆的方程是非线性且耦合的，解析解通常很难得到。

因此，通常使用数值方法（例如欧拉法、四阶Runge-Kutta法等）来求解这些方程，得到随时间变化的 theta_1(t) 和 theta_2(t)，即双摆的运动轨迹。

### 混沌特性

在适当的初始条件下，双摆系统的运动轨迹呈现出混沌特征。

即使两个摆的质量和长度相同，初始角度和角速度仅有极小的差异，也会导致它们在时间推进过程中出现完全不同的轨迹。混沌系统具有以下特征：

- 初始条件的敏感性：系统对初始状态非常敏感，微小的改变可能导致大范围的行为差异。

- 长期预测困难：即使能够计算系统的当前状态，也无法长期准确预测未来的行为。
  
这些特性使得双摆成为研究混沌理论的重要模型之一。

# 编码实现

下面是 html 的简单实现。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Double Pendulum Simulation</title>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f0f0f0;
            flex-direction: column;
        }
        canvas {
            border: 1px solid black;
        }
        .controls {
            margin: 20px;
            text-align: center;
        }
        input {
            margin: 5px;
        }
    </style>
</head>
<body>
    <div class="controls">
        <h2>Double Pendulum Initial Conditions</h2>
        <label for="theta1">Theta1 (initial angle of first pendulum in radians): </label>
        <input type="number" id="theta1" step="0.01" value="1.0"><br>
        
        <label for="theta2">Theta2 (initial angle of second pendulum in radians): </label>
        <input type="number" id="theta2" step="0.01" value="1.0"><br>
        
        <label for="omega1">Omega1 (initial angular velocity of first pendulum): </label>
        <input type="number" id="omega1" step="0.01" value="0"><br>
        
        <label for="omega2">Omega2 (initial angular velocity of second pendulum): </label>
        <input type="number" id="omega2" step="0.01" value="0"><br>
        
        <label for="l1">L1 (length of first pendulum): </label>
        <input type="number" id="l1" value="150"><br>
        
        <label for="l2">L2 (length of second pendulum): </label>
        <input type="number" id="l2" value="150"><br>
        
        <label for="m1">M1 (mass of first pendulum): </label>
        <input type="number" id="m1" value="1"><br>
        
        <label for="m2">M2 (mass of second pendulum): </label>
        <input type="number" id="m2" value="1"><br>
        
        <button onclick="startSimulation()">Start Simulation</button>
    </div>

    <canvas id="canvas"></canvas>

    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 600;

        let m1, m2, l1, l2, g, theta1, theta2, omega1, omega2, damping;
        let lastTime = 0;

        // 初始化默认参数
        function resetDefaults() {
            g = 9.81;
            damping = 0.995; // 加入阻尼效应
        }

        // 计算角加速度
        function computeAccelerations() {
            let deltaTheta = theta2 - theta1;

            let denominator1 = (m1 + m2) * l1 - m2 * l1 * Math.cos(deltaTheta) * Math.cos(deltaTheta);
            let denominator2 = (l2 / l1) * denominator1;

            let a1 = (m2 * l2 * omega2 * omega2 * Math.sin(deltaTheta) * Math.cos(deltaTheta)
                    + m2 * g * Math.sin(theta2) * Math.cos(deltaTheta)
                    + m2 * l2 * omega2 * omega2 * Math.sin(deltaTheta)
                    - (m1 + m2) * g * Math.sin(theta1)) / denominator1;

            let a2 = (-m2 * l2 * omega2 * omega2 * Math.sin(deltaTheta) * Math.cos(deltaTheta)
                    + (m1 + m2) * g * Math.sin(theta1) * Math.cos(deltaTheta)
                    - (m1 + m2) * l1 * omega1 * omega1 * Math.sin(deltaTheta)
                    - (m1 + m2) * g * Math.sin(theta2)) / denominator2;

            return [a1, a2];
        }

        // Runge-Kutta 4阶方法 (RK4)
        function rungeKuttaStep(dt) {
            // 计算每一步的k值
            const [a1, a2] = computeAccelerations();

            const k1_theta1 = omega1;
            const k1_theta2 = omega2;
            const k1_omega1 = a1;
            const k1_omega2 = a2;

            // 第二步
            const k2_theta1 = omega1 + 0.5 * k1_omega1 * dt;
            const k2_theta2 = omega2 + 0.5 * k1_omega2 * dt;
            const k2_omega1 = a1 + 0.5 * k1_omega1 * dt;
            const k2_omega2 = a2 + 0.5 * k1_omega2 * dt;

            // 第三步
            const k3_theta1 = omega1 + 0.5 * k2_omega1 * dt;
            const k3_theta2 = omega2 + 0.5 * k2_omega2 * dt;
            const k3_omega1 = a1 + 0.5 * k2_omega1 * dt;
            const k3_omega2 = a2 + 0.5 * k2_omega2 * dt;

            // 第四步
            const k4_theta1 = omega1 + k3_omega1 * dt;
            const k4_theta2 = omega2 + k3_omega2 * dt;
            const k4_omega1 = a1 + k3_omega1 * dt;
            const k4_omega2 = a2 + k3_omega2 * dt;

            // 计算新状态
            theta1 += (k1_theta1 + 2 * k2_theta1 + 2 * k3_theta1 + k4_theta1) / 6;
            theta2 += (k1_theta2 + 2 * k2_theta2 + 2 * k3_theta2 + k4_theta2) / 6;
            omega1 += (k1_omega1 + 2 * k2_omega1 + 2 * k3_omega1 + k4_omega1) / 6;
            omega2 += (k1_omega2 + 2 * k2_omega2 + 2 * k3_omega2 + k4_omega2) / 6;

            // 应用阻尼
            omega1 *= damping;
            omega2 *= damping;
        }

        // 绘制双摆
        function drawPendulum() {
            const x1 = l1 * Math.sin(theta1);
            const y1 = l1 * Math.cos(theta1);
            const x2 = x1 + l2 * Math.sin(theta2);
            const y2 = y1 + l2 * Math.cos(theta2);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#f0f0f0";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 绘制第一个摆
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, canvas.height / 4);
            ctx.lineTo(canvas.width / 2 + x1, canvas.height / 4 + y1);
            ctx.strokeStyle = "#00f";
            ctx.lineWidth = 2;
            ctx.stroke();

            // 绘制第一个摆的质量点
            ctx.beginPath();
            ctx.arc(canvas.width / 2 + x1, canvas.height / 4 + y1, 10, 0, Math.PI * 2);
            ctx.fillStyle = "#00f";
            ctx.fill();

            // 绘制第二个摆
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2 + x1, canvas.height / 4 + y1);
            ctx.lineTo(canvas.width / 2 + x2, canvas.height / 4 + y2);
            ctx.strokeStyle = "#f00";
            ctx.lineWidth = 2;
            ctx.stroke();

            // 绘制第二个摆的质量点
            ctx.beginPath();
            ctx.arc(canvas.width / 2 + x2, canvas.height / 4 + y2, 10, 0, Math.PI * 2);
            ctx.fillStyle = "#f00";
            ctx.fill();
        }

        // 更新并绘制双摆
        function updatePendulum() {
            const dt = 0.05; // 使用较小的时间步长，增加精度
            rungeKuttaStep(dt);
            drawPendulum();
        }

        // 开始模拟
        function startSimulation() {
            // 获取用户输入的初始值
            theta1 = parseFloat(document.getElementById('theta1').value);
            theta2 = parseFloat(document.getElementById('theta2').value);
            omega1 = parseFloat(document.getElementById('omega1').value);
            omega2 = parseFloat(document.getElementById('omega2').value);
            l1 = parseFloat(document.getElementById('l1').value);
            l2 = parseFloat(document.getElementById('l2').value);
            m1 = parseFloat(document.getElementById('m1').value);
            m2 = parseFloat(document.getElementById('m2').value);
            
            // 初始化模拟
            resetDefaults();

            // 启动动画
            lastTime = performance.now();
            function animate() {
                let currentTime = performance.now();
                let deltaTime = (currentTime - lastTime) / 1000; // 秒
                lastTime = currentTime;

                updatePendulum();
                requestAnimationFrame(animate);
            }

            animate();
        }
    </script>
</body>
</html>
```

# 双摆曲线有哪些应用？

应用当然非常之多，比较有趣的是放在游戏之中，比如 Boss 的技能，如果可以背板，那么大部分都不那么有趣。

如果技能的轨迹是一个双摆曲线，每一次的初始化参数都不同，也许各种背板玩家会感谢作者的。

当然，还有其它各个领域的应用：

双摆曲线及其相关的非线性动力学行为在多个领域中都有广泛的应用。尽管双摆本身是一个物理模型，但它的数学特性和混沌行为对于理解复杂系统的动力学有着重要的意义。以下是双摆曲线的几个主要应用领域：

### 1. 物理学与力学

摆的物理模型：双摆系统是经典力学中的一个常见模型，它帮助物理学家理解多体系统的动力学，尤其是在处理两个相互作用的摆动物体时。通过研究双摆的运动，可以深入了解非线性动力学、能量传递以及振动模式。

模拟非线性振动：双摆的非线性特性使其成为研究复杂振动系统的理想工具。通过模拟双摆的行为，研究人员能够研究更复杂系统中的能量交换和振动模式，尤其是涉及多自由度系统的场景。

### 2. 混沌与非线性动力学

混沌理论的应用：双摆系统是混沌理论的经典案例之一。它展示了非线性系统在特定条件下的混沌行为，即对初始条件的极度敏感性。在物理学中，双摆常用于演示和教学混沌现象，帮助学生理解混沌理论中的敏感依赖性和不可预测性。

混沌控制与预测：通过分析双摆系统，研究人员可以研究混沌系统的行为以及如何应用控制理论来管理和稳定混沌现象。这些概念可以推广到更复杂的工程和自然系统中。

### 3. 工程与机械系统

机械系统建模：双摆模型在机械工程中用于描述具有多重自由度和相互作用的机械系统。对于许多复杂的机械装置（如摆动机构、机械臂等），双摆提供了一个简化的模型，可以帮助工程师理解和设计这些系统的动态行为。

振动分析：双摆系统的行为类似于许多实际物理系统的行为，尤其是涉及到机械振动和动力传递的系统。在振动分析中，双摆常被用作研究机械系统的能量传递、共振、阻尼等现象的工具。

### 4. 天体物理学

双星系统：在天文学中，双摆模型可以用于研究类似双星系统的天体系统。双星系统是由两个相互吸引的星体组成，它们通过引力相互作用并围绕共同的质心运动。双摆的数学模型可以帮助天体物理学家理解类似双星系统的动力学，尤其是它们的引力相互作用和轨道稳定性。

行星际运动：双摆也可以用于模拟行星或卫星间的相互引力作用，尤其是在非常复杂的轨道动力学中，双摆的混沌特性为模拟和预测这些系统的行为提供了有力工具。

### 5. 生物学与生态学

神经系统模型：双摆模型的非线性行为对于模拟神经系统中的复杂振动模式有一定的参考价值。神经元的相互作用、振荡行为以及对外界刺激的响应，往往也表现出类似双摆系统的非线性和混沌特性，因此双摆可以为生物学中的复杂系统提供启示。

生态学模拟：双摆模型也被用于模拟生态系统中多个物种之间的相互作用，特别是当这些物种的动态行为呈现出周期性或混沌特性时。类似捕食者-猎物模型中，物种的相互作用可能会表现出复杂的周期性和混沌行为。

### 6. 计算机科学与算法

计算机图形学与动画：在计算机图形学中，双摆模型可以用于模拟复杂的物理行为，如碰撞、摆动等动态效果。双摆可以为动画制作提供真实的物理模拟，使得人物动作和物体运动更加自然和真实。

机器学习与优化：在某些机器学习和优化问题中，双摆模型的混沌特性被用作训练模型，尤其是在涉及动态系统或时序数据预测的任务中。通过研究双摆系统的行为，研究人员可以改进算法的稳定性和预测准确性。

### 7. 艺术与创意领域

艺术与视觉效果：双摆的复杂动态行为常常被用作艺术创作的灵感源泉。艺术家可以通过模拟双摆的运动来创造视觉效果或互动艺术作品。其非线性和混沌特性使得其表现出的图形非常独特和引人入胜。

生成艺术：双摆的轨迹常被用作生成艺术的基础，特别是在基于数学模型的绘画和图形生成中。它的复杂曲线和混沌行为产生的视觉效果，常常用于创作具有动态变化和复杂结构的图像。


# 为什么双摆曲线命名可以被计算模拟，但是仍然被叫做混沌系统？

双摆曲线被称为混沌系统，尽管它是可以通过计算机模拟得到的，这是因为混沌的定义与系统是否可以被计算机模拟并没有直接关系。

混沌是指在非线性动力学系统中，尽管系统的行为是完全确定的（即不涉及随机性或概率），但由于对初始条件的高度敏感性，系统的长期行为变得极难预测和控制。

下面是一些解释，为什么双摆尽管可以被计算机模拟，仍然被称为混沌系统：

### 1. 初始条件的敏感性（蝴蝶效应）

   混沌系统的一个关键特性是对初始条件的极端敏感性，也叫做蝴蝶效应。即使是双摆这样一个看似简单的物理系统，若初始条件（如角度、角速度等）发生微小变化，经过一段时间后，系统的行为可能会发生显著不同的变化。
   
   模拟与实际情况：虽然通过数值方法（例如Runge-Kutta方法）可以精确模拟双摆的运动，但是由于计算机的精度有限、数据的离散化以及数值误差的积累，经过长时间模拟后，预测结果的精确度会显著降低。因此，尽管我们能得到系统的近似轨迹，长期预测仍然变得不可行。
   
   现实中的不可预测性：在现实中，任何细小的扰动（比如测量误差、摩擦、空气阻力等）都会导致系统行为的巨大差异。即便计算机可以模拟理论上的完美模型，这些细微的扰动会导致实际系统的长期行为变得极难预测。

### 2. 确定性与随机性的区别

   混沌系统的一个重要特点是，它是确定性的，而非随机性的。双摆是一个典型的确定性系统，即它的行为是由数学方程决定的，不涉及任何随机过程。但即使是确定性系统，只要它表现出对初始条件极端敏感的特性，也可以被称为混沌系统。

   确定性混沌：双摆的运动方程完全是确定性的，只要给定初始条件和物理参数，理论上可以精确计算出系统的未来状态。但由于混沌的特性，极小的初始误差会导致完全不同的轨迹，因此在实际应用中，我们无法长期精确预测其行为。

### 3. 复杂的长期行为

   双摆系统的另一个混沌特征是它的长期行为极为复杂，即使它遵循严格的物理规律。系统的轨迹可能在初期看起来是周期性的或有序的，但随着时间的推移，轨迹将变得非常复杂，呈现出非常难以预测的行为模式。

   周期性与混沌的过渡：双摆可以在某些条件下表现为周期性运动，但一旦系统的状态接近混沌区，运动轨迹会变得越来越复杂，甚至看似随机。
   
   这是典型的混沌现象，在数学上被称为“奇异吸引子”（strange attractor）。
   
   即使我们可以模拟其轨迹，但因为其复杂性和对初始条件的敏感性，我们无法精确地预测其未来状态。

### 4. 系统的非线性特性

   双摆是一个典型的非线性系统，其中的方程不具有简单的线性结构，系统的行为在不同的时间尺度上是非常复杂的。
   
   非线性系统往往会导致解的复杂性，进而可能表现出混沌行为。
   
   尽管可以通过数值方法得到系统的状态，非线性特性使得这些状态的长期行为不可预测。

### 5. 有限精度和数值误差

   即使我们通过计算机模拟出双摆的轨迹，由于计算机的有限精度和数值误差，模拟的结果不能达到完全精确。
   
   随着时间的推移，数值误差会积累，导致模拟结果偏离真实轨迹。
   
   因此，双摆即使可以被计算机模拟，也仍然显示出混沌系统的性质——即随着时间的推进，预测变得越来越不可靠。

# 小结

从传统的解法而言，像绘制出双摆系统的曲线是一件非常难的一件事情。

所以说学号数学是多么的重要。



# chat

## 是什么？

最小作用量（Principle of Least Action）是物理学中一个非常重要的原理，尤其在经典力学、量子力学以及理论物理中占有核心地位。

该原理提出，物理系统在变化过程中所经历的“作用量”（action）是最小的或极小的。

换句话说，物理系统的运动轨迹是使得作用量达到极值（通常是最小值）的一条路径。

### 1. 作用量的定义
作用量 \( S \) 是物理系统的一个标量量，通常通过系统的拉格朗日量 \( L \) 来表示。拉格朗日量是描述系统动态的量，定义为系统的动能 \( T \) 减去势能 \( V \)：

\[
L = T - V
\]

作用量 \( S \) 是拉格朗日量沿时间的积分：

\[
S = \int_{t_1}^{t_2} L \, dt
\]

其中 \( t_1 \) 和 \( t_2 \) 是系统开始和结束的时间点，\( L \) 是拉格朗日量。

### 2. 最小作用量原理
最小作用量原理指出，在给定初态和末态的情况下，系统的真实运动轨迹是使得作用量 \( S \) 最小化（或极小化）的轨迹。换句话说，物理系统沿着一条使得作用量最小的路径运动。

这个原理可以用变分法来表述：通过对作用量 \( S \) 关于路径的变化进行微小扰动，求得作用量极值的条件。拉格朗日方程是最小作用量原理的数学表达式，通常写成：

\[
\frac{d}{dt} \left( \frac{\partial L}{\partial \dot{q}_i} \right) - \frac{\partial L}{\partial q_i} = 0
\]

其中 \( q_i \) 是广义坐标，\( \dot{q}_i \) 是广义速度，\( L \) 是拉格朗日量。

### 3. 物理意义
最小作用量原理的物理意义可以从以下几个方面理解：

- 最小化路径：物体在运动过程中不会偏离最短的路径或最节省能量的路径。它总是以最经济的方式（即最小作用量）达到最终状态。
  
- 自然法则的统一性：该原理为描述各种物理过程提供了一种统一的框架，包括力学、电磁学、量子力学等领域。例如，牛顿的运动定律、麦克斯韦方程、甚至量子力学中的薛定谔方程都可以通过最小作用量原理来推导出来。

- 时间与空间的对称性：最小作用量原理还揭示了自然界中时间和空间的对称性。在不受外力干扰的情况下，物体的运动往往呈现出对时间平移和空间平移的不变性（守恒）。

### 4. 应用举例
最小作用量原理不仅在经典力学中有重要应用，在现代物理学中的多个领域也有深远的影响。以下是几个应用的例子：

- 经典力学：通过最小作用量原理，我们可以推导出牛顿的运动定律。通过拉格朗日方程，可以推导出描述物体运动的方程，尤其是在处理复杂系统时，拉格朗日形式比牛顿力学更为简洁和方便。
  
- 量子力学：在量子力学中，最小作用量原理的应用被扩展到量子领域。例如，费曼路径积分理论就是通过最小作用量原理来描述粒子在量子世界中的行为，路径积分公式通过所有可能路径的贡献来计算粒子的传播。

- 广义相对论：在爱因斯坦的广义相对论中，最小作用量原理同样是核心。爱因斯坦的场方程可以通过最小化引力场的作用量（即引力作用量）推导出来。

### 5. 变分法与最小作用量原理
变分法是用于求解极值问题的数学方法。通过对一个给定的泛函（如作用量）进行变分，找到使得泛函极小化的函数。最小作用量原理本质上是一个变分问题，拉格朗日方程便是变分法在物理系统中的具体应用。

### 6. 结论
最小作用量原理是物理学中的一个基本原理，涉及所有从宏观到微观的物理系统。它不仅为经典力学提供了一个优雅的数学框架，也在量子力学和相对论等领域中起着重要作用。通过最小作用量原理，我们能够更深刻地理解自然界的规律，并在不同的物理场景中运用这一原理进行计算和推导。

希望这个详细的解释对你有所帮助！如果你有任何进一步的问题，随时可以问我。

## 利用这个定理，给一个双摆曲线的函数

双摆（Double Pendulum）是由两个摆组成的物理系统，其中一个摆的悬挂点是另一个摆的末端。双摆的运动是非常复杂的，并且具有混沌特性。为了通过最小作用量原理来描述双摆的运动，我们首先需要定义系统的拉格朗日量，然后利用最小作用量原理求出该系统的运动方程。

### 1. 双摆系统的定义
设系统由两根质量为 \( m_1 \) 和 \( m_2 \) 的摆组成，其中：

- \( \theta_1 \) 是第一个摆的偏转角（相对于竖直线）。
- \( \theta_2 \) 是第二个摆的偏转角（相对于第一个摆的竖直线）。
- \( l_1 \) 和 \( l_2 \) 是两个摆的长度。
- \( g \) 是重力加速度。

### 2. 拉格朗日量的推导
拉格朗日量 \( L \) 是动能 \( T \) 和势能 \( V \) 的差，公式为：

\[
L = T - V
\]

#### 2.1. 动能
每个摆的动能由其质点的速度和质量决定。对于第一个摆的质量 \( m_1 \)，其速度的平方可以表示为：

\[
v_1^2 = \dot{x}_1^2 + \dot{y}_1^2 = (l_1 \dot{\theta_1} \cos\theta_1)^2 + (l_1 \dot{\theta_1} \sin\theta_1)^2 = l_1^2 \dot{\theta_1}^2
\]

对于第二个摆的质量 \( m_2 \)，其速度的平方是：

\[
v_2^2 = (\dot{x}_2)^2 + (\dot{y}_2)^2 = \left( l_1 \dot{\theta_1} \cos \theta_1 + l_2 \dot{\theta_2} \cos \theta_2 \right)^2 + \left( l_1 \dot{\theta_1} \sin \theta_1 + l_2 \dot{\theta_2} \sin \theta_2 \right)^2
\]

#### 2.2. 势能
势能来自于两个摆的重力势能。第一个摆的势能是：

\[
V_1 = -m_1 g l_1 \cos\theta_1
\]

第二个摆的势能是：

\[
V_2 = -m_2 g (l_1 \cos\theta_1 + l_2 \cos\theta_2)
\]

#### 2.3. 拉格朗日量
因此，系统的总拉格朗日量为：

\[
L = \left( \frac{1}{2} m_1 l_1^2 \dot{\theta_1}^2 + \frac{1}{2} m_2 \left( l_1^2 \dot{\theta_1}^2 + l_2^2 \dot{\theta_2}^2 + 2 l_1 l_2 \dot{\theta_1} \dot{\theta_2} \cos(\theta_1 - \theta_2) \right) \right)
\]
\[
- m_1 g l_1 \cos\theta_1 - m_2 g (l_1 \cos\theta_1 + l_2 \cos\theta_2)
\]

### 3. 利用最小作用量原理求解运动方程
最小作用量原理要求作用量 \( S \) 最小化，即：

\[
S = \int_{t_1}^{t_2} L \, dt
\]

根据最小作用量原理，我们对拉格朗日量 \( L \) 进行变分，并得到系统的运动方程。通过对每个广义坐标 \( \theta_1 \) 和 \( \theta_2 \) 使用欧拉-拉格朗日方程，我们可以得到双摆系统的两条运动方程。

\[
\frac{d}{dt} \left( \frac{\partial L}{\partial \dot{\theta_1}} \right) - \frac{\partial L}{\partial \theta_1} = 0
\]
\[
\frac{d}{dt} \left( \frac{\partial L}{\partial \dot{\theta_2}} \right) - \frac{\partial L}{\partial \theta_2} = 0
\]

这些方程是双摆的动力学方程，通常通过数值方法来求解，因为它们是非线性和耦合的方程。

### 4. 数值求解


# 参考资料

* any list
{:toc}