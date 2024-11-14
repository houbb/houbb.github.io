---
layout: post
title:  java 表达式引擎概览-06表达式引擎引擎页面样式优化
date:  2020-5-26 15:11:16 +0800
categories: [Engine]
tags: [engine, expression-engine]
published: true
---

# 目标

让页面样式更加现代化。

# STEP7: 样式调整

## 需求

下面的页面样式比较原始，帮我的 css 样式进行调整美化，让其看起来更加现代化+扁平化。

1. 要求按钮尽量加上 icon，使用 emoji 也行，表达对应的含义。比如新增/删除/重置

2. 按钮的颜色，新增类型用绿色系，删除用红色系，重置警告橙色系等等。

原始的页面代码：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
	<head>
		<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
	</head>

    <title>Logical Expression Builder</title>
    <style>
        /* Basic styling for layout */
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 20px;
    padding: 0;
    background-color: #f4f7fa;
}

.container {
    max-width: 900px;
    margin: 0 auto;
    padding: 30px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.vertical-line {
    width: 2px; /* 竖线的宽度 */
    background-color: #888; /* 竖线的颜色 */
    margin: 0 10px; /* 可选：设置左右的间距 */
	height: 20px;
}
#var-operation-section div {
	display: inline-block;
}
.section {
    margin-bottom: 25px;
}

.section h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 12px;
}

.expr-container {
    margin-bottom: 10px;
    display: flex;
    flex-wrap: wrap;
}

.expr-element {
    display: inline-block;
    margin: 5px;
    padding: 8px 12px;
    background-color: #e0f7fa;
    color: #00796b;
    cursor: pointer;
    border-radius: 6px;
    transition: background-color 0.2s, transform 0.2s;
    font-size: 16px;
}

.selected {
    background-color: #ffeb3b;
    color: #000;
}

.expr-element:hover {
    transform: scale(1.05);
}

.operator, .paren, .quick-operation {
    background-color: #ffccbc;
    cursor: pointer;
    border-radius: 6px;
    padding: 10px 16px;
    margin: 5px;
    transition: background-color 0.2s;
    font-size: 16px;
    border: none;
}

.operator:hover, .paren:hover, .expr-element:hover, .quick-operation:hover {
    background-color: #ff9800;
}

#expression-container {
    margin-top: 20px;
    display: flex;
    flex-wrap: wrap;
    background-color: #e8f5e9;
    padding: 12px;
    border-radius: 6px;
}

#result {
    margin-top: 20px;
    padding: 12px;
    background-color: #f1f1f1;
    border-radius: 6px;
    font-weight: bold;
}

/* New styles for condition variables section */
.condition-container {
    margin-top: 20px;
    padding: 12px;
    background-color: #e8f5e9;
    border-radius: 6px;
}

.condition-variable {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
}

.condition-variable input {
    margin-left: 12px;
    padding: 8px;
    margin-right: 12px;
    flex-grow: 1;
    border-radius: 6px;
    border: 1px solid #ddd;
}

.condition-variable button {
    background-color: #f44336;
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
}

.condition-variable button:hover {
    background-color: #e53935;
}

/* Buttons with icons */
.add-btn, .remove-btn, #reset-btn, #add-condition {
    padding: 8px 12px;
    font-size: 16px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.2s;
    border: none;
	color: white;
}

.add-btn {
    background-color: #66bb6a;
    color: white;
}

.add-btn:hover {
    background-color: #388e3c;
    transform: scale(1.05);
}

.remove-btn {
    background-color: #e57373;
    color: white;
}

.remove-btn:hover {
    background-color: #d32f2f;
    transform: scale(1.05);
}

#reset-btn {
    background-color: #ff9800;
    color: white;
}
#reset-btn:hover {
    background-color: #f57c00;
    transform: scale(1.05);
}

#add-condition {
	background-color: #4caf50; /* 绿色背景 */
    color: white;
}
#add-condition:hover {
	background-color: #388e3c; 
    color: white;
}


/* Quick operation buttons styling (满足全部, 满足任一) */
.quick-operation {
    padding: 8px 15px;
    font-size: 14px;
    cursor: pointer;
    border: 1px solid #ccc;
    border-radius: 6px;
    background-color: #f0f0f0;
    transition: background-color 0.3s;
    <!-- display: flex; -->
    align-items: center;
}

.quick-operation:hover {
    background-color: #e0e0e0;
}

.quick-operation span {
    margin-right: 8px;
}

