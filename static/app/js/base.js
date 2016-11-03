$(document).ready(function () {
    Base.initContentHeight();
    Base.initTOC();
    $("UML, uml").sequenceDiagram({theme: "hand"});
    Base.musicPlay();
    Base.scrollTop();
    $("table").addClass("table").addClass("table-bordered").addClass("table-hover");
    Base.sh();
    Base.highchartsDemo()
});
var Base = new Base();
function Base() {
    this.highchartsDemo = function () {
        $("#highchart-container").highcharts({
            chart: {type: "bar"},
            title: {text: "我的第一个图表"},
            xAxis: {categories: ["苹果", "香蕉", "橙子"]},
            yAxis: {title: {text: "something"}},
            series: [{name: "小明", data: [1, 0, 4]}, {name: "小红", data: [5, 7, 3]}]
        })
    };
    this.sh = function () {
        var DEFAULT_STYLE = {
            "java": "brush: java;",
            "bash": "brush: bash;",
            "shell": "brush: shell;",
            "c": "brush: c;",
            "C": "brush: c;",
            "c++": "brush: cpp;",
            "C++": "brush: cpp;",
            "js": "brush: js;",
            "javascript": "brush: js;",
            "css": "brush: css;",
            "xml": "brush: xml;",
            "html": "brush: html;",
            "sql": "brush: sql;",
            "php": "brush: php;",
            "py": "brush: python;",
            "python": "brush: python;",
            "ruby": "brush: ruby;"
        };
        SyntaxHighlighter.config.bloggerMode = true;
        SyntaxHighlighter.config.tagName = "sh";
        SyntaxHighlighter.defaults["collapse"] = true;
        SyntaxHighlighter.defaults["title"] = "[default]";
        var $codes = $("sh");
        $codes.each(function (i, e) {
            var $e = $(e);
            var className = $e.attr("class") || "default";
            SyntaxHighlighter.defaults["title"] = "[" + className + "]";
            var styleClass = DEFAULT_STYLE[className];
            if (!!styleClass) {
                $e.addClass(styleClass)
            } else {
                $e.addClass("brush: xml;")
            }
            SyntaxHighlighter.defaults["collapse"] = true;
            SyntaxHighlighter.highlight($e)
        })
    };
    this.scrollTop = function () {
        var scrollTimeout;
        $(window).scroll(function () {
            clearTimeout(scrollTimeout);
            if ($(window).scrollTop() > 400) {
                scrollTimeout = setTimeout(function () {
                    $("#scroll-top:hidden").fadeIn()
                }, 100)
            } else {
                scrollTimeout = setTimeout(function () {
                    $("#scroll-top:visible").fadeOut()
                }, 100)
            }
        })
    };
    this.musicPlay = function () {
        $("#bg-music-btn").on("click", function () {
            var icon = $(this).find("i");
            var audio = document.getElementById("bg-music");
            if (icon.hasClass("fa-play")) {
                icon.removeClass("fa-play").addClass("fa-pause");
                audio.play()
            } else {
                if (icon.hasClass("fa-pause")) {
                    icon.removeClass("fa-pause").addClass("fa-play");
                    audio.pause()
                }
            }
        })
    };
    this.initContentHeight = function () {
        var content = $(".page-content");
        var headHeight = $(".site-header").height();
        var wh = Util.windowHeight();
        content.css("min-height", wh - headHeight)
    };
    this.initTOC = function () {
        var CLASS = {left: "fa-chevron-circle-left", right: "fa-chevron-circle-right"};
        var toc = $("#markdown-toc");
        var lastLi = toc.children("li:last");
        var iconHTML = '<i class="fa fa-fw fa-lg"></i>';
        var $icon = $(iconHTML);
        $icon.addClass(CLASS.left).addClass("text-muted").addClass("pull-right");
        lastLi.after($icon);
        $("#markdown-toc .fa").on("click", function () {
            var icon = $(this);
            if (icon.hasClass(CLASS.left)) {
                toc.children("li").hide();
                icon.removeClass(CLASS.left).addClass(CLASS.right)
            } else {
                toc.children("li").show();
                icon.removeClass(CLASS.right).addClass(CLASS.left)
            }
        })
    }
};