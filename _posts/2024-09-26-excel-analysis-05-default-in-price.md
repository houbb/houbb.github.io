---
layout: post
title: Excel 解析分析-05-默认进价优化+修正表格导出问题
date: 2024-09-26 21:01:55 +0800
categories: [Excel]
tags: [excel, data-analysis, sh]
published: true
---

# 新特性

添加商品的默认进价，如果没有匹配，则直接为0，且标志为红色。

```js
function getProductInPricePerKg(productName) {
            const productMap = new Map([
                ['玫瑰', 888],
            ]);
            
            // 遍历Map中的每个键值对
            for (let [key, value] of productMap) {
                // 检查商品全名是否包含商品简称
                if (productName.includes(key)) {
                    return value; // 如果包含，返回对应的价格
                }
            }
            return 0; // 如果没有找到匹配项，返回null
        }

```

这样可以获取内置的采购价格，方便计算。

暂时数据全部改为虚拟。


# 修正表格导出问题

## 问题描述

发现直接导出 table，如果表格存在 input，内容无法被正确导出。

## 修正

```js
    // 表格导出到 EXCEL
	function exportTableToExcel(tableId, tableName) {
		 // 获取表格元素
		  var table = document.getElementById(tableId);

          // 修正 input 无法导出的问题
                // 遍历表格的每一行
        for (var r = 0; r < table.rows.length; r++) {
            var row = table.rows[r];
            // 遍历每一行中的每一个单元格
            for (var c = 0; c < row.cells.length; c++) {
                var cell = row.cells[c];
                // 检查单元格中是否有input元素
                if (cell.getElementsByTagName('input').length > 0) {
                    // 如果有input元素，获取其值并设置为单元格的文本内容
                    cell.innerHTML = cell.getElementsByTagName('input')[0].value;
                }
            }
        }
		  
		  // 将表格转换为工作簿
		  var ws = XLSX.utils.table_to_sheet(table);
		  var wb = XLSX.utils.book_new();
		  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
		  
		  // 为文件名添加时间戳
		  var timestamp = new Date().toISOString().replace(/[:\.]/g, '-');
		  let filename = tableName+"_"+ timestamp + '.xlsx';
		  
		  // 使用JSZip生成Excel文件
		  XLSX.writeFile(wb, filename);
	}
```

# 总结

TODO：

1. 默认的商品+属性

2. 默认的商品采购价格

# 参考资料

* any list
{:toc}