/* Main operation buttons styling (且, 或) */
.operation {
    padding: 8px 15px;
    font-size: 14px;
    cursor: pointer;
    border: 1px solid #ccc;
    border-radius: 6px;
    background-color: #f0f0f0;
    transition: background-color 0.3s;
}

.operation:hover {
    background-color: #e0e0e0;
}

/* Reset button styling */
#reset-btn {
    padding: 8px 15px;
    font-size: 14px;
    cursor: pointer;
    border-radius: 6px;
    background-color: #f39c12;
    color: white;
    transition: background-color 0.3s;
}

#reset-btn:hover {
    background-color: #e67e22;
}


    </style>
</head>
<body>

<div class="container">

    <!-- Section 1: Variable Elements -->
    <div class="section">
        <h3>条件关系</h3>
        <div class="expr-container" id="variables">
            <div class="expr-element" data-value="c1">c1</div>
        </div>
    </div>

    <!-- Section 2: Operator Buttons -->
    <div class="section" id="var-operation-section">
        <div id="quick-buttons">
            <button class="quick-operation" data-op="all"><i class="fas fa-check-square"></i> 满足全部</button>
            <button class="quick-operation" data-op="any"><i class="fas fa-dot-circle"></i> 满足任一</button>
        </div>
		<div class="vertical-line"></div>
        <div id="operation-buttons">
            <button class="operation" data-op="&&"><i class="fas fa-link"></i> 且</button>
            <button class="operation" data-op="||"><i class="fas fa-random"></i> 或</button>
        </div>
		<div class="vertical-line"></div>
		<!-- Add a Reset button -->
		<button id="reset-btn" onclick="resetExpression()"><i class="fas fa-sync-alt"></i> 重置</button>
    </div>

    <!-- Section 3: Expression Preview -->
    <div class="section">
        <h3>关系效果</h3>
        <div id="expression-container" class="expr-container"></div>
    </div>

    <!-- Section 4: Final Expression Output -->
    <div class="section">
        <h3>最终表达式</h3>
        <div id="result"></div>
    </div>

    <!-- Section 5: Condition Variables -->
    <div class="section condition-container">
        <h3>条件变量定义</h3>
        <div id="condition-variables">
            <div class="condition-variable" data-index="1">
                <span>c1</span>
                <input type="text" placeholder="变量描述" class="description" />
                <button class="remove-condition" onclick="removeCondition(1)"><i class="fas fa-times"></i> 删除</button>
            </div>
        </div>
        <button id="add-condition" onclick="addCondition()"><i class="fas fa-plus"></i> 新增</button>
    </div>

</div>

