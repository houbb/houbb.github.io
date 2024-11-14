---
layout: post
title:  java 表达式引擎概览-05-google Aviator 表达式引擎布尔条件验证与规则引擎
date:  2020-5-26 15:11:16 +0800
categories: [Engine]
tags: [engine, expression-engine]
published: true
---

# 最佳实践

https://www.yuque.com/boyan-avfmj/aviatorscript/ou23gy

# STEP1: Aviator 执行表达式引擎==》规则引擎

## 最简单的例子

因为布尔值只是对应的 boolean，每一个对应一个条件。

所以最后的结果只是一个类似于 `(c1 && c2) || (c3 || c4)` 的表达式。

```java
public static void main(String[] args) {
    Map<String, Object> env = new HashMap<>();
    env.put("c1", true);
    env.put("c2", false);
    env.put("c3", true);
    env.put("c4", false);
    env.put("c5", true);
    boolean result = (boolean) AviatorEvaluator.execute("(c1 && c2) || (c3 || c4)", env);
    System.out.println(result);
}
```

# STEP2: 页面构建

## 如何把表达式在页面中渲染

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Expression Renderer</title>
    <style>
        .expr-element {
            display: inline-block;
            margin: 5px;
            padding: 5px;
            background-color: #e0e0e0;
            cursor: pointer;
        }
        .operator {
            background-color: #d1c4e9;
        }
        .variable {
            background-color: #c8e6c9;
        }
        .paren {
            background-color: #ffccbc;
        }
    </style>
</head>
<body>

<div id="expression-container"></div>

<script>
    // The expression to be rendered
    const expression = "(c1 && c2) || (c3 || c4)";

    // Function to render the expression as HTML elements
    function renderExpression(expr) {
        const container = document.getElementById('expression-container');
        container.innerHTML = ''; // Clear previous content

        const regex = /(\(|\)|\&\&|\|\||[a-zA-Z0-9_]+)/g;
        const tokens = expr.match(regex);

        tokens.forEach(token => {
            const div = document.createElement('div');
            div.classList.add('expr-element');

            if (token === '&&' || token === '||') {
                div.classList.add('operator');
                div.textContent = token;
            } else if (token === '(' || token === ')') {
                div.classList.add('paren');
                div.textContent = token;
            } else {
                div.classList.add('variable');
                div.textContent = token;
            }

            // Add the div element to the container
            container.appendChild(div);
        });
    }

    // Render the expression
    renderExpression(expression);
</script>

</body>
</html>
```


# STEP3: 页面动态渲染

## 基本需求

我想实现一个效果，首先可以定义各种变量，比如 c1,c2,c3。

然后让用户选择他们之间的与或非，用括号控制优先级。最简单的方式是让用户手动填写，但是可能会选错。如何设计一个简单的页面操作，首先将变量 c1,c2,c3.. 渲染为普通的 div 元素块，选择对应元素，点击下方的操作【且】【或】为元素加上对应的关系和括号。

比如选择 c1,c2，点击【且】，则页面渲染为 (c1 且 c2); 然后括号内的元素 (c1且c2)下次选择就会变成一个整体，选中后，此时再选择c3，，操作选择【或】，会变成((c1且c2) 或 c3)。依次类推，给出通用的 html 是实现代码。

## 初步实现

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Logical Expression Builder</title>
    <style>
        .expr-container {
            margin-bottom: 10px;
        }

        .expr-element {
            display: inline-block;
            margin: 5px;
            padding: 5px;
            background-color: #c8e6c9;
            cursor: pointer;
            border-radius: 5px;
        }

        .selected {
            background-color: #ffeb3b;  /* Highlight selected element */
        }

        .operator, .paren {
            background-color: #ffccbc;
            cursor: pointer;
            border-radius: 5px;
            padding: 5px;
        }

        #operation-buttons {
            margin-top: 20px;
        }

        .expr {
            margin-bottom: 10px;
        }

        #result {
            margin-top: 20px;
            padding: 10px;
            background-color: #e0e0e0;
        }
    </style>
</head>
<body>

<div id="variables-container">
    <div class="expr-container" id="variables">
        <div class="expr-element" data-value="c1">c1</div>
        <div class="expr-element" data-value="c2">c2</div>
        <div class="expr-element" data-value="c3">c3</div>
        <div class="expr-element" data-value="c4">c4</div>
        <div class="expr-element" data-value="c5">c5</div>
    </div>
</div>

<div id="operation-buttons">
    <button class="operation" data-op="&&">且</button>
    <button class="operation" data-op="||">或</button>
</div>

<div id="expression-container" class="expr-container"></div>

<div id="result"></div>

<script>
    let selectedElements = []; // Stores the current selected elements or expressions
    const expressionContainer = document.getElementById('expression-container');
    const resultContainer = document.getElementById('result');

    // Function to render the current expression
    function renderExpression() {
        expressionContainer.innerHTML = '';
        selectedElements.forEach(el => {
            const div = document.createElement('div');
            div.classList.add('expr-element');
            div.textContent = el;
            expressionContainer.appendChild(div);
        });
        updateResult();
    }

    // Function to update the result container
    function updateResult() {
        resultContainer.textContent = selectedElements.join(' ');
    }

    // Handle selection of variables (c1, c2, etc.)
    document.getElementById('variables').addEventListener('click', function (e) {
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
                renderExpression();
            }
        }
    });

    // Render initial state (empty expression)
    renderExpression();
</script>

</body>
</html>
```

