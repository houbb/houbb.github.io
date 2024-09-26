---
layout: post
title: Excel 解析分析-01-HTML 的方案？
date: 2024-09-26 21:01:55 +0800
categories: [Excel]
tags: [excel, data-analysis, sh]
published: true
---

# 背景

希望对一个 EXCEL 明细文件进行数据分析。

实现一个用户可以使用的工具？

# 大概思路

前期可以非常简单点，直接根据导出的 EXCEL 解析处理。

第一个阶段尝试直接使用 HTML + JS 实现。

后续如果数据量上来，再考虑引入后端+前端的方式。


# v1-EXCEL 的选择读取

## 如何让用户选择文件，输出路径？

```html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>请选择 Excel 文件</title>
</head>
<body>
    <input type="file" id="fileInput" accept=".xls,.xlsx">
    <script>
        document.getElementById('fileInput').addEventListener('change', function(event) {
            const filePath = event.target.value;
            console.log(filePath);
        });
    </script>
</body>
</html>
```

# V2-如何输出每一行的内容？

```html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>读取 Excel 文件</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js"></script>
</head>
<body>
    <input type="file" id="fileInput" accept=".xls,.xlsx">
    <script>
        document.getElementById('fileInput').addEventListener('change', function(event) {
            const file = event.target.files[0];
            const reader = new FileReader();

            reader.onload = function(e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // 假设读取第一个工作表
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // 将工作表转换为 JSON 格式
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // 输出每一行的内容
                jsonData.forEach((row, index) => {
                    console.log(`第 ${index + 1} 行:`, row);
                });
            };

            reader.readAsArrayBuffer(file);
        });
    </script>
</body>
</html>
```

# v3-将读取的 EXCEL 内容，直接渲染到页面的一个 table 表格中。

要将读取的 Excel 内容渲染到一个 HTML 表格中，你可以在之前的代码基础上进行修改。以下是更新后的代码示例：

```html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>读取并显示 Excel 文件</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js"></script>
    <style>
        table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
        }
        th {
            background-color: #f2f2f2;
        }
    </style>
</head>
<body>
    <input type="file" id="fileInput" accept=".xls,.xlsx">
    <table id="excelTable"></table>
    
    <script>
        document.getElementById('fileInput').addEventListener('change', function(event) {
            const file = event.target.files[0];
            const reader = new FileReader();

            reader.onload = function(e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // 清空表格
                const table = document.getElementById('excelTable');
                table.innerHTML = '';

                // 创建表头
                const headerRow = document.createElement('tr');
                jsonData[0].forEach(cell => {
                    const th = document.createElement('th');
                    th.textContent = cell;
                    headerRow.appendChild(th);
                });
                table.appendChild(headerRow);

                // 创建数据行
                jsonData.slice(1).forEach(row => {
                    const tr = document.createElement('tr');
                    row.forEach(cell => {
                        const td = document.createElement('td');
                        td.textContent = cell;
                        tr.appendChild(td);
                    });
                    table.appendChild(tr);
                });
            };

            reader.readAsArrayBuffer(file);
        });
    </script>
</body>
</html>
```

### 代码说明：
1. **表格结构**：添加一个 `<table>` 元素来展示 Excel 数据。
2. **样式**：为表格和单元格添加基本样式。
3. **清空表格**：在读取新文件时，清空表格内容。
4. **创建表头**：将第一行数据作为表头（`<th>`）进行渲染。
5. **创建数据行**：遍历剩余行，生成数据行（`<tr>` 和 `<td>`），并渲染到表格中。

通过这个代码，读取的 Excel 内容将直接渲染到网页上的表格中。


# V4-表格的内容太多了，样式不好看，去掉吧。在页面上显示一下EXCEL总行数。第一行为表头，不需要计算

你可以去掉表格样式并在页面上显示 Excel 的总行数（不计算表头）。以下是修改后的代码：