<script>
    let selectedElements = []; // Stores the current selected elements or expressions
    let currentExpression = ""; // Stores the current expression as a string
    let variableCount = 1; // Variable count starts at 1 (c1)

    const expressionContainer = document.getElementById('expression-container');
    const resultContainer = document.getElementById('result');
    const conditionVariablesContainer = document.getElementById('condition-variables');
    const variablesContainer = document.getElementById('variables');

    // Function to render the current expression
    function renderExpression() {
        expressionContainer.innerHTML = '';
        const elements = currentExpression.split(' ').map(el => {
            const div = document.createElement('div');
            div.classList.add('expr-element');
            div.textContent = el;
            return div;
        });
        elements.forEach(div => expressionContainer.appendChild(div));
        updateResult();
    }

    // Function to update the result container
    function updateResult() {
        resultContainer.textContent = currentExpression;
    }

    // Handle selection of variables (c1, c2, etc.)
    variablesContainer.addEventListener('click', function (e) {
        if (e.target && e.target.classList.contains('expr-element')) {
            const value = e.target.getAttribute('data-value');
            const element = e.target;

            // Toggle selected class
            if (element.classList.contains('selected')) {
                element.classList.remove('selected');
                const index = selectedElements.indexOf(value);
                if (index !== -1) {
                    selectedElements.splice(index, 1);
                }
            } else {
                element.classList.add('selected');
                selectedElements.push(value);
            }
            updateCurrentExpression();
            renderExpression();
        }
    });

    // Handle the operation buttons (&&, ||)
    document.getElementById('operation-buttons').addEventListener('click', function (e) {
        if (e.target && e.target.classList.contains('operation')) {
            const operator = e.target.getAttribute('data-op');
            if (selectedElements.length >= 2) {
                // Add the operator between the last two elements
                const lastElement = selectedElements.pop();
                const secondLastElement = selectedElements.pop();
                selectedElements.push(`(${secondLastElement} ${operator} ${lastElement})`);
                updateCurrentExpression();
                renderExpression();
            }
        }
    });

    // Handle the quick operation buttons (满足全部, 满足任一)
    document.getElementById('quick-buttons').addEventListener('click', function (e) {
        if (e.target && e.target.classList.contains('quick-operation')) {
            const quickOp = e.target.getAttribute('data-op');
            if (selectedElements.length >= 1) {
                if (quickOp === 'all') {
                    currentExpression = selectedElements.join(' && ');
                } else if (quickOp === 'any') {
                    currentExpression = selectedElements.join(' || ');
                }
                currentExpression = `(${currentExpression})`; // Wrap the result in parentheses
                renderExpression();
            }
        }
    });

    // Update the current expression string based on the selected elements
    function updateCurrentExpression() {
        currentExpression = selectedElements.join(' ');
    }

    // Add a new condition variable
    function addCondition() {
        if (variableCount < 10) {
            variableCount++;
            const newCondition = document.createElement('div');
            newCondition.classList.add('condition-variable');
            newCondition.setAttribute('data-index', variableCount);
            newCondition.innerHTML = `
                <span>c${variableCount}</span>
                <input type="text" placeholder="变量描述" class="description" />
                <button class="remove-condition" onclick="removeCondition(${variableCount})"><i class="fas fa-times"></i> 删除</button>            `;
            conditionVariablesContainer.appendChild(newCondition);

            // Add the new variable to the selection list (variables container)
            const newVariable = document.createElement('div');
            newVariable.classList.add('expr-element');
            newVariable.setAttribute('data-value', `c${variableCount}`);
            newVariable.textContent = `c${variableCount}`;
            variablesContainer.appendChild(newVariable);
        } else {
            alert("最多只能有 10 个变量");
        }
    }

    // Remove a condition variable
    function removeCondition(index) {
        const conditionElement = document.querySelector(`.condition-variable[data-index="${index}"]`);
        conditionElement.remove();

        // Also remove the corresponding variable element from the selection list
        const variableElement = document.querySelector(`.expr-element[data-value="c${index}"]`);
        variableElement.remove();

        // Decrease variable count and prevent less than 1 condition variable
        if (variableCount > 1) {
            variableCount--;
        } else {
            alert("至少需要保留一个变量");
        }
    }

    // Initialize: Ensure at least one variable is present
    document.addEventListener('DOMContentLoaded', function () {
        if (variableCount === 1) {
            const conditionElement = document.createElement('div');
            conditionElement.classList.add('condition-variable');
            conditionElement.setAttribute('data-index', '1');
            conditionVariablesContainer.appendChild(conditionElement);
        }
    });


	// Function to reset the expression and selections
    function resetExpression() {
        // Clear selected elements
        selectedElements = [];
        currentExpression = "";

        // Reset the appearance of the selected elements
        const selectedElems = document.querySelectorAll('.expr-element.selected');
        selectedElems.forEach(elem => {
            elem.classList.remove('selected');
        });

        // Clear the expression container and result
        expressionContainer.innerHTML = '';
        resultContainer.textContent = '';

        // Optionally, reset the condition variables back to c1 if needed
		// 这里不变，变化了反而麻烦。
        <!-- variableCount = 1; -->
        <!-- conditionVariablesContainer.innerHTML = ` -->
            <!-- <div class="condition-variable" data-index="1"> -->
                <!-- <span>c1</span> -->
                <!-- <input type="text" placeholder="变量描述" class="description" /> -->
                <!-- <button class="remove-condition" onclick="removeCondition(1)">删除条件</button> -->
            <!-- </div> -->
        <!-- `; -->
        <!-- variablesContainer.innerHTML = ` -->
            <!-- <div class="expr-element" data-value="c1">c1</div> -->
        <!-- `; -->
    }
</script>