## 页面优化

看了下你的实现，非常不错。让我们按照这个方向继续优化

1）上方最基本的 c1,c2...cn 元素

2）中间是操作关系栏：【且】【或】

3）下方是关系效果栏

4）最下方是最后的表达式输出。

将你上面的代码加一个对应的分块标签描述，让其看起来更加清晰。

优化后的实现：

### 实现

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Logical Expression Builder</title>
    <style>
        /* Basic styling for layout */
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            padding: 0;
            background-color: #f5f5f5;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }

        .section {
            margin-bottom: 20px;
        }

        .expr-container {
            margin-bottom: 10px;
            display: flex;
            flex-wrap: wrap;
        }

        .expr-element {
            display: inline-block;
            margin: 5px;
            padding: 8px;
            background-color: #c8e6c9;
            cursor: pointer;
            border-radius: 5px;
            transition: background-color 0.2s;
        }

        .selected {
            background-color: #ffeb3b; /* Highlight selected element */
        }

        .operator, .paren {
            background-color: #ffccbc;
            cursor: pointer;
            border-radius: 5px;
            padding: 5px;
            margin: 5px;
            transition: background-color 0.2s;
        }

        .operator:hover, .paren:hover, .expr-element:hover {
            background-color: #ff9800;
        }

        #operation-buttons {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
        }

        #operation-buttons button {
            width: 45%;
        }

        #expression-container {
            margin-top: 20px;
            display: flex;
            flex-wrap: wrap;
            background-color: #f1f8e9;
            padding: 10px;
            border-radius: 5px;
        }

        #result {
            margin-top: 20px;
            padding: 10px;
            background-color: #e0e0e0;
            border-radius: 5px;
            font-weight: bold;
        }

    </style>
</head>
<body>

<div class="container">

    <!-- Section 1: Variable Elements -->
    <div class="section">
        <h3>1) 选择变量：</h3>
        <div class="expr-container" id="variables">
            <div class="expr-element" data-value="c1">c1</div>
            <div class="expr-element" data-value="c2">c2</div>
            <div class="expr-element" data-value="c3">c3</div>
            <div class="expr-element" data-value="c4">c4</div>
            <div class="expr-element" data-value="c5">c5</div>
        </div>
    </div>

    <!-- Section 2: Operator Buttons -->
    <div class="section">
        <h3>2) 选择操作符：</h3>
        <div id="operation-buttons">
            <button class="operation" data-op="&&">且</button>
            <button class="operation" data-op="||">或</button>
        </div>
    </div>

    <!-- Section 3: Expression Preview -->
    <div class="section">
        <h3>3) 当前关系效果：</h3>
        <div id="expression-container" class="expr-container"></div>
    </div>

    <!-- Section 4: Final Expression Output -->
    <div class="section">
        <h3>4) 最终表达式：</h3>
        <div id="result"></div>
    </div>

</div>