```html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>读取 Excel 文件并显示</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js"></script>
</head>
<body>
    <input type="file" id="fileInput" accept=".xls,.xlsx">
    <p id="rowCount"></p>
    <table id="excelTable"></table>

    <script>
        document.getElementById('fileInput').addEventListener('change', function(event) {
            const file = event.target.files[0];
            const reader = new FileReader();

            reader.onload = function(e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // 渲染表格
                const table = document.getElementById('excelTable');
                table.innerHTML = ''; // 清空表格

                jsonData.forEach((row, index) => {
                    const tr = document.createElement('tr');
                    row.forEach(cell => {
                        const td = document.createElement('td');
                        td.textContent = cell || ''; // 处理空单元格
                        tr.appendChild(td);
                    });
                    table.appendChild(tr);
                });

                // 显示总行数（不计算表头）
                const rowCount = jsonData.length - 1; // 减去表头
                document.getElementById('rowCount').textContent = `总行数: ${rowCount}`;
            };

            reader.readAsArrayBuffer(file);
        });
    </script>
</body>
</html>
```

### 主要修改：
1. **去掉了 CSS 样式**：让表格保持默认样式。
2. **显示总行数**：在页面上显示 Excel 文件的总行数（不计算表头）。 

这样，当用户选择 Excel 文件后，表格将以默认样式显示，同时在页面上显示总行数。

# V5-EXCEL 的表头如下：

订单号	下单时间	订单状态	发货方式	收件人姓名	收件人地址	省	市	区	收件人手机	买家备注	商家备注	订单实际支付金额	订单运费	支付方式	支付时间	交易单号	物流公司	快递单号	带货人昵称	授权号	预估佣金	实际佣金	实际服务费	技术服务费	技术服务费（将以人气卡形式返还）	运费险预计投保费用	商品名称	商品编码(平台)	商品编码(自定义)	SKU编码(自定义)	商品属性	商品价格	是否预售	商品数量	商品发货	商品售后	商品已退款金额

将每一个涉及到金额和数量的列全部相加汇总，要求避免精度丢失。显示在页面上。
包含如下列：订单实际支付金额	订单运费 预估佣金	实际佣金	实际服务 技术服务费	技术服务费（将以人气卡形式返还）	运费险预计投保费用 商品价格 商品数量 商品已退款金额

