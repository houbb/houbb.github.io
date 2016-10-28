/**
 * !
 * Created by houbb, All rights reserved.
 * @type {Base|*|{}}
 */

$(document).ready(function() {
    Base.initContentHeight();
    if(!Util.isMobile()) {  //use scroll bar when is PC;
        //Base.initBodyScrollBar();
    }

    //toc
    Base.initTOC();

    //demo
    Base.select2Demo();
    Base.colResizable();
    //2048
    // $('#2048').my2048();

    //UML
    $("UML, uml").sequenceDiagram({theme: 'hand'});

    //
    Base.validateTest($('#validate-form'));

    Base.musicPlay();
    Base.scrollTop();

    //初始化表格
    $("table").addClass("table").addClass("table-bordered").addClass("table-hover");

    //初始化代码块
    Base.sh();

    //high charts
    Base.highchartsDemo();

});

var Base = new Base();
function Base(){
    /**
     * highcharts 使用
     */
    this.highchartsDemo = function() {
        $('#highchart-container').highcharts({                  //图表展示容器，与 div 的 id 保持一致
            chart: {
                type: 'bar'                           //指定图表的类型，默认是折线图（line）
            },
            title: {
                text: '我的第一个图表'                 //指定图表标题
            },
            xAxis: {
                categories: ['苹果', '香蕉', '橙子']   //指定x轴分组
            },
            yAxis: {
                title: {
                    text: 'something'                 //指定y轴的标题
                }
            },
            series: [{                                 //指定数据列
                name: '小明',                          //数据列名
                data: [1, 0, 4]                        //数据
            }, {
                name: '小红',
                data: [5, 7, 3]
            }]
        });
    };

    /**
     * 设置语法高亮
     */
    this.sh = function () {
        //默认样式
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
        SyntaxHighlighter.defaults["collapse"] = true;  //代码折叠
        // SyntaxHighlighter.defaults["html-script"] = true;  //HTML/XML标签着色,引入 shBrushXml.js -->会导致失去色彩
        SyntaxHighlighter.defaults["title"] = "[default]";


        var $codes = $("sh");
        $codes.each(function (i, e) {
            var $e = $(e);
            var className = $e.attr("class") || "default";
            SyntaxHighlighter.defaults["title"] = "["+className+"]";
            var styleClass = DEFAULT_STYLE[className];
            if(!!styleClass) {
                $e.addClass(styleClass);
            } else {
                $e.addClass("brush: xml;");
            }

            SyntaxHighlighter.defaults["collapse"] = true;  //代码折叠
            SyntaxHighlighter.highlight($e);
        });


        // 自动加载对应js
        // SyntaxHighlighter.autoloader(
        //     ['java','/static/libs/syntaxhighlighter_3.0.83/scripts/shBrushJava.js']
        // );
        // SyntaxHighlighter.all();
    };

    this.scrollTop = function () {
        var scrollTimeout;
        $(window).scroll(function() {
            clearTimeout(scrollTimeout);
            if ($(window).scrollTop() > 400) {
                scrollTimeout = setTimeout(function() {
                    $('#scroll-top:hidden').fadeIn()
                }, 100);
            } else {
                scrollTimeout = setTimeout(function() {
                    $('#scroll-top:visible').fadeOut()
                }, 100);
            }
        });

        
    };

    this.musicPlay = function () {
        $("#bg-music-btn").on('click', function () {
            var icon = $(this).find("i");
            var audio = document.getElementById("bg-music");; //背景音乐

            if(icon.hasClass("fa-play")) {
                icon.removeClass("fa-play").addClass("fa-pause");
                audio.play();
            } else if(icon.hasClass("fa-pause")) {
                icon.removeClass("fa-pause").addClass("fa-play");
                audio.pause();
            }
        });
    };

    /**
     * test form
     * @param $form
     */
    this.validateTest = function ($form) {
        $.validator.setDefaults( {
            submitHandler: function (form) {
                form.submit();
            }
        } );
        var max = 999;
        $form.validate({
            rules:{
                "gold-value": {
                    required: true,
                    digits: true,
                    min: 1,
                    max: max
                }
            },
            messages: {
                "gold-value": {
                    required: "金币值不可为空",
                    digits: "金币值必须为整数",
                    min: "金币值不可小于1",
                    max: "金币值余额不足"
                }
            },
            errorElement: "span",
            errorPlacement: function ( error, element ) {
                // Add the `help-block` class to the error element
                error.addClass( "validate-help");

                if ( element.prop( "type" ) === "checkbox" ) {
                    error.insertAfter( element.parent( "label" ) );
                } else {
                    error.insertAfter( element );
                }
            },
            highlight: function ( element, errorClass, validClass ) {
                $( element ).addClass( "has-error" ).removeClass( "has-success" );
            },
            unhighlight: function (element, errorClass, validClass) {
                $( element ).addClass( "has-success" ).removeClass( "has-error" );
            }
        });

    };
    /**
     * init the content height
     */
    this.initContentHeight = function() {
        var content = $('.page-content');
        var headHeight = $('.site-header').height();
        var wh = Util.windowHeight();
        content.css('min-height', wh-headHeight);
    };

    /**
     * init the style of toc
     */
    this.initTOC = function() {
        var CLASS = {
            left: 'fa-chevron-circle-left',
            right: 'fa-chevron-circle-right'
        };
        var toc = $('#markdown-toc');
        var lastLi = toc.children('li:last');
        var iconHTML = '<i class="fa fa-fw fa-lg"></i>';
        var $icon = $(iconHTML);
        $icon.addClass(CLASS.left).addClass('text-muted').addClass('pull-right');
        lastLi.after($icon);

        $('#markdown-toc .fa').on('click', function () {
            var icon = $(this);

            if(icon.hasClass(CLASS.left)) {
                toc.children('li').hide();
                icon.removeClass(CLASS.left).addClass(CLASS.right);
            } else {
                toc.children('li').show();
                icon.removeClass(CLASS.right).addClass(CLASS.left);
            }
        });
    };
    /**
     * init body scroll bar
     */
    this.initBodyScrollBar = function() {
        $("body").mCustomScrollbar({
            //autoHideScrollbar:true,
            theme:"light-thick"
        });
        $("#back-to-top").on('click', function() {
            Base.autoScrollOff();
            $("body").mCustomScrollbar("scrollTo", "top");
        });
        $('#auto-read-leaf').on('click', function() {
            Base.autoReadLeaf();
        });
    };
    /**
     * auto read;
     */
    var content=$("body"),autoScrollTimerAdjust,autoScroll;
    this.autoReadLeaf = function() {
        var speed = 20000;
        var autoScrollTimer = (Util.windowHeight() / $('#mCSB_1_dragger_vertical').height()) * speed;
        content.mCustomScrollbar({
            scrollButtons:{enable:true},
            callbacks:{
                whileScrolling:function(){
                    autoScrollTimerAdjust=autoScrollTimer*this.mcs.topPct/100;
                },
                onScroll:function(){
                    if($(this).data("mCS").trigger==="internal"){Base.autoScrollOff()}
                }
            }
        });
        content.addClass("auto-scrolling-on auto-scrolling-to-bottom");
        this.autoScrollOn("bottom",autoScrollTimer);
    };
    /**
     *
     * @param to
     * @param timer
     */
    this.autoScrollOn = function(to,timer) {
        content.addClass("auto-scrolling-on").mCustomScrollbar("scrollTo",to,{scrollInertia:timer,scrollEasing:"easeInOutSmooth"});
    };
    this.autoScrollOff = function() {
        clearTimeout(autoScroll);
        content.removeClass("auto-scrolling-on").mCustomScrollbar("stop");
    };



    /**
     * select2 init
     */
    this.select2Demo = function() {
        $("select#index").select2();
        $("select#multi-index").select2();
        $("select#multi-index1").select2({});
        $("select#multi-index1").val(["home", "about"]).trigger("change");
    };
    /**
     * colResizable init
     */
    this.colResizable = function() {
        $('#colResizable').colResizable({
            liveDrag:true,
            gripInnerHtml:"<div class='grip'></div>",
            draggingClass:"dragging",
            minWidth: 100
        });
    };
};