<script>
    let selectedElements = []; // Stores the current selected elements or expressions
    const expressionContainer = document.getElementById('expression-container');
    const resultContainer = document.getElementById('result');

    // Function to render the current expression
    function renderExpression() {
        expressionContainer.innerHTML = '';
        selectedElements.forEach(el => {
            const div = document.createElement('div');
            div.classList.add('expr-element');
            div.textContent = el;
            expressionContainer.appendChild(div);
        });
        updateResult();
    }

    // Function to update the result container
    function updateResult() {
        resultContainer.textContent = selectedElements.join(' ');
    }

    // Handle selection of variables (c1, c2, etc.)
    document.getElementById('variables').addEventListener('click', function (e) {
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
                renderExpression();
            }
        }
    });

    // Render initial state (empty expression)
    renderExpression();
</script>

</body>
</html>
```

# STEP4: 拓展操作符

## 需求

非常好。

让我们继续改进，选择操作符这里栏目前只有【且】【或】两个关系按钮；让我们继续增加几个快捷操作，方便用户操作：

1）满足全部：关系效果为全部变量的关系为 &&

2）满足任一：关系效果为全部变量的关系为 ||

页面布局为 【满足全部】【满足任一】 | 【且】【或】

## 实现

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Logical Expression Builder</title>
    <style>
        /* Basic styling for layout */
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            padding: 0;
            background-color: #f5f5f5;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }

        .section {
            margin-bottom: 20px;
        }

        .expr-container {
            margin-bottom: 10px;
            display: flex;
            flex-wrap: wrap;
        }

        .expr-element {
            display: inline-block;
            margin: 5px;
            padding: 8px;
            background-color: #c8e6c9;
            cursor: pointer;
            border-radius: 5px;
            transition: background-color 0.2s;
        }

        .selected {
            background-color: #ffeb3b; /* Highlight selected element */
        }

        .operator, .paren, .quick-operation {
            background-color: #ffccbc;
            cursor: pointer;
            border-radius: 5px;
            padding: 5px;
            margin: 5px;
            transition: background-color 0.2s;
            width: 45%; /* Keep the buttons consistent in size */
        }

        .operator:hover, .paren:hover, .expr-element:hover, .quick-operation:hover {
            background-color: #ff9800;
        }

        #operation-buttons, #quick-buttons {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
        }

        #operation-buttons button, #quick-buttons button {
            width: 45%;
        }

        #expression-container {
            margin-top: 20px;
            display: flex;
            flex-wrap: wrap;
            background-color: #f1f8e9;
            padding: 10px;
            border-radius: 5px;
        }

        #result {
            margin-top: 20px;
            padding: 10px;
            background-color: #e0e0e0;
            border-radius: 5px;
            font-weight: bold;
        }

    </style>
</head>
<body>

<div class="container">

    <!-- Section 1: Variable Elements -->
    <div class="section">
        <h3>1) 选择变量：</h3>
        <div class="expr-container" id="variables">
            <div class="expr-element" data-value="c1">c1</div>
            <div class="expr-element" data-value="c2">c2</div>
            <div class="expr-element" data-value="c3">c3</div>
            <div class="expr-element" data-value="c4">c4</div>
            <div class="expr-element" data-value="c5">c5</div>
        </div>
    </div>

    <!-- Section 2: Operator Buttons -->
    <div class="section">
        <h3>2) 选择操作符：</h3>
        <div id="quick-buttons">
            <button class="quick-operation" data-op="all">满足全部</button>
            <button class="quick-operation" data-op="any">满足任一</button>
        </div>
        <div id="operation-buttons">
            <button class="operation" data-op="&&">且</button>
            <button class="operation" data-op="||">或</button>
        </div>
    </div>

    <!-- Section 3: Expression Preview -->
    <div class="section">
        <h3>3) 当前关系效果：</h3>
        <div id="expression-container" class="expr-container"></div>
    </div>

    <!-- Section 4: Final Expression Output -->
    <div class="section">
        <h3>4) 最终表达式：</h3>
        <div id="result"></div>
    </div>

</div>

<script>
    let selectedElements = []; // Stores the current selected elements or expressions
    let currentExpression = ""; // Stores the current expression as a string
    const expressionContainer = document.getElementById('expression-container');
    const resultContainer = document.getElementById('result');

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
    document.getElementById('variables').addEventListener('click', function (e) {
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
                    // For "满足全部", use && for all selected elements
                    currentExpression = selectedElements.join(' && ');
                } else if (quickOp === 'any') {
                    // For "满足任一", use || for all selected elements
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

    // Render initial state (empty expression)
    renderExpression();
</script>

</body>
</html>
```