```html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>读取 Excel 文件并汇总数据</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js"></script>
    <style>
        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
        }
        .summary {
            margin-top: 16px;
        }
    </style>
</head>
<body>
    <h2>文件选择</h2>
    <input type="file" id="fileInput" accept=".xls,.xlsx">
    <h2>汇总信息</h2>
    <div class="summary" id="summary"></div>

    <script>
        document.getElementById('fileInput').addEventListener('change', function(event) {
            const file = event.target.files[0];
            const reader = new FileReader();

            reader.onload = function(e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

               
                //renderTable(jsonData);
                calculateSummary(jsonData);
            };

            reader.readAsArrayBuffer(file);
        });

        function renderTable(data) {
            const table = document.getElementById('dataTable');
            table.innerHTML = ''; // 清空之前的内容

            data.forEach((row, rowIndex) => {
                const tr = document.createElement('tr');
                row.forEach((cell) => {
                    const td = document.createElement(rowIndex === 0 ? 'th' : 'td');
                    td.textContent = cell;
                    tr.appendChild(td);
                });
                table.appendChild(tr);
            });
        }

        function calculateSummary(data) {
            // 找到列索引
            const header = data[0];
            const orderAmountIndex = header.indexOf('订单实际支付金额');
            const shippingCostIndex = header.indexOf('订单运费');
            const estimatedCommissionIndex = header.indexOf('预估佣金');
            const actualCommissionIndex = header.indexOf('实际佣金');
            const serviceFeeIndex = header.indexOf('实际服务费');
            const techServiceFeeIndex = header.indexOf('技术服务费');
            const techServiceReturnIndex = header.indexOf('技术服务费（将以人气卡形式返还）');
            const insuranceCostIndex = header.indexOf('运费险预计投保费用');
            const productPriceIndex = header.indexOf('商品价格');
            const productQuantityIndex = header.indexOf('商品数量');
            const refundedAmountIndex = header.indexOf('商品已退款金额');

            // 汇总变量
            let totalOrderAmount = 0;
            let totalShippingCost = 0;
            let totalEstimatedCommission = 0;
            let totalActualCommission = 0;
            let totalServiceFee = 0;
            let totalTechServiceFee = 0;
            let totalTechServiceReturn = 0;
            let totalInsuranceCost = 0;
            let totalProductPrice = 0;
            let totalProductQuantity = 0;
            let totalRefundedAmount = 0;

            // 从第二行开始汇总（第一行为表头）
            for (let i = 1; i < data.length; i++) {
                const row = data[i];

                totalOrderAmount += parseFloat(row[orderAmountIndex]) || 0;
                totalShippingCost += parseFloat(row[shippingCostIndex]) || 0;
                totalEstimatedCommission += parseFloat(row[estimatedCommissionIndex]) || 0;
                totalActualCommission += parseFloat(row[actualCommissionIndex]) || 0;
                totalServiceFee += parseFloat(row[serviceFeeIndex]) || 0;
                totalTechServiceFee += parseFloat(row[techServiceFeeIndex]) || 0;
                totalTechServiceReturn += parseFloat(row[techServiceReturnIndex]) || 0;
                totalInsuranceCost += parseFloat(row[insuranceCostIndex]) || 0;
                totalProductPrice += parseFloat(row[productPriceIndex]) || 0;
                totalProductQuantity += parseFloat(row[productQuantityIndex]) || 0;
                totalRefundedAmount += parseFloat(row[refundedAmountIndex]) || 0;
            }
			
			let totalCount = data.length - 1;

            // 显示汇总结果
            const summaryDiv = document.getElementById('summary');
            summaryDiv.innerHTML = `
                <p>总订单数: ${totalCount}</p>
                <p>订单实际支付金额总计: ${totalOrderAmount.toFixed(2)}</p>
                <p>订单运费总计: ${totalShippingCost.toFixed(2)}</p>
                <p>预估佣金总计: ${totalEstimatedCommission.toFixed(2)}</p>
                <p>实际佣金总计: ${totalActualCommission.toFixed(2)}</p>
                <p>实际服务费总计: ${totalServiceFee.toFixed(2)}</p>
                <p>技术服务费总计: ${totalTechServiceFee.toFixed(2)}</p>
                <p>技术服务费（将以人气卡形式返还）总计: ${totalTechServiceReturn.toFixed(2)}</p>
                <p>运费险预计投保费用总计: ${totalInsuranceCost.toFixed(2)}</p>
                <p>商品价格总计: ${totalProductPrice.toFixed(2)}</p>
                <p>商品数量总计: ${totalProductQuantity}</p>
                <p>商品已退款金额总计: ${totalRefundedAmount.toFixed(2)}</p>
            `;
        }
    </script>
</body>
</html>
```


# v5-利润计算公式

```
毛利=（单场成交GMV-退款金额）-原料成本-（成交人数*快递单价）-（成交单数*包材单价）-（成交单数*技术服务费单价）-（成交单数*运费险单价）
原料成本=包数*商品克价*规格克重
包数=（成交金额-退款金额）/客单价
克价=商品公斤价/1000
技术服务费=成交金额*0.03
运费险=(成交单数-退款单数)*0.13
```

## 问题

1）成交人数是如何确认的？还是说初期可以用成交单数来替代？因为导出的数据是脱敏的，无法确定一个人的身份。只有订单是唯一的。

## 拆解

所有的商品，实际上需要按照不同的商品进行分类处理。

商品的客单价可能随时调整，让用户可以手动输入。

于是问题就可以拆分为：

1）计算一种商品的利润

2）将全部类目的商品累加起来。

# 整体实现

## STEP1: 商品金额的可配置

### 整体思路

还是解析用户指定的 EXCEL, EXCEL 的表头如下：

```
订单号	下单时间	订单状态	发货方式	收件人姓名	收件人地址	省	市	区	收件人手机	买家备注	商家备注	订单实际支付金额	订单运费	支付方式	支付时间	交易单号	物流公司	快递单号	带货人昵称	授权号	预估佣金	实际佣金	实际服务费	技术服务费	技术服务费（将以人气卡形式返还）	运费险预计投保费用	商品名称	商品编码(平台)	商品编码(自定义)	SKU编码(自定义)	商品属性	商品价格	是否预售	商品数量	商品发货	商品售后	商品已退款金额
```

