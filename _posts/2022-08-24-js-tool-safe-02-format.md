---
layout: post
title:  UglifyJS 介绍 JS 格式化压缩/美化 
date:  2022-08-27 09:22:02 +0800
categories: [Tool]
tags: [tool, js, safe, sh]
published: true
---


# 压缩算法

## 简单实现

最简单的压缩实现：

```js
/**
 * 把所有注释删除
 * @param {string} _code - 要压缩的代码
 */
function removeAnnotation(_code) {
    let code = _code;
    // 把所有注释删除
    code = code.replace(/\/\/.*\n/g, '');
    return code;
}

/**
 * 将所有(换行符(\n)、制表符(\t)、一个以上空格( +))(\s)换成单个空格
 * @param {string} _code - 要压缩的代码
 */
function removeWhite(_code) {
    let code = _code;
    // 把所有换行符转换成空格
    code = code.replace(/\s+/g, ' ');

    return code;
}

/** 
 * 压缩的主函数 
 * @param {string} _code - 要压缩的代码
 */
function dry(_code) {
    let code = _code;
    code = removeAnnotation(code);
    code = removeWhite(code);

    return code;
}
```

# UglifyJS

UglifyJS 是一个 JavaScript 解析器、压缩器、压缩器和美化工具包。

## 笔记：

uglify-js 支持 JavaScript 和 ECMAScript 中的大多数语言功能。

对于 ECMAScript 更奇特的部分，在传递给 uglify-js 之前，使用像 Babel 这样的转译器处理你的源文件。

uglify-js@3 有一个简化的 API 和 CLI，它不向后兼容 uglify-js@2。

## 安装

首先确保您已安装最新版本的 node.js（此步骤后您可能需要重新启动计算机）。

从 NPM 用作命令行应用程序：

```
npm install uglify-js -g
```

如果只是程序使用：

```
npm install uglify-js
```

## Command line usage

```
uglifyjs [input files] [options]
```

UglifyJS 可以接受多个输入文件。 建议您先传递输入文件，然后传递选项。 

UglifyJS 将按顺序解析输入文件并应用任何压缩选项。 

这些文件在同一个全局范围内解析，也就是说，一个文件对另一个文件中声明的某个变量/函数的引用将被正确匹配。

如果没有指定输入文件，UglifyJS 将从 STDIN 读取。

如果您希望在输入文件之前传递您的选项，请用双破折号将两者分开，以防止输入文件被用作选项参数：

```
uglifyjs --compress --mangle -- input.js
```

### Command line options