# STEP5: 拓展元素

## 需求

实际使用过程中，变量一般不是固定死的。

让我们在最下方加一个条件变量模块。

1）变量名固定为 c1, c2 这种形式，从 1 开始递增。

2）变量拥有下面的属性

a. 变量名，系统自动生成，按照 1 的要求

b. 变量描述，允许用户输入 input，方便用户理解。

3）初始化固定一个变量 c1，点击【新增条件】按钮，可以增加一个变量，点击后方的【删除条件】删除对应条件

4）至少保留1个变量，最多10个变量

这个变量同步更新到我们原来的选择变量栏中，给出完整的实现：

## 实现

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Logical Expression Builder</title>
    <style>
        /* Basic styling for layout */
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            padding: 0;
            background-color: #f5f5f5;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }

        .section {
            margin-bottom: 20px;
        }

        .expr-container {
            margin-bottom: 10px;
            display: flex;
            flex-wrap: wrap;
        }

        .expr-element {
            display: inline-block;
            margin: 5px;
            padding: 8px;
            background-color: #c8e6c9;
            cursor: pointer;
            border-radius: 5px;
            transition: background-color 0.2s;
        }

        .selected {
            background-color: #ffeb3b; /* Highlight selected element */
        }

        .operator, .paren, .quick-operation {
            background-color: #ffccbc;
            cursor: pointer;
            border-radius: 5px;
            padding: 5px;
            margin: 5px;
            transition: background-color 0.2s;
            width: 45%; /* Keep the buttons consistent in size */
        }

        .operator:hover, .paren:hover, .expr-element:hover, .quick-operation:hover {
            background-color: #ff9800;
        }

        #operation-buttons, #quick-buttons {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
        }

        #operation-buttons button, #quick-buttons button {
            width: 45%;
        }

        #expression-container {
            margin-top: 20px;
            display: flex;
            flex-wrap: wrap;
            background-color: #f1f8e9;
            padding: 10px;
            border-radius: 5px;
        }

        #result {
            margin-top: 20px;
            padding: 10px;
            background-color: #e0e0e0;
            border-radius: 5px;
            font-weight: bold;
        }

        /* New styles for condition variables section */
        .condition-container {
            margin-top: 20px;
            padding: 10px;
            background-color: #f1f8e9;
            border-radius: 5px;
        }

        .condition-variable {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }

        .condition-variable input {
            margin-left: 10px;
            padding: 5px;
            margin-right: 10px;
            flex-grow: 1;
        }

        .condition-variable button {
            background-color: #ffccbc;
            border-radius: 5px;
            padding: 5px;
            cursor: pointer;
        }

        .condition-variable button:hover {
            background-color: #ff9800;
        }
    </style>
</head>
<body>

<div class="container">

    <!-- Section 1: Variable Elements -->
    <div class="section">
        <h3>1) 选择变量：</h3>
        <div class="expr-container" id="variables">
            <div class="expr-element" data-value="c1">c1</div>
        </div>
    </div>

    <!-- Section 2: Operator Buttons -->
    <div class="section">
        <h3>2) 选择操作符：</h3>
        <div id="quick-buttons">
            <button class="quick-operation" data-op="all">满足全部</button>
            <button class="quick-operation" data-op="any">满足任一</button>
        </div>
        <div id="operation-buttons">
            <button class="operation" data-op="&&">且</button>
            <button class="operation" data-op="||">或</button>
        </div>
    </div>

    <!-- Section 3: Expression Preview -->
    <div class="section">
        <h3>3) 当前关系效果：</h3>
        <div id="expression-container" class="expr-container"></div>
    </div>

    <!-- Section 4: Final Expression Output -->
    <div class="section">
        <h3>4) 最终表达式：</h3>
        <div id="result"></div>
    </div>

    <!-- Section 5: Condition Variables -->
    <div class="section condition-container">
        <h3>5) 条件变量：</h3>
        <div id="condition-variables">
            <div class="condition-variable" data-index="1">
                <span>c1</span>
                <input type="text" placeholder="变量描述" class="description" />
                <button class="remove-condition" onclick="removeCondition(1)">删除条件</button>
            </div>
        </div>
        <button id="add-condition" onclick="addCondition()">新增条件</button>
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
                <button class="remove-condition" onclick="removeCondition(${variableCount})">删除条件</button>            `;
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

</script>

</body>
</html>
```