提取出所有的 商品名称，在页面上生成一个表格。

有8列：商品名称 成交订单金额总计 成交订单数总计 退款订单金额总计 退款订单数总计 成交人数总计 用户自定义客单价（输入框）  用户自定义商品公斤价（输入框） 用户自定义商品重量(输入框) 

其中：订单实际支付金额大于0，认为是成交订单; 已退款金额大于0，才认为是退款订单。成交人数，如果订单的收件人姓名+收件人地址+收件人手机相同，则认为是一个人。

### 代码

以下是一个完整的 HTML 示例，解析用户指定的 Excel 文件，提取商品名称，并生成包含成交订单金额总计、成交订单数总计、退款订单金额总计、退款订单数总计、成交人数总计，以及用户自定义客单价和商品公斤价的表格。

```html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>提取商品信息并生成表格</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js"></script>
    <style>
        table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
        }
    </style>
</head>
<body>
    <input type="file" id="fileInput" accept=".xls,.xlsx">
    <table id="dataTable">
        <thead>
            <tr>
                <th>商品名称</th>
                <th>成交订单金额总计</th>
                <th>成交订单数总计</th>
                <th>退款订单金额总计</th>
                <th>退款订单数总计</th>
                <th>成交人数总计</th>
                <th>用户自定义客单价</th>
                <th>用户自定义商品公斤价</th>
                <th>用户自定义商品重量</th>
            </tr>
        </thead>
        <tbody id="dataBody"></tbody>
    </table>

    <script>
        document.getElementById('fileInput').addEventListener('change', function(event) {
            const file = event.target.files[0];
            const reader = new FileReader();

            reader.onload = function(e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                generateProductTable(jsonData);
            };

            reader.readAsArrayBuffer(file);
        });

        function generateProductTable(data) {
            const productStats = {};
            const headers = data[0];

            // 找到需要的列索引
            const productNameIndex = headers.indexOf('商品名称');
            const orderAmountIndex = headers.indexOf('订单实际支付金额');
            const refundedAmountIndex = headers.indexOf('商品已退款金额');
            const recipientNameIndex = headers.indexOf('收件人姓名');
            const recipientAddressIndex = headers.indexOf('收件人地址');
            const recipientPhoneIndex = headers.indexOf('收件人手机');

            // 遍历数据，统计商品信息
            for (let i = 1; i < data.length; i++) {
                const row = data[i];
                const productName = row[productNameIndex];
                const orderAmount = parseFloat(row[orderAmountIndex]) || 0;
                const refundedAmount = parseFloat(row[refundedAmountIndex]) || 0;
                const recipientKey = `${row[recipientNameIndex]}_${row[recipientAddressIndex]}_${row[recipientPhoneIndex]}`;

                if (productName) {
                    if (!productStats[productName]) {
                        productStats[productName] = {
                            totalOrderAmount: 0,
                            totalOrders: 0,
                            totalRefundedAmount: 0,
                            totalRefundedOrders: 0,
                            uniqueCustomers: new Set()
                        };
                    }

                    // 统计成交订单
                    if (orderAmount > 0) {
                        productStats[productName].totalOrderAmount += orderAmount;
                        productStats[productName].totalOrders += 1;
                        productStats[productName].uniqueCustomers.add(recipientKey);
                    }

                    // 统计退款订单
                    if (refundedAmount > 0) {
                        productStats[productName].totalRefundedAmount += refundedAmount;
                        productStats[productName].totalRefundedOrders += 1;
                    }
                }
            }

            // 渲染表格
            const dataBody = document.getElementById('dataBody');
            dataBody.innerHTML = ''; // 清空之前的内容

            for (const [productName, stats] of Object.entries(productStats)) {
                const tr = document.createElement('tr');
                
                const nameCell = document.createElement('td');
                nameCell.textContent = productName;
                tr.appendChild(nameCell);

                const orderAmountCell = document.createElement('td');
                orderAmountCell.textContent = stats.totalOrderAmount.toFixed(2);
                tr.appendChild(orderAmountCell);

                const orderCountCell = document.createElement('td');
                orderCountCell.textContent = stats.totalOrders;
                tr.appendChild(orderCountCell);

                const refundedAmountCell = document.createElement('td');
                refundedAmountCell.textContent = stats.totalRefundedAmount.toFixed(2);
                tr.appendChild(refundedAmountCell);

                const refundedCountCell = document.createElement('td');
                refundedCountCell.textContent = stats.totalRefundedOrders;
                tr.appendChild(refundedCountCell);

                const uniqueCustomersCell = document.createElement('td');
                uniqueCustomersCell.textContent = stats.uniqueCustomers.size; // 成交人数
                tr.appendChild(uniqueCustomersCell);

                const priceCell = document.createElement('td');
                const inputPrice = document.createElement('input');
                inputPrice.type = 'number';
                inputPrice.placeholder = '客单价';
                priceCell.appendChild(inputPrice);
                tr.appendChild(priceCell);

                const weightCell = document.createElement('td');
                const inputWeight = document.createElement('input');
                inputWeight.type = 'number';
                inputWeight.placeholder = '公斤价';
                weightCell.appendChild(inputWeight);
                tr.appendChild(weightCell);

                const customWeightCell = document.createElement('td');
                const inputCustomWeight = document.createElement('input');
                inputCustomWeight.type = 'number';
                inputCustomWeight.placeholder = '商品重量';
                customWeightCell.appendChild(inputCustomWeight);
                tr.appendChild(customWeightCell);

                dataBody.appendChild(tr);
            }
        }
    </script>
</body>
</html>
```

