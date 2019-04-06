---
layout: post
title:  Command Tool
date:  2018-08-18 14:52:41 +0800
categories: [Tool]
tags: [command, tool, sh]
published: true
---

# taskbook

## 简介

[taskbook](https://github.com/klauscfhq/taskbook/blob/master/docs/readme.ZH.md)

通过使用 简单且最小化 的使用语法,平坦的学习曲线,使您可以在终端内 跨多个板块,有效地管理任务和笔记. 

所有数据都以原子方式写入存储,以防止损坏,并且永远不会与任何第三方实体共享. 已删除的项目会自动存档,并且可以随时完成或恢复.

## 使用

- 安装

```
npm install --global taskbook
```

## 想法

1. 使用 git 进行数据的保存和备份，十分优秀。

2. 任何工具都可以再创造。比如 todo 其实有很多成熟的工具，但是仍然有空间，不是吗？

# termgraph

[termgraph](https://github.com/mkaz/termgraph) python 命令行工具。

## 安装

```sh
pip3 install termgraph
```

## 使用

ps: 测试报错

## 想法

python 和 js 用来写工具，都非常之方便。

# termtosvg

[termtosvg](https://github.com/nbedos/termtosvg) 可以将 terminal 动画转化为 svg。

## 作用

有时候我们想演示命令行的动画，要么截图，要么黏贴文字。

这都不够优雅，这种可以让动态过程直观的展现，非常之棒。

## 使用 

- 安装

```
pip3 install  termtosvg
```

- 实际使用

存储文件如下：

[2018-08-18-termtosvg.svg](https://raw.githubusercontent.com/houbb/resource/master/img/tools/command/2018-08-18-termtosvg.svg)

- 动态效果

<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="terminal" baseProfile="full" viewBox="0 0 1448 954" width="1448" version="1.1">
    <defs>
        <termtosvg:template_settings xmlns:termtosvg="https://github.com/nbedos/termtosvg">
            <termtosvg:screen_geometry columns="181" rows="56"/>
        </termtosvg:template_settings>
        <style type="text/css" id="generated-style"><![CDATA[:root {
            --animation-duration: 13675ms;
        }
        
        #screen {
                font-family: 'DejaVu Sans Mono', monospace;
                font-style: normal;
                font-size: 14px;
            }

        text {
            dominant-baseline: text-before-edge;
        }]]></style>
        <style type="text/css" id="user-style">
            /* gjm8 color theme (source: https://terminal.sexy/) */
            .foreground {fill: #c5c5c5;}
            .background {fill: #1c1c1c;}
            .color0 {fill: #1c1c1c;}
            .color1 {fill: #ff005b;}
            .color2 {fill: #cee318;}
            .color3 {fill: #ffe755;}
            .color4 {fill: #048ac7;}
            .color5 {fill: #833c9f;}
            .color6 {fill: #0ac1cd;}
            .color7 {fill: #e5e5e5;}
            .color8 {fill: #1c1c1c;}
            .color9 {fill: #ff005b;}
            .color10 {fill: #cee318;}
            .color11 {fill: #ffe755;}
            .color12 {fill: #048ac7;}
            .color13 {fill: #833c9f;}
            .color14 {fill: #0ac1cd;}
            .color15 {fill: #e5e5e5;}
        </style>
    </defs>
    <svg id="screen" width="1448" viewBox="0 0 1448 952" preserveAspectRatio="xMidYMin meet">
        <defs><g id="g1"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="80" x="0">bash-3.2$&#160;</text><text class="background" lengthAdjust="spacingAndGlyphs" textLength="8" x="80">&#160;</text></g><g id="g2"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="88" x="0">bash-3.2$&#160;p</text><text class="background" lengthAdjust="spacingAndGlyphs" textLength="8" x="88">&#160;</text></g><g id="g3"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="96" x="0">bash-3.2$&#160;py</text><text class="background" lengthAdjust="spacingAndGlyphs" textLength="8" x="96">&#160;</text></g><g id="g4"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="104" x="0">bash-3.2$&#160;pyt</text><text class="background" lengthAdjust="spacingAndGlyphs" textLength="8" x="104">&#160;</text></g><g id="g5"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="112" x="0">bash-3.2$&#160;pyth</text><text class="background" lengthAdjust="spacingAndGlyphs" textLength="8" x="112">&#160;</text></g><g id="g6"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="120" x="0">bash-3.2$&#160;pytho</text><text class="background" lengthAdjust="spacingAndGlyphs" textLength="8" x="120">&#160;</text></g><g id="g7"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="128" x="0">bash-3.2$&#160;python</text><text class="background" lengthAdjust="spacingAndGlyphs" textLength="8" x="128">&#160;</text></g><g id="g8"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="136" x="0">bash-3.2$&#160;python3</text><text class="background" lengthAdjust="spacingAndGlyphs" textLength="8" x="136">&#160;</text></g><g id="g9"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="144" x="0">bash-3.2$&#160;python3&#160;</text><text class="background" lengthAdjust="spacingAndGlyphs" textLength="8" x="144">&#160;</text></g><g id="g10"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="152" x="0">bash-3.2$&#160;python3&#160;-</text><text class="background" lengthAdjust="spacingAndGlyphs" textLength="8" x="152">&#160;</text></g><g id="g11"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="160" x="0">bash-3.2$&#160;python3&#160;--</text><text class="background" lengthAdjust="spacingAndGlyphs" textLength="8" x="160">&#160;</text></g><g id="g12"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="168" x="0">bash-3.2$&#160;python3&#160;--v</text><text class="background" lengthAdjust="spacingAndGlyphs" textLength="8" x="168">&#160;</text></g><g id="g13"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="176" x="0">bash-3.2$&#160;python3&#160;--ve</text><text class="background" lengthAdjust="spacingAndGlyphs" textLength="8" x="176">&#160;</text></g><g id="g14"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="184" x="0">bash-3.2$&#160;python3&#160;--ver</text><text class="background" lengthAdjust="spacingAndGlyphs" textLength="8" x="184">&#160;</text></g><g id="g15"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="192" x="0">bash-3.2$&#160;python3&#160;--vers</text><text class="background" lengthAdjust="spacingAndGlyphs" textLength="8" x="192">&#160;</text></g><g id="g16"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="200" x="0">bash-3.2$&#160;python3&#160;--versi</text><text class="background" lengthAdjust="spacingAndGlyphs" textLength="8" x="200">&#160;</text></g><g id="g17"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="208" x="0">bash-3.2$&#160;python3&#160;--versio</text><text class="background" lengthAdjust="spacingAndGlyphs" textLength="8" x="208">&#160;</text></g><g id="g18"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="216" x="0">bash-3.2$&#160;python3&#160;--version</text><text class="background" lengthAdjust="spacingAndGlyphs" textLength="8" x="216">&#160;</text></g><g id="g19"><text class="background" lengthAdjust="spacingAndGlyphs" textLength="8" x="0">&#160;</text></g><g id="g20"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="88" x="0">bash-3.2$&#160;e</text><text class="background" lengthAdjust="spacingAndGlyphs" textLength="8" x="88">&#160;</text></g><g id="g21"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="96" x="0">bash-3.2$&#160;ex</text><text class="background" lengthAdjust="spacingAndGlyphs" textLength="8" x="96">&#160;</text></g><g id="g22"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="104" x="0">bash-3.2$&#160;exi</text><text class="background" lengthAdjust="spacingAndGlyphs" textLength="8" x="104">&#160;</text></g><g id="g23"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="112" x="0">bash-3.2$&#160;exit</text><text class="background" lengthAdjust="spacingAndGlyphs" textLength="8" x="112">&#160;</text></g><g id="g24"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="1080" x="0">bash:&#160;export:&#160;`Workbooks.app/Contents/SharedSupport/path-bin:::/Users/houbinbin/it/tools/gradle/gradle-3.3/bin':&#160;not&#160;a&#160;valid&#160;identifier</text></g><g id="g25"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="216" x="0">bash-3.2$&#160;python3&#160;--version</text></g><g id="g26"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="96" x="0">Python&#160;3.7.0</text></g><g id="g27"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="112" x="0">bash-3.2$&#160;exit</text></g><g id="g28"><text class="foreground" lengthAdjust="spacingAndGlyphs" textLength="32" x="0">exit</text></g></defs><rect class="background" height="100%" width="100%" x="0" y="0"/><g display="none"><rect class="foreground" height="17" width="8" x="80" y="17"/><use y="17" xlink:href="#g1"/><animate attributeName="display" begin="0ms; anim_last.end" dur="3155ms" from="inline" to="inline"/></g><g display="none"><rect class="foreground" height="17" width="8" x="88" y="17"/><use y="17" xlink:href="#g2"/><animate attributeName="display" begin="3155ms; anim_last.end+3155ms" dur="304ms" from="inline" to="inline"/></g><g display="none"><rect class="foreground" height="17" width="8" x="96" y="17"/><use y="17" xlink:href="#g3"/><animate attributeName="display" begin="3459ms; anim_last.end+3459ms" dur="272ms" from="inline" to="inline"/></g><g display="none"><rect class="foreground" height="17" width="8" x="104" y="17"/><use y="17" xlink:href="#g4"/><animate attributeName="display" begin="3731ms; anim_last.end+3731ms" dur="80ms" from="inline" to="inline"/></g><g display="none"><rect class="foreground" height="17" width="8" x="112" y="17"/><use y="17" xlink:href="#g5"/><animate attributeName="display" begin="3811ms; anim_last.end+3811ms" dur="73ms" from="inline" to="inline"/></g><g display="none"><rect class="foreground" height="17" width="8" x="120" y="17"/><use y="17" xlink:href="#g6"/><animate attributeName="display" begin="3884ms; anim_last.end+3884ms" dur="167ms" from="inline" to="inline"/></g><g display="none"><rect class="foreground" height="17" width="8" x="128" y="17"/><use y="17" xlink:href="#g7"/><animate attributeName="display" begin="4051ms; anim_last.end+4051ms" dur="48ms" from="inline" to="inline"/></g><g display="none"><rect class="foreground" height="17" width="8" x="136" y="17"/><use y="17" xlink:href="#g8"/><animate attributeName="display" begin="4099ms; anim_last.end+4099ms" dur="600ms" from="inline" to="inline"/></g><g display="none"><rect class="foreground" height="17" width="8" x="144" y="17"/><use y="17" xlink:href="#g9"/><animate attributeName="display" begin="4699ms; anim_last.end+4699ms" dur="160ms" from="inline" to="inline"/></g><g display="none"><rect class="foreground" height="17" width="8" x="152" y="17"/><use y="17" xlink:href="#g10"/><animate attributeName="display" begin="4859ms; anim_last.end+4859ms" dur="240ms" from="inline" to="inline"/></g><g display="none"><rect class="foreground" height="17" width="8" x="160" y="17"/><use y="17" xlink:href="#g11"/><animate attributeName="display" begin="5099ms; anim_last.end+5099ms" dur="160ms" from="inline" to="inline"/></g><g display="none"><rect class="foreground" height="17" width="8" x="168" y="17"/><use y="17" xlink:href="#g12"/><animate attributeName="display" begin="5259ms; anim_last.end+5259ms" dur="128ms" from="inline" to="inline"/></g><g display="none"><rect class="foreground" height="17" width="8" x="176" y="17"/><use y="17" xlink:href="#g13"/><animate attributeName="display" begin="5387ms; anim_last.end+5387ms" dur="152ms" from="inline" to="inline"/></g><g display="none"><rect class="foreground" height="17" width="8" x="184" y="17"/><use y="17" xlink:href="#g14"/><animate attributeName="display" begin="5539ms; anim_last.end+5539ms" dur="200ms" from="inline" to="inline"/></g><g display="none"><rect class="foreground" height="17" width="8" x="192" y="17"/><use y="17" xlink:href="#g15"/><animate attributeName="display" begin="5739ms; anim_last.end+5739ms" dur="88ms" from="inline" to="inline"/></g><g display="none"><rect class="foreground" height="17" width="8" x="200" y="17"/><use y="17" xlink:href="#g16"/><animate attributeName="display" begin="5827ms; anim_last.end+5827ms" dur="160ms" from="inline" to="inline"/></g><g display="none"><rect class="foreground" height="17" width="8" x="208" y="17"/><use y="17" xlink:href="#g17"/><animate attributeName="display" begin="5987ms; anim_last.end+5987ms" dur="104ms" from="inline" to="inline"/></g><g display="none"><rect class="foreground" height="17" width="8" x="216" y="17"/><use y="17" xlink:href="#g18"/><animate attributeName="display" begin="6091ms; anim_last.end+6091ms" dur="542ms" from="inline" to="inline"/></g><g display="none"><rect class="foreground" height="17" width="8" x="0" y="34"/><use y="34" xlink:href="#g19"/><animate attributeName="display" begin="6633ms; anim_last.end+6633ms" dur="9ms" from="inline" to="inline"/></g><g display="none"><rect class="foreground" height="17" width="8" x="80" y="51"/><use y="51" xlink:href="#g1"/><animate attributeName="display" begin="6642ms; anim_last.end+6642ms" dur="5147ms" from="inline" to="inline"/></g><g display="none"><rect class="foreground" height="17" width="8" x="88" y="51"/><use y="51" xlink:href="#g20"/><animate attributeName="display" begin="11789ms; anim_last.end+11789ms" dur="159ms" from="inline" to="inline"/></g><g display="none"><rect class="foreground" height="17" width="8" x="96" y="51"/><use y="51" xlink:href="#g21"/><animate attributeName="display" begin="11948ms; anim_last.end+11948ms" dur="129ms" from="inline" to="inline"/></g><g display="none"><rect class="foreground" height="17" width="8" x="104" y="51"/><use y="51" xlink:href="#g22"/><animate attributeName="display" begin="12077ms; anim_last.end+12077ms" dur="112ms" from="inline" to="inline"/></g><g display="none"><rect class="foreground" height="17" width="8" x="112" y="51"/><use y="51" xlink:href="#g23"/><animate attributeName="display" begin="12189ms; anim_last.end+12189ms" dur="486ms" from="inline" to="inline"/></g><g display="none"><use y="0" xlink:href="#g24"/><animate attributeName="display" begin="0ms; anim_last.end" dur="13675ms" from="inline" to="inline"/></g><g display="none"><use y="17" xlink:href="#g25"/><animate attributeName="display" begin="6633ms; anim_last.end+6633ms" dur="7042ms" from="inline" to="inline"/></g><g display="none"><use y="34" xlink:href="#g26"/><animate attributeName="display" begin="6642ms; anim_last.end+6642ms" dur="7033ms" from="inline" to="inline"/></g><g display="none"><use y="51" xlink:href="#g27"/><use y="68" xlink:href="#g28"/><rect class="foreground" height="17" width="8" x="0" y="85"/><use y="85" xlink:href="#g19"/><animate attributeName="display" begin="12675ms; anim_last.end+12675ms" dur="1000ms" from="inline" to="inline" id="anim_last"/></g></svg>
</svg>



## 感想 

这个工具感觉就是对 terminal 进行了录屏，然后将图片转换为 SVG。

* any list
{:toc}