# STEP6: 时光机

## 需求

到这里都非常棒。不过还是有一个点需要改进，我们在设置变量关系时，如果设置错了，就没有任何回旋的余地了。

你觉得是添加一个关系重置的按钮，清空效果+表达式比较好；还是添加一个类似于 ps 的那种上一步/下一步 的操作按钮比较好？

### 解答

确实在用户设置变量关系时，可能会不小心设错，导致无法轻松回到之前的状态。

对于这种情况，我觉得有两种解决方案可以考虑：

### 1. **添加关系重置按钮**（清空效果和表达式）
   这种方式直接、简单，用户可以在任何时候点击一个“重置”按钮，将当前的设置清空，恢复到初始状态。它不会干扰当前的流程，并且对用户来说是一个明确的操作，特别适用于用户希望彻底重置当前表达式的情况。

   **优点：**
   - 实现简单，用户一目了然。
   - 如果用户希望从头开始设置，清空所有设置是非常直观的操作。
   - 没有复杂的状态管理，操作简便。

   **缺点：**
   - 如果用户误点击重置，所有的工作都会丢失，恢复困难。
   - 对于较复杂的操作，可能会让用户感到有些不便。

### 2. **上一步/下一步按钮（类似 PS）**
   这种方式可以提供更多的灵活性，允许用户在设置过程中回到之前的状态，而无需重新开始。每次变更都会记录操作的历史，用户可以轻松撤销和重做。

   **优点：**
   - 用户能够有更多的控制权，回到之前的状态，减少操作错误带来的困扰。
   - 比较适用于复杂的逻辑表达式构建，允许用户逐步调整。

   **缺点：**
   - 实现较为复杂，需要管理状态历史。
   - 如果操作记录过多，可能导致内存和性能的开销，特别是在涉及大量状态变化时。
   - 用户需要理解“上一步”和“下一步”机制，可能需要一定的学习成本。

### 个人建议

考虑到我们的应用场景是构建逻辑表达式，且用户不一定会非常频繁地更改设置，同时提供**“重置”按钮**会更加简单和直观。

重置按钮能够清晰地将用户从当前设置恢复到初始状态，且操作更简单，不需要过多的逻辑和内存管理。

## 重置按钮实现

在现有的设计上，我们可以增加一个**重置按钮**，来清空当前选择和表达式。

```html
<!-- Add a Reset button -->
<button id="reset-btn" onclick="resetExpression()">重置</button>
```

对应的 js 方法

```js
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
```

# STEP7: 样式调整

## 需求

当现在为止特别棒。

选择操作符这一栏目前有 5 个按钮，让我们做一下样式优化，


1）让五个按钮在一行。且符合操作习惯的远近关系。【满足全部】【满足任一】 | 【且】【或】|【重置】

2）颜色标注，给出合适的按钮颜色，比如【重置】一般为 warning 警告的黄色

3）只给出按钮相关的代码+css 样式改动即可