### 代码说明：
1. **文件输入**：用户选择 Excel 文件后触发文件读取。
2. **读取和解析**：使用 `xlsx` 库读取文件并将其解析为 JSON 格式。
3. **统计商品信息**：
   - 遍历数据，统计每个商品名称的成交订单金额总计、成交订单数总计（订单实际支付金额大于0）、退款订单金额总计和退款订单数总计（已退款金额大于0），同时记录成交人数（通过收件人姓名、地址和手机组合成唯一标识）。
4. **生成表格**：在页面上生成一个包含商品名称、成交订单金额总计、成交订单数总计、退款订单金额总计、退款订单数总计、成交人数总计、用户自定义客单价和公斤价的表格。
5. **输入框**：每行的最后两列为输入框，允许用户输入自定义的客单价和公斤价。

通过这个示例，你可以提取 Excel 中的商品信息并生成相应的表格，显示在页面上。

## STEP2: 页面上新增一个开始计算每一个商品的基础信息

在上面的基础上，在页面新增一个【计算利润】按钮。

点击时要求输入框的价格必须输入，且必须大于0; 且生成新的页面表格：基本费用表格。

一共 7 列：商品名称 包数 克价 技术服务费 运费险 快递单价 利润

其中：

```
包数=（成交订单金额总计-退款订单金额总计）/用户自定义客单价  向上取取整
克价=用户自定义商品公斤价/1000
技术服务费=成交订单金额总计*0.03
运费险=(成交单数-退款单数)*0.13
原料成本=包数*商品克价*规格克重
快递单价=2元
利润 = (成交订单金额总计-退款订单金额总计）-原料成本-（成交人数*快递单价）-（成交单数*包材单价）-（成交单数*技术服务费单价）-（成交单数*运费险单价）
```


并且在最后生成总利润，放在页面最后：

```
总利润 = 每个商品的利润之和
```

### V1 代码效果

