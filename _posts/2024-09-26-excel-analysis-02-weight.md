---
layout: post
title: Excel 解析分析-02-添加规格分类
date: 2024-09-26 21:01:55 +0800
categories: [Excel]
tags: [excel, data-analysis, sh]
published: true
---

# 核心代码

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

    <h1>
	1. 选择订单EXCEL
	</h1>
    <input type="file" id="fileInput" accept=".xls,.xlsx">
    <table id="dataTable">
        <thead>
            <tr>
                <th>商品名称</th>
				<th>商品属性</th>
                <th>成交金额总计(元)</th>
                <th>成交数总计(个)</th>
                <th>退款金额总计(元)</th>
                <th>退款数总计(个)</th>
                <th>成交人数预估(人)</th>
                <th>商品客单价(元)</th>
                <th>商品采购公斤价(元)</th>
                <th>商品重量(克)</th>
            </tr>
        </thead>
        <tbody id="dataBody"></tbody>
    </table>

	
	<h1>
	2. 利润计算
	</h1>
	
	<h2>2.1 计算解释</h2>
	毛利=（单场成交GMV-退款金额）-原料成本-（成交人数*快递单价）-（成交单数*包材单价）-（成交单数*技术服务费单价）-（成交单数*运费险单价） <br/>
	原料成本=包数*商品克价*规格克重       <br/>
	包数=（成交金额-退款金额）/客单价      <br/>
	克价=商品公斤价/1000  <br/>
	技术服务费=成交金额*0.03  <br/>
	运费险=(成交单数-退款单数)*0.13  <br/>

	<h2>2.2 费用配置</h2>
	成交总人数: <input id="configSuccessPersonCount" value="0"></input>
	快递单价(元)：<input id="configKuaiduFeePerson" value="2"></input>
				
    <button id="calculateProfit" class="hidden">计算利润</button>
    
    <h2>2.3 利润汇总</h2>
	总利润=商品利润之和-(成交人数*快递单价)
	
	<div id="totalProfit" class="hidden"></div>
	
    <table id="costTable" class="hidden">
        <thead>
            <tr>
                <th>商品名称</th>
				<th>商品属性</th>
                <th>包数</th>
                <th>克价</th>
                <th>技术服务费</th>
                <th>运费险</th>
                <th>利润</th>
				<th>利润明细=(成交订单金额总计-退款订单金额总计）-原料成本-（成交单数*包材单价）-（成交单数*技术服务费单价）</th>
            </tr>
        </thead>
        <tbody id="costBody"></tbody>
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
		
		// 提取重量
		function extraWeight(description) {
			  // 定义正则表达式，用于匹配数字、克或g以及可能的乘法
			  const weightRegex = /(\d+)(克|g)/g;
			  const multiplierRegex = /\*(\d+)/g;

			  // 查找所有匹配的重量
			  let weightMatches = description.match(weightRegex);
			  let multiplierMatches = description.match(multiplierRegex);

			  // 如果没有找到匹配项，返回0
			  if (!weightMatches) {
				return 0;
			  }

			  // 初始化总重量
			  let totalWeight = 0;

			  // 遍历所有匹配的重量
			  weightMatches.forEach((match, index) => {
				// 提取数字
				let weight = parseInt(match.match(/\d+/)[0], 10);

				// 如果存在乘数，并且是当前重量的乘数，则乘以乘数
				if (multiplierMatches && multiplierMatches[index]) {
				  let multiplier = parseInt(multiplierMatches[index].match(/\d+/)[0], 10);
				  weight *= multiplier;
				}

				// 将提取的重量加到总重量上
				totalWeight += weight;
			  });

			  // 返回总重量
			  return totalWeight;
		}

        function generateProductTable(data) {
            const productStats = {};
            const headers = data[0];

            const productNameIndex = headers.indexOf('商品名称');
			const productPropIndex = headers.indexOf('商品属性');
            const orderAmountIndex = headers.indexOf('订单实际支付金额');
            const refundedAmountIndex = headers.indexOf('商品已退款金额');
            const recipientNameIndex = headers.indexOf('收件人姓名');
            const recipientAddressIndex = headers.indexOf('收件人地址');
            const recipientPhoneIndex = headers.indexOf('收件人手机');

            let  totalSuccessPerson = 0;
            for (let i = 1; i < data.length; i++) {
                const row = data[i];
                const productName = row[productNameIndex];
                const productProp = row[productPropIndex];
                const orderAmount = parseFloat(row[orderAmountIndex]) || 0;
                const refundedAmount = parseFloat(row[refundedAmountIndex]) || 0;
                const recipientKey = `${row[recipientNameIndex]}_${row[recipientAddressIndex]}_${row[recipientPhoneIndex]}`;

                if (productName && productProp) {
                    if (!productStats[productName+productProp]) {
                        productStats[productName+productProp] = {
                            totalOrderAmount: 0,
                            totalOrders: 0,
                            totalRefundedAmount: 0,
                            totalRefundedOrders: 0,
							productName: productName,
							productProp: productProp,
                            uniqueCustomers: new Set()
                        };
                    }

                    if (orderAmount > 0) {
                        productStats[productName+productProp].totalOrderAmount += orderAmount;
                        productStats[productName+productProp].totalOrders += 1;
                        productStats[productName+productProp].uniqueCustomers.add(recipientKey);
                    }

                    if (refundedAmount > 0) {
                        productStats[productName+productProp].totalRefundedAmount += refundedAmount;
                        productStats[productName+productProp].totalRefundedOrders += 1;
                    }
                }
            }

            const dataBody = document.getElementById('dataBody');
            dataBody.innerHTML = '';

            for (const [productName, stats] of Object.entries(productStats)) {
                const tr = document.createElement('tr');

                const nameCell = document.createElement('td');
                nameCell.textContent = stats.productName;
                tr.appendChild(nameCell);

				const propCell = document.createElement('td');
                propCell.textContent = stats.productProp;
                tr.appendChild(propCell);
				
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
				
				// 更新总人数
				totalSuccessPerson += stats.uniqueCustomers.size;

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
				inputCustomWeight.value=extraWeight(stats.productProp);
				if(inputCustomWeight.value == 0) {
				   inputCustomWeight.style.color = 'red';
				}
                customWeightCell.appendChild(inputCustomWeight);
                tr.appendChild(customWeightCell);

                dataBody.appendChild(tr);
            }

            document.getElementById('configSuccessPersonCount').value = totalSuccessPerson;
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
                const productProp = cells[1].textContent;
                const totalOrderAmount = parseFloat(cells[2].textContent);
                const totalRefundedAmount = parseFloat(cells[4].textContent);
                const totalOrders = parseInt(cells[3].textContent);
                const totalRefundedOrders = parseInt(cells[5].textContent);
                const uniqueCustomersCount = parseInt(cells[6].textContent);
                const inputPrice = cells[7].querySelector('input');
                const inputWeight = cells[8].querySelector('input');
                const inputCustomWeight = cells[9].querySelector('input');

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
                const profit = (totalOrderAmount - totalRefundedAmount) - rawMaterialCost - technicalServiceFee - shippingInsurance;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${productName}</td>
					<td>${productProp}</td>
                    <td>${packageCount}</td>
                    <td>${gramPrice.toFixed(4)}</td>
                    <td>${technicalServiceFee.toFixed(2)}</td>
                    <td>${shippingInsurance.toFixed(2)}</td>
					<td>${profit.toFixed(2)}</td>
                    <td>(${totalOrderAmount.toFixed(2)} - ${totalRefundedAmount.toFixed(2)}) - ${rawMaterialCost.toFixed(2)} - (${technicalServiceFee.toFixed(2)}) - (${shippingInsurance.toFixed(2)})</td>
                `;
                costBody.appendChild(tr);
                totalProfit += profit;
            }

            let configSuccessPersonCount = document.getElementById('configSuccessPersonCount').value;
            let configKuaiduFeePerson = document.getElementById('configKuaiduFeePerson').value;
			let totalPureProfit = totalProfit - configSuccessPersonCount * configKuaiduFeePerson;
            document.getElementById('totalProfit').innerHTML = `总利润: ${totalPureProfit.toFixed(2)}=${totalProfit.toFixed(2)}-(${configSuccessPersonCount}*${configKuaiduFeePerson})`;
            document.getElementById('totalProfit').classList.remove('hidden');
            document.getElementById('costTable').classList.remove('hidden');
        });
    </script>
</body>
</html>
```

# V0.2.1 优化商品数量

## 优化点

1）修正账户密码

2）修正费用比例

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

    <h1>
	1. 选择订单EXCEL
	</h1>
    <input type="file" id="fileInput" accept=".xls,.xlsx">
    <table id="dataTable">
        <thead>
            <tr>
                <th>商品名称</th>
				<th>商品属性</th>
                <th>成交金额总计(元)</th>
                <th>成交数总计(个)</th>
                <th>退款金额总计(元)</th>
                <th>退款数总计(个)</th>
                <th>成交人数预估(人)</th>
                <th>商品客单价(元)</th>
                <th>商品采购公斤价(元)</th>
                <th>商品重量(克)</th>
            </tr>
        </thead>
        <tbody id="dataBody"></tbody>
    </table>

	
	<h1>
	2. 利润计算
	</h1>
	
	<h2>2.1 计算解释</h2>
	毛利=（单场成交GMV-退款金额）-原料成本-（成交人数*快递单价）-（成交单数*包材单价）-（成交单数*技术服务费单价）-（成交单数*运费险单价） <br/>
	原料成本=包数*商品克价*规格克重       <br/>
	包数=（成交金额-退款金额）/客单价      <br/>
	克价=商品公斤价/1000  <br/>
	技术服务费=成交金额*0.02  <br/>
	运费险=(成交单数-退款单数)*0.13  <br/>

	<h2>2.2 费用配置</h2>
	成交总人数: <input id="configSuccessPersonCount" value="0"></input>
	快递单价(元)：<input id="configKuaiduFeePerson" value="2"></input>
				
    <button id="calculateProfit" class="hidden">计算利润</button>
    
    <h2>2.3 利润汇总</h2>
	总利润=商品利润之和-(成交人数*快递单价)
	
	<div id="totalProfit" class="hidden"></div>
	
    <table id="costTable" class="hidden">
        <thead>
            <tr>
                <th>商品名称</th>
				<th>商品属性</th>
                <th>包数</th>
                <th>克价</th>
                <th>技术服务费</th>
                <th>运费险</th>
                <th>利润</th>
				<th>利润明细=(成交订单金额总计-退款订单金额总计）-原料成本-（成交单数*包材单价）-（成交单数*技术服务费单价）</th>
            </tr>
        </thead>
        <tbody id="costBody"></tbody>
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
		
		// 提取重量
		function extraWeight(description) {
			  // 定义正则表达式，用于匹配数字、克或g以及可能的乘法
			  const weightRegex = /(\d+)(克|g)/g;
			  const multiplierRegex = /\*(\d+)/g;

			  // 查找所有匹配的重量
			  let weightMatches = description.match(weightRegex);
			  let multiplierMatches = description.match(multiplierRegex);

			  // 如果没有找到匹配项，返回0
			  if (!weightMatches) {
				return 0;
			  }

			  // 初始化总重量
			  let totalWeight = 0;

			  // 遍历所有匹配的重量
			  weightMatches.forEach((match, index) => {
				// 提取数字
				let weight = parseInt(match.match(/\d+/)[0], 10);

				// 如果存在乘数，并且是当前重量的乘数，则乘以乘数
				if (multiplierMatches && multiplierMatches[index]) {
				  let multiplier = parseInt(multiplierMatches[index].match(/\d+/)[0], 10);
				  weight *= multiplier;
				}

				// 将提取的重量加到总重量上
				totalWeight += weight;
			  });

			  // 返回总重量
			  return totalWeight;
		}

        function generateProductTable(data) {
            const productStats = {};
            const headers = data[0];

            const productNameIndex = headers.indexOf('商品名称');
			const productPropIndex = headers.indexOf('商品属性');
			const productPriceIndex = headers.indexOf('商品价格');
            const orderAmountIndex = headers.indexOf('订单实际支付金额');
            const refundedAmountIndex = headers.indexOf('商品已退款金额');
            const recipientNameIndex = headers.indexOf('收件人姓名');
            const recipientAddressIndex = headers.indexOf('收件人地址');
            const recipientPhoneIndex = headers.indexOf('收件人手机');

            let  totalSuccessPerson = 0;
            for (let i = 1; i < data.length; i++) {
                const row = data[i];
                const productName = row[productNameIndex];
                const productProp = row[productPropIndex];
				const productPrice = row[productPriceIndex];
                const orderAmount = parseFloat(row[orderAmountIndex]) || 0;
                const refundedAmount = parseFloat(row[refundedAmountIndex]) || 0;
                const recipientKey = `${row[recipientNameIndex]}_${row[recipientAddressIndex]}_${row[recipientPhoneIndex]}`;

                if (productName && productProp) {
                    if (!productStats[productName+productProp]) {
                        productStats[productName+productProp] = {
                            totalOrderAmount: 0,
                            totalOrders: 0,
                            totalRefundedAmount: 0,
                            totalRefundedOrders: 0,
							productName: productName,
							productProp: productProp,
							// 商品价格
							productPrice: productPrice,
                            uniqueCustomers: new Set()
                        };
                    }

                    if (orderAmount > 0) {
                        productStats[productName+productProp].totalOrderAmount += orderAmount;
                        productStats[productName+productProp].totalOrders += 1;
                        productStats[productName+productProp].uniqueCustomers.add(recipientKey);
                    }

                    if (refundedAmount > 0) {
                        productStats[productName+productProp].totalRefundedAmount += refundedAmount;
                        productStats[productName+productProp].totalRefundedOrders += 1;
                    }
                }
            }

            const dataBody = document.getElementById('dataBody');
            dataBody.innerHTML = '';

            for (const [productName, stats] of Object.entries(productStats)) {
                const tr = document.createElement('tr');

                const nameCell = document.createElement('td');
                nameCell.textContent = stats.productName;
                tr.appendChild(nameCell);

				const propCell = document.createElement('td');
                propCell.textContent = stats.productProp;
                tr.appendChild(propCell);
				
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
				
				// 更新总人数
				totalSuccessPerson += stats.uniqueCustomers.size;

                const priceCell = document.createElement('td');
                const inputPrice = document.createElement('input');
                inputPrice.type = 'number';
                inputPrice.placeholder = '客单价';
				inputPrice.value= stats.productPrice.toFixed(2);
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
				inputCustomWeight.value=extraWeight(stats.productProp);
				if(inputCustomWeight.value == 0) {
				   inputCustomWeight.style.color = 'red';
				}
                customWeightCell.appendChild(inputCustomWeight);
                tr.appendChild(customWeightCell);

                dataBody.appendChild(tr);
            }

            document.getElementById('configSuccessPersonCount').value = totalSuccessPerson;
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
                const productProp = cells[1].textContent;
                const totalOrderAmount = parseFloat(cells[2].textContent);
                const totalRefundedAmount = parseFloat(cells[4].textContent);
                const totalOrders = parseInt(cells[3].textContent);
                const totalRefundedOrders = parseInt(cells[5].textContent);
                const uniqueCustomersCount = parseInt(cells[6].textContent);
                const inputPrice = cells[7].querySelector('input');
                const inputWeight = cells[8].querySelector('input');
                const inputCustomWeight = cells[9].querySelector('input');

                const userPrice = parseFloat(inputPrice.value);
                const userKgPrice = parseFloat(inputWeight.value);
                const userCustomWeight = parseFloat(inputCustomWeight.value);

                if (!userPrice || userPrice <= 0 || !userKgPrice || userKgPrice <= 0 || !userCustomWeight || userCustomWeight <= 0) {
                    alert('请输入有效的价格和重量！');
                    return;
                }

                const packageCount = Math.ceil((totalOrderAmount - totalRefundedAmount) / userPrice);
                const gramPrice = userKgPrice / 1000;
                const technicalServiceFee = totalOrderAmount * 0.02;
                const shippingInsurance = (totalOrders - totalRefundedOrders) * 0.13;
                const rawMaterialCost = packageCount * gramPrice * userCustomWeight;
                const profit = (totalOrderAmount - totalRefundedAmount) - rawMaterialCost - technicalServiceFee - shippingInsurance;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${productName}</td>
					<td>${productProp}</td>
                    <td>${packageCount}</td>
                    <td>${gramPrice.toFixed(4)}</td>
                    <td>${technicalServiceFee.toFixed(2)}</td>
                    <td>${shippingInsurance.toFixed(2)}</td>
					<td>${profit.toFixed(2)}</td>
                    <td>(${totalOrderAmount.toFixed(2)} - ${totalRefundedAmount.toFixed(2)}) - ${rawMaterialCost.toFixed(2)} - (${technicalServiceFee.toFixed(2)}) - (${shippingInsurance.toFixed(2)})</td>
                `;
                costBody.appendChild(tr);
                totalProfit += profit;
            }

            let configSuccessPersonCount = document.getElementById('configSuccessPersonCount').value;
            let configKuaiduFeePerson = document.getElementById('configKuaiduFeePerson').value;
			let totalPureProfit = totalProfit - configSuccessPersonCount * configKuaiduFeePerson;
            document.getElementById('totalProfit').innerHTML = `总利润: ${totalPureProfit.toFixed(2)}=${totalProfit.toFixed(2)}-(${configSuccessPersonCount}*${configKuaiduFeePerson})`;
            document.getElementById('totalProfit').classList.remove('hidden');
            document.getElementById('costTable').classList.remove('hidden');
        });
    </script>
</body>
</html>
```

# 总结

TODO：

1. 默认的商品+属性

2. 默认的商品采购价格

# 参考资料

* any list
{:toc}