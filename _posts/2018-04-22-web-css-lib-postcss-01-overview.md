---
layout: post
title:  PostCSS 未来的 CSS 
date:  2018-07-06 14:27:21 +0800
categories: [Web]
tags: [web, js, css]
published: true
---

# PostCSS

[PostCSS](https://postcss.org/) is a tool for transforming CSS with JavaScript.

# 特性演示

## 提升代码可读性

[Autoprefixer](https://github.com/postcss/autoprefixer) 将使用基于当前浏览器流行度和属性支持的数据为您应用前缀。

- input

```css
:fullscreen {
}
```

- output

```css
:-webkit-:full-screen {
}
:-moz-:full-screen {
}
:full-screen {
}
```

## 使用未来的 CSS 语法

[PostCSS Preset Env](https://preset-env.cssdb.org/) 允许您将现代CSS转换成大多数浏览器所能理解的内容，
根据目标浏览器或运行时环境，使用 [cssdb](https://cssdb.org/) 来确定您需要的多填充。

- input

```css
@custom-media --med (width <= 50rem);

@media (--med) {
  a { 
    &:hover {
      color: color-mod(black alpha(54%));
    }
  }
}
```

- output

```css
@media (max-width: 50rem) {
  a:hover  { 
    color: rgba(0, 0, 0, 0.54);
  }
} 
```

## 解决全局 css 定义问题

[CSS模块](https://github.com/css-modules/css-modules) 意味着你永远不需要担心你的名字太通用，只要使用最合理的就可以了。

- input

```css
.name {
  color: gray;
}
```

- output

```css
.Logo__name__SVK0g {
  color: gray;
}
```

## 避免 css 语法错误

使用时髦的 CSS linter [stylelint](https://stylelint.io/) 执行一致的约定并避免样式表中的错误。它支持最新的CSS语法，以及类似CSS的语法，如SCSS。

- input

```css
a { 
  color: #d3;
}
```

- output

console output

```
app.css
2:10 Invalid hex color
```

## 强大的列表系统

[LostGrid](https://github.com/peterramsing/lost) 使用calc()创建基于您定义的分数的令人惊叹的网格，而无需传递许多选项。

- input

```css
div {
  lost-column: 1/3 
}
```

- output

```css
div {
  width: calc(99.9% * 1/3 -  
  (30px - 30px * 1/3)); 
}
div:nth-child(1n) {
  float: left; 
  margin-right: 30px; 
  clear: none; 
}
div:last-child {
  margin-right: 0; 
}
div:nth-child(3n) {
  margin-right: 0; 
  float: right; 
}
div:nth-child(3n + 1) {
  clear: both; 
}
```
 
# chat

## 详细介绍一下 postcss

PostCSS是一个用JavaScript工具和插件生态系统来转换CSS代码的工具。它允许开发者使用明天的CSS特性在今天编写样式，同时提供强大的工具来优化和自动化CSS的编写。以下是PostCSS的一些详细介绍：

### 1. CSS Next

PostCSS的一个主要特性是它可以让你使用尚未成为正式标准的CSS语法来编写样式，例如使用CSS Variables、颜色函数、自定义属性等。PostCSS会自动将这些未来特性转换为广泛兼容的CSS代码。

### 2. 自动添加前缀

PostCSS可以自动为你的CSS属性和选择器添加浏览器引擎前缀，这样你就不需要手动添加或者查找这些前缀。这大大简化了跨浏览器兼容性的工作。

### 3. CSS Minification

PostCSS提供了压缩CSS的功能，它可以移除多余的空格、注释，甚至可以缩短颜色值和一些CSS属性，从而减少文件大小，加快页面加载速度。

### 4. 可定制和扩展

PostCSS是高度可定制的，你可以根据自己的需求选择合适的插件来扩展其功能。PostCSS社区提供了大量的插件，用于代码检查、格式化、优化等。

### 5. 易于集成

PostCSS可以很容易地集成到各种构建工具和工作流中，例如Gulp、Webpack和Grunt。

### 6. 与其他工具的兼容性

PostCSS可以与其他CSS工具如Sass、Less和Stylus一起使用，增强这些工具的编译过程。

### PostCSS的使用

要开始使用PostCSS，你需要先安装它以及你需要的插件。以下是一个基本的安装和配置步骤：

1. **安装PostCSS**：
   ```bash
   npm install postcss --save-dev
   ```

2. **安装插件**（以Autoprefixer为例）：
   ```bash
   npm install autoprefixer --save-dev
   ```

3. **在项目中使用**：
   创建一个`postcss.config.js`文件，并配置你的插件：
   ```javascript
   module.exports = {
     plugins: [
       require('autoprefixer')
     ]
   };
   ```

4. **构建过程**：
   你可以在构建脚本中添加PostCSS，例如在Gulp或Webpack中。

5. **处理CSS文件**：
   PostCSS将会读取你的CSS文件，应用插件，然后输出处理后的CSS。

### 示例：在Gulp中使用PostCSS

1. **安装Gulp和PostCSS**：
   ```bash
   npm install gulp gulp-postcss --save-dev
   ```

2. **创建Gulp任务**：
   ```javascript
   const gulp = require('gulp');
   const postcss = require('gulp-postcss');

   gulp.task('css', function () {
     return gulp.src('src/css/*.css')
       .pipe(postcss([
         require('autoprefixer')
       ]))
       .pipe(gulp.dest('dist/css'));
   });
   ```

3. **运行Gulp任务**：
   ```bash
   gulp css
   ```

通过这种方式，你可以在项目中使用PostCSS来自动化和优化CSS的编写和构建过程。

## 为什么需要 postcss，他解决了什么问题？

PostCSS解决了多个在CSS开发中常见的问题，并为开发者提供了一系列的好处：

1. **未来CSS特性的兼容性**：PostCSS可以使用明天的CSS语法来编写样式，并通过插件将它们转换为与当前浏览器兼容的代码。这意味着开发者可以立即使用CSS的新特性，而不必等待浏览器的全面支持。

2. **自动添加浏览器前缀**：PostCSS的Autoprefixer插件可以自动添加必要的浏览器引擎前缀，节省了手动添加前缀的时间，并确保了代码的兼容性。

3. **代码一致性和遵循最佳实践**：PostCSS的Stylelint插件可以帮助维护代码质量，通过一套规则来检查和修复代码风格问题。

4. **CSS Minification**：PostCSS可以压缩CSS文件，移除多余的空格和注释，缩短颜色值和CSS属性，从而减少文件大小，加快页面加载速度。

5. **可定制和扩展**：PostCSS允许开发者根据项目需求选择和组合不同的插件，构建定制化的CSS处理流程。

6. **提高开发效率**：通过自动化常见的CSS任务，如变量替换、混合（mixin）、函数使用等，PostCSS减少了重复劳动，提高了开发效率。

7. **更容易的CSS维护**：PostCSS通过模块化和组件化的方式，使得CSS代码更容易维护和管理，特别是在大型项目中。

8. **社区支持和插件生态**：PostCSS拥有一个活跃的社区和丰富的插件生态系统，开发者可以找到各种功能的插件来扩展PostCSS的能力。

9. **与现代开发工具的集成**：PostCSS可以轻松集成到现代的构建工具和流程中，如Gulp、Webpack等，无需额外的配置即可融入现有的开发环境。

10. **支持CSS的新语法**：PostCSS支持CSS的新语法，如CSS Variables、Custom Properties、CSS Grid等，允许开发者提前使用这些特性。

总的来说，PostCSS通过提供跨浏览器兼容性、自动化工具、代码优化和定制化功能，解决了CSS开发中的许多痛点，使得CSS的开发更加现代化、高效和可维护。

## 有哪些类似于 postcss 的库

类似于PostCSS的库主要是指那些可以扩展CSS功能、自动化CSS开发流程的工具或框架。以下是一些与PostCSS类似的库：

1. **Autoprefixer**：这是一个PostCSS插件，用于自动添加浏览器前缀，确保CSS属性的兼容性。

2. **CSS Modules**：这是一种CSS编写方式，它允许你为每个组件编写隔离的样式，避免命名冲突。

3. **Stylelint**：这是一个现代的CSS代码检查器，它使用与PostCSS相似的插件系统，用于避免错误并强制执行代码风格。

4. **Sass**：虽然Sass是一个CSS预处理器，但它与PostCSS有相似之处，因为它扩展了CSS的语法，允许使用变量、混合、函数等编程特性。

5. **Less**：与Sass类似，Less也是一个CSS预处理器，它同样提供了变量、嵌套规则、混合和继承等特性。

6. **Stylus**：Stylus是另一个CSS预处理器，以其灵活的语法和功能集而闻名，支持类似编程语言的特性。

7. **CSSNano**：这是一个PostCSS插件，用于优化CSS文件，包括删除不必要的代码、减少文件大小等。

8. **Rework**：Rework是一个低级的CSS处理库，它提供了类似于PostCSS的工具集，但专注于转换CSS的AST（抽象语法树）。

9. **PostCSS Preset Env**：这个库允许你使用最新的CSS特性，同时自动添加所需的浏览器前缀。

10. **Tachyons**：虽然Tachyons不是一个PostCSS插件，但它提供了一组实用程序类，用于快速构建设计，与PostCSS的模块化和自动化理念相符。

这些库和工具在功能上可能与PostCSS存在重叠，但它们各自有着独特的特点和优势，开发者可以根据项目需求和个人偏好选择合适的工具。




* any list
{:toc}