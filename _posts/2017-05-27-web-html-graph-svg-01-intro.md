---
layout: post
title: SVG XML 格式定义图形
date:  2016-10-27 13:27:06 +0800
categories: [UI]
tags: [ui, html, xml, web, js]
published: true
---

# SVG

[SVG](https://www.w3.org/TR/SVG/) means Scalable Vector Graphics.

- SVG 使用 XML 格式定义图形
- SVG 图像在放大或改变尺寸的情况下其图形质量不会有所损失
- SVG 是万维网联盟的标准


# Hello World

- Use SVG in html

<sh class="xml">
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
        <circle cx="100" cy="50" r="40" fill="#0099FF"/>
    </svg>
</sh>

and you can see:

<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <circle cx="100" cy="50" r="40" fill="#0099FF"/>
</svg>

- Link to the SVG file
You can use ```<a>``` tag to link to the svg file, like this:

```xml
<a href="rect.svg">rect.svg</a>
```

[rect.svg]({{site.url}}/static/app/svg/2016-10-27-rect.svg)

# Shape

There some pre-shapes:

- 矩形 ```<rect>```
- 圆形 ```<circle>```
- 椭圆 ```<ellipse>```
- 线 ```<line>```
- 折线 ```<polyline>```
- 多边形 ```<polygon>```
- 路径 ```<path>```



> Rect

<sh class="xml">
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
        <rect x="50" y="20" rx="20" ry="20" width="150" height="150"
          style="fill:#0099FF;stroke:black;stroke-width:1;opacity:0.5"/>
    </svg>
</sh>

<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
    <rect x="50" y="20" rx="20" ry="20" width="150" height="150"
      style="fill:#0099FF;stroke:black;stroke-width:1;opacity:0.5"/>
</svg>

> Line

<sh class="xml">
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
        <line x1="20" y1="20" x2="140" y2="80" style="stroke:#A020F0;stroke-width:3;"/>
    </svg>
</sh>

<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
    <line x1="20" y1="20" x2="140" y2="80" style="stroke:#A020F0;stroke-width:3;"/>
</svg>

> Polygon

the [fill-rule](https://www.w3.org/TR/SVG/painting.html#FillProperties)

<sh class="xml">
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
      <polygon points="100,10 40,180 190,60 10,60 160,180"
      style="fill:#FAF0E6;stroke:gold;stroke-width:2;fill-rule:nonzero;" />
    </svg>
</sh>

<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <polygon points="100,10 40,180 190,60 10,60 160,180"
  style="fill:#FAF0E6;stroke:gold;stroke-width:2;fill-rule:nonzero;" />
</svg>

> Polyline

<sh class="xml">
<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <polyline points="0,40 40,40 40,80 80,80 80,120 120,120 120,140"
  style="fill:white;stroke:#DA70D6;stroke-width:2"/>
</svg>
</sh>

<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <polyline points="0,40 40,40 40,80 80,80 80,120 120,120 120,140"
  style="fill:white;stroke:#DA70D6;stroke-width:2"/>
</svg>


> Path

Some Commands

所有命令均允许小写字母。大写表示绝对定位，小写表示相对定位

```
M = moveto
L = lineto
H = horizontal lineto
V = vertical lineto
C = curveto
S = smooth curveto
Q = quadratic Bézier curve
T = smooth quadratic Bézier curveto
A = elliptical Arc
Z = closepath
```


<sh class="xml">
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
      <path d="M150 0 L75 160 L225 160 Z"/>
    </svg>
</sh>

<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <path d="M150 0 L75 160 L225 160 Z"/>
</svg>

# Text

[text zh_CN](http://www.w3cplus.com/svg/how-to-manipulate-svg-text.html)

- Common text

<sh class="xml">
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
      <text x="100" y="15" fill="#666666">Hello SVG</text>
    </svg>
</sh>

<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <text x="100" y="15" fill="#666666">Hello SVG</text>
</svg>

- [Rotate](http://www.tuicool.com/articles/VfyMfua)

```rotate(<rotate-angle> [<cx> <cy>])```

<sh class="xml">
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
      <text x="100" y="15" fill="#666666" rotate="46 10,10" >Hello SVG</text>
    </svg>
</sh>

<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <text x="100" y="15" fill="#666666" transform="rotate(46 20,40)">Hello SVG</text>
</svg>

- Text with path

<sh>
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1"
    xmlns:xlink="http://www.w3.org/1999/xlink">
       <defs>
        <path id="path1" d="M75,20 a1,1 0 0,0 100,0" />
      </defs>
      <text x="10" y="100" style="fill:grey;">
        <textPath xlink:href="#path1">I love SVG I love SVG</textPath>
      </text>
    </svg>
</sh>

<svg xmlns="http://www.w3.org/2000/svg" version="1.1"
xmlns:xlink="http://www.w3.org/1999/xlink">
   <defs>
    <path id="path1" d="M75,20 a1,1 0 0,0 100,0" />
  </defs>
  <text x="10" y="100" style="fill:grey;">
    <textPath xlink:href="#path1">I love SVG I love SVG</textPath>
  </text>
</svg>

- ```<tspan>```

元素可以安排任何分小组与```<tspan>```元素的数量

<sh>
<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <text x="10" y="20" style="fill:grey;">Several lines:
    <tspan x="10" y="45">First line</tspan>
    <tspan x="20" y="70">Second line</tspan>
  </text>
</svg>
</sh>

<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <text x="10" y="20" style="fill:grey;">Several lines:
    <tspan x="10" y="45">First line</tspan>
    <tspan x="20" y="70">Second line</tspan>
  </text>
</svg>

# Stroke

- ```Stroke``` 属性定义一条线，文本或元素轮廓颜色

```g```元素这样的将多个元素组织在一起的元素

<sh>
<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <g fill="none">
    <path stroke="red" d="M5 20 l215 0" />
    <path stroke="blue" d="M5 40 l215 0" />
    <path stroke="black" d="M5 60 l215 0" />
  </g>
</svg>
</sh>

<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <g fill="none">
    <path stroke="red" d="M5 20 l215 0" />
    <path stroke="blue" d="M5 40 l215 0" />
    <path stroke="black" d="M5 60 l215 0" />
  </g>
</svg>

- ```stroke-width``` 属性定义了一条线，文本或元素轮廓厚度

<sh>
<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <g fill="none" stroke="grey">
      <path stroke-width="2" d="M5 20 l215 0" />
      <path stroke-width="6" d="M5 40 l215 0" />
      <path stroke-width="3" d="M5 60 l215 0" />
  </g>
</svg>
</sh>

<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <g fill="none" stroke="grey">
    <path stroke-width="2" d="M5 20 l215 0" />
    <path stroke-width="6" d="M5 40 l215 0" />
    <path stroke-width="3" d="M5 60 l215 0" />
  </g>
</svg>

- ```stroke-linecap``` 属性定义不同类型的开放路径的终结

<sh>
<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <g fill="none" stroke="grey" stroke-width="4">
      <path stroke-linecap="round" d="M5 20 l215 0" />
      <path stroke-linecap="butt" d="M5 40 l215 0" />
      <path stroke-linecap="square" d="M5 60 l215 0" />
  </g>
</svg>
</sh>

<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <g fill="none" stroke="grey" stroke-width="7">
      <path stroke-linecap="round" d="M5 20 l215 0" />
      <path stroke-linecap="butt" d="M5 40 l215 0" />
      <path stroke-linecap="square" d="M5 60 l215 0" />
  </g>
</svg>


- ```stroke-dasharray``` 创建不同的虚线

<sh>
<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <g fill="none" stroke="grey" stroke-width="4">
    <path stroke-dasharray="5,5" d="M5 20 l215 0" />
    <path stroke-dasharray="10,10" d="M5 40 l215 0" />
    <path stroke-dasharray="20,10,5,5,5,10" d="M5 60 l215 0" />
  </g>
</svg>
</sh>

<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <g fill="none" stroke="grey" stroke-width="4">
    <path stroke-dasharray="5,5" d="M5 20 l215 0" />
    <path stroke-dasharray="10,10" d="M5 40 l215 0" />
    <path stroke-dasharray="20,10,5,5,5,10" d="M5 60 l215 0" />
  </g>
</svg>



* any list
{:toc}
