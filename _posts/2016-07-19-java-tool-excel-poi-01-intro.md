---
layout: post
title: Aapche POI java excel 操作工具包入门
date:  2016-7-19 12:26:11 +0800
categories: [Java]
tags: [java, tool, sf]
published: true
---

# excel 系列

[Excel Export 踩坑注意点+导出方案设计](https://houbb.github.io/2016/07/19/java-tool-excel-export-design-01-overview)

[基于 hutool 的 EXCEL 优化实现](https://houbb.github.io/2016/07/19/java-tool-excel-hutool-opt-01-intro)

[iexcel-excel 大文件读取和写入，解决 excel OOM 问题-01-入门介绍](https://houbb.github.io/2016/07/19/java-tool-excel-iexcel-01-intro)

[iexcel-excel 大文件读取和写入-02-Excel 引导类简介](https://houbb.github.io/2016/07/19/java-tool-excel-iexcel-02-excelbs)

[iexcel-excel 大文件读取和写入-03-@ExcelField 注解介绍](https://houbb.github.io/2016/07/19/java-tool-excel-iexcel-03-excelField)

[iexcel-excel 大文件读取和写入-04-order 指定列顺序](https://houbb.github.io/2016/07/19/java-tool-excel-iexcel-04-order)

[iexcel-excel 大文件读取和写入-05-file bytes 获取文件字节信息](https://houbb.github.io/2016/07/19/java-tool-excel-iexcel-05-file-bytes)

[Aapche POI java excel 操作工具包入门](https://houbb.github.io/2016/07/19/java-tool-excel-poi-01-intro)

# Hello World

## maven 导入

```xml
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi</artifactId>
    <verison>${poi.version}</verison>
</dependency>
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <verison>${poi-ooxml.version}</verison>
</dependency>
```

## 获取Excel第一个Sheet

实现如下：

```java
/**
* 获取Excel第一个Sheet
* @param file excel文件
* @param fileSuffix  excel类型 xls/xlsx
*/
public static Sheet getFirstSheet(File file, String fileSuffix) throws IOException {
    InputStream stream = new FileInputStream(file);
    Workbook wb = null;
    if (fileSuffix.equals("xls")) {
      wb = new HSSFWorkbook(stream);
    } else if (fileSuffix.equals("xlsx")) {
      wb = new XSSFWorkbook(stream);
    }
    return wb.getSheetAt(0);
}
```

- get cell value

```java
/**
* 根据列类型，获得对应的String类型
* @return 不存在/不支持的类型，则返回""
*/
public static String getCellValueStr(Cell cell, String dateFormatStr) {
    String cellValueStr = "";
    if (null != cell) {
      Object cellValue = null;
      switch (cell.getCellType()) {
        case Cell.CELL_TYPE_STRING:
          cellValueStr = cell.getRichStringCellValue().getString();
          break;
        case Cell.CELL_TYPE_NUMERIC:
          if (DateUtil.isCellDateFormatted(cell)) {
            cellValue= cell.getDateCellValue();
            SimpleDateFormat formatter = new SimpleDateFormat(dateFormatStr);
            cellValueStr = formatter.format(cellValue);
          } else {
            cellValue=cell.getNumericCellValue();
            cellValueStr = String.valueOf(cellValue);
          }
          break;
        case Cell.CELL_TYPE_BOOLEAN:
          cellValue = cell.getBooleanCellValue();
          cellValueStr = String.valueOf(cellValue);
          break;
        case Cell.CELL_TYPE_FORMULA:
          cellValue = cell.getCellFormula();
          cellValueStr = String.valueOf(cellValue);
          break;
        default:
          System.out.println("不支持的excel单元格类型");
      }
    }
    return cellValueStr;
}
```

## 获取 Excel 的内容

获取 Excel 的内容，并且处理为 CSV

```java
/**
* 获取Excel工作区的文件内容 - 字符串形式
* - 需要置换excel每列的数据（除了每行的结束）以外所有换行符 "\n"
* - 所有CEll都视为String类型
*/
public static String getSheetContent(Sheet sheet, String charset) throws UnsupportedEncodingException {
    StringBuffer stringBuffer = new StringBuffer();
    String dateTimeFormatStr = "yyyy-MM-dd HH:mm:ss";
    String lineSeparator = System.getProperty("line.separator", "\n");  //换行符

    for(Row row : sheet) {
      for(Cell cell : row) {
        cell.setCellType(Cell.CELL_TYPE_STRING);  //全部以String类型读取
        String cellStr = new String(getCellValueStr(cell, dateTimeFormatStr).getBytes(), charset);
        String trimCellStr = cellStr.replaceAll(lineSeparator, StringUtils.EMPTY);
        stringBuffer.append(trimCellStr).append(",");
      }

      //此行有内容
      if(row.getFirstCellNum() != CommonConstant.INVALID_NUMBER) {
        stringBuffer.deleteCharAt(stringBuffer.lastIndexOf(","));  //最后一个“,”
        stringBuffer.append(lineSeparator);
      }
    }

    return stringBuffer.toString();
}
```

# 参考资料

> [poi](http://poi.apache.org/)

> [quick-start](http://poi.apache.org/spreadsheet/quick-guide.html)

* any list
{:toc}
