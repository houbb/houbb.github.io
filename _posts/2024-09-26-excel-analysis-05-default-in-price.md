---
layout: post
title: Excel 解析分析-05-默认进价优化
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

# 总结

TODO：

1. 默认的商品+属性

2. 默认的商品采购价格

# 参考资料

* any list
{:toc}