## 最后的效果

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Logical Expression Builder</title>
    <style>
        /* Basic styling for layout */
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            padding: 0;
            background-color: #f5f5f5;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }

        .section {
            margin-bottom: 20px;
        }

        .expr-container {
            margin-bottom: 10px;
            display: flex;
            flex-wrap: wrap;
        }

        .expr-element {
            display: inline-block;
            margin: 5px;
            padding: 8px;
            background-color: #c8e6c9;
            cursor: pointer;
            border-radius: 5px;
            transition: background-color 0.2s;
        }

        .selected {
            background-color: #ffeb3b; /* Highlight selected element */
        }

        .operator, .paren, .quick-operation {
            background-color: #ffccbc;
            cursor: pointer;
            border-radius: 5px;
            padding: 5px;
            margin: 5px;
            transition: background-color 0.2s;
            width: 45%; /* Keep the buttons consistent in size */
        }

        .operator:hover, .paren:hover, .expr-element:hover, .quick-operation:hover {
            background-color: #ff9800;
        }

        #expression-container {
            margin-top: 20px;
            display: flex;
            flex-wrap: wrap;
            background-color: #f1f8e9;
            padding: 10px;
            border-radius: 5px;
        }

        #result {
            margin-top: 20px;
            padding: 10px;
            background-color: #e0e0e0;
            border-radius: 5px;
            font-weight: bold;
        }

        /* New styles for condition variables section */
        .condition-container {
            margin-top: 20px;
            padding: 10px;
            background-color: #f1f8e9;
            border-radius: 5px;
        }

        .condition-variable {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }

        .condition-variable input {
            margin-left: 10px;
            padding: 5px;
            margin-right: 10px;
            flex-grow: 1;
        }

        .condition-variable button {
            background-color: #ffccbc;
            border-radius: 5px;
            padding: 5px;
            cursor: pointer;
        }

        .condition-variable button:hover {
            background-color: #ff9800;
        }
		
		/* Container for quick operation buttons */
		#quick-buttons {
			display: flex;
			gap: 10px;
			margin-bottom: 10px;
		}

		/* Container for main operation buttons */
		#operation-buttons {
			display: flex;
			gap: 10px;
			margin-bottom: 10px;
		}

		/* Quick operation buttons styling (满足全部, 满足任一) */
		.quick-operation {
			padding: 8px 15px;
			font-size: 14px;
			cursor: pointer;
			border: 1px solid #ccc;
			border-radius: 4px;
			background-color: #f0f0f0;
			transition: background-color 0.3s;
		}

		.quick-operation:hover {
			background-color: #e0e0e0;
		}

		/* Main operation buttons styling (且, 或) */
		.operation {
			padding: 8px 15px;
			font-size: 14px;
			cursor: pointer;
			border: 1px solid #ccc;
			border-radius: 4px;
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
			border: 1px solid #f1c40f;
			border-radius: 4px;
			background-color: #f39c12;
			color: white;
			transition: background-color 0.3s;
		}

		#reset-btn:hover {
			background-color: #e67e22;
		}

		/* Styling for the section header */
		.section h3 {
			font-size: 16px;
			margin-bottom: 10px;
		}

    </style>
</head>
<body>

<div class="container">

    <!-- Section 1: Variable Elements -->
    <div class="section">
        <h3>1) 选择变量：</h3>
        <div class="expr-container" id="variables">
            <div class="expr-element" data-value="c1">c1</div>
        </div>
    </div>

    <!-- Section 2: Operator Buttons -->
    <div class="section">
        <h3>2) 选择操作符：</h3>
        <div id="quick-buttons">
            <button class="quick-operation" data-op="all">满足全部</button>
            <button class="quick-operation" data-op="any">满足任一</button>
        </div>
        <div id="operation-buttons">
            <button class="operation" data-op="&&">且</button>
            <button class="operation" data-op="||">或</button>
        </div>
		
		<!-- Add a Reset button -->
		<button id="reset-btn" onclick="resetExpression()">重置</button>
    </div>

    <!-- Section 3: Expression Preview -->
    <div class="section">
        <h3>3) 当前关系效果：</h3>
        <div id="expression-container" class="expr-container"></div>
    </div>

    <!-- Section 4: Final Expression Output -->
    <div class="section">
        <h3>4) 最终表达式：</h3>
        <div id="result"></div>
    </div>

    <!-- Section 5: Condition Variables -->
    <div class="section condition-container">
        <h3>5) 条件变量：</h3>
        <div id="condition-variables">
            <div class="condition-variable" data-index="1">
                <span>c1</span>
                <input type="text" placeholder="变量描述" class="description" />
                <button class="remove-condition" onclick="removeCondition(1)">删除条件</button>
            </div>
        </div>
        <button id="add-condition" onclick="addCondition()">新增条件</button>
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
                <button class="remove-condition" onclick="removeCondition(${variableCount})">删除条件</button>            `;
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

# 参考资料

https://www.yuque.com/boyan-avfmj/aviatorscript/guhmrc

* any list
{:toc}