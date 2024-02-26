---
layout: post
title: Aapche POI java excel 操作工具包入门
date:  2016-7-18 12:26:11 +0800
categories: [Java]
tags: [java, tool, sf]
published: true
---



# POI

Apache POI - the Java API for Microsoft Documents

> [poi](http://poi.apache.org/)

> [quick-start](http://poi.apache.org/spreadsheet/quick-guide.html)


# Hello World

- jar

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

- get first sheet

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

- get excel content --> CSV

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

* any list
{:toc}