</body>
</html>
```

# v2-保存的 json

## 前面的优化

调整样式

调整顺序

## 需求

点击保存按钮式，弹出页面核心元素的内容。

要求为 json 格式，要求把页面的所有条件和其备注，放在 conditionList 中，将 最终表达式 放在 conditionExpression 中。

构建出完整的 json 对象，然后 alert 输出 json 内容。

```json
{

    "conditionList": [
        {
            "name": "c1 //条件名称",
            "remark": "//条件说明"
        },
        {
            "name": "c2",
            "remark": "//条件说明"
        },
    ],
    "conditionExpression": "(c1 && c2)"
}
```

## 完整实现

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
	<head>
		<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
	</head>

    <title>Logical Expression Builder</title>
    <style>
        /* Basic styling for layout */
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 20px;
    padding: 0;
    background-color: #f4f7fa;
}

.container {
    max-width: 900px;
    margin: 0 auto;
    padding: 30px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.vertical-line {
    width: 2px; /* 竖线的宽度 */
    background-color: #888; /* 竖线的颜色 */
    margin: 0 10px; /* 可选：设置左右的间距 */
	height: 20px;
}
#var-operation-section div {
	display: inline-block;
}
.section {
    margin-bottom: 25px;
}

.section h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 12px;
}

.expr-container {
    margin-bottom: 10px;
    display: flex;
    flex-wrap: wrap;
}

.expr-element {
    display: inline-block;
    margin: 5px;
    padding: 8px 12px;
    background-color: #e0f7fa;
    color: #00796b;
    cursor: pointer;
    border-radius: 6px;
    transition: background-color 0.2s, transform 0.2s;
    font-size: 16px;
}

.selected {
    background-color: #ffeb3b;
    color: #000;
}

.expr-element:hover {
    transform: scale(1.05);
}

.operator, .paren, .quick-operation {
    background-color: #ffccbc;
    cursor: pointer;
    border-radius: 6px;
    padding: 10px 16px;
    margin: 5px;
    transition: background-color 0.2s;
    font-size: 16px;
    border: none;
}

.operator:hover, .paren:hover, .expr-element:hover, .quick-operation:hover {
    background-color: #ff9800;
}

#expression-container {
    margin-top: 20px;
    display: flex;
    flex-wrap: wrap;
    background-color: #e8f5e9;
    padding: 12px;
    border-radius: 6px;
}

#result {
    margin-top: 20px;
    padding: 12px;
    background-color: #f1f1f1;
    border-radius: 6px;
    font-weight: bold;
}

/* New styles for condition variables section */
.condition-container {
    margin-top: 20px;
    padding: 12px;
    background-color: #e8f5e9;
    border-radius: 6px;
}

.condition-variable {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
}

.condition-variable input {
    margin-left: 12px;
    padding: 8px;
    margin-right: 12px;
    flex-grow: 1;
    border-radius: 6px;
    border: 1px solid #ddd;
}

.condition-variable button {
    background-color: #f44336;
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
}

.condition-variable button:hover {
    background-color: #e53935;
}

/* Buttons with icons */
.add-btn, .remove-btn, #reset-btn, #add-condition, #save-btn {
    padding: 8px 12px;
    font-size: 16px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.2s;
    border: none;
	color: white;
}

.add-btn {
    background-color: #66bb6a;
    color: white;
}

.add-btn:hover {
    background-color: #388e3c;
    transform: scale(1.05);
}

.remove-btn {
    background-color: #e57373;
    color: white;
}

.remove-btn:hover {
    background-color: #d32f2f;
    transform: scale(1.05);
}

#reset-btn {
    background-color: #ff9800;
    color: white;
}
#reset-btn:hover {
    background-color: #f57c00;
    transform: scale(1.05);
}

#add-condition {
	background-color: #4caf50; /* 绿色背景 */
    color: white;
}
#add-condition:hover {
	background-color: #388e3c; 
    color: white;
}
#add-condition {
	background-color: #4caf50; /* 绿色背景 */
    color: white;
}
#add-condition:hover {
	background-color: #388e3c; 
    color: white;
}
#save-btn {
	background-color: #4caf50; /* 绿色背景 */
    color: white;
}
#save-btn:hover {
	background-color: #388e3c; 
    color: white;
}

/* Quick operation buttons styling (满足全部, 满足任一) */
.quick-operation {
    padding: 8px 15px;
    font-size: 14px;
    cursor: pointer;
    border: 1px solid #ccc;
    border-radius: 6px;
    background-color: #f0f0f0;
    transition: background-color 0.3s;
    <!-- display: flex; -->
    align-items: center;
}

.quick-operation:hover {
    background-color: #e0e0e0;
}

.quick-operation span {
    margin-right: 8px;
}

/* Main operation buttons styling (且, 或) */
.operation {
    padding: 8px 15px;
    font-size: 14px;
    cursor: pointer;
    border: 1px solid #ccc;
    border-radius: 6px;
    background-color: #f0f0f0;
    transition: background-color 0.3s;
}

.operation:hover {
    background-color: #e0e0e0;
}
    </style>
</head>
<body>

<div class="container">
	<!-- Section 5: Condition Variables -->
    <div class="section condition-container">
        <h3>条件定义</h3>
        <div id="condition-variables">
            <div class="condition-variable" data-index="1">
                <span>c1</span>
                <input type="text" placeholder="变量描述" class="description" />
                <button class="remove-condition" onclick="removeCondition(1)"><i class="fas fa-times"></i> 删除</button>
            </div>
        </div>
        <button id="add-condition" onclick="addCondition()"><i class="fas fa-plus"></i> 新增</button>
    </div>
	
    <!-- Section 1: Variable Elements -->
    <div class="section">
        <h3>条件关系</h3>
        <div class="expr-container" id="variables">
            <div class="expr-element" data-value="c1">c1</div>
        </div>
    </div>

    <!-- Section 2: Operator Buttons -->
    <div class="section" id="var-operation-section">
        <div id="quick-buttons">
            <button class="quick-operation" data-op="all"><i class="fas fa-check-square"></i> 满足全部</button>
            <button class="quick-operation" data-op="any"><i class="fas fa-dot-circle"></i> 满足任一</button>
        </div>
		<div class="vertical-line"></div>
        <div id="operation-buttons">
            <button class="operation" data-op="&&"><i class="fas fa-link"></i> 且</button>
            <button class="operation" data-op="||"><i class="fas fa-random"></i> 或</button>
        </div>
		<div class="vertical-line"></div>
		<!-- Add a Reset button -->
		<button id="reset-btn" onclick="resetExpression()"><i class="fas fa-sync-alt"></i> 重置</button>
		<div class="vertical-line"></div>
		<button id="save-btn" onclick="saveExpression()"><i class="fas fa-file"></i> 保存</button>
    </div>

    <!-- Section 3: Expression Preview -->
    <div class="section">
        <h3>关系效果</h3>
        <div id="expression-container" class="expr-container"></div>
    </div>

    <!-- Section 4: Final Expression Output -->
    <div class="section">
        <h3>最终表达式</h3>
        <div id="result"></div>
    </div>

    

</div>

<script>
    let selectedElements = []; // Stores the current selected elements or expressions
    let currentExpression = ""; // Stores the current expression as a string
    let variableCount = 1; // Variable count starts at 1 (c1)
	let globalVarCount = 1; //全局总数，避免删除导致的显示BUG
    const expressionContainer = document.getElementById('expression-container');
    const resultContainer = document.getElementById('result');
    const conditionVariablesContainer = document.getElementById('condition-variables');
    const variablesContainer = document.getElementById('variables');

    // Function to render the current expression
    function renderExpression() {
        expressionContainer.innerHTML = '';
        const elements = currentExpression.split(' ').map(el => {
            const div = document.createElement('div');
            div.classList.add('expr-element');
            div.textContent = el;
            return div;
        });
        elements.forEach(div => expressionContainer.appendChild(div));
        updateResult();
    }

    // Function to update the result container
    function updateResult() {
        resultContainer.textContent = currentExpression;
    }

    // Handle selection of variables (c1, c2, etc.)
    variablesContainer.addEventListener('click', function (e) {
        if (e.target && e.target.classList.contains('expr-element')) {
            const value = e.target.getAttribute('data-value');
            const element = e.target;

            // Toggle selected class
            if (element.classList.contains('selected')) {
                element.classList.remove('selected');
                const index = selectedElements.indexOf(value);
                if (index !== -1) {
                    selectedElements.splice(index, 1);
                }
            } else {
                element.classList.add('selected');
                selectedElements.push(value);
            }
            updateCurrentExpression();
            renderExpression();
        }
    });

    // Handle the operation buttons (&&, ||)
    document.getElementById('operation-buttons').addEventListener('click', function (e) {
        if (e.target && e.target.classList.contains('operation')) {
            const operator = e.target.getAttribute('data-op');
            if (selectedElements.length >= 2) {
                // Add the operator between the last two elements
                const lastElement = selectedElements.pop();
                const secondLastElement = selectedElements.pop();
                selectedElements.push(`(${secondLastElement} ${operator} ${lastElement})`);
                updateCurrentExpression();
                renderExpression();
            }
        }
    });

    // Handle the quick operation buttons (满足全部, 满足任一)
    document.getElementById('quick-buttons').addEventListener('click', function (e) {
        if (e.target && e.target.classList.contains('quick-operation')) {
            const quickOp = e.target.getAttribute('data-op');
            if (selectedElements.length >= 1) {
                if (quickOp === 'all') {
                    currentExpression = selectedElements.join(' && ');
                } else if (quickOp === 'any') {
                    currentExpression = selectedElements.join(' || ');
                }
                currentExpression = `(${currentExpression})`; // Wrap the result in parentheses
                renderExpression();
            }
        }
    });

    // Update the current expression string based on the selected elements
    function updateCurrentExpression() {
        currentExpression = selectedElements.join(' ');
    }

    // Add a new condition variable
    function addCondition() {
        if (variableCount < 10) {
            variableCount++;
			globalVarCount++;
            const newCondition = document.createElement('div');
            newCondition.classList.add('condition-variable');
            newCondition.setAttribute('data-index', globalVarCount);
            newCondition.innerHTML = `
                <span>c${globalVarCount}</span>
                <input type="text" placeholder="变量描述" class="description" />
                <button class="remove-condition" onclick="removeCondition(${globalVarCount})"><i class="fas fa-times"></i> 删除</button>            `;
            conditionVariablesContainer.appendChild(newCondition);

            // Add the new variable to the selection list (variables container)
            const newVariable = document.createElement('div');
            newVariable.classList.add('expr-element');
            newVariable.setAttribute('data-value', `c${globalVarCount}`);
            newVariable.textContent = `c${globalVarCount}`;
            variablesContainer.appendChild(newVariable);
        } else {
            alert("最多只能有 10 个变量");
        }
    }

    // Remove a condition variable
    function removeCondition(index) {
        const conditionElement = document.querySelector(`.condition-variable[data-index="${index}"]`);
        conditionElement.remove();

        // Also remove the corresponding variable element from the selection list
        const variableElement = document.querySelector(`.expr-element[data-value="c${index}"]`);
        variableElement.remove();

        // Decrease variable count and prevent less than 1 condition variable
        if (variableCount > 1) {
            variableCount--;
        } else {
            alert("至少需要保留一个变量");
        }
    }

    // Initialize: Ensure at least one variable is present
    document.addEventListener('DOMContentLoaded', function () {
        if (variableCount === 1) {
            const conditionElement = document.createElement('div');
            conditionElement.classList.add('condition-variable');
            conditionElement.setAttribute('data-index', '1');
            conditionVariablesContainer.appendChild(conditionElement);
        }
    });


	// Function to reset the expression and selections
    function resetExpression() {
        // Clear selected elements
        selectedElements = [];
        currentExpression = "";

        // Reset the appearance of the selected elements
        const selectedElems = document.querySelectorAll('.expr-element.selected');
        selectedElems.forEach(elem => {
            elem.classList.remove('selected');
        });

        // Clear the expression container and result
        expressionContainer.innerHTML = '';
        resultContainer.textContent = '';

        // Optionally, reset the condition variables back to c1 if needed
		// 这里不变，变化了反而麻烦。
        <!-- variableCount = 1; -->
        <!-- conditionVariablesContainer.innerHTML = ` -->
            <!-- <div class="condition-variable" data-index="1"> -->
                <!-- <span>c1</span> -->
                <!-- <input type="text" placeholder="变量描述" class="description" /> -->
                <!-- <button class="remove-condition" onclick="removeCondition(1)">删除条件</button> -->
            <!-- </div> -->
        <!-- `; -->
        <!-- variablesContainer.innerHTML = ` -->
            <!-- <div class="expr-element" data-value="c1">c1</div> -->
        <!-- `; -->
    }
	
	function saveExpression() {
		// 1. 获取条件列表
		const conditionList = [];
		const conditionElements = document.querySelectorAll('.condition-variable');
		conditionElements.forEach(function (element) {
			// 安全访问 <span> 元素
			const nameElement = element.querySelector('span');
			const name = nameElement ? nameElement.textContent : ''; // 如果没有找到 <span>，则使用空字符串
			let remarkElem = element.querySelector('.description');
			const remark = remarkElem ? remarkElem.value : '';
			conditionList.push({ "name": name, "remark": remark });
		});

		// 2. 获取最终的表达式
		const conditionExpression = currentExpression;

		// 3. 构建 JSON 对象
		const jsonData = {
			"conditionList": conditionList,
			"conditionExpression": conditionExpression
		};

		// 4. 弹出 JSON 内容
		alert(JSON.stringify(jsonData, null, 2)); // 美化输出的 JSON
	}
</script>

</body>
</html>
```

# 参考资料

https://www.yuque.com/boyan-avfmj/aviatorscript/guhmrc

* any list
{:toc}