```
 -h, --help                  Print usage information.
                                `--help options` for details on available options.
    -V, --version               Print version number.
    -p, --parse <options>       Specify parser options:
                                `acorn`  Use Acorn for parsing.
                                `bare_returns`  Allow return outside of functions.
                                                Useful when minifying CommonJS
                                                modules and Userscripts that may
                                                be anonymous function wrapped (IIFE)
                                                by the .user.js engine `caller`.
                                `spidermonkey`  Assume input files are SpiderMonkey
                                                AST format (as JSON).
    -c, --compress [options]    Enable compressor/specify compressor options:
                                `pure_funcs`  List of functions that can be safely
                                              removed when their return values are
                                              not used.
    -m, --mangle [options]      Mangle names/specify mangler options:
                                `reserved`  List of names that should not be mangled.
    --mangle-props [options]    Mangle properties/specify mangler options:
                                `builtins`  Mangle property names that overlaps
                                            with standard JavaScript globals.
                                `debug`  Add debug prefix and suffix.
                                `domprops`  Mangle property names that overlaps
                                            with DOM properties.
                                `keep_quoted`  Only mangle unquoted properties.
                                `regex`  Only mangle matched property names.
                                `reserved`  List of names that should not be mangled.
    -b, --beautify [options]    Beautify output/specify output options:
                                `beautify`  Enabled with `--beautify` by default.
                                `preamble`  Preamble to prepend to the output. You
                                            can use this to insert a comment, for
                                            example for licensing information.
                                            This will not be parsed, but the source
                                            map will adjust for its presence.
                                `quote_style`  Quote style:
                                               0 - auto
                                               1 - single
                                               2 - double
                                               3 - original
                                `wrap_iife`  Wrap IIFEs in parentheses. Note: you may
                                             want to disable `negate_iife` under
                                             compressor options.
    -O, --output-opts [options] Specify output options (`beautify` disabled by default).
    -o, --output <file>         Output file path (default STDOUT). Specify `ast` or
                                `spidermonkey` to write UglifyJS or SpiderMonkey AST
                                as JSON to STDOUT respectively.
    --annotations               Process and preserve comment annotations.
                                (`/*@__PURE__*/` or `/*#__PURE__*/`)
    --no-annotations            Ignore and discard comment annotations.
    --comments [filter]         Preserve copyright comments in the output. By
                                default this works like Google Closure, keeping
                                JSDoc-style comments that contain "@license" or
                                "@preserve". You can optionally pass one of the
                                following arguments to this flag:
                                - "all" to keep all comments
                                - a valid JS RegExp like `/foo/` or `/^!/` to
                                keep only matching comments.
                                Note that currently not *all* comments can be
                                kept when compression is on, because of dead
                                code removal or cascading statements into
                                sequences.
    --config-file <file>        Read `minify()` options from JSON file.
    -d, --define <expr>[=value] Global definitions.
    -e, --enclose [arg[:value]] Embed everything in a big function, with configurable
                                argument(s) & value(s).
    --expression                Parse a single expression, rather than a program
                                (for parsing JSON).
    --ie                        Support non-standard Internet Explorer.
                                Equivalent to setting `ie: true` in `minify()`
                                for `compress`, `mangle` and `output` options.
                                By default UglifyJS will not try to be IE-proof.
    --keep-fargs                Do not mangle/drop function arguments.
    --keep-fnames               Do not mangle/drop function names.  Useful for
                                code relying on Function.prototype.name.
    --module                    Process input as ES module (implies --toplevel)
    --name-cache <file>         File to hold mangled name mappings.
    --self                      Build UglifyJS as a library (implies --wrap UglifyJS)
    --source-map [options]      Enable source map/specify source map options:
                                `base`  Path to compute relative paths from input files.
                                `content`  Input source map, useful if you're compressing
                                           JS that was generated from some other original
                                           code. Specify "inline" if the source map is
                                           included within the sources.
                                `filename`  Filename and/or location of the output source
                                            (sets `file` attribute in source map).
                                `includeSources`  Pass this flag if you want to include
                                                  the content of source files in the
                                                  source map as sourcesContent property.
                                `names` Include symbol names in the source map.
                                `root`  Path to the original source to be included in
                                        the source map.
                                `url`  If specified, path to the source map to append in
                                       `//# sourceMappingURL`.
    --timings                   Display operations run time on STDERR.
    --toplevel                  Compress and/or mangle variables in top level scope.
    --v8                        Support non-standard Chrome & Node.js
                                Equivalent to setting `v8: true` in `minify()`
                                for `mangle` and `output` options.
                                By default UglifyJS will not try to be v8-proof.
    --verbose                   Print diagnostic messages.
    --warn                      Print warning messages.
    --webkit                    Support non-standard Safari/Webkit.
                                Equivalent to setting `webkit: true` in `minify()`
                                for `compress`, `mangle` and `output` options.
                                By default UglifyJS will not try to be Safari-proof.
    --wrap <name>               Embed everything in a big function, making the
                                “exports” and “global” variables available. You
                                need to pass an argument to this option to
                                specify the name that your module will take
                                when included in, say, a browser.
```

指定 `--output (-o)` 以声明输出文件。 否则输出到 STDOUT。


# 参考资料

[JS常见加密混淆方式](https://blog.csdn.net/ZiChen_Jiang/article/details/121636435)

https://www.cnblogs.com/JiangZiChen/p/15713727.html

https://www.cnblogs.com/strawberry-1/articles/12008628.html

https://baijiahao.baidu.com/s?id=1734798268807195127&wfr=spider&for=pc

[base64随机字符混淆加密、解密-美拍视频地址解密(兼容ie、中文)](https://www.cnblogs.com/xitianzhou/p/7495867.html)

* any list
{:toc}