```html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>计算利润</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js"></script>
    <style>
        table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
        }
        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <input type="file" id="fileInput" accept=".xls,.xlsx">
    <table id="dataTable">
        <thead>
            <tr>
                <th>商品名称</th>
                <th>成交订单金额总计</th>
                <th>成交订单数总计</th>
                <th>退款订单金额总计</th>
                <th>退款订单数总计</th>
                <th>成交人数总计</th>
                <th>用户自定义客单价</th>
                <th>用户自定义商品公斤价</th>
                <th>用户自定义商品重量</th>
            </tr>
        </thead>
        <tbody id="dataBody"></tbody>
    </table>

    <button id="calculateProfit" class="hidden">计算利润</button>
    
    <table id="costTable" class="hidden">
        <thead>
            <tr>
                <th>商品名称</th>
                <th>包数</th>
                <th>克价</th>
                <th>技术服务费</th>
                <th>运费险</th>
                <th>快递单价</th>
                <th>利润</th>
				<th>利润明细(成交订单金额总计-退款订单金额总计）-原料成本-（成交人数*快递单价）-（成交单数*包材单价）-（成交单数*技术服务费单价）-（成交单数*运费险单价）</th>
            </tr>
        </thead>
        <tbody id="costBody"></tbody>
    </table>

    <div id="totalProfit" class="hidden"></div>

    <script>
        document.getElementById('fileInput').addEventListener('change', function(event) {
            const file = event.target.files[0];
            const reader = new FileReader();

            reader.onload = function(e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                generateProductTable(jsonData);
            };

            reader.readAsArrayBuffer(file);
        });

        function generateProductTable(data) {
            const productStats = {};
            const headers = data[0];

            const productNameIndex = headers.indexOf('商品名称');
            const orderAmountIndex = headers.indexOf('订单实际支付金额');
            const refundedAmountIndex = headers.indexOf('商品已退款金额');
            const recipientNameIndex = headers.indexOf('收件人姓名');
            const recipientAddressIndex = headers.indexOf('收件人地址');
            const recipientPhoneIndex = headers.indexOf('收件人手机');

            for (let i = 1; i < data.length; i++) {
                const row = data[i];
                const productName = row[productNameIndex];
                const orderAmount = parseFloat(row[orderAmountIndex]) || 0;
                const refundedAmount = parseFloat(row[refundedAmountIndex]) || 0;
                const recipientKey = `${row[recipientNameIndex]}_${row[recipientAddressIndex]}_${row[recipientPhoneIndex]}`;

                if (productName) {
                    if (!productStats[productName]) {
                        productStats[productName] = {
                            totalOrderAmount: 0,
                            totalOrders: 0,
                            totalRefundedAmount: 0,
                            totalRefundedOrders: 0,
                            uniqueCustomers: new Set()
                        };
                    }

                    if (orderAmount > 0) {
                        productStats[productName].totalOrderAmount += orderAmount;
                        productStats[productName].totalOrders += 1;
                        productStats[productName].uniqueCustomers.add(recipientKey);
                    }

                    if (refundedAmount > 0) {
                        productStats[productName].totalRefundedAmount += refundedAmount;
                        productStats[productName].totalRefundedOrders += 1;
                    }
                }
            }

            const dataBody = document.getElementById('dataBody');
            dataBody.innerHTML = '';

            for (const [productName, stats] of Object.entries(productStats)) {
                const tr = document.createElement('tr');

                const nameCell = document.createElement('td');
                nameCell.textContent = productName;
                tr.appendChild(nameCell);

                const orderAmountCell = document.createElement('td');
                orderAmountCell.textContent = stats.totalOrderAmount.toFixed(2);
                tr.appendChild(orderAmountCell);

                const orderCountCell = document.createElement('td');
                orderCountCell.textContent = stats.totalOrders;
                tr.appendChild(orderCountCell);

                const refundedAmountCell = document.createElement('td');
                refundedAmountCell.textContent = stats.totalRefundedAmount.toFixed(2);
                tr.appendChild(refundedAmountCell);

                const refundedCountCell = document.createElement('td');
                refundedCountCell.textContent = stats.totalRefundedOrders;
                tr.appendChild(refundedCountCell);

                const uniqueCustomersCell = document.createElement('td');
                uniqueCustomersCell.textContent = stats.uniqueCustomers.size;
                tr.appendChild(uniqueCustomersCell);

                const priceCell = document.createElement('td');
                const inputPrice = document.createElement('input');
                inputPrice.type = 'number';
                inputPrice.placeholder = '客单价';
				const defaultPrice = stats.totalOrderAmount.toFixed(2) / stats.totalOrders;
				inputPrice.value= defaultPrice.toFixed(2);
                priceCell.appendChild(inputPrice);
                tr.appendChild(priceCell);

                const weightCell = document.createElement('td');
                const inputWeight = document.createElement('input');
                inputWeight.type = 'number';
                inputWeight.placeholder = '公斤价';
				inputWeight.value=10;
                weightCell.appendChild(inputWeight);
                tr.appendChild(weightCell);

                const customWeightCell = document.createElement('td');
                const inputCustomWeight = document.createElement('input');
                inputCustomWeight.type = 'number';
                inputCustomWeight.placeholder = '商品重量';
				inputCustomWeight.value=20;
                customWeightCell.appendChild(inputCustomWeight);
                tr.appendChild(customWeightCell);

                dataBody.appendChild(tr);
            }

            document.getElementById('calculateProfit').classList.remove('hidden');
        }

        document.getElementById('calculateProfit').addEventListener('click', function() {
            const rows = document.querySelectorAll('#dataBody tr');
            const costBody = document.getElementById('costBody');
            costBody.innerHTML = ''; // 清空之前的内容
            let totalProfit = 0;

            for (const row of rows) {
                const cells = row.querySelectorAll('td');
                const productName = cells[0].textContent;
                const totalOrderAmount = parseFloat(cells[1].textContent);
                const totalRefundedAmount = parseFloat(cells[3].textContent);
                const totalOrders = parseInt(cells[2].textContent);
                const totalRefundedOrders = parseInt(cells[4].textContent);
                const uniqueCustomersCount = parseInt(cells[5].textContent);

                const inputPrice = cells[6].querySelector('input');
                const inputWeight = cells[7].querySelector('input');
                const inputCustomWeight = cells[8].querySelector('input');

                const userPrice = parseFloat(inputPrice.value);
                const userKgPrice = parseFloat(inputWeight.value);
                const userCustomWeight = parseFloat(inputCustomWeight.value);

                if (!userPrice || userPrice <= 0 || !userKgPrice || userKgPrice <= 0 || !userCustomWeight || userCustomWeight <= 0) {
                    alert('请输入有效的价格和重量！');
                    return;
                }

                const packageCount = Math.ceil((totalOrderAmount - totalRefundedAmount) / userPrice);
                const gramPrice = userKgPrice / 1000;
                const technicalServiceFee = totalOrderAmount * 0.03;
                const shippingInsurance = (totalOrders - totalRefundedOrders) * 0.13;
                const rawMaterialCost = packageCount * gramPrice * userCustomWeight;
                const expressUnitPrice = 2; // 快递单价
                const profit = (totalOrderAmount - totalRefundedAmount) - rawMaterialCost - (uniqueCustomersCount * expressUnitPrice) - technicalServiceFee - shippingInsurance;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${productName}</td>
                    <td>${packageCount}</td>
                    <td>${gramPrice.toFixed(4)}</td>
                    <td>${technicalServiceFee.toFixed(2)}</td>
                    <td>${shippingInsurance.toFixed(2)}</td>
                    <td>${expressUnitPrice.toFixed(2)}</td>
					<td>${profit.toFixed(2)}</td>
                    <td>(${totalOrderAmount.toFixed(2)} - ${totalRefundedAmount.toFixed(2)}) - ${rawMaterialCost.toFixed(2)} - (${uniqueCustomersCount.toFixed(2)} * ${expressUnitPrice.toFixed(2)}) - (${technicalServiceFee.toFixed(2)}) - (${shippingInsurance.toFixed(2)})</td>
                `;
                costBody.appendChild(tr);
                totalProfit += profit;
            }

            document.getElementById('totalProfit').innerHTML = `总利润: ${totalProfit.toFixed(2)}`;
            document.getElementById('totalProfit').classList.remove('hidden');
            document.getElementById('costTable').classList.remove('hidden');
        });
    </script>
</body>
</html>
```

# 总结

这种简单的结算不需要引入后端这么复杂的机制。

前端的计算也比较方便。

但是输入体验+页面样式非常简陋，有时间更新一下后续的版本。

# 参考资料

* any list
{:toc}